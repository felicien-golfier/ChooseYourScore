/* ── RÉCOMPENSES : ÉCRANS ─────────────────────────────────────────────────────
   - fenêtre « Mon robot » (apparence, évolution, badges)
   - bloc de fin d'exercice (gains, nouveaux badges)
   - carte du robot sur l'écran de départ
   - réglages du patient (fiche patient : activer, rythme, objectifs des badges)
   Modèle et calculs : rewards.js. Dessin : rewards-robot.js.
   ──────────────────────────────────────────────────────────────────────────── */

let rwUidCount = 0;
let rwModalPatientId = null;
let rwModalTab = 'robot';

function rwRobotFor(patient, ev, over = {}) {
  const r = getReward(patient);
  const acc = {};
  RW_ACCS.forEach(a => { acc[a.k] = !!r.acc[a.k] && ev.on.has(a.b); });
  return rwRobotSvg({
    species: r.species, stage: ev.stage, body: r.body, accent: r.accent, eye: r.eye, acc,
    uid: 'u' + (++rwUidCount), ...over,
  });
}

function rwXpProgress(ev, pace) {
  const cur = rwThreshold(ev.stage - 1, pace);
  const nxt = ev.stage < RW_STAGES.length ? rwThreshold(ev.stage, pace) : null;
  return {
    pct: nxt ? Math.min(100, (ev.xp - cur) / (nxt - cur) * 100) : 100,
    text: nxt ? 'Encore ' + (nxt - ev.xp) + ' XP pour devenir ' + RW_STAGES[ev.stage].n : 'Forme finale atteinte !',
  };
}

// ── Fenêtre « Mon robot » ────────────────────────────────────────────────────
function openRewardModal(patientId) {
  rwModalPatientId = patientId;
  rwModalTab = 'robot';
  renderRewardModal();
  document.getElementById('reward-modal').style.display = 'flex';
}

function closeRewardModal() {
  document.getElementById('reward-modal').style.display = 'none';
  rwModalPatientId = null;
  renderSetupReward();
  const p = typeof getSelectedPatient === 'function' ? getSelectedPatient() : null;
  if (p && document.getElementById('patient-reward')) renderPatientReward(p);
}

function rwSwatches(kind, list, current, stage) {
  return list.map(([c, req]) => {
    const locked = req > stage;
    return '<button type="button" class="rw-sw' + (locked ? ' locked' : '') + '" style="background:' + c + '"' +
      ' data-color="' + kind + '" data-value="' + c + '" aria-pressed="' + (current === c) + '"' +
      ' aria-label="' + (locked ? 'Couleur débloquée au niveau ' + req : 'Couleur') + '"' +
      (locked ? ' disabled title="Débloqué au niveau ' + req + '"' : '') + '></button>';
  }).join('');
}

function rwTabRobot(patient, r, ev) {
  const species = RW_SPECIES_ORDER.map(k =>
    '<button type="button" class="rw-sp" data-species="' + k + '" aria-pressed="' + (r.species === k) + '">' +
    rwRobotFor(patient, ev, { species: k, stage: 3, acc: {} }) + '<small>' + RW_SPECIES[k].label + '</small></button>'
  ).join('');
  const accs = RW_ACCS.map(a => {
    const ok = ev.on.has(a.b), bd = RW_BADGES.find(b => b.id === a.b);
    return '<button type="button" class="rw-acc' + (ok ? '' : ' locked') + '" data-acc="' + a.k + '"' +
      ' aria-pressed="' + (ok && !!r.acc[a.k]) + '"' + (ok ? '' : ' disabled') + '>' +
      '<b>' + a.n + '</b><small>' + (ok ? (r.acc[a.k] ? 'Équipé' : 'Débloqué') : 'Badge « ' + escapeHtml(bd.n) + ' »') + '</small></button>';
  }).join('');
  return '<div class="rw-field"><span>Modèle</span><div class="rw-species">' + species + '</div></div>' +
    '<div class="rw-field"><span>Nom</span><input type="text" id="rw-name" maxlength="14" value="' + escapeHtml(r.name) + '" aria-label="Nom du robot"></div>' +
    '<div class="rw-field"><span>Carrosserie</span><div class="rw-swatches">' + rwSwatches('body', RW_BODY, r.body, ev.stage) + '</div></div>' +
    '<div class="rw-field"><span>Détails</span><div class="rw-swatches">' + rwSwatches('accent', RW_ACCENT, r.accent, ev.stage) + '</div></div>' +
    '<div class="rw-field"><span>Yeux</span><div class="rw-swatches">' + rwSwatches('eye', RW_EYE, r.eye, ev.stage) + '</div></div>' +
    '<div class="rw-field"><span>Accessoires</span><div class="rw-accs">' + accs + '</div></div>';
}

