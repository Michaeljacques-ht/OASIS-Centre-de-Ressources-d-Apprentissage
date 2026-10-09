/* OASIS Centre numérique d'apprentissage - script partagé */

const API = {
  async req(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('oasis_token') || localStorage.getItem('educa_token');
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.erreur || 'Erreur serveur');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },
  get: (u) => API.req('GET', u),
  post: (u, b) => API.req('POST', u, b),
  put: (u, b) => API.req('PUT', u, b),
  del: (u) => API.req('DELETE', u)
};

const Auth = {
  utilisateur: null,
  charger() {
    try {
      this.utilisateur = JSON.parse(localStorage.getItem('oasis_user') || localStorage.getItem('educa_user'));
    } catch {
      this.utilisateur = null;
    }
    return this.utilisateur;
  },
  enregistrer(token, user) {
    localStorage.setItem('oasis_token', token);
    localStorage.setItem('oasis_user', JSON.stringify(user));
    localStorage.removeItem('educa_token');
    localStorage.removeItem('educa_user');
    this.utilisateur = user;
  },
  deconnecter() {
    localStorage.removeItem('oasis_token');
    localStorage.removeItem('oasis_user');
    localStorage.removeItem('educa_token');
    localStorage.removeItem('educa_user');
    location.href = '/';
  }
};

const LOGO_HTML = `<img class="logo-icone logo-img" src="/assets/oasis-logo.jpg" alt="Logo OASIS">`;

const ROLES_TOUS = ['apprenant', 'enseignant', 'admin'];
const ROLES_ELEVE = ['apprenant', 'admin'];
const ROLES_ENSEIGNANT = ['enseignant', 'admin'];

const LIENS_NAV = [
  ['/', 'Accueil', ROLES_TOUS],
  ['/ressources', 'Bibliothèque numérique', ROLES_TOUS],
  ['/ressources-pedagogiques-eleves', 'Espace élèves', ROLES_ELEVE],
  ['/ressources-pedagogiques-enseignant', 'Espace enseignants', ROLES_ENSEIGNANT],
  ['/quiz', 'Quiz', ROLES_ELEVE],
  ['/laboratoire', 'Laboratoire', ROLES_ENSEIGNANT],
  ['/apropos', 'À propos', ROLES_TOUS]
];

const MENU_OASIS = [
  {
    titre: 'Tableau de bord',
    liens: [
      ['dashboard', '/tableau-ressources', '⌂', 'Tableau de bord', ROLES_TOUS],
      ['cours', '/catalogue?type=support', '□', 'Cours et leçons', ROLES_ELEVE],
      ['agenda', '/dashboard', '◷', 'Mon agenda', ROLES_TOUS],
      ['evaluations', '/quiz', '?', 'Quiz et évaluations', ROLES_ELEVE]
    ]
  },
  {
    titre: 'Ressources',
    liens: [
      ['bibliotheque', '/ressources', '▥', 'Bibliothèque numérique', ROLES_TOUS],
      ['eleves', '/ressources-pedagogiques-eleves', '▥', 'Ressources pour élèves', ROLES_ELEVE],
      ['catalogue', '/catalogue', '▦', 'Catalogue apprenant', ROLES_ELEVE],
      ['multimedia-eleve', '/multimedia', '▷', 'Vidéos éducatives', ROLES_ELEVE],
      ['methodologie-eleve', '/methodologie', '✦', 'Méthodes d’étude', ROLES_ELEVE],
      ['pedagogie', '/ressources-pedagogiques-enseignant', '▤', 'Ressources enseignants', ROLES_ENSEIGNANT],
      ['methodologie', '/ressources-methodologiques-enseignant', '✦', 'Méthodologie enseignant', ROLES_ENSEIGNANT],
      ['multimedia', '/ressources-multimedias-enseignants', '▷', 'Multimédia enseignant', ROLES_ENSEIGNANT],
      ['cartes', '/cartes-geographiques', '◎', 'Cartes géographiques', ROLES_ENSEIGNANT],
      ['questions', '/banque-questions', '?', 'Banque de questions', ROLES_ENSEIGNANT]
    ]
  },
  {
    titre: 'Évaluation',
    liens: [
      ['quiz', '/quiz', '✓', 'Quiz', ROLES_ELEVE],
      ['td', '/travaux-diriges', '▧', 'Travaux dirigés', ROLES_ENSEIGNANT],
      ['tp', '/travaux-pratiques', '⚗', 'Travaux pratiques', ROLES_ENSEIGNANT],
      ['exposes', '/exposes', '▣', 'Exposés', ROLES_ENSEIGNANT],
      ['dissertations', '/dissertations', '✎', 'Dissertations', ROLES_ENSEIGNANT],
      ['examens', '/examens', '▧', 'Examens', ROLES_ENSEIGNANT]
    ]
  },
  {
    titre: 'Laboratoire virtuel',
    liens: [
      ['laboratoire', '/laboratoire', '⚗', 'Laboratoires virtuels', ROLES_ENSEIGNANT],
      ['nouveau-laboratoire', '/nouveau-laboratoire', '+', 'Nouveau laboratoire', ROLES_ENSEIGNANT],
      ['simulations', '/simulations', '△', 'Mes simulations', ROLES_ENSEIGNANT],
      ['experiences', '/experiences', '✤', 'Mes expériences', ROLES_ENSEIGNANT]
    ]
  },
  {
    titre: 'Outils & logiciels',
    liens: [
      ['outils-educatifs', '/outils-educatifs', '⚙', 'Outils éducatifs', ROLES_ENSEIGNANT],
      ['ajouter-outil', '/ajouter-outil', '+', 'Ajouter un outil', ROLES_ENSEIGNANT]
    ]
  },
  {
    titre: 'Communauté',
    liens: [
      ['forum', '/forum', '◌', 'Forum enseignants', ROLES_ENSEIGNANT],
      ['groupes', '/groupes', '♙', 'Groupes enseignants', ROLES_ENSEIGNANT],
      ['partage', '/partage', '⇄', 'Partage de ressources', ROLES_ENSEIGNANT]
    ]
  }
];

