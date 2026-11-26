/* J.A.R.V.I.S V6 — SUBSTITUI o jarvis-v5.js (já contém tudo do V5 + os ajustes novos).
   Mantenha no index.html a mesma linha de sempre, carregada POR ÚLTIMO:
   <script src="jarvis-v5.js"></script>   (cole este conteúdo dentro do jarvis-v5.js)        */
(()=>{
const S=q=>document.querySelector(q);
const pad=n=>String(n).padStart(2,'0');
const WN={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
const N=x=>/^\d+$/.test(x)?+x:(WN[x]===undefined?NaN:WN[x]);
const MES={janeiro:0,fevereiro:1,marco:2,abril:3,maio:4,junho:5,julho:6,agosto:7,setembro:8,outubro:9,novembro:10,dezembro:11};
const stash=()=>sv('tasks',tasks), stashM=()=>sv('mem',mem);

/* ================= TAREFAS E MEMÓRIA (controle total) ================= */
const pend=()=>tasks.filter(x=>!x.ok);
function findTask(q,done){q=norm(q).replace(/^(?:a |o |numero |n )/,'').trim();const n=N(q),base=done?tasks.filter(x=>x.ok):pend();
  if(!isNaN(n))return base[n-1];return base.find(x=>norm(x.t).includes(q))||tasks.find(x=>norm(x.t).includes(q))}
function findMem(q){q=norm(q).replace(/^(?:a |o |numero )/,'').trim();const n=N(q);if(!isNaN(n))return mem[n-1];return mem.find(x=>norm(x.t).includes(q))}
const delTask=t=>{tasks=tasks.filter(x=>x!==t);stash()};
const delMem=t=>{mem=mem.filter(x=>x!==t);stashM()};

/* ================= TELA PRETA / BRILHO / WAKE LOCK ================= */
let blk=null,wantWL=false,dimLvl=0;
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

/* ================= LANTERNA ================= */
let torch=null;
async function lanterna(on){
  try{if(!on){if(torch){torch.getTracks().forEach(t=>t.stop());torch=null}return true}
    if(torch)return true;
    const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});
    const tr=st.getVideoTracks()[0],cap=tr.getCapabilities?tr.getCapabilities():{};
    if(!cap.torch){st.getTracks().forEach(t=>t.stop());return false}
    await tr.applyConstraints({advanced:[{torch:true}]});torch=st;return true}catch(e){return false}}

/* ================= ALARME DO ANDROID / LEMBRETE POR HORÁRIO ================= */
function alarme(h,mi,msg){
  if(!AND){addTimer(Math.max(1,Math.round(((()=>{const d=new Date();d.setHours(h,mi,0,0);if(d<=Date.now())d.setDate(d.getDate()+1);return d-Date.now()})())/1000)),msg||'Alarme',true);return false}
  launch('intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR='+h+';i.android.intent.extra.alarm.MINUTES='+mi+';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(msg||'Jarvis')+';B.android.intent.extra.alarm.SKIP_UI=true;end','alarme '+pad(h)+':'+pad(mi));return true}
function lembrarHora(label,h,mi){const d=new Date();d.setHours(h,mi||0,0,0);if(d<=Date.now())d.setDate(d.getDate()+1);
  addTimer(Math.round((d-Date.now())/1000),label,true);play('ok');
  return say('Combinado, senhor. Avisarei sobre '+label+' às '+pad(h)+':'+pad(mi||0)+'.')}

/* ================= CRONÔMETRO ================= */
let cr=null;
const durTxt=ms=>{const s=Math.round(ms/1000),m=Math.floor(s/60),r=s%60;return(m?m+' minuto'+(m>1?'s':'')+' e ':'')+r+' segundo'+(r!==1?'s':'')};
function cron(a){
  if(a==='iniciar'){cr=Date.now();play('ok');return say('Cronômetro iniciado, senhor.')}
  if(!cr)return say('O cronômetro não está rodando, senhor.');
  const ms=Date.now()-cr;if(a==='parar'){cr=null;return say('Cronômetro parado em '+durTxt(ms)+', senhor.')}
  return say('Já se passaram '+durTxt(ms)+', senhor.')}

/* ================= INFORMAÇÕES DO APARELHO ================= */
async function bateria(){try{const b=await navigator.getBattery();return say('A bateria está em '+Math.round(b.level*100)+' por cento'+(b.charging?', carregando':'')+', senhor.')}catch(e){return say('Seu navegador não me informa a bateria, senhor.')}}
function rede(){const c=navigator.connection||{};return say(navigator.onLine?'O senhor está online'+(c.effectiveType?', conexão '+c.effectiveType.toUpperCase():'')+(c.downlink?', cerca de '+c.downlink+' megabits':'')+'.':'O senhor está sem internet no momento.')}
function aparelho(){const r=document.createElement('div');
  const L=[['TELA',screen.width+' × '+screen.height],['PIXEL RATIO',devicePixelRatio],['NÚCLEOS',navigator.hardwareConcurrency||'?'],['MEMÓRIA',(navigator.deviceMemory||'?')+' GB'],['IDIOMA',navigator.language],['ONLINE',navigator.onLine?'sim':'não'],['SISTEMA',AND?'Android':IOS?'iOS':'Desktop']];
  r.innerHTML=L.map(x=>'<div class="rw"><span>'+x[0]+'</span><span>'+esc(x[1])+'</span></div>').join('');openSheet('APARELHO',r);return say('Aqui estão as informações do aparelho, senhor.')}
const pos=()=>new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:10000,maximumAge:60000,enableHighAccuracy:true}));
async function onde(share){try{const p=await pos(),a=p.coords.latitude,b=p.coords.longitude;let end='';
  try{const j=await(await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pt-BR&lat='+a+'&lon='+b)).json();end=j.display_name||''}catch(e){}
  const link='https://maps.google.com/?q='+a+','+b;
  if(share){try{await navigator.share({title:'Minha localização',text:end,url:link});return say('Localização enviada, senhor.')}catch(e){try{await navigator.clipboard.writeText(link)}catch(x){}return say('Copiei o link da sua localização, senhor.')}}
  return say(end?'O senhor está em '+end.split(',').slice(0,4).join(',')+'.':'Suas coordenadas são '+a.toFixed(4)+' e '+b.toFixed(4)+', senhor.')}
  catch(e){play('err');return say('Não consegui sua localização, senhor. Verifique a permissão.')}}

/* ================= VOZ (velocidade e tom) ================= */
let RATE=ld('rate',.93),PITCH=ld('pitch',.6);
try{if('speechSynthesis' in window){const _sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){try{u.rate=RATE;u.pitch=PITCH}catch(e){}return _sp(u)}}}catch(e){}
function voz(k){
  if(/devagar|lent/.test(k))RATE=Math.max(.6,RATE-.1);
  else if(/rapid|veloz/.test(k))RATE=Math.min(1.5,RATE+.1);
  else if(/grave/.test(k))PITCH=Math.max(.1,PITCH-.15);
  else if(/agud/.test(k))PITCH=Math.min(1.8,PITCH+.15);
  else{RATE=.93;PITCH=.6}
  sv('rate',RATE);sv('pitch',PITCH);return say('Ajuste de voz aplicado, senhor.')}

/* ================= BACKUP ================= */
function exportar(){const d={tarefas:tasks,memoria:mem,conversa:chat,tema:curTheme,data:new Date().toISOString()};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
  a.download='jarvis-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove()}

/* ================= AJUDA ================= */
const HELP=[
['TAREFAS',['nova tarefa …','apagar tarefa 2  /  apagar tarefa comprar pão','concluir tarefa 1  /  desmarcar tarefa 1','editar tarefa 1 para …','limpar tarefas concluídas  /  limpar tarefas']],
['MEMÓRIA',['lembre que …','esquecer registro 2  /  esquecer que …','limpar memória']],
['TEMPO',['timer de 10 minutos','me lembre de X em 10 minutos','me lembre de X às 15:30','alarme às 7:30  (alarme real do Android)','iniciar / parar / quanto tempo cronômetro','quantos dias faltam para o natal']],
['CELULAR',['lanterna ligar / desligar','tela preta  (some a tela, microfone segue)','acordar tela  /  manter tela ligada','diminuir / aumentar brilho (visual)','volume do celular  (abre as configurações)','vibrar  /  bateria  /  internet  /  aparelho','onde estou  /  compartilhar localização','abrir WhatsApp, Instagram, YouTube …']],
['TEXTO',['copiar …  /  o que eu copiei','compartilhar …','exportar dados  (backup)']],
['JARVIS',['fale mais devagar / rápido','voz mais grave / aguda / normal','repita','modo contínuo ligar / desligar','modo cinema  /  tema aleatório','rolar dado d20  /  cara ou coroa']]];
function ajuda(){const r=document.createElement('div');
  r.innerHTML=HELP.map(([h,l])=>'<div class="sh2">'+h+'</div>'+l.map(x=>'<div class="rw" style="font-size:12px">'+esc(x)+'</div>').join('')).join('');openSheet('COMANDOS',r)}

/* ================= COMANDOS LOCAIS ================= */
const L0=window.local;
window.local=function(raw){
  const s=norm(raw);let m;
  const V='(?:apagar|apague|apaga|remover|remova|remove|cancelar|cancele|cancela|excluir|exclua|deletar|delete|tirar|tire|limpar|limpe)';
  /* tarefas */
  if(new RegExp('^'+V+' (?:todas )?(?:as )?tarefas (?:concluidas|feitas|finalizadas|prontas)$').test(s)){const n=tasks.filter(x=>x.ok).length;tasks=tasks.filter(x=>!x.ok);stash();play('ok');return say(n?'Removi '+n+' tarefa'+(n>1?'s concluídas':' concluída')+', senhor.':'Não há tarefas concluídas, senhor.')}
  if(new RegExp('^'+V+' (?:todas |tudo )?(?:as )?tarefas$').test(s)){const n=tasks.length;tasks=[];stash();play('ok');return say(n?'Lista limpa. Removi '+n+' tarefa'+(n>1?'s':'')+', senhor.':'A lista já estava vazia, senhor.')}
  if(m=s.match(new RegExp('^'+V+' (?:a |o )?tarefas? (.+)$'))){const t=findTask(m[1]);if(!t)return say('Não encontrei essa tarefa, senhor. Diga o número ou parte do nome.');delTask(t);play('ok');return say('Tarefa "'+t.t+'" removida, senhor.')}
  if(m=s.match(/^(?:concluir|conclua|conclui|finalizar|finalize|marcar|marque|completar|complete) (?:a )?tarefas? (.+)$/)){const t=findTask(m[1].replace(/ como (?:feita|concluida|pronta|finalizada)$/,''));if(!t)return say('Não encontrei essa tarefa, senhor.');t.ok=true;stash();play('ok');return say('Tarefa concluída, senhor.')}
  if(m=s.match(/^(?:desmarcar|desmarque|reabrir|reabra) (?:a )?tarefas? (.+)$/)){const t=findTask(m[1],true);if(!t)return say('Não encontrei essa tarefa, senhor.');t.ok=false;stash();play('ok');return say('Tarefa reaberta, senhor.')}
  if(m=raw.match(/^(?:editar|edite|mudar|mude|alterar|altere) (?:a )?tarefa (\d+) (?:para|pra) (.+)$/i)){const t=pend()[+m[1]-1];if(!t)return say('Não encontrei essa tarefa, senhor.');t.t=m[2].trim();stash();play('ok');return say('Tarefa atualizada, senhor.')}
  /* memória */
  if(/^(?:limpar|apagar|apague|esqueca|esquecer|zerar) (?:toda |a |minha )?memoria$/.test(s)){const n=mem.length;mem=[];stashM();play('ok');return say(n?'Memória apagada. Esqueci '+n+' registro'+(n>1?'s':'')+', senhor.':'A memória já estava vazia, senhor.')}
  if(m=s.match(/^(?:esqueca|esquecer|apagar|apague|remover|remova) (?:da memoria )?(?:o |a )?(?:registro|memoria|item) (?:numero )?(.+)$/)){const t=findMem(m[1]);if(!t)return say('Não encontrei esse registro, senhor.');delMem(t);play('ok');return say('Esqueci, senhor.')}
  if((m=s.match(/^(?:esqueca|esquecer) (?:que |de |do |da )?(.+)$/))&&!/^(?:conversa|tudo|a conversa)$/.test(m[1])){const t=findMem(m[1]);if(!t)return say('Não encontrei isso na memória, senhor.');delMem(t);play('ok');return say('Esqueci, senhor.')}
  /* tela, brilho, volume */
  if(/^(?:desligar|apagar|apague|desligue|escurecer|escureca) (?:a |minha )?tela$|^(?:tela preta|modo economia|modo tela preta)$/.test(s)){telaPreta(true);return say('Tela escurecida, senhor. O microfone continua ativo. Toque duas vezes para acordar.')}
  if(/^(?:ligar|liga|ligue|acordar|acende|acender|ativar) (?:a |minha )?tela$/.test(s)){telaPreta(false);keepAwake(true);return say('Tela ativa e mantida ligada, senhor.')}
  if(/brilho/.test(s)){
    if(/(diminu|abaix|reduz|baix|minim|menos|escur)/.test(s))dim(dimLvl+1);else dim(/(maxim|normal|restaur)/.test(s)?0:dimLvl-1);
    return say('Ajustei o brilho visual do Jarvis, senhor. O brilho real do aparelho só responde ao painel do sistema.')}
  if(/(volume|som)/.test(s)&&/(celular|aparelho|sistema|geral|midia)/.test(s)){
    if(AND)launch(intent(CFG.som),'som');return say('O navegador não me dá controle do volume do aparelho, senhor. Abri o painel de som para o senhor ajustar.')}
  /* lanterna, vibração */
  if(m=s.match(/^(ligar|liga|ligue|acender|acenda|ativar|ative|apagar|apague|desligar|desligue|desativar|desative) (?:a |o )?(?:lanterna|flash)$/)){
    const on=/^(?:lig|acend|ativ)/.test(m[1]);return lanterna(on).then(ok=>say(ok?(on?'Lanterna acesa, senhor.':'Lanterna apagada, senhor.'):'Não consegui acessar a lanterna, senhor. Libere a câmera no navegador, ou ela não é suportada neste aparelho.'))}
  if(/^vibr(?:ar|e)$/.test(s)){try{navigator.vibrate([200,100,200])}catch(e){}return say('Vibrando, senhor.')}
  /* alarme, lembrete por horário, cronômetro */
  if((m=s.match(/(?:alarme|despertador|acorde|acorda)\b.*?\b(\d{1,2})(?:[:h ]+(\d{2}))?/))&&+m[1]<24){
    const ok=alarme(+m[1],+(m[2]||0),'Jarvis');return say(ok?'Preparando o alarme para '+pad(+m[1])+':'+pad(+(m[2]||0))+'. Toque no botão para confirmar, senhor.':'Neste aparelho criei um lembrete interno para '+pad(+m[1])+':'+pad(+(m[2]||0))+', senhor.')}
  if(m=raw.match(/(?:lembre|lembra|avise|avisa)(?:-me)?(?: de| para)? (.+?) [àa]s (\d{1,2})(?:[:h]\s?(\d{2}))?/i))if(+m[2]<24)return lembrarHora(m[1].trim(),+m[2],+(m[3]||0));
  if(/^(?:iniciar|inicia|comecar|comece|ligar) (?:o )?cronometro$/.test(s))return cron('iniciar');
  if(/^(?:parar|pare|encerrar) (?:o )?cronometro$/.test(s))return cron('parar');
  if(/(quanto tempo|cronometro).*(cronometro|passou|marca)/.test(s)&&cr)return cron('ver');
  if(/(quanto falta|quais timers|meus timers|meus temporizadores)/.test(s)){return say(timers.length?timers.map(t=>(t.label)+' faltam '+durTxt(t.end-Date.now())).join('. ')+', senhor.':'Não há temporizadores ativos, senhor.')}
  if(m=s.match(/quantos dias (?:faltam|falta) para (?:o |a )?(?:dia )?(.+)$/)){
    const now=new Date();let d=null,nome=m[1];
    if(/natal/.test(nome))d=new Date(now.getFullYear(),11,25);
    else if(/ano novo|reveillon/.test(nome))d=new Date(now.getFullYear()+1,0,1);
    else{const k=nome.match(/(\d{1,2}) de (\w+)/);if(k&&MES[k[2]]!==undefined)d=new Date(now.getFullYear(),MES[k[2]],+k[1])}
    if(d){if(d<now&&!/ano novo|reveillon/.test(nome))d.setFullYear(d.getFullYear()+1);return say('Faltam '+Math.ceil((d-now)/864e5)+' dias, senhor.')}}
  /* informações */
  if(/bateria/.test(s)&&/(quanto|qual|como|nivel|status|carga|esta|ta )/.test(s))return bateria();
  if(/(internet|conexao|rede|online)/.test(s)&&/(como|esta|ta |estou|conectado|qual)/.test(s))return rede();
  if(/(informacoes|info|especificacoes|ficha).*(aparelho|celular|dispositivo)/.test(s))return aparelho();
  if(/^(?:onde estou|qual (?:e )?minha localizacao|minha localizacao)$/.test(s))return onde(false);
  if(/compartilh\w+ (?:minha )?localizacao/.test(s))return onde(true);
  /* texto e área de transferência */
  if(m=raw.match(/^copi(?:ar|e) (.+)/i)){return navigator.clipboard.writeText(m[1]).then(()=>say('Copiado, senhor.')).catch(()=>say('O navegador bloqueou a cópia, senhor.'))}
  if(/(o que (?:eu )?copiei|area de transferencia|ler (?:o )?que copiei)/.test(s)){return navigator.clipboard.readText().then(t=>say(t?'Na área de transferência está: '+t.slice(0,300):'A área de transferência está vazia, senhor.')).catch(()=>say('O navegador não deixou eu ler a área de transferência, senhor.'))}
  if(m=raw.match(/^compartilh(?:ar|e) (.+)/i)){return navigator.share?navigator.share({text:m[1]}).then(()=>say('Compartilhado, senhor.')).catch(()=>say('O compartilhamento foi cancelado ou bloqueado, senhor.')):say('Seu navegador não tem compartilhamento, senhor.')}
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

/* ================= AÇÕES DA IA (ela agora pode tudo isso) ================= */
const D0=window.doAction;
window.doAction=function(a){
  if(!a||!a.tipo)return D0(a);
  const k=norm(a.alvo||'');
  switch(a.tipo){
    case'tarefa_apagar':{const t=findTask(a.alvo||'');if(t)delTask(t);return}
    case'tarefa_concluir':{const t=findTask(a.alvo||'');if(t){t.ok=true;stash()}return}
    case'tarefas_limpar':tasks=[];stash();return;
    case'tarefas_feitas_limpar':tasks=tasks.filter(x=>!x.ok);stash();return;
    case'memoria_apagar':{const t=findMem(a.alvo||'');if(t)delMem(t);return}
    case'memoria_limpar':mem=[];stashM();return;
    case'lanterna':lanterna(!/deslig|apag|off/.test(k));return;
    case'tela_preta':telaPreta(true);return;
    case'tela_ligada':keepAwake(!/deslig|off/.test(k));if(!/deslig|off/.test(k))telaPreta(false);return;
    case'brilho':dim(/(baix|minim|diminu|escur)/.test(k)?dimLvl+1:/medi/.test(k)?2:0);return;
    case'vibrar':try{navigator.vibrate([200,100,200])}catch(e){}return;
    case'alarme':{const t=(a.alvo||'').match(/(\d{1,2})[:h ]?(\d{2})?/);if(t&&+t[1]<24)alarme(+t[1],+(t[2]||0),a.texto||'Jarvis');return}
    case'cronometro':cron(/par/.test(k)?'parar':/ver|quanto/.test(k)?'ver':'iniciar');return;
    case'copiar':try{navigator.clipboard.writeText(a.alvo||'')}catch(e){}return;
    case'compartilhar':try{navigator.share({text:a.alvo||''})}catch(e){}return;
    case'localizacao':onde(/compart/.test(k));return;
    case'exportar':exportar();return;
    case'voz':voz(k);return;
  }
  return D0(a)};

const EXTRA=`
AÇÕES EXTRAS (use exatamente estes tipos): "tarefa_apagar" (alvo=número da tarefa pendente ou trecho do texto), "tarefa_concluir" (alvo idem), "tarefas_limpar" (apaga todas), "tarefas_feitas_limpar", "memoria_apagar" (alvo=número ou trecho), "memoria_limpar", "lanterna" (alvo=ligar ou desligar), "tela_preta" (escurece a tela por completo mantendo microfone e voz ativos), "tela_ligada" (alvo=ligar ou desligar, mantém a tela acesa), "brilho" (alvo=baixo, medio ou maximo; é um escurecimento visual), "vibrar", "alarme" (alvo=HH:MM, texto=rótulo; cria alarme real no relógio do Android), "cronometro" (alvo=iniciar, parar ou ver), "copiar" (alvo=texto), "compartilhar" (alvo=texto), "localizacao" (alvo=compartilhar para enviar), "exportar" (backup dos dados), "voz" (alvo=devagar, rapido, grave, aguda ou normal).
Você TEM permissão total para criar, concluir, editar e apagar tarefas e memórias: use as ações acima e nunca diga que não tem permissão nem invente "comandos de remoção". Para pedidos de apagar ou limpar, execute e confirme.
LIMITES REAIS (seja honesto, sem inventar): pelo navegador você não consegue mudar o volume geral nem o brilho real do aparelho, nem desligar a tela de verdade, nem controlar outros aplicativos por dentro. Para volume, abra a configuração "som"; para tela, ofereça "tela_preta".
NUNCA use emojis nem símbolos decorativos nas respostas: somente texto simples.`;
function wrapSample(){
  if(typeof sample!=='function'||sample.__v5)return;
  const S0=sample;
  const W=function(msgs,o){
    try{const p=pend().map((x,i)=>(i+1)+') '+x.t).join('; '),mm=mem.map((x,i)=>(i+1)+') '+x.t).join('; ');
      msgs[0].content+=EXTRA+'\nTAREFAS PENDENTES NUMERADAS: '+(p||'nenhuma')+'.\nMEMÓRIA NUMERADA: '+(mm||'vazia')+'.'}catch(e){}
    return S0(msgs,o)};
  W.__v5=1;sample=W}
wrapSample();setTimeout(wrapSample,600);setTimeout(wrapSample,2500);

/* ================= TIMERS SOBREVIVEM A RECARREGAR ================= */
try{const old=ld('timers',[]).filter(t=>t&&t.end);
  const alive=old.filter(t=>t.end>Date.now()),lost=old.filter(t=>t.end<=Date.now()&&t.rem);
  alive.forEach(t=>timers.push(t));drawTimers();
  if(lost.length)setTimeout(()=>showJ('Senhor, enquanto estava fora passou o lembrete: '+lost.map(t=>t.label).join(', ')+'.'),6500)}catch(e){}
setInterval(()=>{try{sv('timers',timers)}catch(e){}},2000);

/* ================= STUDIO ABRE SEM LAG ================= */
const css=document.createElement('style');
css.textContent=`
#stw{clip-path:none!important;opacity:0;visibility:hidden;transform:translateY(14px) scale(.985);transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s linear .2s!important;will-change:opacity,transform}
#stw.on{opacity:1;visibility:visible;transform:none;transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s!important}`;
document.head.appendChild(css);

/* pré-carrega o Studio em segundo plano depois da abertura (o clique só mostra, não carrega) */
function preload(){const fr=S('#stw iframe');if(!fr)return;
  try{Object.defineProperty(fr,'src',{configurable:true,get(){return fr.getAttribute('src')||''},set(v){if(!fr.getAttribute('src'))fr.setAttribute('src',v)}})}catch(e){}
  if(!fr.getAttribute('src'))fr.setAttribute('src','studio.html')}
const pi=setInterval(()=>{if(typeof mainDraw!=='undefined'&&mainDraw){clearInterval(pi);setTimeout(()=>('requestIdleCallback' in window?requestIdleCallback(preload,{timeout:4000}):preload()),2500)}},500);

/* com Studio aberto ou tela preta, o Jarvis desenha a 4 quadros/s (libera a CPU para o editor) */
const slow=()=>{const w=S('#stw');return !!blk||(w&&w.classList.contains('on'))};
const _raf=window.requestAnimationFrame.bind(window);
window.requestAnimationFrame=function(cb){return slow()?setTimeout(()=>_raf(cb),250):_raf(cb)};
})();

/* ======================================================================
   V6 — AJUSTES NOVOS
   ====================================================================== */
(()=>{
const Q=(s,r)=>(r||document).querySelector(s);
const S=(n,f)=>{try{f()}catch(e){console.warn('jarvis-v6 ['+n+']',e)}};
const T=typeof setTimeout==='function'?setTimeout:null;

/* ---------- ícones feitos por código (nenhum emoji) ---------- */
const ICON={
bolt:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
play:'<path d="M7 5l12 7-12 7z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
arrow:'<path d="M4 12h16M13 6l7 6-7 6"/>',
back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
send:'<path d="M3 12L21 4l-6 16-3.2-6.8z"/>',
search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
clip:'<rect x="6" y="5" width="12" height="16" rx="1.5"/><path d="M9 3h6v4H9zM9 12h6M9 16h4"/>',
file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
folder:'<path d="M3 7l2-2h5l2 2h7l2 2v8l-2 2H5l-2-2z"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
spk:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
cs:'<circle cx="16.5" cy="7" r="2.8"/><path d="M16.5 1.5v1.2M21.5 7h-1.2M20 3.5l-.8.8"/><path d="M7 20h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5 1.3A3 3 0 0 0 7 20z"/>',
cloud:'<path d="M7 19h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 19z"/>',
fog:'<path d="M4 8h16M3 12h18M5 16h14M8 20h8"/>',
rain:'<path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
snow:'<path d="M12 3v18M4.5 7.5l15 9M4.5 16.5l15-9"/>',
storm:'<path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.4 3.4 0 0 0 7 14z"/><path d="M12 14l-2 4h3l-2 4"/>',
star:'<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 3 1.1-6.2L3 9.7l6.2-.9z"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
save:'<path d="M5 3h12l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
edit:'<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
battery:'<rect x="3" y="7" width="16" height="10" rx="1.5"/><path d="M21 10v4M6 10v4M9 10v4"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
warn:'<path d="M12 3L2.5 20h19z"/><path d="M12 10v5M12 17.5v.01"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
refresh:'<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5"/>',
down:'<path d="M12 4v15M6 13l6 6 6-6"/>',
up:'<path d="M12 20V5M6 11l6-6 6 6"/>',
bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z"/>',
flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
heart:'<path d="M12 20s-8-5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20z"/>',
dot:'<circle cx="12" cy="12" r="3"/>'};
const svgI=n=>'<svg class="jv-i" viewBox="0 0 24 24" aria-hidden="true">'+(ICON[n]||ICON.dot)+'</svg>';
const MAP={};
const A=(k,...c)=>c.forEach(x=>{MAP[String.fromCodePoint(x)]=k});
A('bolt',0x26A1);A('play',0x25B6,0x25B7,0x23F5,0x25B8,0x25BA,0x23EF);
A('plus',0x271A,0x2795,0xFF0B,0x2719,0x271B);A('x',0x2715,0x2716,0x2717,0x2718,0x274C,0x274E);
A('check',0x2713,0x2714,0x2705,0x2611);A('send',0x27A4,0x27A2);A('arrow',0x2192,0x21D2,0x2794,0x27A1,0x21E8);
A('back',0x21A9,0x2B05,0x2190,0x21B6,0x1F519);A('search',0x1F50D,0x1F50E);A('clip',0x1F4CB);
A('file',0x1F4C4,0x1F4C3);A('folder',0x1F4C1,0x1F4C2,0x1F5C2);A('mic',0x1F3A4,0x1F399);
A('spk',0x1F50A,0x1F509,0x1F508,0x1F4E2);A('mute',0x1F507,0x1F515);A('gear',0x2699,0x1F527,0x1F6E0);
A('sun',0x2600,0x1F31E);A('cs',0x26C5,0x1F324,0x1F325);A('cloud',0x2601);A('fog',0x1F32B);
A('rain',0x1F327,0x1F326,0x2614,0x1F4A7);A('snow',0x2744,0x1F328);A('storm',0x26C8,0x1F329);
A('star',0x2B50,0x2605,0x2606,0x1F31F,0x2728);A('lock',0x1F512,0x1F510,0x1F513,0x1F511);
A('save',0x1F4BE,0x1F4BF);A('trash',0x1F5D1);A('edit',0x270F,0x270E,0x1F4DD,0x270D);
A('clock',0x23F1,0x23F0,0x23F2,0x231A,0x23F3);for(let c=0x1F550;c<=0x1F567;c++)A('clock',c);
A('pin',0x1F4CD);A('battery',0x1F50B);A('globe',0x1F310,0x1F30D,0x1F30E,0x1F30F);
A('warn',0x26A0,0x2757);A('info',0x2139,0x2753,0x2754);A('bell',0x1F514);A('phone',0x1F4F1);
A('refresh',0x1F504,0x1F503,0x27F3,0x21BB,0x21BA);A('down',0x2B07,0x2193,0x23EC,0x1F4E5);
A('up',0x2B06,0x2191,0x23EB,0x1F4E4);A('bulb',0x1F4A1);A('flame',0x1F525);A('heart',0x2764,0x2665,0x1F499);
const EMO=/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25B6}\u{25B7}\u{25B8}\u{25BA}\u{25C0}\u{2600}-\u{27BF}\u{27F3}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}\u{FF0B}]/u;
const STRIP=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const SKIP='script,style,textarea,input,select,svg,pre,code,.ace_editor,[contenteditable=true],[contenteditable=""]';

