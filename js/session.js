// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE – STATE & RUNTIME
// ═══════════════════════════════════════════════════════════════════════════════
let currentExercise = null, currentPatient = '', currentPatientId = null, currentPairs = [];
let pairIndex = 0, responses = [], exerciseStartTime = 0, pairStartTime = 0, isWaiting = false;
let currentSessionId = null;
let previousPairWasCorrect = null;
let pauseTimer = null;
let currentPairQuestions = [];
let currentShuffleEnabled = false;

document.getElementById('btn-ready').addEventListener('click', () => {
  exerciseStartTime = Date.now();
  showView('exercise');
  if (currentExercise && currentExercise.type === 'gonogo') {
    startGoNoGoSession();
  } else {
    pairIndex = 0; responses = []; previousPairWasCorrect = null; isWaiting = false;
    renderPair();
  }
});

let sequenceTimer = null;
let currentQuestionIndex = 0;
let _displayGen = 0;
const INTER_ITEM_PAUSE_MS = 200;

// ── Affichage des paires ───────────────────────────────────────────────────
function renderPair() {
  const pair = currentPairs[pairIndex];
  if (!(pair.items || []).length && !(pair.questions || []).length) {
    pairIndex++;
    if (pairIndex >= currentPairs.length) finishExercise(); else renderPair();
    return;
  }
  if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
  isWaiting = false;
  currentPairQuestions = getPairQuestions(pair);
  if (!currentPairQuestions.length) {
    pairIndex++;
    if (pairIndex >= currentPairs.length) finishExercise(); else renderPair();
    return;
  }
  document.getElementById('progress-fill').style.width  = (pairIndex / currentPairs.length * 100) + '%';
  document.getElementById('progress-label').textContent = (pairIndex+1) + ' / ' + currentPairs.length;
  document.getElementById('sequence-container').style.display = 'flex';
  document.getElementById('keyboard-hint').textContent = '';

  // Bref blanc entre chaque item pour que le changement soit perceptible
  // même quand l'item suivant est visuellement identique au précédent.
  document.getElementById('sequence-display').innerHTML = '';
  const gen = ++_displayGen;
  sequenceTimer = setTimeout(() => {
    sequenceTimer = null;
    if (gen === _displayGen) startSequenceDisplay(pair);
  }, INTER_ITEM_PAUSE_MS);
}

function startSequenceDisplay(pair, afterDisplayFn) {
  const gen = ++_displayGen;
  const displayEl  = document.getElementById('sequence-display');
  const questionEl = document.getElementById('sequence-question');
  const choicesEl  = document.getElementById('sequence-choices');
  const timerBar   = document.getElementById('sequence-timer-bar');
  const timerFill  = document.getElementById('sequence-timer-fill');
  const dur = (pair.useExerciseDefault && currentExercise?.defaultDisplayDuration != null)
    ? currentExercise.defaultDisplayDuration
    : (pair.displayDuration != null ? pair.displayDuration : 1000);

  displayEl.innerHTML = '';
  const isSingle = (pair.items || []).length === 1;
  const audioUrls = [];
  (pair.items || []).forEach(item => {
    const itemObj = typeof item === 'string' ? {type:'text', text:item} : item;
    const el = document.createElement('div');
    el.className = isSingle ? 'sequence-text-display' : 'sequence-item-box';
    applyItemStyle(el, itemObj);
    if (itemObj.audioUrl) {
      if (itemObj.autoPlay !== false) audioUrls.push(itemObj.audioUrl);
      const wrapper = document.createElement('div');
      wrapper.className = 'seq-sound-wrapper' + (isSingle ? ' seq-sound-wrapper--single' : '');
      wrapper.appendChild(el);
      const sndBtn = document.createElement('button');
      sndBtn.className = 'seq-item-sound-btn';
      sndBtn.title = 'Rejouer le son';
      sndBtn.textContent = '🔊';
      sndBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (sndBtn.classList.contains('playing') || !_audioEl.paused) {
          stopAudio();
          displayEl.querySelectorAll('.seq-item-sound-btn').forEach(b => { b.classList.remove('playing'); b.textContent = '🔊'; });
          return;
        }
        sndBtn.classList.add('playing'); sndBtn.textContent = '🔉';
        playAudioUrl(itemObj.audioUrl, () => { sndBtn.classList.remove('playing'); sndBtn.textContent = '🔊'; });
      });
      wrapper.appendChild(sndBtn);
      displayEl.appendChild(wrapper);
    } else {
      displayEl.appendChild(el);
    }
  });
  questionEl.style.display = 'none';
  choicesEl.style.display  = 'none';
  document.getElementById('seq-show-again-btn').style.display = 'none';
  document.getElementById('seq-write-zone').style.display = 'none';

  const _visMode = pair.visibilityMode || 'always_show';
  let _hideItems;
  if (_visMode === 'always_show') _hideItems = false;
  else if (_visMode === 'hide_if_prev_correct') _hideItems = previousPairWasCorrect === true;
  else if (_visMode === 'hide_if_prev_incorrect') _hideItems = previousPairWasCorrect === false;
  else _hideItems = true;

  if (pair.skipDisplay || _hideItems || currentPairQuestions[0]?.type === 'click-item') {
    timerBar.style.display = 'none';
    displayEl.style.display = _hideItems ? 'none' : 'flex';
    (afterDisplayFn || (() => startSequenceQuestion(pair, 0)))();
    return;
  }

  timerBar.style.display = '';
  displayEl.style.display = 'flex';

  getAudiosDuration(audioUrls).then(audioDurMs => {
    if (gen !== _displayGen) return;
    const effectiveDur = Math.max(dur, audioDurMs);

    if (effectiveDur > 0) {
      timerFill.style.transition = 'none';
      timerFill.style.width = '100%';
      timerFill.getBoundingClientRect();
      timerFill.style.transition = 'width ' + effectiveDur + 'ms linear';
      timerFill.style.width = '0%';
    } else {
      timerFill.style.transition = 'none';
      timerFill.style.width = '0%';
    }

    if (audioUrls.length > 0) playAudioSequence(audioUrls);

    sequenceTimer = setTimeout(() => { sequenceTimer = null; (afterDisplayFn || (() => startSequenceQuestion(pair, 0)))(); }, effectiveDur || 50);
  });
}

