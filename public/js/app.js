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

const LIENS_NAV = [
  ['/', 'Accueil'],
  ['/ressources', 'Bibliothèque numérique'],
  ['/laboratoire', 'Laboratoire'],
  ['/ressources-methodologiques-enseignant', 'Méthodologie'],
  ['/ressources-multimedias-enseignants', 'Multimédia'],
  ['/outils-educatifs', 'Outils'],
  ['/partage', 'Partage'],
  ['/apropos', 'À propos']
];

const MENU_OASIS = [
  {
    titre: 'Tableau de bord',
    liens: [
      ['dashboard', '/tableau-ressources', '⌂', 'Tableau de bord'],
      ['cours', '/catalogue?type=support', '□', 'Cours et leçons'],
      ['agenda', '/dashboard', '◷', 'Mon agenda'],
      ['evaluations', '/quiz', '?', 'Quiz et évaluations']
    ]
  },
  {
    titre: 'Ressources',
    liens: [
      ['pedagogie', '/ressources-pedagogiques-enseignant', '▤', 'Ressources pédagogiques'],
      ['eleves', '/ressources-pedagogiques-eleves', '▥', 'Pour les élèves'],
      ['methodologie', '/ressources-methodologiques-enseignant', '✦', 'Ressources méthodologiques'],
      ['multimedia', '/ressources-multimedias-enseignants', '▷', 'Ressources multimédia'],
      ['bibliotheque', '/ressources', '▥', 'Bibliothèque numérique'],
      ['cartes', '/cartes-geographiques', '◎', 'Cartes géographiques'],
      ['questions', '/banque-questions', '?', 'Banque de questions']
    ]
  },
  {
    titre: 'Évaluation',
    liens: [
      ['quiz', '/quiz', '✓', 'Quiz'],
      ['td', '/travaux-diriges', '▧', 'Travaux dirigés'],
      ['tp', '/travaux-pratiques', '⚗', 'Travaux pratiques'],
      ['exposes', '/exposes', '▣', 'Exposés'],
      ['dissertations', '/dissertations', '✎', 'Dissertations'],
      ['examens', '/examens', '▧', 'Examens']
    ]
  },
  {
    titre: 'Laboratoire virtuel',
    liens: [
      ['laboratoire', '/laboratoire', '⚗', 'Laboratoires virtuels'],
      ['nouveau-laboratoire', '/nouveau-laboratoire', '+', 'Nouveau laboratoire'],
      ['simulations', '/simulations', '△', 'Mes simulations'],
      ['experiences', '/experiences', '✤', 'Mes expériences']
    ]
  },
  {
    titre: 'Outils & logiciels',
    liens: [
      ['outils-educatifs', '/outils-educatifs', '⚙', 'Outils éducatifs'],
      ['ajouter-outil', '/ajouter-outil', '+', 'Ajouter un outil']
    ]
  },
  {
    titre: 'Communauté',
    liens: [
      ['forum', '/forum', '◌', 'Forum'],
      ['groupes', '/groupes', '♙', 'Groupes'],
      ['partage', '/partage', '⇄', 'Partage de ressources']
    ]
  }
];

function initiales(nom) {
  return (nom || '?').split(' ').map(m => m[0]).slice(0, 2).join('').toUpperCase();
}

function utilisateurCourant() {
  return Auth.charger() || { nom: 'Jean Baptiste', role: 'apprenant' };
}

function nomRole(role) {
  return ({ admin: 'Administrateur', enseignant: 'Enseignant', apprenant: 'Apprenant' }[role] || role || 'Apprenant');
}

function afficherEntete(actif = '') {
  const user = Auth.charger();
  const nav = LIENS_NAV.map(([href, label]) =>
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
    <form class="recherche" onsubmit="event.preventDefault(); location.href='/ressources?q='+encodeURIComponent(this.q.value)">
      <input name="q" placeholder="Rechercher un livre, une vidéo, un guide..." aria-label="Rechercher">
      <button type="submit" aria-label="Lancer la recherche">⌕</button>
    </form>
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
  return `<aside class="oasis-sidebar">
    <a href="/" class="side-brand">${LOGO_HTML}<span><b>OASIS</b><small>Centre numérique<br>d'apprentissage</small></span></a>
    ${MENU_OASIS.map(g => `<div class="side-group"><h3>${g.titre}</h3>
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
  const user = utilisateurCourant();
  return `<div class="oasis-topbar">
    <button class="menu-toggle" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Menu">☰</button>
    <form class="dash-search" onsubmit="event.preventDefault(); location.href='/ressources?q='+encodeURIComponent(this.q.value)">
      <input name="q" placeholder="${placeholder}">
      <button>⌕</button>
    </form>
    <div class="top-spacer"></div>
    ${action}
    <a class="top-icon" href="/dashboard" title="Notifications"><span class="badge">5</span>♧</a>
    <a class="top-icon" href="/dashboard" title="Messages"><span class="badge">3</span>✉</a>
    <a class="top-icon" href="/apropos" title="Aide">?</a>
    <a class="top-user" href="/dashboard"><span class="avatar">${initiales(user.nom)}</span><span><b>${user.nom}</b><small>${nomRole(user.role)}</small></span></a>
  </div>`;
}

function appShell(actif, contenu, droite = '', opts = {}) {
  return `<div class="oasis-app ${droite ? '' : 'sans-right'}">
    ${sidebarOasis(actif)}
    <main class="oasis-main">
      ${topbarOasis(opts.search || undefined, opts.action || '')}
      ${contenu}
    </main>
    ${droite ? `<aside class="oasis-right">${droite}</aside>` : ''}
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
