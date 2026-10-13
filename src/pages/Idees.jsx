import { useState } from 'react'
import { SECTEURS, suggestionsFor } from '../lib/constants'

// Aide-mémoire à consulter avant d'entrer dans une entreprise.
export default function Idees() {
  const [ouvert, setOuvert] = useState(SECTEURS[1])
  return (
    <>
      <header className="topbar">
        <h1>Idées de propositions<span className="sous">Que proposer selon le secteur ?</span></h1>
      </header>
      <main className="contenu">
        <div className="carte petit">
          <b>Conseils pour l'entretien</b>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
            <li>Présentez-vous : étudiant(e) de l'ESTLC Ambam, école de terrain.</li>
            <li>Demandez d'abord comment l'activité fonctionne au quotidien.</li>
            <li>Proposez un service lié à un problème qu'ils ont cité.</li>
            <li>Notez un numéro pour le suivi, avec leur accord.</li>
          </ul>
        </div>
        {SECTEURS.filter((s) => s !== 'Autre').map((s) => (
          <section className="carte" key={s} style={{ padding: 0, overflow: 'hidden' }}>
            <button className="item" style={{ boxShadow: 'none', margin: 0, borderRadius: 0 }} onClick={() => setOuvert(ouvert === s ? '' : s)} aria-expanded={ouvert === s}>
              <span className="avatar">{s.charAt(0)}</span>
              <span className="espace nom">{s}</span>
              <span className="muted">{ouvert === s ? '−' : '+'}</span>
            </button>
            {ouvert === s && (
              <ul style={{ margin: 0, padding: '0 16px 14px 34px', lineHeight: 1.6, fontSize: 14.5 }}>
                {suggestionsFor(s).map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
          </section>
        ))}
      </main>
    </>
  )
}
