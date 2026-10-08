/**
 * OASIS Centre numérique d'apprentissage — Serveur Node.js
 * Démarrage : node server.js  →  http://localhost:3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./lib/db');
const PP = require('./lib/plopplop');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

db.seed();

/* ---------------------------------------------------------------- */
/* Utilitaires HTTP                                                  */
/* ---------------------------------------------------------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json'
};

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('JSON invalide')); } });
  });
}

/* --- Sessions par jeton --- */
function createSession(userId) {
  const sessions = db.load('sessions');
  const token = crypto.randomBytes(24).toString('hex');
  sessions.push({ token, userId, createdAt: Date.now() });
  db.save('sessions', sessions.slice(-500)); // limite mémoire
  return token;
}

function getUser(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  const session = db.load('sessions').find(s => s.token === token);
  if (!session) return null;
  const user = db.load('users').find(u => u.id === session.userId);
  return user ? { id: user.id, nom: user.nom, email: user.email, role: user.role } : null;
}

function prixRessource(r) {
  const prix = Number(r.prixHTG ?? r.prix ?? 0);
  return Number.isFinite(prix) ? Math.max(0, Math.round(prix)) : 0;
}

function aAccesRessource(user, r, achats = db.load('achats')) {
  const prix = prixRessource(r);
  if (prix <= 0) return true;
  if (user && ['admin', 'enseignant'].includes(user.role)) return true;
  return !!(user && achats.some(a => a.userId === user.id && a.ressourceId === r.id));
}

function enrichirRessource(r, user, achats = db.load('achats')) {
  const prix = prixRessource(r);
  return {
    ...r,
    prixHTG: prix,
    premium: prix > 0,
    accesAutorise: aAccesRessource(user, r, achats)
  };
}

function finaliserCommande(commande, commandes, methode, infos) {
  if (!commande || commande.status === 'payee') return commande;
  commande.status = 'payee';
  commande.method = methode || commande.method || null;
  commande.transactionId = (infos && infos.transactionId) || commande.transactionId || null;
  commande.dateTransaction = infos && infos.dateTransaction ? infos.dateTransaction : null;
  commande.paidAt = Date.now();
  db.save('commandes', commandes);

  const achats = db.load('achats');
  if (!achats.some(a => a.userId === commande.userId && a.ressourceId === commande.ressourceId)) {
    achats.push({
      id: db.uid('ach'),
      userId: commande.userId,
      ressourceId: commande.ressourceId,
      commandeId: commande.id,
      montant: commande.amount,
      method: commande.method,
      transactionId: commande.transactionId,
      createdAt: Date.now()
    });
    db.save('achats', achats);
  }
  return commande;
}

