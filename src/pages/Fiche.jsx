import { useState } from 'react'
import { BESOINS, labelOf } from '../lib/constants'
import { deleteEntretien } from '../lib/api'
import { CHAMPS_POSTE, COMPETENCES, ENTETE, FILIERES_ESTLC, RUBRIQUES } from '../lib/questionnaire'
import { ligneMetier, niveau, texte, vide } from '../lib/reponses'
import { BadgeInteret } from './Entretiens'
import FicheImprimable from '../components/FicheImprimable'

// Une réponse (question + valeur), seulement si elle est renseignée
function Ligne({ q, r }) {
  if (q.titre) return null
  if (q.type === 'grille') {
    const v = r[q.id] || {}
    const l = COMPETENCES.map((c, i) => (v[i] ? [c, niveau(v[i])] : null)).filter(Boolean)
    if (v.autre) l.push(['Autre', v.autre])
    if (!l.length) return null
    return (
      <>
        <dt>{q.n}. Importance des compétences</dt>
        <dd><ul className="liste-rep">{l.map(([c, n]) => <li key={c}>{c} : <b>{n}</b></li>)}</ul></dd>
      </>
    )
  }
  if (q.type === 'metiers') {
    const l = (r[q.id] || []).filter((m) => m?.metier)
    if (!l.length) return null
    return (
      <>
        <dt>{q.n}. Principaux métiers ou fonctions recherchés</dt>
        <dd><ol className="liste-rep">{l.map((m, i) => <li key={i}>{ligneMetier(m)}</li>)}</ol></dd>
      </>
    )
  }
  if (q.type === 'filieres') {
    const v = r[q.id] || {}
    const l = FILIERES_ESTLC.filter((f) => v[f.code]?.rep)
    if (!l.length) return null
    return (
      <>
        <dt>{q.n}. Filières de l’ESTLC correspondant aux besoins</dt>
        <dd><ul className="liste-rep">{l.map((f) => <li key={f.code}>{f.nom} : <b>{v[f.code].rep}</b>{v[f.code].metiers ? ` — ${v[f.code].metiers}` : ''}</li>)}</ul></dd>
      </>
    )
  }
  if (q.type === 'postes') return null
  const t = texte(q, r)
  if (!t) return null
  return (
    <>
      <dt>{q.n ? `${q.n}. ` : ''}{q.label}</dt>
      <dd style={{ whiteSpace: 'pre-wrap' }}>{t}</dd>
    </>
  )
}

function Postes({ postes }) {
  if (!postes?.length) return <p className="muted petit">Aucun poste recensé.</p>
  return postes.map((p, i) => (
    <div className="sous-carte" key={i}>
      <b>Poste {i + 1}{p.p29 ? ` — ${p.p29}` : ''}</b>
      <dl>{CHAMPS_POSTE.filter((c) => c.id !== 'p29').map((c) => <Ligne key={c.id} q={c} r={p} />)}</dl>
    </div>
  ))
}

function FicheOfficielle({ e }) {
  const r = e.reponses
  return (
    <>
      <section className="carte fiche officielle">
        <b>{ENTETE.titre}</b>
        <dl>
          <dt>Enquêteur</dt><dd>{e.enqueteur_nom} · Niveau 4{r.filiere_enqueteur ? ` · ${r.filiere_enqueteur}` : ''}</dd>
          {ENTETE.questions.filter((q) => q.id !== 'filiere_enqueteur').map((q) => <Ligne key={q.id} q={q} r={r} />)}
        </dl>
      </section>
      {RUBRIQUES.map((rub) => {
        const remplies = rub.questions.filter((q) => q.id && !vide(r[q.id]))
        if (rub.id !== 'III' && !remplies.length) return null
        return (
          <section className="carte fiche officielle" key={rub.id}>
            <b>Rubrique {rub.id} — {rub.titre}</b>
            {rub.id === 'III' ? <Postes postes={r.postes} /> : <dl>{rub.questions.map((q, i) => <Ligne key={q.id || i} q={q} r={r} />)}</dl>}
          </section>
        )
      })}
    </>
  )
}

