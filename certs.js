// Certification cards drawn like a real dive card: guilloche print, portrait, engraved
// fields, a holographic seal and the depth rating. Opening the tab assembles the visible
// cards from a swarm of light particles; a laser then engraves the text and the seal
// stamps on. Tap a card to hold it full screen: drag (or tilt the phone) to turn it.

const AGENCY_LOGOS = {
  PADI: { color: '#1a4b8c', name: 'Professional Association of Diving Instructors' },
  SSI: { color: '#0072bc', name: 'Scuba Schools International' },
  CMAS: { color: '#003d7a', name: 'Confédération Mondiale des Activités Subaquatiques' },
  NAUI: { color: '#1b3a6b', name: 'National Association of Underwater Instructors' },
  SDI: { color: '#b0142b', name: 'Scuba Diving International' },
  TDI: { color: '#b0142b', name: 'Technical Diving International' },
  BSAC: { color: '#003087', name: 'British Sub-Aqua Club' },
  IANTD: { color: '#7a0d0d', name: 'International Association of Nitrox and Technical Divers' },
  GUE: { color: '#2e4057', name: 'Global Underwater Explorers' },
  PSAI: { color: '#0b2a4a', name: 'Professional Scuba Association International' }
};

let certAnimAll = false;           // set when the tab opens
const certSeen = new Set();        // a card added later assembles on its own
const CL = (pl, en) => lang === 'pl' ? pl : en;

