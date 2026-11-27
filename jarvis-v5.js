/* =====================================================================
   J.A.R.V.I.S V6 — carregue POR ÚLTIMO no index.html:
   <script src="jarvis-v6.js?v=6"></script>
   Tudo desta versão está neste arquivo (sem depender de funções novas
   de outros scripts). Ele assume o controle do que precisa mudar.
   ===================================================================== */
(()=>{
const S=(n,f)=>{try{f()}catch(e){console.warn('jarvis-v6 ['+n+']',e)}};
const TAU=Math.PI*2;
const ico=(p,w)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||1.7)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';

/* ---------- ÍCONES (tudo por código, nenhum emoji) ---------- */
const IC={
clima:'<circle cx="8.5" cy="8.5" r="3"/><path d="M8.5 2v1.8M2 8.5h1.8M3.9 3.9l1.3 1.3M13.1 3.9l-1.3 1.3"/><path d="M8 20h9.2a3.6 3.6 0 0 0 .3-7.2 5.2 5.2 0 0 0-9.8 1.4A3 3 0 0 0 8 20z"/>',
tarefas:'<path d="M4 6.5l1.8 1.8L9 5M4 13.5l1.8 1.8L9 12M12 7h8M12 14h8M5 20h15"/>',
txt:'<path d="M6 6h12l3 3v6l-3 3H6l-3-3V9z"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>',
mem:'<path d="M12 3l7.5 4.2v5.6c0 3.8-3.2 6.7-7.5 8.2-4.3-1.5-7.5-4.4-7.5-8.2V7.2z"/><path d="M9 11h6M9 14.5h4"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
send:'<path d="M3 12L21 4l-6 16-3.2-6.8z"/>',
code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
clip:'<rect x="6" y="5" width="12" height="16" rx="1.5"/><path d="M9 5V3h6v2M9 11h6M9 15h4"/>',
search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
play:'<path d="M7 5l12 7-12 7z"/>',
folder:'<path d="M3 7l2-2h5l2 2h7l2 2v8l-2 2H5l-2-2z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
cs:'<circle cx="16.5" cy="7" r="2.8"/><path d="M16.5 1.5v1.2M21.5 7h-1.2M20 3.5l-.8.8"/><path d="M7 20h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5 1.3A3 3 0 0 0 7 20z"/>',
cloud:'<path d="M7 19h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 19z"/>',
fog:'<path d="M4 8h16M3 12h18M5 16h14M8 20h8"/>',
rain:'<path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
snow:'<path d="M12 3v18M4.5 7.5l15 9M4.5 16.5l15-9"/>',
storm:'<path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 14z"/><path d="M12 14l-2 4h3l-2 4"/>'};
const WM={'☀':'sun','⛅':'cs','☁':'cloud','🌫':'fog','🌦':'rain','🌧':'rain','❄':'snow','⛈':'storm'};
const hex3d=()=>'<span class="h3"><span class="p">'+[0,1,2,3,4,5].map(i=>'<u class="f" style="transform:rotateY('+i*60+'deg) translateZ(8.66px)"></u>').join('')+'<u class="t"></u><u class="b"></u></span></span>';
const root=document.documentElement;
const normP=p=>String(p).replace(/index\.html?$/i,'').replace(/\/+$/,'');
const samePath=p=>normP(p)===normP(location.pathname);

/* ---------- CSS ---------- */
const HEX_CSS=
'.h3{display:inline-block;position:relative;width:24px;height:26px;perspective:140px;flex:none;filter:drop-shadow(0 0 5px rgba(var(--acr),.9))}'+
'.h3 .p{position:absolute;left:12px;top:13px;width:0;height:0;transform-style:preserve-3d;animation:h3r 7s linear infinite}'+
'.h3 u{position:absolute;display:block;text-decoration:none;box-sizing:border-box}'+
'.h3 .f{width:10px;height:14px;left:-5px;top:-7px;border:1px solid var(--ac);background:linear-gradient(rgba(var(--acr),.65),rgba(var(--acr),.1))}'+
'.h3 .t,.h3 .b{width:20px;height:17.32px;left:-10px;top:-8.66px;background:rgba(var(--ac2r),.5);clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}'+
'.h3 .t{transform:translateY(-7px) rotateX(90deg)}.h3 .b{transform:translateY(7px) rotateX(90deg)}'+
'@keyframes h3r{from{transform:rotateX(-26deg) rotateY(0)}to{transform:rotateX(-26deg) rotateY(360deg)}}';
const IF_CSS=HEX_CSS+
'.hx b{display:flex}.hx b svg{width:1.15em;height:1.15em;display:block}'+
'.ic{border:0;background:none;color:var(--ac);width:42px;height:42px;display:flex;align-items:center;justify-content:center;padding:0;flex:none;cursor:pointer}'+
'.ic svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 4px rgba(var(--acr),.8))}'+
'.ic:active{background:rgba(var(--acr),.35);color:var(--ac2)}';

const st=document.createElement('style');
st.textContent=HEX_CSS+`
.hx b{display:flex}.hx b svg{width:1.15em;height:1.15em;display:block}
.logo i{display:none}
#hud{display:none!important}
#hud6{position:relative;z-index:5;flex:none;display:grid;grid-template-columns:1fr auto 1fr;align-items:start;padding:0 18px;margin-top:-2px;font:10px var(--mono);letter-spacing:.14em;color:var(--mut)}
#hud6 .hl{display:flex;flex-direction:column;gap:6px}
#hud6 .hl span{display:flex;align-items:center;gap:6px;white-space:nowrap}
#hud6 .dt{width:6px;height:6px;border-radius:50%;background:var(--ac2);box-shadow:0 0 8px var(--ac2);animation:bk 1.6s infinite}
#hud6 #hc{color:var(--ac);font:400 11px var(--mono);text-shadow:0 0 8px var(--ac)}
#bat6 svg{width:22px;height:11px;color:var(--ac);flex:none}
#bat6.low svg{color:#ff6b6b}
#tms{top:calc(env(safe-area-inset-top) + 132px)!important}
#dock{gap:4px}
#dock .hx:nth-child(1),#dock .hx:nth-child(6){margin-top:22px}
#dock .hx:nth-child(2),#dock .hx:nth-child(5){margin-top:11px}
#dock .hx:nth-child(3){margin-top:-2px}
#dock .hx:nth-child(4){margin-top:2px}
@media(max-width:410px){#dock .hx{width:52px;height:60px}#dock .hx.big{width:62px;height:70px}}
#dock .hx.sp{color:var(--ac2);background:var(--ac2)}
/* gravação de voz (ocupa o lugar do dock, nunca cobre o texto do Jarvis) */
#vp{display:none;position:relative;z-index:6;flex:none;margin:2px 12px 10px;background:rgba(var(--acr),.55);clip-path:polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px);animation:vpin .22s ease-out}
#vp::before{content:"";position:absolute;inset:1px;background:linear-gradient(135deg,rgba(var(--acr),.18),rgba(var(--acr),.04) 50%),#020b14;clip-path:inherit}
#vp>*{position:relative}
body.vp #vp{display:block}
body.vp #dock,body.vp #tb{display:none!important}
@keyframes vpin{from{opacity:0;transform:translateY(18px)}}
#vp .vh{display:flex;align-items:center;gap:8px;padding:11px 14px 0;font:700 10px var(--hud);letter-spacing:.18em;color:var(--ac)}
#vp .vd{width:8px;height:8px;border-radius:50%;background:#ff4d5e;box-shadow:0 0 10px #ff4d5e;animation:bk 1s infinite;flex:none}
body.vpp #vp .vd{animation:none;background:var(--mut);box-shadow:none}
#vp .vk{margin-left:auto;font:11px var(--mono);color:var(--ac2);letter-spacing:.1em}
#vw{display:block;width:calc(100% - 28px);height:38px;margin:6px 14px 0}
#vt{display:block;width:calc(100% - 28px);margin:8px 14px 0;border:0;outline:0;resize:none;background:rgba(var(--acr),.1);color:var(--fg);font:16px/1.4 system-ui,sans-serif;padding:11px 14px;min-height:46px;max-height:22dvh;caret-color:var(--ac);clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px);box-shadow:inset 0 -1px 0 rgba(var(--acr),.5)}
#vt::placeholder{color:var(--mut)}
#vp .vb{display:flex;align-items:center;gap:10px;padding:10px 14px 14px}
#vp .vb .hx{width:44px;height:50px}
#vm.on{color:var(--ac2);background:var(--ac2)}
#vsend{flex:1;height:48px;border:0;color:#001;font:900 12px var(--hud);letter-spacing:.2em;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(90deg,var(--ac2),var(--ac));clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%)}
#vsend svg{width:18px;height:18px}
#vsend:active{filter:brightness(1.3)}
.shk{animation:shk .3s}@keyframes shk{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
/* studio / cofre como camadas do próprio Jarvis */
#v6ov{position:fixed;inset:0;z-index:100;pointer-events:none}
#v6ov.on{pointer-events:auto}
#v6ov iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000308;visibility:hidden;opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .16s ease-out,transform .16s ease-out,visibility 0s linear .16s}
#v6ov iframe.on{visibility:visible;opacity:1;transform:none;pointer-events:auto;transition:opacity .16s ease-out,transform .16s ease-out,visibility 0s}
body.v6-open>*:not(#v6ov){visibility:hidden!important}
body.v6-open *{animation-play-state:paused!important}
`;
document.head.appendChild(st);

/* =====================================================================
   1) MOTOR DE SOM — tudo por Web Audio (sem player do Chrome),
      corta o silêncio do começo dos arquivos, compartilhado com Studio/Cofre
   ===================================================================== */
let lastPlay=0,bootT0=0,bootTm=[],bootSrc=[],skipAt=0,fFired=false;
S('som',()=>{
  [['close','Fechar / voltar (X e setas)','Sci fi close'],
   ['studio','Abrir Studio','Sci fi interface zoom'],
   ['cofre','Abrir Cofre','Sci fi lock'],
   ['stop','Parar de gravar','Sci fi power down'],
   ['toggle','Interruptores e cores','Sci fi switch']].forEach(a=>{if(!SLOTS.some(s=>s[0]===a[0]))SLOTS.push(a)});
  Object.assign(FB,{
    close:()=>bp(1800,700,.07,.05),
    studio:()=>bp(300,1400,.2,.06,'triangle'),
    cofre:()=>{bp(900,0,.08,.06);setTimeout(()=>bp(500,0,.12,.06),70)},
    stop:()=>bp(1400,500,.12,.06),
    toggle:()=>bp(1200,1800,.06,.05),
    boot_f:()=>bp(200,2600,.5,.06,'triangle')});

  /* decodifica uma vez e corta o silêncio inicial */
  const BC=new Map();
  function getBuf(u,trim){
    const key=u+(trim?'|t':'|n');
    if(!BC.has(key))BC.set(key,(async()=>{
      const x=ax();if(!x)throw 0;
      const buf=await x.decodeAudioData(await(await fetch(u)).arrayBuffer());
      let off=0;
      if(trim){let first=buf.length;
        for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<first;i++){if(d[i]>.015||d[i]<-.015){first=i;break}}}
        if(first<buf.length)off=Math.min(1.5,Math.max(0,first/buf.sampleRate-.005))}
      return{buf,off}})().catch(e=>{BC.delete(key);throw e}));
    return BC.get(key)}
  const prime=()=>{SLOTS.forEach(s=>{const u=SU[s[0]];if(u)getBuf(u,s[0]!=='amb').catch(()=>{})})};
  loadSounds().then(prime).catch(()=>{});
  [2500,6000].forEach(ms=>setTimeout(()=>{loadSounds().then(prime).catch(()=>{})},ms));

  window.play=function(k,o){
    o=o||{};lastPlay=performance.now();
    if(k==='boot'&&!o.force)startBoot();
    if(!fxOn&&!o.force)return;
    const u=SU[k];
    if(u){
      const h={key:k,dead:false,node:null,stop(){this.dead=true;try{this.node&&this.node.stop()}catch(e){}},pause(){this.stop()}};
      getBuf(u,true).then(r=>{
        if(h.dead)return;const x=ax();if(!x)return;
        const s=x.createBufferSource(),g=x.createGain();
        s.buffer=r.buf;g.gain.value=Math.min(1,vol*(o.v||1));s.connect(g);g.connect(x.destination);s.start(0,r.off);h.node=s;
      }).catch(()=>{if(!h.dead&&FB[k]){try{FB[k]()}catch(e){}}});
      if(/^boot/.test(k))bootSrc.push(h);
      return h}
    if(FB[k]){try{FB[k]()}catch(e){}}};

  /* ---- ambiente: toca pelo site (Web Audio), não pelo player do Chrome, e é lembrado ---- */
  const A0=window.ambient;let ambSrc=null,ambG=null,ambTok=0;
  window.ambient=function(on){
    ambTok++;if(ambSrc){try{ambSrc.stop()}catch(e){}ambSrc=null}ambG=null;
    if(on&&SU.amb){
      A0(false);ambOn=true;sv('amb',true);const tok=ambTok;
      getBuf(SU.amb,false).then(r=>{if(tok!==ambTok)return;const x=ax();if(!x)return;
        const s=x.createBufferSource(),g=x.createGain();s.buffer=r.buf;s.loop=true;g.gain.value=vol*.5;s.connect(g);g.connect(x.destination);s.start(0);ambSrc=s;ambG=g}).catch(()=>{});
    }else{A0(on);sv('amb',!!on)}};
  setInterval(()=>{if(ambG)ambG.gain.value=vol*.5},400);

  /* ---- abertura: cada som no seu momento; pular cancela todos menos o último (abre a interface) ---- */
  const BT={boot_a:.15,boot_b:1.7,boot_t:1.9,boot_d:2.2,boot_c:2.6,boot_e:4.1,boot_f:5.3};
  window.startBoot=function(){
    const n=performance.now();if(n-bootT0<800)return;
    bootT0=n;skipAt=0;fFired=false;clearBoot();
    Object.entries(BT).forEach(([k,t])=>bootTm.push(setTimeout(()=>{if(k==='boot_f')fFired=true;play(k)},t*1000)));
    if(ld('amb',false)&&!ambOn)setTimeout(()=>window.ambient(true),60)};
  function clearBoot(){bootTm.forEach(clearTimeout);bootTm=[]}
  function skipBoot(){
    skipAt=performance.now();clearBoot();
    bootSrc=bootSrc.filter(h=>{if(h.key==='boot_f')return true;h.stop();return false});
    try{speechSynthesis.cancel()}catch(e){}
    if(!fFired){fFired=true;play('boot_f')}}
  window.jaOpenStart=window.startBoot;window.jaOpenSkip=skipBoot;
  document.addEventListener('pointerdown',()=>{const d=(performance.now()-bootT0)/1000;if(bootT0&&!skipAt&&d>.35&&d<5.9)skipBoot()},true);
  const sp0=window.speak;
  window.speak=function(t){
    if(skipAt&&performance.now()-skipAt<5000&&typeof t==='string'&&/^(Bem-vindo|Boa madrugada|Bom dia|Boa tarde|Boa noite)/.test(t))return Promise.resolve();
    return sp0.apply(this,arguments)};

  /* ---- som em TODOS os botões (configurável em Configurações → Sons) ---- */
  const A_SEL='button,.hx,a.sb,.tab,.cmd,.sw,.td,.rb,.tm,.go,.cb,.q,.tk,#shd,#drd';
  const CLOSE_SEL='#shx,.rm,[data-a=del],[data-a=x],#bx,#pvx,#vx,.tab button,#drd,#shd,#stc,#jback';
  const role=el=>el.closest(CLOSE_SEL)?'close':el.closest('[data-k=studio]')?'studio':el.closest('[data-k=cofre]')?'cofre':el.closest('.sw,.td')?'toggle':'click';
  window.__v6deleg=d=>d.addEventListener('click',e=>{
    const el=e.target&&e.target.closest&&e.target.closest(A_SEL);if(!el)return;
    const t=performance.now();setTimeout(()=>{if(lastPlay<t)window.play(role(el))},70)},true);
  window.__v6deleg(document);
});