/* ---------- logo: hexágono 3D no lugar do triângulo ---------- */
const HEX='<svg class="jv-hex" viewBox="0 0 32 36" aria-hidden="true"><path class="f1" d="M16 3L29 10.5 16 18 3 10.5z"/><path class="f2" d="M3 10.5L16 18V33L3 25.5z"/><path class="f3" d="M29 10.5V25.5L16 33V18z"/><path class="ed" d="M16 3L29 10.5V25.5L16 33 3 25.5V10.5zM3 10.5L16 18 29 10.5M16 18V33"/></svg>';
function fixLogo(d){
  d.querySelectorAll('.logo').forEach(l=>{
    if(l.querySelector('.jv-hexw'))return;
    const w=d.createElement('span');w.className='jv-hexw';w.innerHTML=HEX;
    const i=l.querySelector('i');
    if(i)i.replaceWith(w);
    else{for(const n of l.childNodes){if(n.nodeType===3&&/[\u25B2\u25B3\u25BC]/.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/[\u25B2\u25B3\u25BC]\s*/,'');break}}
      l.insertBefore(w,l.firstChild)}})}

/* ---------- troca qualquer emoji por ícone desenhado em código ---------- */
function scrubNode(n){
  const v=n.nodeValue;if(!v||!EMO.test(v))return;
  const p=n.parentNode;if(!p||(p.closest&&p.closest(SKIP)))return;
  const d=n.ownerDocument,fr=d.createDocumentFragment();let buf='';
  for(const ch of v){
    if(!EMO.test(ch)){buf+=ch;continue}
    const cp=ch.codePointAt(0);if(cp===0xFE0F||cp===0x200D||cp===0x20E3)continue;
    const k=MAP[ch]||((cp>=0x2190&&cp<=0x21FF)?'arrow':null);
    if(k){if(buf){fr.appendChild(d.createTextNode(buf));buf=''}const w=d.createElement('span');w.innerHTML=svgI(k);fr.appendChild(w.firstChild)}}
  if(buf)fr.appendChild(d.createTextNode(buf));
  p.replaceChild(fr,n)}
