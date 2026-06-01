// ═══════════════════════════════════════════════════════════════════════════════
// RÉGLAGES — activer/désactiver les animations & récompenses présentées à l'enfant
// Persistés dans localStorage (cys_settings), même schéma que data.js.
// ═══════════════════════════════════════════════════════════════════════════════

const SETTINGS_DEFAULTS = {
  celebration: true, // étoiles + message d'encouragement en fin d'exercice
  confetti:    true, // pluie de confettis sur un bon score
  answerAnim:  true, // animations de réponse (rebond / secousse) + consigne
  decor:       true, // halos colorés en arrière-plan + emoji de la consigne
};

let settings = { ...SETTINGS_DEFAULTS, ...JSON.parse(localStorage.getItem('cys_settings') || '{}') };

function saveSettings() { localStorage.setItem('cys_settings', JSON.stringify(settings)); }

function getSetting(key) { return settings[key] !== false; }

// Reflète l'état des réglages sur <body> (les effets CSS lisent ces classes).
function applySettings() {
  const b = document.body;
  b.classList.toggle('no-answer-anim', !settings.answerAnim);
  b.classList.toggle('no-decor',       !settings.decor);
  b.classList.toggle('no-celebration', !settings.celebration);
}

// ── Helper partagé : une ligne de réglage avec interrupteur ──────────────────
function makeSettingToggle(key, label, desc) {
  const row = document.createElement('label');
  row.className = 'setting-row';

  const txt = document.createElement('div');
  txt.className = 'setting-text';
  const t = document.createElement('div');
  t.className = 'setting-label'; t.textContent = label;
  const d = document.createElement('div');
  d.className = 'setting-desc'; d.textContent = desc;
  txt.append(t, d);

  const sw = document.createElement('span');
  sw.className = 'setting-switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = settings[key] !== false;
  const knob = document.createElement('span');
  knob.className = 'setting-knob';
  sw.append(input, knob);

  input.addEventListener('change', () => {
    settings[key] = input.checked;
    saveSettings();
    applySettings();
  });

  row.append(txt, sw);
  return row;
}

function buildSettingsList() {
  const list = document.getElementById('settings-list');
  if (!list) return;
  list.innerHTML = '';
  list.append(
    makeSettingToggle('celebration', 'Récompense de fin', 'Étoiles et message d\'encouragement sur l\'écran de résultats.'),
    makeSettingToggle('confetti',    'Confettis',          'Pluie de confettis lorsque le score est élevé.'),
    makeSettingToggle('answerAnim',  'Animations de réponse', 'Rebond et secousse des réponses, apparition de la consigne.'),
    makeSettingToggle('decor',       'Décor coloré',       'Halos colorés en arrière-plan et emoji de la consigne.'),
  );
}

function openSettings()  { buildSettingsList(); document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }

function initSettings() {
  const btn   = document.getElementById('nav-settings');
  const modal = document.getElementById('settings-modal');
  const close = document.getElementById('settings-close');
  if (btn)   btn.addEventListener('click', openSettings);
  if (close) close.addEventListener('click', closeSettings);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeSettings();
  });
}

// Applique immédiatement (le script est en fin de <body>, donc body existe).
applySettings();