// Same id → same pattern every time
function ccRand(str) {
  let a = 7;
  for (const ch of String(str)) a = Math.imul(a ^ ch.charCodeAt(0), 2654435761);
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Security print: rosettes plus depth contour lines, in card units (856 × 540)
function certGuilloche(id) {
  const r = ccRand(id);
  let rose = '', waves = '';
  [[600 + r() * 150, 120 + r() * 150, 170], [90 + r() * 120, 470 - r() * 60, 120]].forEach(([cx, cy, size]) => {
    const n = 11 + Math.floor(r() * 9);
    for (let ring = 0; ring < 3; ring++) {
      const A = size * (1 - ring * .16), B = A * (.22 + r() * .1);
      let d = '';
      for (let i = 0; i <= 360; i++) {
        const t = i / 360 * Math.PI * 2;
        d += (i ? 'L' : 'M') + (cx + A * Math.cos(t) + B * Math.cos(n * t)).toFixed(1) + ' ' + (cy + A * Math.sin(t) - B * Math.sin(n * t)).toFixed(1);
      }
      rose += `<path pathLength="1" d="${d}Z"/>`;
    }
  });
  const p1 = r() * 6, p2 = r() * 6;
  for (let k = 0; k < 15; k++) {
    let d = '';
    const y0 = 30 + k * 36;
    for (let x = 0; x <= 856; x += 16)
      d += (x ? 'L' : 'M') + x + ' ' + (y0 + Math.sin(x / 95 + p1 + k * .35) * 12 + Math.sin(x / 38 + p2 - k * .2) * 4).toFixed(1);
    waves += `<path pathLength="1" d="${d}"/>`;
  }
  return `<svg class="cc-guil" viewBox="0 0 856 540" preserveAspectRatio="none" aria-hidden="true">
    <g class="cc-waves">${waves}</g><g class="cc-rose">${rose}</g></svg>`;
}

function certRating(name) {
  const n = String(name || '').toLowerCase();
  if (/nitrox|\bean|enriched/.test(n)) return { v: 'EANx', l: 'O₂ ≤ 40%' };
  // no depth limit printed on these cards
  if (/trimix|\btec|technical|cave|jaskin|sidemount|advance|\baow\b|zaawans|\*\*/.test(n)) return null;
  if (/deep|głębok|divemaster|instructor|instruktor/.test(n)) return { v: 40, l: 'MAX' };
  if (/open water|\bow\b|\bp1\b|\*/.test(n)) return { v: 18, l: 'MAX' };
  return null;
}

// Own photo for every card, kept in users/{uid}/profile/portrait (and cached on the phone)
let certPortrait;                  // undefined until loaded, then a data URL or null

function certPortraitHTML() {
  const src = certPortrait || (auth.currentUser && auth.currentUser.photoURL);
  return src ? `<img src="${esc(src)}" alt="" referrerpolicy="no-referrer">` : '<img src="diver.svg" alt="" class="cc-noface">';
}
const certPortraitDoc = uid => db.collection('users').doc(uid).collection('profile').doc('portrait');
function certPortraitCache(uid) {
  try { certPortrait ? localStorage.setItem('ccPortrait:' + uid, certPortrait) : localStorage.removeItem('ccPortrait:' + uid); } catch (e) {}
}
function certPortraitPaint() {
  document.querySelectorAll('.cc-portrait').forEach(p => { p.innerHTML = certPortraitHTML(); p.classList.toggle('cc-add', !certPortrait); });
  document.querySelectorAll('.cc-photo-btn b').forEach(b => b.textContent = certPortrait ? CL('Zmień zdjęcie', 'Change photo') : CL('Moje zdjęcie', 'My photo'));
}
function certLoadPortrait() {
  const uid = auth.currentUser && auth.currentUser.uid;
  if (!uid || certPortrait !== undefined) return;
  try { certPortrait = localStorage.getItem('ccPortrait:' + uid) || null; } catch (e) { certPortrait = null; }
  certPortraitDoc(uid).get().then(d => {
    const img = (d.exists && d.data().img) || null;
    if (img === certPortrait) return;
    certPortrait = img;
    certPortraitCache(uid);
    certPortraitPaint();
  }).catch(() => {});
}
// Tapping the portrait on a card in the list picks the photo straight away
function certPickPortrait(e) {
  e.stopPropagation();
  let i = document.getElementById('cc-pick');
  if (!i) {
    i = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', id: 'cc-pick', hidden: true });
    i.onchange = () => certSetPortrait(i);
    document.body.appendChild(i);
  }
  i.click();
}
async function certSetPortrait(input) {
  const f = input.files && input.files[0];
  input.value = '';
  if (!f) return;
  const uid = myUid();
  try {
    certPortrait = await compressImage(f, 480, .82);
    certPortraitCache(uid);
    certPortraitPaint();
    await certPortraitDoc(uid).set({ img: certPortrait, at: firebase.firestore.FieldValue.serverTimestamp() });
    showToast(CL('✅ Zdjęcie zapisane na wszystkich kartach', '✅ Photo saved on all cards'));
  } catch (e) { showToast('❌ ' + e.message); }
}

const ccDate = d => d ? d.split('-').reverse().join('.') : '—';

// One card. anim: build it for the assembly; i: its place in the sequence.
function certCardHTML(c, anim, i, thick) {
  const ag = AGENCY_LOGOS[c.agency] || { color: '#1e3550', name: CL('Certyfikat nurkowy', 'Dive certification') };
  const mark = esc(c.agency && c.agency !== 'Other' ? c.agency : 'DIVE');
  const rating = certRating(c.name);
  const hasPhoto = c.photoUrl && c.photoUrl.length > 10;
  let e = 0;
  const eng = (txt, cls = '') => `<span class="cc-eng ${cls}" style="--e:${e++}"><span>${txt}</span></span>`;
  const micro = esc((mark + ' · ' + ag.name + ' · ').toUpperCase()).repeat(4);
  const t0 = i * 380 + 1150;
  const slices = thick ? [-3, -2, -1, 0, 1, 2, 3].map(z => `<i class="cc-slice" style="--z:${z}"></i>`).join('') : '';
  return `
  <div class="cc-card" style="--ag:${ag.color};--t0:${t0}ms">
    ${slices}
    <div class="cc-face cc-front">
      ${certGuilloche(c.id)}
      <div class="cc-lines"></div>
      <div class="cc-top">
        <div class="cc-mark">${mark}</div>
        <div class="cc-kind">${CL('CERTYFIKAT NURKOWY', 'DIVER CERTIFICATION')}<small>${esc(ag.name)}</small></div>
      </div>
      <div class="cc-seal">
        <svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="cc-arc-${c.id}" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"/></defs>
          <text><textPath href="#cc-arc-${c.id}" textLength="236" lengthAdjust="spacing">${esc(mark + ' ✦ CERTIFIED DIVER ✦ ' + ccDate(c.date) + ' ✦')}</textPath></text></svg>
        <b>${mark.slice(0, 4)}</b><i class="cc-ring"></i>
      </div>
      <div class="cc-body">
        <div class="cc-portrait${certPortrait ? '' : ' cc-add'}"${thick ? '' : ' onclick="certPickPortrait(event)"'}>${certPortraitHTML()}</div>
        <div class="cc-fields">
          <div class="cc-level">${eng(esc(c.name))}</div>
          <dl>
            <div class="cc-wide"><dt>${CL('Nurek', 'Diver')}</dt><dd>${eng(esc(myName()))}</dd></div>
            <div><dt>${CL('Nr', 'No.')}</dt><dd>${eng(esc(c.number || '—'))}</dd></div>
            <div><dt>${CL('Data', 'Date')}</dt><dd>${eng(ccDate(c.date))}</dd></div>
            ${c.instructor ? `<div class="cc-wide"><dt>${CL('Instruktor', 'Instructor')}</dt><dd>${eng(esc(c.instructor))}</dd></div>` : ''}
          </dl>
        </div>
      </div>
      ${rating ? `<div class="cc-depth"><small>${rating.l}</small><span${anim && typeof rating.v === 'number' ? ` data-count="${rating.v}">0` : `>${rating.v}`}</span>${typeof rating.v === 'number' ? '<em>m</em>' : ''}</div>` : ''}
      <div class="cc-micro">${micro}</div>
      <div class="cc-holo"></div><div class="cc-glare"></div>
    </div>
    <div class="cc-face cc-back">
      ${hasPhoto ? `<img class="cc-scan" src="${c.photoUrl}" alt="">` : `
        <div class="cc-stripe"></div>
        <div class="cc-sign"><span>${esc(myName())}</span></div>
        <p class="cc-legal">${CL(`Posiadacz ukończył kurs <b>${esc(c.name)}</b> zgodnie ze standardami ${esc(ag.name)}.`, `The holder has completed <b>${esc(c.name)}</b> to the standards of ${esc(ag.name)}.`)}</p>
        <div class="cc-backmark">${mark}</div>`}
    </div>
  </div>`;
}

function renderCerts() {
  const list = document.getElementById('certs-list');
  if (!certs.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-dim);padding:20px;font-size:0.78rem;">${CL('Brak certyfikatów. Dodaj swój pierwszy!', 'No certifications yet. Add your first!')}</div>`;
    return;
  }
  certLoadPortrait();
  const first = !certSeen.size;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let n = 0;
  list.innerHTML = certs.map(c => {
    const anim = !reduce && (certAnimAll || (!first && !certSeen.has(c.id)));
    return `<div class="cert-card-wrap${anim ? ' cc-anim' : ''}" data-id="${esc(c.id)}" onclick="openCert(this.dataset.id, this)">${certCardHTML(c, anim, anim ? n++ : 0)}</div>`;
  }).join('');
  certAnimAll = false;
  certs.forEach(c => certSeen.add(c.id));
  if (!list.dataset.tilt) certTilt(list);
  if (n) requestAnimationFrame(() => certAssemble([...list.querySelectorAll('.cc-anim')]));
}

