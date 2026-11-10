/* ── RÉCOMPENSES : ACCESSOIRES DE SUPER-PATATE (thème « chevalier ») ─────────
   Retourne des morceaux de SVG par emplacement, insérés par rwVeggieSvg :
   `back` derrière la cape (étendard), `mid` entre la cape et le corps (cheval-bâton,
   qui passe entre les jambes), `face` par-dessus le visage (casque, plume),
   `hand` avant les bras (épée-frite, tenue par le poing droit), `arm` après les bras
   (bouclier tenu par la main gauche), `front` devant tout (petit cochon et sa couronne).
   noCrown : le casque (ou la couronne posée sur la patate) remplace la couronne de
   feuilles du niveau 5. Les touches sont reliées aux badges dans
   RW_THEMES.veggie.speciesAccs.potato (rewards.js) ; CR = couleur du blason.
   Repères (viewBox 200×240, avant mise à l'échelle du niveau) : sommet de la patate
   vers (95,103), pousse de (94,108), yeux à y=134, main gauche en (36,162),
   poing droit levé en (168,124) (niveau 1 : bras baissé, (158,162)), sol à y=206.
   ──────────────────────────────────────────────────────────────────────────── */

function rwPotatoAccs({ acc, A, AK, CR, st, fist }) {
  let back = '', mid = '', face = '', hand = '', arm = '', front = '';
  const CRK = rwShade(CR, -0.4), gold = RW_VEG_GOLD, goldK = '#c99a1c';
  // bande du blason : dorée, blanche si le blason est lui-même doré
  const band = CR.toLowerCase() === gold ? '#fff' : gold;
  const crown = (x, y, w) => `<path d="M${x - w / 2} ${y} L${x - w / 2} ${y - w * 0.55} L${x - w / 4} ${y - w * 0.3} L${x} ${y - w * 0.7} L${x + w / 4} ${y - w * 0.3} L${x + w / 2} ${y - w * 0.55} L${x + w / 2} ${y} Z" ` +
    `fill="${gold}" stroke="${goldK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<circle cx="${x}" cy="${y - w * 0.7}" r="${(w * 0.08).toFixed(1)}" fill="#e8354a"/>`;

  if (acc.banner) {
    // étendard planté à gauche, flamme à deux pointes couleur du blason, étoile dorée
    back += `<line x1="34" y1="206" x2="34" y2="40" stroke="#8a5a32" stroke-width="4.5" stroke-linecap="round"/>` +
      `<circle cx="34" cy="37" r="4.5" fill="${gold}" stroke="${goldK}" stroke-width="1.5"/>` +
      `<path d="M36 44 Q56 38 78 46 L66 64 L78 82 Q56 76 36 82 Z" fill="${CR}" stroke="${CRK}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M36 52 Q56 46 72 53" stroke="${band}" stroke-width="2" fill="none" opacity=".8"/>` +
      `<polygon points="${rwStarPts(53, 64, 7)}" fill="${band}"/>`;
  }

  if (acc.horse) {
    // cheval-bâton : le bâton passe entre les jambes, la tête dépasse à gauche
    mid += `<line x1="150" y1="206" x2="44" y2="150" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/>` +
      `<g transform="translate(44 150) scale(1.25)">` +
      `<path d="M4 2 L-2 -24 Q-4 -34 -14 -34 L-30 -29 Q-37 -27 -35 -20 L-33 -16 Q-22 -15 -14 -12 L-8 4 Z" fill="#f3ead8" stroke="#8a7a62" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M-2 -24 Q4 -18 3 -8 Q6 -16 3 -24 Q2 -32 -6 -36 Q0 -30 -2 -24 Z M-6 -36 L-3 -42 L-10 -36 Z" fill="#7a4a26" stroke="#4a2b14" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M-6 -36 Q-2 -26 2 -14 Q-2 -26 -6 -36" stroke="#7a4a26" stroke-width="6" fill="none" stroke-linecap="round"/>` +
      `<path d="M-12 -33 L-9 -42 L-6 -33 Z" fill="#f3ead8" stroke="#8a7a62" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="-17" cy="-27" r="2.2" fill="${RW_VEG_EYE}"/><circle cx="-31" cy="-21" r="1.4" fill="#8a7a62"/>` +
      `<path d="M-11 -31 L-14 -14 M-33 -18 L-14 -20" stroke="#e8354a" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
  }

  if (acc.helmet) {
    // casque : casserole retournée, manche vers la gauche
    face += `<path d="M58 106 L24 98 Q20 97 21 101 L22 104 Q23 107 27 107 L58 112 Z" fill="#2b2533" stroke="#15121b" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="27" cy="102" r="2" fill="#6b7480"/>` +
      `<path d="M64 112 L67 86 Q68 80 74 80 L126 80 Q132 80 133 86 L136 112 Z" fill="#c9d1d9" stroke="#6b7480" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M76 86 L74 106" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>` +
      `<rect x="56" y="107" width="88" height="10" rx="5" fill="#aeb7c2" stroke="#6b7480" stroke-width="2.5"/>`;
  }

  if (acc.plume) {
    // plume de chevalier, couleur de la cape : sur le casque, sinon plantée dans la pousse
    const [px, py] = acc.helmet ? [120, 82] : [102, 102];
    face += `<g transform="translate(${px} ${py})"><path d="M0 0 C-4 -20 10 -40 32 -50 C30 -30 18 -10 0 0 Z" fill="${A}" stroke="${AK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M0 0 Q12 -26 30 -48" stroke="${AK}" stroke-width="1.6" fill="none"/>` +
      `<path d="M10 -20 L4 -24 M16 -30 L10 -36 M14 -16 L20 -20 M20 -26 L26 -30" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>` +
      `<circle r="3.5" fill="${gold}" stroke="${goldK}" stroke-width="1.2"/></g>`;
  }

  // couronne sans le cochon : posée sur la tête de la patate (sur le casque s'il est porté)
  if (acc.crown && !acc.pig) face += acc.helmet ? crown(100, 80, 22) : crown(96, 104, 22);

  if (acc.sword) {
    // épée-frite géante dans le poing droit : lame en frite, garde rouge ketchup
    const [fx, fy] = fist;
    hand += `<rect x="${fx - 3}" y="${fy + 4}" width="6" height="14" rx="2" fill="#8a5a32" stroke="#4a2b14" stroke-width="1.5"/>` +
      `<circle cx="${fx}" cy="${fy + 20}" r="4" fill="#d8342c" stroke="#8f1d18" stroke-width="1.5"/>` +
      `<path d="M${fx - 5.5} ${fy - 10} L${fx - 5.5} ${fy - 84} Q${fx} ${fy - 92} ${fx + 5.5} ${fy - 84} L${fx + 5.5} ${fy - 10} Z" fill="#f6c94a" stroke="#c98f1c" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M${fx - 5} ${fy - 80} Q${fx} ${fy - 90} ${fx + 5} ${fy - 80} L${fx + 5} ${fy - 76} Q${fx} ${fy - 82} ${fx - 5} ${fy - 76} Z" fill="#d9952b"/>` +
      `<path d="M${fx - 1.5} ${fy - 18} L${fx - 1.5} ${fy - 70}" stroke="#fff3b0" stroke-width="2" stroke-linecap="round" opacity=".8"/>` +
      `<path d="M${fx + 2} ${fy - 34} L${fx + 3.5} ${fy - 33} M${fx + 1.5} ${fy - 56} L${fx + 3} ${fy - 55}" stroke="#d9952b" stroke-width="1.5" stroke-linecap="round"/>` +
      `<rect x="${fx - 15}" y="${fy - 12}" width="30" height="7" rx="3.5" fill="#d8342c" stroke="#8f1d18" stroke-width="2"/>`;
  }

  if (acc.blason) {
    // bouclier en écu à la main gauche : couleur du blason, bande dorée, étoile et couronne
    arm += `<path d="M12 146 L54 146 L54 166 Q54 188 33 198 Q12 188 12 166 Z" fill="${CR}" stroke="${CRK}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M16 150 L50 150 L50 166 Q50 185 33 194 Q16 185 16 166 Z" fill="none" stroke="${band}" stroke-width="1.6" opacity=".8"/>` +
      `<rect x="13.5" y="163" width="39" height="8" fill="${band}"/>` +
      crown(33, 160, 14) + `<polygon points="${rwStarPts(33, 182, 6.5)}" fill="${band}"/>`;
  }

  if (acc.pig) {
    // petit cochon rose compagnon (et sa couronne)
    // dessiné dans le cadre d'origine (x 144 à 188) puis agrandi et décalé à droite de la patate
    front += `<g class="rw-dro"><g transform="translate(152 203) scale(1.08) translate(-144 -203)"><path d="M182 186 q6 -2 4 -6 q-3 -3 -5 1" stroke="#d0708e" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      [160, 166, 176, 182].map(x => `<rect x="${x - 2.5}" y="193" width="5" height="9" rx="2" fill="#f7a8c0" stroke="#d0708e" stroke-width="1.6"/>`).join('') +
      `<ellipse cx="172" cy="188" rx="15" ry="11" fill="#f7a8c0" stroke="#d0708e" stroke-width="2.2"/>` +
      `<path d="M150 174 L149 165 L157 171 Z M160 172 L163 164 L166 172 Z" fill="#f48fb1" stroke="#d0708e" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="157" cy="182" r="10" fill="#f7a8c0" stroke="#d0708e" stroke-width="2.2"/>` +
      `<ellipse cx="149" cy="185" rx="5" ry="4" fill="#f48fb1" stroke="#d0708e" stroke-width="1.6"/>` +
      `<circle cx="147.5" cy="185" r="1" fill="#a24a66"/><circle cx="150.5" cy="185" r="1" fill="#a24a66"/>` +
      `<circle cx="154" cy="179" r="1.6" fill="${RW_VEG_EYE}"/><circle cx="161" cy="180" r="1.6" fill="${RW_VEG_EYE}"/>` +
      `<ellipse cx="163" cy="186" rx="2.5" ry="1.6" fill="#ff7f9a" opacity=".6"/>` +
      (acc.crown ? crown(157, 172, 14) : '') + `</g></g>`;
  }

  const noCrown = !!acc.helmet || (!!acc.crown && !acc.pig);
  return { back, mid, face, hand, arm, front, noCrown };
}
