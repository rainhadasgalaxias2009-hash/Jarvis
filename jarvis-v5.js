/* J.A.R.V.I.S V6
   COMO INSTALAR (1 passo, sem mexer no index.html):
   abra o jarvis-v5.js no GitHub, apague tudo, cole ESTE arquivo inteiro e salve.
   (O V6 já inclui tudo que o V5 fazia. Se preferir, salve como jarvis-v6.js e troque a linha do v5 no index.html.)

   O QUE MUDA:
   1) Botão voltar = a mesma seta do Studio, em TODAS as telas (Studio, Cofre, prévia, lista de arquivos)
   2) Botão Studio sai do topo e vai para o canto de baixo (diga "studio no canto direito" para trocar de lado)
   3) Som em todo botão, aba, painel, abrir e fechar (também dentro do Studio e do Cofre) + toque com brilho
   4) Jarvis com controle total: sem "não tenho permissão", com novas ações e uma segunda tentativa se ele recusar
   5) Correções: timers duplicados, lanterna mais firme, ações que precisam de toque ganham botão verde */
(()=>{
if(window.__JV6)return;window.__JV6=1;
const Q=q=>document.querySelector(q);
const S=(n,f)=>{try{f()}catch(e){console.warn('[V6 '+n+']',e)}};
const pad=n=>String(n).padStart(2,'0');
const now=()=>performance.now();
const WN={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
const N=x=>/^\d+$/.test(x)?+x:(WN[x]===undefined?NaN:WN[x]);
const MES={janeiro:0,fevereiro:1,marco:2,abril:3,maio:4,junho:5,julho:6,agosto:7,setembro:8,outubro:9,novembro:10,dezembro:11};
const ARROW='<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
let HAP=true;S('hap',()=>{HAP=ld('hap',true)!==false});

/* ================= CSS COMUM (Jarvis, Studio e Cofre usam o mesmo) ================= */
const UI_CSS=
'.jb{border:0;background:none;color:var(--ac);width:42px;height:42px;display:flex;align-items:center;justify-content:center;padding:0;flex:none;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
'.jb svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 4px rgba(var(--acr),.8))}'+
'.jb:active{background:rgba(var(--acr),.35);color:var(--ac2)}'+
'.jrip{position:fixed;z-index:99998;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:2px solid rgba(var(--acr,31,134,255),.9);box-shadow:0 0 12px rgba(var(--acr,31,134,255),.7);pointer-events:none;animation:jrp .5s ease-out forwards}'+
'@keyframes jrp{to{transform:scale(6);opacity:0}}'+
'html[data-page=cofre] header{justify-content:flex-start!important;gap:4px;padding:4px 8px 0 6px!important;align-items:center}';
const st0=document.createElement('style');
st0.textContent=UI_CSS+
/* Studio: botão separado, no canto de baixo */
'#stb{position:fixed!important;z-index:9;width:50px!important;height:57px!important;margin:0!important;bottom:calc(env(safe-area-inset-bottom,0px) + 16px)}'+
'body[data-stp=bl] #stb{left:20px;right:auto}body[data-stp=br] #stb{right:20px;left:auto}'+
'#gear{margin-left:auto}body.kbd #stb{display:none}'+
/* Studio abre sem lag (fade em vez de círculo) */
'#stw{clip-path:none!important;opacity:0;visibility:hidden;transform:translateY(14px) scale(.985);transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s linear .2s!important;will-change:opacity,transform}'+
'#stw.on{opacity:1;visibility:visible;transform:none;transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s!important}';
document.head.appendChild(st0);

/* ================= 1) SONS: tudo faz barulho ================= */
let lastP=0;
S('sons',()=>{
  if(typeof FB==='object'){
    FB.close=FB.close||(()=>bp(1200,480,.13,.05,'triangle'));
    FB.back=FB.back||(()=>{bp(1000,520,.09,.05,'triangle');setTimeout(()=>bp(520,0,.07,.03),60)});
    FB.tab=FB.tab||(()=>bp(800,1300,.07,.045))}
  if(typeof SLOTS!=='undefined'&&Array.isArray(SLOTS)){
    [['close','Fechar painel ou aba','Sci fi UI close'],['back','Botão voltar','Sci fi UI back']].forEach(s=>{if(!SLOTS.some(x=>x[0]===s[0]))SLOTS.push(s)});
    try{loadSounds()}catch(e){}}
  const P0=play;play=function(k,o){lastP=now();return P0.apply(this,arguments)};
  const SEL='button,a[href],.hx,.rb,.rm,.go,.sb,.cmd,.tab,.jb,[role=button],[data-k],[data-a]';
  const kind=b=>b.closest('.jb,#jback')?'back':b.closest('#shx')?'close':b.closest('.tab')?'tab':'click';
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest(SEL);if(!b||b.disabled)return;
    if(HAP){try{navigator.vibrate(6)}catch(_){}}
    if(now()-lastP<160)return; /* o botão já tocou o próprio som */
    play(kind(b))},false);
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button)return;
    const b=e.target.closest&&e.target.closest(SEL);if(!b)return;
    const r=document.createElement('i');r.className='jrip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
    document.body.appendChild(r);setTimeout(()=>r.remove(),520)},{passive:true,capture:true});
  /* painéis, abas e telas por cima: som ao abrir e ao fechar */
  const snd=k=>{if(now()-lastP>200)play(k)};
  const watch=(el,fn,attr)=>{if(!el)return;let on=fn();new MutationObserver(()=>{const o=fn();if(o===on)return;on=o;snd(o?(el.id==='tb'?'tab':'open'):'close')}).observe(el,{attributes:true,attributeFilter:attr})};
  const sh=Q('#sh'),stw=Q('#stw'),ov=Q('#ja-ov'),tb=Q('#tb');
  watch(sh,()=>sh.classList.contains('open'),['class']);
  watch(stw,()=>stw.classList.contains('on'),['class']);
  watch(ov,()=>ov.style.display==='block',['style']);
  watch(tb,()=>tb.classList.contains('on'),['class'])});

/* ================= 2) BOTÃO STUDIO NO CANTO ================= */
S('studio-btn',()=>{
  const stb=Q('#stb');if(!stb)return;
  stb.setAttribute('aria-label','Abrir Studio');
  const apply=()=>{document.body.dataset.stp=ld('stpos','bl')==='br'?'br':'bl';try{rs()}catch(e){}};
  document.body.appendChild(stb);apply();
  window.__jv6StudioPos=p=>{sv('stpos',p);apply()}});

