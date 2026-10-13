/* ── RÉCOMPENSES : ÉCRANS ─────────────────────────────────────────────────────
   - fenêtre « Mon robot » / « Mon sorcier » (univers, apparence, évolution, badges)
   - bloc de fin d'exercice (gains, nouveaux badges)
   - carte du compagnon sur l'écran de départ
   - réglages du patient (fiche patient : activer, univers, rythme, objectifs des badges)
   Le vocabulaire et le dessin viennent de l'univers choisi (RW_THEMES, rewards.js).
   Modèle et calculs : rewards.js. Dessin : rewards-robot.js, rewards-wizard.js.
   ──────────────────────────────────────────────────────────────────────────── */

let rwUidCount = 0;
let rwModalPatientId = null;
let rwModalTab = 'look';

function rwCompanionFor(patient, ev, over = {}) {
  const r = getReward(patient), T = rwTheme(r);
  const acc = {};
  T.accs.forEach(a => { acc[a.k] = !!r.acc[a.k] && ev.on.has(a.b); });
  return T.draw({ ...rwLookOf(r), stage: ev.stage, acc, uid: 'u' + (++rwUidCount), ...over });
}

// Classes du conteneur : habillage néon (robots) ou nuit étoilée (sorciers).
function rwThemeClass(r) { return 'rw rw-t-' + r.theme; }

function rwStageName(r, stage) { return rwTheme(r).stages[stage - 1]; }

// Choix de l'univers (fenêtre du compagnon et fiche patient) : aperçu de chaque univers
// avec l'apparence mémorisée du patient, ou celle par défaut.
function rwThemePicker(r) {
  return '<div class="rw-themes">' + Object.keys(RW_THEMES).map(k => {
    const look = k === r.theme ? r : (r.looks && r.looks[k]) || rwDefaultLook(k);
    const svg = RW_THEMES[k].draw({ ...look, stage: 3, acc: {}, uid: 'u' + (++rwUidCount) });
    return '<button type="button" class="rw-theme rw-theme-' + k + '" data-universe="' + k + '" aria-pressed="' + (r.theme === k) + '">' +
      svg + '<small>' + RW_THEMES[k].label + '</small></button>';
  }).join('') + '</div>';
}

function rwXpProgress(ev, r) {
  const cur = rwThreshold(ev.stage - 1, r.pace);
  const nxt = ev.stage < RW_STAGE_XP.length ? rwThreshold(ev.stage, r.pace) : null;
  return {
    pct: nxt ? Math.min(100, (ev.xp - cur) / (nxt - cur) * 100) : 100,
    text: nxt ? 'Encore ' + (nxt - ev.xp) + ' XP pour devenir ' + rwStageName(r, ev.stage + 1) : 'Forme finale atteinte !',
  };
}

