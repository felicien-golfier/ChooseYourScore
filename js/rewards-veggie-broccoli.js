/* ── RÉCOMPENSES : ACCESSOIRES DE SUPER-BROCOLI (thème « jungle ») ───────────
   Retourne des morceaux de SVG par emplacement, insérés par rwVeggieSvg :
   `back` derrière la cape (arc-en-ciel, liane), `face` sur le visage et le bouquet
   (peintures, couronne de fleurs, coccinelle), `hand` avant les bras (tambour sous la
   main gauche, mini tornade au-dessus du poing droit), `front` devant tout (oiseau).
   noCrown : la couronne de fleurs remplace la couronne de feuilles du niveau 5.
   Les touches sont reliées aux badges dans RW_THEMES.veggie.speciesAccs.broccoli
   (rewards.js) ; P = couleur des peintures (joues, pétales des fleurs).
   Repères (viewBox 200×240, avant mise à l'échelle du niveau) : bouquet = cercles
   (100,80,r25), (70,94,r22), (130,94,r22), (84,66,r19), (116,66,r19), sommet vers y=47 ;
   tronc de (78,112) à (72..128,192) ; yeux à y=142, bouche à y=158 ; main gauche en
   (61,162) ; poing droit levé en (143,124) (niveau 1 : bras baissé, (133,162)).
   ──────────────────────────────────────────────────────────────────────────── */

