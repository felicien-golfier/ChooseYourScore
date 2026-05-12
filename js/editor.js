// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
let editorSelectedId = null, editingPairId = null;
let seqItems = [];
let simModalImage = null;
let simModalAudio = null;
let editingItemIdx = -1;
let pendingOverrideCallback = null;
let simCharStyles = [];
let simCharSel = new Set();
let _simTextPrev = '';
const collapsedFolders = new Set();
function getSelectedEx() { return exercises.find(e => e.id === editorSelectedId) || null; }


function initEditor() {
  if (editorSelectedId === null && exercises.length > 0) editorSelectedId = exercises[0].id;
  renderSidebar();
  renderExerciseEditor();
}

function renderSidebar() {
  const list = document.getElementById('exercise-list');
  list.innerHTML = '';
  if (exercises.length === 0 && folders.length === 0) {
    list.innerHTML = '<div style="padding:16px;color:var(--text-3);font-size:0.8rem;text-align:center">Aucun exercice</div>';
    return;
  }
  const byFolder = {};
  exercises.forEach(ex => { const k = ex.folderId || '__none__'; (byFolder[k]||(byFolder[k]=[])).push(ex); });

  folders.forEach(folder => {
    const exList = byFolder[folder.id] || [];
    const isCollapsed = collapsedFolders.has(folder.id);

    // Folder header
    const header = document.createElement('div');
    header.className = 'folder-header';
    const toggle = document.createElement('span');
    toggle.className = 'folder-toggle' + (isCollapsed ? ' collapsed' : '');
    toggle.textContent = '▾';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'folder-name';
    nameSpan.dataset.folderId = folder.id;
    nameSpan.textContent = folder.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'pair-count';
    countSpan.textContent = exList.length;
    const delBtn = document.createElement('button');
    delBtn.className = 'folder-del-btn'; delBtn.title = 'Supprimer le dossier'; delBtn.textContent = '✕';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('Supprimer le dossier "' + folder.name + '" ? Les exercices seront conservés sans dossier.')) return;
      exercises.forEach(ex => { if (ex.folderId === folder.id) ex.folderId = null; });
      folders = folders.filter(f => f.id !== folder.id);
      saveFolders(); saveExercises(); renderSidebar(); renderFolderSelect();
    });
    const fi = folders.indexOf(folder);
    const { wrap: mvWrap, up: upBtn, dn: dnBtn } = makeReorderBtns(
      e => { e.stopPropagation(); moveFolder(folder.id, -1); },
      e => { e.stopPropagation(); moveFolder(folder.id,  1); }
    );
    setReorderDisabled(upBtn, fi === 0);
    setReorderDisabled(dnBtn, fi === folders.length - 1);
    header.append(toggle, nameSpan, countSpan, mvWrap, delBtn);
    header.addEventListener('click', e => {
      if (e.target === delBtn || e.target === nameSpan || mvWrap.contains(e.target)) return;
      if (collapsedFolders.has(folder.id)) collapsedFolders.delete(folder.id); else collapsedFolders.add(folder.id);
      renderSidebar();
    });
    // Rename on double-click
    nameSpan.addEventListener('dblclick', e => {
      e.stopPropagation();
      nameSpan.contentEditable = 'true'; nameSpan.focus();
      const range = document.createRange(); range.selectNodeContents(nameSpan);
      window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    });
    nameSpan.addEventListener('blur', () => {
      nameSpan.contentEditable = 'false';
      const newName = nameSpan.textContent.trim() || folder.name;
      folder.name = newName; nameSpan.textContent = newName;
      saveFolders(); renderFolderSelect();
    });
    nameSpan.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); nameSpan.blur(); }
      e.stopPropagation();
    });
    list.appendChild(header);

    // Exercises in folder
    if (!isCollapsed) exList.forEach(ex => list.appendChild(makeExerciseItem(ex, true)));
  });

  // Uncategorized
  const uncategorized = byFolder['__none__'] || [];
  if (folders.length > 0 && uncategorized.length > 0) {
    const label = document.createElement('div');
    label.className = 'no-folder-label'; label.textContent = 'Sans dossier';
    list.appendChild(label);
  }
  uncategorized.forEach(ex => list.appendChild(makeExerciseItem(ex, folders.length > 0)));
}

function makeExerciseItem(ex, indented) {
  const div = document.createElement('div');
  div.className = 'exercise-item' + (ex.id === editorSelectedId ? ' active' : '') + (indented ? ' in-folder' : '');
  const nameSpan = document.createElement('span');
  nameSpan.textContent = ex.name;
  nameSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';
  const peers = exercises.filter(e => (e.folderId || null) === (ex.folderId || null));
  const pi = peers.indexOf(ex);
  const { wrap, up, dn } = makeReorderBtns(
    e => { e.stopPropagation(); moveExercise(ex.id, -1); },
    e => { e.stopPropagation(); moveExercise(ex.id,  1); }
  );
  up.disabled = (pi === 0);
  dn.disabled = (pi === peers.length - 1);
  const countSpan = document.createElement('span');
  countSpan.className = 'pair-count';
  countSpan.textContent = (ex.pairs||[]).length;
  div.append(nameSpan, wrap, countSpan);
  div.addEventListener('click', () => { editorSelectedId = ex.id; renderSidebar(); renderExerciseEditor(); });
  return div;
}

function moveExercise(exId, dir) {
  const ex = exercises.find(e => e.id === exId);
  if (!ex) return;
  const peers = exercises.filter(e => (e.folderId || null) === (ex.folderId || null));
  const pi = peers.indexOf(ex), pj = pi + dir;
  if (pj < 0 || pj >= peers.length) return;
  const gi = exercises.indexOf(ex), gj = exercises.indexOf(peers[pj]);
  [exercises[gi], exercises[gj]] = [exercises[gj], exercises[gi]];
  saveExercises(); renderSidebar();
}

function moveFolder(folderId, dir) {
  const fi = folders.findIndex(f => f.id === folderId);
  const fj = fi + dir;
  if (fj < 0 || fj >= folders.length) return;
  [folders[fi], folders[fj]] = [folders[fj], folders[fi]];
  saveFolders(); renderSidebar();
}

function renderFolderSelect() {
  const select = document.getElementById('exercise-folder');
  if (!select) return;
  select.innerHTML = '<option value="">— Sans dossier —</option>';
  folders.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id; opt.textContent = f.name;
    select.appendChild(opt);
  });
  const ex = getSelectedEx();
  if (ex) select.value = ex.folderId || '';
}

function renderExerciseEditor() {
  const ex = getSelectedEx();
  document.getElementById('editor-empty-state').style.display = ex ? 'none'  : 'block';
  document.getElementById('exercise-editor').style.display    = ex ? 'block' : 'none';
  if (!ex) return;
  document.getElementById('exercise-name').value        = ex.name;
  document.getElementById('exercise-instruction').value = ex.instruction || '';
  document.getElementById('exercise-default-duration').value = ex.defaultDisplayDuration != null ? (ex.defaultDisplayDuration / 1000) : '';
  document.getElementById('pair-count-badge').textContent = (ex.pairs||[]).length;
  renderFolderSelect();
  renderPairsList(ex);
}

