/* =========================================================
   برمجتي — البيانات: الأقسام، الألوان، الرسوم، الأغاني، التصاميم
   ========================================================= */
const LS_KEY = 'barmajti:data:v5';
const IG_DEFAULT = 'barmgte';

/* ---------- helpers shared by every file ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cssq = s => String(s||'').replace(/['\\;]/g,'');
const hex = s => /^#[0-9a-f]{3,8}$/i.test(s||'') ? s : '#888888';
const len = s => /^-?\d+(\.\d+)?cqw$/.test(s||'') ? s : '';
const safeUrl = u => /^https?:\/\//i.test(u||'') ? u : '';
const safeImg = u => /^(https?:\/\/|data:image\/|assets\/)/i.test(u||'') ? u : '';
const digits = s => String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const lines = s => String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
const pairs = s => lines(s).map(l=>{const i=l.indexOf('|');return i<0?['',l]:[l.slice(0,i).trim(),l.slice(i+1).trim()];});
function toast(msg){$$('.toast').forEach(t=>t.remove());const t=document.createElement('div');t.className='toast';t.textContent=msg;t.setAttribute('role','status');document.body.appendChild(t);setTimeout(()=>t.remove(),3200);}
function isLight(h){h=hex(h).slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));return (r*299+g*587+b*114)/1000>150;}

/* ---------- categories ---------- */
const CATS = {wed:'حفل زفاف', eng:'خطوبة وملكة', henna:'ليلة الحنّة', shower:'حفلة العروس', reveal:'كشف جنس المولود', baby:'استقبال مولود', grad:'حفل تخرّج', bday:'عيد ميلاد', occ:'أعياد ومناسبات'};
const SLUGS = {wedding:'wed', engagement:'eng', henna:'henna', 'bridal-shower':'shower', 'gender-reveal':'reveal', baby:'baby', graduation:'grad', birthday:'bday', occasions:'occ'};
const THEMES = {paper:'ورق وألوان مائية', marble:'رخام', velvet:'مخمل', night:'ليل ونجوم', pastel:'سماء ناعمة'};
const PHOTO_MODES = {none:'بدون صورة', band:'شريط فوق', full:'خلفية كاملة', arch:'نافذة محراب', circle:'دائرة'};
const FRAMES = {none:'بدون', arch:'محراب', oval:'بيضاوي', double:'إطار مزدوج'};
const LAYOUTS = {scroll:'صفحة تنزل لتحت', book:'كتاب تقلب صفحاته'};
const INTROS = {doors:'أبواب تنفتح', curtain:'ستارة', envelope:'ظرف مختوم', box:'صندوق هدية', none:'بدون'};
const EFFECTS = {none:'بدون', confetti:'قصاصات ملونة', gold:'قصاصات ذهبية', hearts:'قلوب', stars:'نجوم تلمع', balloons:'بالونات', petals:'ورد يتساقط', bubbles:'فقاعات'};
const METALS = {gold:'ذهبي', silver:'فضي', rose:'روز جولد', acc:'اللون الأساسي', ink:'لون الكتابة'};
const TINTS = {gold:'ذهبي', silver:'فضي', rose:'روز', acc:'الأساسي', ink:'الكتابة', white:'أبيض'};
const POS = {tl:'أعلى يمين',tr:'أعلى يسار',ml:'وسط يمين',mr:'وسط يسار',bl:'أسفل يمين',br:'أسفل يسار',top:'أعلى الوسط',center:'خلف الاسم',bottom:'أسفل الوسط'};
const ANIMS = {none:'ثابت',float:'يطفو',sway:'يتمايل',flutter:'يرفرف',rise:'يرتفع',drift:'ينساب',pulse:'ينبض',spin:'يدور ببطء'};
const POSCSS = {
  tl:'top:var(--y,-4cqw);right:var(--x,-10cqw)', tr:'top:var(--y,-4cqw);left:var(--x,-10cqw)',
  ml:'top:var(--y,80cqw);right:var(--x,-14cqw)', mr:'top:var(--y,80cqw);left:var(--x,-14cqw)',
  bl:'bottom:var(--y,26cqw);right:var(--x,-10cqw)', br:'bottom:var(--y,26cqw);left:var(--x,-10cqw)',
  top:'top:var(--y,4cqw);left:50%;--tx:-50%', center:'top:var(--y,30cqw);left:50%;--tx:-50%', bottom:'bottom:var(--y,24cqw);left:50%;--tx:-50%'
};

