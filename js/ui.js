// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS — helpers DOM partagés entre les vues
// ═══════════════════════════════════════════════════════════════════════════════

// ── Réordonnancement ─────────────────────────────────────────────────────────
function makeReorderBtns(upHandler, downHandler) {
  const wrap = document.createElement('div');
  wrap.className = 'reorder-wrap';
  wrap.style.cssText = 'display:flex;gap:2px;flex-shrink:0';
  const up = document.createElement('button');
  up.type = 'button'; up.className = 'pair-action-btn reorder-up'; up.title = 'Monter'; up.textContent = '↑';
  up.addEventListener('click', upHandler);
  const dn = document.createElement('button');
  dn.type = 'button'; dn.className = 'pair-action-btn reorder-dn'; dn.title = 'Descendre'; dn.textContent = '↓';
  dn.addEventListener('click', downHandler);
  wrap.append(up, dn);
  return { wrap, up, dn };
}

function setReorderDisabled(btn, disabled) {
  if (btn) btn.disabled = disabled;
}

function syncReorderBtns(wrappers) {
  const n = wrappers.length;
  wrappers.forEach((el, i) => {
    setReorderDisabled(el.querySelector('.reorder-up'), i === 0);
    setReorderDisabled(el.querySelector('.reorder-dn'), i === n - 1);
  });
}

// ── Compteur +/− ─────────────────────────────────────────────────────────────
function makeCounterBtns(minusHandler, plusHandler) {
  const minus = document.createElement('button');
  minus.type = 'button'; minus.className = 'pair-action-btn counter-minus'; minus.title = 'Diminuer'; minus.textContent = '−';
  minus.addEventListener('click', minusHandler);
  const plus = document.createElement('button');
  plus.type = 'button'; plus.className = 'pair-action-btn counter-plus'; plus.title = 'Augmenter'; plus.textContent = '+';
  plus.addEventListener('click', plusHandler);
  return { minus, plus };
}