function renderPairsList(ex) {
  const list = document.getElementById('pairs-list');
  list.innerHTML = '';
  (ex.pairs||[]).forEach((pair, i) => {
    const row = document.createElement('div');
    row.className = 'pair-row';
    const preview = document.createElement('div');
    preview.className = 'pair-preview';

    // All pairs are sequences — show item chips + question summary
    const items = pair.items || [];
    const isMobile = window.innerWidth <= 640;
    items.slice(0, 4).forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'pair-item-preview';
      const chipW = isMobile ? 56 : 38;
      chip.style.cssText = `width:${chipW}px;height:38px;min-height:0;overflow:hidden;flex:none;display:flex;align-items:center;justify-content:center;white-space:nowrap`;
      const itemObj = typeof item === 'string' ? {type:'text',text:item} : item;
      applyItemStyle(chip, itemObj);
      if (itemObj.type === 'arrow') {
        // Cap arrow glyph so it always fits inside the 38px-tall box
        chip.style.fontSize = Math.min(parseFloat(chip.style.fontSize) || 72, 26) + 'px';
      } else if (isMobile) {
        chip.style.fontSize = Math.min(parseFloat(chip.style.fontSize) || 32, 13) + 'px';
      }
      preview.appendChild(chip);
    });
    if (items.length > 4) {
      const more = document.createElement('span');
      more.style.cssText = 'font-size:0.72rem;color:var(--text-3);flex:none';
      more.textContent = '+' + (items.length - 4);
      preview.appendChild(more);
    }
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.76rem;color:var(--text-3);margin-left:6px;font-family:var(--font-mono)';
    const questions = pair.questions || [];
    let durLabel;
    if (pair.skipDisplay) {
      durLabel = 'Direct';
    } else if (pair.useExerciseDefault) {
      const exDur = ex.defaultDisplayDuration;
      durLabel = exDur != null ? 'Défaut (' + (exDur / 1000) + ' s)' : 'Défaut';
    } else {
      const dur = pair.displayDuration != null ? pair.displayDuration : 1000;
      durLabel = (dur / 1000) + ' s';
    }
    lbl.textContent = durLabel + ' · ' + questions.length + 'q';
    preview.appendChild(lbl);

    const audioUrls = items
      .filter(it => typeof it === 'object' && it.audioUrl)
      .map(it => it.audioUrl);
    if (audioUrls.length > 0) {
      const soundBtn = document.createElement('button');
      soundBtn.className = 'pair-sound-btn';
      soundBtn.title = 'Rejouer le son';
      soundBtn.textContent = '🔊';
      soundBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (soundBtn.classList.contains('playing')) { _audioEl.pause(); _audioQueue = []; soundBtn.classList.remove('playing'); soundBtn.textContent = '🔊'; return; }
        soundBtn.classList.add('playing'); soundBtn.textContent = '🔉';
        const remaining = [...audioUrls];
        function playNext() {
          if (remaining.length === 0) { soundBtn.classList.remove('playing'); soundBtn.textContent = '🔊'; return; }
          playAudioUrl(remaining.shift(), playNext);
        }
        playNext();
      });
      preview.appendChild(soundBtn);
    }

    const actions = document.createElement('div');
    actions.className = 'pair-actions';
    const editBtn      = makePairBtn('✏','edit',  'Modifier',   () => openPairModal(pair.id));
    const duplicateBtn = makePairBtn('⧉','',     'Dupliquer',  () => duplicatePair(pair.id));
    const { wrap: mvWrap, up: upBtn, dn: downBtn } = makeReorderBtns(
      () => movePair(pair.id, -1),
      () => movePair(pair.id,  1)
    );
    upBtn.disabled   = (i === 0);
    downBtn.disabled = (i === ex.pairs.length - 1);
    const deleteBtn  = makePairBtn('✕','delete','Supprimer',  () => deletePair(pair.id));
    actions.append(editBtn, duplicateBtn, mvWrap, deleteBtn);
    row.append(preview, actions);
    list.appendChild(row);
  });
}

function makePairBtn(icon, cls, title, handler) {
  const btn = document.createElement('button');
  btn.className = 'pair-action-btn'+(cls?' '+cls:''); btn.title = title; btn.textContent = icon;
  btn.addEventListener('click', handler); return btn;
}

document.getElementById('btn-new-folder').addEventListener('click', () => {
  const folder = { id: newId('fold'), name: 'Nouveau dossier' };
  folders.push(folder); saveFolders(); renderSidebar(); renderFolderSelect();
  setTimeout(() => {
    const nameEl = document.querySelector('.folder-name[data-folder-id="' + folder.id + '"]');
    if (!nameEl) return;
    nameEl.contentEditable = 'true'; nameEl.focus();
    const range = document.createRange(); range.selectNodeContents(nameEl);
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
  }, 50);
});

document.getElementById('exercise-folder').addEventListener('change', () => {
  const ex = getSelectedEx(); if (!ex) return;
  ex.folderId = document.getElementById('exercise-folder').value || null;
  saveExercises(); renderSidebar();
});

document.getElementById('btn-new-exercise').addEventListener('click', () => {
  const ex = { id: newId('ex'), name: 'Nouvel exercice', instruction: '', pairs: [], folderId: null, defaultDisplayDuration: 3000 };
  exercises.push(ex); saveExercises();
  editorSelectedId = ex.id; renderSidebar(); renderExerciseEditor();
  setTimeout(() => { const i = document.getElementById('exercise-name'); i.focus(); i.select(); }, 50);
});

document.getElementById('exercise-name').addEventListener('input', () => {
  const ex = getSelectedEx(); if (!ex) return;
  ex.name = document.getElementById('exercise-name').value;
  saveExercises(); renderSidebar();
});

document.getElementById('exercise-instruction').addEventListener('input', () => {
  const ex = getSelectedEx(); if (!ex) return;
  ex.instruction = document.getElementById('exercise-instruction').value;
  saveExercises();
});

document.getElementById('exercise-default-duration').addEventListener('input', () => {
  const ex = getSelectedEx(); if (!ex) return;
  const val = parseFloat(document.getElementById('exercise-default-duration').value);
  ex.defaultDisplayDuration = (!isNaN(val) && val > 0) ? Math.round(val * 1000) : null;
  saveExercises();
});

document.getElementById('btn-duplicate-exercise').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  const copy = JSON.parse(JSON.stringify(ex));
  copy.id = newId('ex');
  copy.name = copy.name + ' (copie)';
  copy.pairs.forEach(p => { p.id = newId('pair'); });
  exercises.push(copy);
  editorSelectedId = copy.id;
  saveExercises(); renderSidebar(); renderExerciseEditor();
});

document.getElementById('btn-export-csv-pairs').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  const pairs = (ex.pairs || []).filter(p => p.type === 'sequence');
  if (pairs.length === 0) { alert('Aucune paire à exporter.'); return; }
  const itemText = item => {
    if (!item || typeof item === 'string') return item || '';
    if (item.type === 'arrow') return ARROW_CHARS[item.arrowDirection||'left'] || '';
    return item.text || '';
  };
  const lines = pairs.map(p => {
    const items = (p.items || []).map(itemText);
    const q = (p.questions || [])[0];
    // For 2-item choice pairs, append correct column for round-trip compat
    if (items.length === 2 && q && q.type === 'choice') {
      const correctIdx = (q.correctIndices || [0])[0];
      items.push(correctIdx === 1 ? 'droite' : 'gauche');
    }
    return items.map(v => v.includes(',') ? '"' + v.replace(/"/g, '""') + '"' : v).join(',');
  });
  downloadBlob('\uFEFF' + lines.join('\n'), (ex.name||'paires').replace(/\s+/g,'-')+'-paires.csv', 'text/csv;charset=utf-8');
});

document.getElementById('btn-import-csv-pairs').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  document.getElementById('csv-pairs-input').click();
});

document.getElementById('csv-pairs-input').addEventListener('change', e => {
  const ex = getSelectedEx();
  const file = e.target.files[0]; if (!file || !ex) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const lines = evt.target.result.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    let added = 0;
    lines.forEach(line => {
      // Simple CSV split (no quoted-field parser needed for basic text)
      const parts = line.split(',').map(p => p.trim());
      if (parts.every(p => !p)) return;
      const last = parts[parts.length - 1].toLowerCase();
      const isCorrectMarker = ['gauche','droite','left','right','g','d','l','r','0','1'].includes(last);
      const itemTexts = isCorrectMarker ? parts.slice(0, -1) : parts;
      if (itemTexts.every(t => !t)) return;
      const makeItem = text => ({type:'text', text, color:'#1a1a1a', fontSize:32, fontFamily:'Arial', textTransform:'none', imageUrl:null, audioUrl:null});
      const items = itemTexts.map(makeItem);
      let questions;
      if (isCorrectMarker && items.length === 2) {
        const correctIdx = ['droite','right','d','r','1'].includes(last) ? 1 : 0;
        questions = [{questionText:'', type:'choice',
          choices: itemTexts, correctIndices:[correctIdx],
          showOnRetry:true, allowRetry:true}];
      } else {
        questions = [{questionText:'', type:'choice',
          choices: itemTexts, correctIndices:[0],
          showOnRetry:true, allowRetry:true}];
      }
      ex.pairs.push({id:newId('pair'), type:'sequence', items,
        displayDuration: isCorrectMarker && items.length === 2 ? 0 : 1000, questions});
      added++;
    });
    saveExercises(); renderExerciseEditor();
    alert(added + ' paire(s) importée(s).');
  };
  reader.readAsText(file); e.target.value = '';
});

document.getElementById('btn-delete-exercise').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  if (!confirm('Supprimer l\'exercice "' + ex.name + '" et toutes ses paires ?')) return;
  exercises = exercises.filter(e => e.id !== editorSelectedId);
  editorSelectedId = exercises.length > 0 ? exercises[0].id : null;
  saveExercises(); renderSidebar(); renderExerciseEditor();
});