function startSequenceQuestion(pair, qIdx, isRetry, isAfterReplay) {
  currentQuestionIndex = qIdx;
  const questions    = currentPairQuestions;
  const q            = questions[qIdx];
  const correctIndices = q.correctIndices && q.correctIndices.length ? q.correctIndices : [0];
  const correctAnswers = correctIndices.map(i => (q.choices || [])[i]).filter(v => v != null);

  const displayEl    = document.getElementById('sequence-display');
  const questionEl   = document.getElementById('sequence-question');
  const choicesEl    = document.getElementById('sequence-choices');
  const writeZone    = document.getElementById('seq-write-zone');
  const showAgainBtn = document.getElementById('seq-show-again-btn');

  const visMode = pair.visibilityMode || 'always_show';
  let hideItems;
  if (visMode === 'always_show') hideItems = false;
  else if (visMode === 'hide_if_prev_correct') hideItems = previousPairWasCorrect === true;
  else if (visMode === 'hide_if_prev_incorrect') hideItems = previousPairWasCorrect === false;
  else hideItems = true;
  const shouldShowItems = (pair.skipDisplay && !hideItems) || (!pair.skipDisplay && isRetry && !isAfterReplay && q.showOnRetry !== false);
  displayEl.style.display = shouldShowItems ? 'flex' : 'none';

  // Bouton Masquer/Revoir — toggle simple dans tous les cas
  showAgainBtn.style.display = 'inline-block';
  showAgainBtn.textContent   = shouldShowItems ? '🙈 Masquer' : '👁  Revoir';
  showAgainBtn.onclick = () => {
    const visible = displayEl.style.display !== 'none';
    displayEl.style.display  = visible ? 'none' : 'flex';
    showAgainBtn.textContent = visible ? '👁  Revoir' : '🙈 Masquer';
  };

  questionEl.textContent = q.questionText || '';
  questionEl.style.display = q.questionText ? 'block' : 'none';

  // Réinitialisation des conteneurs + suppression du flash au survol
  writeZone.style.display   = 'none';
  choicesEl.innerHTML       = '';
  choicesEl.style.display   = 'none';
  choicesEl.classList.add('no-hover-flash');
  const removeFlash = () => {
    choicesEl.classList.remove('no-hover-flash');
    choicesEl.removeEventListener('mousemove', removeFlash);
  };
  choicesEl.addEventListener('mousemove', removeFlash);

  // ── Direction ──────────────────────────────────────────────────────────────
  if (q.type === 'direction') {
    const arrowItem  = (pair.items || []).find(i => i.type === 'arrow') || (pair.items || [])[0];
    const dir        = arrowItem?.arrowDirection || 'left';
    const rule       = q.rule || 'same';
    const numOpts    = q.numOptions || 4;
    const activeDirs = getDirectionsForOpts(dir, numOpts);
    const correctDir = rule === 'inverse' ? OPPOSITE[dir] : dir;

    const keyLayout = document.createElement('div');
    keyLayout.className = 'dir-key-layout';
    const upRow  = document.createElement('div'); upRow.className  = 'dir-key-row';
    const midRow = document.createElement('div'); midRow.className = 'dir-key-row';

    ['up', 'left', 'down', 'right'].forEach(d => {
      const btn = document.createElement('button');
      btn.className        = 'dir-key-btn';
      btn.textContent      = ARROW_CHARS[d];
      btn.dataset.dir      = d;
      const visible        = activeDirs.includes(d);
      btn.style.visibility = visible ? '' : 'hidden';
      btn.disabled         = !visible;
      if (visible) btn.addEventListener('click', () =>
        handleDirectionResponse(d, correctDir, activeDirs, pair, questions, qIdx, isRetry));
      if (d === 'up') upRow.appendChild(btn); else midRow.appendChild(btn);
    });
    keyLayout.append(upRow, midRow);
    choicesEl.appendChild(keyLayout);
    choicesEl.style.display = 'flex';

    document.getElementById('keyboard-hint').textContent =
      activeDirs.map(d => ARROW_CHARS[d]).join('  ') + '  Flèches du clavier';

  // ── Saisie libre ───────────────────────────────────────────────────────────
  } else if (q.type === 'write') {
    const writeInput    = document.getElementById('seq-write-input');
    const writeFeedback = document.getElementById('seq-write-feedback');
    writeInput.value             = '';
    writeInput.disabled          = false;
    writeInput.style.borderColor = 'var(--border)';
    writeFeedback.style.display  = 'none';
    writeFeedback.innerHTML      = '';
    document.getElementById('seq-write-validate').disabled = false;
    writeZone.style.display = 'flex';
    setTimeout(() => writeInput.focus(), 50);
    const validate = () => handleSequenceWrite(writeInput.value.trim(), correctAnswers, pair, questions, qIdx, isRetry);
    document.getElementById('seq-write-validate').onclick = validate;
    writeInput.onkeydown = e => { if (e.key === 'Enter') validate(); };

  // ── Cliquer sur l'item ─────────────────────────────────────────────────────
  } else if (q.type === 'click-item') {
    const correctItemIndices = (q.correctItemIndices && q.correctItemIndices.length) ? q.correctItemIndices : [0];
    const foundItemIndices   = new Set();
    displayEl.style.display  = 'flex';
    showAgainBtn.style.display = 'none';
    const allItemEls = Array.from(displayEl.querySelectorAll('.sequence-item-box, .sequence-text-display'));
    allItemEls.forEach((el, i) => {
      el.classList.remove('item-done', 'correct', 'incorrect', 'missed');
      el.dataset.itemIndex = String(i);
      el.classList.add('item-clickable');
      el.onclick = () => handleClickItemResponse(i, correctItemIndices, foundItemIndices, pair, questions, qIdx, isRetry);
    });

  // ── Choix multiples ────────────────────────────────────────────────────────
  } else {
    const shuffledChoices = q.shuffleAnswers !== false ? shuffleArray([...(q.choices || [])]) : [...(q.choices || [])];
    const foundAnswers    = new Set();
    shuffledChoices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className    = 'sequence-choice-btn';
      btn.dataset.value = choice;
      if (hasSqCodes(choice)) btn.appendChild(renderSqChoice(choice));
      else btn.textContent = choice;
      btn.addEventListener('click', () =>
        handleSequenceResponse(choice, correctAnswers, foundAnswers, pair, questions, qIdx, isRetry));
      choicesEl.appendChild(btn);
    });
    choicesEl.style.display = 'flex';
  }

  isWaiting    = false;
  pairStartTime = Date.now();
}

