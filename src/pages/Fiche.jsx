import { useState } from 'react'
import { BESOINS, INTERETS, labelOf } from '../lib/constants'
import { deleteEntretien, updateEntretien } from '../lib/api'
import { BadgeInteret } from './Entretiens'

export default function Fiche({ entretien: e, user, onRetour, onChange, notifier }) {
  const [interet, setInteret] = useState(e.interet)
  const [notes, setNotes] = useState(e.notes || '')
  const [busy, setBusy] = useState(false)
  // seul l'auteur peut modifier (la base le vérifie aussi grâce aux règles RLS)
  const auteur = e.enqueteur_id === user.id
  const modifiable = auteur && !e._attente
  const modifie = interet !== e.interet || notes !== (e.notes || '')

  async function sauver() {
    setBusy(true)
    try {
      await updateEntretien(e.id, { interet, notes: notes.trim() || null })
      notifier('Fiche mise à jour')
      await onChange()
    } catch (err) {
      notifier(err.message)
      setBusy(false)
    }
  }

  async function supprimer() {
    if (!window.confirm(`Supprimer l'entretien avec « ${e.entreprise_nom} » ?`)) return
    setBusy(true)
    try {
      await deleteEntretien(e.id)
      notifier('Entretien supprimé')
      await onChange()
    } catch (err) {
      notifier(err.message)
      setBusy(false)
    }
  }

  // Numéro au format international : les anciens numéros sans indicatif sont considérés comme camerounais
  const brut = (e.contact_tel || '').trim()
  const tel = brut ? (brut.startsWith('+') ? '+' + brut.replace(/\D/g, '') : '+237' + brut.replace(/\D/g, '')) : ''

  return (
    <>
      <header className="topbar">
        <button className="retour" onClick={onRetour} aria-label="Retour">‹</button>
        <h1>{e.entreprise_nom}<span className="sous">{e.secteur}</span></h1>
      </header>
      <main className="contenu" style={{ paddingBottom: 40 }}>
        {e._attente && <div className="bandeau attente">Cet entretien attend le réseau pour être envoyé.</div>}

        <section className="carte fiche">
          <div className="ligne-flex"><b className="espace">Entreprise</b><BadgeInteret e={e} /></div>
          <dl>
            <dt>Localisation</dt><dd>{[e.quartier, e.ville].filter(Boolean).join(', ') || '—'}</dd>
            <dt>Personne rencontrée</dt><dd>{[e.contact_nom, e.contact_poste].filter(Boolean).join(' — ') || '—'}</dd>
            <dt>Téléphone</dt>
            <dd>{tel ? <><a href={`tel:${tel}`}>{e.contact_tel}</a> · <a href={`https://wa.me/${tel.slice(1)}`} target="_blank" rel="noreferrer">WhatsApp</a></> : '—'}</dd>
          </dl>
        </section>

        <section className="carte fiche">
          <b>Besoin en stagiaires</b>
          <dl>
            <dt>Réponse</dt><dd>{labelOf(BESOINS, e.besoin_stagiaires)}</dd>
            {e.besoin_stagiaires !== 'non' && (
              <>
                <dt>Profils</dt><dd>{(e.filieres || []).join(', ') || '—'}</dd>
                <dt>Nombre</dt><dd>{e.nombre_stagiaires ?? '—'}</dd>
                <dt>Période</dt><dd>{e.periode || '—'}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="carte fiche">
          <b>Services proposés</b>
          {(e.services_proposes || []).length ? (
            <ul style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.6 }}>
              {e.services_proposes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          ) : <p className="muted petit">Aucun.</p>}
        </section>

        <section className="carte">
          <h2>Suivi</h2>
          {modifiable ? (
            <>
              <div className="segment" style={{ marginBottom: 12 }}>
                {INTERETS.map((b) => (
                  <button key={b.value} className={interet === b.value ? 'on' : ''} onClick={() => setInteret(b.value)}>{b.label}</button>
                ))}
              </div>
              <textarea value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Notes" />
              {modifie && <button className="btn" style={{ marginTop: 10 }} onClick={sauver} disabled={busy}>Enregistrer les modifications</button>}
            </>
          ) : (
            <p className="petit" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{e.notes || <span className="muted">Pas de notes.</span>}</p>
          )}
          <p className="muted petit" style={{ marginBottom: 0 }}>
            Interrogée par {e.enqueteur_nom}{e.created_at ? ` le ${new Date(e.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}` : ''}
          </p>
        </section>

        {modifiable && <button className="btn danger" onClick={supprimer} disabled={busy}>Supprimer cet entretien</button>}
      </main>
    </>
  )
}
