/* ── RÉCOMPENSES : DESSIN DES CRÉATURES MAGIQUES ─────────────────────────────
   Univers « kawaii », pendant de rewards-robot.js : mêmes entrées (espèce, niveau
   1 à 5, couleurs, accessoires), même cadre 200×240, sol vers y=206.
   Niveau 1 = œuf, 2 = bébé, 3 = pattes et queue, 4 = grandes ailes et étincelles,
   5 = arc-en-ciel, ailes de lumière et étoile.
   Utilise rwShade et rwStarPts (rewards-robot.js). Logique : rewards.js.
   ──────────────────────────────────────────────────────────────────────────── */

// rx/ry : demi-axes de la tête (centrée en 100,80), ex : écart des yeux au centre
const RW_MAGIC_SPECIES = {
  unicorn: { label: 'Licorne',  rx: 38, ry: 36, ex: 15 },
  dragon:  { label: 'Dragon',   rx: 40, ry: 35, ex: 16 },
  cat:     { label: 'Chat-fée', rx: 42, ry: 34, ex: 16 },
  axolotl: { label: 'Axolotl',  rx: 47, ry: 32, ex: 18 },
};

const RW_MAGIC_GOLD = '#ffd84d';
const RW_RAINBOW = ['#ff9ec7', '#ffc48a', '#fff09a', '#a8f0c6', '#9fd3ff', '#c9b2ff'];

// Étincelle à 4 branches
function rwSparkle(x, y, r, fill) {
  return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${fill}"/>`;
}

function rwHeartPath(cx, cy, s) {
  return `M${cx} ${cy + 7 * s} C${cx - 6 * s} ${cy + 1 * s} ${cx - 10 * s} ${cy - 3 * s} ${cx - 6 * s} ${cy - 7 * s} ` +
    `C${cx - 3 * s} ${cy - 10 * s} ${cx} ${cy - 8 * s} ${cx} ${cy - 5 * s} C${cx} ${cy - 8 * s} ${cx + 3 * s} ${cy - 10 * s} ${cx + 6 * s} ${cy - 7 * s} ` +
    `C${cx + 10 * s} ${cy - 3 * s} ${cx + 6 * s} ${cy + 1 * s} ${cx} ${cy + 7 * s} Z`;
}

// Aile en coordonnées locales (ancrée en 0,0, pointant vers la gauche), dessinée des deux côtés.
function rwMagicWings(path, ax, ay, k, attrs) {
  return `<path d="${path}" transform="translate(${ax} ${ay}) scale(${k})" ${attrs}/>` +
    `<path d="${path}" transform="translate(${200 - ax} ${ay}) scale(${-k} ${k})" ${attrs}/>`;
}
const RW_WING_FEATHER = 'M0 0 Q-18 -40 -52 -38 Q-42 -30 -48 -23 Q-36 -20 -42 -12 Q-29 -10 -33 -2 Q-18 0 0 10 Z';
const RW_WING_BAT     = 'M0 0 Q-26 -30 -36 -18 Q-29 -12 -31 -3 Q-23 -5 -21 5 Q-12 1 -4 12 Z';