// ── Gestion des réponses ───────────────────────────────────────────────────
function handleSequenceResponse(chosen, correctAnswers, foundAnswers, pair, questions, qIdx, isRetry) {
  if (isWaiting) return;
  const q = questions[qIdx];
  const choicesEl = document.getElementById('sequence-choices');
  const clickedBtn = Array.from(choicesEl.querySelectorAll('.sequence-choice-btn'))
    .find(b => b.dataset.value === chosen);
  const isCorrect = correctAnswers.includes(chosen);
  responses.push({ pairId: pair.id, type: 'sequence', questionIndex: qIdx, chosen, isCorrect, correctAnswer: correctAnswers[0] || '', correctAnswers, isRetry: !!isRetry, timeMs: Date.now() - pairStartTime });

  if (isCorrect) {
    foundAnswers.add(chosen);
    if (clickedBtn) { clickedBtn.classList.add('correct'); clickedBtn.disabled = true; }
    if (foundAnswers.size < correctAnswers.length) return;
    // All correct answers found → advance
    isWaiting = true;
    Array.from(choicesEl.querySelectorAll('.sequence-choice-btn')).forEach(b => { b.disabled = true; });
    setTimeout(() => advance(pair, questions, qIdx, isRetry), 700);
  } else {
    // Wrong answer → disable all, show missed, handle retry
    isWaiting = true;
    Array.from(choicesEl.querySelectorAll('.sequence-choice-btn')).forEach(b => {
      b.disabled = true;
      if (b.dataset.value === chosen) b.classList.add('incorrect');
      // Only reveal correct answers on the final attempt (retry or no-retry-allowed), not the first wrong attempt when retry is available
      else if ((isRetry || q.allowRetry === false) && q.highlightCorrectOnRetry !== false && correctAnswers.includes(b.dataset.value) && !foundAnswers.has(b.dataset.value)) b.classList.add('missed');
    });
    setTimeout(() => resolveQuestion(false, q, pair, questions, qIdx, isRetry), 1200);
  }
}

