// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const _audioEl = document.getElementById('cys-audio-el');
let _audioQueue = [], _audioBlobUrl = null;

// Amplify playback beyond the browser's 100% cap (audio.volume maxes at 1) via a GainNode.
const AUDIO_VOLUME_MULTIPLIER = 2;
let _audioGainNode = null, _audioCtx = null;
function _ensureAudioGain() {
  if (!_audioGainNode) {
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      _audioCtx = new AudioContextCtor();
      const source = _audioCtx.createMediaElementSource(_audioEl);
      _audioGainNode = _audioCtx.createGain();
      _audioGainNode.gain.value = AUDIO_VOLUME_MULTIPLIER;
      source.connect(_audioGainNode).connect(_audioCtx.destination);
    } catch (e) { /* Web Audio unavailable: falls back to normal (unamplified) volume */ }
  }
  if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
}

function _audioNext() {
  if (_audioBlobUrl) { URL.revokeObjectURL(_audioBlobUrl); _audioBlobUrl = null; }
  if (_audioQueue.length === 0) return;
  const { dataUrl, onDone } = _audioQueue.shift();
  _audioBlobUrl = _dataUrlToBlob(dataUrl);
  _audioEl.src = _audioBlobUrl;
  _audioEl.onended = () => { onDone && onDone(); _audioNext(); };
  _audioEl.onerror = () => { onDone && onDone(); _audioNext(); };
  _audioEl.play().catch(() => { onDone && onDone(); _audioNext(); });
}

function _dataUrlToBlob(dataUrl) {
  try {
    const [header, b64] = dataUrl.split(',');
    const mime = (header.match(/:(.*?);/) || [])[1] || 'audio/mpeg';
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], {type: mime}));
  } catch(e) { return dataUrl; }
}

// Stop any current playback immediately.
function stopAudio() {
  _audioEl.pause();
  _audioQueue = [];
  if (_audioBlobUrl) { URL.revokeObjectURL(_audioBlobUrl); _audioBlobUrl = null; }
}

// Interrupt any current playback and play a single dataUrl; calls onDone when finished.
function playAudioUrl(dataUrl, onDone) {
  stopAudio();
  _ensureAudioGain();
  _audioQueue = [{ dataUrl, onDone }];
  _audioNext();
}

// Queue an array of dataUrls to play sequentially (interrupts current playback).
function playAudioSequence(dataUrls) {
  stopAudio();
  _ensureAudioGain();
  _audioQueue = dataUrls.map(u => ({ dataUrl: u, onDone: null }));
  _audioNext();
}

