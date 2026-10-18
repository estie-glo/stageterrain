import { CHAMPS_POSTE, COMPETENCES, ENTETE, FILIERES_ESTLC, NIVEAUX_COMPETENCE, NOTE_ENQUETEUR, RUBRIQUES } from '../lib/questionnaire'
import { depuisAncienne, texte } from '../lib/reponses'

// La fiche d'une structure présentée comme la fiche papier officielle de l'ESTLC
// (en-tête bilingue avec logos, rubriques I à XI, cases cochées, signatures).
// Toutes les questions apparaissent, même sans réponse, comme sur le papier.

export function EnteteESTLC() {
  return (
    <div className="off-entete">
      <img src="/logo-ue.png" alt="" className="off-logo" />
      <div className="off-bloc">
        REPUBLIQUE DU CAMEROUN<br />Paix – Travail – Patrie<br />---------------<br />UNIVERSITE D’EBOLOWA<br />---------------<br />
        <b>ECOLE SUPERIEURE DE TRANSPORT, DE LOGISTIQUE ET DE COMMERCE</b><br />---------------<br />
        BP. 22 AMBAM<br />Tél.: (+237) 222 48 24 12<br />E-Mail: estlc@estlc.unv-ebolowa.cm<br />Site web : www.estlc.unv-ebolowa.cm
      </div>
      <div className="off-bloc">
        REPUBLIC OF CAMEROON<br />Peace – Work – Fatherland<br />---------------<br />THE UNIVERSITY OF EBOLOWA<br />---------------<br />
        <b>HIGHER INSTITUTE OF TRANSPORT, LOGISTICS AND COMMERCE</b><br />---------------<br />
        PO Box : 22 AMBAM<br />Phone : (+237) 222 48 24 12<br />E-Mail: estlc@estlc.unv-ebolowa.cm<br />Site web : www.estlc.unv-ebolowa.cm
      </div>
      <img src="/logo-estlc.png" alt="" className="off-logo" />
    </div>
  )
}

const Case = ({ on }) => <span className="off-case">{on ? '☒' : '☐'}</span>
const Rep = ({ v }) => (v ? <span className="off-rep">{v}</span> : <span className="off-pts">……………………………………………………</span>)

function Options({ q, r }) {
  const v = r[q.id]
  const coche = (o) => (q.type === 'multi' ? (v || []).includes(o) : v === o)
  const autre = (r[q.id + '_autre'] || '').trim()
  return (
    <ul className="off-options">
      {q.options.map((o) => <li key={o}><Case on={coche(o)} /> {o}</li>)}
      {q.autre && <li><Case on={coche('Autre')} /> Autre : <Rep v={autre} /></li>}
    </ul>
  )
}

function Question({ q, r }) {
  if (q.titre) return <p className="off-sous">{q.titre}</p>
  const num = q.n ? `${q.n}. ` : ''
  switch (q.type) {
    case 'choice':
    case 'multi':
      return <div className="off-q"><p>{num}{q.label} :</p><Options q={q} r={r} /></div>
    case 'certif':
      return null
    case 'grille': {
      const v = r[q.id] || {}
      return (
        <div className="off-q">
          <p>{num}Parmi les compétences suivantes, lesquelles sont les plus importantes pour les postes visés ?<br />
            <i>Pour chaque compétence pertinente, indiquer son niveau d’importance : 1 = faible ; 2 = moyen ; 3 = important ; 4 = indispensable.</i></p>
          <table className="off-table">
            <thead><tr><th>Compétence</th>{NIVEAUX_COMPETENCE.map((n) => <th key={n.v}>{n.v === 'NC' ? 'Non concerné' : n.v}</th>)}</tr></thead>
            <tbody>
              {COMPETENCES.map((c, i) => (
                <tr key={c}><td>{c}</td>{NIVEAUX_COMPETENCE.map((n) => <td key={n.v} className="c"><Case on={v[i] === n.v} /></td>)}</tr>
              ))}
              <tr><td>Autre : <Rep v={v.autre} /></td>{NIVEAUX_COMPETENCE.map((n) => <td key={n.v} className="c"><Case /></td>)}</tr>
            </tbody>
          </table>
        </div>
      )
    }
    case 'metiers': {
      const l = r[q.id] || []
      return (
        <div className="off-q">
          <p>{num}{q.label}</p>
          <table className="off-table">
            <thead><tr><th>N°</th><th>Métier ou fonction</th><th>Besoin actuel</th><th>Besoin prévisionnel</th><th>Niveau de qualification</th></tr></thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((i) => {
                const m = l[i] || {}
                return <tr key={i}><td className="c">{i + 1}</td><td><span className="off-rep">{m.metier}</span></td><td className="c"><Case on={m.actuel} /></td><td className="c"><Case on={m.prev} /></td><td><span className="off-rep">{m.niveau}</span></td></tr>
              })}
            </tbody>
          </table>
        </div>
      )
    }
    case 'filieres': {
      const v = r[q.id] || {}
      return (
        <div className="off-q">
          <p>{num}{q.label}</p>
          <table className="off-table">
            <thead><tr><th>Filière de l’ESTLC</th><th>Oui</th><th>Potentiellement</th><th>Non</th><th>Métiers ou fonctions concernés</th></tr></thead>
            <tbody>
              {FILIERES_ESTLC.map((f) => {
                const x = v[f.code] || {}
                return <tr key={f.code}><td>{f.nom}</td>{['Oui', 'Potentiellement', 'Non'].map((o) => <td key={o} className="c"><Case on={x.rep === o} /></td>)}<td><span className="off-rep">{x.metiers}</span></td></tr>
              })}
            </tbody>
          </table>
        </div>
      )
    }
    case 'postes':
      return <Postes postes={r.postes} />
    default: {
      if (q.id === 'q15') {
        return (
          <div className="off-q">
            <p>15. Coordonnées professionnelles, uniquement avec son accord :</p>
            <p className="off-ind">Téléphone : <Rep v={texte(q, r)} /><br />Adresse électronique : <Rep v={r.q15m} /></p>
          </div>
        )
      }
      if (q.id === 'q15m') return null
      return <div className="off-q"><p>{num}{q.label} :</p><p className="off-ind"><Rep v={texte(q, r)} /></p></div>
    }
  }
}

