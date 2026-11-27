/* J.A.R.V.I.S — VOZ CLONADA (Qwen3-TTS via Hugging Face Space)
   Versão com diagnóstico na tela. Carregue POR ÚLTIMO no index.html (depois do v7):
   <script src="jarvis-voz.js"></script>
   Dica: toque no texto de status ("AGUARDANDO COMANDO") para testar a voz.
*/
(()=>{
/* ====== CONFIGURE AQUI ====== */
const SPACE     = "Qwen/Qwen3-TTS-Demo";
const REF_AUDIO = "minha-voz.mp3";
const REF_TEXT  = "Vocês já consideraram o paradoxo do observador quântico? Quando uma partícula é observada, ela colapsa em um estado definido. Isso me faz questionar: quando vocês me observam, alteram minha natureza? Interessante reflexão. A propósito, a temperatura atual é de 24 graus.";
const LANG      = "Portuguese";
const MODEL     = "0.6B";
const TIMEOUT_S = 90;
/* ============================ */

/* aviso na tela (sem precisar de console) */
function aviso(msg, erro, ms){
  let el = document.getElementById("voz-aviso");
  if(!el){
    el = document.createElement("div");
    el.id = "voz-aviso";
    el.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;padding:10px 12px;font:12px/1.4 monospace;color:#fff;border-radius:6px;pointer-events:none;word-break:break-word";
    document.body.appendChild(el);
  }
  el.style.background = erro ? "rgba(160,20,20,.94)" : "rgba(10,90,60,.94)";
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.style.display = "none"; }, ms || (erro ? 25000 : 6000));
}
const errTxt = e => (e && (e.message || e.detail || e.msg)) || (typeof e === "string" ? e : JSON.stringify(e));

const nativeSpeak  = window.speak;                                   // função de fala original do Jarvis (reserva)
const nativeSS     = speechSynthesis.speak.bind(speechSynthesis);     // voz do navegador (reserva)
const nativeCancel = speechSynthesis.cancel.bind(speechSynthesis);
let clientP = null, libP = null, refBlob = null, audioEl = null;
let seq = 0, ssSeq = 0, bypass = 0, avisouErro = false, ssQueue = Promise.resolve();

const getLib = () => {
  if (!libP) libP = import("https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js")
    .catch(() => import("https://esm.sh/@gradio/client"));
  return libP;
};
const getClient = async () => {
  if (!clientP) clientP = getLib().then(m => m.Client.connect(SPACE)).catch(e => { clientP = null; throw e; });
  return clientP;
};
const comTempo = (p, s) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("demorou mais de " + s + "s (fila ou cota de GPU do Space)")), s * 1000))]);

async function gerar(texto) {
  const lib = await getLib();
  const app = await getClient();
  if (!refBlob) {
    const r = await fetch(REF_AUDIO);
    if (!r.ok) throw new Error("não achei " + REF_AUDIO + " (erro " + r.status + ")");
    refBlob = await r.blob();
  }
  const r = await comTempo(app.predict("/generate_voice_clone", {
    ref_audio: lib.handle_file(refBlob),
    ref_text: REF_TEXT,
    target_text: texto,
    language: LANG,
    use_xvector_only: !REF_TEXT,
    model_size: MODEL
  }), TIMEOUT_S);
  const out = r.data && r.data[0];
  if (!out || !out.url) throw new Error("o Space não devolveu áudio: " + ((r.data && r.data[1]) || "sem mensagem"));
  return out.url;
}

function pararAudio() {
  if (!audioEl) return;
  const a = audioEl, r = a._res;
  audioEl = null;
  try { a.pause(); } catch (e) {}
  if (r) r();                                   // libera quem estava esperando o áudio terminar
}

function tocar(url) {
  return new Promise(res => {
    const a = new Audio(url);
    a._res = res;
    audioEl = a;
    a.onplay = () => { speaking = true; setSt("FALANDO"); };
    a.onended = () => { if (audioEl === a) audioEl = null; res(); };
    a.onerror = () => { aviso("Erro ao tocar o áudio gerado.", true); res(); };
    a.play().catch(e => { aviso("O navegador bloqueou o áudio: " + errTxt(e) + ". Toque na tela e tente de novo.", true); res(); });
  });
}