document.getElementById('btn-add-pair').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  const pair = { id: newId('pair'), type: 'sequence',
    items: [{type:'text',text:'',color:'#1a1a1a',fontSize:32,fontFamily:'Arial',textTransform:'none',imageUrl:null,audioUrl:null}],
    displayDuration: null, useExerciseDefault: true, visibilityMode: 'always_show',
    questions: [{questionText:'',type:'choice',choices:['',''],correctIndices:[0],showOnRetry:true,allowRetry:true,itemOverrides:[]}] };
  ex.pairs.push(pair); saveExercises(); renderExerciseEditor(); openPairModal(pair.id);
});

function duplicatePair(pairId) {
  const ex = getSelectedEx(); if (!ex) return;
  const index = ex.pairs.findIndex(p => p.id === pairId); if (index === -1) return;
  const copy = JSON.parse(JSON.stringify(ex.pairs[index]));
  copy.id = newId('pair');
  ex.pairs.splice(index + 1, 0, copy);
  saveExercises(); renderExerciseEditor();
}

function deletePair(pairId) {
  const ex = getSelectedEx(); if (!ex) return;
  if (!confirm('Supprimer cette paire ?')) return;
  ex.pairs = ex.pairs.filter(p => p.id !== pairId); saveExercises(); renderExerciseEditor();
}

function movePair(pairId, dir) {
  const ex = getSelectedEx(); if (!ex) return;
  const i = ex.pairs.findIndex(p => p.id === pairId), j = i+dir;
  if (j<0 || j>=ex.pairs.length) return;
  [ex.pairs[i], ex.pairs[j]] = [ex.pairs[j], ex.pairs[i]]; saveExercises(); renderExerciseEditor();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR – PAIR MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function openPairModal(pairId) {
  const ex = getSelectedEx(); if (!ex) return;
  const pair = ex.pairs.find(p => p.id === pairId); if (!pair) return;
  editingPairId = pairId;
  fillSequenceModal(pair);
  document.getElementById('pair-modal').style.display = 'flex';
}

function pickOption(id, val) {
  for (const o of document.getElementById(id).options) { if (o.value===val) { o.selected=true; return; } }
}

document.getElementById('btn-modal-save').addEventListener('click', () => {
  const ex = getSelectedEx(); if (!ex) return;
  const pair = ex.pairs.find(p => p.id === editingPairId); if (!pair) return;
  const seqData = readSequenceModal();
  pair.type                = 'sequence';
  pair.items               = seqData.items;
  pair.skipDisplay         = seqData.skipDisplay;
  pair.visibilityMode      = seqData.visibilityMode;
  pair.useExerciseDefault  = seqData.useExerciseDefault;
  pair.displayDuration     = seqData.displayDuration;
  pair.questions           = seqData.questions;
  delete pair.questionText; delete pair.choices;
  delete pair.left; delete pair.right; delete pair.correct;
  delete pair.direction; delete pair.bgColor; delete pair.rule; delete pair.numOptions;
  saveExercises(); renderExerciseEditor(); closeModal();
});

document.getElementById('btn-modal-cancel').addEventListener('click', () => {
  const ex = getSelectedEx();
  if (ex) {
    const pair = ex.pairs.find(p => p.id === editingPairId);
    const isEmpty = pair && (!pair.items || pair.items.every(i => !i || (!i.text && !i.imageUrl && !i.audioUrl && i.type === 'text')));
    if (isEmpty) { ex.pairs = ex.pairs.filter(p => p.id !== editingPairId); saveExercises(); renderExerciseEditor(); }
  }
  closeModal();
});

function closeModal() { document.getElementById('pair-modal').style.display='none'; editingPairId=null; }

// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR – ITEM MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function setSimSect(type) {
  ['text','image','audio','arrow'].forEach(t => {
    const el = document.getElementById('sim-sect-'+t);
    if (el) el.style.display = t === type ? 'block' : 'none';
  });
  document.querySelectorAll('#sim-type-tabs .item-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.type === type));
}

function refreshSimPreview() {
  applyItemStyle(document.getElementById('sim-preview-box'), readItemModal());
}

function updateSimImageThumb() {
  const row = document.getElementById('sim-img-thumb-row');
  const thumb = document.getElementById('sim-img-thumb');
  if (simModalImage) { thumb.src = simModalImage; row.style.display = 'flex'; }
  else { thumb.src = ''; row.style.display = 'none'; }
}

function updateSimAudioUI() {
  const row = document.getElementById('sim-audio-loaded');
  row.style.display = simModalAudio ? 'flex' : 'none';
  if (simModalAudio) document.getElementById('sim-audio-name').textContent = '🎵 Audio chargé';
}

// ── Per-character formatting helpers ─────────────────────────────────────────
function syncSimCharStyles(newLen) {
  while (simCharStyles.length < newLen) simCharStyles.push(null);
  simCharStyles = simCharStyles.slice(0, newLen);
}

function buildSimCharGrid() {
  const textEl = document.getElementById('sim-text');
  const text = textEl ? textEl.value : '';
  syncSimCharStyles(text.length);

  const section = document.getElementById('sim-char-grid-section');
  const grid = document.getElementById('sim-char-grid');
  if (!section || !grid) return;

  section.style.display = text.length > 0 ? '' : 'none';
  const baseColor = document.getElementById('sim-color')?.value || '#1a1a1a';

  grid.innerHTML = '';
  Array.from(text).forEach((char, i) => {
    const cs = simCharStyles[i];
    const isSel = simCharSel.has(i);
    const isStyled = cs && Object.keys(cs).length > 0;
    const cell = document.createElement('div');
    cell.className = 'char-cell' + (isSel ? ' char-selected' : '') + (isStyled ? ' char-styled' : '');
    cell.style.color = (cs && cs.color) ? cs.color : baseColor;
    if (cs && cs.fontSize)   cell.style.fontSize   = cs.fontSize + 'px';
    if (cs && cs.fontFamily) cell.style.fontFamily  = cs.fontFamily;
    cell.textContent = char === ' ' ? ' ' : char;
    cell.title = 'Clic : sélectionner · Ctrl+clic : ajouter/retirer · Maj+clic : plage';
    cell.addEventListener('mousedown', e => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        if (simCharSel.has(i)) simCharSel.delete(i); else simCharSel.add(i);
      } else if (e.shiftKey && simCharSel.size > 0) {
        const last = Math.max(...simCharSel);
        const start = Math.min(last, i), end = Math.max(last, i);
        for (let j = start; j <= end; j++) simCharSel.add(j);
      } else {
        simCharSel.clear();
        simCharSel.add(i);
      }
      buildSimCharGrid();
    });
    grid.appendChild(cell);
  });
  updateSimCharToolbar();
}

function updateSimCharToolbar() {
  const toolbar = document.getElementById('sim-char-toolbar');
  if (!toolbar) return;
  if (simCharSel.size === 0) { toolbar.style.display = 'none'; return; }
  toolbar.style.display = '';
  const first = Math.min(...simCharSel);
  const cs = simCharStyles[first];
  const baseColor = document.getElementById('sim-color')?.value || '#1a1a1a';
  document.getElementById('sim-char-color').value = (cs && cs.color) ? cs.color : baseColor;
  document.getElementById('sim-char-size').value  = (cs && cs.fontSize)   ? String(cs.fontSize)   : '';
  document.getElementById('sim-char-font').value  = (cs && cs.fontFamily) ? cs.fontFamily          : '';
}

function applyCharStyle(updates) {
  simCharSel.forEach(i => {
    if (!simCharStyles[i]) simCharStyles[i] = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v == null) delete simCharStyles[i][k];
      else simCharStyles[i][k] = v;
    }
    if (Object.keys(simCharStyles[i]).length === 0) simCharStyles[i] = null;
  });
  buildSimCharGrid();
  refreshSimPreview();
}

