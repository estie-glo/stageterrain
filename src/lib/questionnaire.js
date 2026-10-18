// Fiche officielle de l'école de terrain ESTLC (19 au 25 octobre 2026) :
// « Fiche détaillée de collecte des données sur le marché de l'emploi,
//   les besoins en recrutement et les profils professionnels recherchés ».
// Chaque question garde le numéro de la fiche papier.
//
// Types : text, textarea, number, tel, email, date, choice (une réponse),
// multi (plusieurs réponses), grille (compétences 1 à 4), metiers (tableau des 5 métiers),
// filieres (correspondance avec les filières ESTLC), postes (rubrique III, répétable).
// `autre: true` ajoute une case « Autre : … » avec un champ texte.
// `si: (r) => …` n'affiche la question que si la condition est vraie.
// `etudiant: true` : question réservée à l'étudiant (cachée au responsable d'entreprise).

export const FILIERES_ESTLC = [
  { code: 'MFT', nom: 'Marché Financier et Trading (MFT)' },
  { code: 'GCIM', nom: 'Génie Commercial et Intelligence Marketing (GCIM)' },
  { code: 'GDT', nom: 'Gestion des Transports (GDT)' },
  { code: 'GSI', nom: 'Génie Informatique des Systèmes Logistiques Intelligents (GSI)' },
  { code: 'GSA', nom: 'Génie Informatique des Systèmes Audiovisuels (GSA)' },
  { code: 'AMA', nom: 'Assemblage Mécatronique Automobile (AMA)' },
  { code: 'TCTL', nom: 'Technico-Commercial des Transports et de la Logistique (TCTL)' },
  { code: 'MLS', nom: 'Management Logistique et Supply Chain (MLS)' },
]

export const SECTEURS_OFFICIELS = [
  'Banque, finance et marchés financiers',
  'Commerce, distribution et marketing',
  'Transport routier',
  'Transport ferroviaire',
  'Transport maritime et portuaire',
  'Transport aérien et activités aéroportuaires',
  'Transit, douane et commerce international',
  'Logistique, entreposage et manutention',
  'Informatique et systèmes d’information',
  'Télécommunications et systèmes numériques',
  'Audiovisuel et multimédia',
  'Industrie, maintenance et mécatronique automobile',
  'Bâtiment, travaux publics et infrastructures',
  'Agriculture, agro-industrie et agroalimentaire',
  'Services aux entreprises',
  'Administration publique',
]

export const COMPETENCES = [
  'Analyse et traitement des données',
  'Gestion des opérations et des processus',
  'Utilisation des logiciels professionnels',
  'Gestion de projets',
  'Maîtrise des outils numériques',
  'Gestion commerciale et relation client',
  'Gestion financière et budgétaire',
  'Communication professionnelle',
  'Rédaction de rapports professionnels',
  'Respect des normes et procédures',
  'Maintenance et diagnostic technique',
  'Exploitation des systèmes informatiques',
  'Gestion des transports et de la logistique',
  'Commerce international et transit',
  'Analyse financière et gestion des risques',
]
export const NIVEAUX_COMPETENCE = [
  { v: '1', label: '1', titre: 'faible' },
  { v: '2', label: '2', titre: 'moyen' },
  { v: '3', label: '3', titre: 'important' },
  { v: '4', label: '4', titre: 'indispensable' },
  { v: 'NC', label: 'NC', titre: 'non concerné' },
]

const OUI_NON = ['Oui', 'Non']
const FREQ = ['Régulièrement', 'Occasionnellement', 'Rarement', 'Jamais']
const estOui = (v) => typeof v === 'string' && v.startsWith('Oui')

