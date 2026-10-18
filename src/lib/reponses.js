// Outils autour des réponses de la fiche officielle :
// mise en texte (affichage, export), colonnes de synthèse, anciennes fiches.
import { CHAMPS_POSTE, COMPETENCES, FILIERES_ESTLC, NIVEAUX_COMPETENCE } from './questionnaire'

export const vide = (v) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(vide))

// Valeur d'une question, avec son « Autre : … » éventuel
export function texte(q, r) {
  const v = r?.[q.id]
  const autre = (r?.[q.id + '_autre'] || '').trim()
  switch (q.type) {
    case 'multi': {
      const l = [...(v || []).filter((x) => x !== 'Autre')]
      if (autre) l.push('Autre : ' + autre)
      return l.join(' ; ')
    }
    case 'choice':
      if (v === 'Autre') return autre ? 'Autre : ' + autre : 'Autre'
      return v || ''
    case 'tel':
      return v ? `${r[q.id + '_ind'] || '+237'} ${String(v).replace(/\D/g, '')}` : ''
    case 'date':
      return v ? new Date(v + 'T12:00').toLocaleDateString('fr-FR') : ''
    case 'certif':
      return v ? 'Oui' : ''
    case 'grille':
      return COMPETENCES.map((c, i) => (v?.[i] ? `${c} : ${niveau(v[i])}` : null)).filter(Boolean).join(' ; ')
    case 'metiers':
      return (v || []).filter((m) => m?.metier).map((m) => ligneMetier(m)).join(' ; ')
    case 'filieres':
      return FILIERES_ESTLC.map((f) => (v?.[f.code]?.rep ? `${f.code} : ${v[f.code].rep}${v[f.code].metiers ? ` (${v[f.code].metiers})` : ''}` : null)).filter(Boolean).join(' ; ')
    case 'postes':
      return (v || []).map((p) => p.p29).filter(Boolean).join(' ; ')
    default:
      return v === undefined || v === null ? '' : String(v)
  }
}

export const niveau = (x) => {
  const n = NIVEAUX_COMPETENCE.find((k) => k.v === x)
  return n ? (n.v === 'NC' ? 'non concerné' : `${n.v} (${n.titre})`) : x
}

export const ligneMetier = (m) =>
  [m.metier, m.actuel ? 'besoin actuel' : null, m.prev ? 'besoin prévisionnel' : null, m.niveau ? `niveau : ${m.niveau}` : null].filter(Boolean).join(' — ')

export const textePoste = (champ, p) => texte(champ, p)

export function nbPostes(r) {
  return (r?.postes || []).reduce((s, p) => s + (Number(p.p30) || (p.p29 ? 1 : 0)), 0)
}

// Colonnes de synthèse gardées dans la table (liste, filtres, statistiques, compteur sur 100)
export function deriver(r) {
  const secteur = r.q4 === 'Autre' ? (r.q4_autre || '').trim() || 'Autre' : r.q4
  const stage = { Régulièrement: 'oui', Occasionnellement: 'oui', Rarement: 'peut_etre' }[r.q84] || 'non'
  const filieres = FILIERES_ESTLC.filter((f) => ['Oui', 'Potentiellement'].includes(r.q92?.[f.code]?.rep)).map((f) => f.code)
  const nb = parseInt(r.q87, 10)
  const appr = r.appreciation || []
  let interet = 'a_rappeler'
  if (appr.length) interet = appr.every((a) => a.startsWith('Une structure sans besoin')) ? 'pas_interesse' : 'interesse'
  else if ((r.q25 || '').startsWith('Oui') || nbPostes(r) > 0 || stage === 'oui') interet = 'interesse'
  else if ((r.q25 || '').startsWith('Aucun') && r.q84 === 'Jamais') interet = 'pas_interesse'
  const fonction = r.q13 === 'Autre' ? r.q13_autre : r.q13
  return {
    entreprise_nom: (r.q1 || r.q2 || '').trim(),
    secteur: secteur || 'Autre',
    ville: (r.q7 || '').trim() || null,
    quartier: (r.q6 || '').trim() || null,
    contact_nom: (r.q12 || '').trim() || null,
    contact_poste: (fonction || '').trim() || null,
    contact_tel: r.q15 ? `${r.q15_ind || '+237'} ${String(r.q15).replace(/\D/g, '')}` : null,
    besoin_stagiaires: stage,
    filieres,
    nombre_stagiaires: Number.isFinite(nb) ? Math.min(Math.max(nb, 0), 500) : null,
    periode: null,
    services_proposes: (r.q90 || []).filter((x) => x !== 'Autre'),
    interet,
    notes: (r.q113 || '').trim() || null,
  }
}

// Une fiche créée avant la fiche officielle : on reprend ce qui correspond
export function depuisAncienne(e) {
  const tel = (e.contact_tel || '').trim()
  const m = tel.match(/^(\+\d+)\s*(.*)$/)
  return {
    q1: e.entreprise_nom || '',
    q4: 'Autre',
    q4_autre: e.secteur || '',
    q6: e.quartier || '',
    q7: e.ville || '',
    q12: e.contact_nom || '',
    q13: e.contact_poste ? 'Autre' : undefined,
    q13_autre: e.contact_poste || '',
    q15: m ? m[2] : tel,
    q15_ind: m ? m[1] : '+237',
    q113: e.notes || '',
  }
}

export { CHAMPS_POSTE }