/* =====================================================================
   2) VISUAL: hexágono 3D, SISTEMA ONLINE + BATERIA, dock sem emoji
   ===================================================================== */
S('ui',()=>{
  /* limpa o que será refeito */
  ['#stb','#stw','#stc','#ja-ov','#hud','#hud6'].forEach(s=>document.querySelectorAll(s).forEach(e=>e.remove()));
  const lg=document.querySelector('.logo');
  if(lg&&!lg.querySelector('.h3'))lg.insertAdjacentHTML('afterbegin',hex3d());

  /* SISTEMA ONLINE + BATERIA (embaixo) + relógio */
  const hud=document.createElement('div');hud.id='hud6';
  hud.innerHTML='<div class="hl"><span><i class="dt"></i>SISTEMA ONLINE</span><span id="bat6">BATERIA --</span></div><b id="hc">--:--:--</b><span id="hb" hidden></span>';
  document.querySelector('header').after(hud);
  const tick=()=>{const e=document.getElementById('hc');if(e)e.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};tick();setInterval(tick,1000);
  const batSvg=(p,ch)=>'<svg viewBox="0 0 26 12"><rect x=".7" y=".7" width="21" height="10.6" rx="2" fill="none" stroke="currentColor"/><rect x="22.5" y="3.5" width="2.5" height="5" rx=".8" fill="currentColor"/><rect x="2.4" y="2.4" width="'+(17.6*p/100).toFixed(1)+'" height="7.2" rx="1" fill="currentColor"/>'+(ch?'<path d="M12.6 1.6L7.6 6.6h3.2L9.6 10.6l5-5.2h-3.2z" fill="#02101c"/>':'')+'</svg>';
  try{navigator.getBattery().then(b=>{const u=()=>{const p=Math.round(b.level*100),e=document.getElementById('bat6');if(!e)return;e.classList.toggle('low',p<=20&&!b.charging);e.innerHTML=batSvg(p,b.charging)+'BATERIA '+p+'%'};u();b.onlevelchange=b.onchargingchange=u})}catch(e){}

  /* dock: ícones por código; COFRE e STUDIO (direita) */
  const dock=$('#dock');
  [...dock.children].forEach(b=>{if(/COFRE|STUDIO|MERCADO/i.test(b.textContent||'')||b.id==='stb')b.remove()});
  const setI=(k,n)=>{const b=document.querySelector('#dock [data-k="'+k+'"] b');if(b)b.innerHTML=ico(IC[n])};
  setI('clima','clima');setI('tarefas','tarefas');setI('txt','txt');setI('mem','mem');
  const mkb=(k,n,l,c)=>'<button class="hx'+(c||'')+'" data-k="'+k+'"><span><b>'+ico(IC[n])+'</b>'+l+'</span></button>';
  dock.insertAdjacentHTML('beforeend',mkb('cofre','lock','COFRE')+mkb('studio','code','STUDIO',' sp'));
  const g=document.querySelector('#gear b');if(g)g.innerHTML=ico(IC.gear);
  const sb=document.querySelector('#tb .hx b');if(sb)sb.innerHTML=ico(IC.send);
  dock.addEventListener('click',e=>{const b=e.target.closest('[data-k=cofre],[data-k=studio]');if(!b)return;
    e.stopImmediatePropagation();e.preventDefault();play(b.dataset.k);openP(b.dataset.k)},true);

  /* nada de posição errada: recalcula o layout quando algo muda de lugar */
  let rl=0;const relayout=()=>{cancelAnimationFrame(rl);rl=requestAnimationFrame(()=>{try{window.dispatchEvent(new Event('resize'))}catch(e){}})};
  window.__v6relayout=relayout;
  try{const ro=new ResizeObserver(relayout);['#cap','#hud6','#dock','header'].forEach(s=>{const e=document.querySelector(s);if(e)ro.observe(e)})}catch(e){}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(relayout);
  relayout();setTimeout(relayout,350);setTimeout(relayout,1200);
});

