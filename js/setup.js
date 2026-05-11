// ═══════════════════════════════════════════════════════════════════════════════
// SETUP VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function initSetup() {
  const select = document.getElementById('exercise-select');
  select.innerHTML = '';
  if (exercises.length === 0) {
    document.getElementById('no-exercises-msg').style.display = 'block';
    document.getElementById('setup-form').style.display = 'none';
    return;
  }
  document.getElementById('no-exercises-msg').style.display = 'none';
  document.getElementById('setup-form').style.display = 'block';
  exercises.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = ex.name + ' (' + (ex.pairs||[]).length + ' paires)';
    select.appendChild(opt);
  });
  populateSetupPatientSelect();
}

function populateSetupPatientSelect() {
  const select = document.getElementById('patient-select-setup');
  const current = select.value;
  select.innerHTML = '<option value="">— Sélectionner un patient —</option>';
  [...patients].sort((a,b) => a.name.localeCompare(b.name)).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    if (p.id === current) opt.selected = true;
    select.appendChild(opt);
  });
  const newOpt = document.createElement('option');
  newOpt.value = '__new__'; newOpt.textContent = '+ Nouveau patient…';
  select.appendChild(newOpt);
}

document.getElementById('patient-select-setup').addEventListener('change', () => {
  document.getElementById('new-patient-row').style.display =
    document.getElementById('patient-select-setup').value === '__new__' ? '' : 'none';
});

document.getElementById('btn-start').addEventListener('click', () => {
  currentExercise = exercises.find(ex => ex.id === document.getElementById('exercise-select').value);
  if (!currentExercise) return;

  const patientSelectEl = document.getElementById('patient-select-setup');
  const patientVal = patientSelectEl.value;
  if (patientVal === '__new__') {
    const nameInput = document.getElementById('new-patient-name');
    const name = nameInput.value.trim();
    if (!name) { nameInput.style.borderColor = 'var(--danger)'; nameInput.focus(); return; }
    nameInput.style.borderColor = '';
    const newPatient = { id: newId('pat'), name, birthDate: '', notes: '', createdAt: new Date().toISOString() };
    patients.push(newPatient); savePatients();
    currentPatientId = newPatient.id; currentPatient = newPatient.name;
  } else if (patientVal) {
    const patient = patients.find(p => p.id === patientVal);
    if (!patient) { patientSelectEl.style.borderColor = 'var(--danger)'; return; }
    currentPatientId = patient.id; currentPatient = patient.name;
  } else {
    patientSelectEl.style.borderColor = 'var(--danger)'; patientSelectEl.focus(); return;
  }
  patientSelectEl.style.borderColor = '';

  if (!currentExercise.pairs || currentExercise.pairs.length === 0) {
    alert("Cet exercice n'a pas de paires. Ajoutez des paires dans l'Éditeur.");
    return;
  }

  currentPairs = document.getElementById('shuffle-pairs').checked
    ? shuffleArray(currentExercise.pairs) : [...currentExercise.pairs];

  document.getElementById('instruction-text').textContent =
    currentExercise.instruction || '(Aucune consigne définie)';
  showView('instruction');
});
