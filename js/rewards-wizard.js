/* ── RÉCOMPENSES : DESSIN DES SORCIERS ET SORCIÈRES ──────────────────────────
   Univers « sorcellerie », pendant de rewards-robot.js : mêmes entrées (modèle,
   niveau 1 à 5, couleurs, accessoires), même cadre 200×240, sol vers y=206.
   Couleurs : body = robe et chapeau, accent = détails (étoiles, boucle, baguette),
   hair = cheveux, skin = peau.
   Niveau 1 = novice tête nue avec une brindille, 2 = chapeau et baguette,
   3 = ceinture et robe étoilée, 4 = galon, baguette lumineuse et étincelles,
   5 = bâton à cristal, cercle magique et aura.
   Utilise rwShade et rwStarPts (rewards-robot.js). Logique : rewards.js.
   ──────────────────────────────────────────────────────────────────────────── */

const RW_WIZARD_SPECIES = {
  witch:  { label: 'Sorcière' },
  wizard: { label: 'Sorcier' },
  mage:   { label: 'Mage' },
  druid:  { label: 'Druide' },
};

const RW_WIZ_GOLD = '#ffd45c';
const RW_WIZ_EYE = '#2b2238';

function rwWizSparkle(x, y, r, fill) {
  return `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${fill}"/>`;
}