/* ---------- illustration library (CC0, see assets/art/credits.json) ---------- */
const ART_DIR='assets/art/', BG_DIR='assets/bg/';
const ART = {
  'svg:balloons':{n:'بالونات',svg:1,tints:{gold:'ذهبي',pearl:'لؤلؤي',rose:'روز',blue:'أزرق',pink:'وردي',mix:'ملوّن',goldpearl:'ذهبي ولؤلؤي',bluepink:'أزرق ووردي'}},
  'svg:lanterns':{n:'فوانيس',svg:1,tints:{gold:'ذهبي',silver:'فضي',acc:'الأساسي'}},
  'svg:cake':{n:'كيكة بشموع',svg:1,tints:{pink:'وردي',white:'أبيض',choco:'شوكولا',blue:'أزرق'}},
  'svg:gifts':{n:'هدايا',svg:1,tints:{gold:'ذهبي',pink:'وردي',blue:'أزرق',mix:'ملوّن'}},
  'svg:sparkles':{n:'لمعات',svg:1,tints:{gold:'ذهبي',white:'أبيض',acc:'الأساسي'}},
  'svg:caps':{n:'قبعات طايرة',svg:1,tints:{ink:'أسود',acc:'الأساسي'}},
  'svg:clouds':{n:'غيوم',svg:1,tints:{white:'أبيض',pink:'وردي',blue:'أزرق'}},
  'svg:rings':{n:'دبل',svg:1,tints:{gold:'ذهبي',silver:'فضي',rose:'روز'}},
  'rose-red':{n:'وردة حمراء',r:0.93},'rose-vintage':{n:'وردة قديمة',r:0.644},'rose-glossy':{n:'وردة لامعة',r:1.205},'rose-stem':{n:'وردة بساق',r:0.301},
  'roses-engraved':{n:'ورود محفورة',r:0.824,mask:1},'rose-engraved':{n:'وردة محفورة',r:0.761,mask:1},'rose-line':{n:'وردة خطوط',r:0.631,mask:1},
  'bouquet-engraved':{n:'باقة محفورة',r:1.214,mask:1},'vase-engraved':{n:'مزهرية',r:0.89,mask:1},'fern':{n:'سرخس',r:0.774},
  'laurel-gold':{n:'غار ذهبي',r:1.269},'wreath-gold':{n:'إكليل ذهبي',r:1.091},'wreath-gold-ribbon':{n:'إكليل بشريطة',r:0.912},
  'cap-gold-tassel':{n:'قبعة تخرّج',r:1.773},'cap':{n:'قبعة تخرّج ٢',r:1.685},'diploma-gold':{n:'شهادة ذهبية',r:1.4},'diploma-bow':{n:'شهادة بفيونكة',r:1.876},
  'butterfly-blue':{n:'فراشة زرقاء',r:0.995},'butterfly-peacock':{n:'فراشة طاووس',r:1.036},'butterfly-monarch':{n:'فراشة برتقالية',r:1.464},'butterfly-vintage':{n:'فراشة قديمة',r:0.882},
  'butterfly-engraved':{n:'فراشة محفورة',r:1.69,mask:1},'butterfly-line':{n:'فراشة خطوط',r:1.791,mask:1},
  'moon-gold':{n:'قمر ذهبي',r:0.98},'crescent-stars':{n:'هلال نجوم',r:0.681,mask:1},'star-ornate':{n:'نجمة مزخرفة',r:1.051,mask:1},'star-gold':{n:'نجمة ذهبية',r:0.979},
  'flourish':{n:'زخرفة',r:1.827,mask:1},'baroque':{n:'زخرفة باروك',r:1.582,mask:1},'banner-engraved':{n:'شريط محفور',r:2.544,mask:1},'ribbon-gold':{n:'شريط ذهبي',r:2.814},
  'candelabra':{n:'شمعدان',r:0.626,mask:1},'champagne':{n:'كأس',r:0.32},
  'ring-diamond':{n:'خاتم ألماس',r:0.707,mask:1},'tiara':{n:'تاج عروس',r:1.856,mask:1},'crown-gold':{n:'تاج ذهبي',r:1.769},
  'dove-line':{n:'حمامة',r:0.897,mask:1},'heart-red':{n:'قلب',r:1.028},'teddy':{n:'دبدوب',r:0.896},'stork-blue':{n:'لقلق ولد',r:1.811},'stork-pink':{n:'لقلق بنت',r:1.804},
  'mandala-a':{n:'ماندالا',r:0.985,mask:1},'mandala-b':{n:'ماندالا ٢',r:1.007,mask:1},'mandala-c':{n:'ماندالا ٣',r:1.0,mask:1},
  'cloud-pink':{n:'غيمة وردية',r:2.482}
};
/* real CC0 photographs (StockSnap) used behind the hero */
const BGS = {
  'aisle-flowers':'ممر ورد','aisle-ribbons':'ممر بشرائط','palace-hall':'قصر وثريا','chandelier-gold':'ثريا ذهبية','chandelier-dark':'ثريا كريستال',
  'table-flowers':'طاولة ورد','table-roses':'طاولة زفاف','table-white':'طاولة بيضاء','candles-flowers':'شموع وورد','candle-dinner':'عشاء بالشموع','garden-table':'حديقة',
  'bouquet-roses':'باقة ورد','bouquet-lace':'باقة ودانتيل','bouquet-dress':'باقة العروس','rings-petals':'خاتم وبتلات','rose-white-red':'ورد أبيض وأحمر','couple-bouquet':'العروسين',
  'gold-bokeh':'لمعة ذهبية','gold-glitter':'جليتر ذهبي','gold-drape':'ستارة ذهبية','satin-red':'ستان أحمر','satin-purple':'ستان بنفسجي','fairy-lights':'أضواء ناعمة',
  'lantern':'فانوس','lantern-market':'فوانيس','mosque-hall':'مسجد','red-door':'باب تراثي',
  'roses-red-wall':'جدار ورد أحمر','roses-pink-soft':'ورد وردي ناعم','roses-white-paper':'ورد أبيض','rose-red-dark':'وردة حمراء','rose-white-dark':'وردة بيضاء','rose-petals':'بتلات ورد','rose-ring':'وردة ذهبية',
  'rings-navy':'خواتم على كحلي','rings-wood':'خواتم على خشب','hands-ring':'يدين وخاتم','lace':'دانتيل','wedding-cake':'كيكة زفاف',
  'gold-lights':'أضواء ذهبية','sparkler':'شرارة','night-bokeh':'أضواء ليلية','confetti-party':'حفلة',
  'peonies-field':'فاوانيا','peonies-wood':'فاوانيا على خشب','pastel-flowers':'ورد باستيل','pink-rose-macro':'وردة قريبة','pink-roses-soft':'ورد وردي',
  'white-blossom':'زهر أبيض','cherry-white':'زهر الكرز','lily-black':'زنبق','tulips':'توليب',
  'grad-caps':'قبعات تخرّج','balloon-pink':'بالون وردي','balloons-sky':'بالونات بالسما','balloons-colorful':'بالونات ملونة','balloon-red-sky':'بالون أحمر','balloons-purple':'بالونات بنفسجية','balloons-pastel':'بالونات باستيل',
  'cake-candle':'كيكة بشمعة','cake-sprinkles':'كيكة ملونة','cupcake-aqua':'كب كيك','confetti-aqua':'قصاصات','gift-confetti':'هدية وقصاصات','gift-kraft':'هدية','confetti-fall':'قصاصات تتساقط','gift-hands':'هدية باليد',
  'baby-feet':'قدم طفل','baby-shoes':'حذاء طفل','baby-sleep':'طفل نايم','teddy-mobile':'دباديب','baby-hand':'يد طفل',
  'milky-way':'درب التبانة','moon-lake':'قمر وبحيرة','night-blue':'ليل أزرق','marble-white':'رخام أبيض','marble-black':'رخام أسود','marble-flowers':'رخام وورد'
};

/* ---------- music ---------- */
/* song library played from official YouTube videos (same songs used by event-invitation sites in the region) */
const SONGS = [
  ['IdneKLhsWOQ','Wildest Dreams — Taylor Swift','wed eng shower grad bday henna reveal baby occ',0],
  ['qNvJnYLaT5s','زينة عماد — زفة هب السعد','wed eng',0],
  ['V1Pl8CzNzCw','Lovely — Billie Eilish & Khalid (Cover)','wed eng',0],
  ['PrPi2hZCPn0','عبدالمجيد عبدالله — إنتي وبس','wed eng',0],
  ['FSYluwsHA-Q','ماجد المهندس — زفة فاز بها','wed',0],
  ['3B5BG1o-sdU','Enchanted — Bridgerton','wed eng shower',0],
  ['ufeDeq4pHbI','بسم خالق الحب نبدأ','wed eng',0],
  ['vGJTaP6anOU',"Can't Help Falling in Love — Elvis Presley",'wed eng shower',0],
  ['c2ZOc3UJXPY','Ordinary — Saxophone','wed eng grad',0],
  ['8mYeTuzBQr4','Aaj Sajeya','shower wed',10],
  ['kp977MhGUVs','هدى عربي','henna',0],
  ['6jkFPCH6TFQ','نداء شرارة','henna',0],
  ['_g_xctm0Ojc','ليلة الحناء','henna',0],
  ['0BzDolDLqhE','ليلة حنة — فرقة حنة','henna',0],
  ['vrwVkS_bT8c','تامر حسني — سجل يا تاريخ','shower',5],
  ['akcJI2JYryA','عصام العمر — العروس غزالة','shower',0],
  ['SGOQhgKeJAc','Scheme — قشعريرة','reveal baby',0],
  ['jbF4xfdDezE','إليسا — بكرة بتشرق شمس العيد','reveal bday baby occ',0],
  ['XiYdE7KGMU0','حمود الخضر — مستنّيك','reveal',0],
  ['ozYMAIiymjM','كارمن سليمان — حاسة بسعادة','reveal baby',0],
  ['Jb4ReXtJhZE','بلقيس — أهلاً يا ماما','baby',0],
  ['7maJOI3QMu0','River Flows in You — Yiruma','grad',2],
  ['WT_RqJZ9s3s','زينة عماد — نجحنا وتخرجنا','grad',24],
  ['nFvElOX4JjQ','النهايات السعيدة','grad',0],
  ['SC4xMk98Pdc','Congratulations — Post Malone','grad',0],
  ['Z-zvV5Bsshc','You Raise Me Up — Violin','grad',0],
  ['TbdnJce0hwM','خالد عسيري — Happy Birthday','bday',0],
  ['wqdV1ybjzOE','Birthday Song — Piano','bday',7],
  ['CI6dnkoHXgk','نانسي عجرم — عيد ميلاد','bday',0]
].map(([id,n,c,s])=>({id,n,c:c.split(' '),s}));
const songById = id => SONGS.find(s=>s.id===id);
const songsFor = cat => SONGS.filter(s=>s.c.includes(cat));