function rwTabEvolution(patient, r, ev) {
  return '<div class="rw-evo">' + RW_STAGES.map((s, i) =>
    '<div class="' + (i + 1 === ev.stage ? 'cur' : '') + (i + 1 > ev.stage ? ' off' : '') + '">' +
    rwRobotFor(patient, ev, { stage: i + 1 }) +
    '<b>' + (i + 1) + '. ' + (i + 1 > ev.stage ? '???' : s.n) + '</b><small>' + rwThreshold(i, r.pace) + ' XP</small></div>'
  ).join('') + '</div>' +
    '<p class="rw-hint">Chaque exercice terminé donne de l\'XP : ' + RW_XP.base + ' la 1re fois qu\'on le finit (' + RW_XP.repeat +
    ' les fois suivantes), ' + RW_XP.perStar +
    ' par étoile, ' + RW_XP.record + ' pour un record battu. L\'XP ne baisse jamais.</p>';
}

function rwBadgeCard(b, r, ev) {
  const on = ev.on.has(b.id), g = r.goals[b.id], v = Math.min(ev.stats[b.stat], g);
  return '<div class="rw-badge ' + (on ? 'on' : 'off') + '">' + rwBadgeSvg(b, on) +
    '<b>' + escapeHtml(b.n) + '</b><small>' + b.d(g) + '</small>' +
    (on ? '' : '<div class="rw-mini-bar"><i style="width:' + (v / g * 100) + '%"></i></div><small>' + v + ' / ' + g + '</small>') + '</div>';
}

function rwTabBadges(patient, r, ev) {
  const fam = (f, title) => '<div class="rw-fam"><h4>' + title + '</h4><div class="rw-badges">' +
    RW_BADGES.filter(b => b.fam === f).map(b => rwBadgeCard(b, r, ev)).join('') + '</div></div>';
  return fam('e', 'Effort · pour tout le monde') + fam('x', 'Exploits · pour se dépasser');
}

function renderRewardModal() {
  const patient = patients.find(p => p.id === rwModalPatientId);
  if (!patient) { closeRewardModal(); return; }
  const r = getReward(patient), ev = rwEvaluate(patient), xp = rwXpProgress(ev, r.pace);
  const tabs = [['robot', 'Mon robot'], ['evo', 'Évolution'], ['badges', 'Badges · ' + RW_BADGES.filter(b => ev.on.has(b.id)).length + '/' + RW_BADGES.length]];
  const body = rwModalTab === 'evo' ? rwTabEvolution(patient, r, ev)
             : rwModalTab === 'badges' ? rwTabBadges(patient, r, ev)
             : rwTabRobot(patient, r, ev);
  document.getElementById('rw-content').innerHTML =
    '<div class="rw-hero"><div class="rw-pill"><span>Niveau</span><b>' + ev.stage + '</b></div>' +
    '<div class="rw-pill rw-pill-name" id="rw-hero-name">' + escapeHtml(r.name || 'Sans nom') + '</div>' +
    '<div class="rw-hero-bot">' + rwRobotFor(patient, ev) + '</div></div>' +
    '<div class="rw-xp"><div class="rw-xp-row"><span>' + RW_STAGES[ev.stage - 1].n + '</span><span><b>' + ev.xp + '</b> XP</span></div>' +
    '<div class="rw-bar"><i style="width:' + xp.pct + '%"></i></div><div class="rw-hint">' + xp.text + '</div></div>' +
    '<div class="rw-tabs" role="tablist">' + tabs.map(([k, l]) =>
      '<button type="button" role="tab" class="rw-tab" data-tab="' + k + '" aria-selected="' + (rwModalTab === k) + '">' + l + '</button>').join('') + '</div>' +
    '<div class="rw-tabbody">' + body + '</div>';
}

