/* =====================================================================
   J.A.R.V.I.S V7 — arquivo NOVO, entra DEPOIS do jarvis-v6.js (não substitui nada):
   <script src="jarvis-v6.js?v=6"></script>
   <script src="jarvis-v7.js?v=7"></script>
   Só mexe em: delay dos sons, tema salvo, barra de texto, loop do ambiente, botão Studio.
   ===================================================================== */
(()=>{
const S=(n,f)=>{try{f()}catch(e){console.warn('jarvis-v7 ['+n+']',e)}};
const TAU=Math.PI*2;
let pdAt=0,pdKey='';

/* 1) SOM NO INSTANTE DO TOQUE (e sem repetir no clique) */
S('som',()=>{
  const CLOSE='#shx,.rm,[data-a=del],[data-a=x],#bx,#pvx,#vx,.tab button,#drd,#shd,#stc,#jback';
  const FAST='button,.hx,a.sb,.sw,.td,.rb,.cb,.q,.tm,.go,#shd,#drd';
  const role=el=>el.closest(CLOSE)?'close':el.closest('[data-k=studio]')?'studio':el.closest('[data-k=cofre]')?'cofre':el.closest('.sw,.td')?'toggle':'click';
  const p0=window.play;
  window.play=function(k,o){
    o=o||{};
    if(!o._d&&!o.force&&pdKey&&(k===pdKey||k==='click')&&performance.now()-pdAt<900)return;
    return p0.call(this,k,o)};
  const bind=d=>{
    if(d.__v7)return;d.__v7=1;
    d.addEventListener('pointerdown',e=>{
      const el=e.target&&e.target.closest&&e.target.closest(FAST);
      if(!el||e.button>0||el.closest('[data-nosnd]'))return;
      pdAt=performance.now();pdKey=role(el);window.play(pdKey,{_d:1})},true)};
  bind(document);
  ['vm','vsend'].forEach(i=>{const e=document.getElementById(i);if(e)e.setAttribute('data-nosnd','')});
  /* Studio e Cofre (iframes) */
  setInterval(()=>{document.querySelectorAll('#v6ov iframe').forEach(f=>{try{const d=f.contentDocument;if(d&&d.body)bind(d)}catch(e){}})},700);
});

/* 2) TEMA SALVO: os temas novos (gelo, safira, abismo) só existem depois do core; restaura agora */
S('tema',()=>{const n=ld('th','azul');if(TH[n])setTheme(n,false);
  const T0=window.setTheme;window.setTheme=function(n,sv0){const r=T0.apply(this,arguments);if(sv0!==false&&TH[n])sv('th',n);return r}});

/* 3) BARRA "DIGITE UM COMANDO": fecha ao abrir painéis e fica por baixo deles */
S('barra',()=>{
  const st=document.createElement('style');st.textContent='#tb{z-index:35!important}';document.head.appendChild(st);
  const o=window.openSheet;
  window.openSheet=function(){const tb=$('#tb');if(tb&&tb.classList.contains('on')){tb.classList.remove('on');try{$('#t').blur()}catch(e){}}return o.apply(this,arguments)}});

/* 4) AMBIENTE: loop do primeiro som ao último som (sem os segundos de silêncio) */
S('ambiente',()=>{
  const A0=window.ambient,LC=new Map();let src=null,gn=null,tok=0;
  function getLoop(u){
    if(!LC.has(u))LC.set(u,(async()=>{
      const x=ax();if(!x)throw 0;
      const buf=await x.decodeAudioData(await(await fetch(u)).arrayBuffer());
      const th=.008,n=buf.length;let a=n,b=0;
      for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);
        for(let i=0;i<a;i++){if(d[i]>th||d[i]<-th){a=i;break}}
        for(let i=n-1;i>b;i--){if(d[i]>th||d[i]<-th){b=i;break}}}
      let s=a/buf.sampleRate,e=(b+1)/buf.sampleRate;if(!(e-s>1)){s=0;e=buf.duration}
      return{buf,s,e}})().catch(er=>{LC.delete(u);throw er}));
    return LC.get(u)}
  window.ambient=function(on){
    tok++;if(src){try{src.stop()}catch(e){}src=null}gn=null;
    A0(false);                                   /* para o ambiente do v6 e o zumbido de reserva */
    if(on&&SU.amb){
      ambOn=true;sv('amb',true);const t=tok;
      getLoop(SU.amb).then(r=>{if(t!==tok)return;const x=ax();if(!x)return;
        const s=x.createBufferSource(),g=x.createGain();s.buffer=r.buf;s.loop=true;s.loopStart=r.s;s.loopEnd=r.e;
        g.gain.value=vol*.5;s.connect(g);g.connect(x.destination);s.start(0,r.s);src=s;gn=g}).catch(()=>{});
    }else if(on)A0(true)};
  setInterval(()=>{if(gn)gn.gain.value=vol*.5},400)});

/* 5) STUDIO embaixo da engrenagem, mesmo estilo e cor dela */
S('studio',()=>{
  const st=document.createElement('style');
  st.textContent='#dock [data-k=studio]{display:none!important}#dock .hx:nth-child(1),#dock .hx:nth-child(5){margin-top:22px}#dock .hx:nth-child(2),#dock .hx:nth-child(4){margin-top:11px}#stb7{position:absolute;right:14px;top:calc(100% + 2px);z-index:6}';
  document.head.appendChild(st);
  const gear=document.getElementById('gear'),old=document.querySelector('#dock [data-k=studio]');
  if(!gear||!old)return;
  const b=document.createElement('button');b.id='stb7';b.className=gear.className;b.dataset.k='studio';b.setAttribute('aria-label','Studio');
  b.innerHTML='<span><b>'+old.querySelector('b').innerHTML+'</b></span>';
  document.querySelector('header').appendChild(b);
  b.onclick=e=>{e.preventDefault();old.click()};       /* usa o mesmo abridor do v6 */
  const L=window.local;
  window.local=function(raw){
    if(/(abrir|abre|abra) (o )?(studio|estudio|editor)/.test(norm(raw))){old.click();return say('Abrindo o Studio, senhor.')}
    return L(raw)}});
})();
