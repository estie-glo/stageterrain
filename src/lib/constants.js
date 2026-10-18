// Listes utilisées dans le formulaire. Modifiez-les librement pour coller
// au questionnaire validé par l'encadreur.

export const OBJECTIF = 100

export const SECTEURS = [
  'Commerce / boutique',
  'Bayam-sellam / marché',
  'Restauration / hôtellerie',
  'Transport / logistique',
  'Santé / pharmacie',
  'Éducation / école',
  'BTP / quincaillerie',
  'Agriculture / élevage',
  'Banque / microfinance',
  'Télécoms / services numériques',
  'Artisanat / couture / coiffure',
  'Administration / ONG',
  'Autre',
]

export const FILIERES = [
  'Génie informatique (GSI)',
  'Logistique et transport',
  'Commerce / marketing',
  'Comptabilité / gestion',
  'Douane / transit',
  'Ressources humaines',
  'Communication',
  'Autre',
]

export const PERIODES = [
  'Dès que possible',
  'Janvier – mars',
  'Avril – juin',
  'Juillet – septembre',
  'Octobre – décembre',
  'Pas encore défini',
]

export const BESOINS = [
  { value: 'oui', label: 'Oui' },
  { value: 'peut_etre', label: 'Peut-être' },
  { value: 'non', label: 'Non' },
]

export const INTERETS = [
  { value: 'interesse', label: 'Besoins identifiés', tone: 'good' },
  { value: 'a_rappeler', label: 'À recontacter', tone: 'warn' },
  { value: 'pas_interesse', label: 'Sans besoin', tone: 'muted' },
]

// Services qu'un stagiaire peut proposer, selon le secteur de l'entreprise.
const COMMUNS = ['Page Facebook / WhatsApp Business professionnelle', 'Gestion des stocks sur tableur']

export const SUGGESTIONS = {
  'Commerce / boutique': ['Boutique en ligne / catalogue WhatsApp', 'Logiciel de caisse et de stock', 'Campagne de promotion sur les réseaux'],
  'Bayam-sellam / marché': ['Application pour publier et vendre ses articles', 'Catalogue photo partagé sur WhatsApp', 'Carnet de ventes et dettes sur téléphone'],
  'Restauration / hôtellerie': ['Menu en ligne et commandes WhatsApp', 'Système de réservation', 'Fiche Google Maps de l’établissement'],
  'Transport / logistique': ['Suivi des colis et des livraisons', 'Planification des tournées', 'Gestion de flotte et du carburant'],
  'Santé / pharmacie': ['Gestion du stock de médicaments', 'Prise de rendez-vous en ligne', 'Dossier patient numérique simple'],
  'Éducation / école': ['Gestion des notes et bulletins', 'Suivi des paiements de scolarité', 'Site web de l’établissement'],
  'BTP / quincaillerie': ['Devis et factures automatisés', 'Gestion du stock de matériaux', 'Suivi de chantier'],
  'Agriculture / élevage': ['Mise en relation avec acheteurs', 'Suivi de production et des ventes', 'Gestion des intrants'],
  'Banque / microfinance': ['Tableau de bord des remboursements', 'Assistance service client', 'Digitalisation des dossiers'],
  'Télécoms / services numériques': ['Développement d’applications', 'Support technique', 'Marketing digital'],
  'Artisanat / couture / coiffure': ['Portfolio photo en ligne', 'Prise de rendez-vous', 'Suivi des commandes clients'],
  'Administration / ONG': ['Site web et communication', 'Archivage numérique', 'Gestion des bénéficiaires'],
  Autre: [],
}

export function suggestionsFor(secteur) {
  return [...(SUGGESTIONS[secteur] || []), ...COMMUNS]
}

// Indicatifs téléphoniques proposés dans le formulaire (Cameroun par défaut)
export const PAYS = [
  { code: '+237', drapeau: '🇨🇲', nom: 'Cameroun', chiffres: 9, exemple: '6 77 12 34 56' },
  { code: '+241', drapeau: '🇬🇦', nom: 'Gabon', chiffres: 8, exemple: '06 12 34 56' },
  { code: '+240', drapeau: '🇬🇶', nom: 'Guinée équatoriale', chiffres: 9, exemple: '222 12 34 56' },
  { code: '+242', drapeau: '🇨🇬', nom: 'Congo', chiffres: 9, exemple: '06 123 45 67' },
  { code: '+235', drapeau: '🇹🇩', nom: 'Tchad', chiffres: 8, exemple: '66 12 34 56' },
  { code: '+236', drapeau: '🇨🇫', nom: 'Centrafrique', chiffres: 8, exemple: '70 12 34 56' },
  { code: '+234', drapeau: '🇳🇬', nom: 'Nigeria', chiffres: 10, exemple: '803 123 4567' },
  { code: '+33', drapeau: '🇫🇷', nom: 'France', chiffres: 9, exemple: '6 12 34 56 78' },
]

export const labelOf = (list, value) => list.find((x) => x.value === value)?.label || value || '—'