// Returns a Promise<number> with total duration in ms for an array of audio data URLs.
function getAudiosDuration(dataUrls) {
  if (!dataUrls.length) return Promise.resolve(0);
  return Promise.all(dataUrls.map(url => new Promise(resolve => {
    const blobUrl = _dataUrlToBlob(url);
    const a = document.createElement('audio');
    let done = false;
    const finish = ms => { if (done) return; done = true; URL.revokeObjectURL(blobUrl); resolve(ms); };
    const t = setTimeout(() => finish(0), 3000);
    a.addEventListener('loadedmetadata', () => { clearTimeout(t); finish((a.duration || 0) * 1000); });
    a.addEventListener('error',          () => { clearTimeout(t); finish(0); });
    a.preload = 'metadata';
    a.src = blobUrl;
  }))).then(durations => durations.reduce((s, d) => s + d, 0));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const ARROW_CHARS = { left: '←', right: '→', up: '↑', down: '↓' };
const OPPOSITE    = { left: 'right', right: 'left', up: 'down', down: 'up' };

function resolveArrowColor(bgColor) {
  if (bgColor === 'blue')   return { bg: '#3b82f6', fg: 'white' };
  if (bgColor === 'yellow') return { bg: '#fbbf24', fg: '#1a1a1a' };
  if (bgColor && bgColor.startsWith('#')) {
    const r = parseInt(bgColor.slice(1,3),16), g = parseInt(bgColor.slice(3,5),16), b = parseInt(bgColor.slice(5,7),16);
    return { bg: bgColor, fg: (r*299+g*587+b*114)/1000 > 128 ? '#1a1a1a' : 'white' };
  }
  return { bg: '#3b82f6', fg: 'white' };
}

// CONSTANTS (suite) – UTILS
function getItemType(item) {
  if (!item) return 'text';
  if (item.type) return item.type;
  if (item.imageUrl) return 'image';
  if (item.videoUrl) return 'video';
  if (item.audioUrl) return 'audio';
  return 'text';
}

const _FONT_COMPAT = { 'Comic Sans MS': 'Comic Neue', 'Impact': 'Oswald', 'Georgia': 'Playfair Display', 'Verdana': 'Raleway' };
function _resolveFont(f) { return _FONT_COMPAT[f] || f || 'Arial'; }

// Rotation appliquée à l'icône flèche (dessinée pointant vers la droite) selon la direction voulue.
const ARROW_ROTATION = { right: 0, down: 90, left: 180, up: 270 };
// Icône flèche en SVG plutôt qu'un glyphe Unicode : les glyphes de police ne sont pas centrés
// optiquement dans leur boîte (empattements asymétriques), ce qui devient très visible aux
// grandes tailles utilisées en plein écran. Le SVG garantit un centrage exact.
const ARROW_SVG =
  '<svg viewBox="0 0 100 100" class="item-arrow-svg" preserveAspectRatio="xMidYMid meet">' +
  '<path d="M10,40 L58,40 L58,25 L90,50 L58,75 L58,60 L10,60 Z" fill="currentColor"/>' +
  '</svg>';

function applyItemStyle(el, item) {
  const itype = getItemType(item);
  if (itype === 'arrow') {
    const ac = resolveArrowColor(item.bgColor || '#3b82f6');
    el.style.background = ac.bg; el.style.color = ac.fg;
    el.style.backgroundImage = '';
    el.style.fontFamily = 'inherit'; el.style.textTransform = 'none';
    el.classList.add('item-arrow-glyph');
    el.innerHTML = ARROW_SVG;
    const rotation = ARROW_ROTATION[item.arrowDirection || 'left'] || 0;
    el.querySelector('.item-arrow-svg').style.transform = 'rotate(' + rotation + 'deg)';
    return;
  }
  el.style.background    = item.bgColor || 'white';
  el.style.color         = item.color         || '#1a1a1a';
  // La taille est pilotée en CSS via cette variable (voir session.css), pas par un
  // style inline "font-size" : un style inline a toujours priorité sur la règle CSS
  // et ne se recalculerait jamais tout seul si le plein écran est activé après coup.
  el.style.setProperty('--base-font-size', (item.fontSize || 32) + 'px');
  el.style.fontFamily    = _resolveFont(item.fontFamily);
  el.style.textTransform = item.textTransform || 'none';
  el.style.fontWeight    = item.fontWeight    || 'normal';
  el.style.fontStyle     = item.fontStyle     || 'normal';
  if (item.imageUrl) {
    el.style.backgroundImage    = 'url(' + item.imageUrl + ')';
    el.style.backgroundSize     = 'contain';
    el.style.backgroundRepeat   = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.innerHTML = item.text ? '<span style="position:relative;text-shadow:0 1px 4px rgba(0,0,0,0.65)">' + escapeHtml(item.text) + '</span>' : '';
  } else if (item.videoUrl) {
    el.style.backgroundImage = '';
    el.style.position = 'relative';
    el.innerHTML = '<video class="item-video-bg" src="' + item.videoUrl + '" autoplay muted loop playsinline></video>' +
      (item.text ? '<span style="position:relative;text-shadow:0 1px 4px rgba(0,0,0,0.65)">' + escapeHtml(item.text) + '</span>' : '');
  } else {
    el.style.backgroundImage = '';
    const _cs = item.charStyles;
    if (_cs && _cs.some(s => s != null)) {
      const text = item.text || '';
      el.innerHTML = '<span>' + Array.from(text).map((char, i) => {
        const cs = _cs[i];
        let st = '';
        if (cs && cs.color)         st += 'color:' + cs.color + ';';
        if (cs && cs.fontSize)      st += '--base-font-size:' + cs.fontSize + 'px;';
        if (cs && cs.fontFamily)    st += 'font-family:' + _resolveFont(cs.fontFamily) + ';';
        if (cs && cs.textTransform) st += 'text-transform:' + cs.textTransform + ';';
        if (cs && cs.fontWeight)    st += 'font-weight:' + cs.fontWeight + ';';
        if (cs && cs.fontStyle)     st += 'font-style:' + cs.fontStyle + ';';
        const cls = (cs && cs.fontSize) ? ' class="item-char-sized"' : '';
        return '<span' + cls + (st ? ' style="' + st + '"' : '') + '>' + escapeHtml(char) + '</span>';
      }).join('') + '</span>';
    } else {
      el.textContent = item.text || (itype === 'audio' ? '♪' : '');
    }
  }
}
function formatDuration(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
  return m > 0 ? m + ' min ' + (s % 60) + ' s' : s + ' s';
}

// Reformats a date input's raw value into "JJ/MM/AAAA" as the user types digits.
function formatDateDigitsAsTyped(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/');
}

// Converts a complete "JJ/MM/AAAA" string to an ISO "AAAA-MM-JJ" date, or null if invalid/incomplete.
function frDateToIso(frDate) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(frDate);
  if (!m) return null;
  const day = +m[1], month = +m[2], year = +m[3];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

// Converts an ISO "AAAA-MM-JJ" date to "JJ/MM/AAAA" for display, or '' if empty/invalid.
function isoDateToFr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
}

