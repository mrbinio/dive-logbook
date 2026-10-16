// Intro: a short "descent" animation shown once per browser session.
// Tap anywhere to skip. Skipped entirely with "reduce motion" or on the shared map view.
(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sharedView = new URLSearchParams(location.search).has('shared_map');
  let seen = false, lang = 'en';
  try { seen = sessionStorage.getItem('introSeen') === '1'; lang = localStorage.getItem('aq_lang') || 'en'; } catch (e) {}
  const forced = new URLSearchParams(location.search).has('intro'); // ?intro always shows it
  if (!forced && (reduce || sharedView || seen)) return;
  try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}

  const pl = lang === 'pl';
  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.setAttribute('aria-hidden', 'true');

  const title = [...'Mr.Binio'].map((ch, i) =>
    `<span class="${i < 3 ? 'accent' : ''}" style="animation-delay:${0.35 + i * 0.05}s">${ch}</span>`).join('');

  intro.innerHTML = `
    <div class="intro-rays"></div>
    <img class="intro-logo" src="icon.svg" alt="">
    <div class="intro-title">${title}</div>
    <div class="intro-depth"><b id="intro-m">0.0</b><small>m · ${pl ? 'zanurzenie' : 'descending'}</small></div>
    <div class="intro-gauge"><i></i></div>
    <div class="intro-skip">${pl ? 'dotknij, aby pominąć' : 'tap to skip'}</div>`;

  // A handful of bubbles — cheap, transform-only animations
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('div');
    const size = 6 + Math.random() * 18;
    b.className = 'intro-bubble';
    b.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
      `--drift:${(Math.random() - 0.5) * 80}px;animation-duration:${2 + Math.random() * 2}s;` +
      `animation-delay:${Math.random() * 1.2}s`;
    intro.appendChild(b);
  }

  document.body.appendChild(intro);

  // Depth counter 0 → 30 m with ease-out
  const el = intro.querySelector('#intro-m');
  const target = 30, duration = 2200, start = performance.now() + 200;
  function tick(now) {
    const p = Math.min(1, Math.max(0, (now - start) / duration));
    el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(1);
    if (p < 1 && !intro.classList.contains('done')) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    intro.classList.add('done');
    setTimeout(() => intro.remove(), 700);
  }
  intro.addEventListener('click', close);
  setTimeout(close, 2800);
})();