/* ---------- fonts ---------- */
const FONTS = [
  ['Aref Ruqaa','رقعة'],['Aref Ruqaa Ink','رقعة ملوّن'],['Amiri','نسخ أميري'],['Scheherazade New','نسخ شهرزاد'],
  ['Noto Nastaliq Urdu','نستعليق'],['Gulzar','نستعليق گلزار'],['Alkalami','القلمي'],['Mirza','ميرزا'],
  ['Katibeh','كاتبة'],['Vibes','فايبز زخرفي'],['Rakkas','رقّاص'],['Lalezar','لاله‌زار'],
  ['Marhey','مرحي'],['Lemonada','ليمونادا'],['Reem Kufi','كوفي ريم'],['Reem Kufi Fun','كوفي مرح'],
  ['Reem Kufi Ink','كوفي ملوّن'],['Qahiri','قاهري'],['Kufam','كوفام'],['El Messiri','المسيري'],
  ['Blaka','بلاكا'],['Blaka Ink','بلاكا ملوّن'],['Jomhuria','جمهورية'],['Changa','شانجا'],['Tajawal','تجوال'],['IBM Plex Sans Arabic','بلكس'],
  ['Great Vibes','إنجليزي مزخرف'],['Parisienne','إنجليزي باريسي'],['Pinyon Script','إنجليزي ملكي'],['Dancing Script','إنجليزي يدوي'],['Pacifico','إنجليزي مرح'],['Cinzel','إنجليزي روماني']
];
const BODY_FONTS = ['IBM Plex Sans Arabic','Tajawal','Changa','El Messiri','Amiri','Lemonada'];
const FP = {ruqaa:['Aref Ruqaa','Great Vibes',1],nastaliq:['Gulzar','Parisienne',.78],naskh:['Amiri','Pinyon Script',.85],kufi:['Reem Kufi','Cinzel',.9],fun:['Lalezar','Lemonada',1.1],
  mirza:['Mirza','Great Vibes',1.05],vibes:['Vibes','Great Vibes',1],qahiri:['Qahiri','Cinzel',1],marhey:['Marhey','Dancing Script',1],nastaliqUrdu:['Noto Nastaliq Urdu','Parisienne',.7],
  kufiFun:['Reem Kufi Fun','Dancing Script',1.05],messiri:['El Messiri','Pinyon Script',.95]};

/* ---------- palettes, chosen like real stationery suites ---------- */
const PAL = {
  ivoryGold:['عاجي وذهبي','#f8f3ea','#fffdf8','#3a2d22','#b08a4a','#eadfcd','#efe4d2','#9b6b26'],
  blushGold:['وردي فاتح وذهبي','#fbf1ef','#fffaf9','#4e2c2c','#b9857a','#f3d7d2','#f4dcd6','#a8655c'],
  sageIvory:['أخضر مريمية','#f3f4ee','#fdfdf9','#2f3a30','#7d8f72','#dfe5d6','#e6eadf','#5f7356'],
  navyGold:['كحلي وذهبي','#0f1729','#18223a','#f1ede4','#d8b76a','#26365c','#141e33','#b8892f'],
  burgundyGold:['خمري وذهبي','#2b0b12','#3a121b','#f7ebe4','#d9b06a','#6b1f2b','#57141f','#b8892f'],
  emeraldGold:['زمردي وذهبي','#0d2620','#14362d','#f5efe0','#d4af37','#1f4a3f','#0f3a30','#b8892f'],
  blackGold:['أسود وذهبي','#0e0d0c','#191716','#f4efe6','#cfab62','#2b2622','#171513','#b8892f'],
  champagne:['شامبين','#f6efe4','#fffcf6','#45382a','#a8875a','#e9dcc6','#ecdfca','#8b6a3d'],
  lavender:['لافندر','#f5f2fa','#ffffff','#3b3350','#8a78b8','#e2daf2','#e7e1f3','#6f5ea3'],
  dustyBlue:['أزرق غباري','#eff4f8','#ffffff','#22344a','#6b8cae','#d5e3ef','#dce7f1','#4c6f93'],
  terracotta:['تيراكوتا','#f7efe7','#fffaf5','#4a2d22','#b8674a','#efd6c6','#f0dccd','#9a4f36'],
  silverWhite:['أبيض وفضي','#f6f6f5','#ffffff','#2f3035','#8f939b','#e7e8eb','#efefee','#8a8f98'],
  roseRed:['أحمر ورد','#fff6f6','#ffffff','#5a1f2b','#b33a4f','#f5cdd3','#f0c4cb','#8e1b22'],
  plumNight:['ليلي بنفسجي','#160f1f','#22182e','#f3ecf7','#d7b58a','#3e2a52','#21162d','#b8892f'],
  babyPink:['وردي أطفال','#fff4f7','#ffffff','#5a3442','#d987a2','#fadbe5','#f8cfdc','#c76d8b'],
  babyBlue:['أزرق أطفال','#f1f7fd','#ffffff','#24364a','#5b8fc4','#d6e8f8','#bcd8f2','#4c7fb3'],
  sunny:['أصفر مشمس','#fffaf0','#ffffff','#3b2e1a','#d9951a','#ffe6a8','#ffd98a','#c88a10'],
  mint:['نعناعي','#f1faf6','#ffffff','#1f3b33','#3f9f86','#cdeee3','#c3e8db','#2f8670'],
  coral:['مرجاني','#fff5f1','#ffffff','#4a2620','#e0735a','#ffd9cd','#ffd2c4','#c4573f'],
  midnight:['ليل فضي','#0b1426','#142038','#eef2fa','#d8dde6','#24406b','#101c33','#7d8796'],
  henna:['حنّة أحمر وذهبي','#2a0d0b','#3a1511','#f8ead9','#e0b057','#7a2418','#6e1d14','#b8892f'],
  mauve:['موف','#f6eef0','#fffafb','#46303a','#9b6b7b','#e9d3db','#ecd8df','#7f4f60'],
  olive:['زيتوني','#f4f2ea','#fffdf7','#3a3a28','#8a8455','#e3e0cc','#e9e6d4','#6d683e'],
  wine:['نبيذي','#fbf3f4','#ffffff','#4b1624','#8c2a42','#efd0d7','#e8c3cc','#7a1d33']
};
const palKeys=['bg','card','ink','acc','acc2','door','wax'];
const applyPal = k => {const p=PAL[k]||PAL.ivoryGold;const o={pal:k};palKeys.forEach((key,i)=>o[key]=p[i+1]);return o;};

/* ---------- invitation sections ---------- */
const SECTIONS = {
  card:'بطاقة الدعوة', family:'أهل المناسبة', message:'كلمة شخصية', quote:'آية أو بيت شعر', album:'ألبوم الصور',
  venue:'الموقع', calendar:'التقويم', countdown:'العد التنازلي', program:'برنامج المناسبة',
  details:'التعليمات', video:'فيديو', guestcam:'كاميرا الضيوف', wishes:'جدار التهاني', attend:'عدد الحضور',
  qr:'رمز QR', contacts:'للتواصل', closing:'كلمة الختام'
};
const ORDER = {
  wed:['card','family','album','venue','calendar','countdown','program','details','message','guestcam','wishes','attend','qr','closing'],
  eng:['card','family','venue','calendar','countdown','program','details','message','guestcam','wishes','attend','closing'],
  henna:['card','family','venue','calendar','countdown','program','details','guestcam','wishes','attend','closing'],
  shower:['card','venue','calendar','countdown','program','details','guestcam','wishes','attend','closing'],
  reveal:['card','venue','calendar','countdown','details','guestcam','wishes','attend','closing'],
  baby:['card','family','album','venue','calendar','countdown','details','guestcam','wishes','closing'],
  grad:['card','family','album','venue','calendar','countdown','program','details','message','guestcam','wishes','attend','closing'],
  bday:['card','album','venue','calendar','countdown','program','details','guestcam','wishes','attend','closing'],
  occ:['card','quote','album','message','wishes','closing']
};

