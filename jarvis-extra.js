/* J.A.R.V.I.S — extras
 * 1) Abertura com vários sons, cada um num momento da animação
 * 2) Cofre / estúdio abrem POR CIMA do Jarvis (o Jarvis nunca é descarregado, então não reinicia)
 * 3) Com Studio/Cofre abertos, todo o visual do Jarvis é congelado (acaba o lag)
 * Carregue por ÚLTIMO: <script src="jarvis-extra.js"></script> (depois do jarvis-leve.js)
 */

/* ========== 1) ABERTURA: VÁRIOS SONS ========== */
(function () {
  try {
    // [chave, nome na tela, sugestão, segundo da animação em que toca]
    // Tempos ajustados para a abertura do jarvis-intro.js
    const OP = [
      ['boot_a', 'Abertura · impacto (0,2s)', 'Epic futuristic movie accent', 0.15],
      ['boot_b', 'Abertura · anéis surgindo (1,7s)', 'Futuristic machine starting', 1.7],
      ['boot_t', 'Abertura · título (1,9s)', 'Intro text glitch', 1.9],
      ['boot_d', 'Abertura · carregando (2,2s)', 'Sci fi loading operative system', 2.2],
      ['boot_c', 'Abertura · scanner (2,6s)', 'Futuristic sweep pass by', 2.6],
      ['boot_e', 'Abertura · BEM-VINDO (4,1s)', 'Sci Fi positive notification', 4.1],
      ['boot_f', 'Abertura · saída da interface (5,3s)', 'Sci fi warp slide', 5.3]
    ];
    SLOTS[0][1] = 'Abertura · início (0s)';
    SLOTS.splice(1, 0, ...OP.map(o => [o[0], o[1], o[2]]));
    loadSounds(); // recarrega arquivos salvos, agora incluindo os novos espaços

    let tm = [], auds = [], played = new Set();

    // chamado pela abertura (jarvis-intro.js) quando o usuário toca em INICIAR
    let startedAt = 0;
    window.jaOpenStart = function () {
      const now = performance.now();
      if (now - startedAt < 500) return; // evita agendar duas vezes
      startedAt = now;
      tm.forEach(clearTimeout); tm = []; auds = []; played.clear();
      OP.forEach(([k, , , t]) => tm.push(setTimeout(() => {
        played.add(k); const a = play(k); if (a) auds.push(a);
      }, t * 1000)));
    };

    // chamado quando o usuário toca para PULAR a abertura
    window.jaOpenSkip = function () {
      tm.forEach(clearTimeout); tm = [];
      auds.forEach(a => { try { a.pause(); } catch (e) {} }); auds = [];
      if (!played.has('boot_e')) { played.add('boot_e'); const a = play('boot_e'); if (a) auds.push(a); }
    };

    /* >>> FUNCIONA COM QUALQUER ABERTURA NO AR: todas chamam play('boot') ao tocar em INICIAR */
    const _play = play;
    play = function (k, o) {
      if (k === 'boot' && !(o && o.force)) { try { window.jaOpenStart(); } catch (e) {} }
      return _play.apply(this, arguments);
    };

    /* toque durante a abertura = pular (para os sons e toca só o de boas-vindas) */
    document.addEventListener('pointerdown', () => {
      const d = performance.now() - startedAt;
      if (startedAt && d > 600 && d < 5300) { startedAt = 0; try { window.jaOpenSkip(); } catch (e) {} }
    }, true);

    /* >>> A voz da abertura SEMPRE diz só "Bem-vindo, senhor." (qualquer abertura) */
    const _speak = speak;
    speak = function (t) {
      if (typeof t === 'string' && /Todos os sistemas estão operacionais/.test(t)) t = 'Bem-vindo, senhor.';
      return _speak.call(this, t);
    };
  } catch (e) { console.warn('jarvis-extra (abertura): não aplicado', e); }
})();