function scrubTree(root){
  if(!root)return;
  if(root.nodeType===3){scrubNode(root);return}
  if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
  const d=root.ownerDocument||root,w=d.createTreeWalker(root,4),list=[];
  while(w.nextNode())list.push(w.currentNode);
  list.forEach(scrubNode)}

/* ---------- CSS comum (tela principal, Studio e Cofre) ---------- */
const CSS_COMMON=`
.jv-i{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
.logo::before{content:none!important}
.jv-hexw{display:inline-flex;width:24px;height:27px;perspective:90px;flex:none}
.jv-hex{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 5px var(--ac));animation:jvSway 6s ease-in-out infinite;transform-style:preserve-3d}
.jv-hex .f1{fill:var(--ac2);opacity:.95}
.jv-hex .f2{fill:var(--ac);opacity:.55}
.jv-hex .f3{fill:var(--ac);opacity:.22;animation:jvF3 3.2s ease-in-out infinite}
.jv-hex .ed{fill:none;stroke:var(--ac2);stroke-width:1.1;stroke-linejoin:round}
@keyframes jvSway{0%,100%{transform:rotateY(-24deg) rotateX(8deg)}50%{transform:rotateY(24deg) rotateX(-4deg)}}
@keyframes jvF3{50%{opacity:.5}}`;

