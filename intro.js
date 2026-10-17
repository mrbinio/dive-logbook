// Intro: dive computer HUD over a live underwater scene (ocean.js), shown once
// per browser session (styles in theme.css). The camera sinks while rings assemble, a holographic scan reveals the diver,
// telemetry streams in the corners, the wordmark decodes with a glitch and your
// logbook stats count up. Tap to skip. Skipped with "reduce motion" or on the
// shared map view; ?intro always shows it, ?intro=2.5 freezes it at 2.5 s.
(function () {
  const params = new URLSearchParams(location.search);
  const forced = params.has('intro');
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
  const has = stats && stats.n;
  const maxD = has ? +stats.max || 0 : 40;
  const specs = has
    ? [
        { v: stats.n, d: 0, l: pl ? 'Nurkowań' : 'Dives' },
        { v: stats.max, d: stats.max % 1 ? 1 : 0, l: 'Max m' },
        { v: stats.hours, d: stats.hours < 10 ? 1 : 0, l: pl ? 'Godzin' : 'Hours' }
      ]
    : null;

  // --- HUD rings (SVG) ---
  let ticks = '';
  for (let i = 0; i < 120; i++) {
    const long = i % 10 === 0;
    ticks += `<line x1="0" y1="-140" x2="0" y2="${long ? -128 : -134}" transform="rotate(${i * 3})" class="${long ? 'tk-l' : ''}"/>`;
  }
  let labels = '';
  for (let i = 0; i < 12; i++) {
    labels += `<text transform="rotate(${i * 30}) translate(0 -116)">${String(i * 30).padStart(3, '0')}</text>`;
  }
  const hud = `
    <svg class="h-svg" viewBox="-150 -150 300 300" aria-hidden="true">
      <g class="h-ticks">${ticks}</g>
      <g class="h-labels">${labels}</g>
      <circle class="h-arc a1" r="104" pathLength="100"/>
      <circle class="h-arc a2" r="96" pathLength="100"/>
      <circle class="h-dash" r="88"/>
      <circle class="h-arc a3" r="146" pathLength="100"/>
    </svg>
    <div class="h-sweep"></div>
    <div class="h-diver"><img src="diver.svg" alt=""><div class="h-scanbar"></div></div>`;

  const corner = (cls, lines) => `<div class="h-tele ${cls}">${lines.map(l => `<div>${l}</div>`).join('')}</div>`;
  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = `
    <canvas class="h-ocean"></canvas>
    <div class="h-shade"></div>
    <div class="h-boot"></div>
    <i class="h-br tl"></i><i class="h-br tr"></i><i class="h-br bl"></i><i class="h-br br"></i>
    ${corner('tl', ['Mr.Binio Dive OS 26', 'Boot · <b>OK</b>', 'Sensors · <b>OK</b>', 'Logbook sync · <b>OK</b>'])}
    ${corner('tr', ['DEPTH <b data-k="depth">000.0</b> M', 'O₂ <b>21</b>%  N₂ <b>79</b>%', 'NDL <b data-k="ndl">99</b> MIN', 'TEMP <b>24</b>°C'])}
    ${corner('bl', ['LAT 54.4416 N', 'LON 18.5601 E', 'HDG <b data-k="hdg">000</b>°'])}
    ${corner('br', ['PPO₂ <b>0.21</b>', 'GF 30/85', 'ASC <b>9</b> M/MIN'])}
    <div class="h-center">
      <div class="h-hud">${hud}</div>
      <div class="h-word" data-text="MR.BINIO"></div>
      <div class="h-sub">${pl ? 'Dziennik nurkowy · system gotowy' : 'Dive logbook · system online'}</div>
      <div class="h-specs">${specs
        ? specs.map(s => `<div class="h-spec"><b data-v="${+s.v || 0}" data-d="${s.d}">0</b><small>${s.l}</small></div>`).join('')
        : ''}</div>
    </div>
    <div class="h-skip">${pl ? 'Dotknij, aby pominąć' : 'Tap to skip'}</div>`;
  document.body.appendChild(intro);

  // Telemetry lines appear one by one
  intro.querySelectorAll('.h-tele div').forEach((el, i) => { el.style.animationDelay = (0.5 + i * 0.12) + 's'; });

  // --- Time-driven parts (decode text, counters), deterministic for freezing ---
  const word = intro.querySelector('.h-word');
  const target = word.dataset.text;
  const glyphs = '01#%&@$<>/\\=+*ABCDEFXYZ▮▯';
  word.innerHTML = [...target].map(() => '<span></span>').join('');
  const spans = word.querySelectorAll('span');
  const nums = intro.querySelectorAll('.h-spec b');
  const depthEl = intro.querySelector('[data-k="depth"]');
  const ndlEl = intro.querySelector('[data-k="ndl"]');
  const hdgEl = intro.querySelector('[data-k="hdg"]');
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const rnd = (seed) => { const x = Math.sin(seed * 999.7) * 43758.5453; return x - Math.floor(x); };

  function render(s) {
    // Wordmark decodes left to right between 1.7 s and 2.7 s
    spans.forEach((sp, i) => {
      const lock = 1.7 + i * 0.12;
      if (s < 1.5) sp.textContent = '';
      else if (s < lock) sp.textContent = glyphs[Math.floor(rnd(i + Math.floor(s * 20)) * glyphs.length)];
      else sp.textContent = target[i];
      sp.classList.toggle('on', s >= lock);
    });
    word.classList.toggle('glitch', (s > 2.62 && s < 2.86) || (s > 4.1 && s < 4.2));
    const dive = ease((s - 0.6) / 3);
    depthEl.textContent = (maxD * dive).toFixed(1).padStart(5, '0');
    ndlEl.textContent = String(Math.max(0, Math.round(99 - 80 * dive))).padStart(2, '0');
    hdgEl.textContent = String(Math.round((s * 47) % 360)).padStart(3, '0');
    const c = ease((s - 2.9) / 1.2);
    nums.forEach(n => { n.textContent = (n.dataset.v * c).toFixed(+n.dataset.d); });
  }

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    intro.classList.add('done');
    setTimeout(() => { if (ocean) ocean.stop(); intro.remove(); }, 900);
  }

  // Live water behind the HUD; the camera sinks as the dive "starts"
  const oceanCanvas = intro.querySelector('.h-ocean');
  const ocean = window.Ocean && Ocean.start(oceanCanvas, s => 0.02 + 0.42 * ease((s - 0.4) / 3.6), frozen ? freeze : undefined);
  if (!ocean) oceanCanvas.remove();

  if (frozen) {
    // Swap the WebGL canvas for a still image so headless screenshots capture it
    if (ocean) requestAnimationFrame(() => requestAnimationFrame(() => { const img = new Image(); img.src = oceanCanvas.toDataURL(); img.className = 'h-ocean'; img.style.cssText = 'animation:none;opacity:1'; oceanCanvas.replaceWith(img); }));
    render(freeze);
    intro.offsetHeight;
    intro.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = freeze * 1000; });
    return;
  }
  const t0 = performance.now();
  (function loop(now) {
    if (closed) return;
    render((now - t0) / 1000);
    requestAnimationFrame(loop);
  })(t0);
  intro.addEventListener('click', close);
  setTimeout(close, 5200);
})();
