// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const _audioEl = document.getElementById('cys-audio-el');
let _audioQueue = [], _audioBlobUrl = null;

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

// Interrupt any current playback and play a single dataUrl; calls onDone when finished.
function playAudioUrl(dataUrl, onDone) {
  _audioEl.pause();
  _audioQueue = [];
  if (_audioBlobUrl) { URL.revokeObjectURL(_audioBlobUrl); _audioBlobUrl = null; }
  _audioQueue = [{ dataUrl, onDone }];
  _audioNext();
}

// Queue an array of dataUrls to play sequentially (interrupts current playback).
function playAudioSequence(dataUrls) {
  _audioEl.pause();
  if (_audioBlobUrl) { URL.revokeObjectURL(_audioBlobUrl); _audioBlobUrl = null; }
  _audioQueue = dataUrls.map(u => ({ dataUrl: u, onDone: null }));
  _audioNext();
}

// Returns a Promise<number> with total duration in ms for an array of audio data URLs.
function getAudiosDuration(dataUrls) {
  if (!dataUrls.length) return Promise.resolve(0);
  return Promise.all(dataUrls.map(url => new Promise(resolve => {
    const blobUrl = _dataUrlToBlob(url);
    const a = document.createElement('audio');
    a.addEventListener('loadedmetadata', () => { URL.revokeObjectURL(blobUrl); resolve((a.duration || 0) * 1000); });
    a.addEventListener('error', () => { URL.revokeObjectURL(blobUrl); resolve(0); });
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
  if (item.audioUrl) return 'audio';
  return 'text';
}

function applyItemStyle(el, item) {
  const itype = getItemType(item);
  if (itype === 'arrow') {
    const ac = resolveArrowColor(item.bgColor || '#3b82f6');
    el.style.background = ac.bg; el.style.color = ac.fg;
    el.style.backgroundImage = ''; el.style.fontSize = '72px';
    el.style.fontFamily = 'inherit'; el.style.textTransform = 'none';
    el.textContent = ARROW_CHARS[item.arrowDirection || 'left'] || '←';
    return;
  }
  el.style.background    = item.bgColor || 'white';
  el.style.color         = item.color         || '#1a1a1a';
  el.style.fontSize      = (item.fontSize || 32) + 'px';
  el.style.fontFamily    = item.fontFamily    || 'Arial';
  el.style.textTransform = item.textTransform || 'none';
  if (item.imageUrl) {
    el.style.backgroundImage    = 'url(' + item.imageUrl + ')';
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    el.innerHTML = item.text ? '<span style="position:relative;text-shadow:0 1px 4px rgba(0,0,0,0.65)">' + escapeHtml(item.text) + '</span>' : '';
  } else {
    el.style.backgroundImage = '';
    const _cs = item.charStyles;
    if (_cs && _cs.some(s => s != null)) {
      const text = item.text || '';
      el.innerHTML = '<span>' + Array.from(text).map((char, i) => {
        const cs = _cs[i];
        let st = '';
        if (cs && cs.color)         st += 'color:' + cs.color + ';';
        if (cs && cs.fontSize)      st += 'font-size:' + cs.fontSize + 'px;';
        if (cs && cs.fontFamily)    st += 'font-family:' + cs.fontFamily + ';';
        if (cs && cs.textTransform) st += 'text-transform:' + cs.textTransform + ';';
        return '<span' + (st ? ' style="' + st + '"' : '') + '>' + escapeHtml(char) + '</span>';
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
function newId(p) { return p + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getPairQuestions(pair) {
  return (pair.questions && pair.questions.length) ? pair.questions : [{questionText: pair.questionText || '', choices: pair.choices || []}];
}
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
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