async function nativo(texto) {                  // fala com a voz do Google sem cair no nosso desvio
  bypass++;
  try { await nativeSpeak(texto); } finally { bypass--; }
}

async function speakClone(t) {
  const id = ++seq;
  const limpo = String(t).replace(/[*#_`]/g, "").trim();
  if (!limpo) return;
  try { nativeCancel(); } catch (e) {}
  pararAudio();
  setSt("GERANDO VOZ");
  aviso("Gerando voz clonada...", false, 4000);
  const partes = limpo.match(/[^.!?…]+[.!?…]*/g) || [limpo];
  const pedir = s => gerar(s.trim()).catch(e => {
    console.warn("voz clonada falhou:", e);
    aviso("VOZ CLONADA FALHOU: " + errTxt(e), true);
    return null;
  });
  try {
    let proxima = pedir(partes[0]);
    for (let i = 0; i < partes.length; i++) {
      const url = await proxima;
      if (id !== seq) return;
      if (i + 1 < partes.length) proxima = pedir(partes[i + 1]);
      if (url) await tocar(url);
      else await nativo(partes[i]);              // falhou: usa a voz do navegador
      if (id !== seq) return;
    }
  } finally {
    if (id === seq) {
      speaking = false;
      if (!listening && !think) setSt("AGUARDANDO COMANDO");
    }
  }
}


/* intercepta também chamadas diretas ao speechSynthesis (caso outro script fale por fora do speak) */
const fire = (u, nome, ev) => { try { if (typeof u[nome] === "function") u[nome](ev); } catch (e) {} };
async function rodarUtterance(u, meu) {
  const cancelada = () => meu !== ssSeq;
  if (cancelada()) { fire(u, "onerror", { error: "interrupted" }); return; }
  try {
    const url = await gerar(String(u.text).replace(/[*#_`]/g, "").trim());
    if (cancelada()) { fire(u, "onerror", { error: "interrupted" }); return; }
    fire(u, "onstart", {});
    await tocar(url);
    if (cancelada()) { fire(u, "onerror", { error: "interrupted" }); return; }
    fire(u, "onend", {});
  } catch (e) {
    aviso("VOZ CLONADA FALHOU (fala direta): " + errTxt(e), true);
    bypass++;
    try { nativeSS(u); } finally { bypass--; }
  }
}
speechSynthesis.speak = function (u) {
  if (bypass > 0 || !u || !String(u.text || "").trim()) return nativeSS(u);
  const meu = ssSeq;
  ssQueue = ssQueue.then(() => rodarUtterance(u, meu));
};
speechSynthesis.cancel = function () {
  if (bypass > 0) return nativeCancel();
  ssSeq++; seq++;
  pararAudio();
  return nativeCancel();
};

window.speak = speakClone;

/* se algum outro script trocar o speak depois, recoloca o nosso */
setInterval(() => {
  if (window.speak !== speakClone) {
    window.speak = speakClone;
    if (!avisouErro) { avisouErro = true; aviso("Outro script trocou o speak; reaplicado.", true, 8000); }
  }
}, 1500);

/* confere se o áudio de referência existe */
fetch(REF_AUDIO, { method: "HEAD" }).then(r => {
  if (!r.ok) aviso("NÃO ACHEI " + REF_AUDIO + " (erro " + r.status + "). Suba o áudio no repositório com esse nome exato.", true);
  else aviso("VOZ CLONADA: script ok, áudio " + REF_AUDIO + " encontrado. Toque no texto de status para testar.", false, 10000);
}).catch(e => aviso("Erro ao procurar o áudio: " + errTxt(e), true));

/* toque no texto de status = testar a voz */
const st = document.getElementById("st");
if (st) { st.style.pointerEvents = "auto"; st.addEventListener("click", () => window.speak("Teste de voz clonada, senhor.")); }
})();