function rwMagicSvg(o) {
  const { species: sp, stage: st, body: B, accent: A, eye: E, acc, uid } = o;
  const S = RW_MAGIC_SPECIES[sp];
  const K = rwShade(B, -0.38), L = rwShade(B, 0.55), AK = rwShade(A, -0.32), W = 3;
  const line = `stroke="${K}" stroke-width="${W}" stroke-linejoin="round"`;
  const sc = [0.8, 0.86, 0.92, 0.98, 1][st - 1];
  const hy = 80, top = hy - S.ry;

  let s = `<svg viewBox="0 0 200 240" role="img" aria-label="${S.label}"><defs>` +
    `<radialGradient id="mg${uid}"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient></defs>`;
  if (st >= 5) {
    s += RW_RAINBOW.map((c, i) => { const r = 92 - i * 6;
      return `<path d="M${100 - r} 150 A${r} ${r} 0 0 1 ${100 + r} 150" stroke="${c}" stroke-width="6" fill="none" opacity=".8"/>`; }).join('');
    s += `<circle class="rw-pulse" cx="100" cy="125" r="78" fill="url(#mg${uid})" opacity=".7"/>`;
  }
  s += `<ellipse cx="100" cy="207" rx="${st === 1 ? 34 : 40}" ry="6" fill="#3d2b4f" opacity=".14"/>`;
  s += `<g transform="translate(100 214) scale(${sc}) translate(-100 -214)"><g transform="translate(0 12)">`;

  if (st >= 4) {
    s += rwSparkle(34, 62, 7, '#fff') + rwSparkle(168, 96, 6, A) + rwSparkle(40, 150, 5, A) + rwSparkle(164, 170, 7, '#fff');
  }

  // ── Dos : ailes, cape, queue ───────────────────────────────────────────────
  if (st >= 2) {
    const big = st >= 5 ? 1.6 : st >= 4 ? 1.3 : 1;
    if (st >= 5 && (sp === 'unicorn' || sp === 'axolotl')) {
      s += rwMagicWings(RW_WING_FEATHER, 76, 130, 1.25, `fill="#fff" stroke="${RW_MAGIC_GOLD}" stroke-width="2.5" stroke-linejoin="round"`);
    }
    if (sp === 'dragon') {
      s += rwMagicWings(RW_WING_BAT, 74, 132, big,
        `fill="${rwShade(A, 0.45)}" stroke="${st >= 5 ? RW_MAGIC_GOLD : AK}" stroke-width="${2.5 / big}" stroke-linejoin="round"`);
    }
    if (sp === 'cat') {
      const wing = `<g transform="translate(76 134) scale(${big})"><ellipse cx="-18" cy="-14" rx="20" ry="11" transform="rotate(-30 -18 -14)"/>` +
        `<ellipse cx="-13" cy="5" rx="13" ry="8" transform="rotate(20 -13 5)"/></g>`;
      const attrs = `fill="${A}" fill-opacity=".38" stroke="${st >= 5 ? RW_MAGIC_GOLD : A}" stroke-width="${2 / big}"`;
      s += `<g ${attrs}>${wing}</g><g ${attrs} transform="translate(200 0) scale(-1 1)">${wing}</g>`;
    }
    if (acc.starcape) {
      s += `<path d="M72 124 L128 124 L150 186 Q100 196 50 186 Z" fill="#6c5ce7" stroke="#4a3cb8" stroke-width="2.5" stroke-linejoin="round"/>` +
        [[64, 172], [84, 150], [120, 160], [136, 178], [100, 180]].map(([x, y]) => `<polygon points="${rwStarPts(x, y, 4)}" fill="#fff6c2"/>`).join('');
    }
    // queue
    if (sp === 'unicorn') {
      s += [[134, 172, 10], [145, 161, 9], [151, 148, 8]].concat(st >= 4 ? [[153, 135, 7]] : [])
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${A}" stroke="${AK}" stroke-width="2"/>`).join('');
    }
    if (sp === 'dragon') {
      s += `<path d="M124 170 Q152 180 160 158" stroke="${K}" stroke-width="15" fill="none" stroke-linecap="round"/>` +
        `<path d="M124 170 Q152 180 160 158" stroke="${B}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        `<path d="M160 144 L171 158 L160 167 L150 157 Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    if (sp === 'cat') {
      s += `<path d="M126 174 Q162 176 156 142 Q153 128 144 131" stroke="${K}" stroke-width="13" fill="none" stroke-linecap="round"/>` +
        `<path d="M126 174 Q162 176 156 142 Q153 128 144 131" stroke="${B}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
        `<circle cx="144" cy="131" r="6" fill="${A}" stroke="${AK}" stroke-width="2"/>`;
    }
    if (sp === 'axolotl') {
      s += `<path d="M124 168 Q162 178 170 148 Q150 160 126 154 Z" fill="${B}" ${line}/>` +
        `<path d="M132 166 Q158 170 164 154" stroke="${A}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
    }

    // ── Corps ────────────────────────────────────────────────────────────────
    s += `<ellipse cx="100" cy="150" rx="31" ry="33" fill="${B}" ${line}/>` +
      `<ellipse cx="100" cy="157" rx="19" ry="20" fill="${L}"/>`;
    if (sp === 'dragon') s += `<path d="M88 146 H112 M86 156 H114 M88 166 H112" stroke="${rwShade(B, -0.12)}" stroke-width="2.2" stroke-linecap="round"/>`;
    s += st >= 5 ? `<polygon points="${rwStarPts(100, 154, 10)}" fill="${RW_MAGIC_GOLD}" stroke="#e0a800" stroke-width="1.5"/>`
                 : `<path d="${rwHeartPath(100, 153, 0.8)}" fill="${A}"/>`;
    s += [86, 114].map(x => `<ellipse cx="${x}" cy="184" rx="11" ry="7" fill="${B}" ${line}/><ellipse cx="${x}" cy="185" rx="5" ry="3" fill="${L}"/>`).join('');
    if (st >= 3) {
      s += `<ellipse cx="72" cy="146" rx="8" ry="12" transform="rotate(25 72 146)" fill="${B}" ${line}/>` +
        `<ellipse cx="128" cy="146" rx="8" ry="12" transform="rotate(-25 128 146)" fill="${B}" ${line}/>`;
    }
  }

  // ── Tête (posée dans l'œuf au niveau 1) ────────────────────────────────────
  s += `<g transform="translate(0 ${st === 1 ? 36 : 0})">`;
  if (sp === 'unicorn') {
    s += [[62, 74, 10], [60, 92, 9], [66, 107, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${A}" stroke="${AK}" stroke-width="2"/>`).join('');
    s += [68, 132].map(x => { const d = x < 100 ? 1 : -1;
      return `<path d="M${x} 64 L${x + 4 * d} 34 L${x + 22 * d} 52 Z" fill="${B}" ${line}/><path d="M${x + 5 * d} 56 L${x + 7 * d} 42 L${x + 16 * d} 52 Z" fill="#ffc2d9"/>`; }).join('');
  }
  if (sp === 'dragon') {
    s += [1, -1].map(d => { const x = 100 - 24 * d;
      return `<path d="M${x} 56 Q${x - 10 * d} 34 ${x - 15 * d} 26 Q${x + 6 * d} 34 ${x + 12 * d} 50 Z" fill="#fff4d6" ${line}/>`; }).join('');
  }
  if (sp === 'cat') {
    s += [62, 138].map(x => { const d = x < 100 ? 1 : -1;
      return `<path d="M${x} 70 L${x + 2 * d} 32 L${x + 30 * d} 52 Z" fill="${B}" ${line}/><path d="M${x + 6 * d} 60 L${x + 7 * d} 42 L${x + 21 * d} 53 Z" fill="#ffc2d9"/>`; }).join('');
  }
  if (sp === 'axolotl') {
    const gk = st >= 4 ? 1.25 : 1;
    s += [[52, 64, -35], [46, 82, 0], [52, 100, 35]].map(([x, y, a]) => [[x, a], [200 - x, -a]].map(([gx, ga]) =>
      `<ellipse cx="${gx}" cy="${y}" rx="${13 * gk}" ry="${6 * gk}" transform="rotate(${ga} ${gx} ${y})" fill="${A}" stroke="${AK}" stroke-width="2"/>`).join('')).join('');
  }
  s += `<ellipse cx="100" cy="${hy}" rx="${S.rx}" ry="${S.ry}" fill="${B}" ${line}/>` +
    `<path d="M${100 - S.rx * 0.55} ${top + 12} Q${100 - S.rx * 0.2} ${top + 4} ${100 + S.rx * 0.1} ${top + 4}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`;
  if (sp === 'unicorn') {
    s += `<path d="M92 50 L100 14 L108 50 Z" fill="#fff3b0" stroke="#e0b100" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M94 42 L106 38 M96 31 L104 28" stroke="#e0b100" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="89" cy="50" r="9" fill="${A}" stroke="${AK}" stroke-width="2"/><circle cx="102" cy="48" r="8" fill="${A}" stroke="${AK}" stroke-width="2"/>`;
    if (st >= 4) s += rwSparkle(100, 10, 6, RW_MAGIC_GOLD);
  }
  if (sp === 'dragon') {
    s += `<path d="M90 48 L95 37 L100 46 L105 35 L110 46" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  if (sp === 'cat') s += `<polygon points="${rwStarPts(100, 60, 5)}" fill="${A}"/>`;
  if (sp === 'axolotl') s += [[86, 56], [100, 52], [114, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${L}"/>`).join('');

  // visage
  const ey = 84, ex = S.ex;
  const eye = x => `<ellipse cx="${x}" cy="${ey}" rx="7.5" ry="9.5" fill="${E}"/>` +
    `<ellipse cx="${x}" cy="${ey + 4.5}" rx="4.5" ry="3" fill="${rwShade(E, 0.4)}" opacity=".7"/>` +
    `<circle cx="${x - 2.6}" cy="${ey - 3.6}" r="3.2" fill="#fff"/><circle cx="${x + 2.6}" cy="${ey + 2}" r="1.5" fill="#fff"/>`;
  s += eye(100 - ex) + eye(100 + ex) +
    [100 - ex - 12, 100 + ex + 12].map(x => `<ellipse cx="${x}" cy="96" rx="7.5" ry="4.5" fill="#ff8fb1" opacity=".55"/>`).join('');
  const mouth = sp === 'axolotl' ? 'M88 95 Q100 105 112 95'
              : sp === 'cat'     ? 'M94 96 Q97 100 100 96 Q103 100 106 96'
              : 'M94 96 Q100 102 106 96';
  s += `<path d="${mouth}" stroke="${E}" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (sp === 'dragon') s += `<path d="M97 97.5 L99 101.5 L101 97.8 Z" fill="#fff"/><circle cx="96" cy="91" r="1.3" fill="${K}"/><circle cx="104" cy="91" r="1.3" fill="${K}"/>`;
  if (sp === 'cat') s += [[64, 90, 48, 86], [64, 95, 48, 97], [136, 90, 152, 86], [136, 95, 152, 97]]
    .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`).join('');

  // accessoires de tête
  if (acc.flowers) {
    const cols = ['#ffffff', '#ffc2dc', '#fff3a6', '#c8f2dc', '#d8ccff'];
    [-62, -31, 0, 31, 62].forEach((deg, i) => {
      const a = deg * Math.PI / 180, x = 100 + (S.rx - 3) * Math.sin(a), y = hy - (S.ry - 2) * Math.cos(a);
      s += [0, 72, 144, 216, 288].map(p => { const pa = p * Math.PI / 180;
        return `<circle cx="${(x + 4.2 * Math.cos(pa)).toFixed(1)}" cy="${(y + 4.2 * Math.sin(pa)).toFixed(1)}" r="3.6" fill="${cols[i]}" stroke="${K}" stroke-width=".8"/>`; }).join('') +
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="${RW_MAGIC_GOLD}"/>`;
    });
  }
  if (acc.bow) {
    const bx = 100 + S.rx * 0.62, by = top + 10;
    s += `<path d="M${bx} ${by} L${bx - 14} ${by - 10} Q${bx - 18} ${by} ${bx - 14} ${by + 10} Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M${bx} ${by} L${bx + 14} ${by - 10} Q${bx + 18} ${by} ${bx + 14} ${by + 10} Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="${bx}" cy="${by}" r="5" fill="${rwShade(A, 0.3)}" stroke="${AK}" stroke-width="2"/>`;
  }
  if (acc.hearts) {
    s += [100 - ex, 100 + ex].map(x => `<path d="${rwHeartPath(x, ey, 1.35)}" fill="#ff5c9a" fill-opacity=".85" stroke="#b8336b" stroke-width="2"/>`).join('') +
      `<path d="M${100 - ex + 8} ${ey - 4} Q100 ${ey - 9} ${100 + ex - 8} ${ey - 4}" stroke="#b8336b" stroke-width="2" fill="none"/>` +
      `<circle cx="${100 - ex - 5}" cy="${ey - 5}" r="2.2" fill="#fff" opacity=".8"/><circle cx="${100 + ex - 5}" cy="${ey - 5}" r="2.2" fill="#fff" opacity=".8"/>`;
  }
  s += `</g>`;

  // œuf (niveau 1) : coquille par-dessus la tête
  if (st === 1) {
    s += `<path d="M58 140 L68 131 L78 141 L89 131 L100 141 L111 131 L122 141 L132 131 L142 140 C144 172 126 194 100 194 C74 194 56 172 58 140 Z" fill="#fffaf3" ${line}/>` +
      [[76, 160, 7], [118, 156, 6], [98, 178, 8], [130, 176, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${B}" opacity=".9"/>`).join('');
  }

  if (acc.bubble) {
    const [cx, cy, rx, ry] = st === 1 ? [100, 150, 60, 62] : [100, 116, 84, 100];
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${A}" fill-opacity=".08" stroke="${A}" stroke-width="2" opacity=".75"/>` +
      `<path d="M${cx - rx * 0.72} ${cy - ry * 0.45} Q${cx - rx * 0.6} ${cy - ry * 0.85} ${cx - rx * 0.2} ${cy - ry * 0.95}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  }
  if (acc.balloon && st >= 2) {
    s += `<g class="rw-dro"><path d="M70 150 Q52 128 42 104" stroke="${K}" stroke-width="1.5" fill="none"/>` +
      `<path d="${rwHeartPath(40, 84, 2.4)}" fill="${A}" stroke="${AK}" stroke-width="2"/>` +
      `<path d="M30 74 Q32 68 38 68" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
  }
  if (acc.buddy && st >= 2) {
    s += `<g class="rw-dro"><polygon points="${rwStarPts(162, 48, 15)}" fill="#ffe27a" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="158" cy="48" r="1.8" fill="#5a3d1e"/><circle cx="166" cy="48" r="1.8" fill="#5a3d1e"/>` +
      `<path d="M159.5 52 Q162 54.5 164.5 52" stroke="#5a3d1e" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      rwSparkle(180, 34, 4, '#fff') + `</g>`;
  }
  s += `</g></g></svg>`;
  return s;
}

function rwMagicBadgeSvg(b, on) {
  const c = on ? '#ffb3d9' : '#ddd5e4', c2 = on ? '#fff3fa' : '#f3eff6', ink = on ? '#7a3f9e' : '#b3a8bf';
  const petals = Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI / 5;
    return `<circle cx="${(32 + 21 * Math.cos(a)).toFixed(1)}" cy="${(32 + 21 * Math.sin(a)).toFixed(1)}" r="9" fill="${c}"/>`;
  }).join('');
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${petals}<circle cx="32" cy="32" r="21" fill="${c}"/>` +
    `<circle cx="32" cy="32" r="17" fill="${c2}"/>${rwBadgeGlyph(b, ink)}</svg>`;
}
