/* JARVIS V3: abrir apps de verdade, volume honesto, visual HUD melhorado */
(()=>{
/* ================= COMANDOS ================= */
const AL={insta:'instagram',instagran:'instagram',instagram:'instagram',zap:'whatsapp',zapzap:'whatsapp',whats:'whatsapp',whatsapp:'whatsapp',whatsap:'whatsapp',yt:'youtube',youtube:'youtube','you tube':'youtube',face:'facebook',facebook:'facebook',tiktok:'tiktok','tik tok':'tiktok',telegram:'telegram',twitter:'twitter',x:'x',netflix:'netflix',spotify:'spotify',discord:'discord',maps:'maps','google maps':'maps',mapa:'maps',mapas:'maps',waze:'waze',uber:'uber',gmail:'gmail',email:'gmail','e mail':'gmail',messenger:'messenger',kwai:'kwai',ifood:'ifood',nubank:'nubank','play store':'playstore',loja:'playstore',camera:'camera',relogio:'relogio',galeria:'fotos',fotos:'fotos',foto:'fotos',chrome:'chrome'};
/* [pacote, host, esquema, página de reserva] */
const WEB={instagram:['com.instagram.android','www.instagram.com'],whatsapp:['com.whatsapp','send','whatsapp','https://web.whatsapp.com/'],youtube:['com.google.android.youtube','www.youtube.com'],facebook:['com.facebook.katana','www.facebook.com'],tiktok:['com.zhiliaoapp.musically','www.tiktok.com'],telegram:['org.telegram.messenger','t.me'],twitter:['com.twitter.android','x.com'],x:['com.twitter.android','x.com'],netflix:['com.netflix.mediaclient','www.netflix.com'],spotify:['com.spotify.music','open.spotify.com'],discord:['com.discord','discord.com'],maps:['com.google.android.apps.maps','maps.google.com'],waze:['com.waze','www.waze.com'],uber:['com.ubercab','www.uber.com'],gmail:['com.google.android.gm','mail.google.com'],messenger:['com.facebook.orca','www.messenger.com'],kwai:['com.kwai.video','www.kwai.com'],ifood:['br.com.brainweb.ifood','www.ifood.com.br'],nubank:['com.nu.production','nubank.com.br'],playstore:['com.android.vending','play.google.com']};
const findApp=n=>{n=norm(n||'');return Object.keys(AL).find(a=>new RegExp('(^| )'+a+'( |$)').test(n)&&n.split(' ').length<=3)};
const appUrl=k=>{const e=WEB[k];if(!e)return null;const sc=e[2]||'https',fb=e[3]||'https://'+e[1]+'/';
  /* se o app não existir, cai no site (nunca na Play Store) */
  return 'intent://'+e[1]+'/#Intent;scheme='+sc+';package='+e[0]+';S.browser_fallback_url='+encodeURIComponent(fb)+';end'};
function openApp(k){
  const key=AL[k]||k;
  if(AND&&WEB[key])return launch(appUrl(key),key);
  if(IOS&&APPS[key])return launch(APPS[key][1],key);
  if(WEB[key]&&!AND&&!IOS)return launch('https://'+(WEB[key][1]==='send'?'web.whatsapp.com':WEB[key][1])+'/',key);
  return D0({tipo:'app',alvo:key})}

/* o botão só aparece; apps e esquemas abrem por navegação direta, links normais em nova aba */
window.launch=function(url,label){
  const a=document.createElement('a');a.className='go';a.href=url;a.textContent='▶ EXECUTAR: '+String(label).toUpperCase();
  if(/^https?:/.test(url)){a.target='_blank';a.rel='noopener';try{window.open(url,'_blank','noopener')}catch(e){}}
  $('#act').replaceChildren(a);play('ok');
  if(!/^https?:/.test(url)){try{location.href=url}catch(e){}}};

const D0=window.doAction;
window.doAction=function(a){
  if(a&&a.tipo==='app'){const k=findApp(a.alvo);if(k)return openApp(k)}
  return D0(a)};

const L0=window.local;
const OK=['Imediatamente, senhor.','Abrindo agora, senhor.','Como desejar.','Considere feito.'];
window.local=function(raw){
  const s=norm(raw);let m;
  if(m=s.match(/^(?:abrir|abre|abra|iniciar|inicia|executar|entrar no|entrar na|entra no|vai pro|vai pra)\s+(?:o |a |os |as |no |na )?(.+)$/)){
    const k=findApp(m[1]);
    if(k){openApp(k);return say(OK[Math.random()*OK.length|0]+' Se não abrir sozinho, toque no botão verde.')}}
  if(/(aumentar|aumenta|subir|sobe|mais) (o )?(volume|som)|volume (mais )?(alto|maximo)/.test(s)){
    vol=Math.min(1,vol+.2);sv('vol',vol);play('ok');
    return say('Elevei o volume dos meus efeitos para '+Math.round(vol*100)+' por cento, senhor. O volume geral do celular só responde aos botões físicos, o navegador não me dá acesso a ele.')}
  if(/(diminuir|diminui|abaixar|abaixa|baixar|baixa|menos) (o )?(volume|som)|volume (mais )?baixo/.test(s)){
    vol=Math.max(0,vol-.2);sv('vol',vol);play('ok');
    return say('Reduzi o volume dos meus efeitos para '+Math.round(vol*100)+' por cento, senhor. O volume geral do celular o senhor ajusta pelos botões físicos.')}
  if(/(silenciar|mudo|sem som)$/.test(s)&&/(volume|som|celular)/.test(s)){vol=0;sv('vol',0);return say('Efeitos silenciados, senhor.')}
  return L0(raw)};

/* ================= VISUAL ================= */
const st=document.createElement('style');
st.textContent=`
body::after{background:repeating-linear-gradient(transparent 0 3px,rgba(0,0,0,.07) 4px),radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.7) 100%)!important}
#grid{position:fixed;left:-20%;right:-20%;bottom:0;height:38dvh;z-index:1;pointer-events:none;
  background:linear-gradient(rgba(var(--acr),.35) 1px,transparent 1px) 0 0/100% 34px,linear-gradient(90deg,rgba(var(--acr),.35) 1px,transparent 1px) 0 0/48px 100%;
  transform:perspective(260px) rotateX(62deg);transform-origin:bottom;animation:gr 3s linear infinite;
  -webkit-mask:linear-gradient(transparent,#000 70%);mask:linear-gradient(transparent,#000 70%);opacity:.5}
@keyframes gr{to{background-position:0 34px,0 0}}
#hud{position:relative;z-index:5;flex:none;display:flex;justify-content:space-between;align-items:center;padding:0 18px;margin-top:-4px;font:10px var(--mono);letter-spacing:.14em;color:var(--mut)}
#hud b{color:var(--ac);font-weight:400;text-shadow:0 0 8px var(--ac)}
#hud i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--ac2);box-shadow:0 0 8px var(--ac2);margin-right:6px;animation:bk 1.6s infinite}
#tms{top:calc(env(safe-area-inset-top) + 112px)!important}
#reactor{filter:drop-shadow(0 0 26px rgba(var(--acr),.5)) drop-shadow(0 0 70px rgba(var(--acr),.25))}
#st{color:var(--ac);text-shadow:0 0 10px rgba(var(--acr),.8)}
#cap{margin:4px 16px;padding:12px 20px;background:linear-gradient(160deg,rgba(var(--acr),.13),rgba(var(--acr),.02) 60%);
  box-shadow:inset 0 0 0 1px rgba(var(--acr),.28),inset 0 0 30px rgba(var(--acr),.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  clip-path:polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)}
#cj{font-size:18px}
.hx{transition:transform .15s}.hx:active{transform:scale(.9)}
#dock .hx{animation:hp 3.2s ease-in-out infinite}
#dock .hx:nth-child(2){animation-delay:.4s}#dock .hx:nth-child(3){animation-delay:.8s}#dock .hx:nth-child(4){animation-delay:1.2s}#dock .hx:nth-child(5){animation-delay:1.6s}
@keyframes hp{50%{filter:brightness(1.45) saturate(1.2)}}
#shp{backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 -10px 60px rgba(var(--acr),.25)}
.go{box-shadow:0 0 22px rgba(var(--ac2r),.35);font-size:12px;padding:14px 32px}
.logo{animation:lg 4s ease-in-out infinite alternate}@keyframes lg{to{text-shadow:0 0 22px var(--ac),0 0 4px #fff}}`;
document.head.appendChild(st);

const grid=document.createElement('div');grid.id='grid';document.body.appendChild(grid);

const hud=document.createElement('div');hud.id='hud';
hud.innerHTML='<span><i></i>SISTEMA ONLINE</span><b id="hc">--:--</b><span id="hb">BAT --</span>';
document.querySelector('header').after(hud);
const tick=()=>{$('#hc').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};tick();setInterval(tick,1000);
try{navigator.getBattery().then(b=>{const u=()=>$('#hb').textContent='BAT '+Math.round(b.level*100)+'%'+(b.charging?' ⚡':'');u();b.onlevelchange=b.onchargingchange=u})}catch(e){}

/* camada de efeitos: partículas orbitais, raios de energia e onda de voz */
const fx=document.createElement('canvas');fx.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:2;pointer-events:none';document.body.appendChild(fx);
const c=fx.getContext('2d');let W,H;
const sz=()=>{W=innerWidth;H=innerHeight;fx.width=W*DPR;fx.height=H*DPR};addEventListener('resize',sz);sz();
const P=Array.from({length:80},()=>({a:Math.random()*6.283,r:1.04+Math.random()*.5,v:(.08+Math.random()*.3)*(Math.random()<.5?-1:1),s:.7+Math.random()*1.8,p:Math.random()*6.28}));
function draw(ts){
  const t=ts/1000;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);
  if(mainDraw){
    const cx=RCX,cy=RCY,R=RR,l=lvl,col=speaking?AC2R:ACR;c.globalCompositeOperation='lighter';
    for(const p of P){const a=p.a+t*p.v,r=R*(p.r+.05*Math.sin(t*1.3+p.p)+.14*l);
      c.fillStyle='rgba('+col+','+(.2+.6*Math.abs(Math.sin(t*.9+p.p)))+')';c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.85,p.s,0,6.283);c.fill()}
    c.lineWidth=1.2;
    for(let i=0;i<16;i++){const a=i*Math.PI/8+t*.15,r1=R*1.02,r2=r1+R*(.04+.3*l*(.5+.5*Math.sin(t*4+i*1.7)));
      c.strokeStyle='rgba('+col+','+(.18+.4*l)+')';c.beginPath();c.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);c.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);c.stroke()}
    const d=document.querySelector('.dv');
    if(d){const y=d.getBoundingClientRect().top+3,x0=W*.12,w=W*.76,A=2+26*l;
      for(let k=0;k<2;k++){c.strokeStyle='rgba('+(k?AC2R:ACR)+','+(k?.45:.9)+')';c.lineWidth=k?1:1.6;c.beginPath();
        for(let i=0;i<=80;i++){const u=i/80,env=Math.sin(u*Math.PI),yy=y+env*A*Math.sin(u*(14+k*5)+t*(6+k*3))*Math.sin(t*2.3+u*3+k);i?c.lineTo(x0+u*w,yy):c.moveTo(x0+u*w,yy)}c.stroke()}}
  }
  requestAnimationFrame(draw)}
requestAnimationFrame(draw);
})();
