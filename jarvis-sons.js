/* J.A.R.V.I.S — sons 100% sintetizados (Web Audio). Substitui os bipes reserva do seu index.html.
 * Carregue DEPOIS de todos os outros scripts:  <script src="jarvis-sons.js"></script>
 * Arquivos de áudio que você escolher em Configurações continuam tendo prioridade.
 */
(() => {
  let ctx, master, bootBus, dest = null, thinkTimer = null, thinkEnd = 0;
  const R = (a, b) => a + Math.random() * (b - a);
  const out = () => dest || master;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    master = ctx.createGain(); master.gain.value = 0.8;
    bootBus = ctx.createGain(); bootBus.connect(master);
    const conv = ctx.createConvolver(), n = ctx.sampleRate * 2.4 | 0, buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    conv.buffer = buf;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(comp); master.connect(conv); conv.connect(wet); wet.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }

  function tone(f, t, d, o = {}) {
    const { type = 'sine', v = 0.2, to = null, a = 0.005, fl = null, fto = null, det = 0, pan = 0 } = o;
    const T = ctx.currentTime + t, os = ctx.createOscillator(), g = ctx.createGain();
    os.type = type; os.detune.value = det; os.frequency.setValueAtTime(f, T);
    if (to) os.frequency.exponentialRampToValueAtTime(to, T + d);
    g.gain.setValueAtTime(0.0001, T); g.gain.linearRampToValueAtTime(v, T + a); g.gain.exponentialRampToValueAtTime(0.0001, T + d);
    let last = os;
    if (fl) { const q = ctx.createBiquadFilter(); q.type = 'lowpass'; q.frequency.setValueAtTime(fl, T); if (fto) q.frequency.exponentialRampToValueAtTime(fto, T + d); os.connect(q); last = q; }
    last.connect(g);
    let o2 = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); o2 = p; }
    o2.connect(out()); os.start(T); os.stop(T + d + 0.05);
  }
  function noise(t, d, o = {}) {
    const { v = 0.15, type = 'bandpass', f = 1000, to = null, q = 1, a = 0.01 } = o;
    const T = ctx.currentTime + t, len = ctx.sampleRate * d | 0, b = ctx.createBuffer(1, len, ctx.sampleRate), dt = b.getChannelData(0);
    for (let i = 0; i < len; i++) dt[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const bq = ctx.createBiquadFilter(); bq.type = type; bq.Q.value = q; bq.frequency.setValueAtTime(f, T);
    if (to) bq.frequency.exponentialRampToValueAtTime(to, T + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, T); g.gain.linearRampToValueAtTime(v, T + a); g.gain.exponentialRampToValueAtTime(0.0001, T + d);
    s.connect(bq); bq.connect(g); g.connect(out()); s.start(T);
  }
  const bell = (f, t, d = 0.9, v = 0.15, pan = 0) => {
    tone(f, t, d, { v, pan, a: 0.003 }); tone(f * 2.756, t, d * 0.4, { v: v * 0.35, pan }); tone(f * 5.4, t, d * 0.15, { v: v * 0.15, pan });
  };
  const A3 = 220, E4 = 329.6, A4 = 440, C5 = 523.3, E5 = 659.3, A5 = 880, B5 = 987.8, E6 = 1318.5, A6 = 1760;

  const S = {
    // Sincronizado com a animação: flash 0.15s · partículas 0.3–3.4s · anéis 1.7s · scan 2.4–3.7s · progresso 2.7–4.4s · BEM-VINDO 4.5s · íris 5.5s
    boot() {
      bootBus.gain.cancelScheduledValues(0); bootBus.gain.setValueAtTime(1, ctx.currentTime); dest = bootBus;
      try {
        tone(30, 0, 5.2, { v: 0.35, a: 4.4, to: 130 });
        tone(60, 0, 5.0, { v: 0.1, a: 4.2, to: 260, type: 'sawtooth', fl: 250, fto: 2200 });
        tone(55, 0.15, 0.9, { v: 0.5, to: 28 }); noise(0.15, 0.7, { v: 0.25, type: 'lowpass', f: 3000, to: 200 });
        noise(0.3, 3.2, { v: 0.1, f: 300, to: 6000, q: 1.5, a: 2.4 });
        bell(A5, 1.3, 1.2, 0.08);
        [E5, A5, B5, E6].forEach((f, i) => { tone(300 + i * 150, 1.7 + i * 0.22, 0.5, { v: 0.07, to: 900 + i * 400, type: 'triangle', fl: 3000 }); bell(f, 1.9 + i * 0.22, 1, 0.09, i % 2 ? 0.5 : -0.5); });
        for (let i = 0; i < 14; i++) tone(R(1500, 4000), 2.1 + i * 0.09, 0.03, { v: 0.04, type: 'square', fl: 4000, pan: R(-0.7, 0.7) });
        tone(200, 2.4, 1.3, { v: 0.07, to: 3200, type: 'sawtooth', fl: 2500, fto: 6000, a: 0.2 });
        noise(2.4, 1.3, { v: 0.06, type: 'highpass', f: 2000, to: 8000, a: 0.3 });
        for (let i = 0; i < 17; i++) tone(900 + i * 45, 2.7 + i * 0.1, 0.035, { v: 0.045, type: 'square', fl: 3000 });
        for (let k = 0; k < 5; k++) bell(E6, 2.8 + k * 0.3, 0.4, 0.05, 0.6);
        // 4.5s: BEM-VINDO, SENHOR
        noise(4.5, 0.25, { v: 0.12, f: 2200, q: 2 });
        tone(110, 4.5, 1.4, { v: 0.3, to: 55 });
        [A4, E5, A5, E6].forEach((f, i) => bell(f, 4.5 + i * 0.04, 2.4, 0.14, (i - 1.5) * 0.3));
        [A4, E5, A5].forEach(f => tone(f, 4.5, 2.4, { v: 0.05, a: 0.4, type: 'sawtooth', fl: 1200, det: R(-6, 6) }));
        // 5.5s: íris abrindo
        noise(5.5, 1.2, { v: 0.1, f: 5000, to: 200, q: 1.2 }); tone(900, 5.5, 0.8, { v: 0.08, to: 200 });
      } finally { dest = null; }
    },
    stopBoot() { if (bootBus) { bootBus.gain.cancelScheduledValues(0); bootBus.gain.setTargetAtTime(0, ctx.currentTime, 0.08); } },
    welcome() { bell(A5, 0, 1.4, 0.16, -0.3); bell(E6, 0.2, 1.8, 0.14, 0.3); tone(A3, 0, 1.6, { v: 0.1, a: 0.3, fl: 500 }); },
    tap() { tone(1900, 0, 0.05, { type: 'triangle', v: 0.1, to: 1200 }); bell(2600, 0, 0.12, 0.04); },
    open() { tone(300, 0, 0.28, { v: 0.1, to: 1000, type: 'triangle', fl: 3000 }); bell(E6, 0.18, 0.5, 0.07); },
    send() { tone(600, 0, 0.14, { v: 0.12, to: 2000 }); bell(A6, 0.1, 0.5, 0.08); noise(0, 0.2, { v: 0.05, type: 'highpass', f: 3000, to: 9000 }); },
    listen() { bell(E5, 0, 0.35, 0.12); bell(B5, 0.09, 0.7, 0.14); tone(2400, 0, 0.03, { v: 0.05, type: 'square', fl: 3000 }); },
    response() { tone(1500, 0, 0.1, { v: 0.08, to: 900 }); bell(E6, 0.08, 0.6, 0.11, -0.2); bell(A6, 0.2, 1.0, 0.09, 0.2); noise(0.1, 0.6, { v: 0.03, type: 'highpass', f: 7000, a: 0.05 }); },
    success() { [A5, 1174.7, 1568, 2093].forEach((f, i) => bell(f, i * 0.07, 0.8, 0.1, (i - 1.5) * 0.3)); },
    error() {
      [0, 0.28].forEach((t, i) => { tone(220 - i * 40, t, 0.24, { type: 'sawtooth', v: 0.11, fl: 900, fto: 300 }); tone(311 - i * 55, t, 0.24, { type: 'sawtooth', v: 0.08, fl: 900, fto: 300 }); });
      noise(0, 0.5, { v: 0.05, f: 500, q: 3 });
    },
    scan() { // radar + ping
      noise(0, 0.9, { v: 0.07, f: 400, to: 5000, q: 2, a: 0.4 }); tone(300, 0, 0.9, { v: 0.05, to: 3000, type: 'triangle', fl: 4000 });
      bell(E6, 0.85, 0.9, 0.09, 0.4); bell(E6, 1.05, 0.6, 0.04, -0.4);
    },
    alert() { for (let i = 0; i < 3; i++) { bell(A6, i * 0.32, 0.5, 0.12); bell(2093, i * 0.32 + 0.12, 0.7, 0.1); } },
    theme() { noise(0, 0.6, { v: 0.09, f: 200, to: 7000, q: 1.5, a: 0.3 }); tone(200, 0, 0.6, { v: 0.07, to: 2400, type: 'triangle' }); bell(A5, 0.5, 0.8, 0.09); bell(E6, 0.58, 0.9, 0.07); },
    // pensando: pulso grave + blips de processamento
    think() {
      if (thinkTimer) return; let n = 0; thinkEnd = Date.now() + 30000;
      tone(90, 0, 0.5, { v: 0.14, to: 140 });
      thinkTimer = setInterval(() => {
        if (Date.now() > thinkEnd) return S.stopThink();
        tone([A5, C5 * 2, E6, 1568, A6][Math.random() * 5 | 0], 0, 0.07, { v: 0.045, pan: R(-0.7, 0.7) });
        if (n++ % 4 === 0) tone(110, 0, 0.3, { v: 0.09, to: 80 });
      }, 140);
    },
    stopThink() { clearInterval(thinkTimer); thinkTimer = null; }
  };

  const JS = window.JarvisSound = {};
  Object.keys(S).forEach(k => JS[k] = (...a) => { try { init(); if (master) master.gain.value = (typeof vol === 'number' ? vol : 0.8); S[k](...a); } catch (e) {} });

  // ---- liga nos eventos do seu index.html ----
  try {
    const map = { click: 'tap', listen: 'listen', send: 'send', reply: 'response', ok: 'success', err: 'error', scan: 'scan', alert: 'alert', theme: 'theme', open: 'open', boot: 'boot' };
    Object.entries(map).forEach(([k, n]) => { FB[k] = () => JS[n](); });
  } catch (e) { console.warn('FB não encontrado — carregue jarvis-sons.js depois do script principal', e); }

  // som de "pensando" acompanha o status da tela
  const st = document.getElementById('st');
  if (st) new MutationObserver(() => { st.textContent === 'PROCESSANDO' ? JS.think() : S.stopThink(); }).observe(st, { childList: true, characterData: true, subtree: true });

  // se pular a abertura, corta o som e toca só o "bem-vindo"
  const b = document.getElementById('boot');
  if (b && b.onclick) { const o = b.onclick; b.onclick = function () { try { if (t0 !== null && !iris) { S.stopBoot(); setTimeout(JS.welcome, 500); } } catch (e) {} return o.apply(this, arguments); }; }
})();