function handleClickItemResponse(chosenIdx, correctItemIndices, foundItemIndices, pair, questions, qIdx, isRetry) {
  if (isWaiting) return;
  const q = questions[qIdx];
  const displayEl  = document.getElementById('sequence-display');
  const allItemEls = Array.from(displayEl.querySelectorAll('.sequence-item-box, .sequence-text-display'));
  const clickedEl  = allItemEls.find(el => el.dataset.itemIndex === String(chosenIdx));
  const isCorrect  = correctItemIndices.includes(chosenIdx);
  responses.push({ pairId: pair.id, type: 'sequence', questionIndex: qIdx, chosen: String(chosenIdx), isCorrect, correctAnswer: String(correctItemIndices[0] ?? 0), correctAnswers: correctItemIndices.map(String), isRetry: !!isRetry, timeMs: Date.now() - pairStartTime });

  if (isCorrect) {
    foundItemIndices.add(chosenIdx);
    if (clickedEl) { clickedEl.classList.add('correct'); clickedEl.classList.add('item-done'); }
    if (foundItemIndices.size < correctItemIndices.length) return;
    isWaiting = true;
    allItemEls.forEach(el => el.classList.add('item-done'));
    setTimeout(() => advance(pair, questions, qIdx, isRetry), 700);
  } else {
    isWaiting = true;
    allItemEls.forEach(el => {
      el.classList.add('item-done');
      const idx = parseInt(el.dataset.itemIndex);
      if (idx === chosenIdx) el.classList.add('incorrect');
      else if ((isRetry || q.allowRetry === false) && q.highlightCorrectOnRetry !== false && correctItemIndices.includes(idx) && !foundItemIndices.has(idx)) el.classList.add('missed');
    });
    setTimeout(() => resolveQuestion(false, q, pair, questions, qIdx, isRetry), 1200);
  }
}

function resolveQuestion(isCorrect, q, pair, questions, qIdx, isRetry) {
  if (!isCorrect && !isRetry && q.allowRetry !== false) {
    if (q.showOnRetry !== false && q.replayWithTimer === true && !pair.skipDisplay) {
      startSequenceDisplay(pair, () => startSequenceQuestion(pair, qIdx, true, true));
    } else {
      startSequenceQuestion(pair, qIdx, true);
    }
  } else {
    advance(pair, questions, qIdx, isRetry);
  }
}

function advance(pair, questions, qIdx, isRetry) {
  if (qIdx + 1 < questions.length) {
    startSequenceQuestion(pair, qIdx + 1, false);
  } else {
    previousPairWasCorrect = responses.length > 0 ? responses[responses.length - 1].isCorrect : null;
    pairIndex++;
    if (pairIndex >= currentPairs.length) {
      finishExercise();
    } else if (currentExercise.pauseBetweenPairs) {
      showPauseScreen();
    } else {
      renderPair();
    }
  }
}

function showPauseScreen() {
  if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
  stopAudio();
  const pauseDur = currentExercise.pauseDuration != null ? currentExercise.pauseDuration : 5000;
  document.getElementById('sequence-container').style.display = 'none';
  document.getElementById('keyboard-hint').textContent = '';
  document.getElementById('seq-pause-label').textContent = (pairIndex + 1) + ' / ' + currentPairs.length;
  const bar = document.getElementById('seq-pause-countdown-bar');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  bar.getBoundingClientRect();
  bar.style.transition = 'width ' + pauseDur + 'ms linear';
  bar.style.width = '0%';
  document.getElementById('seq-pause-continue').onclick = resumeFromPause;
  document.getElementById('seq-pause-screen').style.display = 'flex';
  pauseTimer = setTimeout(resumeFromPause, pauseDur);
}

