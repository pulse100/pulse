/* =========================================================
   برمجتي — رسم الدعوة: الأقسام، الكتاب، التمرير التلقائي، الموسيقى، كاميرا الضيوف
   ========================================================= */
const ICONS={cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',pin:'<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',check:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',gift:'<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6 0 6-1.5S14 4 12 8"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',down:'<path d="M6 9l6 6 6-6"/>',save:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="4"/>',img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20c0-2.8-1.7-5.2-4.2-6.1"/>',play:'<path d="M7 4l13 8-13 8z"/>',pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',quote:'<path d="M9 7H5v6h4v-2c0-2-1-3-3-3M19 7h-4v6h4v-2c0-2-1-3-3-3"/>',video:'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3"/>',chev:'<path d="M15 6l-6 6 6 6"/>'};
const ic=(n,cls='i')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- fonts ---------- */
let DATA=structuredClone(DEFAULTS),PUBLISHED=null;
const loadedFonts=new Set();
function loadFont(name){
  if(!name||loadedFonts.has(name))return;loadedFonts.add(name);
  if(DATA.fonts.some(f=>f.name===name))return;
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(name).replace(/%20/g,'+')+'&display=swap';document.head.appendChild(l);
}
function registerCustomFonts(){DATA.fonts.forEach(f=>{try{const ff=new FontFace(f.name,`url(${f.data})`);ff.load().then(x=>document.fonts.add(x)).catch(()=>{});}catch(e){}});}
const allFonts=()=>[...DATA.fonts.map(f=>[f.name,f.label+' (مرفوع)']),...FONTS];
const fontLabel=n=>(allFonts().find(f=>f[0]===n)||[n,n])[1];

/* ---------- dates ---------- */
function when(d){if(!d.date)return null;const[y,m,dd]=d.date.split('-').map(Number);const[hh,mm]=(d.time||'00:00').split(':').map(Number);const t=new Date(y,m-1,dd,hh||0,mm||0);return isNaN(t)?null:t;}
const loc=lang=>lang==='en'?'en-GB':'ar-IQ';
const fmt=(t,o,lang)=>{try{return new Intl.DateTimeFormat(loc(lang),o).format(t)}catch(e){return t.toLocaleString()}};
const hijri=(t,lang)=>{try{return new Intl.DateTimeFormat((lang==='en'?'en':'ar')+'-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(t)}catch(e){return ''}};
const fmtTime=(s,lang)=>{if(!s)return'';const[h,m]=s.split(':').map(Number);return fmt(new Date(2000,0,1,h,m),{hour:'numeric',minute:'2-digit'},lang);};
function calLink(d,t){const p=n=>String(n).padStart(2,'0');const f=x=>`${x.getFullYear()}${p(x.getMonth()+1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;const e=new Date(t.getTime()+3*36e5);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent((d.sub?d.sub+' — ':'')+d.name)+'&dates='+f(t)+'/'+f(e)+(d.venue?'&location='+encodeURIComponent(d.venue):'');}

/* ---------- guest data: Supabase when connected, otherwise kept on this device ---------- */
const Guest={
  sb(){const s=DATA.settings;return s.sbUrl&&s.sbKey?{u:s.sbUrl.replace(/\/$/,''),k:s.sbKey}:null;},
  key:code=>'barmajti:guest:'+code,
  local(code){try{return JSON.parse(localStorage.getItem(this.key(code)))||{photo:[],wish:[],rsvp:[]}}catch(e){return {photo:[],wish:[],rsvp:[]}}},
  saveLocal(code,v){try{localStorage.setItem(this.key(code),JSON.stringify(v));return true}catch(e){return false}},
  async list(code){
    const sb=this.sb();
    if(sb){try{
      const r=await fetch(`${sb.u}/rest/v1/barmajti_entries?gift=eq.${encodeURIComponent(code)}&order=created_at.desc&limit=300`,{headers:{apikey:sb.k,Authorization:'Bearer '+sb.k}});
      if(r.ok){const rows=await r.json();const o={photo:[],wish:[],rsvp:[]};rows.forEach(x=>o[x.kind]?.push({name:x.name,text:x.body,count:x.count,photo:x.photo,ts:x.created_at}));return o;}
    }catch(e){}}
    return this.local(code);
  },
  async add(code,kind,entry){
    const sb=this.sb();
    if(sb){try{
      if(kind==='photo'&&entry.photo?.startsWith('data:')){
        const blob=await (await fetch(entry.photo)).blob();const path=`${encodeURIComponent(code)}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.jpg`;
        const up=await fetch(`${sb.u}/storage/v1/object/barmajti/${path}`,{method:'POST',headers:{apikey:sb.k,Authorization:'Bearer '+sb.k,'Content-Type':'image/jpeg'},body:blob});
        if(!up.ok)throw 0;entry={...entry,photo:`${sb.u}/storage/v1/object/public/barmajti/${path}`};
      }
      const r=await fetch(`${sb.u}/rest/v1/barmajti_entries`,{method:'POST',headers:{apikey:sb.k,Authorization:'Bearer '+sb.k,'Content-Type':'application/json',Prefer:'return=minimal'},
        body:JSON.stringify({gift:code,kind,name:entry.name||'',body:entry.text||'',count:entry.count||1,photo:entry.photo||''})});
      if(r.ok)return 'online';
    }catch(e){}}
    const v=this.local(code);v[kind]=[{...entry,ts:new Date().toISOString()},...(v[kind]||[])];
    if(kind==='photo')v.photo=v.photo.slice(0,14);
    return this.saveLocal(code,v)?'local':'full';
  }
};
function shrinkImage(file,max,q=.82){
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q));};im.onerror=rej;im.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});
}

/* =========================================================
   RENDERER
   ========================================================= */
function frameVars(d){
  [d.fName,d.fTitle,d.fBody].forEach(loadFont);
  return `--i-bg:${hex(d.bg)};--i-card:${hex(d.card)};--i-ink:${hex(d.ink)};--i-acc:${hex(d.acc)};--i-acc2:${hex(d.acc2)};--dc:${hex(d.door)};--wax:${hex(d.wax)};--f-name:'${cssq(d.fName)}';--f-title:'${cssq(d.fTitle)}';--f-body:'${cssq(d.fBody)}';--f-num:'${cssq(d.fBody)}';--ns:${+d.ns||1};--ts:${+d.ts||1};--ms:${+d.ms||1};--my:${(+d.my||24)}cqw;--mo:${+(d.mo??.9)}`;
}
const metal=d=>d.metal==='ink'?'mt':'mt mt-'+(METALS[d.metal]?d.metal:'gold');
function layersHTML(d){
  return (d.layers||[]).map(l=>{
    if(!ART[l.a])return'';
    const vars=[`width:${Math.max(4,Math.min(160,+l.s||40))}cqw`,len(l.x)&&`--x:${l.x}`,len(l.y)&&`--y:${l.y}`,`--r:${+l.r||0}deg`,l.f?'--sx:-1':'',`--o:${+(l.o??1)}`,`--z:${l.z?4:0}`,POSCSS[l.p]||POSCSS.center].filter(Boolean).join(';');
    return `<div class="lay an-${ANIMS[l.an]?l.an:'none'}" style="${vars}"><div class="li">${artHTML(l.a,l.t)}</div></div>`;
  }).join('');
}
const crnMask=d=>`<div class="mask tn-${d.corners}" style="--m:url(${ART_DIR}baroque.webp);aspect-ratio:1.4"></div>`;
const corners=d=>d.corners&&TINTS[d.corners]?`<span class="crn a" aria-hidden="true">${crnMask(d)}</span><span class="crn b" aria-hidden="true">${crnMask(d)}</span>`:'';
const divider=d=>d.corners&&TINTS[d.corners]?`<div class="divd rv" aria-hidden="true"><div class="mask tn-${d.corners}" style="--m:url(${ART_DIR}flourish.webp);aspect-ratio:1.5"></div></div>`:'';
const title=(d,k,def)=>esc(d.titles?.[k]||def);
const card=(d,inner,cls='')=>`<div class="icard ${cls}">${corners(d)}${inner}</div>`;

function heroHTML(d,lang){
  const T=L[lang]||L.ar,t=when(d);
  const ph=safeImg(d.photo)&&d.photoMode!=='none'?`<div class="hphoto"><img src="${esc(d.photo)}" alt="" decoding="async"></div>`:'';
  const mono=d.mono?`<div class="mono ${metal(d)}" aria-hidden="true">${esc(d.mono)}</div>`:'';
  return `<section class="ihero">${ph}${layersHTML(d)}${FRAMES[d.frame]&&d.frame!=='none'?`<div class="fr fr-${d.frame}"></div>`:''}${mono}
    ${d.sub?`<div class="h-sub">${esc(d.sub)}</div>`:''}<h2 class="h-name ${metal(d)} sh">${esc(d.name)}</h2>
    ${t?`<div class="h-chips"><div class="h-chip">${ic('cal')}${esc(fmt(t,{weekday:'long'},lang))}<small>${esc(fmt(t,{year:'numeric',month:'numeric',day:'numeric'},lang))}</small></div>
      ${d.time?`<div class="h-chip">${ic('clock')}${T.time}<small>${esc(fmtTime(d.time,lang))}</small></div>`:''}</div>`:''}
    ${d.layout!=='book'?ic('down','i h-down'):''}</section>`;
}
/* every section returns '' when it has nothing to show */
/* personal line when the link carries a guest name (?to=) */
const guestHTML=(d,T)=>d.guest?`<div class="iguest"><small>${esc(d.guestLine||T.guestLine)}</small><b class="${metal(d)}">${esc(d.guest)}</b></div>`:'';
const SEC={
  card:(d,T)=>d.cardTitle||d.invite||d.guest?card(d,`${guestHTML(d,T)}${d.cardTitle?`<div class="ititle">${esc(d.titles?.card||d.cardTitle)}</div>`:''}${d.invite?`<p class="c-text">${esc(d.invite)}</p>`:''}<div class="c-sign ${metal(d)}">${esc(d.name)}</div>`):'',
  family:(d,T)=>d.family?.length?card(d,`<div class="ih">${title(d,'family',T.family)}</div><div class="ifam">${d.family.map(([a,b])=>`<div>${a?`<small>${esc(a)}</small>`:''}<b>${esc(b)}</b></div>`).join('')}</div>`):'',
  message:(d,T)=>d.msgBody?card(d,`<div class="ih">${esc(d.msgTitle||T.message)}</div><p class="c-text">${esc(d.msgBody)}</p>${d.msgSign?`<div class="c-sign ${metal(d)}">${esc(d.msgSign)}</div>`:''}`,'paperish'):'',
  quote:(d,T)=>d.quote?`<figure class="iquote">${ic('quote')}<blockquote>${esc(d.quote)}</blockquote>${d.quoteSrc?`<figcaption>${esc(d.quoteSrc)}</figcaption>`:''}</figure>`:'',
  album:(d,T)=>{const ps=[...(d.photos||[]),...(d.img?[d.img]:[])].filter(safeImg);return ps.length?`<div class="ih">${title(d,'album',T.album)}</div><div class="ialbum">${ps.map((p,i)=>`<img src="${esc(p)}" alt="" loading="lazy" style="--rt:${[-3,2,-1.5,3,-2][i%5]}deg">`).join('')}</div>`:'';},
  venue:(d,T)=>d.venue?`<div class="ivenue"><span class="ilabel">${ic('pin')}${T.where}</span><strong>${esc(d.venue)}</strong>${safeUrl(d.map)?`<a class="ipill" href="${esc(safeUrl(d.map))}" target="_blank" rel="noopener">${ic('pin')}${T.map}</a>`:''}
    ${d.venue2?`<span class="ilabel" style="margin-top:4cqw">${ic('pin')}${T.where2}</span><strong>${esc(d.venue2)}</strong>${safeUrl(d.map2)?`<a class="ipill" href="${esc(safeUrl(d.map2))}" target="_blank" rel="noopener">${ic('pin')}${T.map}</a>`:''}`:''}</div>`:'',
  calendar:(d,T,lang)=>{const t=when(d);if(!t)return'';return `<div class="ical"><div class="cal-h"><span>${esc(fmt(t,{weekday:'long'},lang))}</span><b>${esc(fmt(t,{month:'long'},lang))}</b><span>${esc(fmt(t,{year:'numeric'},lang))}</span></div>
    <div class="cal-d">${esc(fmt(t,{day:'numeric'},lang))}</div><div class="cal-w">${esc(fmt(t,{weekday:'long'},lang))}</div>${d.time?`<div class="cal-t">${esc(fmtTime(d.time,lang))}</div>`:''}${d.hijri?`<div class="cal-hj">${esc(hijri(t,lang))}</div>`:''}</div>
    <a class="ipill" href="${calLink(d,t)}" target="_blank" rel="noopener">${ic('save')}${T.save}</a>`;},
  countdown:(d,T,lang)=>{const t=when(d);if(!t||t<Date.now())return'';return card(d,`<span class="ilabel">${ic('clock')}${T.count}</span><div class="icount" data-cd="${t.getTime()}" data-lang="${lang}"><div><b>0</b><small>${T.d}</small></div><div><b>0</b><small>${T.h}</small></div><div><b>0</b><small>${T.m}</small></div><div><b>0</b><small>${T.s}</small></div></div>`);},
  program:(d,T,lang)=>d.program?.length?card(d,`<div class="ih">${title(d,'program',T.prog)}</div><div class="iprog">${d.program.map(([tm,l])=>`<div class="row rv"><span class="lab">${esc(l)}</span><span class="dot"></span><span class="tm">${esc(/^\d{1,2}:\d{2}$/.test(tm)?fmtTime(tm,lang):tm)}</span></div>`).join('')}</div>`):'',
  details:(d,T)=>d.details?.length?`<div class="ih">${title(d,'details',T.det)}</div><div class="idet">${d.details.map(x=>`<div>${ic('info')}<span>${esc(x)}</span></div>`).join('')}</div>`:'',
  video:(d,T)=>{const v=String(d.video||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|^)([\w-]{11})(?:\b|$)/);return v?`<a class="ivideo" href="https://www.youtube.com/watch?v=${v[1]}" target="_blank" rel="noopener">${ic('video')}<span>${title(d,'video',T.video)}</span></a>`:'';},
  guestcam:(d,T)=>card(d,`<div class="ih">${title(d,'guestcam',T.guestcam)}</div><p class="c-text small">${T.camText}</p>
    <div class="camrow"><label class="ipill">${ic('cam')}${T.snap}<input type="file" accept="image/*" capture="environment" data-cam hidden></label><label class="ipill ghost">${ic('img')}${T.pick}<input type="file" accept="image/*" multiple data-cam hidden></label></div>
    <div class="gphotos" data-gphotos><p class="muted">${T.noPhotos}</p></div>`),
  wishes:(d,T)=>card(d,`<div class="ih">${title(d,'wishes',T.wishes)}</div><div class="wwall" data-wishes>${(d.wishes||[]).map(w=>wishHTML(w)).join('')||`<p class="muted">${T.noWishes}</p>`}</div><button class="ipill" type="button" data-act="wish">${ic('heart')}${T.writeW}</button>`),
  attend:(d,T)=>card(d,`<span class="ilabel">${ic('users')}${title(d,'attend',T.attend)}</span><div class="attn" data-attend data-base="${+d.attendBase||0}">${digits(+d.attendBase||0)}</div><small class="muted">${T.attendNote}</small><button class="ipill" type="button" data-act="rsvp">${ic('check')}${T.rsvp}</button>`),
  qr:(d,T)=>card(d,`<div class="qrbox" data-qr></div><small class="muted">${title(d,'qr',T.qr)}</small>`),
  contacts:(d,T)=>d.contacts?.length?`<div class="ih">${title(d,'contacts',T.contacts)}</div><div class="icontacts">${d.contacts.map(([n,p])=>`<a class="ipill" href="https://wa.me/${esc(String(p).replace(/\D/g,''))}" target="_blank" rel="noopener">${ic('phone')}${esc(n||p)}</a>`).join('')}</div>`:'',
  closing:(d,T)=>d.closing?`<div class="iclose">${esc(d.closing)}</div>`:''
};
function wishHTML(w){const k=typeof w==='string'?w.indexOf(':'):-1;const who=typeof w==='string'?(k>0?w.slice(0,k):''):w.name;const txt=typeof w==='string'?(k>0?w.slice(k+1):w):w.text;
  return `<blockquote class="rv in"><span>“${esc(String(txt||'').trim())}”</span>${who?`<cite>${esc(String(who).trim())}</cite>`:''}</blockquote>`;}
const ig=()=>String(DATA.settings.instagram||IG_DEFAULT).replace(/^@/,'').replace(/[^\w.]/g,'')||IG_DEFAULT;
function footHTML(d,lang){const T=L[lang]||L.ar,t=when(d);
  return `<section class="ifoot"><b class="${metal(d)}">${esc(d.name)}</b>${t?`<small>${esc(fmt(t,{year:'numeric',month:'numeric',day:'numeric'},lang))}</small>`:''}${ic('heart','i hrt')}
    <small>${T.made}</small><a class="igl" href="https://www.instagram.com/${ig()}" target="_blank" rel="noopener">${ic('ig')}<span>@${ig()}</span></a></section>`;}
const order=d=>(d.sections||ORDER[d.cat]||ORDER.wed).filter(k=>SEC[k]);
function sectionsHTML(d,lang,wrap){
  const T=L[lang]||L.ar;
  return order(d).map(k=>{const h=SEC[k](d,T,lang);return h?wrap(k,h):'';}).filter(Boolean);
}
function invHTML(d,lang='ar'){
  const parts=sectionsHTML(d,lang,(k,h)=>`${['venue','closing','quote'].includes(k)?divider(d):''}<section class="ip sec-${k} rv" data-sec="${k}">${h}</section>`);
  return `<div class="inv">${heroHTML(d,lang)}${parts.join('')}${footHTML(d,lang)}</div>`;
}
function bookHTML(d,lang='ar'){
  const T=L[lang]||L.ar;
  const pages=[`<div class="pg cover" data-i="0"><div class="pgi">${heroHTML(d,lang)}</div></div>`,
    ...sectionsHTML(d,lang,(k,h)=>`<div class="pgi"><section class="sec-${k} rv in" data-sec="${k}">${h}</section></div>`).map(x=>x),
    `<div class="pgi">${footHTML(d,lang)}</div>`];
  const n=pages.length;
  return `<div class="book" style="--n:${n}">${pages.map((p,i)=>i===0?p.replace('data-i="0"',`data-i="0" style="z-index:${n}"`):`<div class="pg" data-i="${i}" style="z-index:${n-i}">${p}<span class="pgno">${digits(i)}</span></div>`).join('')}
    <div class="bnav"><button type="button" data-act="prev" aria-label="${T.prev}">${ic('chev')}</button><span class="bdots">${pages.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</span><button type="button" data-act="next" aria-label="${T.next}" class="nx">${ic('chev')}</button></div></div>`;
}
const INTRO_DIR='assets/intro/';
/* the surface the envelope rests on: the design photo softened, otherwise satin or warm bokeh */
const surface=d=>safeImg(d.photo)&&d.photoMode!=='none'?d.photo:BG_DIR+(isLight(d.bg)?'candles-flowers':'gold-bokeh')+'.webp';
const velvet=d=>{const h=hex(d.door).slice(1);const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0);return r*.3+g*.59+b*.11<45&&Math.max(r,g,b)-Math.min(r,g,b)<30?'#7a0f1c':hex(d.door);};
function sealHTML(d,T,initial){
  return `<button class="wax" type="button" data-open aria-label="${T.open}"><i class="wx"></i><i class="wr"></i><b>${initial}</b></button>`;
}
function introHTML(d,lang){
  const T=L[lang]||L.ar,initial=esc((d.mono||d.name||'ب').trim().charAt(0));
  const wax=sealHTML(d,T,initial),hint=`<div class="hint">${T.open}</div>`;
  if(d.intro==='doors')return `<div class="intro intro-doors"><div class="glow"></div><div class="door l"><i></i></div><div class="door r"><i></i></div>${wax}${hint}</div>`;
  if(d.intro==='curtain')return `<div class="intro intro-curtain" style="--hc:#fff;--vc:${velvet(d)}"><div class="cur l"></div><div class="cur r"></div><div class="valance"></div><div class="spot"></div>${wax}${hint}</div>`;
  if(d.intro==='envelope')return `<div class="intro intro-env" style="--hc:#fff"><div class="env-surf" style="background-image:url('${esc(surface(d))}')"></div>
    <div class="env"><div class="env-back"></div><div class="env-letter">${d.guest?`<em class="eto">${T.toG}: ${esc(d.guest)}</em>`:''}<small>${esc(d.sub||'')}</small><b class="${metal(d)}">${esc(d.name)}</b><span></span></div><div class="env-front"></div><div class="env-flap"><i></i></div>${wax}</div>${hint}</div>`;
  if(d.intro==='box')return `<div class="intro intro-box" style="--hc:${hex(d.card)}"><button class="gb" type="button" data-open aria-label="${T.open}">${giftBoxSVG()}</button><p>${T.gift}</p><div class="hint">${T.tapBox}</div></div>`;
  return'';
}
const dockHTML=lang=>{const T=L[lang]||L.ar;return `<nav class="dock" aria-label="أزرار الهدية">
    <button type="button" data-act="contact">${ic('phone')}${T.contact}</button>
    <button type="button" data-act="music" aria-pressed="false">${ic('music')}${T.music}</button>
    <button type="button" class="mid" data-act="cam"><span class="c">${ic('cam')}</span>${T.guestcam}</button>
    <button type="button" data-act="where">${ic('pin')}${T.where}</button>
    <button type="button" data-act="rsvp">${ic('check')}${T.rsvp}</button></nav>`;};
const bodyHTML=(d,lang)=>d.layout==='book'?bookHTML(d,lang):`<div class="inv-scroll">${invHTML(d,lang)}</div>`;
/* mode: 'thumb' (static), 'edit' (scrollable, no intro), 'live' (intro, music, reveals, auto-scroll) */
function makeFrame(d,mode,lang='ar'){
  const f=document.createElement('div');
  f.className=`frame t-${THEMES[d.theme]?d.theme:'paper'} ph-${PHOTO_MODES[d.photoMode]&&safeImg(d.photo)?d.photoMode:'none'} lay-${d.layout==='book'?'book':'scroll'}`+(mode==='thumb'?' static still':'')+(mode==='edit'?' still':'')+(mode!=='live'||d.intro==='none'?' opened':'');
  if(isLight(d.bg))f.classList.add('lightbg');
  f.setAttribute('style',frameVars(d));f.dataset.lang=lang;
  f.innerHTML=bodyHTML(d,lang)+dockHTML(lang)+(mode!=='thumb'?`<button class="langb" type="button" data-act="lang">${L[lang].lang}</button>`:'')+
    (mode==='live'?`${d.music?`<button class="mpill" type="button" data-act="music">${ic('music')}<span>${L[lang].tap}</span></button>`:''}<canvas class="fx"></canvas>${introHTML(d,lang)}`:'');
  if(mode!=='thumb')wireFrame(f,d,mode);else tickCountdowns(f);
  return f;
}
function phone(d,mode){const p=document.createElement('div');p.className='phone';p.appendChild(makeFrame(d,mode));return p;}

/* ---------- live behaviour ---------- */
const frames=new Set();
function loadQR(){return window.QRCode?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function giftURL(d,guest){const q='?gift='+d.code+(guest?'&to='+encodeURIComponent(guest):'');try{const u=new URL(location.href);u.hash='';u.search=q;return u.href;}catch(e){return q;}}
async function fillGuest(f,d){
  const T=L[f.dataset.lang]||L.ar,g=await Guest.list(d.code||d.id);
  const gp=$('[data-gphotos]',f);if(gp)gp.innerHTML=g.photo.length?g.photo.map(p=>`<figure><img src="${esc(p.photo)}" alt="" loading="lazy">${p.name?`<figcaption>${esc(p.name)}</figcaption>`:''}</figure>`).join(''):`<p class="muted">${T.noPhotos}</p>`;
  const ww=$('[data-wishes]',f);if(ww){const all=[...g.wish,...(d.wishes||[])];ww.innerHTML=all.length?all.slice(0,30).map(wishHTML).join(''):`<p class="muted">${T.noWishes}</p>`;}
  const at=$('[data-attend]',f);if(at){const n=(+at.dataset.base||0)+g.rsvp.filter(r=>r.text!=='no').reduce((a,r)=>a+(+r.count||1),0);at.textContent=f.dataset.lang==='en'?n:digits(n);}
}
function wireFrame(f,d,mode){
  frames.add(f);let stopFx=()=>{},obs=null,auto=null;
  const setup=()=>{
    obs?.disconnect();
    if(mode==='live'&&'IntersectionObserver' in window&&d.layout!=='book'){
      obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}}),{root:$('.inv-scroll',f),threshold:.12});
      $$('.rv',f).forEach(el=>obs.observe(el));
    }else $$('.rv',f).forEach(el=>el.classList.add('in'));
    tickCountdowns(f);fillGuest(f,d);
    const q=$('[data-qr]',f);if(q)loadQR().then(()=>{q.innerHTML='';new QRCode(q,{text:giftURL(d),width:220,height:220,colorDark:isLight(d.card)?hex(d.ink):'#000000',colorLight:isLight(d.card)?hex(d.card):'#ffffff'});}).catch(()=>{q.innerHTML=`<small class="muted">${esc(giftURL(d))}</small>`;});
    if(d.layout==='book')setupBook();
  };
  /* book: tap or swipe to turn pages, and it turns by itself until touched */
  let page=0,bookTimer=null,idleUntil=0;
  const setupBook=()=>{page=0;turnTo(0);};
  const pgs=()=>$$('.pg',f);
  const turnTo=i=>{const P=pgs();page=Math.max(0,Math.min(P.length-1,i));P.forEach((p,k)=>p.classList.toggle('turned',k<page));$$('.bdots i',f).forEach((x,k)=>x.classList.toggle('on',k===page));};
  if(d.layout==='book'){
    let sx=null;
    f.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,input,label'))return;sx=e.clientX;idleUntil=Date.now()+12000;});
    f.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)turnTo(page+(dx>0?1:-1));});
  }
  /* scroll: slides down by itself after opening; any touch takes over and it resumes after a pause */
  const startAuto=()=>{
    if(reduceMotion)return;
    if(d.layout==='book'){bookTimer=setInterval(()=>{if(Date.now()<idleUntil||!f.isConnected)return;if(page<pgs().length-1)turnTo(page+1);else clearInterval(bookTimer);},6500);return;}
    const sc=$('.inv-scroll',f);if(!sc)return;let last=performance.now(),acc=0,paused=0;
    const hold=()=>{paused=Date.now()+5000;sc.style.scrollBehavior='';};
    ['pointerdown','touchstart','wheel','keydown'].forEach(ev=>sc.addEventListener(ev,hold,{passive:true}));
    const step=now=>{if(!f.isConnected)return;const dt=Math.min(60,now-last);last=now;
      if(Date.now()>paused&&!$('.isheet',f)){sc.style.scrollBehavior='auto';acc+=dt*sc.clientWidth/14000;if(acc>=1){sc.scrollTop+=Math.floor(acc);acc-=Math.floor(acc);}}
      if(sc.scrollTop+sc.clientHeight<sc.scrollHeight-2)auto=requestAnimationFrame(step);};
    auto=requestAnimationFrame(step);
  };
  setup();
  f._cleanup=()=>{stopFx();obs?.disconnect();cancelAnimationFrame(auto);clearInterval(bookTimer);if(musicFrame===f)stopMusic();frames.delete(f);};
  if(mode==='live'&&d.music)prepareMusic(d);
  const open=()=>{if(f.classList.contains('opened'))return;f.classList.add('opened');if(d.music)playMusic(d,f);stopFx=startFx($('.fx',f),d.fx,fxColors(d));setTimeout(startAuto,2600);};
  if(mode==='live'&&d.intro==='none')setTimeout(()=>{stopFx=startFx($('.fx',f),d.fx,fxColors(d));startAuto();},300);
  f.addEventListener('change',async e=>{
    const inp=e.target.closest('[data-cam]');if(!inp||!inp.files?.length)return;const T=L[f.dataset.lang]||L.ar;
    for(const file of inp.files){try{const photo=await shrinkImage(file,1100,.8);const r=await Guest.add(d.code||d.id,'photo',{photo,name:''});toast(r==='full'?'الذاكرة امتلأت، اربط قاعدة البيانات حتى تنحفظ صور أكثر':T.saved);}catch(err){toast('ما گدرت أقرا الصورة');}}
    inp.value='';fillGuest(f,d);
  });
  f.addEventListener('click',e=>{
    if(e.target.closest('[data-open]')){open();return;}
    const a=e.target.closest('[data-act]')?.dataset.act;if(!a)return;
    const host=(d.host||'').replace(/\D/g,''),lang=f.dataset.lang;
    if(a==='music')toggleMusic(d,f);
    else if(a==='next'){idleUntil=Date.now()+12000;turnTo(page+1);}
    else if(a==='prev'){idleUntil=Date.now()+12000;turnTo(page-1);}
    else if(a==='lang'){
      const nl=lang==='ar'?'en':'ar';f.dataset.lang=nl;
      const keep=$('.inv-scroll',f)?.scrollTop||0,body=$('.inv-scroll,.book',f);body.outerHTML=bodyHTML(d,nl);const sc=$('.inv-scroll',f);if(sc)sc.scrollTop=keep;
      $('.dock',f).outerHTML=dockHTML(nl);$('.langb',f).textContent=L[nl].lang;setMusicUI(f,musicFrame===f);setup();if(d.layout==='book')turnTo(page);
    }
    else if(a==='where'){const v=$('[data-sec=venue]',f);if(safeUrl(d.map))window.open(d.map,'_blank','noopener');else if(v)goSec(f,d,'venue');else toast(lang==='en'?'No location for this event':'ما مضاف موقع لهاي المناسبة');}
    else if(a==='cam'){if($('[data-sec=guestcam]',f))goSec(f,d,'guestcam');else $('[data-cam]',f)?.click()||toast('كاميرا الضيوف مو مفعّلة بهاي الهدية');}
    else if(a==='contact'){if(host)window.open('https://wa.me/'+host,'_blank','noopener');else if(d.contacts?.length)goSec(f,d,'contacts');else toast('بالهدية الحقيقية هذا الزر يتصل بصاحب المناسبة');}
    else if(a==='wish'||a==='rsvp')openISheet(f,d,a);
  });
  function goSec(f,d,k){if(d.layout==='book'){const i=pgs().findIndex(p=>p.querySelector(`[data-sec=${k}]`));if(i>=0){idleUntil=Date.now()+15000;turnTo(i);}}else $(`[data-sec=${k}]`,f)?.scrollIntoView({block:'center'});}
}
function openISheet(f,d,kind){
  $('.isheet',f)?.remove();const T=L[f.dataset.lang]||L.ar;
  const s=document.createElement('form');s.className='isheet';
  s.innerHTML=kind==='rsvp'
    ?`<button class="x2" type="button" data-x>${T.close} ✕</button><h4>${T.rsvp}</h4><input name="n" placeholder="${T.yourName}" required aria-label="${T.yourName}">
      <div class="opts"><button type="button" data-v="yes" aria-pressed="true">${T.yes}</button><button type="button" data-v="no" aria-pressed="false">${T.no}</button></div>
      <input name="c" type="number" min="1" max="20" value="1" aria-label="${T.guests}"><button class="go" type="submit">${T.sendR}</button>`
    :`<button class="x2" type="button" data-x>${T.close} ✕</button><h4>${T.writeW}</h4><input name="n" placeholder="${T.yourName}" required aria-label="${T.yourName}">
      <textarea name="m" rows="3" required aria-label="${T.wish}"></textarea><button class="go" type="submit">${T.sendW}</button>`;
  f.appendChild(s);let yes=true;
  s.addEventListener('click',e=>{if(e.target.closest('[data-x]'))s.remove();const o=e.target.closest('[data-v]');if(o){yes=o.dataset.v==='yes';$$('[data-v]',s).forEach(b=>b.setAttribute('aria-pressed',b===o));}});
  s.onsubmit=async e=>{e.preventDefault();const n=s.n.value.trim(),host=(d.host||'').replace(/\D/g,'');
    if(kind==='rsvp')await Guest.add(d.code||d.id,'rsvp',{name:n,text:yes?'yes':'no',count:+s.c.value||1});
    else await Guest.add(d.code||d.id,'wish',{name:n,text:s.m.value.trim()});
    const msg=kind==='rsvp'?`تأكيد حضور — ${d.name}\nالاسم: ${n}\n${yes?'راح أحضر، العدد: '+s.c.value:'أعتذر عن الحضور'}`:`تهنئة إلى ${d.name}\nمن: ${n}\n${s.m.value.trim()}`;
    if(host)window.open('https://wa.me/'+host+'?text='+encodeURIComponent(msg),'_blank','noopener');
    toast(kind==='rsvp'?'وصل ردّك، شكراً':'انضافت تهنئتك');s.remove();fillGuest(f,d);};
  s.n.focus({preventScroll:true});
}
function tickCountdowns(root=document){
  $$('[data-cd]',root).forEach(el=>{
    let ms=Math.max(0,+el.dataset.cd-Date.now());const D=Math.floor(ms/864e5);ms-=D*864e5;const H=Math.floor(ms/36e5);ms-=H*36e5;const M=Math.floor(ms/6e4);const S=Math.floor((ms-M*6e4)/1e3);
    const ar=el.dataset.lang!=='en';const v=[D,H,M,S].map((x,i)=>{const s=i?String(x).padStart(2,'0'):String(x);return ar?digits(s):s;});
    el.querySelectorAll('b').forEach((x,i)=>{if(x.textContent!==v[i]){x.textContent=v[i];x.classList.remove('flip');void x.offsetWidth;x.classList.add('flip');}});
  });
}
setInterval(()=>frames.forEach(f=>tickCountdowns(f)),1000);

/* ---------- music: YouTube song library, built-in tracks, links or uploads ---------- */
let audioEl=null,musicFrame=null,ytPlayer=null,ytReady=null,ytOk=false,ytQueued=null;
const isYT=m=>String(m||'').startsWith('yt:');
const ytId=m=>isYT(m)?m.slice(3).replace(/[^\w-]/g,''):'';
function trackSrc(m){m=String(m||'');if(/^data:audio\//.test(m))return m;if(m.startsWith('url:'))return safeUrl(m.slice(4));return'';}
function setMusicUI(f,on){
  if(!f)return;$$('.dock [data-act=music]',f).forEach(b=>b.setAttribute('aria-pressed',on?'true':'false'));
  $$('.sec-song .ipill',f).forEach(b=>{const T=L[f.dataset.lang]||L.ar;b.innerHTML=on?ic('pause')+T.pause:ic('play')+T.play;});
  $$('.vinyl',f).forEach(v=>v.classList.toggle('on',!!on));
  const mp=$('.mpill',f);if(mp){const T=L[f.dataset.lang]||L.ar;mp.innerHTML=on?`<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span>${T.playing}</span>`:`${ic('music')}<span>${T.tap}</span>`;}
}
function stopMusic(){if(audioEl){audioEl.pause();audioEl=null;}try{ytPlayer?.pauseVideo?.();}catch(e){}const f=musicFrame;musicFrame=null;setMusicUI(f,false);}
function loadYT(){
  if(ytReady)return ytReady;
  ytReady=new Promise((res,rej)=>{
    if(window.YT?.Player)return res();
    window.onYouTubeIframeAPIReady=()=>res();
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>rej();document.head.appendChild(s);
    setTimeout(()=>{if(!window.YT?.Player)rej();},7000);
  });
  ytReady.catch(()=>{});
  return ytReady;
}
/* the player is made before the tap, so the tap itself can start the sound (phones require that) */
function prepareMusic(d){
  const id=ytId(d.music);if(!id)return;
  loadYT().then(()=>{
    const opts={width:1,height:1,videoId:id,playerVars:{start:+d.musicStart||0,controls:0,playsinline:1,loop:1,playlist:id},
      events:{onReady:()=>{ytOk=true;if(ytQueued){ytQueued();ytQueued=null;}},onError:()=>{ytOk=false;}}};
    if(ytPlayer?.cueVideoById){ytPlayer.cueVideoById({videoId:id,startSeconds:+d.musicStart||0});return;}
    $('#ytbox').innerHTML='<div id="ytp"></div>';ytPlayer=new YT.Player('ytp',opts);
  }).catch(()=>{});
}
/* uploaded file or direct link */
function playFile(d,f){
  const src=trackSrc(d.music);if(!src){setMusicUI(f,false);return;}
  const a=new Audio(src);a.loop=true;a.volume=.85;audioEl=a;musicFrame=f;
  if(+d.musicStart)a.addEventListener('loadedmetadata',()=>{try{a.currentTime=+d.musicStart}catch(e){}},{once:true});
  a.play().then(()=>{if(audioEl===a)setMusicUI(f,true);}).catch(()=>{if(audioEl===a){audioEl=null;musicFrame=null;setMusicUI(f,false);}});
}
function musicNote(f,txt){const mp=f&&$('.mpill',f);if(mp)mp.innerHTML=`${ic('music')}<span>${txt}</span>`;}
function playMusic(d,f){
  stopMusic();
  if(!isYT(d.music)){playFile(d,f);return;}
  musicFrame=f;
  const go=()=>{if(musicFrame!==f)return;try{ytPlayer.seekTo(+d.musicStart||0,true);ytPlayer.playVideo();setMusicUI(f,true);
    /* the browser refused to start sound without a tap: let the guest tap the pill */
    setTimeout(()=>{if(musicFrame===f&&ytPlayer.getPlayerState?.()!==1){musicFrame=null;setMusicUI(f,false);}},3000);}catch(e){musicFrame=null;setMusicUI(f,false);}};
  if(ytOk&&ytPlayer?.playVideo){go();return;}
  const T=L[f?.dataset.lang]||L.ar;musicNote(f,T.loading);
  ytQueued=go;prepareMusic(d);
  loadYT().catch(()=>{if(musicFrame===f){musicFrame=null;ytQueued=null;musicNote(f,T.noYT);}});
}
function toggleMusic(d,f){if(musicFrame===f){stopMusic();return;}if(!d.music){toast('ما مضاف موسيقى لهاي الهدية');return;}playMusic(d,f);}
/* ---------- effects: a burst when the gift opens, then gentle gold dust ---------- */
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function startFx(canvas,type,colors){
  if(!canvas||reduceMotion)return()=>{};
  const ctx=canvas.getContext('2d');let W,H,raf,alive=true;const dpr=Math.min(devicePixelRatio||1,2);
  function size(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  size();const ro=new ResizeObserver(size);ro.observe(canvas);
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const n=type==='stars'?45:type==='balloons'?12:type==='confetti'||type==='gold'?110:34;
  const mk=init=>({x:rnd(0,W),y:init?rnd(-H*.8,0):(type==='balloons'||type==='bubbles'?H+40:-20),s:rnd(.6,1.3),vx:rnd(-.6,.6),vy:type==='balloons'||type==='bubbles'?rnd(-1.6,-.6):rnd(1.2,2.8),r:rnd(0,6.28),vr:rnd(-.08,.08),c:colors[Math.floor(Math.random()*colors.length)],t:rnd(0,6.28)});
  let P=type==='none'?[]:Array.from({length:n},()=>mk(true));
  if(type==='stars')P=P.map(p=>({...p,y:rnd(0,H)}));
  if(type==='balloons'||type==='bubbles')P=P.map(p=>({...p,y:H+rnd(0,H*.6)}));
  if(type==='confetti'||type==='gold')P=P.map(p=>({...p,x:W/2+rnd(-30,30),y:H*.45,vx:rnd(-6,6),vy:rnd(-9,-2),burst:1}));
  const dust=Array.from({length:26},()=>({x:rnd(0,W),y:rnd(0,H),s:rnd(.4,1.4),vy:rnd(-.25,-.08),t:rnd(0,6.28)}));
  const born=performance.now();
  function heart(x,y,s){ctx.beginPath();ctx.moveTo(x,y+3*s);ctx.bezierCurveTo(x,y,x-6*s,y-s,x-6*s,y+3*s);ctx.bezierCurveTo(x-6*s,y+7*s,x,y+9*s,x,y+12*s);ctx.bezierCurveTo(x,y+9*s,x+6*s,y+7*s,x+6*s,y+3*s);ctx.bezierCurveTo(x+6*s,y-s,x,y,x,y+3*s);ctx.fill();}
  function frame(now){
    if(!alive)return;ctx.clearRect(0,0,W,H);
    const fade=type==='stars'?1:Math.max(0,Math.min(1,(9000-(now-born))/2500));
    if(fade>0)for(const p of P){
      p.t+=.03;ctx.fillStyle=p.c;ctx.strokeStyle=p.c;
      if(type==='stars'){ctx.globalAlpha=.2+.6*Math.abs(Math.sin(p.t));const s=2*p.s;ctx.beginPath();ctx.moveTo(p.x,p.y-s*2);ctx.lineTo(p.x+s*.5,p.y-s*.5);ctx.lineTo(p.x+s*2,p.y);ctx.lineTo(p.x+s*.5,p.y+s*.5);ctx.lineTo(p.x,p.y+s*2);ctx.lineTo(p.x-s*.5,p.y+s*.5);ctx.lineTo(p.x-s*2,p.y);ctx.lineTo(p.x-s*.5,p.y-s*.5);ctx.fill();continue;}
      ctx.globalAlpha=.92*fade;
      if(p.burst){p.vy+=.12;p.vx*=.985;if(p.vy>2.2)p.vy=2.2;}
      p.x+=p.vx+Math.sin(p.t)*.5;p.y+=p.vy;p.r+=p.vr;
      if(type==='confetti'||type==='gold'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillRect(-4*p.s,-2*p.s,8*p.s,4*p.s*Math.abs(Math.cos(p.t*2)));ctx.restore();}
      else if(type==='hearts')heart(p.x,p.y,p.s*1.1);
      else if(type==='petals'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.beginPath();ctx.ellipse(0,0,7*p.s,3.5*p.s,0,0,6.28);ctx.fill();ctx.restore();}
      else if(type==='bubbles'){ctx.globalAlpha=.5*fade;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x,p.y,8*p.s,0,6.28);ctx.stroke();ctx.globalAlpha=.35*fade;ctx.beginPath();ctx.arc(p.x-3*p.s,p.y-3*p.s,2*p.s,0,6.28);ctx.fillStyle='#fff';ctx.fill();}
      else if(type==='balloons'){const r=14*p.s;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.82,r,0,0,6.28);ctx.fill();ctx.globalAlpha=.5*fade;ctx.beginPath();ctx.moveTo(p.x,p.y+r);ctx.quadraticCurveTo(p.x+5,p.y+r+14,p.x,p.y+r+30);ctx.stroke();}
      if(p.y>H+30||p.y<-80){Object.assign(p,mk(false));p.burst=0;}
    }
    for(const q of dust){q.t+=.02;q.y+=q.vy;q.x+=Math.sin(q.t)*.15;if(q.y<-5){q.y=H+5;q.x=rnd(0,W);}
      ctx.globalAlpha=.25+.45*Math.abs(Math.sin(q.t));ctx.fillStyle=colors[0];ctx.beginPath();ctx.arc(q.x,q.y,q.s,0,6.28);ctx.fill();}
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return()=>{alive=false;cancelAnimationFrame(raf);ro.disconnect();ctx.clearRect(0,0,W,H);};
}
const fxColors=d=>d.fx==='hearts'?[d.acc,'#e35d72','#ffb3c1']:d.fx==='stars'?['#f3d27a','#ffffff',d.acc]:d.fx==='gold'?['#e8c46a','#fff1bd','#b8892f','#f6dfa0']:d.fx==='bubbles'?['#ffffff',d.acc]:[d.acc,d.acc2,'#e7c66b','#ffffff',d.ink];