function fillItemModal(item) {
  // Migrate legacy 'color' type items to 'text' with bgColor
  if (item && item.type === 'color') item = { type: 'text', text: item.text || '', color: item.color || '#1a1a1a', fontSize: item.fontSize || 32, fontFamily: item.fontFamily || 'Arial', textTransform: item.textTransform || 'none', bgColor: item.bgColor || '#3b82f6', imageUrl: null, audioUrl: null };
  const type = (item && item.type) || 'text';
  setSimSect(type);
  simModalImage = null; simModalAudio = null;
  const defaultBg = type === 'arrow' ? '#3b82f6' : '#ffffff';
  document.getElementById('sim-bg-color').value = item.bgColor || defaultBg;
  if (type === 'image') {
    simModalImage = item.imageUrl || null; updateSimImageThumb();
    document.getElementById('sim-img-text').value = item.text || '';
    document.getElementById('sim-img-textcolor').value = item.color || '#ffffff';
  } else if (type === 'audio') {
    simModalAudio = item.audioUrl || null; updateSimAudioUI();
    document.getElementById('sim-audio-label').value = item.text || '';
    document.getElementById('sim-audio-autoplay').checked = item.autoPlay !== false;
  } else if (type === 'arrow') {
    document.getElementById('sim-arrow-dir').value = item.arrowDirection || 'left';
  } else {
    document.getElementById('sim-text').value  = item.text  || '';
    document.getElementById('sim-color').value = item.color || '#1a1a1a';
    pickOption('sim-size',      String(item.fontSize  || 32));
    pickOption('sim-font',      item.fontFamily   || 'Arial');
    pickOption('sim-transform', item.textTransform || 'none');
    simCharStyles = (item && item.charStyles) ? item.charStyles.map(cs => cs ? {...cs} : null) : [];
    simCharSel = new Set();
    _simTextPrev = (item && item.text) || '';
    buildSimCharGrid();
  }
  refreshSimPreview();
}

function readItemModal() {
  const type = document.querySelector('#sim-type-tabs .item-type-btn.active')?.dataset.type || 'text';
  const bgColor = document.getElementById('sim-bg-color').value;
  if (type === 'image') return { type, imageUrl: simModalImage||null,
    text: document.getElementById('sim-img-text').value||'',
    color: document.getElementById('sim-img-textcolor').value,
    bgColor, audioUrl: null };
  if (type === 'audio') return { type, audioUrl: simModalAudio||null,
    text: document.getElementById('sim-audio-label').value||'',
    autoPlay: document.getElementById('sim-audio-autoplay').checked,
    bgColor, imageUrl: null };
  if (type === 'arrow') return { type,
    arrowDirection: document.getElementById('sim-arrow-dir').value,
    bgColor };
  const _cleanCharStyles = simCharStyles.map(cs => (cs && Object.keys(cs).length > 0) ? {...cs} : null);
  const _hasCharStyles = _cleanCharStyles.some(s => s !== null);
  return { type: 'text',
    text:          document.getElementById('sim-text').value,
    color:         document.getElementById('sim-color').value,
    fontSize:      parseInt(document.getElementById('sim-size').value, 10)||32,
    fontFamily:    document.getElementById('sim-font').value,
    textTransform: document.getElementById('sim-transform').value,
    bgColor, imageUrl: null, audioUrl: null,
    charStyles: _hasCharStyles ? _cleanCharStyles : undefined };
}

function openSeqItemModal(idx) {
  editingItemIdx = idx;
  fillItemModal(seqItems[idx] || {type:'text',text:''});
  document.getElementById('seq-item-modal').style.display = 'flex';
}

function closeSeqItemModal() {
  document.getElementById('seq-item-modal').style.display = 'none';
  editingItemIdx = -1;
  pendingOverrideCallback = null;
}

document.querySelectorAll('#sim-type-tabs .item-type-btn').forEach(btn => {
  btn.addEventListener('click', () => { setSimSect(btn.dataset.type); refreshSimPreview(); });
});

['sim-text','sim-color','sim-size','sim-font','sim-transform',
 'sim-img-text','sim-img-textcolor','sim-arrow-dir','sim-bg-color',
 'sim-audio-label'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', refreshSimPreview); el.addEventListener('change', refreshSimPreview); }
});

// Rebuild char grid when text content or base styles change
document.getElementById('sim-text').addEventListener('input', e => {
  const newText = e.target.value;
  const oldLen = _simTextPrev.length;
  const newLen = newText.length;
  const diff = newLen - oldLen;
  if (diff === 1) {
    const pos = e.target.selectionStart - 1;
    simCharStyles.splice(pos, 0, null);
  } else if (diff === -1) {
    const pos = e.target.selectionStart;
    simCharStyles.splice(pos, 1);
  } else {
    syncSimCharStyles(newLen);
  }
  _simTextPrev = newText;
  buildSimCharGrid();
});
document.getElementById('sim-text').addEventListener('change', e => {
  syncSimCharStyles(e.target.value.length);
  _simTextPrev = e.target.value;
  buildSimCharGrid();
});
['sim-color','sim-size','sim-font'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', buildSimCharGrid); el.addEventListener('change', buildSimCharGrid); }
});

// Char toolbar events
document.getElementById('sim-char-color').addEventListener('input', e => applyCharStyle({ color: e.target.value }));
document.getElementById('sim-char-reset-color').addEventListener('click', () => applyCharStyle({ color: null }));
document.getElementById('sim-char-size').addEventListener('change', e => applyCharStyle({ fontSize: e.target.value ? parseInt(e.target.value) : null }));
document.getElementById('sim-char-font').addEventListener('change', e => applyCharStyle({ fontFamily: e.target.value || null }));
document.getElementById('sim-char-reset').addEventListener('click', () => {
  simCharSel.forEach(i => { simCharStyles[i] = null; });
  buildSimCharGrid(); refreshSimPreview();
});
document.getElementById('sim-char-reset-all').addEventListener('click', () => {
  if (!confirm('Réinitialiser tout le formatage par caractère ?')) return;
  simCharStyles = simCharStyles.map(() => null);
  simCharSel.clear();
  buildSimCharGrid(); refreshSimPreview();
});
document.getElementById('sim-char-select-all').addEventListener('click', () => {
  const text = document.getElementById('sim-text').value;
  for (let i = 0; i < text.length; i++) simCharSel.add(i);
  buildSimCharGrid();
});
document.getElementById('sim-char-deselect').addEventListener('click', () => {
  simCharSel.clear();
  buildSimCharGrid();
});

document.getElementById('sim-img-btn').addEventListener('click', () => document.getElementById('sim-img-input').click());
document.getElementById('sim-img-input').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => { simModalImage = evt.target.result; updateSimImageThumb(); refreshSimPreview(); };
  reader.readAsDataURL(file); e.target.value = '';
});
document.getElementById('sim-img-remove').addEventListener('click', () => { simModalImage = null; updateSimImageThumb(); refreshSimPreview(); });

document.getElementById('sim-audio-btn').addEventListener('click', () => document.getElementById('sim-audio-input').click());
document.getElementById('sim-audio-input').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => { simModalAudio = evt.target.result; updateSimAudioUI(); refreshSimPreview(); };
  reader.readAsDataURL(file); e.target.value = '';
});
document.getElementById('sim-audio-remove').addEventListener('click', () => { simModalAudio = null; updateSimAudioUI(); refreshSimPreview(); });
document.getElementById('sim-audio-play').addEventListener('click', () => {
  if (simModalAudio) playAudioUrl(simModalAudio);
});

document.getElementById('sim-save').addEventListener('click', () => {
  const item = readItemModal();
  if (pendingOverrideCallback) {
    pendingOverrideCallback(item);
    pendingOverrideCallback = null;
    closeSeqItemModal();
    refreshSequencePreview();
  } else {
    if (editingItemIdx < 0) return;
    seqItems[editingItemIdx] = item;
    closeSeqItemModal();
    refreshSequenceItemInputs();
  }
});
document.getElementById('sim-cancel').addEventListener('click', closeSeqItemModal);
document.getElementById('seq-item-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('seq-item-modal')) closeSeqItemModal();
});

// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR – SEQUENCE BUILDER (items)
// ═══════════════════════════════════════════════════════════════════════════════
function refreshSequenceItemInputs() {
  const numItems = Math.max(1, parseInt(document.getElementById('seq-num-items').value, 10) || 1);
  // Resize seqItems array: pad with blank text items, or trim from end
  while (seqItems.length < numItems) seqItems.push({type:'text',text:'',color:'#1a1a1a',fontSize:32,fontFamily:'Arial',textTransform:'none',imageUrl:null,audioUrl:null});
  seqItems = seqItems.slice(0, numItems);
  const row = document.getElementById('seq-items-row');
  row.innerHTML = '';
  seqItems.forEach((item, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px';
    const card = document.createElement('div');
    card.className = 'seq-item-card';
    const preview = document.createElement('div');
    preview.className = 'seq-item-preview';
    applyItemStyle(preview, item);
    const editBtn = document.createElement('button');
    editBtn.type = 'button'; editBtn.className = 'seq-item-edit-btn'; editBtn.title = 'Éditer'; editBtn.textContent = '✏';
    editBtn.addEventListener('click', () => openSeqItemModal(i));
    const { wrap: mvWrap, up, dn } = makeReorderBtns(
      () => moveSeqItem(i, -1),
      () => moveSeqItem(i,  1)
    );
    up.disabled = (i === 0);
    dn.disabled = (i === seqItems.length - 1);
    card.append(preview, editBtn);
    wrap.append(mvWrap, card);
    row.appendChild(wrap);
  });
  refreshSequencePreview();
}

