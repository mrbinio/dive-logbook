// Flights: the itinerary as boarding passes that assemble themselves, with a route map,
// baggage per leg and a lounge verdict for each wait.
// This code is public, so it holds no itinerary. The data lives in users/{uid}/profile/flights and
// reaches the account through a #flights=<base64url> link (a fragment is never sent to the server)
// or a JSON file. Shape: { title, ap: {CODE: {name, lat, lon, lx, ly}}, todo: [{st, t, d}], notes: [],
// items: [{k:'s', t} | {k:'f', no, air, plane, from, to, dep, arr, tFrom, tTo, cls, seat, meal, pnr, etkt, bag: {st, big, t}}
//         | {k:'w', at, st, t, lines: []}
//         | {k:'h', name, addr, addrLocal, in, out, ref, tel, lines: [], routes: [{t, maps, steps: [{ic, t, d}]}]}] }, with dep/arr as ISO strings including the UTC offset.
let flData = null, flOn = false, flIO = null, flTimer = null, flRun = 0, flParked = false;
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
  const paths = arcs.map((a, i) => `<path class="fl-arc${a.back ? ' back' : ''}" d="${a.d}" pathLength="1" style="--d:${(.3 + i * step).toFixed(2)}s"/>`).join('')
    + arcs.map(a => `<path class="fl-flown" d="${a.d}" pathLength="1" style="--d:${(.3 + arcs.length * step).toFixed(2)}s"/>`).join('');
  const codes = [...new Set(fl.flatMap(f => [f.from, f.to]))];
  const dots = codes.map((c, i) => {
    const p = ap[c], x = X(p.lon), y = Y(p.lat);
    return `<g class="fl-city" style="--d:${(.1 + i * .22).toFixed(2)}s"><circle class="fl-pulse" cx="${x}" cy="${y}" r="4"/><circle cx="${x}" cy="${y}" r="3.4"/>
      <text x="${x + (+p.lx || 8)}" y="${y + (+p.ly || 4)}" text-anchor="${(+p.lx || 8) < 0 ? 'end' : 'start'}">${esc(c)}</text></g>`;
  }).join('');
  return `<svg class="fl-map" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(TL('Mapa trasy', 'Route map'))}">
    <g class="fl-grid">${grid.join('')}</g>${paths}${dots}
    <g id="fl-jet" class="fl-jet" style="opacity:0"><circle class="fl-jet-ring" r="7"/><path d="M11 0 L-5 -7 L-2 0 L-5 7 Z"/></g></svg>`;
}
function flFlyJet(run) {
  const jet = document.getElementById('fl-jet');
  const arcs = [...document.querySelectorAll('#flights-view .fl-arc')];
  flParked = false;
  if (!jet || !arcs.length || flCalm()) { flParked = true; flPaint(); return; }
  const step = 620, t0 = performance.now() + 300;
  const frame = now => {
    if (run !== flRun || !jet.isConnected) return;
    const t = (now - t0) / step, i = Math.floor(t);
    if (i >= arcs.length) { flParked = true; flPaint(); return; }
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

// --- live progress: from the timetable, or from the phone's GPS (it works in flight mode, best at a window) ---
let flGps = null, flWatch = null;
const FL_R = 6371, flRad = d => d * Math.PI / 180;
function flGc(a, b) {   // angle between two points on the globe, radians
  const p1 = flRad(a.lat), p2 = flRad(b.lat), dl = flRad(b.lon - a.lon);
  return 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2));
}
function flBearing(a, b) {
  const p1 = flRad(a.lat), p2 = flRad(b.lat), dl = flRad(b.lon - a.lon);
  return Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl));
}
// How much of the great circle A→B lies behind P, and how far P is off that line (km)
function flAlong(a, b, p) {
  const d13 = flGc(a, p), d12 = flGc(a, b), turn = flBearing(a, p) - flBearing(a, b);
  const xt = Math.asin(Math.sin(d13) * Math.sin(turn));
  const at = Math.acos(Math.min(1, Math.max(-1, Math.cos(d13) / Math.cos(xt)))) * (Math.cos(turn) < 0 ? -1 : 1);
  return { frac: Math.min(1, Math.max(0, at / (d12 || 1))), off: Math.abs(xt) * FL_R };
}
const flGeo = () => { const ap = flData.ap || {}; return flFlights().every(f => ap[f.from] && ap[f.to]); };
const flKm = f => flGc(flData.ap[f.from], flData.ap[f.to]) * FL_R;
const flNum = n => Math.round(n).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB');

