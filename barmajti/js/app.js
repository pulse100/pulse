/* =========================================================
   برمجتي — المعرض، المعاينة، الطلب، لوحة التصميم
   ========================================================= */
function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(DATA));return true}catch(e){toast('ما انحفظ: مساحة المتصفح امتلأت (غالباً بسبب الصور أو الأغاني المرفوعة)');return false}}
const sess={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
async function copyText(txt,fallbackEl){
  try{await navigator.clipboard.writeText(txt);toast('تم النسخ');}
  catch(e){if(fallbackEl){const r=document.createRange();r.selectNodeContents(fallbackEl);const s=getSelection();s.removeAllRanges();s.addRange(r);}toast('حدّد النص وانسخه يدوياً');}
}
function normalize(v){return{seq:Math.max(v.seq||0,DEFAULTS.seq),settings:{...DEFAULTS.settings,...(v.settings||{})},fonts:v.fonts||[],designs:(v.designs||[]).filter(d=>CATS[d.cat]).map(d=>{const o={...structuredClone(base),...d};if(/^trk:/.test(o.music||'')){const sg=songsFor(o.cat)[0];o.music=sg?'yt:'+sg.id:'';o.musicStart=sg?sg.s:0;}return o;})};}

/* =========================================================
   PUBLIC SITE
   ========================================================= */
let filter='all',query='',sortBy='new';
const visible=()=>DATA.designs.filter(d=>d.show);
const slugOf=k=>Object.keys(SLUGS).find(s=>SLUGS[s]===k);
function readCategory(){let q=null;try{q=new URLSearchParams(location.search).get('category');}catch(e){}return SLUGS[q]||SLUGS[location.hash.slice(1)]||null;}
function writeCategory(k){try{const u=new URL(location.href);if(k==='all')u.searchParams.delete('category');else u.searchParams.set('category',slugOf(k));history.replaceState(null,'',u.pathname+u.search+u.hash);}catch(e){}}
function readGuest(){try{return (new URLSearchParams(location.search).get('to')||'').trim().slice(0,80);}catch(e){return'';}}
const wantsNames=()=>{try{return new URLSearchParams(location.search).has('names');}catch(e){return false;}};
function readGift(){let q=null;try{q=new URLSearchParams(location.search).get('gift');}catch(e){}const h=location.hash.slice(1);const code=(q||(/^BR-\d+$/i.test(h)?h:'')||'').toUpperCase();return code?DATA.designs.find(d=>d.code===code):null;}

/* thumbnails are drawn only when they scroll into view */
const lazyObs='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;lazyObs.unobserve(el);const d=DATA.designs.find(x=>x.id===el.dataset.id);if(d){const p=phone(d,'thumb');p.dataset.view=d.id;p.setAttribute('role','button');p.tabIndex=0;p.setAttribute('aria-label','معاينة '+d.title);el.replaceWith(p);}}),{rootMargin:'400px'}):null;
function thumbSlot(d){const s=document.createElement('div');s.className='phone ph-slot';s.dataset.id=d.id;if(lazyObs)lazyObs.observe(s);else setTimeout(()=>{const p=phone(d,'thumb');p.dataset.view=d.id;s.replaceWith(p);});return s;}
function cardEl(d){
  const c=document.createElement('article');c.className='tcard';c.appendChild(thumbSlot(d));
  c.insertAdjacentHTML('beforeend',`<div class="tmeta"><div><h3>${esc(d.title)}</h3><span>${CATS[d.cat]||''}</span></div><span class="code">${esc(d.code)}</span></div>
    <div class="tbtns"><button class="btn rose" type="button" data-view="${d.id}">معاينة</button><button class="btn ghost" type="button" data-order="${d.id}">اطلب</button></div>`);
  return c;
}
function renderChips(){
  const v=visible();
  const items=[['all','الكل',v.length],...Object.entries(CATS).map(([k,n])=>[k,n,v.filter(d=>d.cat===k).length]).filter(x=>x[2])];
  $('#chips').innerHTML=items.map(([k,n,c])=>`<button class="chip" type="button" data-f="${k}" aria-pressed="${filter===k}">${n}<small>${digits(c)}</small></button>`).join('');
}
function listed(){
  const q=query.trim().toLowerCase();
  let l=visible().filter(d=>filter==='all'||d.cat===filter).filter(d=>!q||[d.title,d.name,d.code,CATS[d.cat],d.sub].join(' ').toLowerCase().includes(q));
  if(sortBy==='pop')l=[...l].sort((a,b)=>(b.pop||0)-(a.pop||0));
  return l;
}
function renderGrid(){
  const g=$('#grid');g.innerHTML='';g.className='';
  if(filter==='all'&&!query.trim()){
    /* one shelf per occasion */
    $('#count').textContent=`${digits(visible().length)} تصميم بـ ${digits(Object.keys(CATS).length)} أقسام`;
    Object.entries(CATS).forEach(([k,n])=>{
      let l=visible().filter(d=>d.cat===k);if(!l.length)return;
      if(sortBy==='pop')l=[...l].sort((a,b)=>(b.pop||0)-(a.pop||0));
      const s=document.createElement('section');s.className='shelf';
      s.innerHTML=`<div class="shelf-h"><h3>${n}<small>${digits(l.length)} تصميم</small></h3><button class="btn sm ghost" type="button" data-f="${k}">عرض الكل</button></div><div class="shelf-row"></div>`;
      const row=$('.shelf-row',s);l.forEach(d=>row.appendChild(cardEl(d)));g.appendChild(s);
    });
    return;
  }
  const list=listed();g.className='grid';
  $('#count').textContent=`${digits(list.length)} تصميم`;
  if(!list.length){g.innerHTML='<div class="empty" style="grid-column:1/-1">ماكو تصاميم تطابق البحث.</div>';return;}
  list.forEach(d=>g.appendChild(cardEl(d)));
}
function renderContact(){
  const s=DATA.settings,rows=[];
  const row=(label,val,href,btn)=>`<div class="contact-row"><div><span>${label}</span><br><strong>${esc(val)}</strong></div>${href?`<a class="btn sm rose" href="${href}" target="_blank" rel="noopener">${btn}</a>`:''}</div>`;
  if(s.whatsapp)rows.push(row('واتساب',s.whatsapp,'https://wa.me/'+s.whatsapp.replace(/\D/g,''),'راسلنا'));
  if(s.phone)rows.push(row('اتصال',s.phone,'tel:'+s.phone.replace(/[^\d+]/g,''),'اتصل'));
  if(s.telegram)rows.push(row('تيليجرام','@'+s.telegram.replace(/^@/,''),'https://t.me/'+encodeURIComponent(s.telegram.replace(/^@/,'')),'افتح'));
  rows.push(row('إنستغرام','@'+ig(),'https://www.instagram.com/'+ig(),'تابعنا'));
  $('#contactList').innerHTML=rows.join('');
  $('#tagline').textContent=s.tagline||DEFAULTS.settings.tagline;
  $('#footIg').href='https://www.instagram.com/'+ig();$('#footIg').textContent='@'+ig();
}
function renderHero(){
  const v=visible();const pick=[...v.filter(d=>d.feat),...v].filter((d,i,a)=>a.indexOf(d)===i).slice(0,3);
  const art=$('#heroArt');art.innerHTML='';
  pick.forEach(d=>{const p=phone(d,'thumb');p.dataset.view=d.id;p.style.cursor='pointer';art.appendChild(p);});
  $('#heroPlay').onclick=()=>pick[1]?openViewer(pick[1].id):pick[0]&&openViewer(pick[0].id);
}
function renderSite(){renderChips();renderGrid();renderContact();renderHero();}
function drawCircuit(){
  const c=$('#circuit');if(!c)return;const r=c.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(devicePixelRatio||1,2);
  c.width=r.width*dpr;c.height=r.height*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);x.strokeStyle='#a77d78';x.fillStyle='#fff';x.lineWidth=1.4;x.globalAlpha=.3;
  let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  for(let i=0;i<12;i++){let px=r.width*(rnd()<.5?rnd()*.1:.9+rnd()*.1),py=rnd()*r.height;x.beginPath();x.moveTo(px,py);
    for(let s=0;s<3;s++){if(s%2)py+=(rnd()-.5)*90;else px+=(px<r.width/2?1:-1)*(30+rnd()*60);x.lineTo(px,py);}x.stroke();x.beginPath();x.arc(px,py,4,0,6.28);x.fill();x.stroke();}
}

