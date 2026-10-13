// ═══════════════════════════════════════════════════════════════════════════════
// PAUSE & REPRISE — arrêter un exercice en cours et le reprendre plus tard au même item
// ═══════════════════════════════════════════════════════════════════════════════
// Entrée choisie dans la liste des exercices en pause : appliquée au clic sur « Je suis prêt(e) ».
let pendingResume = null;
// Entrée en cours de reprise : supprimée quand l'exercice arrive aux résultats.
let resumedPauseId = null;

// Clé stable d'une paire : son id, ou sa position pour les anciennes données sans id.
function pairKey(ex, pair) { return pair.id || ('#' + ex.pairs.indexOf(pair)); }

function removePausedEntry(id) {
  pausedExercises = pausedExercises.filter(e => e.id !== id);
  savePausedExercises();
}

function discardResumedPause() {
  if (resumedPauseId) removePausedEntry(resumedPauseId);
  resumedPauseId = null;
}

// L'item en cours est repris depuis le début : ses réponses partielles ne sont pas gardées.
function snapshotSequenceState() {
  const ex = currentExercise;
  const last = pairHistory[pairHistory.length - 1];
  const keepCount = last && last.pairIndex === pairIndex ? last.responseStart : responses.length;
  return {
    pairKeys: currentPairs.map(p => pairKey(ex, p)),
    pairIndex,
    exampleCount: currentExampleCount,
    shuffle: currentShuffleEnabled,
    responses: responses.slice(0, keepCount),
    pairHistory: pairHistory
      .filter(h => h.pairIndex < pairIndex)
      .map(h => ({ key: pairKey(ex, currentPairs[h.pairIndex]), responseStart: h.responseStart })),
    previousPairWasCorrect,
    progressLabel: pairProgress(pairIndex).label,
  };
}

// Un essai Go/No-Go donne exactement une réponse : on garde celles des essais terminés.
function snapshotGoNoGoState() {
  return {
    trialIndex: _gng.index,
    gngResponses: _gng.responses.slice(0, _gng.index),
    progressLabel: progressInfo(_gng.index, _gng.trials.length, _gng.exampleCount).label,
  };
}

function pauseCurrentExercise() {
  cancelPendingExercise();
  const isGng = currentExercise.type === 'gonogo';
  const entry = {
    id: newId('pause'),
    exerciseId: currentExercise.id, exerciseName: currentExercise.name,
    patientId: currentPatientId, patientName: currentPatient,
    type: isGng ? 'gonogo' : 'sequence',
    pausedAt: new Date().toISOString(),
    elapsedMs: Date.now() - exerciseStartTime,
    ...(isGng ? snapshotGoNoGoState() : snapshotSequenceState()),
  };
  // Une seule pause par couple exercice/patient : la nouvelle remplace l'ancienne.
  pausedExercises = pausedExercises.filter(e => e.id !== resumedPauseId &&
    !(e.exerciseId === entry.exerciseId && e.patientId === entry.patientId));
  pausedExercises.push(entry);
  savePausedExercises();
  resumedPauseId = null;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showView('setup');
}

document.getElementById('btn-pause-exercise').addEventListener('click', pauseCurrentExercise);

// Les paires modifiées depuis la pause sont réconciliées par clé : paires supprimées
// ignorées, paires ajoutées placées à la fin.
function restoreSequenceState(entry) {
  const ex = currentExercise;
  const byKey = new Map((ex.pairs || []).map(p => [pairKey(ex, p), p]));
  const kept = keys => keys.filter(k => byKey.has(k));
  const order = kept(entry.pairKeys);
  byKey.forEach((p, k) => { if (!entry.pairKeys.includes(k)) order.push(k); });
  currentPairs = order.map(k => byKey.get(k));
  currentExampleCount = kept(entry.pairKeys.slice(0, entry.exampleCount)).length;
  pairIndex = kept(entry.pairKeys.slice(0, entry.pairIndex)).length;
  pairHistory = entry.pairHistory
    .filter(h => byKey.has(h.key))
    .map(h => ({ pairIndex: order.indexOf(h.key), responseStart: h.responseStart }));
  responses = entry.responses.slice();
  previousPairWasCorrect = entry.previousPairWasCorrect;
  isWaiting = false;
  if (pairIndex >= currentPairs.length) finishExercise();
  else if (currentExampleCount > 0 && pairIndex === currentExampleCount) showExampleTransitionScreen(renderPair);
  else renderPair();
}

function resumePausedExercise() {
  const entry = pendingResume;
  pendingResume = null;
  resumedPauseId = entry.id;
  exerciseStartTime = Date.now() - entry.elapsedMs;
  if (entry.type === 'gonogo') startGoNoGoSession(entry.trialIndex, entry.gngResponses.slice());
  else restoreSequenceState(entry);
}

function openPausedEntry(entry) {
  const ex = exercises.find(e => e.id === entry.exerciseId);
  if (!ex || (ex.type === 'gonogo') !== (entry.type === 'gonogo')) {
    alert("Cet exercice n'existe plus ou a changé de type : la reprise est impossible.");
    removePausedEntry(entry.id);
    renderPausedList();
    return;
  }
  const patient = patients.find(p => p.id === entry.patientId);
  currentExercise = ex;
  currentPatientId = entry.patientId;
  currentPatient = patient ? patient.name : entry.patientName;
  currentShuffleEnabled = !!entry.shuffle;
  pendingResume = entry;
  showInstruction(entry.progressLabel);
}

// ── Liste « Exercices en pause » de l'écran d'accueil ─────────────────────────
function renderPausedList() {
  const group = document.getElementById('paused-group');
  const list  = document.getElementById('paused-list');
  list.innerHTML = '';
  group.style.display = pausedExercises.length ? '' : 'none';
  [...pausedExercises].sort((a, b) => b.pausedAt.localeCompare(a.pausedAt)).forEach(entry => {
    const patient = patients.find(p => p.id === entry.patientId);
    const ex = exercises.find(e => e.id === entry.exerciseId);
    const row = document.createElement('div');
    row.className = 'paused-item';
    const info = document.createElement('div');
    info.className = 'paused-info';
    const name = document.createElement('div');
    name.className = 'paused-name';
    name.textContent = ex ? ex.name : entry.exerciseName;
    const meta = document.createElement('div');
    meta.className = 'paused-meta';
    const date = new Date(entry.pausedAt);
    meta.textContent = (patient ? patient.name : entry.patientName) + '  ·  item ' + entry.progressLabel +
      '  ·  ' + date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    info.append(name, meta);
    const resumeBtn = document.createElement('button');
    resumeBtn.type = 'button';
    resumeBtn.className = 'btn btn-primary paused-resume';
    resumeBtn.textContent = 'Reprendre ▶';
    resumeBtn.addEventListener('click', () => openPausedEntry(entry));
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'paused-delete';
    delBtn.title = 'Supprimer cette pause';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      if (!confirm('Supprimer la progression en pause de « ' + name.textContent + ' » ?')) return;
      removePausedEntry(entry.id);
      renderPausedList();
    });
    row.append(info, resumeBtn, delBtn);
    list.appendChild(row);
  });
}
