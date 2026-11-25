/* JARVIS V4: núcleo 3D (icosaedro + túnel hexagonal + giroscópio) e abertura estilo HUD do Mark */
(()=>{
const TAU=Math.PI*2,cl=(x,a,b)=>Math.max(a==null?0:a,Math.min(b==null?1:b,x)),pg=(t,a,d)=>cl((t-a)/d);
const BLU='61,155,255',CY0='0,240,255';

/* ---------- mini motor 3D ---------- */
const rotP=(p,ax,ay,az)=>{let x=p[0],y=p[1],z=p[2],c,s,t;
  c=Math.cos(ax);s=Math.sin(ax);t=y*c-z*s;z=y*s+z*c;y=t;
  c=Math.cos(ay);s=Math.sin(ay);t=x*c+z*s;z=-x*s+z*c;x=t;
  c=Math.cos(az);s=Math.sin(az);t=x*c-y*s;y=x*s+y*c;x=t;return[x,y,z]};
const prj=(p,cx,cy,s)=>{const k=3/(3+p[2]);return[cx+p[0]*s*k,cy+p[1]*s*k,cl((k-.72)/.8)]};
const PH=(1+Math.sqrt(5))/2,IV=[];
[[-1,PH,0],[1,PH,0],[-1,-PH,0],[1,-PH,0],[0,-1,PH],[0,1,PH],[0,-1,-PH],[0,1,-PH],[PH,0,-1],[PH,0,1],[-PH,0,-1],[-PH,0,1]].forEach(v=>{const n=Math.hypot(v[0],v[1],v[2]);IV.push(v.map(x=>x/n))});
const IE=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)if(Math.hypot(IV[i][0]-IV[j][0],IV[i][1]-IV[j][1],IV[i][2]-IV[j][2])<1.12)IE.push([i,j]);
const SH=[];for(let i=0;i<56;i++){const y=1-2*(i+.5)/56,r=Math.sqrt(1-y*y),a=i*2.39996;SH.push([Math.cos(a)*r,y,Math.sin(a)*r])}

/* cena 3D completa: usada no reator e na abertura */
function draw3D(c,cx,cy,R,t,l,a,col,col2,pr){
  if(a<=0)return;pr=pr==null?1:pr;
  const RX=.5+.25*Math.sin(t*.37),RY=t*.45,RZ=t*.1;
  const seg=(p,q,w,al,cc)=>{const A=prj(p,cx,cy,R),B=prj(q,cx,cy,R),d=(A[2]+B[2])/2;c.strokeStyle='rgba('+cc+','+(a*al*(.25+.75*d))+')';c.lineWidth=w*(.7+.6*d);c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke()};
  const dot=(p,s,al,cc)=>{const A=prj(p,cx,cy,R);c.fillStyle='rgba('+cc+','+(a*al*(.3+.7*A[2]))+')';c.beginPath();c.arc(A[0],A[1],s*(.6+.8*A[2]),0,TAU);c.fill()};
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  /* túnel hexagonal 3D (9 anéis ligados por arestas) */
  const NH=9,HX=[];
  for(let i=0;i<NH;i++){const z=-.9+1.8*i/(NH-1),r=.66*pr*(1-.24*z*z),tw=t*.15+i*.07,pts=[];
    for(let k=0;k<6;k++){const an=tw+k*TAU/6;pts.push(rotP([Math.cos(an)*r,Math.sin(an)*r,z*.9],RX*.6+.75,RY*.5,0))}HX.push(pts)}
  HX.forEach((p,i)=>{const big=i%4===0;for(let k=0;k<6;k++){seg(p[k],p[(k+1)%6],big?1.7:.8,big?.85:.35,i%2?BLU:col);if(i<NH-1)seg(p[k],HX[i+1][k],.7,.28,BLU)}});
  /* giroscópio: 3 anéis em eixos diferentes, com arco brilhante e satélite */
  [[.5,col2,0],[.57,col,1],[.64,BLU,2]].forEach(([r,cc,i])=>{
    const rx=RX+i*1.05,ry=RY*(i%2?-1.3:1.1)+i*2,rz=i*.8,N=52,head=(t*(.9+i*.3))%TAU;let prev=null;
    for(let k=0;k<=N;k++){const an=k/N*TAU,p=rotP([Math.cos(an)*r*pr,Math.sin(an)*r*pr,0],rx,ry,rz);
      if(prev){const dd=((head-an)%TAU+TAU)%TAU,hot=dd<1.2?1-dd/1.2:0;seg(prev,p,1+2.8*hot,.2+.8*hot,cc)}prev=p}
    dot(rotP([Math.cos(head)*r*pr,Math.sin(head)*r*pr,0],rx,ry,rz),3.4,1,'255,255,255')});
  /* casca de partículas respirando */
  SH.forEach((s,i)=>{const k=.8*pr*(1+.05*Math.sin(t*2+i));dot(rotP([s[0]*k,s[1]*k,s[2]*k],RX*.3,-RY*.55,RZ),1.5,.85,i%3?col:col2)});
  /* icosaedro externo e interno (contra-rotação) */
  const rr=(.33+.04*l)*pr,V=IV.map(v=>rotP([v[0]*rr,v[1]*rr,v[2]*rr],RX*.8,RY*1.6,RZ));
  IE.forEach(e=>seg(V[e[0]],V[e[1]],1.4,.95,col));V.forEach(v=>dot(v,2.4,1,col2));
  const r2=.19*pr*(1+.1*l),V2=IV.map(v=>rotP([v[0]*r2,v[1]*r2,v[2]*r2],-RX,-RY*2.3,-RZ*2));
  IE.forEach(e=>seg(V2[e[0]],V2[e[1]],1,.85,col2));
  const gl=c.createRadialGradient(cx,cy,0,cx,cy,R*.2);gl.addColorStop(0,'rgba(255,255,255,'+a*(.55+.4*l)+')');gl.addColorStop(.35,'rgba('+col+','+a*.35+')');gl.addColorStop(1,'rgba('+col+',0)');
  c.fillStyle=gl;c.fillRect(cx-R*.2,cy-R*.2,R*.4,R*.4);
  c.restore()}

/* ---------- reator principal (usa o motor 3D) ---------- */
let T3=0;
window.reactor=function(t,dt){
  const c=rcx,S=RS;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
  const k=ease(Math.min(1,(performance.now()-introT)/1300));
  c.save();c.translate(S/2,S/2);c.scale(.55+.45*k,.55+.45*k);c.translate(-S/2,-S/2);c.globalAlpha=k;
  const R=S/2,cx=R,cy=R,l=lvl,A=speaking?AC2R:ACR,B=speaking?ACR:AC2R;
  T3+=dt*(think?2.4:(listening||speaking)?1.5:1);
  c.globalCompositeOperation='lighter';
  [[.98,'36,89,232',.2],[.72,BLU,.16],[.42,A,.24]].forEach(([r,cc,a])=>{const g=c.createRadialGradient(cx,cy,0,cx,cy,R*r);g.addColorStop(0,'rgba('+cc+','+(a+.3*l)+')');g.addColorStop(1,'rgba('+cc+',0)');c.fillStyle=g;c.fillRect(0,0,S,S)});
  draw3D(c,cx,cy,R*.95,T3,l,1,A,B,1);
  /* camada HUD 2D por cima do 3D */
  c.globalCompositeOperation='lighter';
  c.lineWidth=2;
  for(let i=0;i<90;i++){const a=i/90*TAU-1.5708+t*.1,n=.5+.5*Math.sin(t*3.1+i*.7)*Math.sin(t*1.3+i*.31),r0=R*.8,h=R*(.012+.12*l*n+(i%6===0?.012:0));
    c.strokeStyle='rgba('+(i%3?A:BLU)+',.9)';c.beginPath();c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);c.lineTo(cx+Math.cos(a)*(r0+h),cy+Math.sin(a)*(r0+h));c.stroke()}
  const r3=R*.9;c.lineWidth=1;c.strokeStyle='rgba('+BLU+',.5)';c.beginPath();
  for(let i=0;i<120;i++){const a=i/120*TAU-t*.1,len=i%10===0?R*.05:i%5===0?R*.03:R*.016;c.moveTo(cx+Math.cos(a)*r3,cy+Math.sin(a)*r3);c.lineTo(cx+Math.cos(a)*(r3+len),cy+Math.sin(a)*(r3+len))}c.stroke();
  if(think){const sw=t*5;c.lineWidth=3.4;c.strokeStyle='rgba('+AC2R+',1)';c.beginPath();c.arc(cx,cy,R*.77,sw,sw+1.5);c.stroke()}
  const hg=c.createLinearGradient(0,0,S,S);hg.addColorStop(0,'rgb('+CY0+')');hg.addColorStop(.5,'rgb(36,89,232)');hg.addColorStop(1,'rgb('+A+')');
  c.lineWidth=1.6;c.strokeStyle=hg;hexPath(c,cx,cy,R*.965,t*.12);c.stroke();
  c.strokeStyle='rgba('+BLU+',.35)';c.setLineDash([4,6]);hexPath(c,cx,cy,R*.93,-t*.09);c.stroke();c.setLineDash([]);
  c.fillStyle='rgb('+CY0+')';for(let i=0;i<6;i++){const a=t*.12+i*Math.PI/3-Math.PI/2;c.beginPath();c.arc(cx+Math.cos(a)*R*.965,cy+Math.sin(a)*R*.965,3,0,TAU);c.fill()}
  const now=performance.now()/1000;rips=rips.filter(r=>now-r<1.1);
  for(const rp of rips){const u=(now-rp)/1.1;c.strokeStyle='rgba('+A+','+(.8*(1-u))+')';c.lineWidth=2+3*(1-u);c.beginPath();c.arc(cx,cy,R*(.3+.65*u),0,TAU);c.stroke()}
  c.restore()};