// Champs d'un poste (rubrique III) — une fiche par poste distinct
export const CHAMPS_POSTE = [
  { id: 'p29', n: 29, label: 'Intitulé exact du poste', type: 'text' },
  { id: 'p30', n: 30, label: 'Nombre de postes à pourvoir', type: 'number' },
  { id: 'p31', n: 31, label: 'Nature du besoin', type: 'choice', options: ['Poste vacant', 'Remplacement', 'Création de poste', 'Besoin prévisionnel'] },
  { id: 'p32', n: 32, label: 'Service ou département de rattachement', type: 'text' },
  { id: 'p33', n: 33, label: 'Principales missions du poste', type: 'textarea' },
  { id: 'p34', n: 34, label: 'Date de publication de l’offre, si applicable', type: 'date' },
  { id: 'p35', n: 35, label: 'Date limite de candidature, si applicable', type: 'date' },
  { id: 'p36', n: 36, label: 'Lieu d’affectation', type: 'text' },
  { id: 'p37', n: 37, label: 'Niveau de qualification exigé', type: 'text' },
  { id: 'p38', n: 38, label: 'Diplôme ou spécialité exigés', type: 'text' },
  { id: 'p39', n: 39, label: 'Expérience professionnelle exigée', type: 'text' },
  { id: 'p40', n: 40, label: 'Compétences techniques requises', type: 'textarea' },
  { id: 'p41', n: 41, label: 'Compétences numériques requises', type: 'textarea' },
  { id: 'p42', n: 42, label: 'Compétences comportementales attendues', type: 'textarea' },
  { id: 'p43', n: 43, label: 'Langues exigées', type: 'text' },
  { id: 'p44', n: 44, label: 'Type de contrat', type: 'choice', options: ['CDI', 'CDD', 'Stage', 'Apprentissage', 'Prestation'], autre: true },
  { id: 'p45', n: 45, label: 'Durée du contrat, le cas échéant', type: 'text' },
  { id: 'p46', n: 46, label: 'Rémunération ou fourchette salariale, si communicable', type: 'text' },
  { id: 'p47', n: 47, label: 'Avantages liés au poste, si communicables', type: 'text' },
  { id: 'p48', n: 48, label: 'Procédure de candidature', type: 'textarea' },
  { id: 'p49', n: 49, label: 'Canal de transmission des candidatures', type: 'text' },
  { id: 'p50', n: 50, label: 'Source de l’offre', type: 'choice', options: ['Site de l’entreprise', 'Plateforme d’emploi', 'Réseau professionnel', 'Cabinet'], autre: true },
  { id: 'p51', n: 51, label: 'Filière(s) ESTLC potentiellement concernée(s)', type: 'multi', options: FILIERES_ESTLC.map((f) => f.code) },
  { id: 'p52', n: 52, label: 'Observations complémentaires', type: 'textarea' },
  { id: 'p53', n: 53, label: 'Au moment de l’enquête, le poste est-il :', type: 'choice', options: ['Ouvert aux candidatures', 'En cours de sélection', 'Pourvu récemment', 'Suspendu', 'Annoncé pour une période ultérieure', 'Non vérifié'] },
  { id: 'p54', n: 54, label: 'L’offre est-elle accessible publiquement ?', type: 'choice', options: ['Oui', 'Non', 'Partiellement'] },
  { id: 'p55', n: 55, label: 'Si l’offre est publique, lien Internet ou référence permettant de la retrouver', type: 'text', si: (p) => p.p54 && p.p54 !== 'Non' },
  { id: 'p56', n: 56, label: 'Les candidatures spontanées sont-elles acceptées pour ce type de poste ?', type: 'choice', options: ['Oui', 'Non', 'Selon les postes'] },
]

// En-tête de la fiche (rempli par l'étudiant)
export const ENTETE = {
  id: 'entete',
  titre: 'En-tête de la fiche',
  court: 'En-tête',
  etudiant: true,
  questions: [
    { id: 'zone', label: 'Zone de collecte', type: 'text', ph: 'Ex. Ambam centre, Kye-Ossi…' },
    { id: 'date_enquete', label: 'Date de l’enquête', type: 'date' },
    { id: 'filiere_enqueteur', label: 'Filière de l’enquêteur', type: 'choice', options: FILIERES_ESTLC.map((f) => f.code), liste: true },
    { id: 'equipe', label: 'Équipe / Groupe', type: 'text' },
  ],
}