/* ---------------------------------------------------------------- */
/* Routes API                                                        */
/* ---------------------------------------------------------------- */
const routes = {

  /* --- Authentification --- */
  'POST /api/auth/inscription': async (req, res) => {
    const { nom, email, password } = await readBody(req);
    if (!nom || !email || !password || password.length < 6)
      return json(res, 400, { erreur: 'Nom, courriel et mot de passe (6 caractères min.) requis.' });
    const users = db.load('users');
    if (users.find(u => u.email === email.toLowerCase()))
      return json(res, 409, { erreur: 'Ce courriel est déjà utilisé.' });
    const user = { id: db.uid('usr'), nom, email: email.toLowerCase(), password: db.hashPassword(password), role: 'apprenant', createdAt: Date.now() };
    users.push(user);
    db.save('users', users);
    const token = createSession(user.id);
    json(res, 201, { token, user: { id: user.id, nom, email: user.email, role: user.role } });
  },

  'POST /api/auth/connexion': async (req, res) => {
    const { email, password } = await readBody(req);
    const user = db.load('users').find(u => u.email === (email || '').toLowerCase());
    if (!user || !db.verifyPassword(password || '', user.password))
      return json(res, 401, { erreur: 'Courriel ou mot de passe incorrect.' });
    const token = createSession(user.id);
    json(res, 200, { token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
  },

  'GET /api/auth/moi': (req, res) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté.' });
    json(res, 200, { user });
  },

  /* --- Catégories --- */
  'GET /api/categories': (req, res) => {
    const categories = db.load('categories');
    const resources = db.load('resources');
    json(res, 200, categories.map(c => ({
      ...c, contenus: resources.filter(r => r.categorie === c.id).length
    })));
  },

  /* --- Ressources (filtres : type, matiere, niveau, categorie, q, tri) --- */
  'GET /api/ressources': (req, res, url) => {
    const user = getUser(req);
    let list = db.load('resources');
    const p = url.searchParams;
    if (p.get('type')) list = list.filter(r => r.type === p.get('type'));
    if (p.get('matiere')) list = list.filter(r => r.matiere === p.get('matiere'));
    if (p.get('niveau')) list = list.filter(r => r.niveau === p.get('niveau'));
    if (p.get('categorie')) list = list.filter(r => r.categorie === p.get('categorie'));
    if (p.get('q')) {
      const q = p.get('q').toLowerCase();
      list = list.filter(r => (r.titre + ' ' + r.matiere + ' ' + r.description).toLowerCase().includes(q));
    }
    const tri = p.get('tri') || 'recentes';
    if (tri === 'populaires') list.sort((a, b) => b.telechargements - a.telechargements);
    else if (tri === 'notees') list.sort((a, b) => b.note - a.note);
    else list.sort((a, b) => b.createdAt - a.createdAt);

    const page = parseInt(p.get('page') || '1');
    const parPage = parseInt(p.get('parPage') || '12');
    const achats = db.load('achats');
    json(res, 200, {
      total: list.length, page, parPage,
      items: list.slice((page - 1) * parPage, page * parPage)
        .map(r => enrichirRessource(r, user, achats))
    });
  },

  'GET /api/ressources/:id': (req, res, url, params) => {
    const user = getUser(req);
    const r = db.load('resources').find(x => x.id === params.id);
    if (!r) return json(res, 404, { erreur: 'Ressource introuvable.' });
    json(res, 200, enrichirRessource(r, user));
  },

  'POST /api/ressources': async (req, res) => {
    const user = getUser(req);
    if (!user || !['enseignant', 'admin'].includes(user.role))
      return json(res, 403, { erreur: 'Réservé aux enseignants et administrateurs.' });
    const b = await readBody(req);
    if (!b.titre || !b.type || !b.matiere)
      return json(res, 400, { erreur: 'Titre, type et matière requis.' });
    const resources = db.load('resources');
    const prixHTG = Math.max(0, Math.round(Number(b.prixHTG ?? b.prix ?? 0) || 0));
    const r = {
      id: db.uid('res'), titre: b.titre, type: b.type, matiere: b.matiere,
      niveau: b.niveau || 'Lycée', classe: b.classe || '', categorie: b.categorie || 'sciences-maths',
      description: b.description || '', telechargements: 0, note: 0, votes: 0,
      duree: b.duree || null, prixHTG, premium: prixHTG > 0,
      auteurId: user.id, nouveau: true, createdAt: Date.now()
    };
    resources.unshift(r);
    db.save('resources', resources);
    json(res, 201, r);
  },

  'DELETE /api/ressources/:id': (req, res, url, params) => {
    const user = getUser(req);
    if (!user || user.role !== 'admin') return json(res, 403, { erreur: 'Réservé aux administrateurs.' });
    const resources = db.load('resources');
    const i = resources.findIndex(r => r.id === params.id);
    if (i === -1) return json(res, 404, { erreur: 'Ressource introuvable.' });
    resources.splice(i, 1);
    db.save('resources', resources);
    json(res, 200, { ok: true });
  },

  'POST /api/ressources/:id/telecharger': (req, res, url, params) => {
    const user = getUser(req);
    const resources = db.load('resources');
    const r = resources.find(x => x.id === params.id);
    if (!r) return json(res, 404, { erreur: 'Ressource introuvable.' });
    const prix = prixRessource(r);
    if (!aAccesRessource(user, r)) {
      return json(res, 402, {
        erreur: user ? 'Paiement requis pour télécharger cette ressource.' : 'Connectez-vous avant de payer cette ressource.',
        paiementRequis: true,
        ressourceId: r.id,
        prixHTG: prix
      });
    }
    r.telechargements++;
    db.save('resources', resources);
    json(res, 200, { telechargements: r.telechargements });
  },

  /* --- Paiements PLOP PLOP --- */
  'GET /api/paiement/methodes': (req, res) => {
    json(res, 200, {
      active: PP.passerelleActive(),
      methodes: PP.METHODES,
      montantMinHTG: PP.PLOP.montantMinHTG
    });
  },

  'POST /api/paiement/initier': async (req, res) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Connectez-vous avant de payer une ressource.' });

    const b = await readBody(req);
    const resources = db.load('resources');
    const r = resources.find(x => x.id === b.ressourceId);
    if (!r) return json(res, 404, { erreur: 'Ressource introuvable.' });

    const prix = prixRessource(r);
    if (prix <= 0 || aAccesRessource(user, r)) {
      return json(res, 200, {
        dejaAccessible: true,
        suite: '/ressource?id=' + encodeURIComponent(r.id)
      });
    }

    const commandes = db.load('commandes');
    let commande = commandes.find(c =>
      c.userId === user.id && c.ressourceId === r.id && c.status === 'en_attente');
    if (!commande) {
      commande = {
        id: db.uid('cmd'),
        userId: user.id,
        ressourceId: r.id,
        titre: r.titre,
        amount: prix,
        method: null,
        status: 'en_attente',
        transactionId: null,
        createdAt: Date.now()
      };
      commandes.push(commande);
      db.save('commandes', commandes);
    }

    const out = await PP.initierPaiement({
      reference: commande.id,
      montant: prix,
      methode: b.methode || 'all'
    });
    if (!out.ok) return json(res, 502, { erreur: out.error || 'Paiement refusé par la passerelle.' });

    commande.method = out.methode;
    commande.transactionId = out.transactionId;
    commande.updatedAt = Date.now();
    db.save('commandes', commandes);
    json(res, 200, {
      reference: commande.id,
      ressourceId: r.id,
      montant: prix,
      methode: out.methode,
      transactionId: out.transactionId,
      urlPaiement: out.urlPaiement,
      suite: '/paiement?ref=' + encodeURIComponent(commande.id)
    });
  },

  'GET /api/paiement/verifier': async (req, res, url) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { paye: false, erreur: 'Session expirée.' });

    const ref = String(url.searchParams.get('ref') || '').trim();
    const commandes = db.load('commandes');
    const commande = commandes.find(c => c.id === ref && c.userId === user.id);
    if (!commande) return json(res, 404, { paye: false, erreur: 'Commande introuvable.' });

    const suite = '/ressource?id=' + encodeURIComponent(commande.ressourceId) + '&paiement=ok';
    if (commande.status === 'payee') return json(res, 200, { paye: true, suite });

    const out = await PP.verifierPaiement(commande.id);
    if (out.paye) {
      finaliserCommande(commande, commandes, (out.infos && out.infos.methode) || commande.method, out.infos);
      return json(res, 200, { paye: true, suite });
    }
    json(res, 200, {
      paye: false,
      message: out.error || out.message || 'Paiement non encore confirmé.'
    });
  },

  'GET /api/paiements': (req, res) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté.' });
    const commandes = db.load('commandes')
      .filter(c => c.userId === user.id)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    json(res, 200, commandes);
  },

  /* --- Favoris --- */
  'POST /api/favoris/:id': (req, res, url, params) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Connectez-vous pour ajouter des favoris.' });
    const favoris = db.load('favoris');
    const i = favoris.findIndex(f => f.userId === user.id && f.ressourceId === params.id);
    if (i >= 0) { favoris.splice(i, 1); db.save('favoris', favoris); return json(res, 200, { favori: false }); }
    favoris.push({ userId: user.id, ressourceId: params.id, createdAt: Date.now() });
    db.save('favoris', favoris);
    json(res, 200, { favori: true });
  },

  'GET /api/favoris': (req, res) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté.' });
    const ids = db.load('favoris').filter(f => f.userId === user.id).map(f => f.ressourceId);
    const resources = db.load('resources').filter(r => ids.includes(r.id));
    json(res, 200, { ids, items: resources });
  },

  /* --- Outils & logiciels --- */
  'GET /api/outils': (req, res, url) => {
    let list = db.load('outils');
    const p = url.searchParams;
    if (p.get('categorie')) list = list.filter(o => o.categorie === p.get('categorie'));
    if (p.get('licence')) list = list.filter(o => o.licence === p.get('licence'));
    if (p.get('q')) list = list.filter(o => (o.nom + o.description).toLowerCase().includes(p.get('q').toLowerCase()));
    json(res, 200, { total: list.length, items: list });
  },

  /* --- Quiz --- */
  'GET /api/quiz': (req, res) => {
    const quizzes = db.load('quizzes').map(q => ({
      id: q.id, titre: q.titre, matiere: q.matiere, niveau: q.niveau,
      duree: q.duree, description: q.description, nbQuestions: q.questions.length
    }));
    json(res, 200, quizzes);
  },

  'GET /api/quiz/:id': (req, res, url, params) => {
    const q = db.load('quizzes').find(x => x.id === params.id);
    if (!q) return json(res, 404, { erreur: 'Quiz introuvable.' });
    // On n'envoie pas les bonnes réponses au client
    json(res, 200, {
      id: q.id, titre: q.titre, matiere: q.matiere, niveau: q.niveau, duree: q.duree,
      questions: q.questions.map(x => ({ q: x.q, options: x.options }))
    });
  },

  'POST /api/quiz/:id/soumettre': async (req, res, url, params) => {
    const q = db.load('quizzes').find(x => x.id === params.id);
    if (!q) return json(res, 404, { erreur: 'Quiz introuvable.' });
    const { reponses } = await readBody(req); // tableau d'indices
    const correction = q.questions.map((question, i) => ({
      question: question.q,
      votreReponse: reponses[i] != null ? question.options[reponses[i]] : null,
      bonneReponse: question.options[question.bonne],
      correct: reponses[i] === question.bonne,
      explication: question.explication
    }));
    const score = correction.filter(c => c.correct).length;
    const user = getUser(req);
    if (user) {
      const resultats = db.load('resultats');
      resultats.push({ id: db.uid('rst'), userId: user.id, quizId: q.id, quizTitre: q.titre, score, total: q.questions.length, date: Date.now() });
      db.save('resultats', resultats);
    }
    json(res, 200, { score, total: q.questions.length, pourcentage: Math.round(score / q.questions.length * 100), correction });
  },

  'POST /api/quiz': async (req, res) => {
    const user = getUser(req);
    if (!user || !['enseignant', 'admin'].includes(user.role))
      return json(res, 403, { erreur: 'Réservé aux enseignants.' });
    const b = await readBody(req);
    if (!b.titre || !Array.isArray(b.questions) || !b.questions.length)
      return json(res, 400, { erreur: 'Titre et au moins une question requis.' });
    const quizzes = db.load('quizzes');
    const quiz = { id: db.uid('qz'), titre: b.titre, matiere: b.matiere || 'Général', niveau: b.niveau || 'Lycée', duree: b.duree || 300, description: b.description || '', questions: b.questions, auteurId: user.id };
    quizzes.push(quiz);
    db.save('quizzes', quizzes);
    json(res, 201, { id: quiz.id });
  },

  /* --- Résultats de l'apprenant --- */
  'GET /api/resultats': (req, res) => {
    const user = getUser(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté.' });
    const resultats = db.load('resultats').filter(r => r.userId === user.id).sort((a, b) => b.date - a.date);
    json(res, 200, resultats);
  },

  /* --- Statistiques globales --- */
  'GET /api/stats': (req, res) => {
    const resources = db.load('resources');
    const users = db.load('users');
    const resultats = db.load('resultats');
    json(res, 200, {
      ressources: resources.length,
      telechargements: resources.reduce((s, r) => s + r.telechargements, 0),
      apprenants: users.filter(u => u.role === 'apprenant').length,
      enseignants: users.filter(u => u.role === 'enseignant').length,
      quiz: db.load('quizzes').length,
      outils: db.load('outils').length,
      categories: db.load('categories').length,
      quizRealises: resultats.length,
      tauxReussite: resultats.length
        ? Math.round(resultats.reduce((s, r) => s + r.score / r.total, 0) / resultats.length * 100)
        : 0,
      noteMoyenne: resources.length
        ? +(resources.reduce((s, r) => s + r.note, 0) / resources.length).toFixed(1) : 0
    });
  },

  /* --- Administration --- */
  'GET /api/admin/utilisateurs': (req, res) => {
    const user = getUser(req);
    if (!user || user.role !== 'admin') return json(res, 403, { erreur: 'Réservé aux administrateurs.' });
    json(res, 200, db.load('users').map(u => ({ id: u.id, nom: u.nom, email: u.email, role: u.role, createdAt: u.createdAt })));
  },

  'PUT /api/admin/utilisateurs/:id': async (req, res, url, params) => {
    const user = getUser(req);
    if (!user || user.role !== 'admin') return json(res, 403, { erreur: 'Réservé aux administrateurs.' });
    const { role } = await readBody(req);
    if (!['apprenant', 'enseignant', 'admin'].includes(role)) return json(res, 400, { erreur: 'Rôle invalide.' });
    const users = db.load('users');
    const cible = users.find(u => u.id === params.id);
    if (!cible) return json(res, 404, { erreur: 'Utilisateur introuvable.' });
    cible.role = role;
    db.save('users', users);
    json(res, 200, { ok: true });
  }
};

