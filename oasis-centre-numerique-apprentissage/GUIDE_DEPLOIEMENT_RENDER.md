# Guide de déploiement sur Render

Projet : OASIS Centre numérique d'apprentissage

Ce guide explique comment publier le projet OASIS sur Render à partir du fichier ZIP ou d'un dépôt GitHub.

## 1. Comprendre le projet

Le projet est une application Node.js simple :

- serveur principal : `server.js`
- fichiers publics : `public/`
- base de données JSON locale : `data/`
- commande de démarrage : `node server.js`
- aucune dépendance npm obligatoire

Le serveur utilise automatiquement la variable `PORT` fournie par Render :

```js
const PORT = process.env.PORT || 3000;
```

Cela signifie qu'il ne faut pas fixer manuellement le port à `3000` sur Render. Render attribue son propre port.

## 2. Préparer le projet avant l'envoi

### Option A - À partir du ZIP

1. Téléchargez le fichier `oasis-centre-numerique-apprentissage.zip`.
2. Extrayez le ZIP sur votre ordinateur.
3. Ouvrez le dossier extrait.
4. Vérifiez que le dossier contient directement :

```text
server.js
README.md
public/
lib/
```

Si ces fichiers sont dans un sous-dossier, entrez dans ce sous-dossier avant de créer le dépôt GitHub.

### Option B - À partir d'un dossier déjà prêt

Si vous travaillez déjà dans le dossier du projet, vérifiez simplement que `server.js` est à la racine.

## 3. Créer un dépôt GitHub

Render déploie normalement les projets depuis un dépôt Git.

1. Allez sur GitHub.
2. Créez un nouveau dépôt, par exemple :

```text
oasis-centre-numerique-apprentissage
```

3. Ajoutez les fichiers du projet dans ce dépôt.
4. Envoyez le projet sur GitHub.

Exemple avec Git :

```bash
git init
git add .
git commit -m "Déploiement initial OASIS"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/oasis-centre-numerique-apprentissage.git
git push -u origin main
```

## 4. Créer le service sur Render

1. Connectez-vous à Render.
2. Cliquez sur `New`.
3. Choisissez `Web Service`.
4. Connectez votre compte GitHub si ce n'est pas déjà fait.
5. Sélectionnez le dépôt du projet OASIS.

## 5. Configurer le Web Service

Utilisez les réglages suivants :

| Champ Render | Valeur recommandée |
|---|---|
| Name | `oasis-centre-numerique` |
| Region | Choisir la région la plus proche de vos utilisateurs |
| Branch | `main` |
| Runtime / Language | `Node` |
| Build Command | `echo "Aucune compilation requise"` |
| Start Command | `node server.js` |
| Instance Type | Free pour test, paid pour production |
| Health Check Path | `/` |

Si votre projet est dans un sous-dossier du dépôt, indiquez ce sous-dossier dans `Root Directory`.

Exemple :

```text
oasis-centre-numerique-apprentissage
```

## 6. Variables d'environnement

Pour ce projet, aucune variable obligatoire n'est nécessaire.

Vous pouvez ajouter :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `PLOP_CLIENT_ID` | identifiant marchand PLOP PLOP |
| `PLOP_CLIENT_SECRET` | secret marchand PLOP PLOP |
| `PLOP_HOTE` | `plopplop.solutionip.app` |

Ne créez pas manuellement une variable `PORT`, sauf besoin particulier. Render la fournit automatiquement.

Les variables `PLOP_CLIENT_ID` et `PLOP_CLIENT_SECRET` sont nécessaires pour activer les paiements réels des ressources premium. Ne les écrivez jamais directement dans le code.

## 7. Ajouter un disque persistant

Important : le projet utilise des fichiers JSON dans le dossier `data/` pour conserver les utilisateurs, ressources, quiz, favoris et résultats.

Sans disque persistant, les données créées sur Render peuvent être perdues lors d'un redémarrage ou d'un redéploiement.

Pour un site de production, ajoutez un disque persistant :

1. Dans Render, ouvrez le service OASIS.
2. Allez dans `Disks`.
3. Cliquez sur `Add Disk`.
4. Choisissez une taille minimale, par exemple `1 GB`.
5. Indiquez le chemin de montage suivant :

```text
/opt/render/project/src/data
```

Ce chemin correspond au dossier `data/` utilisé par le projet sur Render.

