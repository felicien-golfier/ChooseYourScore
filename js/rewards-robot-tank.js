/* ── RÉCOMPENSES : ACCESSOIRES DU CHAR (thème « engin de chantier ») ──────────
   Retourne { back, head, outer } : `back` est dessiné derrière le corps (pots
   d'échappement), `head` suit la tête (gyrophare, drapeau, rivets), `outer` est
   dessiné autour du robot (phares, pelle, lanterne, blindage du corps).
   Le drone compagnon est dessiné par rwRobotSvg (même code que les autres robots).
   Les touches (beacon, headlights…) sont reliées aux badges dans
   RW_THEMES.robot.speciesAccs.tank (rewards.js).
   Rien ne couvre l'antenne (rect 94–106 × 44–53). Repères (viewBox 200×240) :
   tête = rect (58,52)–(142,100), corps = rect (54,98)–(146,162), chenilles
   (46,158)–(154,204), mains au niveau 3 : (38,158) et (162,158), drone en (160,54).
   Au niveau 1 (soucoupe) la tête descend de 70 px : `head` la suit, pas `outer`.
   Deux accessoires ont deux rendus : fumée / flammes du turbo (niveau 5 = ailes)
   et pelle / lanterne posées au sol tant que le robot n'a pas de bras (niveau < 3).
   ──────────────────────────────────────────────────────────────────────────── */

