/* ── RÉCOMPENSES : MODÈLE, XP, BADGES ─────────────────────────────────────────
   Chaque patient a un compagnon (patient.reward) qui évolue avec les exercices
   terminés. Tout est dérivé de `sessions` ; patient.reward ne mémorise que les choix
   (apparence, objectifs) et les acquis qui ne doivent jamais se perdre (badges, XP max).
   Un « exercice terminé » = une entrée de `sessions` non partielle.
   Deux univers au choix (RW_THEMES) : robots ou créatures magiques.
   L'affichage est dans rewards-ui.js, le dessin dans rewards-robot.js et rewards-magic.js.
   ──────────────────────────────────────────────────────────────────────────── */

// XP minimale de chaque niveau (avant le rythme du patient) ; les noms dépendent de l'univers.
const RW_STAGE_XP = [0, 100, 300, 650, 1100];
// base : 1re fois qu'un exercice est terminé ; repeat : les fois suivantes
const RW_XP = { base: 30, repeat: 15, perStar: 10, record: 25 };

const RW_PLURAL = (g, one, many) => g + ' ' + (g > 1 ? many : one);
// stat = clé du compteur calculé par rwAnalyze ; g = objectif par défaut
const RW_BADGES = [
  { id:'first',    fam:'e', n:'Premier pas',       g:1,  stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev1' },
  { id:'five',     fam:'e', n:'Habitué',           g:5,  stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev2' },
  { id:'marathon', fam:'e', n:'Marathonien',       g:25, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev3' },
  { id:'titan',    fam:'e', n:'Titan',             g:50, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev4' },
  { id:'record',   fam:'x', n:'Nouveau record',    g:1,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt'  },
  { id:'stars',    fam:'x', n:"Chasseur d'étoiles",g:5,  stat:'stars3',  u:'exercices à 3 étoiles', d:g => RW_PLURAL(g,'exercice','exercices') + ' à 3 étoiles', gl:'star'  },
  { id:'perfect',  fam:'x', n:'Sans faute',        g:1,  stat:'perfect', u:'exercices parfaits',  d:g => RW_PLURAL(g,'exercice parfait','exercices parfaits'),  gl:'check' },
  { id:'triple',   fam:'x', n:'Machine à records', g:3,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt2' },
];
// Univers du compagnon : même progression (XP, niveaux, badges), dessin et vocabulaire propres.
// colors : [clé, libellé, [[couleur, niveau requis], …]] ; accs : k = clé du dessin, b = badge qui le débloque.
const RW_THEMES = {
  robot: {
    label: 'Robots', my: 'Mon robot', see: 'Voir le robot', nameLabel: 'Nom du robot', defaultName: 'Zéphyr',
    stages: ['Prototype', 'Recrue', 'Opérateur', 'Élite', 'Légende'],
    species: RW_ROBOT_SPECIES, order: ['orb', 'bolt', 'spike', 'tank'], draw: rwRobotSvg, badge: rwBadgeSvg,
    colors: [
      ['body',   'Carrosserie', [['#1b2440',0],['#2a1a40',0],['#12302e',0],['#3a1f2e',0],['#2b2f3a',0],['#cfd8ff',4],['#ffd24d',5]]],
      ['accent', 'Détails',     [['#00f0ff',0],['#ff2bd6',0],['#b6ff3b',0],['#ffe14d',0],['#ffffff',0],['#9a6bff',0]]],
      ['eye',    'Yeux',        [['#ff2bd6',0],['#00f0ff',0],['#b6ff3b',0],['#ffe14d',0],['#ffffff',0],['#ff4d4d',0]]],
    ],
    accs: [
      { k:'cap',        n:'Casquette',          b:'first'    },
      { k:'headphones', n:'Casque audio',       b:'five'     },
      { k:'shades',     n:'Lunettes',           b:'record'   },
      { k:'cape',       n:'Cape',               b:'stars'    },
      { k:'shield',     n:"Bouclier d'énergie", b:'perfect'  },
      { k:'jetpack',    n:'Jetpack',            b:'marathon' },
      { k:'drone',      n:'Drone compagnon',    b:'titan'    },
    ],
  },
  magic: {
    label: 'Créatures magiques', my: 'Ma créature', see: 'Voir la créature', nameLabel: 'Nom de la créature', defaultName: 'Pompon',
    stages: ['Œuf', 'Bébé', 'Apprenti', 'Étoile', 'Légende'],
    species: RW_MAGIC_SPECIES, order: ['unicorn', 'dragon', 'cat', 'axolotl'], draw: rwMagicSvg, badge: rwMagicBadgeSvg,
    colors: [
      ['body',   'Couleur', [['#ffd6e8',0],['#e3d5ff',0],['#c9f3e1',0],['#cfe8ff',0],['#ffe0c7',0],['#fffaf2',4],['#ffe48a',5]]],
      ['accent', 'Détails', [['#ff7eb6',0],['#a07cff',0],['#3fcf9f',0],['#5aa9ff',0],['#ffb347',0],['#ffd23f',0]]],
      ['eye',    'Yeux',    [['#3d2b4f',0],['#2a3f73',0],['#1f5a46',0],['#6b3a2e',0],['#7a2e6b',0],['#14141f',0]]],
    ],
    accs: [
      { k:'bow',      n:'Nœud',               b:'first'    },
      { k:'flowers',  n:'Couronne de fleurs', b:'five'     },
      { k:'hearts',   n:'Lunettes cœur',      b:'record'   },
      { k:'starcape', n:'Cape étoilée',       b:'stars'    },
      { k:'bubble',   n:'Bulle magique',      b:'perfect'  },
      { k:'balloon',  n:'Ballon cœur',        b:'marathon' },
      { k:'buddy',    n:'Petite étoile',      b:'titan'    },
    ],
  },
};

function rwTheme(r) { return RW_THEMES[r.theme] || RW_THEMES.robot; }

// Apparence par défaut d'un univers (modèle, couleurs, accessoires, nom).
function rwDefaultLook(theme) {
  const T = RW_THEMES[theme];
  const look = { species: T.order[0], acc: {}, name: T.defaultName };
  T.colors.forEach(([key, , list]) => { look[key] = list[0][0]; });
  return look;
}

// Changer d'univers garde la progression ; l'apparence de chaque univers est mémorisée à part.
function rwSetTheme(r, theme) {
  if (!RW_THEMES[theme] || r.theme === theme) return;
  const looks = r.looks || (r.looks = {});
  looks[r.theme] = { species: r.species, body: r.body, accent: r.accent, eye: r.eye, acc: r.acc, name: r.name };
  r.theme = theme;
  Object.assign(r, looks[theme] || rwDefaultLook(theme));
}

// ── Données du patient ───────────────────────────────────────────────────────
function rwDefaultGoals() { return Object.fromEntries(RW_BADGES.map(b => [b.id, b.g])); }

// Complète patient.reward avec les valeurs par défaut, sur place (sans sauvegarder) :
// l'objet renvoyé reste le même d'un appel à l'autre, on peut donc le modifier puis sauvegarder.
function getReward(patient) {
  const r = patient.reward || (patient.reward = {});
  if (!RW_THEMES[r.theme]) r.theme = 'robot';
  const defaults = { enabled: true, pace: 1, xpPeak: 0, unlocked: {}, goals: {}, ...rwDefaultLook(r.theme) };
  Object.keys(defaults).forEach(k => { if (r[k] === undefined) r[k] = defaults[k]; });
  Object.entries(rwDefaultGoals()).forEach(([id, g]) => { if (r.goals[id] === undefined) r.goals[id] = g; });
  return r;
}

function rwSessionsOf(patient) {
  return sessions
    .filter(s => s.patientId === patient.id && !s.partial)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ── Calculs ──────────────────────────────────────────────────────────────────
// `list` : exercices terminés d'un patient, du plus ancien au plus récent.
// Un record = meilleur ratio que tous les essais précédents du même exercice
// (le premier essai d'un exercice n'est jamais un record). Refaire un exercice déjà
// terminé rapporte RW_XP.repeat au lieu de RW_XP.base. `per` : gains par session.
function rwAnalyze(list) {
  const best = {};
  const out = { n: 0, stars3: 0, perfect: 0, records: 0, xp: 0, per: {} };
  list.forEach(s => {
    const ratio = s.totalPairs > 0 ? s.score / s.totalPairs : 0;
    const stars = starsForRatio(ratio);
    // Un passage « items échoués » ne porte que sur une partie de l'exercice : jamais une
    // 1re fois ni un record, et il ne compte pas pour les exploits 3 étoiles / sans faute.
    const sub = !!s.failedOnly;
    const first = !sub && !(s.exerciseId in best);
    const record = !sub && !first && ratio > best[s.exerciseId];
    if (!sub) best[s.exerciseId] = Math.max(best[s.exerciseId] ?? 0, ratio);
    const gain = { first, base: first ? RW_XP.base : RW_XP.repeat, stars, starsXp: stars * RW_XP.perStar, record, recordXp: record ? RW_XP.record : 0 };
    gain.total = gain.base + gain.starsXp + gain.recordXp;
    out.per[s.id] = gain;
    out.n++; out.xp += gain.total;
    if (record) out.records++;
    if (sub) return;
    if (stars === 3) out.stars3++;
    if (s.totalPairs > 0 && s.score === s.totalPairs) out.perfect++;
  });
  return out;
}

function rwThreshold(i, pace) { return Math.round(RW_STAGE_XP[i] * pace); }

function rwStageOf(xp, pace) {
  let stage = 1;
  RW_STAGE_XP.forEach((_, i) => { if (xp >= rwThreshold(i, pace)) stage = i + 1; });
  return stage;
}

// État courant : badges (acquis mémorisés + objectifs atteints), XP (jamais en baisse), niveau.
function rwEvaluate(patient, list) {
  const r = getReward(patient);
  const stats = rwAnalyze(list || rwSessionsOf(patient));
  const on = new Set(Object.keys(r.unlocked));
  RW_BADGES.forEach(b => { if (stats[b.stat] >= r.goals[b.id]) on.add(b.id); });
  const xp = Math.max(stats.xp, r.xpPeak || 0);
  return { stats, on, xp, stage: rwStageOf(xp, r.pace) };
}

// À appeler une fois la session enregistrée : mémorise XP et badges, renvoie ce qui est nouveau.
function rwOnSessionSaved(session) {
  if (session.partial) return null;
  const patient = patients.find(p => p.id === session.patientId);
  if (!patient || !getReward(patient).enabled) return null;
  const r = patient.reward;
  const all = rwSessionsOf(patient);
  const before = rwEvaluate(patient, all.filter(s => s.id !== session.id));
  const after = rwEvaluate(patient, all);
  r.xpPeak = Math.max(r.xpPeak || 0, after.xp);
  const now = new Date().toISOString();
  after.on.forEach(id => { if (!r.unlocked[id]) r.unlocked[id] = now; });
  savePatients();
  return {
    patient, session, ev: after,
    gain: after.stats.per[session.id],
    newBadges: RW_BADGES.filter(b => after.on.has(b.id) && !before.on.has(b.id)),
    levelUp: after.stage > before.stage ? after.stage : 0,
  };
}