// Number of items to force onto the first row of a sequence pair's display (e.g. "2"
// means 2 items then a hard line break), or null for the default single-row auto-wrap.
function seqLayoutBreakAfter(displayLayout) {
  const n = parseInt(displayLayout, 10);
  return n > 0 ? n : null;
}

// Appends a hard line-break spacer to a flex-wrap sequence item container, forcing
// items added after it onto a new row regardless of the container's width.
function appendSeqLayoutBreak(container) {
  const brk = document.createElement('div');
  brk.className = 'seq-layout-break';
  container.appendChild(brk);
}
function newId(p) { return p + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getPairQuestions(pair) {
  return (pair.questions && pair.questions.length) ? pair.questions : [{questionText: pair.questionText || '', choices: pair.choices || []}];
}
// Mot à trous pour la dénomination (ex : BICYCLETTE → B_CY___T_E) : garde la 1re lettre
// et la ponctuation, masque aléatoirement environ la moitié des autres lettres.
function makeNamingHint(word) {
  const chars = Array.from(word || '');
  const letterIdx = chars.map((c, i) => /\p{L}/u.test(c) && i > 0 ? i : -1).filter(i => i >= 0);
  const toMask = shuffleArray(letterIdx).slice(0, Math.ceil(letterIdx.length / 2));
  toMask.forEach(i => { chars[i] = '_'; });
  return chars.join('');
}
// « 3 / 4 (75%) » : bonnes réponses parmi les mots que le patient a tenté de dire.
function formatNamingCorrect(stats) {
  if (!stats.attempted) return '0 / 0';
  return stats.correct + ' / ' + stats.attempted + ' (' + Math.round(stats.correct / stats.attempted * 100) + '%)';
}
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Construit currentPairs en gardant les paires d'exemple (non notées) fixes en tête,
// même quand le mélange aléatoire est actif — seules les paires notées sont mélangées.
function buildCurrentPairs(ex, shuffle) {
  const allPairs = ex.pairs || [];
  currentExampleCount = Math.min(ex.exampleCount || 0, allPairs.length);
  const examplePairs = allPairs.slice(0, currentExampleCount);
  const restPairs     = allPairs.slice(currentExampleCount);
  currentPairs = shuffle
    ? [...examplePairs, ...shuffleArray(restPairs)]
    : [...examplePairs, ...restPairs];
}

// ── Helpers partagés export/import ───────────────────────────────────────────
function downloadBlob(data, filename, mime) {
  const url = URL.createObjectURL(new Blob([data], {type: mime || 'application/json'}));
  Object.assign(document.createElement('a'), {href:url, download:filename}).click();
  URL.revokeObjectURL(url);
}

function exportSessionsJson(data, filename) {
  downloadBlob(JSON.stringify(data, null, 2), filename);
}

function importSessionsJson(onDone) {
  const input = Object.assign(document.createElement('input'), {type:'file', accept:'.json'});
  input.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => alert('Impossible de lire le fichier.');
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!Array.isArray(imported)) throw new Error('Format invalide');
        if (!confirm('Importer ' + imported.length + ' session(s) et les ajouter aux existantes ?')) return;
        const existing = new Set(sessions.map(s => s.id));
        let added = 0;
        imported.forEach(s => { if (!existing.has(s.id)) { sessions.push(s); added++; } });
        saveSessions();
        onDone(added);
      } catch(err) { alert('Fichier invalide : ' + err.message); }
    };
    reader.readAsText(file);
  });
  input.click();
}