function rwModalClick(e) {
  const t = e.target;
  if (t.id === 'reward-modal' || t.closest('#rw-close')) { closeRewardModal(); return; }
  const patient = patients.find(p => p.id === rwModalPatientId);
  if (!patient) return;
  const r = getReward(patient);
  const tab = t.closest('[data-tab]'), sp = t.closest('[data-species]'),
        col = t.closest('[data-color]'), acc = t.closest('[data-acc]');
  if (tab) { rwModalTab = tab.dataset.tab; renderRewardModal(); document.querySelector('.rw-tab[aria-selected="true"]').focus(); return; }
  if (sp) r.species = sp.dataset.species;
  else if (col) r[col.dataset.color] = col.dataset.value;
  else if (acc) r.acc[acc.dataset.acc] = !r.acc[acc.dataset.acc];
  else return;
  savePatients();
  renderRewardModal();
}

function initRewards() {
  const modal = document.getElementById('reward-modal');
  modal.addEventListener('click', rwModalClick);
  modal.addEventListener('input', e => {
    if (e.target.id !== 'rw-name') return;
    const patient = patients.find(p => p.id === rwModalPatientId);
    if (!patient) return;
    getReward(patient).name = e.target.value;
    document.getElementById('rw-hero-name').textContent = e.target.value || 'Sans nom';
    savePatients();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeRewardModal();
  });
}

// ── Fin d'exercice ───────────────────────────────────────────────────────────
const RW_MESSAGES = {
  record: ['Nouveau record, tu t\'es dépassé !', 'Record battu, bravo !'],
  good:   ['Bien joué !', 'Beau travail !', 'Tu progresses !'],
  basic:  ['Exercice terminé, bravo !', 'On continue comme ça !'],
};

// Appelée après l'enregistrement d'une session (rewards.js l'a déjà prise en compte).
function showRewardResult(session) {
  const el = document.getElementById('reward-result');
  if (!el) return;
  const info = rwOnSessionSaved(session);
  if (!info) { el.style.display = 'none'; el.innerHTML = ''; return; }
  const { patient, gain, newBadges, levelUp, ev } = info;
  const r = getReward(patient);
  const pool = gain.record ? RW_MESSAGES.record : gain.stars >= 2 ? RW_MESSAGES.good : RW_MESSAGES.basic;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  const line = (label, xp) => '<li><span>' + label + '</span><b>+' + xp + ' XP</b></li>';
  const newAccs = RW_ACCS.filter(a => newBadges.some(b => b.id === a.b));
  const chips = [
    levelUp ? 'Niveau ' + levelUp + ' · ' + RW_STAGES[levelUp - 1].n + ' !' : '',
    ...newBadges.map(b => 'Nouveau badge · ' + b.n),
    ...newAccs.map(a => 'Nouvel accessoire · ' + a.n),
  ].filter(Boolean).map(c => '<span class="rw-chip">' + escapeHtml(c) + '</span>').join('');
  el.innerHTML = '<div class="rw rw-result"><div class="rw-result-bot">' + rwRobotFor(patient, ev) + '</div>' +
    '<div class="rw-result-body"><p class="rw-bubble">' + escapeHtml(r.name) + ' : « ' + msg + ' »</p>' +
    '<ul class="rw-gain">' + line(gain.first ? 'Exercice terminé (1re fois)' : 'Exercice refait', gain.base) +
    (gain.stars ? line(gain.stars + ' étoile' + (gain.stars > 1 ? 's' : ''), gain.starsXp) : '') +
    (gain.record ? line('Record battu sur « ' + escapeHtml(session.exerciseName) + ' »', gain.recordXp) : '') + '</ul>' +
    (chips ? '<p class="rw-chips">' + chips + '</p>' : '') +
    '<button type="button" class="rw-btn" id="rw-open-result">Mon robot</button></div></div>';
  el.style.display = '';
  document.getElementById('rw-open-result').addEventListener('click', () => openRewardModal(patient.id));
}

// ── Écran de départ ──────────────────────────────────────────────────────────
function renderSetupReward() {
  const box = document.getElementById('setup-reward');
  if (!box) return;
  const patient = patients.find(p => p.id === document.getElementById('patient-select-setup').value);
  if (!patient || !getReward(patient).enabled) { box.style.display = 'none'; box.innerHTML = ''; return; }
  const r = patient.reward, ev = rwEvaluate(patient);
  box.innerHTML = '<div class="rw rw-setup"><div class="rw-setup-bot">' + rwRobotFor(patient, ev) + '</div>' +
    '<div class="rw-setup-text"><b>' + escapeHtml(r.name) + '</b><span>Niveau ' + ev.stage + ' · ' + RW_STAGES[ev.stage - 1].n + ' · ' + ev.xp + ' XP</span></div>' +
    '<button type="button" class="rw-btn" id="rw-open-setup">Mon robot</button></div>';
  box.style.display = '';
  document.getElementById('rw-open-setup').addEventListener('click', () => openRewardModal(patient.id));
}

