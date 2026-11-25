/* J.A.R.V.I.S — patch de desempenho. Visual idêntico, bem menos trabalho por quadro.
 * Carregue por ÚLTIMO:  <script src="jarvis-leve.js"></script>
 * Para desfazer, basta remover essa linha.
 */
(function () {
  try {
    /* 1) Esfera: antes eram ~350 traços separados por quadro (um stroke cada).
          Agora os traços são agrupados em 6 níveis de transparência = 6 strokes. */
    const NB = 6, ZB = 5, n0 = SP.length;
    const X = new Float32Array(n0), Y = new Float32Array(n0), Z = new Float32Array(n0);
    drawSphere = function (c, cx, cy, rad, ro, tilt, al, pul, col) {
      const n = SP.length, ca = Math.cos(ro), sa = Math.sin(ro), ct = Math.cos(tilt), st = Math.sin(tilt);
      for (let i = 0; i < n; i++) {
        const p = SP[i], x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca,
          y2 = p[1] * ct - z * st, z2 = p[1] * st + z * ct, k = 1 + pul * .25 * Math.sin(p[0] * 7 + p[1] * 5 + ro * 4);
        X[i] = cx + x * rad * k; Y[i] = cy + y2 * rad * k; Z[i] = z2;
      }
      const lim = rad * .45, l2 = lim * lim, P = [], used = [];
      for (let b = 0; b < NB; b++) { P.push(new Path2D()); used.push(false); }
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = X[i] - X[j]; if (dx > lim || dx < -lim) continue;
          const dy = Y[i] - Y[j], d = dx * dx + dy * dy;
          if (d < l2) {
            const zn = ((Z[i] + Z[j]) / 2 + 1) / 2, v = (.08 + .32 * zn) * (1 - Math.sqrt(d) / lim) / .4,
              b = Math.min(NB - 1, v * NB | 0);
            P[b].moveTo(X[i], Y[i]); P[b].lineTo(X[j], Y[j]); used[b] = true;
          }
        }
      }
      c.lineWidth = 1;
      for (let b = 0; b < NB; b++) if (used[b]) { c.strokeStyle = 'rgba(' + col + ',' + (al * .4 * (b + .5) / NB).toFixed(3) + ')'; c.stroke(P[b]); }
      for (let b = 0; b < ZB; b++) {
        c.fillStyle = 'rgba(' + col + ',' + (al * (.25 + .75 * (b + .5) / ZB)).toFixed(3) + ')';
        for (let i = 0; i < n; i++) {
          const z = (Z[i] + 1) / 2;
          if (Math.min(ZB - 1, z * ZB | 0) === b) { const s = 1 + 1.8 * z; c.fillRect(X[i] - s / 2, Y[i] - s / 2, s, s); }
        }
      }
    };

    /* 2) Fundo: estrelas e régua lateral também agrupadas por nível de brilho.
          O movimento das estrelas agora usa tempo real (fica igual em qualquer taxa de quadros). */
    let lastT = 0, AL = new Float32Array(0);
    bgdraw = function (t) {
      const c = bgx, dt = Math.min(.1, Math.max(0, t - lastT)); lastT = t;
      c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, NW, NH);
      const n = ST.length; if (AL.length !== n) AL = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const s = ST[i]; s.y -= s.v * 60 * dt;
        if (s.y < 0) { s.y = NH; s.x = Math.random() * NW; }
        AL[i] = .12 + .5 * (.5 + .5 * Math.sin(t * s.f + s.p)) * s.b;
      }
      for (let b = 0; b < 4; b++) {
        c.fillStyle = 'rgba(' + ACR + ',' + (.12 + .5 * (b + .5) / 4).toFixed(3) + ')';
        for (let i = 0; i < n; i++) if (Math.min(3, ((AL[i] - .12) / .5 * 4) | 0) === b) { const s = ST[i]; c.fillRect(s.x, s.y, s.s, s.s); }
      }
      const cx = RCX, cy = RCY, R = RR;
      c.setLineDash([2, 7]); c.lineWidth = 1.4; c.strokeStyle = 'rgba(' + ACR + ',.32)'; c.beginPath(); c.arc(cx, cy, R * 1.1, 0, 6.283); c.stroke(); c.setLineDash([]);
      c.lineWidth = 3; c.strokeStyle = 'rgba(' + ACR + ',.45)';
      for (let k = 0; k < 3; k++) { const a = t * .1 + k * 2.094; c.beginPath(); c.arc(cx, cy, R * 1.16, a, a + .55); c.stroke(); }
      c.lineWidth = 1; c.strokeStyle = 'rgba(' + ACR + ',.2)'; c.beginPath(); c.arc(cx, cy, R * 1.24, 0, 6.283); c.stroke();
      const y0 = NH * .2, y1 = NH * .8, m = Math.floor((y1 - y0) / 12), off = (t * 14) % (m * 12), T = [0, 1, 2, 3].map(() => new Path2D());
      for (let i = 0; i < m; i++) {
        const y = y0 + ((i * 12 + off) % (m * 12)), mid = 1 - Math.abs((y - (y0 + y1) / 2) / ((y1 - y0) / 2)),
          b = Math.max(0, Math.min(3, (mid * 4) | 0)), L = i % 5 === 0 ? 14 : 7;
        T[b].moveTo(0, y); T[b].lineTo(L, y); T[b].moveTo(NW, y); T[b].lineTo(NW - L, y);
      }
      c.lineWidth = 1;
      for (let b = 0; b < 4; b++) { c.strokeStyle = 'rgba(' + ACR + ',' + (.5 * (b + .5) / 4).toFixed(3) + ')'; c.stroke(T[b]); }
    };

    /* 3) Quadros: parado = 30 fps (a rotação é lenta, não se nota); painel aberto = 20 fps;
          ouvindo/falando/pensando = 60 fps como antes. A abertura continua em 60. */
    const _raf = window.requestAnimationFrame.bind(window), last = new WeakMap();
    window.requestAnimationFrame = function (cb) {
      return _raf(function tick(ts) {
        if (cb.name === 'loop') {
          const open = document.getElementById('sh').classList.contains('open'),
            idle = !(listening || speaking || think),
            gap = open ? 48 : idle ? 30 : 0, l = last.get(cb) || 0;
          if (gap && ts - l < gap) { _raf(tick); return; }
          last.set(cb, ts);
        }
        cb(ts);
      });
    };
  } catch (e) { console.warn('jarvis-leve: não aplicado', e); }
})();
