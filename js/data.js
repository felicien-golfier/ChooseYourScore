// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
let exercises = JSON.parse(localStorage.getItem('cys_exercises') || '[]');
let sessions  = JSON.parse(localStorage.getItem('cys_sessions')  || '[]');
let patients  = JSON.parse(localStorage.getItem('cys_patients')  || '[]');
let folders   = JSON.parse(localStorage.getItem('cys_folders')   || '[]');

function _trySave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch(e) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert('Stockage local plein. Exportez et supprimez des données (exercices ou sessions) pour libérer de l\'espace.');
    }
    throw e;
  }
}
function saveExercises() { _trySave('cys_exercises', exercises); }
function saveSessions()  { _trySave('cys_sessions',  sessions);  }
function savePatients()  { _trySave('cys_patients',  patients);  }
function saveFolders()   { _trySave('cys_folders',   folders);   }
