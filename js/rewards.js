/* ── RÉCOMPENSES : MODÈLE, XP, BADGES ─────────────────────────────────────────
   Chaque patient a un robot compagnon (patient.reward) qui évolue avec les exercices
   terminés. Tout est dérivé de `sessions` ; patient.reward ne mémorise que les choix
   (apparence, objectifs) et les acquis qui ne doivent jamais se perdre (badges, XP max).
   Un « exercice terminé » = une entrée de `sessions` non partielle.
   L'affichage est dans rewards-ui.js, le dessin dans rewards-robot.js.
   ──────────────────────────────────────────────────────────────────────────── */

const RW_STAGES = [
  { n: 'Prototype', xp: 0 }, { n: 'Recrue', xp: 100 }, { n: 'Opérateur', xp: 300 },
  { n: 'Élite', xp: 650 }, { n: 'Légende', xp: 1100 },
];
const RW_XP = { base: 30, perStar: 10, record: 25 };

// [couleur, niveau requis]
const RW_BODY   = [['#1b2440',0],['#2a1a40',0],['#12302e',0],['#3a1f2e',0],['#2b2f3a',0],['#cfd8ff',4],['#ffd24d',5]];
const RW_ACCENT = [['#00f0ff',0],['#ff2bd6',0],['#b6ff3b',0],['#ffe14d',0],['#ffffff',0],['#9a6bff',0]];
const RW_EYE    = [['#ff2bd6',0],['#00f0ff',0],['#b6ff3b',0],['#ffe14d',0],['#ffffff',0],['#ff4d4d',0]];
const RW_SPECIES_ORDER = ['orb', 'bolt', 'spike', 'tank'];

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
// k = clé du dessin (rwRobotSvg), b = badge qui le débloque
const RW_ACCS = [
  { k:'cap',        n:'Casquette',          b:'first'    },
  { k:'headphones', n:'Casque audio',       b:'five'     },
  { k:'shades',     n:'Lunettes',           b:'record'   },
  { k:'cape',       n:'Cape',               b:'stars'    },
  { k:'shield',     n:"Bouclier d'énergie", b:'perfect'  },
  { k:'jetpack',    n:'Jetpack',            b:'marathon' },
  { k:'drone',      n:'Drone compagnon',    b:'titan'    },
];

// ── Données du patient ───────────────────────────────────────────────────────
function rwDefaultGoals() { return Object.fromEntries(RW_BADGES.map(b => [b.id, b.g])); }

// Complète patient.reward avec les valeurs par défaut, sur place (sans sauvegarder) :
// l'objet renvoyé reste le même d'un appel à l'autre, on peut donc le modifier puis sauvegarder.
function getReward(patient) {
  const r = patient.reward || (patient.reward = {});
  const defaults = {
    enabled: true, species: 'orb', name: 'Zéphyr', pace: 1, xpPeak: 0,
    body: RW_BODY[0][0], accent: RW_ACCENT[0][0], eye: RW_EYE[0][0],
    acc: {}, unlocked: {}, goals: {},
  };
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
// (le premier essai d'un exercice n'est jamais un record). `per` : gains par session.
function rwAnalyze(list) {
  const best = {};
  const out = { n: 0, stars3: 0, perfect: 0, records: 0, xp: 0, per: {} };
  list.forEach(s => {
    const ratio = s.totalPairs > 0 ? s.score / s.totalPairs : 0;
    const stars = starsForRatio(ratio);
    const record = s.exerciseId in best && ratio > best[s.exerciseId];
    best[s.exerciseId] = Math.max(best[s.exerciseId] ?? 0, ratio);
    const gain = { base: RW_XP.base, stars, starsXp: stars * RW_XP.perStar, record, recordXp: record ? RW_XP.record : 0 };
    gain.total = gain.base + gain.starsXp + gain.recordXp;
    out.per[s.id] = gain;
    out.n++; out.xp += gain.total;
    if (stars === 3) out.stars3++;
    if (record) out.records++;
    if (s.totalPairs > 0 && s.score === s.totalPairs) out.perfect++;
  });
  return out;
}

function rwThreshold(i, pace) { return Math.round(RW_STAGES[i].xp * pace); }

function rwStageOf(xp, pace) {
  let stage = 1;
  RW_STAGES.forEach((_, i) => { if (xp >= rwThreshold(i, pace)) stage = i + 1; });
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
