// ═══════════════════════════════════════════════════════════════════════════════
// PATIENTS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
let patientSelectedId = null;
function getSelectedPatient() { return patients.find(p => p.id === patientSelectedId) || null; }

function initPatientsView() {
  if (patientSelectedId === null && patients.length > 0) patientSelectedId = patients[0].id;
  renderPatientSidebar();
  renderPatientDetail();
}

function renderPatientSidebar() {
  const list = document.getElementById('patient-list');
  list.innerHTML = '';
  if (patients.length === 0) {
    list.innerHTML = '<div style="padding:16px;color:var(--text-3);font-size:0.8rem;text-align:center">Aucun patient</div>';
    return;
  }
  [...patients].sort((a,b) => a.name.localeCompare(b.name)).forEach(patient => {
    const sessionCount = sessions.filter(s => s.patientId === patient.id).length;
    const div = document.createElement('div');
    div.className = 'exercise-item' + (patient.id === patientSelectedId ? ' active' : '');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = patient.name;
    nameSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    const countSpan = document.createElement('span');
    countSpan.className = 'pair-count';
    countSpan.textContent = sessionCount + ' sess.';
    div.append(nameSpan, countSpan);
    div.addEventListener('click', () => { patientSelectedId = patient.id; renderPatientSidebar(); renderPatientDetail(); });
    list.appendChild(div);
  });
}

function renderPatientDetail() {
  const patient = getSelectedPatient();
  document.getElementById('patient-empty-state').style.display = patient ? 'none'  : 'block';
  document.getElementById('patient-detail').style.display      = patient ? 'block' : 'none';
  if (!patient) return;
  document.getElementById('patient-name-input').value  = patient.name;
  document.getElementById('patient-dob').value         = patient.birthDate || '';
  document.getElementById('patient-notes-field').value = patient.notes || '';

  const patientSessions = sessions
    .filter(s => s.patientId === patient.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  document.getElementById('patient-session-count').textContent = patientSessions.length;

  const miniStats = document.getElementById('patient-mini-stats');
  if (patientSessions.length > 0) {
    const avgPct = patientSessions.reduce((s,r) => s + r.score/r.totalPairs*100, 0) / patientSessions.length;
    const allReactions = patientSessions.flatMap(s => (s.responses||[]).map(r => r.timeMs));
    const avgReaction  = allReactions.length > 0 ? Math.round(allReactions.reduce((a,b)=>a+b,0)/allReactions.length) : null;
    miniStats.innerHTML =
      '<span>Score moy. : <strong>' + Math.round(avgPct) + '%</strong></span>' +
      (avgReaction !== null ? '<span>Réaction moy. : <strong>' + avgReaction + ' ms</strong></span>' : '');
  } else {
    miniStats.innerHTML = '';
  }
  renderPatientSessionsTable(patientSessions);
}

function renderPatientSessionsTable(patientSessions) {
  const wrap = document.getElementById('patient-sessions-wrap');
  if (patientSessions.length === 0) {
    wrap.innerHTML = '<p style="color:var(--text-3);font-size:0.88rem;margin-top:8px">Aucune session enregistrée pour ce patient.</p>';
    return;
  }
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Date</th><th>Exercice</th><th>Score</th><th>Temps</th><th>Réaction moy.</th><th>Notes</th><th></th></tr></thead>';
  const tbody = document.createElement('tbody');
  patientSessions.forEach(session => {
    const pct = Math.round(session.score/session.totalPairs*100);
    const scoreClass = pct>=80?'good-score':pct<50?'low-score':'';
    const reaction = avgReactionMs(session);
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>'+new Date(session.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})+'</td>'+
      '<td>'+escapeHtml(session.exerciseName)+'</td>'+
      '<td><span class="'+scoreClass+'">'+session.score+'/'+session.totalPairs+'</span> <span class="score-pct">('+pct+'%)</span></td>'+
      '<td>'+formatDuration(session.totalTimeMs)+'</td>'+
      '<td>'+(reaction !== null ? Math.round(reaction)+' ms' : '–')+'</td>'+
      '<td></td><td></td>';
    const notesTd = tr.children[5];
    notesTd.contentEditable = 'true';
    notesTd.textContent = session.notes || '';
    notesTd.style.cssText = 'max-width:160px;min-width:80px;outline:none;color:var(--text-2);font-style:italic;cursor:text;';
    notesTd.addEventListener('blur',    () => { session.notes = notesTd.textContent.trim(); saveSessions(); });
    notesTd.addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); notesTd.blur(); } });
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete-session'; delBtn.textContent = 'Supprimer';
    delBtn.addEventListener('click', () => {
      if (!confirm('Supprimer cette session ?')) return;
      sessions = sessions.filter(s => s.id !== session.id); saveSessions(); renderPatientDetail();
    });
    tr.lastElementChild.appendChild(delBtn);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.innerHTML = '';
  wrap.appendChild(table);
}

document.getElementById('btn-new-patient').addEventListener('click', () => {
  const p = { id: newId('pat'), name: 'Nouveau patient', birthDate: '', notes: '', createdAt: new Date().toISOString() };
  patients.push(p); savePatients();
  patientSelectedId = p.id; renderPatientSidebar(); renderPatientDetail();
  setTimeout(() => { const i = document.getElementById('patient-name-input'); i.focus(); i.select(); }, 50);
});

document.getElementById('patient-name-input').addEventListener('input', () => {
  const p = getSelectedPatient(); if (!p) return;
  p.name = document.getElementById('patient-name-input').value;
  savePatients(); renderPatientSidebar();
});

document.getElementById('patient-dob').addEventListener('change', () => {
  const p = getSelectedPatient(); if (!p) return;
  p.birthDate = document.getElementById('patient-dob').value;
  savePatients();
});