/* ---------------------------------------------------------------- */
/* Résolution des routes (gère les paramètres :id)                   */
/* ---------------------------------------------------------------- */
function matchRoute(method, pathname) {
  for (const key of Object.keys(routes)) {
    const [m, pattern] = key.split(' ');
    if (m !== method) continue;
    const patternParts = pattern.split('/');
    const pathParts = pathname.split('/');
    if (patternParts.length !== pathParts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      else if (patternParts[i] !== pathParts[i]) { ok = false; break; }
    }
    if (ok) return { handler: routes[key], params };
  }
  return null;
}

/* ---------------------------------------------------------------- */
/* Serveur                                                           */
/* ---------------------------------------------------------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API
  if (pathname.startsWith('/api/')) {
    const route = matchRoute(req.method, pathname);
    if (!route) return json(res, 404, { erreur: 'Route introuvable.' });
    try { await route.handler(req, res, url, route.params); }
    catch (e) { console.error(e); json(res, 500, { erreur: 'Erreur serveur.' }); }
    return;
  }

  // Fichiers statiques (protection contre la traversée de répertoires)
  let file = pathname === '/' ? '/index.html' : pathname;
  if (!path.extname(file)) file += '.html';
  const fullPath = path.join(PUBLIC_DIR, path.normalize(file).replace(/^(\.\.[\/\\])+/, ''));
  if (!fullPath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<meta charset="utf-8"><h1>404 — Page introuvable</h1><a href="/">← Retour à l’accueil</a>');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fullPath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nOASIS Centre numérique d'apprentissage — http://localhost:${PORT}\n`);
  console.log('Comptes de démonstration :');
  console.log('  Admin      : admin@oasis.ht / admin123');
  console.log('  Enseignant : enseignant@oasis.ht / prof123');
  console.log('  Apprenant  : apprenant@oasis.ht / eleve123\n');
});
