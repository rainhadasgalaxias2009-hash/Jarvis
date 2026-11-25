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

/* ===== DETALHES NOVOS DENTRO DO REATOR ===== */
(()=>{try{
const rc=document.getElementById('reactor');if(!rc)return;
const C1=()=>typeof ACR==='string'?ACR:'47,216,255';
const C2=()=>typeof AC2R==='string'?AC2R:'125,255,178';
const cv=document.createElement('canvas');cv.style.cssText='position:fixed;pointer-events:none';
const z=parseInt(getComputedStyle(rc).zIndex);cv.style.zIndex=isNaN(z)?1:z+1;
rc.insertAdjacentElement('afterend',cv);
const g=cv.getContext('2d'),TAU=Math.PI*2,GLY='0123456789ABCDEF',dpr=Math.min(window.devicePixelRatio||1,1.5);
let S=0,R=0,last=0,bolts=[];
function place(){const r=rc.getBoundingClientRect();if(!r.width)return false;const s=Math.round(r.width);
  if(s!==S){S=s;cv.width=cv.height=Math.round(S*dpr);cv.style.width=cv.style.height=S+'px';g.setTransform(dpr,0,0,dpr,0,0)}
  cv.style.left=r.left+'px';cv.style.top=r.top+'px';R=S/2;return true}
function rot(x,y,a){const c=Math.cos(a),s=Math.sin(a);return[x*c-y*s,x*s+y*c]}
function reatorLoop(ts){requestAnimationFrame(reatorLoop);
  if(document.hidden||!place())return;
  const t=ts/1000,dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;
  const a1=C1(),a2=C2();
  g.clearRect(0,0,S,S);g.save();g.translate(R,R);g.globalCompositeOperation='lighter';

  /* 1. ondas de energia nascendo do núcleo */
  for(let i=0;i<3;i++){const p=((t/2.6)+i/3)%1;
    g.lineWidth=1.6;g.strokeStyle='rgba('+a1+','+(.55*(1-p)*(1-p))+')';
    g.beginPath();g.arc(0,0,R*(.08+.36*p),0,TAU);g.stroke()}

  /* 2. radar girando por dentro */
  if(g.createConicGradient){const cg=g.createConicGradient(t*1.1,0,0);
    cg.addColorStop(0,'rgba('+a1+',0)');cg.addColorStop(.12,'rgba('+a1+',.32)');cg.addColorStop(.125,'rgba('+a1+',0)');cg.addColorStop(1,'rgba('+a1+',0)');
    g.fillStyle=cg;g.beginPath();g.arc(0,0,R*.42,0,TAU);g.fill()}

  /* 3. três órbitas inclinadas com partículas e rastro (tipo átomo) */
  for(let k=0;k<3;k++){const tilt=k*TAU/3+t*.18,rx=R*.6,ry=R*(.2+.07*Math.sin(t*.8+k));
    g.lineWidth=.8;g.strokeStyle='rgba('+a1+',.22)';g.beginPath();
    for(let j=0;j<=48;j++){const q=j/48*TAU,p=rot(rx*Math.cos(q),ry*Math.sin(q),tilt);j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke();
    const ph=t*(1.3+k*.45)+k*2.1;
    for(let j=0;j<11;j++){const q=ph-j*.09,p=rot(rx*Math.cos(q),ry*Math.sin(q),tilt);
      g.fillStyle='rgba('+(j?a1:'255,255,255')+','+(1-j/11)*.9+')';g.beginPath();g.arc(p[0],p[1],Math.max(.6,R*.028*(1-j/14)),0,TAU);g.fill()}}

  /* 4. arcos segmentados girando em sentidos opostos */
  for(let k=0;k<3;k++){const r=R*(.47+k*.055),d=k%2?1:-1,s=t*(.7+k*.35)*d;
    g.lineWidth=k===1?1.2:2.2;g.strokeStyle='rgba('+(k===1?a2:a1)+',.65)';
    for(let j=0;j<3;j++){const st=s+j*TAU/3;g.beginPath();g.arc(0,0,r,st,st+TAU*(.16-k*.03));g.stroke()}}

  /* 5. anel de dados hexadecimais */
  const gs=Math.max(7,R*.07);g.font='700 '+gs+'px "Share Tech Mono",monospace';g.textAlign='center';g.textBaseline='middle';
  for(let i=0;i<20;i++){const an=i*TAU/20-t*.13,r=R*.69,h=((Math.floor(t*1.5+i*7)*2654435761)>>>0)%16;
    g.fillStyle='rgba('+a2+','+(.3+.3*Math.sin(t*2+i))+')';g.fillText(GLY[h],Math.cos(an)*r,Math.sin(an)*r)}

  /* 6. raios elétricos saindo do núcleo */
  if(Math.random()<dt*2.4){const an=Math.random()*TAU,L=R*(.35+Math.random()*.25),pts=[[0,0]];
    for(let j=1;j<=7;j++){const f=j/7,jit=(Math.random()-.5)*R*.09*(j<7?1:0);pts.push([Math.cos(an)*L*f-Math.sin(an)*jit,Math.sin(an)*L*f+Math.cos(an)*jit])}
    bolts.push({pts,life:.28,max:.28})}
  bolts=bolts.filter(b=>(b.life-=dt)>0);
  for(const b of bolts){const a=b.life/b.max;g.lineWidth=1.5;g.strokeStyle='rgba(235,252,255,'+a*.9+')';g.shadowColor='rgba('+a1+',1)';g.shadowBlur=6;
    g.beginPath();b.pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.shadowBlur=0}

  /* 7. núcleo pulsando */
  const cr=R*.13*(1+.18*Math.sin(t*5)),cg=g.createRadialGradient(0,0,0,0,0,cr*2);
  cg.addColorStop(0,'rgba(255,255,255,.9)');cg.addColorStop(.35,'rgba('+a1+',.55)');cg.addColorStop(1,'rgba('+a1+',0)');
  g.fillStyle=cg;g.beginPath();g.arc(0,0,cr*2,0,TAU);g.fill();
  g.restore()}
requestAnimationFrame(reatorLoop);
}catch(e){}})();