/* =====================================================================
   3) SEM EMOJI (painéis, clima, configurações)
   ===================================================================== */
S('emoji',()=>{
  const EM=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}\u{23E9}-\u{23FF}]/gu;
  const skip=n=>n.parentElement&&n.parentElement.closest('.wi,.ob,[data-keep]');
  function sweep(r){
    const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;const hit=[];
    while(n=w.nextNode()){if(!skip(n)&&(EM.test(n.nodeValue)||/Toque em/.test(n.nodeValue)))hit.push(n);EM.lastIndex=0}
    hit.forEach(t=>{t.nodeValue=t.nodeValue.replace(/Toque em \S*\s*e escolha/,'Toque no botão de pasta e escolha').replace(EM,'')});
    r.querySelectorAll('.rm').forEach(b=>{if(!b.firstElementChild)b.innerHTML=ico(IC.x)});
    r.querySelectorAll('.rb[data-a]').forEach(b=>{if(!b.firstElementChild)b.innerHTML=ico(IC[{play:'play',pick:'folder',del:'x'}[b.dataset.a]])});
    r.querySelectorAll('.wi,.ob b').forEach(b=>{if(!b.firstElementChild){const k=WM[Array.from(b.textContent)[0]];if(k)b.innerHTML=ico(IC[k])}})}
  let q=0;const go=()=>{if(q)return;q=1;Promise.resolve().then(()=>{q=0;['#shb','#cap'].forEach(s=>{const e=document.querySelector(s);if(e)sweep(e)})})};
  ['#shb','#cap'].forEach(s=>{const e=document.querySelector(s);if(e)new MutationObserver(go).observe(e,{childList:true,subtree:true,characterData:true})});
  go()});

