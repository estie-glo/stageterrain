import { useState } from 'react'
import { CHAMPS_POSTE, COMPETENCES, FILIERES_ESTLC, NIVEAUX_COMPETENCE } from '../lib/questionnaire'
import { PAYS } from '../lib/constants'
import { IcCheck } from './Icones'

// Affiche une question de la fiche officielle en mode saisie.
// r = réponses, maj(id, valeur) = mise à jour d'une réponse.
export default function Champ({ q, r, maj }) {
  if (q.titre) return <h3 className="sous-rubrique">{q.titre}</h3>
  const id = 'f-' + q.id
  const v = r[q.id]
  const etiquette = (
    <>
      {q.n ? <span className="num">{q.n}.</span> : null} {q.label}
      {q.requis && <span className="requis"> *</span>}
    </>
  )

  switch (q.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <div className="champ">
          <label htmlFor={id}>{etiquette}</label>
          <input
            id={id}
            type={q.type === 'number' ? 'number' : q.type}
            inputMode={q.type === 'number' ? 'numeric' : q.type === 'email' ? 'email' : undefined}
            min={q.type === 'number' ? 0 : undefined}
            value={v ?? ''}
            placeholder={q.ph}
            onChange={(e) => maj(q.id, e.target.value)}
          />
        </div>
      )
    case 'textarea':
      return (
        <div className="champ">
          <label htmlFor={id}>{etiquette}</label>
          <textarea id={id} value={v ?? ''} onChange={(e) => maj(q.id, e.target.value)} />
        </div>
      )
    case 'tel': {
      const ind = r[q.id + '_ind'] || '+237'
      const pays = PAYS.find((p) => p.code === ind) || PAYS[0]
      return (
        <div className="champ">
          <label htmlFor={id}>{etiquette}</label>
          <div className="tel-groupe">
            <select aria-label="Indicatif du pays" value={ind} onChange={(e) => maj(q.id + '_ind', e.target.value)}>
              {PAYS.map((p) => <option key={p.code} value={p.code}>{p.drapeau} {p.code}</option>)}
            </select>
            <input id={id} type="tel" inputMode="numeric" value={v ?? ''} placeholder={pays.exemple} onChange={(e) => maj(q.id, e.target.value.replace(/[^\d ]/g, ''))} />
          </div>
          <div className="aide">{pays.drapeau} {pays.nom} · {pays.chiffres} chiffres, sans l'indicatif</div>
        </div>
      )
    }
    case 'choice':
      return <Choix q={q} r={r} maj={maj} etiquette={etiquette} />
    case 'multi':
      return <Multi q={q} r={r} maj={maj} etiquette={etiquette} />
    case 'certif':
      return (
        <button type="button" className={'suggestion' + (v ? ' on' : '')} onClick={() => maj(q.id, !v)}>
          <span className="coche">{v && <IcCheck />}</span>{q.label}
        </button>
      )
    case 'grille':
      return <Grille q={q} v={v || {}} maj={maj} etiquette={etiquette} />
    case 'metiers':
      return <Metiers q={q} v={v || []} maj={maj} etiquette={etiquette} />
    case 'filieres':
      return <Filieres q={q} v={v || {}} maj={maj} etiquette={etiquette} />
    case 'postes':
      return <Postes v={v || []} maj={(l) => maj('postes', l)} />
    default:
      return null
  }
}

function Autre({ q, r, maj }) {
  return (
    <input
      type="text"
      className="autre"
      aria-label="Préciser"
      placeholder="Préciser…"
      value={r[q.id + '_autre'] ?? ''}
      onChange={(e) => maj(q.id + '_autre', e.target.value)}
    />
  )
}

function Choix({ q, r, maj, etiquette }) {
  const v = r[q.id]
  const options = q.autre ? [...q.options, 'Autre'] : q.options
  if (q.liste) {
    return (
      <div className="champ">
        <label htmlFor={'f-' + q.id}>{etiquette}</label>
        <select id={'f-' + q.id} value={v ?? ''} onChange={(e) => maj(q.id, e.target.value)}>
          <option value="">Choisir…</option>
          {options.map((o) => <option key={o} value={o}>{o === 'Autre' ? 'Autre…' : o}</option>)}
        </select>
        {v === 'Autre' && <Autre q={q} r={r} maj={maj} />}
      </div>
    )
  }
  const court = options.length <= 3 && options.every((o) => o.length <= 16)
  return (
    <div className="champ">
      <span className="label">{etiquette}</span>
      {court ? (
        <div className="segment">
          {options.map((o) => (
            <button key={o} type="button" className={v === o ? 'on' : ''} onClick={() => maj(q.id, v === o ? '' : o)}>{o}</button>
          ))}
        </div>
      ) : (
        options.map((o) => (
          <button key={o} type="button" className={'suggestion radio' + (v === o ? ' on' : '')} onClick={() => maj(q.id, v === o ? '' : o)}>
            <span className="coche">{v === o && <i />}</span>{o === 'Autre' ? 'Autre' : o}
          </button>
        ))
      )}
      {v === 'Autre' && <Autre q={q} r={r} maj={maj} />}
    </div>
  )
}

