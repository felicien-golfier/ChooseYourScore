// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE — IndexedDB (base 'cys', store 'kv').
// Les tableaux restent en mémoire : lectures synchrones partout dans l'app,
// écritures asynchrones via saveX(). initData() doit être appelé avant tout rendu.
// ═══════════════════════════════════════════════════════════════════════════════
let exercises = [];
let sessions  = [];
let patients  = [];
let folders   = [];

let _db = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('cys', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(key) {
  return new Promise((resolve, reject) => {
    const req = _db.transaction('kv').objectStore('kv').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function _persist(key, value) {
  idbSet(key, value).catch(() => {
    alert('Échec de la sauvegarde locale (stockage plein ou indisponible).');
  });
}

function saveExercises() { _persist('exercises', exercises); }
function saveSessions()  { _persist('sessions',  sessions);  }
function savePatients()  { _persist('patients',  patients);  }
function saveFolders()   { _persist('folders',   folders);   }

const _DATA_KEYS = [
  ['cys_exercises', 'exercises'],
  ['cys_sessions',  'sessions'],
  ['cys_patients',  'patients'],
  ['cys_folders',   'folders'],
];

async function initData() {
  _db = await openDb();
  // Migration unique : les données historiques en localStorage passent dans IndexedDB.
  for (const [lsKey, idbKey] of _DATA_KEYS) {
    const raw = localStorage.getItem(lsKey);
    if (raw === null) continue;
    await idbSet(idbKey, JSON.parse(raw));
    localStorage.removeItem(lsKey);
  }
  exercises = (await idbGet('exercises')) || [];
  sessions  = (await idbGet('sessions'))  || [];
  patients  = (await idbGet('patients'))  || [];
  folders   = (await idbGet('folders'))   || [];
}
