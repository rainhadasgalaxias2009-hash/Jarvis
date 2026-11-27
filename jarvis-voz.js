/* J.A.R.V.I.S — VOZ CLONADA (Qwen3-TTS via Hugging Face Space)
   Carregue POR ÚLTIMO no index.html, depois do studio-boost.js:
   <script src="jarvis-voz.js"></script>
*/
(()=>{
/* ====== CONFIGURE AQUI ====== */
const SPACE     = "Qwen/Qwen3-TTS-Demo"; // troque pelo nome do SEU Space duplicado (usuario/nome)
const REF_AUDIO = "minha-voz.mp3";        // seu áudio, enviado para o mesmo repositório do Jarvis
const REF_TEXT  = "";                     // texto EXATO que você fala no áudio. Vazio = modo x-vector (qualidade menor)
const LANG      = "Portuguese";
const MODEL     = "0.6B";                 // "0.6B" é mais rápido, "1.7B" é melhor
/* ============================ */

const oldSpeak = window.speak;            // voz original do navegador (reserva)
let clientP = null, refBlob = null, audioEl = null, seq = 0;

const getLib = () => import("https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js");
const getClient = async () => {
  if (!clientP) clientP = getLib().then(m => m.Client.connect(SPACE));
  return clientP;
};

async function gerar(texto) {
  const lib = await getLib();
  const app = await getClient();
  if (!refBlob) refBlob = await (await fetch(REF_AUDIO)).blob();
  const r = await app.predict("/generate_voice_clone", {
    ref_audio: lib.handle_file(refBlob),
    ref_text: REF_TEXT,
    target_text: texto,
    language: LANG,
    use_xvector_only: !REF_TEXT,
    model_size: MODEL
  });
  const out = r.data && r.data[0];
  if (!out || !out.url) throw new Error((r.data && r.data[1]) || "sem áudio");
  return out.url;
}

function tocar(url) {
  return new Promise(res => {
    audioEl = new Audio(url);
    audioEl.onplay = () => { speaking = true; setSt("FALANDO"); };
    audioEl.onended = audioEl.onerror = () => res();
    audioEl.play().catch(() => res());
  });
}

window.speak = async function (t) {
  const id = ++seq;
  const limpo = String(t).replace(/[*#_`]/g, "").trim();
  if (!limpo) return;
  try { speechSynthesis.cancel(); } catch (e) {}
  if (audioEl) { audioEl.pause(); audioEl = null; }
  setSt("GERANDO VOZ");
  const partes = limpo.match(/[^.!?…]+[.!?…]*/g) || [limpo];
  const pedir = s => gerar(s.trim()).catch(e => { console.warn("voz clonada falhou:", e); return null; });
  try {
    let proxima = pedir(partes[0]);
    for (let i = 0; i < partes.length; i++) {
      const url = await proxima;
      if (id !== seq) return;                          // veio outra fala, cancela esta
      if (i + 1 < partes.length) proxima = pedir(partes[i + 1]); // já gera a próxima enquanto toca esta
      if (url) await tocar(url);
      else await oldSpeak(partes[i]);                  // se falhar, usa a voz do navegador
      if (id !== seq) return;
    }
  } finally {
    if (id === seq) {
      speaking = false;
      if (!listening && !think) setSt("AGUARDANDO COMANDO");
    }
  }
};
})();
