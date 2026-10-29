// Trip planning on top of the shared checklist (trips/{id}):
//  - destination and dates (trip.site, trip.date = start, trip.end)
//  - the route (trip.legs = [{mode: plane|car|ferry, from, to, dep, arr, alt}]): when you arrive and
//    may dive, and the last time to surface before a flight or a high mountain road on the way back.
//    The older single field trip.flight is shown as one plane leg.
//  - packing templates that add sectioned items to my personal list
//  - a dive plan (trip.plan) ticked automatically by dives logged during the trip
//  - Home tile: countdown / day N of M / last dive before the flight / trip summary
const TL = (pl, en) => lang === 'pl' ? pl : en;
let currentTrip = null;

const TRIP_SECTIONS = [
  ['docs', 'Dokumenty', 'Documents'], ['gear', 'Sprzęt nurkowy', 'Dive gear'], ['boat', 'Na łódź i słońce', 'Boat & sun'],
  ['health', 'Zdrowie', 'Health'], ['tech', 'Elektronika', 'Electronics'], ['cold', 'Zimna woda', 'Cold water'],
  ['wash', 'Kosmetyczka', 'Toiletries'], ['clothes', 'Ubrania', 'Clothes'], ['', 'Moje rzeczy', 'My things'],
];
// [section, Polish, English]. "sprawdź" items are things to verify, not facts.
const TRIP_TEMPLATES = {
  tropic: { pl: 'Tropiki · wraki · łódź', en: 'Tropics · wrecks · boat', items: [
    ['docs', 'Paszport (sprawdź ważność — min. 6 mies.)', 'Passport (check validity — 6+ months)'],
    ['docs', 'Formularz wjazdowy online, np. eTravel (sprawdź oficjalnie)', 'Online arrival form, e.g. eTravel (check official site)'],
    ['docs', 'Karty certyfikatów (Advanced / Deep / Nitrox)', 'Cert cards (Advanced / Deep / Nitrox)'],
    ['docs', 'Ubezpieczenie nurkowe (np. DAN) — potwierdzenie', 'Dive insurance (e.g. DAN) — proof'],
    ['docs', 'Gotówka w lokalnej walucie (opłaty na miejscu)', 'Local cash (fees on site)'],
    ['docs', 'Rezerwacje: loty, nocleg, centrum nurkowe', 'Bookings: flights, stay, dive centre'],
    ['gear', 'Komputer nurkowy + ładowarka', 'Dive computer + charger'],
    ['gear', 'Maska + zapasowa maska', 'Mask + spare mask'],
    ['gear', 'Latarka główna (wnętrza wraków)', 'Primary torch (wreck interiors)'],
    ['gear', 'Latarka zapasowa', 'Backup torch'],
    ['gear', 'Bojka SMB + szpulka', 'SMB + reel'],
    ['gear', 'Nóż / easy cut', 'Knife / line cutter'],
    ['gear', 'Zestaw naprawczy: o-ringi, pasek do maski', 'Save-a-dive kit: o-rings, mask strap'],
    ['gear', 'Pianka 3 mm lub lycra', '3 mm wetsuit or rash guard'],
    ['boat', 'Tabletki na chorobę morską', 'Seasickness tablets'],
    ['boat', 'Worek wodoszczelny', 'Dry bag'],
    ['boat', 'Krem z filtrem bezpieczny dla rafy', 'Reef-safe sunscreen'],
    ['boat', 'Koszulka z filtrem UV', 'UV shirt'],
    ['boat', 'Ręcznik szybkoschnący', 'Quick-dry towel'],
    ['boat', 'Okulary przeciwsłoneczne + czapka', 'Sunglasses + cap'],
    ['health', 'Krople do uszu', 'Ear drops'],
    ['health', 'Środek na komary', 'Mosquito repellent'],
    ['health', 'Leki na żołądek + elektrolity', 'Stomach meds + electrolytes'],
    ['health', 'Plastry i środek odkażający', 'Plasters and antiseptic'],
    ['tech', 'Adapter do gniazdek (sprawdź typ)', 'Plug adapter (check type)'],
    ['tech', 'Powerbank', 'Power bank'],
    ['tech', 'Kabel do komputera nurkowego', 'Dive computer cable'],
  ] },
  cold: { pl: 'Zimna woda · suchar', en: 'Cold water · drysuit', items: [
    ['docs', 'Karty certyfikatów (Dry Suit)', 'Cert cards (Dry Suit)'],
    ['docs', 'Ubezpieczenie nurkowe — potwierdzenie', 'Dive insurance — proof'],
    ['cold', 'Suchy skafander', 'Drysuit'],
    ['cold', 'Ocieplacz + bielizna termiczna', 'Undersuit + base layer'],
    ['cold', 'Kaptur 7 mm', '7 mm hood'],
    ['cold', 'Rękawice suche / mokre', 'Dry / wet gloves'],
    ['cold', 'Talk do manszet + zapasowe manszety', 'Seal talc + spare seals'],
    ['cold', 'Termos z ciepłym napojem', 'Thermos with a hot drink'],
    ['cold', 'Ciepła czapka i kurtka na powierzchnię', 'Warm hat and jacket for the surface'],
    ['gear', 'Komputer nurkowy + ładowarka', 'Dive computer + charger'],
    ['gear', 'Latarka główna + zapasowa', 'Primary + backup torch'],
    ['gear', 'Bojka SMB + szpulka', 'SMB + reel'],
    ['gear', 'Balast (więcej niż w ciepłej wodzie)', 'Weights (more than in warm water)'],
    ['gear', 'Zestaw naprawczy: o-ringi, pasek do maski', 'Save-a-dive kit: o-rings, mask strap'],
  ] },
};
TRIP_TEMPLATES.wash = { pl: 'Kosmetyczka · ubrania', en: 'Toiletries · clothes', items: [
  ['wash', 'Szczoteczka + pasta do zębów', 'Toothbrush + toothpaste'],
  ['wash', 'Nić dentystyczna', 'Dental floss'],
  ['wash', 'Szampon + odżywka (po słonej wodzie)', 'Shampoo + conditioner (after salt water)'],
  ['wash', 'Żel pod prysznic', 'Shower gel'],
  ['wash', 'Dezodorant', 'Deodorant'],
  ['wash', 'Maszynka / golarka + pianka', 'Razor / shaver + foam'],
  ['wash', 'Grzebień / szczotka', 'Comb / brush'],
  ['wash', 'Balsam po opalaniu (aloes)', 'After-sun (aloe)'],
  ['wash', 'Pomadka z filtrem', 'Lip balm with SPF'],
  ['wash', 'Krem nawilżający', 'Moisturiser'],
  ['wash', 'Obcinaczka do paznokci', 'Nail clippers'],
  ['wash', 'Patyczki do uszu', 'Cotton buds'],
  ['wash', 'Chusteczki nawilżane', 'Wet wipes'],
  ['wash', 'Płyny max 100 ml w przezroczystej torebce (bagaż podręczny)', 'Liquids max 100 ml in a clear bag (cabin bag)'],
  ['clothes', 'Bielizna i skarpetki (na każdy dzień + zapas)', 'Underwear and socks (one per day + spare)'],
  ['clothes', 'Koszulki', 'T-shirts'],
  ['clothes', 'Szorty', 'Shorts'],
  ['clothes', 'Długie spodnie + bluza (samolot, wieczór)', 'Long trousers + hoodie (plane, evenings)'],
  ['clothes', 'Kąpielówki × 2', 'Swimwear × 2'],
  ['clothes', 'Klapki', 'Flip-flops'],
  ['clothes', 'Buty na ląd', 'Shoes for land'],
  ['clothes', 'Kurtka przeciwdeszczowa', 'Rain jacket'],
  ['clothes', 'Piżama', 'Sleepwear'],
] };
// Coron wrecks and sites — depths are approximate, confirm with the dive centre
const PLAN_PRESETS = {
  coron: [['Akitsushima', 38], ['Irako', 43], ['Kogyo Maru', 34], ['Okikawa Maru', 26], ['Olympia Maru', 30], ['Morazan Maru', 25],
    ['Kyokuzan Maru', 40], ['Lusong Gunboat', 11], ['East Tangat', 22], ['Skeleton Wreck', 20], ['Barracuda Lake', 30]],
};

