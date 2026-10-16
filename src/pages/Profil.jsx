import { useState } from 'react'
import { isDemo, signOut } from '../lib/api'
import { IcSync } from '../components/Icones'

export default function Profil({ user, attente, enLigne, onSync, donnees }) {
  const [sync, setSync] = useState(false)
  const miens = donnees.filter((d) => d.enqueteur_id === user.id).length

  async function synchroniser() {
    setSync(true)
    await onSync()
    setSync(false)
  }

  return (
    <>
      <header className="topbar"><h1>Profil</h1></header>
      <main className="contenu">
        <section className="carte ligne-flex">
          <span className="avatar">{user.nom.charAt(0).toUpperCase()}</span>
          <div className="espace">
            <b>{user.nom}</b>
            <div className="muted petit">{isDemo ? 'Compte démo (local)' : user.email}</div>
          </div>
          <div className="centre"><b style={{ fontSize: 22 }}>{miens}</b><div className="muted petit">entretiens</div></div>
        </section>

        <section className="carte">
          <h2>Connexion et envoi</h2>
          <p className="petit" style={{ marginTop: 0 }}>
            Réseau : <b style={{ color: enLigne ? 'var(--vert)' : 'var(--rouge)' }}>{enLigne ? 'connecté' : 'hors ligne'}</b><br />
            En attente d'envoi : <b>{attente}</b> entretien(s)
          </p>
          <button className="btn secondaire" onClick={synchroniser} disabled={sync || isDemo}>
            <IcSync /> {sync ? 'Synchronisation…' : 'Synchroniser maintenant'}
          </button>
        </section>

        <section className="carte petit">
          <h2>Installer l'application</h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            <b>Android (Chrome)</b> : menu ⋮ → « Ajouter à l'écran d'accueil ».<br />
            <b>iPhone (Safari)</b> : bouton Partager → « Sur l'écran d'accueil ».
          </p>
        </section>

        <button
          className="btn danger"
          onClick={() => {
            if (attente > 0 && !window.confirm(`Attention : ${attente} entretien(s) ne sont pas encore envoyés. Si vous vous déconnectez, ils risquent d'être perdus. Se déconnecter quand même ?`)) return
            signOut().then(() => window.location.reload())
          }}
        >
          Se déconnecter
        </button>
        <p className="muted petit centre">StageTerrain · École de terrain ESTLC Ambam</p>
      </main>
    </>
  )
}