/* ========== 2) COFRE / ESTÚDIO POR CIMA DO JARVIS ========== */
(function () {
  try {
    const KEEP = /estudio|studio/i; // fica guardado em segundo plano ao voltar (abas e edições intactas). O cofre fecha, pois salva na hora.
    const norm = p => p.replace(/index\.html?$/i, '').replace(/\/+$/, '');
    const isApp = x => x.origin === location.origin && norm(x.pathname) !== norm(location.pathname) &&
      !/\.(mp3|wav|ogg|m4a|json|png|jpe?g|webp|gif|svg|js|css|txt|pdf)$/i.test(x.pathname);

    const css = document.createElement('style');
    css.textContent = '#ja-ov{position:fixed;inset:0;z-index:100;display:none;background:#000308}' +
      '#ja-ov iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000308}';
    document.head.appendChild(css);
    const ov = document.createElement('div'); ov.id = 'ja-ov'; document.body.appendChild(ov);

    // Com o painel aberto o Jarvis para de desenhar (economiza bateria), mas continua vivo: timers, voz e microfone seguem funcionando.
    let paused = false, open = false;
    const _re = reactor, _bg = bgdraw;
    reactor = function () { if (!paused) return _re.apply(this, arguments); };
    bgdraw = function () { if (!paused) return _bg.apply(this, arguments); };

    const frames = new Map();
    const flushFrame = f => { try { f.contentWindow.dispatchEvent(new Event('pagehide')); } catch (_) {} }; // o studio salva ao receber isso

    function hide(fromPop) {
      if (!open) return;
      open = false; ov.style.display = 'none'; paused = false;
      frames.forEach((f, k) => { flushFrame(f); if (!KEEP.test(k)) { f.remove(); frames.delete(k); } else f.style.display = 'none'; });
      if (!fromPop && history.state && history.state.ja) history.back();
    }

    function onLoad(f, key) {
      try {
        const w = f.contentWindow; if (w.location.href === 'about:blank') return;
        if (norm(w.location.pathname) === norm(location.pathname)) { f.remove(); frames.delete(key); hide(); return; } // carregou o próprio Jarvis dentro do quadro
        if (w.navigation) w.navigation.addEventListener('navigate', e => {
          if (e.destination.sameDocument || !e.cancelable || e.navigationType === 'reload' || e.navigationType === 'traverse') return;
          try {
            const u = new URL(e.destination.url); if (u.origin !== location.origin) return;
            if (norm(u.pathname) === norm(location.pathname)) { e.preventDefault(); hide(); } // botão "↩ JARVIS" do cofre / studio
            else if (isApp(u) && norm(u.pathname) !== key) { e.preventDefault(); openApp(u.href); } // studio ⇄ cofre
          } catch (_) {}
        });
      } catch (_) {}
    }

    function openApp(href) {
      const x = new URL(href), key = norm(x.pathname); let f = frames.get(key);
      if (!f) {
        f = document.createElement('iframe');
        f.allow = 'microphone; camera; clipboard-read; clipboard-write; fullscreen; autoplay; geolocation';
        f.addEventListener('load', () => onLoad(f, key));
        f.src = href; ov.appendChild(f); frames.set(key, f);
      }
      frames.forEach(v => v.style.display = v === f ? 'block' : 'none');
      ov.style.display = 'block'; paused = true;
      if (!open) { open = true; history.pushState({ ja: 1 }, ''); }
    }

    addEventListener('popstate', () => hide(true)); // gesto de voltar do Android fecha o painel

    // pega TODAS as formas de ir para outra página do mesmo site:
    if (window.navigation) navigation.addEventListener('navigate', e => { // location.href = ..., links normais
      if (!e.cancelable || e.hashChange || e.downloadRequest !== null || e.destination.sameDocument || e.navigationType === 'reload' || e.navigationType === 'traverse') return;
      try { const x = new URL(e.destination.url); if (isApp(x)) { e.preventDefault(); openApp(x.href); } } catch (_) {}
    });
    document.addEventListener('click', e => { // links com target="_blank"
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || a.hasAttribute('download')) return;
      try { const x = new URL(a.href, location.href); if (isApp(x)) { e.preventDefault(); openApp(x.href); } } catch (_) {}
    }, true);
    const _open = window.open; // window.open('cofre.html')
    window.open = function (u) {
      try { if (u) { const x = new URL(u, location.href); if (isApp(x)) { openApp(x.href); return null; } } } catch (_) {}
      return _open.apply(this, arguments);
    };
  } catch (e) { console.warn('jarvis-extra (cofre/estúdio): não aplicado', e); }
})();

/* ========== 3) SEM LAG: congela TODO o visual do Jarvis com Studio/Cofre abertos ========== */
(function () {
  try {
    const st = document.createElement('style');
    st.textContent =
      'body.ja-open>*:not(#ja-ov):not(#stw){visibility:hidden!important}' +  // esconde tudo do Jarvis (nada é pintado)
      'body.ja-open *{animation-play-state:paused!important}' +              // congela animações CSS (grade, brilho, névoa...)
      'body.ja-open::after{display:none!important}';                         // tira a película de linhas/vinheta por cima
    document.head.appendChild(st);

    const ov = document.getElementById('ja-ov'), sw = document.getElementById('stw');
    const upd = () => document.body.classList.toggle('ja-open',
      !!((ov && ov.style.display === 'block') || (sw && sw.classList.contains('on'))));
    [ov, sw].forEach(e => e && new MutationObserver(upd).observe(e, { attributes: true, attributeFilter: ['style', 'class'] }));
    upd();
  } catch (e) { console.warn('jarvis-extra (sem lag): não aplicado', e); }
})();