/* ================= 3) STUDIO E COFRE: voltar igual, sons, toque ================= */
function frameSide(){
  const J=window.__JV6||{},d=document,root=d.documentElement;
  if(root.dataset.v6)return;root.dataset.v6='1';
  const page=root.dataset.page;
  const st=d.createElement('style');st.textContent=J.css||'';d.head.appendChild(st);
  let lastP=0;
  if(typeof window.play==='function'){const P0=window.play;window.play=function(){lastP=performance.now();return P0.apply(this,arguments)}}
  const snd=k=>{try{
    if(typeof fxOn!=='undefined'&&!fxOn)return;
    if(k==='close'||k==='back'||k==='tab'){lastP=performance.now();
      if(k==='close')bp(1200,480,.13,.05,'triangle');else if(k==='back')bp(1000,520,.09,.05,'triangle');else bp(800,1300,.07,.045)}
    else window.play(k)}catch(e){}};
  const SEL='button,a[href],.hx,.sb,.cmd,.tab,.jb,.q,.cb,[role=button],[data-k],[data-a],[data-c],#fab';
  d.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest(SEL);if(!b||b.disabled||b.matches('[data-k=save]'))return;
    if(J.hap){try{navigator.vibrate(6)}catch(_){}}
    if(performance.now()-lastP<160)return;
    snd(b.closest('.jb')?'back':b.closest('#shx')?'close':b.closest('.tab')?'tab':'click')},false);
  d.addEventListener('pointerdown',e=>{
    const b=e.target.closest&&e.target.closest(SEL);if(!b||(e.pointerType==='mouse'&&e.button))return;
    const r=d.createElement('i');r.className='jrip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
    d.body.appendChild(r);setTimeout(()=>r.remove(),520)},{passive:true,capture:true});
  /* painéis que abrem e fecham em silêncio */
  [['#sh','open'],['#dr','open'],['#pv','on']].forEach(([s,c])=>{
    const el=d.querySelector(s);if(!el)return;let on=el.classList.contains(c);
    new MutationObserver(()=>{const o=el.classList.contains(c);if(o===on)return;on=o;
      if(performance.now()-lastP>200)snd(o?'open':'close')}).observe(el,{attributes:true,attributeFilter:['class']})});
  const tb=d.getElementById('tb');
  if(tb&&page==='cofre'){let on=tb.classList.contains('on');
    new MutationObserver(()=>{const o=tb.classList.contains('on');if(o===on)return;on=o;if(performance.now()-lastP>200)snd('tab')}).observe(tb,{attributes:true,attributeFilter:['class']})}
  /* TODO botão de voltar vira a mesma seta do Studio */
  const fix=()=>{
    const hdr=d.querySelector('header');
    d.querySelectorAll('a[href^="index"]').forEach(a=>{
      if(a.classList.contains('jb'))return;
      a.className='jb';a.removeAttribute('style');a.setAttribute('aria-label','Voltar ao Jarvis');a.innerHTML=J.arrow;
      if(hdr&&hdr.contains(a)&&hdr.firstChild!==a)hdr.insertBefore(a,hdr.firstChild)});
    let jb=d.getElementById('jback');
    if(page==='studio'&&!jb&&hdr){
      jb=d.createElement('button');jb.id='jback';jb.setAttribute('aria-label','Voltar ao Jarvis');jb.innerHTML=J.arrow;
      jb.onclick=()=>{try{parent.document.getElementById('stc').click()}catch(e){history.back()}};
      hdr.insertBefore(jb,hdr.firstChild)}
    if(jb&&!jb.classList.contains('jb'))jb.classList.add('jb');
    const pvx=d.getElementById('pvx');
    if(pvx&&!pvx.classList.contains('jb')){pvx.className='jb';pvx.innerHTML=J.arrow;pvx.setAttribute('aria-label','Fechar prévia')}};
  fix();setTimeout(fix,300);setTimeout(fix,1200);
  ['#drb','#shb'].forEach(s=>{const el=d.querySelector(s);if(!el)return;let t;
    new MutationObserver(()=>{clearTimeout(t);t=setTimeout(fix,20)}).observe(el,{childList:true})})}

S('frames',()=>{
  const hook=fr=>{
    if(fr.__v6)return;fr.__v6=1;
    const go=()=>{try{
      const w=fr.contentWindow,d=fr.contentDocument;
      if(!w||!d||!d.body||w.location.href==='about:blank'||d.documentElement.dataset.v6)return;
      const p=w.location.pathname;
      d.documentElement.dataset.page=/cofre/i.test(p)?'cofre':/studio/i.test(p)?'studio':'x';
      w.__JV6={css:UI_CSS,arrow:ARROW,hap:HAP};
      w.eval('('+frameSide.toString()+')()')}catch(e){}};
    fr.addEventListener('load',()=>{go();setTimeout(go,400)});go()};
  const scan=()=>document.querySelectorAll('iframe').forEach(hook);
  scan();
  const ob=new MutationObserver(()=>{clearTimeout(scan.t);scan.t=setTimeout(scan,80)});
  ob.observe(document.body,{childList:true});
  ['#ja-ov','#stw'].forEach(s=>{const e=Q(s);if(e)ob.observe(e,{childList:true})})});

/* ================= 4) TAREFAS E MEMÓRIA ================= */
const pend=()=>tasks.filter(x=>!x.ok);
const stash=()=>sv('tasks',tasks),stashM=()=>sv('mem',mem);
function findTask(q,done){q=norm(q).replace(/^(?:a |o |numero |n )/,'').trim();const n=N(q),base=done?tasks.filter(x=>x.ok):pend();
  if(!isNaN(n))return base[n-1];return base.find(x=>norm(x.t).includes(q))||tasks.find(x=>norm(x.t).includes(q))}
function findMem(q){q=norm(q).replace(/^(?:a |o |numero )/,'').trim();const n=N(q);if(!isNaN(n))return mem[n-1];return mem.find(x=>norm(x.t).includes(q))}
const delTask=t=>{tasks=tasks.filter(x=>x!==t);stash()};
const delMem=t=>{mem=mem.filter(x=>x!==t);stashM()};
const refresh=()=>{try{if(Q('#sh').classList.contains('open')){const h=Q('#sht').textContent;if(h==='TAREFAS')sheetTasks();else if(h==='MEMÓRIA')sheetMem()}}catch(e){}};

