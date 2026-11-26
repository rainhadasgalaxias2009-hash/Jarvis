/* JARVIS FIX — sons da abertura, sem lag no Studio/Cofre, voz "Bem-vindo, senhor." */
(()=>{
/* ===== 1) SONS DA ABERTURA ===== */
const T={boot_a:.15,boot_b:1.7,boot_t:1.9,boot_d:2.2,boot_c:2.6,boot_e:4.1,boot_f:5.3};
const bufs={};let tm=[],src=[],startedAt=0;
async function prep(){
  const x=ax();if(!x)return;
  for(const k of Object.keys(T)){
    if(bufs[k]||!SU[k])continue;
    try{bufs[k]=await x.decodeAudioData(await(await fetch(SU[k])).arrayBuffer())}catch(e){}
  }
}
loadSounds().then(prep).catch(()=>{});
[1500,4000,8000].forEach(ms=>setTimeout(prep,ms));
function fire(k){
  if(!fxOn)return;
  const x=ax();
  if(x&&bufs[k]){
    const s=x.createBufferSource(),g=x.createGain();
    s.buffer=bufs[k];g.gain.value=Math.min(1,vol);s.connect(g);g.connect(x.destination);s.start();
    src.push({stop(){try{s.stop()}catch(e){}}});
  }else if(SU[k]){
    const a=new Audio(SU[k]);a.volume=Math.min(1,vol);a.play().catch(()=>{});
    src.push({stop(){try{a.pause()}catch(e){}}});
  }
}
function stopAll(){
  tm.forEach(clearTimeout);tm=[];
  src.forEach(s=>s.stop());src=[];
}
window.jaOpenStart=function(){
  const n=performance.now();
  if(n-startedAt<800)return;
  startedAt=n;stopAll();
  const x=ax();if(x&&x.state==='suspended')x.resume();
  prep();
  Object.entries(T).forEach(([k,t])=>tm.push(setTimeout(()=>fire(k),t*1000)));
};
window.jaOpenSkip=function(){
  stopAll();
  fire('boot_e');
};

/* ===== 2) SEM LAG COM STUDIO/COFRE ===== */
const st=document.createElement('style');
st.textContent='body.ja-open>*:not(#ja-ov):not(#stw){display:none!important}';
document.head.appendChild(st);

const _raf=window.requestAnimationFrame.bind(window);
window.requestAnimationFrame=function(cb){
  return _raf(ts=>{
    if(document.body.classList.contains('ja-open'))setTimeout(()=>_raf(cb),350);
    else cb(ts);
  });
};

let wasOpen=false;
new MutationObserver(()=>{
  const o=document.body.classList.contains('ja-open');
  if(wasOpen&&!o)setTimeout(()=>{try{rs()}catch(e){}window.dispatchEvent(new Event('resize'))},60);
  wasOpen=o;
}).observe(document.body,{attributes:true,attributeFilter:['class']});

/* pré-carrega os painéis em segundo plano */
setTimeout(()=>{
  ['studio.html','cofre.html'].forEach(u=>fetch(u).catch(()=>{}));
  ['ace.js','ext-language_tools.js'].forEach(f=>{
    const l=document.createElement('link');
    l.rel='prefetch';l.as='script';
    l.href='https://cdn.jsdelivr.net/npm/ace-builds@1.42.0/src-min-noconflict/'+f;
    document.head.appendChild(l);
  });
},6000);

/* ===== 3) VOZ: SÓ "Bem-vindo, senhor." ===== */
const _sp=window.speak;
window.speak=function(t){
  if(typeof t==='string'&&/^(Boa madrugada|Bom dia|Boa tarde|Boa noite), senhor\. Todos os sistemas/.test(t))
    t='Bem-vindo, senhor.';
  return _sp.call(this,t);
};
})();