function moveSeqItem(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= seqItems.length) return;
  [seqItems[i], seqItems[j]] = [seqItems[j], seqItems[i]];
  refreshSequenceItemInputs();
}

function getSequenceItemValues() { return seqItems; }

// ── Sq-code helpers (codes visuels de zones) ─────────────────────────────────
const SQ_CODES = ['[sq:m]', '[sq:um]', '[sq:ml]', '[sq:uml]'];

function isSqCode(str) { return SQ_CODES.includes(str); }

function sqCodeSvg(code, zoneSize) {
  const z = zoneSize || 22;
  const pad = Math.max(1.5, z * 0.08);
  const zones = ({
    '[sq:m]':   [false, true,  false],
    '[sq:um]':  [true,  true,  false],
    '[sq:ml]':  [false, true,  true ],
    '[sq:uml]': [true,  true,  true ],
  })[code] || [false, true, false];
  let rects = '', start = -1;
  for (let i = 0; i <= 3; i++) {
    const on = i < 3 && zones[i];
    if (on && start === -1) { start = i; }
    else if (!on && start !== -1) {
      const y1 = start * z + pad;
      const y2 = i * z - pad;
      rects += '<rect x="' + pad + '" y="' + y1 + '" width="' + (z - pad * 2) + '" height="' + (y2 - y1) + '" fill="white" stroke="#1e293b" stroke-width="2" rx="2"/>';
      start = -1;
    }
  }
  return '<svg class="sq-zone-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + z + ' ' + (z * 3) + '" width="' + z + '" height="' + (z * 3) + '">' + rects + '</svg>';
}

function parseSqCodes(str) {
  const out = [], regex = /\[sq:[a-z]+\]/g;
  let m;
  while ((m = regex.exec(str)) !== null) { if (isSqCode(m[0])) out.push(m[0]); }
  return out;
}

function hasSqCodes(str) { return parseSqCodes(str).length > 0; }
function getFocusedOrLastChoice(block) {
  const inputs = Array.from(block.querySelectorAll('.seq-q-choice'));
  return inputs.find(i => i === document.activeElement) || inputs[inputs.length - 1] || null;
}

function renderSqChoice(str) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sq-profile';
  wrapper.innerHTML = parseSqCodes(str).map(c => sqCodeSvg(c)).join('');
  return wrapper;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR – SEQUENCE BUILDER (questions)
// ═══════════════════════════════════════════════════════════════════════════════
function moveQuestionBlock(block, dir) {
  const container = document.getElementById('seq-questions-container');
  const blocks = Array.from(container.querySelectorAll('.seq-q-block'));
  const i = blocks.indexOf(block), j = i + dir;
  if (j < 0 || j >= blocks.length) return;
  if (dir === -1) container.insertBefore(block, blocks[j]);
  else container.insertBefore(blocks[j], block);
  updateSeqQuestionTitles();
  refreshSequencePreview();
}

function buildChoicesRow(container, choices, correctIndices) {
  container.innerHTML = '';
  const corrects = new Set(correctIndices && correctIndices.length ? correctIndices : [0]);
  choices.forEach((val, i) => {
    const isCorrect = corrects.has(i);
    const wrapper = document.createElement('div');
    wrapper.className = 'seq-q-choice-wrap';
    const { wrap: mvWrap, up, dn } = makeReorderBtns(
      () => moveChoice(container, wrapper, -1),
      () => moveChoice(container, wrapper,  1)
    );
    up.disabled = (i === 0);
    dn.disabled = (i === choices.length - 1);
    // Correct toggle button
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'seq-correct-toggle';
    toggle.dataset.correct = isCorrect ? '1' : '0';
    toggle.title = isCorrect ? 'Réponse correcte (cliquer pour désactiver)' : 'Marquer comme correcte';
    toggle.style.cssText = applyToggleStyle(isCorrect);
    toggle.textContent = '✓';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'seq-q-choice';
    input.style.cssText = 'min-width:60px;max-width:160px;flex:1;padding:7px 9px;border:1.5px solid ' + (isCorrect ? 'var(--success-border)' : 'var(--border)') + ';border-radius:var(--radius-sm);font-size:0.9rem;font-family:var(--font);font-weight:600;outline:none;background:' + (isCorrect ? 'var(--success-bg)' : 'var(--surface)') + ';color:var(--text-1)';
    input.value = val;
    input.addEventListener('input', refreshSequencePreview);
    input.addEventListener('focus', () => { input.style.borderColor = toggle.dataset.correct === '1' ? 'var(--success)' : 'var(--accent)'; });
    input.addEventListener('blur',  () => { input.style.borderColor = toggle.dataset.correct === '1' ? 'var(--success-border)' : 'var(--border)'; });
    toggle.addEventListener('click', () => {
      const nowCorrect = toggle.dataset.correct !== '1';
      toggle.dataset.correct = nowCorrect ? '1' : '0';
      toggle.style.cssText = applyToggleStyle(nowCorrect);
      toggle.title = nowCorrect ? 'Réponse correcte (cliquer pour désactiver)' : 'Marquer comme correcte';
      input.style.borderColor = nowCorrect ? 'var(--success-border)' : 'var(--border)';
      input.style.background  = nowCorrect ? 'var(--success-bg)' : 'var(--surface)';
      refreshSequencePreview();
    });
    wrapper.append(mvWrap, toggle, input);
    container.appendChild(wrapper);
  });
}

function moveChoice(container, wrapper, dir) {
  const wrappers = Array.from(container.querySelectorAll('.seq-q-choice-wrap'));
  const i = wrappers.indexOf(wrapper), j = i + dir;
  if (j < 0 || j >= wrappers.length) return;
  if (dir === -1) container.insertBefore(wrapper, wrappers[j]);
  else container.insertBefore(wrappers[j], wrapper);
  syncReorderBtns(Array.from(container.querySelectorAll('.seq-q-choice-wrap')));
  refreshSequencePreview();
}

function applyToggleStyle(isCorrect) {
  return 'width:22px;height:22px;border-radius:50%;border:2px solid ' + (isCorrect ? 'var(--success)' : 'var(--border)') + ';background:' + (isCorrect ? 'var(--success)' : 'var(--surface)') + ';color:' + (isCorrect ? 'white' : 'var(--text-3)') + ';font-size:0.75rem;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s';
}

function getCorrectIndicesFromBlock(block) {
  return Array.from(block.querySelectorAll('.seq-correct-toggle'))
    .map((t, i) => t.dataset.correct === '1' ? i : -1)
    .filter(i => i >= 0);
}

function getSeqItemLabels() {
  return seqItems.map(item => {
    if (!item) return '';
    if (item.type === 'arrow') return ARROW_CHARS[item.arrowDirection||'left'] || '←';
    if (item.type === 'image') return '🖼';
    if (item.type === 'audio') return '🔊';
    if (item.type === 'color') return item.text || '■';
    return item.text || '';
  });
}