// ---- The assembly: particles rise like bubbles, swirl round the card and lock into its shape

function certAssemble(wraps) {
  const vis = [];
  wraps.forEach(w => {
    const r = w.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight && r.width) vis.push(w);
    else { w.classList.remove('cc-anim'); certCount(w, 0); }
  });
  vis.forEach(w => certCount(w, parseFloat(w.querySelector('.cc-card').style.getPropertyValue('--t0')) + 950));
  if (!vis.length) return;

  const cv = document.createElement('canvas');
  cv.className = 'cc-canvas';
  const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);

  const P = [];
  let end = 0;
  vis.forEach((w, i) => {
    const r = w.getBoundingClientRect(), rnd = Math.random;
    const delay = i * 380, reveal = delay + 1150;
    end = Math.max(end, reveal + 600);
    const ag = w.querySelector('.cc-card').style.getPropertyValue('--ag');
    const tint = ['#9bdcff', '#c8f3ff', '#ffffff', ag, '#7ef0dc'];
    const n = Math.round(Math.min(1300, r.width * r.height / 45));
    const ccx = r.left + r.width / 2, ccy = r.top + r.height / 2, rad = r.width * .04;
    for (let k = 0; k < n; k++) {
      let tx, ty;
      if (k < n * .3) {                       // the outline, rounded corners included
        const per = rnd() * 2 * (r.width + r.height);
        if (per < r.width) { tx = r.left + per; ty = r.top; }
        else if (per < r.width + r.height) { tx = r.right; ty = r.top + per - r.width; }
        else if (per < 2 * r.width + r.height) { tx = r.right - (per - r.width - r.height); ty = r.bottom; }
        else { tx = r.left; ty = r.bottom - (per - 2 * r.width - r.height); }
        tx = Math.min(r.right - rad * .3, Math.max(r.left + rad * .3, tx));
        ty = Math.min(r.bottom - rad * .3, Math.max(r.top + rad * .3, ty));
      } else { tx = r.left + rnd() * r.width; ty = r.top + rnd() * r.height; }
      // bubbles rise from a column under the card, then spiral in like a shoal and lock on
      const th = rnd() * Math.PI * 2, rs = r.width * (.45 + rnd() * .5);
      P.push({
        sx: ccx + (rnd() - .5) * r.width * .5, sy: Math.max(H, r.bottom) + 20 + rnd() * r.height * 1.5,
        th, rs, spin: (1.4 + rnd() * .8) * Math.PI, cx: ccx, cy: ccy,
        tx, ty, ox: tx - ccx, oy: ty - ccy,
        t0: delay + rnd() * 300, dur: 800 + rnd() * 300, rev: reveal,
        c: tint[k % 5 === 3 ? 3 : Math.floor(rnd() * 5)], s: .9 + rnd() * 1.5, tw: rnd() * 6.3
      });
    }
  });

  const start = performance.now();
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  (function frame(now) {
    const t = now - start;
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (const p of P) {
      const u = (t - p.t0) / p.dur;
      if (u <= 0) continue;
      let x, y, al, s = p.s;
      if (u < 1) {
        const e = ease(u), m = 1 - e, ph = p.th + m * p.spin;
        // a flat whirl (squashed in y) that tightens onto the particle's place on the card
        const lx = p.ox * e + Math.cos(ph) * p.rs * m, ly = p.oy * e + Math.sin(ph) * p.rs * m * .45;
        const k = Math.min(1, u / .35), kk = k * k * (3 - 2 * k);
        x = p.sx + (p.cx + lx - p.sx) * kk;
        y = p.sy + (p.cy + ly - p.sy) * kk;
        al = Math.min(1, u * 3) * .85;
        s *= 1 + (1 - u) * 1.2;
      } else if (t < p.rev) {
        x = p.tx; y = p.ty;
        al = .6 + .4 * Math.sin(t / 70 + p.tw);
      } else {
        const v = (t - p.rev) / 550;
        if (v >= 1) continue;
        x = p.tx + p.ox * .12 * v; y = p.ty + p.oy * .12 * v - v * 10;
        al = (1 - v) * (v < .15 ? 1.6 : 1);
      }
      g.globalAlpha = Math.min(1, al);
      g.fillStyle = p.c;
      g.fillRect(x - s / 2, y - s / 2, s, s);
    }
    if (t < end) requestAnimationFrame(frame); else cv.remove();
  })(start);
}