// ── Fiche patient (thérapeute) ───────────────────────────────────────────────
function rwRenderFicheSummary(patient) {
  const box = document.getElementById('patient-reward-summary');
  if (!box) return;
  const r = getReward(patient), ev = rwEvaluate(patient);
  const owned = RW_BADGES.filter(b => ev.on.has(b.id)).length;
  box.innerHTML = '<div class="rw-fiche-bot">' + rwRobotFor(patient, ev) + '</div>' +
    '<div class="rw-fiche-text"><b>' + escapeHtml(r.name) + '</b><span>Niveau ' + ev.stage + ' · ' + RW_STAGES[ev.stage - 1].n +
    ' · ' + ev.xp + ' XP · ' + owned + '/' + RW_BADGES.length + ' badges</span></div>';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn-dup'; btn.textContent = 'Voir le robot';
  btn.addEventListener('click', () => openRewardModal(patient.id));
  box.appendChild(btn);
}

function rwGoalRow(patient, b) {
  const r = patient.reward;
  const row = document.createElement('div');
  row.className = 'rw-goal';
  const lab = document.createElement('label');
  lab.innerHTML = '<span>' + escapeHtml(b.n) + '</span><small>' + b.u + '</small>';
  const inp = document.createElement('input');
  inp.type = 'number'; inp.min = '1'; inp.max = '500'; inp.value = r.goals[b.id];
  inp.setAttribute('aria-label', 'Objectif du badge ' + b.n);
  const setGoal = v => {
    r.goals[b.id] = Math.max(1, Math.min(500, v));
    inp.value = r.goals[b.id];
    savePatients();
    rwRenderFicheSummary(patient);
  };
  inp.addEventListener('change', () => setGoal(parseInt(inp.value) || 1));
  const { wrap } = makeCounterBtns(inp, () => setGoal(r.goals[b.id] - 1), () => setGoal(r.goals[b.id] + 1));
  row.append(lab, wrap);
  return row;
}

function renderPatientReward(patient) {
  const box = document.getElementById('patient-reward');
  if (!box) return;
  const r = getReward(patient);
  box.innerHTML = '<div class="pairs-header pairs-header--mt"><span class="editor-section-label no-mb">Récompenses</span></div>';
  box.appendChild(makeToggleRow('Robot et récompenses',
    'À couper pour les patients que le jeu ne motive pas ou qui se comparent trop.', r.enabled,
    checked => { r.enabled = checked; savePatients(); renderPatientReward(patient); }));
  if (!r.enabled) return;

  const summary = document.createElement('div');
  summary.id = 'patient-reward-summary'; summary.className = 'rw-fiche-summary';
  box.appendChild(summary);
  rwRenderFicheSummary(patient);

  const paceField = document.createElement('div');
  paceField.className = 'form-group';
  paceField.innerHTML = '<label class="editor-section-label" for="patient-reward-pace">Rythme de l\'évolution</label>' +
    '<select id="patient-reward-pace">' +
    [[0.5, 'Doux · niveaux deux fois plus vite'], [1, 'Normal'], [1.5, 'Exigeant · niveaux 1,5 fois plus lents']]
      .map(([v, l]) => '<option value="' + v + '"' + (r.pace === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>';
  paceField.querySelector('select').addEventListener('change', e => {
    r.pace = +e.target.value; savePatients(); rwRenderFicheSummary(patient);
  });
  box.appendChild(paceField);

  const goalsField = document.createElement('div');
  goalsField.className = 'form-group';
  goalsField.innerHTML = '<span class="editor-section-label">Objectif de chaque badge</span>' +
    '<p class="rw-fiche-hint">Un badge déjà gagné reste acquis, même si l\'objectif est relevé. Les accessoires suivent leur badge.</p>';
  const grid = document.createElement('div');
  grid.className = 'rw-goals';
  RW_BADGES.forEach(b => grid.appendChild(rwGoalRow(patient, b)));
  const reset = document.createElement('button');
  reset.type = 'button'; reset.className = 'btn-dup'; reset.textContent = 'Valeurs par défaut';
  reset.addEventListener('click', () => { r.goals = rwDefaultGoals(); savePatients(); renderPatientReward(patient); });
  goalsField.append(grid, reset);
  box.appendChild(goalsField);
}