function resumeFromPause() {
  if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
  document.getElementById('seq-pause-screen').style.display = 'none';
  renderPair();
}

function handleSequenceWrite(typed, correctAnswers, pair, questions, qIdx, isRetry) {
  if (isWaiting) return;
  isWaiting = true;
  const q = questions[qIdx];
  const isCorrect = correctAnswers.some(a => a.trim().toLowerCase() === typed.toLowerCase());
  const correctAnswer = correctAnswers[0] || '';
  responses.push({ pairId: pair.id, type: 'sequence', questionIndex: qIdx, chosen: typed, isCorrect, correctAnswer, correctAnswers, isRetry: !!isRetry, timeMs: Date.now() - pairStartTime });
  const writeInput    = document.getElementById('seq-write-input');
  const writeFeedback = document.getElementById('seq-write-feedback');
  writeInput.disabled = true;
  document.getElementById('seq-write-validate').disabled = true;
  writeInput.style.borderColor = isCorrect ? 'var(--success)' : 'var(--danger)';
  if (!isCorrect) {
    writeFeedback.style.display = 'block';
    writeFeedback.innerHTML = 'Réponse correcte : <strong>' + escapeHtml(correctAnswers.join(' / ')) + '</strong>';
  }
  const delay = isCorrect ? 700 : 1800;
  setTimeout(() => {
    writeInput.disabled = false;
    document.getElementById('seq-write-validate').disabled = false;
    resolveQuestion(isCorrect, q, pair, questions, qIdx, isRetry);
  }, delay);
}

function getDirectionsForOpts(dir, numOpts) {
  const opp = OPPOSITE[dir];
  if (numOpts <= 2) return [dir, opp];
  const all = ['left','right','up','down'];
  const perp = all.filter(d => d !== dir && d !== opp);
  if (numOpts === 3) return [dir, opp, perp[0]];
  return ['left', 'right', 'up', 'down'];
}

function handleDirectionResponse(pressed, correctDir, activeDirs, pair, questions, qIdx, isRetry) {
  if (isWaiting) return;
  if (!activeDirs.includes(pressed)) return;
  const q = questions[qIdx];
  const isCorrect = pressed === correctDir;
  responses.push({ pairId: pair.id, type: 'direction', questionIndex: qIdx, pressed, isCorrect, correctAnswer: correctDir, isRetry: !!isRetry, timeMs: Date.now() - pairStartTime });
  isWaiting = true;
  const choicesEl = document.getElementById('sequence-choices');
  Array.from(choicesEl.querySelectorAll('[data-dir]')).forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.dir === pressed) { btn.style.borderColor = isCorrect ? 'var(--success)' : 'var(--danger)'; btn.style.background = isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)'; }
    else if (!isCorrect && btn.dataset.dir === correctDir && q.highlightCorrectOnRetry !== false && (isRetry || q.allowRetry === false)) { btn.style.borderColor = 'var(--success)'; btn.style.background = 'var(--success-bg)'; btn.style.opacity = '0.6'; }
  });
  setTimeout(() => resolveQuestion(isCorrect, q, pair, questions, qIdx, isRetry), 700);
}

document.addEventListener('keydown', e => {
  if (document.getElementById('view-exercise').style.display !== 'none') {
    const pair = currentPairs[pairIndex];
    if (!pair) return;
    const q = (pair.questions || [])[currentQuestionIndex];
    if (q && q.type === 'direction') {
      const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
      const dir = map[e.key];
      if (dir) {
        const btn = document.querySelector('#sequence-choices [data-dir="'+dir+'"]:not(:disabled)');
        if (btn && !isWaiting) btn.click();
      }
    } else if (q && q.type === 'choice') {
      const choiceBtns = Array.from(document.querySelectorAll('#sequence-choices .sequence-choice-btn:not(:disabled)'));
      if (!isWaiting && choiceBtns.length > 0) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); choiceBtns[0].click(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); choiceBtns[choiceBtns.length - 1].click(); }
      }
    }
  }
});