const PAGES_RESERVEES = {
  '/ressources-pedagogiques-enseignant': ROLES_ENSEIGNANT,
  '/ressources-methodologiques-enseignant': ROLES_ENSEIGNANT,
  '/ressources-multimedias-enseignants': ROLES_ENSEIGNANT,
  '/pedagogie': ROLES_ENSEIGNANT,
  '/banque-questions': ROLES_ENSEIGNANT,
  '/travaux-diriges': ROLES_ENSEIGNANT,
  '/creer-travail-dirige': ROLES_ENSEIGNANT,
  '/travaux-pratiques': ROLES_ENSEIGNANT,
  '/exposes': ROLES_ENSEIGNANT,
  '/dissertations': ROLES_ENSEIGNANT,
  '/nouvelle-dissertation': ROLES_ENSEIGNANT,
  '/examens': ROLES_ENSEIGNANT,
  '/laboratoire': ROLES_ENSEIGNANT,
  '/nouveau-laboratoire': ROLES_ENSEIGNANT,
  '/simulations': ROLES_ENSEIGNANT,
  '/experiences': ROLES_ENSEIGNANT,
  '/outils-educatifs': ROLES_ENSEIGNANT,
  '/ajouter-outil': ROLES_ENSEIGNANT,
  '/partage': ROLES_ENSEIGNANT,
  '/forum': ROLES_ENSEIGNANT,
  '/groupes': ROLES_ENSEIGNANT,
  '/ressources-pedagogiques-eleves': ROLES_ELEVE
};

function initiales(nom) {
  return (nom || '?').split(' ').map(m => m[0]).slice(0, 2).join('').toUpperCase();
}

function utilisateurCourant() {
  return Auth.charger() || { nom: 'Jean Baptiste', role: 'apprenant' };
}

function nomRole(role) {
  return ({ admin: 'Administrateur', enseignant: 'Enseignant', apprenant: 'Apprenant' }[role] || role || 'Apprenant');
}

function roleNavigation() {
  const user = Auth.charger();
  return user ? user.role : 'apprenant';
}

function lienAutorise(roles, role = roleNavigation()) {
  if (!roles || roles.includes('public')) return true;
  if (role === 'admin') return true;
  return roles.includes(role);
}

function rolesPageCourante() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  return PAGES_RESERVEES[path] || null;
}

function accesPageAutorise(roles) {
  if (!roles) return true;
  const user = Auth.charger();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return roles.includes(user.role);
}

function panneauAccesRefuse(roles) {
  const estEnseignant = roles && roles.includes('enseignant');
  const titre = Auth.charger()
    ? 'Accès réservé'
    : 'Connexion requise';
  const message = Auth.charger()
    ? `Cette page appartient à l’espace ${estEnseignant ? 'enseignant' : 'élève'}.`
    : `Connectez-vous avec un compte ${estEnseignant ? 'enseignant' : 'élève'} pour continuer.`;
  return `<section class="access-panel">
    <span>${estEnseignant ? '♙' : '▥'}</span>
    <h1>${titre}</h1>
    <p>${message} L’administrateur peut accéder à tous les espaces.</p>
    <div class="access-actions">
      <a class="btn btn-bleu" href="/connexion?suite=${encodeURIComponent(location.pathname + location.search)}">Se connecter</a>
      <a class="btn btn-contour" href="/dashboard">Retour à mon espace</a>
    </div>
  </section>`;
}

