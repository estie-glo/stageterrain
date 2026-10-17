import writeExcelFile from 'write-excel-file/browser'
import { BESOINS, INTERETS, labelOf } from './constants'

const COLONNES = [
  ['Date', (r) => (r.created_at ? new Date(r.created_at) : null), 14],
  ['Entreprise', (r) => r.entreprise_nom, 28],
  ['Secteur', (r) => r.secteur, 24],
  ['Ville', (r) => r.ville, 14],
  ['Quartier', (r) => r.quartier, 16],
  ['Personne rencontrée', (r) => r.contact_nom, 22],
  ['Fonction', (r) => r.contact_poste, 18],
  ['Téléphone', (r) => r.contact_tel, 16],
  ['Besoin de stagiaires', (r) => labelOf(BESOINS, r.besoin_stagiaires), 12],
  ['Filières recherchées', (r) => (r.filieres || []).join(', '), 36],
  ['Nombre', (r) => r.nombre_stagiaires ?? null, 9],
  ['Période', (r) => r.periode, 18],
  ['Services proposés', (r) => (r.services_proposes || []).join(' ; '), 44],
  ['Intérêt', (r) => labelOf(INTERETS, r.interet), 14],
  ['Notes', (r) => r.notes, 40],
  ['Enquêteur', (r) => r.enqueteur_nom, 20],
  ['Remplie par', (r) => (r.responsable_id ? "L'entreprise" : "L'étudiant"), 14],
]

export async function exporterExcel(rows) {
  const entete = COLONNES.map(([h]) => ({ value: h, fontWeight: 'bold', backgroundColor: '#DCEBE6' }))
  const lignes = rows.map((r) =>
    COLONNES.map(([, get]) => {
      const v = get(r)
      if (v instanceof Date) return { value: v, type: Date, format: 'dd/mm/yyyy' }
      return { value: v === '' || v === undefined ? null : v }
    })
  )
  const jour = new Date().toISOString().slice(0, 10)
  await writeExcelFile([entete, ...lignes], {
    columns: COLONNES.map(([, , width]) => ({ width })),
    stickyRowsCount: 1,
  }).toFile(`StageTerrain_entretiens_${jour}.xlsx`)
}