// ── Fin de session ─────────────────────────────────────────────────────────
function finishExercise(isPartial) {
  if (isPartial && responses.length === 0 && pairIndex === 0) {
    if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
    stopAudio();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    showView('setup');
    return;
  }

  const totalTimeMs = Date.now() - exerciseStartTime;
  let score = 0, totalReactionMs = 0, reactionCount = 0;
  let errorsLeft = 0, errorsRight = 0, hasDirectionQuestions = false;

  const totalQuestionsInExercise = currentPairs.reduce((sum, p) =>
    sum + (p.questions || [{}]).length, 0);
  const attemptedQuestions = responses.filter(r => !r.isRetry).length;
  const effectiveTotalQuestions = isPartial ? (attemptedQuestions || 1) : totalQuestionsInExercise;

  responses.forEach(r => {
    if (r.isRetry) return;
    if (r.isCorrect) score++;
    totalReactionMs += r.timeMs; reactionCount++;
    if (r.type === 'direction') {
      hasDirectionQuestions = true;
      if (!r.isCorrect) {
        if (r.correctAnswer === 'left') errorsLeft++;
        else if (r.correctAnswer === 'right') errorsRight++;
      }
    }
  });

  const avgReactionMs = reactionCount > 0 ? Math.round(totalReactionMs / reactionCount) : null;

  const newSession = {
    id: newId('sess'), exerciseId: currentExercise.id, exerciseName: currentExercise.name,
    patientName: currentPatient, patientId: currentPatientId, date: new Date().toISOString(),
    totalTimeMs, totalPairs: effectiveTotalQuestions, score, responses, notes: '',
    ...(isPartial ? { partial: true, pairsAttempted: pairIndex, totalPairsInExercise: totalQuestionsInExercise } : {}),
    ...(hasDirectionQuestions ? { errorsLeft, errorsRight } : {}),
  };
  sessions.push(newSession);
  currentSessionId = newSession.id;
  try { saveSessions(); } catch(e) {}
  document.getElementById('session-notes').value = '';

  const partialNote = document.getElementById('results-partial-note');
  if (isPartial) {
    partialNote.style.display = '';
    partialNote.textContent = 'Résultats partiels — ' + pairIndex + ' paire' + (pairIndex > 1 ? 's' : '') + ' sur ' + currentPairs.length;
  } else {
    partialNote.style.display = 'none';
  }

  document.getElementById('progress-fill').style.width = isPartial
    ? (pairIndex / currentPairs.length * 100) + '%'
    : '100%';
  document.getElementById('results-meta').textContent  = 'Patient : ' + currentPatient + '  ·  ' + currentExercise.name;
  document.getElementById('res-score').textContent = score + ' / ' + effectiveTotalQuestions + ' (' + Math.round(score/effectiveTotalQuestions*100) + '%)';
  document.getElementById('res-time').textContent  = formatDuration(totalTimeMs);
  document.getElementById('card-avg-reaction').style.display = avgReactionMs !== null ? 'block' : 'none';
  if (avgReactionMs !== null) document.getElementById('res-avg-reaction').textContent = (avgReactionMs / 1000).toFixed(2) + ' s';
  document.getElementById('card-errors-left').style.display = hasDirectionQuestions ? 'block' : 'none';
  document.getElementById('card-errors-right').style.display = hasDirectionQuestions ? 'block' : 'none';
  if (hasDirectionQuestions) {
    document.getElementById('res-errors-left').textContent = errorsLeft;
    document.getElementById('res-errors-right').textContent = errorsRight;
  }
  document.getElementById('gonogo-result-panel').style.display = 'none';
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showView('session-result');
  if (typeof celebrateResult === 'function') celebrateResult(score, effectiveTotalQuestions);
}

document.getElementById('btn-restart').addEventListener('click', () => {
  if (currentExercise && currentExercise.type !== 'gonogo') {
    currentPairs = currentShuffleEnabled
      ? shuffleArray([...currentExercise.pairs])
      : [...currentExercise.pairs];
  }
  showView('instruction');
});
document.getElementById('btn-see-progress').addEventListener('click', () => showView('results'));

document.getElementById('session-notes').addEventListener('input', () => {
  const session = sessions.find(s => s.id === currentSessionId); if (!session) return;
  session.notes = document.getElementById('session-notes').value;
  saveSessions();
});

// ── Plein écran ────────────────────────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

document.getElementById('btn-quit-exercise').addEventListener('click', () => {
  if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
  if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
  document.getElementById('seq-pause-screen').style.display = 'none';
  _displayGen++;
  _gngCancelTimers();
  stopAudio();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showView('setup');
});

document.getElementById('btn-stop-exercise').addEventListener('click', () => {
  if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
  if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
  document.getElementById('seq-pause-screen').style.display = 'none';
  stopAudio();
  if (currentExercise && currentExercise.type === 'gonogo') {
    _gngCancelTimers();
    finishGoNoGo(true);
  } else {
    finishExercise(true);
  }
});

