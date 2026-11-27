/* J.A.R.V.I.S V5 (revisado) — carregue POR ÚLTIMO no index.html (depois do jarvis-extra.js e do jarvis-fix2.js):
   <script src="jarvis-v5.js"></script>
   Substitui o jarvis-v5.js antigo. Inclui tudo que o v5 já tinha + os ajustes novos (seções 12 a 20).      */
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
  if(contOn&&!listening&&!speaking&&!recOn)setTimeout(()=>{try{listen()}catch(e){}},500)});

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
['JARVIS',['toque no reator para gravar, toque de novo para parar, depois ENVIAR','fale mais devagar / rápido','voz mais grave / aguda / normal','repita','modo contínuo ligar / desligar','modo cinema  /  tema aleatório','rolar dado d20  /  cara ou coroa']]];
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
NUNCA use emojis, emoticons nem símbolos decorativos nas suas respostas: apenas texto simples.`;
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


/* ##########################################################################
   AJUSTES NOVOS
   ########################################################################## */

/* ================= 12) SEM EMOJI: tudo vira ícone feito por código (SVG) ================= */
const SV=p=>'<svg class="ji" viewBox="0 0 24 24" style="width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.14em;flex:none">'+p+'</svg>';
const ICO={
  '\u21A9':SV('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>'),
  '\u271A':SV('<path d="M12 5v14M5 12h14"/>'),
  '\u{1F4CB}':SV('<rect x="6" y="5" width="12" height="16"/><path d="M9 5V3h6v2M9 11h6M9 15h4"/>'),
  '\u{1F50D}':SV('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>'),
  '\u26A1':SV('<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'),
  '\u25B6':SV('<path d="M7 5l12 7-12 7z" style="fill:currentColor"/>'),
  '\u27A4':SV('<path d="M3 12L21 4l-6 16-3.2-6.8z"/>'),
  '\u25B2':SV('<path d="M12 6l8 12H4z" style="fill:currentColor"/>'),
  '\u25BC':SV('<path d="M12 18L4 6h16z" style="fill:currentColor"/>')};
const RX=/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u2190-\u21FF\u25A0-\u25FF\u2700-\u27BF\u2B00-\u2BFF]/gu;
function fixText(n){
  RX.lastIndex=0;if(!RX.test(n.data))return;RX.lastIndex=0;
  const d=n.ownerDocument,f=d.createDocumentFragment(),s=n.data;let last=0,m;
  while((m=RX.exec(s))){f.append(s.slice(last,m.index));const h=ICO[m[0]];if(h){const t=d.createElement('template');t.innerHTML=h;f.append(t.content)}last=m.index+m[0].length}
  f.append(s.slice(last));if(n.parentNode)n.replaceWith(f)}
function sweep(root){
  if(!root)return;
  if(root.nodeType===3){fixText(root);return}
  if(root.nodeType!==1)return;
  const w=root.ownerDocument.createTreeWalker(root,4),L=[];let n;
  while((n=w.nextNode())){const t=n.parentNode&&n.parentNode.nodeName;if(t==='SCRIPT'||t==='STYLE'||t==='TEXTAREA')continue;RX.lastIndex=0;if(RX.test(n.data))L.push(n)}
  L.forEach(fixText)}
function watch(doc){
  if(!doc||doc.__jw||!doc.body)return;doc.__jw=1;
  sweep(doc.body);
  new doc.defaultView.MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')sweep(m.target);else m.addedNodes.forEach(sweep)}})
    .observe(doc.body,{childList:true,subtree:true,characterData:true})}

/* ================= 13) HEXÁGONO 3D NO LUGAR DO TRIÂNGULO DO LOGO ================= */
const HEXSVG='<svg viewBox="0 0 24 24" width="20" height="20" style="display:block;overflow:visible"><defs><linearGradient id="jhA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" style="stop-color:var(--ac2)"/></linearGradient></defs>'+
  '<path d="M12 1.5L21.1 6.75L12 12L2.9 6.75Z" fill="url(#jhA)"/>'+
  '<path d="M2.9 6.75L12 12V22.5L2.9 17.25Z" style="fill:var(--ac);fill-opacity:.55"/>'+
  '<path d="M21.1 6.75V17.25L12 22.5V12Z" style="fill:var(--ac);fill-opacity:.92"/>'+
  '<path d="M12 1.5L21.1 6.75V17.25L12 22.5L2.9 17.25V6.75ZM2.9 6.75L12 12L21.1 6.75M12 12V22.5" style="fill:none;stroke:var(--ac2);stroke-width:.9;stroke-linejoin:round"/></svg>';
const HEXCSS='.jhex{display:inline-flex;width:20px;height:20px;flex:none;filter:drop-shadow(0 0 5px var(--ac));animation:jhx 3.4s ease-in-out infinite}@keyframes jhx{50%{filter:drop-shadow(0 0 10px var(--ac)) brightness(1.25)}}.logo::before{content:none!important}';
function logoHex(doc){
  const lg=doc.querySelector('.logo');if(!lg||lg.querySelector('.jhex'))return;
  const el=doc.createElement('span');el.className='jhex';el.innerHTML=HEXSVG;
  const i=lg.querySelector(':scope>i');if(i)i.replaceWith(el);else lg.insertBefore(el,lg.firstChild)}

/* ================= 14) COFRE E STUDIO (dentro do Jarvis): mesmo tratamento ================= */
function skin(doc){
  if(!doc||doc.__sk||!doc.body||!doc.head)return;
  let h='';try{h=doc.location.href}catch(e){return}
  if(h==='about:blank')return;
  doc.__sk=1;
  const st=doc.createElement('style');st.textContent=HEXCSS;doc.head.appendChild(st);
  watch(doc);logoHex(doc)}
function hookFrame(f){
  if(f.__jh)return;f.__jh=1;let n=0;
  const go=()=>{try{skin(f.contentDocument)}catch(e){}};
  f.addEventListener('load',()=>{try{if(f.contentDocument)f.contentDocument.__sk=0}catch(e){}go()});
  const iv=setInterval(()=>{go();let ok=false;try{ok=f.contentDocument&&f.contentDocument.__sk}catch(e){}if(ok||++n>150)clearInterval(iv)},40)}
const scanFrames=()=>document.querySelectorAll('iframe').forEach(hookFrame);
scanFrames();new MutationObserver(scanFrames).observe(document.documentElement,{childList:true,subtree:true});

/* ================= 15) HUD: "BATERIA" EMBAIXO DE "SISTEMA ONLINE" ================= */
(function hud(){
  const h=S('#hud'),hb=S('#hb');if(!h||!hb||S('#hl'))return;
  const left=h.firstElementChild;if(!left)return;
  const col=document.createElement('div');col.id='hl';h.insertBefore(col,left);col.append(left,hb);
  let on=0;
  const fx=()=>{
    if(on)return;const t=hb.textContent||'';
    if(!/^BAT\b/.test(t)&&!/\u26A1/.test(t))return;on=1;
    const chg=/\u26A1/.test(t)||!!hb.querySelector('.ji');
    hb.textContent=t.replace(/^BAT\b/,'BATERIA').replace(/\s*\u26A1/g,'').trim();
    if(chg){const tp=document.createElement('template');tp.innerHTML=ICO['\u26A1'];hb.append(tp.content)}
    setTimeout(()=>{on=0},0)};
  new MutationObserver(fx).observe(hb,{childList:true,characterData:true,subtree:true});fx();
  setTimeout(()=>{try{rs()}catch(e){}dispatchEvent(new Event('resize'))},80)})();

/* ================= 16) STUDIO NO LADO DIREITO + VISUAL IGUAL AO DOS OUTROS BOTÕES ================= */
(function studioBtn(){
  const stb=S('#stb'),gear=S('#gear');if(!stb||!gear||S('#hgrp'))return;
  const g=document.createElement('div');g.id='hgrp';gear.before(g);g.append(gear,stb)})();

/* ================= 17) TEMA: salva sempre e sempre volta como estava ================= */
(function tema(){
  const KEY='jp_th';
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY))||localStorage.getItem('jarvis_tema')}catch(e){return null}};
  const put=n=>{try{localStorage.setItem(KEY,JSON.stringify(n));localStorage.setItem('jarvis_tema',n)}catch(e){}};
  const has=n=>typeof TH!=='undefined'&&TH&&TH[n];
  try{const S0=setTheme,W=function(n){const r=S0.apply(this,arguments);if(has(n)&&arguments[1]!==false)put(n);return r};
    try{setTheme=W}catch(e){}window.setTheme=W}catch(e){}
  /* qualquer outro caminho que troque a cor (toque no seletor) também é gravado */
  let tap=0;['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{tap=Date.now()},true));
  new MutationObserver(()=>{
    if(Date.now()-tap>1500||typeof TH==='undefined'||document.body.classList.contains('alert'))return;
    const v=document.documentElement.style.getPropertyValue('--ac').trim().toLowerCase();
    const n=Object.keys(TH).find(k=>TH[k][0].toLowerCase()===v);if(n)put(n)}).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  const restore=()=>{
    const n=get();if(!n||!has(n)||document.body.classList.contains('alert'))return;
    if(typeof curTheme!=='undefined'&&curTheme===n)return;
    const p=play;try{play=function(){};setTheme(n)}catch(e){}finally{try{play=p}catch(e){}}};
  restore();[600,2000,5000].forEach(ms=>setTimeout(restore,ms));
  addEventListener('pageshow',restore);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)restore()})})();

/* ================= 18) SONS: sem atraso e abertura cancelável ================= */
const SND=new Map(),live=new Set();
const aux=()=>{try{return ax()}catch(e){return null}};
const VOL=()=>Math.min(1,typeof vol==='number'?vol:.8);
const FXON=()=>typeof fxOn==='undefined'||!!fxOn;
/* acha onde o som realmente começa (pula o silêncio de ~0,4 s do início do arquivo) */
function lead(b){
  const lim=Math.min(b.length,Math.floor(b.sampleRate*1.2));let best=lim;
  for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<best;i++){if(d[i]>.02||d[i]<-.02){best=i;break}}}
  return best>=lim?0:Math.max(0,best/b.sampleRate-.004)}
function warm(u){
  if(!u||SND.has(u))return;const x=aux();if(!x)return;SND.set(u,{});
  fetch(u).then(r=>r.arrayBuffer()).then(a=>x.decodeAudioData(a)).then(b=>{SND.set(u,{buf:b,off:lead(b)})}).catch(()=>SND.delete(u))}
const warmAll=()=>{try{Object.keys(SU).forEach(k=>warm(SU[k]))}catch(e){}};
[700,2000,4500,9000].forEach(ms=>setTimeout(warmAll,ms));
document.addEventListener('pointerdown',warmAll,true);
function startBuf(k,when,trim){
  const u=SU[k],c=u&&SND.get(u),x=aux();if(!c||!c.buf||!x)return null;
  const s=x.createBufferSource(),g=x.createGain();s.buffer=c.buf;g.gain.value=VOL();s.connect(g);g.connect(x.destination);
  s.start(when||0,trim?c.off:0);live.add(s);s.onended=()=>live.delete(s);return s}

/* abertura: todos os sons da animação são controlados aqui */
const TT={boot:0,boot_a:.15,boot_b:1.7,boot_t:1.9,boot_d:2.2,boot_c:2.6,boot_e:4.1,boot_f:5.3};
let introAt=0,introMute=0,introTm=[],introAud=[];
function stopIntro(){
  introTm.forEach(clearTimeout);introTm=[];
  live.forEach(s=>{if(s.__intro){try{s.stop()}catch(e){}live.delete(s)}});
  introAud.forEach(a=>{try{a.pause()}catch(e){}});introAud=[];
  try{speechSynthesis.cancel()}catch(e){}}
const introHandle={pause(){stopIntro()}};
window.jaOpenStart=function(){
  const n=performance.now();if(n-introAt<800)return;
  introAt=n;introMute=0;stopIntro();
  if(!FXON())return;
  const x=aux();if(x&&x.state==='suspended')x.resume();
  warmAll();const base=x?x.currentTime+.04:0;
  if(!SU.boot){try{FB.boot()}catch(e){}}
  Object.keys(TT).forEach(k=>{
    const u=SU[k];if(!u)return;const c=SND.get(u);
    if(x&&c&&c.buf){const s=startBuf(k,base+TT[k],false);if(s)s.__intro=1}
    else introTm.push(setTimeout(()=>{try{const a=new Audio(u);a.volume=VOL();a.play().catch(()=>{});introAud.push(a)}catch(e){}},TT[k]*1000))})};
window.jaOpenSkip=function(){
  const at=introAt;stopIntro();introMute=at+5000;introAt=0};
/* qualquer toque durante a animação pula e CORTA todos os sons dela */
document.addEventListener('pointerdown',()=>{
  if(!introAt)return;const d=performance.now()-introAt;
  if(d>250&&d<5700)window.jaOpenSkip()},true);
/* os bipes sintetizados da abertura também param */
try{const B0=bp;bp=function(){if(performance.now()<introMute)return;return B0.apply(this,arguments)}}catch(e){}

/* play: toca direto da memória, já sem o silêncio do começo */
{const P0=play;
 play=function(k,o){
  if(k==='boot'&&!(o&&o.force)){window.jaOpenStart();return introHandle}
  if(!FXON()&&!(o&&o.force))return;
  if(!/^boot/.test(k)){
    const s=startBuf(k,0,true);
    if(s)return{pause(){try{s.stop()}catch(e){}}};
    warm(SU[k])}
  return P0.apply(this,arguments)}}

/* ================= 19) SEM PISCAR AO VOLTAR DO STUDIO / COFRE ================= */
/* o fix antigo escondia o Jarvis com display:none: ao voltar, as animações de entrada rodavam de novo
   e o reator pulava de posição. Agora só fica invisível (o layout não muda). */
document.querySelectorAll('style').forEach(s=>{
  const t='body.ja-open>*:not(#ja-ov):not(#stw){display:none!important}';
  if(s.textContent.includes(t))s.textContent=s.textContent.replace(t,'body.ja-open>*:not(#ja-ov):not(#stw){visibility:hidden!important}')});
/* só recalcula o tamanho dos quadros se o tamanho realmente mudou (recalcular apaga o desenho) */
const curSz=()=>{const r=S('#reactor');let k=innerWidth+'x'+innerHeight;if(r){const b=r.getBoundingClientRect();k+='|'+Math.round(b.left)+','+Math.round(b.top)+','+Math.round(b.width)}return k};
try{if(typeof rs==='function'){const rs0=rs;let sig='';
  rs=function(){const k=curSz();if(k===sig)return;sig=k;return rs0.apply(this,arguments)}}}catch(e){}
let lastSz='';
addEventListener('resize',e=>{const k=curSz();if(!e.isTrusted&&k===lastSz){e.stopImmediatePropagation();return}lastSz=k},true);

/* ================= 20) GRAVAR ÁUDIO: toque no reator, fala sem cortar, ENVIAR ================= */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let mic=null,recOn=false,committed='',curTxt='',wasCont=false,blocked=false,fails=0,lastStart=0,endCb=null;
const joinT=(a,b)=>(a+' '+b).replace(/\s+/g,' ').trim();
const fullTxt=()=>joinT(committed,curTxt);
const panel=document.createElement('div');panel.id='rec';
panel.innerHTML='<div class="rcd"><div class="rlb"><i></i><span id="rls"></span></div><div id="rtx"></div><div class="rbt"><button id="rsd" class="rbp">'+ICO['\u27A4']+'<span>ENVIAR</span></button><button id="rcn" class="rbd">'+SV('<path d="M6 6l12 12M18 6L6 18"/>')+'<span>DESCARTAR</span></button></div></div>';
document.body.appendChild(panel);
const setLive=on=>{try{listening=!!on}catch(e){}document.body.classList.toggle('jrec',!!on)};
function draw(){
  const t=fullTxt(),tx=S('#rtx');
  tx.textContent=t||'Fale agora, senhor…';tx.classList.toggle('ph',!t);
  S('#rsd').disabled=!t;
  S('#rls').textContent=recOn?'GRAVANDO  ·  TOQUE NO REATOR PARA PARAR':'PARADO  ·  ENVIE OU DESCARTE';
  panel.classList.toggle('live',recOn);tx.scrollTop=1e5}
function mkRec(){
  const r=new SR();r.lang='pt-BR';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
  r.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;curTxt=s.trim();draw()};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){blocked=true;recOn=false;try{setSt('PERMITA O MICROFONE')}catch(x){}}};
  r.onend=()=>{
    committed=joinT(committed,curTxt);curTxt='';
    if(Date.now()-lastStart<700)fails++;else fails=0;
    if(endCb){const f=endCb;endCb=null;f();return}
    if(recOn&&!blocked&&fails<7)setTimeout(()=>{if(recOn)startMic()},200);
    else{recOn=false;setLive(false);draw()}};
  return r}
function startMic(){lastStart=Date.now();try{mic=mkRec();mic.start()}catch(e){}}
function stopBase(){[()=>rec,()=>recog,()=>recognition,()=>sr].forEach(f=>{try{const r=f();if(r&&r.abort)r.abort()}catch(e){}})}
function startRecording(){
  try{speechSynthesis.cancel()}catch(e){}
  if(typeof contOn!=='undefined'&&contOn){wasCont=true;try{setCont(false)}catch(e){}}
  stopBase();blocked=false;fails=0;recOn=true;
  setLive(true);setTimeout(()=>{if(recOn)setLive(true)},450);
  panel.classList.add('on');draw();play('open');startMic()}
function stopRecording(){recOn=false;try{mic&&mic.stop()}catch(e){}setLive(false);draw();play('click')}
function finish(){
  recOn=false;try{mic&&mic.abort()}catch(e){}
  committed='';curTxt='';panel.classList.remove('on');setLive(false);
  if(wasCont){wasCont=false;try{setCont(true)}catch(e){}}}
function sendNow(){
  const t=fullTxt();if(!t)return;
  finish();
  const inp=S('#t'),tb=S('#tb');if(!inp||!tb)return;
  inp.value=t;const b=tb.querySelector('button');
  try{if(b)b.click();else{const f=tb.tagName==='FORM'?tb:tb.closest('form');f&&f.requestSubmit&&f.requestSubmit()}}catch(e){}}
function sendRec(){
  play('ok');
  if(recOn){recOn=false;endCb=sendNow;try{mic.stop()}catch(e){sendNow();return}
    setTimeout(()=>{if(endCb){const f=endCb;endCb=null;f()}},900)}
  else sendNow()}
S('#rsd').onclick=sendRec;
S('#rcn').onclick=()=>{play('click');finish()};
/* toque no reator: começa a gravar; só para quando tocar no reator de novo */
document.addEventListener('click',e=>{
  if(!SR||!e.target.closest||!e.target.closest('#reactor'))return;
  if(typeof mainDraw!=='undefined'&&!mainDraw)return;
  if(typeof think!=='undefined'&&think&&!recOn)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(recOn)stopRecording();else startRecording()},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&recOn)stopRecording()});

/* ================= 21) ESTILOS DOS AJUSTES NOVOS ================= */
const css2=document.createElement('style');
css2.textContent=HEXCSS+`
body.ja-open>*:not(#ja-ov):not(#stw){visibility:hidden!important}
#hgrp{display:flex;align-items:center;gap:8px;margin-left:auto;flex:none}
#stb{color:var(--ac)!important;background:var(--ac)!important;animation:hp 3.2s ease-in-out infinite!important}
#stb::before{background:linear-gradient(#05182a,#020a12)!important}
#stb:active::before{background:rgba(var(--acr),.4)!important}
#hud{display:grid!important;grid-template-columns:1fr auto 1fr;align-items:start!important}
#hl{display:flex;flex-direction:column;align-items:flex-start;gap:3px}
#hb{padding-left:12px;color:var(--mut)}
#hb .ji{margin-left:5px;color:var(--ac2)}
#rec{position:fixed;left:50%;bottom:calc(104px + env(safe-area-inset-bottom));width:min(92vw,520px);z-index:75;transform:translateX(-50%) translateY(14px);opacity:0;visibility:hidden;transition:opacity .2s,transform .2s,visibility 0s linear .2s}
#rec.on{opacity:1;visibility:visible;transform:translateX(-50%);transition:opacity .2s,transform .2s,visibility 0s}
#rec .rcd{padding:12px 14px 14px;background:linear-gradient(160deg,rgba(var(--acr),.2),rgba(var(--acr),.04) 60%),rgba(2,10,20,.95);box-shadow:inset 0 0 0 1px rgba(var(--acr),.5),inset 0 0 26px rgba(var(--acr),.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)}
#rec .rlb{display:flex;align-items:center;gap:8px;font:10px var(--mono,monospace);letter-spacing:.18em;color:var(--mut)}
#rec .rlb i{width:8px;height:8px;border-radius:50%;background:var(--mut);flex:none}
#rec.live .rlb{color:var(--ac2)}
#rec.live .rlb i{background:#ff4d6a;box-shadow:0 0 10px #ff4d6a;animation:jrp 1s ease-in-out infinite}
@keyframes jrp{50%{opacity:.25}}
#rtx{margin:10px 0 12px;min-height:1.4em;max-height:6.4em;overflow-y:auto;font:15px/1.4 system-ui,sans-serif;color:var(--fg,#dff8ff);white-space:pre-wrap;word-break:break-word;scrollbar-width:none}
#rtx.ph{color:var(--mut);font-style:italic}
#rec .rbt{display:flex;gap:8px}
#rec button{display:flex;align-items:center;justify-content:center;gap:8px;border:0;font:700 11px var(--hud,Orbitron,sans-serif);letter-spacing:.14em;padding:13px 18px;clip-path:polygon(9px 0,100% 0,calc(100% - 9px) 100%,0 100%);cursor:pointer}
#rec button svg{width:16px;height:16px}
#rec .rbp{flex:1;background:var(--ac);color:#001}
#rec .rbp:disabled{opacity:.35}
#rec .rbp:active:not(:disabled){background:var(--ac2)}
#rec .rbd{background:rgba(255,90,120,.14);color:#ff7d97}
#rec .rbd:active{background:#ff5a78;color:#100}`;
document.head.appendChild(css2);

/* ================= 22) INÍCIO DOS AJUSTES ================= */
watch(document);logoHex(document);setTimeout(()=>logoHex(document),1200);
setTimeout(()=>{try{rs()}catch(e){}},120);
})();
