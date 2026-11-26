/* J.A.R.V.I.S V5 — carregue POR ÚLTIMO no index.html (depois do jarvis-extra.js):
   <script src="jarvis-v5.js"></script>                                          */
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
LIMITES REAIS (seja honesto, sem inventar): pelo navegador você não consegue mudar o volume geral nem o brilho real do aparelho, nem desligar a tela de verdade, nem controlar outros aplicativos por dentro. Para volume, abra a configuração "som"; para tela, ofereça "tela_preta".`;
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