/* ---------- tema ---------- */
const rgb=h=>[1,3,5].map(i=>parseInt(String(h).substr(i,2),16)).join(',');
function themeDoc(d){S('tema-doc',()=>{
  const n=ld('th',null),p=(typeof TH!=='undefined'&&n)?TH[n]:null;if(!p)return;
  const r=d.documentElement.style;r.setProperty('--ac',p[0]);r.setProperty('--ac2',p[1]);r.setProperty('--acr',rgb(p[0]));r.setProperty('--ac2r',rgb(p[1]))})}
function themeFrames(){document.querySelectorAll('iframe').forEach(f=>{try{const d=f.contentDocument;if(d&&d.documentElement&&d.documentElement.dataset.jv)themeDoc(d)}catch(e){}})}

/* ---------- instala (tela principal e dentro dos iframes) ---------- */
function install(d,main){
  if(!d||!d.documentElement||!d.body||d.documentElement.dataset.jv)return;
  d.documentElement.dataset.jv='1';
  const st=d.createElement('style');st.textContent=CSS_COMMON+(main?CSS_MAIN:'');(d.head||d.documentElement).appendChild(st);
  scrubTree(d.body);fixLogo(d);if(!main)themeDoc(d);
  const MO=(d.defaultView&&d.defaultView.MutationObserver)||MutationObserver,q=new Set();let tm=null;
  const flush=()=>{tm=null;const a=[...q];q.clear();a.forEach(n=>{try{if(n.isConnected)scrubTree(n)}catch(e){}});try{fixLogo(d)}catch(e){}};
  new MO(ms=>{let any=false;
    for(const m of ms){const t=m.target,el=t&&(t.nodeType===1?t:t.parentElement);
      if(el&&el.closest&&el.closest('.ace_editor'))continue;
      if(m.type==='characterData'){q.add(t);any=true}else m.addedNodes.forEach(n=>{q.add(n);any=true})}
    if(any&&!tm)tm=setTimeout(flush,30)}).observe(d.body,{childList:true,subtree:true,characterData:true})}