function buildSequenceQuestionBlock(q) {
  const block = document.createElement('div');
  block.className = 'seq-q-block';
  block.style.cssText = 'border:1.5px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:10px;background:var(--surface-2)';

  // Header: title + type toggle + delete
  const header = document.createElement('div');
  header.className = 'seq-q-header';
  const title = document.createElement('span');
  title.className = 'seq-q-title';
  title.style.cssText = 'font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;flex:1';
  // Question type selector
  const typeSelect = document.createElement('select');
  typeSelect.className = 'seq-q-type';
  typeSelect.style.cssText = 'padding:3px 8px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.8rem;font-family:var(--font);outline:none;color:var(--text-1);background:var(--surface);cursor:pointer';
  [['choice','Choix multiples'],['write','Saisie libre'],['direction','Direction (flèche)'],['click-item','Cliquer sur l\'item']].forEach(([v,l]) => {
    const opt = document.createElement('option'); opt.value = v; opt.textContent = l;
    if ((q.type || 'choice') === v) opt.selected = true;
    typeSelect.appendChild(opt);
  });
  const delBtn = document.createElement('button');
  delBtn.type = 'button'; delBtn.className = 'seq-q-del';
  delBtn.textContent = '✕ Supprimer';
  delBtn.style.cssText = 'padding:2px 8px;border:1px solid var(--danger-border);border-radius:5px;background:var(--surface);color:var(--danger);font-size:0.75rem;cursor:pointer;font-family:var(--font)';
  delBtn.addEventListener('click', () => {
    if (document.getElementById('seq-questions-container').querySelectorAll('.seq-q-block').length > 1) {
      block.remove(); updateSeqQuestionTitles(); refreshSequencePreview();
    }
  });
  // "Allow retry" checkbox
  const allowRetryLabel = document.createElement('label');
  allowRetryLabel.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--text-2);cursor:pointer;white-space:nowrap';
  const allowRetryChk = document.createElement('input');
  allowRetryChk.type = 'checkbox'; allowRetryChk.className = 'seq-q-allow-retry';
  allowRetryChk.checked = q.allowRetry !== false;
  allowRetryChk.style.cssText = 'accent-color:var(--accent)';
  allowRetryLabel.append(allowRetryChk, document.createTextNode('2ᵉ essai'));
  // "Show items on retry" checkbox
  const retryLabel = document.createElement('label');
  retryLabel.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--text-2);cursor:pointer;white-space:nowrap';
  const retryChk = document.createElement('input');
  retryChk.type = 'checkbox'; retryChk.className = 'seq-q-show-on-retry';
  retryChk.checked = q.showOnRetry !== false;
  retryChk.style.cssText = 'accent-color:var(--accent)';
  retryLabel.append(retryChk, document.createTextNode('Réafficher au 2ᵉ essai'));
  // "Highlight correct answer in green on retry" checkbox
  const highlightLabel = document.createElement('label');
  highlightLabel.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--text-2);cursor:pointer;white-space:nowrap';
  const highlightChk = document.createElement('input');
  highlightChk.type = 'checkbox'; highlightChk.className = 'seq-q-highlight-correct';
  highlightChk.checked = q.highlightCorrectOnRetry !== false;
  highlightChk.style.cssText = 'accent-color:var(--accent)';
  highlightLabel.append(highlightChk, document.createTextNode('Colorier correcte en vert'));
  // "Replay with timer on retry" checkbox
  const replayTimerLabel = document.createElement('label');
  replayTimerLabel.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--text-2);cursor:pointer;white-space:nowrap';
  const replayTimerChk = document.createElement('input');
  replayTimerChk.type = 'checkbox'; replayTimerChk.className = 'seq-q-replay-with-timer';
  replayTimerChk.checked = q.replayWithTimer === true;
  replayTimerChk.style.cssText = 'accent-color:var(--accent)';
  replayTimerLabel.append(replayTimerChk, document.createTextNode('Rejouer avec le temps'));
  // Hide retry options when allowRetry is off
  const syncRetryVis = () => {
    retryLabel.style.display       = allowRetryChk.checked ? '' : 'none';
    highlightLabel.style.display   = allowRetryChk.checked ? '' : 'none';
    replayTimerLabel.style.display = (allowRetryChk.checked && retryChk.checked) ? '' : 'none';
  };
  retryChk.addEventListener('change', syncRetryVis);
  allowRetryChk.addEventListener('change', syncRetryVis); syncRetryVis();
  // "Shuffle answers" checkbox (choice type only)
  const shuffleAnswersLabel = document.createElement('label');
  shuffleAnswersLabel.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--text-2);cursor:pointer;white-space:nowrap';
  const shuffleAnswersChk = document.createElement('input');
  shuffleAnswersChk.type = 'checkbox'; shuffleAnswersChk.className = 'seq-q-shuffle-answers';
  shuffleAnswersChk.checked = q.shuffleAnswers !== false;
  shuffleAnswersChk.style.cssText = 'accent-color:var(--accent)';
  shuffleAnswersLabel.append(shuffleAnswersChk, document.createTextNode('Mélanger les réponses'));
  const { wrap: qMvWrap, up: upQBtn, dn: downQBtn } = makeReorderBtns(
    () => moveQuestionBlock(block, -1),
    () => moveQuestionBlock(block,  1)
  );
  qMvWrap.style.display = 'flex';
  header.append(title, qMvWrap, typeSelect, allowRetryLabel, retryLabel, replayTimerLabel, highlightLabel, shuffleAnswersLabel, delBtn);
  block.appendChild(header);

  // Question text
  const qInput = document.createElement('input');
  qInput.type = 'text'; qInput.className = 'seq-q-text';
  qInput.placeholder = 'Texte de la question…';
  qInput.value = q.questionText || '';
  qInput.style.cssText = 'width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.9rem;outline:none;font-family:var(--font);color:var(--text-1);background:var(--surface);margin-bottom:8px;transition:border-color .15s';
  qInput.addEventListener('input', refreshSequencePreview);
  block.appendChild(qInput);

  // ── Choice section ─────────────────────────────────────────────────────────
  // ── Choice section ─────��──────────────────────────────────────────────────
  const choiceSection = document.createElement('div');
  choiceSection.className = 'seq-q-choice-section';

  const choicesHeader = document.createElement('div');
  choicesHeader.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:6px';
  const choicesLabel = document.createElement('span');
  choicesLabel.style.cssText = 'font-size:0.78rem;color:var(--text-2);font-weight:500';
  choicesLabel.innerHTML = 'Réponses <span style="color:var(--success);font-size:0.72rem">(● = correcte)</span>';
  const numInput = document.createElement('input');
  numInput.type = 'number'; numInput.className = 'seq-q-num-choices';
  numInput.min = 1; numInput.step = 1;
  numInput.value = (q.choices || []).length || 2;
  numInput.style.cssText = 'width:52px;padding:4px 6px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.85rem;outline:none;font-family:var(--font);color:var(--text-1);background:var(--surface)';
  const choicesRow = document.createElement('div');
  choicesRow.className = 'seq-q-choices-row seq-q-choices-wrap';
  const initialChoices  = (q.choices && q.choices.length >= 1) ? q.choices : ['', ''];
  const initialCorrects = q.correctIndices && q.correctIndices.length ? q.correctIndices : [0];
  buildChoicesRow(choicesRow, initialChoices, initialCorrects);
  numInput.addEventListener('input', () => {
    const n = Math.max(1, parseInt(numInput.value) || 1);
    const existing = Array.from(choicesRow.querySelectorAll('.seq-q-choice')).map(i => i.value);
    const existingCorrects = getCorrectIndicesFromBlock(block);
    while (existing.length < n) existing.push('');
    buildChoicesRow(choicesRow, existing.slice(0, n), existingCorrects.length ? existingCorrects : [0]);
    refreshSequencePreview();
  });
  choicesHeader.append(choicesLabel, numInput);

  // Sq-code picker
  const picker = document.createElement('div');
  picker.className = 'sq-picker';
  const pickerLabel = document.createElement('span');
  pickerLabel.className = 'sq-picker-label';
  pickerLabel.textContent = 'Insérer :';
  picker.appendChild(pickerLabel);
  SQ_CODES.forEach(code => {
    const sqBtn = document.createElement('button');
    sqBtn.type = 'button'; sqBtn.title = code;
    sqBtn.style.cssText = 'padding:3px 6px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);cursor:pointer;display:inline-flex;align-items:center;justify-content:center';
    sqBtn.innerHTML = sqCodeSvg(code, 14);
    sqBtn.addEventListener('mousedown', e => e.preventDefault());
    sqBtn.addEventListener('mouseenter', () => { sqBtn.style.borderColor = 'var(--accent)'; sqBtn.style.background = 'var(--accent-bg)'; });
    sqBtn.addEventListener('mouseleave', () => { sqBtn.style.borderColor = 'var(--border)'; sqBtn.style.background = 'var(--surface)'; });
    sqBtn.addEventListener('click', () => {
      const target = getFocusedOrLastChoice(block);
      if (target) { target.value += code; target.dispatchEvent(new Event('input')); }
    });
    picker.appendChild(sqBtn);
  });
  const bsBtn = document.createElement('button');
  bsBtn.type = 'button'; bsBtn.textContent = '⌫'; bsBtn.title = 'Supprimer le dernier symbole';
  bsBtn.style.cssText = 'padding:3px 8px;border:1.5px solid var(--danger-border);border-radius:var(--radius-sm);background:var(--surface);color:var(--danger);cursor:pointer;font-size:0.85rem';
  bsBtn.addEventListener('mousedown', e => e.preventDefault());
  bsBtn.addEventListener('click', () => {
    const target = getFocusedOrLastChoice(block);
    if (target) { target.value = target.value.replace(/\[sq:[a-z]+\]$/, ''); target.dispatchEvent(new Event('input')); }
  });
  picker.appendChild(bsBtn);
  choiceSection.append(choicesHeader, choicesRow, picker);

  // ── Write section ──────────────────────────────────────────────────────────
  const writeSection = document.createElement('div');
  writeSection.className = 'seq-q-write-section';
  const writeLabel = document.createElement('div');
  writeLabel.style.cssText = 'font-size:0.78rem;color:var(--text-2);font-weight:500;margin-bottom:6px';
  writeLabel.textContent = 'Réponse(s) correcte(s) — séparées par | si plusieurs';
  const writeInput = document.createElement('input');
  writeInput.type = 'text'; writeInput.className = 'seq-q-write-answer';
  writeInput.placeholder = 'ex : cheval  ou  cheval|horse';
  writeInput.value = (q.writeAnswers || []).join('|') || (q.choices && q.choices[0] ? q.choices[0] : '');
  writeInput.style.cssText = 'width:100%;padding:7px 10px;border:1.5px solid var(--success-border);border-radius:var(--radius-sm);font-size:0.9rem;outline:none;font-family:var(--font);color:var(--text-1);background:var(--success-bg);transition:border-color .15s';
  writeInput.addEventListener('input', refreshSequencePreview);
  writeSection.append(writeLabel, writeInput);

  // ── Direction section ──────────────────────────────────────────────────────
  const dirSection = document.createElement('div');
  dirSection.className = 'seq-q-direction-section';
  const dirRuleRow = document.createElement('div');
  dirRuleRow.className = 'field-row';
  dirRuleRow.innerHTML = '<label>Règle</label>';
  const ruleSelect = document.createElement('select');
  ruleSelect.className = 'seq-q-direction-rule';
  ruleSelect.style.cssText = 'width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.9rem;outline:none;font-family:var(--font);color:var(--text-1);background:var(--surface)';
  [['same','↔ Même sens'],['inverse','↔ Sens inverse']].forEach(([v,l]) => {
    const opt = document.createElement('option'); opt.value = v; opt.textContent = l;
    if ((q.rule || 'same') === v) opt.selected = true;
    ruleSelect.appendChild(opt);
  });
  dirRuleRow.appendChild(ruleSelect);
  const dirOptsRow = document.createElement('div');
  dirOptsRow.className = 'field-row';
  dirOptsRow.innerHTML = '<label>Nbre d\'options</label>';
  const optsSelect = document.createElement('select');
  optsSelect.className = 'seq-q-direction-opts';
  optsSelect.style.cssText = 'width:100%;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.9rem;outline:none;font-family:var(--font);color:var(--text-1);background:var(--surface)';
  [2,3,4].forEach(n => {
    const opt = document.createElement('option'); opt.value = String(n); opt.textContent = String(n);
    if ((q.numOptions || 4) === n) opt.selected = true;
    optsSelect.appendChild(opt);
  });
  dirOptsRow.appendChild(optsSelect);
  dirSection.append(dirRuleRow, dirOptsRow);

  // ── Click-item section ─────────────────────────────────────────────────────
  const clickItemSection = document.createElement('div');
  clickItemSection.className = 'seq-q-click-item-section';

  const buildClickItemToggles = (savedCorrectIndices) => {
    clickItemSection.innerHTML = '';
    const labels = getSeqItemLabels();
    const correctSet = new Set(savedCorrectIndices && savedCorrectIndices.length ? savedCorrectIndices : [0]);
    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'font-size:0.78rem;color:var(--text-2);font-weight:500;margin-bottom:6px';
    labelEl.innerHTML = 'Item(s) correct(s) <span style="color:var(--success);font-size:0.72rem">(● = correct)</span>';
    clickItemSection.appendChild(labelEl);
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px';
    labels.forEach((label, i) => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:6px';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'seq-correct-toggle seq-item-toggle';
      toggle.dataset.itemIndex = String(i);
      const isCorrect = correctSet.has(i);
      toggle.dataset.correct = isCorrect ? '1' : '0';
      toggle.style.cssText = applyToggleStyle(isCorrect);
      toggle.textContent = '✓';
      toggle.addEventListener('click', () => {
        const nowCorrect = toggle.dataset.correct !== '1';
        toggle.dataset.correct = nowCorrect ? '1' : '0';
        toggle.style.cssText = applyToggleStyle(nowCorrect);
        refreshSequencePreview();
      });
      const labelSpan = document.createElement('span');
      labelSpan.style.cssText = 'font-size:0.85rem;color:var(--text-1);font-weight:600;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      labelSpan.textContent = 'Item ' + (i + 1) + (label ? ' – ' + label.slice(0, 15) : '');
      labelSpan.title = label || ('Item ' + (i + 1));
      wrapper.append(toggle, labelSpan);
      row.appendChild(wrapper);
    });
    clickItemSection.appendChild(row);
  };
  buildClickItemToggles(q.correctItemIndices);

  // Show/hide sections based on type
  const applyType = (type) => {
    choiceSection.style.display    = type === 'choice'     ? 'block' : 'none';
    writeSection.style.display     = type === 'write'      ? 'block' : 'none';
    dirSection.style.display       = type === 'direction'  ? 'block' : 'none';
    clickItemSection.style.display = type === 'click-item' ? 'block' : 'none';
    shuffleAnswersLabel.style.display = type === 'choice'  ? ''      : 'none';
    if (type === 'click-item') {
      const saved = Array.from(block.querySelectorAll('.seq-item-toggle'))
        .filter(t => t.dataset.correct === '1').map(t => parseInt(t.dataset.itemIndex));
      buildClickItemToggles(saved.length ? saved : (q.correctItemIndices || []));
    }
  };
  applyType(q.type || 'choice');
  typeSelect.addEventListener('change', () => { applyType(typeSelect.value); refreshSequencePreview(); });

  block.append(choiceSection, writeSection, dirSection, clickItemSection);

  return block;
}

