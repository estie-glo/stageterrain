import { NOTE_ENQUETEUR, RUBRIQUES } from '../lib/questionnaire'

// Aide-mémoire de l'enquêteur pour la fiche officielle de l'école de terrain.
export default function Idees() {
  return (
    <>
      <header className="topbar">
        <h1>Guide de l'enquêteur<span className="sous">École de terrain ESTLC · 19–25 octobre 2026</span></h1>
      </header>
      <main className="contenu">
        <section className="carte petit">
          <b>Avant l'entretien</b>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
            <li>Présentez-vous : étudiant(e) ingénieur de l'ESTLC Ambam, école de terrain sur le marché de l'emploi.</li>
            <li>Expliquez l'objectif pédagogique et demandez l'accord de votre interlocuteur.</li>
            <li>Adressez-vous à une personne informée : RH, dirigeant, responsable opérationnel.</li>
            <li>Distinguez bien les postes ouverts, les recrutements en cours et les besoins prévisionnels.</li>
            <li>Pas le temps ? Envoyez votre lien ou faites scanner votre QR code : le responsable remplit la fiche lui-même.</li>
            <li>Après l'entretien, remplissez la rubrique X (synthèse) et faites signer la fiche imprimée si demandé.</li>
          </ul>
        </section>
        <details className="carte petit note">
          <summary>Note officielle à l'attention de l'enquêteur</summary>
          <p style={{ marginBottom: 0, lineHeight: 1.5 }}>{NOTE_ENQUETEUR}</p>
        </details>
        <section className="carte petit">
          <b>Les 11 rubriques de la fiche</b>
          <ol type="I" style={{ margin: '8px 0 0', paddingLeft: 22, lineHeight: 1.6 }}>
            {RUBRIQUES.map((r) => <li key={r.id}>{r.titre}</li>)}
          </ol>
        </section>
      </main>
    </>
  )
}
