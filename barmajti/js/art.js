/* =========================================================
   برمجتي — رسوم SVG مرسومة بالكود (بالونات، فوانيس، كيكة، غيوم، دبل، ختم شمعي)
   ========================================================= */
/* ---------- drawn SVG art ---------- */
let uid=0;
const BAL={gold:[['#fff6d6','#e9c467','#a3741c']],pearl:[['#ffffff','#f1e9df','#bdae9c']],rose:[['#ffeee8','#e6a998','#a35f55']],blue:[['#eef7ff','#8fbbe9','#3a68a3']],pink:[['#fff1f5','#f3a9bf','#b8506f']],
  mix:[['#ffe3e0','#ef6b6b','#a52a2a'],['#fff6cc','#f5c84c','#b98a0c'],['#e3fbf6','#4fc2b0','#1d7f71'],['#efe6ff','#a78bf0','#5b3fb0'],['#e6f2ff','#5aa2ef','#1e5aa8']],
  goldpearl:[['#fff6d6','#e9c467','#a3741c'],['#ffffff','#f1e9df','#bdae9c']],bluepink:[['#eef7ff','#8fbbe9','#3a68a3'],['#fff1f5','#f3a9bf','#b8506f']]};
function svgBalloons(t='gold'){
  const pal=BAL[t]||BAL.gold,id='b'+(++uid);
  const P=[[150,118,1],[88,160,.92],[214,158,.95],[118,74,.84],[186,78,.8],[52,108,.72],[250,112,.74]];
  let defs='',g='';
  pal.forEach((c,i)=>{defs+=`<radialGradient id="${id}${i}" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>`;});
  P.forEach(([x,y,s],k)=>{
    const ci=k%pal.length,rx=40*s,ry=50*s;
    g+=`<path d="M${x} ${y+ry} C ${x+12} ${y+ry+60}, ${x-14} ${y+ry+120}, 150 352" stroke="${pal[ci][2]}" stroke-width="1.4" fill="none" opacity=".75"/>`;
    g+=`<g class="b" style="animation-delay:${-k*.7}s"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}${ci})"/><path d="M${x-5*s} ${y+ry-1} l${5*s} ${8*s} l${5*s} ${-8*s}z" fill="${pal[ci][2]}"/>
      <ellipse cx="${x-rx*.38}" cy="${y-ry*.42}" rx="${rx*.2}" ry="${ry*.32}" fill="#fff" opacity=".55" transform="rotate(-25 ${x-rx*.38} ${y-ry*.42})"/><ellipse cx="${x+rx*.45}" cy="${y+ry*.3}" rx="${rx*.08}" ry="${ry*.18}" fill="#fff" opacity=".25" transform="rotate(-25 ${x} ${y})"/></g>`;
  });
  return `<svg class="svg-bal" viewBox="0 0 300 360" aria-hidden="true"><defs>${defs}</defs>${g}</svg>`;
}
function svgLanterns(t='gold'){
  const m=t==='silver'?['#f4f6f8','#a9b0ba','#5d636c']:t==='acc'?['var(--i-card)','var(--i-acc)','var(--i-ink)']:['#fff2c4','#d4a83c','#7a5518'];
  const id='l'+(++uid);let g='';
  [[60,70,.85],[150,120,1],[240,50,.75]].forEach(([x,y,s],k)=>{
    const w=46*s,h=70*s;
    g+=`<g class="l" style="transform-origin:${x}px 0;animation-delay:${-k*1.3}s"><line x1="${x}" y1="0" x2="${x}" y2="${y}" stroke="${m[1]}" stroke-width="1.6"/>
    <circle cx="${x}" cy="${y+h*.55}" r="${w*1.5}" fill="url(#${id}g)"/>
    <path d="M${x-w*.25} ${y} h${w*.5} l${w*.25} ${h*.18} h${-w}z" fill="url(#${id}m)"/>
    <path d="M${x-w*.5} ${y+h*.18} h${w} l${-w*.12} ${h*.62} h${-w*.76}z" fill="url(#${id}w)" stroke="url(#${id}m)" stroke-width="${2.4*s}"/>
    <path d="M${x} ${y+h*.18} v${h*.62} M${x-w*.5} ${y+h*.18} l${w*.38} ${h*.62} M${x+w*.5} ${y+h*.18} l${-w*.38} ${h*.62}" stroke="url(#${id}m)" stroke-width="${1.4*s}" fill="none"/>
    <path d="M${x-w*.38} ${y+h*.8} h${w*.76} l${-w*.2} ${h*.12} h${-w*.36}z" fill="url(#${id}m)"/><path d="M${x} ${y+h*.92} v${h*.14}" stroke="url(#${id}m)" stroke-width="${2*s}"/><circle cx="${x}" cy="${y+h*1.08}" r="${2.6*s}" fill="url(#${id}m)"/></g>`;
  });
  return `<svg class="svg-lan" viewBox="0 0 300 240" aria-hidden="true"><defs><linearGradient id="${id}m" x1="0" x2="1"><stop offset="0" stop-color="${m[2]}"/><stop offset=".45" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[1]}"/></linearGradient>
  <radialGradient id="${id}w" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#e08a1e"/></radialGradient>
  <radialGradient id="${id}g"><stop offset="0" stop-color="#ffd36b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs>${g}</svg>`;
}
function svgCake(t='pink'){
  const c={pink:['#fde3ea','#f4a7bb','#c95b7c'],white:['#ffffff','#f1e8de','#c8b59c'],choco:['#f6e3d3','#8a5a3c','#4e2e1c'],blue:['#eaf4ff','#9cc4ec','#3f72ad']}[t]||['#fde3ea','#f4a7bb','#c95b7c'];
  const id='c'+(++uid);let candles='';
  [120,150,180].forEach((x,k)=>{candles+=`<rect x="${x-4}" y="62" width="8" height="34" rx="2" fill="url(#${id}s)"/><path class="flame" style="animation-delay:${-k*.17}s" d="M${x} 38 C ${x+8} 50, ${x+6} 60, ${x} 62 C ${x-6} 60, ${x-8} 50, ${x} 38z" fill="url(#${id}f)"/><circle cx="${x}" cy="52" r="14" fill="#ffd36b" opacity=".18"/>`;});
  return `<svg viewBox="0 0 300 260" aria-hidden="true"><defs><linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset=".5" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>
  <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${c[1]}"/></linearGradient><radialGradient id="${id}f" cy=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffc84a"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient></defs>
  ${candles}<ellipse cx="150" cy="238" rx="132" ry="16" fill="#000" opacity=".12"/><ellipse cx="150" cy="232" rx="126" ry="14" fill="#f4f1ec" stroke="#d9d2c8"/>
  <rect x="50" y="150" width="200" height="80" rx="10" fill="url(#${id}a)"/><path d="M50 160 q0 -12 12 -12 h176 q12 0 12 12 v10 q-10 14 -20 0 q-10 16 -20 0 q-10 20 -22 0 q-10 14 -22 0 q-10 18 -22 0 q-10 12 -22 0 q-10 18 -22 0 q-10 14 -20 0 q-10 16 -18 0z" fill="${c[2]}"/>
  <rect x="85" y="96" width="130" height="58" rx="9" fill="url(#${id}a)"/><path d="M85 104 q0 -10 10 -10 h110 q10 0 10 10 v8 q-9 12 -18 0 q-9 14 -18 0 q-9 16 -20 0 q-9 12 -18 0 q-9 14 -18 0 q-9 12 -18 0z" fill="${c[2]}"/>
  ${[70,100,130,160,190,220].map((x,k)=>`<circle cx="${x+5}" cy="${200+(k%2)*10}" r="4" fill="#fff" opacity=".7"/>`).join('')}</svg>`;
}
function svgGifts(t='gold'){
  const P={gold:[['#f7e7c1','#c99a3c','#8a6420','#fff']],pink:[['#ffe3ea','#f09ab3','#b8506f','#fff']],blue:[['#e6f1ff','#86b3e6','#3a68a3','#fff']],mix:[['#ffe3ea','#f09ab3','#b8506f','#fff6cc'],['#e6f1ff','#86b3e6','#3a68a3','#ffe3ea'],['#fff6cc','#f2c84b','#b98a0c','#e6f1ff']]}[t]||[['#f7e7c1','#c99a3c','#8a6420','#fff']];
  const id='g'+(++uid);let g='';
  [[40,120,110,95],[150,90,120,125],[100,165,90,60]].forEach(([x,y,w,h],k)=>{const c=P[k%P.length];
    g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c[1]}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${id}h)"/><rect x="${x-4}" y="${y-14}" width="${w+8}" height="18" rx="3" fill="${c[2]}"/>
    <rect x="${x+w/2-7}" y="${y-14}" width="14" height="${h+14}" fill="${c[3]}" opacity=".9"/><path d="M${x+w/2} ${y-14} c-18 -24 -40 -10 -20 0z M${x+w/2} ${y-14} c18 -24 40 -10 20 0z" fill="${c[3]}" stroke="${c[2]}" stroke-width="1.5"/>`;});
  return `<svg viewBox="0 0 300 240" aria-hidden="true"><defs><linearGradient id="${id}h" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs>${g}</svg>`;
}
function svgSparkles(t='gold'){
  const col=t==='white'?'#ffffff':t==='acc'?'var(--i-acc)':'#f3d27a';let g='',s=7;const r=()=>(s=(s*9301+49297)%233280)/233280;
  for(let k=0;k<16;k++){const x=r()*300,y=r()*300,z=3+r()*9;g+=`<path class="tw" style="animation-delay:${-r()*3}s" d="M${x} ${y-z} Q${x} ${y} ${x+z} ${y} Q${x} ${y} ${x} ${y+z} Q${x} ${y} ${x-z} ${y} Q${x} ${y} ${x} ${y-z}z" fill="${col}"/>`;}
  return `<svg viewBox="0 0 300 300" aria-hidden="true">${g}</svg>`;
}
function svgCaps(t='ink'){
  const c=t==='acc'?'var(--i-acc)':'#1b1b1f';let g='';
  [[70,60,-18,1],[200,40,14,.85],[140,130,-6,1.15],[245,150,22,.75],[40,170,10,.7]].forEach(([x,y,r,s],k)=>{
    g+=`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><g class="b" style="animation-delay:${-k*.6}s"><path d="M-34 0 L0 -14 L34 0 L0 14z" fill="${c}"/><path d="M-20 6 v12 q20 10 40 0 v-12 l-20 8z" fill="${c}"/><path d="M0 0 q20 2 24 12 v14" stroke="#e8c46a" stroke-width="2" fill="none"/><path d="M22 26 l2 8 l2 -8z" fill="#e8c46a"/></g></g>`;});
  return `<svg class="svg-bal" viewBox="0 0 300 220" aria-hidden="true">${g}</svg>`;
}
function svgClouds(t='white'){
  const c={white:['#ffffff','#e9eef5'],pink:['#fff3f6','#f6d3dc'],blue:['#f2f8ff','#cfe2f6']}[t]||['#ffffff','#e9eef5'];const id='k'+(++uid);
  const cloud=(x,y,s,k)=>`<g class="b" style="animation-delay:${-k*1.5}s" transform="translate(${x} ${y}) scale(${s})"><path d="M10 60 Q0 60 0 48 Q0 34 16 34 Q18 14 40 14 Q56 14 62 28 Q70 20 82 22 Q100 26 98 44 Q112 46 112 56 Q112 66 100 66 H14 Q10 66 10 60z" fill="url(#${id})"/></g>`;
  return `<svg class="svg-bal" viewBox="0 0 300 200" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient><filter id="${id}s"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity=".12"/></filter></defs><g filter="url(#${id}s)">${cloud(10,20,1.1,0)}${cloud(150,0,.9,1)}${cloud(90,100,1.2,2)}</g></svg>`;
}
function svgRings(t='gold'){
  const c={gold:['#7a561c','#f6dd94','#b8892f'],silver:['#5d636c','#f4f6f8','#a9b0ba'],rose:['#7d3f39','#ffd8cc','#c9806f']}[t]||['#7a561c','#f6dd94','#b8892f'];const id='q'+(++uid);
  return `<svg viewBox="0 0 300 200" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".35" stop-color="${c[1]}"/><stop offset=".6" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient></defs>
  <ellipse cx="115" cy="110" rx="62" ry="58" fill="none" stroke="url(#${id})" stroke-width="16"/><ellipse cx="185" cy="100" rx="62" ry="58" fill="none" stroke="url(#${id})" stroke-width="16"/>
  <path d="M150 53 A62 58 0 0 1 177 110" fill="none" stroke="url(#${id})" stroke-width="16"/>
  <path class="tw" d="M185 30 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#fff"/></svg>`;
}
const SVGART={'svg:clouds':svgClouds,'svg:rings':svgRings,'svg:balloons':svgBalloons,'svg:lanterns':svgLanterns,'svg:cake':svgCake,'svg:gifts':svgGifts,'svg:sparkles':svgSparkles,'svg:caps':svgCaps};
function waxSVG(){
  let pts=[],s=3;const r=()=>(s=(s*9301+49297)%233280)/233280;
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,rad=46+r()*4;pts.push([50+Math.cos(a)*rad,50+Math.sin(a)*rad]);}
  const d='M'+pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L')+'Z',id='w'+(++uid);
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="color-mix(in srgb,var(--wax) 45%,#fff)"/><stop offset=".55" stop-color="var(--wax)"/><stop offset="1" stop-color="color-mix(in srgb,var(--wax) 55%,#000)"/></radialGradient></defs>
  <path d="${d}" fill="url(#${id})"/><circle cx="50" cy="50" r="33" fill="none" stroke="color-mix(in srgb,var(--wax) 60%,#000)" stroke-width="2.2" opacity=".55"/><circle cx="50" cy="50" r="33.8" fill="none" stroke="#fff" stroke-width=".8" opacity=".25"/></svg>`;
}
function artHTML(a,tint){
  const A=ART[a];if(!A)return'';
  if(A.svg)return SVGART[a](tint);
  if(A.mask)return `<div class="mask tn-${TINTS[tint]?tint:'gold'}" style="--m:url(${ART_DIR}${a}.webp);aspect-ratio:${A.r}"></div>`;
  return `<img src="${ART_DIR}${a}.webp" alt="" loading="lazy" decoding="async">`;
}