const dayMs = 864e5;
const parseDay = s => { const t = Date.parse((s || '') + 'T00:00'); return isNaN(t) ? null : t; };
const todayMs = () => new Date(new Date().toDateString()).getTime();
const fmtDT = ms => new Date(ms).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function tripDives(trip) {
  const s = parseDay(trip.date), e = parseDay(trip.end);
  if (s == null) return [];
  return dives.filter(d => { const t = parseDay(d.date); return t != null && t >= s && (e == null || t <= e); });
}
// A plan entry is done by hand, or when a dive during the trip has a matching site name
function planDone(item, list) {
  if (item.done) return true;
  const n = norm(item.name);
  return !!n && list.some(d => { const s = norm(d.site); return s && (s.includes(n) || n.includes(s)); });
}
// --- route ---
const LEG_MODES = { plane: ['✈️', 'Samolot', 'Plane'], car: ['🚗', 'Auto', 'Car'], ferry: ['⛴️', 'Prom / łódź', 'Ferry / boat'] };
const ALT_LIMIT = 300;   // m above sea level: a road this high after diving counts like a flight
function tripLegs(t) {
  const legs = (t.legs || []).map((l, i) => Object.assign({}, l, { i }));
  if (t.flight && !legs.some(l => l.dep === t.flight)) legs.push({ mode: 'plane', from: '', to: TL('dom', 'home'), dep: t.flight, legacy: true });
  return legs.filter(l => !isNaN(Date.parse(l.dep))).sort((a, b) => Date.parse(a.dep) - Date.parse(b.dep));
}
// A plane, or a car over a high road, puts you at altitude
const legAtAltitude = l => l.mode === 'plane' || (l.mode === 'car' && +l.alt >= ALT_LIMIT);
// On the way back: after the middle of the trip, or after a dive of this trip
function isReturnLeg(t, l) {
  const dep = Date.parse(l.dep), s = parseDay(t.date), e = parseDay(t.end);
  if (s != null && e != null && dep > (s + e + dayMs) / 2) return true;
  return tripDives(t).some(d => { const x = DiveTools.endOf(d); return x && x.t < dep; });
}
// Arrival at the destination: the last leg out
function arrivalInfo(t) {
  const out = tripLegs(t).filter(l => !isReturnLeg(t, l));
  if (!out.length) return null;
  const leg = out[out.length - 1];
  const at = Date.parse(leg.arr || '');
  return { leg, at: isNaN(at) ? Date.parse(leg.dep) : at, approx: isNaN(at) };
}
// First flight / high road on the way back after `after`, with the last time to surface
function flightInfo(t, after = Date.now()) {
  const leg = tripLegs(t).find(l => legAtAltitude(l) && isReturnLeg(t, l) && Date.parse(l.dep) > after);
  if (!leg) return null;
  const f = Date.parse(leg.dep);
  return { leg, flight: f, last18: f - 18 * 3600e3, last24: f - 24 * 3600e3 };
}
// Highest point of the driving route between two place names:
// Open-Meteo geocoding → OSRM route → Open-Meteo elevation every ~3 km (free, no key)
async function routeMaxAltitude(from, to) {
  const getJSON = async u => { const r = await fetch(u); if (!r.ok) throw new Error(r.status); return r.json(); };
  const place = async name => {
    const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=${lang}`);
    if (!j.results || !j.results.length) throw new Error(TL(`Nie znam miejsca „${name}”`, `Unknown place "${name}"`));
    return j.results[0];
  };
  const [a, b] = await Promise.all([place(from), place(to)]);
  const route = await getJSON(`https://router.project-osrm.org/route/v1/driving/${a.longitude},${a.latitude};${b.longitude},${b.latitude}?overview=full&geometries=geojson`);
  if (!route.routes || !route.routes.length) throw new Error(TL('Nie znalazłem trasy samochodowej', 'No driving route found'));
  const line = route.routes[0].geometry.coordinates;
  const km = route.routes[0].distance / 1000;
  const step = Math.max(3, km / 900);   // at most ~900 samples (9 requests)
  const pts = [line[0]];
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const [x1, y1] = line[i - 1], [x2, y2] = line[i];
    acc += Math.hypot((x2 - x1) * Math.cos(y1 * Math.PI / 180), y2 - y1) * 111.2;
    if (acc >= step) { pts.push(line[i]); acc = 0; }
  }
  pts.push(line[line.length - 1]);
  let best = { alt: -1 };
  for (let i = 0; i < pts.length; i += 100) {
    const ch = pts.slice(i, i + 100);
    const j = await getJSON(`https://api.open-meteo.com/v1/elevation?latitude=${ch.map(p => p[1].toFixed(4)).join(',')}&longitude=${ch.map(p => p[0].toFixed(4)).join(',')}`);
    (j.elevation || []).forEach((e, k) => { if (e > best.alt) best = { alt: Math.round(e), lat: ch[k][1], lon: ch[k][0] }; });
  }
  return Object.assign(best, { km: Math.round(km) });
}
// "Calculate from the route" button in the add-leg form
async function calcLegAlt() {
  const v = id => ((document.getElementById(id) || {}).value || '').trim();
  if (!v('leg-from') || !v('leg-to')) { showToast(TL('Wpisz najpierw skąd i dokąd', 'Fill in from and to first')); return; }
  const btn = document.getElementById('leg-alt-calc');
  btn.disabled = true; btn.textContent = TL('Liczę trasę…', 'Checking the route…');
  try {
    const r = await routeMaxAltitude(v('leg-from'), v('leg-to'));
    document.getElementById('leg-alt').value = r.alt;
    document.getElementById('leg-alt').dataset.calc = JSON.stringify(r);
    showToast(TL(`Najwyżej ${r.alt} m n.p.m. · ${r.km} km`, `Highest ${r.alt} m · ${r.km} km`));
  } catch (e) { showToast('❌ ' + e.message); }
  btn.disabled = false; btn.textContent = TL('📍 Oblicz z trasy', '📍 Calculate from route');
}
// The same for a car leg already on the list
async function calcSavedLegAlt(i) {
  const leg = (currentTrip.legs || [])[i];
  if (!leg) return;
  if (!leg.from || !leg.to) { showToast(TL('Ten odcinek nie ma „skąd” i „dokąd”', 'This leg has no from / to')); return; }
  showToast(TL('Liczę trasę…', 'Checking the route…'));
  try {
    const r = await routeMaxAltitude(leg.from, leg.to);
    const legs = currentTrip.legs.slice();
    legs[i] = Object.assign({}, leg, { alt: r.alt, km: r.km, top: [r.lat, r.lon] });
    await tripRef().update({ legs });
    showToast(TL(`Najwyżej ${r.alt} m n.p.m. · ${r.km} km`, `Highest ${r.alt} m · ${r.km} km`));
  } catch (e) { showToast('❌ ' + e.message); }
}
const sameLeg = (a, b) => !!a && !!b && a.dep === b.dep && a.mode === b.mode && a.to === b.to;
const legName = l => [l.from, l.to].filter(Boolean).map(esc).join(' → ') || TL(LEG_MODES[l.mode][1], LEG_MODES[l.mode][2]);
function renderLegs() {
  const t = currentTrip, list = document.getElementById('legs-list');
  if (!t || !list) return;
  const arr = arrivalInfo(t), fi = flightInfo(t);
  list.innerHTML = tripLegs(t).map(l => {
    const m = LEG_MODES[l.mode] || LEG_MODES.plane, arrMs = Date.parse(l.arr || '');
    const tags = [];
    if (arr && sameLeg(arr.leg, l)) tags.push(`<em class="leg-ok">🤿 ${TL('na miejscu', 'arrival')}</em>`);
    if (fi && sameLeg(fi.leg, l)) tags.push(`<em class="leg-warn">${TL('ostatnie wynurzenie', 'last surfacing')} ${fmtDT(fi.last18)}</em>`);
    if (l.mode === 'car' && l.alt != null && l.alt !== '') {
      const txt = `${TL('najwyżej', 'highest')} ${+l.alt} m n.p.m.${l.km ? ' · ' + l.km + ' km' : ''}`;
      tags.push(l.top ? `<a class="leg-tag" href="https://www.openstreetmap.org/?mlat=${l.top[0]}&mlon=${l.top[1]}#map=11/${l.top[0]}/${l.top[1]}" target="_blank" rel="noopener">⛰ ${txt}</a>` : `<em>⛰ ${txt}</em>`);
    } else if (l.mode === 'car' && !l.legacy) tags.push(`<button class="leg-tag" onclick="calcSavedLegAlt(${l.i})">📍 ${TL('Sprawdź wysokość trasy', 'Check road altitude')}</button>`);
    return `<div class="leg"><span class="leg-ic">${m[0]}</span><div><b>${legName(l)}</b>
      <small>${fmtDT(Date.parse(l.dep))}${isNaN(arrMs) ? '' : ' → ' + fmtDT(arrMs)}</small>${tags.join('')}</div>
      <button class="rem-del" onclick="removeLeg(${l.legacy ? -1 : l.i})" aria-label="Delete">✕</button></div>`;
  }).join('') || `<p class="muted">${TL('Dodaj loty, przejazdy autem i promy — policzę, kiedy możesz nurkować i do kiedy się wynurzyć przed powrotem.',
    'Add flights, drives and ferries — I will work out when you can dive and when to surface before going home.')}</p>`;
  const form = document.getElementById('legs-form');
  if (form && form.dataset.lang !== lang) {
    form.dataset.lang = lang;
    form.innerHTML = `
      <select id="leg-mode" class="edit-input full" onchange="document.getElementById('leg-alt-w').style.display = this.value === 'car' ? '' : 'none'">
        ${Object.entries(LEG_MODES).map(([k, m]) => `<option value="${k}">${m[0]} ${TL(m[1], m[2])}</option>`).join('')}</select>
      <input id="leg-from" class="edit-input" placeholder="${TL('Skąd, np. Tokio', 'From, e.g. Tokyo')}">
      <input id="leg-to" class="edit-input" placeholder="${TL('Dokąd, np. Cebu', 'To, e.g. Cebu')}">
      <label><span>${TL('Wyjazd / odlot', 'Departure')}</span><input type="datetime-local" id="leg-dep" class="edit-input"></label>
      <label><span>${TL('Przyjazd / przylot', 'Arrival')}</span><input type="datetime-local" id="leg-arr" class="edit-input"></label>
      <label id="leg-alt-w" class="full" style="display:none"><span>${TL('Najwyższy punkt trasy (m n.p.m.)', 'Highest point of the road (m)')}</span>
        <span class="alt-row"><input type="number" id="leg-alt" class="edit-input" inputmode="numeric" placeholder="${TL('policzę sam', 'auto')}" oninput="delete this.dataset.calc">
        <button type="button" id="leg-alt-calc" class="btn-ghost" onclick="calcLegAlt()">${TL('📍 Oblicz z trasy', '📍 Calculate from route')}</button></span></label>
      <button class="btn-solid full" onclick="addLeg()">+ ${TL('Dodaj odcinek', 'Add leg')}</button>`;
  }
}
async function addLeg() {
  const v = id => (document.getElementById(id) || {}).value || '';
  const leg = { mode: v('leg-mode') || 'plane', from: v('leg-from').trim(), to: v('leg-to').trim(), dep: v('leg-dep'), arr: v('leg-arr') };
  if (!leg.dep) { showToast(TL('Podaj datę i godzinę wyjazdu', 'Add the departure date and time')); return; }
  if (leg.arr && leg.arr < leg.dep) { showToast(TL('Przyjazd jest przed wyjazdem', 'Arrival is before departure')); return; }
  if (leg.mode === 'car') {
    const altEl = document.getElementById('leg-alt');
    let calc = altEl && altEl.dataset.calc ? JSON.parse(altEl.dataset.calc) : null;
    // No altitude typed: work it out from the route, so a mountain road is never missed
    if (!v('leg-alt') && leg.from && leg.to) {
      showToast(TL('Liczę wysokość trasy…', 'Checking the road altitude…'));
      calc = await routeMaxAltitude(leg.from, leg.to).catch(e => { showToast('❌ ' + e.message); return null; });
    }
    if (calc) Object.assign(leg, { alt: calc.alt, km: calc.km, top: [calc.lat, calc.lon] });
    else if (v('leg-alt')) leg.alt = Math.round(+v('leg-alt'));
    if (altEl) delete altEl.dataset.calc;
  }
  await tripRef().update({ legs: (currentTrip.legs || []).concat([leg]) });
  ['leg-from', 'leg-to', 'leg-dep', 'leg-arr', 'leg-alt'].forEach(id => { const x = document.getElementById(id); if (x) x.value = ''; });
  // the next leg usually starts where this one ended
  const from = document.getElementById('leg-from'); if (from) from.value = leg.to;
}
async function removeLeg(i) {
  if (i < 0) return tripRef().update({ flight: '' });
  const legs = (currentTrip.legs || []).slice();
  legs.splice(i, 1);
  await tripRef().update({ legs });
}

