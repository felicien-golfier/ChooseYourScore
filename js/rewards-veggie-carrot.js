/* ── RÉCOMPENSES : ACCESSOIRES DE SUPER-CAROTTE ──────────────────────────────
   Retourne { leaves, chest, belt, face, arm } en SVG, insérés par rwVeggieSvg :
   `leaves` par-dessus les fanes, `chest` sur le torse (remplace l'étoile de héros),
   `belt` après le torse (le ceinturon remplace la ceinture des niveaux 3 à 5),
   `face` sur le visage, `arm` après le bras gauche (qui tient le bouclier).
   Lunettes de soleil, fourchette géante et petits pois copains sont dessinés par
   rwVeggieSvg (même code pour tous les légumes). Les touches sont reliées aux
   badges dans RW_THEMES.veggie.speciesAccs.carrot (rewards.js).
   Repères (viewBox 200×240, avant mise à l'échelle du niveau) : fanes partant de
   (100,88), pointes en (100,46), (79,61) et (121,61) ; yeux à y=114, bouche à
   y=130, torse vers (100,151), ceinture à y=161 ; main gauche en (53,142).
   ──────────────────────────────────────────────────────────────────────────── */

function rwCarrotAccs({ acc, A, AK, st, fy, ax }) {
  let leaves = '', chest = '', belt = '', face = '', arm = '';

  if (acc.sparkle) {
    // fanes scintillantes : nervures dorées sur chaque fane et étincelles qui scintillent autour
    const vein = (deg, len) => `<line x1="100" y1="82" x2="100" y2="${88 - len + 5}" transform="rotate(${deg} 100 88)" stroke="#fff6b8" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`;
    leaves += vein(-38, 34) + vein(38, 34) + vein(0, 42) +
      [[100, 38, 10, '#fff'], [71, 54, 8, RW_VEG_GOLD], [129, 54, 8, RW_VEG_GOLD], [86, 44, 5, '#fff'], [115, 42, 5.5, RW_VEG_GOLD], [60, 72, 5, '#fff'], [140, 72, 5, '#fff']]
        .map(([x, y, r, f]) => `<g class="rw-twinkle">${rwVegSparkle(x, y, r, f)}</g>`).join('');
  }

  if (acc.superS) {
    // grand S de super-héros sur le torse, dans un écusson ovale couleur de la cape
    const S = 'M7 -6 C4 -11 -8 -10 -7 -3 C-6 2 7 -1 7 4 C7 11 -5 11 -8 6';
    chest += `<ellipse cx="100" cy="151" rx="20" ry="15" fill="${A}" stroke="${RW_VEG_GOLD}" stroke-width="3"/>` +
      `<g transform="translate(100 151) scale(1.3)"><path d="${S}" stroke="${AK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
      `<path d="${S}" stroke="${RW_VEG_GOLD}" stroke-width="3.8" fill="none" stroke-linecap="round"/></g>`;
  }

  if (acc.belt) {
    // ceinturon de héros (dès le niveau 1) : cuir, rivets dorés, grosse boucle étoilée, deux poches couleur de la cape
    const y = fy + 49, x1 = 100 - ax - 8, x2 = 100 + ax + 8;
    belt += [74, 126].map(x => `<rect x="${x - 6}" y="${y + 9}" width="12" height="13" rx="3" fill="${A}" stroke="${AK}" stroke-width="2"/>` +
      `<path d="M${x - 6} ${y + 13} L${x + 6} ${y + 13}" stroke="${AK}" stroke-width="1.5"/><circle cx="${x}" cy="${y + 15}" r="1.6" fill="${RW_VEG_GOLD}"/>`).join('') +
      `<path d="M${x1} ${y} Q100 ${y + 7} ${x2} ${y} L${x2} ${y + 12} Q100 ${y + 19} ${x1} ${y + 12} Z" fill="#7a4a26" stroke="#3d2412" stroke-width="2.2" stroke-linejoin="round"/>` +
      [66, 84, 116, 134].map(x => `<circle cx="${x}" cy="${y + 6 + (x < 100 ? (x - x1) : (x2 - x)) * 0.075}" r="2" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width=".8"/>`).join('') +
      `<rect x="89" y="${y}" width="22" height="19" rx="4" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="2"/>` +
      `<rect x="93" y="${y + 3.5}" width="14" height="12" rx="2.5" fill="none" stroke="#c99a1c" stroke-width="1.5"/>` +
      `<polygon points="${rwStarPts(100, y + 10, 5)}" fill="#fff"/>`;
  }

  if (acc.moustache) {
    // moustache en guidon, pointes recourbées
    const y = fy + 10;
    const half = `M100 ${y - 1} C94 ${y - 7} 85 ${y - 6} 81 ${y - 1} C78 ${y + 2} 74 ${y + 1} 73 ${y - 4} C71 ${y + 4} 80 ${y + 8} 89 ${y + 5} C94 ${y + 3} 98 ${y + 3} 100 ${y + 3} Z`;
    face += `<g fill="#5b3418" stroke="#2e1a0b" stroke-width="1.6" stroke-linejoin="round"><path d="${half}"/><path d="${half}" transform="translate(200 0) scale(-1 1)"/></g>` +
      `<path d="M92 ${y - 1} Q86 ${y - 2} 82 ${y + 1} M108 ${y - 1} Q114 ${y - 2} 118 ${y + 1}" stroke="#8a5a32" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  }

  if (acc.oval) {
    // bouclier ovale tenu par la main gauche
    const cx = 44, cy = 140;
    arm += `<ellipse cx="${cx}" cy="${cy}" rx="19" ry="26" fill="${A}" stroke="${RW_VEG_GOLD}" stroke-width="3.5"/>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="12.5" ry="18.5" fill="none" stroke="${AK}" stroke-width="2.5"/>` +
      `<path d="M${cx - 11} ${cy - 12} Q${cx - 9} ${cy - 20} ${cx - 3} ${cy - 22}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".65"/>` +
      `<polygon points="${rwStarPts(cx, cy + 1, 8)}" fill="${RW_VEG_GOLD}" stroke="#c99a1c" stroke-width="1.2" stroke-linejoin="round"/>`;
  }
  return { leaves, chest, belt, face, arm };
}