/* ---------- ABERTURA NOVA ---------- */
const old=$('#nb');if(old){old.style.display='none';old.onclick=null;try{old.width=old.height=2}catch(e){}}
const iv=document.createElement('canvas');iv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:54;background:#000;transition:clip-path 1.2s cubic-bezier(.7,0,.2,1)';
document.body.appendChild(iv);const g=iv.getContext('2d');
let W,H,CX,CY,R,t0=null,fired=false,said=false,done=false,aud=null,T=0;const tk=[];
const hxs=n=>{let s='';for(let i=0;i<n;i++)s+='0123456789ABCDEF'[Math.random()*16|0];return s};
const COLS=[0,1].map(()=>Array.from({length:18},()=>'0x'+hxs(4)+' '+hxs(6)));
const LOG=['NÚCLEO DE FUSÃO','REATOR ARC','MATRIZ DE VOZ PT-BR','LINK DE REDE','IA GENERATIVA','HUD HOLOGRÁFICO'];
const BARS=Array.from({length:14},()=>Math.random());
const BL=[];for(let i=0;i<7;i++)BL.push({a:Math.random()*TAU,r:.2+Math.random()*.75,p:Math.random()*6});
const WS=Array.from({length:260},()=>({a:Math.random()*TAU,d:4+Math.random()*30,v:.4+Math.random()*.8}));
function sz(){W=innerWidth;H=innerHeight;iv.width=W*DPR;iv.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);
  const r=$('#reactor').getBoundingClientRect();CX=r.left+r.width/2;CY=r.top+r.height/2;R=r.width/2;iv.style.clipPath='circle(160% at '+CX+'px '+CY+'px)'}
