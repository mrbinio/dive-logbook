// Flights: the itinerary as boarding passes that assemble themselves, with a route map,
// baggage per leg and a lounge verdict for each wait.
// This code is public, so it holds no itinerary. The data lives in users/{uid}/profile/flights and
// reaches the account through a #flights=<base64url> link (a fragment is never sent to the server)
// or a JSON file. Shape: { title, ap: {CODE: {name, lat, lon, lx, ly}}, todo: [{st, t, d}], notes: [],
// items: [{k:'s', t} | {k:'f', no, air, plane, from, to, dep, arr, tFrom, tTo, cls, seat, meal, pnr, etkt, bag: {st, big, t}}
//         | {k:'w', at, st, t, lines: []}
//         | {k:'h', name, addr, addrLocal, in, out, ref, tel, lines: [], routes: [{t, maps, steps: [{ic, t, d}]}]}] }, with dep/arr as ISO strings including the UTC offset.
let flData = null, flOn = false, flIO = null, flTimer = null, flRun = 0;
const flDoc = uid => db.collection('users').doc(uid).collection('profile').doc('flights');
const flCacheKey = uid => 'ccFlights:' + uid;
const FL_AIR = { QR: '#8a1538', PR: '#1c4fa8', CX: '#006564' };
const flCalm = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function flValid(d) {
  return !!d && Array.isArray(d.items) && d.items.some(i => i && i.k === 'f')
    && d.items.every(i => i && (i.k !== 'f' || (!isNaN(Date.parse(i.dep)) && !isNaN(Date.parse(i.arr)))));
}
const flFlights = () => flData ? flData.items.filter(i => i.k === 'f') : [];

// --- getting the data onto the account ---
function flDecode(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
}
async function flSave(d) {
  const uid = auth.currentUser && auth.currentUser.uid;
  if (!uid) return false;
  const n = d.items.filter(i => i.k === 'f').length;
  if (!confirm(TL(`Wczytać ${n} lotów na Twoje konto?`, `Load ${n} flights to your account?`))) return false;
  flData = d;
  const json = JSON.stringify(d);
  try { localStorage.setItem(flCacheKey(uid), json); } catch (e) {}
  await flDoc(uid).set({ json, at: firebase.firestore.FieldValue.serverTimestamp() });
  showToast(TL('✈️ Loty zapisane', '✈️ Flights saved'));
  return true;
}
function flFile(input) {
  const f = input.files && input.files[0];
  input.value = '';
  if (!f) return;
  f.text().then(async txt => {
    const d = JSON.parse(txt);
    if (!flValid(d)) throw new Error('format');
    if (await flSave(d)) flightsRender();
  }).catch(() => showToast(TL('❌ Nie rozumiem tego pliku', '❌ Could not read that file')));
}
async function flDelete() {
  const uid = auth.currentUser && auth.currentUser.uid;
  if (!uid || !confirm(TL('Usunąć loty z konta?', 'Remove the flights from your account?'))) return;
  flData = null;
  try { localStorage.removeItem(flCacheKey(uid)); } catch (e) {}
  await flDoc(uid).delete();
  flightsRender();
}
function flCopy(btn) {
  const text = btn.dataset.c;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast(TL(`Skopiowano ${text}`, `Copied ${text}`))).catch(() => {});
}

function flLoad(user) {
  try { const c = localStorage.getItem(flCacheKey(user.uid)); if (c) flData = JSON.parse(c); } catch (e) {}
  if (flOn) flightsRender();
  flDoc(user.uid).get().then(snap => {
    const json = snap.exists ? snap.data().json : null;
    const same = json && flData && json === JSON.stringify(flData);
    if (!json || same) return;
    flData = JSON.parse(json);
    try { localStorage.setItem(flCacheKey(user.uid), json); } catch (e) {}
    if (flOn) flightsRender();
  }).catch(() => {});
}