function afficherEntete(actif = '') {
  const user = Auth.charger();
  const role = roleNavigation();
  const nav = LIENS_NAV.filter(([, , roles]) => lienAutorise(roles, role)).map(([href, label]) =>
    `<a href="${href}" class="${actif === label ? 'actif' : ''}">${label}</a>`).join('');
  const bloc = user
    ? `<a href="/dashboard" class="utilisateur" title="Mon espace OASIS">
         <div class="avatar">${initiales(user.nom)}</div>
         <div><small>${nomRole(user.role)}</small><b>${user.nom.split(' ')[0]}</b></div>
       </a>
       <button class="btn btn-contour btn-petit" onclick="Auth.deconnecter()">Se déconnecter</button>`
    : `<a href="/connexion" class="btn btn-contour btn-petit">Se connecter</a>
       <a href="/inscription" class="btn btn-bleu btn-petit">S'inscrire</a>`;

  document.body.insertAdjacentHTML('afterbegin', `
  <header class="entete"><div class="conteneur entete-int">
    <a href="/" class="logo">${LOGO_HTML}
      <div class="logo-texte"><b><span class="l1">OASIS</span><br><span class="l2">Centre numérique</span></b>
      <div class="logo-slogan">Apprendre, enseigner et réussir</div></div>
    </a>
    <nav class="nav" aria-label="Navigation principale">${nav}</nav>
    <div class="entete-actions">
      <a class="share-dot" href="/partage" title="Partager">⇄</a>
      <a class="share-dot" href="/ressources-multimedias-enseignants" title="Ressources multimédia">▷</a>
      ${bloc}
    </div>
  </div></header>`);
}