function updateSeqQuestionTitles() {
  const blocks = Array.from(document.getElementById('seq-questions-container').querySelectorAll('.seq-q-block'));
  blocks.forEach((block, i) => {
    block.querySelector('.seq-q-title').textContent = 'Question ' + (i + 1);
    block.querySelector('.seq-q-del').style.display = blocks.length > 1 ? '' : 'none';
  });
  syncReorderBtns(blocks);
}

function fillSequenceModal(pair) {
  const rawItems = pair.items || [];
  seqItems = rawItems.map(i => typeof i === 'string' ? {type:'text',text:i,color:'#1a1a1a',fontSize:32,fontFamily:'Arial',textTransform:'none',imageUrl:null,audioUrl:null} : {...i});
  if (seqItems.length === 0) seqItems = [{type:'text',text:'',color:'#1a1a1a',fontSize:32,fontFamily:'Arial',textTransform:'none',imageUrl:null,audioUrl:null}];
  document.getElementById('seq-num-items').value = seqItems.length;
  const dur = pair.skipDisplay === true ? 0 : (pair.displayDuration != null ? pair.displayDuration : 1000);
  document.getElementById('seq-duration').value = (dur / 1000);
  const ex = getSelectedEx();
  const hasExDefault = ex && ex.defaultDisplayDuration != null;
  const useExDefault = hasExDefault && (pair.useExerciseDefault === true || pair.useExerciseDefault === undefined);
  document.getElementById('seq-exercise-default-row').style.display = '';
  document.getElementById('seq-exercise-default-value').textContent = hasExDefault ? (ex.defaultDisplayDuration / 1000) : '—';
  document.getElementById('seq-use-exercise-duration').checked = useExDefault;
  document.getElementById('seq-duration-row').style.display = useExDefault ? 'none' : '';
  const visMode = pair.visibilityMode || (pair.hideItems !== false ? 'always_hide' : 'always_show');
  document.getElementById('seq-visibility-mode').value = visMode;
  refreshSequenceItemInputs();
  const questions = getPairQuestions(pair);
  const container = document.getElementById('seq-questions-container');
  container.innerHTML = '';
  questions.forEach(q => container.appendChild(buildSequenceQuestionBlock(q)));
  updateSeqQuestionTitles();
  refreshSequencePreview();
}