function rwBroccoliAccs({ acc, A, AK, P, st, fy, fist }) {
  let back = '', face = '', hand = '', front = '';
  const PK = rwShade(P, -0.4), gold = RW_VEG_GOLD, goldK = '#c99a1c';

  if (acc.rainbow) {
    // arc-en-ciel au-dessus du bouquet, posé sur deux nuages
    const cols = ['#e8354a', '#ff8a1f', '#ffd45c', '#62c05a', '#2f6bd6', '#8a4fd6'];
    back += cols.map((c, i) => { const r = 62 - i * 4.2; return `<path d="M${100 - r} 84 A${r} ${r} 0 0 1 ${100 + r} 84" stroke="${c}" stroke-width="4.4" fill="none"/>`; }).join('') +
      [[38, 84], [162, 84]].map(([x, y]) => `<g fill="#fff" stroke="#c8d6e5" stroke-width="1.6"><circle cx="${x - 8}" cy="${y + 2}" r="7"/><circle cx="${x + 8}" cy="${y + 2}" r="7"/><circle cx="${x}" cy="${y - 3}" r="9"/></g>` +
        `<path d="M${x - 13} ${y + 4} L${x + 13} ${y + 4}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`).join('');
  }

  if (acc.vine) {
    // liane qui tombe du haut à gauche, feuilles le long, boucle au bout
    const leaf = (x, y, d) => rwVegLeaf(x, y, d, 13, '#4fae4a');
    back += `<path d="M30 -60 Q14 10 30 60 Q42 96 26 124 Q18 138 30 140 Q38 140 34 132" stroke="#6b8a2f" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
      leaf(24, 0, -60) + leaf(22, 34, 60) + leaf(30, 62, -55) + leaf(36, 96, 50) + leaf(28, 118, -60);
  }

  if (acc.paint) {
    // peintures de jungle sur les joues : deux traits et un point de chaque côté
    face += [-1, 1].map(sx => {
      const x0 = 100 + sx * 11, x1 = 100 + sx * 23;
      return `<path d="M${x0} ${fy + 15} L${x1} ${fy + 12} M${x0 + sx * 1} ${fy + 21} L${x1 + sx * 1} ${fy + 18}" stroke="${PK}" stroke-width="5.4" stroke-linecap="round"/>` +
        `<path d="M${x0} ${fy + 15} L${x1} ${fy + 12} M${x0 + sx * 1} ${fy + 21} L${x1 + sx * 1} ${fy + 18}" stroke="${P}" stroke-width="3.6" stroke-linecap="round"/>` +
        `<circle cx="${100 + sx * 18}" cy="${fy + 27}" r="2.6" fill="${P}" stroke="${PK}" stroke-width=".9"/>`;
    }).join('');
  }

  if (acc.flowers) {
    // couronne de fleurs posée sur le bouquet (pétales couleur des peintures, cœurs dorés)
    const flower = (x, y, r) => [0, 72, 144, 216, 288].map(d => {
      const a = d * Math.PI / 180;
      return `<circle cx="${(x + r * 0.62 * Math.cos(a)).toFixed(1)}" cy="${(y + r * 0.62 * Math.sin(a)).toFixed(1)}" r="${(r * 0.5).toFixed(1)}" fill="${P}" stroke="${PK}" stroke-width="1.2"/>`;
    }).join('') + `<circle cx="${x}" cy="${y}" r="${(r * 0.38).toFixed(1)}" fill="${gold}" stroke="${goldK}" stroke-width="1"/>`;
    face += `<path d="M58 84 Q66 56 100 50 Q134 56 142 84" stroke="#3f8a3d" stroke-width="3" fill="none"/>` +
      rwVegLeaf(70, 66, -70, 12, '#62c05a') + rwVegLeaf(130, 66, 70, 12, '#62c05a') +
      flower(60, 82, 8) + flower(76, 60, 9) + flower(100, 51, 10) + flower(124, 60, 9) + flower(140, 82, 8);
  }

  if (acc.ladybug) {
    // coccinelle copine posée sur le bouquet
    face += `<g transform="translate(52 106) rotate(-25) scale(1.3)"><circle cx="0" cy="-7" r="3.8" fill="#1d1a28"/>` +
      `<circle cx="-1.4" cy="-8" r="1" fill="#fff"/><circle cx="1.4" cy="-8" r="1" fill="#fff"/>` +
      `<ellipse cx="0" cy="1" rx="7" ry="8" fill="#e8354a" stroke="#1d1a28" stroke-width="1.6"/>` +
      `<path d="M0 -7 L0 9" stroke="#1d1a28" stroke-width="1.4"/>` +
      `<circle cx="-3.4" cy="-1" r="1.6" fill="#1d1a28"/><circle cx="3.4" cy="-1" r="1.6" fill="#1d1a28"/><circle cx="-3" cy="4.5" r="1.4" fill="#1d1a28"/><circle cx="3" cy="4.5" r="1.4" fill="#1d1a28"/>` +
      `<path d="M-1.5 -10.5 L-3.5 -14 M1.5 -10.5 L3.5 -14" stroke="#1d1a28" stroke-width="1.2" stroke-linecap="round"/></g>`;
  }

  if (acc.drum) {
    // tambour de la jungle à gauche, la main gauche posée dessus
    const cx = 52, top = 168;
    hand += `<path d="M${cx - 17} ${top} L${cx - 15} ${top + 28} Q${cx} ${top + 34} ${cx + 15} ${top + 28} L${cx + 17} ${top} Z" fill="${A}" stroke="${AK}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M${cx - 16} ${top + 13} L${cx - 10} ${top + 7} L${cx - 4} ${top + 13} L${cx + 2} ${top + 7} L${cx + 8} ${top + 13} L${cx + 14} ${top + 7}" stroke="${gold}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>` +
      `<path d="M${cx - 16} ${top + 22} Q${cx} ${top + 27} ${cx + 16} ${top + 22}" stroke="#7a4a26" stroke-width="3" fill="none"/>` +
      `<ellipse cx="${cx}" cy="${top}" rx="17" ry="5.5" fill="#f3e3c3" stroke="#7a4a26" stroke-width="2.5"/>`;
  }

  if (acc.tornado) {
    // mini tornade qui tourbillonne au-dessus du poing droit (à côté de la main au niveau 1, bras baissé)
    const [fx, fy0] = fist, tx = st >= 2 ? fx + 6 : fx + 14, ty = st >= 2 ? fy0 - 10 : fy0 - 8;
    hand += `<g class="rw-flick">` + [0, 1, 2, 3, 4, 5].map(i => {
      const y = ty - i * 8, rx = 3.5 + i * 2.6;
      return `<ellipse cx="${(tx + Math.sin(i * 1.3) * 2.5).toFixed(1)}" cy="${y}" rx="${rx.toFixed(1)}" ry="${(2.2 + i * 0.5).toFixed(1)}" fill="#eef6fc" stroke="#5f8fb8" stroke-width="2.2"/>`;
    }).join('') +
      `<circle cx="${tx - 15}" cy="${ty - 34}" r="1.8" fill="#4fae4a"/><circle cx="${tx + 15}" cy="${ty - 22}" r="1.6" fill="#7a4a26"/><circle cx="${tx - 9}" cy="${ty - 14}" r="1.3" fill="#7fa6c8"/></g>`;
  }

  if (acc.bird) {
    // oiseau de la jungle qui lance des éclairs
    front += `<g class="rw-dro"><polygon points="178,52 170,68 177,68 172,84 186,62 179,62 184,52" fill="${gold}" stroke="${goldK}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M152 36 L142 30 L146 38 L140 42 Z" fill="#2f6bd6" stroke="#1d4a9a" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<ellipse cx="160" cy="38" rx="12" ry="8.5" fill="#1fa89a" stroke="#137067" stroke-width="2"/>` +
      `<path d="M156 36 Q160 24 170 26 Q166 34 160 40 Z" fill="#62c05a" stroke="#137067" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="171" cy="33" r="7" fill="#1fa89a" stroke="#137067" stroke-width="2"/>` +
      `<path d="M177 31 L186 34 L177 37 Z" fill="#ff8a1f" stroke="#c4600f" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<circle cx="172" cy="31.5" r="1.8" fill="${RW_VEG_EYE}"/><path d="M168 27 Q170 22 174 24" stroke="#e8354a" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
  }

  return { back, face, hand, front, noCrown: !!acc.flowers };
}