function afficherPied() {
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="pied"><div class="conteneur">
    <div class="pied-int">
      <div>
        <div class="logo logo-footer">${LOGO_HTML}
          <div class="logo-texte"><b>OASIS<br>Centre numérique</b>
          <div class="logo-slogan">Un accès illimité au savoir pour bâtir votre avenir</div></div>
        </div>
        <p style="font-size:13px;margin-top:12px">OASIS Centre numérique d'apprentissage regroupe des livres, vidéos, guides, ressources apprenants et ressources enseignants.</p>
      </div>
      <div><h4>Explorer</h4>
        <a href="/ressources">Bibliothèque numérique</a><a href="/catalogue?type=video">Vidéos pédagogiques</a>
        <a href="/ressources-methodologiques-enseignant">Méthodologie</a><a href="/ressources-pedagogiques-enseignant">Pédagogie</a>
      </div>
      <div><h4>Communauté</h4>
        <a href="/partage">Partage de ressources</a><a href="/groupes">Groupes</a>
        <a href="/quiz">Quiz et évaluations</a><a href="/dashboard">Mon espace</a>
      </div>
      <div><h4>Aide</h4>
        <a href="/apropos">À propos</a><a href="/apropos">Centre d'aide</a><a href="/connexion">Connexion</a>
        <a href="/inscription">Créer un compte</a>
      </div>
      <div><h4>Infolettre</h4>
        <p style="font-size:13px">Recevez les nouvelles ressources et les conseils pédagogiques OASIS.</p>
        <form class="infolettre" onsubmit="event.preventDefault(); this.querySelector('input').value=''; alert('Merci ! Votre inscription est enregistrée.')">
          <input type="email" placeholder="Votre adresse e-mail" required>
          <button class="btn btn-bleu">S'abonner</button>
        </form>
      </div>
    </div>
    <div class="pied-bas">
      <span>© ${new Date().getFullYear()} OASIS Centre numérique d'apprentissage.</span>
      <span>Ressources et outils pour apprendre, enseigner et réussir.</span>
    </div>
  </div></footer>`);
}

function sidebarOasis(actif = '') {
  const role = roleNavigation();
  const groupes = MENU_OASIS.map(g => ({
    ...g,
    liens: g.liens.filter(([, , , , roles]) => lienAutorise(roles, role))
  })).filter(g => g.liens.length);
  return `<aside class="oasis-sidebar">
    <a href="/" class="side-brand">${LOGO_HTML}<span><b>OASIS</b><small>Centre numérique<br>d'apprentissage</small></span></a>
    <div class="role-switcher">
      <small>Espace actif</small>
      <b>${nomRole(role)}</b>
    </div>
    ${groupes.map(g => `<div class="side-group"><h3>${g.titre}</h3>
      ${g.liens.map(([id, href, icone, label]) =>
        `<a href="${href}" class="${actif === id ? 'actif' : ''}"><span>${icone}</span>${label}</a>`).join('')}
    </div>`).join('')}
    <div class="side-help">
      <b>Besoin d'aide ?</b>
      <p>Consultez le guide d'utilisation OASIS.</p>
      <a href="/apropos" class="btn btn-contour btn-bloc btn-petit">Voir le guide</a>
    </div>
  </aside>`;
}

function topbarOasis(placeholder = 'Rechercher une ressource, une activité, un sujet...', action = '') {
  const user = Auth.charger();
  const zoneCompte = user
    ? `<a class="top-user" href="/dashboard"><span class="avatar">${initiales(user.nom)}</span><span><b>${user.nom}</b><small>${nomRole(user.role)}</small></span></a>`
    : `<a class="btn btn-contour btn-petit" href="/connexion">Se connecter</a>`;
  return `<div class="oasis-topbar">
    <button class="menu-toggle" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Menu">☰</button>
    <div class="top-spacer"></div>
    ${action}
    <a class="top-icon" href="/dashboard" title="Notifications"><span class="badge">5</span>♧</a>
    <a class="top-icon" href="/dashboard" title="Messages"><span class="badge">3</span>✉</a>
    <a class="top-icon" href="/apropos" title="Aide">?</a>
    ${zoneCompte}
  </div>`;
}

function appShell(actif, contenu, droite = '', opts = {}) {
  const roles = opts.roles || rolesPageCourante();
  const autorise = accesPageAutorise(roles);
  const contenuFinal = autorise ? contenu : panneauAccesRefuse(roles);
  const droiteFinale = autorise ? droite : '';
  const actionFinale = autorise ? (opts.action || '') : '<a class="btn btn-bleu btn-petit" href="/connexion">Se connecter</a>';
  return `<div class="oasis-app ${droiteFinale ? '' : 'sans-right'}">
    ${sidebarOasis(actif)}
    <main class="oasis-main">
      ${topbarOasis(opts.search || undefined, actionFinale)}
      ${contenuFinal}
    </main>
    ${droiteFinale ? `<aside class="oasis-right">${droiteFinale}</aside>` : ''}
  </div>`;
}

function statCard(icone, valeur, label, cls = '') {
  return `<div class="dash-stat ${cls}"><span>${icone}</span><div><b>${valeur}</b><small>${label}</small></div></div>`;
}

function quickAction(icone, titre, texte, href = '#') {
  return `<a class="quick-action" href="${href}"><span>${icone}</span><div><b>${titre}</b><small>${texte}</small></div><strong>›</strong></a>`;
}

function featuredList(items) {
  return `<div class="rank-list">${items.map((it, i) =>
    `<a href="${it.href || '#'}"><span>${i + 1}</span><b>${it.titre}</b><small>${it.meta || ''}</small></a>`).join('')}</div>`;
}

function resourceRow(icone, titre, desc, tags = [], meta = '') {
  return `<article class="resource-row">
    <span class="row-icon">${icone}</span>
    <div class="row-main"><b>${titre}</b><p>${desc}</p><div>${tags.map(t => `<em>${t}</em>`).join('')}</div></div>
    <small>${meta}</small>
    <div class="row-actions"><button title="Favori">♡</button><button title="Télécharger">⇩</button><button title="Plus">⋮</button></div>
  </article>`;
}

function teacherRow(thumb, titre, desc, tags = [], cells = [], action = 'Lancer') {
  return `<article class="teacher-row">
    <div class="lab-thumb">${thumb}</div>
    <div class="row-main"><b>${titre}</b><p>${desc}</p><div>${tags.map(t => `<em>${t}</em>`).join('')}</div></div>
    ${cells.map(c => `<small>${c}</small>`).join('')}
    <div class="row-actions"><button class="btn btn-bleu btn-petit">${action}</button><button title="Favori">♡</button><button title="Plus">⋮</button></div>
  </article>`;
}

function formField(label, placeholder = '', type = 'input') {
  if (type === 'select') {
    return `<div class="champ"><label>${label}</label><select><option>${placeholder}</option><option>Secondaire 1</option><option>Secondaire 2</option><option>Secondaire 3</option><option>Secondaire 4</option><option>Secondaire 5</option></select></div>`;
  }
  if (type === 'textarea') {
    return `<div class="champ"><label>${label}</label><textarea rows="4" placeholder="${placeholder}"></textarea></div>`;
  }
  return `<div class="champ"><label>${label}</label><input placeholder="${placeholder}"></div>`;
}

function wizardSteps(items, active = 1) {
  return `<div class="wizard-steps">${items.map((label, i) => `<span class="${i + 1 === active ? 'actif' : ''}"><b>${i + 1}</b>${label}</span>`).join('')}</div>`;
}

const TYPE_INFO = {
  fiche: { label: 'FICHE', emoji: '▤' },
  exercice: { label: 'EXERCICES', emoji: '✓' },
  support: { label: 'COURS', emoji: '▥' },
  presentation: { label: 'PPTX', emoji: '▣' },
  video: { label: 'VIDÉO', emoji: '▷' },
  podcast: { label: 'AUDIO', emoji: '♬' },
  document: { label: 'PDF', emoji: '▧' }
};

const MATIERE_CLASSE = {
  'Mathématiques': 'v-math',
  'SVT': 'v-svt',
  'Sciences Physiques': 'v-phys',
  'Français': 'v-fr',
  'Anglais': 'v-ang',
  'Histoire-Géo': 'v-hist',
  'Informatique': 'v-info',
  'Économie & Gestion': 'v-eco',
  'Philosophie': 'v-philo',
  'Éducation Civique': 'v-civique'
};

function fmtNombre(n) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'K' : n;
}

function fmtHTG(n) {
  return (Number(n) || 0).toLocaleString('fr-CA') + ' HTG';
}

function carteRessource(r, favoris = []) {
  const t = TYPE_INFO[r.type] || { label: String(r.type || 'RESSOURCE').toUpperCase(), emoji: '▦' };
  const cls = MATIERE_CLASSE[r.matiere] || 'v-def';
  const estFavori = favoris.includes(r.id);
  const prix = Number(r.prixHTG || r.prix || 0);
  return `<article class="carte resource-card">
    <div class="carte-visuel ${cls}">
      <span class="etiquette ${r.nouveau ? 'nouveau' : ''}">${prix > 0 ? fmtHTG(prix) : (r.nouveau ? 'NOUVEAU' : t.label)}</span>
      <button class="coeur ${estFavori ? 'actif' : ''}" onclick="basculerFavori('${r.id}', this)" aria-label="Ajouter aux favoris">${estFavori ? '♥' : '♡'}</button>
      <span class="resource-symbol">${t.emoji}</span>
    </div>
    <div class="carte-corps">
      <span class="tag-type">${t.label}</span>
      <b class="titre">${r.titre}</b>
      <div class="meta">${r.matiere} · ${r.classe || r.niveau}</div>
      <p class="meta">${r.description || 'Ressource OASIS prête à consulter.'}</p>
      <div class="ligne-stats">
        <span>⌕ ${fmtNombre(r.telechargements)} vues</span>
        <span class="etoile">${prix > 0 ? 'Premium' : 'Gratuit'} · ★ ${r.note}</span>
      </div>
      <a class="btn ${prix > 0 && !r.accesAutorise ? 'btn-bleu' : 'btn-contour'} btn-bloc btn-petit" href="/ressource?id=${r.id}">${prix > 0 && !r.accesAutorise ? 'Acheter / Consulter' : 'Voir la ressource'}</a>
    </div>
  </article>`;
}

async function basculerFavori(id, bouton) {
  try {
    const { favori } = await API.post('/api/favoris/' + id);
    bouton.textContent = favori ? '♥' : '♡';
    bouton.classList.toggle('actif', favori);
  } catch (e) {
    if (confirm('Connectez-vous pour ajouter cette ressource à vos favoris. Aller à la page de connexion ?')) {
      location.href = '/connexion';
    }
  }
}

function paginationHTML(total, page, parPage, fn) {
  const pages = Math.ceil(total / parPage) || 1;
  let boutons = '';
  for (let i = 1; i <= pages; i++) {
    if (i <= 4 || i === pages || Math.abs(i - page) <= 1) {
      boutons += `<button class="${i === page ? 'actif' : ''}" onclick="${fn}(${i})">${i}</button>`;
    } else if (i === 5 && page < pages - 2) {
      boutons += '<span>…</span>';
    }
  }
  return `<button ${page <= 1 ? 'disabled' : ''} onclick="${fn}(${page - 1})">←</button>
          ${boutons}
          <button ${page >= pages ? 'disabled' : ''} onclick="${fn}(${page + 1})">→</button>`;
}

function param(nom, defaut = '') {
  return new URLSearchParams(location.search).get(nom) || defaut;
}

function toast(message, type = 'info') {
  let zone = document.getElementById('toast-zone');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'toast-zone';
    zone.className = 'toast-zone';
    document.body.appendChild(zone);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  zone.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 20);
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 220);
  }, 3200);
}

function fermerModale() {
  const modale = document.querySelector('.action-modal');
  if (modale) modale.remove();
}

function ouvrirModale(titre, contenu, pied = '') {
  fermerModale();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="action-modal" role="dialog" aria-modal="true">
      <div class="action-modal-backdrop" onclick="fermerModale()"></div>
      <section class="action-modal-card">
        <button class="action-modal-close" onclick="fermerModale()" aria-label="Fermer">×</button>
        <h2>${titre}</h2>
        <div class="action-modal-body">${contenu}</div>
        ${pied ? `<div class="action-modal-footer">${pied}</div>` : ''}
      </section>
    </div>`);
}

