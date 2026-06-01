/* ── CELEBRATION / REWARD MOMENT ──────────────────────────────────────────────
   Stars + encouraging message + confetti on the session-result screen.
   Called from session.js → showSessionResult() via celebrateResult(score, total).
   ──────────────────────────────────────────────────────────────────────────── */

const CEL_MESSAGES = {
  3: ['Bravo, champion·ne !', 'Incroyable !', 'Tu assures !', 'Génial !'],
  2: ['Super travail !', 'Bien joué !', 'Continue comme ça !', 'Beau score !'],
  1: ['Bien essayé !', 'On progresse !', "Bravo d'avoir tout fini !", 'Encore un effort !'],
  0: ["C'est fini, bravo !", 'Tu as tout terminé !', 'On réessaiera ensemble !'],
};

function celebrateResult(score, total) {
  const cel = document.getElementById('celebration');
  if (!cel) return;
  const pct = total > 0 ? score / total : 0;
  const stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

  // Réglage : récompense de fin (étoiles + message) activable/désactivable
  const showCelebration = typeof getSetting !== 'function' || getSetting('celebration');
  if (!showCelebration) {
    cel.style.display = 'none';
  } else {
    cel.style.display = '';
    const starEls = cel.querySelectorAll('.cel-star');
    starEls.forEach(el => el.classList.remove('on'));
    void cel.offsetWidth; // re-trigger entrance animation
    starEls.forEach((el, i) => { if (i < stars) el.classList.add('on'); });

    const pool = CEL_MESSAGES[stars];
    document.getElementById('cel-title').textContent = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById('cel-sub').textContent =
      score + ' / ' + total + ' bonne' + (score > 1 ? 's' : '') + ' réponse' + (score > 1 ? 's' : '');
  }

  // Réglage : confettis (indépendant de la récompense)
  const allowConfetti = typeof getSetting !== 'function' || getSetting('confetti');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && allowConfetti && stars >= 2) fireConfetti(stars === 3 ? 160 : 90);
}

function fireConfetti(count) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.style.display = 'block';

  const colors = ['#ff7a4d', '#ffc23d', '#3fc6c9', '#7d6cff', '#56b0ff', '#5fd08a'];
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 220,
      y: window.innerHeight * 0.32 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -11 - 4,
      size: 6 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    });
  }

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    frame++;
    let alive = false;
    for (const p of parts) {
      p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
      if (p.y < window.innerHeight + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - frame / 130);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (alive && frame < 140) requestAnimationFrame(tick);
    else { canvas.style.display = 'none'; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
  requestAnimationFrame(tick);
}