// The depth rating counts up once the card is there
function certCount(w, at) {
  const el = w.querySelector('[data-count]');
  if (!el) return;
  const to = +el.dataset.count;
  delete el.dataset.count;
  if (!at) { el.textContent = to; return; }
  setTimeout(() => {
    const s = performance.now();
    (function step(now) {
      const u = Math.min(1, (now - s) / 800);
      el.textContent = Math.round(to * (1 - Math.pow(1 - u, 3)));
      if (u < 1) requestAnimationFrame(step);
    })(s);
  }, at);
}

// ---- Light follows the finger / mouse

function certLight(el, x, y) {          // x, y: 0..1 across the card
  el.style.setProperty('--px', (x * 100).toFixed(1) + '%');
  el.style.setProperty('--py', (y * 100).toFixed(1) + '%');
  el.style.setProperty('--ha', Math.round(x * 220 + y * 140) + 'deg');
}

function certTilt(list) {
  list.dataset.tilt = '1';
  const off = w => { w.classList.remove('cc-tilt'); w.style.removeProperty('--tx'); w.style.removeProperty('--ty'); };
  list.addEventListener('pointermove', e => {
    const w = e.target.closest('.cert-card-wrap');
    list.querySelectorAll('.cc-tilt').forEach(o => o !== w && off(o));
    if (!w) return;
    const r = w.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    w.classList.add('cc-tilt');
    w.style.setProperty('--tx', ((x - .5) * 16).toFixed(1) + 'deg');
    w.style.setProperty('--ty', ((.5 - y) * 14).toFixed(1) + 'deg');
    certLight(w, x, y);
  });
  const leave = () => list.querySelectorAll('.cc-tilt').forEach(off);
  list.addEventListener('pointerleave', leave);
  list.addEventListener('pointercancel', leave);
}

// ---- Full screen: the card flies up from the list, turn it with a finger or by tilting

