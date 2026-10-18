/* ── RÉCOMPENSES : DESSIN DES ROBOTS ET DES BADGES ────────────────────────────
   Génère les SVG (robot évolutif, hexagones de badges). Aucune donnée ici :
   la logique (XP, badges, stockage par patient) est dans rewards.js.
   Les noms de classes SVG (rw-pulse, rw-flick, rw-dro) sont animées dans css/rewards.css.
   ──────────────────────────────────────────────────────────────────────────── */

const RW_ROBOT_SPECIES={
  bolt:{label:'Cube', top:44, eyeY:72, sideX:68, w:64, bw:56, neck:104, chest:[100,125]},
  orb: {label:'Orbe', top:42, eyeY:78, sideX:66, w:68, bw:56, neck:110, chest:[100,142]},
  spike:{label:'Lame', top:52, eyeY:82, sideX:66, w:68, bw:54, neck:104, chest:[100,132]},
  tank:{label:'Char', top:52, eyeY:75, sideX:58, w:84, bw:92, neck:100, chest:[100,127]}
};
const RW_ARM={bolt:[70,116,56,152,12], orb:[70,140,54,160,10], spike:[78,114,58,150,12], tank:[58,116,38,158,20]};

function rwShade(hex,a){
  const n=parseInt(hex.slice(1),16), f=c=>Math.max(0,Math.min(255,Math.round(a<0?c*(1+a):c+(255-c)*a)));
  return '#'+[n>>16,(n>>8)&255,n&255].map(c=>f(c).toString(16).padStart(2,'0')).join('');
}
function rwStarPts(cx,cy,r){let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1))}return p.join(' ')}