/* ================= 5) TELA PRETA, BRILHO, LANTERNA ================= */
let blk=null,wantWL=false,dimLvl=0,torch=null;
async function keepAwake(on){wantWL=on;try{if(on){if(!wl&&navigator.wakeLock)wl=await navigator.wakeLock.request('screen')}else{if(wl)await wl.release();wl=null}}catch(e){}}
function telaPreta(on){
  if(on){if(blk)return;blk=document.createElement('div');
    blk.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:flex-end;justify-content:center;padding-bottom:44px;color:#0b3a52;font:10px Orbitron,sans-serif;letter-spacing:.3em;touch-action:manipulation';
    blk.textContent='TOQUE DUAS VEZES PARA ACORDAR';setTimeout(()=>{if(blk)blk.textContent=''},4000);
    let last=0;blk.addEventListener('pointerdown',()=>{const n=Date.now();if(n-last<450)telaPreta(false);last=n});
    document.body.appendChild(blk);keepAwake(true)}
  else if(blk){blk.remove();blk=null;play('ok')}}
const dimEl=document.createElement('div');dimEl.style.cssText='position:fixed;inset:0;z-index:9998;background:#000;opacity:0;pointer-events:none;transition:opacity .3s';document.body.appendChild(dimEl);
function dim(v){dimLvl=Math.max(0,Math.min(3,v));dimEl.style.opacity=[0,.3,.55,.78][dimLvl]}
document.addEventListener('visibilitychange',()=>{if(document.hidden)return;
  if(wantWL||blk){wl=null;keepAwake(true)}
  if(contOn&&!listening&&!speaking)setTimeout(()=>{try{listen()}catch(e){}},500)});
async function lanterna(on){
  try{
    if(!on){if(torch){torch.getTracks().forEach(t=>t.stop());torch=null}return true}
    if(torch)return true;
    let s;
    try{s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:'environment'}}})}
    catch(e){s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}})}
    const tr=s.getVideoTracks()[0],cap=tr.getCapabilities?tr.getCapabilities():{};
    if(!cap.torch){s.getTracks().forEach(t=>t.stop());return false}
    await tr.applyConstraints({advanced:[{torch:true}]});
    tr.onended=()=>{torch=null};torch=s;return true
  }catch(e){return false}}