/* =====================================================================
   4) GRAVAÇÃO DE VOZ: só para quando tocar no reator, enviar, editar
   ===================================================================== */
let vOn=false,vWant=false,vRec=false,vr=null,vBase='',vT0=0,vTm=0,vFail=0,vKbd=false,vLast=0;
S('voz',()=>{
  const SRc=window.SpeechRecognition||window.webkitSpeechRecognition;
  const pn=document.createElement('div');pn.id='vp';
  pn.innerHTML=
   '<div class="vh"><i class="vd"></i><span id="vs">GRAVANDO</span><span class="vk" id="vk">00:00</span></div>'+
   '<canvas id="vw"></canvas>'+
   '<textarea id="vt" rows="2" placeholder="Fale, ou toque aqui para digitar…" enterkeyhint="send" autocomplete="off" spellcheck="false"></textarea>'+
   '<div class="vb"><button class="hx sm" id="vx" aria-label="Cancelar"><span><b>'+ico(IC.x)+'</b></span></button>'+
   '<button class="hx sm" id="vm" aria-label="Microfone"><span><b>'+ico(IC.mic)+'</b></span></button>'+
   '<button id="vsend">'+ico(IC.send)+'ENVIAR</button></div>';
  $('#dock').before(pn);
  const ta=$('#vt'),wv=$('#vw'),wx=wv.getContext('2d');
  const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,innerHeight*.22)+'px'};

  function ui(){
    document.body.classList.toggle('vpp',!vRec);
    const t=vRec?'GRAVANDO · REATOR PARA PARAR':vWant?'INICIANDO…':'PAUSADO · REATOR RETOMA';
    $('#vs').textContent=t;$('#vm').classList.toggle('on',vRec);
    if(vOn)setSt(vRec?'GRAVANDO':'PAUSADO')}
  function stopRec(){try{vr&&vr.stop()}catch(e){}}
  function startRec(){
    if(!SRc){setSt('SEM RECONHECIMENTO DE VOZ · USE O TECLADO');play('err');vWant=false;return}
    try{speechSynthesis.cancel()}catch(e){}
    if(performance.now()-vLast<500){if(++vFail>4){vWant=false;ui();return}}else vFail=0;
    vLast=performance.now();
    vBase=ta.value.trim()?ta.value.trim()+' ':'';
    const r=new SRc();r.lang='pt-BR';r.continuous=true;r.interimResults=true;
    r.onstart=()=>{if(vr!==r)return;vRec=true;listening=true;ui()};
    r.onresult=e=>{if(vr!==r)return;let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;
      ta.value=vBase+s;grow();ta.scrollTop=ta.scrollHeight;bump=.5};
    r.onerror=e=>{if(vr!==r)return;
      if(e.error==='not-allowed'||e.error==='service-not-allowed'){vWant=false;setSt('PERMITA O MICROFONE')}
      else if(e.error==='network'){vWant=false;setSt('SEM CONEXÃO PARA A VOZ')}};
    r.onend=()=>{if(vr!==r)return;vRec=false;listening=false;
      if(vWant&&vOn)setTimeout(()=>{if(vWant&&vOn&&vr===r)startRec()},200);ui()};
    vr=r;try{r.start()}catch(e){}}

  function openVoice(){
    if(typeof closeSheet==='function')closeSheet();
    vOn=true;vWant=true;ta.value='';grow();vT0=performance.now();
    document.body.classList.add('vp');play('listen');ui();startRec();
    clearInterval(vTm);vTm=setInterval(()=>{const s=Math.floor((performance.now()-vT0)/1000);$('#vk').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},500);
    cancelAnimationFrame(wraf);wraf=requestAnimationFrame(drawW);
    window.__v6relayout&&window.__v6relayout()}
  function closeVoice(){
    vOn=false;vWant=false;const r=vr;vr=null;try{r&&r.abort()}catch(e){}
    vRec=false;listening=false;clearInterval(vTm);
    document.body.classList.remove('vp','vpp');if(vKbd){document.body.classList.remove('kbd');vKbd=false}
    try{ta.blur()}catch(e){}
    if(!speaking&&!think)setSt('AGUARDANDO COMANDO');
    window.__v6relayout&&window.__v6relayout()}
  window.__v6closeVoice=()=>{if(vOn)closeVoice()};
  function send(){
    const t=ta.value.trim();
    if(!t){pn.classList.remove('shk');void pn.offsetWidth;pn.classList.add('shk');play('err');return}
    closeVoice();handle(t)}

  /* reator: abre a gravação; com ela aberta, alterna parar/retomar */
  const L0=window.listen;
  window.listen=function(){
    if(contOn)return L0.apply(this,arguments);
    if(!vOn){openVoice();return}
    if(vWant||vRec){vWant=false;stopRec();play('stop');ui()}
    else{vWant=true;ui();startRec();play('listen')}};

  $('#vsend').onclick=send;
  $('#vx').onclick=()=>{closeVoice();setSt('AGUARDANDO COMANDO')};
  $('#vm').onclick=()=>{if(vWant||vRec){vWant=false;stopRec();play('stop');ui()}else{vWant=true;ui();startRec();play('listen')}};
  ta.addEventListener('input',grow);
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
  ta.addEventListener('focus',()=>{if(vWant||vRec){vWant=false;stopRec()}ui();document.body.classList.add('kbd');vKbd=true;
    setTimeout(()=>window.__v6relayout&&window.__v6relayout(),120);setTimeout(()=>window.__v6relayout&&window.__v6relayout(),420)});
  ta.addEventListener('blur',()=>{if(vKbd){document.body.classList.remove('kbd');vKbd=false;setTimeout(()=>window.__v6relayout&&window.__v6relayout(),150)}});

  /* onda sonora */
  let wraf=0;
  function drawW(ts){
    if(!vOn){wraf=0;return}wraf=requestAnimationFrame(drawW);
    const r=wv.getBoundingClientRect(),W=Math.max(10,r.width),H=Math.max(10,r.height);
    if(wv.width!==Math.round(W*DPR)){wv.width=Math.round(W*DPR);wv.height=Math.round(H*DPR)}
    wx.setTransform(DPR,0,0,DPR,0,0);wx.clearRect(0,0,W,H);
    const t=ts/1000,N=Math.floor(W/6),amp=vRec?.2+Math.min(.8,bump*1.6):.05;
    for(let i=0;i<N;i++){const u=i/N,env=Math.sin(u*Math.PI),
      h=2+(H-4)*amp*env*(.3+.7*Math.abs(Math.sin(t*5+i*.6)*Math.sin(t*2.1+i*.23)));
      wx.fillStyle='rgba('+ACR+','+(.3+.65*env)+')';wx.fillRect(i*6+1,(H-h)/2,3,h)}}
});

