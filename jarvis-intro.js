/* JARVIS INTRO: abertura nova + mata as 3 aberturas antigas que rodavam escondidas (maior causa de lag) */
(()=>{
const raf=window.requestAnimationFrame.bind(window),dead=new Set(['frame','F','I']);
window.requestAnimationFrame=f=>dead.has(f.name)?0:raf(f);
const hide=()=>{const b=document.getElementById('boot');if(b)b.style.display='none';
  document.querySelectorAll('canvas').forEach(c=>{if(c.id==='nb'||c.style.zIndex==='54')c.style.display='none'})};
hide();new MutationObserver(hide).observe(document.body,{childList:true});

const TAU=Math.PI*2,cl=(x)=>Math.max(0,Math.min(1,x)),pg=(t,a,d)=>cl((t-a)/d);
const cv=document.createElement('canvas');cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:80;background:#000;transition:clip-path 1s cubic-bezier(.7,0,.2,1)';
document.body.appendChild(cv);const g=cv.getContext('2d');
let W,H,CX,CY,R,t0=null,said=false,fired=false,done=false;
const dpr=Math.min(DPR,1.5);
function sz(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
  const r=document.getElementById('reactor').getBoundingClientRect();CX=r.left+r.width/2;CY=r.top+r.height/2;R=r.width/2;
  cv.style.clipPath='circle(160% at '+CX+'px '+CY+'px)'}
sz();addEventListener('resize',()=>{if(t0===null)sz()});
const GL='01ΛΣΨ#%&$@',TT='J.A.R.V.I.S',LOG=['NÚCLEO','VOZ PT-BR','REDE','INTELIGÊNCIA ARTIFICIAL','INTERFACE'];
const ST=Array.from({length:120},()=>({a:Math.random()*TAU,d:5+Math.random()*30,v:.5+Math.random()}));
const txt=(s,x,y,sz,ls,a,c,w)=>{g.font=(w||700)+' '+sz+'px Orbitron,system-ui,sans-serif';g.textAlign='center';try{g.letterSpacing=sz*ls+'px'}catch(e){}
  g.fillStyle='rgba('+c+','+a+')';g.fillText(s,x+sz*ls/2,y)};
function draw(ts){
  if(done)return;
  const t=t0===null?-1:(ts-t0)/1000,dt=Math.min(.05,(ts-(draw.l||ts))/1000);draw.l=ts;
  const col=t>3.6?AC2R:ACR;
  g.globalCompositeOperation='source-over';g.fillStyle='rgba(0,3,8,'+(t<0?.3:.28)+')';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
  if(t<0){const p=1+.05*Math.sin(ts/260);
    g.lineWidth=2;g.strokeStyle='rgba('+ACR+',.85)';hexPath(g,CX,CY,R*.4*p,ts/3000);g.stroke();
    g.lineWidth=1;g.strokeStyle='rgba('+ACR+',.4)';hexPath(g,CX,CY,R*.58,-ts/4000);g.stroke();
    txt('TOQUE PARA INICIAR',CX,CY+R+34,11,.3,.4+.5*Math.abs(Math.sin(ts/650)),ACR);return raf(draw)}
  /* clarão */
  if(t<.7){const a=1-t/.7,gr=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.7);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.3,'rgba('+ACR+','+a*.5+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  /* linhas de velocidade saindo do centro */
  if(t<2.8){const k=Math.min(1,t/.4)*Math.min(1,(2.8-t)/.8);g.lineWidth=1.2;
    for(const s of ST){s.d*=1+dt*s.v*3;if(s.d>Math.hypot(W,H)*.6){s.d=5+Math.random()*20;s.a=Math.random()*TAU}
      const l=Math.min(s.d*.3,120),c=Math.cos(s.a),n=Math.sin(s.a);g.strokeStyle='rgba(170,235,255,'+k*Math.min(.8,s.d/250)+')';
      g.beginPath();g.moveTo(CX+c*(s.d-l),CY+n*(s.d-l));g.lineTo(CX+c*s.d,CY+n*s.d);g.stroke()}}
  /* hexágonos concêntricos nascendo */
  for(let i=0;i<6;i++){const p=pg(t,.4+i*.25,.9);if(p<=0)continue;const e=1-Math.pow(1-p,3);
    g.lineWidth=i%2?1.2:2.4;g.strokeStyle='rgba('+col+','+(.9-i*.08)+')';const L=6*R*(.3+i*.13)*e;
    g.setLineDash([L*e,L]);hexPath(g,CX,CY,R*(.3+i*.13)*e,t*(i%2?.4:-.3)+i);g.stroke();g.setLineDash([])}
  /* raios giratórios */
  if(t>1){const a=pg(t,1,.6)*(1-pg(t,4.6,.4));g.lineWidth=1.4;g.strokeStyle='rgba('+col+','+a*.7+')';g.beginPath();
    for(let i=0;i<48;i++){const an=i*TAU/48+t*.5,r1=R*.95,r2=r1+R*(.05+.12*Math.abs(Math.sin(t*3+i)));g.moveTo(CX+Math.cos(an)*r1,CY+Math.sin(an)*r1);g.lineTo(CX+Math.cos(an)*r2,CY+Math.sin(an)*r2)}g.stroke()}
  /* núcleo */
  const cg=g.createRadialGradient(CX,CY,0,CX,CY,R*.35);cg.addColorStop(0,'rgba(255,255,255,'+.8*pg(t,.5,.6)+')');cg.addColorStop(1,'rgba('+col+',0)');g.fillStyle=cg;g.fillRect(CX-R,CY-R,2*R,2*R);
  /* varredura */
  if(t>1.6&&t<2.8){const y=CY-R+((t-1.6)/1.2)*2*R,w=R*1.1,gr=g.createLinearGradient(CX-w,0,CX+w,0);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(CX-w,y-1.5,2*w,3)}
  /* título e log */
  const ty=CY+R+34,out=1-pg(t,4.6,.4);
  if(t>1.2){const p=pg(t,1.2,1.2),n=Math.floor(p*TT.length);let o='';for(let i=0;i<TT.length;i++)o+=(i<n||TT[i]==='.')?TT[i]:GL[Math.random()*GL.length|0];
    txt(p>=1?TT:o,CX,ty,Math.min(22,W*.055),.32,cl((t-1.2)*3)*out,t>3.6?AC2R:'232,251,255',900)}
  if(t>1.8&&t<3.5){const f=t>3.2?cl(1-(t-3.2)/.3):1;g.font='10px "Share Tech Mono",monospace';g.textAlign='left';
    LOG.forEach((s,i)=>{if(t<1.8+i*.25)return;g.fillStyle='rgba('+AC2R+','+f*.9+')';g.fillText(s.padEnd(26,'.')+(t>2+i*.25?' OK':' ..'),CX-120,ty+26+i*15)})}
  if(t>3.6)txt('BEM-VINDO, SENHOR',CX,ty+30,Math.min(15,W*.04),.3,cl((t-3.6)*3)*out,AC2R,900);
  if(t>3.6&&!said){said=true;const h=new Date().getHours();speak((h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', senhor. Todos os sistemas estão operacionais. Em que posso ajudá-lo?')}
  if(t>4.6&&!fired){fired=true;introT=performance.now();mainDraw=true;cv.style.clipPath='circle(0px at '+CX+'px '+CY+'px)'}
  if(t>5.8){done=true;cv.remove();return}
  raf(draw)}
cv.onclick=()=>{
  if(t0!==null){if(!fired)t0=performance.now()-4600;return}
  sz();ax();play('boot');t0=performance.now();g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H)};
raf(draw);
})();
