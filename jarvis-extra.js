/* J.A.R.V.I.S — extras
 * 1) Abertura com vários sons, cada um num momento da animação
 * 2) Cofre / estúdio abrem POR CIMA do Jarvis (o Jarvis nunca é descarregado, então não reinicia)
 * Carregue por ÚLTIMO:  <script src="jarvis-extra.js"></script>   (depois do jarvis-leve.js)
 */

/* ========== 1) ABERTURA: VÁRIOS SONS ========== */
(function () {
  try {
    // [chave, nome na tela, sugestão, segundo da animação em que toca]
    const OP = [
      ['boot_a', 'Abertura · impacto (0,2s)',        'Epic futuristic movie accent',   0.15],
      ['boot_b', 'Abertura · anéis surgindo (1,7s)', 'Futuristic machine starting',    1.7],
      ['boot_t', 'Abertura · título (2,1s)',         'Intro text glitch',              2.1],
      ['boot_c', 'Abertura · scanner (2,4s)',        'Futuristic sweep pass by',       2.4],
      ['boot_d', 'Abertura · carregando (2,7s)',     'Sci fi loading operative system', 2.7],
      ['boot_e', 'Abertura · BEM-VINDO (4,5s)',      'Sci Fi positive notification',   4.5],
      ['boot_f', 'Abertura · íris abrindo (5,5s)',   'Sci fi warp slide',              5.5]
    ];
    SLOTS[0][1] = 'Abertura · início (0s)';
    SLOTS.splice(1, 0, ...OP.map(o => [o[0], o[1], o[2]]));
    loadSounds(); // recarrega arquivos salvos, agora incluindo os novos espaços

    const b = document.getElementById('boot'), orig = b.onclick;
    let tm = [], auds = [], played = new Set();
    b.onclick = function () {
      const starting = (t0 === null), skipping = (t0 !== null && !iris);
      if (skipping) {
        tm.forEach(clearTimeout); tm = [];
        auds.forEach(a => { try { a.pause(); } catch (e) {} }); auds = [];
        if (!played.has('boot_e')) { played.add('boot_e'); const a = play('boot_e'); if (a) auds.push(a); }
      }
      const r = orig.apply(this, arguments);
      if (starting) {
        played.clear();
        OP.forEach(([k, , , t]) => tm.push(setTimeout(() => { played.add(k); const a = play(k); if (a) auds.push(a); }, t * 1000)));
      }
      return r;
    };
  } catch (e) { console.warn('jarvis-extra (abertura): não aplicado', e); }
})();

/* ========== 2) COFRE / ESTÚDIO POR CIMA DO JARVIS ========== */
(function () {
  try {
    const KEEP = /estudio|studio/i;   // páginas que ficam abertas em segundo plano ao voltar (o cofre fecha e tranca de novo)
    const norm = p => p.replace(/index\.html?$/i, '').replace(/\/+$/, '');
    const isApp = x => x.origin === location.origin && norm(x.pathname) !== norm(location.pathname) &&
      !/\.(mp3|wav|ogg|m4a|json|png|jpe?g|webp|gif|svg|js|css|txt|pdf)$/i.test(x.pathname);

    const css = document.createElement('style');
    css.textContent = '#ja-ov{position:fixed;inset:0;z-index:100;display:none;background:#000308}' +
      '#ja-ov iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000308}' +
      '#ja-back{position:fixed;z-index:101;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);' +
      'border:0;padding:6px 16px;font:700 10px Orbitron,system-ui,sans-serif;letter-spacing:.22em;color:var(--ac,#2fd8ff);' +
      'background:rgba(0,8,16,.75);opacity:.85;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}';
    document.head.appendChild(css);
    const ov = document.createElement('div'); ov.id = 'ja-ov';
    const back = document.createElement('button'); back.id = 'ja-back'; back.textContent = '‹ JARVIS';
    ov.appendChild(back); document.body.appendChild(ov);

    // Enquanto o painel está aberto, o Jarvis para de desenhar (economiza bateria) mas continua vivo: timers, voz e microfone seguem funcionando.
    let paused = false, open = false;
    const _re = reactor, _bg = bgdraw;
    reactor = function () { if (!paused) return _re.apply(this, arguments); };
    bgdraw = function () { if (!paused) return _bg.apply(this, arguments); };

    const frames = new Map();
    function hide(fromPop) {
      if (!open) return;
      open = false; ov.style.display = 'none'; paused = false;
      frames.forEach((f, k) => { if (!KEEP.test(k)) { f.remove(); frames.delete(k); } else f.style.display = 'none'; });
      if (!fromPop && history.state && history.state.ja) history.back();
    }
    function onLoad(f, key) {
      try {
        const w = f.contentWindow; if (w.location.href === 'about:blank') return;
        if (norm(w.location.pathname) === norm(location.pathname)) { f.remove(); frames.delete(key); hide(); return; } // carregou o próprio Jarvis dentro do quadro
        if (w.navigation) w.navigation.addEventListener('navigate', e => {
          if (e.destination.sameDocument || !e.cancelable) return;
          try { const u = new URL(e.destination.url); if (u.origin === location.origin && norm(u.pathname) === norm(location.pathname)) { e.preventDefault(); hide(); } } catch (_) {}
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
    back.onclick = () => hide();
    addEventListener('popstate', () => hide(true));

    // pega TODAS as formas de ir para outra página do mesmo site:
    if (window.navigation) navigation.addEventListener('navigate', e => {   // location.href = ..., links normais
      if (!e.cancelable || e.hashChange || e.downloadRequest !== null || e.destination.sameDocument || e.navigationType === 'reload' || e.navigationType === 'traverse') return;
      try { const x = new URL(e.destination.url); if (isApp(x)) { e.preventDefault(); openApp(x.href); } } catch (_) {}
    });
    document.addEventListener('click', e => {                                // links com target="_blank"
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || a.hasAttribute('download')) return;
      try { const x = new URL(a.href, location.href); if (isApp(x)) { e.preventDefault(); openApp(x.href); } } catch (_) {}
    }, true);
    const _open = window.open;                                               // window.open('cofre.html')
    window.open = function (u) {
      try { if (u) { const x = new URL(u, location.href); if (isApp(x)) { openApp(x.href); return null; } } } catch (_) {}
      return _open.apply(this, arguments);
    };
  } catch (e) { console.warn('jarvis-extra (cofre/estúdio): não aplicado', e); }
})();
