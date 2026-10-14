/* ── RÉCOMPENSES : DESSIN DES LÉGUMES SUPER-HÉROS ────────────────────────────
   Univers « potager », pendant de rewards-robot.js : mêmes entrées (modèle,
   niveau 1 à 5, couleurs, accessoires), même cadre 200×240, sol vers y=206.
   Couleurs : accent = cape, étoile et bottes ; mask = masque et ceinture.
   Le légume garde ses couleurs naturelles (carotte, radis, patate, brocoli).
   Niveau 1 = petit légume tout nu, 2 = masque de héros et poing levé, 3 = cape et bottes,
   4 = étoile de héros sur le torse et étincelles, 5 = aura dorée, couronne de feuilles et éclairs.
   Utilise rwShade et rwStarPts (rewards-robot.js). Logique : rewards.js.
   ──────────────────────────────────────────────────────────────────────────── */

// fy : hauteur des yeux ; sh : hauteur des épaules ; ax : écart des bras au centre
const RW_VEGGIE_SPECIES = {
  carrot:   { label: 'Carotte', body: '#f28a2e', fy: 114, sh: 126, ax: 33 },
  radish:   { label: 'Radis',   body: '#e8456b', fy: 124, sh: 134, ax: 46 },
  potato:   { label: 'Patate',  body: '#cfa064', fy: 134, sh: 146, ax: 50 },
  broccoli: { label: 'Brocoli', body: '#a8d37a', fy: 142, sh: 146, ax: 25 },
};

const RW_VEG_GOLD = '#ffd45c';
const RW_VEG_EYE = '#2b2238';
const RW_VEG_LEAF = '#4fae4a';

function rwVegSparkle(x, y, r, fill) {
  return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${fill}"/>`;
}

// Une feuille : ellipse inclinée dont la base est en (x, y)
function rwVegLeaf(x, y, deg, len, fill) {
  return `<ellipse cx="${x}" cy="${y - len / 2}" rx="${(len * 0.26).toFixed(1)}" ry="${(len / 2).toFixed(1)}" transform="rotate(${deg} ${x} ${y})" ` +
    `fill="${fill}" stroke="${rwShade(fill, -0.35)}" stroke-width="2"/>`;
}

