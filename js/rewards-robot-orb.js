/* ── RÉCOMPENSES : ACCESSOIRES DE L'ORBE (thème « explorateur de l'espace ») ───
   Retourne { head, outer } : `head` suit la tête (antenne, lunettes, drapeau, laser),
   `outer` est dessiné autour du robot (bulle, planète, étoile filante).
   Le drone compagnon est dessiné par rwRobotSvg (même code que les autres robots).
   Rien ne couvre l'antenne (100,27). Les touches (twinkle, visor…) sont reliées
   aux badges dans RW_THEMES.robot. La pose de combat (acc.combat) est gérée dans
   rwRobotSvg (penché, bras levé) ; ici on dessine son laser.
   ──────────────────────────────────────────────────────────────────────────── */

function rwOrbAccs({ acc, A, E, B }) {
  const dark = rwShade(A, -.45), visor = acc.visor || acc.combat;
  let head = '', outer = '';

  if (acc.twinkle) {
    head += `<g class="rw-twinkle"><path d="M100 11 L102.6 24.4 L116 27 L102.6 29.6 L100 43 L97.4 29.6 L84 27 L97.4 24.4 Z" fill="#fff" opacity=".95"/></g>` +
      `<circle class="rw-flick" cx="100" cy="27" r="9" fill="${A}" opacity=".35"/><circle cx="119" cy="16" r="2" fill="#fff" class="rw-twinkle"/><circle cx="82" cy="14" r="1.6" fill="#fff" class="rw-twinkle"/>`;
  }
  if (acc.combat) {
    // 3/4 : le regard se tourne vers la droite
    head += `<circle cx="100" cy="78" r="19" fill="#05050c"/><circle cx="108" cy="77" r="13" fill="${E}" opacity=".22"/><circle cx="108" cy="77" r="9" fill="${E}"/><circle cx="105" cy="74" r="2.5" fill="#fff" opacity=".8"/>`;
  }
  if (visor) {
    // lunettes bandeau : le verre laisse voir l'œil, la sangle fait le tour de la tête
    head += `<rect x="63" y="66" width="74" height="24" rx="10" fill="${E}" fill-opacity=".14" stroke="${A}" stroke-width="3"/>` +
      `<path d="M69 70 L79 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><rect x="60" y="74" width="6" height="16" rx="3" fill="${dark}"/><rect x="134" y="74" width="6" height="16" rx="3" fill="${dark}"/>`;
  }
  if (acc.combat) {
    head += `<g class="rw-flick"><circle cx="128" cy="78" r="9" fill="${E}" opacity=".5"/>` +
      `<rect x="128" y="71" width="62" height="14" rx="7" fill="${E}" opacity=".35"/><rect x="128" y="74.5" width="62" height="7" rx="3.5" fill="${E}"/><rect x="128" y="76.5" width="62" height="3" rx="1.5" fill="#fff"/></g>` +
      `<path d="M140 58 L145 64 M152 52 L155 60 M140 98 L145 92 M152 104 L155 96" stroke="${E}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>` +
      `<polygon points="${rwStarPts(186, 78, 8)}" fill="#fff"/>`;
  }
  if (acc.flag) {
    head += `<line x1="114" y1="46" x2="114" y2="12" stroke="${dark}" stroke-width="2.5" stroke-linecap="round"/><path d="M114 12 L142 19 L114 28 Z" fill="${A}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/><polygon points="${rwStarPts(124, 20, 4)}" fill="#fff"/>`;
  }

  if (acc.bubble) {
    outer += `<circle cx="100" cy="122" r="96" fill="${A}" fill-opacity=".06" stroke="${A}" stroke-width="2" opacity=".9"/><path d="M38 78 Q46 44 78 30" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M160 190 Q176 170 182 148" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".35"/>`;
  }
  if (acc.planet) {
    outer += `<g class="rw-dro" transform="translate(34 98) scale(1.35) translate(-34 -98)"><circle cx="34" cy="98" r="11" fill="${E}" fill-opacity=".85" stroke="${dark}" stroke-width="2"/><path d="M26 94 Q34 90 42 95" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/><ellipse cx="34" cy="98" rx="21" ry="5.5" transform="rotate(-22 34 98)" fill="none" stroke="${A}" stroke-width="2.2"/></g>`;
  }
  if (acc.comet) {
    outer += `<g transform="translate(60 31) scale(1.3) translate(-60 -31)"><path d="M60 31 L16 12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/><path d="M60 31 L26 17" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/><path d="M60 31 L36 21" stroke="${A}" stroke-width="2" stroke-linecap="round"/><polygon points="${rwStarPts(62, 32, 8)}" fill="#fff"/></g>`;
  }
  return { head, outer };
}
