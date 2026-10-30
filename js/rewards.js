/* ── RÉCOMPENSES : MODÈLE, XP, BADGES ─────────────────────────────────────────
   Chaque patient a un compagnon (patient.reward) qui évolue avec les exercices
   terminés. Tout est dérivé de `sessions` ; patient.reward ne mémorise que les choix
   (apparence, objectifs) et les acquis qui ne doivent jamais se perdre (badges, XP max).
   Un « exercice terminé » = une entrée de `sessions` non partielle.
   Deux univers au choix (RW_THEMES) : robots ou légumes super-héros.
   L'affichage est dans rewards-ui.js, le dessin dans rewards-robot.js et rewards-veggie.js.
   ──────────────────────────────────────────────────────────────────────────── */

// XP minimale de chaque niveau (avant le rythme du patient) ; les noms dépendent de l'univers.
const RW_STAGE_XP = [0, 100, 300, 650, 1100];
// base : 1re fois qu'un exercice est terminé ; repeat : les fois suivantes
const RW_XP = { base: 30, repeat: 15, perStar: 10, record: 25 };

const RW_PLURAL = (g, one, many) => g + ' ' + (g > 1 ? many : one);
// Noms des badges épicènes (même forme pour une fille ou un garçon), plus lisibles
// pour un enfant que l'écriture avec point médian.
// stat = clé du compteur calculé par rwAnalyze ; g = objectif par défaut
const RW_BADGES = [
  { id:'first',    fam:'e', n:'Premier pas',       g:1,  stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev1' },
  { id:'five',     fam:'e', n:'Fidèle',            g:5,  stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev2' },
  { id:'marathon', fam:'e', n:'Infatigable',       g:25, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev3' },
  { id:'titan',    fam:'e', n:'Inarrêtable',       g:50, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev4' },
  { id:'record',   fam:'x', n:'Nouveau record',    g:1,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt'  },
  { id:'stars',    fam:'x', n:'Attrape-étoiles',   g:5,  stat:'stars3',  u:'exercices à 3 étoiles', d:g => RW_PLURAL(g,'exercice','exercices') + ' à 3 étoiles', gl:'star'  },
  { id:'perfect',  fam:'x', n:'Sans faute',        g:1,  stat:'perfect', u:'exercices parfaits',  d:g => RW_PLURAL(g,'exercice parfait','exercices parfaits'),  gl:'check' },
  { id:'triple',   fam:'x', n:'Machine à records', g:3,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt2' },
];
// Univers du compagnon : même progression (XP, niveaux, badges), dessin et vocabulaire propres.
// words(gender) : vocabulaire, accordé quand l'univers propose fille / garçon (genders).
// colors : [clé, libellé, [[couleur, niveau requis], …]] ; accs : k = clé du dessin, b = badge qui le débloque
// (speciesAccs : liste propre à un modèle, voir rwAccsOf).
const RW_THEMES = {
  robot: {
    label: 'Robots', genders: false,
    words: () => ({ my: 'Mon robot', see: 'Voir le robot', nameLabel: 'Nom du robot', defaultName: 'Zéphyr',
      stages: ['Prototype', 'Recrue', 'Pilote', 'Élite', 'Légende'], species: k => RW_ROBOT_SPECIES[k].label }),
    species: RW_ROBOT_SPECIES, order: ['orb', 'bolt', 'spike', 'tank'], draw: rwRobotSvg, badge: rwBadgeSvg,
    colors: [
      ['body',   'Carrosserie', [['#1b2440',0],['#2a1a40',0],['#12302e',0],['#3a1f2e',0],['#2b2f3a',0],['#cfd8ff',4],['#ffd24d',5]]],
      ['accent', 'Détails',     [['#00f0ff',0],['#ff2bd6',0],['#b6ff3b',2],['#ffe14d',3],['#ffffff',4],['#9a6bff',5]]],
      ['eye',    'Yeux',        [['#ff2bd6',0],['#00f0ff',0],['#b6ff3b',2],['#ffe14d',3],['#ff4d4d',4],['#ffffff',5]]],
    ],
    accs: [
      { k:'scarf',      n:'Écharpe',            b:'first'    },
      { k:'headphones', n:'Casque audio',       b:'five'     },
      { k:'shades',     n:'Lunettes',           b:'record'   },
      { k:'cape',       n:'Cape',               b:'stars'    },
      { k:'shield',     n:"Bouclier d'énergie", b:'perfect'  },
      { k:'jetpack',    n:'Jetpack',            b:'marathon' },
      { k:'drone',      n:'Drone compagnon',    b:'titan'    },
    ],
    // Accessoires propres à un modèle (thème « explorateur de l'espace » pour l'Orbe, dessin : rewards-robot-orb.js ; « chat ninja » pour la Lame).
    // Les modèles sans entrée ici gardent la liste ci-dessus.
    speciesAccs: {
      orb: [
        { k:'twinkle', n:'Antenne scintillante', b:'first'    },
        { k:'visor',   n:'Lunettes bandeau',     b:'five'     },
        { k:'comet',   n:'Étoile filante',       b:'marathon' },
        { k:'thrust',  n:'Réacteur embrasé',     b:'titan'    },
        { k:'scepter', n:'Sceptre de Saturne',   b:'record'   },
        { k:'drone',   n:'Drone compagnon',      b:'stars'    },
        { k:'bubble',  n:'Bulle de protection',  b:'perfect'  },
        { k:'wingfx',  n:"Ailes d'énergie",      b:'triple'   },
      ],
      // Lame : thème « chat ninja » (dessin : rewards-robot-spike.js). Pas d'accessoire pour « Machine à records ».
      spike: [
        { k:'cateye',   n:'Œil de chat',            b:'first'    },
        { k:'whiskers', n:'Moustaches scintillantes', b:'five'   },
        { k:'cape',     n:'Cape',                   b:'marathon' },
        { k:'headband', n:'Bandeau de ninja',       b:'titan'    },
        { k:'sabre',    n:'Sabre de samouraï',      b:'record'   },
        { k:'drone',    n:'Drone étoile de ninja',  b:'stars'    },
        { k:'shield',   n:"Bouclier d'énergie",     b:'perfect'  },
      ],
    },
  },
  veggie: {
    label: 'Légumes super-héros', genders: false,
    words: () => ({ my: 'Mon super-légume', see: 'Voir mon super-légume', nameLabel: 'Nom du super-légume', defaultName: 'Capitaine Croc',
      stages: ['Graine', 'Pousse', 'Costaud', 'Super-légume', 'Légende'], species: k => RW_VEGGIE_SPECIES[k].label }),
    species: RW_VEGGIE_SPECIES, order: ['carrot', 'radish', 'potato', 'broccoli'], draw: rwVeggieSvg, badge: rwVeggieBadgeSvg,
    colors: [
      ['accent', 'Cape',   [['#e8354a',0],['#2f6bd6',0],['#8a4fd6',0],['#ff8a1f',0],['#1fa89a',0],['#2b2533',0],['#ffd45c',5]]],
      ['mask',   'Masque', [['#2b2533',0],['#e8354a',0],['#2f6bd6',0],['#8a4fd6',0],['#1fa89a',0],['#ffffff',0]]],
    ],
    accs: [
      { k:'headband', n:'Bandeau de héros',   b:'first'    },
      { k:'teeth',    n:'Dents de lapin',     b:'five'     },
      { k:'shades',   n:'Lunettes de soleil', b:'record'   },
      { k:'shield',   n:'Bouclier casserole', b:'stars'    },
      { k:'bolts',    n:'Éclairs de pouvoir', b:'perfect'  },
      { k:'fork',     n:'Fourchette géante',  b:'marathon' },
      { k:'peas',     n:'Petits pois copains', b:'titan'   },
    ],
  },
};

function rwTheme(r) { return RW_THEMES[r.theme] || RW_THEMES.robot; }
function rwWords(r) { return rwTheme(r).words(r.gender); }
// Accessoires d'un modèle : sa liste propre si l'univers en définit une, sinon celle de l'univers.
function rwAccsOf(r, species = r.species) { const T = rwTheme(r); return (T.speciesAccs && T.speciesAccs[species]) || T.accs; }

// Apparence d'un patient dans son univers actuel : modèle, couleurs, accessoires, nom.
function rwLookOf(r) {
  const T = rwTheme(r);
  const look = { species: r.species, acc: r.acc, name: r.name };
  if (T.genders) look.gender = r.gender;
  T.colors.forEach(([key]) => { look[key] = r[key]; });
  return look;
}

// Apparence par défaut d'un univers.
function rwDefaultLook(theme) {
  const T = RW_THEMES[theme];
  const look = { species: T.order[0], acc: {} };
  if (T.genders) look.gender = 'f';
  look.name = T.words(look.gender).defaultName;
  T.colors.forEach(([key, , list]) => { look[key] = list[0][0]; });
  return look;
}

// Fille / garçon : le nom par défaut suit, un nom choisi par l'enfant est gardé.
function rwSetGender(r, gender) {
  const T = rwTheme(r);
  if (!T.genders || r.gender === gender) return;
  if (r.name === T.words(r.gender).defaultName) r.name = T.words(gender).defaultName;
  r.gender = gender;
}

// Changer d'univers garde la progression ; l'apparence de chaque univers est mémorisée à part.
function rwSetTheme(r, theme) {
  if (!RW_THEMES[theme] || r.theme === theme) return;
  const looks = r.looks || (r.looks = {});
  looks[r.theme] = rwLookOf(r);
  r.theme = theme;
  Object.assign(r, looks[theme] || rwDefaultLook(theme));
}

// ── Données du patient ───────────────────────────────────────────────────────
function rwDefaultGoals() { return Object.fromEntries(RW_BADGES.map(b => [b.id, b.g])); }

// Complète patient.reward avec les valeurs par défaut, sur place (sans sauvegarder) :
// l'objet renvoyé reste le même d'un appel à l'autre, on peut donc le modifier puis sauvegarder.
function getReward(patient) {
  const r = patient.reward || (patient.reward = {});
  // Univers inconnu (ou retiré) : retour aux robots, avec l'apparence par défaut si besoin.
  if (!RW_THEMES[r.theme]) r.theme = 'robot';
  if (r.species !== undefined && !rwTheme(r).species[r.species]) Object.assign(r, (r.looks && r.looks[r.theme]) || rwDefaultLook(r.theme));
  const defaults = { enabled: false, pace: 1, xpPeak: 0, unlocked: {}, goals: {}, ...rwDefaultLook(r.theme) };
  Object.keys(defaults).forEach(k => { if (r[k] === undefined) r[k] = defaults[k]; });
  Object.entries(rwDefaultGoals()).forEach(([id, g]) => { if (r.goals[id] === undefined) r.goals[id] = g; });
  // Collection par modèle : badges acquis (unlocked) et accessoires équipés (acc) sont rangés par modèle.
  // Avant, ils étaient à plat (un seul compagnon) : ils vont au modèle actuel, les autres repartent de zéro.
  if (Object.values(r.unlocked).some(v => typeof v === 'string')) r.unlocked = { [r.species]: r.unlocked };
  rwNestAcc(r);
  Object.values(r.looks || {}).forEach(rwNestAcc);
  // Les exercices d'avant la collection par modèle n'ont pas de `robot` : ils comptent pour ce modèle-là.
  if (!r.legacyRobot) r.legacyRobot = r.species;
  return r;
}

function rwNestAcc(look) {
  if (look.acc && Object.values(look.acc).some(v => typeof v === 'boolean')) look.acc = { [look.species]: look.acc };
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
// `robots` : compteurs des badges par modèle (s.robot, ou `legacy` pour les exercices d'avant).
function rwAnalyze(list, legacy) {
  const best = {};
  const out = { n: 0, stars3: 0, perfect: 0, records: 0, xp: 0, per: {}, robots: {} };
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
    const mine = out.robots[s.robot || legacy] || (out.robots[s.robot || legacy] = { n: 0, stars3: 0, perfect: 0, records: 0 });
    out.n++; mine.n++; out.xp += gain.total;
    if (record) { out.records++; mine.records++; }
    if (sub) return;
    if (stars === 3) { out.stars3++; mine.stars3++; }
    if (s.totalPairs > 0 && s.score === s.totalPairs) { out.perfect++; mine.perfect++; }
  });
  return out;
}

function rwThreshold(i, pace) { return Math.round(RW_STAGE_XP[i] * pace); }

function rwStageOf(xp, pace) {
  let stage = 1;
  RW_STAGE_XP.forEach((_, i) => { if (xp >= rwThreshold(i, pace)) stage = i + 1; });
  return stage;
}

// État courant : badges du modèle `species` (le modèle actuel par défaut ; acquis mémorisés + objectifs
// atteints, chaque modèle a sa propre collection), XP et niveau communs (l'XP ne baisse jamais).
function rwEvaluate(patient, list, species) {
  const r = getReward(patient), sp = species || r.species;
  const all = rwAnalyze(list || rwSessionsOf(patient), r.legacyRobot);
  const mine = all.robots[sp] || { n: 0, stars3: 0, perfect: 0, records: 0 };
  const on = new Set(Object.keys(r.unlocked[sp] || {}));
  RW_BADGES.forEach(b => { if (mine[b.stat] >= r.goals[b.id]) on.add(b.id); });
  const xp = Math.max(all.xp, r.xpPeak || 0);
  return { stats: { ...mine, per: all.per }, on, xp, stage: rwStageOf(xp, r.pace) };
}

// Le modèle a tous ses badges : sa collection est complète, on peut en adopter un autre.
function rwRobotComplete(ev) { return RW_BADGES.every(b => ev.on.has(b.id)); }

// À appeler une fois la session enregistrée : mémorise XP et badges, renvoie ce qui est nouveau.
function rwOnSessionSaved(session) {
  if (session.partial) return null;
  const patient = patients.find(p => p.id === session.patientId);
  if (!patient || !getReward(patient).enabled) return null;
  const r = patient.reward;
  // L'exercice compte pour le modèle actif au moment où il est terminé.
  if (!session.robot) { session.robot = r.species; saveSessions(); }
  const all = rwSessionsOf(patient);
  const before = rwEvaluate(patient, all.filter(s => s.id !== session.id));
  const after = rwEvaluate(patient, all);
  r.xpPeak = Math.max(r.xpPeak || 0, after.xp);
  const now = new Date().toISOString();
  const owned = r.unlocked[session.robot] || (r.unlocked[session.robot] = {});
  after.on.forEach(id => { if (!owned[id]) owned[id] = now; });
  savePatients();
  return {
    patient, session, ev: after,
    gain: after.stats.per[session.id],
    newBadges: RW_BADGES.filter(b => after.on.has(b.id) && !before.on.has(b.id)),
    levelUp: after.stage > before.stage ? after.stage : 0,
    robotDone: rwRobotComplete(after) && !rwRobotComplete(before),
  };
}