export const RUBRIQUES = [
  {
    id: 'I', titre: 'Identification de la structure enquêtée', court: 'I. Identification',
    questions: [
      { titre: '1.1. Informations générales' },
      { id: 'q1', n: 1, label: 'Dénomination officielle de la structure', type: 'text', requis: true },
      { id: 'q2', n: 2, label: 'Nom commercial, le cas échéant', type: 'text' },
      { id: 'q3', n: 3, label: 'Statut juridique', type: 'choice', autre: true, options: ['Entreprise privée', 'Entreprise publique', 'Société à capitaux mixtes', 'Administration publique', 'Établissement public', 'Organisation internationale', 'Organisation non gouvernementale / association', 'Cabinet de recrutement ou agence de placement', 'Organisation professionnelle'] },
      { id: 'q4', n: 4, label: 'Secteur principal d’activité', type: 'choice', autre: true, requis: true, liste: true, options: SECTEURS_OFFICIELS },
      { id: 'q5', n: 5, label: 'Domaine d’activité spécifique', type: 'text' },
      { id: 'q6', n: 6, label: 'Adresse du siège ou de l’établissement enquêté', type: 'text' },
      { id: 'q7', n: 7, label: 'Ville / Commune', type: 'text', defaut: 'Ambam' },
      { id: 'q8', n: 8, label: 'Région', type: 'text', defaut: 'Sud' },
      { id: 'q9', n: 9, label: 'Site Internet ou page professionnelle, si disponible', type: 'text' },
      { id: 'q10', n: 10, label: 'Effectif approximatif du personnel', type: 'choice', options: ['Moins de 10 salariés', 'De 10 à 49 salariés', 'De 50 à 99 salariés', 'De 100 à 249 salariés', '250 salariés et plus', 'Information non communiquée'] },
      { id: 'q11', n: 11, label: 'La structure dispose-t-elle de plusieurs établissements ?', type: 'choice', options: OUI_NON },
      { id: 'q11b', label: 'Si oui, préciser les principales localisations', type: 'text', si: (r) => r.q11 === 'Oui' },
      { titre: '1.2. Identification de l’interlocuteur' },
      { id: 'q12', n: 12, label: 'Nom et prénom, si la personne accepte de les communiquer', type: 'text' },
      { id: 'q13', n: 13, label: 'Fonction occupée', type: 'choice', autre: true, options: ['Directeur général / Directeur', 'Responsable des ressources humaines', 'Responsable du recrutement', 'Responsable administratif', 'Responsable technique ou opérationnel', 'Responsable d’exploitation / logistique', 'Responsable commercial', 'Responsable informatique', 'Responsable financier'] },
      { id: 'q14', n: 14, label: 'L’interlocuteur participe-t-il directement aux décisions de recrutement ?', type: 'choice', options: ['Oui, directement', 'Oui, indirectement', 'Non, mais il connaît les procédures de recrutement', 'Non'] },
      { id: 'q15', n: 15, label: 'Téléphone professionnel (uniquement avec son accord)', type: 'tel' },
      { id: 'q15m', label: 'Adresse électronique professionnelle (uniquement avec son accord)', type: 'email' },
    ],
  },
  {
    id: 'II', titre: 'Activité de la structure et évolution des besoins en personnel', court: 'II. Activité',
    questions: [
      { titre: '2.1. Présentation de l’activité' },
      { id: 'q16', n: 16, label: 'Quelles sont les principales activités exercées par la structure ?', type: 'textarea' },
      { id: 'q17', n: 17, label: 'Quels sont ses principaux produits, services ou prestations ?', type: 'textarea' },
      { id: 'q18', n: 18, label: 'Quelles sont les catégories de clients ou d’usagers desservis ?', type: 'textarea' },
      { id: 'q19', n: 19, label: 'Quelles évolutions récentes ont marqué l’activité de la structure ?', type: 'multi', autre: true, options: ['Expansion des activités', 'Création de nouveaux services', 'Modernisation des équipements', 'Transformation numérique', 'Développement de nouvelles implantations', 'Réorganisation interne', 'Réduction des activités', 'Stabilité de l’activité'] },
      { id: 'q20', n: 20, label: 'Ces évolutions ont-elles modifié les besoins en personnel ?', type: 'choice', options: ['Oui, à la hausse', 'Oui, à la baisse', 'Oui, en modifiant les profils recherchés', 'Non', 'Impossible à déterminer'] },
      { id: 'q21', n: 21, label: 'Quels métiers ou services connaissent actuellement les changements les plus importants ?', type: 'textarea' },
      { titre: '2.2. Dynamique de recrutement' },
      { id: 'q22', n: 22, label: 'La structure a-t-elle recruté du personnel au cours des douze derniers mois ?', type: 'choice', options: ['Oui', 'Non', 'Information non disponible'] },
      { id: 'q23', n: 23, label: 'Si oui, combien de personnes environ ont été recrutées ?', type: 'number', si: (r) => r.q22 === 'Oui' },
      { id: 'q24', n: 24, label: 'Quelles catégories de personnel ont principalement été recrutées ?', type: 'multi', autre: true, si: (r) => r.q22 === 'Oui', options: ['Cadres et responsables', 'Ingénieurs et cadres techniques', 'Techniciens supérieurs', 'Agents de maîtrise', 'Employés administratifs', 'Commerciaux', 'Opérateurs et agents d’exploitation', 'Personnel informatique et numérique'] },
      { id: 'q25', n: 25, label: 'La structure prévoit-elle des recrutements au cours des douze prochains mois ?', type: 'choice', options: ['Oui, des recrutements sont déjà programmés', 'Oui, des besoins sont probables', 'Aucun recrutement n’est actuellement prévu', 'La décision dépendra de l’évolution de l’activité', 'Information non communiquée'] },
      { id: 'q26', n: 26, label: 'Si des recrutements sont prévus, à quelle échéance ?', type: 'choice', si: (r) => estOui(r.q25), options: ['Dans les trois prochains mois', 'Dans les quatre à six prochains mois', 'Dans les sept à douze prochains mois', 'Au-delà de douze mois', 'Échéance non déterminée'] },
      { id: 'q27', n: 27, label: 'Quels facteurs déterminent principalement les besoins de recrutement ?', type: 'multi', autre: true, options: ['Développement des activités', 'Remplacement des départs', 'Départs à la retraite', 'Création de nouveaux postes', 'Digitalisation et automatisation', 'Évolution réglementaire', 'Nouveaux marchés ou nouveaux contrats', 'Insuffisance des compétences disponibles en interne'] },
      { id: 'q28', n: 28, label: 'Quels métiers devraient être les plus recherchés par votre structure à moyen terme ?', type: 'textarea' },
    ],
  },
  {
    id: 'III', titre: 'Recensement des offres d’emploi et des postes à pourvoir', court: 'III. Postes à pourvoir',
    aide: 'Une fiche par poste distinct (questions 29 à 56). Ajoutez autant de postes que nécessaire.',
    questions: [{ id: 'postes', type: 'postes' }],
  },
  {
    id: 'IV', titre: 'Identification des métiers et des profils recherchés', court: 'IV. Métiers et profils',
    questions: [
      { id: 'q57', n: 57, label: 'Quels sont les cinq principaux métiers ou fonctions pour lesquels votre structure recherche ou pourrait rechercher des compétences ?', type: 'metiers' },
      { id: 'q58', n: 58, label: 'Pour chacun de ces métiers, quelles formations ou spécialités sont privilégiées ?', type: 'textarea' },
      { id: 'q59', n: 59, label: 'Quels diplômes sont généralement exigés ?', type: 'multi', autre: true, options: ['Baccalauréat', 'BTS / DUT / diplôme équivalent', 'Licence', 'Licence professionnelle', 'Master', 'Diplôme d’ingénieur', 'Certification professionnelle', 'Expérience ou compétences pratiques prédominantes'] },
      { id: 'q60', n: 60, label: 'La spécialité de formation constitue-t-elle :', type: 'choice', options: ['Un critère indispensable', 'Un critère important, mais non exclusif', 'Un critère secondaire par rapport aux compétences', 'Un critère variable selon le poste'] },
      { id: 'q61', n: 61, label: 'Quelles sont les principales tâches confiées aux personnes recrutées dans ces métiers ?', type: 'textarea' },
      { id: 'q62', n: 62, label: 'Quels logiciels, outils, équipements ou technologies doivent-elles maîtriser ?', type: 'textarea' },
      { id: 'q63', n: 63, label: 'Une expérience professionnelle préalable est-elle indispensable ?', type: 'choice', options: ['Oui', 'Non', 'Souhaitée, mais non indispensable'] },
      { id: 'q64', n: 64, label: 'Si oui, quelle durée d’expérience est généralement exigée ?', type: 'text', si: (r) => r.q63 && r.q63 !== 'Non' },
      { id: 'q65', n: 65, label: 'La structure recrute-t-elle des diplômés sans expérience professionnelle ?', type: 'choice', options: FREQ },
      { id: 'q66', n: 66, label: 'Quels profils juniors pourraient être recrutés à la sortie de l’ESTLC ?', type: 'textarea' },
    ],
  },
  {
    id: 'V', titre: 'Compétences attendues et critères de sélection', court: 'V. Compétences',
    questions: [
      { titre: '5.1. Compétences techniques' },
      { id: 'q67', n: 67, label: 'Parmi les compétences suivantes, lesquelles sont les plus importantes pour les postes visés ? (1 = faible ; 2 = moyen ; 3 = important ; 4 = indispensable ; NC = non concerné)', type: 'grille' },
      { id: 'q68', n: 68, label: 'Quelles compétences techniques font le plus souvent défaut aux candidats ?', type: 'textarea' },
      { titre: '5.2. Compétences transversales et comportementales' },
      { id: 'q69', n: 69, label: 'Quelles qualités influencent le plus la décision de recrutement ?', type: 'multi', autre: true, options: ['Capacité d’analyse et de résolution de problèmes', 'Rigueur et sens de l’organisation', 'Travail en équipe', 'Autonomie et prise d’initiative', 'Adaptabilité', 'Communication orale et écrite', 'Sens du service et relation client', 'Leadership', 'Intégrité et respect de la déontologie', 'Gestion du stress', 'Capacité d’apprentissage', 'Ponctualité et respect des délais'] },
      { id: 'q70', n: 70, label: 'Quelles langues sont nécessaires pour les postes concernés ?', type: 'choice', autre: true, options: ['Français', 'Anglais', 'Français et anglais'] },
      { id: 'q71', n: 71, label: 'Quel niveau linguistique est attendu ?', type: 'text' },
      { id: 'q72', n: 72, label: 'Les compétences numériques constituent-elles un critère déterminant ?', type: 'choice', options: ['Oui, pour tous les postes', 'Oui, pour certains postes', 'Non, sauf cas particuliers'] },
      { id: 'q73', n: 73, label: 'Quels outils numériques ou logiciels spécialisés sont particulièrement demandés ?', type: 'textarea' },
      { titre: '5.3. Critères de recrutement' },
      { id: 'q74', n: 74, label: 'Quels sont les principaux critères de sélection des candidats ?', type: 'multi', autre: true, options: ['Diplôme', 'Expérience professionnelle', 'Stage antérieur', 'Maîtrise technique', 'Certification', 'Compétences numériques', 'Aptitudes relationnelles', 'Test pratique', 'Entretien', 'Références professionnelles'] },
      { id: 'q75', n: 75, label: 'Quelles sont les principales étapes de la procédure de recrutement ?', type: 'textarea' },
      { id: 'q76', n: 76, label: 'Quelles erreurs ou insuffisances observez-vous fréquemment dans les candidatures reçues ?', type: 'textarea' },
    ],
  },
  {
    id: 'VI', titre: 'Difficultés de recrutement et besoins non satisfaits', court: 'VI. Difficultés',
    questions: [
      { id: 'q77', n: 77, label: 'Votre structure rencontre-t-elle des difficultés à recruter certains profils ?', type: 'choice', options: ['Souvent', 'Parfois', 'Rarement', 'Jamais'] },
      { id: 'q78', n: 78, label: 'Si oui, quels métiers sont les plus difficiles à pourvoir ?', type: 'textarea', si: (r) => r.q77 && r.q77 !== 'Jamais' },
      { id: 'q79', n: 79, label: 'Quelles sont les principales causes de ces difficultés ?', type: 'multi', autre: true, si: (r) => r.q77 && r.q77 !== 'Jamais', options: ['Insuffisance de candidats qualifiés', 'Inadéquation entre formation et emploi', 'Manque d’expérience pratique', 'Insuffisance de compétences numériques', 'Faible maîtrise des langues', 'Prétentions salariales incompatibles avec les offres', 'Difficultés de localisation ou de mobilité', 'Méconnaissance des métiers par les candidats'] },
      { id: 'q80', n: 80, label: 'Quelles compétences devraient être davantage développées dans les formations supérieures ?', type: 'textarea' },
      { id: 'q81', n: 81, label: 'Quelles certifications complémentaires faciliteraient l’accès à l’emploi ?', type: 'textarea' },
      { id: 'q82', n: 82, label: 'Quels métiers émergents ou nouvelles fonctions pourraient offrir des débouchés aux diplômés dans les prochaines années ?', type: 'textarea' },
      { id: 'q83', n: 83, label: 'Quelles évolutions technologiques, économiques ou réglementaires modifieront probablement vos besoins en personnel ?', type: 'textarea' },
    ],
  },
  {
    id: 'VII', titre: 'Stages, alternance et première expérience professionnelle', court: 'VII. Stages',
    questions: [
      { id: 'q84', n: 84, label: 'Votre structure accueille-t-elle des stagiaires ?', type: 'choice', options: FREQ },
      { id: 'q85', n: 85, label: 'Quels types de stages propose-t-elle ?', type: 'multi', autre: true, si: (r) => r.q84 !== 'Jamais', options: ['Stage d’observation', 'Stage académique', 'Stage professionnel', 'Stage préemploi', 'Stage de fin de formation'] },
      { id: 'q86', n: 86, label: 'Quelles filières ou spécialités sont les plus susceptibles de bénéficier de ces stages ?', type: 'textarea', si: (r) => r.q84 !== 'Jamais' },
      { id: 'q87', n: 87, label: 'Combien de stagiaires la structure pourrait-elle éventuellement accueillir au cours des douze prochains mois ?', type: 'number', si: (r) => r.q84 !== 'Jamais' },
      { id: 'q88', n: 88, label: 'Quelles compétences ou tâches les stagiaires devraient-ils maîtriser avant leur arrivée ?', type: 'textarea', si: (r) => r.q84 !== 'Jamais' },
      { id: 'q89', n: 89, label: 'La structure envisage-t-elle des recrutements à l’issue des stages ?', type: 'choice', options: ['Oui, régulièrement', 'Oui, selon les besoins', 'Rarement', 'Non', 'Sans réponse déterminée'] },
      { id: 'q90', n: 90, label: 'Accepterait-elle de participer à des activités de professionnalisation de l’ESTLC ?', type: 'multi', autre: true, options: ['Visites d’entreprise', 'Conférences métiers', 'Ateliers de simulation d’entretien', 'Présentation des offres d’emploi', 'Interventions de professionnels', 'Accueil de stagiaires', 'Projets tutorés ou études de cas', 'Partenariats de formation'] },
      { id: 'q91', n: 91, label: 'Si oui, quel service ou responsable pourrait être contacté à cet effet ?', type: 'text', si: (r) => (r.q90 || []).length > 0 },
    ],
  },
  {
    id: 'VIII', titre: 'Correspondance entre les besoins des employeurs et les filières de l’ESTLC', court: 'VIII. Filières ESTLC',
    questions: [
      { id: 'q92', n: 92, label: 'Parmi les filières ci-dessous, lesquelles correspondent aux besoins de votre structure ?', type: 'filieres' },
      { id: 'q93', n: 93, label: 'Quels profils issus de ces filières pourraient être recrutés directement après leur formation ?', type: 'textarea' },
      { id: 'q94', n: 94, label: 'Quelles compétences spécifiques devraient être renforcées pour rendre ces diplômés plus compétitifs ?', type: 'textarea' },
      { id: 'q95', n: 95, label: 'Les programmes de formation devraient-ils intégrer davantage :', type: 'multi', autre: true, options: ['Des études de cas professionnels', 'Des travaux pratiques', 'Des outils numériques spécialisés', 'Des simulations de situations de travail', 'Des stages en entreprise', 'Des certifications professionnelles', 'Des enseignements en entrepreneuriat', 'Des cours de langues', 'Des projets conduits avec des entreprises'] },
      { id: 'q96', n: 96, label: 'Quelles recommandations adressez-vous à l’ESTLC pour améliorer l’employabilité de ses diplômés ?', type: 'textarea' },
    ],
  },
  {
    id: 'IX', titre: 'Sources d’information sur les offres d’emploi', court: 'IX. Sources',
    questions: [
      { id: 'q97', n: 97, label: 'Par quels canaux votre structure publie-t-elle ses offres d’emploi ?', type: 'multi', autre: true, options: ['Site Internet institutionnel', 'Plateformes spécialisées d’emploi', 'Réseaux sociaux professionnels', 'Réseaux sociaux généralistes', 'Cabinets de recrutement', 'Services publics de l’emploi', 'Établissements d’enseignement supérieur', 'Réseaux professionnels internes', 'Affichage ou presse écrite'] },
      { id: 'q98', n: 98, label: 'Quels sites ou plateformes recommandez-vous aux étudiants pour rechercher des emplois dans votre secteur ?', type: 'textarea' },
      { id: 'q99', n: 99, label: 'Existe-t-il une adresse électronique ou une plateforme officielle permettant de transmettre les candidatures spontanées ?', type: 'text' },
      { id: 'q100', n: 100, label: 'La structure accepte-t-elle de communiquer à l’ESTLC ses offres d’emploi ou de stage destinées aux profils correspondant à ses formations ?', type: 'choice', options: ['Oui', 'Oui, sous certaines conditions', 'Non', 'À examiner ultérieurement'] },
      { id: 'q101', n: 101, label: 'Si oui, selon quelle modalité ?', type: 'text', si: (r) => estOui(r.q100) },
    ],
  },
  {
    id: 'X', titre: 'Synthèse de l’enquête et observations de l’étudiant', court: 'X. Synthèse', etudiant: true,
    aide: 'À compléter après l’entretien, sur la base des informations effectivement recueillies.',
    questions: [
      { id: 'q102', n: 102, label: 'Nombre d’offres d’emploi actives identifiées', type: 'number' },
      { id: 'q103', n: 103, label: 'Nombre de postes à pourvoir recensés', type: 'number' },
      { id: 'q104', n: 104, label: 'Nombre de besoins prévisionnels de recrutement signalés', type: 'number' },
      { id: 'q105', n: 105, label: 'Principaux métiers identifiés', type: 'textarea' },
      { id: 'q106', n: 106, label: 'Profils et qualifications les plus recherchés', type: 'textarea' },
      { id: 'q107', n: 107, label: 'Compétences techniques les plus demandées', type: 'textarea' },
      { id: 'q108', n: 108, label: 'Compétences transversales les plus demandées', type: 'textarea' },
      { id: 'q109', n: 109, label: 'Principales difficultés de recrutement signalées', type: 'textarea' },
      { id: 'q110', n: 110, label: 'Filières de l’ESTLC présentant la meilleure correspondance avec les besoins exprimés', type: 'textarea' },
      { id: 'q111', n: 111, label: 'Possibilités de stage, de partenariat ou de recrutement identifiées', type: 'textarea' },
      { id: 'q112', n: 112, label: 'Sources permettant de vérifier les offres ou les informations recueillies', type: 'textarea' },
      { id: 'q113', n: 113, label: 'Observations complémentaires de l’enquêteur', type: 'textarea' },
      { id: 'appreciation', label: 'Appréciation générale : au regard des informations recueillies, la structure apparaît comme :', type: 'multi', options: ['Un recruteur potentiel à court terme', 'Un recruteur potentiel à moyen terme', 'Un employeur présentant des besoins récurrents', 'Une structure susceptible d’accueillir des stagiaires', 'Un partenaire potentiel pour la professionnalisation des formations', 'Une source d’information sur les métiers et les offres d’emploi', 'Une structure sans besoin identifié au moment de l’enquête'] },
      { id: 'justification', label: 'Justification', type: 'textarea' },
    ],
  },
  {
    id: 'XI', titre: 'Validation et traçabilité des données', court: 'XI. Validation',
    questions: [
      { id: 'q114', n: 114, label: 'Mode de collecte', type: 'choice', autre: true, etudiant: true, options: ['Entretien direct', 'Entretien téléphonique', 'Questionnaire écrit', 'Consultation d’une offre publique', 'Consultation d’un site institutionnel'] },
      { id: 'q115', n: 115, label: 'Statut des informations', type: 'choice', etudiant: true, options: ['Déclarées par un responsable de la structure', 'Issues d’une offre d’emploi publiée', 'Issues d’une source institutionnelle vérifiable', 'À vérifier', 'Partiellement confirmées'] },
      { id: 'q116', n: 116, label: 'Date de la dernière vérification de l’offre, le cas échéant', type: 'date', etudiant: true },
      { id: 'q117', n: 117, label: 'L’interlocuteur autorise-t-il une prise de contact ultérieure à des fins strictement pédagogiques ?', type: 'choice', options: OUI_NON },
      { id: 'q118', n: 118, label: 'La structure accepte-t-elle que ses coordonnées professionnelles soient utilisées pour un suivi institutionnel de l’enquête ?', type: 'choice', options: OUI_NON },
      { id: 'engagement', label: 'Je certifie avoir renseigné la présente fiche à partir des informations effectivement recueillies et m’engage à signaler toute donnée non vérifiée, estimée ou indisponible.', type: 'certif', etudiant: true },
    ],
  },
]