function Postes({ postes }) {
  const liste = postes?.length ? postes : [{}]
  return (
    <>
      <p className="off-consigne">Consigne : renseigner une ligne par poste distinct. Lorsque plusieurs postes différents sont proposés, reproduire le tableau autant de fois que nécessaire.</p>
      {liste.map((p, i) => (
        <table className="off-table off-poste" key={i}>
          <thead><tr><th style={{ width: '42%' }}>Informations à recueillir{liste.length > 1 ? ` — poste ${i + 1}` : ''}</th><th>Réponses</th></tr></thead>
          <tbody>
            {CHAMPS_POSTE.map((c) => (
              <tr key={c.id}>
                <td>{c.n}. {c.label}</td>
                <td>
                  {c.type === 'choice' || c.type === 'multi' ? (
                    <span className="off-inline">
                      {[...c.options, ...(c.autre ? ['Autre'] : [])].map((o) => (
                        <span key={o}><Case on={c.type === 'multi' ? (p[c.id] || []).includes(o) : p[c.id] === o} /> {o}{o === 'Autre' && p[c.id + '_autre'] ? ` : ${p[c.id + '_autre']}` : ''} </span>
                      ))}
                    </span>
                  ) : <span className="off-rep">{texte(c, p)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </>
  )
}

export default function FicheImprimable({ e }) {
  const r = e.reponses || depuisAncienne(e)
  const ent = (id) => texte(ENTETE.questions.find((q) => q.id === id), r)
  const appreciation = RUBRIQUES.find((x) => x.id === 'X').questions.find((q) => q.id === 'appreciation')
  return (
    <article className="off-fiche">
      <table className="off-page">
        <thead><tr><td><EnteteESTLC /></td></tr></thead>
        <tbody><tr><td>
          <h1 className="off-titre">ÉCOLE DE TERRAIN – DU 19 AU 25 OCTOBRE 2026</h1>
          <h2 className="off-soustitre">FICHE DÉTAILLÉE DE COLLECTE DES DONNÉES SUR LE MARCHÉ DE L’EMPLOI, LES BESOINS EN RECRUTEMENT ET LES PROFILS PROFESSIONNELS RECHERCHÉS</h2>
          <div className="off-champs">
            <p><b>Zone de collecte :</b> <Rep v={ent('zone')} /></p>
            <p><b>Date de l’enquête :</b> <Rep v={ent('date_enquete') || (e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '')} /></p>
            <p><b>Nom(s) et prénom(s) de l’enquêteur :</b> <Rep v={e.enqueteur_nom} /></p>
            <p><b>Niveau d’études : Niveau 4</b></p>
            <p><b>Filière :</b> <Rep v={FILIERES_ESTLC.find((f) => f.code === r.filiere_enqueteur)?.nom || r.filiere_enqueteur} /></p>
            <p><b>Équipe / Groupe :</b> <Rep v={ent('equipe')} /></p>
            {e.responsable_id && <p><i>Fiche renseignée directement par le responsable de la structure (questionnaire écrit en ligne).</i></p>}
          </div>
          <h3 className="off-rub">NOTE À L’ATTENTION DE L’ENQUÊTEUR</h3>
          <p className="off-note">{NOTE_ENQUETEUR}</p>

          {RUBRIQUES.map((rub) => (
            <section key={rub.id}>
              <h3 className="off-rub">RUBRIQUE {rub.id} – {rub.titre.toUpperCase()}</h3>
              {rub.aide && rub.id !== 'III' && <p className="off-consigne">{rub.aide}</p>}
              {rub.questions.filter((q) => q.id !== 'appreciation' && q.id !== 'justification').map((q, i) => <Question key={q.id || i} q={q} r={r} />)}
              {rub.id === 'X' && (
                <div className="off-q">
                  <p><b>Appréciation générale de la structure enquêtée</b><br />Au regard des informations recueillies, la structure apparaît comme :</p>
                  <Options q={appreciation} r={r} />
                  <p>Justification :</p><p className="off-ind"><Rep v={r.justification} /></p>
                </div>
              )}
            </section>
          ))}

          <section className="off-signatures">
            <p><b>Engagement de l’enquêteur</b><br />
              <Case on={r.engagement} /> Je certifie avoir renseigné la présente fiche à partir des informations effectivement recueillies et m’engage à signaler toute donnée non vérifiée, estimée ou indisponible.</p>
            <p>Nom et signature de l’étudiant : <span className="off-rep">{e.enqueteur_nom}</span></p>
            <p>Date : ……………………………………</p>
            <p>Nom et signature (éventuellement cachet) d’un Responsable de la Structure : ………………………………………</p>
            <p>Date : ……………………………………</p>
            <p className="off-merci"><b>Remerciements</b><br />L’ESTLC de l’Université d’Ebolowa à Ambam remercie la structure enquêtée pour sa disponibilité et sa contribution à une meilleure connaissance des besoins du marché de l’emploi et au renforcement de la professionnalisation des formations.</p>
          </section>
        </td></tr></tbody>
      </table>
    </article>
  )
}
