import { useEffect } from 'react'
import FicheImprimable from '../components/FicheImprimable'

// Toutes les fiches choisies, l'une après l'autre, au format de la fiche officielle.
// La fenêtre d'impression du téléphone permet de choisir « Enregistrer au format PDF ».
export default function ImpressionLot({ liste, onRetour }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 900) // laisse le temps aux logos de s'afficher
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <header className="topbar">
        <button className="retour" onClick={onRetour} aria-label="Retour">‹</button>
        <h1>PDF des fiches<span className="sous">{liste.length} fiche(s) au format officiel</span></h1>
      </header>
      <main className="contenu" style={{ paddingBottom: 40 }}>
        <div className="ecran-seul">
          <div className="bandeau ok">
            Dans la fenêtre qui s'ouvre, choisissez <b>« Enregistrer au format PDF »</b> (ou une imprimante), puis <b>Enregistrer</b>.
            Chaque structure commence sur une nouvelle page.
          </div>
          <button className="btn" onClick={() => window.print()}>Ouvrir à nouveau la fenêtre PDF</button>
          <p className="muted petit">Aperçu :</p>
        </div>
        <div className="off-lot">
          {liste.map((e) => <FicheImprimable key={e.id || e.client_id} e={e} />)}
        </div>
      </main>
    </>
  )
}
