/* ── RÉCOMPENSES : ACCESSOIRES DU CUBE (thème « bricoleur / atelier ») ──────────
   Retourne { back, head, outer } : `head` suit la tête (lunettes de soudeur,
   panneau solaire), `outer` est dessiné autour du robot (ceinture, ressorts, clé,
   boîte à outils, engrenages du torse, drone engrenage).
   Les touches (goggles, belt…) sont reliées aux badges dans
   RW_THEMES.robot.speciesAccs.bolt (rewards.js).
   Rien ne couvre l'antenne (100,27)–(100,46). Repères (viewBox 200×240) : tête = rect
   (68,44)–(132,102), yeux en (90,72) et (110,72), corps = rect (72,102)–(128,160),
   jambes x=80 et 106 (y 158–198), mains au niveau 3 : (56,152) et (144,152), drone en (160,54).
   Au niveau 1 (soucoupe) la tête descend de 70 px : `head` la suit, pas `outer`.
   Deux rendus selon le niveau : clé et boîte à outils tenues en main dès le niveau 3
   (posées au sol avant), engrenages du torse dorés au niveau 5.
   ──────────────────────────────────────────────────────────────────────────── */

// Engrenage : polygone à n dents, rayon extérieur R (dents) et intérieur r.
function rwGearPts(cx, cy, R, r, n) {
  const step = 2 * Math.PI / n, p = [];
  for (let i = 0; i < n; i++) {
    const a = i * step;
    [[a - step * .5, r], [a - step * .2, R], [a + step * .2, R], [a + step * .5, r]].forEach(([t, rr]) => {
      p.push((cx + rr * Math.cos(t)).toFixed(1) + ',' + (cy + rr * Math.sin(t)).toFixed(1));
    });
  }
  return p.join(' ');
}

