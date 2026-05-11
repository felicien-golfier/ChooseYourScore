// ── Export / Import – résultats ───────────────────────────────────────────────
document.getElementById('btn-export-results').addEventListener('click', () => {
  exportSessionsJson(getFilteredSessions(), 'resultats-cys-' + new Date().toISOString().slice(0,10) + '.json');
});

document.getElementById('btn-import-results').addEventListener('click', () => {
  importSessionsJson(added => { alert(added + ' session(s) importée(s).'); renderResults(); });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
let rScoreChart = null, rTimeChart = null;

function initResults() {
  populatePatientSelect();
  populateExerciseFilter();
  renderResults();
}

function populatePatientSelect() {
  const select = document.getElementById('patient-select'), current = select.value;
  const pts = [...new Set(sessions.map(s=>s.patientName))].sort();
  select.innerHTML = '<option value="">— Tous les patients —</option>';
  pts.forEach(name => {
    const opt = document.createElement('option');
    opt.value=name; opt.textContent=name; if(name===current) opt.selected=true; select.appendChild(opt);
  });
}

function populateExerciseFilter() {
  const patient = document.getElementById('patient-select').value;
  const select  = document.getElementById('exercise-filter'), current = select.value;
  const names = [...new Set(sessions.filter(s=>!patient||s.patientName===patient).map(s=>s.exerciseName))].sort();
  select.innerHTML = '<option value="">— Tous les exercices —</option>';
  names.forEach(name => {
    const opt = document.createElement('option');
    opt.value=name; opt.textContent=name; if(name===current) opt.selected=true; select.appendChild(opt);
  });
}

function getFilteredSessions() {
  const patient  = document.getElementById('patient-select').value;
  const exercise = document.getElementById('exercise-filter').value;
  return sessions
    .filter(s => (!patient||s.patientName===patient) && (!exercise||s.exerciseName===exercise))
    .sort((a,b) => new Date(a.date)-new Date(b.date));
}

function renderResults() {
  const filtered = getFilteredSessions();
  const content    = document.getElementById('r-content');
  const emptyState = document.getElementById('r-empty-state');
  if (filtered.length === 0) {
    content.style.display = 'none'; emptyState.style.display = 'block';
    emptyState.querySelector('p').textContent = sessions.length===0 ? 'Aucune session enregistrée' : 'Aucune session pour ces filtres';
    emptyState.querySelector('small').textContent = sessions.length===0 ? 'Les résultats apparaîtront ici après chaque exercice' : 'Essayez de modifier les filtres';
    return;
  }
  content.style.display='block'; emptyState.style.display='none';
  renderStats(filtered); renderCharts(filtered); renderTable(filtered);
}

function avgReactionMs(session) {
  if (!session.responses || session.responses.length === 0) return null;
  return session.responses.reduce((s, r) => s + r.timeMs, 0) / session.responses.length;
}

function renderStats(filtered) {
  const avgPct  = filtered.reduce((s,r)=>s+r.score/r.totalPairs*100,0)/filtered.length;
  const avgTime = filtered.reduce((s,r)=>s+r.totalTimeMs,0)/filtered.length;
  const last    = filtered[filtered.length-1];
  const allReactions = filtered.flatMap(s => (s.responses||[]).map(r => r.timeMs));
  const avgReaction  = allReactions.length > 0 ? allReactions.reduce((a,b)=>a+b,0)/allReactions.length : null;
  document.getElementById('stat-sessions').textContent      = filtered.length;
  document.getElementById('stat-avg-score').textContent     = Math.round(avgPct)+'%';
  document.getElementById('stat-last-score').textContent    = last.score+'/'+last.totalPairs+' ('+Math.round(last.score/last.totalPairs*100)+'%)';
  document.getElementById('stat-avg-time').textContent      = formatDuration(avgTime);
  document.getElementById('stat-avg-reaction').textContent  = avgReaction !== null ? Math.round(avgReaction)+' ms' : '–';
}

function renderCharts(filtered) {
  if (typeof Chart === 'undefined') {
    document.querySelectorAll('.chart-card').forEach(card => {
      const canvas = card.querySelector('canvas'); canvas.style.display='none';
      if (!card.querySelector('.chart-unavailable')) {
        const msg = document.createElement('div'); msg.className='chart-unavailable';
        msg.textContent="Graphiques indisponibles.";
        card.appendChild(msg);
      }
    });
    return;
  }
  const labels    = filtered.map(s => new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}));
  const scoreData = filtered.map(s => Math.round(s.score/s.totalPairs*100));
  const timeData  = filtered.map(s => Math.round(s.totalTimeMs/1000));
  const base = {
    responsive: true, plugins:{legend:{display:false}},
    scales:{
      x:{grid:{display:false},ticks:{color:'#94a3b8',font:{size:11}}},
      y:{grid:{color:'#f1f5f9'},ticks:{color:'#94a3b8',font:{size:11}}},
    },
  };
  if (rScoreChart) rScoreChart.destroy();
  rScoreChart = new Chart(document.getElementById('chart-score'),{
    type:'line', data:{labels,datasets:[{data:scoreData,borderColor:'oklch(52% 0.22 255)',backgroundColor:'oklch(52% 0.22 255 / 0.08)',borderWidth:2,pointRadius:4,pointBackgroundColor:'oklch(52% 0.22 255)',fill:true,tension:0.3}]},
    options:{...base,scales:{...base.scales,y:{...base.scales.y,min:0,max:100,ticks:{...base.scales.y.ticks,callback:v=>v+'%'}}}},
  });
  if (rTimeChart) rTimeChart.destroy();
  rTimeChart = new Chart(document.getElementById('chart-time'),{
    type:'line', data:{labels,datasets:[{data:timeData,borderColor:'oklch(52% 0.22 300)',backgroundColor:'oklch(52% 0.22 300 / 0.08)',borderWidth:2,pointRadius:4,pointBackgroundColor:'oklch(52% 0.22 300)',fill:true,tension:0.3}]},
    options:{...base,scales:{...base.scales,y:{...base.scales.y,ticks:{...base.scales.y.ticks,callback:v=>v+'s'}}}},
  });
}