function rwTankAccs({ acc, A, E, B, st }) {
  const dark = rwShade(A, -.45), K = st >= 5 ? '#ffffff' : A, amber = '#ffb020';
  let back = '', head = '', outer = '';

  if (acc.turbo) {
    // pots d'échappement derrière les épaules ; fumée grise (niveaux 1 à 4), flammes et étincelles au niveau 5
    const pipe = (x, by, flip) => {
      const top = by - 40;
      let g = `<rect x="${x - 6}" y="${top}" width="12" height="${by - top}" rx="3" fill="${rwShade(B, -.2)}" stroke="${K}" stroke-width="2.5"/>` +
        `<rect x="${x - 9}" y="${top - 3}" width="18" height="8" rx="3" fill="#202034" stroke="${K}" stroke-width="2.5"/>` +
        `<rect x="${x - 6}" y="${top + 14}" width="12" height="4" fill="${A}" opacity=".8"/>`;
      if (st >= 5) {
        g += `<g class="rw-flick"><polygon points="${x - 5},${top - 3} ${x + 5},${top - 3} ${x},${top - 22}" fill="${E}"/><polygon points="${x - 2.4},${top - 3} ${x + 2.4},${top - 3} ${x},${top - 13}" fill="#fff"/></g>` +
          `<polygon points="${rwStarPts(x + (flip ? 11 : -11), top - 18, 4.5)}" fill="#fff" class="rw-twinkle"/>`;
      } else {
        [[0, 0, 6], [3 * flip, 0.7, 5], [-2 * flip, 1.4, 4.4]].forEach(([dx, d, r]) => {
          g += `<circle class="rw-puff" style="animation-delay:-${d}s" cx="${x + dx}" cy="${top - 8}" r="${r}" fill="#c9cfdd" opacity=".75"/>`;
        });
      }
      return g;
    };
    const by = st === 1 ? 198 : 124;
    const px = st === 1 ? [46, 154] : [47, 153];
    back += pipe(px[0], by, -1) + pipe(px[1], by, 1);
    if (st === 1) back += `<path d="M${px[0]} ${by} Q${px[0]} 196 66 196 M${px[1]} ${by} Q${px[1]} 196 134 196" stroke="#202034" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }

  if (acc.beacon) {
    // gyrophare ambre à gauche du dessus de la tête, faisceaux qui clignotent
    head += `<g class="rw-flick"><path d="M72 40 L50 32 M80 36 L76 18 M88 40 L108 32" stroke="${amber}" stroke-width="3" stroke-linecap="round" fill="none"/></g>` +
      `<circle cx="80" cy="42" r="14" fill="${amber}" opacity=".25" class="rw-pulse"/>` +
      `<path d="M70 52 L70 44 Q70 31 80 31 Q90 31 90 44 L90 52 Z" fill="${amber}" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M74 44 Q74 36 79 34" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>` +
      `<rect x="66" y="49" width="28" height="6" rx="3" fill="#202034" stroke="${K}" stroke-width="2.2"/>`;
  }

  if (acc.flag) {
    // drapeau à damier au sommet d'un mât, à droite de la tête (symétrique du gyrophare)
    let cells = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if ((r + c) % 2 === 0) cells += `<rect x="${130 + c * 6}" y="${12 + r * 6}" width="6" height="6" fill="#10101c"/>`;
    head += `<line x1="127" y1="53" x2="127" y2="6" stroke="${K}" stroke-width="3" stroke-linecap="round"/><circle cx="127" cy="5" r="3" fill="${A}"/>` +
      `<g class="rw-dro"><rect x="130" y="12" width="30" height="18" fill="#f2f4fa"/>${cells}<rect x="130" y="12" width="30" height="18" fill="none" stroke="${dark}" stroke-width="1.6"/></g>`;
  }

  if (acc.armor) {
    // blindage rivetté : rivets et visière sur la tête
    const rivet = (x, y) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#d8dde8" stroke="${dark}" stroke-width="1.4"/>`;
    head += `<rect x="64" y="59" width="72" height="6" rx="2" fill="${dark}" stroke="${K}" stroke-width="2"/>` +
      [[66, 77], [134, 77], [66, 95], [134, 95], [76, 62], [124, 62]].map(([x, y]) => rivet(x, y)).join('');
    if (st === 1) outer += rivet(70, 197) + rivet(130, 197);
    else {
      // bande de sécurité à rayures sur le bas du corps + rivets sur les flancs
      let stripes = '';
      for (let x = 66; x <= 132; x += 12) stripes += `<polygon points="${x},148 ${x + 6},148 ${x + 2},154 ${x - 4},154" fill="${amber}"/>`;
      outer += `<rect x="62" y="148" width="76" height="6" rx="3" fill="#10101c"/>${stripes}` +
        [[62, 128], [138, 128], [62, 140], [138, 140]].map(([x, y]) => rivet(x, y)).join('');
    }
  }

  if (acc.headlights) {
    // phares aux deux bouts des chenilles (de la soucoupe au niveau 1), halo et rayons
    const [lx, ly] = st === 1 ? [66, 197] : [50, 181];
    [[lx, -1], [200 - lx, 1]].forEach(([x, d]) => {
      outer += `<circle cx="${x}" cy="${ly}" r="17" fill="#fff6c0" opacity=".25" class="rw-pulse"/>` +
        `<path d="M${x + d * 11} ${ly - 6} L${x + d * 26} ${ly - 12} M${x + d * 12} ${ly} L${x + d * 30} ${ly} M${x + d * 11} ${ly + 6} L${x + d * 26} ${ly + 12}" stroke="#fff6c0" stroke-width="2.4" stroke-linecap="round" class="rw-flick"/>` +
        `<circle cx="${x}" cy="${ly}" r="8.5" fill="#202034" stroke="${K}" stroke-width="2.5"/><circle cx="${x}" cy="${ly}" r="5.4" fill="#fff6c0"/><circle cx="${x - 1.6}" cy="${ly - 1.6}" r="1.8" fill="#fff"/>`;
    });
  }

  if (acc.dozer) {
    // pelle de bulldozer à l'avant, dents en bas et deux vérins (dès le niveau 2)
    const w = st === 1 ? 62 : 74;
    let teeth = '';
    for (let x = 100 - w + 6; x < 100 + w - 8; x += 14) teeth += `<polygon points="${x},212 ${x + 8},212 ${x + 4},219" fill="#d8dde8" stroke="${dark}" stroke-width="1.2" stroke-linejoin="round"/>`;
    if (st >= 2) outer += [58, 142].map(x => `<rect x="${x - 4}" y="172" width="8" height="24" rx="3" fill="#aab2c4" stroke="${dark}" stroke-width="1.6"/>`).join('');
    outer += `<path d="M${100 - w} 196 L${100 + w} 196 L${100 + w + 8} 212 L${100 - w - 8} 212 Z" fill="${A}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M${100 - w + 6} 201 L${100 + w - 6} 201" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M${100 - w + 14} 206 L${100 - w + 22} 206 M${100 + w - 22} 206 L${100 + w - 14} 206" stroke="${dark}" stroke-width="2" stroke-linecap="round" opacity=".7"/>` + teeth;
  }

  if (acc.lantern) {
    // lanterne d'explorateur au bout d'un bâton : tenue dans la main droite dès le niveau 3, plantée dans le sol avant
    const base = st >= 3 ? [162, 158] : [168, 208];
    outer += `<line x1="${base[0]}" y1="${base[1]}" x2="172" y2="92" stroke="#8a6a44" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M172 92 Q172 84 166 84" stroke="#8a6a44" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<circle cx="166" cy="104" r="22" fill="${amber}" opacity=".28" class="rw-pulse"/>` +
      `<g class="rw-dro"><line x1="166" y1="84" x2="166" y2="90" stroke="${dark}" stroke-width="2"/>` +
      `<rect x="157" y="90" width="18" height="4" rx="2" fill="#202034" stroke="${K}" stroke-width="1.8"/>` +
      `<rect x="158" y="94" width="16" height="20" rx="3" fill="#ffe9a8" stroke="${K}" stroke-width="2"/><ellipse cx="166" cy="104" rx="3.4" ry="5" fill="${amber}" class="rw-flick"/>` +
      `<line x1="166" y1="94" x2="166" y2="114" stroke="${K}" stroke-width="1.4" opacity=".7"/>` +
      `<rect x="157" y="113" width="18" height="4" rx="2" fill="#202034" stroke="${K}" stroke-width="1.8"/></g>`;
    if (st >= 3) outer += `<circle cx="162" cy="158" r="8" fill="${A}" stroke="${K}" stroke-width="2.5"/>`;
  }
  return { back, head, outer };
}
