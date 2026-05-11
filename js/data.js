// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
let exercises = JSON.parse(localStorage.getItem('cys_exercises') || '[]');
let sessions  = JSON.parse(localStorage.getItem('cys_sessions')  || '[]');
let patients  = JSON.parse(localStorage.getItem('cys_patients')  || '[]');
let folders   = JSON.parse(localStorage.getItem('cys_folders')   || '[]');

function saveExercises() { localStorage.setItem('cys_exercises', JSON.stringify(exercises)); }
function saveSessions()  { localStorage.setItem('cys_sessions',  JSON.stringify(sessions));  }
function savePatients()  { localStorage.setItem('cys_patients',  JSON.stringify(patients));  }
function saveFolders()   { localStorage.setItem('cys_folders',   JSON.stringify(folders));   }