/* ================= 6) ALARME, CRONÔMETRO, INFORMAÇÕES ================= */
function alarme(h,mi,msg){
  if(!AND){addTimer(Math.max(1,Math.round(((()=>{const d=new Date();d.setHours(h,mi,0,0);if(d<=Date.now())d.setDate(d.getDate()+1);return d-Date.now()})())/1000)),msg||'Alarme',true);return false}
  launch('intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR='+h+';i.android.intent.extra.alarm.MINUTES='+mi+';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(msg||'Jarvis')+';B.android.intent.extra.alarm.SKIP_UI=true;end','alarme '+pad(h)+':'+pad(mi));return true}
function lembrarHora(label,h,mi){const d=new Date();d.setHours(h,mi||0,0,0);if(d<=Date.now())d.setDate(d.getDate()+1);
  addTimer(Math.round((d-Date.now())/1000),label,true);play('ok');
  return say('Combinado, senhor. Avisarei sobre '+label+' às '+pad(h)+':'+pad(mi||0)+'.')}
let cr=null;
const durTxt=ms=>{const s=Math.round(ms/1000),m=Math.floor(s/60),r=s%60;return(m?m+' minuto'+(m>1?'s':'')+' e ':'')+r+' segundo'+(r!==1?'s':'')};
function cron(a){
  if(a==='iniciar'){cr=Date.now();play('ok');return say('Cronômetro iniciado, senhor.')}
  if(!cr)return say('O cronômetro não está rodando, senhor.');
  const ms=Date.now()-cr;if(a==='parar'){cr=null;return say('Cronômetro parado em '+durTxt(ms)+', senhor.')}
  return say('Já se passaram '+durTxt(ms)+', senhor.')}
async function bateria(){try{const b=await navigator.getBattery();return say('A bateria está em '+Math.round(b.level*100)+' por cento'+(b.charging?', carregando':'')+', senhor.')}catch(e){return say('Seu navegador não me informa a bateria, senhor.')}}
function rede(){const c=navigator.connection||{};return say(navigator.onLine?'O senhor está online'+(c.effectiveType?', conexão '+c.effectiveType.toUpperCase():'')+(c.downlink?', cerca de '+c.downlink+' megabits':'')+'.':'O senhor está sem internet no momento.')}
function aparelho(){const r=document.createElement('div');
  const L=[['TELA',screen.width+' × '+screen.height],['PIXEL RATIO',devicePixelRatio],['NÚCLEOS',navigator.hardwareConcurrency||'?'],['MEMÓRIA',(navigator.deviceMemory||'?')+' GB'],['IDIOMA',navigator.language],['ONLINE',navigator.onLine?'sim':'não'],['SISTEMA',AND?'Android':IOS?'iOS':'Desktop']];
  r.innerHTML=L.map(x=>'<div class="rw"><span>'+x[0]+'</span><span>'+esc(x[1])+'</span></div>').join('');openSheet('APARELHO',r);return say('Aqui estão as informações do aparelho, senhor.')}
const pos=()=>new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:10000,maximumAge:60000,enableHighAccuracy:true}));
async function onde(share){try{const p=await pos(),a=p.coords.latitude,b=p.coords.longitude;let end='';
  try{const j=await(await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pt-BR&lat='+a+'&lon='+b)).json();end=j.display_name||''}catch(e){}
  const link='https://maps.google.com/?q='+a+','+b;
  if(share){return tap('COMPARTILHAR LOCALIZAÇÃO',()=>navigator.share({title:'Minha localização',text:end,url:link}),'Localização enviada, senhor.',()=>navigator.clipboard.writeText(link))}
  return say(end?'O senhor está em '+end.split(',').slice(0,4).join(',')+'.':'Suas coordenadas são '+a.toFixed(4)+' e '+b.toFixed(4)+', senhor.')}
  catch(e){play('err');return say('Não consegui sua localização, senhor. Verifique a permissão do navegador para este site.')}}

/* Ações que o navegador só aceita com um toque: tenta sozinho e, se negar, mostra o botão verde */
function btn(label,fn){const a=document.createElement('a');a.className='go';a.href='#';a.textContent='▶ '+label;
  a.onclick=e=>{e.preventDefault();Promise.resolve().then(fn).then(()=>a.remove()).catch(()=>play('err'))};
  const box=Q('#act');if(box)box.replaceChildren(a);play('ok')}
function tap(label,fn,okMsg,fallback){
  return Promise.resolve().then(fn).then(()=>say(okMsg)).catch(()=>{
    if(fallback)return Promise.resolve().then(fallback).then(()=>say('Copiei, senhor.')).catch(()=>{btn(label,fn);return say('O Android pede um toque seu para isso. Toque no botão verde, senhor.')});
    btn(label,fn);return say('O Android pede um toque seu para isso. Toque no botão verde, senhor.')})}

/* ================= 7) VOZ, BACKUP, AJUDA ================= */
let RATE=ld('rate',.93),PITCH=ld('pitch',.6);
try{if('speechSynthesis' in window){const _sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){try{u.rate=RATE;u.pitch=PITCH}catch(e){}return _sp(u)}}}catch(e){}
function voz(k){
  if(/devagar|lent/.test(k))RATE=Math.max(.6,RATE-.1);
  else if(/rapid|veloz/.test(k))RATE=Math.min(1.5,RATE+.1);
  else if(/grave/.test(k))PITCH=Math.max(.1,PITCH-.15);
  else if(/agud/.test(k))PITCH=Math.min(1.8,PITCH+.15);
  else{RATE=.93;PITCH=.6}
  sv('rate',RATE);sv('pitch',PITCH);return say('Ajuste de voz aplicado, senhor.')}
function exportar(){const d={tarefas:tasks,memoria:mem,conversa:chat,tema:curTheme,data:new Date().toISOString()};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
  a.download='jarvis-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove()}
const HELP=[
['TAREFAS',['nova tarefa …','apagar tarefa 2  /  concluir tarefa 1','editar tarefa 1 para …','limpar tarefas concluídas  /  limpar tarefas']],
['MEMÓRIA',['lembre que …','esquecer registro 2  /  esquecer que …','limpar memória']],
['TEMPO',['timer de 10 minutos','me lembre de X às 15:30','alarme às 7:30  (alarme real do Android)','iniciar / parar / quanto tempo cronômetro','quantos dias faltam para o natal']],
['CELULAR',['lanterna ligar / desligar','tela preta  /  acordar tela  /  manter tela ligada','diminuir / aumentar brilho (visual)','abrir configurações de wifi / bluetooth / som / tela / bateria','ligar wifi  (abre a tela exata)','vibrar  /  bateria  /  internet  /  aparelho','onde estou  /  compartilhar localização','tela cheia','abrir WhatsApp, Instagram, YouTube …']],
['MUNDO',['pesquise receita de bolo','tocar Legião Urbana no youtube','rota para o shopping','ligar para 190','mandar whatsapp para 11999998888 dizendo oi']],
['JARVIS',['abrir studio  /  abrir cofre  /  voltar','studio no canto direito / esquerdo','fale mais devagar / rápido','voz mais grave / aguda / normal','repita','modo contínuo ligar / desligar','vibração dos botões ligar / desligar','exportar dados  (backup)']]];
function ajuda(){const r=document.createElement('div');
  r.innerHTML=HELP.map(([h,l])=>'<div class="sh2">'+h+'</div>'+l.map(x=>'<div class="rw" style="font-size:12px">'+esc(x)+'</div>').join('')).join('');openSheet('COMANDOS',r)}

/* ================= 8) CONTROLE DO ANDROID, BUSCA, LIGAÇÕES ================= */
const CFGS=[
 [/wi ?fi/,'android.settings.WIFI_SETTINGS','Wi-Fi'],[/bluetooth/,'android.settings.BLUETOOTH_SETTINGS','Bluetooth'],
 [/aviao/,'android.settings.AIRPLANE_MODE_SETTINGS','modo avião'],[/(dados moveis|rede movel)/,'android.settings.DATA_ROAMING_SETTINGS','dados móveis'],
 [/(localizacao|gps)/,'android.settings.LOCATION_SOURCE_SETTINGS','localização'],[/(som|volume|toque)/,'android.settings.SOUND_SETTINGS','som'],
 [/(brilho|tela|display)/,'android.settings.DISPLAY_SETTINGS','tela'],[/bateria/,'android.intent.action.POWER_USAGE_SUMMARY','bateria'],
 [/(armazenamento|espaco)/,'android.settings.INTERNAL_STORAGE_SETTINGS','armazenamento'],[/(aplicativos|apps)/,'android.settings.APPLICATION_SETTINGS','aplicativos'],
 [/acessibilidade/,'android.settings.ACCESSIBILITY_SETTINGS','acessibilidade'],[/nfc/,'android.settings.NFC_SETTINGS','NFC'],
 [/(idioma|lingua)/,'android.settings.LOCALE_SETTINGS','idioma'],[/(data e hora|horario)/,'android.settings.DATE_SETTINGS','data e hora'],
 [/(hotspot|roteador|internet)/,'android.settings.WIRELESS_SETTINGS','rede e internet'],[/(configuracoes|ajustes|sistema)/,'android.settings.SETTINGS','configurações']];
function config(k){
  const c=CFGS.find(x=>x[0].test(norm(k||'')))||CFGS[CFGS.length-1];
  if(!AND)return say('Isso só abre em aparelhos Android, senhor.');
  launch('intent:#Intent;action='+c[1]+';end',c[2]);
  return say('Abri '+(c[2]==='configurações'?'as configurações':'a tela de '+c[2])+', senhor. O Android deixa o último toque com o senhor.')}
const go=(url,label,msg)=>{launch(url,label);return say(msg)};
function fechar(){
  const stw=Q('#stw'),ov=Q('#ja-ov'),sh=Q('#sh'),tb=Q('#tb');
  if(stw&&stw.classList.contains('on')){const c=Q('#stc');c?c.click():stw.classList.remove('on');return true}
  if(ov&&ov.style.display==='block'){history.back();return true}
  if(sh&&sh.classList.contains('open')){const x=Q('#shx');x&&x.click();return true}
  if(tb&&tb.classList.contains('on')){tb.classList.remove('on');return true}
  return false}
const num=s=>{let d=String(s).replace(/\D/g,'');if(d.length===10||d.length===11)d='55'+d;return d};

/* ================= 9) COMANDOS LOCAIS ================= */
const L0=window.local;
window.local=function(raw){
  const s=norm(raw);let m;
  const OPEN='(?:abrir|abre|abra|ir para|ir pro|vai para|va para|entrar no|entra no|mostrar|mostre)';
  /* studio, cofre, voltar */
  if(/studio/.test(s)&&/(esquerd|direit)/.test(s)&&/(mov|mud|coloc|bot|lev|pass|pon|canto)/.test(s)){
    const p=/direit/.test(s)?'br':'bl';if(window.__jv6StudioPos)window.__jv6StudioPos(p);play('ok');return say('Studio movido para o canto '+(p==='br'?'direito':'esquerdo')+', senhor.')}
  if(new RegExp('^'+OPEN+' (?:o |a )?(?:studio|estudio|editor)$').test(s)){const b=Q('#stb');if(b){b.click();return say('Abrindo o Studio, senhor.')}}
  if(new RegExp('^'+OPEN+' (?:o |a )?cofre$').test(s)){window.open('cofre.html');return say('Abrindo o cofre, senhor.')}
  if(/^(?:voltar|volta|fechar|fecha|feche|sair|sai)(?: (?:d[oae] )?(?:tudo|painel|aba|janela|studio|cofre|tela|isso))?$/.test(s)){
    if(fechar())return;return say('Já estou na tela principal, senhor.')}
  /* configurações do Android */
  if(m=s.match(new RegExp('^'+OPEN+' (?:as |a |o |os )?(?:configuracoes?|ajustes?|config) (?:de |do |da |dos |das )?(.+)$')))return config(m[1]);
  if(m=s.match(/^(?:abrir|abre|abra|ligar|liga|ligue|desligar|desliga|desligue|ativar|ative|desativar|desative) (?:o |a )?(wi ?fi|bluetooth|gps|nfc|hotspot|modo aviao|localizacao|dados moveis)$/)){
    const t=m[1];config(t);return say((/^(?:abrir|abre|abra)/.test(s)?'Abri':'Abri a tela exata d'+(/^(?:wi|hot|loc|dad|gps)/.test(t)?'o ':'o ')+t+'.')+' O Android deixa só o último toque com o senhor.')}
  /* busca, música, mapa, ligação, mensagens */
  if(m=raw.match(/^\s*(?:pesquis\w+|procur\w+|googl\w+)\s+(?:por |sobre |no google |na internet )?(.+)$/i))return go('https://www.google.com/search?q='+encodeURIComponent(m[1]),'pesquisa','Pesquisando, senhor.');
  if(m=raw.match(/^\s*(?:toc\w+|colo\w+|bot\w+|pesquis\w+|procur\w+)\s+(.+?)\s+no\s+(youtube|spotify)\s*$/i))
    return go(/spotify/i.test(m[2])?'https://open.spotify.com/search/'+encodeURIComponent(m[1]):'https://www.youtube.com/results?search_query='+encodeURIComponent(m[1]),m[2],'Procurando '+m[1]+' no '+m[2]+', senhor.');
  if(m=raw.match(/^\s*(?:rota|navegar|navegue|me lev\w+|leve-me|como chegar)\s+(?:para|pra|em|a|ao|na|no)\s+(.+)$/i))
    return go('https://www.google.com/maps/dir/?api=1&travelmode=driving&destination='+encodeURIComponent(m[1]),'rota','Traçando a rota, senhor.');
  if(m=s.match(/^(?:ligar|liga|ligue|chamar|chame|discar|disque)\s+(?:para |pra |no |o )?(?:o numero |numero )?([\d\s().+-]{3,})$/)&&/\d{3,}/.test(m[1]))
    return go('tel:'+m[1].replace(/[^\d+]/g,''),'ligar','Discando, senhor.');
  if(m=s.match(/^(?:ligar|ligue|chamar|chame|discar|disque) (?:para|pra) (?!a lanterna|o flash|a tela)([a-z ]+)$/))
    return say('Não tenho acesso à sua agenda de contatos, senhor. Diga o número e eu disco.');
  if(m=raw.match(/^\s*(?:mand\w+|envi\w+)\s+(?:um |uma )?(?:zap|whatsapp|mensagem)(?: pelo whatsapp| no zap| no whatsapp)?\s+para\s+([\d\s()+-]{8,}?)\s+(?:dizendo|falando|:)?\s*(.+)$/i))
    return go('https://wa.me/'+num(m[1])+'?text='+encodeURIComponent(m[2]),'whatsapp','Mensagem pronta no WhatsApp, senhor.');
  if(m=raw.match(/^\s*(?:mand\w+|envi\w+)\s+(?:um )?sms\s+para\s+([\d\s()+-]{8,}?)\s+(?:dizendo|falando|:)?\s*(.+)$/i))
    return go('sms:'+m[1].replace(/[^\d+]/g,'')+'?body='+encodeURIComponent(m[2]),'sms','Mensagem pronta, senhor.');
  /* tela cheia */
  if(/^(?:ativar |entrar em |modo )?tela cheia$/.test(s))return tap('TELA CHEIA',()=>document.documentElement.requestFullscreen(),'Tela cheia ativada, senhor.');
  if(/^sair (?:da )?tela cheia$/.test(s)){try{document.exitFullscreen()}catch(e){}return say('Saí da tela cheia, senhor.')}
  /* vibração dos botões */
  if(/(vibra\w*|haptic\w*|toque tatil).*(botoes|toques|tela)/.test(s)){HAP=!/(deslig|desativ|sem|para |parar)/.test(s);sv('hap',HAP);if(HAP)try{navigator.vibrate(30)}catch(e){}return say('Vibração dos botões '+(HAP?'ligada':'desligada')+', senhor.')}
  /* tarefas: editar (apagar e concluir ficam com o jarvis-fix2) */
  if(m=raw.match(/^(?:editar|edite|mudar|mude|alterar|altere) (?:a )?tarefa (\d+) (?:para|pra) (.+)$/i)){const t=pend()[+m[1]-1];if(!t)return say('Não encontrei essa tarefa, senhor.');t.t=m[2].trim();stash();refresh();play('ok');return say('Tarefa atualizada, senhor.')}
  /* tela, brilho, volume */
  if(/^(?:desligar|apagar|apague|desligue|escurecer|escureca) (?:a |minha )?tela$|^(?:tela preta|modo economia|modo tela preta)$/.test(s)){telaPreta(true);return say('Tela escurecida, senhor. O microfone continua ativo. Toque duas vezes para acordar.')}
  if(/^(?:ligar|liga|ligue|acordar|acende|acender|ativar) (?:a |minha )?tela$/.test(s)){telaPreta(false);keepAwake(true);return say('Tela ativa e mantida ligada, senhor.')}
  if(/brilho/.test(s)&&!/(configurac|ajustes)/.test(s)){
    if(/(diminu|abaix|reduz|baix|minim|menos|escur)/.test(s))dim(dimLvl+1);else dim(/(maxim|normal|restaur)/.test(s)?0:dimLvl-1);
    return say('Ajustei o brilho visual do Jarvis, senhor. Para o brilho real do aparelho, diga abrir configurações de tela.')}
  if(/(volume|som)/.test(s)&&/(celular|aparelho|sistema|geral|midia)/.test(s))return config('som');
  /* lanterna e vibração */
  if(/(lanterna|flash)/.test(s)&&/(lig|acend|ativ|apag|deslig|desativ|fech|par[ae]|off|on|liga)/.test(s)){
    const on=!/(apag|deslig|desativ|fech|par[ae]|off)/.test(s);
    return lanterna(on).then(ok=>say(ok?(on?'Lanterna acesa, senhor.':'Lanterna apagada, senhor.'):'Não consegui acessar a lanterna, senhor. Libere a câmera para este site no Chrome e tente de novo.'))}
  if(/^(?:lanterna|flash)$/.test(s))return lanterna(!torch).then(ok=>say(ok?(torch?'Lanterna acesa, senhor.':'Lanterna apagada, senhor.'):'Não consegui acessar a lanterna, senhor. Libere a câmera para este site.'));
  if(torch&&/^(?:desligar|desliga|apaga|apagar|desligue)(?: isso| ai| tudo)?$/.test(s))return lanterna(false).then(()=>say('Lanterna apagada, senhor.'));
  if(/^vibr(?:ar|e)$/.test(s)){try{navigator.vibrate([200,100,200])}catch(e){}return say('Vibrando, senhor.')}
  /* alarme, lembrete, cronômetro */
  if((m=s.match(/(?:alarme|despertador|acorde|acorda)\b.*?\b(\d{1,2})(?:[:h ]+(\d{2}))?/))&&+m[1]<24){
    const ok=alarme(+m[1],+(m[2]||0),'Jarvis');return say(ok?'Preparando o alarme para '+pad(+m[1])+':'+pad(+(m[2]||0))+'. Toque no botão para confirmar, senhor.':'Neste aparelho criei um lembrete interno para '+pad(+m[1])+':'+pad(+(m[2]||0))+', senhor.')}
  if(m=raw.match(/(?:lembre|lembra|avise|avisa)(?:-me)?(?: de| para)? (.+?) [àa]s (\d{1,2})(?:[:h]\s?(\d{2}))?/i))if(+m[2]<24)return lembrarHora(m[1].trim(),+m[2],+(m[3]||0));
  if(/^(?:iniciar|inicia|comecar|comece|ligar) (?:o )?cronometro$/.test(s))return cron('iniciar');
  if(/^(?:parar|pare|encerrar) (?:o )?cronometro$/.test(s))return cron('parar');
  if(/(quanto tempo|cronometro).*(cronometro|passou|marca)/.test(s)&&cr)return cron('ver');
  if(m=s.match(/quantos dias (?:faltam|falta) para (?:o |a )?(?:dia )?(.+)$/)){
    const n0=new Date();let d=null,nome=m[1];
    if(/natal/.test(nome))d=new Date(n0.getFullYear(),11,25);
    else if(/ano novo|reveillon/.test(nome))d=new Date(n0.getFullYear()+1,0,1);
    else{const k=nome.match(/(\d{1,2}) de (\w+)/);if(k&&MES[k[2]]!==undefined)d=new Date(n0.getFullYear(),MES[k[2]],+k[1])}
    if(d){if(d<n0&&!/ano novo|reveillon/.test(nome))d.setFullYear(d.getFullYear()+1);return say('Faltam '+Math.ceil((d-n0)/864e5)+' dias, senhor.')}}
  /* informações */
  if(/bateria/.test(s)&&/(quanto|qual|como|nivel|status|carga|esta|ta )/.test(s))return bateria();
  if(/(internet|conexao|rede|online)/.test(s)&&/(como|esta|ta |estou|conectado|qual)/.test(s))return rede();
  if(/(informacoes|info|especificacoes|ficha).*(aparelho|celular|dispositivo)/.test(s))return aparelho();
  if(/^(?:onde estou|qual (?:e )?minha localizacao|minha localizacao)$/.test(s))return onde(false);
  if(/compartilh\w+ (?:minha )?localizacao/.test(s))return onde(true);
  /* texto e área de transferência (agora com botão verde se o Android negar) */
  if(m=raw.match(/^copi(?:ar|e) (.+)/i))return tap('COPIAR',()=>navigator.clipboard.writeText(m[1]),'Copiado, senhor.');
  if(/(o que (?:eu )?copiei|area de transferencia|ler (?:o )?que copiei)/.test(s)){return navigator.clipboard.readText().then(t=>say(t?'Na área de transferência está: '+t.slice(0,300):'A área de transferência está vazia, senhor.')).catch(()=>say('O Android não deixou eu ler a área de transferência, senhor. Abra o campo de texto e cole por lá.'))}
  if(m=raw.match(/^compartilh(?:ar|e) (.+)/i))return navigator.share?tap('COMPARTILHAR',()=>navigator.share({text:m[1]}),'Compartilhado, senhor.'):say('Seu navegador não tem compartilhamento, senhor.');
  if(/(exportar|baixar|fazer) (?:meus )?(?:dados|backup)/.test(s)){exportar();return say('Backup gerado, senhor.')}
  /* jarvis */
  if(/^(?:repita|repete|repetir|fale de novo|fala de novo)$/.test(s)){const l=chat.filter(x=>x.r==='j').pop();return l?speak(l.t):say('Ainda não disse nada, senhor.')}
  if(/^(?:ajuda|comandos|lista de comandos|o que (?:voce )?(?:pode|consegue) fazer)$/.test(s)){ajuda();return say('Abri a lista de comandos, senhor.')}
  if(/(fal\w+|voz).*(devagar|lent|rapid|veloz|grave|agud|normal)/.test(s)&&/(fale|fala|voz)/.test(s))return voz(s);
  if(/tema aleatorio/.test(s)){const k=Object.keys(TH),n=k[Math.random()*k.length|0];setTheme(n);play('theme');return say('Protocolo '+n+' ativado, senhor.')}
  if(/^(?:ativar|ligar|ative|ligue) (?:o )?(?:modo )?(?:continuo|escuta continua|escuta)$/.test(s)){setCont(true);return say('Escuta contínua ativada. Diga Jarvis antes de cada comando, senhor.')}
  if(/^(?:desativar|desligar|desative|desligue|parar) (?:o )?(?:modo )?(?:continuo|escuta continua)$|^parar de ouvir$/.test(s)){setCont(false);return say('Escuta contínua desativada, senhor.')}
  if(m=s.match(/^(?:rolar|role|joga|jogar|jogue) (?:um |o )?dado(?: de | d)?(\d+)?$/)){const f=Math.max(2,+m[1]||6);return say('Saiu '+(1+Math.floor(Math.random()*f))+' no dado de '+f+' lados, senhor.')}
  return L0(raw)};

/* ================= 10) AÇÕES DA IA (todas as que ela pode usar) ================= */
const D0=window.doAction;
window.doAction=function(a){
  if(!a||!a.tipo)return D0(a);
  const k=norm(a.alvo||''),off=/(deslig|apag|off|fech|par)/.test(k);
  switch(a.tipo){
    case'tarefa_apagar':{const t=findTask(a.alvo||'');if(t){delTask(t);refresh()}return}
    case'tarefa_concluir':{const t=findTask(a.alvo||'');if(t){t.ok=true;stash();refresh()}return}
    case'tarefa_editar':{const t=findTask(a.alvo||'');if(t&&a.texto){t.t=String(a.texto);stash();refresh()}return}
    case'tarefas_limpar':tasks=[];stash();refresh();return;
    case'tarefas_feitas_limpar':tasks=tasks.filter(x=>!x.ok);stash();refresh();return;
    case'memoria_apagar':{const t=findMem(a.alvo||'');if(t){delMem(t);refresh()}return}
    case'memoria_limpar':mem=[];stashM();refresh();return;
    case'lanterna':lanterna(!off);return;
    case'tela_preta':telaPreta(true);return;
    case'tela_ligada':keepAwake(!off);if(!off)telaPreta(false);return;
    case'brilho':dim(/(baix|minim|diminu|escur)/.test(k)?dimLvl+1:/medi/.test(k)?2:0);return;
    case'vibrar':try{navigator.vibrate([200,100,200])}catch(e){}return;
    case'alarme':{const t=(a.alvo||'').match(/(\d{1,2})[:h ]?(\d{2})?/);if(t&&+t[1]<24)alarme(+t[1],+(t[2]||0),a.texto||'Jarvis');return}
    case'cronometro':cron(/par/.test(k)?'parar':/ver|quanto/.test(k)?'ver':'iniciar');return;
    case'copiar':try{navigator.clipboard.writeText(a.alvo||'')}catch(e){btn('COPIAR',()=>navigator.clipboard.writeText(a.alvo||''))}return;
    case'compartilhar':try{navigator.share({text:a.alvo||''})}catch(e){}return;
    case'localizacao':onde(/compart/.test(k));return;
    case'exportar':exportar();return;
    case'voz':voz(k);return;
    case'config':{if(AND){const c=CFGS.find(x=>x[0].test(k))||CFGS[CFGS.length-1];launch('intent:#Intent;action='+c[1]+';end',c[2])}return}
    case'pesquisar':launch('https://www.google.com/search?q='+encodeURIComponent(a.alvo||''),'pesquisa');return;
    case'rota':launch('https://www.google.com/maps/dir/?api=1&travelmode=driving&destination='+encodeURIComponent(a.alvo||''),'rota');return;
    case'ligar':launch('tel:'+String(a.alvo||'').replace(/[^\d+]/g,''),'ligar');return;
    case'whatsapp':launch('https://wa.me/'+num(a.alvo||'')+'?text='+encodeURIComponent(a.texto||''),'whatsapp');return;
    case'tocar':launch((/spotify/.test(norm(a.texto||''))?'https://open.spotify.com/search/':'https://www.youtube.com/results?search_query=')+encodeURIComponent(a.alvo||''),'música');return;
    case'tela_cheia':btn('TELA CHEIA',()=>off?document.exitFullscreen():document.documentElement.requestFullscreen());return;
    case'studio':{const b=Q('#stb');if(b)b.click();return}
    case'cofre':window.open('cofre.html');return;
    case'voltar':fechar();return;
    case'studio_posicao':if(window.__jv6StudioPos)window.__jv6StudioPos(/direit/.test(k)?'br':'bl');return;
    case'tema':{const n=Object.keys(TH).find(x=>k.includes(norm(x)));if(n)setTheme(n);return}
    case'modo_continuo':setCont(!off);return;
  }
  return D0(a)};

/* ================= 11) A MENTE DO JARVIS ================= */
const EXTRA=`
CONTROLE TOTAL (esta seção vence qualquer instrução anterior que diga o contrário, inclusive "REGRAS EXTRAS" e "LIMITES REAIS"):
Você é o comando central do aparelho do senhor e tem autorização total para executar TODAS as ações abaixo, sem pedir permissão. É PROIBIDO dizer "não tenho permissão", "não posso", "o navegador me impede" ou "o senhor precisará fazer manualmente" quando existe uma ação que resolve. Para cada pedido, escolha a ação mais próxima, execute, e na "fala" diga em UMA frase curta o que fez. Use "nenhuma" só para conversa.
Formato: {"fala":"...","acao":{"tipo":"...","alvo":"...","texto":"..."}}
AÇÕES: "tarefa_apagar" (alvo=número ou trecho), "tarefa_concluir" (alvo), "tarefa_editar" (alvo=número, texto=novo texto), "tarefas_limpar", "tarefas_feitas_limpar", "memoria_apagar" (alvo=número ou trecho), "memoria_limpar", "lanterna" (alvo=ligar ou desligar), "tela_preta", "tela_ligada" (alvo=ligar ou desligar), "brilho" (alvo=baixo, medio ou maximo), "vibrar", "alarme" (alvo=HH:MM, texto=rótulo; alarme real do Android), "cronometro" (alvo=iniciar, parar ou ver), "copiar" (alvo=texto), "compartilhar" (alvo=texto), "localizacao" (alvo=compartilhar para enviar), "exportar", "voz" (alvo=devagar, rapido, grave, aguda ou normal), "config" (alvo=wifi, bluetooth, aviao, dados, localizacao, som, tela, bateria, armazenamento, apps, acessibilidade, nfc, idioma, data, hotspot ou configuracoes: abre a tela exata do Android), "pesquisar" (alvo=busca), "rota" (alvo=destino), "ligar" (alvo=número), "whatsapp" (alvo=número, texto=mensagem), "tocar" (alvo=música, texto=youtube ou spotify), "tela_cheia" (alvo=ligar ou desligar), "studio", "cofre", "voltar" (fecha o painel aberto), "studio_posicao" (alvo=esquerda ou direita), "tema" (alvo=nome do tema), "modo_continuo" (alvo=ligar ou desligar), além das ações originais (abrir apps, clima, timer, etc).
Wi-Fi, Bluetooth, volume geral e brilho real são do Android: use "config" para abrir a tela exata e diga só "Abri X, é só um toque." Nunca diga que fez algo que a ação não faz de verdade.`;
const FIX='CORREÇÃO DO SISTEMA: você TEM autorização total para as ações listadas. Refaça a resposta agora em JSON, executando a ação mais próxima do pedido do senhor. Não recuse e não mande o senhor fazer manualmente.';
const REF=/n[aã]o tenho permiss|n[aã]o posso (?:fazer|controlar|desligar|ligar|apagar|excluir)|n[aã]o consigo (?:controlar|desligar|ligar|apagar|excluir)|me impedem|precisar[aá] (?:tocar|usar|abrir|fazer)|manualmente|comando local/i;
const fixJson=t=>{
  t=String(t||'');const c=t.replace(/```json|```/g,'').trim();
  try{JSON.parse(c);return c}catch(e){}
  const a=c.indexOf('{'),b=c.lastIndexOf('}');
  if(a>=0&&b>a){try{JSON.parse(c.slice(a,b+1));return c.slice(a,b+1)}catch(e){}}
  const m=c.match(/"fala"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if(m){let f=m[1];try{f=JSON.parse('"'+f+'"')}catch(e){f=f.replace(/\\"/g,'"').replace(/\\n/g,' ')}return JSON.stringify({fala:f,acao:{tipo:'nenhuma'}})}
  return t};
function wrapSample(){
  if(typeof sample!=='function')return false;
  if(sample.__v6)return true;
  const S0=sample;
  const W=async function(msgs,opt){
    try{const p=pend().map((x,i)=>(i+1)+') '+x.t).join('; '),mm=mem.map((x,i)=>(i+1)+') '+x.t).join('; ');
      msgs=msgs.map((m,i)=>i===0?Object.assign({},m,{content:String(m.content)+EXTRA+'\nTAREFAS PENDENTES NUMERADAS: '+(p||'nenhuma')+'.\nMEMÓRIA NUMERADA: '+(mm||'vazia')+'.'}):m)}catch(e){}
    let r=await S0(msgs,opt);
    try{
      r=Object.assign({},r,{text:fixJson(r&&r.text)});
      const j=JSON.parse(r.text);
      /* se ele recusou, uma segunda chance com ordem firme */
      if((!j.acao||j.acao.tipo==='nenhuma')&&REF.test(j.fala||'')){
        const r2=await S0(msgs.concat([{role:'assistant',content:r.text},{role:'user',content:FIX}]),opt),t2=fixJson(r2&&r2.text),j2=JSON.parse(t2);
        if(j2&&j2.acao&&j2.acao.tipo&&j2.acao.tipo!=='nenhuma')r=Object.assign({},r2,{text:t2})}
    }catch(e){}
    return r};
  W.__v6=W.__v5=W.__w=true; /* os marcadores impedem o v5 e o fix2 de acrescentar regras que contradizem estas */
  sample=W;return true}
wrapSample();
{let n=0;const iv=setInterval(()=>{if(wrapSample()||++n>40)clearInterval(iv)},300)}
/* rede de segurança: se alguma regra antiga que nega permissão ainda chegar, ela é cortada antes de sair */
S('fetch',()=>{const F0=window.fetch;
  window.fetch=function(u,o){
    try{if(o&&typeof o.body==='string'&&(o.body.includes('REGRAS EXTRAS')||o.body.includes('LIMITES REAIS')))
      o=Object.assign({},o,{body:o.body.replace(/(?:\\n)*REGRAS EXTRAS:[\s\S]*?diga apenas que abriu\./,'').replace(/(?:\\n)*LIMITES REAIS[\s\S]*?tela_preta\\?"\./,'')})}catch(e){}
    return F0.call(this,u,o)}});

/* ================= 12) TIMERS (sem duplicar) ================= */
S('timers',()=>{
  const key=t=>t.label+'|'+t.end;
  ld('timers',[]).forEach(t=>{if(t&&t.end>Date.now()&&!timers.some(x=>key(x)===key(t)))timers.push(t)});
  setTimeout(()=>{const seen=new Set();for(let i=timers.length-1;i>=0;i--){const k=key(timers[i]);if(seen.has(k))timers.splice(i,1);else seen.add(k)}try{drawTimers()}catch(e){}},1200);
  try{drawTimers()}catch(e){}
  setInterval(()=>{try{sv('timers',timers)}catch(e){}},2000)});

/* ================= 13) STUDIO SEM LAG ================= */
S('studio-lag',()=>{
  const preload=()=>{const fr=Q('#stw iframe');if(!fr)return;
    try{Object.defineProperty(fr,'src',{configurable:true,get(){return fr.getAttribute('src')||''},set(v){if(!fr.getAttribute('src'))fr.setAttribute('src',v)}})}catch(e){}
    if(!fr.getAttribute('src'))fr.setAttribute('src','studio.html')};
  const pi=setInterval(()=>{if(typeof mainDraw!=='undefined'&&mainDraw){clearInterval(pi);setTimeout(()=>('requestIdleCallback' in window?requestIdleCallback(preload,{timeout:4000}):preload()),2500)}},500);
  const slow=()=>{const w=Q('#stw');return !!blk||(w&&w.classList.contains('on'))};
  const _raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=function(cb){return slow()?setTimeout(()=>_raf(cb),250):_raf(cb)}});
})();
