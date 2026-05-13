// ═══════════════════════════════════════════════════════════════════════════════
// SETUP VIEW
// ═══════════════════════════════════════════════════════════════════════════════
let setupSelectedExId = null;
const setupCollapsedFolders = new Set();

function initSetup() {
  if (exercises.length === 0) {
    document.getElementById('no-exercises-msg').style.display = 'block';
    document.getElementById('setup-form').style.display = 'none';
    return;
  }
  document.getElementById('no-exercises-msg').style.display = 'none';
  document.getElementById('setup-form').style.display = 'block';
  if (!setupSelectedExId || !exercises.find(ex => ex.id === setupSelectedExId)) {
    setupSelectedExId = exercises[0].id;
  }
  renderExercisePicker();
  populateSetupPatientSelect();
}

function renderExercisePicker() {
  const picker = document.getElementById('exercise-picker');
  picker.innerHTML = '';
  const knownFolderIds = new Set(folders.map(f => f.id));
  const byFolder = {};
  exercises.forEach(ex => {
    const k = (ex.folderId && knownFolderIds.has(ex.folderId)) ? ex.folderId : '__none__';
    (byFolder[k]||(byFolder[k]=[])).push(ex);
  });

  folders.forEach(folder => {
    const exList = byFolder[folder.id] || [];
    const isCollapsed = setupCollapsedFolders.has(folder.id);
    const header = document.createElement('div');
    header.className = 'folder-header';
    const toggle = document.createElement('span');
    toggle.className = 'folder-toggle' + (isCollapsed ? ' collapsed' : '');
    toggle.textContent = '▾';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'folder-name';
    nameSpan.textContent = folder.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'pair-count';
    countSpan.textContent = exList.length;
    header.append(toggle, nameSpan, countSpan);
    header.addEventListener('click', () => {
      if (setupCollapsedFolders.has(folder.id)) setupCollapsedFolders.delete(folder.id);
      else setupCollapsedFolders.add(folder.id);
      renderExercisePicker();
    });
    picker.appendChild(header);
    if (!isCollapsed) exList.forEach(ex => picker.appendChild(makePickerItem(ex, true)));
  });

  const uncategorized = byFolder['__none__'] || [];
  if (folders.length > 0 && uncategorized.length > 0) {
    const label = document.createElement('div');
    label.className = 'no-folder-label';
    label.textContent = 'Sans dossier';
    picker.appendChild(label);
  }
  uncategorized.forEach(ex => picker.appendChild(makePickerItem(ex, folders.length > 0)));
}

function makePickerItem(ex, indented) {
  const div = document.createElement('div');
  div.className = 'exercise-item' + (ex.id === setupSelectedExId ? ' active' : '') + (indented ? ' in-folder' : '');
  const nameSpan = document.createElement('span');
  nameSpan.textContent = ex.name;
  nameSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';
  const countSpan = document.createElement('span');
  countSpan.className = 'pair-count';
  countSpan.textContent = (ex.pairs||[]).length + ' paires';
  div.append(nameSpan, countSpan);
  div.addEventListener('click', () => { setupSelectedExId = ex.id; renderExercisePicker(); });
  return div;
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
  currentExercise = exercises.find(ex => ex.id === setupSelectedExId);
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