// --- formatting; times are shown as written on the ticket, in local time ---
function flDay(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const opts = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' };
  return dt.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', opts);
}
const flClock = iso => iso.slice(11, 16);
function flSpan(ms) {
  const m = Math.round(ms / 60000), h = Math.floor(m / 60);
  if (h >= 48) { const d = Math.round(h / 24); return `${d} ${TL('dni', 'days')}`; }
  return (h ? `${h} h ` : '') + (m % 60 || !h ? `${m % 60} min` : '').trim();
}
function flUntil(ms) {
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60);
  if (d) return `${d} ${TL(d === 1 ? 'dzień' : 'dni', d === 1 ? 'day' : 'days')} ${h} h`;
  return h ? `${h} h ${m % 60} min` : `${m % 60} min`;
}
const flApName = c => (flData.ap && flData.ap[c] && flData.ap[c].name) || c;

// --- the route map ---
function flMapHTML() {
  const fl = flFlights(), ap = flData.ap || {};
  const pts = fl.flatMap(f => [ap[f.from], ap[f.to]]).filter(Boolean);
  if (!pts.length || !fl.every(f => ap[f.from] && ap[f.to])) return '';
  const w = 640, h = 300, pad = 46;
  const lons = pts.map(p => p.lon), lats = pts.map(p => p.lat);
  const x0 = Math.min(...lons), x1 = Math.max(...lons), y0 = Math.min(...lats), y1 = Math.max(...lats);
  const X = lon => pad + (lon - x0) / (x1 - x0 || 1) * (w - 2 * pad);
  const Y = lat => h - pad - (lat - y0) / (y1 - y0 || 1) * (h - 2 * pad);
  const grid = [];
  for (let lon = Math.ceil(x0 / 20) * 20; lon <= x1; lon += 20) grid.push(`<line x1="${X(lon)}" x2="${X(lon)}" y1="0" y2="${h}"/>`);
  for (let lat = Math.ceil(y0 / 10) * 10; lat <= y1; lat += 10) grid.push(`<line y1="${Y(lat)}" y2="${Y(lat)}" x1="0" x2="${w}"/>`);
  // Outbound bows one way, the way home the other, so the two never lie on top of each other
  const firstBack = flData.items.findIndex(i => i.k === 's' && i.back);
  let seenBack = false;
  const arcs = [];
  flData.items.forEach((it, idx) => {
    if (firstBack >= 0 && idx >= firstBack) seenBack = true;
    if (it.k !== 'f') return;
    const a = ap[it.from], b = ap[it.to], ax = X(a.lon), ay = Y(a.lat), bx = X(b.lon), by = Y(b.lat);
    const dx = bx - ax, dy = by - ay, side = seenBack ? -1 : 1;
    const cx = (ax + bx) / 2 - dy * .2 * side, cy = (ay + by) / 2 + dx * .2 * side;
    arcs.push({ d: `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`, back: seenBack });
  });
  const step = 0.62;
  const paths = arcs.map((a, i) => `<path class="fl-arc${a.back ? ' back' : ''}" d="${a.d}" pathLength="1" style="--d:${(.3 + i * step).toFixed(2)}s"/>`).join('');
  const codes = [...new Set(fl.flatMap(f => [f.from, f.to]))];
  const dots = codes.map((c, i) => {
    const p = ap[c], x = X(p.lon), y = Y(p.lat);
    return `<g class="fl-city" style="--d:${(.1 + i * .22).toFixed(2)}s"><circle class="fl-pulse" cx="${x}" cy="${y}" r="4"/><circle cx="${x}" cy="${y}" r="3.4"/>
      <text x="${x + (+p.lx || 8)}" y="${y + (+p.ly || 4)}" text-anchor="${(+p.lx || 8) < 0 ? 'end' : 'start'}">${esc(c)}</text></g>`;
  }).join('');
  return `<svg class="fl-map" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(TL('Mapa trasy', 'Route map'))}">
    <g class="fl-grid">${grid.join('')}</g>${paths}${dots}
    <g id="fl-jet" class="fl-jet" style="opacity:0"><path d="M11 0 L-5 -7 L-2 0 L-5 7 Z"/></g></svg>`;
}
function flFlyJet(run) {
  const jet = document.getElementById('fl-jet');
  const arcs = [...document.querySelectorAll('#flights-view .fl-arc')];
  if (!jet || !arcs.length || flCalm()) return;
  const step = 620, t0 = performance.now() + 300;
  const frame = now => {
    if (run !== flRun || !jet.isConnected) return;
    const t = (now - t0) / step, i = Math.floor(t);
    if (i >= arcs.length) { jet.style.opacity = 0; return; }
    if (t >= 0) {
      const a = arcs[i], len = a.getTotalLength(), k = t - i, e = k * k * (3 - 2 * k);
      const p = a.getPointAtLength(e * len), q = a.getPointAtLength(Math.min(len, e * len + 1));
      jet.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI})`);
      jet.style.opacity = 1;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// --- cards ---
function flCardHTML(f) {
  const prefix = (String(f.no).match(/^[A-Z0-9]{2}/) || [''])[0];
  const air = FL_AIR[prefix] || '#3f6f9f';
  const bag = f.bag || {}, cls = bag.st === 'buy' ? 'buy' : bag.st === 'warn' ? 'warn' : 'ok';
  const past = Date.parse(f.arr) < Date.now();
  const dur = flSpan(Date.parse(f.arr) - Date.parse(f.dep));
  const meta = [
    [TL('Miejsce', 'Seat'), f.seat || TL('nie wybrane', 'not chosen'), !f.seat],
    [TL('Klasa', 'Class'), f.cls],
    [TL('Posiłek', 'Meal'), f.meal],
  ].filter(m => m[1]).map(([k, v, warn], i) => `<div class="fl-m${warn ? ' warn' : ''}" style="--i:${i}"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('');
  const ref = f.pnr ? `<button class="fl-m fl-ref" style="--i:3" data-c="${esc(f.pnr)}" onclick="flCopy(this)"><small>${TL('Rezerwacja', 'Booking')}</small><b>${esc(f.pnr)}</b></button>` : '';
  const pt = (side, code, iso, term) => `<div class="fl-pt fl-${side}">
      <div class="fl-code" data-code="${esc(code)}">${esc(code)}</div>
      <div class="fl-time">${esc(flClock(iso))}</div>
      <small>${esc(flApName(code))}${term ? ` · ${esc(term)}` : ''}</small>
      <small class="fl-date">${esc(flDay(iso))}</small></div>`;
  return `<article class="fl-card${past ? ' past' : ''}" data-dep="${esc(f.dep)}" style="--air:${air}">
    <div class="fl-sheen"></div>
    <header class="fl-h"><b>${esc(f.no)}</b><span>${esc([f.air, f.plane].filter(Boolean).join(' · '))}</span></header>
    <div class="fl-route">${pt('a', f.from, f.dep, f.tFrom)}
      <div class="fl-line"><span class="fl-track"><i>✈</i></span><small>${esc(dur)}</small></div>
      ${pt('b', f.to, f.arr, f.tTo)}</div>
    <div class="fl-meta">${meta}${ref}</div>
    ${f.etkt ? `<div class="fl-etkt">${TL('E-bilet', 'E-ticket')} ${esc(f.etkt)}</div>` : ''}
    <div class="fl-stub ${cls}">
      <div class="fl-stamp">${esc(bag.big || '?')}</div>
      <div class="fl-bag"><small>${TL('Bagaż rejestrowany', 'Checked baggage')}</small>${esc(bag.t || '')}</div>
    </div>
  </article>`;
}
const FL_ICON = { yes: '✅', maybe: '🤔', no: '➖', risk: '⚠️', night: '🌙', stay: '🏝️' };
function flWaitHTML(w, prev, next) {
  const dur = prev && next ? flSpan(Date.parse(next.dep) - Date.parse(prev.arr)) : '';
  const lines = (w.lines || []).map(l => `<li>${esc(l)}</li>`).join('');
  return `<div class="fl-wait ${esc(w.st || '')}">
    <div class="fl-wait-time">${dur ? `<b>${esc(dur)}</b>` : ''}<span>${esc(w.at ? flApName(w.at) : '')}</span></div>
    <div class="fl-wait-box"><div class="fl-wait-t">${FL_ICON[w.st] || ''} ${esc(w.t || '')}</div>${lines ? `<ul>${lines}</ul>` : ''}</div>
  </div>`;
}