function rwRobotSvg(o){
  const {species:sp,stage:st,body:B,accent:A,eye:E,uid}=o;
  const combat=sp==='orb'&&o.acc&&o.acc.combat;
  const orb=sp==='orb'?rwOrbAccs({acc:o.acc||{},A,E,B,st}):null, acc=orb?{drone:o.acc&&o.acc.drone}:o.acc;
  const S=RW_ROBOT_SPECIES[sp], D=rwShade(B,-.4), L=rwShade(B,.3), gold='#ffffff', K=st>=5?'#ffffff':A, W=3;
  const eye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r+4}" fill="${E}" opacity=".22"/><circle cx="${x}" cy="${y}" r="${r}" fill="${E}"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.28}" fill="#fff" opacity=".8"/>`;
  const sc=[.8,.86,.92,.98,1][st-1];
  let s=`<svg viewBox="0 0 200 240" role="img" aria-label="Robot ${S.label}"><defs><filter id="gl${uid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/><feFlood flood-color="${A}" flood-opacity=".75"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="au${uid}"><stop offset="0" stop-color="${A}" stop-opacity=".55"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient></defs>`;
  if(st>=5) s+=`<circle class="rw-pulse" cx="100" cy="125" r="100" fill="url(#au${uid})"/>`;
  s+=`<ellipse cx="100" cy="214" rx="${sp==='tank'?56:38}" ry="7" fill="#000" opacity=".35"/>`;
  s+=`<g filter="url(#gl${uid})" transform="translate(100 214) scale(${sc}) translate(-100 -214)${combat?' rotate(-6 100 214)':''}">`;
  const bw=S.bw, nk=S.neck;
  if(st>=5){
    const wl=`M${100-bw/2} ${nk+8} L14 66 L24 108 L8 126 L34 140 L${100-bw/2} 152 Z`;
    const wr=`M${100+bw/2} ${nk+8} L186 66 L176 108 L192 126 L166 140 L${100+bw/2} 152 Z`;
    s+=`<path d="${wl}" fill="${A}" fill-opacity=".22" stroke="${A}" stroke-width="2.5" stroke-linejoin="round"/><path d="${wr}" fill="${A}" fill-opacity=".22" stroke="${A}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if(acc.cape&&st>=2) s+=`<path d="M${100-bw/2-4} ${nk+2} L${100+bw/2+4} ${nk+2} L${100+bw/2+26} 204 L${100-bw/2-26} 204 Z" fill="#220c44" stroke="${A}" stroke-width="3" stroke-linejoin="round"/>`;
  if(acc.jetpack&&st>=2){
    const pw=bw+16, px=100-pw/2, py=nk+4, by=py+44;
    s+=`<rect x="${px}" y="${py}" width="${pw}" height="42" rx="9" fill="${rwShade(B,-.25)}" stroke="${A}" stroke-width="2.5"/><rect x="${px+6}" y="${py+8}" width="${pw-12}" height="5" rx="2.5" fill="${A}" opacity=".7"/>`;
    [px+pw*.28,px+pw*.72].forEach(x=>{
      s+=`<polygon points="${x-9},${by-4} ${x+9},${by-4} ${x+6},${by+8} ${x-6},${by+8}" fill="#202034" stroke="${A}" stroke-width="2.2" stroke-linejoin="round"/><g class="rw-flick"><polygon points="${x-5},${by+8} ${x+5},${by+8} ${x},${by+30}" fill="${E}"/><polygon points="${x-2.5},${by+8} ${x+2.5},${by+8} ${x},${by+20}" fill="#fff"/></g>`;
    });
  }
  if(st===1){
    s+=`<ellipse cx="100" cy="194" rx="38" ry="16" fill="${B}" stroke="${K}" stroke-width="${W}"/><ellipse cx="100" cy="191" rx="24" ry="6" fill="${A}" opacity=".85"/>`;
  } else {
    // jambes
    if(sp==='bolt') s+=[80,106].map(x=>`<rect x="${x}" y="158" width="14" height="40" rx="5" fill="${D}"/><rect x="${x-4}" y="194" width="22" height="13" rx="5" fill="${B}" stroke="${K}" stroke-width="3"/>`).join('');
    if(sp==='spike') s+=[82,106].map(x=>`<rect x="${x}" y="156" width="12" height="42" rx="5" fill="${D}"/><polygon points="${x-6},207 ${x+18},207 ${x+14},194 ${x-2},194" fill="${B}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`).join('');
    if(sp==='orb') s+=`<path d="M86 164 L114 164 L108 182 L92 182 Z" fill="${D}"/><polygon points="94,182 106,182 100,200" fill="${A}"/><polygon points="97,182 103,182 100,192" fill="#fff" opacity=".8"/>`;
    if(sp==='tank') s+=`<rect x="46" y="158" width="108" height="46" rx="23" fill="#202034" stroke="${K}" stroke-width="3"/>`+[70,100,130].map(x=>`<circle cx="${x}" cy="181" r="11" fill="${L}" stroke="${D}" stroke-width="2.5"/><circle cx="${x}" cy="181" r="3.5" fill="${A}"/>`).join('');
    // bras
    if(st>=3||(combat&&st>=2)){
      const [x1,y1,x2,y2,w]=RW_ARM[sp];
      // pose de combat : le bras gauche se lève
      [[x1,combat?36:x2,combat?92:y2],[200-x1,200-x2,y2]].forEach(([a,b,ye])=>{
        s+=`<line x1="${a}" y1="${y1}" x2="${b}" y2="${ye}" stroke="${K}" stroke-width="${w+4}" stroke-linecap="round"/><line x1="${a}" y1="${y1}" x2="${b}" y2="${ye}" stroke="${B}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${b}" cy="${ye}" r="${w/2+2}" fill="${A}" stroke="${K}" stroke-width="2.5"/>`;
      });
    }
    // corps
    const [cx,cy]=S.chest;
    const mark= st>=5?`<polygon points="${rwStarPts(cx,cy,10)}" fill="${gold}"/>`:`<circle cx="${cx}" cy="${cy}" r="5.5" fill="${A}"/>`;
    if(sp==='bolt') s+=`<rect x="72" y="102" width="56" height="58" rx="10" fill="${B}" stroke="${K}" stroke-width="${W}"/><rect x="84" y="112" width="32" height="26" rx="6" fill="#0b0b16"/>${mark}<rect x="88" y="145" width="24" height="5" rx="2.5" fill="${D}"/>`;
    if(sp==='orb'){ s+=`<circle cx="100" cy="142" r="30" fill="${B}" stroke="${K}" stroke-width="${W}"/><circle cx="100" cy="142" r="14" fill="#05050c" stroke="${D}" stroke-width="1.5"/><path d="M76 156 H88 L92 150 M124 156 H112 L108 150 M82 128 H90 M118 128 H110" stroke="${A}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>${mark}`;
      if(st>=3) s+=`<ellipse cx="100" cy="142" rx="46" ry="9" fill="none" stroke="${A}" stroke-width="2.2" opacity=".9"/>`;
      if(st>=4) s+=`<ellipse cx="100" cy="142" rx="46" ry="9" fill="none" stroke="${E}" stroke-width="2" opacity=".9" transform="rotate(-28 100 142)"/>`;
      if(st>=5) s+=`<ellipse cx="100" cy="142" rx="46" ry="9" fill="none" stroke="#fff" stroke-width="1.6" opacity=".85" transform="rotate(28 100 142)"/>`; }
    if(sp==='spike') s+=`<path d="M72 102 L128 102 L121 160 L79 160 Z" fill="${B}" stroke="${K}" stroke-width="${W}" stroke-linejoin="round"/><polygon points="88,114 112,114 100,146" fill="#0b0b16"/>${mark}`;
    if(sp==='tank') s+=`<rect x="54" y="98" width="92" height="64" rx="12" fill="${B}" stroke="${K}" stroke-width="${W}"/><rect x="70" y="110" width="60" height="32" rx="6" fill="#0b0b16"/>${mark}<rect x="62" y="148" width="76" height="6" rx="3" fill="${D}"/>`;
    // épaulettes
    if(st>=4){
      const [x1,y1,,,w]=RW_ARM[sp];
      [x1,200-x1].forEach(x=>{s+=`<ellipse cx="${x}" cy="${y1}" rx="${w*.95}" ry="${w*.7}" fill="${A}" stroke="${K}" stroke-width="3"/>`});
    }
  }
  // tête
  s+=`<g transform="translate(${combat?4:0} ${st===1?70:0})">`;
  if(sp==='bolt') s+=`<line x1="100" y1="46" x2="100" y2="31" stroke="${K}" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="27" r="6" fill="${A}" stroke="${K}" stroke-width="2"/><rect x="68" y="44" width="64" height="58" rx="12" fill="${B}" stroke="${K}" stroke-width="${W}"/><rect x="73" y="48" width="54" height="5" rx="2.5" fill="${L}" opacity=".7"/><rect x="77" y="57" width="46" height="31" rx="9" fill="#0b0b16"/>${eye(90,72,7)}${eye(110,72,7)}`;
  if(sp==='orb') s+=`<line x1="100" y1="44" x2="100" y2="31" stroke="${K}" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="27" r="5" fill="${A}" stroke="${K}" stroke-width="2"/><circle cx="100" cy="76" r="34" fill="${B}" stroke="${K}" stroke-width="${W}"/><path d="M78 56 Q90 48 104 47" stroke="${L}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/><circle cx="100" cy="78" r="22" fill="#05050c" stroke="${D}" stroke-width="1.5"/><circle cx="100" cy="78" r="17" fill="none" stroke="${E}" stroke-width="1.5" stroke-dasharray="5 3" opacity=".8"/><path d="M100 52 V58 M100 98 V104 M74 78 H80 M120 78 H126" stroke="${A}" stroke-width="2" stroke-linecap="round"/>${eye(100,78,9)}`;
  if(sp==='spike') s+=`<polygon points="66,102 66,60 76,38 92,58 108,58 124,38 134,60 134,102" fill="${B}" stroke="${K}" stroke-width="${W}" stroke-linejoin="round"/><polygon points="74,72 126,72 122,93 78,93" fill="#0b0b16" stroke="${D}" stroke-width="1.5" stroke-linejoin="round"/>${eye(88,82,6.5)}${eye(112,82,6.5)}<polygon points="76,44 76,56 84,52" fill="${A}"/><polygon points="124,44 124,56 116,52" fill="${A}"/>`;
  if(sp==='tank') s+=`<rect x="58" y="52" width="84" height="48" rx="10" fill="${B}" stroke="${K}" stroke-width="${W}"/><rect x="63" y="55" width="74" height="5" rx="2.5" fill="${L}" opacity=".7"/><rect x="94" y="44" width="12" height="9" rx="3" fill="${A}" stroke="${K}" stroke-width="2"/><rect x="66" y="62" width="68" height="26" rx="13" fill="#0b0b16"/><rect x="75" y="69" width="17" height="12" rx="5" fill="${E}"/><rect x="108" y="69" width="17" height="12" rx="5" fill="${E}"/>`;
  const cx=100, t=S.top, ey=S.eyeY, w=S.w, sx=S.sideX;
  if(acc.headphones) s+=`<path d="M${sx+2} ${ey} Q100 ${t-24} ${200-sx-2} ${ey}" stroke="${rwShade(A,-.45)}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="${sx-10}" y="${ey-13}" width="13" height="26" rx="6" fill="${A}" stroke="${rwShade(A,-.45)}" stroke-width="2.5"/><rect x="${197-sx-3}" y="${ey-13}" width="13" height="26" rx="6" fill="${A}" stroke="${rwShade(A,-.45)}" stroke-width="2.5"/>`;
  if(acc.shades) s+=`<rect x="${cx-w/2+6}" y="${ey-10}" width="${w-12}" height="20" rx="7" fill="#101018" stroke="${A}" stroke-width="2.5"/><line x1="${cx-w/2+16}" y1="${ey-6}" x2="${cx-w/2+26}" y2="${ey+4}" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;
  if(acc.scarf){const sw=bw+10, sd=rwShade(A,-.45), tx=100+bw/2-8; s+=`<path d="M${tx} ${nk+6} L${tx+14} ${nk+6} L${tx+17} ${nk+34} L${tx+7} ${nk+29} L${tx-3} ${nk+34} Z" fill="${A}" stroke="${sd}" stroke-width="2.5" stroke-linejoin="round"/><line x1="${tx+1}" y1="${nk+18}" x2="${tx+14}" y2="${nk+18}" stroke="${sd}" stroke-width="2" opacity=".6"/><rect x="${100-sw/2}" y="${nk-4}" width="${sw}" height="14" rx="7" fill="${rwShade(A,-.15)}" stroke="${sd}" stroke-width="2.5"/><line x1="${100-sw/2+12}" y1="${nk+3}" x2="${100+sw/2-12}" y2="${nk+3}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>`;}
  if(acc.shield){
    const e=st===1?[46,56,150]:[74,100,125];
    s+=`<ellipse cx="100" cy="${e[2]}" rx="${e[0]}" ry="${e[1]}" fill="${A}" fill-opacity=".07" stroke="${A}" stroke-width="2" stroke-dasharray="10 6" opacity=".9"/><path d="M${100-e[0]*.7} ${e[2]-e[1]*.5} Q${100-e[0]*.6} ${e[2]-e[1]*.85} ${100-e[0]*.2} ${e[2]-e[1]*.95}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  }
  if(acc.drone&&st>=2){
    s+=`<g class="rw-dro"><line x1="150" y1="70" x2="124" y2="96" stroke="${A}" stroke-width="1.2" stroke-dasharray="2 4" opacity=".6"/><rect x="143" y="45" width="6" height="4" rx="2" fill="${A}"/><rect x="171" y="45" width="6" height="4" rx="2" fill="${A}"/><circle cx="160" cy="54" r="11" fill="${B}" stroke="${A}" stroke-width="2.5"/><circle cx="160" cy="54" r="6" fill="#05050c"/><circle cx="160" cy="54" r="3.2" fill="${E}"/><polygon points="157,66 163,66 160,74" fill="${E}" class="rw-flick"/></g>`;
  }
  if(orb) s+=orb.head;
  s+=`</g>${orb?orb.outer:''}</g></svg>`;
  return s;
}


// Pictogramme d'un badge (commun aux deux univers), dans un cadre 64×64.
function rwBadgeGlyph(b,ink){
  if(b.gl==='star') return `<polygon points="${rwStarPts(32,33,14)}" fill="${ink}"/>`;
  if(b.gl==='bolt') return `<polygon points="35,16 22,35 31,35 28,50 42,29 33,29" fill="${ink}"/>`;
  if(b.gl==='check') return `<path d="M21 33 L29 41 L44 24" stroke="${ink}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(b.gl.startsWith('chev')){const n=+b.gl.slice(4);return Array.from({length:n},(_,i)=>{const y=27+(i-(n-1)/2)*9;return `<path d="M20 ${y+10} L32 ${y} L44 ${y+10}" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}).join('')}
  if(b.gl==='bolt2') return `<polygon points="27,16 17,33 24,33 22,46 32,29 25,29" fill="${ink}"/><polygon points="43,16 33,33 40,33 38,46 48,29 41,29" fill="${ink}"/>`;
  return `<text x="32" y="${b.gl.length>2?40:41}" text-anchor="middle" font-family="Chakra Petch,sans-serif" font-weight="700" font-size="${b.gl.length>1?20:26}" fill="${ink}">${b.gl}</text>`;
}

function rwBadgeSvg(b,on){
  const c=on?'#00f0ff':'#4a5478', c2=on?'#ff2bd6':'#2c3350';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="${c2}"/><polygon points="32,8 53,20 53,44 32,56 11,44 11,20" fill="${c}"/>${rwBadgeGlyph(b,'#05050d')}</svg>`;
}