function FicheAncienne({ e, tel }) {
  return (
    <>
      <div className="bandeau attente">Fiche remplie avec l’ancien formulaire (avant la fiche officielle). Utilisez « Compléter la fiche » pour ajouter les rubriques manquantes.</div>
      <section className="carte fiche">
        <b>Entreprise</b>
        <dl>
          <dt>Secteur</dt><dd>{e.secteur}</dd>
          <dt>Localisation</dt><dd>{[e.quartier, e.ville].filter(Boolean).join(', ') || '—'}</dd>
          <dt>Personne rencontrée</dt><dd>{[e.contact_nom, e.contact_poste].filter(Boolean).join(' — ') || '—'}</dd>
          <dt>Téléphone</dt><dd>{tel || '—'}</dd>
          <dt>Besoin en stagiaires</dt><dd>{labelOf(BESOINS, e.besoin_stagiaires)}{(e.filieres || []).length ? ` — ${e.filieres.join(', ')}` : ''}{e.nombre_stagiaires ? ` (${e.nombre_stagiaires})` : ''}</dd>
          <dt>Services</dt><dd>{(e.services_proposes || []).join(' ; ') || '—'}</dd>
          {e.notes && <><dt>Notes</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{e.notes}</dd></>}
        </dl>
      </section>
    </>
  )
}

export default function Fiche({ entretien: e, user, onRetour, onChange, onModifier, notifier }) {
  const [busy, setBusy] = useState(false)
  // seul l'auteur peut modifier (la base le vérifie aussi grâce aux règles RLS)
  const auteur = e.enqueteur_id === user.id || e.responsable_id === user.id
  const modifiable = auteur && !e._attente

  async function supprimer() {
    if (!window.confirm(`Supprimer la fiche de « ${e.entreprise_nom} » ?`)) return
    setBusy(true)
    try {
      await deleteEntretien(e.id)
      notifier('Fiche supprimée')
      await onChange()
    } catch (err) {
      notifier(err.message)
      setBusy(false)
    }
  }

  // Numéro au format international : les anciens numéros sans indicatif sont considérés comme camerounais
  const brut = (e.contact_tel || '').trim()
  const tel = brut ? (brut.startsWith('+') ? '+' + brut.replace(/\D/g, '') : '+237' + brut.replace(/\D/g, '')) : ''

  return (
    <>
      <header className="topbar">
        <button className="retour" onClick={onRetour} aria-label="Retour">‹</button>
        <h1>{e.entreprise_nom}<span className="sous">{e.secteur}</span></h1>
      </header>
      <main className="contenu fiche-page" style={{ paddingBottom: 40 }}>
        <div className="imprimer-seul"><FicheImprimable e={e} /></div>
        <div className="ecran-seul">
        {e._attente && <div className="bandeau attente">Cette fiche attend le réseau pour être envoyée.</div>}
        {e.responsable_id && <div className="bandeau ok">Fiche remplie par le responsable de la structure lui-même, à partir du lien de {e.enqueteur_nom}.</div>}

        <div className="ligne-flex ecran-seul" style={{ gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <BadgeInteret e={e} />
          {tel && <a className="btn petit secondaire" href={`tel:${tel}`}>Appeler</a>}
          {tel && <a className="btn petit secondaire" href={`https://wa.me/${tel.slice(1)}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          <button className="btn petit secondaire" onClick={() => window.print()}>Télécharger la fiche (PDF)</button>
        </div>

        {e.reponses ? <FicheOfficielle e={e} /> : <FicheAncienne e={e} tel={tel} />}

        <p className="muted petit ecran-seul">
          {e.responsable_id ? 'Envoyée' : 'Enregistrée'} pour {e.enqueteur_nom}{e.created_at ? ` le ${new Date(e.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}` : ''}
        </p>

        {modifiable && (
          <div className="ecran-seul">
            <button className="btn" onClick={() => onModifier(e)} disabled={busy}>{e.reponses ? 'Modifier / compléter la fiche' : 'Compléter la fiche officielle'}</button>
            <button className="btn danger" style={{ marginTop: 10 }} onClick={supprimer} disabled={busy}>Supprimer cette fiche</button>
          </div>
        )}
        </div>
      </main>
    </>
  )
}
