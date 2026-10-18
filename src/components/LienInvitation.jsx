import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { lienInvitation } from '../lib/api'

// Carte affichée à l'étudiant : son lien personnel à envoyer aux responsables d'entreprise.
// Chaque fiche remplie à partir de ce lien compte dans ses 100 entreprises.
export default function LienInvitation({ user, notifier }) {
  const lien = lienInvitation(user)
  const [qr, setQr] = useState('')
  const [voirQr, setVoirQr] = useState(false)

  useEffect(() => {
    if (!voirQr || qr) return
    QRCode.toDataURL(lien, { width: 480, margin: 1, color: { dark: '#0f5c4d' } }).then(setQr).catch(() => {})
  }, [voirQr, qr, lien])

  const message = `Bonjour, je suis ${user.nom}, étudiant(e) ingénieur à l'ESTLC Ambam. Dans le cadre de l'école de terrain de l'ESTLC (19 au 25 octobre 2026) sur le marché de l'emploi, pouvez-vous remplir la fiche de votre structure (postes à pourvoir, profils et compétences recherchés, stages) ici : ${lien}`

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien)
      notifier('Lien copié ✓')
    } catch {
      window.prompt('Copiez ce lien :', lien)
    }
  }

  return (
    <section className="carte">
      <h2>Mon lien pour les entreprises</h2>
      <p className="petit muted" style={{ marginTop: -4 }}>
        Envoyez-le au responsable : il crée son compte et remplit lui-même la fiche officielle de sa structure. Elle compte dans vos 100.
      </p>
      <div className="ligne-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
        <a className="btn petit" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Envoyer par WhatsApp</a>
        <button className="btn petit secondaire" onClick={copier}>Copier le lien</button>
        <button className="btn petit secondaire" onClick={() => setVoirQr(!voirQr)}>{voirQr ? 'Masquer le QR code' : 'QR code'}</button>
      </div>
      {voirQr && (
        <div className="centre" style={{ marginTop: 14 }}>
          {qr ? <img src={qr} alt="QR code de mon lien" style={{ width: 220, height: 220 }} /> : <p className="muted petit">Préparation…</p>}
          <p className="petit muted" style={{ margin: '6px 0 0' }}>Le responsable le scanne avec l'appareil photo de son téléphone.</p>
        </div>
      )}
    </section>
  )
}