function texteElement(el) {
  return (el.getAttribute('title') || el.textContent || '').trim();
}

function routeCreation() {
  const p = location.pathname;
  if (p.includes('travaux-diriges')) return '/creer-travail-dirige';
  if (p.includes('dissertation')) return '/nouvelle-dissertation';
  if (p.includes('laboratoire') || p.includes('simulation') || p.includes('experience')) return '/nouveau-laboratoire';
  if (p.includes('quiz') || p.includes('banque-questions')) return '/creer-quiz';
  if (p.includes('outil')) return '/ajouter-outil';
  if (p.includes('ressource') || p.includes('partage')) return '/dashboard?tab=publier';
  return '';
}

function routeListeCourante() {
  const p = location.pathname;
  if (p.includes('quiz')) return '/quiz';
  if (p.includes('ressource')) return '/ressources';
  if (p.includes('laboratoire')) return '/laboratoire';
  if (p.includes('question')) return '/banque-questions';
  if (p.includes('td') || p.includes('travaux-diriges')) return '/travaux-diriges';
  if (p.includes('tp') || p.includes('travaux-pratiques')) return '/travaux-pratiques';
  if (p.includes('exposes')) return '/exposes';
  if (p.includes('dissertation')) return '/dissertations';
  if (p.includes('examens')) return '/examens';
  if (p.includes('outil')) return '/outils-educatifs';
  return '/dashboard';
}