// --- checklist panel: trip header ---
function renderTripCard() {
  const el = document.getElementById('trip-info');
  const t = currentTrip;
  if (!el || !t) return;
  const set = (id, v) => { const x = document.getElementById(id); if (x && document.activeElement !== x) x.value = v || ''; };
  set('cl-site', t.site); set('cl-next-date', t.date); set('cl-end', t.end);
  const s = parseDay(t.date), e = parseDay(t.end), now = todayMs();
  const lines = [];
  if (s != null && now < s) lines.push(`<b>${TL('Za', 'In')} ${Math.round((s - now) / dayMs)} ${TL('dni', 'days')}</b>${e ? ' · ' + (Math.round((e - s) / dayMs) + 1) + ' ' + TL('dni wyjazdu', 'days away') : ''}`);
  else if (s != null && e != null && now <= e) lines.push(`<b>${TL('Dzień', 'Day')} ${Math.round((now - s) / dayMs) + 1} ${TL('z', 'of')} ${Math.round((e - s) / dayMs) + 1}</b>`);
  const arr = arrivalInfo(t);
  if (arr && arr.at > Date.now() - 2 * dayMs) lines.push(`🤿 ${TL('Na miejscu', 'You arrive')}: <b>${arr.approx ? '~' : ''}${fmtDT(arr.at)}</b> (${legName(arr.leg)}). `
    + TL('Po locie nie ma obowiązkowej przerwy przed nurkowaniem, ale po długiej podróży (zmęczenie, odwodnienie, jet lag) lepiej odpocząć i zacząć od łatwego nurkowania.',
         'There is no required wait after flying before diving, but after a long trip (fatigue, dehydration, jet lag) rest first and start with an easy dive.'));
  const fi = flightInfo(t);
  if (fi) {
    const how = fi.leg.mode === 'car' ? TL(`przejazdem przez ${+fi.leg.alt} m n.p.m.`, `driving over ${+fi.leg.alt} m`) : TL('lotem', 'your flight');
    lines.push(`${TL('Ostatnie wynurzenie przed', 'Last surfacing before')} ${how} (${legName(fi.leg)}): <b>${fmtDT(fi.last18)}</b> (18 h), ${TL('bezpieczniej', 'safer')} <b>${fmtDT(fi.last24)}</b> (24 h)`
      + (fi.leg.mode === 'car' ? '. ' + TL('Wysoka droga po nurkowaniu działa jak lot — przyjmij ten sam odstęp albo sprawdź tabelę wysokościową / komputer.',
        'A high road after diving works like a flight — keep the same gap or check altitude tables / your computer.') : ''));
  }
  el.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
  renderLegs();
  renderTripPlan();
  renderTripSummary();
}

