// Intro: cinematic descent shown once per browser session (styles in theme.css).
// A hairline of light opens into a WebGL underwater scene (caustics, sun rays,
// drifting particles), the camera sinks into the dark and the wordmark + your
// dive "specs" appear. Tap to skip. Skipped with "reduce motion" or on the
// shared map view; ?intro in the URL always shows it.
(function () {
  const params = new URLSearchParams(location.search);
  const forced = params.has('intro');
  // ?intro=2.5 freezes the intro at 2.5 s (for previewing single frames)
  const freeze = parseFloat(params.get('intro'));
  const frozen = Number.isFinite(freeze);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false, lang = 'en', stats = null;
  try {
    seen = sessionStorage.getItem('introSeen') === '1';
    lang = localStorage.getItem('aq_lang') || 'en';
    stats = JSON.parse(localStorage.getItem('introStats') || 'null');
  } catch (e) {}
  if (!forced && (reduce || params.has('shared_map') || seen)) return;
  try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}

  const pl = lang === 'pl';
  // Your logbook as "specs"; before the first login fall back to a tagline
  const specs = stats && stats.n
    ? [
        { v: stats.n, d: 0, l: pl ? 'nurkowań' : 'dives' },
        { v: stats.max, d: stats.max % 1 ? 1 : 0, l: pl ? 'm max' : 'm max depth' },
        { v: stats.hours, d: stats.hours < 10 ? 1 : 0, l: pl ? 'h pod wodą' : 'h underwater' }
      ]
    : null;

  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = `
    <canvas class="i-gl"></canvas>
    <div class="i-water"></div>
    <div class="i-line"></div>
    <div class="i-content">
      <div class="i-diver"><img src="diver.svg" alt="">${'<i></i>'.repeat(5)}</div>
      <div class="i-word">Mr.Binio</div>
      <div class="i-sub">${pl ? 'Dziennik nurkowy' : 'Dive logbook'}</div>
      <div class="i-specs">${specs
        ? specs.map(s => `<div class="i-spec"><b data-v="${+s.v || 0}" data-d="${s.d}">0</b><small>${s.l}</small></div>`).join('')
        : `<div class="i-spec"><small>${pl ? 'Głębia · Czas · Historia' : 'Depth · Time · Story'}</small></div>`}</div>
    </div>
    <div class="i-skip">${pl ? 'Dotknij, aby pominąć' : 'Tap to skip'}</div>`;
  document.body.appendChild(intro);

  let closed = false;
  const t0 = performance.now();
  const gl = startOcean(intro.querySelector('.i-gl'));
  if (gl) intro.classList.add('has-gl');

  // Count the specs up with an ease-out, starting as they fade in
  const nums = intro.querySelectorAll('.i-spec b');
  function countUp(now) {
    const p = Math.min(1, Math.max(0, ((frozen ? freeze * 1000 : now - t0) - 3000) / 1300));
    const e = 1 - Math.pow(1 - p, 4);
    nums.forEach(n => { n.textContent = (n.dataset.v * e).toFixed(+n.dataset.d); });
    if (p < 1 && !closed && !frozen) requestAnimationFrame(countUp);
  }
  if (nums.length) requestAnimationFrame(countUp);

  function close() {
    if (closed) return;
    closed = true;
    intro.classList.add('done');
    setTimeout(() => { if (gl) gl.stop(); intro.remove(); }, 850);
  }
  if (frozen) {
    intro.offsetHeight;
    intro.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = freeze * 1000; });
    return;
  }
  intro.addEventListener('click', close);
  setTimeout(close, specs ? 5400 : 4800);

  // ---------------------------------------------------------------
  // Full-screen fragment shader: the view from under the surface,
  // sinking into the deep. Returns null when WebGL is unavailable
  // (the CSS glow in .i-water is the fallback).
  function startOcean(canvas) {
    const g = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: frozen });
    if (!g) return null;
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `
      precision highp float;
      uniform vec2 r; uniform float t; uniform float p;
      float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
      // Animated water caustics (iterated domain warp)
      float caustic(vec2 uv, float time){
        vec2 q = mod(uv * 6.28318, 6.28318) - 250.0;
        vec2 i = q; float c = 1.0; float inten = 0.005;
        for (int n = 0; n < 5; n++) {
          float tt = time * (1.0 - (3.5 / float(n + 1)));
          i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
          c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / inten), q.y / (cos(i.y + tt) / inten)));
        }
        c /= 5.0; c = 1.17 - pow(c, 1.4);
        return pow(abs(c), 8.0);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / r;
        vec2 q = vec2((uv.x - 0.5) * r.x / r.y, uv.y);
        // h: how much surface light reaches this pixel; drops as we descend (p: 0 -> 1)
        float h = uv.y + 0.55 - p * 1.3;
        vec3 deep = vec3(0.0, 0.004, 0.012);
        vec3 mid  = vec3(0.0, 0.09, 0.16);
        vec3 surf = vec3(0.10, 0.62, 0.70);
        vec3 col = mix(deep, mid, smoothstep(-0.1, 0.7, h));
        col = mix(col, surf, smoothstep(0.6, 1.25, h));
        // Caustic light on the surface above
        float c = caustic(q * 0.65 + vec2(0.0, t * 0.03), t * 0.45 + 23.0);
        col += vec3(0.45, 1.0, 0.92) * c * smoothstep(0.35, 1.1, h) * 0.75;
        // Sun shafts fanning down from above the screen
        vec2 d = q - vec2(0.15, 1.7);
        float ang = atan(d.x, -d.y);
        float rays = (0.5 + 0.5 * sin(ang * 23.0 + t * 0.5)) * (0.5 + 0.5 * sin(ang * 41.0 - t * 0.8));
        col += vec3(0.55, 0.95, 1.0) * pow(rays, 3.0) * smoothstep(0.05, 1.1, h) * 0.32;
        // Particles streaming up past the camera (faster while descending)
        for (int k = 0; k < 2; k++) {
          float sc = 14.0 + float(k) * 12.0;
          vec2 gq = q * sc + vec2(float(k) * 7.0, -t * (0.6 + float(k) * 0.5) - p * (18.0 + float(k) * 14.0));
          vec2 id = floor(gq); vec2 f = fract(gq) - 0.5;
          vec2 off = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
          float dot_ = smoothstep(0.09 - float(k) * 0.03, 0.0, length(f - off * 0.6)) * step(0.86, hash(id));
          col += vec3(0.6, 0.92, 1.0) * dot_ * (0.18 + 0.5 * smoothstep(-0.2, 0.8, h));
        }
        // Vignette + gentle filmic roll-off
        col *= 1.0 - 0.6 * length((uv - 0.5) * vec2(1.0, 1.15));
        col = col / (1.0 + col * 0.35);
        gl_FragColor = vec4(col, 1.0);
      }`;
    function sh(type, src) {
      const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s);
      if (g.getShaderParameter(s, g.COMPILE_STATUS)) return s;
      console.warn('Intro shader:', g.getShaderInfoLog(s));
      return null;
    }
    const v = sh(g.VERTEX_SHADER, vs), f = sh(g.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const prog = g.createProgram();
    g.attachShader(prog, v); g.attachShader(prog, f); g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
    g.useProgram(prog);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, 'a');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const uR = g.getUniformLocation(prog, 'r'), uT = g.getUniformLocation(prog, 't'), uP = g.getUniformLocation(prog, 'p');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
      g.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize);

    let raf = 0;
    function frame(now) {
      const s = frozen ? freeze : (now - t0) / 1000;
      // Hold at the surface for a beat, then sink with an ease-in-out
      const x = Math.min(1, Math.max(0, (s - 1.3) / 2.6));
      const p = x * x * (3 - 2 * x);
      g.uniform2f(uR, canvas.width, canvas.height);
      g.uniform1f(uT, s);
      g.uniform1f(uP, p);
      g.drawArrays(g.TRIANGLES, 0, 3);
      if (frozen) { const img = new Image(); img.src = canvas.toDataURL(); img.className = canvas.className; img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; canvas.replaceWith(img); img.getAnimations().forEach(a => { a.pause(); a.currentTime = freeze * 1000; }); }
      if (!frozen) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return {
      stop() {
        cancelAnimationFrame(raf);
        removeEventListener('resize', resize);
        const ext = g.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }
})();