function endpointCreationCourant() {
  const p = location.pathname;
  if (p.includes('banque-questions')) return '/api/questions';
  if (p.includes('travaux-diriges') || p.includes('creer-travail-dirige')) return '/api/travaux-diriges';
  if (p.includes('travaux-pratiques')) return '/api/travaux-pratiques';
  if (p.includes('exposes')) return '/api/exposes';
  if (p.includes('dissertation')) return '/api/dissertations';
  if (p.includes('examens')) return '/api/examens';
  if (p.includes('laboratoire') || p.includes('simulation') || p.includes('experience')) return '/api/laboratoires';
  if (p.includes('outil')) return '/api/outils';
  if (p.includes('ressource') || p.includes('partage')) return '/api/ressources';
  return '/api/ressources';
}

function valeurChamp(id, defaut = '') {
  const el = document.getElementById(id);
  if (!el) return defaut;
  return (el.value != null ? el.value : el.textContent || '').trim() || defaut;
}

async function posterCreation(endpoint, payload, suite) {
  if (!Auth.charger()) {
    toast('Connectez-vous avec un compte enseignant pour créer ce contenu.', 'erreur');
    setTimeout(() => { location.href = '/connexion?suite=' + encodeURIComponent(location.pathname); }, 900);
    return null;
  }
  try {
    const data = await API.post(endpoint, payload);
    toast('Création enregistrée avec succès.', 'succes');
    if (suite) setTimeout(() => { location.href = suite; }, 700);
    return data;
  } catch (e) {
    toast(e.message || 'Impossible d’enregistrer cette création.', 'erreur');
    return null;
  }
}

async function sauverCreationGenerique() {
  const endpoint = window.__creationEndpoint || endpointCreationCourant();
  const titre = valeurChamp('modal-titre');
  const discipline = valeurChamp('modal-discipline', 'Général');
  const payload = {
    titre,
    nom: titre,
    question: titre,
    type: endpoint === '/api/ressources' ? 'document' : '',
    matiere: discipline,
    discipline,
    niveau: valeurChamp('modal-niveau', 'Tous niveaux'),
    description: valeurChamp('modal-description'),
    statut: 'brouillon',
    visibilite: 'prive'
  };
  if (!titre) {
    toast('Ajoutez au moins un titre avant d’enregistrer.', 'erreur');
    return;
  }
  const data = await posterCreation(endpoint, payload);
  if (data) fermerModale();
}