function watchFrames(){document.querySelectorAll('iframe').forEach(f=>{
  if(f.__jv)return;f.__jv=1;
  const go=()=>{try{const d=f.contentDocument;if(d&&d.URL!=='about:blank'&&d.body)install(d,false)}catch(e){}};
  f.addEventListener('load',go);let n=0;const iv=setInterval(()=>{go();if(++n>150)clearInterval(iv)},40)})}

/* ---------- CSS só da tela principal ---------- */
const CSS_MAIN=`
/* Studio com o mesmo acabamento dos outros botões */
#stb{background:var(--ac)!important;color:var(--ac)!important;animation:hp 3.2s ease-in-out infinite!important}
#stb::before{background:linear-gradient(#05182a,#020a12)!important}
#stb:active::before{background:rgba(var(--acr),.4)!important}
/* HUD: bateria embaixo de SISTEMA ONLINE */
#hud{display:grid!important;grid-template-columns:1fr auto 1fr;align-items:start;gap:6px}
#hud .jv-hl{display:flex;flex-direction:column;gap:6px;align-items:flex-start;min-width:0}
#hud #hc{justify-self:center}
#hb{display:inline-flex;align-items:center;gap:5px}
#hb .jv-i{color:var(--ac2);width:1.1em;height:1.1em;vertical-align:0}
/* volta do Studio/Cofre sem piscar */
body.jv-wait>*:not(#ja-ov):not(#stw){opacity:0!important;transition:none!important}
body.jv-fade>*:not(#ja-ov):not(#stw){transition:opacity .22s ease-out}
/* barra de gravação */
#jv-rec{position:fixed;left:50%;transform:translateX(-50%);z-index:60;display:none;gap:12px;align-items:center}
#jv-rec.on{display:flex;animation:jvIn .22s ease-out}
@keyframes jvIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}}
.jv-b{position:relative;border:0;padding:0;background:var(--ac2);color:var(--ac2);clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%);font:700 11px var(--hud,Orbitron,sans-serif);letter-spacing:.2em;cursor:pointer}
.jv-b::before{content:"";position:absolute;inset:1.5px;background:linear-gradient(#05182a,#020a12);clip-path:inherit}
.jv-b:active::before{background:rgba(var(--acr),.4)}
.jv-b span{position:relative;display:flex;align-items:center;gap:8px;padding:13px 24px}
.jv-b.d{background:var(--ac);color:var(--ac)}
.jv-b .jv-i{width:1.3em;height:1.3em;vertical-align:0}`;