async function saveTripMeta() {
  if (!currentTripId) return;
  const v = id => (document.getElementById(id) || {}).value || '';
  const upd = { site: v('cl-site'), date: v('cl-next-date'), end: v('cl-end') };
  if (upd.end && upd.date && upd.end < upd.date) { showToast(TL('Koniec wyjazdu jest przed początkiem', 'The trip ends before it starts')); return; }
  await tripRef().update(upd);
  if (typeof scheduleNotification === 'function') scheduleNotification(upd.date);
  const calBtn = document.getElementById('cl-cal-btn');
  if (calBtn) calBtn.style.display = upd.date ? '' : 'none';
}

// --- packing templates ---
async function applyTripTemplate(key) {
  const tpl = TRIP_TEMPLATES[key];
  if (!tpl || !currentTripId) return;
  const uid = myUid();
  const d = (await tripRef().get()).data();
  const pers = (d.personal && d.personal[uid]) || [];
  const have = new Set(pers.map(p => norm(p.name)));
  let added = 0;
  tpl.items.forEach(([sec, pl, en]) => {
    const name = lang === 'pl' ? pl : en;
    if (!have.has(norm(name))) { pers.push({ name, checked: false, sec }); have.add(norm(name)); added++; }
  });
  await tripRef().update({ ['personal.' + uid]: pers });
  showToast(TL(`Dodano ${added} pozycji`, `Added ${added} items`));
}

