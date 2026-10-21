// "Your year underwater": full-screen story slides (tap right/left, hold to
// pause) over the live ocean scene, which sinks a little deeper on each slide.
// The last slide shares a 1080x1920 summary image.
function wrappedYear() {
  const y = new Date().getFullYear();
  const n = yr => dives.filter(d => (d.date || '').startsWith(String(yr))).length;
  return n(y) >= 3 || n(y - 1) < n(y) ? y : y - 1;
}

function wrappedData(year) {
  const list = dives.filter(d => (d.date || '').startsWith(String(year)));
  const minutes = list.reduce((a, d) => a + (d.duration || 0), 0);
  const deepest = list.filter(d => d.depth).sort((a, b) => b.depth - a.depth)[0] || null;
  const tally = f => { const m = {}; list.forEach(d => f(d).forEach(k => { if (k) m[k] = (m[k] || 0) + 1; })); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const sites = tally(d => [d.site && String(d.site).trim()]);
  const buddies = tally(d => String(d.buddy || '').split(',').map(x => x.trim()).filter(x => x && !/^(none|null|-|—)$/i.test(x)));
  const months = Array(12).fill(0);
  list.forEach(d => { const m = parseInt((d.date || '').slice(5, 7), 10); if (m) months[m - 1]++; });
  const temps = list.map(d => parseFloat(d.temp)).filter(v => !isNaN(v));
  const sacs = list.slice().sort((a, b) => a.date.localeCompare(b.date)).map(d => DiveTools.sac(d)).filter(v => v != null);
  const half = Math.floor(sacs.length / 2);
  const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sac = sacs.length ? { avg: avg(sacs), early: half >= 2 ? avg(sacs.slice(0, half)) : null, late: half >= 2 ? avg(sacs.slice(half)) : null } : null;
  const badges = DiveTools.badges(dives).filter(b => b.earned && (b.earnedOn || '').startsWith(String(year)));
  return { year, list, minutes, deepest, sites, buddies, months, temps, sac, badges };
}

function openWrapped(year) {
  year = year || wrappedYear();
  const w = wrappedData(year);
  const L = (pl, en) => lang === 'pl' ? pl : en;
  const loc = lang === 'pl' ? 'pl-PL' : 'en-GB';
  const monthName = i => new Date(2026, i, 1).toLocaleDateString(loc, { month: 'long' });
  const hours = Math.round(w.minutes / 6) / 10;
  const slides = [];

  slides.push(`<div class="w-c w-center">
      <small class="w-kicker">Mr.Binio · ${L('Twój rok pod wodą', 'Your year underwater')}</small>
      <div class="w-year">${year}</div>
      <p class="w-sub">${w.list.length ? L('Zanurzmy się w nim jeszcze raz.', "Let's dive back into it.") : L('W tym roku nie ma jeszcze nurkowań.', 'No dives logged this year yet.')}</p></div>`);
  if (w.list.length) {
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('W tym roku zanurzyłeś się', 'This year you went under')}</small>
      <div class="w-big"><span data-count="${w.list.length}">0</span><i>${L('razy', w.list.length === 1 ? 'time' : 'times')}</i></div>
      <div class="w-big w-mid"><span data-count="${hours}" data-dec="1">0</span><i>${L('godzin pod wodą', 'hours underwater')}</i></div>
      <p class="w-sub">${L(`To ${Math.max(1, Math.round(w.minutes / 100))} filmów pełnometrażowych — tylko że pod wodą.`, `That's ${Math.max(1, Math.round(w.minutes / 100))} feature films — underwater.`)}</p></div>`);
  }
  if (w.deepest) {
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('Najgłębiej zszedłeś na', 'Your deepest point')}</small>
      <div class="w-big w-huge"><span data-count="${w.deepest.depth}" data-dec="${w.deepest.depth % 1 ? 1 : 0}">0</span><i>m</i></div>
      <p class="w-sub"><b>${esc(w.deepest.site || w.deepest.location || '')}</b>${w.deepest.date ? ' · ' + formatDate(w.deepest.date) : ''}</p>
      <p class="w-sub w-dim">${L(`To mniej więcej ${Math.round(w.deepest.depth / 3)} pięter w dół.`, `About ${Math.round(w.deepest.depth / 3)} floors down.`)}</p></div>`);
  }
  if (w.sites.length) {
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('Odwiedziłeś', 'You explored')}</small>
      <div class="w-big"><span data-count="${w.sites.length}">0</span><i>${L(w.sites.length === 1 ? 'miejsce' : 'miejsc', w.sites.length === 1 ? 'site' : 'sites')}</i></div>
      <ol class="w-list">${w.sites.slice(0, 3).map(([s, n]) => `<li><b>${esc(s)}</b><span>${n}×</span></li>`).join('')}</ol></div>`);
  }
  if (w.buddies.length) {
    slides.push(`<div class="w-c w-center">
      <small class="w-kicker">${L('Buddy roku', 'Buddy of the year')}</small>
      <div class="w-name">${esc(w.buddies[0][0])}</div>
      <p class="w-sub">${L(`${w.buddies[0][1]} wspólnych nurkowań`, `${w.buddies[0][1]} dives together`)}</p>
      ${w.buddies.length > 1 ? `<p class="w-sub w-dim">${L('Także', 'Also')}: ${w.buddies.slice(1, 4).map(b => esc(b[0])).join(', ')}</p>` : ''}</div>`);
  }
  const peak = w.months.indexOf(Math.max(...w.months));
  if (w.list.length > 1) {
    const mx = Math.max(1, ...w.months);
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('Najaktywniejszy miesiąc', 'Your busiest month')}</small>
      <div class="w-name w-cap">${monthName(peak)}</div>
      <p class="w-sub">${L(`${w.months[peak]} nurkowań`, `${w.months[peak]} dives`)}</p>
      <div class="w-bars">${w.months.map((n, i) => `<i style="--h:${n / mx * 100}%" class="${i === peak ? 'peak' : ''}"></i>`).join('')}</div></div>`);
  }
  if (w.temps.length >= 2) {
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('Woda w tym roku', 'The water this year')}</small>
      <div class="w-split">
        <div><small>${L('Najzimniej', 'Coldest')}</small><b class="cold"><span data-count="${Math.min(...w.temps)}" data-dec="${Math.min(...w.temps) % 1 ? 1 : 0}">0</span>°</b></div>
        <div><small>${L('Najcieplej', 'Warmest')}</small><b class="warm"><span data-count="${Math.max(...w.temps)}" data-dec="${Math.max(...w.temps) % 1 ? 1 : 0}">0</span>°</b></div>
      </div>
      <p class="w-sub w-dim">${L(`Rozpiętość ${Math.round(Math.max(...w.temps) - Math.min(...w.temps))}°C — od lodówki do zupy.`, `A ${Math.round(Math.max(...w.temps) - Math.min(...w.temps))}°C spread — fridge to soup.`)}</p></div>`);
  }
  if (w.sac) {
    const better = w.sac.early && w.sac.late ? Math.round((1 - w.sac.late / w.sac.early) * 100) : null;
    slides.push(`<div class="w-c">
      <small class="w-kicker">${L('Twój oddech', 'Your breathing')}</small>
      <div class="w-big"><span data-count="${Math.round(w.sac.avg * 10) / 10}" data-dec="1">0</span><i>L/min SAC</i></div>
      <p class="w-sub">${better == null ? L('Średnie zużycie powietrza na powierzchni.', 'Average surface air consumption.')
        : better > 0 ? L(`W drugiej połowie roku oddychałeś o ${better}% spokojniej.`, `${better}% calmer in the second half of the year.`)
        : L('Oddech równy przez cały rok.', 'Steady breathing all year.')}</p></div>`);
  }
  if (w.badges.length) {
    slides.push(`<div class="w-c w-center">
      <small class="w-kicker">${L('Zdobyte odznaki', 'Badges earned')}</small>
      <div class="w-big w-center-big"><span data-count="${w.badges.length}">0</span></div>
      <div class="w-medals">${w.badges.slice(0, 9).map(b => `<span title="${badgeText(b).title}">${medalHTML(b)}</span>`).join('')}</div></div>`);
  }
  slides.push(`<div class="w-c w-center">
      <small class="w-kicker">${L('Rok', 'Year')} ${year} · Mr.Binio</small>
      <div class="w-grid">
        <div><b>${w.list.length}</b><small>${L('nurkowań', 'dives')}</small></div>
        <div><b>${hours}</b><small>${L('godzin', 'hours')}</small></div>
        <div><b>${w.deepest ? w.deepest.depth : '—'}</b><small>${L('m maks.', 'm max')}</small></div>
        <div><b>${w.sites.length}</b><small>${L('miejsc', 'sites')}</small></div>
      </div>
      <div class="w-actions">
        <button class="btn-solid" data-act="share">${L('Udostępnij', 'Share')}</button>
        <button class="btn-ghost" data-act="close">${L('Zamknij', 'Close')}</button>
      </div></div>`);

  // --- player ---
  const root = document.createElement('div');
  root.id = 'wrapped';
  root.innerHTML = `<canvas class="w-ocean"></canvas><div class="w-shade"></div>
    <div class="w-progress">${slides.map(() => '<i><b></b></i>').join('')}</div>
    <button class="w-close" aria-label="Close">✕</button>
    <div class="w-stage"></div>`;
  document.body.appendChild(root);
  document.body.classList.add('modal-open');
  const stage = root.querySelector('.w-stage');
  const bars = root.querySelectorAll('.w-progress b');
  const SLIDE_MS = 6500;
  let idx = 0, elapsed = 0, last = performance.now(), paused = false, done = false, depth = 0;
  const ocean = window.Ocean && Ocean.start(root.querySelector('.w-ocean'), () => depth);

  function countUp(el) {
    el.querySelectorAll('[data-count]').forEach(n => {
      const target = parseFloat(n.dataset.count), dec = +(n.dataset.dec || 0), t0 = performance.now();
      (function step(now) {
        const p = Math.max(0, Math.min(1, (now - t0) / 1100)), e = 1 - Math.pow(1 - p, 3);
        n.textContent = (target * e).toFixed(dec);
        if (p < 1 && !done) requestAnimationFrame(step);
      })(t0);
    });
  }
  function show(i) {
    idx = Math.max(0, Math.min(slides.length - 1, i));
    elapsed = 0;
    stage.innerHTML = `<div class="w-slide">${slides[idx]}</div>`;
    bars.forEach((b, k) => b.style.width = k < idx ? '100%' : '0%');
    countUp(stage);
  }
  function close() {
    if (done) return;
    done = true;
    root.classList.add('out');
    document.body.classList.remove('modal-open');
    setTimeout(() => { if (ocean) ocean.stop(); root.remove(); }, 350);
  }
  (function tick(now) {
    if (done) return;
    const dt = now - last; last = now;
    if (!paused && idx < slides.length - 1) {
      elapsed += dt;
      if (elapsed >= SLIDE_MS) show(idx + 1);
    }
    bars[idx].style.width = idx === slides.length - 1 ? '100%' : Math.min(100, elapsed / SLIDE_MS * 100) + '%';
    // sink towards this slide's depth
    const target = 0.05 + 0.75 * idx / Math.max(1, slides.length - 1);
    depth += (target - depth) * Math.min(1, dt / 900);
    requestAnimationFrame(tick);
  })(last);

  let downAt = 0;
  root.addEventListener('pointerdown', e => { downAt = performance.now(); paused = true; });
  root.addEventListener('pointerup', e => {
    paused = false;
    const act = e.target.closest('[data-act]');
    if (e.target.closest('.w-close') || (act && act.dataset.act === 'close')) return close();
    if (act && act.dataset.act === 'share') return shareWrapped(w);
    if (performance.now() - downAt > 350) return;   // it was a hold, not a tap
    if (e.clientX < innerWidth * 0.3) show(idx - 1); else show(idx + 1);
  });
  addEventListener('keydown', function key(e) {
    if (done) return removeEventListener('keydown', key);
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'Escape') close();
  });
  show(0);
}

async function shareWrapped(w) {
  const W = 1080, H = 1920, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  try { await Promise.all(['200 100px Manrope', '700 100px Manrope'].map(f => document.fonts.load(f))); } catch (e) {}
  const F = (wt, px) => `${wt} ${px}px Manrope, Inter, system-ui, sans-serif`;
  const bg = window.Ocean && Ocean.still(W, H, 0.45, 5.0);
  if (bg) { const img = new Image(); img.src = bg; await img.decode().catch(() => {}); x.drawImage(img, 0, 0, W, H); }
  else { x.fillStyle = '#06213f'; x.fillRect(0, 0, W, H); }
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(2,10,22,.1)'); g.addColorStop(1, 'rgba(2,10,22,.85)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const P = 90, L = (pl, en) => lang === 'pl' ? pl : en;
  x.fillStyle = 'rgba(226,238,255,.7)'; x.font = F(700, 30); x.letterSpacing = '10px';
  x.fillText(L('MÓJ ROK POD WODĄ', 'MY YEAR UNDERWATER'), P, 190); x.letterSpacing = '0px';
  x.fillStyle = '#fff'; x.font = F(200, 330); x.fillText(String(w.year), P - 12, 520);
  const hours = Math.round(w.minutes / 6) / 10;
  const cells = [[w.list.length, L('nurkowań', 'dives')], [hours, L('godzin', 'hours')],
    [w.deepest ? w.deepest.depth + ' m' : '—', L('najgłębiej', 'deepest')], [w.sites.length, L('miejsc', 'sites')]];
  cells.forEach((cell, i) => {
    const cx = P + (i % 2) * 460, cy = 820 + Math.floor(i / 2) * 330;
    x.fillStyle = '#fff'; x.font = F(200, 170); x.fillText(String(cell[0]), cx - 6, cy);
    x.fillStyle = 'rgba(226,238,255,.7)'; x.font = F(700, 34); x.letterSpacing = '6px';
    x.fillText(cell[1].toUpperCase(), cx, cy + 60); x.letterSpacing = '0px';
  });
  let y = 1560;
  if (w.deepest && w.deepest.site) { x.fillStyle = '#fff'; x.font = F(700, 46); x.fillText('↓ ' + w.deepest.site, P, y); y += 70; }
  if (w.buddies.length) { x.fillStyle = 'rgba(226,238,255,.8)'; x.font = F(700, 40); x.fillText('Buddy: ' + w.buddies[0][0], P, y); }
  x.fillStyle = 'rgba(226,238,255,.5)'; x.font = F(700, 28); x.textAlign = 'right';
  x.fillText('Mr.Binio Dive Logbook', W - P, 1840);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], `dive-year-${w.year}.png`, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