/* ---------- aplica ---------- */
S('instalar',()=>{install(document,true);watchFrames();
  new MutationObserver(watchFrames).observe(document.body,{childList:true,subtree:true});setInterval(watchFrames,3000)});

/* tira a regra antiga que escondia tudo com display:none (causava o salto do reator ao voltar) */
S('css-antigo',()=>{document.querySelectorAll('style').forEach(s=>{const t=s.textContent||'';if(/ja-open>\*:not\(#ja-ov\):not\(#stw\)\{display:none!important\}/.test(t))s.remove()})});

/* ---------- voz e texto sem emoji ---------- */
S('say',()=>{const o=say;say=function(t){return o.call(this,typeof t==='string'?t.replace(STRIP,''):t)}});
S('speak',()=>{const o=speak;speak=function(t){return o.call(this,typeof t==='string'?t.replace(STRIP,''):t)}});

/* ---------- HUD: BATERIA embaixo do SISTEMA ONLINE ---------- */
S('hud',()=>{
  const hud=Q('#hud'),hb=Q('#hb');if(!hud||!hb||hud.dataset.jv)return;hud.dataset.jv='1';
  const left=hud.firstElementChild,col=document.createElement('div');col.className='jv-hl';
  hud.insertBefore(col,left);col.appendChild(left);col.appendChild(hb);hud.appendChild(document.createElement('span'));
  hb.innerHTML='BATERIA --';
  if(navigator.getBattery)navigator.getBattery().then(b=>{
    const u=()=>{hb.innerHTML='BATERIA '+Math.round(b.level*100)+'%'+(b.charging?svgI('bolt'):'')};
    u();b.onlevelchange=b.onchargingchange=u;setInterval(u,30000)}).catch(()=>{});
  T(()=>{try{rs()}catch(e){}},200)});

/* ---------- Studio para o lado direito ---------- */
function placeStudio(){S('studio-dir',()=>{
  const b=Q('#stb');if(!b)return;const cs=getComputedStyle(b);if(cs.display==='none')return;
  if(/fixed|absolute/.test(cs.position)){
    const l=parseFloat(cs.left),r=parseFloat(cs.right);
    if(!isNaN(l)&&!isNaN(r)&&l<r){b.style.setProperty('left','auto','important');b.style.setProperty('right',l+'px','important')}return}
  const rc=b.getBoundingClientRect();if(!rc.width||rc.left>innerWidth/2)return;
  b.style.setProperty('position','fixed','important');b.style.setProperty('left','auto','important');b.style.setProperty('right',rc.left+'px','important');b.style.setProperty('margin','0','important');
  if(rc.top>innerHeight/2){b.style.setProperty('bottom',(innerHeight-rc.bottom)+'px','important');b.style.setProperty('top','auto','important')}
  else b.style.setProperty('top',rc.top+'px','important')})}
[250,1200,3000].forEach(ms=>setTimeout(placeStudio,ms));
addEventListener('resize',()=>setTimeout(placeStudio,120));addEventListener('orientationchange',()=>setTimeout(placeStudio,300));

/* ---------- tema salvo sempre ---------- */
S('tema',()=>{
  if(typeof TH==='undefined')return;
  const saved=ld('th',null);let restoring=true;
  const curName=()=>{
    if(typeof curTheme==='string'&&TH[curTheme])return curTheme;
    const ac=getComputedStyle(document.documentElement).getPropertyValue('--ac').trim().toLowerCase();
    return Object.keys(TH).find(k=>String(TH[k][0]).toLowerCase()===ac)||null};
  const save=n=>{if(restoring||!n||!TH[n])return;if(ld('th',null)!==n)sv('th',n);themeFrames()};
  S('tema-wrap',()=>{const o=setTheme;setTheme=function(n){const r=o.apply(this,arguments);try{save(typeof n==='string'&&TH[n]?n:curName())}catch(e){}return r}});
  const apply=()=>{if(saved&&TH[saved]&&curName()!==saved){try{setTheme(saved)}catch(e){}}};
  setTimeout(apply,0);setTimeout(apply,900);setTimeout(()=>{restoring=false;save(curName())},1700);
  new MutationObserver(()=>save(curName())).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  addEventListener('pagehide',()=>save(curName()));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save(curName())})});

/* ---------- SONS: sem atraso (corta o silêncio do começo de cada arquivo) ---------- */
const BUF={},OFF={},URLS={},FAIL={};
async function prep(k){
  const u=(typeof SU!=='undefined'&&SU)?SU[k]:null;
  if(!u||URLS[k]===u||/^boot/.test(k)||(FAIL[k]||0)>2)return;
  URLS[k]=u;
  try{const x=ax();if(!x)return;
    const b=await x.decodeAudioData(await(await fetch(u)).arrayBuffer());
    let first=b.length;const thr=.012;
    for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length&&i<first;i++){if(d[i]>thr||d[i]<-thr){first=i;break}}}
    OFF[k]=Math.min(1.2,Math.max(0,first/b.sampleRate-.004));BUF[k]=b}
  catch(e){FAIL[k]=(FAIL[k]||0)+1;delete URLS[k]}}
function prepAll(){S('prep',()=>{
  if(typeof SU==='undefined'||!SU)return;
  Object.keys(SU).forEach(prep);
  Object.keys(BUF).forEach(k=>{if(!SU[k]){delete BUF[k];delete URLS[k]}})})}
[300,1200,3000,6000].forEach(ms=>setTimeout(prepAll,ms));
setInterval(prepAll,4000);

/* ---------- ABERTURA: pular cancela todos os sons ---------- */
const LIVE=new Map(),INTRO={on:false,t0:0,timers:[],collect:false};
S('live',()=>{
  const wrap=proto=>{if(!proto||!proto.start)return;const o=proto.start;
    proto.start=function(){try{LIVE.set(this,performance.now());if(this.addEventListener)this.addEventListener('ended',()=>LIVE.delete(this))}catch(e){}return o.apply(this,arguments)}};
  wrap(window.AudioBufferSourceNode&&AudioBufferSourceNode.prototype);wrap(window.OscillatorNode&&OscillatorNode.prototype);
  const mp=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){try{LIVE.set(this,performance.now());this.addEventListener('ended',()=>LIVE.delete(this),{once:true})}catch(e){}return mp.apply(this,arguments)}});
S('timers-intro',()=>{const st0=window.setTimeout;
  window.setTimeout=function(){const id=st0.apply(window,arguments);if(INTRO.collect)INTRO.timers.push(id);return id}});
function introBegin(){
  INTRO.on=true;INTRO.t0=performance.now();INTRO.timers=[];
  setTimeout(()=>{if(performance.now()-INTRO.t0>=7000)INTRO.on=false},7600);
  INTRO.collect=true;queueMicrotask(()=>{INTRO.collect=false})}
function skipSounds(){
  if(!INTRO.t0)return;INTRO.on=false;
  INTRO.timers.forEach(id=>clearTimeout(id));INTRO.timers=[];
  LIVE.forEach((ts,n)=>{if(ts>=INTRO.t0-50){try{if(typeof n.stop==='function')n.stop();else n.pause()}catch(e){}}});
  LIVE.clear();try{if(typeof aud!=='undefined'&&aud)aud.pause()}catch(e){}}
window.jaOpenSkip=skipSounds;
document.addEventListener('pointerdown',()=>{if(INTRO.on&&performance.now()-INTRO.t0>350)skipSounds()},true);

/* play: usa o buffer já cortado (sem atraso) e avisa quando a abertura começa */
S('play',()=>{const P0=play;
  play=function(k,o){
    if(k==='boot')introBegin();
    else if(BUF[k]){
      try{
        if(typeof fxOn!=='undefined'&&!fxOn)return;
        const x=ax();
        if(x){const s=x.createBufferSource(),g=x.createGain();s.buffer=BUF[k];g.gain.value=Math.min(1,typeof vol==='number'?vol:.8);
          s.connect(g);g.connect(x.destination);s.start(0,OFF[k]||0);
          return{pause(){try{s.stop()}catch(e){}},stop(){try{s.stop()}catch(e){}},play(){},currentTime:0}}}
      catch(e){}}
    return P0.apply(this,arguments)}});

/* ---------- voltar do Studio/Cofre sem bug visual ---------- */
S('volta',()=>{
  let was=document.body.classList.contains('ja-open');
  new MutationObserver(()=>{
    const on=document.body.classList.contains('ja-open');
    if(was&&!on){
      document.body.classList.add('jv-wait');
      try{rs()}catch(e){}dispatchEvent(new Event('resize'));try{rs()}catch(e){}placeStudio();
      setTimeout(()=>{try{rs()}catch(e){}document.body.classList.add('jv-fade');document.body.classList.remove('jv-wait');
        setTimeout(()=>document.body.classList.remove('jv-fade'),260)},140)}
    was=on}).observe(document.body,{attributes:true,attributeFilter:['class']})});

/* ---------- GRAVAR VOZ: só para ao tocar no reator + botão ENVIAR ---------- */
const R={st:'idle',rec:null,base:'',cur:'',last:0,fails:0,fatal:false,stopping:false,sendAfter:false,prev:null};
const bar=document.createElement('div');bar.id='jv-rec';
bar.innerHTML='<button class="jv-b" id="jv-send" type="button"><span>'+svgI('send')+'ENVIAR</span></button><button class="jv-b d" id="jv-del" type="button"><span>'+svgI('x')+'DESCARTAR</span></button>';
document.body.appendChild(bar);
const setSt=t=>{const e=Q('#st');if(e)e.textContent=t};
const flags=on=>{try{listening=on}catch(e){}};
let lv=null;
const lvOn=on=>{clearInterval(lv);lv=null;if(on)lv=setInterval(()=>{const act=Date.now()-R.last<700;try{lvl=act?(.3+.35*Math.abs(Math.sin(Date.now()/130))):.06}catch(e){}},70)};
const placeBar=()=>{const e=Q('#st');bar.style.top=Math.max(80,(e?e.getBoundingClientRect().top-72:innerHeight*.6))+'px'};
function show(){
  const cj=Q('#cj')||Q('#cap'),t=(R.base+' '+R.cur).trim();
  if(cj)cj.textContent=t||'Estou ouvindo, senhor…';
  if(R.st==='rec'||R.st==='review'){placeBar();bar.classList.toggle('on',!!t)}}
let keep=null;
function status(){clearInterval(keep);keep=null;
  const tx=()=>R.st==='rec'?'GRAVANDO · TOQUE NO REATOR':R.st==='stopping'?'FINALIZANDO…':R.st==='review'?'GRAVAÇÃO PRONTA':null;
  if(R.st!=='idle'){setSt(tx());keep=setInterval(()=>{const t=tx();if(t)setSt(t)},300)}}
function resetIdle(restore){
  const cj=Q('#cj')||Q('#cap');
  R.st='idle';R.base='';R.cur='';R.stopping=false;R.sendAfter=false;R.fatal=false;
  bar.classList.remove('on');flags(false);lvOn(false);status();setSt('AGUARDANDO COMANDO');
  if(restore&&cj&&R.prev!=null)cj.textContent=R.prev}
function submitText(t){
  const inp=Q('#t'),tb=Q('#tb');
  if(!inp||!tb){try{window.local(t)}catch(e){}return}
  let fired=false;const mark=()=>{fired=true};tb.addEventListener('submit',mark,{once:true,capture:true});
  inp.value=t;
  try{if(tb.requestSubmit)tb.requestSubmit();else tb.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))}catch(e){}
  setTimeout(()=>{tb.removeEventListener('submit',mark,true);
    if(!fired){const b=tb.querySelector('button');if(b)b.click()}
    setTimeout(()=>{if(inp.value===t)inp.value=''},60)},120)}