// Étapes du formulaire selon la personne qui remplit
export function etapesPour(mode) {
  if (mode === 'responsable') return RUBRIQUES.filter((r) => !r.etudiant)
  return [ENTETE, ...RUBRIQUES]
}

export function questionsVisibles(rubrique, r, mode) {
  return rubrique.questions.filter((q) => !(mode === 'responsable' && q.etudiant) && (!q.si || q.si(r)))
}

// Toutes les questions « simples » (une valeur par question), dans l'ordre de la fiche
export function toutesQuestions() {
  return [ENTETE, ...RUBRIQUES].flatMap((rub) => rub.questions.filter((q) => q.id).map((q) => ({ ...q, rubrique: rub.id })))
}

export const NOTE_ENQUETEUR =
  "La présente fiche vise à recueillir des informations précises sur les besoins actuels et prévisionnels en personnel des entreprises et organisations, " +
  'les emplois disponibles, les profils recherchés, les compétences exigées, les modalités de recrutement et les perspectives de collaboration avec l’ESTLC. ' +
  "L'enquêteur est tenu de se présenter, d'expliquer brièvement l'objectif pédagogique de l'étude, de solliciter l'accord de son interlocuteur et de renseigner la fiche avec exactitude. " +
  "Les informations doivent être recueillies auprès d'une personne suffisamment informée (responsable des ressources humaines, dirigeant, responsable opérationnel ou gestionnaire des offres d'emploi). " +
  'Les réponses doivent distinguer les postes effectivement ouverts, les recrutements en cours, les besoins prévisionnels et les métiers pour lesquels la structure éprouve des difficultés à trouver des candidats qualifiés. ' +
  "Une absence de recrutement au moment de l'enquête ne signifie pas nécessairement une absence de besoins futurs."
