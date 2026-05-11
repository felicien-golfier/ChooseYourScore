// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_BUTTONS = { setup: 'nav-exercise', editor: 'nav-editor', results: 'nav-results', patients: 'nav-patients' };

function showView(name) {
  document.querySelectorAll('.view').forEach(el => { el.style.display = 'none'; });
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const view = document.getElementById('view-' + name);
  if (name === 'editor')        view.style.display = 'flex';
  else if (name === 'results')  view.style.display = 'block';
  else                          view.style.display = 'flex';

  document.getElementById('topbar').style.display = name === 'exercise' ? 'none' : '';

  const navId = NAV_BUTTONS[name] || NAV_BUTTONS[name.replace('session-result','setup').replace('instruction','setup')];
  if (navId) document.getElementById(navId).classList.add('active');

  if (name === 'setup')    initSetup();
  if (name === 'editor')   initEditor();
  if (name === 'results')  initResults();
  if (name === 'patients') initPatientsView();
}

document.getElementById('nav-exercise').addEventListener('click', () => showView('setup'));
document.getElementById('nav-editor')  .addEventListener('click', () => showView('editor'));
document.getElementById('nav-results') .addEventListener('click', () => showView('results'));
document.getElementById('nav-patients').addEventListener('click', () => showView('patients'));
