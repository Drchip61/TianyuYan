/* The scroll-driven particle stage at the top of the page.
   On load a particle sphere bursts into a tree standing in rippling water. Scrolling sends the
   publication venues orbiting around it, then folds the tree into a glass cube that spells my name.
   Scrolling always settles on one of those three scenes, and landing on one sends a tremor
   through the particles. Plain WebGL, no libraries. */
(() => {
  'use strict';
  const story = document.querySelector('.story');
  if (!story) return;
  const stage = story.querySelector('.stage'), canvas = story.querySelector('#gl');
  const TAU = Math.PI * 2, FLOOR = -1.25, FOV = 42 * Math.PI / 180;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = Math.min(innerWidth, innerHeight) < 700;

  // ---------- column-major 4x4 matrices ----------
  const M = {
    persp(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    },
    look(e, c) {
      let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz);
      zx /= l; zy /= l; zz /= l;
      let xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xy, xz); xx /= l; xz /= l;   // up = +y
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
        -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
    },
    model(yaw, pitch) {   // rotate about Y, then tilt about X
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
      return [cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1];
    },
    mul(a, b) {
      const o = new Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
      return o;
    },
    apply(m, x, y, z) { return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]]; }
  };

  // ---------- the three shapes (same particle count, index i travels between them) ----------
  function shuffleTriples(pos, bright, r) {
    for (let i = bright.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      for (let k = 0; k < 3; k++) { const t = pos[i * 3 + k]; pos[i * 3 + k] = pos[j * 3 + k]; pos[j * 3 + k] = t; }
      const t = bright[i]; bright[i] = bright[j]; bright[j] = t;
    }
  }
  function sphere(N, r) {
    const p = new Float32Array(N * 3), b = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u);
      const rad = 0.95 * (r() < 0.8 ? 0.93 + r() * 0.07 : Math.cbrt(r()) * 0.93);
      p[i * 3] = s * Math.cos(th) * rad; p[i * 3 + 1] = 0.2 + u * rad; p[i * 3 + 2] = s * Math.sin(th) * rad;
      b[i] = 0.8 + r() * 0.4;
    }
    return { p, b };
  }
  function tree(N, r) {
    const p = new Float32Array(N * 3), b = new Float32Array(N), TOP = -0.55;
    const trunk = t => [0.08 * Math.sin(t * 4), FLOOR + t * (TOP - FLOOR), 0.05 * Math.sin(t * 3 + 1)];
    const segs = [], tips = [];
    const grow = (x, y, z, dx, dy, dz, len, rad, d) => {
      const x1 = x + dx * len, y1 = y + dy * len, z1 = z + dz * len;
      segs.push([x, y, z, x1, y1, z1, rad]);
      if (d === 3) { tips.push([x1, y1, z1]); return; }
      const n = d === 0 ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + r() * 0.9 + d, out = d === 0 ? 0.8 : 0.6;
        const nx = dx * 0.45 + Math.cos(a) * out, ny = (d === 0 ? 0.8 : 0.55) + r() * 0.35, nz = dz * 0.45 + Math.sin(a) * out * 0.8, l = Math.hypot(nx, ny, nz);
        grow(x1, y1, z1, nx / l, ny / l, nz / l, len * (0.62 + r() * 0.18), rad * 0.6, d + 1);
      }
    };
    const top = trunk(1);
    grow(top[0], top[1], top[2], 0, 1, 0, 0.42, 0.1, 0);
    const g = () => (r() + r() + r() - 1.5) / 1.5;
    for (let i = 0; i < N; i++) {
      const u = r();
      let x, y, z, k;
      if (u < 0.12) {          // trunk, flaring where it meets the water
        const t = Math.pow(r(), 0.8), c = trunk(t), rad = 0.065 + 0.09 * Math.pow(1 - t, 3) + 0.04 * Math.pow(t, 4), a = r() * TAU, rr = rad * Math.sqrt(r());
        x = c[0] + Math.cos(a) * rr; y = c[1]; z = c[2] + Math.sin(a) * rr; k = 1.6;
      } else if (u < 0.16) {   // splash at the base
        const a = r() * TAU, rr = 0.05 + Math.pow(r(), 2) * 0.45;
        x = Math.cos(a) * rr; y = FLOOR + r() * 0.05; z = Math.sin(a) * rr * 0.8; k = 1.1;
      } else if (u < 0.4) {    // branches
        const sg = segs[Math.floor(r() * segs.length)], t = r(), a = r() * TAU, rr = sg[6] * Math.sqrt(r()) + 0.008;
        x = lerp(sg[0], sg[3], t) + Math.cos(a) * rr; y = lerp(sg[1], sg[4], t) + (r() - 0.5) * rr; z = lerp(sg[2], sg[5], t) + Math.sin(a) * rr; k = 1.45;
      } else if (u < 0.8) {    // canopy: soft clusters around the branch tips
        const tp = tips[Math.floor(r() * tips.length)];
        x = tp[0] + g() * 0.3; y = tp[1] + g() * 0.32 + 0.02; z = tp[2] + g() * 0.28; k = 0.8 + r() * 0.5;
      } else {                 // canopy fill: a dome so the crown reads as one volume
        let dx, dy, dz;
        do { dx = r() * 2 - 1; dy = r() * 2 - 1; dz = r() * 2 - 1; } while (dx * dx + dy * dy + dz * dz > 1);
        x = dx * 0.8; y = 0.1 + dy * (dy > 0 ? 0.6 : 0.5); z = dz * 0.58; k = 0.65 + r() * 0.4;
      }
      p[i * 3] = x * 1.45; p[i * 3 + 1] = y; p[i * 3 + 2] = z * 1.15; b[i] = k;
    }
    return { p, b };
  }
  function textPixels(text) {
    const W = 720, H = 180, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), font = s => `700 ${s}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    x.font = font(150);
    const size = Math.floor(150 * Math.min(1, (W * 0.94) / x.measureText(text).width));
    x.font = font(size); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2);
    const d = x.getImageData(0, 0, W, H).data, px = [];
    for (let j = 0; j < H; j += 2) for (let i = 0; i < W; i += 2) if (d[(j * W + i) * 4 + 3] > 140) px.push(i / W - 0.5, 0.5 - j / H);
    return { px, aspect: H / W };
  }
  function cube(N, r, text) {
    const p = new Float32Array(N * 3), b = new Float32Array(N), H = 0.62, T = textPixels(text), nT = T.px.length / 2;
    for (let i = 0; i < N; i++) {
      const u = r();
      let x, y, z, k;
      if (u < 0.3) {           // the twelve glowing edges
        const e = Math.floor(r() * 12), ax = e >> 2, s1 = e & 1 ? H : -H, s2 = e & 2 ? H : -H, t = (r() * 2 - 1) * H, j = () => (r() - 0.5) * 0.012;
        [x, y, z] = ax === 0 ? [t, s1, s2] : ax === 1 ? [s1, t, s2] : [s1, s2, t];
        x += j(); y += j(); z += j(); k = 1.7;
      } else if (u < 0.6) {    // faint glass faces
        const f = Math.floor(r() * 6), ax = f >> 1, s = f & 1 ? H : -H, a = (r() * 2 - 1) * H, c = (r() * 2 - 1) * H;
        [x, y, z] = ax === 0 ? [s, a, c] : ax === 1 ? [a, s, c] : [a, c, s]; k = 0.32;
      } else {                 // my name, floating inside
        const q = Math.floor(r() * nT);
        x = T.px[q * 2] * 1.12 + (r() - 0.5) * 0.004; y = T.px[q * 2 + 1] * 1.12 * T.aspect - 0.04; z = 0.12 + (r() - 0.5) * 0.08; k = 1.55;
      }
      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z; b[i] = k;
    }
    return { p, b };
  }

  // ---------- scene orchestration (runs with or without WebGL) ----------
  const scenes = [...story.querySelectorAll('.scene')];
  const pills = [...story.querySelectorAll('.pill')];
  story.querySelectorAll('.split').forEach(el => {
    let i = 0;
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    const walk = node => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of n.textContent) {
            const s = document.createElement('span');
            s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; s.setAttribute('aria-hidden', 'true');
            frag.appendChild(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      }
    };
    walk(el);
  });

  let W = 0, H = 0, dpr = 1, proj, view, camZ = 4.4;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, str: 0, last: -1e9 };
  addEventListener('pointermove', e => {
    mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = 1 - e.clientY / innerHeight * 2; mouse.last = performance.now();
  }, { passive: true });
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(story);
  const progress = () => { const r = story.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };

  // ---------- detents: scrolling settles on a scene ----------
  // The three scenes rest at these points of the story's scroll progress; the start of the
  // page content below is a fourth stop. When scrolling stops between two stops, the page
  // glides to the nearer one, leaning toward the way it was moving so a short flick still
  // advances a step. Arriving on a scene records the time for the landing tremor.
  const RESTS = [0, 0.35, 0.86], LEAN = 48;
  let landed = -1e9;
  (() => {
    const root = document.documentElement, hasEnd = 'onscrollend' in window;
    let lastY = scrollY, dir = 0, moved = false, touching = false, glide = 0, idle = 0;
    const stops = () => {
      const top = story.getBoundingClientRect().top + scrollY, range = story.offsetHeight - innerHeight;
      return [...RESTS.map(s => Math.round(top + s * range)), Math.round(top + story.offsetHeight)];
    };
    const land = i => { if (i < RESTS.length && !reduce) landed = performance.now(); };
    function glideTo(i, ys) {
      const from = scrollY, d = ys[i] - from;
      moved = false;
      if (reduce || Math.abs(d) < 2) { root.style.scrollBehavior = 'auto'; scrollTo(0, ys[i]); root.style.scrollBehavior = ''; lastY = scrollY; land(i); return; }
      const dur = clamp(320 + Math.abs(d) * 0.45, 420, 900), t0 = performance.now();
      root.style.scrollBehavior = 'auto';
      const step = now => {
        const t = clamp((now - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        scrollTo(0, from + d * e);
        lastY = scrollY;
        if (t < 1) { glide = requestAnimationFrame(step); return; }
        glide = 0; root.style.scrollBehavior = '';
        land(i);
      };
      glide = requestAnimationFrame(step);
    }
    function stop() {
      if (glide) { cancelAnimationFrame(glide); glide = 0; root.style.scrollBehavior = ''; lastY = scrollY; }
    }
    function settle() {
      if (glide || touching) return;
      const y = scrollY, ys = stops(), at = ys.findIndex(v => Math.abs(v - y) < 2);
      if (at >= 0) { if (moved) land(at); moved = false; return; }
      if (y < ys[0] || y > ys[ys.length - 1]) { moved = false; return; }
      let i = 0;
      while (y > ys[i + 1]) i++;
      const f = (y - ys[i]) / (ys[i + 1] - ys[i]), lean = Math.min(0.15, LEAN / (ys[i + 1] - ys[i]));
      glideTo(dir > 0 ? (f > lean ? i + 1 : i) : dir < 0 ? (f < 1 - lean ? i : i + 1) : Math.round(f) + i, ys);
    }
    addEventListener('scroll', () => {
      if (glide) return;
      const y = scrollY;
      if (y !== lastY) { dir = Math.sign(y - lastY); moved = true; lastY = y; }
      if (!hasEnd) { clearTimeout(idle); idle = setTimeout(settle, 160); }
    }, { passive: true });
    if (hasEnd) addEventListener('scrollend', settle);
    addEventListener('wheel', stop, { passive: true });
    addEventListener('touchstart', () => { touching = true; stop(); }, { passive: true });
    ['touchend', 'touchcancel'].forEach(t => addEventListener(t, () => {
      touching = false;
      clearTimeout(idle); idle = setTimeout(settle, 160);
    }, { passive: true }));
    // Arrow keys, Page Up/Down and Space step one scene at a time inside the story.
    addEventListener('keydown', e => {
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if ((!down && !up) || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable], dialog') || (e.key === ' ' && e.target.closest?.('a, button'))) return;
      const y = scrollY, ys = stops();
      const i = down ? ys.findIndex(v => v > y + 2) : ys.findLastIndex(v => v < y - 2);
      if (i < 0 || (down && y < ys[0] - 2) || (up && y > ys[ys.length - 1] + 2)) return;
      e.preventDefault(); stop();
      glideTo(i, ys);
    });
  })();

  function resize() {
    const r = stage.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    if (w !== W || h !== H) { W = w; H = h; if (canvas) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); } }
  }
  function camera(c) {
    const aspect = W / H, portrait = aspect < 0.9, fit = Math.max(1, 0.75 / aspect);
    camZ = lerp(4.4, 4.2, c) * fit;
    proj = M.persp(FOV, aspect, 0.1, 80);
    view = M.look([0, lerp(0.3, 0.2, c), camZ], [0, lerp(-0.18, -0.02, c) - (portrait ? 0.35 * fit : 0), 0]);
  }
  function placePills(t, s, kick) {
    const pv = smooth(0.14, 0.26, s) * (1 - smooth(0.44, 0.54, s));
    if (pv < 0.002) { if (pills[0] && pills[0].style.opacity !== '0') pills.forEach(el => { el.style.opacity = '0'; }); return; }
    const portrait = W / H < 0.9, vp = M.mul(proj, view), half = camZ * Math.tan(FOV / 2) * (W / H), rx = Math.min(2.2, half * 0.8), rz = portrait ? 2.4 : 1.35;
    pills.forEach((el, i) => {
      const a = i / pills.length * TAU + (reduce ? 0 : t * 0.16) + s * 3;
      const x = Math.cos(a) * rx, z = Math.sin(a) * rz, y = FLOOR + 0.42 + Math.sin(t * 0.9 + i) * 0.05 - (1 - pv) * 0.3;
      const c = M.apply(vp, x, y, z), sx = (c[0] / c[3] * 0.5 + 0.5) * W, sy = (0.5 - c[1] / c[3] * 0.5) * H, depth = (z + rz) / (2 * rz);
      el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%) scale(${(lerp(0.72, 1.12, depth) * (1 + kick)).toFixed(3)})`;
      el.style.opacity = (pv * lerp(0.3, 1, depth)).toFixed(3);
      el.style.filter = depth < 0.45 ? `blur(${((0.45 - depth) * 5).toFixed(1)}px)` : 'none';
      el.style.zIndex = String(Math.round(depth * 10));
    });
  }

  // ---------- WebGL ----------
  const gl = canvas && canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' });
  if (!gl) {
    story.classList.add('no-gl');
    const fb = story.querySelector('.fallback');
    if (fb) fb.hidden = false;
  }
  const VS = `
    attribute vec3 aA, aB, aC, aK;
    attribute vec4 aR;            // x: stagger, y: size, z: hue, w: random
    uniform mat4 uProj, uView, uModel;
    uniform float uTime, uP, uPx, uReflect, uFloor, uScatter, uAspect, uMouseStr, uKickT;
    uniform vec2 uMouse;
    varying float vA;
    varying vec3 vC;
    vec3 pal(float h) {
      vec3 c1 = vec3(0.16, 0.34, 1.0), c2 = vec3(0.28, 0.72, 1.0), c3 = vec3(0.5, 0.28, 1.0), c4 = vec3(0.92, 0.4, 0.95);
      if (h < 0.5) return mix(c1, c2, h / 0.5);
      if (h < 0.93) return mix(c1, c3, (h - 0.5) / 0.43);
      return c4;
    }
    void main() {
      float t1 = smoothstep(0.0, 1.0, clamp((uP - aR.x * 0.35) / 0.65, 0.0, 1.0));
      float t2 = smoothstep(0.0, 1.0, clamp((uP - 1.0 - aR.x * 0.35) / 0.65, 0.0, 1.0));
      vec3 p = mix(mix(aA, aB, t1), aC, t2);
      float th = aR.w * 43.98, ph = acos(2.0 * fract(aR.w * 13.37 + aR.x * 3.1) - 1.0);
      vec3 d = vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th));
      p += d * (sin(3.14159 * t1) + sin(3.14159 * t2)) * (0.3 + 0.5 * aR.w) * uScatter;
      p += 0.012 * uScatter * vec3(sin(uTime * 1.3 + aR.x * 40.0), sin(uTime * 1.1 + aR.w * 50.0), cos(uTime * 1.7 + aR.x * 30.0));
      // landing tremor: a fast shiver, a jelly wobble, and a bright ring running out from the centre
      vec3 kc = p - vec3(0.0, -0.25, 0.0);
      float kr = length(kc), kAmp = exp(-uKickT * 3.2) * uScatter;
      float kf = (kr - uKickT * 3.0) * 3.2;
      float ring = exp(-kf * kf) * exp(-uKickT * 1.4) * uScatter;
      p += d * kAmp * 0.03 * sin(uKickT * 52.0 + aR.w * 31.0);
      p += kc * kAmp * 0.07 * sin(uKickT * 17.0);
      p += kc / max(kr, 0.05) * ring * 0.09;
      vec4 wp = uModel * vec4(p, 1.0);
      float above = wp.y - uFloor;
      if (uReflect > 0.5) wp.y = uFloor - above;
      vec4 vp = uView * wp;
      vec4 cp = uProj * vp;
      vec2 ndc = cp.xy / cp.w, dm = ndc - uMouse;
      ndc += normalize(dm + 1e-4) * uMouseStr * smoothstep(0.22, 0.0, length(dm * vec2(uAspect, 1.0))) * 0.022;
      gl_Position = vec4(ndc * cp.w, cp.z, cp.w);
      gl_PointSize = max(1.0, aR.y * uPx / max(0.5, -vp.z));
      float k = mix(mix(aK.x, aK.y, t1), aK.z, t2);
      float tw = 0.75 + 0.25 * sin(uTime * 2.3 + aR.w * 40.0);
      vA = k * tw * (1.0 + kAmp * 0.5 + ring * 1.4) * (uReflect > 0.5 ? 0.16 * exp(-max(above, 0.0) * 1.2) * step(0.0, above) : 1.0);
      vC = pal(aR.z);
    }`;
  const FLOOR_VS = `
    attribute vec3 aF;            // x, z, random
    uniform mat4 uProj, uView;
    uniform float uTime, uFloor, uPx, uKickT;
    varying float vA;
    varying vec3 vC;
    void main() {
      vec2 q = aF.xy;
      float sf = (length(q) - 0.2 - uKickT * 2.4) * 3.5;
      float splash = exp(-sf * sf) * exp(-uKickT * 1.1);   // ring from a landing
      float ang = atan(q.y, q.x);
      float r = length(q) + 0.12 * sin(ang * 3.0 + uTime * 0.3) + 0.06 * sin(ang * 7.0 - uTime * 0.5);
      float w1 = pow(0.5 + 0.5 * sin(r * 7.0 - uTime * 1.8), 8.0);
      float w2 = pow(0.5 + 0.5 * sin(r * 3.6 - uTime * 1.1 + 1.3), 12.0) * 0.7;
      vec4 vp = uView * vec4(q.x, uFloor + (w1 + w2) * 0.02 + splash * 0.07, q.y, 1.0);
      gl_Position = uProj * vp;
      gl_PointSize = max(1.0, (1.0 + aF.z) * uPx / max(0.5, -vp.z));
      vA = (0.07 + (w1 + w2) * 1.5 + splash * 1.6) * smoothstep(5.5, 0.6, length(q));
      vC = mix(vec3(0.2, 0.42, 1.0), vec3(0.5, 0.4, 1.0), aF.z);
    }`;
  const FS = `
    precision mediump float;
    varying float vA;
    varying vec3 vC;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.24, 0.0, d) + smoothstep(0.5, 0.0, d) * 0.45;   // bright core + soft halo
      gl_FragColor = vec4(vC * a * vA * 0.85, 1.0);
    }`;

  let P1, P2, main, floor, stars, U1, U2;
  if (gl) {
    try {
      const prog = (vs, fs) => {
        const p = gl.createProgram();
        for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
          const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
          if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
          gl.attachShader(p, sh);
        }
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        return p;
      };
      const uniforms = (p, names) => Object.fromEntries(names.map(n => [n, gl.getUniformLocation(p, n)]));
      const buf = data => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
      P1 = prog(VS, FS); P2 = prog(FLOOR_VS, FS);
      U1 = uniforms(P1, ['uProj', 'uView', 'uModel', 'uTime', 'uP', 'uPx', 'uReflect', 'uFloor', 'uScatter', 'uAspect', 'uMouseStr', 'uMouse', 'uKickT']);
      U2 = uniforms(P2, ['uProj', 'uView', 'uTime', 'uFloor', 'uPx', 'uKickT']);

      const r = rng(7), N = mobile ? 11000 : 26000;
      const A = sphere(N, r), B = tree(N, r), C = cube(N, r, 'Tianyu Yan');
      shuffleTriples(A.p, A.b, r); shuffleTriples(B.p, B.b, r); shuffleTriples(C.p, C.b, r);
      const R = new Float32Array(N * 4), K = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        R[i * 4] = r(); R[i * 4 + 1] = 0.6 + r() * 0.9; R[i * 4 + 2] = r(); R[i * 4 + 3] = r();
        K[i * 3] = A.b[i]; K[i * 3 + 1] = B.b[i]; K[i * 3 + 2] = C.b[i];
      }
      main = { n: N, attrs: { aA: [buf(A.p), 3], aB: [buf(B.p), 3], aC: [buf(C.p), 3], aR: [buf(R), 4], aK: [buf(K), 3] } };

      const NS = mobile ? 700 : 1500, S = new Float32Array(NS * 3), SR = new Float32Array(NS * 4), SK = new Float32Array(NS * 3);
      for (let i = 0; i < NS; i++) {
        const th = r() * TAU, u = r() * 0.95 + 0.02, rad = 14 + r() * 10, s = Math.sqrt(1 - u * u);
        S[i * 3] = Math.cos(th) * s * rad; S[i * 3 + 1] = u * rad * 0.6 - 1; S[i * 3 + 2] = Math.sin(th) * s * rad - 6;
        SR[i * 4] = 0; SR[i * 4 + 1] = 0.6 + r() * 1.4; SR[i * 4 + 2] = r(); SR[i * 4 + 3] = r();
        SK[i * 3] = SK[i * 3 + 1] = SK[i * 3 + 2] = 0.35 + r() * 0.5;
      }
      const sb = buf(S);
      stars = { n: NS, attrs: { aA: [sb, 3], aB: [sb, 3], aC: [sb, 3], aR: [buf(SR), 4], aK: [buf(SK), 3] } };

      const NF = mobile ? 9000 : 22000, F = new Float32Array(NF * 3);
      for (let i = 0; i < NF; i++) { const a = r() * TAU, rr = 5.5 * Math.sqrt(r()); F[i * 3] = Math.cos(a) * rr; F[i * 3 + 1] = Math.sin(a) * rr; F[i * 3 + 2] = r(); }
      floor = { n: NF, attrs: { aF: [buf(F), 3] } };
    } catch (err) {
      console.warn('Particle stage disabled:', err);
      P1 = null;
      const fb = story.querySelector('.fallback');
      if (fb) fb.hidden = false;
    }
  }
  function bind(p, set) {
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
    for (const [name, [b, size]] of Object.entries(set.attrs)) {
      const loc = gl.getAttribLocation(p, name);
      if (loc < 0) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
  }
  function draw(t, P, yaw, pitch, kt) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.008, 0.012, 0.035, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    const px = dpr * (7 + 9 * Math.min(H, 1100) / 900);

    gl.useProgram(P1);
    gl.uniformMatrix4fv(U1.uProj, false, proj); gl.uniformMatrix4fv(U1.uView, false, view);
    gl.uniform1f(U1.uTime, t); gl.uniform1f(U1.uFloor, FLOOR); gl.uniform1f(U1.uAspect, W / H);
    gl.uniform2f(U1.uMouse, mouse.x, mouse.y);
    // stars
    gl.uniformMatrix4fv(U1.uModel, false, M.model(t * 0.006, 0));
    gl.uniform1f(U1.uKickT, kt);
    gl.uniform1f(U1.uP, 0); gl.uniform1f(U1.uScatter, 0); gl.uniform1f(U1.uReflect, 0); gl.uniform1f(U1.uMouseStr, 0); gl.uniform1f(U1.uPx, px * 0.9);
    bind(P1, stars); gl.drawArrays(gl.POINTS, 0, stars.n);
    // rippling water
    gl.useProgram(P2);
    gl.uniformMatrix4fv(U2.uProj, false, proj); gl.uniformMatrix4fv(U2.uView, false, view);
    gl.uniform1f(U2.uTime, t); gl.uniform1f(U2.uFloor, FLOOR); gl.uniform1f(U2.uPx, px); gl.uniform1f(U2.uKickT, kt);
    bind(P2, floor); gl.drawArrays(gl.POINTS, 0, floor.n);
    // reflection, then the particles themselves
    gl.useProgram(P1);
    gl.uniformMatrix4fv(U1.uModel, false, M.model(yaw, pitch));
    gl.uniform1f(U1.uP, P); gl.uniform1f(U1.uScatter, 1); gl.uniform1f(U1.uPx, px); gl.uniform1f(U1.uMouseStr, mouse.str);
    bind(P1, main);
    gl.uniform1f(U1.uReflect, 1); gl.drawArrays(gl.POINTS, 0, main.n);
    gl.uniform1f(U1.uReflect, 0); gl.drawArrays(gl.POINTS, 0, main.n);
  }

  // ---------- frame loop ----------
  const t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000, tt = reduce ? 2 : t, s = progress();
    const intro = reduce ? 1 : smooth(0.5, 3.2, t), toCube = smooth(0.5, 0.74, s);
    const kt = Math.min(10, (now - landed) / 1000), wob = Math.exp(-kt * 4) * Math.sin(kt * 21);   // landing tremor
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    mouse.str = lerp(mouse.str, now - mouse.last < 700 ? 1 : 0, 0.05);
    scenes[0].classList.toggle('on', intro > 0.45 && s < 0.16);
    scenes[1].classList.toggle('on', s > 0.2 && s < 0.48);
    scenes[2].classList.toggle('on', s > 0.7);
    resize(); camera(toCube);
    placePills(tt, s, wob * 0.12);
    if (gl && P1) {
      const yawTree = reduce ? 0.6 : t * 0.12;
      const yawCube = Math.round(yawTree / TAU) * TAU + (reduce ? 0 : Math.sin(t * 0.5) * 0.38) + mouse.x * 0.35;
      draw(tt, intro + toCube, lerp(yawTree + mouse.x * 0.25, yawCube, toCube), 0.04 + mouse.y * 0.06 + wob * 0.018, kt);
    }
  }
  requestAnimationFrame(frame);
})();
