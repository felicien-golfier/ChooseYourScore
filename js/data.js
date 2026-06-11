// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
let exercises = JSON.parse(localStorage.getItem('cys_exercises') || '[]');
let sessions  = JSON.parse(localStorage.getItem('cys_sessions')  || '[]');
let patients  = JSON.parse(localStorage.getItem('cys_patients')  || '[]');
let folders   = JSON.parse(localStorage.getItem('cys_folders')   || '[]');

function _isQuotaError(e) {
  return e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED';
}
function _trySave(key, value) {
  const serialized = JSON.stringify(value);
  try {
    localStorage.setItem(key, serialized);
  } catch(e) {
    if (_isQuotaError(e)) {
      // Free the old value first, then re-write — fixes Firefox refusing to
      // replace an existing key when total quota is already exceeded.
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, serialized);
        return;
      } catch(e2) {}
      alert('Stockage local plein. Exportez et supprimez des données (exercices ou sessions) pour libérer de l\'espace.');
    }
    throw e;
  }
}
function saveExercises() { _trySave('cys_exercises', exercises); }
function saveSessions()  { _trySave('cys_sessions',  sessions);  }
function savePatients()  { _trySave('cys_patients',  patients);  }
function saveFolders()   { _trySave('cys_folders',   folders);   }