addEventListener('resize',()=>{if(t0===null&&!done)sz()});sz();
function tx(s,x,y,size,ls,a,c,w,al){g.font=(w||700)+' '+size+'px Orbitron,system-ui,sans-serif';g.textAlign=al||'center';try{g.letterSpacing=(size*ls)+'px'}catch(e){}
  g.fillStyle='rgba('+c+','+a+')';g.shadowColor='rgb('+c+')';g.shadowBlur=12;g.fillText(s,x+(al?0:size*ls/2),y);g.shadowBlur=0}
function mono(s,x,y,size,a,c,al){g.font=size+'px "Share Tech Mono",monospace';g.textAlign=al||'left';try{g.letterSpacing='1px'}catch(e){}g.fillStyle='rgba('+c+','+a+')';g.fillText(s,x,y)}
function ln(x1,y1,x2,y2,c,a,w){g.strokeStyle='rgba('+c+','+a+')';g.lineWidth=w||1;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}

function I(ts){
  if(done)return;
  const t=t0===null?-1:(ts-t0)/1000,dt=cl((ts-(I.l||ts))/1000,0,.05);I.l=ts;
  const col=t>4.7?AC2R:ACR,fade=t>5.3?cl(1-(t-5.3)/.5):1;
  g.globalCompositeOperation='source-over';
  g.fillStyle=(t>=0&&t<.1)?'#000':'rgba(0,3,8,'+(t<0?.3:.22)+')';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  if(t<0){ /* espera: núcleo 3D em miniatura */
    T+=dt;draw3D(g,CX,CY,R*.62,T,0,.85,ACR,AC2R,1);
    tx('TOQUE PARA INICIAR',CX,CY+R+34,11,.3,.4+.5*Math.abs(Math.sin(ts/650)),ACR);
    return requestAnimationFrame(I)}
  g.save();
  if(t<.9){const k=1-t/.9;g.translate((Math.random()-.5)*10*k,(Math.random()-.5)*10*k)}

  /* 1. linha de energização + clarão */
  if(t<.9){const u=ease(pg(t,0,.35)),h=Math.max(1.5,8*(1-pg(t,.3,.5)));g.fillStyle='rgba(255,255,255,'+(1-pg(t,.45,.45))+')';g.fillRect(CX-W/2*u,CY-h/2,W*u,h)}
  if(t>.15&&t<.8){const a=1-(t-.15)/.65,gr=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.7);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.25,'rgba('+ACR+','+a*.6+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  [.15,.7,1.4,4.8,5.1].forEach(w=>{const u=(t-w)/1.6;if(u>0&&u<1){g.strokeStyle='rgba('+col+','+(.85*(1-u))+')';g.lineWidth=1+5*(1-u);g.beginPath();g.arc(CX,CY,u*Math.hypot(W,H)*.7,0,TAU);g.stroke()}});

  /* 2. malha de linhas finas varrendo a tela (horizontais, verticais e raios) */
  const gA=pg(t,.3,.8)*fade;
  for(let i=0;i<46;i++){const y=H*i/45,p=ease(pg(t,.3+i*.016,.6));if(p<=0)continue;const x0=i%2?W:0,x1=i%2?W*(1-p):W*p;ln(x0,y,x1,y,col,gA*(.05+.05*Math.sin(t*3+i)))}
  for(let i=0;i<26;i++){const x=W*i/25,p=ease(pg(t,.5+i*.02,.7));if(p<=0)continue;ln(x,i%2?H:0,x,i%2?H*(1-p):H*p,col,gA*.05)}
  if(t>.6)for(let i=0;i<90;i++){const a=i/90*TAU+t*.04,p=ease(pg(t,.6+i*.008,.9)),r1=R*.45,r2=r1+Math.hypot(W,H)*.55*p*(i%3?.4:1);ln(CX+Math.cos(a)*r1,CY+Math.sin(a)*r1,CX+Math.cos(a)*r2,CY+Math.sin(a)*r2,col,gA*(i%3?.07:.14))}

  /* 3. túnel de dobra (estrelas) e voo por hexágonos */
  if(t>.2&&t<3.4){const inten=Math.min(1,(t-.2)/.4)*Math.min(1,(3.4-t)/1.2),acc=t<2?1+t*1.8:Math.max(.25,4.6-(t-2)*3),far=Math.hypot(W,H)*.6;g.lineWidth=1.3;
    for(const s of WS){s.d*=1+dt*s.v*acc*2.2;if(s.d>far){s.d=4+Math.random()*24;s.a=Math.random()*TAU}
      const len=Math.min(s.d*.3,150)*acc*.5,cs=Math.cos(s.a),sn=Math.sin(s.a);ln(CX+cs*(s.d-len),CY+sn*(s.d-len),CX+cs*s.d,CY+sn*s.d,'170,235,255',inten*Math.min(.9,.1+s.d/260))}}
  if(t>.8&&t<4.6){const al=pg(t,.8,.6)*(1-pg(t,3.9,.7));
    for(let i=0;i<14;i++){const u=(i/14+t*.28)%1,r=R*(.12+2.6*u*u);g.lineWidth=1+2*u;g.strokeStyle='rgba('+col+','+al*Math.sin(u*Math.PI)*.55+')';hexPath(g,CX,CY,r,t*.25+i*.09);g.stroke()}}

  /* 4. núcleo 3D nascendo no centro */
  if(t>1.1){const k=ease(pg(t,1.1,1.4));draw3D(g,CX,CY,R*.95,t*(t<3.2?1.8:1.1),0,k*(1-pg(t,5.5,.4)),col,AC2R,k)}
  if(t>1.9){const al=pg(t,1.9,.8)*fade;
    [.46,.82].forEach((r,k)=>{const pr=pg(t,1.9+k*.25,.9);g.strokeStyle='rgba('+col+','+al*.8+')';g.lineWidth=k?2:1.4;g.setLineDash(k?[3,6]:[]);g.beginPath();g.arc(CX,CY,r*R,t*(k?.5:-.4),t*(k?.5:-.4)+TAU*pr);g.stroke();g.setLineDash([])});
    g.strokeStyle='rgba('+col+','+al*.8+')';g.lineWidth=1.2;g.beginPath();
    for(let i=0;i<120;i++){const a=i*TAU/120+t*.15,l2=i%10?4:12,r0=R*.9;g.moveTo(CX+Math.cos(a)*r0,CY+Math.sin(a)*r0);g.lineTo(CX+Math.cos(a)*(r0+l2),CY+Math.sin(a)*(r0+l2))}g.stroke();
    const pr=pg(t,2.3,1.1),L=6*R*.965;g.strokeStyle='rgba('+col+',.85)';g.lineWidth=1.6;g.setLineDash([pr*L,L]);hexPath(g,CX,CY,R*.965,t*.12);g.stroke();g.setLineDash([])}

  /* 5. HUD do Mark: régua de rumo, escada de arfagem, colunas hex, painéis */
  const hA=pg(t,1.4,.9)*fade;
  if(hA>0){
    const top=Math.max(22,parseFloat(getComputedStyle(document.body).paddingTop)||0)+14,hd=(t*22)%360;
    ln(0,top+16,W,top+16,col,hA*.4);
    for(let x=-10;x<W+10;x+=10){const v=Math.round(hd+(x-CX)/10)%360,big=((v%10)+10)%10===0;if(Math.abs(x-CX)>W/2)continue;
      ln(x,top+16,x,top+16-(big?10:5),col,hA*(.2+.6*(1-Math.abs(x-CX)/(W/2))));
      if(big&&((v%30)+30)%30===0)mono(String((v+360)%360).padStart(3,'0'),x,top+2,8,hA*.8,col,'center')}
    g.fillStyle='rgba('+AC2R+','+hA+')';g.beginPath();g.moveTo(CX,top+19);g.lineTo(CX-5,top+27);g.lineTo(CX+5,top+27);g.fill();
    for(let i=-7;i<=7;i++){const off=(t*16)%30,y=CY+i*30+off-15;if(Math.abs(y-CY)>R*1.02)continue;const w=i%2?22:44,gap=R*1.07,al=hA*(1-Math.abs(y-CY)/(R*1.1))*.8;
      ln(CX-gap-w,y,CX-gap,y,col,al,1.2);ln(CX+gap,y,CX+gap+w,y,col,al,1.2);
      if(!(i%2))mono(String(Math.abs(Math.round((CY-y)/3))),CX+gap+w+3,y+3,8,al,col)}
    F4=(F4||0)+1;if(F4%5===0)COLS.forEach(c2=>{c2[Math.random()*c2.length|0]='0x'+hxs(4)+' '+hxs(6)});
    COLS.forEach((c2,ci)=>c2.forEach((s,i)=>mono(s,ci?W-82:10,H*.2+i*14,9,hA*(.1+.4*(1-i/c2.length)),col)));
    /* barras laterais */
    BARS.forEach((b,i)=>{BARS[i]=cl(b+(Math.random()-.5)*.12,.1,1);const y=H*.62+i*7,w=6+26*BARS[i]*pg(t,1.8+i*.05,.5);ln(8,y,8+w,y,col,hA*.8,3);ln(W-8,y,W-8-w,y,col,hA*.8,3)});
    /* radar com varredura e alvos */
    const rx=44,ry=H-72,rr=30;g.lineWidth=1;g.strokeStyle='rgba('+col+','+hA*.6+')';g.beginPath();g.arc(rx,ry,rr,0,TAU);g.stroke();g.beginPath();g.arc(rx,ry,rr*.5,0,TAU);g.stroke();
    ln(rx-rr,ry,rx+rr,ry,col,hA*.3);ln(rx,ry-rr,rx,ry+rr,col,hA*.3);const sa=t*4;
    for(let k=0;k<14;k++)ln(rx,ry,rx+Math.cos(sa-k*.05)*rr,ry+Math.sin(sa-k*.05)*rr,AC2R,hA*(.5-k*.035),2);
    BL.forEach(b=>{const d=((sa-b.a)%TAU+TAU)%TAU;g.fillStyle='rgba('+AC2R+','+hA*Math.max(0,1-d/3)+')';g.beginPath();g.arc(rx+Math.cos(b.a)*b.r*rr,ry+Math.sin(b.a)*b.r*rr,2,0,TAU);g.fill()});
    /* medidores circulares */
    [[W-44,H-72,'PWR',.98],[W-44-70,H-72,'ARC',.74]].forEach((m,i)=>{const p=ease(pg(t,2+i*.3,1.4))*m[3];g.lineWidth=3;g.strokeStyle='rgba('+col+','+hA*.2+')';g.beginPath();g.arc(m[0],m[1],26,0,TAU);g.stroke();
      g.strokeStyle='rgba('+col+','+hA+')';g.beginPath();g.arc(m[0],m[1],26,-1.5708,-1.5708+TAU*p);g.stroke();mono(Math.round(p*100)+'%',m[0],m[1]+3,9,hA,col,'center');mono(m[2],m[0],m[1]+40,7,hA*.7,col,'center')})}

  /* 6. varredura vertical */
  if(t>2.4&&t<3.8){const y=CY-R-30+((t-2.4)/1.4)*(2*R+60),w=R*1.2,gr=g.createLinearGradient(CX-w,0,CX+w,0);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba('+col+',0)');
    g.fillStyle=gr;g.fillRect(CX-w,y-1.5,2*w,3);const g2=g.createLinearGradient(0,y-80,0,y);g2.addColorStop(0,'rgba('+col+',0)');g2.addColorStop(1,'rgba('+col+',.28)');g.fillStyle=g2;g.fillRect(CX-w,y-80,2*w,80)}

  /* 7. título, subtítulo, log e progresso */
  const ty=CY+R+36,fT=t>5.3?cl(1-(t-5.3)/.5):1;
  if(t>2.2){const pr=pg(t,2.2,1.3),n=Math.floor(pr*11),GL='01ΛΣΨ#%&$@',S0='J.A.R.V.I.S';let o='';for(let i=0;i<11;i++)o+=(i<n||S0[i]==='.')?S0[i]:GL[Math.random()*GL.length|0];
    const jit=t>4.7&&t<5.4?(Math.random()-.5)*5:0;tx(pr>=1?S0:o,CX+jit,ty,Math.min(22,W*.055),.32,Math.min(1,(t-2.2)*3)*fT,t>4.7?AC2R:'232,251,255',900)}
  if(t>3.5)tx('JUST A RATHER VERY INTELLIGENT SYSTEM',CX,ty+22,8,.2,Math.min(.8,t-3.5)*fT,col,500);
  if(t>2.8&&t<4.7){const f2=t>4.3?Math.max(0,1-(t-4.3)/.4):1;
    LOG.forEach((s,i)=>{const s0=2.8+i*.27;if(t<s0)return;if(!tk[i]){tk[i]=1;try{bp(1700+i*200,0,.05,.05)}catch(e){}}
      mono(s.padEnd(24,'.')+(t>s0+.22?' OK':' ..'),CX-115,ty+48+i*14,10,f2*.9,AC2R)});
    const pw=Math.min(W*.7,260),pp=pg(t,2.8,1.7);g.fillStyle='rgba('+ACR+','+f2*.18+')';g.fillRect(CX-pw/2,ty+48+6*14+4,pw,3);g.fillStyle='rgba('+ACR+','+f2+')';g.fillRect(CX-pw/2,ty+48+6*14+4,pw*pp,3)}
  if(t>4.7){const jit=t<5.4?(Math.random()-.5)*6:0;tx('BEM-VINDO, SENHOR',CX+jit,ty+56,Math.min(15,W*.04),.3,Math.min(1,(t-4.7)*3)*(t>5.7?Math.max(0,1-(t-5.7)/.5):1),AC2R,900)}
  g.restore();

  if(t>4.7&&!said){said=true;const h=new Date().getHours();speak((h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', senhor. Todos os sistemas estão operacionais. Em que posso ajudá-lo?')}
  if(t>5.7&&!fired){fired=true;introT=performance.now();mainDraw=true;iv.style.clipPath='circle(0px at '+CX+'px '+CY+'px)'}
  if(t>7.1){done=true;iv.remove();return}
  requestAnimationFrame(I)}
let F4=0;
iv.onclick=()=>{
  if(t0!==null){if(!fired){t0=performance.now()-5700;try{if(aud)aud.pause()}catch(e){}}return}
  sz();ax();aud=play('boot')||null;t0=performance.now();g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H);
  /* pulsos de som sincronizados com a abertura */
  [[.3,200,1800],[1.4,300,2600],[2.4,500,3000],[4.7,660,0]].forEach(([s,a,b])=>setTimeout(()=>{try{bp(a,b,.5,.04,'triangle')}catch(e){}},s*1000))};
requestAnimationFrame(I);
})();