// A place to stay: address, times and the way there, step by step
function flHotelHTML(h, prev, next) {
  const dur = prev && next ? flSpan(Date.parse(next.dep) - Date.parse(prev.arr)) : '';
  const web = u => /^https:\/\//.test(u || '') ? esc(u) : '';
  const copy = (txt, label) => txt ? `<button class="fl-h-copy" data-c="${esc(txt)}" onclick="flCopy(this)"><small>${esc(label)}</small><b>${esc(txt)}</b></button>` : '';
  const tel = String(h.tel || '').replace(/[^\d+]/g, '');
  const routes = (h.routes || []).map(r => `<div class="fl-rt"><div class="fl-rt-t">${esc(r.t)}</div>
    <ol>${(r.steps || []).map((st, i) => `<li style="--i:${i}"><span class="fl-rt-ic">${esc(st.ic || '•')}</span><div><b>${esc(st.t)}</b>${st.d ? `<small>${esc(st.d)}</small>` : ''}</div></li>`).join('')}</ol>
    ${web(r.maps) ? `<a class="fl-rt-map" href="${web(r.maps)}" target="_blank" rel="noopener">🗺️ ${TL('Otwórz trasę w mapach', 'Open route in maps')}</a>` : ''}</div>`).join('');
  const lines = (h.lines || []).map(l => `<li>${esc(l)}</li>`).join('');
  return `<article class="fl-hotel">
    <div class="fl-hotel-top"><div><small>${TL('Nocleg', 'Stay')}${dur ? ` · ${esc(dur)}` : ''}</small><h4>${esc(h.name)}</h4></div><span class="fl-hotel-ic">🏨</span></div>
    <div class="fl-hotel-times">${h.in ? `<div><small>${TL('Zameldowanie', 'Check-in')}</small><b>${esc(h.in)}</b></div>` : ''}${h.out ? `<div><small>${TL('Wymeldowanie', 'Check-out')}</small><b>${esc(h.out)}</b></div>` : ''}</div>
    ${copy(h.addr, TL('Adres (dotknij, aby skopiować)', 'Address (tap to copy)'))}
    ${copy(h.addrLocal, TL('Adres dla taksówkarza', 'Address for the driver'))}
    ${copy(h.ref, TL('Numer rezerwacji', 'Booking number'))}
    ${tel ? `<a class="fl-h-tel" href="tel:${esc(tel)}">📞 ${esc(h.tel)}</a>` : ''}
    ${routes}
    ${lines ? `<ul class="fl-hotel-notes">${lines}</ul>` : ''}
  </article>`;
}