// Corps du légume (sans visage), dessiné derrière le visage
function rwVegBody(sp, B, K, uid) {
  const line = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const leaves = (x, y, big) => rwVegLeaf(x, y, -38, big, RW_VEG_LEAF) + rwVegLeaf(x, y, 38, big, RW_VEG_LEAF) + rwVegLeaf(x, y, 0, big + 8, '#62c05a');
  if (sp === 'carrot') {
    return leaves(100, 88, 34) +
      `<path d="M62 102 Q62 84 100 84 Q138 84 138 102 Q134 152 108 192 Q100 200 92 192 Q66 152 62 102 Z" fill="${B}" ${line}/>` +
      `<path d="M66 150 L78 148 M122 168 L132 166 M70 118 L80 116 M120 134 L131 132" stroke="${K}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`;
  }
  if (sp === 'radish') {
    return leaves(100, 92, 36) +
      `<defs><clipPath id="rc${uid}"><ellipse cx="100" cy="140" rx="49" ry="51"/></clipPath></defs>` +
      `<path d="M97 188 Q100 206 104 188 Z" fill="#fbeff0" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<ellipse cx="100" cy="140" rx="49" ry="51" fill="${B}"/>` +
      `<rect x="40" y="168" width="120" height="30" fill="#fbeff0" clip-path="url(#rc${uid})"/>` +
      `<path d="M52 168 Q100 180 148 168" stroke="${K}" stroke-width="2" fill="none" opacity=".35" clip-path="url(#rc${uid})"/>` +
      `<ellipse cx="100" cy="140" rx="49" ry="51" fill="none" ${line}/>`;
  }
  if (sp === 'potato') {
    return rwVegLeaf(94, 108, -25, 24, RW_VEG_LEAF) + rwVegLeaf(106, 108, 28, 20, '#62c05a') +
      `<path d="M50 152 Q44 112 90 104 Q148 98 152 150 Q154 196 100 196 Q52 196 50 152 Z" fill="${B}" ${line}/>` +
      [[72, 168, 4, 2.6], [128, 172, 5, 3], [122, 124, 3.6, 2.4], [80, 120, 3, 2]].map(([x, y, rx, ry]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${K}" opacity=".5"/>`).join('');
  }
  // brocoli : tronc puis bouquet
  return `<path d="M78 112 L72 192 Q100 200 128 192 L122 112 Z" fill="${B}" ${line}/>` +
    `<path d="M80 150 L74 150 M120 160 L126 160" stroke="${K}" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>` +
    [[100, 80, 25], [70, 94, 22], [130, 94, 22], [84, 66, 19], [116, 66, 19]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#4f9d3f" stroke="#2c6a24" stroke-width="3"/>`).join('') +
    [[76, 86], [124, 88], [100, 68], [92, 98], [112, 98]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="3.2" fill="#7bc46a"/>`).join('');
}

function rwVeggieSvg(o) {
  const { species: sp, stage: st, accent: A, mask: M, acc, uid } = o;
  const S = RW_VEGGIE_SPECIES[sp];
  const B = S.body, K = rwShade(B, -0.45), AK = rwShade(A, -0.4), MK = rwShade(M, -0.4);
  const line = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const sc = [0.8, 0.87, 0.93, 0.98, 1][st - 1];
  const { fy, sh, ax } = S;

  let s = `<svg viewBox="0 0 200 240" role="img" aria-label="${S.label}"><defs>` +
    `<radialGradient id="vg${uid}"><stop offset="0" stop-color="${RW_VEG_GOLD}" stop-opacity=".7"/><stop offset="1" stop-color="${RW_VEG_GOLD}" stop-opacity="0"/></radialGradient></defs>`;
  if (st >= 5) s += `<circle class="rw-pulse" cx="100" cy="120" r="98" fill="url(#vg${uid})"/>`;
  s += `<ellipse cx="100" cy="207" rx="42" ry="6" fill="#000" opacity=".2"/>`;
  s += `<g transform="translate(100 214) scale(${sc}) translate(-100 -214)">`;
  if (st >= 4) s += rwVegSparkle(34, 72, 7, '#fff') + rwVegSparkle(170, 92, 6, A) + rwVegSparkle(42, 150, 5, A) + rwVegSparkle(168, 168, 6, '#fff');

  // ── Derrière : éclairs, cape ───────────────────────────────────────────────
  if (acc.bolts) {
    s += `<g class="rw-flick"><polygon points="30,60 20,84 29,84 24,104 40,76 31,76 36,60" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<polygon points="172,64 162,88 171,88 166,108 182,80 173,80 178,64" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="1.5" stroke-linejoin="round"/></g>`;
  }
  if (st >= 3) {
    s += `<path d="M${100 - ax - 4} ${sh - 4} L${100 + ax + 4} ${sh - 4} L158 196 Q146 208 132 200 Q116 210 100 202 Q84 210 68 200 Q54 208 42 196 Z" ` +
      `fill="${A}" stroke="${AK}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M${100 - ax} ${sh + 4} L${100 + ax} ${sh + 4}" stroke="${AK}" stroke-width="2" opacity=".5"/>`;
  }

  // ── Jambes et bottes ───────────────────────────────────────────────────────
  const boot = st >= 3 ? A : K, bootK = st >= 3 ? AK : rwShade(B, -0.7);
  s += [86, 114].map(x => `<ellipse cx="${x}" cy="201" rx="12" ry="6.5" fill="${boot}" stroke="${bootK}" stroke-width="2.5"/>`).join('');

  // ── Corps ──────────────────────────────────────────────────────────────────
  s += rwVegBody(sp, B, K, uid);

  // ceinture (dès le niveau 3), dans la couleur du masque
  if (st >= 3 && sp !== 'broccoli') {
    const by = fy + 40;
    s += `<path d="M${100 - ax - 8} ${by} Q100 ${by + 7} ${100 + ax + 8} ${by} L${100 + ax + 8} ${by + 7} Q100 ${by + 14} ${100 - ax - 8} ${by + 7} Z" fill="${M}" stroke="${MK}" stroke-width="2"/>` +
      `<rect x="94" y="${by - 1}" width="12" height="11" rx="2" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="1.5"/>`;
  }
  // étoile de héros sur le torse (dès le niveau 4)
  if (st >= 4) {
    const ey = sp === 'broccoli' ? fy + 30 : fy + 28;
    s += `<circle cx="100" cy="${ey}" r="11" fill="${st >= 5 ? RW_VEG_GOLD : A}" stroke="${st >= 5 ? '#c99a1c' : AK}" stroke-width="2"/>` +
      `<polygon points="${rwStarPts(100, ey + 0.5, 7.5)}" fill="#fff"/>`;
  }

  // ── Visage ─────────────────────────────────────────────────────────────────
  const ex = [86, 114];
  if (st >= 2) {
    // masque de héros : bandeau autour des yeux + petits nœuds sur les côtés
    s += `<path d="M58 ${fy - 8} L72 ${fy - 12} L70 ${fy} Z M142 ${fy - 8} L128 ${fy - 12} L130 ${fy} Z" fill="${M}" stroke="${MK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M66 ${fy - 8} Q100 ${fy - 24} 134 ${fy - 8} Q138 ${fy + 8} 118 ${fy + 12} Q100 ${fy + 4} 82 ${fy + 12} Q62 ${fy + 8} 66 ${fy - 8} Z" fill="${M}" stroke="${MK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  s += ex.map(x => `<ellipse cx="${x}" cy="${fy}" rx="7" ry="8.5" fill="#fff" stroke="${st >= 2 ? MK : RW_VEG_EYE}" stroke-width="2"/>` +
    `<ellipse cx="${x + 1}" cy="${fy + 1}" rx="4" ry="5.2" fill="${RW_VEG_EYE}"/>` +
    `<circle cx="${x - 0.5}" cy="${fy - 2}" r="1.8" fill="#fff"/>`).join('');
  s += `<ellipse cx="${100 - 30}" cy="${fy + 14}" rx="6" ry="3.8" fill="#ff7f9a" opacity=".5"/><ellipse cx="${100 + 30}" cy="${fy + 14}" rx="6" ry="3.8" fill="#ff7f9a" opacity=".5"/>`;
  s += st >= 5
    ? `<path d="M88 ${fy + 15} Q100 ${fy + 32} 112 ${fy + 15} Z" fill="#7a1f35" stroke="${RW_VEG_EYE}" stroke-width="2" stroke-linejoin="round"/>`
    : `<path d="M92 ${fy + 16} Q100 ${fy + 24} 108 ${fy + 16}" stroke="${RW_VEG_EYE}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

  if (acc.mustache) {
    s += `<path d="M100 ${fy + 12} Q94 ${fy + 8} 86 ${fy + 12} Q80 ${fy + 16} 78 ${fy + 11} Q82 ${fy + 22} 94 ${fy + 17} Q99 ${fy + 15} 100 ${fy + 12} Z ` +
      `M100 ${fy + 12} Q106 ${fy + 8} 114 ${fy + 12} Q120 ${fy + 16} 122 ${fy + 11} Q118 ${fy + 22} 106 ${fy + 17} Q101 ${fy + 15} 100 ${fy + 12} Z" fill="#5a3a22" stroke="#3a2414" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  if (acc.shades) {
    s += ex.map(x => `<rect x="${x - 12}" y="${fy - 9}" width="24" height="17" rx="7" fill="#1d1a28" stroke="#000" stroke-width="2"/>` +
      `<path d="M${x - 8} ${fy - 4} L${x - 2} ${fy - 6}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`).join('') +
      `<path d="M97 ${fy - 4} Q100 ${fy - 7} 103 ${fy - 4}" stroke="#000" stroke-width="2.5" fill="none"/>`;
  }
  if (acc.headband) {
    const hy = fy - 24;
    s += `<path d="M${100 - ax - 8} ${hy + 4} Q100 ${hy - 6} ${100 + ax + 8} ${hy + 4} L${100 + ax + 8} ${hy + 12} Q100 ${hy + 2} ${100 - ax - 8} ${hy + 12} Z" fill="${A}" stroke="${AK}" stroke-width="2"/>` +
      `<path d="M${100 + ax + 4} ${hy + 6} L${100 + ax + 20} ${hy - 2} L${100 + ax + 16} ${hy + 8} L${100 + ax + 22} ${hy + 16} Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  // couronne de feuilles dorées (niveau 5)
  if (st >= 5) {
    const cy = sp === 'broccoli' ? 42 : sp === 'carrot' ? 56 : sp === 'radish' ? 58 : 84;
    s += [-34, -17, 0, 17, 34].map(d => {
      const a = d * Math.PI / 180, x = 100 + 22 * Math.sin(a), y = cy + 22 - 22 * Math.cos(a);
      return `<polygon points="${(x - 5).toFixed(1)},${(y + 6).toFixed(1)} ${x.toFixed(1)},${(y - 14).toFixed(1)} ${(x + 5).toFixed(1)},${(y + 6).toFixed(1)}" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="1.5" stroke-linejoin="round" transform="rotate(${d} ${x.toFixed(1)} ${(y + 6).toFixed(1)})"/>`;
    }).join('') + `<path d="M${(100 - 22 * Math.sin(0.6)).toFixed(1)} ${cy + 24} Q100 ${cy + 30} ${(100 + 22 * Math.sin(0.6)).toFixed(1)} ${cy + 24}" stroke="#c99a1c" stroke-width="3" fill="none"/>`;
  }

  // ── Bras : gauche sur la hanche, droit levé en pose de héros (dès le niveau 2) ──
  const arm = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${K}" stroke-width="12" stroke-linecap="round"/>` +
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${B}" stroke-width="7" stroke-linecap="round"/>` +
    `<circle cx="${x2}" cy="${y2}" r="7.5" fill="${B}" stroke="${K}" stroke-width="2.5"/>`;
  const lx = 100 - ax, rx = 100 + ax;
  const fist = st >= 2 ? [rx + 18, sh - 22 - (st >= 5 ? 8 : 0)] : [rx + 8, sh + 16];

  if (acc.fork) {
    const [fx, fyy] = fist;
    s += `<line x1="${fx}" y1="${fyy + 34}" x2="${fx}" y2="${fyy - 46}" stroke="#aeb7c2" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M${fx - 12} ${fyy - 62} L${fx - 12} ${fyy - 46} Q${fx} ${fyy - 38} ${fx + 12} ${fyy - 46} L${fx + 12} ${fyy - 62} M${fx} ${fyy - 64} L${fx} ${fyy - 44}" stroke="#aeb7c2" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
  s += arm(lx, sh, lx - 14, sh + 16);
  s += arm(rx, sh, fist[0], fist[1]);
  if (acc.shield) {
    const cx = lx - 20, cy = sh + 26;
    s += `<circle cx="${cx}" cy="${cy}" r="25" fill="#c9d1d9" stroke="#6b7480" stroke-width="3"/>` +
      `<circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="#e8edf2" stroke-width="3"/>` +
      `<rect x="${cx - 6}" y="${cy - 28}" width="12" height="6" rx="3" fill="#6b7480"/>` +
      `<path d="M${cx - 12} ${cy - 8} L${cx - 5} ${cy - 13}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>` +
      `<circle cx="${cx + 2}" cy="${cy + 2}" r="6.5" fill="${A}" stroke="${AK}" stroke-width="2"/>`;
  }

  // ── Compagnons : mini petits pois ──────────────────────────────────────────
  if (acc.peas) {
    const pea = (x, y, cls) => `<g${cls ? ` class="${cls}"` : ''}><circle cx="${x}" cy="${y}" r="10" fill="#7bc46a" stroke="#3f8a3d" stroke-width="2.5"/>` +
      `<circle cx="${x - 3.5}" cy="${y - 1}" r="1.7" fill="${RW_VEG_EYE}"/><circle cx="${x + 3.5}" cy="${y - 1}" r="1.7" fill="${RW_VEG_EYE}"/>` +
      `<path d="M${x - 3} ${y + 3.5} Q${x} ${y + 6.5} ${x + 3} ${y + 3.5}" stroke="${RW_VEG_EYE}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
    s += pea(30, 198) + pea(52, 198) + pea(41, 179, 'rw-dro');
  }
  s += `</g></svg>`;
  return s;
}

// Badge en médaillon de potager (vert quand gagné) avec une petite feuille
function rwVeggieBadgeSvg(b, on) {
  const c = on ? '#4fae4a' : '#9aa38c', c2 = on ? '#fff3c4' : '#d9dccf', ink = on ? '#2f6b2a' : '#7d8470';
  return `<svg viewBox="0 0 64 64" aria-hidden="true">` +
    `<ellipse cx="36" cy="12" rx="5" ry="9" transform="rotate(28 36 14)" fill="${c}"/>` +
    `<circle cx="32" cy="36" r="26" fill="${c}"/><circle cx="32" cy="36" r="21" fill="${c2}"/>` +
    `<g transform="translate(0 4)">` + rwBadgeGlyph(b, ink) + `</g></svg>`;
}
