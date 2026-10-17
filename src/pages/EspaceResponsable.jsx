import { useState } from 'react'
import { BESOINS, labelOf } from '../lib/constants'
import { signOut } from '../lib/api'
import Nouveau from './Nouveau'

// Espace du responsable d'entreprise : il remplit UNE fiche pour son entreprise,
// puis peut la consulter et la modifier. Il ne voit jamais les fiches des autres.
export default function EspaceResponsable({ user, fiche, onChange, notifier }) {
  const [edition, setEdition] = useState(false)

  if (!fiche || edition) {
    return (
      <Nouveau
        mode="responsable"
        user={user}
        existants={[]}
        initial={edition ? fiche : null}
        onTermine={async (statut) => {
          setEdition(false)
          await onChange()
          notifier(statut === 'queued' ? 'Pas de réseau : votre fiche sera envoyée plus tard' : 'Merci, votre fiche est enregistrée ✓')
        }}
        onAnnuler={() => (edition ? setEdition(false) : signOut().then(() => window.location.reload()))}
      />
    )
  }

  return (
    <>
      <header className="topbar">
        <h1>Merci {user.nom.split(' ')[0]} !<span className="sous">Votre fiche a bien été envoyée</span></h1>
      </header>
      <main className="contenu" style={{ paddingBottom: 40 }}>
        <div className="bandeau ok">
          Votre fiche a été transmise à <b>{user.ref_nom || "l'étudiant"}</b>, étudiant(e) à l'ESTLC Ambam, qui pourra vous recontacter.
        </div>
        <section className="carte fiche">
          <b>{fiche.entreprise_nom}</b>
          <dl>
            <dt>Secteur</dt><dd>{fiche.secteur}</dd>
            <dt>Localisation</dt><dd>{[fiche.quartier, fiche.ville].filter(Boolean).join(', ') || '—'}</dd>
            <dt>Téléphone</dt><dd>{fiche.contact_tel || '—'}</dd>
            <dt>Besoin en stagiaires</dt>
            <dd>
              {labelOf(BESOINS, fiche.besoin_stagiaires)}
              {(fiche.filieres || []).length > 0 && fiche.besoin_stagiaires !== 'non' ? ` — ${fiche.filieres.join(', ')}` : ''}
              {fiche.nombre_stagiaires ? ` (${fiche.nombre_stagiaires})` : ''}
            </dd>
            <dt>Services qui vous intéressent</dt><dd>{(fiche.services_proposes || []).join(' ; ') || 'Aucun'}</dd>
          </dl>
        </section>
        <button className="btn" onClick={() => setEdition(true)}>Modifier ma fiche</button>
        <p className="muted petit centre" style={{ marginTop: 18 }}>
          <button className="lien" onClick={() => signOut().then(() => window.location.reload())}>Se déconnecter</button>
        </p>
      </main>
    </>
  )
}
