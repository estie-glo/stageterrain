import { useEffect, useMemo, useState } from 'react'
import { PAYS } from '../lib/constants'
import { createEntretien, newId, normaliser, updateEntretien } from '../lib/api'
import { etapesPour, NOTE_ENQUETEUR, questionsVisibles } from '../lib/questionnaire'
import { depuisAncienne, deriver } from '../lib/reponses'
import Champ from '../components/Champ'

// Formulaire de la fiche officielle de l'école de terrain (11 rubriques).
// Deux façons de la remplir : par l'étudiant pendant l'entretien,
// ou par le responsable de la structure lui-même (invité par le lien de l'étudiant).
const K_ENTETE = 'st_entete' // zone, filière, équipe : repris d'une fiche à l'autre

function lire(cle, defaut) {
  try { return JSON.parse(localStorage.getItem(cle)) || defaut } catch { return defaut }
}
const aujourdhui = () => new Date().toISOString().slice(0, 10)

function nouvelleFiche(mode) {
  const base = { q7: 'Ambam', q8: 'Sud', q15_ind: '+237' }
  if (mode === 'responsable') return base
  const e = lire(K_ENTETE, {})
  return { ...base, zone: e.zone || '', filiere_enqueteur: e.filiere_enqueteur || '', equipe: e.equipe || '', date_enquete: aujourdhui(), q114: 'Entretien direct', q115: 'Déclarées par un responsable de la structure' }
}