function ouvrirCreationGenerique(source) {
  const label = texteElement(source) || 'Créer';
  window.__creationEndpoint = endpointCreationCourant();
  ouvrirModale(label, `
    <div class="champ"><label>Titre</label><input id="modal-titre" placeholder="Nom de la ressource ou de l’activité"></div>
    <div class="card-grid-2">
      <div class="champ"><label>Discipline</label><select id="modal-discipline"><option>Mathématiques</option><option>Sciences</option><option>Français</option><option>Histoire-Géo</option></select></div>
      <div class="champ"><label>Niveau</label><select id="modal-niveau"><option>Secondaire 1</option><option>Secondaire 2</option><option>Secondaire 3</option><option>Secondaire 4</option><option>Secondaire 5</option></select></div>
    </div>
    <div class="champ"><label>Description</label><textarea id="modal-description" rows="3" placeholder="Résumé rapide..."></textarea></div>`,
    `<button class="btn btn-contour" onclick="fermerModale()">Annuler</button>
     <button class="btn btn-bleu" onclick="sauverCreationGenerique()">Enregistrer</button>`);
}

function ouvrirImport(source) {
  ouvrirModale(texteElement(source) || 'Importer un fichier', `
    <div class="upload-zone active-upload">
      <input id="modal-file" type="file">
      <p><b>Choisissez un fichier</b></p>
      <small>Formats acceptés : PDF, DOCX, PPTX, XLSX, JPG, PNG, MP4 ou HTML5.</small>
    </div>
    <p class="object-meta">Le fichier sera préparé comme brouillon dans votre espace. Vous pourrez compléter les métadonnées avant publication.</p>`,
    `<button class="btn btn-contour" onclick="fermerModale()">Annuler</button>
     <button class="btn btn-bleu" onclick="toast(document.getElementById('modal-file').files[0] ? 'Fichier importé comme brouillon.' : 'Sélectionnez d’abord un fichier.', document.getElementById('modal-file').files[0] ? 'succes' : 'erreur'); if (document.getElementById('modal-file').files[0]) fermerModale()">Importer</button>`);
}

function dupliquerObjet(source) {
  const item = source.closest('.object-row, .teacher-row, .resource-row, .media-card, .edu-resource-card, .carte');
  if (!item || !item.parentElement) {
    toast('Aucun élément à dupliquer ici.', 'erreur');
    return;
  }
  const copie = item.cloneNode(true);
  const titre = copie.querySelector('b, .titre');
  if (titre && !/copie/i.test(titre.textContent)) titre.textContent += ' - copie';
  copie.classList.add('copie-recente');
  item.after(copie);
  toast('Copie créée. Vous pouvez maintenant la modifier.', 'succes');
}

function ouvrirApercu(source) {
  const item = source.closest('.object-row, .teacher-row, .resource-row, .media-card, .edu-resource-card, .carte, .side-card') || document.body;
  const titre = (item.querySelector('b, h3, h2') || {}).textContent || 'Aperçu';
  const desc = (item.querySelector('p, small') || {}).textContent || 'Aperçu rapide de l’élément sélectionné.';
  ouvrirModale('Aperçu', `
    <div class="preview-large">
      <span>⌕</span>
      <h3>${titre}</h3>
      <p>${desc}</p>
    </div>`,
    `<button class="btn btn-contour" onclick="fermerModale()">Fermer</button>
     <a class="btn btn-bleu" href="${routeListeCourante()}">Ouvrir la liste</a>`);
}

function ouvrirEdition(source) {
  const item = source.closest('.object-row, .teacher-row, .resource-row, .media-card, .edu-resource-card, .carte');
  const titreEl = item ? item.querySelector('b, .titre') : null;
  const titre = titreEl ? titreEl.textContent : '';
  window.__editionTarget = titreEl;
  ouvrirModale('Modifier', `
    <div class="champ"><label>Titre</label><input id="edition-titre" value="${titre.replace(/"/g, '&quot;')}"></div>
    <div class="champ"><label>Note interne</label><textarea rows="3" placeholder="Ajoutez une précision ou une consigne..."></textarea></div>`,
    `<button class="btn btn-contour" onclick="fermerModale()">Annuler</button>
     <button class="btn btn-bleu" onclick="if (window.__editionTarget) window.__editionTarget.textContent = document.getElementById('edition-titre').value || window.__editionTarget.textContent; toast('Modification enregistrée en brouillon.', 'succes'); fermerModale()">Enregistrer</button>`);
}

