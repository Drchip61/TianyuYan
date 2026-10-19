/* Code-generated animations. Every <canvas data-scene="name"> on the page gets one scene.
   Scenes only run while visible (and while their media tab is selected). */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const wrapX = (x, lo, hi) => { const span = hi - lo; return ((x - lo) % span + span) % span + lo; };
  const DPR = () => Math.min(devicePixelRatio || 1, 2);

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function chip(ctx, text, x, y, bg, fg = '#fff', size = 11, alpha = 1) {
    if (alpha <= 0.01) return 0;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `600 ${size}px ${FONT}`;
    const tw = ctx.measureText(text).width, ph = size + 9;
    rr(ctx, x, y, tw + 14, ph, ph / 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(text, x + 7, y + ph / 2 + 0.5);
    ctx.restore();
    return tw + 14;
  }
  function glowDot(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function vignette(ctx, w, h, a = 0.55) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  function wrapText(ctx, text, maxW, maxLines) {
    const words = text.split(' '), lines = [];
    let line = '', cut = false;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line); line = word;
        if (lines.length === maxLines) { cut = true; break; }
      } else line = test;
    }
    if (!cut) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; cut = true; }
    if (cut) {
      let l = lines[maxLines - 1];
      while (l && ctx.measureText(l + '…').width > maxW) l = l.slice(0, -1);
      lines[maxLines - 1] = l + '…';
    }
    return lines;
  }
  function offscreen(w, h, paint) {
    const dpr = DPR(), c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    paint(x);
    return c;
  }

  const SCENES = {};

  /* ---------- Hero: a drifting network of agents passing messages ---------- */
  SCENES.hero = {
    init(w, h) {
      const r = rng(11), n = Math.round(clamp(w * h / 13000, 34, 120)), pts = [];
      for (let i = 0; i < n; i++) pts.push({ x: r() * w, y: r() * h, vx: (r() - 0.5) * 16, vy: (r() - 0.5) * 16, hue: 210 + r() * 70, s: 0.8 + r() * 1.6 });
      return { pts, msgs: [], spawn: 0, r };
    },
    draw(ctx, w, h, t, dt, s, st) {
      ctx.clearRect(0, 0, w, h);
      const pts = s.pts, link = clamp(w / 9, 90, 150), p = st.pointer;
      for (const a of pts) {
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.x < -30) a.x += w + 60; else if (a.x > w + 30) a.x -= w + 60;
        if (a.y < -30) a.y += h + 60; else if (a.y > h + 30) a.y -= h + 60;
        if (p) {
          const dx = a.x - p.x, dy = a.y - p.y, d = Math.hypot(dx, dy);
          if (d < 140 && d > 0.1) { const f = (1 - d / 140) * 60 * dt; a.x += dx / d * f; a.y += dy / d * f; }
        }
      }
      const edges = [];
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y;
          if (Math.abs(dx) > link || Math.abs(dy) > link) continue;
          const d = Math.hypot(dx, dy);
          if (d < link) {
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2},85%,72%,${(1 - d / link) * 0.32})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            edges.push([a, b]);
          }
        }
        if (p) {
          const d = Math.hypot(a.x - p.x, a.y - p.y);
          if (d < 200) { ctx.strokeStyle = `rgba(190,205,255,${(1 - d / 200) * 0.5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
        }
      }
      s.spawn -= dt;
      if (s.spawn <= 0 && edges.length) { const e = edges[Math.floor(s.r() * edges.length)]; s.msgs.push({ a: e[0], b: e[1], k: 0 }); s.spawn = 0.09; }
      ctx.globalCompositeOperation = 'lighter';
      s.msgs = s.msgs.filter(m => (m.k += dt / 0.9) < 1);
      for (const m of s.msgs) glowDot(ctx, lerp(m.a.x, m.b.x, m.k), lerp(m.a.y, m.b.y, m.k), 7, `rgba(150,220,255,${0.55 * Math.sin(m.k * Math.PI)})`);
      for (const a of pts) { ctx.fillStyle = `hsla(${a.hue},90%,78%,.9)`; ctx.beginPath(); ctx.arc(a.x, a.y, a.s, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  /* ---------- SyntheticWorld: residents post into a shared feed ---------- */
  const POSTS = [
    'The lighthouse went dark at 3am. That never happens.',
    'Rescue boat is fueled. Waiting for the council\'s word.',
    'Old maps show a second channel nobody talks about.',
    'Saw lanterns on the north reef. Not ours.',
    'Council meets at dawn. Bring the logbooks.',
    'If the storm turns, we evacuate the lower docks first.',
    'Someone moved the harbor bell. Who has the key?',
    'I\'ll fix the light myself if I have to.',
    'Fine. The council and the crew sail together tonight.',
    'Kids are asking about the lanterns again.'
  ];
  const GUIDE = 'let the council and the rescue crew work together';

  SCENES.society = {
    init(w, h) {
      const narrow = w < 560;
      const people = [['Mira', '#f59e0b'], ['Dario', '#f87171'], ['Elder Rho', '#a78bfa'], ['Kai', '#22d3ee'], ['Lena', '#34d399'], ['Tomas', '#60a5fa'], ['Ivy', '#f472b6'], ['Bram', '#facc15']];
      const gw = w * (narrow ? 0.5 : 0.58), cx = gw * 0.52, cy = h * 0.57, R = Math.min(gw * 0.4, h * 0.33);
      const nodes = people.map(([n, c], i) => {
        const a = i / people.length * TAU - Math.PI / 2, k = i % 2 ? 0.62 : 1;
        return { n, c, bx: cx + Math.cos(a) * R * k * 1.15, by: cy + Math.sin(a) * R * k, ph: i * 1.7, x: 0, y: 0, pulse: 0 };
      });
      const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 0], [7, 2], [1, 5], [3, 6], [0, 4]];
      return { narrow, gw, nodes, edges, feed: [], packets: [], next: 0.4, k: 0, last: -1, guide: null, guideNext: 3.2, queue: [], r: rng(5) };
    },
    draw(ctx, w, h, t, dt, s) {
      const base = clamp(w / 72, 9.5, 13), fx = s.gw + w * 0.03, fw = w - fx - w * 0.03;
      const bg = ctx.createRadialGradient(s.gw * 0.5, h * 0.5, 0, s.gw * 0.5, h * 0.5, w * 0.7);
      bg.addColorStop(0, '#151b36'); bg.addColorStop(1, '#07080f');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      for (let x = 12; x < s.gw; x += 22) for (let y = 12; y < h; y += 22) ctx.fillRect(x, y, 1, 1);

      for (const n of s.nodes) {
        n.x = n.bx + Math.sin(t * 0.5 + n.ph) * 7;
        n.y = n.by + Math.cos(t * 0.4 + n.ph) * 6;
        n.pulse = Math.max(0, n.pulse - dt * 0.9);
      }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(160,175,220,.16)';
      for (const [i, j] of s.edges) { const a = s.nodes[i], b = s.nodes[j]; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }

      // a reader's soft guidance reaches two residents, who then post
      s.guideNext -= dt;
      if (s.guideNext <= 0) { s.guide = { k: 0, targets: [2, 1] }; s.queue = [2, 1]; s.guideNext = 12; s.next = 1.2; }
      if (s.guide) {
        const g = s.guide; g.k += dt;
        const a = smooth(0, 0.5, g.k) * (1 - smooth(4, 4.8, g.k));
        if (g.k > 4.8) s.guide = null;
        ctx.font = `600 ${base}px ${FONT}`;
        const maxW = s.gw - 28, line = wrapText(ctx, '✦ Soft guidance: ' + GUIDE, maxW - 20, 1)[0];
        const tw = Math.min(ctx.measureText(line).width + 20, maxW), bx = 14, by = 12, bh = base + 14;
        ctx.save(); ctx.globalAlpha = a;
        rr(ctx, bx, by, tw, bh, bh / 2); ctx.fillStyle = 'rgba(250,204,21,.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(250,204,21,.6)'; ctx.stroke();
        ctx.fillStyle = '#fde68a'; ctx.textBaseline = 'middle'; ctx.fillText(line, bx + 10, by + bh / 2 + 0.5);
        ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = 'rgba(250,204,21,.7)';
        for (const i of g.targets) { const n = s.nodes[i]; ctx.beginPath(); ctx.moveTo(bx + tw / 2, by + bh); ctx.quadraticCurveTo(bx + tw / 2, n.y - 40, n.x, n.y - 16); ctx.stroke(); }
        ctx.restore();
      }

      s.next -= dt;
      if (s.next <= 0) {
        let i = s.queue.length ? s.queue.shift() : Math.floor(s.r() * s.nodes.length);
        if (i === s.last) i = (i + 3) % s.nodes.length;
        s.last = i; s.nodes[i].pulse = 1; s.packets.push({ i, k: 0 }); s.next = 1.6;
      }
      ctx.globalCompositeOperation = 'lighter';
      s.packets = s.packets.filter(p => {
        p.k += dt / 0.8;
        const n = s.nodes[p.i], tx = fx + 20, ty = 56, u = smooth(0, 1, p.k);
        const mx = (n.x + tx) / 2, my = Math.min(n.y, ty) - 30;
        const x = (1 - u) * (1 - u) * n.x + 2 * (1 - u) * u * mx + u * u * tx;
        const y = (1 - u) * (1 - u) * n.y + 2 * (1 - u) * u * my + u * u * ty;
        glowDot(ctx, x, y, 10, n.c + 'dd');
        if (p.k >= 1) { s.feed.unshift({ i: p.i, text: POSTS[s.k++ % POSTS.length], y: 30, a: 0 }); return false; }
        return true;
      });
      ctx.globalCompositeOperation = 'source-over';

      const nr = clamp(w / 60, 9, 15);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const n of s.nodes) {
        if (n.pulse > 0) { ctx.strokeStyle = n.c; ctx.globalAlpha = n.pulse; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n.x, n.y, nr + (1 - n.pulse) * 26, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
        glowDot(ctx, n.x, n.y, nr * 2.6, n.c + '33');
        ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(n.x, n.y, nr, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0b0d16'; ctx.font = `700 ${nr}px ${FONT}`; ctx.fillText(n.n[0], n.x, n.y + 0.5);
        if (!s.narrow) { ctx.fillStyle = 'rgba(220,225,240,.7)'; ctx.font = `500 ${base - 1}px ${FONT}`; ctx.fillText(n.n, n.x, n.y + nr + base * 0.95); }
      }
      ctx.textAlign = 'left';

      // feed column
      rr(ctx, fx, 12, fw, h - 24, 12); ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(fx + 16, 31, 3.5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(235,238,248,.92)'; ctx.font = `600 ${base}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText('Harbor feed · live', fx + 26, 31.5);
      const lines = s.narrow ? 1 : 2, ar = base * 0.95;
      const ch = 24 + ar * 2 + lines * base * 1.35, gap = 8, top = 50;
      const cap = Math.max(1, Math.floor((h - top - 16) / (ch + gap)));
      ctx.save(); rr(ctx, fx, 44, fw, h - 56, 10); ctx.clip();
      s.feed.forEach((p, idx) => {
        const ty = top + idx * (ch + gap);
        p.y += (ty - p.y) * Math.min(1, dt * 7);
        p.a = Math.min(1, p.a + dt * 3);
        const n = s.nodes[p.i], x = fx + 8, cw = fw - 16;
        ctx.globalAlpha = p.a;
        rr(ctx, x, p.y, cw, ch, 9); ctx.fillStyle = idx === 0 ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.05)'; ctx.fill();
        ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(x + 10 + ar, p.y + 10 + ar, ar, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0b0d16'; ctx.font = `700 ${base * 0.9}px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(n.n[0], x + 10 + ar, p.y + 10 + ar + 0.5);
        ctx.textAlign = 'left'; ctx.fillStyle = '#f1f3fa'; ctx.font = `600 ${base}px ${FONT}`; ctx.fillText(n.n, x + 18 + ar * 2, p.y + 10 + ar);
        ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(200,205,220,.5)'; ctx.font = `400 ${base - 1.5}px ${FONT}`; ctx.fillText(idx === 0 ? 'now' : `${idx * 2}m`, x + cw - 10, p.y + 10 + ar);
        ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(225,229,240,.82)'; ctx.font = `400 ${base}px ${FONT}`;
        wrapText(ctx, p.text, cw - 20, lines).forEach((l, li) => ctx.fillText(l, x + 10, p.y + 16 + ar * 2 + base * 0.68 + li * base * 1.35));
        ctx.globalAlpha = 1;
      });
      s.feed.length = Math.min(s.feed.length, cap + 1);
      ctx.restore();
    }
  };

  /* ---------- Marine animal segmentation (Dual-SAM / MAS-SAM) ---------- */
  function fishPath(ctx, x, y, s, dir, wag) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.beginPath();
    ctx.moveTo(0.5 * s, 0);
    ctx.bezierCurveTo(0.36 * s, -0.27 * s, -0.18 * s, -0.25 * s, -0.32 * s, -0.02 * s);
    ctx.lineTo(-0.56 * s, (-0.2 + wag) * s);
    ctx.quadraticCurveTo(-0.5 * s, wag * s * 0.5, -0.56 * s, (0.2 + wag) * s);
    ctx.lineTo(-0.32 * s, 0.02 * s);
    ctx.bezierCurveTo(-0.18 * s, 0.25 * s, 0.36 * s, 0.27 * s, 0.5 * s, 0);
    ctx.closePath();
    ctx.restore();
  }
  function jellyPath(ctx, x, y, s, t, ph) {
    const pulse = 1 + Math.sin(t * 2 + ph) * 0.06;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.5 * pulse, s * 0.38 / pulse, 0, Math.PI, TAU);
    for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x + s * 0.5 * pulse - u * s * pulse, y + Math.sin(u * 12 + t * 3) * s * 0.03 + s * 0.04); }
    ctx.closePath();
  }
  function jellyTentacles(ctx, x, y, s, t, ph) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const x0 = x - s * 0.36 + k * s * 0.144;
      ctx.moveTo(x0, y + s * 0.05);
      for (let j = 1; j <= 10; j++) ctx.lineTo(x0 + Math.sin(j * 0.7 + t * 2.4 + k + ph) * s * 0.05, y + s * 0.05 + j * s * 0.085);
    }
  }
  function growCoral(r, x, y, len, ang, depth, out) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    out.push([x, y, x2, y2, depth]);
    if (depth <= 0) return;
    const n = 2 + (r() < 0.3 ? 1 : 0);
    for (let i = 0; i < n; i++) growCoral(r, x2, y2, len * (0.62 + r() * 0.2), ang + (r() - 0.5) * 1.1, depth - 1, out);
  }

  SCENES.marine = {
    init(w, h, o) {
      const r = rng(+o.seed || 3), m = Math.min(w, h);
      const hues = [22, 192, 48, 338];
      const fish = hues.map((hue, i) => ({ x0: r() * w, y0: h * (0.22 + 0.13 * i + r() * 0.06), s: m * (0.2 + r() * 0.12), sp: 16 + r() * 22, dir: r() < 0.5 ? -1 : 1, hue, ph: r() * TAU, conf: (0.9 + r() * 0.09).toFixed(2) }));
      const jelly = { x: w * (0.15 + r() * 0.7), y: h * 0.28, s: m * 0.2, ph: r() * TAU, conf: (0.9 + r() * 0.09).toFixed(2) };
      const bubbles = Array.from({ length: 22 }, () => ({ x: r() * w, y: r() * h, r: 0.8 + r() * 2.4, sp: 10 + r() * 25, ph: r() * TAU }));
      const snow = Array.from({ length: 60 }, () => ({ x: r() * w, y: r() * h, r: r() * 1.3 + 0.3, sp: 2 + r() * 5 }));
      const rays = Array.from({ length: 5 }, (_, i) => ({ x: w * (i + 0.5) / 5 + (r() - 0.5) * 60, wt: 10 + r() * 30, wb: 60 + r() * 120, ph: r() * TAU }));
      const bed = [];
      for (let i = 0; i <= 32; i++) bed.push(h * (0.88 + 0.035 * Math.sin(i * 0.6 + r()) + 0.02 * Math.sin(i * 1.7)));
      const coral = [];
      for (let i = 0; i < 8; i++) {
        const segs = [];
        growCoral(r, r() * w, h * 0.95, m * (0.05 + r() * 0.05), -Math.PI / 2 + (r() - 0.5) * 0.4, 3, segs);
        coral.push({ segs, hue: [340, 18, 280, 168, 40][i % 5] });
      }
      return { fish, jelly, bubbles, snow, rays, bed, coral };
    },
    draw(ctx, w, h, t, dt, s, st, o) {
      const P = 6.5, ph = t % P, binary = o.variant === 'b';
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0f5470'); g.addColorStop(0.55, '#082c40'); g.addColorStop(1, '#03111b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      for (const ray of s.rays) {
        const sway = Math.sin(t * 0.35 + ray.ph) * 40, lg = ctx.createLinearGradient(0, 0, 0, h * 0.9);
        lg.addColorStop(0, 'rgba(160,230,255,.13)'); lg.addColorStop(1, 'rgba(160,230,255,0)');
        ctx.fillStyle = lg; ctx.beginPath();
        ctx.moveTo(ray.x - ray.wt, 0); ctx.lineTo(ray.x + ray.wt, 0);
        ctx.lineTo(ray.x + sway + ray.wb, h * 0.9); ctx.lineTo(ray.x + sway - ray.wb * 0.3, h * 0.9);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(200,235,255,.35)';
      for (const p of s.snow) ctx.fillRect(p.x + Math.sin(t * 0.5 + p.y) * 4, wrapX(p.y + t * p.sp, -5, h + 5), p.r, p.r);

      // seabed and coral
      ctx.fillStyle = '#04141d'; ctx.beginPath(); ctx.moveTo(0, h);
      s.bed.forEach((y, i) => ctx.lineTo(i / (s.bed.length - 1) * w, y));
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.lineCap = 'round';
      for (const c of s.coral) for (const [x1, y1, x2, y2, d] of c.segs) {
        ctx.strokeStyle = `hsla(${c.hue},45%,${30 + (3 - d) * 6}%,.95)`; ctx.lineWidth = 1.2 + d * 1.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // scan beam timing
      const u = smooth(0.3, 3.8, ph), beamX = lerp(-0.08 * w, 1.08 * w, u), fade = 1 - smooth(P - 0.8, P - 0.1, ph);
      const objs = [];
      for (const f of s.fish) {
        const x = wrapX(f.x0 + f.dir * f.sp * t, -f.s, w + f.s), y = f.y0 + Math.sin(t * 0.8 + f.ph) * 6, wag = Math.sin(t * 6 + f.ph) * 0.06;
        fishPath(ctx, x, y, f.s, f.dir, wag);
        const fg = ctx.createLinearGradient(0, y - f.s * 0.25, 0, y + f.s * 0.25);
        fg.addColorStop(0, `hsl(${f.hue},40%,34%)`); fg.addColorStop(0.5, `hsl(${f.hue},55%,55%)`); fg.addColorStop(1, `hsl(${f.hue},30%,72%)`);
        ctx.fillStyle = fg; ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(x + f.dir * 0.32 * f.s, y - 0.05 * f.s, f.s * 0.035, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0b1220'; ctx.beginPath(); ctx.arc(x + f.dir * 0.325 * f.s, y - 0.05 * f.s, f.s * 0.018, 0, TAU); ctx.fill();
        objs.push({ path: () => fishPath(ctx, x, y, f.s, f.dir, wag), hue: f.hue, x, y, s: f.s, label: `fish ${f.conf}` });
      }
      const j = s.jelly, jy = j.y + Math.sin(t * 0.6 + j.ph) * h * 0.05;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      jellyTentacles(ctx, j.x, jy, j.s, t, j.ph); ctx.strokeStyle = 'rgba(230,170,255,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      jellyPath(ctx, j.x, jy, j.s, t, j.ph); ctx.fillStyle = 'rgba(220,150,255,.35)'; ctx.fill();
      ctx.restore();
      objs.push({ path: () => jellyPath(ctx, j.x, jy, j.s, t, j.ph), tent: () => jellyTentacles(ctx, j.x, jy, j.s, t, j.ph), hue: 290, x: j.x, y: jy - j.s * 0.15, s: j.s, label: `jellyfish ${j.conf}` });

      // bubbles
      ctx.strokeStyle = 'rgba(220,245,255,.4)'; ctx.lineWidth = 1;
      for (const b of s.bubbles) { ctx.beginPath(); ctx.arc(b.x + Math.sin(t + b.ph) * 5, wrapX(b.y - t * b.sp, -10, h + 10), b.r, 0, TAU); ctx.stroke(); }

      // masks revealed behind the beam
      if (fade > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, beamX), h); ctx.clip();
        for (const ob of objs) {
          ctx.globalAlpha = fade;
          ob.path(); ctx.fillStyle = `hsla(${ob.hue},95%,60%,.45)`; ctx.fill();
          ctx.strokeStyle = `hsla(${ob.hue},100%,78%,1)`; ctx.lineWidth = 2; ctx.stroke();
          if (ob.tent) { ob.tent(); ctx.lineWidth = 1.6; ctx.stroke(); }
        }
        ctx.restore();
        const size = clamp(w / 48, 9, 12);
        for (const ob of objs) if (ob.x + ob.s * 0.55 < beamX) chip(ctx, ob.label, ob.x - ob.s * 0.4, ob.y - ob.s * 0.42 - size - 10, `hsla(${ob.hue},80%,40%,.9)`, '#fff', size, fade);
      }
      if (binary) {
        // MAS-SAM: multi-scale feature cells trail the beam, then the binary mask view
        if (u > 0 && u < 1) {
          ctx.lineWidth = 1;
          [36, 18, 9].forEach((c, k) => {
            for (let x = Math.floor((beamX - c * 3) / c) * c; x < beamX; x += c) for (let y = 0; y < h; y += c) {
              const hsh = Math.sin(x * 12.9898 + y * 78.233 + Math.floor(t * 8) * 3.1 + k) * 43758.5453;
              const a = (hsh - Math.floor(hsh)) * 0.35 * (1 - (beamX - x) / (c * 3));
              if (a > 0.08) { ctx.strokeStyle = `rgba(120,255,230,${a})`; ctx.strokeRect(x + 0.5, y + 0.5, c - 1, c - 1); }
            }
          });
        }
        const bin = smooth(4.0, 4.4, ph) * (1 - smooth(5.5, 5.9, ph));
        if (bin > 0) {
          ctx.fillStyle = `rgba(0,0,0,${bin})`; ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = bin; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
          for (const ob of objs) { ob.path(); ctx.fill(); if (ob.tent) { ob.tent(); ctx.stroke(); } }
          ctx.globalAlpha = 1;
        }
      }
      if (u > 0 && u < 1) {
        ctx.globalCompositeOperation = 'lighter';
        const bg2 = ctx.createLinearGradient(beamX - 70, 0, beamX, 0);
        bg2.addColorStop(0, 'rgba(90,255,230,0)'); bg2.addColorStop(1, 'rgba(90,255,230,.22)');
        ctx.fillStyle = bg2; ctx.fillRect(beamX - 70, 0, 70, h);
        ctx.fillStyle = 'rgba(190,255,245,.9)'; ctx.fillRect(beamX - 1, 0, 2, h);
        ctx.globalCompositeOperation = 'source-over';
      }
      vignette(ctx, w, h, 0.5);
      const fs = clamp(w / 48, 9, 12);
      const showBin = binary && ph > 4.2 && ph < 5.7;
      chip(ctx, showBin ? 'Binary mask' : u < 1 ? '● Segmenting…' : `✓ ${objs.length} animals found`, 12, 12, 'rgba(0,0,0,.5)', u < 1 ? '#7ff5e2' : '#fff', fs);
    }
  };

  /* ---------- Salient object detection (MDSAM) ---------- */
  function butterflyPath(ctx, cx, cy, s, flap) {
    ctx.beginPath();
    for (const d of [-1, 1]) {
      const k = d * flap;
      ctx.moveTo(cx, cy - 0.04 * s);
      ctx.bezierCurveTo(cx + k * 0.2 * s, cy - 0.62 * s, cx + k * 0.9 * s, cy - 0.62 * s, cx + k * 0.74 * s, cy - 0.12 * s);
      ctx.bezierCurveTo(cx + k * 0.66 * s, cy + 0.04 * s, cx + k * 0.25 * s, cy + 0.02 * s, cx, cy + 0.02 * s);
      ctx.moveTo(cx, cy + 0.03 * s);
      ctx.bezierCurveTo(cx + k * 0.55 * s, cy + 0.04 * s, cx + k * 0.62 * s, cy + 0.5 * s, cx + k * 0.28 * s, cy + 0.52 * s);
      ctx.bezierCurveTo(cx + k * 0.12 * s, cy + 0.54 * s, cx + k * 0.04 * s, cy + 0.28 * s, cx, cy + 0.08 * s);
    }
  }
  function bodyPath(ctx, cx, cy, s) { ctx.beginPath(); ctx.ellipse(cx, cy + 0.06 * s, 0.035 * s, 0.26 * s, 0, 0, TAU); }
  function antennae(ctx, cx, cy, s) {
    ctx.beginPath();
    for (const d of [-1, 1]) { ctx.moveTo(cx, cy - 0.16 * s); ctx.quadraticCurveTo(cx + d * 0.08 * s, cy - 0.4 * s, cx + d * 0.2 * s, cy - 0.48 * s); }
  }
  function paintButterfly(ctx, cx, cy, s, flap) {
    butterflyPath(ctx, cx, cy, s, flap);
    const g = ctx.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.8);
    g.addColorStop(0, '#fed7aa'); g.addColorStop(0.35, '#fb923c'); g.addColorStop(0.75, '#c2410c'); g.addColorStop(1, '#431407');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.lineWidth = Math.max(1, s * 0.008); ctx.strokeStyle = 'rgba(28,15,10,.7)';
    for (const d of [-1, 1]) {
      const k = d * flap;
      for (const [ex, ey] of [[0.7, -0.35], [0.55, -0.5], [0.75, -0.15], [0.45, 0.4], [0.3, 0.48]]) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + k * ex * 0.5 * s, cy + ey * 0.3 * s, cx + k * ex * s, cy + ey * s); ctx.stroke();
      }
    }
    ctx.fillStyle = '#fff7ed';
    for (const d of [-1, 1]) {
      const k = d * flap;
      for (const [ex, ey, r2] of [[0.72, -0.3, 0.03], [0.62, -0.42, 0.025], [0.78, -0.18, 0.02]]) {
        ctx.beginPath(); ctx.ellipse(cx + k * ex * s, cy + ey * s, r2 * s * flap, r2 * s, 0, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
    butterflyPath(ctx, cx, cy, s, flap);
    ctx.lineWidth = s * 0.03; ctx.strokeStyle = '#1c0f0a'; ctx.stroke();
    bodyPath(ctx, cx, cy, s); ctx.fillStyle = '#1c1210'; ctx.fill();
    antennae(ctx, cx, cy, s); ctx.strokeStyle = '#1c1210'; ctx.lineWidth = Math.max(1, s * 0.012); ctx.stroke();
  }

  SCENES.sod = {
    init(w, h) {
      const r = rng(21);
      return { bokeh: Array.from({ length: 26 }, () => ({ x: r() * w, y: r() * h, r: 10 + r() * Math.min(w, h) * 0.14, hue: [150, 95, 45, 190][Math.floor(r() * 4)], a: 0.08 + r() * 0.14, ph: r() * TAU })) };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 7.5, ph = t % P, m = Math.min(w, h);
      const cx = w * 0.44 + Math.sin(t * 0.4) * w * 0.03, cy = h * 0.52 + Math.sin(t * 0.7) * h * 0.03, sz = m * 0.42, flap = 0.72 + 0.28 * Math.cos(t * 3.2);
      const sal = smooth(2.6, 3.3, ph) * (1 - smooth(6.6, 7.3, ph));
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#13261f'); g.addColorStop(1, '#0b1714');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (const b of s.bokeh) glowDot(ctx, b.x + Math.sin(t * 0.3 + b.ph) * 10, b.y + Math.cos(t * 0.25 + b.ph) * 8, b.r, `hsla(${b.hue},60%,60%,${b.a})`);
      paintButterfly(ctx, cx, cy, sz, flap);

      const ring = (1 - sal) * smooth(0.2, 1, ph);
      if (ring > 0.01) {
        ctx.save(); ctx.globalAlpha = ring; ctx.strokeStyle = 'rgba(180,255,220,.85)'; ctx.lineWidth = 1.2;
        [1.15, 0.85, 0.58].forEach((k, i) => {
          ctx.setLineDash([6 + i * 3, 6]); ctx.lineDashOffset = t * (20 + i * 15) * (i % 2 ? -1 : 1);
          ctx.beginPath(); ctx.arc(cx, cy, sz * k * (1 + 0.06 * Math.sin(t * 2 + i)), 0, TAU); ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
      }
      if (sal > 0) {
        ctx.fillStyle = `rgba(0,0,0,${sal})`; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = sal; ctx.fillStyle = '#fff';
        butterflyPath(ctx, cx, cy, sz, flap); ctx.fill();
        bodyPath(ctx, cx, cy, sz); ctx.fill();
        antennae(ctx, cx, cy, sz); ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, sz * 0.012); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const mag = smooth(3.3, 3.8, ph) * (1 - smooth(6.2, 6.6, ph));
      if (mag > 0) {
        const px = cx + flap * 0.74 * sz, py = cy - 0.14 * sz, R = m * 0.17, mx = w * 0.84, my = h * 0.27;
        ctx.save(); ctx.globalAlpha = mag;
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, R / 2.8, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + R / 2.8 * 0.7, py - R / 2.8 * 0.7); ctx.lineTo(mx - R * 0.7, my + R * 0.7); ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R, 0, TAU); ctx.clip();
        ctx.fillStyle = '#000'; ctx.fillRect(mx - R, my - R, 2 * R, 2 * R);
        ctx.translate(mx, my); ctx.scale(2.8, 2.8); ctx.translate(-px, -py);
        ctx.fillStyle = '#fff'; butterflyPath(ctx, cx, cy, sz, flap); ctx.fill();
        ctx.restore();
        ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, R, 0, TAU); ctx.stroke();
        ctx.restore();
        chip(ctx, 'edge detail ×2.8', mx - R, my + R + 6, 'rgba(255,255,255,.12)', '#fff', clamp(w / 52, 9, 11), mag);
      }
      vignette(ctx, w, h, 0.45);
      chip(ctx, sal > 0.5 ? 'Saliency map' : 'Image · multi-scale', 12, 12, 'rgba(0,0,0,.5)', sal > 0.5 ? '#fff' : '#b4ffdc', clamp(w / 48, 9, 12));
    }
  };

  /* ---------- Remote sensing change detection (TransY-Net / FTN) ---------- */
  function makeCity(w, h, seed) {
    const r = rng(seed), cell = clamp(Math.min(w, h) / 4.2, 40, 120), road = cell * 0.1;
    const riv = { y: h * (0.25 + r() * 0.5), amp: h * 0.1, f: 1.5 + r(), ph: r() * TAU };
    const riverY = x => riv.y + Math.sin(x / w * riv.f * Math.PI + riv.ph) * riv.amp;
    const greens = [], lots = [];
    for (let i = 0; i < 70; i++) greens.push({ x: r() * w, y: r() * h, rx: 10 + r() * cell * 0.6, ry: 8 + r() * cell * 0.4, c: ['#3e5a3a', '#4f6640', '#5d6b45', '#35503a'][Math.floor(r() * 4)] });
    for (let gx = 0; gx * cell < w; gx++) for (let gy = 0; gy * cell < h; gy++) {
      const x0 = gx * cell + road, y0 = gy * cell + road, half = (cell - road * 2) / 2;
      for (let k = 0; k < 4; k++) {
        const x = x0 + (k % 2) * half, y = y0 + Math.floor(k / 2) * half;
        if (Math.abs(y + half / 2 - riverY(x + half / 2)) < cell * 0.45) continue;
        const a = r() < 0.5, field = !a && r() < 0.5, b = a ? r() > 0.06 : r() < 0.3;
        lots.push({ x: x + 2, y: y + 2, w: half - 4, h: half - 4, a, b, field, roof: ['#c9c2b3', '#a8604c', '#8e99a4', '#ddd5c5', '#b98e5f'][Math.floor(r() * 5)], ridge: r() < 0.5 });
      }
    }
    return { w, h, cell, road, riverY, greens, lots };
  }
  function paintCity(ctx, city, epoch) {
    const { w, h, cell, road } = city;
    ctx.fillStyle = '#48553f'; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.6;
    for (const g of city.greens) { ctx.fillStyle = g.c; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.rx, g.ry, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8b8a82';
    for (let x = 0; x <= w + cell; x += cell) ctx.fillRect(x - road, 0, road * 2, h);
    for (let y = 0; y <= h + cell; y += cell) ctx.fillRect(0, y - road, w, road * 2);
    ctx.lineCap = 'round'; ctx.strokeStyle = '#24495a'; ctx.lineWidth = cell * 0.55; ctx.beginPath();
    for (let x = -20; x <= w + 20; x += 8) { const y = city.riverY(x); x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.strokeStyle = 'rgba(140,200,220,.22)'; ctx.lineWidth = cell * 0.12; ctx.stroke();
    for (const l of city.lots) {
      if (epoch ? l.b : l.a) {
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(l.x + 3, l.y + 3, l.w, l.h);
        ctx.fillStyle = l.roof; ctx.fillRect(l.x, l.y, l.w, l.h);
        ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(l.x, l.y, l.w, l.h / 2);
        if (l.ridge) { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.x, l.y + l.h / 2); ctx.lineTo(l.x + l.w, l.y + l.h / 2); ctx.stroke(); }
      } else if (l.field) {
        ctx.fillStyle = epoch ? '#8a7650' : '#6f7a45'; ctx.fillRect(l.x, l.y, l.w, l.h);
        ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1;
        for (let k = 3; k < l.w; k += 4) { ctx.beginPath(); ctx.moveTo(l.x + k, l.y); ctx.lineTo(l.x + k, l.y + l.h); ctx.stroke(); }
      }
    }
  }

  SCENES.change = {
    init(w, h, o) {
      const split = o.variant === 'split', pw = split ? w / 2 : w;
      const city = makeCity(pw * 1.1, h * 1.1, +o.seed || 4);
      return {
        split, pw, W: pw * 1.1, H: h * 1.1,
        t1: offscreen(city.w, city.h, x => paintCity(x, city, 0)),
        t2: offscreen(city.w, city.h, x => paintCity(x, city, 1)),
        changed: city.lots.filter(l => l.a !== l.b).sort((a, b) => a.x - b.x)
      };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 9, ph = t % P, fs = clamp(w / 48, 9, 12);
      const ox = -s.pw * 0.05 + Math.sin(t * 0.15) * s.pw * 0.04, oy = -h * 0.05 + Math.cos(t * 0.12) * h * 0.04;
      if (!s.split) {
        const wipe = smooth(1.4, 3.4, ph), back = smooth(8.1, 8.9, ph), cm = smooth(3.9, 4.5, ph) * (1 - smooth(7.2, 7.9, ph));
        ctx.drawImage(s.t1, ox, oy, s.W, s.H);
        if (wipe > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, wipe * w, h); ctx.clip(); ctx.drawImage(s.t2, ox, oy, s.W, s.H); ctx.restore(); }
        if (back > 0) { ctx.globalAlpha = back; ctx.drawImage(s.t1, ox, oy, s.W, s.H); ctx.globalAlpha = 1; }
        if (cm > 0) {
          ctx.fillStyle = `rgba(4,8,14,${0.62 * cm})`; ctx.fillRect(0, 0, w, h);
          ctx.save(); ctx.translate(ox, oy);
          ctx.shadowColor = 'rgba(255,190,40,.9)'; ctx.shadowBlur = 12 * cm;
          ctx.fillStyle = `rgba(255,196,40,${0.85 * cm * (0.75 + 0.25 * Math.sin(t * 4))})`;
          for (const l of s.changed) ctx.fillRect(l.x, l.y, l.w, l.h);
          ctx.restore();
        }
        if (wipe > 0 && wipe < 1) {
          const wx = wipe * w;
          ctx.fillStyle = '#fff'; ctx.fillRect(wx - 1, 0, 2, h);
          ctx.beginPath(); ctx.arc(wx, h / 2, 12, 0, TAU); ctx.fill();
          ctx.fillStyle = '#111'; ctx.beginPath();
          ctx.moveTo(wx - 7, h / 2); ctx.lineTo(wx - 2, h / 2 - 4); ctx.lineTo(wx - 2, h / 2 + 4); ctx.closePath();
          ctx.moveTo(wx + 7, h / 2); ctx.lineTo(wx + 2, h / 2 - 4); ctx.lineTo(wx + 2, h / 2 + 4); ctx.closePath(); ctx.fill();
        }
        const lbl = cm > 0.5 ? 'Change map' : ph < 1.4 || back > 0.5 ? 'T1 · before' : wipe < 1 ? 'T1 → T2' : 'T2 · after';
        vignette(ctx, w, h, 0.4);
        chip(ctx, lbl, 12, 12, 'rgba(0,0,0,.55)', cm > 0.5 ? '#ffd166' : '#fff', fs);
        return;
      }
      // split view: T1 | T2, matching changes, then a binary change map
      const hw = w / 2, fade = 1 - smooth(7.8, 8.5, ph), bin = smooth(4.8, 5.4, ph) * fade;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, hw, h); ctx.clip(); ctx.drawImage(s.t1, ox, oy, s.W, s.H); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(hw, 0, hw, h); ctx.clip(); ctx.drawImage(s.t2, hw + ox, oy, s.W, s.H);
      if (bin > 0) {
        ctx.fillStyle = `rgba(0,0,0,${bin})`; ctx.fillRect(hw, 0, hw, h);
        ctx.fillStyle = `rgba(255,255,255,${bin})`;
        for (const l of s.changed) ctx.fillRect(hw + ox + l.x, oy + l.y, l.w, l.h);
      }
      ctx.restore();
      const k = Math.floor(smooth(1.2, 4.6, ph) * s.changed.length);
      ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(255,200,60,${fade})`;
      for (const [x0, dx] of [[0, 0], [hw, hw]]) {
        ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, hw, h); ctx.clip();
        for (let i = 0; i < k; i++) { const l = s.changed[i]; ctx.strokeRect(dx + ox + l.x - 2, oy + l.y - 2, l.w + 4, l.h + 4); }
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(hw - 1, 0, 2, h);
      vignette(ctx, w, h, 0.35);
      chip(ctx, 'T1', 12, 12, 'rgba(0,0,0,.55)', '#fff', fs);
      chip(ctx, bin > 0.5 ? 'Change map' : 'T2', hw + 12, 12, 'rgba(0,0,0,.55)', bin > 0.5 ? '#ffd166' : '#fff', fs);
    }
  };

  /* ---------- Multi-modal re-identification (MambaPro) ---------- */
  function person(ctx, x, y, hh, pal) {
    const parts = [
      ['legs', x - hh * 0.11, y + hh * 0.55, hh * 0.1, hh * 0.43, hh * 0.04],
      ['legs', x + hh * 0.01, y + hh * 0.55, hh * 0.1, hh * 0.43, hh * 0.04],
      ['top', x - hh * 0.2, y + hh * 0.23, hh * 0.07, hh * 0.32, hh * 0.035],
      ['top', x + hh * 0.13, y + hh * 0.23, hh * 0.07, hh * 0.32, hh * 0.035],
      ['top', x - hh * 0.14, y + hh * 0.2, hh * 0.28, hh * 0.38, hh * 0.06]
    ];
    for (const [k, px, py, pw, ph, rad] of parts) { rr(ctx, px, py, pw, ph, rad); ctx.fillStyle = pal[k] || pal.all; ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y + hh * 0.1, hh * 0.085, 0, TAU); ctx.fillStyle = pal.skin || pal.all; ctx.fill();
    if (pal.hair) { ctx.beginPath(); ctx.arc(x, y + hh * 0.09, hh * 0.088, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fillStyle = pal.hair; ctx.fill(); }
  }
  SCENES.reid = {
    init(w, h) {
      const pad = Math.max(10, w * 0.035), gap = 8, L = { pad, tw: w * 0.2 };
      L.th = (h - pad * 2 - gap * 2) / 3;
      L.tiles = [0, 1, 2].map(i => ({ x: pad, y: pad + i * (L.th + gap) }));
      L.n = 12; L.sx0 = w * 0.31; L.sx1 = w * 0.66; L.sy = h * 0.56;
      L.tk = Math.min((L.sx1 - L.sx0) / L.n - 3, 16);
      L.gx = w * 0.72; L.gw = w * 0.25; L.gh = (h - pad * 2 - 3 * 6) / 4;
      return { L, scores: [0.46, 0.58, 0.94, 0.33], best: 2 };
    },
    draw(ctx, w, h, t, dt, s) {
      const L = s.L, P = 7.5, ph = t % P, fade = 1 - smooth(6.8, 7.4, ph), fs = clamp(w / 52, 8.5, 11.5);
      ctx.fillStyle = '#0a0b14'; ctx.fillRect(0, 0, w, h);
      const MODS = [['RGB', '#f87171'], ['NIR', '#cbd5e1'], ['TIR', '#fbbf24']];
      L.tiles.forEach((tl, m) => {
        ctx.save(); rr(ctx, tl.x, tl.y, L.tw, L.th, 8); ctx.clip();
        const bg = ctx.createLinearGradient(0, tl.y, 0, tl.y + L.th);
        const stops = [['#4b5563', '#1f2937'], ['#6b6b6b', '#262626'], ['#24103f', '#110620']][m];
        bg.addColorStop(0, stops[0]); bg.addColorStop(1, stops[1]); ctx.fillStyle = bg; ctx.fillRect(tl.x, tl.y, L.tw, L.th);
        if (m < 2) { ctx.fillStyle = m ? '#8a8a8a' : '#6b7280'; ctx.fillRect(tl.x, tl.y + L.th * 0.86, L.tw, L.th * 0.14); }
        const hh = L.th * 0.8, px = tl.x + L.tw * 0.55, py = tl.y + L.th * 0.12 + Math.abs(Math.sin(t * 4)) * 1.5;
        let pal;
        if (m === 0) pal = { skin: '#e8b48f', top: '#dc2626', legs: '#1e3a8a', hair: '#111' };
        else if (m === 1) pal = { skin: '#f2f2f2', top: '#c4c4c4', legs: '#6f6f6f', hair: '#222' };
        else {
          const tg = ctx.createRadialGradient(px, py + hh * 0.35, 0, px, py + hh * 0.35, hh * 0.7);
          tg.addColorStop(0, '#fffbe0'); tg.addColorStop(0.3, '#fbbf24'); tg.addColorStop(0.65, '#dc2626'); tg.addColorStop(1, '#7c1d6f');
          pal = { all: tg };
        }
        person(ctx, px, py, hh, pal);
        ctx.restore();
        rr(ctx, tl.x, tl.y, L.tw, L.th, 8); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.stroke();
        chip(ctx, MODS[m][0], tl.x + 5, tl.y + 5, 'rgba(0,0,0,.6)', MODS[m][1], fs - 1);
      });

      // Mamba aggregation block
      const bx = L.sx0 - 12, bw = L.sx1 - L.sx0 + 24, by = L.sy - L.tk / 2 - 46, bh = L.tk + 64;
      rr(ctx, bx, by, bw, bh, 12); ctx.fillStyle = 'rgba(124,156,255,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(124,156,255,.4)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(205,215,255,.9)'; ctx.font = `600 ${fs}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText('Mamba aggregation', bx + 10, by + 13);
      const scanU = smooth(2.3, 4.0, ph), scanX = lerp(L.sx0 - 10, L.sx1 + 10, scanU);
      const dsz = L.tk * 0.5, dy = by + 32;
      for (let i = 0; i < 3; i++) {
        const dx = (L.sx0 + L.sx1) / 2 + (i - 1) * dsz * 2.6, pul = scanU > 0 && scanU < 1 ? 0.6 + 0.4 * Math.sin(t * 8 + i) : 0.5;
        ctx.fillStyle = `rgba(192,132,252,${pul * fade + 0.2})`;
        ctx.beginPath(); ctx.moveTo(dx, dy - dsz); ctx.lineTo(dx + dsz, dy); ctx.lineTo(dx, dy + dsz); ctx.lineTo(dx - dsz, dy); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = 'rgba(192,132,252,.8)'; ctx.font = `500 ${fs - 1.5}px ${FONT}`; ctx.textAlign = 'right';
      ctx.fillText('prompts', (L.sx0 + L.sx1) / 2 - dsz * 4, dy + 0.5); ctx.textAlign = 'left';

      for (let k = 0; k < L.n; k++) {
        const m = k % 3, tl = L.tiles[m];
        const sx = tl.x + L.tw * (0.35 + ((k * 37) % 5) / 12), sy0 = tl.y + L.th * (0.3 + ((k * 53) % 5) / 10);
        const tx = L.sx0 + k * (L.tk + 3), ty = L.sy - L.tk / 2;
        const u = smooth(0.2 + k * 0.1, 1.0 + k * 0.1, ph);
        if (u <= 0) continue;
        const x = lerp(sx, tx, u), y = lerp(sy0, ty, u) - Math.sin(u * Math.PI) * h * 0.08;
        const lit = tx + L.tk < scanX ? 1 : 0;
        ctx.globalAlpha = (0.5 + 0.5 * lit) * fade;
        rr(ctx, x, y, L.tk, L.tk, 3); ctx.fillStyle = MODS[m][1]; ctx.fill();
        if (lit) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x + L.tk / 2, y + L.tk / 2, L.tk, MODS[m][1] + '55'); ctx.globalCompositeOperation = 'source-over'; }
        ctx.globalAlpha = 1;
      }
      if (scanU > 0 && scanU < 1) {
        ctx.globalCompositeOperation = 'lighter';
        const sg = ctx.createLinearGradient(scanX - 30, 0, scanX, 0);
        sg.addColorStop(0, 'rgba(124,156,255,0)'); sg.addColorStop(1, 'rgba(124,156,255,.45)');
        ctx.fillStyle = sg; ctx.fillRect(scanX - 30, by + 4, 30, bh - 8);
        ctx.globalCompositeOperation = 'source-over';
      }
      const eu = smooth(4.0, 4.6, ph);
      if (eu > 0 && eu < 1) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, lerp(L.sx1 + 14, L.gx - 4, eu), L.sy, 12, 'rgba(160,190,255,.95)'); ctx.globalCompositeOperation = 'source-over'; }

      // gallery with scores
      const grow = smooth(4.6, 5.6, ph) * fade;
      const gal = [{ top: '#16a34a', legs: '#374151' }, { top: '#2563eb', legs: '#111827' }, { top: '#dc2626', legs: '#1e3a8a' }, { top: '#a855f7', legs: '#4b5563' }];
      ctx.fillStyle = 'rgba(205,215,255,.75)'; ctx.font = `600 ${fs}px ${FONT}`; ctx.fillText('Gallery', L.gx, L.pad - 2 > 8 ? L.pad - 2 : 9);
      for (let i = 0; i < 4; i++) {
        const gy = L.pad + 6 + i * (L.gh + 6) - 6, tw2 = Math.min(L.gh * 0.72, L.gw * 0.4);
        ctx.save(); rr(ctx, L.gx, gy, tw2, L.gh, 6); ctx.clip();
        ctx.fillStyle = '#273142'; ctx.fillRect(L.gx, gy, tw2, L.gh);
        person(ctx, L.gx + tw2 / 2, gy + L.gh * 0.1, L.gh * 0.85, { skin: '#e8b48f', hair: '#111', ...gal[i] });
        ctx.restore();
        const best = i === s.best && ph > 5.5 && fade > 0;
        rr(ctx, L.gx, gy, tw2, L.gh, 6); ctx.strokeStyle = best ? `rgba(52,211,153,${fade})` : 'rgba(255,255,255,.1)'; ctx.lineWidth = best ? 2 : 1; ctx.stroke();
        const bx2 = L.gx + tw2 + 8, bmax = L.gw - tw2 - 8, by2 = gy + L.gh / 2;
        rr(ctx, bx2, by2 - 3, bmax, 6, 3); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
        if (grow > 0) {
          rr(ctx, bx2, by2 - 3, Math.max(1, bmax * s.scores[i] * grow), 6, 3); ctx.fillStyle = i === s.best ? '#34d399' : '#64748b'; ctx.fill();
          ctx.fillStyle = `rgba(230,235,245,${grow})`; ctx.font = `600 ${fs - 1}px ${FONT}`; ctx.fillText((s.scores[i] * grow).toFixed(2), bx2, by2 - 10);
        }
        if (best) chip(ctx, 'Rank-1', bx2, by2 + 7, 'rgba(52,211,153,.9)', '#06281d', fs - 1.5, fade);
      }
    }
  };

  /* ---------- Placenta accreta spectrum from 3D MRI (3DSAMba) ---------- */
  SCENES.mri = {
    init(w, h) {
      const r = rng(9);
      const sw = Math.min(w * 0.56, h * 0.92), sx = w * 0.38, sy = (h - sw) / 2;
      const cx = sw * 0.5, cy = sw * 0.52;
      const L = { x: cx + sw * 0.1, y: cy + sw * 0.12, rx: sw * 0.11, ry: sw * 0.065 };
      const slice = offscreen(sw, sw, x => {
        x.fillStyle = '#000'; x.fillRect(0, 0, sw, sw);
        let g = x.createRadialGradient(cx, cy, sw * 0.1, cx, cy, sw * 0.46);
        g.addColorStop(0, '#5a5a5a'); g.addColorStop(0.8, '#3a3a3a'); g.addColorStop(1, '#151515');
        x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, sw * 0.44, sw * 0.42, 0, 0, TAU); x.fill();
        x.strokeStyle = 'rgba(205,205,205,.5)'; x.lineWidth = sw * 0.03; x.beginPath(); x.ellipse(cx, cy, sw * 0.41, sw * 0.39, 0, 0, TAU); x.stroke();
        g = x.createRadialGradient(cx - sw * 0.04, cy - sw * 0.06, 0, cx - sw * 0.04, cy - sw * 0.06, sw * 0.27);
        g.addColorStop(0, '#ececec'); g.addColorStop(0.7, '#bdbdbd'); g.addColorStop(1, '#777');
        x.fillStyle = g; x.beginPath(); x.ellipse(cx - sw * 0.04, cy - sw * 0.06, sw * 0.28, sw * 0.24, -0.2, 0, TAU); x.fill();
        x.fillStyle = '#6b6b6b';
        x.beginPath(); x.ellipse(cx - sw * 0.1, cy - sw * 0.09, sw * 0.12, sw * 0.085, 0.5, 0, TAU); x.fill();
        x.beginPath(); x.arc(cx + sw * 0.03, cy - sw * 0.17, sw * 0.06, 0, TAU); x.fill();
        x.fillStyle = '#929292'; x.beginPath(); x.ellipse(cx + sw * 0.07, cy + sw * 0.1, sw * 0.21, sw * 0.075, -0.32, 0, TAU); x.fill();
        x.fillStyle = '#d4d4d4'; x.beginPath(); x.ellipse(cx + sw * 0.17, cy + sw * 0.28, sw * 0.09, sw * 0.05, 0, 0, TAU); x.fill();
        x.fillStyle = '#242424';
        for (let i = 0; i < 7; i++) { const a = -0.8 + i * 0.27; x.fillRect(cx - Math.cos(a) * sw * 0.36 - sw * 0.02, cy + Math.sin(a) * sw * 0.34 - sw * 0.018, sw * 0.04, sw * 0.036); }
        x.fillStyle = 'rgba(15,15,15,.75)';
        for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(L.x + (r() - 0.5) * L.rx * 1.4, L.y + (r() - 0.5) * L.ry * 1.2, L.rx * (0.12 + r() * 0.15), L.ry * (0.15 + r() * 0.2), r() * 3, 0, TAU); x.fill(); }
        for (let i = 0; i < sw * sw / 3; i++) { const v = r(); x.fillStyle = v < 0.5 ? `rgba(0,0,0,${v * 0.18})` : `rgba(255,255,255,${(v - 0.5) * 0.12})`; x.fillRect(r() * sw, r() * sw, 1, 1); }
      });
      const pts = [], p1 = r() * TAU;
      for (let i = 0; i < 48; i++) {
        const th = i / 48 * TAU, k = 1 + 0.18 * Math.sin(3 * th + p1) + 0.08 * Math.sin(5 * th + 1.3);
        pts.push([sx + L.x + Math.cos(th) * L.rx * 1.3 * k, sy + L.y + Math.sin(th) * L.ry * 1.4 * k]);
      }
      return { slice, sw, sx, sy, pts, L };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 8, ph = t % P, fade = 1 - smooth(7.2, 7.9, ph), fs = clamp(w / 50, 8.5, 11.5);
      ctx.fillStyle = '#050507'; ctx.fillRect(0, 0, w, h);
      // 3D volume: a stack of slices, one highlighted as the sweep passes
      const n = 9, bx = w * 0.05, by = h * 0.3, bw = w * 0.2, bh = h * 0.4, dx = w * 0.012, dy = -h * 0.022;
      const sweep = smooth(0.2, 2.8, ph), act = Math.round(sweep * (n - 1));
      for (let i = n - 1; i >= 0; i--) {
        const x = bx + i * dx, y = by + i * dy, on = i === act && ph < 3.2;
        ctx.save(); ctx.transform(bw / s.sw, -(bh * 0.25) / s.sw, 0, (bh * 0.75) / s.sw, x, y + bh * 0.25);
        ctx.globalAlpha = on ? 0.95 : 0.14; ctx.drawImage(s.slice, 0, 0, s.sw, s.sw);
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(x, y + bh * 0.25); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + bh * 0.75); ctx.lineTo(x, y + bh); ctx.closePath();
        ctx.strokeStyle = on ? 'rgba(124,156,255,.95)' : 'rgba(200,210,255,.18)'; ctx.lineWidth = on ? 1.6 : 1; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(220,225,240,.6)'; ctx.font = `500 ${fs - 1}px ${FONT}`; ctx.textBaseline = 'top';
      ctx.fillText('3D MRI volume', bx, by + bh + 8);
      // main slice
      ctx.drawImage(s.slice, s.sx, s.sy, s.sw, s.sw);
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.strokeRect(s.sx + 0.5, s.sy + 0.5, s.sw - 1, s.sw - 1);
      if (sweep > 0 && sweep < 1) {
        const yy = s.sy + sweep * s.sw;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(0, yy - 30, 0, yy);
        g.addColorStop(0, 'rgba(124,156,255,0)'); g.addColorStop(1, 'rgba(124,156,255,.3)');
        ctx.fillStyle = g; ctx.fillRect(s.sx, yy - 30, s.sw, 30);
        ctx.fillStyle = 'rgba(180,200,255,.9)'; ctx.fillRect(s.sx, yy - 1, s.sw, 2);
        ctx.globalCompositeOperation = 'source-over';
      }
      const cp = smooth(3.0, 4.2, ph);
      if (cp > 0 && fade > 0) {
        const k = Math.max(2, Math.floor(cp * s.pts.length));
        ctx.save(); ctx.globalAlpha = fade; ctx.beginPath();
        s.pts.slice(0, k).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        if (cp >= 1) { ctx.closePath(); ctx.fillStyle = 'rgba(244,114,182,.22)'; ctx.fill(); }
        ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 10; ctx.strokeStyle = '#f9a8d4'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
      chip(ctx, 'T2-weighted MRI · sagittal', 12, 12, 'rgba(255,255,255,.1)', 'rgba(255,255,255,.78)', fs);
      const lit1 = ph > 3 && fade > 0, lit2 = ph > 4.6 && fade > 0;
      const w1 = chip(ctx, '1  Segment', 12, h - fs - 21, lit1 ? 'rgba(244,114,182,.92)' : 'rgba(255,255,255,.1)', lit1 ? '#3b0a24' : 'rgba(255,255,255,.6)', fs);
      chip(ctx, '2  Diagnose', 12 + w1 + 8, h - fs - 21, lit2 ? 'rgba(250,204,21,.92)' : 'rgba(255,255,255,.1)', lit2 ? '#332700' : 'rgba(255,255,255,.6)', fs);
      if (lit2) {
        const a = smooth(4.6, 5.0, ph) * fade, lx = s.sx + s.L.x + s.L.rx * 1.5, ly = s.sy + s.L.y - s.L.ry * 2.6;
        ctx.strokeStyle = `rgba(250,204,21,${a})`; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(s.sx + s.L.x + s.L.rx * 1.1, s.sy + s.L.y - s.L.ry * 0.6); ctx.lineTo(lx, ly); ctx.stroke();
        chip(ctx, 'PAS suspected', Math.min(lx + 2, w - 110), ly - fs - 8, 'rgba(250,204,21,.92)', '#332700', fs - 1, a);
      }
    }
  };

  /* ---------- Originality check in an embedding space (Xinhua project) ---------- */
  SCENES.embed = {
    init() {
      const r = rng(17), gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += r(); return (u - 2) / 1.2; };
      const centers = [[-0.55, -0.15, 0.3], [0.5, -0.35, -0.25], [0.15, 0.45, 0.45], [-0.3, 0.35, -0.5]];
      const pts = [];
      centers.forEach((c, k) => { for (let i = 0; i < 38; i++) pts.push({ x: c[0] + gauss() * 0.14, y: c[1] + gauss() * 0.14, z: c[2] + gauss() * 0.14, k }); });
      const targets = [[centers[0][0] + 0.06, centers[0][1] - 0.04, centers[0][2] + 0.05], [0.9, 0.5, -0.9]];
      const near = targets.map(q => pts.map(p => [Math.hypot(p.x - q[0], p.y - q[1], p.z - q[2]), p]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(e => e[1]));
      return { pts, targets, near, cols: ['#60a5fa', '#f472b6', '#34d399', '#fbbf24'] };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 6.5, ph = t % P, mode = Math.floor(t / P) % 2, fade = 1 - smooth(5.8, 6.4, ph), fs = clamp(w / 48, 9, 12);
      const bg = ctx.createRadialGradient(w * 0.55, h * 0.5, 0, w * 0.55, h * 0.5, Math.max(w, h) * 0.7);
      bg.addColorStop(0, '#111a30'); bg.addColorStop(1, '#05070d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const th = t * 0.22, tilt = 0.38, S = Math.min(w, h) * 0.95, cx = w * 0.56, cy = h * 0.56;
      const ct = Math.cos(tilt), stl = Math.sin(tilt), c = Math.cos(th), sn = Math.sin(th);
      const proj = (x, y, z) => {
        const X = x * c + z * sn, Z0 = -x * sn + z * c, Y = y * ct - Z0 * stl, Z = y * stl + Z0 * ct, f = 2.6 / (Z + 2.6);
        return [cx + X * S * f * 0.6, cy + Y * S * f * 0.6, Z, f];
      };
      ctx.strokeStyle = 'rgba(120,140,220,.13)'; ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const v = i / 4;
        let a = proj(v, 0.8, -1), b = proj(v, 0.8, 1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        a = proj(-1, 0.8, v); b = proj(1, 0.8, v); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      const P2 = s.pts.map(p => ({ p, q: proj(p.x, p.y, p.z) })).sort((a, b) => b.q[2] - a.q[2]);
      for (const { p, q } of P2) {
        ctx.globalAlpha = clamp(0.35 + (q[3] - 0.7) * 0.7, 0.25, 1);
        ctx.fillStyle = s.cols[p.k]; ctx.beginPath(); ctx.arc(q[0], q[1], 1.7 + (q[3] - 0.7) * 2.8, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const tg = s.targets[mode], st = [-1.7, -1.0, 0.2], u = smooth(0.3, 1.7, ph);
      const qx = lerp(st[0], tg[0], u), qy = lerp(st[1], tg[1], u) - Math.sin(u * Math.PI) * 0.3, qz = lerp(st[2], tg[2], u);
      const Q = proj(qx, qy, qz);
      if (fade > 0) {
        ctx.save(); ctx.globalAlpha = fade;
        const lp = smooth(1.8, 2.5, ph);
        if (lp > 0) {
          ctx.strokeStyle = mode ? 'rgba(52,211,153,.75)' : 'rgba(251,113,133,.9)'; ctx.lineWidth = 1.4;
          if (mode) ctx.setLineDash([4, 4]);
          for (const p of s.near[mode]) {
            const N = proj(p.x, p.y, p.z);
            ctx.beginPath(); ctx.moveTo(Q[0], Q[1]); ctx.lineTo(lerp(Q[0], N[0], lp), lerp(Q[1], N[1], lp)); ctx.stroke();
            if (lp >= 1) { ctx.beginPath(); ctx.arc(N[0], N[1], 5, 0, TAU); ctx.stroke(); }
          }
          ctx.setLineDash([]);
        }
        if (ph > 1.7) { const k = ((ph - 1.7) % 1.2) / 1.2; ctx.strokeStyle = `rgba(255,255,255,${(1 - k) * 0.7})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(Q[0], Q[1], 6 + k * 22, 0, TAU); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, Q[0], Q[1], 14, 'rgba(255,255,255,.9)'); ctx.globalCompositeOperation = 'source-over';
        if (u < 1) {
          ctx.globalAlpha = (1 - u) * fade; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
          rr(ctx, Q[0] + 10, Q[1] - 20, 13, 16, 2); ctx.stroke();
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(Q[0] + 13, Q[1] - 15 + i * 4); ctx.lineTo(Q[0] + 20, Q[1] - 15 + i * 4); ctx.stroke(); }
        }
        ctx.restore();
      }
      chip(ctx, 'Embedding space · library of originals', 12, 12, 'rgba(255,255,255,.08)', 'rgba(230,235,250,.8)', fs);
      if (ph > 2.5) chip(ctx, mode ? 'Nearest match 0.38 · original ✓' : 'Nearest match 0.94 · likely copied', 12, 12 + fs + 16, mode ? 'rgba(16,185,129,.9)' : 'rgba(244,63,94,.9)', '#fff', fs, smooth(2.5, 2.9, ph) * fade);
    }
  };

  /* ---------- Vinci2: proactive assistance in continuous egocentric video ---------- */
  SCENES.ego = {
    init(w, h) {
      const m = Math.min(w, h);
      return { O: {
        kettle: { x: w * 0.22, y: h * 0.47, s: m * 0.32, label: 'kettle' },
        board: { x: w * 0.5, y: h * 0.7, s: Math.min(w * 0.5, m * 0.62), label: 'cutting board' },
        mug: { x: w * 0.76, y: h * 0.55, s: m * 0.16, label: 'mug' }
      } };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 9, ph = t % P, fs = clamp(w / 48, 9, 12), m = Math.min(w, h), O = s.O;
      ctx.save(); ctx.translate(Math.sin(t * 1.1) * w * 0.008, Math.sin(t * 2.2) * h * 0.01);
      let g = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      g.addColorStop(0, '#2b303c'); g.addColorStop(1, '#1d212a');
      ctx.fillStyle = g; ctx.fillRect(-20, -20, w + 40, h * 0.5 + 20);
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x, h * 0.48); ctx.stroke(); }
      for (let y = 0; y < h * 0.48; y += 26) { ctx.beginPath(); ctx.moveTo(-20, y); ctx.lineTo(w + 20, y); ctx.stroke(); }
      g = ctx.createLinearGradient(w * 0.6, 0, w * 0.95, h * 0.4);
      g.addColorStop(0, 'rgba(255,225,170,.22)'); g.addColorStop(1, 'rgba(255,225,170,0)');
      ctx.fillStyle = g; ctx.fillRect(w * 0.58, h * 0.04, w * 0.36, h * 0.34);
      g = ctx.createLinearGradient(0, h * 0.48, 0, h);
      g.addColorStop(0, '#9a7b57'); g.addColorStop(1, '#5a4430');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w * 0.1, h * 0.48); ctx.lineTo(w * 1.1, h * 0.48); ctx.lineTo(w * 1.3, h * 1.05); ctx.lineTo(-w * 0.3, h * 1.05); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-20, h * 0.48, w + 40, 2);

      const B = O.board, bs = B.s;
      rr(ctx, B.x - bs * 0.5, B.y - bs * 0.17, bs, bs * 0.34, bs * 0.05); ctx.fillStyle = '#d8b989'; ctx.fill();
      ctx.fillStyle = '#dc2626';
      for (const [dx, dy] of [[-0.3, -0.02], [-0.17, 0.06]]) { ctx.beginPath(); ctx.arc(B.x + dx * bs, B.y + dy * bs, bs * 0.06, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#65a30d';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(B.x + (0.02 + i * 0.07) * bs, B.y + 0.04 * bs, bs * 0.03, bs * 0.05, 0, 0, TAU); ctx.fill(); }
      rr(ctx, B.x + 0.02 * bs, B.y - 0.12 * bs, bs * 0.3, bs * 0.04, 2); ctx.fillStyle = '#e5e7eb'; ctx.fill();
      rr(ctx, B.x + 0.32 * bs, B.y - 0.125 * bs, bs * 0.12, bs * 0.05, 2); ctx.fillStyle = '#1f2937'; ctx.fill();

      const K = O.kettle, ks = K.s;
      rr(ctx, K.x - ks * 0.38, K.y + ks * 0.42, ks * 0.76, ks * 0.1, 4); ctx.fillStyle = '#1f2937'; ctx.fill();
      g = ctx.createLinearGradient(K.x - ks * 0.4, 0, K.x + ks * 0.4, 0);
      g.addColorStop(0, '#9aa3ad'); g.addColorStop(0.45, '#eef1f4'); g.addColorStop(1, '#7b848f');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(K.x - ks * 0.34, K.y + ks * 0.42); ctx.lineTo(K.x + ks * 0.34, K.y + ks * 0.42);
      ctx.quadraticCurveTo(K.x + ks * 0.4, K.y - ks * 0.05, K.x + ks * 0.2, K.y - ks * 0.25); ctx.lineTo(K.x - ks * 0.2, K.y - ks * 0.25);
      ctx.quadraticCurveTo(K.x - ks * 0.4, K.y - ks * 0.05, K.x - ks * 0.34, K.y + ks * 0.42); ctx.closePath(); ctx.fill();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4b5563'; ctx.lineWidth = ks * 0.045; ctx.beginPath(); ctx.arc(K.x, K.y - ks * 0.25, ks * 0.2, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.strokeStyle = '#aab2bc'; ctx.lineWidth = ks * 0.07; ctx.beginPath(); ctx.moveTo(K.x + ks * 0.3, K.y + ks * 0.05); ctx.lineTo(K.x + ks * 0.48, K.y - ks * 0.18); ctx.stroke();
      const boil = smooth(1.5, 3.5, ph) * (1 - smooth(7.6, 8.6, ph));
      ctx.fillStyle = boil > 0.5 ? '#f87171' : '#64748b'; ctx.beginPath(); ctx.arc(K.x - ks * 0.22, K.y + ks * 0.47, ks * 0.025, 0, TAU); ctx.fill();
      if (boil > 0) {
        ctx.strokeStyle = `rgba(235,240,245,${0.4 * boil})`; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let k = 0; k <= 12; k++) { const yy = K.y - ks * 0.22 - k * ks * 0.05, xx = K.x + ks * 0.5 + i * 5 + Math.sin(k * 0.8 - t * 4 + i) * 4; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        }
      }
      const M = O.mug, ms = M.s;
      ctx.strokeStyle = '#e76f51'; ctx.lineWidth = ms * 0.1; ctx.beginPath(); ctx.arc(M.x + ms * 0.42, M.y, ms * 0.2, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      rr(ctx, M.x - ms * 0.4, M.y - ms * 0.42, ms * 0.8, ms * 0.84, ms * 0.1); ctx.fillStyle = '#e76f51'; ctx.fill();
      ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.ellipse(M.x, M.y - ms * 0.42, ms * 0.4, ms * 0.1, 0, 0, TAU); ctx.fill();

      const hand = (x, y, flip, p2) => {
        ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1); ctx.rotate(-0.35);
        const hs = m * 0.22, hg = ctx.createLinearGradient(0, -hs, 0, hs);
        hg.addColorStop(0, '#e9b994'); hg.addColorStop(1, '#c58f6b'); ctx.fillStyle = hg;
        rr(ctx, -hs * 0.28, 0, hs * 0.56, hs * 1.2, hs * 0.2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -hs * 0.05, hs * 0.34, hs * 0.3, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 4; i++) { rr(ctx, -hs * 0.3 + i * hs * 0.16, -hs * 0.55 + Math.abs(i - 1.5) * hs * 0.06 + Math.sin(t * 2 + i + p2) * 2, hs * 0.13, hs * 0.4, hs * 0.065); ctx.fill(); }
        rr(ctx, hs * 0.26, -hs * 0.2, hs * 0.3, hs * 0.13, hs * 0.065); ctx.fill();
        ctx.restore();
      };
      hand(w * 0.3 + Math.sin(t * 0.9) * 8, h * 1.0, 1, 0);
      hand(w * 0.72 + Math.sin(t * 0.7 + 1) * 8, h * 1.02, -1, 1.5);

      // gaze moves board -> kettle -> mug; the attended object gets a box
      const pos = k => [O[k].x, O[k].y - O[k].s * 0.05];
      const a = pos('board'), b = pos('kettle'), c = pos('mug');
      const u1 = smooth(1.2, 2.0, ph), u2 = smooth(6.4, 7.2, ph), u3 = smooth(8.3, 9, ph);
      const gx = lerp(lerp(lerp(a[0], b[0], u1), c[0], u2), a[0], u3) + Math.sin(t * 7) * 2;
      const gy = lerp(lerp(lerp(a[1], b[1], u1), c[1], u2), a[1], u3) + Math.cos(t * 6) * 2;
      const cur = ph < 1.6 ? 'board' : ph < 6.8 ? 'kettle' : 'mug', o = O[cur];
      const box = cur === 'board' ? [o.x - o.s * 0.52, o.y - o.s * 0.19, o.s * 1.04, o.s * 0.38]
        : cur === 'kettle' ? [o.x - o.s * 0.42, o.y - o.s * 0.48, o.s * 0.96, o.s * 1.02] : [o.x - o.s * 0.46, o.y - o.s * 0.56, o.s * 1.04, o.s * 1.02];
      const [x0, y0, bw, bh] = box, cl = Math.min(bw, bh) * 0.22;
      ctx.strokeStyle = 'rgba(94,234,212,.95)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + cl); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cl, y0);
      ctx.moveTo(x0 + bw - cl, y0); ctx.lineTo(x0 + bw, y0); ctx.lineTo(x0 + bw, y0 + cl);
      ctx.moveTo(x0 + bw, y0 + bh - cl); ctx.lineTo(x0 + bw, y0 + bh); ctx.lineTo(x0 + bw - cl, y0 + bh);
      ctx.moveTo(x0 + cl, y0 + bh); ctx.lineTo(x0, y0 + bh); ctx.lineTo(x0, y0 + bh - cl);
      ctx.stroke();
      chip(ctx, o.label, x0, y0 - fs - 13, 'rgba(94,234,212,.92)', '#04211d', fs - 1);
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, 9, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, TAU); ctx.fill();
      ctx.restore();

      const sec = Math.floor(754 + t), tc = `${String(Math.floor(sec / 60) % 60).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      chip(ctx, `● REC  00:${tc}`, 12, 12, 'rgba(0,0,0,.55)', '#fca5a5', fs);
      const ba = smooth(4.0, 4.4, ph) * (1 - smooth(7.2, 7.6, ph));
      if (ba > 0) {
        const bwid = Math.min(w * 0.56, 320), bx = w - bwid - 12, by = 12;
        const text = 'The kettle just boiled. Want a 3-minute timer for your tea?';
        ctx.save(); ctx.globalAlpha = ba;
        ctx.font = `400 ${fs}px ${FONT}`;
        const shown = text.slice(0, Math.ceil(smooth(4.1, 5.3, ph) * text.length));
        const lines = wrapText(ctx, text, bwid - 24, 3), lh = fs * 1.4, bhh = 16 + fs * 1.6 + lines.length * lh + 8;
        rr(ctx, bx, by, bwid, bhh, 12); ctx.fillStyle = 'rgba(14,17,30,.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(124,156,255,.7)'; ctx.lineWidth = 1; ctx.stroke();
        const gg = ctx.createLinearGradient(bx + 12, 0, bx + 24, 0); gg.addColorStop(0, '#7c9cff'); gg.addColorStop(1, '#5eead4');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx + 18, by + 12 + fs * 0.6, fs * 0.55, 0, TAU); ctx.fill();
        ctx.fillStyle = '#e8ebff'; ctx.font = `700 ${fs}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText('Vinci · proactive', bx + 28, by + 12 + fs * 0.6);
        ctx.font = `400 ${fs}px ${FONT}`; ctx.fillStyle = 'rgba(230,234,245,.92)';
        let left = shown.length;
        lines.forEach((l, i) => { if (left > 0) ctx.fillText(l.slice(0, left), bx + 12, by + 16 + fs * 1.6 + i * lh + lh / 2); left -= l.length + 1; });
        ctx.restore();
      }
    }
  };

  /* ---------- Shared pieces for the Dual-SAM and HFP-SAM method walkthroughs ---------- */
  function sharkPath(p, x, y, s) {
    p.moveTo(x + 0.5 * s, y);
    p.quadraticCurveTo(x + 0.3 * s, y - 0.13 * s, x - 0.05 * s, y - 0.12 * s);
    p.lineTo(x - 0.1 * s, y - 0.33 * s);
    p.lineTo(x - 0.2 * s, y - 0.11 * s);
    p.quadraticCurveTo(x - 0.32 * s, y - 0.08 * s, x - 0.4 * s, y - 0.03 * s);
    p.lineTo(x - 0.6 * s, y - 0.25 * s);
    p.lineTo(x - 0.53 * s, y);
    p.lineTo(x - 0.57 * s, y + 0.15 * s);
    p.lineTo(x - 0.4 * s, y + 0.03 * s);
    p.quadraticCurveTo(x - 0.2 * s, y + 0.1 * s, x - 0.02 * s, y + 0.1 * s);
    p.lineTo(x - 0.12 * s, y + 0.27 * s);
    p.lineTo(x + 0.1 * s, y + 0.1 * s);
    p.quadraticCurveTo(x + 0.32 * s, y + 0.1 * s, x + 0.5 * s, y);
    p.closePath();
  }
  function rayPath(p, x, y, s) {   // manta ray seen from above: cephalic fins, swept wings, whip tail
    p.moveTo(x - 0.05 * s, y - 0.16 * s);
    p.lineTo(x - 0.03 * s, y - 0.12 * s);
    p.quadraticCurveTo(x, y - 0.14 * s, x + 0.03 * s, y - 0.12 * s);
    p.lineTo(x + 0.05 * s, y - 0.16 * s);
    p.lineTo(x + 0.08 * s, y - 0.1 * s);
    p.bezierCurveTo(x + 0.25 * s, y - 0.12 * s, x + 0.42 * s, y - 0.06 * s, x + 0.55 * s, y + 0.06 * s);
    p.bezierCurveTo(x + 0.38 * s, y + 0.06 * s, x + 0.2 * s, y + 0.12 * s, x + 0.08 * s, y + 0.24 * s);
    p.quadraticCurveTo(x + 0.03 * s, y + 0.3 * s, x + 0.008 * s, y + 0.3 * s);
    p.lineTo(x + 0.004 * s, y + 0.62 * s);
    p.lineTo(x - 0.004 * s, y + 0.62 * s);
    p.lineTo(x - 0.008 * s, y + 0.3 * s);
    p.quadraticCurveTo(x - 0.03 * s, y + 0.3 * s, x - 0.08 * s, y + 0.24 * s);
    p.bezierCurveTo(x - 0.2 * s, y + 0.12 * s, x - 0.38 * s, y + 0.06 * s, x - 0.55 * s, y + 0.06 * s);
    p.bezierCurveTo(x - 0.42 * s, y - 0.06 * s, x - 0.25 * s, y - 0.12 * s, x - 0.08 * s, y - 0.1 * s);
    p.closePath();
  }
  const animalGeom = (w, h, isRay) => (isRay ? { x: w * 0.5, y: h * 0.33, s: Math.min(w * 0.62, h) } : { x: w * 0.52, y: h * 0.42, s: w * 0.62 });
  function animalP(isRay, w, h, ox = 0, oy = 0, k = 1) {
    const g = animalGeom(w, h, isRay), P = new Path2D();
    (isRay ? rayPath : sharkPath)(P, ox + g.x * k, oy + g.y * k, g.s * k);
    return P;
  }
  function paintUnderwater(x, w, h, isRay, seed, murky) {
    const r = rng(seed);
    let g = x.createLinearGradient(0, 0, 0, h);
    if (murky) { g.addColorStop(0, '#2c5a55'); g.addColorStop(0.55, '#1a3d3c'); g.addColorStop(1, '#10282a'); }
    else { g.addColorStop(0, '#3fa7d1'); g.addColorStop(0.6, '#1f7fb0'); g.addColorStop(1, '#14638f'); }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.15 + i * 0.25 + (r() - 0.5) * 0.1), lg = x.createLinearGradient(0, 0, 0, h);
      lg.addColorStop(0, murky ? 'rgba(150,200,170,.10)' : 'rgba(200,240,255,.14)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = lg; x.beginPath(); x.moveTo(cx - w * 0.03, 0); x.lineTo(cx + w * 0.03, 0); x.lineTo(cx + w * 0.12, h); x.lineTo(cx - w * 0.02, h); x.closePath(); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    const fy = h * 0.8;
    x.fillStyle = murky ? '#24413a' : '#b9a77d'; x.beginPath(); x.moveTo(0, h);
    for (let i = 0; i <= 20; i++) x.lineTo(i / 20 * w, fy + Math.sin(i * 0.9 + r()) * h * 0.025);
    x.lineTo(w, h); x.closePath(); x.fill();
    x.strokeStyle = murky ? 'rgba(0,0,0,.18)' : 'rgba(90,70,40,.1)'; x.lineWidth = 1;
    for (let k = 0; k < (murky ? 9 : 4); k++) {
      const yy = fy + h * 0.03 + k * h * 0.02; x.beginPath();
      for (let i = 0; i <= 40; i++) { const xx = i / 40 * w, v = yy + Math.sin(xx * 0.15 + k) * 1.5; i ? x.lineTo(xx, v) : x.moveTo(xx, v); }
      x.stroke();
    }
    x.fillStyle = murky ? '#16302c' : '#a8987a';
    for (let i = 0; i < (murky ? 4 : 2); i++) { x.beginPath(); x.ellipse(r() * w, fy + h * 0.05, w * (0.05 + r() * 0.06), h * (0.04 + r() * 0.04), 0, Math.PI, TAU); x.fill(); }
    const a = animalGeom(w, h, isRay), ag = x.createLinearGradient(0, a.y - a.s * 0.2, 0, a.y + a.s * 0.25);
    if (isRay) { ag.addColorStop(0, '#1b2830'); ag.addColorStop(1, '#33454c'); }
    else { ag.addColorStop(0, '#3e5f7a'); ag.addColorStop(0.55, '#8fa6b8'); ag.addColorStop(1, '#e3ecf2'); }
    x.fillStyle = ag; x.fill(animalP(isRay, w, h));
    if (isRay) {   // manta details: pale shoulder patches
      x.fillStyle = 'rgba(220,235,235,.16)';
      for (const d of [-1, 1]) { x.beginPath(); x.ellipse(a.x + d * 0.2 * a.s, a.y - 0.01 * a.s, 0.06 * a.s, 0.022 * a.s, d * 0.35, 0, TAU); x.fill(); }
    }
    if (!isRay) {   // shark details: gill slits, eye, lateral line
      x.strokeStyle = 'rgba(20,35,50,.75)'; x.lineWidth = Math.max(1, a.s * 0.008);
      for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(a.x + (0.2 - i * 0.03) * a.s, a.y - 0.05 * a.s); x.quadraticCurveTo(a.x + (0.18 - i * 0.03) * a.s, a.y, a.x + (0.2 - i * 0.03) * a.s, a.y + 0.05 * a.s); x.stroke(); }
      x.fillStyle = '#0b1622'; x.beginPath(); x.arc(a.x + 0.36 * a.s, a.y - 0.035 * a.s, a.s * 0.014, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(230,240,248,.55)'; x.beginPath(); x.moveTo(a.x + 0.42 * a.s, a.y + 0.02 * a.s); x.quadraticCurveTo(a.x, a.y + 0.03 * a.s, a.x - 0.38 * a.s, a.y); x.stroke();
    }
    for (let i = 0; i < (murky ? 140 : 40); i++) { x.fillStyle = `rgba(230,245,240,${r() * (murky ? 0.25 : 0.2)})`; x.fillRect(r() * w, r() * h * 0.85, 1.2, 1.2); }
    if (murky) { x.fillStyle = 'rgba(40,70,60,.3)'; x.fillRect(0, 0, w, h); }
  }
  function gammaCopy(src, gamma) {
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0);
    const im = x.getImageData(0, 0, c.width, c.height), d = im.data, lut = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) lut[i] = 255 * Math.pow(i / 255, gamma) * 1.12 - 16;
    for (let i = 0; i < d.length; i += 4) { d[i] = lut[d[i]]; d[i + 1] = lut[d[i + 1]]; d[i + 2] = lut[d[i + 2]]; }
    x.putImageData(im, 0, 0);
    return c;
  }
  // One level of the 2-D Haar wavelet transform on a grayscale copy of `src`.
  function haar(src, N) {
    const M = Math.round(N * src.height / src.width / 2) * 2, c = document.createElement('canvas');
    c.width = N; c.height = M;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0, N, M);
    const d = x.getImageData(0, 0, N, M).data, g = new Float32Array(N * M);
    for (let i = 0; i < N * M; i++) g[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    const n = N / 2, m = M / 2, LL = new Float32Array(n * m), LH = new Float32Array(n * m), HL = new Float32Array(n * m), HH = new Float32Array(n * m);
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const a = g[2 * j * N + 2 * i], b = g[2 * j * N + 2 * i + 1], c2 = g[(2 * j + 1) * N + 2 * i], e = g[(2 * j + 1) * N + 2 * i + 1], k = j * n + i;
      LL[k] = (a + b + c2 + e) / 4; LH[k] = (a + b - c2 - e) / 2; HL[k] = (a - b + c2 - e) / 2; HH[k] = (a - b - c2 + e) / 2;
    }
    return { n, m, LL, LH, HL, HH };
  }
  function bandCanvas(n, m, f) {
    const c = document.createElement('canvas'); c.width = n; c.height = m;
    const x = c.getContext('2d'), im = x.createImageData(n, m);
    for (let k = 0; k < n * m; k++) { const [r, g, b, a = 255] = f(k); im.data[k * 4] = r; im.data[k * 4 + 1] = g; im.data[k * 4 + 2] = b; im.data[k * 4 + 3] = a; }
    x.putImageData(im, 0, 0);
    return c;
  }
  function arrow(ctx, x1, y1, x2, y2, color, width = 1.4, dash = null, head = 6) {
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head);
    ctx.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // Current step title (top-left) and progress dots (top-right).
  function stepper(ctx, w, labels, k, fs, a) {
    chip(ctx, `${k + 1}  ${labels[k]}`, 12, 12, 'rgba(8,10,18,.78)', '#fff', fs, a);
    const n = labels.length, gap = 11, x0 = w - 14 - (n - 1) * gap, y = 12 + (fs + 9) / 2;
    ctx.save(); ctx.globalAlpha *= a;
    for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x0 + i * gap, y, i === k ? 4 : 3, 0, TAU); ctx.fillStyle = i === k ? '#fff' : i < k ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.2)'; ctx.fill(); }
    ctx.restore();
  }
  function stageOf(ph, B) { let k = 0; for (let i = 0; i < B.length; i++) if (ph >= B[i]) k = i; return k; }
  function dotGrid(ctx, w, h, c) { ctx.fillStyle = c; for (let x = 10; x < w; x += 20) for (let y = 10; y < h; y += 20) ctx.fillRect(x, y, 1, 1); }

  /* ---------- Dual-SAM (CVPR 2024): dual branches, coupled prompts, DFAM, mutual supervision, C3P ---------- */
  const C3P_OBJ = ['.........', '....#....', '...###...', '..#####..', '..#####..', '...###...', '...#.#...', '.........', '.........'];
  const C3P_ARMS = [[0, 2], [0, 1], [2, 0], [1, 0], [-1, 0], [-2, 0], [0, -1], [0, -2]];
  const C3P_CUR = [[4, 2], [3, 3], [4, 4], [5, 3], [4, 3], [3, 5]];
  SCENES.dualsam = {
    init(w, h) {
      const tw = Math.min(w * 0.22, h * 0.48), th = tw / 1.6, L = { tw, th, tx: w * 0.03, ya: h * 0.37, yb: h * 0.79 };
      L.bw = Math.max(10, w * 0.042); L.bh = th * 0.92; L.gap = w * 0.024;
      L.bx = [0, 1, 2].map(i => L.tx + tw + w * 0.06 + i * (L.bw + L.gap));
      L.dr = Math.min(th * 0.34, w * 0.036); L.dx = L.bx[2] + L.bw + w * 0.05 + L.dr;
      L.mw = tw * 0.72; L.mh = th * 0.72; L.mx = L.dx + L.dr + w * 0.045;
      const photo = offscreen(tw, th, x => paintUnderwater(x, tw, th, true, 12, true));
      return { L, photo, gamma: gammaCopy(photo, 0.5) };
    },
    draw(ctx, w, h, t, dt, s) {
      const L = s.L, P = 12.5, ph = t % P, fs = clamp(w / 54, 8.5, 11.5), small = w < 460;
      const k = stageOf(ph, [0, 2.2, 5.0, 6.8, 9.0]), fade = 1 - smooth(11.9, 12.4, ph);
      ctx.fillStyle = '#070b14'; ctx.fillRect(0, 0, w, h); dotGrid(ctx, w, h, 'rgba(255,255,255,.04)');
      ctx.save(); ctx.globalAlpha = fade;
      const rows = [L.ya, L.yb], ymid = (L.ya + L.yb) / 2;

      // 1. original + gamma-corrected inputs
      rows.forEach((y, r) => {
        const x0 = L.tx, y0 = y - L.th / 2;
        ctx.save(); rr(ctx, x0, y0, L.tw, L.th, 6); ctx.clip();
        ctx.drawImage(s.photo, x0, y0, L.tw, L.th);
        if (r === 1) { ctx.beginPath(); ctx.rect(x0, y0, smooth(0.5, 1.8, ph) * L.tw, L.th); ctx.clip(); ctx.drawImage(s.gamma, x0, y0, L.tw, L.th); }
        ctx.restore();
        rr(ctx, x0, y0, L.tw, L.th, 6); ctx.strokeStyle = k === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = 'rgba(220,226,240,.8)'; ctx.font = `600 ${fs - 1}px ${FONT}`; ctx.textBaseline = 'bottom';
        ctx.fillText(r ? 'Gamma branch' : 'Original branch', x0, y0 - 3);
      });
      const gx = L.tx + L.tw / 2, gr = fs * 1.05;
      arrow(ctx, gx, L.ya + L.th / 2 + 3, gx, ymid - gr - 2, 'rgba(250,204,21,.8)', 1.2, null, 5);
      arrow(ctx, gx, ymid + gr + 2, gx, L.yb - L.th / 2 - fs - 4, 'rgba(250,204,21,.8)', 1.2, null, 5);
      ctx.fillStyle = k === 0 ? 'rgba(250,204,21,.95)' : 'rgba(250,204,21,.35)'; ctx.beginPath(); ctx.arc(gx, ymid, gr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1a1300'; ctx.font = `italic 700 ${fs + 1}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('γ', gx, ymid + 1); ctx.textAlign = 'left';
      if (!small) {
        const bx = gx + gr + 8, bs = fs * 2.4, by = ymid - bs / 2, u = smooth(0.3, 1.8, ph);
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bs); ctx.lineTo(bx + bs, by + bs); ctx.stroke();
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.6; ctx.beginPath();
        for (let i = 0; i <= 20 * u; i++) { const v = i / 20, X = bx + v * bs, Y = by + bs - Math.pow(v, 0.5) * bs; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
        ctx.stroke();
      }

      // 2. SAM encoders with adapters (shared weights) and multi-level coupled prompts
      const q = smooth(2.2, 4.6, ph), xs = L.tx + L.tw, xq = lerp(xs, L.bx[2] + L.bw + 4, q), lit = i => smooth(L.bx[i] - 6, L.bx[i] + L.bw, xq) * (k >= 1 ? 1 : 0);
      rows.forEach((y, r) => {
        ctx.strokeStyle = 'rgba(160,175,220,.22)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(xs, y); ctx.lineTo(L.dx - L.dr, y); ctx.stroke();
        L.bx.forEach((bx, i) => {
          const on = lit(i);
          rr(ctx, bx, y - L.bh / 2, L.bw, L.bh, 5); ctx.fillStyle = '#121a30'; ctx.fill();
          ctx.fillStyle = `rgba(124,156,255,${0.18 + 0.25 * on})`; ctx.fill(); ctx.strokeStyle = `rgba(124,156,255,${0.45 + 0.5 * on})`; ctx.stroke();
          rr(ctx, bx + 2, y + L.bh / 2 - L.bh * 0.25, L.bw - 4, L.bh * 0.21, 3); ctx.fillStyle = `rgba(251,146,60,${0.3 + 0.65 * on})`; ctx.fill();
          ctx.fillStyle = 'rgba(230,235,255,.85)'; ctx.font = `700 ${fs - 2}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('L' + (i + 1), bx + L.bw / 2, y - L.bh * 0.12); ctx.textAlign = 'left';
        });
        if (q > 0 && q < 1) { ctx.globalCompositeOperation = 'lighter'; for (let j = 0; j < 3; j++) glowDot(ctx, xq - j * 9, y, 7 - j * 1.5, 'rgba(150,200,255,.9)'); ctx.globalCompositeOperation = 'source-over'; }
      });
      if (!small) {
        ctx.fillStyle = 'rgba(200,210,245,.75)'; ctx.font = `600 ${fs - 1.5}px ${FONT}`; ctx.textBaseline = 'bottom';
        ctx.fillText('SAM encoder + adapters', L.bx[0], L.ya - L.bh / 2 - 28);
      }
      const shx = L.bx[0] - w * 0.024;
      ctx.save(); ctx.globalAlpha *= k === 1 ? 1 : 0.5;
      arrow(ctx, shx, ymid, shx, L.ya + L.bh / 2 - 2, '#f87171', 1.3, null, 5); arrow(ctx, shx, ymid, shx, L.yb - L.bh / 2 + 2, '#f87171', 1.3, null, 5);
      if (!small) { ctx.save(); ctx.translate(shx - 5, ymid); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#fca5a5'; ctx.font = `600 ${fs - 2.5}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('shared', 0, 0); ctx.restore(); }
      ctx.restore();
      L.bx.forEach((bx, i) => {
        const cx = bx + L.bw / 2, on = lit(i), ya2 = L.ya + L.bh / 2, yb2 = L.yb - L.bh / 2, d = Math.max(5, L.bw * 0.32);
        ctx.setLineDash([3, 3]); ctx.lineDashOffset = -t * 18; ctx.strokeStyle = `rgba(250,204,21,${0.2 + 0.6 * on})`; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(cx, ya2); ctx.lineTo(cx, yb2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(250,204,21,${0.35 + 0.65 * on})`;
        ctx.beginPath(); ctx.moveTo(cx, ymid - d); ctx.lineTo(cx + d, ymid); ctx.lineTo(cx, ymid + d); ctx.lineTo(cx - d, ymid); ctx.closePath(); ctx.fill();
        if (on > 0.5 && k === 1) {
          const u = (t * 1.3 + i * 0.3) % 1;
          ctx.globalCompositeOperation = 'lighter';
          glowDot(ctx, cx, lerp(ymid, ya2, u), 6, 'rgba(250,204,21,.95)'); glowDot(ctx, cx, lerp(ymid, yb2, u), 6, 'rgba(250,204,21,.95)');
          ctx.globalCompositeOperation = 'source-over';
        }
      });
      if (!small) {
        ctx.fillStyle = k === 1 ? '#fde68a' : 'rgba(253,230,138,.55)'; ctx.font = `600 ${fs - 1.5}px ${FONT}`; ctx.textBaseline = 'middle';
        ctx.fillText('coupled prompts', L.bx[2] + L.bw + 7, ymid);
      }

      // 3. DFAM: dilated fusion of the multi-level features
      const q3 = smooth(5.0, 6.2, ph);
      rows.forEach((y, r) => {
        const side = r ? 1 : -1, cx = L.dx, on = k === 2 ? 1 : 0.45;
        if (q3 > 0) L.bx.forEach((bx, i) => {
          const sx = bx + L.bw / 2, sy = y + side * L.bh / 2, ey = y + side * L.dr;
          ctx.strokeStyle = `rgba(94,234,212,${(k === 2 ? 0.75 : 0.35) * q3})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + cx) / 2, sy + side * (10 + i * 7), cx, ey); ctx.stroke();
        });
        ctx.fillStyle = '#0e1424'; ctx.beginPath(); ctx.arc(cx, y, L.dr, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(94,234,212,${0.35 + 0.6 * on * Math.max(q3, 0.3)})`; ctx.lineWidth = 1.3; ctx.stroke();
        for (let j = 0; j < 3; j++) {
          ctx.setLineDash([2, 2 * (1 << j)]); ctx.lineDashOffset = t * (8 + j * 6) * (k === 2 ? 1 : 0.3);
          ctx.strokeStyle = `rgba(94,234,212,${0.25 + 0.6 * on})`; ctx.beginPath(); ctx.arc(cx, y, L.dr * (0.32 + 0.24 * j), 0, TAU); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = k === 2 ? '#99f6e4' : 'rgba(153,246,228,.6)'; ctx.font = `700 ${fs - 2}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = r ? 'top' : 'bottom';
        ctx.fillText('DFAM', cx, y + side * (L.dr + 3)); ctx.textAlign = 'left';
      });

      // 4. dual decoders: pseudo-label mutual supervision
      const ma = smooth(6.8, 7.3, ph), defect = 1 - smooth(7.9, 8.8, ph), g = animalGeom(L.tw, L.th, true), sc = L.mw / L.tw;
      rows.forEach((y, r) => {
        const x0 = L.mx, y0 = y - L.mh / 2;
        arrow(ctx, L.dx + L.dr + 2, y, x0 - 3, y, `rgba(160,175,220,${0.25 + 0.5 * ma})`, 1.2, null, 5);
        rr(ctx, x0, y0, L.mw, L.mh, 5); ctx.fillStyle = '#000'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.stroke();
        if (ma > 0) {
          ctx.save(); rr(ctx, x0, y0, L.mw, L.mh, 5); ctx.clip(); ctx.globalAlpha *= ma;
          ctx.fillStyle = '#fff'; ctx.fill(animalP(true, L.tw, L.th, x0, y0, sc));
          if (defect > 0) {
            const ax = x0 + g.x * sc, ay = y0 + g.y * sc, as = g.s * sc;
            ctx.globalAlpha = fade * ma * defect;
            if (r === 0) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ax + 0.36 * as, ay + 0.03 * as, 0.1 * as, 0, TAU); ctx.fill(); }
            else {
              ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax - 0.5 * as, ay + 0.3 * as, 0.08 * as, 0, TAU); ctx.fill();
              ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ax - 0.12 * as, ay + 0.04 * as, 0.05 * as, 0, TAU); ctx.fill();
            }
          }
          ctx.restore();
          chip(ctx, r ? 'Pβ' : 'Pα', x0 + 3, y0 + 3, 'rgba(255,255,255,.14)', '#fff', fs - 2.5, ma);
        }
      });
      const msa = smooth(7.2, 7.6, ph);
      if (msa > 0) {
        const xa = L.mx + L.mw * 0.3, xb = L.mx + L.mw * 0.7, ya2 = L.ya + L.mh / 2 + 3, yb2 = L.yb - L.mh / 2 - 3;
        ctx.save(); ctx.globalAlpha *= msa * (k === 3 ? 1 : 0.5); ctx.lineDashOffset = -t * 16;
        arrow(ctx, xa, ya2, xa, yb2, '#f87171', 1.5, [4, 4], 5); arrow(ctx, xb, yb2, xb, ya2, '#f87171', 1.5, [4, 4], 5);
        ctx.restore();
        if (!small) chip(ctx, 'mutual supervision', L.mx + L.mw / 2 - fs * 4.6, ymid - fs / 2 - 4.5, 'rgba(248,113,113,.9)', '#2b0707', fs - 2.5, msa * (k === 3 ? 1 : 0.5));
      }

      // 5. C3P: each pixel predicts its criss-cross connectivity to 8 neighbours
      const pa = smooth(9.0, 9.4, ph);
      if (pa > 0) {
        const x0 = w * 0.46, y0 = h * 0.13, pw = w * 0.51, phh = h * 0.83;
        ctx.save(); ctx.globalAlpha *= pa;
        rr(ctx, x0, y0, pw, phh, 12); ctx.fillStyle = 'rgba(8,11,20,.96)'; ctx.fill(); ctx.strokeStyle = 'rgba(94,234,212,.5)'; ctx.lineWidth = 1; ctx.stroke();
        const G = 9, cs = Math.min((small ? pw - 24 : pw * 0.55) / G, (phh - 24) / G), gx0 = x0 + 12, gy0 = y0 + (phh - G * cs) / 2;
        const ci = Math.max(0, Math.floor((ph - 9.3) / 0.45)) % C3P_CUR.length, [cx, cy] = C3P_CUR[ci];
        const arm = {};
        C3P_ARMS.forEach(([dx, dy], a) => { arm[(cx + dx) + ',' + (cy + dy)] = a; });
        for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
          const pad = i === 0 || j === 0 || i === G - 1 || j === G - 1, obj = C3P_OBJ[j][i] === '#', X = gx0 + i * cs, Y = gy0 + j * cs;
          ctx.fillStyle = i === cx && j === cy ? '#facc15' : obj ? '#0e7490' : pad ? '#262b36' : '#141925';
          ctx.fillRect(X + 0.5, Y + 0.5, cs - 1, cs - 1);
          const a = arm[i + ',' + j];
          if (a !== undefined) {
            ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 1.6; ctx.strokeRect(X + 1.5, Y + 1.5, cs - 3, cs - 3);
            ctx.fillStyle = obj ? '#ecfeff' : 'rgba(236,254,255,.55)'; ctx.font = `700 ${Math.max(7, cs * 0.42)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(obj ? '1' : '0', X + cs / 2, Y + cs / 2 + 0.5); ctx.textAlign = 'left';
          }
        }
        if (!small) {
          const sx = gx0 + G * cs + pw * 0.09, sw = Math.min(x0 + pw - sx - 40, cs * 4.6), sy = gy0 + cs * 2, act = Math.floor(ph * 3) % 8;
          for (let i = 7; i >= 0; i--) {
            rr(ctx, sx + i * 4, sy - i * 4, sw, sw, 4); ctx.fillStyle = i === 0 ? '#0b1220' : '#0f1626'; ctx.fill();
            ctx.strokeStyle = i === act ? 'rgba(94,234,212,.95)' : 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.save(); rr(ctx, sx, sy, sw, sw, 4); ctx.clip();
          ctx.fillStyle = '#fff'; ctx.fill(animalP(true, L.tw, L.th, sx + sw * 0.05, sy + sw * 0.18, (sw * 0.9) / L.tw));
          ctx.restore();
          ctx.fillStyle = 'rgba(153,246,228,.85)'; ctx.font = `600 ${fs - 2}px ${FONT}`; ctx.textBaseline = 'top';
          ctx.fillText('C1 … C8', sx + 32, sy - 32 - fs * 0.2);
          ctx.fillStyle = 'rgba(220,226,240,.7)';
          wrapText(ctx, '8 connectivity maps → mask', x0 + pw - sx - 10, 2).forEach((l, i) => ctx.fillText(l, sx, sy + sw + 8 + i * fs * 1.25));
        }
        ctx.restore();
      }
      ctx.restore();
      stepper(ctx, w, small ? ['Dual input', 'Coupled prompts', 'DFAM fusion', 'Mutual supervision', 'C3P'] :
        ['Original + gamma-corrected input', 'Multi-level coupled prompts', 'Dilated fusion attention (DFAM)', 'Pseudo-label mutual supervision', 'Criss-cross connectivity (C3P)'], k, fs, fade);
    }
  };

  /* ---------- HFP-SAM (TIP 2026): wavelet frequency prior, FGA, frequency-aware points, Full-View Mamba ---------- */
  SCENES.hfpsam = {
    init(w, h) {
      const vw = Math.min(w * 0.5, (h - 70) * 1.6), vh = vw / 1.6, vx = w * 0.03, vy = Math.max(46, (h - vh) / 2 + 10);
      const photo = offscreen(vw, vh, x => paintUnderwater(x, vw, vh, false, 21, false));
      const H = haar(photo, 128), n = H.n, m = H.m, amp = v => clamp(Math.abs(v) * 6) * 255;
      const LL = bandCanvas(n, m, k => { const v = clamp(H.LL[k]) * 255; return [v, v, v]; });
      const band = arr => bandCanvas(n, m, k => { const v = amp(arr[k]); return [v, v, v]; });
      const F = new Float32Array(n * m);
      for (let k = 0; k < n * m; k++) F[k] = Math.abs(H.LH[k]) + Math.abs(H.HL[k]) + Math.abs(H.HH[k]);
      const sorted = Array.from(F).sort((a, b) => a - b), fmax = sorted[Math.floor(sorted.length * 0.985)] || 1;
      const FM = bandCanvas(n, m, k => { const v = clamp(F[k] / fmax); return [255 * v, 215 * v, 40 * v]; });
      // patch-level frequency-domain mask
      const PX = 16, PY = 10, pwd = n / PX, pht = m / PY, pe = [];
      for (let j = 0; j < PY; j++) for (let i = 0; i < PX; i++) {
        let e = 0;
        for (let y = j * pht; y < (j + 1) * pht; y++) for (let x = i * pwd; x < (i + 1) * pwd; x++) e += F[y * n + x];
        pe.push(e);
      }
      const thr = [...pe].sort((a, b) => a - b)[Math.floor(pe.length * 0.7)];
      const FDM = bandCanvas(PX, PY, k => (pe[k] > thr ? [255, 255, 255] : [0, 0, 0]));
      const FDMy = bandCanvas(PX, PY, k => (pe[k] > thr ? [250, 204, 21, 255] : [0, 0, 0, 0]));
      // frequency-aware point selection over 8 x 5 windows
      const WX = 8, WY = 5, ww = n / WX, wh = m / WY, shark = animalP(false, vw, vh), tc = document.createElement('canvas').getContext('2d'), wins = [];
      tc.canvas.width = Math.ceil(vw); tc.canvas.height = Math.ceil(vh);
      for (let j = 0; j < WY; j++) for (let i = 0; i < WX; i++) {
        let e = 0, pin = null, pany = null;
        for (let y = j * wh; y < (j + 1) * wh; y++) for (let x = i * ww; x < (i + 1) * ww; x++) {
          const v = F[y * n + x], X = (x + 0.5) / n * vw, Y = (y + 0.5) / m * vh;
          e += v;
          if (!pany || v > pany.v) pany = { X, Y, v };
          if (tc.isPointInPath(shark, X, Y) && (!pin || v > pin.v)) pin = { X, Y, v };
        }
        wins.push({ i, j, e: e / (ww * wh), pin, pany, top: false });
      }
      const top = [...wins].sort((a, b) => b.e - a.e).slice(0, 7);
      top.forEach((d, r) => { d.top = true; d.rank = r; });
      const others = wins.filter(d => !d.top).sort((a, b) => b.e - a.e).filter((_, i) => i % 3 === 0).slice(0, 7);
      const bars = [...top, ...others].sort((a, b) => a.j * WX + a.i - (b.j * WX + b.i));
      const emax = top[0].e;
      // a coarse SAM mask: blocky, misses the fin tip, adds a false blob
      const coarse = document.createElement('canvas'); coarse.width = 26; coarse.height = 16;
      const cx2 = coarse.getContext('2d'), gg = animalGeom(vw, vh, false);
      cx2.fillStyle = '#000'; cx2.fillRect(0, 0, 26, 16); cx2.scale(26 / vw, 16 / vh); cx2.fillStyle = '#fff'; cx2.fill(shark);
      cx2.fillStyle = '#000'; cx2.beginPath(); cx2.arc(gg.x - 0.13 * gg.s, gg.y - 0.27 * gg.s, 0.08 * gg.s, 0, TAU); cx2.fill();
      cx2.fillStyle = '#fff'; cx2.beginPath(); cx2.arc(gg.x + 0.12 * gg.s, gg.y + 0.24 * gg.s, 0.06 * gg.s, 0, TAU); cx2.fill();
      const coarseC = bandCanvas(26, 16, (() => { const d = cx2.getImageData(0, 0, 26, 16).data; return k => (d[k * 4] > 127 ? [94, 234, 212, 255] : [0, 0, 0, 0]); })());
      return { vw, vh, vx, vy, photo, LL, LH: band(H.LH), HL: band(H.HL), HH: band(H.HH), FM, FDM, FDMy, wins, top, bars, emax, WX, WY, coarse, coarseC, shark };
    },
    draw(ctx, w, h, t, dt, s) {
      const P = 12.4, ph = t % P, fs = clamp(w / 54, 8.5, 11.5), small = w < 460;
      const B = [0, 2.6, 4.4, 6.4, 8.8], k = stageOf(ph, B), fade = 1 - smooth(11.9, 12.35, ph);
      ctx.fillStyle = '#06101a'; ctx.fillRect(0, 0, w, h); dotGrid(ctx, w, h, 'rgba(255,255,255,.04)');
      const { vx, vy, vw, vh } = s, rx = vx + vw + w * 0.045, rw = w - rx - w * 0.03, ry = vy, rh = vh;
      const sA = i => smooth(B[i], B[i] + 0.3, ph) * (i < 4 ? 1 - smooth(B[i + 1] - 0.15, B[i + 1] + 0.15, ph) : 1);
      ctx.save(); ctx.globalAlpha = fade;

      // ---- left: the image and what each module does to it ----
      ctx.save(); rr(ctx, vx, vy, vw, vh, 8); ctx.clip();
      ctx.translate(vx, vy);
      ctx.drawImage(s.photo, 0, 0, vw, vh);
      const u1 = smooth(0.2, 2.2, ph);
      if (k === 0 && u1 > 0 && u1 < 1) {
        const X = u1 * vw, g = ctx.createLinearGradient(X - 40, 0, X, 0);
        g.addColorStop(0, 'rgba(250,204,21,0)'); g.addColorStop(1, 'rgba(250,204,21,.35)');
        ctx.fillStyle = g; ctx.fillRect(X - 40, 0, 40, vh); ctx.fillStyle = '#fde68a'; ctx.fillRect(X - 1, 0, 2, vh);
      }
      ctx.imageSmoothingEnabled = true;
      const dark = smooth(2.6, 3.0, ph) * (1 - smooth(4.3, 4.6, ph));
      if (dark > 0) {
        ctx.fillStyle = `rgba(0,0,0,${dark})`; ctx.fillRect(0, 0, vw, vh);
        ctx.globalAlpha = fade * dark * (1 - 0.6 * smooth(3.5, 4.0, ph)); ctx.drawImage(s.FM, 0, 0, vw, vh);
        const fd = smooth(3.5, 4.0, ph);
        if (fd > 0) { ctx.imageSmoothingEnabled = false; ctx.globalAlpha = fade * dark * fd * 0.85; ctx.drawImage(s.FDM, 0, 0, vw, vh); ctx.imageSmoothingEnabled = true; }
        ctx.globalAlpha = fade;
      }
      const inj = smooth(4.4, 4.8, ph) * (1 - smooth(6.2, 6.6, ph));
      if (inj > 0) {
        ctx.imageSmoothingEnabled = false; ctx.globalAlpha = fade * inj * (0.35 + 0.15 * Math.sin(t * 5));
        ctx.drawImage(s.FDMy, 0, 0, vw, vh); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = fade;
      }
      const fps = smooth(6.4, 6.8, ph) * (1 - smooth(8.7, 9.0, ph));
      if (fps > 0) {
        const cw = vw / s.WX, chh = vh / s.WY;
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * fps})`; ctx.lineWidth = 1;
        for (let i = 1; i < s.WX; i++) { ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, vh); ctx.stroke(); }
        for (let j = 1; j < s.WY; j++) { ctx.beginPath(); ctx.moveTo(0, j * chh); ctx.lineTo(vw, j * chh); ctx.stroke(); }
        const cm = smooth(7.4, 7.8, ph);
        if (cm > 0) { ctx.imageSmoothingEnabled = false; ctx.globalAlpha = fade * fps * cm * 0.4; ctx.drawImage(s.coarseC, 0, 0, vw, vh); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = fade; }
        for (const d of s.top) {
          const a = smooth(6.6 + d.rank * 0.13, 6.8 + d.rank * 0.13, ph) * fps, rej = !d.pin && smooth(7.9, 8.2, ph);
          if (a <= 0) continue;
          ctx.strokeStyle = rej ? `rgba(148,163,184,${a * 0.6})` : `rgba(251,146,60,${a})`; ctx.lineWidth = 2;
          ctx.strokeRect(d.i * cw + 1, d.j * chh + 1, cw - 2, chh - 2);
          if (rej) { ctx.beginPath(); ctx.moveTo(d.i * cw + 6, d.j * chh + 6); ctx.lineTo((d.i + 1) * cw - 6, (d.j + 1) * chh - 6); ctx.moveTo((d.i + 1) * cw - 6, d.j * chh + 6); ctx.lineTo(d.i * cw + 6, (d.j + 1) * chh - 6); ctx.stroke(); }
          const pa = smooth(8.0 + d.rank * 0.05, 8.25 + d.rank * 0.05, ph) * fps;
          if (pa > 0) {
            const p = d.pin || d.pany;
            ctx.globalAlpha = fade * pa; ctx.fillStyle = d.pin ? '#ef4444' : '#3b82f6'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(p.X, p.Y, 4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.globalAlpha = fade;
          }
        }
      }
      const blk = smooth(8.8, 9.1, ph) * (1 - smooth(11.0, 11.3, ph));
      if (blk > 0) {
        const ref = smooth(9.0, 10.9, ph);
        ctx.fillStyle = `rgba(0,0,0,${blk})`; ctx.fillRect(0, 0, vw, vh);
        ctx.globalAlpha = fade * blk * (1 - ref); ctx.imageSmoothingEnabled = false; ctx.drawImage(s.coarse, 0, 0, vw, vh); ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha = fade * blk * ref; ctx.fillStyle = '#fff'; ctx.fill(s.shark); ctx.globalAlpha = fade;
        const pass = Math.floor((ph - 9.0) / 0.475), pp = ((ph - 9.0) / 0.475) % 1;
        if (pass >= 0 && pass < 4) {
          const horiz = pass % 2 === 0, fwd = pass < 2, pos = (fwd ? pp : 1 - pp) * (horiz ? vw : vh);
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(94,234,212,.9)';
          if (horiz) ctx.fillRect(pos - 1, 0, 2, vh); else ctx.fillRect(0, pos - 1, vw, 2);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      const fin = smooth(11.0, 11.3, ph);
      if (fin > 0) {
        ctx.globalAlpha = fade * fin; ctx.fillStyle = 'rgba(94,234,212,.22)'; ctx.fill(s.shark);
        ctx.shadowColor = '#5eead4'; ctx.shadowBlur = 10; ctx.strokeStyle = '#99f6e4'; ctx.lineWidth = 2; ctx.stroke(s.shark); ctx.shadowBlur = 0; ctx.globalAlpha = fade;
      }
      ctx.restore();
      rr(ctx, vx, vy, vw, vh, 8); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
      const vl = ['input image', 'frequency map → mask', 'mask guides the adapters', 'Top-K windows ∩ coarse mask', ph < 11 ? 'coarse → refined mask' : 'refined mask'][k];
      ctx.fillStyle = 'rgba(220,226,240,.75)'; ctx.font = `500 ${fs - 1.5}px ${FONT}`; ctx.textBaseline = 'top'; ctx.fillText(vl, vx, vy + vh + 6);

      // ---- right: the module itself ----
      ctx.textBaseline = 'middle';
      let a = sA(0);
      if (a > 0) {   // DHWT: LL / LH / HL / HH
        ctx.save(); ctx.globalAlpha *= a;
        const qw = Math.min((rw - 6) / 2, ((rh - fs * 1.8) / 2 - 3) * 1.6), qh = qw / 1.6, qx = rx + (rw - 2 * qw - 6) / 2, qy = ry + fs * 1.8;
        ctx.fillStyle = 'rgba(220,226,240,.8)'; ctx.font = `600 ${fs - 1}px ${FONT}`; ctx.fillText('Haar wavelet (DHWT)', qx, ry + fs * 0.6);
        [['LL', s.LL, 0, 0, 0.4], ['LH', s.LH, 1, 0, 0.9], ['HL', s.HL, 0, 1, 1.3], ['HH', s.HH, 1, 1, 1.7]].forEach(([lb, img, i, j, at]) => {
          const qa = smooth(at, at + 0.35, ph); if (qa <= 0) return;
          const X = qx + i * (qw + 6), Y = qy + j * (qh + 6);
          ctx.save(); ctx.globalAlpha *= qa; rr(ctx, X, Y, qw, qh, 4); ctx.clip(); ctx.drawImage(img, X, Y, qw, qh); ctx.restore();
          rr(ctx, X, Y, qw, qh, 4); ctx.strokeStyle = lb === 'LL' ? 'rgba(255,255,255,.25)' : 'rgba(250,204,21,.7)'; ctx.lineWidth = 1; ctx.stroke();
          chip(ctx, lb, X + 3, Y + 3, 'rgba(0,0,0,.6)', lb === 'LL' ? '#fff' : '#fde68a', fs - 2.5, qa);
        });
        ctx.restore();
      }
      a = sA(1);
      if (a > 0) {   // LH + HL + HH -> frequency map -> frequency-domain mask
        ctx.save(); ctx.globalAlpha *= a;
        const th3 = (rh - 12) / 3, tw3 = Math.min(th3 * 1.6, rw * 0.3), sx = rx + tw3 + rw * 0.12, sy = ry + rh / 2, sr = fs * 1.1;
        [s.LH, s.HL, s.HH].forEach((img, i) => {
          const Y = ry + i * (th3 + 6), X = rx + (tw3 - Math.min(tw3, th3 * 1.6));
          ctx.drawImage(img, X, Y, tw3, tw3 / 1.6); ctx.strokeStyle = 'rgba(250,204,21,.6)'; ctx.lineWidth = 1; ctx.strokeRect(X, Y, tw3, tw3 / 1.6);
          arrow(ctx, X + tw3 + 2, Y + tw3 / 3.2, sx - sr - 2, sy, 'rgba(250,204,21,.7)', 1.1, null, 4);
        });
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
        ctx.fillStyle = '#1a1300'; ctx.font = `700 ${fs + 1}px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('Σ', sx, sy + 1); ctx.textAlign = 'left';
        const ox = sx + sr + rw * 0.08, ow = Math.min(rx + rw - ox, (rh / 2 - fs * 1.6) * 1.6), oh = ow / 1.6;
        const y1 = ry + rh * 0.25 - oh / 2, y2 = ry + rh * 0.75 - oh / 2;
        arrow(ctx, sx + sr + 2, sy - 2, ox - 2, y1 + oh / 2, 'rgba(250,204,21,.7)', 1.1, null, 4);
        ctx.drawImage(s.FM, ox, y1, ow, oh); ctx.strokeStyle = 'rgba(250,204,21,.6)'; ctx.strokeRect(ox, y1, ow, oh);
        const fd = smooth(3.4, 3.9, ph);
        if (fd > 0) {
          ctx.globalAlpha *= fd; arrow(ctx, ox + ow / 2, y1 + oh + 3, ox + ow / 2, y2 - fs * 1.4, 'rgba(255,255,255,.7)', 1.1, null, 4);
          ctx.imageSmoothingEnabled = false; ctx.drawImage(s.FDM, ox, y2, ow, oh); ctx.imageSmoothingEnabled = true; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.strokeRect(ox, y2, ow, oh);
        }
        if (!small) {
          ctx.fillStyle = 'rgba(220,226,240,.75)'; ctx.font = `500 ${fs - 2}px ${FONT}`; ctx.textBaseline = 'bottom';
          ctx.fillText('frequency map', ox, y1 - 2); ctx.fillText('frequency mask', ox, y2 - 2); ctx.textBaseline = 'middle';
        }
        ctx.restore();
      }
      a = sA(2);
      if (a > 0) {   // FGA: frequency mask guides adapters inside a frozen SAM
        ctx.save(); ctx.globalAlpha *= a;
        const nb = 4, gap = Math.max(5, rw * 0.04), bwd = (rw - gap * (nb - 1)) / nb, bh = rh * 0.42, by = ry + rh * 0.42;
        const mw = Math.min(rw * 0.34, rh * 0.32 * 1.6), mh = mw / 1.6;
        ctx.imageSmoothingEnabled = false; ctx.drawImage(s.FDM, rx, ry, mw, mh); ctx.imageSmoothingEnabled = true;
        ctx.strokeStyle = 'rgba(250,204,21,.7)'; ctx.lineWidth = 1; ctx.strokeRect(rx, ry, mw, mh);
        if (!small) { ctx.fillStyle = '#fde68a'; ctx.font = `600 ${fs - 2}px ${FONT}`; ctx.fillText('frequency mask', rx + mw + 6, ry + mh / 2); }
        const tq = smooth(4.6, 6.2, ph), tx = lerp(rx - 4, rx + rw + 4, tq);
        for (let i = 0; i < nb; i++) {
          const X = rx + i * (bwd + gap), half = bwd * 0.56, on = smooth(X - 4, X + bwd, tx);
          rr(ctx, X, by, half, bh, 4); ctx.fillStyle = 'rgba(147,197,253,.18)'; ctx.fill(); ctx.strokeStyle = 'rgba(147,197,253,.6)'; ctx.lineWidth = 1; ctx.stroke();
          rr(ctx, X + half + 2, by, bwd - half - 2, bh, 4); ctx.fillStyle = `rgba(251,146,60,${0.3 + 0.6 * on})`; ctx.fill();
          ctx.fillStyle = '#dbeafe'; ctx.font = `600 ${fs - 2.5}px ${FONT}`; ctx.textAlign = 'center';
          ctx.fillText('❄', X + half / 2, by + bh * 0.3);
          ctx.save(); ctx.translate(X + half / 2, by + bh * 0.65); ctx.rotate(-Math.PI / 2); ctx.fillText('SAM', 0, 0); ctx.restore();
          ctx.save(); ctx.translate(X + half + 2 + (bwd - half - 2) / 2, by + bh / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#2b1100'; ctx.fillText('FGA', 0, 0); ctx.restore();
          ctx.textAlign = 'left';
          ctx.setLineDash([3, 3]); ctx.lineDashOffset = -t * 18; ctx.strokeStyle = `rgba(250,204,21,${0.35 + 0.55 * on})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(rx + mw * 0.5, ry + mh); ctx.quadraticCurveTo(rx + mw * 0.5, by - 10, X + half + 2 + (bwd - half - 2) / 2, by - 2); ctx.stroke(); ctx.setLineDash([]);
        }
        if (tq > 0 && tq < 1) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, tx, by + bh / 2, 9, 'rgba(147,197,253,.95)'); ctx.globalCompositeOperation = 'source-over'; }
        if (!small) {
          ctx.font = `500 ${fs - 2}px ${FONT}`; ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(147,197,253,.9)'; ctx.fillText('■ frozen SAM', rx, by + bh + 8);
          ctx.fillStyle = 'rgba(251,146,60,.95)'; ctx.fillText('■ trainable FGA only', rx + rw * 0.42, by + bh + 8);
          ctx.textBaseline = 'middle';
        }
        ctx.restore();
      }
      a = sA(3);
      if (a > 0) {   // FPS: frequency scores per window, Top-K
        ctx.save(); ctx.globalAlpha *= a;
        const nb = s.bars.length, bh0 = rh * 0.62, base = ry + fs * 1.6 + bh0, bwd = rw / nb, grow = smooth(6.5, 7.3, ph);
        ctx.fillStyle = 'rgba(220,226,240,.8)'; ctx.font = `600 ${fs - 1}px ${FONT}`; ctx.fillText('window frequency scores', rx, ry + fs * 0.6);
        s.bars.forEach((d, i) => {
          const hh = bh0 * (d.e / s.emax) * grow;
          rr(ctx, rx + i * bwd + 1.5, base - hh, bwd - 3, hh, 2);
          ctx.fillStyle = d.top ? (!d.pin && ph > 7.9 ? 'rgba(148,163,184,.6)' : '#fb923c') : 'rgba(148,163,184,.35)'; ctx.fill();
        });
        ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(rx, base + 0.5); ctx.lineTo(rx + rw, base + 0.5); ctx.stroke();
        if (!small) {
          ctx.font = `500 ${fs - 2}px ${FONT}`; ctx.textBaseline = 'top';
          ctx.fillStyle = '#fdba74'; ctx.fillText('■ Top-K windows', rx, base + 8);
          const pa = smooth(8.0, 8.3, ph);
          ctx.globalAlpha *= pa;
          ctx.fillStyle = '#fca5a5'; ctx.fillText('● positive point', rx, base + 10 + fs * 1.3);
          ctx.fillStyle = '#93c5fd'; ctx.fillText('● negative point', rx + rw * 0.5, base + 10 + fs * 1.3);
          ctx.textBaseline = 'middle';
        }
        ctx.restore();
      }
      a = sA(4);
      if (a > 0) {   // Full-View Mamba: spatial + channel scans
        ctx.save(); ctx.globalAlpha *= a;
        const GX = 6, GY = 4, cs = Math.min(rw * 0.62 / GX, (rh - fs * 3) / GY), gx0 = rx, gy0 = ry + fs * 1.8;
        ctx.fillStyle = 'rgba(220,226,240,.8)'; ctx.font = `600 ${fs - 1}px ${FONT}`; ctx.fillText('Full-View Mamba', rx, ry + fs * 0.6);
        ctx.strokeStyle = 'rgba(94,234,212,.25)'; ctx.lineWidth = 1;
        for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) ctx.strokeRect(gx0 + i * cs + 0.5, gy0 + j * cs + 0.5, cs - 1, cs - 1);
        const path = [];
        for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const ii = j % 2 ? GX - 1 - i : i; path.push([gx0 + ii * cs + cs / 2, gy0 + j * cs + cs / 2]); }
        const sp = smooth(9.0, 10.9, ph) * (path.length - 1);
        ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= Math.floor(sp); i++) i ? ctx.lineTo(path[i][0], path[i][1]) : ctx.moveTo(path[i][0], path[i][1]);
        const fi = Math.floor(sp), fr = sp - fi, hx = fi < path.length - 1 ? lerp(path[fi][0], path[fi + 1][0], fr) : path[fi][0], hy = fi < path.length - 1 ? lerp(path[fi][1], path[fi + 1][1], fr) : path[fi][1];
        ctx.lineTo(hx, hy); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, hx, hy, 9, 'rgba(94,234,212,.95)'); ctx.globalCompositeOperation = 'source-over';
        const cx0 = gx0 + GX * cs + rw * 0.08, cwid = Math.max(8, rx + rw - cx0), nc = 6, chh = (GY * cs) / nc, cp = smooth(9.0, 10.9, ph) * nc;
        for (let i = 0; i < nc; i++) { rr(ctx, cx0, gy0 + i * chh + 1, cwid, chh - 2, 2); ctx.fillStyle = i < cp ? 'rgba(94,234,212,.55)' : 'rgba(94,234,212,.12)'; ctx.fill(); }
        if (!small) {
          ctx.font = `500 ${fs - 2}px ${FONT}`; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(153,246,228,.85)';
          ctx.fillText('spatial scan', gx0, gy0 + GY * cs + 6); ctx.fillText('channel', cx0, gy0 + GY * cs + 6);
          ctx.fillStyle = 'rgba(220,226,240,.6)'; ctx.fillText('linear complexity', gx0, gy0 + GY * cs + 8 + fs * 1.2);
          ctx.textBaseline = 'middle';
        }
        ctx.restore();
      }
      ctx.restore();
      stepper(ctx, w, small ? ['Wavelet transform', 'Frequency mask', 'FGA', 'Point selection', 'FVM refine'] :
        ['Haar wavelet transform (DHWT)', 'Frequency map → frequency mask', 'Frequency Guided Adapter (FGA)', 'Frequency-aware Point Selection', 'Full-View Mamba refinement'], k, fs, fade);
    }
  };

  /* ---------- Runner ---------- */
  // Every sketch except the hero fallback is graded into the site's blue–violet light, so the
  // cards read as part of the particle world: hue and saturation come from the palette,
  // brightness from the drawing. Set data-grade="none" on a canvas to keep its own colours.
  function gradeFor(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgb(96, 124, 255)'); g.addColorStop(0.6, 'rgb(164, 112, 255)'); g.addColorStop(1, 'rgb(72, 196, 226)');
    return g;
  }
  class Stage {
    constructor(c) {
      this.c = c; this.ctx = c.getContext('2d'); this.o = { ...c.dataset };
      this.scene = SCENES[this.o.scene]; this.fig = c.closest('figure');
      this.t = 0; this.w = 0; this.h = 0; this.inView = false; this.pointer = null; this.s = null;
      new ResizeObserver(() => this.resize()).observe(c);
      new IntersectionObserver(es => es.forEach(e => { this.inView = e.isIntersecting; }), { rootMargin: '120px' }).observe(c);
      if (this.o.pointer !== undefined) {
        const host = c.parentElement;
        host.addEventListener('pointermove', e => { const b = c.getBoundingClientRect(); this.pointer = { x: e.clientX - b.left, y: e.clientY - b.top }; });
        host.addEventListener('pointerleave', () => { this.pointer = null; });
      }
    }
    resize() {
      const b = this.c.getBoundingClientRect();
      if (!b.width || !b.height || (Math.abs(b.width - this.w) < 1 && Math.abs(b.height - this.h) < 1)) return;
      const dpr = DPR();
      this.w = b.width; this.h = b.height;
      this.c.width = Math.round(b.width * dpr); this.c.height = Math.round(b.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.s = this.scene.init(this.w, this.h, this.o);
      this.grade = this.o.scene === 'hero' || this.o.grade === 'none' ? null : gradeFor(this.ctx, this.w, this.h);
      if (reduce) for (let i = 0; i < 100; i++) this.step(1 / 30);
      else this.step(0);
    }
    active() { return this.s && this.inView && !document.hidden && (!this.fig || this.fig.classList.contains('on')); }
    step(dt) {
      this.t += dt;
      this.ctx.save();
      this.scene.draw(this.ctx, this.w, this.h, this.t, dt, this.s, this, this.o);
      this.ctx.restore();
      if (this.grade) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.62;
        ctx.fillStyle = this.grade; ctx.fillRect(0, 0, this.w, this.h);
        ctx.restore();
      }
    }
  }

  const stages = [...document.querySelectorAll('canvas[data-scene]')].filter(c => SCENES[c.dataset.scene]).map(c => new Stage(c));
  window.__visualStages = stages; // lets you step a scene by hand when debugging
  if (!reduce) {
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const st of stages) if (st.active()) st.step(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