// Section picker next to "Add personal item", in the current language
function fillSectionSelect() {
  const sel = document.getElementById('cl-new-sec');
  if (!sel) return;
  const keep = sel.value;
  sel.innerHTML = TRIP_SECTIONS.map(([key, pl, en]) => `<option value="${key}">${key ? (lang === 'pl' ? pl : en) : '—'}</option>`).join('');
  sel.value = keep;
}
// Personal list grouped by section; original indexes keep toggle/remove working
function personalItemsHTML(pers) {
  fillSectionSelect();
  const groups = TRIP_SECTIONS.map(([key, pl, en]) => ({ key, title: lang === 'pl' ? pl : en,
    items: pers.map((item, i) => ({ item, i })).filter(x => (x.item.sec || '') === key) })).filter(g => g.items.length);
  const known = new Set(TRIP_SECTIONS.map(s => s[0]));
  const stray = pers.map((item, i) => ({ item, i })).filter(x => !known.has(x.item.sec || ''));
  if (stray.length) groups.push({ key: 'x', title: TL('Inne', 'Other'), items: stray });
  const row = ({ item, i }) => `
    <div class="cl-row">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="togglePersonal(${i})">
      <span class="${item.checked ? 'done' : ''}">${esc(item.name)}</span>
      <button onclick="removePersonal(${i})" aria-label="Remove">✕</button>
    </div>`;
  return groups.map(g => {
    const done = g.items.filter(x => x.item.checked).length;
    return `<div class="cl-group"><div class="cl-group-h">${g.title}<span>${done}/${g.items.length}</span></div>${g.items.map(row).join('')}</div>`;
  }).join('');
}