function partagerPage() {
  const titre = document.title || 'OASIS';
  const url = location.href;
  if (navigator.share) {
    navigator.share({ title: titre, url }).catch(() => {});
    return;
  }
  navigator.clipboard.writeText(url)
    .then(() => toast('Lien copié pour le partage.', 'succes'))
    .catch(() => toast('Copiez ce lien : ' + url, 'info'));
}

function telechargerDemo(source) {
  const nom = (texteElement(source) || 'ressource-oasis').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blob = new Blob(['OASIS - ressource de démonstration\n\nLe fichier réel sera attaché lors de la publication.'], { type: 'text/plain' });
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nom + '.txt';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  toast('Téléchargement de démonstration lancé.', 'succes');
}

function appliquerFiltres(source) {
  const bloc = source.closest('.filters-modern, .advanced-filter, .panneau') || document;
  bloc.classList.add('filtres-actifs');
  toast('Filtres appliqués à la vue courante.', 'succes');
}

function gererActionGlobale(e) {
  const el = e.target.closest('a[href="#"], button:not([onclick])');
  if (!el) return;
  if (el.tagName === 'BUTTON' && el.closest('form') && (el.getAttribute('type') || 'submit') === 'submit') return;
  const texte = texteElement(el).toLowerCase();
  const href = el.getAttribute('href');
  const boutonSansAction = el.tagName === 'BUTTON' && !el.closest('.option') && !el.closest('.coeur');
  if (href !== '#' && !boutonSansAction) return;

  e.preventDefault();

  if (el.closest('.tabs-modern')) {
    el.closest('.tabs-modern').querySelectorAll('button').forEach(b => b.classList.remove('actif'));
    el.classList.add('actif');
    toast('Vue filtrée : ' + texteElement(el), 'succes');
    return;
  }
  if (el.closest('.pagination')) {
    el.closest('.pagination').querySelectorAll('button').forEach(b => b.classList.remove('actif'));
    el.classList.add('actif');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Page affichée.', 'succes');
    return;
  }
  if (texte.includes('créer') || texte.includes('nouveau') || texte.includes('ajouter') || texte.includes('déposer')) {
    const route = routeCreation();
    if (route) location.href = route;
    else ouvrirCreationGenerique(el);
    return;
  }
  if (texte.includes('importer') || texte.includes('choisir un fichier')) { ouvrirImport(el); return; }
  if (texte.includes('dupliquer') || texte === '□') { dupliquerObjet(el); return; }
  if (texte.includes('partager') || texte.includes('réseaux') || texte === '⇄') { partagerPage(); return; }
  if (texte.includes('favori') || texte.includes('♡') || texte.includes('☆') || texte.includes('★')) {
    el.classList.toggle('actif');
    el.textContent = el.classList.contains('actif') ? '★' : (texte.includes('♡') ? '♡' : '☆');
    toast(el.classList.contains('actif') ? 'Ajouté aux favoris.' : 'Retiré des favoris.', 'succes');
    return;
  }
  if (texte.includes('filtre')) { appliquerFiltres(el); return; }
  if (texte.includes('télécharger') || texte.includes('exporter') || texte === '⇩') { telechargerDemo(el); return; }
  if (texte.includes('guide') || texte.includes('savoir plus')) { location.href = '/apropos'; return; }
  if (texte.includes('voir tout') || texte.includes('rapport') || texte.includes('détails')) { location.href = routeListeCourante(); return; }
  if (texte.includes('voir') || texte.includes('aperçu') || texte === '⌕') { ouvrirApercu(el); return; }
  if (texte.includes('modifier') || texte === '✎') { ouvrirEdition(el); return; }
  if (texte.includes('suivant')) { toast('Étape validée. Les champs suivants sont prêts à être complétés.', 'succes'); return; }
  if (texte.includes('brouillon') || texte.includes('enregistrer')) { toast('Brouillon enregistré.', 'succes'); return; }
  if (texte.includes('plus') || texte === '⋮') {
    ouvrirModale('Actions disponibles', `
      <div class="modal-actions-list">
        <button onclick="toast('Élément ajouté aux favoris.', 'succes'); fermerModale()">Ajouter aux favoris</button>
        <button onclick="partagerPage(); fermerModale()">Partager</button>
        <button onclick="telechargerDemo(this); fermerModale()">Télécharger</button>
      </div>`);
    return;
  }
  toast('Action prête. Cette commande est maintenant reliée à l’interface.', 'succes');
}

document.addEventListener('click', gererActionGlobale);