function send(){const t=(R.base+' '+R.cur).trim();resetIdle(false);if(t){play('ok');submitText(t)}}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function spawn(){
  const rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
  const t0=Date.now();let got=false;
  rec.onresult=e=>{
    const parts=[];
    for(let i=0;i<e.results.length;i++){const t=(e.results[i][0].transcript||'').trim();if(!t)continue;
      if(parts.length&&t.toLowerCase().indexOf(parts[parts.length-1].toLowerCase())===0)parts[parts.length-1]=t;else parts.push(t)}
    R.cur=parts.join(' ');R.last=Date.now();got=true;R.fails=0;show()};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')R.fatal=true};
  rec.onend=()=>{
    R.base=(R.base+' '+R.cur).trim();R.cur='';
    if(R.rec!==rec||R.st!=='rec')return;
    if(R.fatal){try{say('O microfone está bloqueado, senhor. Libere a permissão no navegador.')}catch(e){}resetIdle(true);return}
    if(!got&&Date.now()-t0<900)R.fails++;
    if(R.fails>=4){stopRec(false);return}
    setTimeout(()=>{if(R.st==='rec'&&R.rec===rec)spawn()},150)};
  R.rec=rec;try{rec.start()}catch(e){}}
function startRec(){
  if(!SR){try{say('Seu navegador não tem reconhecimento de voz, senhor.')}catch(e){}return}
  try{speechSynthesis.cancel()}catch(e){}
  const cj=Q('#cj')||Q('#cap');R.prev=cj?cj.textContent:null;
  R.base='';R.cur='';R.fails=0;R.fatal=false;R.stopping=false;R.sendAfter=false;R.last=0;R.st='rec';
  flags(true);lvOn(true);status();play('open');show();spawn()}
