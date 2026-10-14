import { useState } from 'react'
import { isDemo, signIn, signUp } from '../lib/api'
import { IcOeil, IcOeilBarre } from '../components/Icones'

export default function Connexion({ onConnecte }) {
  const [mode, setMode] = useState('connexion')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [chargement, setChargement] = useState(false)
  const [voir, setVoir] = useState(false)

  async function valider(e) {
    e.preventDefault()
    setErreur('')
    setInfo('')
    setChargement(true)
    try {
      if (isDemo) onConnecte(await signIn(null, null, nom.trim()))
      else if (mode === 'connexion') onConnecte(await signIn(email.trim(), mdp))
      else onConnecte(await signUp(nom.trim(), email.trim(), mdp))
    } catch (err) {
      if (/Compte créé/.test(err.message)) { setInfo(err.message); setMode('connexion') }
      else setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="accueil-login">
      <img className="logo" src="/icon.svg" alt="" />
      <h1>StageTerrain</h1>
      <p className="intro">École de terrain ESTLC<br />Enquête sur les besoins en stagiaires des entreprises</p>

      {isDemo && (
        <div className="bandeau demo">
          <b>Mode démo.</b> Aucune base n'est configurée : les données restent sur ce téléphone. Entrez simplement votre nom.
        </div>
      )}
      {erreur && <div className="bandeau erreur">{erreur}</div>}
      {info && <div className="bandeau ok">{info}</div>}

      <form onSubmit={valider} className="carte">
        {!isDemo && (
          <div className="segment" style={{ marginBottom: 16 }}>
            <button type="button" className={mode === 'connexion' ? 'on' : ''} onClick={() => setMode('connexion')}>Se connecter</button>
            <button type="button" className={mode === 'inscription' ? 'on' : ''} onClick={() => setMode('inscription')}>Créer un compte</button>
          </div>
        )}

        {(isDemo || mode === 'inscription') && (
          <div className="champ">
            <label htmlFor="nom">Nom et prénom</label>
            <input id="nom" type="text" required value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder="Ex. Wandji Estelle" />
          </div>
        )}
        {!isDemo && (
          <>
            <div className="champ">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
            </div>
            <div className="champ">
              <label htmlFor="mdp">Mot de passe</label>
              <div className="mdp-groupe">
                <input id="mdp" type={voir ? 'text' : 'password'} required minLength={6} value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'} />
                <button type="button" className="oeil" onClick={() => setVoir(!voir)} aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={voir}>
                  {voir ? <IcOeilBarre /> : <IcOeil />}
                </button>
              </div>
              {mode === 'inscription' && <div className="aide">6 caractères minimum.</div>}
            </div>
          </>
        )}
        <button className="btn" disabled={chargement}>
          {chargement ? 'Patientez…' : isDemo ? 'Commencer' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}