function Multi({ q, r, maj, etiquette }) {
  const v = r[q.id] || []
  const options = q.autre ? [...q.options, 'Autre'] : q.options
  const basculer = (o) => maj(q.id, v.includes(o) ? v.filter((x) => x !== o) : [...v, o])
  return (
    <div className="champ">
      <span className="label">{etiquette} <span className="muted petit">(plusieurs choix possibles)</span></span>
      {options.map((o) => (
        <button key={o} type="button" className={'suggestion' + (v.includes(o) ? ' on' : '')} onClick={() => basculer(o)}>
          <span className="coche">{v.includes(o) && <IcCheck />}</span>{o}
        </button>
      ))}
      {v.includes('Autre') && <Autre q={q} r={r} maj={maj} />}
    </div>
  )
}

function Grille({ q, v, maj, etiquette }) {
  return (
    <div className="champ">
      <span className="label">{etiquette}</span>
      {COMPETENCES.map((c, i) => (
        <div className="grille-ligne" key={c}>
          <div className="grille-nom">{c}</div>
          <div className="segment mini">
            {NIVEAUX_COMPETENCE.map((n) => (
              <button key={n.v} type="button" title={n.titre} className={v[i] === n.v ? 'on' : ''} onClick={() => maj(q.id, { ...v, [i]: v[i] === n.v ? '' : n.v })}>{n.label}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="champ" style={{ marginTop: 10 }}>
        <label htmlFor="f-q67_autre">Autre compétence (préciser et noter)</label>
        <input id="f-q67_autre" type="text" value={v.autre ?? ''} onChange={(e) => maj(q.id, { ...v, autre: e.target.value })} placeholder="Ex. Gestion de flotte : 4" />
      </div>
    </div>
  )
}

function Metiers({ q, v, maj, etiquette }) {
  const lignes = [0, 1, 2, 3, 4].map((i) => v[i] || {})
  const set = (i, k, val) => {
    const l = lignes.map((x) => ({ ...x }))
    l[i][k] = val
    maj(q.id, l)
  }
  return (
    <div className="champ">
      <span className="label">{etiquette}</span>
      {lignes.map((m, i) => (
        <div className="sous-carte" key={i}>
          <input type="text" aria-label={`Métier ${i + 1}`} placeholder={`Métier ou fonction ${i + 1}`} value={m.metier ?? ''} onChange={(e) => set(i, 'metier', e.target.value)} />
          {m.metier && (
            <>
              <div className="ligne-flex" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className={'puce' + (m.actuel ? ' on' : '')} onClick={() => set(i, 'actuel', !m.actuel)}>Besoin actuel</button>
                <button type="button" className={'puce' + (m.prev ? ' on' : '')} onClick={() => set(i, 'prev', !m.prev)}>Besoin prévisionnel</button>
              </div>
              <input type="text" style={{ marginTop: 8 }} aria-label={`Niveau de qualification du métier ${i + 1}`} placeholder="Niveau de qualification (ex. BTS, Licence, Ingénieur)" value={m.niveau ?? ''} onChange={(e) => set(i, 'niveau', e.target.value)} />
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function Filieres({ q, v, maj, etiquette }) {
  const set = (code, k, val) => maj(q.id, { ...v, [code]: { ...(v[code] || {}), [k]: val } })
  return (
    <div className="champ">
      <span className="label">{etiquette}</span>
      {FILIERES_ESTLC.map((f) => {
        const x = v[f.code] || {}
        return (
          <div className="sous-carte" key={f.code}>
            <div className="petit" style={{ fontWeight: 600, marginBottom: 6 }}>{f.nom}</div>
            <div className="segment mini">
              {['Oui', 'Potentiellement', 'Non'].map((o) => (
                <button key={o} type="button" className={x.rep === o ? 'on' : ''} onClick={() => set(f.code, 'rep', x.rep === o ? '' : o)}>{o === 'Potentiellement' ? 'Potentiel.' : o}</button>
              ))}
            </div>
            {x.rep && x.rep !== 'Non' && (
              <input type="text" style={{ marginTop: 8 }} placeholder="Métiers ou fonctions concernés" value={x.metiers ?? ''} onChange={(e) => set(f.code, 'metiers', e.target.value)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Postes({ v, maj }) {
  const [ouvert, setOuvert] = useState(v.length ? v.length - 1 : -1)
  const ajouter = () => {
    maj([...v, { p30: '1' }])
    setOuvert(v.length)
  }
  const setPoste = (i, k, val) => maj(v.map((p, j) => (j === i ? { ...p, [k]: val } : p)))
  const retirer = (i) => {
    if (!window.confirm('Supprimer ce poste de la fiche ?')) return
    maj(v.filter((_, j) => j !== i))
    setOuvert(-1)
  }
  return (
    <>
      {v.length === 0 && <p className="muted petit">Aucun poste enregistré. Si la structure n'a aucun poste ouvert ni prévu, passez à la rubrique suivante.</p>}
      {v.map((p, i) => (
        <div className="carte poste" key={i}>
          <button type="button" className="poste-titre" onClick={() => setOuvert(ouvert === i ? -1 : i)}>
            <b>Poste {i + 1}</b> {p.p29 ? `· ${p.p29}` : ''}{p.p30 ? ` (${p.p30})` : ''}
            <span className="espace" />{ouvert === i ? '▲' : '▼'}
          </button>
          {ouvert === i && (
            <div style={{ marginTop: 10 }}>
              {CHAMPS_POSTE.filter((c) => !c.si || c.si(p)).map((c) => (
                <Champ key={c.id} q={c} r={p} maj={(k, val) => setPoste(i, k, val)} />
              ))}
              <button type="button" className="btn danger petit" onClick={() => retirer(i)}>Supprimer ce poste</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn secondaire" onClick={ajouter}>+ Ajouter un poste</button>
    </>
  )
}
