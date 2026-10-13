import { useState } from 'react'
import { FILIERES, OBJECTIF } from '../lib/constants'
import { isDemo } from '../lib/api'
import { exporterExcel } from '../lib/export'
import { IcTelecharger } from '../components/Icones'

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
  const total = donnees.length
  const besoinOui = donnees.filter((d) => d.besoin_stagiaires === 'oui').length
  const interesses = donnees.filter((d) => d.interet === 'interesse').length
  const places = donnees.filter((d) => d.besoin_stagiaires === 'oui').reduce((s, d) => s + (Number(d.nombre_stagiaires) || 0), 0)
  const mesEntretiens = donnees.filter((d) => d.enqueteur_id === user.id).length

  const secteurs = compter(donnees.map((d) => d.secteur))
  const filieres = compter(donnees.filter((d) => d.besoin_stagiaires !== 'non').flatMap((d) => d.filieres || []))
    .sort((a, b) => b[1] - a[1] || FILIERES.indexOf(a[0]) - FILIERES.indexOf(b[0]))
  const enqueteurs = compter(donnees.map((d) => d.enqueteur_nom)).slice(0, 10)

  async function exporter() {
    setExport(true)
    try {
      await exporterExcel(donnees)
    } catch {
      notifier("L'export a échoué")
    } finally {
      setExport(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <h1>Bonjour {user.nom.split(' ')[0]}<span className="sous">École de terrain · objectif {OBJECTIF} entreprises</span></h1>
      </header>
      <main className="contenu">
        {isDemo && <div className="bandeau demo">Mode démo : les données restent sur ce téléphone.</div>}

        <section className="hero">
          <Anneau valeur={total} max={OBJECTIF} />
          <div>
            <div className="gros">{total}<small> / {OBJECTIF}</small></div>
            <p>entreprises interrogées · dont {mesEntretiens} par vous</p>
          </div>
        </section>

        <div className="stats">
          <div className="stat"><b>{besoinOui}</b><span>veulent des stagiaires</span></div>
          <div className="stat"><b>{places}</b><span>places annoncées</span></div>
          <div className="stat"><b>{interesses}</b><span>intéressées par nos services</span></div>
        </div>

        {total === 0 ? (
          <div className="carte centre">
            <p className="muted" style={{ marginTop: 0 }}>Aucun entretien pour l'instant.</p>
            <button className="btn ocre" onClick={onNouveau}>Faire le premier entretien</button>
          </div>
        ) : (
          <>
            <section className="carte">
              <h2>Filières les plus demandées</h2>
              <Barres items={filieres} />
            </section>
            <section className="carte">
              <h2>Entreprises par secteur</h2>
              <Barres items={secteurs} total={total} ocre />
            </section>
            <section className="carte">
              <h2>Classement des enquêteurs</h2>
              <ol className="classement">
                {enqueteurs.map(([nom, n], i) => (
                  <li key={nom}><span className="rang">{i + 1}</span><span className="espace">{nom}</span><b>{n}</b></li>
                ))}
              </ol>
            </section>
            <button className="btn secondaire" onClick={exporter} disabled={export_}>
              <IcTelecharger /> {export_ ? 'Préparation…' : 'Exporter en Excel'}
            </button>
          </>
        )}
      </main>
    </>
  )
}