/* ---------- labels ---------- */
const L = {
  ar:{open:'اضغط للفتح',gift:'وصلتك هدية',tapBox:'اضغط على الصندوق',time:'الساعة',where:'الموقع',where2:'الموقع الثاني',map:'افتح الخريطة',save:'احفظ الموعد',count:'العد التنازلي',d:'أيام',h:'ساعات',m:'دقائق',s:'ثواني',
    prog:'برنامج المناسبة',det:'التعليمات',wishes:'جدار التهاني',album:'ألبوم الصور',contact:'تواصل',music:'موسيقى',wish:'تهنئة',rsvp:'تأكيد الحضور',loading:'جاري تحميل الأغنية…',noYT:'الأغنية تشتغل بالرابط المنشور',playing:'الموسيقى تشتغل',tap:'اضغط لتشغيل الموسيقى',
    made:'صُنعت بحب في برمجتي',yourName:'اسمك',yes:'أكيد جاي',no:'أعتذر',sendR:'أرسل الرد',sendW:'أرسل التهنئة',writeW:'اكتب تهنئتك',close:'إغلاق',guests:'عدد الأشخاص',lang:'EN',
    family:'بدعوة من',message:'كلمة من القلب',story:'قصتنا',reasons:'ليش أحبك انت بالذات',song:'أغنية تذكرني بيك',dress:'لون اللبس',video:'شاهد الفيديو',guestcam:'كاميرا الضيوف',
    camText:'التقط صورة من الحفل، وتنحفظ هنا ويشوفها الكل',snap:'التقط صورة',pick:'من المعرض',attend:'عدد الحضور',attendNote:'شخص أكدوا حضورهم',qr:'امسح الرمز وشارك الدعوة',contacts:'للتواصل',
    noWishes:'كون أول واحد يكتب تهنئة',noPhotos:'ماكو صور بعد، صوّر أول لقطة',saved:'انحفظت الصورة',hijri:'',next:'التالي',prev:'السابق',play:'شغّل الأغنية',pause:'وقّف',page:'صفحة'},
  en:{open:'TAP TO OPEN',gift:'A gift for you',tapBox:'Tap the box',time:'Time',where:'Location',where2:'Second location',map:'Open map',save:'Save the date',count:'Countdown',d:'Days',h:'Hours',m:'Minutes',s:'Seconds',
    prog:'Programme',det:'Details',wishes:'Wishes',album:'Album',contact:'Contact',music:'Music',wish:'Wish',rsvp:'RSVP',loading:'Loading the song…',noYT:'The song plays on the published link',playing:'Music on',tap:'Tap to start music',
    made:'Made with love by Barmajti',yourName:'Your name',yes:'Attending',no:'Can\'t make it',sendR:'Send reply',sendW:'Send wish',writeW:'Write a wish',close:'Close',guests:'Guests',lang:'ع',
    family:'Hosted by',message:'From the heart',story:'Our story',reasons:'Why I love you',song:'Our song',dress:'Dress code',video:'Watch the video',guestcam:'Guest camera',
    camText:'Snap a photo at the party — it is saved here for everyone',snap:'Take a photo',pick:'From gallery',attend:'Guests attending',attendNote:'people confirmed',qr:'Scan to share the invitation',contacts:'Contact',
    noWishes:'Be the first to leave a wish',noPhotos:'No photos yet — take the first one',saved:'Photo saved',hijri:'',next:'Next',prev:'Back',page:'Page',play:'Play our song',pause:'Pause'}
};

/* ---------- design defaults ---------- */
const Lr=(a,p,s,o={})=>({a,p,s,...o});
const base={show:true,feat:false,pop:0,layout:'scroll',theme:'paper',photo:'',photoMode:'none',frame:'none',intro:'doors',fx:'confetti',music:'',musicStart:0,
  metal:'gold',mono:'',ms:1,my:24,mo:.9,fName:'Aref Ruqaa',fTitle:'Great Vibes',fBody:'IBM Plex Sans Arabic',ns:1,ts:1,
  bg:'#f8f3ea',card:'#fffdf8',ink:'#3a2d22',acc:'#b08a4a',acc2:'#eadfcd',door:'#efe4d2',wax:'#9b6b26',pal:'ivoryGold',
  title:'',name:'',sub:'',cardTitle:'',invite:'',date:'',time:'',hijri:false,venue:'',map:'',venue2:'',map2:'',program:[],details:[],closing:'',
  family:[],msgTitle:'',msgBody:'',msgSign:'',quote:'',quoteSrc:'',video:'',contacts:[],
  wishes:[],photos:[],img:'',layers:[],corners:'gold',host:'',attendBase:0,titles:{},sections:null};