// The flight in progress: the GPS fix decides when there is a fresh one near a flight's line, else the clock
function flLeg() {
  const fl = flFlights(), now = Date.now(), H = 3600000;
  if (flGps && now - flGps.t < 5 * 60000 && flGeo()) {
    let best = null;
    fl.forEach((f, i) => {
      if (now < Date.parse(f.dep) - 3 * H || now > Date.parse(f.arr) + 3 * H) return;
      const r = flAlong(flData.ap[f.from], flData.ap[f.to], flGps);
      if (r.off < 400 && (!best || r.off < best.off)) best = { i, f, frac: r.frac, off: r.off, gps: true };
    });
    if (best) return best;
  }
  const i = fl.findIndex(f => now >= Date.parse(f.dep) && now <= Date.parse(f.arr));
  if (i < 0) return null;
  const f = fl[i];
  return { i, f, frac: (now - Date.parse(f.dep)) / (Date.parse(f.arr) - Date.parse(f.dep)), gps: false };
}
// Share of each flight already flown: 1 behind us, 0 ahead, the share in between for the one in the air
function flShares(leg) {
  const now = Date.now();
  return flFlights().map((f, i) => leg ? (i < leg.i ? 1 : i === leg.i ? leg.frac : 0) : (now > Date.parse(f.arr) ? 1 : 0));
}
function flLeft(leg) {
  const km = flGeo() ? flKm(leg.f) * (1 - leg.frac) : 0;
  if (leg.gps && flGps.spd > 50 && km) return km / (flGps.spd * 3.6) * 3600000;
  return Math.max(0, Date.parse(leg.f.arr) - Date.now());
}

// Grey for the part of the route behind us, the jet parked where we are, the boarding pass track filled in
function flPaint() {
  const root = document.getElementById('flights-view');
  if (!root || !flData) return;
  const leg = flLeg(), share = flShares(leg);
  const arcs = root.querySelectorAll('.fl-arc'), flown = root.querySelectorAll('.fl-flown');
  share.forEach((p, i) => {
    if (flown[i]) { flown[i].style.strokeDasharray = `${p.toFixed(4)} 2`; flown[i].classList.toggle('on', p > 0.001); }
    if (arcs[i]) arcs[i].classList.toggle('done', p >= 1);
  });
  const jet = document.getElementById('fl-jet');
  if (jet && flParked) {
    const a = leg && arcs[leg.i];
    if (a) {
      const len = a.getTotalLength(), at = Math.min(len - 1, leg.frac * len);
      const p = a.getPointAtLength(Math.max(0, at)), q = a.getPointAtLength(Math.max(0, at) + 1);
      jet.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI})`);
      jet.style.opacity = 1;
      jet.classList.add('live');
    } else { jet.style.opacity = 0; jet.classList.remove('live'); }
  }
  root.querySelectorAll('.fl-card').forEach(c => {
    const on = !!leg && c.dataset.dep === leg.f.dep, sm = c.querySelector('.fl-line small');
    c.classList.toggle('live', on);
    if (on) c.style.setProperty('--p', leg.frac.toFixed(4));
    if (sm) sm.textContent = on ? `${Math.round(leg.frac * 100)}% · ${TL('zostało', 'left')} ${flSpan(flLeft(leg))}` : sm.dataset.dur;
  });
}

function flGpsOn() {
  if (!navigator.geolocation) { showToast(TL('❌ Ten telefon nie udostępnia GPS', '❌ No GPS on this device')); return; }
  if (flWatch !== null) return;
  flWatch = navigator.geolocation.watchPosition(pos => {
    const c = pos.coords;
    flGps = { lat: c.latitude, lon: c.longitude, alt: c.altitude, spd: c.speed, acc: c.accuracy, t: Date.now() };
    if (flOn) { flHeroLine(); flPaint(); }
  }, err => {
    if (err.code === 1) { flGpsOff(); showToast(TL('📍 Brak zgody na lokalizację. Włącz ją w Ustawieniach.', '📍 Location not allowed. Turn it on in Settings.')); }
  }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 120000 });
  try { localStorage.setItem('ccFlGps', '1'); } catch (e) {}
  flHeroLine();
}
function flGpsOff(keep) {
  if (flWatch !== null && navigator.geolocation) navigator.geolocation.clearWatch(flWatch);
  flWatch = null;
  if (!keep) { flGps = null; try { localStorage.removeItem('ccFlGps'); } catch (e) {} }
  if (flOn) { flHeroLine(); flPaint(); }
}
const flGpsToggle = () => flWatch === null ? flGpsOn() : flGpsOff();

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
      <div class="fl-line"><span class="fl-track"><i>✈</i></span><small data-dur="${esc(dur)}">${esc(dur)}</small></div>
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
  const leg = flLeg(), next = flFlights().find(f => Date.parse(f.dep) > Date.now());
  flLiveLine(leg, next);
  if (leg) {
    el.innerHTML = `<small>✈️ ${TL('W powietrzu', 'In the air')}: ${esc(leg.f.no)} ${esc(leg.f.from)} → ${esc(leg.f.to)}</small><b>${TL('zostało', 'left')} ${esc(flSpan(flLeft(leg)))}</b>`;
    return;
  }
  el.innerHTML = next
    ? `<small>${TL('Następny lot', 'Next flight')}: ${esc(next.no)} ${esc(next.from)} → ${esc(next.to)}</small><b>${TL('za', 'in')} ${esc(flUntil(Date.parse(next.dep) - Date.now()))}</b>`
    : `<small>${TL('Podróż zakończona', 'Trip finished')}</small>`;
  document.querySelectorAll('#flights-view .fl-card.next').forEach(c => c.classList.remove('next'));
  if (next) { const c = document.querySelector(`#flights-view .fl-card[data-dep="${next.dep}"]`); if (c) c.classList.add('next'); }
}