// ── Fenêtre « Mon robot » ────────────────────────────────────────────────────
function openRewardModal(patientId) {
  rwModalPatientId = patientId;
  rwModalTab = 'look';
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

function rwTabLook(patient, r, ev) {
  const T = rwTheme(r);
  const species = T.order.map(k =>
    '<button type="button" class="rw-sp" data-species="' + k + '" aria-pressed="' + (r.species === k) + '">' +
    rwCompanionFor(patient, ev, { species: k, stage: 3, acc: {} }) + '<small>' + T.species[k].label + '</small></button>'
  ).join('');
  const accs = T.accs.map(a => {
    const ok = ev.on.has(a.b), bd = RW_BADGES.find(b => b.id === a.b);
    return '<button type="button" class="rw-acc' + (ok ? '' : ' locked') + '" data-acc="' + a.k + '"' +
      ' aria-pressed="' + (ok && !!r.acc[a.k]) + '"' + (ok ? '' : ' disabled') + '>' +
      '<b>' + a.n + '</b><small>' + (ok ? (r.acc[a.k] ? 'Équipé' : 'Débloqué') : 'Badge « ' + escapeHtml(bd.n) + ' »') + '</small></button>';
  }).join('');
  return '<div class="rw-field"><span>Univers</span>' + rwThemePicker(r) + '</div>' +
    '<div class="rw-field"><span>Modèle</span><div class="rw-species">' + species + '</div></div>' +
    '<div class="rw-field"><span>Nom</span><input type="text" id="rw-name" maxlength="14" value="' + escapeHtml(r.name) + '" aria-label="' + T.nameLabel + '"></div>' +
    T.colors.map(([key, label, list]) =>
      '<div class="rw-field"><span>' + label + '</span><div class="rw-swatches">' + rwSwatches(key, list, r[key], ev.stage) + '</div></div>').join('') +
    '<div class="rw-field"><span>Accessoires</span><div class="rw-accs">' + accs + '</div></div>';
}

function rwTabEvolution(patient, r, ev) {
  return '<div class="rw-evo">' + RW_STAGE_XP.map((_, i) =>
    '<div class="' + (i + 1 === ev.stage ? 'cur' : '') + (i + 1 > ev.stage ? ' off' : '') + '">' +
    rwCompanionFor(patient, ev, { stage: i + 1 }) +
    '<b>' + (i + 1) + '. ' + (i + 1 > ev.stage ? '???' : rwStageName(r, i + 1)) + '</b><small>' + rwThreshold(i, r.pace) + ' XP</small></div>'
  ).join('') + '</div>' +
    '<p class="rw-hint">Chaque exercice terminé donne de l\'XP : ' + RW_XP.base + ' la 1re fois qu\'on le finit (' + RW_XP.repeat +
    ' les fois suivantes), ' + RW_XP.perStar +
    ' par étoile, ' + RW_XP.record + ' pour un record battu. L\'XP ne baisse jamais.</p>';
}

function rwBadgeCard(b, r, ev) {
  const on = ev.on.has(b.id), g = r.goals[b.id], v = Math.min(ev.stats[b.stat], g);
  return '<div class="rw-badge ' + (on ? 'on' : 'off') + '">' + rwTheme(r).badge(b, on) +
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
  const r = getReward(patient), ev = rwEvaluate(patient), xp = rwXpProgress(ev, r), T = rwTheme(r);
  const box = document.querySelector('#reward-modal .rw-box');
  box.className = rwThemeClass(r) + ' rw-box';
  box.setAttribute('aria-label', T.my);
  document.getElementById('reward-modal').dataset.theme = r.theme;
  const tabs = [['look', T.my], ['evo', 'Évolution'], ['badges', 'Badges · ' + RW_BADGES.filter(b => ev.on.has(b.id)).length + '/' + RW_BADGES.length]];
  const body = rwModalTab === 'evo' ? rwTabEvolution(patient, r, ev)
             : rwModalTab === 'badges' ? rwTabBadges(patient, r, ev)
             : rwTabLook(patient, r, ev);
  document.getElementById('rw-content').innerHTML =
    '<div class="rw-hero"><div class="rw-pill"><span>Niveau</span><b>' + ev.stage + '</b></div>' +
    '<div class="rw-pill rw-pill-name" id="rw-hero-name">' + escapeHtml(r.name || 'Sans nom') + '</div>' +
    '<div class="rw-hero-bot">' + rwCompanionFor(patient, ev) + '</div></div>' +
    '<div class="rw-xp"><div class="rw-xp-row"><span>' + rwStageName(r, ev.stage) + '</span><span><b>' + ev.xp + '</b> XP</span></div>' +
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
  const tab = t.closest('[data-tab]'), sp = t.closest('[data-species]'), th = t.closest('[data-universe]'),
        col = t.closest('[data-color]'), acc = t.closest('[data-acc]');
  if (tab) { rwModalTab = tab.dataset.tab; renderRewardModal(); document.querySelector('.rw-tab[aria-selected="true"]').focus(); return; }
  if (th) rwSetTheme(r, th.dataset.universe);
  else if (sp) r.species = sp.dataset.species;
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
  const T = rwTheme(r);
  const newAccs = T.accs.filter(a => newBadges.some(b => b.id === a.b));
  const chips = [
    levelUp ? 'Niveau ' + levelUp + ' · ' + rwStageName(r, levelUp) + ' !' : '',
    ...newBadges.map(b => 'Nouveau badge · ' + b.n),
    ...newAccs.map(a => 'Nouvel accessoire · ' + a.n),
  ].filter(Boolean).map(c => '<span class="rw-chip">' + escapeHtml(c) + '</span>').join('');
  el.innerHTML = '<div class="' + rwThemeClass(r) + ' rw-result"><div class="rw-result-bot">' + rwCompanionFor(patient, ev) + '</div>' +
    '<div class="rw-result-body"><p class="rw-bubble">' + escapeHtml(r.name) + ' : « ' + msg + ' »</p>' +
    '<ul class="rw-gain">' + line(gain.first ? 'Exercice terminé (1re fois)' : session.failedOnly ? 'Items échoués refaits' : 'Exercice refait', gain.base) +
    (gain.stars ? line(gain.stars + ' étoile' + (gain.stars > 1 ? 's' : ''), gain.starsXp) : '') +
    (gain.record ? line('Record battu sur « ' + escapeHtml(session.exerciseName) + ' »', gain.recordXp) : '') + '</ul>' +
    (chips ? '<p class="rw-chips">' + chips + '</p>' : '') +
    '<button type="button" class="rw-btn" id="rw-open-result">' + T.my + '</button></div></div>';
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
  box.innerHTML = '<div class="' + rwThemeClass(r) + ' rw-setup"><div class="rw-setup-bot">' + rwCompanionFor(patient, ev) + '</div>' +
    '<div class="rw-setup-text"><b>' + escapeHtml(r.name) + '</b><span>Niveau ' + ev.stage + ' · ' + rwStageName(r, ev.stage) + ' · ' + ev.xp + ' XP</span></div>' +
    '<button type="button" class="rw-btn" id="rw-open-setup">' + rwTheme(r).my + '</button></div>';
  box.style.display = '';
  document.getElementById('rw-open-setup').addEventListener('click', () => openRewardModal(patient.id));
}

// ── Fiche patient (thérapeute) ───────────────────────────────────────────────
function rwRenderFicheSummary(patient) {
  const box = document.getElementById('patient-reward-summary');
  if (!box) return;
  const r = getReward(patient), ev = rwEvaluate(patient);
  const owned = RW_BADGES.filter(b => ev.on.has(b.id)).length;
  box.innerHTML = '<div class="rw-fiche-bot rw-fiche-bot-' + r.theme + '">' + rwCompanionFor(patient, ev) + '</div>' +
    '<div class="rw-fiche-text"><b>' + escapeHtml(r.name) + '</b><span>Niveau ' + ev.stage + ' · ' + rwStageName(r, ev.stage) +
    ' · ' + ev.xp + ' XP · ' + owned + '/' + RW_BADGES.length + ' badges</span></div>';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn-dup'; btn.textContent = rwTheme(r).see;
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
  box.appendChild(makeToggleRow('Compagnon et récompenses',
    'À couper pour les patients que le jeu ne motive pas ou qui se comparent trop.', r.enabled,
    checked => { r.enabled = checked; savePatients(); renderPatientReward(patient); }));
  if (!r.enabled) return;

  const themeField = document.createElement('div');
  themeField.className = 'form-group';
  themeField.innerHTML = '<span class="editor-section-label">Univers</span>' + rwThemePicker(r) +
    '<p class="rw-fiche-hint">Changer d\'univers garde l\'XP, les niveaux et les badges ; l\'apparence de chaque univers est conservée.</p>';
  themeField.addEventListener('click', e => {
    const th = e.target.closest('[data-universe]');
    if (!th) return;
    rwSetTheme(r, th.dataset.universe); savePatients(); renderPatientReward(patient);
  });
  box.appendChild(themeField);

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
