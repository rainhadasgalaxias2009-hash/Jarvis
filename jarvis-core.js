/* JARVIS CORE: reator multi-azul, novos temas, comandos úteis */
(()=>{
const st=document.createElement('style');
st.textContent=`
#neb{animation:nbd 9s ease-in-out infinite alternate}
@keyframes nbd{to{filter:hue-rotate(-16deg) brightness(1.25)}}
.hx:not(#stb){background:linear-gradient(160deg,var(--ac),#2459e8 70%,#12307f)}
#shp{background:linear-gradient(rgba(var(--acr),.9),rgba(var(--acr),.9)) top/100% 2px no-repeat,linear-gradient(rgba(36,89,232,.22),rgba(var(--acr),.04) 45%),#020a18}
.rw,.tk,.mk{border-bottom-color:rgba(61,155,255,.22)}`;
document.head.appendChild(st);

/* novos temas (aparecem sozinhos nas configurações) */
TH.gelo=['#9fe8ff','#5ec2ff'];TH.safira=['#3d7bff','#00f0ff'];TH.abismo=['#2459e8','#7dd3ff'];

/* reator novo: cinco tons de azul em camadas */
const BL=['0,240,255','47,216,255','61,155,255','36,89,232','18,48,127'];
window.reactor=function(t,dt){
  const c=rcx,S=RS;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
  const k=ease(Math.min(1,(performance.now()-introT)/1300));
  c.save();c.translate(S/2,S/2);c.scale(.55+.45*k,.55+.45*k);c.translate(-S/2,-S/2);c.globalAlpha=k;
  const R=S/2,cx=R,cy=R,l=lvl,A=speaking?AC2R:ACR;
  rot+=dt*(think?2.6:(listening||speaking)?1.6:.5);
  c.globalCompositeOperation='lighter';
  [[.98,BL[3],.2],[.72,BL[2],.18],[.42,BL[1],.24]].forEach(([r,col,a])=>{const g=c.createRadialGradient(cx,cy,0,cx,cy,R*r);g.addColorStop(0,'rgba('+col+','+(a+.28*l)+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.fillRect(0,0,S,S)});
  drawSphere(c,cx,cy,R*.29*(1+.08*l),rot,.35,1,l,A);
  drawSphere(c,cx,cy,R*.19*(1+.08*l),-rot*1.4,-.5,.75,l,BL[2]);
  const cg=c.createRadialGradient(cx,cy,0,cx,cy,R*.1);cg.addColorStop(0,'rgba(255,255,255,'+(.3+.4*l)+')');cg.addColorStop(1,'rgba('+BL[0]+',0)');c.fillStyle=cg;c.fillRect(cx-R*.1,cy-R*.1,R*.2,R*.2);
  /* anéis, cada um num azul diferente */
  [[.40,BL[0],1.2,[R*.4,R*.05],1],[.48,BL[2],3,[R*.12,R*.06],-1.3],[.57,BL[1],1,[2,6],.8],[.64,BL[3],6,[R*.5,R*.1,R*.2,R*.1],-.5],[.71,BL[0],1.4,[],.2]].forEach(([r,col,w,d,sp],i)=>{
    c.lineWidth=w;c.strokeStyle='rgba('+col+','+(i===3?.6:.85)+')';c.setLineDash(d);c.lineDashOffset=-t*sp*R*.2;c.beginPath();c.arc(cx,cy,R*r,t*sp*.3,t*sp*.3+6.283);c.stroke()});
  c.setLineDash([]);
  /* satélites com rastro */
  for(let i=0;i<4;i++){const a=t*(1+i*.22)*(i%2?-1:1)+i*1.57,r=R*(.48+i*.08),d=i%2?-1:1;
    const tr=c.createConicGradient?null:null;
    c.lineWidth=2.4;c.strokeStyle='rgba('+BL[i%3]+',.9)';c.beginPath();c.arc(cx,cy,r,d>0?a-.6:a,d>0?a:a+.6);c.stroke();
    c.fillStyle='rgb('+(i%2?AC2R:BL[0])+')';c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,3.2,0,6.283);c.fill()}
  /* anel de ondas reativo à voz */
  c.lineWidth=2;c.beginPath();
  for(let i=0;i<90;i++){const a=i/90*6.2832-1.5708+t*.1,n=.5+.5*Math.sin(t*3.1+i*.7)*Math.sin(t*1.3+i*.31),r0=R*.79,h=R*(.012+.12*l*n+(i%6===0?.012:0));
    c.strokeStyle='rgba('+BL[i%3]+',.9)';c.beginPath();c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);c.lineTo(cx+Math.cos(a)*(r0+h),cy+Math.sin(a)*(r0+h));c.stroke()}
  /* régua de ticks */
  const r3=R*.9;c.lineWidth=1;c.strokeStyle='rgba('+BL[2]+',.5)';c.beginPath();
  for(let i=0;i<120;i++){const a=i/120*6.2832-t*.1,len=i%10===0?R*.05:i%5===0?R*.03:R*.016;c.moveTo(cx+Math.cos(a)*r3,cy+Math.sin(a)*r3);c.lineTo(cx+Math.cos(a)*(r3+len),cy+Math.sin(a)*(r3+len))}c.stroke();
  if(think){const sw=t*5;c.lineWidth=3.4;c.strokeStyle='rgba('+AC2R+',1)';c.beginPath();c.arc(cx,cy,R*.75,sw,sw+1.5);c.stroke()}
  /* moldura hexagonal em degradê azul */
  const hg=c.createLinearGradient(0,0,S,S);hg.addColorStop(0,'rgb('+BL[0]+')');hg.addColorStop(.5,'rgb('+BL[3]+')');hg.addColorStop(1,'rgb('+BL[1]+')');
  c.lineWidth=1.6;c.strokeStyle=hg;hexPath(c,cx,cy,R*.965,t*.12);c.stroke();
  c.strokeStyle='rgba('+BL[2]+',.35)';c.setLineDash([4,6]);hexPath(c,cx,cy,R*.93,-t*.09);c.stroke();c.setLineDash([]);
  c.fillStyle='rgb('+BL[0]+')';for(let i=0;i<6;i++){const a=t*.12+i*Math.PI/3-Math.PI/2;c.beginPath();c.arc(cx+Math.cos(a)*R*.965,cy+Math.sin(a)*R*.965,3,0,6.283);c.fill()}
  const now=performance.now()/1000;rips=rips.filter(r=>now-r<1.1);
  for(const rp of rips){const u=(now-rp)/1.1;c.strokeStyle='rgba('+BL[1]+','+(.8*(1-u))+')';c.lineWidth=2+3*(1-u);c.beginPath();c.arc(cx,cy,R*(.3+.65*u),0,6.283);c.stroke()}
  c.restore()};

/* comandos novos, antes dos antigos */
const L0=window.local;
window.local=function(raw){
  const s=norm(raw);let m;
  if(/(abrir|abre|abra) (o )?(studio|estudio|editor)/.test(s)){$('#stb').click();return say('Abrindo o Studio, senhor.')}
  if(/(modo foco|pomodoro|iniciar foco)/.test(s)){addTimer(1500,'Foco',true);play('ok');return say('Modo foco iniciado. Vinte e cinco minutos, senhor. Sem distrações.')}
  if(/cara ou coroa/.test(s))return say('Deu '+(Math.random()<.5?'cara':'coroa')+', senhor.');
  if(m=s.match(/sort(?:eie|ear|eio) (?:um )?(?:numero )?(?:de |entre )?(\d+) (?:a|ate|e) (\d+)/)){const a=+m[1],b=+m[2],lo=Math.min(a,b),hi=Math.max(a,b);return say('Sorteei o número '+(lo+Math.floor(Math.random()*(hi-lo+1)))+', senhor.')}
  if(/(gerar|gera|crie|criar) (uma )?senha/.test(s)){
    const cs='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*',a=new Uint32Array(16);crypto.getRandomValues(a);
    const pw=Array.from(a,x=>cs[x%cs.length]).join('');try{navigator.clipboard.writeText(pw)}catch(e){}
    clearInterval(typeIv);$('#cj').textContent=pw;return speak('Senha forte gerada e copiada para a área de transferência, senhor.')}
  return L0(raw)};
})();