function afterStop(){
  R.stopping=false;flags(false);lvOn(false);
  const t=R.base.trim();
  if(!t){setSt('NADA OUVIDO');play('err');R.st='idle';status();bar.classList.remove('on');
    setTimeout(()=>{if(R.st==='idle')setSt('AGUARDANDO COMANDO')},1400);const cj=Q('#cj')||Q('#cap');if(cj&&R.prev!=null)cj.textContent=R.prev;return}
  if(R.sendAfter){send();return}
  R.st='review';status();show()}
function stopRec(sendAfter){
  if(R.st!=='rec')return;
  R.st='stopping';R.sendAfter=!!sendAfter;R.stopping=true;status();play('click');
  const rec=R.rec;let done=false;
  const fin=()=>{if(done)return;done=true;afterStop()};
  if(rec){rec.onend=()=>{R.base=(R.base+' '+R.cur).trim();R.cur='';fin()};try{rec.stop()}catch(e){fin()}}else fin();
  setTimeout(()=>{if(!done){R.base=(R.base+' '+R.cur).trim();R.cur='';try{rec.abort()}catch(e){}fin()}},1500)}
function toggleRec(){
  try{rips.push(performance.now()/1000)}catch(e){}
  if(R.st==='idle'||R.st==='review')startRec();else if(R.st==='rec')stopRec(false)}
const take=()=>{
  if(!(typeof mainDraw!=='undefined'&&mainDraw))return false;
  if(R.st!=='idle')return true;
  if((typeof speaking!=='undefined'&&speaking)||(typeof think!=='undefined'&&think)||(typeof listening!=='undefined'&&listening))return false;
  if(typeof contOn!=='undefined'&&contOn)return false;
  return true};
['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(ev=>document.addEventListener(ev,e=>{
  const rc=e.target&&e.target.closest&&e.target.closest('#reactor');if(!rc||!take())return;
  e.stopImmediatePropagation();if(ev==='click'){e.preventDefault();toggleRec()}},true));
Q('#jv-send').addEventListener('click',()=>{
  if(R.st==='rec')stopRec(true);else if(R.st==='review'){send()}});
Q('#jv-del').addEventListener('click',()=>{
  play('click');
  if(R.st==='rec'){R.stopping=true;const r=R.rec;R.rec=null;try{r.onend=null;r.abort()}catch(e){}}
  resetIdle(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&R.st==='rec')stopRec(false)});
addEventListener('resize',()=>{if(R.st!=='idle')placeBar()});
})();
