import writeExcelFile from 'write-excel-file/browser'
import { CHAMPS_POSTE, COMPETENCES, FILIERES_ESTLC, toutesQuestions } from './questionnaire'
import { depuisAncienne, ligneMetier, nbPostes, niveau, texte } from './reponses'

// Export Excel de la fiche officielle :
//  - feuille « Fiches » : une ligne par structure, une colonne par question (numéros de la fiche papier)
//  - feuille « Postes » : une ligne par poste recensé (rubrique III, questions 29 à 56)

const rep = (e) => e.reponses || depuisAncienne(e)
const court = (t, n = 60) => (t.length > n ? t.slice(0, n - 1) + '…' : t)

function colonnesFiches() {
  const cols = [
    ['Date', (e) => (e.created_at ? new Date(e.created_at) : null), 12],
    ['Enquêteur', (e) => e.enqueteur_nom, 20],
    ['Remplie par', (e) => (e.responsable_id ? 'La structure' : "L'étudiant"), 12],
  ]
  for (const q of toutesQuestions()) {
    const titre = (q.n ? q.n + '. ' : '') + court(q.label || '')
    if (q.type === 'postes') {
      cols.push(['Rubrique III — nombre de postes recensés', (e) => nbPostes(rep(e)), 14])
      cols.push(['Rubrique III — intitulés des postes', (e) => texte(q, rep(e)), 36])
    } else if (q.type === 'grille') {
      COMPETENCES.forEach((c, i) => cols.push([`67. ${c}`, (e) => (rep(e).q67?.[i] ? niveau(rep(e).q67[i]) : null), 16]))
      cols.push(['67. Autre compétence', (e) => rep(e).q67?.autre, 20])
    } else if (q.type === 'metiers') {
      ;[0, 1, 2, 3, 4].forEach((i) => cols.push([`57. Métier ${i + 1}`, (e) => (rep(e).q57?.[i]?.metier ? ligneMetier(rep(e).q57[i]) : null), 30]))
    } else if (q.type === 'filieres') {
      FILIERES_ESTLC.forEach((f) => cols.push([`92. ${f.code}`, (e) => {
        const x = rep(e).q92?.[f.code]
        return x?.rep ? x.rep + (x.metiers ? ` (${x.metiers})` : '') : null
      }, 18]))
    } else {
      cols.push([titre, (e) => texte(q, rep(e)), q.type === 'textarea' ? 40 : 24])
    }
  }
  return cols
}

function feuille(cols, lignes) {
  const entete = cols.map(([h]) => ({ value: h, fontWeight: 'bold', backgroundColor: '#DCEBE6', wrap: true }))
  const data = lignes.map((l) =>
    cols.map(([, get]) => {
      const v = get(l)
      if (v instanceof Date) return { value: v, type: Date, format: 'dd/mm/yyyy' }
      return { value: v === '' || v === undefined ? null : v }
    })
  )
  return { data: [entete, ...data], columns: cols.map(([, , width]) => ({ width })), stickyRowsCount: 1 }
}

export async function exporterExcel(rows) {
  const fiches = colonnesFiches()
  const postes = rows.flatMap((e) => (rep(e).postes || []).map((p, i) => ({ e, p, i })))
  const colPostes = [
    ['Structure', ({ e }) => e.entreprise_nom, 26],
    ['Enquêteur', ({ e }) => e.enqueteur_nom, 20],
    ['Poste n°', ({ i }) => i + 1, 8],
    ...CHAMPS_POSTE.map((c) => [`${c.n}. ${court(c.label, 50)}`, ({ p }) => texte(c, p), c.type === 'textarea' ? 36 : 20]),
  ]
  const jour = new Date().toISOString().slice(0, 10)
  await writeExcelFile([
    { ...feuille(fiches, rows), sheet: 'Fiches' },
    { ...feuille(colPostes, postes), sheet: 'Postes' },
  ]).toFile(`StageTerrain_fiches_${jour}.xlsx`)
}