export default function Nouveau({ user, existants, onTermine, onAnnuler, mode = 'etudiant', initial = null }) {
  const ETAPES = useMemo(() => etapesPour(mode), [mode])
  const K_BROUILLON = 'st_brouillon_v3' + (mode === 'responsable' ? '_resp' : '')
  const [r, setR] = useState(() => {
    if (initial) return initial.reponses ? { ...initial.reponses } : { ...nouvelleFiche(mode), ...depuisAncienne(initial) }
    return lire(K_BROUILLON, null) || nouvelleFiche(mode)
  })
  const [etape, setEtape] = useState(0)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  // brouillon : rien n'est perdu si l'appli est fermée en plein entretien
  useEffect(() => {
    if (initial) return
    try { localStorage.setItem(K_BROUILLON, JSON.stringify(r)) } catch { /* ignore */ }
  }, [r, initial, K_BROUILLON])

  const maj = (k, v) => setR((x) => ({ ...x, [k]: v }))

  const doublon = useMemo(() => {
    if (mode === 'responsable') return null
    const n = normaliser(r.q1)
    if (n.length < 3) return null
    const memes = existants.filter((e) => normaliser(e.entreprise_nom) === n && e.id !== initial?.id)
    // priorité à mes propres fiches : chaque étudiant doit avoir 100 structures différentes
    return memes.find((e) => e.enqueteur_id === user.id) || memes[0] || null
  }, [r.q1, existants, user.id, mode, initial])

  const rub = ETAPES[etape]
  const indexI = ETAPES.findIndex((x) => x.id === 'I')

  function erreurIdentification() {
    if (!(r.q1 || '').trim()) return 'Indiquez au moins la dénomination de la structure (question 1).'
    if (!r.q4) return 'Indiquez le secteur principal d’activité (question 4).'
    if (r.q4 === 'Autre' && !(r.q4_autre || '').trim()) return 'Précisez le secteur d’activité (question 4, « Autre »).'
    if ((r.q15 || '').trim()) {
      const pays = PAYS.find((p) => p.code === (r.q15_ind || '+237')) || PAYS[0]
      const n = r.q15.replace(/\D/g, '').length
      if (n !== pays.chiffres) return `Téléphone (question 15) : ${pays.chiffres} chiffres attendus pour ${pays.nom}, sans l'indicatif. Vous en avez saisi ${n}.`
    }
    return ''
  }

  function aller(i) {
    if (etape === indexI && i > etape) {
      const e = erreurIdentification()
      setErreur(e)
      if (e) return
    }
    setErreur('')
    setEtape(i)
    window.scrollTo(0, 0)
  }

  async function enregistrer() {
    const e = erreurIdentification()
    if (e) {
      setErreur(e)
      setEtape(indexI)
      window.scrollTo(0, 0)
      return
    }
    setEnvoi(true)
    try {
      const rep = { ...r }
      if (mode === 'responsable') {
        rep.q114 = 'Questionnaire écrit'
        rep.q115 = 'Déclarées par un responsable de la structure'
      } else {
        try { localStorage.setItem(K_ENTETE, JSON.stringify({ zone: rep.zone, filiere_enqueteur: rep.filiere_enqueteur, equipe: rep.equipe })) } catch { /* ignore */ }
      }
      const donnees = { ...deriver(rep), reponses: rep }
      let status = 'saved'
      if (initial) await updateEntretien(initial.id, donnees)
      else ({ status } = await createEntretien(user, { client_id: newId(), ...donnees }))
      localStorage.removeItem(K_BROUILLON)
      onTermine(status)
    } catch (err) {
      setErreur("L'enregistrement a échoué : " + err.message)
      setEnvoi(false)
    }
  }

  function annuler() {
    const rempli = (r.q1 || '').trim()
    if (rempli && !initial && !window.confirm('Abandonner cette fiche ? Les informations saisies seront effacées.')) return
    if (!initial) localStorage.removeItem(K_BROUILLON)
    onAnnuler()
  }

  const derniere = etape === ETAPES.length - 1
  const titre = initial ? 'Modifier la fiche' : mode === 'responsable' ? 'Fiche de ma structure' : 'Nouvelle fiche'

  return (
    <>
      <header className="topbar">
        <button className="retour" onClick={etape ? () => aller(etape - 1) : annuler} aria-label="Retour">‹</button>
        <h1>{titre}<span className="sous">Rubrique {etape + 1} sur {ETAPES.length}</span></h1>
        <button className="btn petit secondaire" onClick={annuler}>Annuler</button>
      </header>
      <main className="contenu" style={{ paddingBottom: 40 }}>
        <div className="etapes">{ETAPES.map((x, i) => <span key={x.id} className={i <= etape ? 'fait' : ''} />)}</div>
        <select className="saut" aria-label="Aller à la rubrique" value={etape} onChange={(e) => aller(Number(e.target.value))}>
          {ETAPES.map((x, i) => <option key={x.id} value={i}>{x.court}</option>)}
        </select>
        <h2 className="etape-h">{rub.id === 'entete' ? rub.titre : `Rubrique ${rub.id} — ${rub.titre}`}</h2>
        {rub.aide && <p className="muted petit" style={{ marginTop: -4 }}>{rub.aide}</p>}

        {erreur && <div className="bandeau erreur">{erreur}</div>}

        {rub.id === 'entete' && (
          <>
            <div className="carte petit">
              Enquêteur : <b>{user.nom}</b> · Niveau 4
            </div>
            <details className="carte petit note">
              <summary>Note à l’attention de l’enquêteur</summary>
              <p style={{ marginBottom: 0, lineHeight: 1.5 }}>{NOTE_ENQUETEUR}</p>
            </details>
          </>
        )}
        {rub.id === 'I' && mode === 'responsable' && etape === 0 && !initial && (
          <div className="bandeau ok">
            Merci de prendre quelques minutes pour cette fiche de l'ESTLC sur l'emploi et les profils recherchés. Seules les questions 1 et 4 sont obligatoires :
            répondez à ce que vous pouvez, vous pourrez compléter plus tard.
          </div>
        )}

        {questionsVisibles(rub, r, mode).map((q, i) => (
          <div key={q.id || 't' + i}>
            <Champ q={q} r={r} maj={maj} />
            {q.id === 'q1' && doublon && (doublon.enqueteur_id === user.id ? (
              <div className="alerte-doublon">
                <b>Vous avez déjà une fiche pour cette structure</b>
                {doublon.created_at ? ` (${new Date(doublon.created_at).toLocaleDateString('fr-FR')})` : ''}. Ne l'enregistrez pas une deuxième fois.
              </div>
            ) : (
              <div className="alerte-doublon" style={{ background: 'var(--vert-clair)', color: 'var(--vert-fonce)' }}>
                Déjà enquêtée par <b>{doublon.enqueteur_nom || 'un camarade'}</b>. Vous pouvez quand même la compter dans vos propres 100 structures.
              </div>
            ))}
          </div>
        ))}

        <div className="actions-bas">
          {!derniere ? (
            <>
              <button className="btn" onClick={() => aller(etape + 1)}>Rubrique suivante</button>
              {etape > indexI && (
                <button className="btn secondaire" onClick={enregistrer} disabled={envoi}>
                  {envoi ? 'Enregistrement…' : initial ? 'Enregistrer les modifications' : 'Enregistrer maintenant (compléter plus tard)'}
                </button>
              )}
            </>
          ) : (
            <button className="btn ocre" onClick={enregistrer} disabled={envoi}>
              {envoi ? 'Enregistrement…' : initial ? 'Enregistrer les modifications' : mode === 'responsable' ? 'Envoyer ma fiche' : 'Enregistrer la fiche'}
            </button>
          )}
        </div>
      </main>
    </>
  )
}
