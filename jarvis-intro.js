/* JARVIS INTRO v2 — cinematográfica. Mata as aberturas antigas (lag) e entrega a interface montando por etapas */
(()=>{
const raf=window.requestAnimationFrame.bind(window),dead=new Set(['frame','F','I']);
window.requestAnimationFrame=f=>dead.has(f.name)?0:raf(f);
const hide=()=>{const b=document.getElementById('boot');if(b)b.style.display='none';
  document.querySelectorAll('canvas').forEach(c=>{if(c.id==='nb'||c.style.zIndex==='54')c.style.display='none'})};
hide();new MutationObserver(hide).observe(document.body,{childList:true});

/* animações de entrada da interface real (rodam quando a abertura termina) */
const css=document.createElement('style');
css.textContent=
'.jin header{animation:jd .8s .55s cubic-bezier(.2,.8,.2,1) both}'+
'.jin #tms,.jin #st,.jin .dv,.jin #cap,.jin #tb{animation:jf .9s .7s ease both}'+
'.jin #dock .hx{animation:jp .75s cubic-bezier(.2,1,.3,1) both}'+
'.jin #dock .hx:nth-child(3){animation-delay:.7s}.jin #dock .hx:nth-child(2),.jin #dock .hx:nth-child(4){animation-delay:.82s}.jin #dock .hx:nth-child(1),.jin #dock .hx:nth-child(5){animation-delay:.94s}'+
'@keyframes jd{from{opacity:0;transform:translateY(-26px)}to{opacity:1;transform:none}}'+
'@keyframes jf{from{opacity:0}to{opacity:1}}'+
'@keyframes jp{from{opacity:0;transform:translateY(50px) scale(.3) rotate(-35deg)}60%{opacity:1;transform:translateY(-5px) scale(1.07) rotate(3deg)}to{opacity:1;transform:none}}'+
'.jscan{position:fixed;left:0;right:0;top:0;height:2px;z-index:70;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(var(--acr),.95),transparent);box-shadow:0 0 18px 4px rgba(var(--acr),.55);animation:jsc 1.3s .3s ease-in both}'+
'@keyframes jsc{0%{transform:translateY(0);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateY(100dvh);opacity:0}}';
document.head.appendChild(css);

const TAU=Math.PI*2,cl=x=>Math.max(0,Math.min(1,x)),pg=(t,a,d)=>cl((t-a)/d),e3=x=>1-Math.pow(1-cl(x),3);
const cv=document.createElement('canvas');
cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:80;background:#000;transition:background .8s ease';
document.body.appendChild(cv);const g=cv.getContext('2d');
let W,H,CX,CY,R,t0=null,said=false,fired=false,done=false,bRot=0,LT=null,fr=0;
const dpr=Math.min(DPR,1.5);
function sz(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
  const r=document.getElementById('reactor').getBoundingClientRect();CX=r.left+r.width/2;CY=r.top+r.height/2;R=r.width/2}
sz();addEventListener('resize',()=>{if(t0===null)sz()});

const GL='01ΛΣΨ#%&$@',TT='J.A.R.V.I.S';
const LOG=['NÚCLEO DO REATOR','SÍNTESE DE VOZ PT-BR','LINK DE REDE','MÓDULO DE IA','SENSORES','INTERFACE HOLOGRÁFICA'];
const hx=n=>{let s='';for(let i=0;i<n;i++)s+='0123456789ABCDEF'[Math.random()*16|0];return s};
const WS=Array.from({length:110},()=>({a:Math.random()*TAU,d:4+Math.random()*30,v:.4+Math.random()*.9}));
const RN=[0,1].map(()=>Array.from({length:14},()=>'0x'+hx(4)+' '+hx(6)));
const txt=(s,x,y,sz,ls,a,c,w)=>{g.font=(w||700)+' '+sz+'px Orbitron,system-ui,sans-serif';g.textAlign='center';try{g.letterSpacing=sz*ls+'px'}catch(e){}
  g.fillStyle='rgba('+c+','+a+')';g.fillText(s,x+sz*ls/2,y);try{g.letterSpacing='0px'}catch(e){}};
const mono=(s,x,y,sz,a,c,al)=>{g.font=sz+'px "Share Tech Mono",ui-monospace,monospace';g.textAlign=al||'left';g.fillStyle='rgba('+c+','+a+')';g.fillText(s,x,y)};
const tri=(x,y,r,a)=>{g.beginPath();for(let i=0;i<3;i++){const q=a+i*TAU/3-Math.PI/2;i?g.lineTo(x+Math.cos(q)*r,y+Math.sin(q)*r):g.moveTo(x+Math.cos(q)*r,y+Math.sin(q)*r)}g.closePath()};

function draw(ts){
  if(done)return;
  const t=t0===null?-1:(ts-t0)/1000,dt=Math.min(.05,(ts-(draw.l||ts))/1000);draw.l=ts;
  const A=ACR,B=AC2R,col=t>4.1?B:A;
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  if(t>5.3)g.clearRect(0,0,W,H);else{g.fillStyle='rgba(0,2,6,'+(t<0?.25:.5)+')';g.fillRect(0,0,W,H)}
  g.globalCompositeOperation='lighter';

  /* ---------- tela de espera ---------- */
  if(t<0){
    const p=1+.04*Math.sin(ts/300),gr=g.createRadialGradient(CX,CY,0,CX,CY,R*.8);
    gr.addColorStop(0,'rgba('+A+','+(.16+.06*Math.sin(ts/500))+')');gr.addColorStop(1,'rgba('+A+',0)');g.fillStyle=gr;g.fillRect(CX-R,CY-R,2*R,2*R);
    g.lineWidth=2;g.strokeStyle='rgba('+A+',.85)';hexPath(g,CX,CY,R*.34*p,ts/3000);g.stroke();
    g.lineWidth=1;g.strokeStyle='rgba('+A+',.4)';hexPath(g,CX,CY,R*.46,-ts/4000);g.stroke();
    g.setLineDash([3,9]);g.lineWidth=1.5;g.strokeStyle='rgba('+A+',.5)';g.beginPath();g.arc(CX,CY,R*.58,ts/1200,ts/1200+TAU);g.stroke();g.setLineDash([]);
    txt('TOQUE PARA INICIAR',CX,CY+R+34,11,.3,.4+.5*Math.abs(Math.sin(ts/650)),A);
    return raf(draw)}

  const M=t>5.3?1-e3(pg(t,5.3,.8)):1,ty=CY+R+34,fs=Math.min(22,W*.055);
  g.globalAlpha=M;

  /* ---------- 1. IGNIÇÃO: ponto de luz, raio horizontal, clarão ---------- */
  if(t<1.3){const f=1-pg(t,.85,.35),r=R*(.03+.2*e3(pg(t,0,.85))),gr=g.createRadialGradient(CX,CY,0,CX,CY,r*2.5);
    gr.addColorStop(0,'rgba(255,255,255,'+f+')');gr.addColorStop(.4,'rgba('+A+','+.6*f+')');gr.addColorStop(1,'rgba('+A+',0)');
    g.fillStyle=gr;g.fillRect(CX-r*2.5,CY-r*2.5,r*5,r*5)}
  if(t>.2&&t<1.7){const len=e3(pg(t,.2,.6))*W*.5,a=1-pg(t,1,.7),gr=g.createLinearGradient(CX-len,0,CX+len,0);
    gr.addColorStop(0,'rgba('+A+',0)');gr.addColorStop(.5,'rgba(255,255,255,'+a+')');gr.addColorStop(1,'rgba('+A+',0)');
    g.fillStyle=gr;g.fillRect(CX-len,CY-1.2,2*len,2.4);g.fillStyle='rgba('+A+','+.18*a+')';g.fillRect(CX-len,CY-5,2*len,10)}
  if(t>.85&&t<1.35){const a=1-(t-.85)/.5,gr=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.7);
    gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.3,'rgba('+A+','+a*.5+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}

  /* ---------- 2. linhas de velocidade ---------- */
  if(t>.9&&t<2.8){const k=Math.min(1,(t-.9)/.4)*Math.min(1,(2.8-t)/.9),far=Math.hypot(W,H)*.6;g.lineWidth=1.2;
    for(const s of WS){s.d*=1+dt*s.v*3.2;if(s.d>far){s.d=4+Math.random()*22;s.a=Math.random()*TAU}
      const l=Math.min(s.d*.3,130),c=Math.cos(s.a),n=Math.sin(s.a);g.strokeStyle='rgba(170,235,255,'+k*Math.min(.8,s.d/250)+')';
      g.beginPath();g.moveTo(CX+c*(s.d-l),CY+n*(s.d-l));g.lineTo(CX+c*s.d,CY+n*s.d);g.stroke()}}

  /* ---------- 3. O REATOR SE MONTA (mesmas proporções do reator real) ---------- */
  if(t>.9){const a=pg(t,.9,.8),gr=g.createRadialGradient(CX,CY,0,CX,CY,R*.95);
    gr.addColorStop(0,'rgba('+col+','+(.12+.16*a)+')');gr.addColorStop(.5,'rgba('+col+','+.05*a+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(CX-R,CY-R,2*R,2*R)}
  bRot+=dt*(t<3?3.2:1.2);
  if(t>1.2){const a=pg(t,1.2,.9);drawSphere(g,CX,CY,R*.3*(.5+.5*e3(a)),bRot,.35,a,0,col)}
  if(t>1.4){const p=pg(t,1.4,.8);g.lineWidth=1.3;g.strokeStyle='rgba('+col+','+.85*p+')';g.setLineDash([R*.5,R*.08,R*.1,R*.08]);g.lineDashOffset=-t*R*.2;g.beginPath();g.arc(CX,CY,R*.47,0,TAU);g.stroke();g.setLineDash([])}
  if(t>1.6){g.lineWidth=R*.035;
    [[0,.8],[1,1.9],[2.2,2.5],[2.8,4.2],[4.5,5.4],[5.6,6.1]].forEach((s,i)=>{const p=pg(t,1.6+i*.12,.4);if(p<=0)return;g.strokeStyle='rgba('+col+','+(i%2?.9:.5)*p+')';g.beginPath();g.arc(CX,CY,R*.58,-t*.35+s[0],-t*.35+s[1]);g.stroke()})}
  if(t>2){const a=pg(t,2,.6),r3=R*.69;g.lineWidth=1;g.strokeStyle='rgba('+col+','+.7*a+')';g.beginPath();
    for(let i=0;i<120;i++){const an=i/120*TAU+t*.12,l=i%10===0?R*.05:i%5===0?R*.03:R*.016;g.moveTo(CX+Math.cos(an)*r3,CY+Math.sin(an)*r3);g.lineTo(CX+Math.cos(an)*(r3+l),CY+Math.sin(an)*(r3+l))}g.stroke()}
  if(t>2.1&&t<4.2){const sw=t*5.5;g.lineWidth=3;g.strokeStyle='rgba('+B+','+.9*Math.min(1,(t-2.1)*3)*(1-pg(t,3.8,.4))+')';g.beginPath();g.arc(CX,CY,R*.66,sw,sw+1.3);g.stroke()}
  if(t>2.2){const a=pg(t,2.2,.6),amp=t<4?1:Math.max(.12,1-(t-4)*.9);g.lineWidth=2;g.strokeStyle='rgba('+col+','+.9*a+')';g.beginPath();
    for(let i=0;i<72;i++){const an=i/72*TAU-Math.PI/2+t*.1,n=.5+.5*Math.sin(t*6+i*.7)*Math.sin(t*2.1+i*.31),r0=R*.795,h=R*(.012+.1*amp*n*a);g.moveTo(CX+Math.cos(an)*r0,CY+Math.sin(an)*r0);g.lineTo(CX+Math.cos(an)*(r0+h),CY+Math.sin(an)*(r0+h))}g.stroke()}
  if(t>2.4){const p=pg(t,2.4,1.1),ro=t*.12,hr=R*.965;g.lineWidth=1.4;g.strokeStyle='rgba('+col+',.85)';g.lineJoin='miter';
    if(p>=1){hexPath(g,CX,CY,hr,ro);g.stroke()}
    else{const v=[];for(let i=0;i<=6;i++){const an=ro+i*Math.PI/3-Math.PI/2;v.push([CX+Math.cos(an)*hr,CY+Math.sin(an)*hr])}
      const n=p*6,w=Math.floor(n),f=n-w;g.beginPath();g.moveTo(v[0][0],v[0][1]);
      for(let i=1;i<=w;i++)g.lineTo(v[i][0],v[i][1]);
      if(w<6)g.lineTo(v[w][0]+(v[w+1][0]-v[w][0])*f,v[w][1]+(v[w+1][1]-v[w][1])*f);g.stroke()}
    if(p>=1){g.fillStyle='rgba('+col+',1)';for(let i=0;i<6;i++){const an=t*.12+i*Math.PI/3-Math.PI/2;g.beginPath();g.arc(CX+Math.cos(an)*R*.965,CY+Math.sin(an)*R*.965,3,0,TAU);g.fill()}}}
  if(t>1.5){const a=pg(t,1.5,.6),pu=1+.12*Math.sin(t*5);
    g.lineWidth=1.5;g.strokeStyle='rgba(235,252,255,'+.9*a+')';tri(CX,CY,R*.1*pu,t*.9);g.stroke();
    g.lineWidth=1.2;g.strokeStyle='rgba('+B+','+.9*a+')';tri(CX,CY,R*.075*pu,-t*1.2+Math.PI/3);g.stroke()}
  /* varredura vertical atravessando o reator */
  if(t>2.6&&t<3.7){const y=CY-R-30+((t-2.6)/1.1)*(2*R+60),w=R*1.15,gr=g.createLinearGradient(CX-w,0,CX+w,0);
    gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(CX-w,y-1.5,2*w,3);
    const g2=g.createLinearGradient(0,y-70,0,y);g2.addColorStop(0,'rgba('+col+',0)');g2.addColorStop(1,'rgba('+col+',.22)');g.fillStyle=g2;g.fillRect(CX-w,y-70,2*w,70)}

  /* ---------- 4. HUD NA TELA: cantos, colunas de dados, progresso ---------- */
  if(t>1.6){const p=e3(pg(t,1.6,.8)),m=14,Lb=Math.min(44,W*.11)*p,a=1-pg(t,5.1,.3);
    g.lineWidth=2;g.strokeStyle='rgba('+col+','+.75*a+')';g.beginPath();
    g.moveTo(m,m+Lb);g.lineTo(m,m);g.lineTo(m+Lb,m);
    g.moveTo(W-m-Lb,m);g.lineTo(W-m,m);g.lineTo(W-m,m+Lb);
    g.moveTo(m,H-m-Lb);g.lineTo(m,H-m);g.lineTo(m+Lb,H-m);
    g.moveTo(W-m-Lb,H-m);g.lineTo(W-m,H-m);g.lineTo(W-m,H-m-Lb);g.stroke()}
  if(t>2){const al=Math.min(1,(t-2)/.8)*(1-pg(t,4.4,.4));
    if(++fr%5===0)RN.forEach(c=>{c[Math.random()*c.length|0]='0x'+hx(4)+' '+hx(6)});
    RN.forEach((lines,ci)=>lines.forEach((ln,i)=>mono(ln,ci?W-96:12,H*.13+i*15,10,al*(.1+.4*(1-i/lines.length)),col)));
    txt('ASSISTENTE PESSOAL INTELIGENTE',CX,H*.075,Math.min(10,W*.026),.3,al*.7,col,700)}
  if(t>2.3){const p=pg(t,2.3,1.9),a=1-pg(t,4.5,.4),bw=Math.min(W*.7,280),by=H-46;
    g.fillStyle='rgba('+col+','+.15*a+')';g.fillRect(CX-bw/2,by,bw,3);g.fillStyle='rgba('+col+','+.95*a+')';g.fillRect(CX-bw/2,by,bw*p,3);
    mono(p>=1?'SISTEMA ONLINE':'CARREGANDO MÓDULOS',CX-bw/2,by-8,10,.7*a,col);mono(Math.round(p*100)+'%',CX+bw/2,by-8,10,.9*a,col,'right')}

  /* ---------- 5. LOG DE INICIALIZAÇÃO ---------- */
  if(t>2.2&&t<4.4){const f=1-pg(t,4,.4);
    LOG.forEach((s,i)=>{const st=2.2+i*.3;if(t<st)return;const ok=t>st+.3;
      mono((s+' ').padEnd(28,'.')+' '+(ok?'OK':'..'),CX,ty+28+i*15,10,f*.9,ok?B:A,'center')})}

  /* ---------- 6. TÍTULO (decodifica, depois voa até o logo do topo) ---------- */
  if(t>1.9){const p=pg(t,1.9,1.3),n=Math.floor(p*TT.length);let o='';
    for(let i=0;i<TT.length;i++)o+=(i<n||TT[i]==='.')?TT[i]:GL[Math.random()*GL.length|0];
    if(t>5&&!LT){const l=document.querySelector('.logo'),r=l?l.getBoundingClientRect():null;LT=r?{x:r.left+20+(r.width-20)/2,y:r.top+r.height/2+4}:{x:W*.2,y:24}}
    const f=LT?e3(pg(t,5,1)):0,x=LT?CX+(LT.x-CX)*f:CX,y=LT?ty+(LT.y-ty)*f:ty,s=fs+(11-fs)*f,al=cl((t-1.9)*3)*(1-pg(t,5.85,.15));
    g.globalAlpha=1;txt(p>=1?TT:o,x,y,s,.32+.1*f,al,t>4.1?B:'232,251,255',900);g.globalAlpha=M}

  /* ---------- 7. CLÍMAX: glitch, clarão e boas-vindas ---------- */
  if(t>4&&t<4.35){g.fillStyle='rgba('+B+','+.22*(1-(t-4)/.35)+')';for(let i=0;i<6;i++)g.fillRect(0,Math.random()*H,W,2+Math.random()*5);
    const a=.3*(1-(t-4)/.35),gr=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.6);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  if(t>4.1){const a=cl((t-4.1)*3)*(1-pg(t,5,.3)),w=pg(t,4.2,.7)*W*.26;
    txt('BEM-VINDO, SENHOR',CX,ty+34,Math.min(15,W*.04),.3,a,B,900);
    g.fillStyle='rgba('+B+','+.7*a+')';g.fillRect(CX-w-6-Math.min(15,W*.04)*3.3,ty+29,w,1);g.fillRect(CX+6+Math.min(15,W*.04)*3.3,ty+29,w,1)}
  if(t>4.1&&!said){said=true;const h=new Date().getHours();speak((h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', senhor. Todos os sistemas estão operacionais. Em que posso ajudá-lo?')}

  /* ---------- 8. ONDAS DE CHOQUE ---------- */
  g.globalAlpha=1;
  [.85,4.1,5.3].forEach(w=>{const u=(t-w)/1.4;if(u>0&&u<1){g.strokeStyle='rgba('+(w>4?B:A)+','+.85*(1-u)+')';g.lineWidth=1+5*(1-u);g.beginPath();g.arc(CX,CY,e3(u)*Math.hypot(W,H)*.75,0,TAU);g.stroke()}});

  /* ---------- 9. SAÍDA: revela a interface real, montando por etapas ---------- */
  if(t>5.3&&!fired){fired=true;introT=performance.now();mainDraw=true;cv.style.pointerEvents='none';cv.style.background='transparent';
    document.body.classList.add('jin');const sc=document.createElement('div');sc.className='jscan';document.body.appendChild(sc);
    setTimeout(()=>{sc.remove();document.body.classList.remove('jin')},3600)}
  if(t>6.6){done=true;cv.remove();return}
  raf(draw)}

cv.onclick=()=>{
  if(t0!==null){if(!fired)t0=Math.min(t0,performance.now()-5000);return}
  sz();ax();play('boot');t0=performance.now();g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H)};
raf(draw);
})();