function giftBoxSVG(){
  const id='x'+(++uid);
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="color-mix(in srgb,var(--i-acc) 70%,#000)"/><stop offset=".5" stop-color="var(--i-acc)"/><stop offset="1" stop-color="color-mix(in srgb,var(--i-acc) 75%,#000)"/></linearGradient>
  <linearGradient id="${id}r" x1="0" x2="1"><stop offset="0" stop-color="#b8892f"/><stop offset=".5" stop-color="#fff1bd"/><stop offset="1" stop-color="#b8892f"/></linearGradient></defs>
  <ellipse cx="100" cy="186" rx="70" ry="8" fill="#000" opacity=".2"/><rect x="38" y="92" width="124" height="92" rx="4" fill="url(#${id})"/><rect x="92" y="92" width="16" height="92" fill="url(#${id}r)"/>
  <g class="lid"><rect x="30" y="70" width="140" height="26" rx="4" fill="url(#${id})"/><rect x="92" y="70" width="16" height="26" fill="url(#${id}r)"/>
  <path d="M100 70 C 70 30, 40 50, 72 66 Z M100 70 C 130 30, 160 50, 128 66 Z" fill="url(#${id}r)"/><circle cx="100" cy="68" r="8" fill="url(#${id}r)"/></g></svg>`;
}

