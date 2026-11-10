/* ── RÉCOMPENSES : ACCESSOIRES DE SUPER-RADIS (thème « pirate ») ─────────────
   Retourne des morceaux de SVG par emplacement, insérés par rwVeggieSvg :
   `face` sur le visage et la tête (bandeau sur l'œil, foulard, tricorne), `hand` avant
   les bras (sabre en bois dans le poing droit, longue-vue dans la main gauche),
   `front` devant tout (perroquet sur l'épaule gauche et son feu, carte au trésor au sol).
   noMask : le bandeau sur l'œil remplace le bandeau de héros ; noCrown : le tricorne
   remplace la couronne de feuilles du niveau 5. « fire » (perroquet crache du feu)
   dessine aussi le perroquet, même s'il n'est pas équipé à part.
   Les touches sont reliées aux badges dans RW_THEMES.veggie.speciesAccs.radish
   (rewards.js) ; SC = couleur du foulard.
   Repères (viewBox 200×240, avant mise à l'échelle du niveau) : corps = ellipse
   (100,140) rx 49 ry 51 (sommet y=89), fanes partant de (100,92) ; yeux en (86,124) et
   (114,124), bouche à y=140 ; main gauche en (40,150) ; poing droit levé en (164,112)
   (niveau 1 : bras baissé, (154,150)) ; sol à y=206.
   ──────────────────────────────────────────────────────────────────────────── */

