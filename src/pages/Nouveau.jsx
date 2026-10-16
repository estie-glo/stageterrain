import { useEffect, useMemo, useState } from 'react'
import { BESOINS, FILIERES, INTERETS, PAYS, PERIODES, SECTEURS, suggestionsFor } from '../lib/constants'
import { createEntretien, newId, normaliser } from '../lib/api'
import { IcCheck } from '../components/Icones'

const K_BROUILLON = 'st_brouillon'
const VIDE = {
  entreprise_nom: '', secteur: '', ville: 'Ambam', quartier: '',
  contact_nom: '', contact_poste: '', contact_tel: '', indicatif: '+237',
  besoin_stagiaires: '', filieres: [], nombre_stagiaires: '', periode: '',
  services_proposes: [], interet: '', notes: '',
}
const TITRES = ["L'entreprise", 'Besoin en stagiaires', 'Nos propositions', 'Bilan']

function lireBrouillon() {
  try { return JSON.parse(localStorage.getItem(K_BROUILLON)) || null } catch { return null }
}

export default function Nouveau({ user, existants, onTermine, onAnnuler }) {
  const [f, setF] = useState(() => ({ ...VIDE, ...(lireBrouillon() || {}) }))
  const [etape, setEtape] = useState(0)
  const [autre, setAutre] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  // brouillon : rien n'est perdu si l'appli est fermée en plein entretien
  useEffect(() => {
    try { localStorage.setItem(K_BROUILLON, JSON.stringify(f)) } catch { /* ignore */ }
  }, [f])

  const maj = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const basculer = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }))

  const doublon = useMemo(() => {
    const n = normaliser(f.entreprise_nom)
    if (n.length < 3) return null
    return existants.find((e) => normaliser(e.entreprise_nom) === n) || null
  }, [f.entreprise_nom, existants])

  const pays = PAYS.find((p) => p.code === f.indicatif) || PAYS[0]
  const suggestions = suggestionsFor(f.secteur)
  const persos = f.services_proposes.filter((s) => !suggestions.includes(s))

  function valideEtape() {
    if (etape === 0 && (!f.entreprise_nom.trim() || !f.secteur)) return "Indiquez au moins le nom et le secteur de l'entreprise."
    if (etape === 0 && f.contact_tel.trim()) {
      const n = f.contact_tel.replace(/\D/g, '').length
      if (n !== pays.chiffres) return `Le numéro (${pays.nom}) doit contenir ${pays.chiffres} chiffres, sans l'indicatif. Vous en avez saisi ${n}.`
    }
    if (etape === 1 && !f.besoin_stagiaires) return "Indiquez si l'entreprise a besoin de stagiaires."
    if (etape === 3 && !f.interet) return "Indiquez la réaction de l'entreprise."
    return ''
  }

  function suivant() {
    const e = valideEtape()
    setErreur(e)
    if (e) return
    setEtape((s) => s + 1)
    window.scrollTo(0, 0)
  }

  function ajouterAutre() {
    const v = autre.trim()
    if (v && !f.services_proposes.includes(v)) maj('services_proposes', [...f.services_proposes, v])
    setAutre('')
  }

  async function enregistrer() {
    const e = valideEtape()
    setErreur(e)
    if (e) return
    setEnvoi(true)
    try {
      const besoin = f.besoin_stagiaires !== 'non'
      const { status } = await createEntretien(user, {
        client_id: newId(),
        entreprise_nom: f.entreprise_nom.trim(),
        secteur: f.secteur,
        ville: f.ville.trim() || null,
        quartier: f.quartier.trim() || null,
        contact_nom: f.contact_nom.trim() || null,
        contact_poste: f.contact_poste.trim() || null,
        contact_tel: f.contact_tel.trim() ? `${f.indicatif} ${f.contact_tel.replace(/\D/g, '')}` : null,
        besoin_stagiaires: f.besoin_stagiaires,
        filieres: besoin ? f.filieres : [],
        nombre_stagiaires: besoin && f.nombre_stagiaires !== '' ? Number(f.nombre_stagiaires) : null,
        periode: besoin ? f.periode || null : null,
        services_proposes: f.services_proposes,
        interet: f.interet,
        notes: f.notes.trim() || null,
      })
      localStorage.removeItem(K_BROUILLON)
      onTermine(status)
    } catch (err) {
      setErreur("L'enregistrement a échoué : " + err.message)
      setEnvoi(false)
    }
  }

  function annuler() {
    const rempli = f.entreprise_nom || f.notes || f.services_proposes.length
    if (rempli && !window.confirm('Abandonner cet entretien ? Les informations saisies seront effacées.')) return
    localStorage.removeItem(K_BROUILLON)
    onAnnuler()
  }

  return (
    <>
      <header className="topbar">
        <button className="retour" onClick={etape ? () => setEtape(etape - 1) : annuler} aria-label="Retour">‹</button>
        <h1>Nouvel entretien<span className="sous">Étape {etape + 1} sur 4</span></h1>
        <button className="btn petit secondaire" onClick={annuler}>Annuler</button>
      </header>
      <main className="contenu" style={{ paddingBottom: 40 }}>
        <div className="etapes">{TITRES.map((t, i) => <span key={t} className={i <= etape ? 'fait' : ''} />)}</div>
        <p className="etape-titre">Étape {etape + 1}</p>
        <h2 className="etape-h">{TITRES[etape]}</h2>

        {erreur && <div className="bandeau erreur">{erreur}</div>}

        {etape === 0 && (
          <>
            <div className="champ">
              <label htmlFor="nom">Nom de l'entreprise <span className="requis">*</span></label>
              <input id="nom" type="text" value={f.entreprise_nom} onChange={(e) => maj('entreprise_nom', e.target.value)} placeholder="Ex. Boutique Mama Ngono" />
              {doublon && (
                <div className="alerte-doublon">
                  Déjà interrogée par <b>{doublon.enqueteur_nom || 'un camarade'}</b>
                  {doublon.created_at ? ` le ${new Date(doublon.created_at).toLocaleDateString('fr-FR')}` : ''}. Vérifiez avant de continuer.
                </div>
              )}
            </div>
            <div className="champ">
              <label htmlFor="secteur">Secteur d'activité <span className="requis">*</span></label>
              <select id="secteur" value={f.secteur} onChange={(e) => maj('secteur', e.target.value)}>
                <option value="">Choisir…</option>
                {SECTEURS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="ligne-flex">
              <div className="champ espace"><label htmlFor="ville">Ville</label><input id="ville" type="text" value={f.ville} onChange={(e) => maj('ville', e.target.value)} /></div>
              <div className="champ espace"><label htmlFor="quartier">Quartier</label><input id="quartier" type="text" value={f.quartier} onChange={(e) => maj('quartier', e.target.value)} /></div>
            </div>
            <div className="champ"><label htmlFor="cnom">Personne rencontrée</label><input id="cnom" type="text" value={f.contact_nom} onChange={(e) => maj('contact_nom', e.target.value)} /></div>
            <div className="champ"><label htmlFor="cposte">Fonction</label><input id="cposte" type="text" value={f.contact_poste} onChange={(e) => maj('contact_poste', e.target.value)} placeholder="Ex. Gérant, propriétaire" /></div>
            <div className="champ">
              <label htmlFor="ctel">Téléphone</label>
              <div className="tel-groupe">
                <select aria-label="Indicatif du pays" value={f.indicatif} onChange={(e) => maj('indicatif', e.target.value)}>
                  {PAYS.map((p) => <option key={p.code} value={p.code}>{p.drapeau} {p.code}</option>)}
                </select>
                <input id="ctel" type="tel" inputMode="numeric" value={f.contact_tel} onChange={(e) => maj('contact_tel', e.target.value.replace(/[^\d ]/g, ''))} placeholder={pays.exemple} />
              </div>
              <div className="aide">{pays.drapeau} {pays.nom} · {pays.chiffres} chiffres, sans l'indicatif</div>
            </div>
          </>
        )}

        {etape === 1 && (
          <>
            <div className="champ">
              <span className="label">L'entreprise a-t-elle besoin de stagiaires ? <span className="requis">*</span></span>
              <div className="segment">
                {BESOINS.map((b) => (
                  <button key={b.value} type="button" className={f.besoin_stagiaires === b.value ? 'on' : ''} onClick={() => maj('besoin_stagiaires', b.value)}>{b.label}</button>
                ))}
              </div>
            </div>
            {f.besoin_stagiaires && f.besoin_stagiaires !== 'non' && (
              <>
                <div className="champ">
                  <span className="label">Quels profils ?</span>
                  <div className="puces">
                    {FILIERES.map((x) => (
                      <button key={x} type="button" className={'puce' + (f.filieres.includes(x) ? ' on' : '')} onClick={() => basculer('filieres', x)}>{x}</button>
                    ))}
                  </div>
                </div>
                <div className="champ">
                  <label htmlFor="nb">Combien de stagiaires ?</label>
                  <input id="nb" type="number" inputMode="numeric" min="0" max="50" value={f.nombre_stagiaires} onChange={(e) => maj('nombre_stagiaires', e.target.value)} />
                </div>
                <div className="champ">
                  <label htmlFor="periode">Période souhaitée</label>
                  <select id="periode" value={f.periode} onChange={(e) => maj('periode', e.target.value)}>
                    <option value="">Choisir…</option>
                    {PERIODES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
            {f.besoin_stagiaires === 'non' && (
              <p className="muted petit">Pas de besoin pour l'instant : passez à l'étape suivante pour lui proposer un service.</p>
            )}
          </>
        )}

        {etape === 2 && (
          <>
            <p className="muted petit" style={{ marginTop: -6 }}>
              Idées adaptées au secteur <b>{f.secteur}</b>. Cochez ce que vous avez présenté.
            </p>
            {suggestions.map((s) => (
              <button key={s} type="button" className={'suggestion' + (f.services_proposes.includes(s) ? ' on' : '')} onClick={() => basculer('services_proposes', s)}>
                <span className="coche">{f.services_proposes.includes(s) && <IcCheck />}</span>{s}
              </button>
            ))}
            {persos.map((s) => (
              <button key={s} type="button" className="suggestion on" onClick={() => basculer('services_proposes', s)}>
                <span className="coche"><IcCheck /></span>{s}
              </button>
            ))}
            <div className="champ" style={{ marginTop: 12 }}>
              <label htmlFor="autre">Autre proposition</label>
              <div className="ligne-flex">
                <input id="autre" type="text" value={autre} onChange={(e) => setAutre(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterAutre())} placeholder="Décrivez le service proposé" />
                <button type="button" className="btn petit" onClick={ajouterAutre}>Ajouter</button>
              </div>
            </div>
          </>
        )}

        {etape === 3 && (
          <>
            <div className="champ">
              <span className="label">Réaction de l'entreprise <span className="requis">*</span></span>
              <div className="segment">
                {INTERETS.map((b) => (
                  <button key={b.value} type="button" className={f.interet === b.value ? 'on' : ''} onClick={() => maj('interet', b.value)}>{b.label}</button>
                ))}
              </div>
            </div>
            <div className="champ">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" value={f.notes} onChange={(e) => maj('notes', e.target.value)} placeholder="Ce qu'il faut retenir, prochain contact, conditions…" />
            </div>
            <div className="carte petit">
              <b>{f.entreprise_nom}</b> · {f.secteur}<br />
              <span className="muted">
                Stagiaires : {BESOINS.find((b) => b.value === f.besoin_stagiaires)?.label}
                {f.filieres.length > 0 && f.besoin_stagiaires !== 'non' ? ` (${f.filieres.join(', ')})` : ''}
                <br />Propositions : {f.services_proposes.length || 'aucune'}
              </span>
            </div>
          </>
        )}

        <div className="actions-bas">
          {etape < 3 ? (
            <button className="btn" onClick={suivant}>Continuer</button>
          ) : (
            <button className="btn ocre" onClick={enregistrer} disabled={envoi}>{envoi ? 'Enregistrement…' : "Enregistrer l'entretien"}</button>
          )}
        </div>
      </main>
    </>
  )
}
