/* JARVIS V2: sons sem atraso, COFRE no lugar do Mercado */
(()=>{
/* sons: decodifica tudo na memória, toca na hora */
const AB={};
async function prep(){const x=ax();if(!x)return;for(const k in SU){if(AB[k]||AB['_'+k])continue;AB['_'+k]=1;try{const r=await fetch(SU[k]);AB[k]=await x.decodeAudioData(await r.arrayBuffer())}catch(e){}}}
let n=0;const iv=setInterval(()=>{prep();if(++n>14)clearInterval(iv)},1500);
const P0=window.play;
window.play=function(k,o){o=o||{};if(!fxOn&&!o.force)return;
  if(AB[k]&&AX&&AX.state==='running'){const s=AX.createBufferSource(),g=AX.createGain();s.buffer=AB[k];g.gain.value=Math.min(1,vol*(o.v||1));s.connect(g);g.connect(AX.destination);s.start();return{pause(){try{s.stop()}catch(e){}}}}
  return P0(k,o)};

/* botão Mercado vira COFRE */
const mb=document.querySelector('[data-k="mkt"]');
mb.dataset.k='cofre';
mb.innerHTML='<span><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><path d="M6 11h12l2 2v6l-2 2H6l-2-2v-6z"/><path d="M12 15v2"/></svg></b>COFRE</span>';
function openCofre(){location.href='cofre.html'}
mb.addEventListener('click',openCofre);
const L1=window.local;
window.local=function(raw){if(/(abrir|abre|abra) (o )?cofre/.test(norm(raw))){openCofre();return say('Abrindo o cofre, senhor.')}return L1(raw)};

/* carrega a abertura nova sozinho (não precisa mexer no index.html) */
if(!document.querySelector('script[src*="jarvis-intro"]')){
  const s=document.createElement('script');s.src='jarvis-intro.js';document.body.appendChild(s)}
})();