function rwWizardSvg(o) {
  const { species: sp, stage: st, body: B, accent: A, hair: H, skin: P, acc, uid } = o;
  const S = RW_WIZARD_SPECIES[sp];
  const K = rwShade(B, -0.45), HK = rwShade(H, -0.35), PK = rwShade(P, -0.3), AK = rwShade(A, -0.35);
  const line = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const sc = [0.78, 0.85, 0.92, 0.98, 1][st - 1];

  let s = `<svg viewBox="0 0 200 240" role="img" aria-label="${S.label}"><defs>` +
    `<radialGradient id="wz${uid}"><stop offset="0" stop-color="${A}" stop-opacity=".6"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient></defs>`;
  if (st >= 5) s += `<circle class="rw-pulse" cx="100" cy="120" r="96" fill="url(#wz${uid})"/>`;
  s += `<ellipse cx="100" cy="207" rx="40" ry="6" fill="#000" opacity=".22"/>`;
  s += `<g transform="translate(100 214) scale(${sc}) translate(-100 -214)">`;
  if (st >= 5) {
    s += `<ellipse cx="100" cy="205" rx="66" ry="11" fill="none" stroke="${A}" stroke-width="2.5" opacity=".9"/>` +
      `<ellipse cx="100" cy="205" rx="52" ry="8" fill="none" stroke="${A}" stroke-width="1.5" stroke-dasharray="4 5" opacity=".9"/>` +
      [40, 70, 130, 160].map(x => `<circle cx="${x}" cy="207" r="2.2" fill="${A}"/>`).join('');
  }
  if (st >= 4) s += rwWizSparkle(36, 70, 7, '#fff') + rwWizSparkle(170, 92, 6, A) + rwWizSparkle(44, 150, 5, A) + rwWizSparkle(166, 168, 6, '#fff');

  // ── Derrière : balai, cape ─────────────────────────────────────────────────
  if (acc.broom) {
    s += `<line x1="44" y1="112" x2="146" y2="194" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M140 186 L170 196 L160 212 L134 196 Z" fill="#e2b45c" stroke="#9a6b2a" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M142 190 L138 196" stroke="#9a6b2a" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (acc.starcape) {
    s += `<path d="M76 124 L124 124 L150 200 Q100 210 50 200 Z" fill="#2b2f6b" stroke="#1b1d4a" stroke-width="2.5" stroke-linejoin="round"/>` +
      [[60, 186], [70, 160], [132, 166], [142, 190]].map(([x, y]) => `<polygon points="${rwStarPts(x, y, 4)}" fill="#fff3b0"/>`).join('');
  }

  // cheveux longs / capuche / boucles : derrière la tête
  if (sp === 'witch') s += `<path d="M64 92 Q58 140 74 152 L126 152 Q142 140 136 92 Z" fill="${H}" stroke="${HK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (sp === 'druid') s += [[62, 84, 12], [60, 104, 11], [66, 122, 10], [138, 84, 12], [140, 104, 11], [134, 122, 10]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H}" stroke="${HK}" stroke-width="2.5"/>`).join('');
  if (sp === 'mage' && st >= 2) s += `<path d="M56 104 Q52 52 100 44 Q148 52 144 104 Q142 130 100 134 Q58 130 56 104 Z" fill="${B}" ${line}/>`;

  // ── Corps : bottines, robe, ceinture, galon ─────────────────────────────────
  s += [88, 112].map(x => `<ellipse cx="${x}" cy="202" rx="10" ry="5.5" fill="#3a2a3a"/>`).join('');
  s += `<path d="M80 120 Q70 160 62 198 Q100 207 138 198 Q130 160 120 120 Z" fill="${B}" ${line}/>`;
  if (st >= 3) {
    s += `<path d="M73 152 Q100 158 127 152 L128 159 Q100 165 72 159 Z" fill="${A}" stroke="${AK}" stroke-width="1.5"/>` +
      `<rect x="95" y="151" width="10" height="10" rx="2" fill="none" stroke="${AK}" stroke-width="2"/>` +
      [[84, 178], [116, 186], [106, 136], [90, 140]].map(([x, y]) => `<polygon points="${rwStarPts(x, y, 4)}" fill="${A}" opacity=".9"/>`).join('');
  }
  if (st >= 4) s += `<path d="M63 196 Q100 205 137 196" stroke="${st >= 5 ? RW_WIZ_GOLD : A}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (st >= 5) s += `<polygon points="${rwStarPts(100, 176, 9)}" fill="${RW_WIZ_GOLD}" stroke="#c99a1c" stroke-width="1.5"/>`;

  // bras gauche (manche évasée) et main
  s += `<path d="M84 126 Q66 138 60 160 L76 164 Q80 148 90 138 Z" fill="${B}" ${line}/>` +
    `<circle cx="68" cy="165" r="6" fill="${P}" stroke="${PK}" stroke-width="2"/>`;

  // écharpe (sur la robe, sous la tête)
  if (acc.scarf) {
    const L2 = rwShade(B, 0.55);
    s += `<path d="M76 122 Q100 134 124 122 L125 131 Q100 143 75 131 Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M84 126 L88 136 M96 129 L98 139 M108 128 L106 138 M118 125 L114 135" stroke="${L2}" stroke-width="3"/>` +
      `<path d="M110 132 L114 162 L124 160 L120 130 Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M112 142 L121 141 M113 151 L122 150" stroke="${L2}" stroke-width="3"/>`;
  }

  // ── Tête ────────────────────────────────────────────────────────────────────
  s += `<circle cx="100" cy="94" r="34" fill="${P}" stroke="${PK}" stroke-width="2.5"/>`;
  const ey = 99;
  const eye = x => `<ellipse cx="${x}" cy="${ey}" rx="6" ry="7.5" fill="${RW_WIZ_EYE}"/>` +
    `<circle cx="${x - 2}" cy="${ey - 3}" r="2.6" fill="#fff"/><circle cx="${x + 2}" cy="${ey + 2.2}" r="1.2" fill="#fff"/>`;
  s += eye(88) + eye(112) +
    `<ellipse cx="78" cy="110" rx="6.5" ry="4" fill="#ff8fa8" opacity=".5"/><ellipse cx="122" cy="110" rx="6.5" ry="4" fill="#ff8fa8" opacity=".5"/>` +
    `<path d="M95 112 Q100 117 105 112" stroke="${RW_WIZ_EYE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (acc.glasses) {
    s += [88, 112].map(x => `<circle cx="${x}" cy="${ey}" r="9.5" fill="#fff" fill-opacity=".18" stroke="#4a3426" stroke-width="2.5"/>`).join('') +
      `<path d="M97.5 98 Q100 95 102.5 98" stroke="#4a3426" stroke-width="2.5" fill="none"/>`;
  }

  // cheveux de devant
  const fringe = {
    witch:  'M66 90 Q68 58 100 56 Q132 58 134 90 Q124 74 110 78 Q102 68 92 78 Q78 74 66 90 Z',
    wizard: 'M66 92 Q64 60 100 56 Q136 60 134 92 L126 78 L118 86 L110 72 L100 82 L90 72 L82 86 L74 78 Z',
    mage:   'M68 88 Q70 60 100 58 Q130 60 132 88 Q118 74 100 78 Q82 74 68 88 Z',
    druid:  '',
  }[sp];
  if (fringe) s += `<path d="${fringe}" fill="${H}" stroke="${HK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (sp === 'druid') s += [[72, 76, 10], [84, 64, 11], [100, 59, 11], [116, 64, 11], [128, 76, 10]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H}" stroke="${HK}" stroke-width="2.5"/>`).join('');

  // ── Couvre-chef (dès le niveau 2) ──────────────────────────────────────────
  if (st >= 2) {
    if (sp === 'witch' || sp === 'wizard') {
      const tip = sp === 'witch' ? 'M74 64 L94 16 Q102 2 118 10 Q106 12 104 22 L126 64 Z' : 'M74 64 L100 8 L126 64 Z';
      s += `<ellipse cx="100" cy="64" rx="48" ry="10" fill="${B}" ${line}/>` +
        `<path d="${tip}" fill="${B}" ${line}/>` +
        `<path d="M77 58 Q100 64 123 58 L125 52 Q100 58 75 52 Z" fill="${A}" stroke="${AK}" stroke-width="1.5"/>`;
      if (sp === 'witch') s += `<rect x="94" y="51" width="12" height="10" rx="2" fill="none" stroke="${RW_WIZ_GOLD}" stroke-width="2.5"/>`;
      else s += `<polygon points="${rwStarPts(96, 36, 5)}" fill="${A}"/><polygon points="${rwStarPts(108, 24, 3.5)}" fill="${A}"/><circle cx="90" cy="46" r="2" fill="${A}"/>`;
    }
    if (sp === 'mage') {
      s += `<path d="M62 92 Q64 56 100 52 Q136 56 138 92" fill="none" stroke="${K}" stroke-width="3"/>` +
        `<path d="M66 90 Q68 60 100 56 Q132 60 134 90" fill="none" stroke="${A}" stroke-width="2.5"/>` +
        `<path d="M100 42 Q92 46 96 52 Q101 47 106 51 Q106 44 100 42 Z" fill="${A}"/>`;
    }
    if (sp === 'druid') {
      s += [[-60, 'l'], [-30, 'r'], [0, 'l'], [30, 'r'], [60, 'l']].map(([deg]) => {
        const a = deg * Math.PI / 180, x = 100 + 36 * Math.sin(a), y = 92 - 36 * Math.cos(a);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="4.5" transform="rotate(${deg + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#6cc46a" stroke="#3f8a3d" stroke-width="1.5"/>`;
      }).join('') +
        [0, 72, 144, 216, 288].map(p => { const pa = p * Math.PI / 180;
          return `<circle cx="${(100 + 4 * Math.cos(pa)).toFixed(1)}" cy="${(56 + 4 * Math.sin(pa)).toFixed(1)}" r="3.4" fill="${A}"/>`; }).join('') +
        `<circle cx="100" cy="56" r="2.4" fill="#fff"/>`;
    }
  }

  // ── Bras droit levé, baguette (brindille, baguette, bâton) ─────────────────
  if (st >= 5) {
    s += `<line x1="140" y1="204" x2="146" y2="96" stroke="#7a4a2a" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="146" cy="86" r="14" fill="${A}" opacity=".35"/>` +
      `<polygon points="146,72 154,86 146,100 138,86" fill="${A}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>` +
      rwWizSparkle(160, 70, 5, '#fff');
  } else {
    const wc = st === 1 ? '#8a6a3a' : '#5a3a22';
    s += `<line x1="137" y1="160" x2="158" y2="118" stroke="${wc}" stroke-width="${st === 1 ? 3 : 4}" stroke-linecap="round"/>`;
    if (st === 1) s += `<path d="M150 134 L156 130" stroke="${wc}" stroke-width="2" stroke-linecap="round"/>`;
    if (st >= 2) s += `<line x1="153" y1="128" x2="158" y2="118" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
    if (st >= 3) s += `<polygon points="${rwStarPts(160, 114, st >= 4 ? 8 : 6)}" fill="${A}" stroke="#fff" stroke-width="1"/>`;
    if (st >= 4) s += `<circle cx="160" cy="114" r="14" fill="${A}" opacity=".25"/>` + rwWizSparkle(174, 104, 4, '#fff') + rwWizSparkle(150, 100, 3, A);
  }
  s += `<path d="M116 126 Q134 132 142 150 L130 156 Q124 144 110 138 Z" fill="${B}" ${line}/>` +
    `<circle cx="${st >= 5 ? 141 : 138}" cy="${st >= 5 ? 150 : 155}" r="6" fill="${P}" stroke="${PK}" stroke-width="2"/>`;

  // ── Compagnons et objets ───────────────────────────────────────────────────
  if (acc.cat) {
    s += `<path d="M36 204 Q22 200 26 186" stroke="#2a2430" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="44" cy="196" rx="12" ry="10" fill="#2a2430"/>` +
      `<circle cx="44" cy="180" r="10" fill="#2a2430"/>` +
      `<path d="M35 176 L36 164 L43 172 Z M53 176 L52 164 L45 172 Z" fill="#2a2430"/>` +
      `<ellipse cx="40" cy="180" rx="2.4" ry="3" fill="#ffd45c"/><ellipse cx="48" cy="180" rx="2.4" ry="3" fill="#ffd45c"/>` +
      `<circle cx="40" cy="181" r="1" fill="#2a2430"/><circle cx="48" cy="181" r="1" fill="#2a2430"/>`;
  }
  if (acc.book) {
    s += `<g class="rw-dro"><g transform="rotate(-12 38 108)">` +
      `<rect x="20" y="94" width="36" height="28" rx="3" fill="#8a3b2e" stroke="#5a2219" stroke-width="2"/>` +
      `<rect x="24" y="97" width="30" height="22" rx="2" fill="#fff8e6"/>` +
      `<line x1="39" y1="97" x2="39" y2="119" stroke="#d8c9a8" stroke-width="1.5"/>` +
      `<path d="M27 103 H36 M27 108 H35 M27 113 H36 M42 103 H51 M42 108 H50" stroke="#c4b48f" stroke-width="1.5"/></g>` +
      rwWizSparkle(22, 86, 4, A) + rwWizSparkle(58, 92, 3, '#fff') + `</g>`;
  }
  if (acc.owl) {
    s += `<g class="rw-dro"><ellipse cx="166" cy="54" rx="14" ry="16" fill="#9a6b45" stroke="#6a4428" stroke-width="2"/>` +
      `<ellipse cx="166" cy="60" rx="8" ry="9" fill="#e8cfa8"/>` +
      `<path d="M154 42 L156 34 L161 40 Z M178 42 L176 34 L171 40 Z" fill="#9a6b45" stroke="#6a4428" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<circle cx="160.5" cy="48" r="5" fill="#fff"/><circle cx="171.5" cy="48" r="5" fill="#fff"/>` +
      `<circle cx="160.5" cy="48" r="2.4" fill="#2a1a10"/><circle cx="171.5" cy="48" r="2.4" fill="#2a1a10"/>` +
      `<path d="M164 53 L168 53 L166 57 Z" fill="#f2a43a"/></g>`;
  }
  s += `</g></svg>`;
  return s;
}

// Badge en sceau étoilé (or quand gagné)
function rwWizardBadgeSvg(b, on) {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 12, r = i % 2 ? 26 : 30;
    return (32 + r * Math.cos(a)).toFixed(1) + ',' + (32 + r * Math.sin(a)).toFixed(1);
  }).join(' ');
  const c = on ? RW_WIZ_GOLD : '#5a5468', c2 = on ? '#4b2f8a' : '#3a3446', ink = on ? '#ffe9a8' : '#8a8496';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="${pts}" fill="${c}"/>` +
    `<circle cx="32" cy="32" r="22" fill="${c2}"/><circle cx="32" cy="32" r="22" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="2 3"/>` +
    rwBadgeGlyph(b, ink) + `</svg>`;
}