/* ---------- viewer ---------- */
function clearLayer(){$$('#layer .frame').forEach(f=>f._cleanup&&f._cleanup());$('#layer').innerHTML='';document.body.style.overflow='';}
const musicLabel=d=>isYT(d.music)?(songById(ytId(d.music))?.n||'أغنية من يوتيوب'):(d.music?'أغنية مرفوعة':'بدون موسيقى');
function openViewer(id,d0){
  const d=d0||DATA.designs.find(x=>x.id===id);if(!d)return;
  clearLayer();
  const ov=document.createElement('div');ov.className='overlay viewer';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','معاينة '+d.title);
  ov.appendChild(phone(d,'live'));
  const orderable=!d0;
  ov.insertAdjacentHTML('beforeend',`<aside class="vside">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px"><div class="meta-row"><span class="code">${esc(d.code||'معاينة')}</span><span>${CATS[d.cat]||''}</span></div><button class="x" type="button" data-close aria-label="إغلاق">×</button></div>
      <h2>${esc(d.title)}</h2>
      <p class="note">افتح الهدية مثل ما توصل للشخص: تشتغل الموسيقى، وتنزل الصفحة وحدها، وتكدر تلمسها وتسحبها بنفسك.</p>
      <div class="meta-row">${LAYOUTS[d.layout]||''} · ${INTROS[d.intro]||''}</div>
      <div class="meta-row">🎵 ${esc(musicLabel(d))}</div>
      <div class="btns">${orderable?`<button class="btn rose" type="button" data-order="${d.id}">اطلب هذا التصميم</button>`:''}<button class="btn ghost" type="button" data-replay>أعد التشغيل</button></div>
    </aside>
    <div class="vtop"><button class="x" type="button" data-close aria-label="إغلاق">×</button>${orderable?`<button class="btn rose sm" type="button" data-order="${d.id}">اطلب هذا التصميم</button>`:''}</div>`);
  ov.addEventListener('click',e=>{
    if(e.target===ov||e.target.closest('[data-close]'))clearLayer();
    else if(e.target.closest('[data-replay]'))openViewer(id,d0);
    else if(e.target.closest('[data-order]'))openOrder(id);
  });
  $('#layer').appendChild(ov);document.body.style.overflow='hidden';
  ($('[data-open]',ov)||$('.x',ov)).focus({preventScroll:true});
}

