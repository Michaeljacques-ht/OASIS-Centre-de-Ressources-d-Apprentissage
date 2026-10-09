/**
 * OASIS Centre numérique d'apprentissage — Base de données JSON
 * Chaque collection est un fichier JSON dans /data avec écriture atomique.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function load(name) {
  const file = path.join(DATA_DIR, name + '.json');
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('Erreur lecture', name, e.message); return []; }
}

function save(name, data) {
  const file = path.join(DATA_DIR, name + '.json');
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file); // écriture atomique
}

function uid(prefix) {
  return prefix + '_' + crypto.randomBytes(6).toString('hex');
}

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(8).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  const [salt] = stored.split(':');
  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(password, salt)),
    Buffer.from(stored)
  );
}

/* ---------------------------------------------------------------- */
/* Données de démarrage (seed)                                       */
/* ---------------------------------------------------------------- */
function seed() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(path.join(DATA_DIR, 'users.json'))) return; // déjà initialisé

  console.log('⚙️  Initialisation de la base de données…');

  /* --- Utilisateurs de démonstration --- */
  const users = [
    { id: uid('usr'), nom: 'Administrateur OASIS', email: 'admin@oasis.ht', password: hashPassword('admin123'), role: 'admin', createdAt: Date.now() },
    { id: uid('usr'), nom: 'Marie Dorléus', email: 'enseignant@oasis.ht', password: hashPassword('prof123'), role: 'enseignant', createdAt: Date.now() },
    { id: uid('usr'), nom: 'Jean Baptiste', email: 'apprenant@oasis.ht', password: hashPassword('eleve123'), role: 'apprenant', createdAt: Date.now() }
  ];
  save('users', users);

  /* --- 18 catégories principales (maquette Catégories) --- */
  const categories = [
    ['edu-pedagogie', 'Éducation & Pédagogie', '🎓', 'Méthodes d’enseignement, pédagogie, didactique, évaluation…'],
    ['sciences-maths', 'Sciences & Mathématiques', '⚛️', 'Mathématiques, physique, chimie, biologie, géologie…'],
    ['langues', 'Langues', '🗣️', 'Français, Créole, Anglais, Espagnol, langues étrangères…'],
    ['litterature-arts', 'Littérature & Arts', '📖', 'Littérature, poésie, théâtre, arts visuels, musique…'],
    ['histoire-geo', 'Histoire & Géographie', '🌍', 'Histoire d’Haïti, histoire universelle, géographie, géopolitique…'],
    ['informatique', 'Informatique & Tech', '💻', 'Programmation, bureautique, réseaux, IA, cybersécurité, digital…'],
    ['dev-personnel', 'Développement personnel', '🌱', 'Confiance en soi, motivation, gestion du temps, leadership…'],
    ['business', 'Business & Entrepreneuriat', '💼', 'Gestion, entrepreneuriat, marketing, stratégie, innovation…'],
    ['compta-finance', 'Comptabilité & Finance', '🧮', 'Comptabilité, finance, fiscalité, audit, gestion financière…'],
    ['sciences-sociales', 'Sciences Sociales', '👥', 'Sociologie, psychologie, droit, économie, sciences politiques…'],
    ['sante', 'Santé & Bien-être', '❤️', 'Santé, nutrition, bien-être, hygiène mentale, premiers secours…'],
    ['agriculture', 'Agriculture & Environnement', '🌿', 'Agriculture, élevage, environnement, écologie, développement durable…'],
    ['techno-ingenierie', 'Technologie & Ingénierie', '⚙️', 'Génie civil, mécanique, électricité, électronique, innovation…'],
    ['arts-design', 'Arts & Design', '🎨', 'Design graphique, dessin, peinture, photographie, architecture…'],
    ['jeunesse', 'Jeunesse & Éducation', '🎒', 'Contes, documentaires, activités éducatives, orientation scolaire…'],
    ['religion', 'Religion & Spiritualité', '🙏', 'Religion, spiritualité, philosophie, valeurs, éthique…'],
    ['economie-publique', 'Économie & Gestion publique', '📊', 'Économie, politiques publiques, gestion de projets, statistiques…'],
    ['sports', 'Sports & Loisirs', '⚽', 'Sports, loisirs, jeux éducatifs, divertissement, activités…']
  ].map(([slug, nom, icone, description]) => ({ id: slug, nom, icone, description }));
  save('categories', categories);

  /* --- Ressources pédagogiques --- */
  const matieres = ['Mathématiques', 'Sciences Physiques', 'SVT', 'Français', 'Anglais', 'Histoire-Géo', 'Informatique', 'Économie & Gestion', 'Philosophie', 'Éducation Civique'];
  const niveaux = ['Primaire', 'Collège', 'Lycée'];
  const classes = { Primaire: ['CP', 'CE1', 'CM2'], Collège: ['6ème', '5ème', '4ème', '3ème'], Lycée: ['Seconde', 'Première', 'Terminale'] };

  const modeles = {
    fiche:        ['Fiche de synthèse : {t}', 'Résumé complet : {t}', 'Guide pratique : {t}'],
    exercice:     ['Exercices : {t}', 'TD corrigés : {t}', 'Devoirs : {t}'],
    support:      ['Cours complet : {t}', 'Module d’apprentissage : {t}'],
    presentation: ['Présentation PPTX : {t}', 'Diaporama de cours : {t}'],
    video:        ['{t} expliqué simplement', 'Comprendre {t} en vidéo', 'Tutoriel : {t}'],
    podcast:      ['Leçon audio : {t}', 'Révision audio : {t}'],
    document:     ['Document PDF : {t}', 'Annales corrigées : {t}'],
    outil:        null
  };

  const themes = {
    'Mathématiques': ['Les équations du 2nd degré', 'Les fonctions numériques', 'Les fractions', 'La dérivation', 'Les vecteurs', 'Les probabilités'],
    'Sciences Physiques': ['Les lois de Newton', 'Les réactions chimiques', 'L’électricité', 'L’optique', 'Le bilan énergétique'],
    'SVT': ['La cellule et ses composants', 'L’écosystème forestier', 'La structure de la Terre', 'La génétique', 'Le corps humain'],
    'Français': ['La conjugaison', 'La dissertation', 'Les figures de style', 'L’argumentation', 'La poésie haïtienne'],
    'Anglais': ['The Present Simple Tense', 'Compréhension écrite', 'Vocabulary essentials', 'Speaking basics'],
    'Histoire-Géo': ['La Première Guerre mondiale', 'L’Égypte antique', 'L’indépendance d’Haïti', 'La géographie d’Haïti', 'La révolution de 1804'],
    'Informatique': ['Introduction à l’algorithmique', 'Python pour débutants', 'Les boucles', 'La bureautique', 'La cybersécurité'],
    'Économie & Gestion': ['Le bilan comptable', 'Les bases de la comptabilité', 'La microéconomie', 'La gestion de projet'],
    'Philosophie': ['La conscience', 'La liberté', 'L’éthique', 'La justice'],
    'Éducation Civique': ['La Constitution haïtienne', 'Les droits de l’enfant', 'La citoyenneté', 'Les institutions']
  };

  // Niveaux plausibles par matière (les matières avancées restent au collège/lycée)
  const niveauxParMatiere = {
    'Philosophie': ['Lycée'], 'Économie & Gestion': ['Lycée'],
    'Sciences Physiques': ['Collège', 'Lycée'], 'SVT': ['Collège', 'Lycée'],
    'Anglais': ['Collège', 'Lycée'], 'Informatique': ['Collège', 'Lycée'],
    'Histoire-Géo': ['Collège', 'Lycée'],
    'Mathématiques': ['Collège', 'Lycée'], 'Français': ['Collège', 'Lycée'], 'Kreyòl ayisyen': ['Primaire', 'Collège']
  };

  const resources = [];
  let counter = 0;
  const types = ['fiche', 'exercice', 'support', 'presentation', 'video', 'podcast', 'document'];
  for (const matiere of matieres) {
    for (const theme of themes[matiere]) {
      const type = types[counter % types.length];
      const nivPossibles = niveauxParMatiere[matiere] || niveaux;
      const niveau = nivPossibles[counter % nivPossibles.length];
      const classe = classes[niveau][counter % classes[niveau].length];
      const tpl = modeles[type][counter % modeles[type].length];
      const prixHTG = counter % 5 === 0 ? 250 + (counter % 4) * 100 : 0;
      resources.push({
        id: uid('res'),
        titre: tpl.replace('{t}', theme),
        type, matiere, niveau, classe,
        categorie: matiere === 'Informatique' ? 'informatique'
          : matiere === 'Histoire-Géo' ? 'histoire-geo'
          : ['Français', 'Anglais'].includes(matiere) ? 'langues'
          : ['Économie & Gestion'].includes(matiere) ? 'compta-finance'
          : matiere === 'Philosophie' ? 'religion'
          : matiere === 'Éducation Civique' ? 'sciences-sociales'
          : 'sciences-maths',
        description: `Ressource pédagogique de qualité sur « ${theme} » — ${matiere}, niveau ${classe}.`,
        prixHTG,
        premium: prixHTG > 0,
        telechargements: 300 + Math.floor(Math.random() * 3000),
        note: +(4.4 + Math.random() * 0.5).toFixed(1),
        votes: 20 + Math.floor(Math.random() * 200),
        duree: type === 'video' ? (8 + Math.floor(Math.random() * 25)) + ' min' : null,
        auteurId: users[1].id,
        nouveau: counter % 9 === 0,
        createdAt: Date.now() - counter * 86400000
      });
      counter++;
    }
  }
  save('resources', resources);

  /* --- Outils & logiciels pédagogiques --- */
  const outils = [
    ['Microsoft Office 365', 'Bureautique & Productivité', 'Suite bureautique complète pour créer, collaborer et partager.', 'Freemium', 4.8],
    ['Google Workspace for Education', 'Bureautique & Productivité', 'Outils collaboratifs pour enseigner et apprendre efficacement.', 'Gratuit', 4.7],
    ['Canva Education', 'Création de contenu', 'Créez des visuels, présentations et infographies facilement.', 'Gratuit', 4.7],
    ['GeoGebra', 'Mathématiques & Sciences', 'Logiciel de mathématiques dynamique pour tous les niveaux.', 'Gratuit', 4.8],
    ['Kahoot!', 'Évaluation & Quiz', 'Créez des quiz et jeux pédagogiques interactifs pour vos élèves.', 'Freemium', 4.8],
    ['OBS Studio', 'Création de contenu', 'Enregistrez vos cours et créez des vidéos pédagogiques.', 'Gratuit', 4.6],
    ['Notion', 'Bureautique & Productivité', 'Organisez vos cours, ressources et projets pédagogiques.', 'Freemium', 4.7],
    ['Moodle', 'Gestion de classe', 'Plateforme e-learning pour gérer vos cours en ligne.', 'Gratuit', 4.5],
    ['Quizizz', 'Évaluation & Quiz', 'Créez des quiz interactifs et suivez les progrès des apprenants.', 'Freemium', 4.6],
    ['Desmos', 'Mathématiques & Sciences', 'Calculatrice graphique en ligne puissante et intuitive.', 'Gratuit', 4.7],
    ['Scratch', 'Programmation & Code', 'Initiez vos élèves à la programmation de façon ludique.', 'Gratuit', 4.8],
    ['Telegram', 'Langues & Communication', 'Communiquez et partagez des ressources avec vos classes.', 'Gratuit', 4.4]
  ].map(([nom, categorie, description, licence, note], i) => ({
    id: uid('out'), nom, categorie, description, licence, note,
    populaire: i % 3 === 0, nouveau: i % 4 === 2,
    telechargements: 500 + Math.floor(Math.random() * 5000)
  }));
  save('outils', outils);

  /* --- Quiz interactifs --- */
  const quizzes = [
    {
      id: uid('qz'), titre: 'Quiz : Les équations du 2nd degré', matiere: 'Mathématiques', niveau: 'Lycée',
      duree: 300, description: 'Testez vos connaissances sur les équations du second degré.',
      questions: [
        { q: 'Quelle est la forme générale d’une équation du 2nd degré ?', options: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx = 0', 'a/x + b = 0'], bonne: 1, explication: 'Une équation du second degré s’écrit ax² + bx + c = 0 avec a ≠ 0.' },
        { q: 'Comment appelle-t-on b² − 4ac ?', options: ['Le déterminant', 'Le discriminant', 'La dérivée', 'Le coefficient'], bonne: 1, explication: 'Le discriminant Δ = b² − 4ac détermine le nombre de solutions.' },
        { q: 'Si Δ < 0, combien de solutions réelles ?', options: ['Aucune', 'Une', 'Deux', 'Une infinité'], bonne: 0, explication: 'Si Δ < 0, l’équation n’admet aucune solution réelle.' },
        { q: 'Si Δ = 0, la solution unique est :', options: ['x = −b/a', 'x = −b/2a', 'x = b/2a', 'x = −c/a'], bonne: 1, explication: 'La solution double est x = −b/(2a).' },
        { q: 'La somme des racines vaut :', options: ['−b/a', 'c/a', 'b/a', '−c/a'], bonne: 0, explication: 'D’après les relations de Viète, x₁ + x₂ = −b/a.' }
      ]
    },
    {
      id: uid('qz'), titre: 'Quiz : Histoire d’Haïti — L’indépendance', matiere: 'Histoire-Géo', niveau: 'Collège',
      duree: 240, description: 'Révisez les grandes dates de l’indépendance d’Haïti.',
      questions: [
        { q: 'En quelle année Haïti a-t-elle proclamé son indépendance ?', options: ['1791', '1804', '1806', '1820'], bonne: 1, explication: 'L’indépendance d’Haïti a été proclamée le 1er janvier 1804 aux Gonaïves.' },
        { q: 'Qui a proclamé l’indépendance d’Haïti ?', options: ['Toussaint Louverture', 'Henri Christophe', 'Jean-Jacques Dessalines', 'Alexandre Pétion'], bonne: 2, explication: 'Jean-Jacques Dessalines a proclamé l’indépendance en 1804.' },
        { q: 'Quelle bataille décisive a eu lieu le 18 novembre 1803 ?', options: ['Bataille de Vertières', 'Bataille de la Crête-à-Pierrot', 'Bataille de Savannah', 'Bataille des Gonaïves'], bonne: 0, explication: 'La bataille de Vertières a scellé la victoire de l’armée indigène.' },
        { q: 'Dans quelle ville l’indépendance a-t-elle été proclamée ?', options: ['Port-au-Prince', 'Cap-Haïtien', 'Les Gonaïves', 'Jacmel'], bonne: 2, explication: 'La proclamation a eu lieu aux Gonaïves, la « Cité de l’Indépendance ».' }
      ]
    },
    {
      id: uid('qz'), titre: 'Quiz : Python pour débutants', matiere: 'Informatique', niveau: 'Lycée',
      duree: 300, description: 'Les bases du langage Python.',
      questions: [
        { q: 'Comment affiche-t-on du texte en Python ?', options: ['echo("Bonjour")', 'print("Bonjour")', 'console.log("Bonjour")', 'printf("Bonjour")'], bonne: 1, explication: 'La fonction print() affiche du texte à l’écran.' },
        { q: 'Quel symbole introduit un commentaire ?', options: ['//', '<!--', '#', '/*'], bonne: 2, explication: 'En Python, les commentaires commencent par #.' },
        { q: 'Quel type représente un nombre entier ?', options: ['float', 'str', 'int', 'bool'], bonne: 2, explication: 'int (integer) représente les nombres entiers.' },
        { q: 'Comment crée-t-on une boucle de 0 à 4 ?', options: ['for i in range(5):', 'for (i=0; i<5; i++)', 'loop i to 5', 'while i < 5 do'], bonne: 0, explication: 'range(5) génère les entiers 0, 1, 2, 3, 4.' },
        { q: 'Quelle structure stocke une liste ordonnée modifiable ?', options: ['tuple', 'list', 'set', 'dict'], bonne: 1, explication: 'Une list est ordonnée et modifiable : [1, 2, 3].' }
      ]
    },
    {
      id: uid('qz'), titre: 'Quiz : Le verbe TO BE en anglais', matiere: 'Anglais', niveau: 'Collège',
      duree: 180, description: 'Maîtrisez la conjugaison du verbe to be.',
      questions: [
        { q: 'I ___ a student.', options: ['is', 'are', 'am', 'be'], bonne: 2, explication: 'Avec « I », on utilise toujours « am ».' },
        { q: 'They ___ happy.', options: ['is', 'are', 'am', 'was'], bonne: 1, explication: 'Avec « they », on utilise « are » au présent.' },
        { q: 'She ___ my sister.', options: ['is', 'are', 'am', 'were'], bonne: 0, explication: 'Avec « she/he/it », on utilise « is ».' },
        { q: 'Forme négative de « He is tired » :', options: ['He no is tired', 'He isn’t tired', 'He aren’t tired', 'He not tired'], bonne: 1, explication: '« isn’t » = « is not ».' }
      ]
    }
  ];
  save('quizzes', quizzes);

  save('resultats', []);   // résultats de quiz
  save('favoris', []);     // favoris des utilisateurs
  save('sessions', []);    // sessions actives
  save('commandes', []);   // commandes de paiement PLOP PLOP
  save('achats', []);      // ressources payantes débloquées

  console.log(`✅ Base initialisée : ${users.length} utilisateurs, ${categories.length} catégories, ${resources.length} ressources, ${outils.length} outils, ${quizzes.length} quiz.`);
}

module.exports = { load, save, uid, hashPassword, verifyPassword, seed };
