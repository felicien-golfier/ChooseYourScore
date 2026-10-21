/* ── RÉCOMPENSES : ACCESSOIRES DE L'ORBE (thème « explorateur de l'espace ») ───
   Retourne { head, outer } : `head` suit la tête (antenne, lunettes), `outer` est
   dessiné autour du robot (bulle, comète, sceptre, réacteur, effets d'ailes).
   Le drone compagnon est dessiné par rwRobotSvg (même code que les autres robots).
   Rien ne couvre l'antenne (100,27). Les touches (twinkle, visor…) sont reliées
   aux badges dans RW_ORB_ACCS (rewards.js). Deux accessoires ont deux rendus selon
   le niveau : réacteur (niveau 1 = soucoupe) et courants d'énergie (ailes au niveau 5).
   ──────────────────────────────────────────────────────────────────────────── */

function rwOrbAccs({ acc, A, E, B, st }) {
  const dark = rwShade(A, -.45);
  let head = '', outer = '';

  if (acc.twinkle) {
    head += `<g class="rw-twinkle"><path d="M100 11 L102.6 24.4 L116 27 L102.6 29.6 L100 43 L97.4 29.6 L84 27 L97.4 24.4 Z" fill="#fff" opacity=".95"/></g>` +
      `<circle class="rw-flick" cx="100" cy="27" r="9" fill="${A}" opacity=".35"/><circle cx="119" cy="16" r="2" fill="#fff" class="rw-twinkle"/><circle cx="82" cy="14" r="1.6" fill="#fff" class="rw-twinkle"/>`;
  }
  if (acc.visor) {
    // lunettes bandeau : le verre laisse voir l'œil, la sangle fait le tour de la tête
    head += `<rect x="63" y="66" width="74" height="24" rx="10" fill="${E}" fill-opacity=".14" stroke="${A}" stroke-width="3"/>` +
      `<path d="M69 70 L79 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><rect x="60" y="74" width="6" height="16" rx="3" fill="${dark}"/><rect x="134" y="74" width="6" height="16" rx="3" fill="${dark}"/>`;
  }

  if (acc.bubble) {
    outer += `<circle cx="100" cy="122" r="96" fill="${A}" fill-opacity=".06" stroke="${A}" stroke-width="2" opacity=".9"/><path d="M38 78 Q46 44 78 30" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M160 190 Q176 170 182 148" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".35"/>`;
  }
  if (acc.comet) {
    outer += `<g transform="translate(60 31) scale(1.3) translate(-60 -31)"><path d="M60 31 L16 12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/><path d="M60 31 L26 17" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/><path d="M60 31 L36 21" stroke="${A}" stroke-width="2" stroke-linecap="round"/><polygon points="${rwStarPts(62, 32, 8)}" fill="#fff"/></g>`;
  }
  if (acc.scepter) {
    // sceptre tenu à droite (là où la main arrive au niveau 3), pommeau en forme de Saturne
    outer += `<g class="rw-dro"><line x1="146" y1="172" x2="146" y2="100" stroke="${dark}" stroke-width="6" stroke-linecap="round"/><line x1="146" y1="172" x2="146" y2="100" stroke="${A}" stroke-width="3" stroke-linecap="round"/><rect x="141" y="132" width="10" height="5" rx="2" fill="${E}"/><rect x="141" y="150" width="10" height="5" rx="2" fill="${E}"/>` +
      `<circle cx="146" cy="92" r="9" fill="${E}" fill-opacity=".9" stroke="${dark}" stroke-width="2"/><path d="M140 89 Q146 85 152 89" stroke="#fff" stroke-width="1.8" fill="none" opacity=".55"/><ellipse cx="146" cy="92" rx="17" ry="4.6" transform="rotate(-22 146 92)" fill="none" stroke="${A}" stroke-width="2"/></g>`;
  }
  if (acc.thrust) {
    // réacteur embrasé : grande flamme sous le robot (sous la soucoupe au niveau 1)
    const y = st === 1 ? 206 : 182;
    outer += `<g class="rw-flick"><polygon points="91,${y} 109,${y} 100,${y + 32}" fill="${E}"/><polygon points="95,${y} 105,${y} 100,${y + 20}" fill="#fff"/></g><circle cx="88" cy="${y + 24}" r="1.8" fill="${E}" class="rw-twinkle"/><circle cx="112" cy="${y + 28}" r="1.5" fill="#fff" class="rw-twinkle"/><circle cx="104" cy="${y + 36}" r="1.3" fill="${E}" class="rw-twinkle"/>`;
  }
  if (acc.wingfx) {
    if (st >= 5) {
      // les ailes (niveau 5) s'animent : courants d'énergie le long des plumes, éclats aux pointes
      const side = `<path d="M72 118 L14 66 L24 108 L8 126 L34 140 L72 152 Z" fill="none" stroke="${E}" stroke-width="1.8" stroke-linejoin="round" class="rw-wingfx" opacity=".9"/>` +
        `<path d="M72 126 L18 72 M72 132 L24 108 M72 138 L10 126" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" class="rw-wingfx" opacity=".75"/>` +
        `<circle cx="14" cy="66" r="3.2" fill="#fff" class="rw-twinkle"/><circle cx="8" cy="126" r="3.2" fill="#fff" class="rw-twinkle"/><circle cx="30" cy="98" r="1.8" fill="${E}" class="rw-twinkle"/>`;
      outer += `<g>${side}</g><g transform="translate(200 0) scale(-1 1)">${side}</g>`;
    } else if (st >= 2) {
      // pas encore d'ailes : des arcs électriques crépitent de part et d'autre du corps
      const arc = `<path d="M52 122 L45 132 L54 138 L44 152 L52 158" stroke="${E}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      outer += `<g class="rw-flick">${arc}<g transform="translate(200 0) scale(-1 1)">${arc}</g></g>`;
    }
  }
  return { head, outer };
}