function rwBoltAccs({ acc, A, E, B, st }) {
  const dark = rwShade(A, -.45), K = st >= 5 ? '#ffffff' : A, steel = '#c9cfdd', red = '#d94a3a';
  let head = '', outer = '';

  if (acc.goggles) {
    // lunettes de soudeur relevées sur le front, sangle autour de la tête
    head += `<rect x="68" y="52" width="64" height="7" fill="${dark}" stroke="${K}" stroke-width="1.6"/>` +
      [84, 116].map(x => `<circle cx="${x}" cy="55" r="8.5" fill="#202034" stroke="${K}" stroke-width="2.5"/><circle cx="${x}" cy="55" r="5.3" fill="${A}" opacity=".55"/><path d="M${x - 3.5} ${52} Q${x - 1} ${49.5} ${x + 2} ${50}" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".85"/>`).join('') +
      `<rect x="93" y="53" width="14" height="4" rx="2" fill="#202034" stroke="${K}" stroke-width="1.6"/>`;
  }

  if (acc.solar) {
    // panneau solaire articulé au-dessus de la tête, à gauche de l'antenne
    let cells = '';
    for (let c = 1; c < 4; c++) cells += `<line x1="${58 + c * 8.5}" y1="27" x2="${58 + c * 8.5}" y2="39" stroke="#9ec9ff" stroke-width="1" opacity=".7"/>`;
    head += `<line x1="76" y1="45" x2="76" y2="37" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` +
      `<g transform="rotate(-14 76 33)"><rect x="58" y="27" width="34" height="12" rx="2" fill="#1d3f8a" stroke="${K}" stroke-width="2.2"/>${cells}<line x1="58" y1="33" x2="92" y2="33" stroke="#9ec9ff" stroke-width="1" opacity=".7"/><path d="M61 30 L70 28.5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>` +
      `<polygon points="${rwStarPts(55, 24, 4.5)}" fill="#fff" class="rw-twinkle"/>`;
  }

  if (acc.belt && st >= 2) {
    // ceinture d'outils : boucle, poche à gauche avec un tournevis, marteau à droite
    outer += `<rect x="72" y="148" width="56" height="8" fill="#4a3424" stroke="${dark}" stroke-width="1.6"/><rect x="94" y="146.5" width="12" height="11" rx="2" fill="${A}" stroke="${dark}" stroke-width="1.6"/>` +
      `<rect x="78" y="139" width="4" height="12" rx="1.5" fill="${red}" stroke="${dark}" stroke-width="1"/><path d="M77 156 L89 156 L88 170 L78 170 Z" fill="#6a4a30" stroke="${dark}" stroke-width="1.6" stroke-linejoin="round"/><path d="M77 160 L89 160" stroke="${dark}" stroke-width="1.4"/>` +
      `<rect x="115.5" y="156" width="4" height="13" rx="1.5" fill="#8a6a44" stroke="${dark}" stroke-width="1"/><rect x="111" y="152" width="13" height="6" rx="1.5" fill="${steel}" stroke="${dark}" stroke-width="1.2"/>`;
  }

  if (acc.springs && st >= 2) {
    // ressorts aux jambes (jambes x = 87 et 113, de y 160 à 194)
    [87, 113].forEach(x => {
      let d = `M${x} 160`;
      for (let i = 0; i < 4; i++) d += ` L${x + 10} ${164 + i * 8.5} L${x - 10} ${168 + i * 8.5}`;
      d += ` L${x} 196`;
      outer += `<path d="${d}" stroke="#202034" stroke-width="5.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" stroke="${steel}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
  }

  if (acc.wrench) {
    // clé à molette : tenue dans la main droite dès le niveau 3, posée contre le robot avant
    const wr = `<rect x="-3.2" y="-40" width="6.4" height="62" rx="3" fill="${steel}" stroke="${dark}" stroke-width="1.4"/>` +
      `<path d="M-3.8 -52 A10.5 10.5 0 1 0 3.8 -52 L3.8 -44 L-3.8 -44 Z" fill="${steel}" stroke="${dark}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cy="14" r="2" fill="${A}"/><path d="M-1 -30 L-1 8" stroke="#fff" stroke-width="1.2" opacity=".8"/>`;
    if (st >= 3) outer += `<g transform="translate(144 152) rotate(16)">${wr}</g><circle cx="144" cy="152" r="8" fill="${A}" stroke="${K}" stroke-width="2.5"/>`;
    else outer += `<g transform="translate(160 206) rotate(12)">${wr}</g>`;
  }

  if (acc.toolbox) {
    // boîte à outils : tenue dans la main gauche dès le niveau 3, posée au sol avant
    const box = (cx, ty) => `<path d="M${cx - 8} ${ty} Q${cx - 8} ${ty - 9} ${cx} ${ty - 9} Q${cx + 8} ${ty - 9} ${cx + 8} ${ty}" stroke="${dark}" stroke-width="3" fill="none"/>` +
      `<rect x="${cx - 14}" y="${ty}" width="28" height="19" rx="3" fill="${red}" stroke="${dark}" stroke-width="1.8"/><rect x="${cx - 14}" y="${ty + 7}" width="28" height="3" fill="${dark}" opacity=".5"/><rect x="${cx - 3}" y="${ty + 5}" width="6" height="7" rx="1.5" fill="${steel}" stroke="${dark}" stroke-width="1"/>`;
    if (st >= 3) outer += box(56, 166) + `<circle cx="56" cy="152" r="8" fill="${A}" stroke="${K}" stroke-width="2.5"/>`;
    else outer += box(40, 192);
  }

  if (acc.gears && st >= 2) {
    // moteur à engrenages dans le torse : deux roues dentées qui tournent en sens inverse (dorées au niveau 5)
    const f = st >= 5 ? '#ffe14d' : A, s = st >= 5 ? '#fff6c0' : dark;
    outer += `<g class="rw-spin"><polygon points="${rwGearPts(93, 125, 10, 7.2, 8)}" fill="${f}" stroke="${s}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="93" cy="125" r="3" fill="#0b0b16"/></g>` +
      `<g class="rw-spin" style="animation-direction:reverse;animation-duration:2s"><polygon points="${rwGearPts(110, 129, 7.6, 5.4, 7)}" fill="${f}" stroke="${s}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="110" cy="129" r="2.2" fill="#0b0b16"/></g>`;
  }

  if (acc.cogdrone && st >= 2) {
    // drone compagnon en forme d'engrenage qui tourne, œil lumineux au centre
    head += `<g class="rw-dro"><line x1="150" y1="70" x2="124" y2="96" stroke="${A}" stroke-width="1.2" stroke-dasharray="2 4" opacity=".6"/>` +
      `<g class="rw-spin" style="animation-duration:4s"><polygon points="${rwGearPts(160, 54, 15, 10.8, 9)}" fill="${B}" stroke="${A}" stroke-width="2.3" stroke-linejoin="round"/></g>` +
      `<circle cx="160" cy="54" r="6" fill="#05050c"/><circle cx="160" cy="54" r="3.4" fill="${E}"/><circle cx="158.8" cy="52.8" r="1" fill="#fff" opacity=".8"/></g>`;
  }
  return { back: '', head, outer };
}
