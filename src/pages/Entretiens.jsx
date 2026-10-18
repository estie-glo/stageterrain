import { useMemo, useState } from 'react'
import { INTERETS, labelOf } from '../lib/constants'
import { SECTEURS_OFFICIELS } from '../lib/questionnaire'
import { nbPostes } from '../lib/reponses'
import { normaliser } from '../lib/api'
import { IcSync } from '../components/Icones'

export function BadgeInteret({ e }) {
  if (e._attente) return <span className="badge attente">En attente</span>
  const t = INTERETS.find((i) => i.value === e.interet)
  return <span className={'badge ' + (t?.tone || 'muted')}>{labelOf(INTERETS, e.interet)}</span>
}

const FILTRES = [
  { id: 'tous', label: 'Tous' },
  { id: 'postes', label: 'Postes à pourvoir' },
  { id: 'recrutent', label: 'Prévoient de recruter' },
  { id: 'stages', label: 'Accueillent des stagiaires' },
  { id: 'ancienne', label: 'À compléter' },
]

export default function Entretiens({ donnees, user, onOuvrir, onRafraichir }) {
  // Confidentialité : chaque étudiant ne voit que ses propres fiches (règle de la base)
  const vue = 'moi'
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [secteur, setSecteur] = useState('')
  const [charge, setCharge] = useState(false)

  const liste = useMemo(() => {
    const nq = normaliser(q)
    return donnees.filter((d) => {
      if (vue === 'moi' && d.enqueteur_id !== user.id) return false
      if (filtre === 'postes' && !nbPostes(d.reponses)) return false
      if (filtre === 'recrutent' && !(d.reponses?.q25 || '').startsWith('Oui')) return false
      if (filtre === 'stages' && d.besoin_stagiaires !== 'oui') return false
      if (filtre === 'ancienne' && d.reponses) return false
      if (secteur && d.secteur !== secteur) return false
      if (nq && !normaliser([d.entreprise_nom, d.quartier, d.ville, d.enqueteur_nom].join(' ')).includes(nq)) return false
      return true
    })
  }, [donnees, q, filtre, secteur, vue, user.id])

  async function rafraichir() {
    setCharge(true)
    await onRafraichir()
    setCharge(false)
  }

  return (
    <>
      <header className="topbar">
        <h1>Fiches<span className="sous">{vue === 'moi' ? `${donnees.filter((d) => d.enqueteur_id === user.id).length} structure(s) enquêtée(s) par vous` : `${donnees.length} structure(s) pour toute la classe`}</span></h1>
        <button className="btn petit secondaire" onClick={rafraichir} disabled={charge} aria-label="Actualiser"><IcSync /></button>
      </header>
      <main className="contenu">
        <div className="recherche">
          <input type="search" placeholder="Rechercher une entreprise, un quartier…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="filtres">
            {FILTRES.map((x) => (
              <button key={x.id} className={'puce' + (filtre === x.id ? ' on' : '')} onClick={() => setFiltre(x.id)}>{x.label}</button>
            ))}
            <select value={secteur} onChange={(e) => setSecteur(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: 13, borderRadius: 999 }} aria-label="Filtrer par secteur">
              <option value="">Tous secteurs</option>
              {[...new Set([...SECTEURS_OFFICIELS, ...donnees.map((d) => d.secteur).filter(Boolean)])].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {liste.length === 0 ? (
          <div className="vide"><div className="icone">🔍</div>{donnees.length ? 'Aucun résultat.' : 'Aucune fiche enregistrée.'}</div>
        ) : (
          liste.map((e) => (
            <button key={e.id || e.client_id} className="item" onClick={() => onOuvrir(e)}>
              <span className="avatar">{(e.entreprise_nom || '?').trim().charAt(0).toUpperCase()}</span>
              <span className="espace" style={{ minWidth: 0 }}>
                <div className="nom">{e.entreprise_nom}</div>
                <div className="meta">
                  {e.secteur}{e.ville ? ` · ${e.ville}` : ''}{nbPostes(e.reponses) ? ` · ${nbPostes(e.reponses)} poste(s)` : ''}{!e.reponses ? ' · à compléter' : ''}<br />
                  {e.responsable_id ? 'Remplie par l’entreprise' : e.enqueteur_nom}{e.responsable_id && vue === 'classe' ? ` · pour ${e.enqueteur_nom}` : ''}{e.created_at ? ` · ${new Date(e.created_at).toLocaleDateString('fr-FR')}` : ''}
                </div>
              </span>
              <BadgeInteret e={e} />
            </button>
          ))
        )}
      </main>
    </>
  )
}
