import { useState } from 'react'
import { OBJECTIF } from '../lib/constants'
import { FILIERES_ESTLC } from '../lib/questionnaire'
import { nbPostes } from '../lib/reponses'
import { isDemo } from '../lib/api'
import { exporterExcel } from '../lib/export'
import { IcTelecharger } from '../components/Icones'
import LienInvitation from '../components/LienInvitation'

function compter(liste) {
  const m = new Map()
  for (const k of liste) if (k) m.set(k, (m.get(k) || 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function Anneau({ valeur, max }) {
  const r = 38
  const c = 2 * Math.PI * r
  const p = Math.min(valeur / max, 1)
  return (
    <svg className="anneau" viewBox="0 0 88 88" aria-hidden="true">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="9" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e8963a" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 44 44)" />
      <text x="44" y="49" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700">{Math.round(p * 100)}%</text>
    </svg>
  )
}

function Barres({ items, total, ocre }) {
  if (!items.length) return <p className="muted petit">Pas encore de données.</p>
  const max = items[0][1]
  return items.map(([nom, n]) => (
    <div className="barre-ligne" key={nom}>
      <div className="ligne-flex"><span>{nom}</span><span className="espace" /><b>{n}</b>{total ? <span className="muted"> · {Math.round((n / total) * 100)}%</span> : null}</div>
      <div className={'barre' + (ocre ? ' ocre' : '')}><i style={{ width: `${(n / max) * 100}%` }} /></div>
    </div>
  ))
}

export default function Tableau({ donnees, user, onNouveau, notifier }) {
  const [export_, setExport] = useState(false)
  // Chaque étudiant a son propre objectif de 100 entreprises : par défaut on affiche « Moi »
  const [vue, setVue] = useState(() => {
    try { return localStorage.getItem('st_vue') || 'moi' } catch { return 'moi' }
  })
  const choisirVue = (v) => {
    setVue(v)
    try { localStorage.setItem('st_vue', v) } catch { /* ignore */ }
  }

  const miens = donnees.filter((d) => d.enqueteur_id === user.id)
  const base = vue === 'moi' ? miens : donnees
  const total = base.length
  const postes = base.reduce((s, d) => s + nbPostes(d.reponses), 0)
  const recrutent = base.filter((d) => (d.reponses?.q25 || '').startsWith('Oui')).length
  const stagiaires = base.filter((d) => d.besoin_stagiaires === 'oui').length
  // métiers cités : intitulés des postes (rubrique III) et 5 principaux métiers (question 57)
  const metiers = compter(base.flatMap((d) => [
    ...(d.reponses?.postes || []).map((p) => p.p29),
    ...(d.reponses?.q57 || []).map((m) => m?.metier),
  ]).filter(Boolean).map((m) => m.trim().charAt(0).toUpperCase() + m.trim().slice(1).toLowerCase())).slice(0, 10)

  const secteurs = compter(base.map((d) => d.secteur))
  const codes = FILIERES_ESTLC.map((f) => f.code)
  const filieres = compter(base.filter((d) => d.reponses).flatMap((d) => d.filieres || []))
    .sort((a, b) => b[1] - a[1] || codes.indexOf(a[0]) - codes.indexOf(b[0]))
  const enqueteurs = compter(donnees.map((d) => d.enqueteur_nom))
  const atteints = enqueteurs.filter(([, n]) => n >= OBJECTIF).length

  async function exporter() {
    setExport(true)
    try {
      await exporterExcel(base)
    } catch (e) {
      console.error(e)
      notifier("L'export a échoué")
    } finally {
      setExport(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <h1>Bonjour {user.nom.split(' ')[0]}<span className="sous">École de terrain 19–25 oct. · objectif {OBJECTIF} structures</span></h1>
      </header>
      <main className="contenu">
        {isDemo && <div className="bandeau demo">Mode démo : les données restent sur ce téléphone.</div>}

        <div className="segment" style={{ marginBottom: 14 }}>
          <button className={vue === 'moi' ? 'on' : ''} onClick={() => choisirVue('moi')}>Mes entreprises</button>
          <button className={vue === 'classe' ? 'on' : ''} onClick={() => choisirVue('classe')}>Toute la classe</button>
        </div>

        {vue === 'moi' ? (
          <section className="hero">
            <Anneau valeur={total} max={OBJECTIF} />
            <div>
              <div className="gros">{total}<small> / {OBJECTIF}</small></div>
              <p>structures enquêtées par vous{total >= OBJECTIF ? ' · objectif atteint 🎉' : ` · encore ${OBJECTIF - total}`}</p>
            </div>
          </section>
        ) : (
          <section className="hero">
            <div>
              <div className="gros">{total}</div>
              <p>structures enquêtées par {enqueteurs.length} enquêteur(s) · {atteints} ont atteint {OBJECTIF}</p>
            </div>
          </section>
        )}

        {vue === 'moi' && <LienInvitation user={user} notifier={notifier} />}

        <div className="stats">
          <div className="stat"><b>{postes}</b><span>postes à pourvoir recensés</span></div>
          <div className="stat"><b>{recrutent}</b><span>prévoient de recruter</span></div>
          <div className="stat"><b>{stagiaires}</b><span>accueillent des stagiaires</span></div>
        </div>

        {total === 0 ? (
          <div className="carte centre">
            <p className="muted" style={{ marginTop: 0 }}>{vue === 'moi' ? "Vous n'avez encore enquêté aucune structure." : "Aucune fiche pour l'instant."}</p>
            <button className="btn ocre" onClick={onNouveau}>Remplir la première fiche</button>
          </div>
        ) : (
          <>
            <section className="carte">
              <h2>Métiers les plus recherchés</h2>
              <Barres items={metiers} />
            </section>
            <section className="carte">
              <h2>Filières ESTLC correspondant aux besoins</h2>
              <Barres items={filieres} />
            </section>
            <section className="carte">
              <h2>Structures par secteur</h2>
              <Barres items={secteurs} total={total} ocre />
            </section>
            {vue === 'classe' && (
              <section className="carte">
                <h2>Avancement des enquêteurs</h2>
                <ol className="classement">
                  {enqueteurs.map(([nom, n], i) => (
                    <li key={nom}><span className="rang">{i + 1}</span><span className="espace">{nom}</span><b>{n}</b><span className="muted petit"> / {OBJECTIF}</span></li>
                  ))}
                </ol>
              </section>
            )}
            <button className="btn secondaire" onClick={exporter} disabled={export_}>
              <IcTelecharger /> {export_ ? 'Préparation…' : vue === 'moi' ? 'Exporter mes fiches (Excel)' : 'Exporter toute la classe (Excel)'}
            </button>
          </>
        )}
      </main>
    </>
  )
}