Attention : les disques persistants sont disponibles sur les services payants. Pour un simple test, le service gratuit peut fonctionner, mais il ne faut pas l'utiliser comme base de production.

## 8. Lancer le déploiement

1. Cliquez sur `Create Web Service`.
2. Render lance le build.
3. Attendez la fin du déploiement.
4. Une URL publique sera générée, par exemple :

```text
https://oasis-centre-numerique.onrender.com
```

## 9. Vérifier le site après déploiement

Ouvrez les routes suivantes :

```text
/
/ressources
/tableau-ressources
/ressources-pedagogiques-enseignant
/ressources-pedagogiques-eleves
/ressources-methodologiques-enseignant
/ressources-multimedias-enseignants
/cartes-geographiques
/banque-questions
/laboratoire
/quiz
/connexion
```

Vérifiez aussi les comptes de démonstration :

| Rôle | Courriel | Mot de passe |
|---|---|---|
| Administrateur | `admin@oasis.ht` | `admin123` |
| Enseignant | `enseignant@oasis.ht` | `prof123` |
| Apprenant | `apprenant@oasis.ht` | `eleve123` |

## 10. Tester les API principales

Dans le navigateur, ouvrez :

```text
https://VOTRE-SITE.onrender.com/api/stats
https://VOTRE-SITE.onrender.com/api/categories
https://VOTRE-SITE.onrender.com/api/ressources
https://VOTRE-SITE.onrender.com/api/quiz
https://VOTRE-SITE.onrender.com/api/paiement/methodes
```

Si ces URL affichent du JSON, le serveur fonctionne correctement.

## 11. Problèmes fréquents

### Le site affiche une erreur au démarrage

Vérifiez dans Render :

- `Start Command` doit être `node server.js`
- `server.js` doit être à la racine du projet ou dans le `Root Directory`
- le service doit être de type `Web Service`, pas `Static Site`

### Render dit qu'il ne trouve pas le port

Vérifiez que le code utilise bien :

```js
const PORT = process.env.PORT || 3000;
```

Le projet OASIS utilise déjà cette logique.

### Les données disparaissent après redéploiement

Ajoutez un disque persistant avec ce chemin :

```text
/opt/render/project/src/data
```

Sans ce disque, le dossier `data/` est temporaire sur Render.

### Les pages fonctionnent, mais la connexion ne garde pas la session

La session côté navigateur utilise `localStorage`. Si l'utilisateur change de navigateur ou d'appareil, il devra se reconnecter.

### Les images ne s'affichent pas

Vérifiez que les fichiers suivants existent :

```text
public/assets/oasis-banner.jpg
public/assets/oasis-logo.jpg
```

### Le paiement PLOP PLOP indique que la passerelle n'est pas configurée

Vérifiez les variables d'environnement du service Render :

```text
PLOP_CLIENT_ID
PLOP_CLIENT_SECRET
PLOP_HOTE
```

Après modification, redéployez le service. Pour un test local sans clés de production, gardez le site en mode consultation et évitez de valider une ressource premium.

## 12. Mise à jour du site

Pour publier une nouvelle version :

1. Modifiez les fichiers localement.
2. Faites un commit.
3. Envoyez vers GitHub :

```bash
git add .
git commit -m "Mise à jour OASIS"
git push
```

Render redéploiera automatiquement si l'option `Auto Deploy` est activée.

## 13. Recommandations pour la production

Pour un vrai lancement public :

- utiliser un service Render payant avec disque persistant ;
- ajouter un nom de domaine personnalisé ;
- remplacer les mots de passe de démonstration ;
- créer de vrais comptes administrateurs ;
- faire des sauvegardes régulières du dossier `data/` ;
- envisager une vraie base de données, comme PostgreSQL, si la plateforme accueille beaucoup d'utilisateurs.

## 14. Résumé des réglages Render

| Élément | Réglage final |
|---|---|
| Type de service | Web Service |
| Runtime | Node |
| Build Command | `echo "Aucune compilation requise"` |
| Start Command | `node server.js` |
| Health Check Path | `/` |
| Disque persistant | Oui pour production |
| Mount Path du disque | `/opt/render/project/src/data` |
| Paiement premium | `PLOP_CLIENT_ID`, `PLOP_CLIENT_SECRET`, `PLOP_HOTE` |
| Port | fourni automatiquement par Render |

Une fois ces étapes terminées, OASIS Centre numérique d'apprentissage sera accessible publiquement avec une adresse Render.