function readSequenceModal() {
  const questions = Array.from(document.getElementById('seq-questions-container').querySelectorAll('.seq-q-block')).map(block => {
    const type = block.querySelector('.seq-q-type').value;
    const showOnRetry             = block.querySelector('.seq-q-show-on-retry')?.checked      ?? true;
    const allowRetry              = block.querySelector('.seq-q-allow-retry')?.checked        ?? true;
    const highlightCorrectOnRetry = block.querySelector('.seq-q-highlight-correct')?.checked  ?? true;
    const shuffleAnswers          = block.querySelector('.seq-q-shuffle-answers')?.checked    ?? true;
    const replayWithTimer         = block.querySelector('.seq-q-replay-with-timer')?.checked  ?? false;
    const base = { questionText: block.querySelector('.seq-q-text').value.trim(), type, showOnRetry, allowRetry, highlightCorrectOnRetry, shuffleAnswers, replayWithTimer };
    if (type === 'direction') {
      base.rule       = block.querySelector('.seq-q-direction-rule')?.value || 'same';
      base.numOptions = parseInt(block.querySelector('.seq-q-direction-opts')?.value || '4', 10);
    } else if (type === 'write') {
      const raw = (block.querySelector('.seq-q-write-answer')?.value || '').trim();
      base.writeAnswers = raw ? raw.split('|').map(s => s.trim()).filter(Boolean) : [];
      base.choices = base.writeAnswers;
      base.correctIndices = [0];
    } else if (type === 'click-item') {
      base.correctItemIndices = Array.from(block.querySelectorAll('.seq-item-toggle'))
        .filter(t => t.dataset.correct === '1').map(t => parseInt(t.dataset.itemIndex));
      if (!base.correctItemIndices.length) base.correctItemIndices = [0];
    } else {
      base.choices = Array.from(block.querySelectorAll('.seq-q-choice')).map(i => i.value.trim());
      base.correctIndices = getCorrectIndicesFromBlock(block);
    }
    return base;
  });
  const useExerciseDefault = document.getElementById('seq-use-exercise-duration').checked;
  const rawDur = useExerciseDefault ? null : Math.round((parseFloat(document.getElementById('seq-duration').value) || 0) * 1000);
  const skipDisplay = !useExerciseDefault && rawDur === 0;
  const visibilityMode = document.getElementById('seq-visibility-mode').value || 'always_show';
  return {
    items:            getSequenceItemValues(),
    skipDisplay,
    visibilityMode,
    useExerciseDefault,
    displayDuration:  skipDisplay ? 0 : rawDur,
    questions,
  };
}

function refreshSequencePreview() {
  const items = getSequenceItemValues();
  const previewItems = document.getElementById('seq-preview-items');
  previewItems.innerHTML = '';
  items.forEach(item => {
    const box = document.createElement('div');
    box.className = 'sequence-item-box';
    box.style.cssText = 'width:52px;height:52px;min-width:52px;min-height:52px;border:2px solid var(--border);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:1.2rem;background:white;flex:none';
    if (item && typeof item === 'object') {
      applyItemStyle(box, item);
      const boxFs = parseFloat(box.style.fontSize) || 32;
      const isArrow = item.type === 'arrow';
      if (boxFs > (isArrow ? 56 : 40)) box.style.fontSize = (isArrow ? 56 : 40) + 'px';
    } else {
      box.textContent = item || '?';
    }
    previewItems.appendChild(box);
  });
  const previewQs = document.getElementById('seq-preview-questions');
  previewQs.innerHTML = '';
  document.getElementById('seq-questions-container').querySelectorAll('.seq-q-block').forEach((block, i) => {
    const qText  = block.querySelector('.seq-q-text').value.trim();
    const qType  = block.querySelector('.seq-q-type').value;
    const row = document.createElement('div');
    row.style.cssText = 'font-size:0.82rem;color:var(--text-2);padding:4px 0;border-top:1px solid var(--border)';
    let choicesHtml;
    if (qType === 'write') {
      const ans = (block.querySelector('.seq-q-write-answer')?.value || '').trim();
      choicesHtml = '<span style="padding:1px 8px;border-radius:4px;background:var(--success-bg);border:1px solid var(--success-border);font-style:italic">✏ ' + escapeHtml(ans || '?') + '</span>';
    } else if (qType === 'direction') {
      const rule = block.querySelector('.seq-q-direction-rule')?.value || 'same';
      const opts = block.querySelector('.seq-q-direction-opts')?.value || '4';
      choicesHtml = '<span style="padding:1px 8px;border-radius:4px;background:var(--accent-bg);border:1px solid var(--accent-border)">↕ ' + (rule === 'inverse' ? 'sens inverse' : 'même sens') + ' · ' + opts + ' options</span>';
    } else if (qType === 'click-item') {
      const corrects = new Set(Array.from(block.querySelectorAll('.seq-item-toggle'))
        .filter(t => t.dataset.correct === '1').map(t => parseInt(t.dataset.itemIndex)));
      const labels = getSeqItemLabels();
      choicesHtml = labels.map((l, i) => {
        const isCorr = corrects.has(i);
        return '<span style="padding:1px 6px;border-radius:4px;background:' + (isCorr ? 'var(--success-bg)' : 'var(--surface-2)') + ';border:1px solid ' + (isCorr ? 'var(--success-border)' : 'var(--border)') + '">🖱 ' + escapeHtml(l || ('item ' + (i + 1))) + '</span>';
      }).join(' ');
    } else {
      const choices = Array.from(block.querySelectorAll('.seq-q-choice')).map(inp => inp.value.trim());
      const corrects = new Set(getCorrectIndicesFromBlock(block));
      choicesHtml = choices.map((c, ci) => {
        const isCorr = corrects.has(ci);
        const inner = hasSqCodes(c)
          ? '<span style="display:inline-flex;gap:2px;align-items:center">' + parseSqCodes(c).map(code => sqCodeSvg(code, 8)).join('') + '</span>'
          : escapeHtml(c || '?');
        return '<span style="padding:1px 6px;border-radius:4px;display:inline-flex;align-items:center;background:' + (isCorr ? 'var(--success-bg)' : 'var(--surface-2)') + ';border:1px solid ' + (isCorr ? 'var(--success-border)' : 'var(--border)') + '">' + inner + '</span>';
      }).join(' ');
    }
    row.innerHTML = '<span style="font-weight:700;color:var(--text-1)">Q' + (i+1) + ':</span> ' +
      (qText ? '<em>' + escapeHtml(qText) + '</em>' : '<span style="color:var(--border)">—</span>') +
      ' → ' + choicesHtml;
    previewQs.appendChild(row);
  });
}

document.getElementById('seq-num-items').addEventListener('input',  () => { refreshSequenceItemInputs(); });
document.getElementById('seq-num-items').addEventListener('change', () => { refreshSequenceItemInputs(); });
document.getElementById('seq-use-exercise-duration').addEventListener('change', function() {
  document.getElementById('seq-duration-row').style.display = this.checked ? 'none' : '';
});
document.getElementById('seq-add-question-btn').addEventListener('click', () => {
  document.getElementById('seq-questions-container').appendChild(buildSequenceQuestionBlock({questionText:'', type:'choice', choices:['',''], correctIndices:[0], showOnRetry:true, allowRetry:true, shuffleAnswers:true, highlightCorrectOnRetry:true}));
  updateSeqQuestionTitles(); refreshSequencePreview();
});

document.getElementById('pair-modal').addEventListener('click', e => { if (e.target===document.getElementById('pair-modal')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape' && document.getElementById('pair-modal').style.display!=='none') closeModal(); });

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════════════════════
document.getElementById('btn-export').addEventListener('click', () => {
  downloadBlob(JSON.stringify(exercises, null, 2), 'cys-exercices-'+new Date().toISOString().slice(0,10)+'.json');
});

document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-input').click());

document.getElementById('import-input').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) throw new Error('Format invalide');
      if (!confirm('Importer '+imported.length+' exercice(s) et les ajouter aux existants ?')) return;
      const existing = new Set(exercises.map(ex=>ex.id));
      let added = 0;
      imported.forEach(ex => { if (!existing.has(ex.id)) { exercises.push(ex); added++; } });
      saveExercises(); renderSidebar(); renderExerciseEditor();
      alert(added+' exercice(s) importé(s).');
    } catch(err) { alert('Fichier invalide : '+err.message); }
  };
  reader.readAsText(file); e.target.value='';
});