/* =====================================================================
   5) STUDIO e COFRE: camadas pré-carregadas do próprio Jarvis
   ===================================================================== */
let isOpen=false,cur=null,frozen=false,prevMain=false;
const P={studio:{src:'studio.html',f:null,ready:false,paused:true,pend:[],raf:null},cofre:{src:'cofre.html',f:null,ready:false,paused:true,pend:[],raf:null}};
let OV=null;
function openP(k){}function closeP(){}
S('paineis',()=>{
  OV=document.createElement('div');OV.id='v6ov';document.body.appendChild(OV);

  /* o Jarvis para de desenhar enquanto a camada está aberta (sem lag) */
  const bg0=window.bgdraw;
  window.bgdraw=function(){if(frozen)return;return bg0.apply(this,arguments)};
  function freeze(on){
    if(on){prevMain=mainDraw;mainDraw=false;frozen=true;document.body.classList.add('v6-open')}
    else{frozen=false;mainDraw=prevMain||mainDraw;document.body.classList.remove('v6-open')}}

  const themeVars=()=>{const c=getComputedStyle(root);return{ac:c.getPropertyValue('--ac').trim(),ac2:c.getPropertyValue('--ac2').trim(),acr:c.getPropertyValue('--acr').trim(),ac2r:c.getPropertyValue('--ac2r').trim()}};
  function pushTheme(f){try{
    const w=f.contentWindow,d=f.contentDocument,v=themeVars(),r=d.documentElement.style;
    r.setProperty('--ac',v.ac);r.setProperty('--ac2',v.ac2);r.setProperty('--acr',v.acr);r.setProperty('--ac2r',v.ac2r);
    w.eval('try{if(typeof ACR!=="undefined"){ACR="'+v.acr+'";AC2R="'+v.ac2r+'"}}catch(e){}')}catch(e){}}
  const ST0=window.setTheme;
  window.setTheme=function(){const r=ST0.apply(this,arguments);try{Object.values(P).forEach(p=>{if(p.f&&p.ready)pushTheme(p.f)})}catch(e){}return r};

  function setPause(p,on){
    p.paused=on;
    if(!on&&p.pend.length&&p.raf){const q=p.pend;p.pend=[];q.forEach(cb=>p.raf(cb))}}

  function route(u,e){
    if(u.origin!==location.origin)return;
    if(samePath(u.pathname)){e&&e.preventDefault();closeP();return}
    if(/cofre\.html?$/i.test(u.pathname)){e&&e.preventDefault();play('cofre');openP('cofre');return}
    if(/studio\.html?$/i.test(u.pathname)){e&&e.preventDefault();play('studio');openP('studio')}}

  function fixCofre(d){
    const h=d.querySelector('header');if(!h)return;
    h.style.justifyContent='flex-start';h.style.gap='8px';
    const a=h.querySelector('a.hx');if(a)a.style.display='none';
    if(!d.getElementById('jback')){const b=d.createElement('button');b.id='jback';b.className='ic';b.setAttribute('aria-label','Voltar ao Jarvis');b.innerHTML=ico(IC.back,2);b.onclick=()=>closeP();h.insertBefore(b,h.firstChild)}
    const li=h.querySelector('.logo i');if(li)li.outerHTML=hex3d();
    [['#new b','plus'],['#paste b','clip'],['#sch b','search']].forEach(([s,n])=>{const e=d.querySelector(s);if(e)e.innerHTML=ico(IC[n])})}
  function fixStudio(d){
    const h=d.querySelector('header');if(!h)return;
    if(!d.getElementById('jback')){const b=d.createElement('button');b.id='jback';b.className='ic';b.setAttribute('aria-label','Voltar ao Jarvis');b.innerHTML=ico(IC.back,2);b.onclick=()=>closeP();h.insertBefore(b,h.firstChild)}}

  function hook(k,f){
    let w,d;try{w=f.contentWindow;d=f.contentDocument;if(!w||!d||!d.body||w.location.href==='about:blank')return}catch(e){return}
    const p=P[k];if(p.hooked===w)return;p.hooked=w;
    if(samePath(w.location.pathname)){p.hooked=null;f.src=p.src;return}
    try{w.play=function(a,o){return window.play(a,o)}}catch(e){}              /* sons iguais aos do Jarvis, sem corte */
    try{const raf0=w.requestAnimationFrame.bind(w);p.raf=raf0;
      w.requestAnimationFrame=function(cb){if(p.paused){p.pend.push(cb);return 0}return raf0(cb)}}catch(e){}
    try{const s=d.createElement('style');s.textContent=IF_CSS;d.head.appendChild(s)}catch(e){}
    pushTheme(f);
    window.__v6deleg(d);
    d.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;let u;try{u=new URL(a.href,w.location.href)}catch(x){return}route(u,e)},true);
    if(w.navigation)w.navigation.addEventListener('navigate',e=>{
      if(!e.cancelable||e.hashChange||e.destination.sameDocument||e.navigationType==='reload'||e.navigationType==='traverse')return;
      let u;try{u=new URL(e.destination.url)}catch(x){return}route(u,e)});
    try{k==='cofre'?fixCofre(d):fixStudio(d)}catch(e){}
    p.ready=true;
    if(isOpen&&cur===k)setPause(p,false)}

  function mk(k){
    const p=P[k];if(p.f)return p;
    const f=document.createElement('iframe');f.title=k;
    f.allow='microphone; clipboard-read; clipboard-write; fullscreen; autoplay';
    f.addEventListener('load',()=>hook(k,f));
    f.src=p.src;OV.appendChild(f);p.f=f;return p}

  openP=function(k){
    if(!P[k])return;
    if(typeof closeSheet==='function')closeSheet();window.__v6closeVoice&&window.__v6closeVoice();
    const p=mk(k);cur=k;
    Object.keys(P).forEach(o=>{const q=P[o];if(q.f){q.f.classList.toggle('on',o===k);if(o!==k)setPause(q,true)}});
    OV.classList.add('on');
    if(!isOpen){history.pushState({v6:1},'');isOpen=true;freeze(true)}
    setPause(p,false)};

  closeP=function(fromPop){
    if(!isOpen)return;
    isOpen=false;const p=cur&&P[cur];
    try{p&&p.f&&p.f.contentWindow.dispatchEvent(new Event('pagehide'))}catch(e){}   /* o Studio salva ao ouvir isso */
    Object.values(P).forEach(q=>{if(q.f)q.f.classList.remove('on');setPause(q,true)});
    OV.classList.remove('on');freeze(false);play('close');
    if(!fromPop&&history.state&&history.state.v6)history.back()};
  addEventListener('popstate',()=>{if(isOpen)closeP(true)});

  const wo=window.open;
  window.open=function(u){
    try{if(u){const x=new URL(u,location.href);if(x.origin===location.origin&&/(cofre|studio)\.html?$/i.test(x.pathname)){route(x);return null}}}catch(e){}
    return wo.apply(this,arguments)};

  /* pré-carrega os dois em segundo plano assim que a abertura termina: abrir fica instantâneo */
  const iv=setInterval(()=>{if(typeof mainDraw!=='undefined'&&(mainDraw||frozen)){clearInterval(iv);
    setTimeout(()=>mk('cofre'),1800);setTimeout(()=>mk('studio'),3200)}},400);
});
})();
