// Intro: cinematic reveal shown once per browser session (styles in theme.css).
// Tap anywhere to skip. Skipped with "reduce motion" or on the shared map view;
// ?intro in the URL always shows it.
(function () {
  const params = new URLSearchParams(location.search);
  const forced = params.has('intro');
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
    <div class="i-water"></div>
    <div class="i-line"></div>
    <div class="i-word">Mr.Binio</div>
    <div class="i-sub">${pl ? 'Dziennik nurkowy' : 'Dive logbook'}</div>
    <div class="i-specs">${specs
      ? specs.map(s => `<div class="i-spec"><b data-v="${+s.v || 0}" data-d="${s.d}">0</b><small>${s.l}</small></div>`).join('')
      : `<div class="i-spec"><small>${pl ? 'Głębia · Czas · Historia' : 'Depth · Time · Story'}</small></div>`}</div>
    <div class="i-skip">${pl ? 'Dotknij, aby pominąć' : 'Tap to skip'}</div>`;
  document.body.appendChild(intro);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    intro.classList.add('done');
    setTimeout(() => intro.remove(), 850);
  }

  // Count the specs up with an ease-out, starting as they fade in
  const nums = intro.querySelectorAll('.i-spec b');
  const start = performance.now() + 2000, duration = 1300;
  function tick(now) {
    const p = Math.min(1, Math.max(0, (now - start) / duration));
    const e = 1 - Math.pow(1 - p, 4);
    nums.forEach(n => { n.textContent = (n.dataset.v * e).toFixed(+n.dataset.d); });
    if (p < 1 && !closed) requestAnimationFrame(tick);
  }
  if (nums.length) requestAnimationFrame(tick);

  intro.addEventListener('click', close);
  setTimeout(close, specs ? 4200 : 3600);
})();