document.getElementById('patient-notes-field').addEventListener('input', () => {
  const p = getSelectedPatient(); if (!p) return;
  p.notes = document.getElementById('patient-notes-field').value;
  savePatients();
});

document.getElementById('btn-export-patient-json').addEventListener('click', () => {
  const p = getSelectedPatient(); if (!p) return;
  exportSessionsJson(
    sessions.filter(s => s.patientId === p.id),
    'resultats-' + p.name.replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0,10) + '.json'
  );
});

document.getElementById('btn-import-patient-json').addEventListener('click', () => {
  importSessionsJson(added => { alert(added + ' session(s) importée(s).'); renderPatientDetail(); });
});

document.getElementById('btn-export-patient-pdf').addEventListener('click', () => {
  const p = getSelectedPatient(); if (!p) return;
  exportPatientPDF(p);
});

function exportPatientPDF(patient) {
  const patientSessions = sessions
    .filter(s => s.patientId === patient.id)
    .sort((a,b) => new Date(a.date) - new Date(b.date));
  const avgPct = patientSessions.length > 0
    ? Math.round(patientSessions.reduce((s,r) => s + r.score/r.totalPairs*100, 0) / patientSessions.length) : null;
  const allReactions = patientSessions.flatMap(s => (s.responses||[]).map(r => r.timeMs));
  const avgReaction  = allReactions.length > 0 ? Math.round(allReactions.reduce((a,b)=>a+b,0)/allReactions.length) : null;
  const dobStr = patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('fr-FR') : '–';
  const rowsHtml = patientSessions.map(s => {
    const pct = Math.round(s.score/s.totalPairs*100);
    const scoreColor = pct>=80 ? '#16a34a' : pct<50 ? '#dc2626' : '#0f172a';
    const reaction = avgReactionMs(s);
    return '<tr>' +
      '<td>' + new Date(s.date).toLocaleDateString('fr-FR') + '</td>' +
      '<td>' + escapeHtml(s.exerciseName) + '</td>' +
      '<td style="color:'+scoreColor+';font-weight:700">' + s.score + '/' + s.totalPairs + ' (' + pct + '%)</td>' +
      '<td>' + formatDuration(s.totalTimeMs) + '</td>' +
      '<td>' + (reaction !== null ? Math.round(reaction) + ' ms' : '–') + '</td>' +
      '<td>' + escapeHtml(s.notes || '') + '</td>' +
      '</tr>';
  }).join('');
  const statsHtml = [
    avgPct      !== null ? '<div class="stat"><div class="stat-label">Score moyen</div><div class="stat-val">' + avgPct + '%</div></div>' : '',
    avgReaction !== null ? '<div class="stat"><div class="stat-label">Réaction moy.</div><div class="stat-val">' + avgReaction + ' ms</div></div>' : '',
    '<div class="stat"><div class="stat-label">Sessions</div><div class="stat-val">' + patientSessions.length + '</div></div>',
  ].join('');
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Dossier – ${escapeHtml(patient.name)}</title><style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; max-width: 860px; margin: 0 auto; font-size: 14px; } .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; } .header h1 { font-size: 22px; } .header .meta { font-size: 11px; color: #64748b; text-align: right; } .info-row { display: flex; gap: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; } .info-item label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 3px; } .info-item span { font-size: 14px; font-weight: 600; } .stats-row { display: flex; gap: 16px; margin-bottom: 20px; } .stat { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 16px; } .stat-label { font-size: 10px; color: #3b82f6; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; } .stat-val { font-size: 18px; font-weight: 700; color: #1d4ed8; } .section-title { font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 10px; } .notes-box { background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.5; } table { width: 100%; border-collapse: collapse; font-size: 13px; } th { text-align: left; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; padding: 0 10px 8px; border-bottom: 2px solid #e2e8f0; } td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; } tr:last-child td { border-bottom: none; } .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; } @media print { body { padding: 20px; } @page { margin: 1.5cm; } }</style></head><body><div class="header"><div><h1>${escapeHtml(patient.name)}</h1><div style="font-size:12px;color:#64748b;margin-top:4px">Dossier clinique — ChooseYourScore</div></div><div class="meta">Exporté le ${new Date().toLocaleDateString('fr-FR')}</div></div><div class="info-row"><div class="info-item"><label>Date de naissance</label><span>${dobStr}</span></div><div class="info-item"><label>Nombre de sessions</label><span>${patientSessions.length}</span></div></div>${patientSessions.length > 0 ? '<div class="stats-row">' + statsHtml + '</div>' : ''}${patient.notes ? '<div class="section-title">Notes</div><div class="notes-box">' + escapeHtml(patient.notes) + '</div>' : ''}<div class="section-title">Historique des sessions</div>${patientSessions.length === 0 ? '<p style="color:#94a3b8">Aucune session enregistrée.</p>' : '<table><thead><tr><th>Date</th><th>Exercice</th><th>Score</th><th>Temps</th><th>Réaction</th><th>Notes</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>'}<div class="footer"><span>ChooseYourScore</span><span>${escapeHtml(patient.name)}</span></div><script>window.onload = () => { window.print(); }<\/script></body></html>`;
  const win = window.open('', '_blank');
  if (!win) { alert('Autorisez les popups pour exporter en PDF.'); return; }
  win.document.write(html); win.document.close();
}

document.getElementById('btn-delete-patient').addEventListener('click', () => {
  const p = getSelectedPatient(); if (!p) return;
  if (!confirm('Supprimer le patient "' + p.name + '" ?\nLes sessions associées seront conservées.')) return;
  patients = patients.filter(pt => pt.id !== patientSelectedId);
  patientSelectedId = patients.length > 0 ? patients[0].id : null;
  savePatients(); renderPatientSidebar(); renderPatientDetail();
});
