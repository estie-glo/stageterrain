import { useCallback, useEffect, useRef, useState } from 'react'
import { flushQueue, getQueue, getUser, lireInvitation, listEntretiens, onAuthChange, oublierInvitation } from './lib/api'
import { IcAccueil, IcIdees, IcListe, IcPlus, IcProfil } from './components/Icones'
import Connexion from './pages/Connexion'
import Tableau from './pages/Tableau'
import Entretiens from './pages/Entretiens'
import Nouveau from './pages/Nouveau'
import Fiche from './pages/Fiche'
import Idees from './pages/Idees'
import Profil from './pages/Profil'
import EspaceResponsable from './pages/EspaceResponsable'

const invitation = lireInvitation() // lien ?ref=... ouvert par un responsable d'entreprise

const ONGLETS = [
  { id: 'accueil', label: 'Accueil', Icone: IcAccueil },
  { id: 'liste', label: 'Fiches', Icone: IcListe },
  { id: 'nouveau', label: 'Nouveau', Icone: IcPlus, plus: true },
  { id: 'idees', label: 'Guide', Icone: IcIdees },
  { id: 'profil', label: 'Profil', Icone: IcProfil },
]

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = chargement
  const [onglet, setOnglet] = useState('accueil')
  const [donnees, setDonnees] = useState([])
  const [attente, setAttente] = useState(getQueue())
  const [fiche, setFiche] = useState(null)
  const [edition, setEdition] = useState(null) // fiche ouverte dans le formulaire pour être complétée
  const [toast, setToast] = useState('')
  const [enLigne, setEnLigne] = useState(navigator.onLine)

  const userRef = useRef(null)
  userRef.current = user

  const notifier = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  const rafraichir = useCallback(async () => {
    const sent = await flushQueue()
    if (sent) notifier(`${sent} fiche(s) en attente envoyée(s)`)
    setAttente(getQueue())
    setDonnees(await listEntretiens(userRef.current))
  }, [notifier])

  useEffect(() => {
    getUser().then(setUser)
    return onAuthChange(setUser)
  }, [])

  useEffect(() => {
    if (user) {
      oublierInvitation() // une fois connecté, le lien d'invitation a servi : le téléphone redevient normal
      rafraichir()
    }
  }, [user, rafraichir])

  useEffect(() => {
    const on = () => { setEnLigne(true); rafraichir() }
    const off = () => setEnLigne(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [rafraichir])

  if (user === undefined) return <div className="app"><div className="vide">Chargement…</div></div>
  if (!user) return <div className="app"><Connexion onConnecte={setUser} invitation={invitation} /></div>

  if (user.role === 'responsable') {
    const maFiche = [...attente.map((e) => ({ ...e, id: e.client_id, _attente: true })), ...donnees].find((d) => d.responsable_id === user.id) || null
    return (
      <div className="app">
        <EspaceResponsable user={user} fiche={maFiche} onChange={rafraichir} notifier={notifier} />
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    )
  }

  // les entretiens en attente apparaissent aussi dans la liste et les stats
  const enAttente = attente.map((e) => ({ ...e, id: e.client_id, _attente: true }))
  const tous = [...enAttente, ...donnees.filter((d) => !attente.some((a) => a.client_id === d.client_id))]

  const aller = (id) => { setFiche(null); setEdition(null); setOnglet(id); window.scrollTo(0, 0) }

  let page
  if (edition) {
    page = (
      <Nouveau
        user={user}
        existants={tous}
        initial={edition}
        onTermine={async () => {
          await rafraichir()
          notifier('Fiche mise à jour ✓')
          setEdition(null)
          setFiche(null)
        }}
        onAnnuler={() => setEdition(null)}
      />
    )
  } else if (fiche) {
    page = <Fiche entretien={fiche} user={user} onRetour={() => setFiche(null)} onModifier={(e) => { setEdition(e); window.scrollTo(0, 0) }} onChange={async () => { await rafraichir(); setFiche(null) }} notifier={notifier} />
  } else if (onglet === 'accueil') {
    page = <Tableau donnees={tous} user={user} onNouveau={() => aller('nouveau')} notifier={notifier} />
  } else if (onglet === 'liste') {
    page = <Entretiens donnees={tous} user={user} onOuvrir={setFiche} onRafraichir={rafraichir} />
  } else if (onglet === 'nouveau') {
    page = (
      <Nouveau
        user={user}
        existants={tous}
        onTermine={async (statut) => {
          await rafraichir()
          notifier(statut === 'queued' ? 'Pas de réseau : fiche gardée, elle sera envoyée plus tard' : 'Fiche enregistrée ✓')
          aller('liste')
        }}
        onAnnuler={() => aller('accueil')}
      />
    )
  } else if (onglet === 'idees') {
    page = <Idees />
  } else {
    page = <Profil user={user} attente={attente.length} enLigne={enLigne} onSync={rafraichir} donnees={tous} />
  }

  return (
    <div className="app">
      {page}
      {!fiche && !edition && onglet !== 'nouveau' && (
        <nav className="nav">
          {ONGLETS.map(({ id, label, Icone, plus }) => (
            <button key={id} className={(plus ? 'plus ' : '') + (onglet === id ? 'actif' : '')} onClick={() => aller(id)} aria-label={label}>
              <Icone />
              {!plus && <span>{label}</span>}
            </button>
          ))}
        </nav>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
