/* JARVIS UPGRADE: abertura cinematográfica, ícones por código e Studio embutido */
(()=>{
const I={
clima:'<circle cx="8.5" cy="8.5" r="3"/><path d="M8.5 2v1.8M2 8.5h1.8M3.9 3.9l1.3 1.3M13.1 3.9l-1.3 1.3"/><path d="M8 20h9.2a3.6 3.6 0 0 0 .3-7.2 5.2 5.2 0 0 0-9.8 1.4A3 3 0 0 0 8 20z"/>',
tarefas:'<path d="M4 6.5l1.8 1.8L9 5M4 13.5l1.8 1.8L9 12M12 7h8M12 14h8M5 20h15"/>',
txt:'<path d="M6 6h12l3 3v6l-3 3H6l-3-3V9z"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>',
mem:'<path d="M12 3l7.5 4.2v5.6c0 3.8-3.2 6.7-7.5 8.2-4.3-1.5-7.5-4.4-7.5-8.2V7.2z"/><path d="M9 11h6M9 14.5h4"/>',
mkt:'<path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
send:'<path d="M3 12L21 4l-6 16-3.2-6.8z"/>',
code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
play:'<path d="M7 5l12 7-12 7z"/>',
folder:'<path d="M3 7l2-2h5l2 2h7l2 2v8l-2 2H5l-2-2z"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
cs:'<circle cx="16.5" cy="7" r="2.8"/><path d="M16.5 1.5v1.2M21.5 7h-1.2M20 3.5l-.8.8"/><path d="M7 20h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5 1.3A3 3 0 0 0 7 20z"/>',
cloud:'<path d="M7 19h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 19z"/>',
fog:'<path d="M4 8h16M3 12h18M5 16h14M8 20h8"/>',
rain:'<path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
snow:'<path d="M12 3v18M4.5 7.5l15 9M4.5 16.5l15-9"/>',
storm:'<path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 14z"/><path d="M12 14l-2 4h3l-2 4"/>'};
const ic=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+I[n]+'</svg>';
const WM={'☀':'sun','⛅':'cs','☁':'cloud','🌫':'fog','🌦':'rain','🌧':'rain','❄':'snow','⛈':'storm'};

/* ===== CSS ===== */
const st=document.createElement('style');
st.textContent=`
.hx b{display:flex}.hx b svg{width:1.15em;height:1.15em;display:block}
.rb svg{width:16px;height:16px}.rm svg{width:14px;height:14px;display:block}
.wi{color:var(--ac)}.wi svg{width:50px;height:50px}.ob b{display:flex}.ob b svg{width:24px;height:24px;color:var(--ac)}
#stb{width:62px;height:70px;color:var(--ac2);background:var(--ac2);animation:sp 2.6s ease-in-out infinite}
#stb::before{background:radial-gradient(circle,rgba(var(--ac2r),.3),#020a12 72%)}
@keyframes sp{50%{background:var(--ac)}}
#stw{position:fixed;inset:0;z-index:45;background:#010510;clip-path:circle(0px at var(--ox,50%) var(--oy,0));transition:clip-path .7s cubic-bezier(.7,0,.2,1);pointer-events:none}
#stw.on{clip-path:circle(160% at var(--ox,50%) var(--oy,0));pointer-events:auto}
#stw iframe{width:100%;height:100%;border:0;display:block}
#stc{display:none;position:absolute;left:10px;bottom:10px;z-index:2}
.cn{position:fixed;width:22px;height:22px;z-index:7;pointer-events:none;border:2px solid rgba(var(--acr),.75)}
.cn.a{left:6px;top:6px;border-right:0;border-bottom:0}.cn.b{right:6px;top:6px;border-left:0;border-bottom:0}
.cn.c{left:6px;bottom:6px;border-right:0;border-top:0}.cn.d{right:6px;bottom:6px;border-left:0;border-top:0}
#nb{position:fixed;inset:0;width:100%;height:100%;z-index:52;background:#000;transition:clip-path 1.3s cubic-bezier(.7,0,.2,1)}`;
document.head.appendChild(st);

/* ===== ícones nos botões ===== */
[['clima','clima'],['tarefas','tarefas'],['txt','txt'],['mem','mem'],['mkt','mkt']].forEach(([k,n])=>{const b=document.querySelector('[data-k="'+k+'"] b');if(b)b.innerHTML=ic(n)});
$('#gear b').innerHTML=ic('gear');$('#tb .hx b').innerHTML=ic('send');
document.body.insertAdjacentHTML('beforeend','<i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i>');
function fix(){
  document.querySelectorAll('#shb .rb[data-a]').forEach(b=>{if(!b.firstElementChild)b.innerHTML=ic({play:'play',pick:'folder',del:'x'}[b.dataset.a])});
  document.querySelectorAll('#shb .rm').forEach(b=>{if(!b.firstElementChild)b.innerHTML=ic('x')});
  document.querySelectorAll('#shb .wi,#shb .ob b').forEach(b=>{if(!b.firstElementChild){const k=WM[Array.from(b.textContent)[0]];if(k)b.innerHTML=ic(k)}})}
new MutationObserver(fix).observe($('#shb'),{childList:true,subtree:true});

/* ===== STUDIO embutido ===== */
const stb=document.createElement('button');stb.className='hx';stb.id='stb';stb.innerHTML='<span><b>'+ic('code')+'</b>STUDIO</span>';
$('header').insertBefore(stb,$('#gear'));
const stw=document.createElement('div');stw.id='stw';stw.innerHTML='<iframe title="Studio"></iframe><button class="hx sm" id="stc"><span><b>'+ic('x')+'</b></span></button>';
document.body.appendChild(stw);
const fr=stw.querySelector('iframe');let loaded=false;
function closeSt(){stw.classList.remove('on');play('click')}
stb.onclick=()=>{play('open');const r=stb.getBoundingClientRect();stw.style.setProperty('--ox',(r.left+r.width/2)+'px');stw.style.setProperty('--oy',(r.top+r.height/2)+'px');
  if(!loaded){loaded=true;fr.src='studio.html'}stw.classList.add('on')};
fr.onload=()=>{try{const a=fr.contentDocument.querySelector('header a');a.removeAttribute('href');a.onclick=closeSt}catch(e){$('#stc').style.display='flex'}};
$('#stc').onclick=closeSt;
addEventListener('keydown',e=>{if(e.key==='Escape')closeSt()});

/* ===== som da abertura (sintetizado; se existir sons/boot.mp3 ele é usado) ===== */
FB.boot=()=>{
  bp(48,24,2.6,.34);bp(96,36,1.4,.18,'sawtooth');bp(140,3400,2.4,.05,'sawtooth');
  setTimeout(()=>bp(300,2600,1.2,.05,'triangle'),900);
  [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>{bp(f,0,.9,.07);bp(f*2,0,.6,.03,'triangle')},4400+i*105));
  setTimeout(()=>{bp(131,0,1.8,.12,'triangle');bp(196,0,1.8,.08,'triangle')},4400)};

/* ===== ABERTURA NOVA ===== */
const boot=$('#boot');boot.onclick=null;boot.style.display='none';
const nb=document.createElement('canvas');nb.id='nb';document.body.appendChild(nb);
const g=nb.getContext('2d');
let W,H,CX,CY,R,t0=null,fired=false,said=false,done=false,aud=null;
const WS=Array.from({length:230},()=>({a:Math.random()*6.283,d:4+Math.random()*30,v:.4+Math.random()*.8}));
const TITLE='J.A.R.V.I.S',GL='01ΛΣΨ#%&$@',LOG=['NÚCLEO QUÂNTICO','MATRIZ DE VOZ PT-BR','LINK DE REDE','IA GENERATIVA','INTERFACE HOLOGRÁFICA'],ticked=[];
const hx=n=>{let s='';for(let i=0;i<n;i++)s+='0123456789ABCDEF'[Math.random()*16|0];return s};
let COLS=[0,1].map(()=>Array.from({length:14},()=>'0x'+hx(4)+' '+hx(6)));
function sz(){W=innerWidth;H=innerHeight;nb.width=W*DPR;nb.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);
  const r=$('#reactor').getBoundingClientRect();CX=r.left+r.width/2;CY=r.top+r.height/2;R=r.width/2;
  nb.style.clipPath='circle(160% at '+CX+'px '+CY+'px)'}
