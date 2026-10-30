/* ── RÉCOMPENSES : ACCESSOIRES DE LA LAME (thème « chat ninja ») ───────────────
   Retourne { back, head, outer } : `back` est dessiné derrière le corps (cape),
   `head` suit la tête (yeux de chat, moustaches, bandeau, drone), `outer` est
   dessiné autour du robot (sabre). Le bouclier d'énergie est dessiné par rwRobotSvg
   (même code que les autres robots). Les touches (cateye, whiskers…) sont reliées
   aux badges dans RW_THEMES.robot.speciesAccs.spike (rewards.js).
   Repères (viewBox 200×240) : tête = polygone de (66,38) à (134,102), yeux en
   (88,82) et (112,82), main gauche au niveau 3 : (58,150).
   ──────────────────────────────────────────────────────────────────────────── */

function rwSpikeAccs({ acc, A, E, B, st }) {
  const dark = rwShade(A, -.45), K = st >= 5 ? '#ffffff' : A;
  let back = '', head = '', outer = '';

  if (acc.cape && st >= 2) {
    // cape à l'ourlet ondulé, derrière le corps
    back += `<path d="M69 106 L131 106 L155 204 Q141.3 214 127.5 204 Q113.8 194 100 204 Q86.3 214 72.5 204 Q58.8 194 45 204 Z" fill="#220c44" stroke="${A}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M100 112 L100 198" stroke="${A}" stroke-width="2" opacity=".3"/>`;
  }

  if (acc.cateye) {
    // œil de chat : pupille fine verticale dans chaque œil
    [88, 112].forEach(x => {
      head += `<ellipse cx="${x}" cy="82" rx="2.1" ry="6.4" fill="#05050c"/><circle cx="${x - 2}" cy="79.5" r="1.4" fill="#fff" opacity=".85"/>`;
    });
  }

  if (acc.whiskers) {
    // moustaches lumineuses qui scintillent au bout
    const side = `<path d="M66 88 L34 79 M66 93.5 L30 93.5 M66 99 L34 108" stroke="${A}" stroke-width="2" stroke-linecap="round" fill="none"/>` +
      `<path d="M66 88 L34 79 M66 93.5 L30 93.5 M66 99 L34 108" stroke="#fff" stroke-width=".7" stroke-linecap="round" fill="none" opacity=".7"/>` +
      `<polygon points="${rwStarPts(32, 78, 5.5)}" fill="#fff" class="rw-twinkle"/><polygon points="${rwStarPts(28, 93.5, 4)}" fill="#fff" class="rw-twinkle"/><polygon points="${rwStarPts(32, 109, 5)}" fill="#fff" class="rw-twinkle"/>`;
    head += `<g>${side}</g><g transform="translate(200 0) scale(-1 1)">${side}</g>`;
  }

  if (acc.headband) {
    // bandeau de ninja sur le front, plaque métallique et deux pans qui flottent
    head += `<path d="M134 63 L156 72 L148 75 L162 86 L143 79 L134 70 Z" fill="${dark}" stroke="${A}" stroke-width="2" stroke-linejoin="round" class="rw-dro"/>` +
      `<rect x="63" y="61" width="74" height="10" rx="2" fill="${dark}" stroke="${A}" stroke-width="2.5"/><rect x="85" y="58.5" width="30" height="15" rx="3" fill="#d8dde8" stroke="${A}" stroke-width="2"/>` +
      `<polygon points="${rwStarPts(100, 66, 5.5)}" fill="${dark}"/>`;
  }

  if (acc.drone && st >= 2) {
    // drone compagnon : étoile de ninja qui tourne, œil lumineux au centre
    head += `<g class="rw-dro"><line x1="150" y1="70" x2="124" y2="96" stroke="${A}" stroke-width="1.2" stroke-dasharray="2 4" opacity=".6"/>` +
      `<g transform="translate(160 54)"><g class="rw-spin"><path d="M0 -17 L4.5 -4.5 L17 0 L4.5 4.5 L0 17 L-4.5 4.5 L-17 0 L-4.5 -4.5 Z" fill="${B}" stroke="${A}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<circle r="5" fill="#05050c"/><circle r="2.8" fill="${E}"/></g></g></g>`;
  }

  if (acc.sabre) {
    // sabre de samouraï : tenu dans la main gauche dès le niveau 3, planté dans le sol avant
    const katana = `<rect x="-7" y="-1.6" width="14" height="3.4" rx="1.7" fill="${A}" stroke="${dark}" stroke-width="1"/>` +
      `<rect x="-2.6" y="1.8" width="5.2" height="16" rx="2" fill="#151520" stroke="${dark}" stroke-width="1"/>` +
      `<path d="M0 4 L2 6 L0 8 L-2 6 Z M0 10 L2 12 L0 14 L-2 12 Z" fill="${A}"/><circle cy="18.5" r="2.6" fill="${A}"/>` +
      `<path d="M-2.4 -1.6 L-2.4 -80 L2.4 -88 L2.4 -1.6 Z" fill="#e8eef8" stroke="${dark}" stroke-width="1" stroke-linejoin="round"/>` +
      `<path d="M-0.6 -4 L-0.6 -80" stroke="#fff" stroke-width="1" opacity=".9"/><path d="M2.4 -10 Q.8 -30 2.4 -50" stroke="${E}" stroke-width=".8" fill="none" opacity=".6"/>`;
    if (st >= 3) outer += `<g transform="translate(55.5 142.4) rotate(-18)">${katana}</g><circle cx="58" cy="150" r="8" fill="${A}" stroke="${K}" stroke-width="2.5"/>`;
    else outer += `<g transform="translate(46 124) rotate(184)">${katana}</g>`;
  }
  return { back, head, outer };
}
