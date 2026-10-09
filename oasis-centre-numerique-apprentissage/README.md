# OASIS Centre numérique d'apprentissage

Plateforme numérique pour organiser une bibliothèque de ressources pédagogiques: livres numériques, vidéos, fiches, guides, ressources apprenants, ressources enseignants, groupes et partage de ressources.

Le projet est construit en Node.js sans dépendance npm, avec une base JSON locale créée au premier lancement.

## Démarrage

```bash
node server.js
```

Puis ouvrir `http://localhost:3000`.

## Comptes de démonstration

| Rôle | Courriel | Mot de passe |
|---|---|---|
| Administrateur | admin@oasis.ht | admin123 |
| Enseignant | enseignant@oasis.ht | prof123 |
| Apprenant | apprenant@oasis.ht | eleve123 |

## Pages principales

| Page | Rôle |
|---|---|
| `/` | Accueil avec bannière OASIS et recherche |
| `/ressources` | Bibliothèque numérique |
| `/multimedia` | Vidéos, audios, animations, podcasts |
| `/ressources-multimedias-enseignants` | Bibliothèque multimédia côté enseignants |
| `/methodologie` | Guides et méthodes d’apprentissage |
| `/ressources-methodologiques-enseignant` | Ressources méthodologiques côté enseignant |
| `/pedagogie` | Ressources et pratiques d’enseignement |
| `/ressources-pedagogiques-enseignant` | Catalogue de ressources pédagogiques côté enseignant |
| `/ressources-pedagogiques-eleves` | Catalogue de ressources pédagogiques pour élèves |
| `/tableau-ressources` | Tableau de bord visuel des ressources numériques |
| `/cartes-geographiques` | Cartes géographiques pédagogiques |
| `/banque-questions` | Banque de questions enseignants |
| `/laboratoire` | Laboratoire virtuel et simulations scientifiques |
| `/simulations` | Simulations créées, utilisées ou partagées |
| `/experiences` | Expériences pédagogiques pratiques |
| `/nouveau-laboratoire` | Formulaire de création de laboratoire virtuel |
| `/outils-educatifs` | Outils numériques recommandés pour enseignants |
| `/ajouter-outil` | Formulaire de contribution d’un outil éducatif |
| `/dissertations` | Gestion des sujets de dissertations enseignants |
| `/nouvelle-dissertation` | Création d’un sujet de dissertation |
| `/exposes` | Gestion des exposés enseignants |
| `/travaux-pratiques` | Gestion des travaux pratiques enseignants |
| `/travaux-diriges` | Gestion des travaux dirigés enseignants |
| `/creer-travail-dirige` | Formulaire de création d’un travail dirigé |
| `/creer-quiz` | Constructeur de quiz et éditeur de questions |
| `/examens` | Gestion des examens enseignants |
| `/forum` | Forum des enseignants |
| `/partage` | Partage et réutilisation des ressources |
| `/groupes` | Espaces collaboratifs |
| `/dashboard` | Espace apprenant, enseignant ou administrateur |

## Structure

```text
educa-diffusion/
├── server.js
├── lib/db.js
├── public/
│   ├── assets/
│   │   ├── oasis-banner.jpg
│   │   └── oasis-logo.jpg
│   ├── css/styles.css
│   ├── js/app.js
│   └── *.html
└── data/  # créé automatiquement au premier lancement
```

## Déploiement

Sur Render ou un hébergement Node.js, utiliser `node server.js` comme commande de démarrage. Ajouter un disque persistant pour conserver le dossier `data` en production.

Pour le détail pas à pas, consultez `GUIDE_DEPLOIEMENT_RENDER.md`.

### Paiement PLOP PLOP

La passerelle PLOP PLOP est branchée pour les ressources premium. Ajouter ces variables d'environnement sur Render avant de tester un vrai paiement :

- `PLOP_CLIENT_ID`
- `PLOP_CLIENT_SECRET`
- `PLOP_HOTE` optionnel, par défaut `plopplop.solutionip.app`

Sans ces clés, le site reste fonctionnel, mais l'initialisation d'un paiement renvoie une erreur de configuration.
