// Trip planning on top of the shared checklist (trips/{id}):
//  - destination, dates and the flight home (trip.site, trip.date = start, trip.end, trip.flight)
//  - packing templates that add sectioned items to my personal list
//  - a dive plan (trip.plan) ticked automatically by dives logged during the trip
//  - Home tile: countdown / day N of M / last dive before the flight / trip summary
const TL = (pl, en) => lang === 'pl' ? pl : en;
let currentTrip = null;

const TRIP_SECTIONS = [
  ['docs', 'Dokumenty', 'Documents'], ['gear', 'Sprzęt nurkowy', 'Dive gear'], ['boat', 'Na łódź i słońce', 'Boat & sun'],
  ['health', 'Zdrowie', 'Health'], ['tech', 'Elektronika', 'Electronics'], ['cold', 'Zimna woda', 'Cold water'], ['', 'Moje rzeczy', 'My things'],
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
function flightInfo(trip) {
  const f = Date.parse(trip.flight || '');
  if (isNaN(f)) return null;
  return { flight: f, last18: f - 18 * 3600e3, last24: f - 24 * 3600e3 };
}

// --- checklist panel: trip header ---
function renderTripCard() {
  const el = document.getElementById('trip-info');
  const t = currentTrip;
  if (!el || !t) return;
  const set = (id, v) => { const x = document.getElementById(id); if (x && document.activeElement !== x) x.value = v || ''; };
  set('cl-site', t.site); set('cl-next-date', t.date); set('cl-end', t.end); set('cl-flight', t.flight);
  const s = parseDay(t.date), e = parseDay(t.end), now = todayMs();
  const lines = [];
  if (s != null && now < s) lines.push(`<b>${TL('Za', 'In')} ${Math.round((s - now) / dayMs)} ${TL('dni', 'days')}</b>${e ? ' · ' + (Math.round((e - s) / dayMs) + 1) + ' ' + TL('dni wyjazdu', 'days away') : ''}`);
  else if (s != null && e != null && now <= e) lines.push(`<b>${TL('Dzień', 'Day')} ${Math.round((now - s) / dayMs) + 1} ${TL('z', 'of')} ${Math.round((e - s) / dayMs) + 1}</b>`);
  const fi = flightInfo(t);
  if (fi) lines.push(`${TL('Ostatnie nurkowanie najpóźniej', 'Last dive no later than')}: <b>${fmtDT(fi.last18)}</b> (18 h), ${TL('bezpieczniej', 'safer')} <b>${fmtDT(fi.last24)}</b> (24 h)`);
  el.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
  renderTripPlan();
  renderTripSummary();
}

async function saveTripMeta() {
  if (!currentTripId) return;
  const v = id => (document.getElementById(id) || {}).value || '';
  const upd = { site: v('cl-site'), date: v('cl-next-date'), end: v('cl-end'), flight: v('cl-flight') };
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

// Personal list grouped by section; original indexes keep toggle/remove working
function personalItemsHTML(pers) {
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
      ${fi && fi.flight > Date.now() && fi.flight - Date.now() < 4 * dayMs ? `<span class="trip-warn">${TL('Ostatnie nurkowanie do', 'Last dive by')} ${fmtDT(fi.last18)}</span>` : ''}`;
  } else {
    if ((now - e) / dayMs > 14) return '';
    const st = tripStats(t);
    body = `<b>${TL('podsumowanie', 'summary')}</b><span>${st.list.length} ${TL('nurkowań', 'dives')} · ${st.deepest ? st.deepest.depth + ' m max' : ''}${st.planTotal ? ` · ${st.planDone}/${st.planTotal} ${TL('z planu', 'of plan')}` : ''}</span>`;
  }
  return `<section class="tile tile-trip" onclick="switchTab('checklist')"><small>✈︎ ${name}</small>${body}</section>`;
}

// Warn when a dive is logged too close to the flight home
function checkDiveVsFlight(dive) {
  const fi = currentTrip && flightInfo(currentTrip);
  if (!fi) return;
  const end = DiveTools.endOf(dive);
  if (end && !end.estimated && end.t > fi.last18 && end.t < fi.flight) {
    setTimeout(() => showToast(TL('⚠️ To nurkowanie kończy się mniej niż 18 h przed lotem do domu', '⚠️ This dive ends less than 18 h before your flight home')), 1800);
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