// Split-flap: each letter of an airport code rattles through the alphabet and lands on the real one
function flFlap(el, delay) {
  const code = el.dataset.code || '';
  if (flCalm()) return;
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  el.innerHTML = [...code].map(() => '<span class="fl-ch"> </span>').join('');
  [...el.children].forEach((s, i) => {
    let n = 7 + i * 4;
    setTimeout(() => {
      const tick = setInterval(() => {
        if (!s.isConnected) { clearInterval(tick); return; }
        s.textContent = n-- > 0 ? A[Math.floor(Math.random() * 26)] : code[i];
        s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
        if (n < 0) clearInterval(tick);
      }, 52);
    }, delay);
  });
}
function flReveal(card) {
  if (card.classList.contains('in')) return;
  card.classList.add('in');
  card.querySelectorAll('.fl-code').forEach((c, i) => flFlap(c, 180 + i * 200));
}

function flHeroLine() {
  const el = document.getElementById('fl-count');
  if (!el) return;
  const next = flFlights().find(f => Date.parse(f.dep) > Date.now());
  el.innerHTML = next
    ? `<small>${TL('Następny lot', 'Next flight')}: ${esc(next.no)} ${esc(next.from)} → ${esc(next.to)}</small><b>${TL('za', 'in')} ${esc(flUntil(Date.parse(next.dep) - Date.now()))}</b>`
    : `<small>${TL('Podróż zakończona', 'Trip finished')}</small>`;
  document.querySelectorAll('#flights-view .fl-card.next').forEach(c => c.classList.remove('next'));
  if (next) { const c = document.querySelector(`#flights-view .fl-card[data-dep="${next.dep}"]`); if (c) c.classList.add('next'); }
}

