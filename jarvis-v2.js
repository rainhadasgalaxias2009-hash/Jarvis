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
  const s=document.createElement('script');s.src='jarvis-intro.js?v=3';document.body.appendChild(s)}
})();

/* ===== DETALHES NOVOS DENTRO DO NÚCLEO ===== */
(()=>{try{
const host=document.getElementById('reactor'),rcv=document.getElementById('rc');if(!host||!rcv)return;
const cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2';
host.appendChild(cv);
const g=cv.getContext('2d'),TAU=Math.PI*2,D=Math.min(window.devicePixelRatio||1,1.5);
let S=0,last=0,bolts=[];
const motes=Array.from({length:18},()=>({a:Math.random()*TAU,r:Math.random(),v:.4+Math.random()*.8}));
function size(){const s=Math.round(rcv.clientWidth);if(!s)return false;if(s!==S){S=s;cv.width=cv.height=Math.round(S*D);g.setTransform(D,0,0,D,0,0)}return true}
function rot(x,y,a){const c=Math.cos(a),s=Math.sin(a);return[x*c-y*s,x*s+y*c]}
function tri(r,a){g.beginPath();for(let i=0;i<3;i++){const q=a+i*TAU/3-Math.PI/2;i?g.lineTo(Math.cos(q)*r,Math.sin(q)*r):g.moveTo(Math.cos(q)*r,Math.sin(q)*r)}g.closePath()}
function reatorLoop(ts){requestAnimationFrame(reatorLoop);
  if(document.hidden||!size())return;
  g.clearRect(0,0,S,S);
  if(!mainDraw)return;
  const t=ts/1000,dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;
  const k=ease(Math.min(1,(performance.now()-introT)/1300)),R=S/2,L=lvl||0;
  const a1=speaking?AC2R:ACR,a2=speaking?ACR:AC2R,sp=think?2.6:(listening||speaking)?1.6:1;
  g.save();g.translate(R,R);g.scale(.55+.45*k,.55+.45*k);g.globalAlpha=k;g.globalCompositeOperation='lighter';

  /* 1. ondas de choque por dentro da esfera */
  for(let i=0;i<2;i++){const p=((t*sp/1.8)+i/2)%1;
    g.lineWidth=1.4;g.strokeStyle='rgba('+a1+','+(.5*(1-p)*(1-p))+')';
    g.beginPath();g.arc(0,0,R*(.05+.25*p),0,TAU);g.stroke()}

  /* 2. partículas de plasma subindo do centro */
  for(const m of motes){m.r+=dt*m.v*(.35+1.2*L)*sp;m.a+=dt*.9;if(m.r>1){m.r=0;m.a=Math.random()*TAU}
    const rr=R*(.02+.27*m.r),al=(1-m.r)*.9;g.fillStyle='rgba('+(m.r<.25?'255,255,255':a1)+','+al+')';
    g.fillRect(Math.cos(m.a)*rr-1,Math.sin(m.a)*rr-1,2,2)}

  /* 3. raios saindo do centro até a superfície da esfera */
  if(Math.random()<dt*(2+7*L)){const an=Math.random()*TAU,Lr=R*(.2+Math.random()*.1),pts=[[0,0]];
    for(let j=1;j<=6;j++){const f=j/6,jit=j<6?(Math.random()-.5)*R*.045:0;pts.push([Math.cos(an)*Lr*f-Math.sin(an)*jit,Math.sin(an)*Lr*f+Math.cos(an)*jit])}
    bolts.push({pts,life:.22,max:.22})}
  bolts=bolts.filter(b=>(b.life-=dt)>0);
  for(const b of bolts){const a=b.life/b.max;
    g.beginPath();b.pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
    g.lineWidth=3.5;g.strokeStyle='rgba('+a1+','+a*.3+')';g.stroke();
    g.lineWidth=1.2;g.strokeStyle='rgba(235,252,255,'+a*.95+')';g.stroke()}

  /* 4. anel de engrenagem fino em volta da esfera */
  g.lineWidth=1;g.strokeStyle='rgba('+a1+',.55)';g.beginPath();
  for(let i=0;i<48;i++){const q=i*TAU/48-t*.28*sp,r0=R*.335,l=i%4===0?R*.028:R*.014;
    g.moveTo(Math.cos(q)*r0,Math.sin(q)*r0);g.lineTo(Math.cos(q)*(r0+l),Math.sin(q)*(r0+l))}g.stroke();

  /* 5. três órbitas inclinadas com partículas e rastro */
  for(let o=0;o<3;o++){const tilt=o*TAU/3+t*.2*sp,rx=R*.425,ry=R*(.12+.05*Math.sin(t*.9+o*2));
    g.lineWidth=.8;g.strokeStyle='rgba('+a1+',.2)';g.beginPath();
    for(let j=0;j<=40;j++){const q=j/40*TAU,p=rot(rx*Math.cos(q),ry*Math.sin(q),tilt);j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke();
    const ph=t*(1.5+o*.5)*sp+o*2.1;
    for(let j=0;j<10;j++){const q=ph-j*.1,p=rot(rx*Math.cos(q),ry*Math.sin(q),tilt);
      g.fillStyle='rgba('+(j?a2:'255,255,255')+','+(1-j/10)*.95+')';g.beginPath();g.arc(p[0],p[1],Math.max(.6,R*.022*(1-j/13)),0,TAU);g.fill()}}

  /* 6. coração: dois triângulos girando em sentidos opostos + brilho */
  const pu=1+.12*Math.sin(t*5)+.3*L;
  g.lineWidth=1.5;g.strokeStyle='rgba(235,252,255,.9)';tri(R*.1*pu,t*.9*sp);g.stroke();
  g.lineWidth=1.2;g.strokeStyle='rgba('+a2+',.9)';tri(R*.075*pu,-t*1.2*sp+Math.PI/3);g.stroke();
  const cr=R*.09*pu,cg=g.createRadialGradient(0,0,0,0,0,cr*2);
  cg.addColorStop(0,'rgba(255,255,255,.95)');cg.addColorStop(.3,'rgba('+a1+',.6)');cg.addColorStop(1,'rgba('+a1+',0)');
  g.fillStyle=cg;g.beginPath();g.arc(0,0,cr*2,0,TAU);g.fill();
  g.restore()}
requestAnimationFrame(reatorLoop);
}catch(e){}})();
