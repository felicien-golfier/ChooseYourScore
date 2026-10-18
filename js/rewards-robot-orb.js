/* ── RÉCOMPENSES : ACCESSOIRES DE L'ORBE (thème « explorateur de l'espace ») ───
   Retourne { head, outer } : `head` suit la tête (hublot, drapeau, laser),
   `outer` est dessiné autour du robot (bulle, satellite, fusée, planète, comète).
   Rien ne couvre l'antenne (100,27) ni l'œil. Les touches (porthole, satellite…)
   sont reliées aux badges dans RW_THEMES.robot.
   ──────────────────────────────────────────────────────────────────────────── */

function rwOrbAccs({ acc, A, E, B }) {
  const dark = rwShade(A, -.45);
  let head = '', outer = '';

  if (acc.porthole) {
    const rivets = Array.from({ length: 8 }, (_, i) => {
      const a = i * Math.PI / 4 + Math.PI / 8;
      return `<circle cx="${(100 + 25 * Math.cos(a)).toFixed(1)}" cy="${(78 + 25 * Math.sin(a)).toFixed(1)}" r="1.8" fill="${dark}"/>`;
    }).join('');
    head += `<circle cx="100" cy="78" r="25" fill="none" stroke="${A}" stroke-width="5"/><circle cx="100" cy="78" r="27.5" fill="none" stroke="${dark}" stroke-width="1.5"/>${rivets}` +
      `<path d="M84 66 Q89 60 97 58" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  if (acc.flag) {
    head += `<line x1="114" y1="46" x2="114" y2="12" stroke="${dark}" stroke-width="2.5" stroke-linecap="round"/><path d="M114 12 L142 19 L114 28 Z" fill="${A}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/><polygon points="${rwStarPts(124, 20, 4)}" fill="#fff"/>`;
  }
  if (acc.laser) {
    head += `<g class="rw-flick"><circle cx="100" cy="78" r="27" fill="none" stroke="${E}" stroke-width="2.5" opacity=".9"/>` +
      `<rect x="108" y="73" width="82" height="10" rx="5" fill="${E}" opacity=".35"/><rect x="108" y="75.5" width="82" height="5" rx="2.5" fill="${E}"/><rect x="108" y="77" width="82" height="2" rx="1" fill="#fff"/></g>` +
      `<path d="M128 56 L134 62 M142 50 L146 58 M128 100 L134 94 M142 106 L146 98" stroke="${E}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>` +
      `<polygon points="${rwStarPts(186, 78, 8)}" fill="#fff"/>`;
  }

  if (acc.bubble) {
    outer += `<circle cx="100" cy="122" r="96" fill="${A}" fill-opacity=".06" stroke="${A}" stroke-width="2" opacity=".9"/><path d="M38 78 Q46 44 78 30" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M160 190 Q176 170 182 148" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".35"/>`;
  }
  if (acc.satellite) {
    outer += `<ellipse cx="100" cy="76" rx="52" ry="18" transform="rotate(-20 100 76)" fill="none" stroke="${A}" stroke-width="1.2" stroke-dasharray="3 5" opacity=".5"/>` +
      `<g class="rw-dro" transform="translate(149 58) rotate(-20) scale(1.35)"><rect x="-17" y="-3" width="12" height="6" rx="1.5" fill="${A}" opacity=".85"/><rect x="5" y="-3" width="12" height="6" rx="1.5" fill="${A}" opacity=".85"/><rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="${B}" stroke="${A}" stroke-width="2"/><circle cx="0" cy="0" r="1.8" fill="${E}"/><line x1="0" y1="-5" x2="0" y2="-10" stroke="${A}" stroke-width="1.5"/></g>`;
  }
  if (acc.rocket) {
    outer += `<g class="rw-dro" transform="translate(168 122) rotate(18) scale(1.4)"><g class="rw-flick"><polygon points="-4,16 4,16 0,30" fill="${E}"/><polygon points="-2,16 2,16 0,23" fill="#fff"/></g>` +
      `<path d="M-6 16 L-6 -4 Q0 -18 6 -4 L6 16 Z" fill="${B}" stroke="${A}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="0" cy="3" r="3" fill="${E}"/><path d="M-6 8 L-12 17 L-6 14 Z M6 8 L12 17 L6 14 Z" fill="${A}"/></g>`;
  }
  if (acc.planet) {
    outer += `<g class="rw-dro" transform="translate(34 98) scale(1.35) translate(-34 -98)"><circle cx="34" cy="98" r="11" fill="${E}" fill-opacity=".85" stroke="${dark}" stroke-width="2"/><path d="M26 94 Q34 90 42 95" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/><ellipse cx="34" cy="98" rx="21" ry="5.5" transform="rotate(-22 34 98)" fill="none" stroke="${A}" stroke-width="2.2"/></g>`;
  }
  if (acc.comet) {
    outer += `<g transform="translate(60 31) scale(1.3) translate(-60 -31)"><path d="M60 31 L16 12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/><path d="M60 31 L26 17" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/><path d="M60 31 L36 21" stroke="${A}" stroke-width="2" stroke-linecap="round"/><polygon points="${rwStarPts(62, 32, 8)}" fill="#fff"/></g>`;
  }
  return { head, outer };
}