function openCert(id, from) {
  const c = certs.find(x => x.id === id);
  if (!c || document.querySelector('.cc-view')) return;
  const ov = document.createElement('div');
  ov.className = 'cc-view';
  ov.innerHTML = `
    <div class="cc-stage"><div class="cc-3d">${certCardHTML(c, false, 0, true)}</div></div>
    <div class="cc-hint">${CL('Przeciągnij, żeby obrócić', 'Drag to turn')}</div>
    <div class="cc-vbar">
      <label class="cc-photo-btn">📷 <b>${certPortrait ? CL('Zmień zdjęcie', 'Change photo') : CL('Moje zdjęcie', 'My photo')}</b><input type="file" accept="image/*" hidden onchange="certSetPortrait(this)"></label>
      <button data-a="flip">↻ ${CL('Obróć', 'Turn')}</button>
      <button data-a="del" class="cc-del">${CL('Usuń', 'Delete')}</button>
      <button data-a="close">✕</button>
    </div>`;
  document.body.appendChild(ov);
  const stage = ov.querySelector('.cc-stage'), box = ov.querySelector('.cc-3d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ry = 0, rx = 0, vy = 0, gx = 0, gy = 0, drag = null, raf = 0, alive = true;

  const fly = (dir) => {
    if (!from || reduce) return Promise.resolve();
    const a = from.getBoundingClientRect(), b = stage.getBoundingClientRect();
    const k = a.width / b.width;
    const tf = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${k})`;
    const frames = [{ transform: tf }, { transform: 'none' }];
    return stage.animate(dir > 0 ? frames : frames.reverse(), { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished;
  };
  if (from) from.style.visibility = 'hidden';
  requestAnimationFrame(() => ov.classList.add('on'));
  fly(1);

  const paint = () => {
    box.style.transform = `rotateX(${rx + gy}deg) rotateY(${ry + gx}deg)`;
    const a = (ry + gx) * Math.PI / 180;
    certLight(box, .5 + Math.sin(a) * .55, .5 - (rx + gy) / 60);
  };
  const settle = () => {                   // glide on, then rest on the nearest side
    cancelAnimationFrame(raf);
    const step = () => {
      if (!alive || drag) return;
      ry += vy; vy *= .93;
      if (Math.abs(vy) < .4) {
        const target = Math.round(ry / 180) * 180;
        ry += (target - ry) * .12; rx *= .85;
        if (Math.abs(target - ry) < .05 && Math.abs(rx) < .05) { ry = target; rx = 0; paint(); return; }
      }
      paint();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  stage.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, t: performance.now() };
    vy = 0; stage.setPointerCapture(e.pointerId);
    ov.querySelector('.cc-hint').classList.add('gone');
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.x;
    ry += dx * .45;
    rx = Math.max(-35, Math.min(35, rx - (e.clientY - drag.y) * .3));
    vy = dx * .45 * 16 / Math.max(8, now - drag.t);
    drag = { x: e.clientX, y: e.clientY, t: now };
    paint();
  });
  const up = () => { if (drag) { drag = null; settle(); } };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  const tilt = e => {
    if (e.gamma == null) return;
    gx = Math.max(-18, Math.min(18, e.gamma * .6));
    gy = Math.max(-14, Math.min(14, (e.beta - 45) * -.4));
    if (!drag) paint();
  };
  // iPhone asks once for motion access; the tap that opened the card counts as the gesture
  const DOE = window.DeviceOrientationEvent;
  if (!reduce && DOE) {
    if (typeof DOE.requestPermission === 'function')
      DOE.requestPermission().then(s => s === 'granted' && alive && addEventListener('deviceorientation', tilt)).catch(() => {});
    else addEventListener('deviceorientation', tilt);
  }

  const close = async () => {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    removeEventListener('deviceorientation', tilt);
    removeEventListener('keydown', key);
    box.style.transition = 'transform .3s ease';
    box.style.transform = '';
    ov.classList.remove('on');
    await fly(-1).catch(() => {});
    if (from) from.style.visibility = '';
    ov.remove();
  };
  const key = e => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', key);
  ov.addEventListener('click', e => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === 'close' || e.target === ov) close();
    if (a === 'flip') { vy = 0; ry = Math.round(ry / 180) * 180 + 180; box.style.transition = 'transform .7s cubic-bezier(.3,1.3,.5,1)'; paint(); setTimeout(() => box.style.transition = '', 720); }
    if (a === 'del') { close().then(() => deleteCert(id)); }
  });
  paint();
}