function rwRadishAccs({ acc, SC, st, fist, bodyClip }) {
  let face = '', hand = '', front = '';
  const SCK = rwShade(SC, -0.4), gold = RW_VEG_GOLD, goldK = '#c99a1c', ink = '#1d1a28';

  if (acc.scarf) {
    // foulard de pirate noué sur le côté droit, à pois blancs, découpé à la forme de la tête
    face += `<path d="M141 108 L156 116 L152 122 Z M141 108 L150 128 L144 130 Z" fill="${SC}" stroke="${SCK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<g clip-path="${bodyClip}"><path d="M40 70 L160 70 L160 108 Q100 96 40 108 Z" fill="${SC}" stroke="${SCK}" stroke-width="2.5"/>` +
      [[78, 92], [96, 86], [114, 90], [130, 98], [64, 101], [104, 98], [86, 99]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff" opacity=".9"/>`).join('') + `</g>` +
      `<circle cx="142" cy="108" r="4.5" fill="${SC}" stroke="${SCK}" stroke-width="2"/>`;
  }

  if (acc.patch) {
    // bandeau de pirate sur l'œil droit, sangle en travers du front
    face += `<path d="M62 106 L106 118 M122 128 L148 134" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M104 117 Q114 112 124 117 Q126 130 114 134 Q102 130 104 117 Z" fill="${ink}" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M108 120 Q113 117 118 119" stroke="#fff" stroke-width="1.4" fill="none" opacity=".35" stroke-linecap="round"/>`;
  }

  if (acc.hat) {
    // tricorne noir à galon doré et petite tête de mort
    face += `<path d="M58 100 Q64 82 76 86 Q86 60 100 60 Q114 60 124 86 Q136 82 142 100 Q122 92 100 100 Q78 92 58 100 Z" fill="#2b2533" stroke="#15121b" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M60 98 Q78 90 100 97 Q122 90 140 98" stroke="${gold}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<circle cx="100" cy="78" r="5.5" fill="#fff"/><rect x="97" y="81" width="6" height="4" rx="1" fill="#fff"/>` +
      `<circle cx="98" cy="77.5" r="1.4" fill="#2b2533"/><circle cx="102" cy="77.5" r="1.4" fill="#2b2533"/>` +
      `<path d="M92 86 L108 92 M108 86 L92 92" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  }

  if (acc.sabre) {
    // sabre de pirate en bois dans le poing droit : lame courbe, garde ronde
    const [fx, fy] = fist;
    hand += `<rect x="${fx - 2.5}" y="${fy + 4}" width="5" height="13" rx="2" fill="#7a4a26" stroke="#4a2b14" stroke-width="1.4"/>` +
      `<path d="M${fx - 5} ${fy - 10} Q${fx - 8} ${fy - 50} ${fx + 6} ${fy - 82} Q${fx + 2} ${fy - 48} ${fx + 5} ${fy - 10} Z" fill="#d9a066" stroke="#8a5a32" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M${fx - 1} ${fy - 16} Q${fx - 3} ${fy - 44} ${fx + 3} ${fy - 66}" stroke="#b07a42" stroke-width="1.3" fill="none"/>` +
      `<path d="M${fx - 13} ${fy - 6} Q${fx} ${fy - 16} ${fx + 13} ${fy - 6} Q${fx + 14} ${fy + 4} ${fx + 6} ${fy + 10}" stroke="#8a5a32" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<circle cx="${fx}" cy="${fy + 19}" r="3.5" fill="#8a5a32"/>`;
  }

  if (acc.spyglass) {
    // longue-vue dorée dépliée, tenue dans la main gauche, pointée vers le bas à gauche
    hand += `<g transform="translate(40 150) rotate(36)">` +
      `<rect x="-6" y="-6" width="20" height="12" rx="2" fill="#7a4a26" stroke="#4a2b14" stroke-width="1.6"/>` +
      `<rect x="-22" y="-5" width="17" height="10" rx="1.5" fill="${gold}" stroke="${goldK}" stroke-width="1.6"/>` +
      `<rect x="-36" y="-4" width="15" height="8" rx="1.5" fill="${gold}" stroke="${goldK}" stroke-width="1.6"/>` +
      `<rect x="-40" y="-5.5" width="5" height="11" rx="1.5" fill="#c99a1c" stroke="#8a6512" stroke-width="1.4"/>` +
      `<path d="M-20 -2.5 L-8 -2.5" stroke="#fff" stroke-width="1.4" opacity=".6"/></g>`;
  }

  if (acc.map) {
    // carte au trésor dépliée par terre, à droite : chemin en pointillés et croix rouge
    front += `<path d="M146 188 L188 184 L194 202 L150 206 Z" fill="#f3e3c3" stroke="#a07a45" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M146 188 Q142 197 150 206" stroke="#a07a45" stroke-width="2" fill="#e8d1a4"/>` +
      `<path d="M188 184 Q197 192 194 202" stroke="#a07a45" stroke-width="2" fill="#e8d1a4"/>` +
      `<path d="M154 200 Q162 192 170 197 Q176 200 180 193" stroke="#8a5a32" stroke-width="1.6" stroke-dasharray="2.5 2.5" fill="none"/>` +
      `<path d="M181 188 L188 195 M188 188 L181 195" stroke="#e8354a" stroke-width="2.6" stroke-linecap="round"/>`;
  }

  if (acc.parrot || acc.fire) {
    // perroquet copain (vert, pour ressortir sur le radis rouge) sur l'épaule gauche, tourné vers la gauche (il crache du feu avec « fire »)
    const fire = !acc.fire ? '' : `<g class="rw-flick"><path d="M-14 -31 Q-26 -39 -38 -36 Q-31 -32 -34 -28 Q-26 -28 -39 -21 Q-25 -18 -14 -27 Z" fill="#ff8a1f" stroke="#d8342c" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M-14 -30 Q-22 -34 -30 -31 Q-24 -28 -30 -24 Q-20 -24 -14 -28 Z" fill="${gold}"/></g>`;
    front += `<g transform="translate(52 122) scale(1.25)">${fire}` +
      `<path d="M2 -2 L8 14 L2 12 L-1 16 Z" fill="#2f6bd6" stroke="#1d4a9a" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<ellipse cx="0" cy="-12" rx="8.5" ry="13" fill="#4fc04a" stroke="#23702a" stroke-width="2"/>` +
      `<ellipse cx="-3" cy="-9" rx="4" ry="7" fill="#ffd45c" opacity=".85"/>` +
      `<path d="M4 -20 Q12 -10 6 2 Q2 -6 1 -16 Z" fill="#2f6bd6" stroke="#1d4a9a" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="-2" cy="-28" r="7.5" fill="#4fc04a" stroke="#23702a" stroke-width="2"/>` +
      `<path d="M-6 -35 Q-2 -42 3 -36" stroke="#e8354a" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<path d="M-8 -31 Q-15 -31 -15 -26 Q-13 -22 -9 -25 Z" fill="#ffd45c" stroke="#8a6512" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<circle cx="-4" cy="-30" r="2.6" fill="#fff"/><circle cx="-4.6" cy="-30" r="1.4" fill="${ink}"/>` +
      `<path d="M-4 0 L-4 4 M2 0 L2 4" stroke="#8a7f86" stroke-width="2" stroke-linecap="round"/></g>`;
  }

  return { face, hand, front, noMask: !!acc.patch, noCrown: !!acc.hat };
}