/* ---------- layer presets ---------- */
const LP = {
  roses:()=>[Lr('rose-red','tl',46,{x:'-12cqw',y:'-6cqw',r:24}),Lr('rose-glossy','br',48,{x:'-14cqw',y:'24cqw',r:-14,an:'float'})],
  vintage:()=>[Lr('rose-vintage','tl',40,{x:'-12cqw',y:'-8cqw',r:20}),Lr('rose-vintage','br',42,{x:'-14cqw',y:'24cqw',r:-150})],
  candelabra:t=>[Lr('candelabra','ml',30,{t,x:'-4cqw',y:'60cqw',o:.9}),Lr('candelabra','mr',30,{t,x:'-4cqw',y:'60cqw',o:.9,f:1}),Lr('svg:sparkles','top',100,{t:'gold',y:'6cqw',o:.7})],
  bouquets:t=>[Lr('bouquet-engraved','bl',56,{t,x:'-16cqw',y:'20cqw',o:.75}),Lr('bouquet-engraved','br',56,{t,x:'-16cqw',y:'20cqw',o:.75,f:1})],
  dove:t=>[Lr('dove-line','top',26,{t,y:'6cqw',an:'float'}),Lr('svg:rings','bottom',30,{t:t==='silver'?'silver':'gold',y:'62cqw',an:'pulse'})],
  baroque:t=>[Lr('baroque','top',70,{t,y:'8cqw',o:.9}),Lr('flourish','bottom',56,{t,y:'34cqw',o:.9})],
  rings:t=>[Lr('svg:rings','center',40,{t,y:'20cqw',an:'pulse'}),Lr('svg:sparkles','top',100,{t:'gold',y:'4cqw'})],
  ringRoses:t=>[Lr('ring-diamond','center',40,{t,y:'20cqw',o:.4}),...LP.vintage(),Lr('butterfly-monarch','tr',18,{x:'12cqw',y:'42cqw',an:'flutter',r:-15})],
  balloonsGold:()=>[Lr('svg:balloons','bl',68,{t:'goldpearl',x:'-18cqw',y:'16cqw'}),Lr('svg:balloons','br',60,{t:'goldpearl',x:'-18cqw',y:'22cqw',f:1}),Lr('svg:sparkles','top',100,{t:'gold',y:'4cqw'})],
  balloonsRose:()=>[Lr('rose-vintage','tl',50,{x:'-14cqw',y:'-8cqw',r:15}),Lr('svg:balloons','br',56,{t:'rose',x:'-14cqw',y:'22cqw',f:1}),Lr('butterfly-peacock','mr',16,{x:'8cqw',y:'70cqw',an:'flutter'})],
  balloonsMix:()=>[Lr('svg:balloons','tl',52,{t:'mix',x:'-12cqw',y:'0cqw',an:'rise'}),Lr('svg:balloons','tr',46,{t:'mix',x:'-12cqw',y:'6cqw',an:'rise',f:1}),Lr('svg:gifts','bottom',46,{t:'mix',y:'24cqw'})],
  cake:t=>[Lr('svg:cake','bottom',66,{t,y:'22cqw'}),Lr('svg:balloons','tl',44,{t:'mix',x:'-10cqw',y:'-2cqw',an:'rise'}),Lr('svg:balloons','tr',40,{t:'mix',x:'-10cqw',y:'4cqw',an:'rise',f:1})],
  champagne:()=>[Lr('moon-gold','tr',30,{x:'4cqw',y:'8cqw',an:'pulse'}),Lr('champagne','bl',14,{x:'14cqw',y:'30cqw',r:-14,an:'sway'}),Lr('champagne','br',14,{x:'14cqw',y:'30cqw',r:14,f:1,an:'sway'}),Lr('svg:sparkles','top',100,{t:'gold',y:'0cqw'})],
  laurel:()=>[Lr('laurel-gold','center',92,{y:'46cqw',o:.95}),Lr('cap-gold-tassel','top',44,{y:'6cqw',r:-10,an:'float'}),Lr('diploma-gold','br',34,{x:'2cqw',y:'60cqw',r:-24,an:'float'}),Lr('svg:sparkles','top',100,{t:'gold',y:'0cqw'})],
  caps:()=>[Lr('svg:caps','top',100,{t:'ink',y:'4cqw'}),Lr('wreath-gold-ribbon','bottom',58,{y:'22cqw'})],
  capRoses:()=>[Lr('cap-gold-tassel','top',40,{y:'10cqw',r:12,an:'float'}),Lr('rose-vintage','bl',50,{x:'-14cqw',y:'20cqw',r:-20}),Lr('rose-glossy','br',40,{x:'-10cqw',y:'26cqw',r:20}),Lr('butterfly-peacock','tr',16,{x:'14cqw',y:'60cqw',an:'flutter'})],
  wreathCap:()=>[Lr('wreath-gold','center',84,{y:'40cqw',o:.9}),Lr('cap','top',38,{y:'8cqw',r:-8,an:'float'})],
  diplomaBow:()=>[Lr('diploma-bow','bottom',46,{y:'26cqw',r:-6}),Lr('svg:caps','top',100,{t:'acc',y:'2cqw'})],
  mandala:t=>[Lr('mandala-a','center',96,{t,y:'18cqw',o:.32,an:'spin'}),Lr('svg:lanterns','top',100,{t:'gold',y:'0cqw'}),Lr('svg:sparkles','bottom',100,{t:'gold',y:'40cqw'})],
  mandalaRoses:t=>[Lr('mandala-c','center',90,{t,y:'22cqw',o:.3,an:'spin'}),Lr('rose-red','bl',44,{x:'-12cqw',y:'24cqw',r:-10}),Lr('rose-red','br',40,{x:'-12cqw',y:'26cqw',r:20,f:1})],
  tiara:()=>[Lr('tiara','top',54,{t:'gold',y:'12cqw'}),Lr('champagne','bl',13,{x:'10cqw',y:'30cqw',r:-12,an:'sway'}),Lr('champagne','br',13,{x:'10cqw',y:'30cqw',r:12,f:1,an:'sway'}),Lr('rose-vintage','tr',42,{x:'-14cqw',y:'-6cqw',r:30}),Lr('butterfly-blue','ml',15,{x:'8cqw',y:'90cqw',an:'flutter'})],
  storks:()=>[Lr('svg:balloons','bl',56,{t:'pink',x:'-12cqw',y:'20cqw'}),Lr('svg:balloons','br',56,{t:'blue',x:'-12cqw',y:'20cqw',f:1}),Lr('stork-pink','tl',34,{x:'4cqw',y:'8cqw',an:'drift'}),Lr('stork-blue','tr',34,{x:'2cqw',y:'16cqw',an:'drift',f:1})],
  revealSoft:()=>[Lr('svg:clouds','top',110,{t:'white',y:'8cqw',an:'drift'}),Lr('svg:balloons','bottom',70,{t:'bluepink',y:'16cqw'})],
  baby:t=>[Lr('moon-gold','tr',28,{x:'6cqw',y:'8cqw',an:'pulse'}),Lr('svg:clouds','top',110,{t,y:'14cqw',an:'drift'}),Lr('teddy','bottom',38,{y:'24cqw',an:'float'}),Lr('svg:sparkles','top',100,{t:'white',y:'0cqw'})],
  storkOne:t=>[Lr(t==='pink'?'stork-pink':'stork-blue','top',56,{y:'10cqw',an:'drift'}),Lr('svg:clouds','bottom',100,{t:'white',y:'20cqw',an:'drift'})],
  heartRose:()=>[Lr('rose-stem','bl',22,{x:'2cqw',y:'26cqw',r:-14,an:'sway'}),Lr('roses-engraved','tr',54,{t:'rose',x:'-16cqw',y:'-8cqw',o:.7}),Lr('heart-red','center',15,{y:'14cqw',an:'pulse'})],
  moonStars:t=>[Lr('moon-gold','top',42,{y:'8cqw',an:'pulse'}),Lr('crescent-stars','bl',38,{t,x:'-6cqw',y:'30cqw',o:.7}),Lr('svg:sparkles','center',100,{t:'white',y:'40cqw'})],
  butterflies:()=>[Lr('butterfly-blue','tl',20,{x:'10cqw',y:'14cqw',an:'flutter',r:-12}),Lr('butterfly-peacock','mr',18,{x:'6cqw',y:'60cqw',an:'flutter'}),Lr('butterfly-vintage','bl',16,{x:'14cqw',y:'40cqw',an:'flutter'})],
  lanterns:t=>[Lr('svg:lanterns','top',100,{t:'gold',y:'0cqw'}),Lr('crescent-stars','center',58,{t,y:'30cqw',o:.35}),Lr('star-ornate','bl',20,{t,x:'10cqw',y:'40cqw',an:'pulse'}),Lr('star-ornate','br',15,{t,x:'14cqw',y:'52cqw',an:'pulse'})],
  ramadan:t=>[Lr('svg:lanterns','top',100,{t:'gold',y:'0cqw'}),Lr('moon-gold','tl',28,{x:'14cqw',y:'60cqw',an:'pulse'}),Lr('mandala-b','bottom',80,{t,y:'4cqw',o:.25,an:'spin'})],
  sparkles:t=>[Lr('svg:sparkles','top',100,{t,y:'4cqw'})],
  none:()=>[]
};