// --- dive plan ---
function renderTripPlan() {
  const el = document.getElementById('trip-plan');
  if (!el || !currentTrip) return;
  const plan = currentTrip.plan || [];
  const list = tripDives(currentTrip);
  const done = plan.filter(p => planDone(p, list)).length;
  el.innerHTML = (plan.length ? `<div class="cl-group-h">${TL('Zaliczone', 'Done')}<span>${done}/${plan.length}</span></div>` : '') +
    plan.map((p, i) => {
      const ok = planDone(p, list), auto = ok && !p.done;
      return `<div class="cl-row">
        <input type="checkbox" ${ok ? 'checked' : ''} ${auto ? 'disabled title="' + TL('Zalogowane nurkowanie', 'Logged dive') + '"' : ''} onchange="togglePlan(${i})">
        <span class="${ok ? 'done' : ''}">${esc(p.name)}${p.depth ? ` <small>~${p.depth} m</small>` : ''}${auto ? ` <small class="auto">✓ ${TL('z logbooka', 'from logbook')}</small>` : ''}</span>
        <button onclick="removePlan(${i})" aria-label="Remove">✕</button>
      </div>`;
    }).join('');
}
async function addPlanItem() {
  const name = (document.getElementById('plan-name').value || '').trim();
  if (!name || !currentTripId) return;
  const depth = parseFloat(document.getElementById('plan-depth').value) || null;
  const plan = ((await tripRef().get()).data().plan || []).concat({ name, depth, done: false });
  await tripRef().update({ plan });
  document.getElementById('plan-name').value = ''; document.getElementById('plan-depth').value = '';
}
async function addPlanPreset(key) {
  if (!currentTripId) return;
  const plan = (await tripRef().get()).data().plan || [];
  const have = new Set(plan.map(p => norm(p.name)));
  (PLAN_PRESETS[key] || []).forEach(([name, depth]) => { if (!have.has(norm(name))) plan.push({ name, depth, done: false }); });
  await tripRef().update({ plan });
}
async function togglePlan(i) {
  const plan = (await tripRef().get()).data().plan || [];
  if (!plan[i]) return;
  plan[i].done = !plan[i].done;
  await tripRef().update({ plan });
}
async function removePlan(i) {
  const plan = (await tripRef().get()).data().plan || [];
  plan.splice(i, 1);
  await tripRef().update({ plan });
}

