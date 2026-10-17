// Underwater scene (WebGL fragment shader): light from the surface, caustics,
// sun shafts and drifting particles. p = how deep the camera is (0 surface, 1 deep).
//   Ocean.start(canvas, s => p)  animate; returns { stop() } or null without WebGL
//   Ocean.still(w, h, p, t)      render one frame and return it as a data URL (or null)
window.Ocean = (function () {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
    precision highp float;
    uniform vec2 r; uniform float t; uniform float p;
    float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
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
      float h = uv.y + 0.55 - p * 1.3;
      vec3 deep = vec3(0.004, 0.012, 0.035);
      vec3 mid  = vec3(0.012, 0.10, 0.22);
      vec3 surf = vec3(0.16, 0.52, 0.80);
      vec3 col = mix(deep, mid, smoothstep(-0.1, 0.75, h));
      col = mix(col, surf, smoothstep(0.62, 1.3, h));
      float c = caustic(q * 0.65 + vec2(0.0, t * 0.03), t * 0.45 + 23.0);
      col += vec3(0.62, 0.86, 1.0) * c * smoothstep(0.35, 1.1, h) * 0.7;
      vec2 d = q - vec2(0.15, 1.7);
      float ang = atan(d.x, -d.y);
      float rays = (0.5 + 0.5 * sin(ang * 23.0 + t * 0.5)) * (0.5 + 0.5 * sin(ang * 41.0 - t * 0.8));
      col += vec3(0.65, 0.88, 1.0) * pow(rays, 3.0) * smoothstep(0.05, 1.1, h) * 0.30;
      for (int k = 0; k < 2; k++) {
        float sc = 14.0 + float(k) * 12.0;
        vec2 gq = q * sc + vec2(float(k) * 7.0, -t * (0.6 + float(k) * 0.5) - p * (18.0 + float(k) * 14.0));
        vec2 id = floor(gq); vec2 f = fract(gq) - 0.5;
        vec2 off = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
        float dot_ = smoothstep(0.09 - float(k) * 0.03, 0.0, length(f - off * 0.6)) * step(0.86, hash(id));
        col += vec3(0.7, 0.88, 1.0) * dot_ * (0.16 + 0.45 * smoothstep(-0.2, 0.8, h));
      }
      col *= 1.0 - 0.55 * length((uv - 0.5) * vec2(1.0, 1.15));
      col = col / (1.0 + col * 0.35);
      gl_FragColor = vec4(col, 1.0);
    }`;

  function setup(canvas, opts) {
    const g = canvas.getContext('webgl', Object.assign({ antialias: false, alpha: false }, opts));
    if (!g) return null;
    const sh = (type, src) => {
      const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s);
      if (g.getShaderParameter(s, g.COMPILE_STATUS)) return s;
      console.warn('Ocean shader:', g.getShaderInfoLog(s));
      return null;
    };
    const v = sh(g.VERTEX_SHADER, VS), f = sh(g.FRAGMENT_SHADER, FS);
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
    const u = { r: g.getUniformLocation(prog, 'r'), t: g.getUniformLocation(prog, 't'), p: g.getUniformLocation(prog, 'p') };
    return {
      g,
      draw(w, h, t, p) {
        g.viewport(0, 0, w, h);
        g.uniform2f(u.r, w, h); g.uniform1f(u.t, t); g.uniform1f(u.p, p);
        g.drawArrays(g.TRIANGLES, 0, 3);
      },
      dispose() { const ext = g.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
    };
  }

  function start(canvas, depthAt, frozenAt) {
    const frozen = Number.isFinite(frozenAt);
    const gl = setup(canvas, { preserveDrawingBuffer: frozen });
    if (!gl) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => { canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr); };
    resize();
    addEventListener('resize', resize);
    const t0 = performance.now();
    let raf = 0;
    function frame(now) {
      const s = frozen ? frozenAt : (now - t0) / 1000;
      gl.draw(canvas.width, canvas.height, s, depthAt(s));
      if (!frozen) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { stop() { cancelAnimationFrame(raf); removeEventListener('resize', resize); gl.dispose(); } };
  }

  function still(w, h, p, t) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const gl = setup(canvas, { preserveDrawingBuffer: true });
    if (!gl) return null;
    gl.draw(w, h, t, p);
    const url = canvas.toDataURL('image/jpeg', 0.86);
    gl.dispose();
    return url;
  }

  return { start, still };
})();