/* ---------- content per category (the designer can change all of it) ---------- */
const PROG = {
  wed:[['19:30','استقبال الضيوف'],['20:30','زفّة العرسان'],['21:30','العشاء'],['23:00','قطع الكيكة']],
  eng:[['19:00','الاستقبال'],['20:00','قراءة الفاتحة ولبس المحابس'],['21:00','العشاء']],
  henna:[['19:00','الاستقبال'],['20:00','نقش الحنّة'],['21:00','الأهازيج والزفّة'],['22:00','العشاء']],
  shower:[['17:00','الاستقبال'],['17:30','ألعاب ومسابقات'],['18:30','الكيكة والصور']],
  bday:[['20:00','الاستقبال'],['20:45','الفقرات والمسابقات'],['21:30','إطفاء الشمعة'],['22:00','العشاء']],
  grad:[['18:00','الاستقبال'],['18:30','كلمة الخرّيج'],['19:00','رمي القبعات'],['19:30','العشاء']]
};
const TX = {
  wed:{names:['محمد و هدى','علي و زينب','حيدر و نور','مصطفى و سارة','يوسف و مريم','أحمد و رقية','عمر و ليان','كرار و فاطمة'],sub:'بكل الحب ندعوكم',cardTitle:'The Wedding',
    invite:'بقلوب ملؤها الفرح والسرور\nنتشرف بدعوتكم لحضور حفل زفافنا\nوحضوركم يكمّل فرحتنا',venue:'قاعة الماسة — بغداد',details:['الدخول بالدعوة فقط','يرجى تأكيد الحضور','فعالية للكبار فقط'],
    family:[['أهل العريس','الحاج جاسم محمد وعائلته'],['أهل العروس','الحاج كريم عبدالله وعائلته']],closing:'حضوركم يكمّل فرحتنا',dressText:'نتمنى من الضيوف اختيار ألوان هادئة',
   msgTitle:'من القلب',msgBody:'شكراً لأنكم جزء من أجمل يوم بحياتنا',quote:'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا',quoteSrc:'سورة الروم',
    wishes:['أم علي: ألف مبروك وعقبال الذرية الصالحة','سارة: الله يتمم عليكم بخير']},
  eng:{names:['حسين و رقية','علي و آية','زيد و نبأ','باقر و زهراء','مرتضى و رسل'],sub:'حفل خطوبة',cardTitle:'Engaged',invite:'جمعنا الله على خير\nونتمنى تشاركونا فرحتنا',venue:'قاعة اللؤلؤة',details:['يرجى تأكيد الحضور'],
    family:[['بدعوة من','عائلتي العروسين']],closing:'وعقبال الفرحة الكبيرة',msgTitle:'',msgBody:'',quote:'',wishes:['ريم: مبروك يا أحلى عروس']},
  henna:{names:['ليلة حنّة فاطمة','حنّة زهراء','ليلة حنّة مريم','حنّة نور'],sub:'Henna Night',cardTitle:'تشرفونا',invite:'بالحنّة والزغاريد\nندعوكم تشاركونا ليلة الحنّة',venue:'بيت أهل العروس',
    details:['للنساء فقط','يرجى تأكيد الحضور'],family:[['بدعوة من','والدة العروس']],closing:'حضوركم يزيّن ليلتنا',dressText:'اللبس التراثي مرحّب بيه',wishes:['خالة أم حسين: الله يتمم بخير']},
  shower:{names:['نور','لينا','آية','دانة'],sub:'حفلة العروس',cardTitle:'Bridal Shower',invite:'قبل الفرح بأيام\nتعالوا نحتفل بالعروس',venue:'كافيه الورد',details:['للبنات فقط'],closing:'ننتظركم يا حلوات',dressText:'اللبس بالوردي',wishes:['صديقاتك: نحبك يا عروسة']},
  reveal:{names:['ولد لو بنت؟','He or She?','وردي لو أزرق؟'],sub:'حفلة كشف جنس المولود',cardTitle:'He or She?',invite:'خمّنوا وياانا!\nونكشف السر سوا',venue:'حديقة البيت',
    details:['البسوا وردي إذا تتوقعون بنت','وأزرق إذا تتوقعون ولد'],closing:'ننتظركم',wishes:['جدو: ولد ولا بنت، الله يجيبه بالسلامة']},
  baby:{names:['آدم','ليان','يوسف','جود','علي','رهف'],sub:'نوّرت دنيتنا',cardTitle:'Welcome Baby',invite:'وصل أحلى ضيف لبيتنا\nالحمد لله على سلامته وسلامة أمه',venue:'بيت العائلة',
    details:['استقبال المهنئين من ٥ إلى ٨ مساءً'],family:[['الأب والأم','علي و مريم']],closing:'',wishes:['عمته: الله يحفظه ويخليه إلكم']},
  grad:{names:['د. مريم','م. علي حسن','سارة','د. حيدر','زينب','م. نور','مصطفى','د. رقية'],sub:'حفل تخرّج',cardTitle:'Class of 2026',invite:'بعد سنين من التعب والسهر\nيسعدني تشاركوني فرحة تخرّجي',venue:'نادي العلوية',
    details:['يرجى تأكيد الحضور','اللبس الرسمي'],family:[['بحضور','عائلتي وأصدقائي']],closing:'كل نجاح إلي هو إلكم',msgTitle:'شكر',msgBody:'لأمي وأبوي، كل خطوة كانت بدعائكم',wishes:['بابا: فخورين بيك يا بطل']},
  bday:{names:['لُجين','ليان','يوسف','رُبى','تيم','جود','حسن','ملك','آدم','نور'],sub:'حفل عيد ميلاد',cardTitle:'Happy Birthday',invite:'لأن فرحتي تكبر بوجودكم\nأدعوكم لمشاركتي حفل ميلادي',venue:'قاعة الياسمين — بغداد',
    details:['يرجى تأكيد الحضور','فعالية عائلية'],closing:'شكراً لأنكم جزء من فرحتي',dressText:'',wishes:['ماما: كل عام وأنتِ أحلى','ريم: سنة حلوة يا جميل']},
  occ:{names:['عيدكم مبارك','رمضان كريم','عيد أضحى مبارك','سنة جديدة سعيدة','جمعة مباركة','مبروك البيت الجديد','ألف مبروك النجاح','حمدلله على السلامة'],sub:'تهنئة',cardTitle:'كل عام وأنتم بخير',
    invite:'تقبّل الله طاعاتكم\nوأعاده عليكم بالصحة واللمّة الحلوة',closing:'عائلة أبو علي',quote:'',msgTitle:'',msgBody:''}
};

