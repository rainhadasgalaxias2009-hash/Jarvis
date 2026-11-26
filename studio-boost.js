/* STUDIO BOOST — carregue no FIM do studio.html, depois do script principal:
   <script src="studio-boost.js"></script>  (logo antes de </body>)          */
(()=>{
/* 1) menos efeitos pesados de GPU */
const st=document.createElement('style');
st.textContent='#neb::after,.jscan{display:none!important}#cm{filter:none!important}#ed{contain:layout paint style}body{overscroll-behavior:none}';
document.head.appendChild(st);

/* 2) limites de "turbo" mais baixos e autocomplete menos agressivo */
tune=function(){const m=meta(cur),n=m?m.len:0,L=ed.session.getLength(),P=n>150000||L>3000;PERF=P;
  if(P&&ed.session.getUseWrapMode())ed.session.setUseWrapMode(false);
  ed.setOptions({enableLiveAutocompletion:!P,enableBasicAutocompletion:!P,enableSnippets:!P,highlightActiveLine:!P,highlightSelectedWord:!P,behavioursEnabled:!P,displayIndentGuides:!P,liveAutocompletionDelay:250,liveAutocompletionThreshold:2});stat()};

/* 3) COLAR GRANDE: texto entra de uma vez, sem auto-indentação, sem realce, sem autocomplete.
      O realce volta depois, em fatias (o Ace tokeniza em segundo plano) */
function bigInsert(text){
  const s=ed.session,id=cur,mt=meta(id),modeId=s.$modeId,wrap=s.getUseWrapMode();
  hideMenu();
  if(!ed.selection.isEmpty())s.remove(ed.getSelectionRange());
  ed.setOptions({behavioursEnabled:false,enableLiveAutocompletion:false,enableBasicAutocompletion:false,enableSnippets:false,highlightActiveLine:false});
  s.setMode('ace/mode/text');if(wrap)s.setUseWrapMode(false);
  const end=s.insert(ed.getCursorPosition(),text.replace(/\r\n?/g,'\n'));
  if(mt)mt.len=(mt.len||0)+text.length;
  ed.selection.moveToPosition(end);ed.clearSelection();ed.renderer.scrollCursorIntoView(end,.5);
  play('ok');toast('COLADO');
  setTimeout(()=>{if(cur!==id)return;if(!mt||mt.len<=HUGE)s.setMode(modeId);tune();if(wrap&&!PERF)s.setUseWrapMode(true)},350)}
fastInsert=bigInsert;           /* o menu "Colar" e o código antigo passam a usar esta versão */

const big=t=>typeof t==='string'&&t.length>3000&&!ed.getReadOnly()&&!ed.inMultiSelectMode;
const TXT=ed.textInput.getElement();
TXT.addEventListener('paste',e=>{const t=e.clipboardData&&e.clipboardData.getData('text/plain');
  if(big(t)){e.preventDefault();e.stopImmediatePropagation();bigInsert(t)}},true);
TXT.addEventListener('beforeinput',e=>{if(e.inputType!=='insertFromPaste')return;
  const t=e.data||(e.dataTransfer&&e.dataTransfer.getData('text/plain'));
  if(big(t)){e.preventDefault();e.stopImmediatePropagation();bigInsert(t)}},true);
/* teclados Android entregam o texto colado como "digitação": também desviamos */
const _ot=ed.onTextInput.bind(ed);
ed.onTextInput=(t,c)=>big(t)?bigInsert(t):_ot(t,c);
})();
