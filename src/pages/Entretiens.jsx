import { useMemo, useState } from 'react'
import { INTERETS, labelOf, SECTEURS } from '../lib/constants'
import { normaliser } from '../lib/api'
import { IcSync } from '../components/Icones'

export function BadgeInteret({ e }) {
  if (e._attente) return <span className="badge attente">En attente</span>
  const t = INTERETS.find((i) => i.value === e.interet)
  return <span className={'badge ' + (t?.tone || 'muted')}>{labelOf(INTERETS, e.interet)}</span>
}

const FILTRES = [
  { id: 'tous', label: 'Tous' },
  { id: 'besoin', label: 'Veulent des stagiaires' },
  { id: 'interesse', label: 'Intéressées' },
  { id: 'a_rappeler', label: 'À rappeler' },
]

export default function Entretiens({ donnees, user, onOuvrir, onRafraichir }) {
  const [vue, setVue] = useState(() => {
    try { return localStorage.getItem('st_vue') || 'moi' } catch { return 'moi' }
  })
  const choisirVue = (v) => {
    setVue(v)
    try { localStorage.setItem('st_vue', v) } catch { /* ignore */ }
  }
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [secteur, setSecteur] = useState('')
  const [charge, setCharge] = useState(false)

  const liste = useMemo(() => {
    const nq = normaliser(q)
    return donnees.filter((d) => {
      if (vue === 'moi' && d.enqueteur_id !== user.id) return false
      if (filtre === 'besoin' && d.besoin_stagiaires !== 'oui') return false
      if ((filtre === 'interesse' || filtre === 'a_rappeler') && d.interet !== filtre) return false
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
        <h1>Entretiens<span className="sous">{vue === 'moi' ? `${donnees.filter((d) => d.enqueteur_id === user.id).length} entreprise(s) interrogée(s) par vous` : `${donnees.length} entreprise(s) pour toute la classe`}</span></h1>
        <button className="btn petit secondaire" onClick={rafraichir} disabled={charge} aria-label="Actualiser"><IcSync /></button>
      </header>
      <main className="contenu">
        <div className="recherche">
          <div className="segment" style={{ marginBottom: 10 }}>
            <button className={vue === 'moi' ? 'on' : ''} onClick={() => choisirVue('moi')}>Mes entreprises</button>
            <button className={vue === 'classe' ? 'on' : ''} onClick={() => choisirVue('classe')}>Toute la classe</button>
          </div>
          <input type="search" placeholder="Rechercher une entreprise, un quartier…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="filtres">
            {FILTRES.map((x) => (
              <button key={x.id} className={'puce' + (filtre === x.id ? ' on' : '')} onClick={() => setFiltre(x.id)}>{x.label}</button>
            ))}
            <select value={secteur} onChange={(e) => setSecteur(e.target.value)} style={{ width: 'auto', padding: '6px 10px', fontSize: 13, borderRadius: 999 }} aria-label="Filtrer par secteur">
              <option value="">Tous secteurs</option>
              {SECTEURS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {liste.length === 0 ? (
          <div className="vide"><div className="icone">🔍</div>{donnees.length ? 'Aucun résultat.' : 'Aucun entretien enregistré.'}</div>
        ) : (
          liste.map((e) => (
            <button key={e.id || e.client_id} className="item" onClick={() => onOuvrir(e)}>
              <span className="avatar">{(e.entreprise_nom || '?').trim().charAt(0).toUpperCase()}</span>
              <span className="espace" style={{ minWidth: 0 }}>
                <div className="nom">{e.entreprise_nom}</div>
                <div className="meta">
                  {e.secteur}{e.quartier ? ` · ${e.quartier}` : ''}<br />
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