document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
document.getElementById('btn-fullscreen-setup').addEventListener('click', toggleFullscreen);

// ═══════════════════════════════════════════════════════════════════════════════
// GO / NO-GO SESSION
// ═══════════════════════════════════════════════════════════════════════════════
let _gng = { trials: [], index: 0, responses: [], timer: null, itiTimer: null, trialStart: 0, gen: 0 };

function _gngCancelTimers() {
  if (_gng.timer)    { clearTimeout(_gng.timer);    _gng.timer    = null; }
  if (_gng.itiTimer) { clearTimeout(_gng.itiTimer); _gng.itiTimer = null; }
  _gng.gen++;
  const display = document.getElementById('sequence-display');
  display.onclick = null;
  display.classList.remove('gng-clickable', 'gng-feedback-correct', 'gng-feedback-incorrect');
}

function startGoNoGoSession() {
  _gng.trials    = currentExercise.trials || [];
  _gng.index     = 0;
  _gng.responses = [];
  _gng.gen       = 0;
  document.getElementById('sequence-container').style.display = 'flex';
  document.getElementById('keyboard-hint').textContent = 'Cliquez sur l\'item si c\'est un signal GO';
  document.getElementById('sequence-question').style.display  = 'none';
  document.getElementById('sequence-choices').style.display   = 'none';
  document.getElementById('seq-show-again-btn').style.display = 'none';
  document.getElementById('seq-write-zone').style.display     = 'none';
  _gngRenderIti();
}

function _gngRenderIti() {
  const trial = _gng.trials[_gng.index];
  if (!trial) { finishGoNoGo(false); return; }

  const iti = currentExercise.iti != null ? currentExercise.iti : 500;
  const display  = document.getElementById('sequence-display');
  const timerBar = document.getElementById('sequence-timer-bar');

  _gngCancelTimers();
  timerBar.style.display  = 'none';
  display.style.display   = 'flex';
  display.innerHTML       = '';
  display.onclick         = null;
  display.classList.remove('gng-clickable');

  const fix = document.createElement('div');
  fix.className   = 'sequence-text-display';
  fix.textContent = '+';
  fix.style.cssText = 'color:var(--border);font-size:56px;font-weight:300;user-select:none';
  display.appendChild(fix);

  document.getElementById('progress-fill').style.width  = (_gng.index / _gng.trials.length * 100) + '%';
  document.getElementById('progress-label').textContent = (_gng.index + 1) + ' / ' + _gng.trials.length;

  const gen = ++_gng.gen;
  _gng.itiTimer = setTimeout(() => {
    if (gen !== _gng.gen) return;
    _gng.itiTimer = null;
    _gngRenderTrial();
  }, iti > 0 ? iti : 50);
}

function _gngRenderTrial() {
  const trial = _gng.trials[_gng.index];
  if (!trial) { finishGoNoGo(false); return; }

  const dur = trial.duration != null ? trial.duration
    : (currentExercise.defaultTrialDuration != null ? currentExercise.defaultTrialDuration : 1000);

  const display   = document.getElementById('sequence-display');
  const timerBar  = document.getElementById('sequence-timer-bar');
  const timerFill = document.getElementById('sequence-timer-fill');

  display.innerHTML = '';
  display.style.display = 'flex';
  const el = document.createElement('div');
  el.className = 'sequence-text-display';
  applyItemStyle(el, trial.item || { type: 'text', text: '?' });
  display.appendChild(el);

  timerBar.style.display    = '';
  timerFill.style.transition = 'none';
  timerFill.style.width      = '100%';
  timerFill.getBoundingClientRect();
  timerFill.style.transition = 'width ' + dur + 'ms linear';
  timerFill.style.width      = '0%';

  _gng.trialStart = Date.now();
  const gen = ++_gng.gen;

  display.classList.add('gng-clickable');
  display.onclick = () => {
    if (gen !== _gng.gen) return;
    _gng.timer && clearTimeout(_gng.timer);
    _gng.timer = null;
    _gng.gen++;
    display.onclick = null;
    display.classList.remove('gng-clickable');

    const rt       = Date.now() - _gng.trialStart;
    const isCorrect = trial.isGo;
    _gng.responses.push({ trialId: trial.id, type: 'gonogo', isGo: trial.isGo, reacted: true, isCorrect, reactionTimeMs: rt });
    _gngShowFeedback(isCorrect, () => { _gng.index++; _gngRenderIti(); });
  };

  _gng.timer = setTimeout(() => {
    if (gen !== _gng.gen) return;
    _gng.gen++;
    display.onclick = null;
    display.classList.remove('gng-clickable');
    _gng.timer = null;

    const isCorrect = !trial.isGo;
    _gng.responses.push({ trialId: trial.id, type: 'gonogo', isGo: trial.isGo, reacted: false, isCorrect, reactionTimeMs: null });
    if (currentExercise.showFeedback !== false && !isCorrect) {
      _gngShowFeedback(false, () => { _gng.index++; _gngRenderIti(); });
    } else {
      _gng.index++;
      _gngRenderIti();
    }
  }, dur);
}