function flightsRender() {
  const root = document.getElementById('flights-view');
  if (!root) return;
  const run = ++flRun;
  if (flIO) { flIO.disconnect(); flIO = null; }
  clearInterval(flTimer);
  if (!flData) {
    root.innerHTML = `<div class="card fl-empty"><div class="fl-empty-ic">✈️</div>
      <p>${TL('Nie masz jeszcze zapisanych lotów.', 'No flights saved yet.')}</p>
      <label class="btn-ghost cl-wide">${TL('Wczytaj plik z lotami', 'Load flights file')}<input type="file" accept="application/json,.json" onchange="flFile(this)" hidden></label></div>`;
    return;
  }
  const items = flData.items, fl = flFlights();
  const air = fl.reduce((s, f) => s + Date.parse(f.arr) - Date.parse(f.dep), 0);
  const body = items.map((it, i) => {
    if (it.k === 's') return `<h3 class="fl-sec">${esc(it.t)}</h3>`;
    if (it.k === 'f') return flCardHTML(it);
    const prev = items.slice(0, i).reverse().find(x => x.k === 'f');
    const next = items.slice(i + 1).find(x => x.k === 'f');
    if (it.k === 'h') return flHotelHTML(it, prev, next);
    return flWaitHTML(it, prev, it.first ? null : next);
  }).join('');
  const todo = (flData.todo || []).map((t, i) => `<li class="${esc(t.st || '')}" style="--i:${i}"><b>${esc(t.t)}</b>${t.d ? `<span>${esc(t.d)}</span>` : ''}</li>`).join('');
  const notes = (flData.notes || []).map(n => `<li>${esc(n)}</li>`).join('');
  root.innerHTML = `<section class="fl-hero">
      <div class="fl-hero-top"><div class="fl-title">${esc(flData.title || TL('Loty', 'Flights'))}</div>
        <div class="fl-stats"><span><b>${fl.length}</b> ${TL('lotów', 'flights')}</span><span><b>${Math.round(air / 3600000)} h</b> ${TL('w powietrzu', 'in the air')}</span></div></div>
      ${flMapHTML()}
      <div id="fl-count" class="fl-count"></div>
    </section>
    ${todo ? `<section class="fl-todo"><h3>${TL('Do zrobienia', 'To do')}</h3><ul>${todo}</ul></section>` : ''}
    ${body}
    ${notes ? `<details class="fl-notes"><summary>${TL('Skąd te informacje', 'Where this comes from')}</summary><ul>${notes}</ul></details>` : ''}
    <div class="fl-foot"><label class="chip-btn">${TL('Wczytaj nowy plik', 'Load a new file')}<input type="file" accept="application/json,.json" onchange="flFile(this)" hidden></label>
      <button class="chip-btn" onclick="flDelete()">${TL('Usuń loty', 'Remove flights')}</button></div>`;
  flHeroLine();
  flTimer = setInterval(() => { if (flOn && document.getElementById('fl-count')) flHeroLine(); else clearInterval(flTimer); }, 30000);
  flFlyJet(run);
  const cards = root.querySelectorAll('.fl-card, .fl-hotel');
  if ('IntersectionObserver' in window) {
    flIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { flReveal(e.target); flIO.unobserve(e.target); } }), { threshold: .18 });
    cards.forEach(c => flIO.observe(c));
  } else cards.forEach(flReveal);
}

function flightsShow(on) {
  flOn = !!on;
  const panel = document.getElementById('panel-trip');
  if (panel) panel.classList.toggle('fl-on', flOn);
  document.querySelectorAll('#fl-seg button').forEach((b, i) => {
    b.classList.toggle('on', i === (flOn ? 1 : 0));
    b.textContent = i ? TL('✈️ Loty', '✈️ Flights') : TL('Wyjazd', 'Trip');
  });
  if (flOn) { flightsRender(); window.scrollTo(0, 0); }
}

// A link with #flights=… : take the data out of the address straight away, save it once signed in
let flPending = null;
(function flReadLink() {
  const m = location.hash.match(/^#flights=([\w-]+)$/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  try { const d = flDecode(m[1]); if (flValid(d)) flPending = d; } catch (e) {}
  if (!flPending) showToast(TL('❌ Ten link z lotami jest uszkodzony', '❌ That flights link is damaged'));
})();
auth.onAuthStateChanged(user => {
  if (!user) { flData = null; return; }
  flLoad(user);
  if (!flPending) return;
  const d = flPending;
  flPending = null;
  flSave(d).then(saved => {
    if (!saved) return;
    if (typeof switchTab === 'function') switchTab('trip');
    flightsShow(true);
  }).catch(e => showToast('❌ ' + e.message));
});
flightsShow(false);
