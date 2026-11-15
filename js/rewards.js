/* ── RÉCOMPENSES : MODÈLE, XP, BADGES ─────────────────────────────────────────
   Chaque patient a un compagnon (patient.reward) qui évolue avec les exercices
   terminés. Tout est dérivé de `sessions` ; patient.reward ne mémorise que les choix
   (apparence, objectifs) et les acquis qui ne doivent jamais se perdre (badges, XP max).
   Chaque modèle (Orbe, Carotte…) est un personnage indépendant : son XP, son niveau, ses
   badges, ses accessoires, ses couleurs et son nom lui sont propres (rangés par modèle).
   Un « exercice terminé » = une entrée de `sessions` non partielle.
   Deux univers au choix (RW_THEMES) : robots ou légumes super-héros.
   L'affichage est dans rewards-ui.js, le dessin dans rewards-robot.js et rewards-veggie.js (+ un fichier d'accessoires par modèle).
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
  { id:'marathon', fam:'e', n:'Infatigable',       g:15, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev3' },
  { id:'titan',    fam:'e', n:'Inarrêtable',       g:20, stat:'n',       u:'exercices terminés',  d:g => 'Terminer ' + RW_PLURAL(g,'exercice','exercices'),     gl:'chev4' },
  { id:'record',   fam:'x', n:'Nouveau record',    g:1,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt'  },
  { id:'stars',    fam:'x', n:'Attrape-étoiles',   g:5,  stat:'stars3',  u:'exercices à 3 étoiles', d:g => RW_PLURAL(g,'exercice','exercices') + ' à 3 étoiles', gl:'star'  },
  { id:'perfect',  fam:'x', n:'Sans faute',        g:1,  stat:'perfect', u:'exercices parfaits',  d:g => RW_PLURAL(g,'exercice parfait','exercices parfaits'),  gl:'check' },
  { id:'triple',   fam:'x', n:'Machine à records', g:3,  stat:'records', u:'records battus',      d:g => 'Battre ' + RW_PLURAL(g,'record','records') + ' perso', gl:'bolt2' },
];
// Couleurs de cape et de masque des légumes qui ont leurs propres couleurs (speciesColors).
const RW_VEG_CAPE = ['accent', 'Cape',   [['#e8354a',0],['#2f6bd6',0],['#8a4fd6',2],['#1fa89a',3],['#ff8a1f',4],['#2b2533',4],['#ffd45c',5]]];
const RW_VEG_MASK = ['mask',   'Masque', [['#2b2533',0],['#e8354a',0],['#2f6bd6',0],['#8a4fd6',0],['#1fa89a',0],['#ffffff',0]]];
// Univers du compagnon : même progression (XP, niveaux, badges), dessin et vocabulaire propres.
// words(gender) : vocabulaire, accordé quand l'univers propose fille / garçon (genders).
// colors : [clé, libellé, [[couleur, niveau requis], …]] ; accs : k = clé du dessin, b = badge qui le débloque
// (speciesAccs / speciesColors : listes propres à un modèle, voir rwAccsOf / rwColorsOf).
const RW_THEMES = {
  robot: {
    label: 'Robots', genders: false,
    words: () => ({ my: 'Mon robot', see: 'Voir le robot', nameLabel: 'Nom du robot',
      names: { orb: 'Zéphyr', bolt: 'Boulon', spike: 'Shuriken', tank: 'Bulldo' },
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
      // Cube : thème « bricoleur / atelier » (dessin : rewards-robot-bolt.js).
      bolt: [
        { k:'goggles', n:'Lunettes de soudeur',   b:'first'    },
        { k:'belt',    n:"Ceinture d'outils",     b:'five'     },
        { k:'springs', n:'Ressorts aux jambes',   b:'marathon' },
        { k:'solar',   n:'Panneau solaire',       b:'titan'    },
        { k:'wrench',  n:'Clé à molette',         b:'record'   },
        { k:'cogdrone', n:'Drone engrenage',      b:'stars'    },
        { k:'toolbox', n:'Boîte à outils',        b:'perfect'  },
        { k:'gears',   n:'Moteur à engrenages',   b:'triple'   },
      ],
      // Char : thème « engin de chantier » (dessin : rewards-robot-tank.js).
      tank: [
        { k:'beacon',     n:'Gyrophare',            b:'first'    },
        { k:'headlights', n:'Phares',               b:'five'     },
        { k:'flag',       n:'Drapeau à damier',     b:'marathon' },
        { k:'dozer',      n:'Pelle de bulldozer',   b:'titan'    },
        { k:'lantern',    n:"Lanterne d'explorateur", b:'record' },
        { k:'drone',      n:'Drone compagnon',      b:'stars'    },
        { k:'armor',      n:'Blindage rivetté',     b:'perfect'  },
        { k:'turbo',      n:'Pots turbo',           b:'triple'   },
      ],
    },
  },
  veggie: {
    label: 'Légumes super-héros', genders: false,
    words: () => ({ my: 'Mon super-légume', see: 'Voir mon super-légume', nameLabel: 'Nom du super-légume',
      names: { carrot: 'Capitaine Croc', radish: 'Barbe-Rose', potato: 'Sire Patate', broccoli: 'Brocoman' },
      stages: ['Graine', 'Pousse', 'Costaud', 'Super-légume', 'Légende'], species: k => RW_VEGGIE_SPECIES[k].label }),
    species: RW_VEGGIE_SPECIES, order: ['carrot', 'radish', 'potato', 'broccoli'], draw: rwVeggieSvg, badge: rwVeggieBadgeSvg,
    colors: [
      ['accent', 'Cape',   [['#e8354a',0],['#2f6bd6',0],['#8a4fd6',0],['#ff8a1f',0],['#1fa89a',0],['#2b2533',0],['#ffd45c',5]]],
      ['mask',   'Masque', [['#2b2533',0],['#e8354a',0],['#2f6bd6',0],['#8a4fd6',0],['#1fa89a',0],['#ffffff',0]]],
    ],
    // Couleurs propres à un modèle, à débloquer niveau par niveau.
    // Carotte : cape et lunettes de soleil (lens) ; Patate : cape et blason (crest : bouclier, étendard) ;
    // Brocoli : cape et peintures (paint : peintures des joues, pétales de la couronne de fleurs) ;
    // Radis : cape et foulard (scarf : foulard de pirate ; pas de rouge, il disparaîtrait sur le radis).
    speciesColors: {
      carrot: [RW_VEG_CAPE, RW_VEG_MASK, ['lens',  'Lunettes', [['#1d1a28',0],['#e8354a',0],['#2f6bd6',2],['#ff5fa8',3],['#1fa89a',4],['#ffd45c',5]]]],
      potato: [RW_VEG_CAPE, RW_VEG_MASK, ['crest', 'Blason',   [['#2f6bd6',0],['#e8354a',0],['#1fa89a',2],['#8a4fd6',3],['#2b2533',4],['#ffd45c',5]]]],
      broccoli: [RW_VEG_CAPE, RW_VEG_MASK, ['paint', 'Peintures', [['#ff5fa8',0],['#2f6bd6',0],['#ff8a1f',2],['#e8354a',3],['#8a4fd6',4],['#ffd45c',5]]]],
      radish:   [RW_VEG_CAPE, RW_VEG_MASK, ['scarf', 'Foulard',   [['#2f6bd6',0],['#2b2533',0],['#1fa89a',2],['#ff8a1f',3],['#8a4fd6',4],['#ffd45c',5]]]],
    },
    accs: [
      { k:'headband', n:'Bandeau de héros',   b:'first'    },
      { k:'teeth',    n:'Dents de lapin',     b:'five'     },
      { k:'shades',   n:'Lunettes de soleil', b:'record'   },
      { k:'shield',   n:'Bouclier casserole', b:'stars'    },
      { k:'bolts',    n:'Éclairs de pouvoir', b:'perfect'  },
      { k:'fork',     n:'Fourchette géante',  b:'marathon' },
      { k:'peas',     n:'Petits pois copains', b:'titan'   },
    ],
    // Accessoires propres à un modèle (dessin : rewards-veggie-carrot.js, -potato.js, -broccoli.js, -radish.js).
    speciesAccs: {
      carrot: [
        { k:'sparkle',   n:'Fanes scintillantes', b:'first'    },
        { k:'moustache', n:'Moustache',           b:'five'     },
        { k:'fork',      n:'Fourchette géante',   b:'marathon' },
        { k:'peas',      n:'Petits pois copains', b:'titan'    },
        { k:'shades',    n:'Lunettes de soleil',  b:'record'   },
        { k:'oval',      n:'Bouclier ovale',      b:'stars'    },
        { k:'superS',    n:'Grand S de héros',    b:'perfect'  },
        { k:'belt',      n:'Ceinturon',           b:'triple'   },
      ],
      // Patate : « Super-patate », chevalier (dessin : rewards-veggie-potato.js).
      potato: [
        { k:'helmet', n:'Casque casserole',      b:'first'    },
        { k:'plume',  n:'Plume sur le casque',   b:'five'     },
        { k:'banner', n:'Étendard',              b:'marathon' },
        { k:'horse',  n:'Cheval-bâton',          b:'titan'    },
        { k:'sword',  n:'Épée-frite géante',     b:'record'   },
        { k:'pig',    n:'Petit cochon compagnon', b:'stars'   },
        { k:'blason', n:'Bouclier à blason',     b:'perfect'  },
        { k:'crown',  n:'Couronne du petit cochon', b:'triple' },
      ],
      // Brocoli : « Super-brocoli », jungle (dessin : rewards-veggie-broccoli.js).
      broccoli: [
        { k:'ladybug', n:'Coccinelle copine',       b:'first'    },
        { k:'paint',   n:'Peintures de jungle',     b:'five'     },
        { k:'vine',    n:'Liane',                   b:'marathon' },
        { k:'drum',    n:'Tambour',                 b:'titan'    },
        { k:'tornado', n:'Mini tornade',            b:'record'   },
        { k:'bird',    n:"Oiseau lanceur d'éclairs", b:'stars'   },
        { k:'flowers', n:'Couronne de fleurs',      b:'perfect'  },
        { k:'rainbow', n:'Arc-en-ciel',             b:'triple'   },
      ],
      // Radis : « Super-radis », pirate (dessin : rewards-veggie-radish.js).
      radish: [
        { k:'patch',    n:"Bandeau sur l'œil",       b:'first'    },
        { k:'scarf',    n:'Foulard de pirate',       b:'five'     },
        { k:'map',      n:'Carte au trésor',         b:'marathon' },
        { k:'hat',      n:'Tricorne',                b:'titan'    },
        { k:'sabre',    n:'Sabre en bois',           b:'record'   },
        { k:'parrot',   n:'Perroquet copain',        b:'stars'    },
        { k:'spyglass', n:'Longue-vue',              b:'perfect'  },
        { k:'fire',     n:'Perroquet crache du feu', b:'triple'   },
      ],
    },
  },
};

function rwTheme(r) { return RW_THEMES[r.theme] || RW_THEMES.robot; }
function rwWords(r) { return rwTheme(r).words(r.gender); }
// Accessoires d'un modèle : sa liste propre si l'univers en définit une, sinon celle de l'univers.
function rwAccsOf(r, species = r.species) { const T = rwTheme(r); return (T.speciesAccs && T.speciesAccs[species]) || T.accs; }
// Couleurs proposées pour un modèle : sa liste propre si l'univers en définit une, sinon celle de l'univers.
function rwColorsOf(r, species = r.species) { const T = rwTheme(r); return (T.speciesColors && T.speciesColors[species]) || T.colors; }
// Toutes les couleurs d'un univers (une entrée par clé, la liste de l'univers d'abord) : l'apparence les garde toutes.
function rwAllColors(T) {
  const seen = new Set();
  return [T.colors, ...Object.values(T.speciesColors || {})].flat().filter(([key]) => !seen.has(key) && seen.add(key));
}

// Apparence d'un modèle (`sp`, de l'univers `theme`) : ses couleurs à lui (r.colors[sp]),
// sinon la 1re couleur de sa liste. Les accessoires et le nom sont à part (r.acc, r.names).
function rwLookOf(r, sp = r.species, theme = r.theme) {
  const T = RW_THEMES[theme], own = (r.colors && r.colors[sp]) || {};
  const mine = Object.fromEntries(rwColorsOf({ theme }, sp).map(([key, , list]) => [key, list[0][0]]));
  const look = { species: sp };
  if (T.genders) look.gender = r.gender;
  rwAllColors(T).forEach(([key, , list]) => { look[key] = own[key] ?? mine[key] ?? list[0][0]; });
  return look;
}

// Choix par défaut d'un univers (le modèle actif ; fille par défaut si l'univers le propose).
function rwDefaultLook(theme) {
  const T = RW_THEMES[theme];
  const look = { species: T.order[0] };
  if (T.genders) look.gender = 'f';
  return look;
}

// Nom d'un modèle : celui choisi par l'enfant, sinon le nom par défaut du modèle.
function rwName(r, sp = r.species) {
  return r.names && r.names[sp] !== undefined ? r.names[sp] : (rwWords(r).names[sp] || '');
}

// Fille / garçon : un nom jamais modifié suit le nom par défaut, un nom choisi est gardé.
function rwSetGender(r, gender) {
  if (rwTheme(r).genders) r.gender = gender;
}

// Changer d'univers : chaque univers mémorise son modèle actif (et fille / garçon).
function rwSetTheme(r, theme) {
  if (!RW_THEMES[theme] || r.theme === theme) return;
  const looks = r.looks || (r.looks = {});
  looks[r.theme] = { species: r.species, ...(r.gender !== undefined ? { gender: r.gender } : {}) };
  r.theme = theme;
  const back = looks[theme] && RW_THEMES[theme].species[looks[theme].species] ? looks[theme] : rwDefaultLook(theme);
  r.species = back.species;
  if (back.gender !== undefined) r.gender = back.gender;
}

// ── Données du patient ───────────────────────────────────────────────────────
function rwDefaultGoals() { return Object.fromEntries(RW_BADGES.map(b => [b.id, b.g])); }

// Complète patient.reward avec les valeurs par défaut, sur place (sans sauvegarder) :
// l'objet renvoyé reste le même d'un appel à l'autre, on peut donc le modifier puis sauvegarder.
function getReward(patient) {
  const r = patient.reward || (patient.reward = {});
  // Univers inconnu (ou retiré) : retour aux robots, avec le modèle mémorisé ou celui par défaut.
  if (!RW_THEMES[r.theme]) r.theme = 'robot';
  if (r.species !== undefined && !rwTheme(r).species[r.species]) {
    const back = r.looks && r.looks[r.theme];
    r.species = back && rwTheme(r).species[back.species] ? back.species : rwTheme(r).order[0];
  }
  const defaults = { enabled: false, pace: 1, unlocked: {}, goals: {}, acc: {}, ...rwDefaultLook(r.theme) };
  Object.keys(defaults).forEach(k => { if (r[k] === undefined) r[k] = defaults[k]; });
  Object.entries(rwDefaultGoals()).forEach(([id, g]) => { if (r.goals[id] === undefined) r.goals[id] = g; });
  // Objectifs par défaut d'Infatigable / Inarrêtable passés de 25 / 50 à 15 / 20 : les patients
  // restés sur les anciens défauts suivent (une seule fois, un objectif choisi ensuite est respecté).
  if (!r.goalsV) {
    if (r.goals.marathon === 25) r.goals.marathon = 15;
    if (r.goals.titan === 50) r.goals.titan = 20;
    r.goalsV = 2;
  }
  // Collection par modèle : badges acquis (unlocked) et accessoires équipés (acc) sont rangés par modèle.
  // Avant, ils étaient à plat (un seul compagnon) : ils vont au modèle actuel, les autres repartent de zéro.
  if (Object.values(r.unlocked).some(v => typeof v === 'string')) r.unlocked = { [r.species]: r.unlocked };
  rwNestAcc(r);
  // Les exercices d'avant la collection par modèle n'ont pas de `robot` : ils comptent pour ce modèle-là.
  if (!r.legacyRobot) r.legacyRobot = r.species;
  rwSplitLooks(patient, r);
  return r;
}

function rwNestAcc(look) {
  if (look.acc && Object.values(look.acc).some(v => typeof v === 'boolean')) look.acc = { [look.species]: look.acc };
}

// Migration unique vers des personnages indépendants. Avant, l'apparence (couleurs, nom, accessoires)
// était rangée par univers (r et r.looks[univers]) et l'XP max (xpPeak) était commune à tous les modèles.
// Le nom et les couleurs de chaque univers vont à son modèle actif, les accessoires (déjà par modèle)
// sont regroupés dans r.acc, et l'XP de chaque modèle se recalcule à partir de ses propres exercices.
// Si l'ancienne XP max dépassait l'XP des exercices (sessions supprimées), le surplus reste au modèle
// actif : il ne perd jamais de niveau.
function rwSplitLooks(patient, r) {
  if (r.names && r.colors && r.xpPeak && typeof r.xpPeak === 'object') return;
  const looks = [[r, r.theme], ...Object.entries(r.looks || {}).filter(([t]) => RW_THEMES[t] && t !== r.theme).map(([t, l]) => [l, t])];
  if (!r.names) {
    r.names = {};
    looks.forEach(([l]) => { if (l.name !== undefined && l.species && r.names[l.species] === undefined) r.names[l.species] = l.name; });
  }
  if (!r.colors) {
    r.colors = {};
    looks.forEach(([l, t]) => {
      const c = {};
      rwAllColors(RW_THEMES[t]).forEach(([key]) => { if (l[key] !== undefined) c[key] = l[key]; });
      if (l.species && !r.colors[l.species] && Object.keys(c).length) r.colors[l.species] = c;
    });
  }
  Object.values(r.looks || {}).forEach(l => {
    rwNestAcc(l);
    Object.entries(l.acc || {}).forEach(([sp, a]) => { if (!r.acc[sp]) r.acc[sp] = a; });
  });
  // Ne garder que le choix du modèle actif (et fille / garçon) : le reste est désormais par modèle.
  looks.forEach(([l, t]) => {
    delete l.name;
    rwAllColors(RW_THEMES[t]).forEach(([key]) => { delete l[key]; });
    if (l !== r) delete l.acc;
  });
  if (typeof r.xpPeak !== 'object' || r.xpPeak === null) {
    const old = r.xpPeak || 0, all = rwAnalyze(rwSessionsOf(patient), r.legacyRobot);
    const own = (all.robots[r.species] || { xp: 0 }).xp;
    r.xpPeak = old > all.xp ? { [r.species]: own + old - all.xp } : {};
  }
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
// `robots` : XP et compteurs des badges par modèle (s.robot, ou `legacy` pour les exercices d'avant).
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
    const mine = out.robots[s.robot || legacy] || (out.robots[s.robot || legacy] = { n: 0, stars3: 0, perfect: 0, records: 0, xp: 0 });
    out.n++; mine.n++; out.xp += gain.total; mine.xp += gain.total;
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

// État courant du modèle `species` (le modèle actuel par défaut) : ses badges (acquis mémorisés +
// objectifs atteints), son XP et son niveau, calculés sur ses seuls exercices (l'XP ne baisse jamais).
function rwEvaluate(patient, list, species) {
  const r = getReward(patient), sp = species || r.species;
  const all = rwAnalyze(list || rwSessionsOf(patient), r.legacyRobot);
  const mine = all.robots[sp] || { n: 0, stars3: 0, perfect: 0, records: 0, xp: 0 };
  const on = new Set(Object.keys(r.unlocked[sp] || {}));
  RW_BADGES.forEach(b => { if (mine[b.stat] >= r.goals[b.id]) on.add(b.id); });
  const xp = Math.max(mine.xp, r.xpPeak[sp] || 0);
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
  const before = rwEvaluate(patient, all.filter(s => s.id !== session.id), session.robot);
  const after = rwEvaluate(patient, all, session.robot);
  r.xpPeak[session.robot] = Math.max(r.xpPeak[session.robot] || 0, after.xp);
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