addEventListener('resize',()=>{if(t0===null&&!done)sz()});sz();
function txt(s,x,y,size,ls,a,c,w,al){g.font=(w||700)+' '+size+'px Orbitron,system-ui,sans-serif';g.textAlign=al||'center';
  try{g.letterSpacing=(size*ls)+'px'}catch(e){}g.fillStyle='rgba('+c+','+a+')';g.shadowColor='rgb('+c+')';g.shadowBlur=14;g.fillText(s,x+(al?0:size*ls/2),y);g.shadowBlur=0}
function F(ts){
  if(done)return;
  const t=t0===null?-1:(ts-t0)/1000,dt=Math.min(.05,(ts-(F.l||ts))/1000);F.l=ts;
  const col=t>4.6?AC2R:ACR;
  g.globalCompositeOperation='source-over';
  g.fillStyle=(t>=0&&t<.15)?'#000':'rgba(0,2,6,'+(t<0?.25:.2)+')';g.fillRect(0,0,W,H);
  if(t<0){
    g.globalCompositeOperation='lighter';const p=1+.05*Math.sin(ts/260);
    g.lineWidth=2;g.strokeStyle='rgba('+ACR+',.85)';hexPath(g,CX,CY,R*.34*p,ts/3000);g.stroke();
    g.lineWidth=1;g.strokeStyle='rgba('+ACR+',.4)';hexPath(g,CX,CY,R*.5,-ts/4000);g.stroke();
    g.setLineDash([3,9]);g.lineWidth=1.5;g.beginPath();g.arc(CX,CY,R*.66,ts/1200,ts/1200+6.283);g.stroke();g.setLineDash([]);
    txt('TOQUE PARA INICIAR',CX,CY+R+34,11,.3,.45+.5*Math.abs(Math.sin(ts/650)),ACR);
    return requestAnimationFrame(F)}
  g.save();
  if(t<.9){const k=1-t/.9;g.translate((Math.random()-.5)*10*k,(Math.random()-.5)*10*k)}
  g.globalCompositeOperation='lighter';
  if(t>.1&&t<.8){const a=1-(t-.1)/.7,gr=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.7);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.25,'rgba('+ACR+','+a*.6+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  [.1,.7,1.4,4.7,5.0].forEach(w=>{const u=(t-w)/1.6;if(u>0&&u<1){g.strokeStyle='rgba('+col+','+(.85*(1-u))+')';g.lineWidth=1+5*(1-u);g.beginPath();g.arc(CX,CY,u*Math.hypot(W,H)*.7,0,6.283);g.stroke()}});
  /* túnel de dobra */
  if(t>.2&&t<3.4){const inten=Math.min(1,(t-.2)/.4)*Math.min(1,(3.4-t)/1.2),acc=t<2?1+t*1.8:Math.max(.25,4.6-(t-2)*3),far=Math.hypot(W,H)*.6;g.lineWidth=1.3;
    for(const s of WS){s.d*=1+dt*s.v*acc*2.2;if(s.d>far){s.d=4+Math.random()*24;s.a=Math.random()*6.283}
      const len=Math.min(s.d*.3,150)*acc*.5,cs=Math.cos(s.a),sn=Math.sin(s.a);
      g.strokeStyle='rgba(170,235,255,'+(inten*Math.min(.9,.1+s.d/260))+')';g.beginPath();g.moveTo(CX+cs*(s.d-len),CY+sn*(s.d-len));g.lineTo(CX+cs*s.d,CY+sn*s.d);g.stroke()}}
  /* cantos */
  {const pr=ease(Math.max(0,Math.min(1,(t-.5)/.9))),L=34*pr,m=10;g.strokeStyle='rgba('+col+',.8)';g.lineWidth=2;g.beginPath();
   [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(c=>{g.moveTo(c[0]+c[2]*L,c[1]);g.lineTo(c[0],c[1]);g.lineTo(c[0],c[1]+c[3]*L)});g.stroke()}
  /* globo de arame */
  if(t>1){const a=Math.min(1,(t-1)/1),r=R*.3*ease(a),rot=t*(t<3?2.4:1);
    const gr=g.createRadialGradient(CX,CY,0,CX,CY,r*1.4);gr.addColorStop(0,'rgba('+col+','+.3*a+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(CX-r*1.4,CY-r*1.4,r*2.8,r*2.8);
    g.save();g.translate(CX,CY);g.rotate(.32);g.lineWidth=1;
    for(let i=0;i<6;i++){const ph=rot+i*Math.PI/6,rx=Math.abs(Math.sin(ph))*r;g.strokeStyle='rgba('+col+','+((.2+.5*Math.abs(Math.cos(ph)))*a)+')';g.beginPath();g.ellipse(0,0,Math.max(.5,rx),r,0,0,6.283);g.stroke()}
    [-1.05,-.52,0,.52,1.05].forEach(l=>{g.strokeStyle='rgba('+col+','+.55*a+')';g.beginPath();g.ellipse(0,Math.sin(l)*r,Math.cos(l)*r,Math.cos(l)*r*.28,0,0,6.283);g.stroke()});
    g.fillStyle='rgba(255,255,255,'+a+')';for(let i=0;i<8;i++){const ph=rot*1.6+i*.8;g.fillRect(Math.cos(ph)*r-1.5,Math.sin(ph)*r*.28-1.5,3,3)}
    g.restore()}
  /* anéis */
  if(t>1.6){[.46,.58,.70,.82].forEach((r,k)=>{const pr=Math.min(1,(t-1.6-k*.2)/.9);if(pr<=0)return;const rt=t*(k%2?.5:-.4);
    g.strokeStyle='rgba('+col+',.9)';g.lineWidth=[1.5,5,1.5,2][k];g.setLineDash(k===1?[40*pr,10]:k===3?[3,5]:[]);g.beginPath();g.arc(CX,CY,r*R,rt,rt+6.283*pr);g.stroke();g.setLineDash([])})}
  if(t>2.2){const al=Math.min(1,(t-2.2)/.8);g.strokeStyle='rgba('+col+','+al*.8+')';g.lineWidth=1.3;g.beginPath();
    for(let i=0;i<96;i++){const a=i*Math.PI/48+t*.15,l=i%8?5:12,r0=R*.72;g.moveTo(CX+Math.cos(a)*r0,CY+Math.sin(a)*r0);g.lineTo(CX+Math.cos(a)*(r0+l),CY+Math.sin(a)*(r0+l))}g.stroke();
    for(let k=0;k<3;k++){const a=t*(.9+k*.3)+k*2.09;g.strokeStyle='rgba('+AC2R+','+al+')';g.lineWidth=2.6;g.beginPath();g.arc(CX,CY,R*.9,a-.5,a);g.stroke()}}
  /* raios de dados */
  if(t>2.8){const al=Math.min(1,(t-2.8)/.8)*(t>5?Math.max(0,1-(t-5)/.5):1);g.lineWidth=1;
    for(let i=0;i<24;i++){const a=i*Math.PI/12+t*.05,r1=R*.84,r2=r1+R*.2*(.35+.65*Math.abs(Math.sin(t*2+i)));
      g.strokeStyle='rgba('+col+','+al*.5+')';g.beginPath();g.moveTo(CX+Math.cos(a)*r1,CY+Math.sin(a)*r1);g.lineTo(CX+Math.cos(a)*r2,CY+Math.sin(a)*r2);g.stroke();
      g.fillStyle='rgba(255,255,255,'+al+')';g.fillRect(CX+Math.cos(a)*r2-1.5,CY+Math.sin(a)*r2-1.5,3,3)}}
  if(t>2.6){const pr=Math.min(1,(t-2.6)/1.1),L=6*R*.965;g.strokeStyle='rgba('+col+',.85)';g.lineWidth=1.6;g.setLineDash([pr*L,L]);hexPath(g,CX,CY,R*.965,t*.12);g.stroke();g.setLineDash([])}
  /* colunas hexadecimais */
  if(t>1.9){const al=Math.min(1,(t-1.9)/.8)*(t>5?Math.max(0,1-(t-5)/.5):1);F.n=(F.n||0)+1;if(F.n%5===0)COLS.forEach(cl=>{cl[Math.random()*cl.length|0]='0x'+hx(4)+' '+hx(6)});
    g.font='10px monospace';g.textAlign='left';try{g.letterSpacing='0px'}catch(e){}
    COLS.forEach((ln,ci)=>ln.forEach((s,i)=>{g.fillStyle='rgba('+col+','+al*(.1+.4*(1-i/ln.length))+')';g.fillText(s,ci?W-92:12,H*.14+i*15)}))}
  /* varredura */
  if(t>2.4&&t<3.7){const y=CY-R-30+((t-2.4)/1.3)*(2*R+60),w=R*1.15,gr=g.createLinearGradient(CX-w,0,CX+w,0);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba('+col+',0)');
    g.fillStyle=gr;g.fillRect(CX-w,y-1.5,2*w,3);const g2=g.createLinearGradient(0,y-70,0,y);g2.addColorStop(0,'rgba('+col+',0)');g2.addColorStop(1,'rgba('+col+',.25)');g.fillStyle=g2;g.fillRect(CX-w,y-70,2*w,70)}
  /* título, subtítulo, log, progresso */
  const ty=CY+R+36;
  if(t>2.1){const pr=Math.min(1,(t-2.1)/1.3),n=Math.floor(pr*TITLE.length);let o='';for(let i=0;i<TITLE.length;i++)o+=(i<n||TITLE[i]==='.')?TITLE[i]:GL[Math.random()*GL.length|0];
    const jit=t>4.6&&t<5.4?(Math.random()-.5)*5:0;txt(pr>=1?TITLE:o,CX+jit,ty,Math.min(22,W*.055),.32,Math.min(1,(t-2.1)*3),t>4.6?AC2R:'232,251,255',900)}
  if(t>3.4)txt('JUST A RATHER VERY INTELLIGENT SYSTEM',CX,ty+22,8,.2,Math.min(.8,(t-3.4))*(t>5.2?Math.max(0,1-(t-5.2)/.4):1),col,500);
  if(t>2.7&&t<4.6){const fade=t>4.2?Math.max(0,1-(t-4.2)/.4):1;
    LOG.forEach((s,i)=>{const s0=2.7+i*.32;if(t<s0)return;if(!ticked[i]){ticked[i]=1;try{bp(1700+i*220,0,.05,.05)}catch(e){}}
      g.font='10px "Share Tech Mono",monospace';g.textAlign='left';try{g.letterSpacing='1.4px'}catch(e){}g.fillStyle='rgba('+AC2R+','+fade*.9+')';g.fillText(s.padEnd(24,'.')+(t>s0+.25?' OK':' ..'),CX-115,ty+52+i*16)});
    const pw=Math.min(W*.7,260),pp=Math.min(1,(t-2.7)/1.7);g.fillStyle='rgba('+ACR+','+fade*.18+')';g.fillRect(CX-pw/2,ty+52+5*16+6,pw,3);g.fillStyle='rgba('+ACR+','+fade+')';g.fillRect(CX-pw/2,ty+52+5*16+6,pw*pp,3)}
  if(t>4.6){const jit=t<5.3?(Math.random()-.5)*6:0;txt('BEM-VINDO, SENHOR',CX+jit,ty+56,Math.min(15,W*.04),.3,Math.min(1,(t-4.6)*3)*(t>5.6?Math.max(0,1-(t-5.6)/.5):1),AC2R,900)}
  g.restore();
  if(t>4.6&&!said){said=true;const h=new Date().getHours();speak((h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', senhor. Todos os sistemas estão operacionais. Em que posso ajudá-lo?')}
  if(t>5.6&&!fired){fired=true;introT=performance.now();mainDraw=true;nb.style.clipPath='circle(0px at '+CX+'px '+CY+'px)'}
  if(t>7.1){done=true;nb.remove();return}
  requestAnimationFrame(F)}
nb.onclick=()=>{
  if(t0!==null){if(!fired){t0=performance.now()-5600;try{if(aud)aud.pause()}catch(e){}}return}
  sz();ax();aud=play('boot')||null;t0=performance.now();g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H)};
requestAnimationFrame(F);
})();