function renderTable(filtered) {
  const tbody = document.getElementById('sessions-tbody'); tbody.innerHTML='';
  [...filtered].reverse().forEach(session => {
    const pct = Math.round(session.score/session.totalPairs*100);
    const scoreClass = pct>=80?'good-score':pct<50?'low-score':'';
    const tr = document.createElement('tr');
    const reaction = avgReactionMs(session);
    tr.innerHTML =
      '<td>'+new Date(session.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+new Date(session.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+'</td>'+
      '<td>'+escapeHtml(session.patientName)+'</td>'+
      '<td>'+escapeHtml(session.exerciseName)+'</td>'+
      '<td><span class="'+scoreClass+'">'+session.score+'/'+session.totalPairs+'</span> <span class="score-pct">('+pct+'%)</span></td>'+
      '<td>'+formatDuration(session.totalTimeMs)+'</td>'+
      '<td>'+(session.errorsLeft != null ? session.errorsLeft : '–')+'</td>'+
      '<td>'+(session.errorsRight != null ? session.errorsRight : '–')+'</td>'+
      '<td>'+(reaction !== null ? Math.round(reaction)+' ms' : '–')+'</td>'+
      '<td></td>'+
      '<td></td>';
    const notesTd = tr.children[8];
    notesTd.contentEditable = 'true';
    notesTd.textContent = session.notes || '';
    notesTd.style.cssText = 'max-width:220px;min-width:100px;outline:none;color:var(--text-2);font-style:italic;cursor:text;';
    notesTd.addEventListener('blur',  () => { session.notes = notesTd.textContent.trim(); saveSessions(); });
    notesTd.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); notesTd.blur(); } });
    const btn = document.createElement('button');
    btn.className='btn-delete-session'; btn.textContent='Supprimer';
    btn.addEventListener('click', () => {
      if (!confirm('Supprimer cette session ?')) return;
      sessions = sessions.filter(s=>s.id!==session.id); saveSessions(); renderResults();
    });
    tr.lastElementChild.appendChild(btn); tbody.appendChild(tr);
  });
}

document.getElementById('patient-select').addEventListener('change', () => {
  document.getElementById('exercise-filter').value=''; populateExerciseFilter(); renderResults();
});
document.getElementById('exercise-filter').addEventListener('change', renderResults);
document.getElementById('btn-clear-filters').addEventListener('click', () => {
  document.getElementById('patient-select').value=''; document.getElementById('exercise-filter').value='';
  populateExerciseFilter(); renderResults();
});