// Under the countdown: how far along we are, what the GPS says, and the switch for it
function flLiveLine(leg, next) {
  const el = document.getElementById('fl-live');
  if (!el) return;
  const geo = flGeo(), share = flShares(leg), fl = flFlights();
  const total = geo ? fl.reduce((s, f) => s + flKm(f), 0) : 0;
  const done = geo ? fl.reduce((s, f, i) => s + flKm(f) * share[i], 0) : 0;
  const trip = document.getElementById('fl-trip');
  if (trip) trip.innerHTML = total ? `<b>${Math.round(done / total * 100)}%</b> ${TL('trasy za Tobą', 'of the route done')}` : '';
  const g = flGps, on = flWatch !== null;
  const gpsTxt = !on ? '' : !g ? TL('📍 Szukam sygnału GPS… Trzymaj telefon przy oknie.', '📍 Looking for GPS… Keep the phone by a window.')
    : '📍 ' + [g.alt != null ? `${flNum(g.alt)} m` : '', g.spd != null && g.spd >= 0 ? `${flNum(g.spd * 3.6)} km/h` : '', `± ${flNum(g.acc)} m`].filter(Boolean).join(' · ');
  const legTxt = leg && geo ? `<div class="fl-prog"><i style="width:${(leg.frac * 100).toFixed(1)}%"></i></div>
      <div class="fl-live-row"><span>${TL('Przelecone', 'Flown')} <b>${flNum(flKm(leg.f) * leg.frac)} km</b> ${TL('z', 'of')} ${flNum(flKm(leg.f))}</span>
      <span>${leg.gps ? TL('pozycja z GPS', 'position from GPS') : TL('według rozkładu', 'by the timetable')}</span></div>` : '';
  const btn = geo && (leg || next) ? `<button class="chip-btn fl-gps${on ? ' on' : ''}" onclick="flGpsToggle()">${on ? TL('📍 GPS włączony · wyłącz', '📍 GPS on · turn off') : TL('📍 Pokaż moją pozycję (GPS)', '📍 Show my position (GPS)')}</button>` : '';
  el.innerHTML = legTxt + (gpsTxt ? `<div class="fl-live-gps">${esc(gpsTxt)}</div>` : '') + btn
    + (btn && !on ? `<small class="fl-live-hint">${TL('Działa też w trybie samolotowym. Bez GPS pozycja liczy się z rozkładu.', 'Works in flight mode too. Without GPS the position follows the timetable.')}</small>` : '');
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
        <div class="fl-stats"><span><b>${fl.length}</b> ${TL('lotów', 'flights')}</span><span><b>${Math.round(air / 3600000)} h</b> ${TL('w powietrzu', 'in the air')}</span><span id="fl-trip"></span></div></div>
      ${flMapHTML()}
      <div id="fl-count" class="fl-count"></div>
      <div id="fl-live" class="fl-live"></div>
    </section>
    ${todo ? `<section class="fl-todo"><h3>${TL('Do zrobienia', 'To do')}</h3><ul>${todo}</ul></section>` : ''}
    ${body}
    ${notes ? `<details class="fl-notes"><summary>${TL('Skąd te informacje', 'Where this comes from')}</summary><ul>${notes}</ul></details>` : ''}
    <div class="fl-foot"><label class="chip-btn">${TL('Wczytaj nowy plik', 'Load a new file')}<input type="file" accept="application/json,.json" onchange="flFile(this)" hidden></label>
      <button class="chip-btn" onclick="flDelete()">${TL('Usuń loty', 'Remove flights')}</button></div>`;
  flHeroLine();
  flTimer = setInterval(() => {
    if (flOn && document.getElementById('fl-count')) { flHeroLine(); flPaint(); }
    else { clearInterval(flTimer); flGpsOff(true); }
  }, 30000);
  flFlyJet(run);
  flPaint();
  let want = false;
  try { want = localStorage.getItem('ccFlGps') === '1'; } catch (e) {}
  if (want && flGeo() && flWatch === null) flGpsOn();
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
  else flGpsOff(true);   // GPS only while the flights are on screen; it comes back on with them
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