function _gngShowFeedback(isCorrect, onDone) {
  if (currentExercise.showFeedback === false) { onDone(); return; }
  const display = document.getElementById('sequence-display');
  display.classList.add(isCorrect ? 'gng-feedback-correct' : 'gng-feedback-incorrect');
  setTimeout(() => {
    display.classList.remove('gng-feedback-correct', 'gng-feedback-incorrect');
    onDone();
  }, 350);
}

function finishGoNoGo(isPartial) {
  _gngCancelTimers();

  const resp    = _gng.responses;
  const trials  = _gng.trials;
  const total   = isPartial ? resp.length : trials.length;

  const hits               = resp.filter(r =>  r.isGo &&  r.reacted).length;
  const misses             = resp.filter(r =>  r.isGo && !r.reacted).length;
  const falseAlarms        = resp.filter(r => !r.isGo &&  r.reacted).length;
  const correctRejections  = resp.filter(r => !r.isGo && !r.reacted).length;
  const rts                = resp.filter(r =>  r.isGo &&  r.reacted).map(r => r.reactionTimeMs);
  const avgRt              = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
  const totalCorrect       = hits + correctRejections;
  const totalTimeMs        = Date.now() - exerciseStartTime;

  const newSession = {
    id: newId('sess'), exerciseId: currentExercise.id, exerciseName: currentExercise.name,
    patientName: currentPatient, patientId: currentPatientId,
    date: new Date().toISOString(), totalTimeMs,
    totalPairs: total || 1, score: totalCorrect,
    sessionType: 'gonogo',
    gonogoMetrics: { hits, misses, falseAlarms, correctRejections, avgRt },
    responses: resp, notes: '',
    ...(isPartial ? { partial: true } : {}),
  };
  sessions.push(newSession);
  currentSessionId = newSession.id;
  try { saveSessions(); } catch(e) {}

  document.getElementById('session-notes').value = '';
  document.getElementById('results-partial-note').style.display = isPartial ? '' : 'none';
  if (isPartial) document.getElementById('results-partial-note').textContent =
    'Résultats partiels — ' + _gng.index + ' essai' + (_gng.index > 1 ? 's' : '') + ' sur ' + trials.length;

  document.getElementById('progress-fill').style.width = isPartial
    ? (_gng.index / Math.max(trials.length, 1) * 100) + '%' : '100%';
  document.getElementById('results-meta').textContent = 'Patient : ' + currentPatient + '  ·  ' + currentExercise.name;

  const pct = total > 0 ? Math.round(totalCorrect / total * 100) : 0;
  document.getElementById('res-score').textContent = totalCorrect + ' / ' + total + ' (' + pct + '%)';
  document.getElementById('res-time').textContent  = formatDuration(totalTimeMs);

  document.getElementById('card-avg-reaction').style.display  = avgRt !== null ? 'block' : 'none';
  if (avgRt !== null) document.getElementById('res-avg-reaction').textContent = (avgRt / 1000).toFixed(2) + ' s';
  document.getElementById('card-errors-left').style.display  = 'none';
  document.getElementById('card-errors-right').style.display = 'none';

  document.getElementById('gonogo-result-panel').style.display     = 'block';
  document.getElementById('gng-hits').textContent                  = hits;
  document.getElementById('gng-misses').textContent                = misses;
  document.getElementById('gng-false-alarms').textContent          = falseAlarms;
  document.getElementById('gng-correct-rejections').textContent    = correctRejections;

  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showView('session-result');
  if (typeof celebrateResult === 'function') celebrateResult(totalCorrect, total || 1);
}

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = !!document.fullscreenElement;
  document.getElementById('btn-fullscreen').textContent        = isFullscreen ? '✕' : '⛶';
  document.getElementById('btn-fullscreen').title              = isFullscreen ? 'Quitter le plein écran' : 'Plein écran';
  document.getElementById('btn-fullscreen-setup').textContent  = isFullscreen ? '✕' : '⛶';
  document.getElementById('btn-fullscreen-setup').title        = isFullscreen ? 'Quitter le plein écran' : 'Plein écran';
  document.body.classList.toggle('is-fullscreen', isFullscreen);
});