/* ---------- looks: [title, palette, theme, photo, photoMode, layers(preset,arg), intro, fonts, metal, frame, fx, extra] ---------- */
const LOOKS = {
  wed:[
    ['ممر الورد','champagne','paper','aisle-flowers','full',['none'],'envelope','ruqaa','gold','none','petals'],
    ['قصر الثريا','blackGold','velvet','palace-hall','full',['sparkles','gold'],'curtain','ruqaa','gold','none','gold'],
    ['ثريا ذهبية','blackGold','night','chandelier-gold','full',['none'],'doors','qahiri','gold','none','gold'],
    ['شموع وورد','blushGold','paper','candles-flowers','band',['none'],'envelope','nastaliq','rose','none','petals',{corners:'rose'}],
    ['طاولة الورد','sageIvory','paper','table-flowers','full',['none'],'envelope','naskh','gold','none','petals'],
    ['باقة العروس','ivoryGold','paper','bouquet-roses','arch',['baroque','gold'],'envelope','ruqaa','gold','none','petals'],
    ['دانتيل وورد','champagne','marble','bouquet-lace','band',['none'],'doors','nastaliq','gold','none','petals'],
    ['خواتم وبتلات','burgundyGold','velvet','rings-petals','circle',['sparkles','gold'],'curtain','mirza','gold','none','petals'],
    ['عشاء الشموع','blackGold','night','candle-dinner','band',['sparkles','gold'],'doors','ruqaa','gold','none','gold'],
    ['ثريا كريستال','navyGold','night','chandelier-dark','full',['none'],'curtain','nastaliqUrdu','gold','none','stars'],
    ['ممر الشرائط','silverWhite','marble','aisle-ribbons','full',['none'],'envelope','ruqaa','silver','none','petals',{corners:'silver'}],
    ['حديقة الزفاف','sageIvory','paper','garden-table','band',['none'],'doors','naskh','gold','none','petals'],
    ['ستان خمري','wine','velvet','satin-red','full',['baroque','gold'],'curtain','ruqaa','gold','none','petals'],
    ['زفاف بنفسجي','plumNight','velvet','satin-purple','full',['sparkles','gold'],'curtain','mirza','gold','none','gold'],
    ['العروسين','champagne','paper','couple-bouquet','band',['none'],'envelope','nastaliq','gold','none','petals'],
    ['زفاف ملكي','burgundyGold','velvet','','none',['candelabra','gold'],'curtain','ruqaa','gold','none','petals',{mono:'م',mo:.14,my:20}],
    ['ورد أحمر','burgundyGold','velvet','roses-red-wall','band',['sparkles','gold'],'doors','ruqaa','gold','none','petals'],
    ['زفاف أبيض','silverWhite','marble','','none',['dove','silver'],'doors','ruqaa','silver','arch','petals',{corners:'silver'}],
    ['خواتم كحلي','navyGold','night','rings-navy','arch',['sparkles','gold'],'doors','naskh','gold','none','gold'],
    ['عاجي كلاسيك','ivoryGold','paper','','none',['baroque','gold'],'envelope','ruqaa','gold','double','gold'],
    ['فاوانيا','blushGold','paper','peonies-field','band',['butterflies'],'doors','nastaliq','rose','none','petals',{corners:'rose'}],
    ['أسود وذهبي','blackGold','velvet','','none',['candelabra','gold'],'curtain','qahiri','gold','arch','gold',{mono:'ع',mo:.12}],
    ['زهر أبيض','sageIvory','paper','white-blossom','full',['none'],'doors','naskh','acc','none','petals'],
    ['زمردي','emeraldGold','velvet','','none',['mandalaRoses','gold'],'curtain','ruqaa','gold','none','gold'],
    ['كيكة الزفاف','champagne','paper','wedding-cake','arch',['sparkles','gold'],'envelope','mirza','gold','none','petals'],
    ['دانتيل','ivoryGold','marble','lace','band',['bouquets','gold'],'doors','nastaliq','gold','none','petals'],
    ['ورد وردي','mauve','paper','pink-roses-soft','full',['none'],'envelope','ruqaa','rose','none','hearts',{corners:'rose'}],
    ['ليلة نجوم','navyGold','night','milky-way','full',['sparkles','gold'],'doors','ruqaa','gold','none','stars'],
    ['تيراكوتا بوهو','terracotta','paper','','none',['vintage'],'envelope','nastaliq','acc','oval','petals',{corners:'acc'}],
    ['يدين وخاتم','sageIvory','paper','hands-ring','circle',['bouquets','gold'],'doors','naskh','acc','none','petals'],
    ['ورد أبيض','champagne','paper','roses-white-paper','band',['baroque','gold'],'doors','ruqaa','gold','none','petals'],
    ['لافندر','lavender','pastel','','none',['bouquets','silver'],'doors','nastaliq','silver','arch','petals',{corners:'silver'}],
    ['نبيذي','wine','paper','','none',['roses'],'curtain','ruqaa','acc','none','petals',{corners:'rose'}],
    ['أضواء ذهبية','blackGold','night','gold-lights','full',['none'],'curtain','vibes','gold','none','gold'],
    ['رخام وورد','silverWhite','marble','marble-flowers','band',['dove','gold'],'envelope','ruqaa','gold','none','petals'],
    ['زنبق','blackGold','velvet','lily-black','arch',['sparkles','gold'],'doors','naskh','gold','none','petals'],
    ['زيتوني','olive','paper','','none',['bouquets','gold'],'envelope','nastaliq','gold','double','petals'],
    ['أزرق غباري','dustyBlue','marble','','none',['dove','silver'],'doors','naskh','silver','oval','petals',{corners:'silver'}],
    ['زفة','burgundyGold','night','night-bokeh','full',['candelabra','gold'],'curtain','ruqaa','gold','none','gold'],
    ['ورد خمري','wine','velvet','rose-red-dark','circle',['baroque','gold'],'doors','mirza','gold','none','petals']
  ],
  eng:[
    ['خطوبة ذهبية','ivoryGold','paper','','none',['ringRoses','gold'],'envelope','nastaliq','gold','none','gold'],
    ['خاتم الألماس','navyGold','night','rose-ring','arch',['sparkles','gold'],'doors','ruqaa','gold','none','gold'],
    ['ملكة كلاسيك','champagne','marble','','none',['rings','gold'],'doors','naskh','gold','double','petals'],
    ['ورد ناعم','blushGold','paper','roses-pink-soft','band',['butterflies'],'envelope','ruqaa','rose','none','hearts',{corners:'rose'}],
    ['خواتم على خشب','terracotta','paper','rings-wood','full',['none'],'doors','nastaliq','gold','none','petals'],
    ['مريمية','sageIvory','paper','','none',['bouquets','gold'],'envelope','naskh','acc','arch','petals',{corners:'acc'}],
    ['ليلية','plumNight','night','','none',['moonStars','gold'],'curtain','mirza','gold','none','stars'],
    ['توليب','mauve','paper','tulips','circle',['vintage'],'doors','ruqaa','rose','none','petals'],
    ['فضي','silverWhite','marble','','none',['rings','silver'],'doors','kufi','silver','oval','petals',{corners:'silver'}],
    ['زهر الكرز','blushGold','pastel','cherry-white','band',['sparkles','gold'],'envelope','nastaliq','gold','none','petals']
  ],
  henna:[
    ['فانوس الحنّة','henna','night','lantern','full',['none'],'doors','ruqaa','gold','none','gold'],
    ['سوق الفوانيس','emeraldGold','night','lantern-market','band',['lanterns','gold'],'curtain','ruqaa','gold','none','stars'],
    ['ليلة الحنّة','emeraldGold','velvet','','none',['mandala','gold'],'curtain','ruqaa','gold','none','gold'],
    ['حنّة حمراء','henna','velvet','','none',['mandalaRoses','gold'],'curtain','ruqaa','gold','arch','gold',{mono:'ح',mo:.12}],
    ['ماندالا ذهبية','blackGold','night','','none',['mandala','gold'],'doors','qahiri','gold','none','stars'],
    ['تراثية','terracotta','paper','','none',['mandala','acc'],'envelope','ruqaa','acc','double','petals',{corners:'acc'}],
    ['أضواء الحنّة','henna','night','gold-lights','full',['lanterns','gold'],'curtain','ruqaa','gold','none','gold'],
    ['ورد وحنّة','wine','velvet','rose-petals','band',['mandala','gold'],'doors','mirza','gold','none','petals'],
    ['خضراء ملكية','emeraldGold','velvet','','none',['lanterns','gold'],'doors','ruqaa','gold','arch','gold'],
    ['حنّة بنفسجية','plumNight','velvet','','none',['mandalaRoses','gold'],'curtain','nastaliq','gold','none','petals']
  ],
  shower:[
    ['حفلة العروس','blushGold','paper','','none',['tiara'],'doors','ruqaa','rose','none','hearts',{corners:'rose'}],
    ['فاوانيا وردية','babyPink','paper','peonies-wood','band',['tiara'],'envelope','nastaliq','rose','none','petals',{corners:'rose'}],
    ['بالون وردي','babyPink','pastel','balloon-pink','full',['none'],'box','ruqaa','acc','none','hearts'],
    ['تاج ذهبي','champagne','marble','','none',['tiara'],'doors','mirza','gold','arch','gold'],
    ['لافندر ناعم','lavender','pastel','','none',['butterflies'],'envelope','ruqaa','acc','oval','petals',{corners:'acc'}],
    ['ورد باستيل','mauve','paper','pastel-flowers','band',['sparkles','gold'],'doors','nastaliq','rose','none','petals'],
    ['ليلة العروس','plumNight','night','','none',['champagne'],'curtain','vibes','gold','none','stars'],
    ['مرجاني','coral','paper','','none',['balloonsRose'],'box','fun','acc','none','confetti',{corners:'acc'}]
  ],
  reveal:[
    ['ولد لو بنت؟','lavender','pastel','','none',['storks'],'box','fun','acc','none','confetti',{corners:'acc'}],
    ['غيوم وبالونات','dustyBlue','pastel','','none',['revealSoft'],'box','kufiFun','acc','none','balloons',{corners:'acc'}],
    ['وردي أزرق','babyPink','pastel','balloons-pastel','band',['none'],'box','fun','acc','none','confetti'],
    ['لقلق','babyBlue','pastel','','none',['storkOne','blue'],'envelope','kufiFun','acc','none','bubbles'],
    ['قصاصات','sunny','paper','confetti-aqua','full',['none'],'box','fun','acc','none','confetti'],
    ['ذهبي ناعم','champagne','paper','','none',['storks'],'doors','ruqaa','gold','none','gold']
  ],
  baby:[
    ['أهلاً يا صغيرنا','babyBlue','pastel','','none',['baby','white'],'box','kufiFun','acc','none','bubbles',{corners:'acc'}],
    ['أميرتنا وصلت','babyPink','pastel','','none',['baby','pink'],'box','kufiFun','acc','none','bubbles',{corners:'acc'}],
    ['قدم صغير','ivoryGold','paper','baby-feet','band',['sparkles','gold'],'envelope','ruqaa','gold','none','petals'],
    ['نوم هادي','dustyBlue','pastel','baby-sleep','full',['none'],'box','naskh','acc','none','stars'],
    ['حذاء صغير','sageIvory','paper','baby-shoes','arch',['none'],'doors','ruqaa','acc','none','petals'],
    ['لقلق البشارة','mint','pastel','','none',['storkOne','pink'],'box','kufiFun','acc','none','bubbles'],
    ['دباديب','champagne','paper','teddy-mobile','band',['none'],'box','marhey','acc','none','balloons'],
    ['يد صغيرة','blushGold','paper','baby-hand','circle',['sparkles','gold'],'envelope','nastaliq','rose','none','petals']
  ],
  grad:[
    ['تخرّج ذهبي','navyGold','night','','none',['laurel'],'doors','ruqaa','gold','none','gold'],
    ['قبعات طايرة','silverWhite','marble','','none',['caps'],'envelope','ruqaa','ink','none','confetti'],
    ['تخرّج وردي','blushGold','paper','','none',['capRoses'],'doors','ruqaa','rose','none','petals',{corners:'rose'}],
    ['قبعات الدفعة','blackGold','night','grad-caps','full',['none'],'curtain','kufi','gold','none','gold'],
    ['إكليل الغار','ivoryGold','paper','','none',['wreathCap'],'doors','naskh','gold','double','gold'],
    ['شهادة','dustyBlue','paper','','none',['diplomaBow'],'envelope','kufi','acc','none','confetti',{corners:'acc'}],
    ['زمردي','emeraldGold','velvet','','none',['laurel'],'curtain','ruqaa','gold','none','gold'],
    ['خمري','burgundyGold','velvet','','none',['wreathCap'],'doors','mirza','gold','arch','gold'],
    ['أضواء التخرّج','blackGold','night','sparkler','full',['none'],'doors','ruqaa','gold','none','gold'],
    ['ليلكي','lavender','pastel','','none',['capRoses'],'envelope','nastaliq','acc','none','petals',{corners:'acc'}],
    ['أبيض وأسود','silverWhite','marble','','none',['laurel'],'doors','kufi','ink','none','confetti'],
    ['بالونات التخرّج','sunny','paper','balloons-sky','band',['caps'],'box','fun','acc','none','balloons'],
    ['ورد أبيض','sageIvory','paper','white-blossom','band',['wreathCap'],'doors','naskh','acc','none','petals'],
    ['ليلة التخرّج','plumNight','night','milky-way','full',['sparkles','gold'],'curtain','vibes','gold','none','stars'],
    ['مشمشي','coral','paper','','none',['diplomaBow'],'box','fun','acc','none','confetti',{corners:'acc'}]
  ],
  bday:[
    ['أضواء الحفلة','blackGold','night','fairy-lights','band',['balloonsGold'],'box','ruqaa','gold','none','confetti'],
    ['ستارة ذهبية','blackGold','velvet','gold-drape','band',['sparkles','gold'],'curtain','vibes','gold','none','gold'],
    ['بالونات ذهبية','ivoryGold','paper','','none',['balloonsGold'],'doors','ruqaa','gold','none','gold'],
    ['وردي ناعم','babyPink','paper','','none',['balloonsRose'],'envelope','nastaliq','rose','none','hearts',{corners:'rose'}],
    ['عيد ميلاد طفل','babyBlue','pastel','','none',['balloonsMix'],'box','fun','acc','none','balloons',{corners:'acc'}],
    ['سهرة ميلاد','plumNight','night','','none',['champagne'],'curtain','mirza','gold','none','stars'],
    ['كيكة الميلاد','coral','paper','','none',['cake','pink'],'box','marhey','acc','none','confetti',{corners:'acc'}],
    ['شمعة وأمنية','champagne','paper','cake-candle','band',['sparkles','gold'],'envelope','ruqaa','gold','none','gold'],
    ['بالون وردي','babyPink','pastel','balloon-pink','full',['none'],'box','ruqaa','rose','none','hearts'],
    ['قصاصات','sunny','paper','confetti-fall','full',['none'],'box','fun','acc','none','confetti'],
    ['كب كيك','mint','pastel','cupcake-aqua','band',['balloonsMix'],'box','kufiFun','acc','none','confetti'],
    ['بالونات السما','dustyBlue','pastel','balloons-sky','full',['none'],'doors','kufiFun','acc','none','balloons'],
    ['هدية','blushGold','paper','gift-confetti','band',['sparkles','gold'],'box','ruqaa','gold','none','confetti'],
    ['شرارة','blackGold','night','sparkler','full',['none'],'curtain','vibes','gold','none','gold'],
    ['أسود وذهبي','blackGold','velvet','','none',['balloonsGold'],'curtain','ruqaa','gold','arch','gold'],
    ['بالونات ملونة','sunny','paper','balloons-colorful','band',['none'],'box','fun','acc','none','balloons'],
    ['بنفسجي','lavender','pastel','balloons-purple','full',['none'],'box','marhey','acc','none','confetti'],
    ['كيكة بيضاء','ivoryGold','paper','','none',['cake','white'],'box','ruqaa','gold','none','gold'],
    ['ورد وميلاد','mauve','paper','peonies-field','band',['balloonsRose'],'envelope','ruqaa','rose','none','petals'],
    ['أحمر','roseRed','paper','balloon-red-sky','full',['none'],'box','fun','acc','none','confetti'],
    ['ليلة الأمنيات','navyGold','night','night-bokeh','full',['sparkles','gold'],'doors','mirza','gold','none','stars'],
    ['هدية مغلفة','terracotta','paper','gift-kraft','arch',['none'],'box','nastaliq','acc','none','confetti']
  ],
  occ:[
    ['رمضان في المسجد','emeraldGold','night','mosque-hall','band',['lanterns','gold'],'doors','ruqaa','gold','none','stars'],
    ['عيدكم مبارك','emeraldGold','night','','none',['lanterns','gold'],'curtain','ruqaa','gold','none','stars'],
    ['رمضان كريم','plumNight','velvet','','none',['ramadan','gold'],'doors','ruqaa','gold','arch','stars'],
    ['عيد الأضحى','navyGold','night','','none',['lanterns','gold'],'doors','qahiri','gold','none','stars'],
    ['سنة جديدة','blackGold','night','sparkler','full',['none'],'curtain','kufi','gold','none','gold'],
    ['جمعة مباركة','sageIvory','paper','white-blossom','band',['none'],'envelope','naskh','acc','none','petals'],
    ['البيت الجديد','terracotta','paper','gift-kraft','arch',['none'],'box','ruqaa','acc','none','confetti'],
    ['ألف مبروك النجاح','sunny','paper','confetti-aqua','band',['none'],'box','fun','acc','none','confetti'],
    ['حمدلله على السلامة','dustyBlue','pastel','tulips','circle',['none'],'envelope','nastaliq','acc','none','petals']
  ]
};
const CAT_BASE = {wed:100,eng:200,henna:250,shower:300,reveal:350,baby:400,grad:450,bday:500,occ:700};
const DATES = ['2026-12-18','2027-01-15','2027-02-05','2026-11-27','2027-03-12','2026-12-24','2027-01-29'];
const TIMES = ['19:30','20:00','18:30','19:00','20:30','17:30'];
function buildDesigns(){
  const out=[];
  Object.entries(LOOKS).forEach(([cat,list])=>{
    const tx=TX[cat],songs=songsFor(cat);
    list.forEach((lk,i)=>{
      const [title,pal,theme,photo,photoMode,[lp,arg],intro,fp,metal,frame,fx,extra={}]=lk;
      const f=FP[fp]||FP.ruqaa,song=songs.length?songs[i%songs.length]:null;
      const dated=cat!=='occ';
      const d={...structuredClone(base),...applyPal(pal),id:cat+'-'+(i+1),code:'BR-'+(CAT_BASE[cat]+i+1),cat,title,theme,photo:photo?BG_DIR+photo+'.webp':'',photoMode:photo?photoMode:'none',
        layers:LP[lp]?LP[lp](arg):[],intro,fName:f[0],fTitle:f[1],ns:f[2]*(cat==='wed'||cat==='eng'?.82:1),metal,frame,fx,
        music:song?'yt:'+song.id:'',musicStart:song?song.s:0,
        name:tx.names[i%tx.names.length],sub:tx.sub,cardTitle:tx.cardTitle,invite:tx.invite,closing:tx.closing||'',
        venue:dated?tx.venue||'':'',date:dated?DATES[i%DATES.length]:'',time:dated?TIMES[i%TIMES.length]:'',
        program:PROG[cat]||[],details:tx.details||[],family:tx.family||[],msgTitle:tx.msgTitle||'',msgBody:tx.msgBody||'',msgSign:'',
        quote:tx.quote||'',quoteSrc:tx.quoteSrc||'',
        wishes:tx.wishes||[],photos:tx.photos||[],
        attendBase:dated?[86,140,52,210,64][i%5]:0,pop:(list.length-i)+(i<3?10:0),feat:i===0&&['wed','grad','bday','henna','eng'].includes(cat),
        sections:[...ORDER[cat]],...extra};
      if(extra.sectionsFirst){d.sections=[extra.sectionsFirst,...d.sections.filter(k=>k!==extra.sectionsFirst)];delete d.sectionsFirst;}
      if(!d.date)d.sections=d.sections.filter(k=>!['venue','calendar','countdown','program','attend','qr'].includes(k));
      out.push(d);
    });
  });
  return out;
}
const DEFAULTS={seq:1000,settings:{whatsapp:'',phone:'',telegram:'',instagram:IG_DEFAULT,adminCode:'1234',tagline:'هدايا ودعوات إلكترونية بخط عربي',sbUrl:'',sbKey:''},fonts:[],designs:buildDesigns()};