// --- after the trip ---
function tripStats(trip) {
  const list = tripDives(trip);
  const minutes = list.reduce((a, d) => a + (d.duration || 0), 0);
  const deepest = list.filter(d => d.depth).sort((a, b) => b.depth - a.depth)[0];
  const plan = trip.plan || [];
  return { list, minutes, deepest, planDone: plan.filter(p => planDone(p, list)).length, planTotal: plan.length };
}
function renderTripSummary() {
  const el = document.getElementById('trip-summary');
  if (!el || !currentTrip) return;
  const s = parseDay(currentTrip.date), e = parseDay(currentTrip.end);
  if (s == null || todayMs() < s) { el.innerHTML = ''; return; }
  const st = tripStats(currentTrip);
  if (!st.list.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="trip-sum">
    <div><b>${st.list.length}</b><small>${TL('nurkowań', 'dives')}</small></div>
    <div><b>${Math.round(st.minutes / 6) / 10}</b><small>${TL('godzin', 'hours')}</small></div>
    <div><b>${st.deepest ? st.deepest.depth : '—'}</b><small>${TL('m maks.', 'm max')}</small></div>
    ${st.planTotal ? `<div><b>${st.planDone}/${st.planTotal}</b><small>${TL('z planu', 'of plan')}</small></div>` : ''}
  </div>`;
}

// --- Home tile ---
function homeTripTile() {
  const t = currentTrip;
  if (!t) return '';
  const s = parseDay(t.date), e = parseDay(t.end), now = todayMs();
  if (s == null) return '';
  const name = esc(t.site || TL('Wyjazd', 'Trip'));
  const items = (t.shared || []).concat((t.personal && t.personal[myUid()]) || []);
  const packed = items.length ? Math.round(items.filter(x => x.checked).length / items.length * 100) : null;
  const fi = flightInfo(t);
  let body = '';
  if (now < s) {
    if ((s - now) / dayMs > 60) return '';
    body = `<b>${TL('za', 'in')} ${Math.round((s - now) / dayMs)} ${TL('dni', 'days')}</b>
      ${packed != null ? `<div class="rank-bar"><i style="width:${packed}%"></i></div><span>${TL('Spakowane', 'Packed')} ${packed}%</span>` : ''}`;
  } else if (e == null || now <= e) {
    const st = tripStats(t);
    body = `<b>${TL('dzień', 'day')} ${Math.round((now - s) / dayMs) + 1}${e ? ` ${TL('z', 'of')} ${Math.round((e - s) / dayMs) + 1}` : ''}</b>
      <span>${st.list.length} ${TL('nurkowań', 'dives')}${st.planTotal ? ` · ${TL('plan', 'plan')} ${st.planDone}/${st.planTotal}` : ''}</span>
      ${fi && fi.flight - Date.now() < 4 * dayMs ? `<span class="trip-warn">${TL('Ostatnie nurkowanie do', 'Last dive by')} ${fmtDT(fi.last18)}</span>` : ''}`;
  } else {
    if ((now - e) / dayMs > 14) return '';
    const st = tripStats(t);
    body = `<b>${TL('podsumowanie', 'summary')}</b><span>${st.list.length} ${TL('nurkowań', 'dives')} · ${st.deepest ? st.deepest.depth + ' m max' : ''}${st.planTotal ? ` · ${st.planDone}/${st.planTotal} ${TL('z planu', 'of plan')}` : ''}</span>`;
  }
  return `<section class="tile tile-trip" onclick="switchTab('checklist')"><small>✈︎ ${name}</small>${body}</section>`;
}

// Warn when a dive is logged too close to the next flight / high road
function checkDiveVsFlight(dive) {
  const end = DiveTools.endOf(dive);
  const fi = currentTrip && end && !end.estimated && flightInfo(currentTrip, end.t);
  if (fi && end.t > fi.last18) {
    setTimeout(() => showToast(fi.leg.mode === 'car'
      ? TL(`⚠️ To nurkowanie kończy się mniej niż 18 h przed przejazdem przez ${+fi.leg.alt} m n.p.m.`, `⚠️ This dive ends less than 18 h before driving over ${+fi.leg.alt} m`)
      : TL('⚠️ To nurkowanie kończy się mniej niż 18 h przed lotem', '⚠️ This dive ends less than 18 h before your flight')), 1800);
  }
}

// --- my saved packing lists (users/{uid}/packLists) ---
let savedLists = [];
function packListsCol() { return db.collection('users').doc(myUid()).collection('packLists'); }
function loadSavedLists() {
  if (!myUid()) return;
  packListsCol().orderBy('name').get().then(snap => {
    savedLists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderSavedLists();
  }).catch(e => console.warn('pack lists:', e));
}
function renderSavedLists() {
  const el = document.getElementById('saved-lists');
  if (!el) return;
  el.innerHTML = savedLists.map(l => `<span class="chip-btn saved-chip">
      <button onclick="applySavedList('${l.id}')">${esc(l.name)} <small>${(l.items || []).length}</small></button>
      <button class="x" onclick="deleteSavedList('${l.id}')" aria-label="Delete">✕</button></span>`).join('');
}
async function saveListAs() {
  if (!currentTripId) return;
  const d = (await tripRef().get()).data();
  const pers = (d.personal && d.personal[myUid()]) || [];
  const shared = d.shared || [];
  if (!pers.length && !shared.length) { showToast(TL('Lista jest pusta', 'The list is empty')); return; }
  const name = (prompt(TL('Nazwa listy (np. Moje Coron, Weekend Hańcza):', 'List name (e.g. My tropics, Lake weekend):'), d.site || '') || '').trim();
  if (!name) return;
  const items = pers.map(p => ({ name: p.name, sec: p.sec || '' })).concat(shared.map(s => ({ name: s.name, sec: '', shared: true })));
  const existing = savedLists.find(l => norm(l.name) === norm(name));
  if (existing && !confirm(TL(`Nadpisać listę „${name}”?`, `Overwrite "${name}"?`))) return;
  await (existing ? packListsCol().doc(existing.id) : packListsCol().doc())
    .set({ name, items, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  showToast(TL(`Zapisano „${name}” (${items.length} pozycji)`, `Saved "${name}" (${items.length} items)`));
  loadSavedLists();
}
async function applyItemsToTrip(items) {
  const uid = myUid();
  const d = (await tripRef().get()).data();
  const pers = (d.personal && d.personal[uid]) || [], shared = d.shared || [];
  const havePers = new Set(pers.map(p => norm(p.name))), haveShared = new Set(shared.map(s => norm(s.name)));
  let added = 0;
  items.forEach(it => {
    const k = norm(it.name);
    if (!k) return;
    if (it.shared) { if (!haveShared.has(k)) { shared.push({ name: it.name, checked: false }); haveShared.add(k); added++; } }
    else if (!havePers.has(k)) { pers.push({ name: it.name, checked: false, sec: it.sec || '' }); havePers.add(k); added++; }
  });
  await tripRef().update({ ['personal.' + uid]: pers, shared });
  return added;
}
async function applySavedList(id) {
  const l = savedLists.find(x => x.id === id);
  if (!l || !currentTripId) return;
  const added = await applyItemsToTrip(l.items || []);
  showToast(TL(`Dodano ${added} pozycji z „${l.name}”`, `Added ${added} items from "${l.name}"`));
}
async function deleteSavedList(id) {
  const l = savedLists.find(x => x.id === id);
  if (!l || !confirm(TL(`Usunąć zapisaną listę „${l.name}”?`, `Delete saved list "${l.name}"?`))) return;
  await packListsCol().doc(id).delete();
  loadSavedLists();
}

// --- archive of finished trips ---
let pastTrips = [];
async function loadTripArchive() {
  const el = document.getElementById('trip-archive');
  if (!el) return;
  el.innerHTML = `<p class="muted">…</p>`;
  try {
    const snap = await tripsCol().where('members', 'array-contains', myUid()).where('active', '==', false).get();
    pastTrips = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    renderTripArchive();
  } catch (e) { el.innerHTML = `<p class="muted">❌ ${esc(e.message)}</p>`; }
}
function renderTripArchive() {
  const el = document.getElementById('trip-archive');
  if (!el) return;
  if (!pastTrips.length) { el.innerHTML = `<p class="muted">${TL('Brak zakończonych wyjazdów. Trafiają tu po kliknięciu „Nowy wyjazd”.', 'No finished trips yet. They land here when you start a new trip.')}</p>`; return; }
  const uid = myUid();
  el.innerHTML = pastTrips.map((t, i) => {
    const pers = (t.personal && t.personal[uid]) || [];
    const st = t.date ? tripStats(t) : null;
    const when = [t.date && formatDate(t.date), t.end && formatDate(t.end)].filter(Boolean).join(' – ');
    return `<details class="arch-trip">
      <summary><b>${esc(t.site || TL('Wyjazd', 'Trip'))}</b><span>${when || TL('bez dat', 'no dates')}</span></summary>
      ${st && st.list.length ? `<div class="trip-sum">
        <div><b>${st.list.length}</b><small>${TL('nurkowań', 'dives')}</small></div>
        <div><b>${st.deepest ? st.deepest.depth : '—'}</b><small>${TL('m maks.', 'm max')}</small></div>
        ${st.planTotal ? `<div><b>${st.planDone}/${st.planTotal}</b><small>${TL('z planu', 'of plan')}</small></div>` : ''}</div>` : ''}
      <p class="muted">${pers.length} ${TL('rzeczy na liście', 'items on the list')}${(t.shared || []).length ? ` · ${(t.shared || []).length} ${TL('wspólnych', 'shared')}` : ''}${(t.plan || []).length ? ` · ${(t.plan || []).length} ${TL('miejsc w planie', 'planned sites')}` : ''}</p>
      <div class="arch-actions">
        <button class="chip-btn" onclick="copyArchivedList(${i})">${TL('Kopiuj listę do obecnego wyjazdu', 'Copy list to current trip')}</button>
        ${(t.plan || []).length ? `<button class="chip-btn" onclick="copyArchivedPlan(${i})">${TL('Kopiuj plan', 'Copy plan')}</button>` : ''}
      </div>
    </details>`;
  }).join('');
}
async function copyArchivedList(i) {
  const t = pastTrips[i];
  if (!t || !currentTripId) return;
  const items = ((t.personal && t.personal[myUid()]) || []).map(p => ({ name: p.name, sec: p.sec || '' }))
    .concat((t.shared || []).map(s => ({ name: s.name, shared: true })));
  const added = await applyItemsToTrip(items);
  showToast(TL(`Dodano ${added} pozycji`, `Added ${added} items`));
}
async function copyArchivedPlan(i) {
  const t = pastTrips[i];
  if (!t || !currentTripId) return;
  const plan = (await tripRef().get()).data().plan || [];
  const have = new Set(plan.map(p => norm(p.name)));
  (t.plan || []).forEach(p => { if (!have.has(norm(p.name))) plan.push({ name: p.name, depth: p.depth || null, done: false }); });
  await tripRef().update({ plan });
  showToast(TL('Plan skopiowany', 'Plan copied'));
}