/* ---------- order ---------- */
function openOrder(id){
  const d=DATA.designs.find(x=>x.id===id);if(!d)return;
  clearLayer();
  const ov=document.createElement('div');ov.className='overlay';
  ov.innerHTML=`<form class="sheet" id="orderForm" role="dialog" aria-modal="true" aria-labelledby="oT">
      <button class="x" type="button" data-close aria-label="إغلاق">×</button>
      <div class="meta-row"><span class="code">${esc(d.code)}</span><span>${CATS[d.cat]||''}</span></div>
      <h2 id="oT">اطلب: ${esc(d.title)}</h2>
      <p class="note" style="margin:0">اكتب التفاصيل، وتنرسل لنا كرسالة جاهزة. الأسعار والتعديلات نتفاهم عليها بالمحادثة.</p>
      <div class="two"><div class="field"><label for="o_to">الاسم اللي ينكتب بالهدية</label><input id="o_to" required placeholder="مثلاً: ${esc(d.name)}"></div>
        <div class="field"><label for="o_from">اسمك</label><input id="o_from" placeholder="اسم صاحب الطلب"></div></div>
      <div class="two"><div class="field"><label for="o_date">تاريخ المناسبة</label><input id="o_date" type="date"></div>
        <div class="field"><label for="o_time">الوقت</label><input id="o_time" type="time"></div></div>
      <div class="field"><label for="o_venue">المكان</label><input id="o_venue" placeholder="اختياري"></div>
      <div class="field"><label for="o_msg">النص أو الرسالة</label><textarea id="o_msg" placeholder="${esc(d.invite)}"></textarea><span class="hint">إذا تتركها فارغة نكتب نص مناسب.</span></div>
      <div class="two"><div class="field"><label for="o_song">الأغنية</label><select id="o_song"><option>${esc(musicLabel(d))} (نفس التصميم)</option>${songsFor(d.cat).map(s=>`<option>${esc(s.n)}</option>`).join('')}<option>أغنية ثانية (أكتبها بالملاحظات)</option></select></div>
        <div class="field"><label for="o_photo">صور؟</label><select id="o_photo"><option>بدون صور</option><option>راح أرسل صور بالواتساب</option></select></div></div>
      <div class="field"><label for="o_rsvp">تأكيد الحضور والتهاني توصل على</label><input id="o_rsvp" dir="ltr" inputmode="tel" placeholder="رقم واتساب (اختياري)"></div>
      <div class="field"><label for="o_notes">ملاحظات (ألوان، برنامج الحفل، لغة الدعوة…)</label><input id="o_notes" placeholder="اختياري"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn rose" type="submit">جهّز الطلب</button><button class="btn ghost" type="button" data-back>رجوع للمعاينة</button></div>
      <div class="order-out" id="orderOut" hidden><pre id="orderTxt"></pre><div class="order-btns" id="orderBtns"></div><span class="note" id="orderNote"></span></div>
    </form>`;
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-close]'))clearLayer();else if(e.target.closest('[data-back]'))openViewer(id);});
  $('#layer').appendChild(ov);document.body.style.overflow='hidden';
  $('#orderForm').onsubmit=e=>{e.preventDefault();buildOrder(d);};
  setTimeout(()=>$('#o_to').focus({preventScroll:true}),50);
}
function buildOrder(d){
  const v=id=>$('#'+id).value.trim(),s=DATA.settings;
  const out=['مرحباً برمجتي، أريد أطلب هدية إلكترونية',`التصميم: ${d.title} (${d.code})`,`القسم: ${CATS[d.cat]||''}`,`الاسم بالهدية: ${v('o_to')}`,
    v('o_from')&&`صاحب الطلب: ${v('o_from')}`,v('o_date')&&`التاريخ: ${v('o_date')}${v('o_time')?' الساعة '+v('o_time'):''}`,v('o_venue')&&`المكان: ${v('o_venue')}`,
    v('o_msg')&&`النص: ${v('o_msg')}`,`الأغنية: ${v('o_song')}`,`الصور: ${v('o_photo')}`,v('o_rsvp')&&`رقم تأكيد الحضور: ${v('o_rsvp')}`,v('o_notes')&&`ملاحظات: ${v('o_notes')}`].filter(Boolean).join('\n');
  $('#orderTxt').textContent=out;$('#orderOut').hidden=false;
  const enc=encodeURIComponent(out),btns=[];
  if(s.whatsapp)btns.push(`<a class="btn wa" href="https://wa.me/${s.whatsapp.replace(/\D/g,'')}?text=${enc}" target="_blank" rel="noopener">أرسل على واتساب</a>`);
  if(s.telegram)btns.push(`<a class="btn" href="https://t.me/${encodeURIComponent(s.telegram.replace(/^@/,''))}" target="_blank" rel="noopener">تيليجرام</a>`);
  btns.push(`<a class="btn ghost" href="https://www.instagram.com/${ig()}" target="_blank" rel="noopener">إنستغرام @${ig()}</a>`);
  if(s.phone)btns.push(`<a class="btn ghost" href="tel:${s.phone.replace(/[^\d+]/g,'')}">اتصال ${esc(s.phone)}</a>`);
  btns.push(`<button class="btn ghost" type="button" id="cpOrder">انسخ الطلب</button>`);
  $('#orderBtns').innerHTML=btns.join('');$('#cpOrder').onclick=()=>copyText(out,$('#orderTxt'));
  $('#orderNote').textContent=s.whatsapp||s.phone?'إذا ما انفتح الواتساب، انسخ الطلب ودزّه على الرقم: '+(s.whatsapp||s.phone):'انسخ الطلب ودزّه لنا على الإنستغرام @'+ig();
  $('#orderOut').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function openGiftMode(d){
  const guest=readGuest();if(guest){let line='';try{line=(new URLSearchParams(location.search).get('line')||'').slice(0,120);}catch(e){}d={...d,guest,...(line?{guestLine:line}:{})};}
  const g=document.createElement('div');g.className='giftmode';g.id='giftmode';g.appendChild(makeFrame(d,'live'));
  document.body.appendChild(g);document.body.style.overflow='hidden';document.title=(guest?guest+' · ':'')+(d.sub?d.sub+' · ':'')+d.name;
}
/* personal invitations: one link per guest name. Opened from the admin list, or by the client with ?gift=CODE&names */
const NAMES_KEY=code=>'barmajti:names:'+code;
function namesURL(d){try{const u=new URL(location.href);u.hash='';u.search='?gift='+d.code+'&names';return u.href;}catch(e){return '?gift='+d.code+'&names';}}
function namesTool(d,standalone){
  let saved='';try{saved=localStorage.getItem(NAMES_KEY(d.code))||'';}catch(e){}
  const ov=document.createElement('div');ov.className='overlay'+(standalone?' names-page':'');
  ov.innerHTML=`<div class="sheet names" role="dialog" aria-modal="true" aria-labelledby="nT">${standalone?'':'<button class="x" type="button" data-close aria-label="إغلاق">×</button>'}
    <h2 id="nT">دعوات بالاسم · ${esc(d.name)}</h2>
    <p class="note" style="margin:0">اكتب اسم كل ضيف بسطر. كل اسم ياخذ رابط خاص، ولما يفتحه تطلع الدعوة باسمه.</p>
    <div class="field"><label for="nLine">الجملة اللي قبل الاسم</label><input id="nLine" value="${esc(d.guestLine||L.ar.guestLine)}"></div>
    <div class="field"><label for="nList">الأسماء</label><textarea id="nList" rows="7" placeholder="السيد علي حسن وعائلته&#10;الحاج أبو محمد&#10;الست أم زينب">${esc(saved)}</textarea></div>
    <div class="row"><button class="btn sm" type="button" id="nMake">سوّي الروابط</button><button class="btn sm ghost" type="button" id="nAll">نسخ كل الروابط</button>${standalone?'':'<button class="btn sm ghost" type="button" id="nHost">نسخ رابط الصفحة للزبون</button>'}</div>
    <div class="nlist" id="nOut"></div></div>`;
  const out=$('#nOut',ov),list=()=>lines($('#nList',ov).value);
  const link=n=>{const u=giftURL(d,n);const l=$('#nLine',ov).value.trim();return l&&l!==(d.guestLine||L.ar.guestLine)?u+'&line='+encodeURIComponent(l):u;};
  const draw=()=>{const ns=list();try{localStorage.setItem(NAMES_KEY(d.code),ns.join('\n'));}catch(e){}
    out.innerHTML=ns.map((n,i)=>`<div class="nrow"><b>${esc(n)}</b><span><button class="btn sm ghost" type="button" data-cp="${i}">نسخ</button><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(n+'\n'+$('#nLine',ov).value.trim()+'\n'+link(n))}">واتساب</a><a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(link(n))}">معاينة</a></span></div>`).join('')||'<p class="note">ماكو أسماء بعد</p>';};
  $('#nMake',ov).onclick=draw;
  $('#nAll',ov).onclick=()=>{const ns=list();if(!ns.length){toast('اكتب الأسماء أول');return;}copyText(ns.map(n=>n+': '+link(n)).join('\n'));};
  if(!standalone)$('#nHost',ov).onclick=()=>copyText(namesURL(d));
  out.addEventListener('click',e=>{const b=e.target.closest('[data-cp]');if(b)copyText(link(list()[+b.dataset.cp]));});
  ov.addEventListener('click',e=>{if(!standalone&&(e.target===ov||e.target.closest('[data-close]')))ov.remove();});
  document.body.appendChild(ov);if(saved)draw();
}

/* =========================================================
   ADMIN
   ========================================================= */
let tab='list',editing=null;
const authed=()=>sess.get('barmajti:auth')==='1';
function blank(){return{...structuredClone(base),...applyPal('ivoryGold'),id:'d'+Date.now().toString(36),code:'',cat:'wed',title:'',name:'الاسم',sub:'',sections:[...ORDER.wed],music:'yt:'+songsFor('wed')[0].id,layers:LP.baroque('gold')};}
function renderAdmin(){
  $('#tabs').hidden=!authed();
  $$('#tabs .tab[data-tab]').forEach(t=>t.setAttribute('aria-selected',t.dataset.tab===tab));
  const P=$('#panel');$$('.frame',P).forEach(f=>f._cleanup&&f._cleanup());
  if(!authed()){
    P.innerHTML=`<form class="login" id="loginForm"><img src="logo.png" alt="برمجتي"><h2>دخول المصمم</h2>
      <div class="field"><label for="code">رمز الدخول</label><input id="code" type="password" autocomplete="off" required></div>
      <button class="btn" type="submit">دخول</button><span class="note" id="loginErr" role="alert"></span></form>`;
    $('#loginForm').onsubmit=e=>{e.preventDefault();if($('#code').value===String(DATA.settings.adminCode)){sess.set('barmajti:auth','1');renderAdmin();}else $('#loginErr').textContent='الرمز غير صحيح.';};
    $('#code').focus();return;
  }
  ({list:adminList,edit:adminEdit,fonts:adminFonts,settings:adminSettings,publish:adminPublish})[tab](P);
}
function nextCode(){DATA.seq=(DATA.seq||1000)+1;return 'BR-'+DATA.seq;}
let adminCat='all';
function adminList(P){
  const list=DATA.designs.filter(d=>adminCat==='all'||d.cat===adminCat);
  P.innerHTML=`<div class="sec-head"><div><h2>التصاميم (${digits(DATA.designs.length)})</h2><p>المخفي ما يظهر بالمعرض، بس رابطه يشتغل. لهدية زبون: انسخ تصميم، غيّر الاسم والتاريخ، ودزّ "رابط الهدية".</p></div>
    <button class="btn rose" type="button" id="newD">+ تصميم جديد</button></div>
    <div class="chips" id="acats">${[['all','الكل'],...Object.entries(CATS)].map(([k,n])=>`<button class="chip" type="button" data-ac="${k}" aria-pressed="${adminCat===k}">${n}<small>${digits(k==='all'?DATA.designs.length:DATA.designs.filter(d=>d.cat===k).length)}</small></button>`).join('')}</div>
    <div class="alist" id="alist"></div>`;
  $('#newD').onclick=()=>{editing=null;tab='edit';renderAdmin();};
  $('#acats').onclick=e=>{const b=e.target.closest('[data-ac]');if(!b)return;adminCat=b.dataset.ac;renderAdmin();};
  const A=$('#alist');
  list.forEach(d=>{
    const i=DATA.designs.indexOf(d);
    const it=document.createElement('div');it.className='aitem'+(d.show?'':' off');
    it.appendChild(thumbSlot(d));
    it.insertAdjacentHTML('beforeend',`<h3>${esc(d.title||'بدون اسم')}</h3>
      <div class="row"><span class="code">${esc(d.code)}</span><span class="pill">${CATS[d.cat]||''}</span>${d.show?'':'<span class="pill off">مخفي</span>'}${d.feat?'<span class="pill">بالواجهة</span>':''}</div>
      <div class="row"><button class="btn sm" type="button" data-a="edit">تعديل</button><button class="btn sm ghost" type="button" data-a="link">رابط الهدية</button><button class="btn sm ghost" type="button" data-a="guests">ردود الضيوف</button><button class="btn sm ghost" type="button" data-a="names">دعوات بالاسم</button>
        <button class="btn sm ghost" type="button" data-a="toggle">${d.show?'إخفاء':'إظهار'}</button><button class="btn sm ghost" type="button" data-a="dup">نسخ</button>
        <button class="btn sm ghost" type="button" data-a="up" ${i?'':'disabled'} aria-label="تقديم">↑</button><button class="btn sm ghost" type="button" data-a="del">حذف</button></div>`);
    it.addEventListener('click',async e=>{
      const btn=e.target.closest('[data-a]'),a=btn?.dataset.a;if(!a)return;
      if(a==='edit'){editing=d.id;tab='edit';renderAdmin();return;}
      if(a==='link'){copyText(giftURL(d));return;}
      if(a==='guests'){showGuests(d);return;}
      if(a==='names'){namesTool(d);return;}
      if(a==='toggle')d.show=!d.show;
      if(a==='dup'){const c={...structuredClone(d),id:'d'+Date.now().toString(36),code:nextCode(),title:d.title+' (نسخة)',show:false,feat:false};DATA.designs.splice(i+1,0,c);}
      if(a==='up')[DATA.designs[i-1],DATA.designs[i]]=[DATA.designs[i],DATA.designs[i-1]];
      if(a==='del'){if(btn.dataset.confirm!=='1'){btn.dataset.confirm='1';btn.textContent='تأكيد الحذف';btn.style.cssText='background:#b3261e;color:#fff;border-color:#b3261e';return;}DATA.designs.splice(i,1);}
      save();renderAdmin();renderSite();
    });
    A.appendChild(it);
  });
}
async function showGuests(d){
  const g=await Guest.list(d.code);
  const ov=document.createElement('div');ov.className='overlay';
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><button class="x" type="button" data-close aria-label="إغلاق">×</button><h2>ردود الضيوف · ${esc(d.title)}</h2>
    <p class="note" style="margin:0">${Guest.sb()?'من قاعدة البيانات':'محفوظة على هذا الجهاز فقط. اربط قاعدة البيانات من الإعدادات حتى توصلك ردود كل الضيوف.'}</p>
    <h3>الحضور (${digits(g.rsvp.filter(r=>r.text!=='no').reduce((a,r)=>a+(+r.count||1),0))})</h3>${g.rsvp.map(r=>`<div class="note">${esc(r.name)} — ${r.text==='no'?'يعتذر':'جاي، العدد '+digits(r.count||1)}</div>`).join('')||'<p class="note">ماكو ردود بعد</p>'}
    <h3>التهاني</h3>${g.wish.map(w=>`<div class="note"><b>${esc(w.name)}:</b> ${esc(w.text)}</div>`).join('')||'<p class="note">ماكو تهاني بعد</p>'}
    <h3>صور الضيوف (${digits(g.photo.length)})</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${g.photo.map(p=>`<img src="${esc(p.photo)}" alt="" style="width:90px;height:110px;object-fit:cover;border-radius:8px">`).join('')||'<p class="note">ماكو صور بعد</p>'}</div></div>`;
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-close]'))ov.remove();});
  document.body.appendChild(ov);
}
const artThumb=(a,t)=>{const A=ART[a];if(!A)return'';if(A.svg)return SVGART[a](t||Object.keys(A.tints)[0]);if(A.mask)return`<div class="mask tn-${TINTS[t]?t:'gold'}" style="--m:url(${ART_DIR}${a}.webp)"></div>`;return`<img src="${ART_DIR}${a}.webp" alt="" loading="lazy">`;};
/* fields each section can edit inside the designer */
const SEC_FIELDS={
  card:[['guestLine','الجملة قبل اسم الضيف (بالدعوات بالاسم)'],['cardTitle','عنوان البطاقة'],['invite','نص الدعوة','ta']],
  family:[['family','كل سطر: الصفة | الأسماء','pairs']],
  message:[['msgTitle','العنوان'],['msgBody','الكلمة','ta'],['msgSign','التوقيع']],
  quote:[['quote','الآية أو البيت','ta'],['quoteSrc','المصدر']],
  album:[['photos','__photos']],
  venue:[['venue','اسم المكان'],['map','رابط الخريطة','url'],['venue2','مكان ثاني (اختياري)'],['map2','رابط الخريطة الثانية','url']],
  calendar:[['hijri','اعرض التاريخ الهجري','check']],
  program:[['program','كل سطر: الوقت | الفقرة','pairs']],
  details:[['details','كل سطر تعليمة','lines']],
  video:[['video','رابط يوتيوب','url']],
  wishes:[['wishes','تهاني جاهزة — كل سطر: الاسم: التهنئة','lines']],
  attend:[['attendBase','رقم يبدأ منه العداد','num']],
  contacts:[['contacts','كل سطر: الاسم | رقم الواتساب','pairs']],
  closing:[['closing','كلمة الختام','ta']]
};
function adminEdit(P){
  const src=editing?DATA.designs.find(x=>x.id===editing):null;
  const d=src?structuredClone(src):blank();
  if(!d.sections)d.sections=[...(ORDER[d.cat]||ORDER.wed)];
  d.photos=[...(d.photos||[]),...(d.img?[d.img]:[])];d.img='';d.titles={...(d.titles||{})};
  const radios=(name,o,v)=>`<div class="seg">${Object.entries(o).map(([k,n])=>`<label><input type="radio" name="${name}" value="${k}" ${k===v?'checked':''}>${n}</label>`).join('')}</div>`;
  const opt=(o,v)=>Object.entries(o).map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${n}</option>`).join('');
  const fopt=(list,v)=>list.map(([f,n])=>`<option value="${esc(f)}" ${f===v?'selected':''}>${esc(n)} — ${esc(f)}</option>`).join('');
  const inp=(id,label,val,extra='')=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" value="${esc(val)}" ${extra}></div>`;
  allFonts().forEach(f=>loadFont(f[0]));
  const mus=String(d.music||'');
  P.innerHTML=`<div class="designer"><form id="dform" novalidate>
      <div class="sec-head" style="margin:0"><h2>${src?'تعديل: '+esc(src.title):'تصميم جديد'}</h2></div>
      <fieldset><legend>بالمعرض</legend>
        <div class="two">${inp('f_title','اسم التصميم بالمعرض',d.title,'required')}<div class="field"><label for="f_cat">القسم</label><select id="f_cat">${opt(CATS,d.cat)}</select></div></div>
        <div class="three"><label class="check"><input type="checkbox" id="f_show" ${d.show?'checked':''}> يظهر بالمعرض</label><label class="check"><input type="checkbox" id="f_feat" ${d.feat?'checked':''}> بواجهة الموقع</label>
          <div class="field"><label for="f_pop">ترتيب "الأكثر طلباً"</label><input id="f_pop" type="number" min="0" max="99" value="${+d.pop||0}"></div></div>
      </fieldset>
      <fieldset><legend>الشكل العام</legend>
        <div class="field"><span class="lbl">طريقة العرض</span>${radios('f_layout',LAYOUTS,d.layout)}</div>
        <div class="field"><span class="lbl">الخلفية</span>${radios('f_theme',THEMES,d.theme)}</div>
        <div class="field"><span class="lbl">صورة حقيقية فوق</span>${radios('f_pmode',PHOTO_MODES,d.photoMode)}</div>
        <div class="bggrid" id="bggrid">${Object.entries(BGS).map(([k,n])=>`<button type="button" data-bg="${k}" title="${n}" aria-pressed="${d.photo===BG_DIR+k+'.webp'}"><img src="${BG_DIR+k}.webp" alt="${n}" loading="lazy"></button>`).join('')}
          <label class="bgup">+ صورتك<input type="file" id="f_bgup" accept="image/*" hidden></label></div>
        <div class="two"><div class="field"><label for="f_frame">إطار حول الاسم</label><select id="f_frame">${opt(FRAMES,d.frame)}</select></div>
          <div class="field"><label for="f_corners">زخرفة البطاقات والفواصل</label><select id="f_corners">${opt({none:'بدون',...TINTS},d.corners)}</select></div></div>
      </fieldset>
      <fieldset><legend>الفتح والتأثير</legend>
        <div class="field"><span class="lbl">طريقة فتح الهدية</span>${radios('f_intro',INTROS,d.intro)}</div>
        <div class="two"><div class="field"><label for="f_fx">التأثير بعد الفتح</label><select id="f_fx">${opt(EFFECTS,d.fx)}</select></div>
          <div class="field"><label for="f_wax">لون الختم الشمعي</label><input type="color" id="f_wax" value="${hex(d.wax)}"></div></div>
      </fieldset>
      <fieldset><legend>الموسيقى (تشتغل وحدها أول ما تنفتح)</legend>
        <div class="field"><label for="f_msearch">ابحث بمكتبة الأغاني</label><input id="f_msearch" placeholder="نانسي، زفة، تخرج، Perfect…"></div>
        <div class="tracklist" id="songlist"></div>
        <div class="three"><div class="field"><label for="f_mstart">تبدأ من الثانية</label><input id="f_mstart" type="number" min="0" value="${+d.musicStart||0}"></div>
          <div class="field"><label for="f_yt">أو رابط يوتيوب ثاني</label><input id="f_yt" dir="ltr" placeholder="https://youtu.be/…"></div>
          <div class="field"><label for="f_mfile">أو ارفع ملف (أقل من ٣ ميغا)</label><input id="f_mfile" type="file" accept="audio/*"></div></div>
        <p class="note" style="margin:0" id="mcur"></p>
      </fieldset>
      <fieldset><legend>الرسوم والملصقات</legend>
        <div class="artgrid" id="artgrid">${Object.entries(ART).map(([k,a])=>`<button type="button" data-add="${k}" title="${a.n}"><span class="pv">${artThumb(k)}</span>${a.n}</button>`).join('')}</div>
        <div class="layers" id="layers"></div>
      </fieldset>
      <fieldset><legend>الاسم والخطوط</legend>
        <div class="two">${inp('f_name','الاسم الكبير',d.name)}${inp('f_sub','سطر فوق الاسم',d.sub)}</div>
        <div class="three"><div class="field"><label for="f_metal">لون الاسم</label><select id="f_metal">${opt(METALS,d.metal)}</select></div>
          ${inp('f_mono','حرف كبير خلف الاسم',d.mono,'maxlength="3"')}<div class="field"><label for="f_mo">شفافية الحرف</label><input id="f_mo" type="range" min="0.05" max="1" step="0.05" value="${d.mo??.9}"></div></div>
        <div class="two"><div class="field"><label for="f_fName">خط الاسم</label><select id="f_fName">${fopt(allFonts(),d.fName)}</select></div><div class="field"><label for="f_fTitle">خط العناوين</label><select id="f_fTitle">${fopt(allFonts(),d.fTitle)}</select></div></div>
        <div class="three"><div class="field"><label for="f_fBody">خط النص</label><select id="f_fBody">${fopt(BODY_FONTS.map(f=>[f,fontLabel(f)]),d.fBody)}</select></div>
          <div class="field"><label for="f_ns">حجم الاسم</label><input id="f_ns" type="range" min="0.4" max="1.6" step="0.05" value="${d.ns}"></div><div class="field"><label for="f_ts">حجم العناوين</label><input id="f_ts" type="range" min="0.5" max="1.6" step="0.05" value="${d.ts}"></div></div>
        <div class="two">${inp('f_date','تاريخ المناسبة',d.date,'type="date"')}${inp('f_time','الوقت',d.time,'type="time"')}</div>
      </fieldset>
      <fieldset><legend>أقسام الدعوة</legend>
        <p class="note" style="margin:0">فعّل القسم اللي تريده، رتّبه بالأسهم، وغيّر عنوانه ومحتواه. الأقسام الفارغة ما تظهر.</p>
        <div class="seclist" id="seclist"></div>
      </fieldset>
      <fieldset><legend>الضيوف</legend>
        ${inp('f_host','واتساب صاحب المناسبة (توصله التهاني وتأكيد الحضور)',d.host||'','dir="ltr" inputmode="tel" placeholder="9647XXXXXXXXX"')}
      </fieldset>
      <fieldset><legend>الألوان</legend>
        <div class="palgrid" id="palgrid">${Object.entries(PAL).map(([k,p])=>`<button type="button" data-pal="${k}" aria-pressed="${d.pal===k}"><span>${p.slice(1,6).map(c=>`<i style="background:${c}"></i>`).join('')}</span>${p[0]}</button>`).join('')}</div>
        <div class="colors">${[['bg','الخلفية'],['card','البطاقات'],['ink','الكتابة'],['acc','الأساسي'],['acc2','الثانوي'],['door','غلاف الفتح']].map(([k,n])=>`<div class="field"><label for="f_${k}">${n}</label><input type="color" id="f_${k}" value="${hex(d[k])}"></div>`).join('')}</div>
      </fieldset>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn rose" type="submit">${src?'احفظ التعديل':'أضف للمعرض'}</button><button class="btn ghost" type="button" id="cancelEd">إلغاء</button></div>
    </form>
    <aside class="dprev"><strong style="text-align:center">معاينة مباشرة</strong><div id="live" style="display:flex;justify-content:center"></div>
      <button class="btn rose sm" type="button" id="livePlay">افتحها مثل الزائر (مع الموسيقى)</button></aside></div>`;
  const live=$('#live');let cur=null,prevAudio=null,prevKey='';
  let pt;const soon=()=>{clearTimeout(pt);pt=setTimeout(paint,160);};
  /* music library */
  const renderSongs=()=>{
    const q=$('#f_msearch').value.trim().toLowerCase();
    const rows=[...SONGS.map(s=>({v:'yt:'+s.id,n:s.n,tag:s.c.map(c=>CATS[c]).filter(Boolean).slice(0,3).join('، '),yt:s.id,cats:s.c}))]
      .filter(r=>!q||(r.n+' '+r.tag).toLowerCase().includes(q))
      .sort((a,b)=>(b.cats?.includes(d.cat)?1:0)-(a.cats?.includes(d.cat)?1:0));
    $('#songlist').innerHTML=rows.map(r=>`<label class="track"><input type="radio" name="f_mus" value="${esc(r.v)}" ${d.music===r.v?'checked':''}><span>${esc(r.n)}<small>${esc(r.tag||'')}</small></span>${r.prev?`<button class="btn sm ghost" type="button" data-prev="${esc(r.prev)}">▶ اسمع</button>`:`<a class="btn sm ghost" href="https://www.youtube.com/watch?v=${r.yt}" target="_blank" rel="noopener">يوتيوب</a>`}</label>`).join('')
      +`<label class="track"><input type="radio" name="f_mus" value="" ${!d.music?'checked':''}><span>بدون موسيقى</span></label>`;
  };
  const musCur=()=>{$('#mcur').textContent='الحالية: '+musicLabel(d)+(+d.musicStart?` · من الثانية ${d.musicStart}`:'')+(isYT(d.music)?' · الأغنية تشتغل من يوتيوب على موقعك المنشور':'');};
  renderSongs();musCur();
  $('#f_msearch').oninput=renderSongs;
  $('#songlist').addEventListener('change',e=>{if(e.target.name==='f_mus'){d.music=e.target.value;const s=songById(ytId(d.music));if(s){d.musicStart=s.s;$('#f_mstart').value=s.s;}musCur();soon();}});
  $('#f_yt').onchange=e=>{const m=e.target.value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);if(m){d.music='yt:'+m[1];renderSongs();musCur();soon();}else toast('الرابط مو رابط يوتيوب');};
  $('#f_mfile').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>3.2e6){toast('الملف كبير. استخدم يوتيوب أو ملف أصغر من ٣ ميغابايت');e.target.value='';return;}
    const r=new FileReader();r.onload=()=>{d.music=r.result;d.musicName=f.name;renderSongs();musCur();soon();};r.readAsDataURL(f);};
  const stopPrev=()=>{prevAudio?.pause();prevAudio=null;prevKey='';$$('[data-prev]',P).forEach(x=>x.textContent='▶ اسمع');};
  $('#songlist').addEventListener('click',e=>{const b=e.target.closest('[data-prev]');if(!b)return;e.preventDefault();const k=b.dataset.prev;
    if(prevKey===k){stopPrev();return;}stopPrev();prevAudio=new Audio(k);prevKey=k;prevAudio.play().catch(()=>toast('ما اشتغل الصوت'));b.textContent='■ وقّف';});
  /* photos */
  $('#bggrid').addEventListener('click',e=>{const b=e.target.closest('[data-bg]');if(!b)return;d.photo=BG_DIR+b.dataset.bg+'.webp';if(d.photoMode==='none'){d.photoMode='band';$(`input[name=f_pmode][value=band]`).checked=true;}$$('#bggrid [data-bg]').forEach(x=>x.setAttribute('aria-pressed',x===b));paint();});
  $('#f_bgup').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{d.photo=await shrinkImage(f,1200);if(d.photoMode==='none'){d.photoMode='band';$(`input[name=f_pmode][value=band]`).checked=true;}paint();}catch(err){toast('ما گدرت أقرا الصورة');}};
  /* layers */
  const renderLayers=()=>{
    $('#layers').innerHTML=(d.layers||[]).map((l,i)=>{const A=ART[l.a]||{};const tints=A.svg?A.tints:A.mask?TINTS:null;
      return `<div class="layer" data-i="${i}"><div class="th">${artThumb(l.a,l.t)}</div>
        <div class="field"><label>المكان</label><select data-k="p">${opt(POS,l.p)}</select></div>
        <div class="field"><label>الحجم</label><input data-k="s" type="range" min="8" max="140" value="${+l.s||40}"></div>
        <div class="field"><label>الحركة</label><select data-k="an">${opt(ANIMS,l.an||'none')}</select></div>
        <div class="field"><label>${tints?'اللون':'الشفافية'}</label>${tints?`<select data-k="t">${opt(tints,l.t||Object.keys(tints)[0])}</select>`:`<input data-k="o" type="range" min="0.1" max="1" step="0.05" value="${l.o??1}">`}</div>
        <div class="field"><label>تدوير</label><input data-k="r" type="range" min="-180" max="180" value="${+l.r||0}"></div>
        <div style="display:flex;gap:4px;flex-direction:column"><label class="check" style="font-size:12px"><input type="checkbox" data-k="f" ${l.f?'checked':''}>اقلب</label><label class="check" style="font-size:12px"><input type="checkbox" data-k="z" ${l.z?'checked':''}>قدّام</label><button class="btn sm ghost" type="button" data-del="${i}">حذف</button></div></div>`;}).join('')||'<p class="note" style="margin:0">ماكو رسوم بعد. اختار من المكتبة فوق.</p>';
  };
  renderLayers();
  $('#artgrid').onclick=e=>{const b=e.target.closest('[data-add]');if(!b)return;const a=b.dataset.add,A=ART[a];
    d.layers=[...(d.layers||[]),{a,p:'center',s:A.svg?80:40,t:A.svg?Object.keys(A.tints)[0]:A.mask?'gold':undefined,an:'none',r:0,o:1}];renderLayers();paint();toast('انضافت: '+A.n);};
  $('#layers').addEventListener('input',e=>{const row=e.target.closest('.layer'),k=e.target.dataset.k;if(!row||!k)return;const l=d.layers[+row.dataset.i];
    if(e.target.type==='checkbox')l[k]=e.target.checked?1:0;else if(e.target.type==='range')l[k]=+e.target.value;else l[k]=e.target.value;
    if(k==='p'){delete l.x;delete l.y;}if(k==='t')row.querySelector('.th').innerHTML=artThumb(l.a,l.t);soon();});
  $('#layers').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;d.layers.splice(+b.dataset.del,1);renderLayers();paint();});
  /* sections manager */
  const fieldHTML=(k,[f,label,type])=>{
    const id=`s_${k}_${f}`,v=d[f];
    if(type==='__photos'||label==='__photos')return `<div class="field"><span class="lbl">الصور</span><div class="phbox" id="photosBox"></div><label class="btn sm ghost" style="align-self:flex-start">+ أضف صور<input type="file" id="f_img" accept="image/*" multiple hidden></label></div>`;
    if(type==='ta')return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-f="${f}">${esc(v)}</textarea></div>`;
    if(type==='pairs')return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-f="${f}" data-t="pairs">${esc((v||[]).map(r=>r.join(' | ')).join('\n'))}</textarea></div>`;
    if(type==='lines')return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-f="${f}" data-t="lines">${esc((v||[]).map(x=>typeof x==='string'?x:`${x.name}: ${x.text}`).join('\n'))}</textarea></div>`;
    if(type==='colors')return `<div class="field"><label for="${id}">${label}</label><input id="${id}" dir="ltr" data-f="${f}" data-t="colors" value="${esc((v||[]).join(', '))}"></div>`;
    if(type==='check')return `<label class="check"><input type="checkbox" id="${id}" data-f="${f}" data-t="check" ${v?'checked':''}> ${label}</label>`;
    if(type==='num')return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" min="0" data-f="${f}" data-t="num" value="${+v||0}"></div>`;
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-f="${f}" ${type==='url'?'dir="ltr"':''} value="${esc(v)}"></div>`;
  };
  const renderSecs=()=>{
    const on=d.sections,all=[...on,...Object.keys(SECTIONS).filter(k=>!on.includes(k))];
    $('#seclist').innerHTML=all.map(k=>{const en=on.includes(k),i=on.indexOf(k);
      return `<details class="secrow ${en?'':'off'}" data-k="${k}"><summary><label class="check" onclick="event.stopPropagation()"><input type="checkbox" data-on="${k}" ${en?'checked':''}> ${SECTIONS[k]}</label>
        <span class="sbtns">${en?`<button type="button" class="btn sm ghost" data-mv="-1" ${i?'':'disabled'} aria-label="لفوق">↑</button><button type="button" class="btn sm ghost" data-mv="1" ${i<on.length-1?'':'disabled'} aria-label="لجوه">↓</button>`:''}</span></summary>
        <div class="secbody"><div class="field"><label for="t_${k}">عنوان القسم (اختياري)</label><input id="t_${k}" data-title="${k}" value="${esc(d.titles[k]||'')}" placeholder="${esc(SECTIONS[k])}"></div>
        ${(SEC_FIELDS[k]||[]).map(fd=>fieldHTML(k,fd)).join('')}</div></details>`;}).join('');
    renderPhotos();
  };
  const renderPhotos=()=>{const box=$('#photosBox');if(!box)return;box.innerHTML=d.photos.map((p,i)=>`<div style="position:relative"><img src="${esc(p)}" alt="" style="width:64px;height:80px;object-fit:cover;border-radius:8px"><button class="btn sm ghost" type="button" data-rmp="${i}" style="position:absolute;top:2px;left:2px;padding:0 6px;background:#fff" aria-label="حذف الصورة">×</button></div>`).join('');};
  renderSecs();
  const sl=$('#seclist');
  sl.addEventListener('change',async e=>{
    const t=e.target;
    if(t.dataset.on){const k=t.dataset.on;d.sections=t.checked?[...d.sections,k]:d.sections.filter(x=>x!==k);const open=$$('.secrow[open]',sl).map(x=>x.dataset.k);renderSecs();open.forEach(k=>$(`.secrow[data-k=${k}]`,sl)?.setAttribute('open',''));paint();return;}
    if(t.id==='f_img'){for(const f of t.files){try{d.photos.push(await shrinkImage(f,1100));}catch(err){toast('ما گدرت أقرا صورة');}}t.value='';renderPhotos();paint();return;}
  });
  sl.addEventListener('input',e=>{
    const t=e.target;
    if(t.dataset.title){d.titles[t.dataset.title]=t.value.trim();soon();return;}
    const f=t.dataset.f;if(!f)return;const ty=t.dataset.t;
    d[f]=ty==='pairs'?pairs(t.value):ty==='lines'?lines(t.value):ty==='colors'?t.value.split(/[,\s]+/).filter(x=>/^#[0-9a-f]{3,8}$/i.test(x)):ty==='check'?t.checked:ty==='num'?+t.value||0:t.value;
    soon();
  });
  sl.addEventListener('click',e=>{
    const mv=e.target.closest('[data-mv]');if(mv){e.preventDefault();const k=mv.closest('.secrow').dataset.k,i=d.sections.indexOf(k),j=i+(+mv.dataset.mv);if(j<0||j>=d.sections.length)return;[d.sections[i],d.sections[j]]=[d.sections[j],d.sections[i]];renderSecs();paint();return;}
    const rp=e.target.closest('[data-rmp]');if(rp){d.photos.splice(+rp.dataset.rmp,1);renderPhotos();paint();}
  });
  /* colours */
  $('#palgrid').onclick=e=>{const b=e.target.closest('[data-pal]');if(!b)return;Object.assign(d,applyPal(b.dataset.pal));['bg','card','ink','acc','acc2','door'].forEach(k=>$('#f_'+k).value=d[k]);$('#f_wax').value=d.wax;$$('#palgrid [data-pal]').forEach(x=>x.setAttribute('aria-pressed',x===b));paint();};
  const read=()=>{
    const v=id=>$('#'+id).value;
    Object.assign(d,{title:v('f_title'),show:$('#f_show').checked,feat:$('#f_feat').checked,pop:+v('f_pop')||0,
      layout:$('input[name=f_layout]:checked').value,theme:$('input[name=f_theme]:checked').value,photoMode:$('input[name=f_pmode]:checked').value,
      intro:$('input[name=f_intro]:checked').value,frame:v('f_frame'),corners:v('f_corners'),fx:v('f_fx'),wax:v('f_wax'),musicStart:+v('f_mstart')||0,
      name:v('f_name'),sub:v('f_sub'),metal:v('f_metal'),mono:v('f_mono').trim(),mo:+v('f_mo'),
      fName:v('f_fName'),fTitle:v('f_fTitle'),fBody:v('f_fBody'),ns:+v('f_ns'),ts:+v('f_ts'),date:v('f_date'),time:v('f_time'),host:v('f_host').trim(),
      bg:v('f_bg'),card:v('f_card'),ink:v('f_ink'),acc:v('f_acc'),acc2:v('f_acc2'),door:v('f_door')});
    const nc=v('f_cat');if(nc!==d.cat){d.cat=nc;}
  };
  const paint=()=>{if(!live.isConnected)return;read();
    const keep=cur?$('.inv-scroll',cur)?.scrollTop:0;cur?._cleanup?.();live.innerHTML='';
    const p=phone(d,'edit');live.appendChild(p);cur=$('.frame',p);const sc=$('.inv-scroll',cur);if(sc)sc.scrollTop=keep;};
  paint();
  $('#dform').addEventListener('input',e=>{if(e.target.closest('#layers,#seclist,#songlist')||e.target.type==='file'||e.target.id==='f_msearch')return;soon();});
  $('#dform').addEventListener('change',e=>{if(e.target.closest('#layers,#seclist,#songlist')||e.target.type==='file')return;soon();});
  $('#livePlay').onclick=()=>{read();stopPrev();openViewer('__preview',{...structuredClone(d),id:'__preview',code:d.code||'PREVIEW',title:d.title||'معاينة'});};
  $('#cancelEd').onclick=()=>{stopPrev();clearTimeout(pt);cur?._cleanup?.();editing=null;tab='list';renderAdmin();};
  $('#dform').onsubmit=e=>{e.preventDefault();read();stopPrev();clearTimeout(pt);
    if(!d.title.trim()){toast('اكتب اسم التصميم بالمعرض');$('#f_title').focus();return;}
    cur?._cleanup?.();
    if(src)Object.assign(src,d);else{d.code=nextCode();DATA.designs.unshift(d);}
    if(save())toast(src?'انحفظ التعديل':'انضاف التصميم للمعرض');
    editing=null;tab='list';renderAdmin();renderSite();};
}
function adminFonts(P){
  allFonts().forEach(f=>loadFont(f[0]));
  P.innerHTML=`<div class="sec-head"><div><h2>الخطوط</h2><p>${digits(FONTS.length)} خط جاهز، وتكدر ترفع خطوطك الخاصة مثل الديواني أو الثلث.</p></div></div>
    <div class="box" style="margin-bottom:24px"><h3>ارفع خط (ديواني، ثلث، …)</h3><p>ارفع ملف الخط بصيغة TTF أو OTF أو WOFF أو WOFF2. تأكد إن عندك حق استخدامه.</p>
      <div class="two"><div class="field"><label for="fn_label">اسم الخط بالعربي</label><input id="fn_label" placeholder="مثلاً: ديواني"></div><div class="field"><label for="fn_file">ملف الخط</label><input id="fn_file" type="file" accept=".ttf,.otf,.woff,.woff2"></div></div>
      <div><button class="btn" type="button" id="fn_add">أضف الخط</button></div></div>
    <div class="fontlist">${allFonts().map(([f,n])=>`<div class="fontcard"><div class="sample" style="font-family:'${cssq(f)}',serif">${/إنجليزي/.test(n)?'Happy Birthday':'مبروك التخرّج'}</div><small>${esc(n)} · ${esc(f)}</small>${DATA.fonts.some(x=>x.name===f)?`<button class="btn sm ghost" type="button" data-rm="${esc(f)}">حذف</button>`:''}</div>`).join('')}</div>`;
  $('#fn_add').onclick=()=>{const f=$('#fn_file').files[0],label=$('#fn_label').value.trim()||'خط مرفوع';if(!f){toast('اختار ملف الخط أولاً');return;}
    const r=new FileReader();r.onload=()=>{const name='Custom '+label.replace(/[^\p{L}\p{N} ]/gu,'')+' '+Date.now().toString(36).slice(-3);DATA.fonts.push({name,label,data:r.result});registerCustomFonts();if(save())toast('انضاف الخط');else DATA.fonts.pop();renderAdmin();};r.readAsDataURL(f);};
  $$('[data-rm]',P).forEach(b=>b.onclick=()=>{DATA.fonts=DATA.fonts.filter(x=>x.name!==b.dataset.rm);save();renderAdmin();});
}
const SQL=`-- برمجتي: جدول ردود الضيوف ومجلد صورهم (Supabase)
create table if not exists public.barmajti_entries(
  id bigint generated always as identity primary key,
  gift text not null,
  kind text not null check (kind in ('photo','wish','rsvp')),
  name text, body text, count int default 1, photo text,
  created_at timestamptz default now());
alter table public.barmajti_entries enable row level security;
create policy "guests read" on public.barmajti_entries for select using (true);
create policy "guests add" on public.barmajti_entries for insert with check (char_length(coalesce(body,'')) < 2000 and char_length(gift) < 40);
insert into storage.buckets (id,name,public) values ('barmajti','barmajti',true) on conflict do nothing;
create policy "guests upload photos" on storage.objects for insert with check (bucket_id = 'barmajti');
create policy "guests view photos" on storage.objects for select using (bucket_id = 'barmajti');`;
function adminSettings(P){
  const s=DATA.settings;
  P.innerHTML=`<form class="settings" id="sform"><h2>أرقام التواصل والإعدادات</h2>
    <div class="field"><label for="s_ig">حساب إنستغرام (يظهر بنهاية كل بطاقة)</label><input id="s_ig" dir="ltr" value="${esc(s.instagram||IG_DEFAULT)}"></div>
    <div class="field"><label for="s_wa">رقم الواتساب (مع رمز الدولة)</label><input id="s_wa" dir="ltr" inputmode="tel" placeholder="9647XXXXXXXXX" value="${esc(s.whatsapp)}"><span class="hint">مثال للعراق: 9647701234567 بدون + وبدون صفر بالبداية.</span></div>
    <div class="two"><div class="field"><label for="s_ph">رقم الاتصال</label><input id="s_ph" dir="ltr" inputmode="tel" value="${esc(s.phone)}"></div><div class="field"><label for="s_tg">تيليجرام</label><input id="s_tg" dir="ltr" value="${esc(s.telegram)}"></div></div>
    <div class="field"><label for="s_tag">جملة أعلى الواجهة</label><input id="s_tag" value="${esc(s.tagline)}"></div>
    <div class="field"><label for="s_code">رمز دخول لوحة التصميم</label><input id="s_code" value="${esc(s.adminCode)}" required><span class="hint">قفل بسيط داخل الصفحة وليس حماية حقيقية.</span></div>
    <div class="box"><h3>قاعدة البيانات (لصور وتهاني الضيوف)</h3>
      <p>هسه الصور والتهاني تنحفظ على جهاز كل ضيف فقط. لما تنشر الموقع: سوّي مشروع مجاني على supabase.com، شغّل الأوامر اللي تحت بـ SQL Editor، وحط الرابط والمفتاح العام هنا.</p>
      <div class="field"><label for="s_sbu">Project URL</label><input id="s_sbu" dir="ltr" placeholder="https://xxxx.supabase.co" value="${esc(s.sbUrl)}"></div>
      <div class="field"><label for="s_sbk">anon public key</label><input id="s_sbk" dir="ltr" value="${esc(s.sbKey)}"></div>
      <textarea class="json" id="sqlbox" readonly aria-label="أوامر SQL">${esc(SQL)}</textarea><div><button class="btn sm ghost" type="button" id="cpsql">انسخ أوامر SQL</button></div></div>
    <div><button class="btn rose" type="submit">احفظ</button></div></form>`;
  $('#cpsql').onclick=()=>copyText(SQL,$('#sqlbox'));
  $('#sform').onsubmit=e=>{e.preventDefault();Object.assign(s,{instagram:$('#s_ig').value.trim().replace(/^@/,'')||IG_DEFAULT,whatsapp:$('#s_wa').value.trim(),phone:$('#s_ph').value.trim(),telegram:$('#s_tg').value.trim(),tagline:$('#s_tag').value.trim(),adminCode:$('#s_code').value.trim()||'1234',sbUrl:safeUrl($('#s_sbu').value.trim()),sbKey:$('#s_sbk').value.trim()});if(save())toast('انحفظت الإعدادات');renderSite();};
}
function adminPublish(P){
  const json=JSON.stringify(DATA);
  P.innerHTML=`<div class="settings"><h2>النشر للزوار</h2>
    <div class="box"><h3>كيف يشوف الزوار تصاميمك؟</h3><p>كل شي تسويه هنا ينحفظ على جهازك فوراً. حتى يشوفه كل الزوار، نزّل ملف <b>designs.json</b> وارفعه بنفس مجلد الموقع.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn rose" type="button" id="dl">نزّل designs.json</button><button class="btn ghost" type="button" id="cp">انسخ المحتوى</button></div>
      <span class="note">حجم الملف: ${digits(Math.round(json.length/1024))} كيلوبايت</span><textarea class="json" id="jsonOut" readonly aria-label="محتوى designs.json">${esc(json)}</textarea></div>
    <div class="box"><h3>استيراد نسخة</h3><textarea class="json" id="jsonIn" placeholder='{"designs":[...]}' aria-label="الصق designs.json"></textarea><div><button class="btn" type="button" id="imp">استورد</button></div></div>
    <div class="box"><h3>رجوع للنسخة المنشورة</h3><p>يمسح تعديلاتك المحلية ويرجّع التصاميم الأصلية.</p><div><button class="btn ghost" type="button" id="reset">امسح التعديلات المحلية</button></div></div></div>`;
  $('#dl').onclick=()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download='designs.json';a.click();toast('إذا ما بدأ التنزيل، استخدم زر النسخ');}catch(e){toast('التنزيل ما اشتغل هنا، استخدم النسخ');}};
  $('#cp').onclick=()=>copyText(json,$('#jsonOut'));
  $('#imp').onclick=()=>{try{const v=JSON.parse($('#jsonIn').value);if(!Array.isArray(v.designs))throw 0;DATA=normalize(v);registerCustomFonts();save();toast('تم الاستيراد');renderSite();renderAdmin();}catch(e){toast('المحتوى مو ملف designs.json صحيح');}};
  $('#reset').onclick=e=>{const b=e.target;if(b.dataset.c!=='1'){b.dataset.c='1';b.textContent='اضغط مرة ثانية للتأكيد';return;}try{localStorage.removeItem(LS_KEY)}catch(e){}DATA=normalize(PUBLISHED||DEFAULTS);toast('رجعت التصاميم الأصلية');renderSite();renderAdmin();};
}

/* ---------- routing & boot ---------- */
function route(){const isAdmin=location.hash==='#admin';$('#site').hidden=isAdmin;$('#admin').hidden=!isAdmin;if(isAdmin){clearLayer();renderAdmin();scrollTo(0,0);}}
async function boot(){
  try{const r=await fetch('designs.json',{cache:'no-store'});if(r.ok)PUBLISHED=normalize(await r.json());}catch(e){}
  let local=null;try{local=JSON.parse(localStorage.getItem(LS_KEY));}catch(e){}
  DATA=normalize(local||PUBLISHED||DEFAULTS);
  registerCustomFonts();
  const gift=readGift();if(gift){if(wantsNames()){$('#site').hidden=true;document.title='دعوات بالاسم · '+gift.name;namesTool(gift,true);return;}openGiftMode(gift);return;}
  const cat=readCategory();if(cat)filter=cat;
  renderSite();route();
  if(cat)requestAnimationFrame(()=>$('#designs').scrollIntoView());
  requestAnimationFrame(drawCircuit);
}
$('#chips').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(!b)return;filter=b.dataset.f;writeCategory(filter);renderChips();renderGrid();});
$('#grid').addEventListener('click',e=>{const b=e.target.closest('.shelf-h [data-f]');if(!b)return;filter=b.dataset.f;writeCategory(filter);renderChips();renderGrid();$('#designs').scrollIntoView({behavior:'smooth'});});
$('#q').addEventListener('input',e=>{query=e.target.value;renderGrid();});
$$('.sort button').forEach(b=>b.onclick=()=>{sortBy=b.dataset.sort;$$('.sort button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderGrid();});
document.addEventListener('click',e=>{
  if(e.target.closest('#layer,#admin,#giftmode'))return;
  const v=e.target.closest('[data-view]');if(v){openViewer(v.dataset.view);return;}
  const o=e.target.closest('[data-order]');if(o)openOrder(o.dataset.order);
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.phone[data-view]')){e.preventDefault();openViewer(e.target.dataset.view);}
  if(e.key==='Escape'&&$('#layer').children.length)clearLayer();
});
$('#tabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(!t)return;if(t.dataset.tab==='edit')editing=null;tab=t.dataset.tab;renderAdmin();});
$('#exitAdmin').onclick=e=>{e.preventDefault();history.pushState('',document.title,location.pathname+location.search);route();renderSite();};
let taps=0,tapT;
$('#brandLink').addEventListener('click',e=>{taps++;clearTimeout(tapT);tapT=setTimeout(()=>taps=0,1500);if(taps>=5){e.preventDefault();taps=0;location.hash='admin';}});
addEventListener('hashchange',()=>{const c=readCategory();if(c){filter=c;renderChips();renderGrid();$('#designs').scrollIntoView();}route();});
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(drawCircuit,200);});
boot();
