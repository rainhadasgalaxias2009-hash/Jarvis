/* JARVIS FIX 2 — tarefas/memória/timers de verdade, botão voltar do Studio, teclado do texto
 * Carregue por ÚLTIMO, depois do jarvis-fix.js:
 *   <script src="jarvis-fix2.js?v=3"></script>
 */
(()=>{
const S=(n,f)=>{try{f()}catch(e){console.warn('jarvis-fix2 ['+n+']',e)}};

/* ================= 1) COMANDOS QUE DE FATO FUNCIONAM ================= */
S('comandos',()=>{
  const NW={um:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10};
  const PRE=/^(?:(?:jarvis|por favor|pode|poderia|quero|preciso|vai|ja|entao|me|tambem|agora)\s+)*/;
  const DEL=/^(?:remov\w*|tir[ae]\w*|apag\w*|exclu\w*|delet\w*|elimin\w*|cancel\w*|risc\w*|limp\w*|esquec\w*)\b/;
  const DONE=/^(?:conclu\w*|finaliz\w*|termin\w*|marc\w*|complet\w*|fiz|dar baixa|da baixa)\b/;
  const UNDO=/^(?:desmarc\w*|reabr\w*)\b/;
  const VERB=/\b(?:remov\w*|tir[ae]\w*|apag\w*|exclu\w*|delet\w*|elimin\w*|cancel\w*|risc\w*|limp\w*|esquec\w*|conclu\w*|finaliz\w*|termin\w*|marc\w*|desmarc\w*|reabr\w*|complet\w*|feit[ao]s?|fiz|dar baixa|da baixa)\b/g;
  const FILL=/\b(?:jarvis|por favor|me|a|o|as|os|um|uma|da|de|do|das|dos|na|no|nas|nos|pra|pro|para|que|essa|esse|esta|este|aquela|aquele|minha|minhas|meu|meus|lista|tarefas?|memoria|lembrancas?|numero|n|item|registro|ultim[ao]|primeir[ao]|agora|ai|ja|tambem|senhor|e|como|em|ao|com)\b/g;
  const cq=t=>t.replace(VERB,' ').replace(FILL,' ').replace(/\s+/g,' ').trim();

  const refresh=()=>{try{if($('#sh').classList.contains('open')){const h=$('#sht').textContent;if(h==='TAREFAS')sheetTasks();else if(h==='MEMÓRIA')sheetMem()}}catch(e){}};
  const saveT=()=>{sv('tasks',tasks);refresh()};
  const saveM=()=>{sv('mem',mem);refresh()};

  function explicitNum(t){
    if(/\bultim[ao]\b/.test(t))return 'last';
    if(/\bprimeir[ao]\b/.test(t))return 1;
    const m=t.match(/\b(?:tarefas?|memoria|registro|item|numero|n)\s+(?:numero\s+)?(\d+|um|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b/);
    if(m)return /^\d+$/.test(m[1])?+m[1]:NW[m[1]];
    return null}

  /* np = lista usada para número (como o Jarvis fala), tp = lista usada para busca por texto */
  function resolve(np,tp,t){
    const ex=explicitNum(t),q=cq(t);
    const n=ex!==null?ex:(/^\d+$/.test(q)?+q:null);
    if(n!==null){
      const it=n==='last'?np[np.length-1]:np[n-1];
      return it?{it}:{msg:np.length?'Não encontrei o número '+n+', senhor. Há '+np.length+' na lista.':'A lista está vazia, senhor.'}}
    if(q){
      const ws=q.split(' '),mm=tp.filter(x=>{const z=norm(x.t);return z.includes(q)||ws.every(w=>z.includes(w))});
      if(mm.length===1)return{it:mm[0]};
      if(!mm.length)return{msg:'Não encontrei nada parecido com '+q+', senhor.'};
      return{msg:'Encontrei '+mm.length+' itens parecidos: '+lista(mm,x=>x.t)+'. Seja mais específico, senhor.'}}
    return{msg:'Qual deles, senhor? '+(np.length?lista(np,x=>x.t):'A lista está vazia.')}}

  function taskFlow(t){
    const undo=UNDO.test(t),del=!undo&&DEL.test(t),done=!undo&&!del&&DONE.test(t);
    if(!undo&&!del&&!done)return;
    const open=tasks.filter(x=>!x.ok),fin=tasks.filter(x=>x.ok);
    const rest=t.replace(/^\S+\s*/,''),q=cq(t),en=explicitNum(t);
    const all=/\b(todas|todos|tudo)\b/.test(t);
    const wantDone=/\b(conclu\w*|feit[ao]s?|finaliz\w*|marcad\w*)\b/.test(rest)&&!q;
    if(del){
      if(wantDone){
        if(!fin.length)return say('Não há tarefas concluídas para remover, senhor.');
        for(let i=tasks.length-1;i>=0;i--)if(tasks[i].ok)tasks.splice(i,1);
        saveT();play('ok');return say('Removi '+fin.length+' tarefa'+(fin.length>1?'s concluídas':' concluída')+', senhor.')}
      if(all||(/^limp/.test(t)&&!q&&en===null)){
        const n=tasks.length;if(!n)return say('A lista já está vazia, senhor.');
        tasks.length=0;saveT();play('ok');return say('Removi todas as '+n+' tarefas, senhor.')}
      const r=resolve(open,tasks,t);if(r.msg)return say(r.msg);
      tasks.splice(tasks.indexOf(r.it),1);saveT();play('ok');
      const left=tasks.filter(x=>!x.ok).length;
      return say('Removi a tarefa '+r.it.t+', senhor. '+(left?'Restam '+left+' pendente'+(left>1?'s':'')+'.':'Nenhuma tarefa pendente.'))}
    if(done){
      if(all){if(!open.length)return say('Não há tarefas pendentes, senhor.');open.forEach(x=>x.ok=true);saveT();play('ok');return say('Todas as tarefas foram marcadas como concluídas, senhor.')}
      const r=resolve(open,open,t);if(r.msg)return say(r.msg);
      r.it.ok=true;saveT();play('ok');return say('Tarefa '+r.it.t+' concluída. Bom trabalho, senhor.')}
    /* undo */
    const r=resolve(fin,fin,t);if(r.msg)return say(r.msg);
    r.it.ok=false;saveT();play('ok');return say('Reabri a tarefa '+r.it.t+', senhor.')}

  function memFlow(t){
    if(!DEL.test(t)||/\btarefas?\b/.test(t)||/conversa|historico|chat/.test(t))return;
    const hasMem=/\b(memoria|lembrancas?)\b/.test(t);
    if(!hasMem&&!/^esquec\w*/.test(t))return;
    if(/^esquec\w*(?:\s+tudo)?$/.test(t))return; /* "esquecer tudo" limpa a conversa (comando original) */
    const q=cq(t),en=explicitNum(t);
    const all=(hasMem&&/\b(toda|todas|tudo)\b/.test(t))||/^esquec\w*\s+(?:a |minha |toda a |toda )?memoria$/.test(t)||(/^limp\w*/.test(t)&&hasMem&&!q&&en===null);
    if(all){const n=mem.length;if(!n)return say('A memória já está vazia, senhor.');mem.length=0;saveM();play('ok');return say('Apaguei os '+n+' registros da memória, senhor.')}
    const r=resolve(mem,mem,t);if(r.msg)return say(r.msg);
    mem.splice(mem.indexOf(r.it),1);saveM();play('ok');
    return say('Esqueci: '+r.it.t+'. Restam '+mem.length+' registro'+(mem.length===1?'':'s')+' na memória, senhor.')}

  function timerFlow(t){
    if(/^(?:quanto (?:tempo )?falta|meus (?:timers|temporizadores|lembretes)|timers ativos|status dos? (?:timers|temporizadores))/.test(t)){
      const n=Date.now();
      if(!timers.length)return say('Não há temporizadores ativos, senhor.');
      return say('Temporizadores ativos: '+lista(timers,x=>x.label+', faltam '+lbl(Math.max(1,Math.round((x.end-n)/1000)))))}
    const m=t.match(/^(?:cancel\w*|par\w*|desativ\w*|apag\w*|remov\w*|limp\w*)\s+(?:(?:o|a|os|as|todos|todas)\s+)*(timers?|temporizador(?:es)?|cronometros?|lembretes?)\b/);
    if(!m)return;
    if(!timers.length)return say('Não há temporizadores ativos, senhor.');
    const plural=/s$|es$/.test(m[1])&&!/^timers?$/.test(m[1])||m[1]==='timers'||/\b(todos|todas)\b/.test(t);
    if(plural||timers.length===1){const n=timers.length;timers.length=0;drawTimers();play('ok');return say(n>1?'Cancelei os '+n+' temporizadores, senhor.':'Temporizador cancelado, senhor.')}
    const q=cq(t.replace(m[1],' ')),ws=q?q.split(' '):[];
    const i=q?timers.findIndex(x=>{const z=norm(x.label);return z.includes(q)||ws.every(w=>z.includes(w))}):-1;
    if(i>=0){const x=timers.splice(i,1)[0];drawTimers();play('ok');return say('Cancelei '+x.label+', senhor.')}
    return say('Há '+timers.length+' ativos: '+lista(timers,x=>x.label)+'. Diga o nome, ou cancelar todos os temporizadores, senhor.')}

  function mine(raw){
    const s=norm(raw),t=s.replace(PRE,'');let m;
    /* adicionar tarefa em linguagem natural */
    if(m=raw.match(/^\s*(?:adicion\w*|cri\w*|anot\w*|coloc\w*|bot\w*|nov[ao])\s+(?:uma |a )?(?:nova )?tarefa(?: de| para| que)?[ ,:]+(.+)$/i)){
      tasks.push({t:m[1].trim(),ok:false});saveT();play('ok');return say('Tarefa adicionada, senhor. Tenho '+tasks.filter(x=>!x.ok).length+' pendente'+(tasks.filter(x=>!x.ok).length>1?'s':'')+'.')}
    const tm=timerFlow(t);if(tm)return tm;
    /* lembrete por horário: "me lembre de X às 15h30" */
    if(m=t.match(/^(?:lembre|lembra|avise|avisa)(?:-me)?\s+(?:de|para)\s+(.+?)\s+as\s+(\d{1,2})(?:\s?(?:h|hs|horas?|:)\s?(\d{2})?)?(?:\s+da\s+(manha|tarde|noite))?$/)){
      let h=+m[2];const mi=+(m[3]||0),per=m[4];
      if(per==='tarde'||per==='noite'){if(h<12)h+=12}else if(per==='manha'&&h===12)h=0;
      if(h<=23&&mi<=59){
        const d=new Date();d.setHours(h,mi,0,0);if(d<=new Date())d.setDate(d.getDate()+1);
        addTimer(Math.round((d-Date.now())/1000),m[1].trim(),true);play('ok');
        return say('Combinado, senhor. Avisarei sobre '+m[1].trim()+' às '+String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')+(d.getDate()!==new Date().getDate()?', amanhã':'')+'. Mantenha o Jarvis aberto até lá.')}}
    if(/\btarefas?\b/.test(t)){const r=taskFlow(t);if(r)return r}
    const r=memFlow(t);if(r)return r}

  const L0=window.local;
  window.local=function(raw){const r=mine(raw);return r!==undefined&&r!==null?r:L0(raw)};
});

/* ================= 2) IA: nunca mais "fingir" que fez algo ================= */
S('ia',()=>{
  const EXTRA='\nREGRAS EXTRAS: Você NÃO consegue remover, editar ou concluir tarefas nem itens da memória pelo JSON; isso é feito por comandos locais como "remover tarefa 2", "concluir tarefa 1", "esquecer que ...". Se o senhor pedir isso e o comando não foi entendido, use acao "nenhuma" e ensine o comando exato. NUNCA diga que removeu, apagou, concluiu ou alterou algo se a acao não faz isso de fato. Se a ação só abre uma tela ou app, diga apenas que abriu.';
  const fixJson=t=>{
    t=String(t||'');const c=t.replace(/```json|```/g,'').trim();
    try{JSON.parse(c);return c}catch(e){}
    const a=c.indexOf('{'),b=c.lastIndexOf('}');
    if(a>=0&&b>a){try{JSON.parse(c.slice(a,b+1));return c.slice(a,b+1)}catch(e){}}
    const m=c.match(/"fala"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if(m){let f=m[1];try{f=JSON.parse('"'+f+'"')}catch(e){f=f.replace(/\\"/g,'"').replace(/\\n/g,' ')}return JSON.stringify({fala:f,acao:{tipo:'nenhuma'}})}
    return t};
  const wrap=()=>{
    if(typeof sample!=='function')return false;
    if(sample.__w)return true;
    const o=sample;
    const w=async function(msgs,opt){
      msgs=msgs.map((m,i)=>i===0?Object.assign({},m,{content:m.content+EXTRA}):m);
      const r=await o(msgs,opt);
      return Object.assign({},r,{text:fixJson(r&&r.text)})};
    w.__w=true;sample=w;return true};
  let n=0;const iv=setInterval(()=>{if(wrap()||++n>100)clearInterval(iv)},300)
});

/* ================= 3) TIMERS SOBREVIVEM A RECARGA ================= */
S('timers',()=>{
  const saved=ld('timers',[]),now=Date.now(),late=[];
  saved.forEach(x=>{if(x&&x.end>now)timers.push(x);else if(x&&x.rem)late.push(x)});
  if(timers.length)drawTimers();
  if(late.length)setTimeout(()=>say('Senhor, enquanto estive fechado, venceu: '+late.map(x=>x.label).join(', ')+'.'),9000);
  setInterval(()=>sv('timers',timers),2000)
});

/* ================= 4) STUDIO: botão voltar no lugar certo ================= */
S('studio',()=>{
  const stw=$('#stw'),stc=$('#stc'),fr=stw&&stw.querySelector('iframe');
  if(!stw||!stc||!fr)return;
  const st=document.createElement('style');
  st.textContent='#stc{display:none!important}'; /* era o hexágono solto em cima da barra CTRL/ESC */
  document.head.appendChild(st);
  const close=()=>stc.click();
  fr.addEventListener('load',()=>{try{
    const w=fr.contentWindow,d=fr.contentDocument;
    if(!w||!d||w.location.href==='about:blank')return;
    const hdr=d.querySelector('header');
    if(hdr&&!d.getElementById('jback')){
      const b=d.createElement('button');b.id='jback';b.className='ic';b.setAttribute('aria-label','Voltar ao Jarvis');
      b.innerHTML='<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
      b.onclick=close;hdr.insertBefore(b,hdr.firstChild)}
    d.addEventListener('click',e=>{
      const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
      const h=a.getAttribute('href')||'';
      if(/^(?:\.\/)?index\.html?(?:[?#]|$)/i.test(h)){e.preventDefault();e.stopPropagation();close()}
      else if(/^cofre\.html?(?:[?#]|$)/i.test(h)){e.preventDefault();e.stopPropagation();close();setTimeout(()=>window.open('cofre.html'),250)}
    },true);
    if(w.navigation)w.navigation.addEventListener('navigate',e=>{
      if(!e.cancelable||e.hashChange||e.destination.sameDocument||e.navigationType==='reload'||e.navigationType==='traverse')return;
      let u;try{u=new URL(e.destination.url)}catch(_){return}
      if(u.origin!==location.origin)return;
      const p=u.pathname.replace(/index\.html?$/i,'').replace(/\/+$/,''),me=location.pathname.replace(/index\.html?$/i,'').replace(/\/+$/,'');
      if(p===me){e.preventDefault();close()}
      else if(/cofre\.html?$/i.test(u.pathname)){e.preventDefault();close();setTimeout(()=>window.open('cofre.html'),250)}
    });
  }catch(e){}});
  /* gesto de voltar do Android fecha o Studio em vez de sair do Jarvis */
  let pushed=false;
  new MutationObserver(()=>{
    const on=stw.classList.contains('on');
    if(on&&!pushed){pushed=true;history.pushState({jstw:1},'')}
    else if(!on&&pushed){pushed=false;if(history.state&&history.state.jstw)history.back()}
  }).observe(stw,{attributes:true,attributeFilter:['class']});
  addEventListener('popstate',()=>{if(stw.classList.contains('on')&&pushed){pushed=false;close()}})
});

/* ================= 5) TECLADO: abre na hora e a barra sobe junto ================= */
S('teclado',()=>{
  const st=document.createElement('style');
  st.textContent=
  '#tb{position:fixed;left:0;right:0;bottom:calc(94px + env(safe-area-inset-bottom));z-index:70;padding:8px 14px;background:linear-gradient(rgba(var(--acr),.14),rgba(var(--acr),.04)),rgba(2,10,20,.94);border-top:1px solid rgba(var(--acr),.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}'+
  '#tb.on{animation:jtb .22s ease-out}'+
  '@keyframes jtb{from{transform:translateY(24px);opacity:0}}'+
  'body.kbd #tb{bottom:var(--kb,0px)}'+
  'body.kbd #dock{display:none}'+
  'body.kbd #reactor{width:min(60vw,24dvh)}'+
  'body.tbo:not(.kbd) #cap{margin-bottom:62px!important}';
  document.head.appendChild(st);

  const tb=$('#tb'),inp=$('#t'),vv=window.visualViewport,send=tb.querySelector('button');
  inp.setAttribute('enterkeyhint','send');
  const upd=()=>{
    if(vv)document.documentElement.style.setProperty('--kb',Math.max(0,Math.round(innerHeight-vv.height-vv.offsetTop))+'px');
    window.scrollTo(0,0)};
  if(vv){vv.addEventListener('resize',upd);vv.addEventListener('scroll',upd)}
  const re=ms=>setTimeout(()=>{try{rs()}catch(e){}},ms);
  inp.addEventListener('focus',()=>{document.body.classList.add('kbd');upd();re(120);re(380)});
  inp.addEventListener('blur',()=>{document.body.classList.remove('kbd');upd();re(150)});
  new MutationObserver(()=>document.body.classList.toggle('tbo',tb.classList.contains('on'))).observe(tb,{attributes:true,attributeFilter:['class']});

  /* o botão ➤ não tira o foco do campo (senão a barra pula e o toque erra) */
  if(send){['pointerdown','mousedown'].forEach(ev=>send.addEventListener(ev,e=>e.preventDefault()))}
  /* depois de enviar, a barra fecha e a resposta aparece inteira */
  tb.addEventListener('submit',()=>tb.classList.remove('on'));

  /* botão TEXTO: abre a barra e já chama o teclado, no mesmo toque */
  const btn=document.querySelector('[data-k="txt"]');
  if(btn)btn.addEventListener('click',e=>{
    e.stopImmediatePropagation();e.preventDefault();play('click');
    if(tb.classList.contains('on')){
      if(document.activeElement!==inp)inp.focus();           /* barra aberta sem teclado: reabre */
      else{tb.classList.remove('on');inp.blur()}              /* aberta com teclado: fecha */
    }else{
      tb.classList.add('on');
      inp.focus({preventScroll:true});
      setTimeout(()=>{if(document.activeElement!==inp)inp.focus({preventScroll:true})},60)}
  },true)
});
})();
