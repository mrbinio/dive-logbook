// Trip tab: import a trip plan PDF (day-by-day program, dive sites with depths, what the
// price leaves out) and a money planner: how much cash in local currency and dollars to
// order, and what goes on the card. The PDF is read on the phone with pdf.js and is not
// uploaded anywhere; only the extracted program is saved to the trip.
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const MONTHS = { sty: 1, jan: 1, lut: 2, feb: 2, mar: 3, kwi: 4, apr: 4, maj: 5, may: 5, cze: 6, jun: 6, lip: 7, jul: 7,
  sie: 8, aug: 8, wrz: 9, sep: 9, paz: 10, oct: 10, lis: 11, nov: 11, gru: 12, dec: 12 };
const CURRENCIES = ['PHP', 'USD', 'EUR', 'THB', 'IDR', 'EGP', 'MXN', 'MYR', 'GBP', 'SEK', 'NOK', 'PLN'];
const CUR_SIGN = { PHP: '₱', USD: '$', EUR: '€', THB: '฿', GBP: '£', PLN: 'zł', SEK: 'kr', NOK: 'kr' };
let tripImport = null;   // parsed PDF waiting for "Add to trip"

// --- PDF → text lines with columns ---
async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((ok, fail) => { const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js'; s.onload = ok; s.onerror = () => fail(new Error(TL('Brak internetu — nie mogę wczytać czytnika PDF', 'Offline — cannot load the PDF reader'))); document.head.appendChild(s); });
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
  return pdfjsLib;
}
async function pdfItems(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const items = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const tc = await (await pdf.getPage(p)).getTextContent();
    tc.items.forEach(i => { if (i.str.trim()) items.push({ p, x: i.transform[4], y: i.transform[5], w: i.width, s: i.str }); });
  }
  return items;
}
// Rows (same page and height), split into segments where there is a wide gap (table columns)
function pdfRows(items) {
  const rows = [];
  items.slice().sort((a, b) => a.p - b.p || b.y - a.y || a.x - b.x).forEach(it => {
    let r = rows.find(r => r.p === it.p && Math.abs(r.y - it.y) <= 3);
    if (!r) rows.push(r = { p: it.p, y: it.y, items: [] });
    r.items.push(it);
  });
  rows.sort((a, b) => a.p - b.p || b.y - a.y);
  rows.forEach(r => {
    r.segs = [];
    r.items.sort((a, b) => a.x - b.x).forEach(it => {
      const last = r.segs[r.segs.length - 1];
      if (last && it.x - last.end < 10) { last.s += (it.x - last.end > 1.5 ? ' ' : '') + it.s; last.end = Math.max(last.end, it.x + it.w); }
      else r.segs.push({ x: it.x, s: it.s, end: it.x + it.w });
    });
    r.segs.forEach(s => { s.s = s.s.replace(/\s+/g, ' ').trim(); });
    r.text = r.segs.map(s => s.s).join(' ');
  });
  // drop the page header / footer repeated on every page
  const pages = new Set(rows.map(r => r.p)).size, seen = {};
  rows.forEach(r => r.segs.forEach(s => { (seen[s.s] = seen[s.s] || new Set()).add(r.p); }));
  if (pages >= 3) rows.forEach(r => { r.segs = r.segs.filter(s => seen[s.s].size < Math.max(3, pages - 1)); r.text = r.segs.map(s => s.s).join(' '); });
  return rows.filter(r => r.segs.length);
}
// Join wrapped lines: a line starting in lower case or "(" continues the previous one
function joinLines(lines) {
  const out = [];
  lines.forEach(l => {
    const prev = out[out.length - 1] || '';
    // continues: lower case or "(", after "/ & , –", after a preposition, a lone word, or a "/" list going on
    if (out.length && (/^[a-ząćęłńóśźż(]/.test(l) || /[\/&,–-]$/.test(prev) || /\b(przy|wraku|w|na|z|do|i|od|and|at|to|of|the)$/i.test(prev)
      || !/\s/.test(l) || (prev.includes('/') && l.includes('/')))) out[out.length - 1] += ' ' + l;
    else out.push(l);
  });
  return out.map(l => l.replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim());
}
// Depth in metres from a description: "od 20 do 40 m", "12 a 26m", "17 - 35m", "na 12m" (not lengths: "118m długości")
function parseDepth(txt) {
  const r = /(\d{1,2})\s*(?:-|–|do|a|to)\s*(\d{1,2})\s*m(?!\s*d[łl]ug|\s*long)/i.exec(txt);
  if (r && +r[2] > +r[1]) return [+r[1], +r[2]];
  const one = /(\d{1,2})\s*m\b(?!\s*d[łl]ug|\s*long)/i.exec(txt.replace(/\d{3,}\s*m/g, ''));
  return one ? [null, +one[1]] : null;
}
const knownSite = name => {
  const n = norm(name).split(' ')[0];
  return n.length >= 4 ? PLAN_PRESETS.coron.find(p => norm(p[0]).startsWith(n.slice(0, 5))) : null;
};

function parseTripPdf(items) {
  const rows = pdfRows(items);
  // dates, price and currency from all text, page headers included
  const all = items.slice().sort((a, b) => a.p - b.p || b.y - a.y || a.x - b.x).map(i => i.s).join(' ');
  const res = { days: [], sites: [], excluded: [], price: null, dates: null, cur: /peso|php|₱/i.test(all) ? 'PHP' : null, gearIncluded: /sprz[eę]t jest wliczony|equipment (is )?included/i.test(all) };
  // dates "20 listopad - 2 grudnia 2026"
  const dm = /(\d{1,2})\s*([a-ząćęłńóśźż]+)?\s*[-–]\s*(\d{1,2})\s*([a-ząćęłńóśźż]+)\s*(\d{4})/i.exec(all);
  if (dm) {
    const m2 = MONTHS[norm(dm[4]).slice(0, 3)], m1 = dm[2] ? MONTHS[norm(dm[2]).slice(0, 3)] : m2;
    if (m1 && m2) { const y = +dm[5], y1 = m1 > m2 ? y - 1 : y, p2 = n => String(n).padStart(2, '0');
      res.dates = [`${y1}-${p2(m1)}-${p2(dm[1])}`, `${y}-${p2(m2)}-${p2(dm[3])}`]; }
  }
  const pm = /(\d[\d  ]{2,6})\s*(pln|zł|eur|usd|sek)/i.exec(all);
  if (pm) res.price = pm[1].replace(/\s/g, '') + ' ' + pm[2].toUpperCase();
  // "Price does not include:" bullets
  const ex = rows.findIndex(r => /nie zawiera|not include/i.test(r.text));
  if (ex >= 0) {
    let bx = null;
    for (const r of rows.slice(ex + 1)) {
      const bullet = r.segs[0].s === '•' || /^[•\-*]/.test(r.text);
      const t = r.text.replace(/^[•\-*]\s*/, '');
      if (bullet) { bx = bx == null ? r.segs[bullet && r.segs[0].s === '•' && r.segs[1] ? 1 : 0].x : bx; res.excluded.push(t); }
      else if (bx != null && Math.abs(r.segs[0].x - bx) < 4 && res.excluded.length) res.excluded[res.excluded.length - 1] += ' ' + t;
      else break;
    }
  }
  // Day-by-day program: "Dzień 3 – …" / "Day 3 - …" in the first column; columns by common x positions
  const dayRe = /^(?:Dzie[nń]|Day)\s*(\d{1,2})\b\s*[–-]?\s*(.*)$/i;
  const starts = rows.map((r, i) => ({ i, m: dayRe.exec(r.segs[0].s) })).filter(x => x.m);
  if (!starts.length) return res;
  const dayX = rows[starts[0].i].segs[0].x;
  const colsByPage = {};
  rows.forEach(r => r.segs.forEach(s => { const k = Math.round(s.x / 5) * 5; ((colsByPage[r.p] = colsByPage[r.p] || {})[k] = (colsByPage[r.p][k] || 0) + 1); }));
  const colOf = (p, x) => {
    const cols = Object.entries(colsByPage[p]).filter(([k, n]) => n >= 3 && +k >= dayX - 5).map(([k]) => +k).sort((a, b) => a - b);
    const main = cols.filter((k, i) => i === 0 || k - cols[i - 1] > 60);   // merge near-by starts into one column
    let c = 0; main.forEach((k, i) => { if (x >= k - 3) c = i; });
    return Math.min(c, 2);
  };
  starts.forEach((st, si) => {
    const end = si + 1 < starts.length ? starts[si + 1].i : rows.length;
    const cols = [[], [], []];
    for (let i = st.i; i < end; i++) {
      const r = rows[i];
      if (i > st.i && (r.segs[0].x < dayX - 3 || /^(koszt|cena|warunki|price|cost|total)/i.test(r.segs[0].s))) break;
      r.segs.forEach((s, k) => cols[colOf(r.p, s.x)].push(i === st.i && k === 0 ? st.m[2] : s.s));
    }
    const clean = s => s.replace(/\(?dla wszystkich\)?/i, '').replace(/^[–\-\s]+|[–\-\s]+$/g, '').trim();
    const c1 = cols[0].map(clean).filter(Boolean);
    let title = c1.shift() || '';
    while (c1.length && (/[&,]$/.test(title) || !/\s/.test(title) || /^[a-ząćęłńóśźż]/.test(c1[0]))) title += ' ' + c1.shift();
    const plan = joinLines(cols[1]);
    if (!title) title = plan.find(l => !/^(śniadanie|breakfast)/i.test(l)) || '';
    title = title.replace(/^\w/, c => c.toUpperCase());
    const desc = joinLines(cols[2]).join(' ');
    const sites = [];
    plan.forEach(l => {
      const w = /^Wraki?:\s*(.+)$/i.exec(l) || /^Wrecks?:\s*(.+)$/i.exec(l);
      if (w) w[1].split('/').forEach(n => sites.push(n.trim()));
      const d = /^Nurkowanie\s+(?:na rafie\s+)?(przy wraku|przy|w|na|z)\s+(.+)$/i.exec(l);
      if (d) sites.push(d[1].toLowerCase() === 'z' ? l : d[2].replace(/\(.*?\)/g, '').trim());
    });
    const daySites = sites.filter(Boolean).map(n => {
      const known = knownSite(n);
      let name = known ? known[0] : n.replace(/^\w/, c => c.toUpperCase());
      // depth from the description column, from where this site's name appears up to the next site
      const first = w => w.toLowerCase().split(' ')[0].slice(0, 5);
      const key = first(n), nd = desc.toLowerCase(), at = key ? nd.indexOf(key) : -1;
      let depth = null;
      if (at >= 0) {
        const others = sites.map(first).filter(k => k && k !== key).map(k => nd.indexOf(k, at + 1)).filter(x => x > at);
        const part = desc.slice(at, others.length ? Math.min(...others) + 5 : at + 160);
        depth = parseDepth(part);
        if (!known && !/maru/i.test(n) && new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+Maru', 'i').test(part)) name += ' Maru';
      }
      if (known) depth = [known[1], known[2]];
      return { name, min: depth ? depth[0] : null, depth: depth ? depth[1] : null };
    });
    res.days.push({ n: +st.m[1], title, note: c1.join(' '), plan, desc, sites: daySites.map(s => s.name) });
    daySites.forEach(s => { if (!res.sites.some(x => norm(x.name) === norm(s.name))) res.sites.push(s); });
  });
  return res;
}

// --- import UI ---
async function importTripPdf(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  const box = document.getElementById('trip-import');
  box.innerHTML = `<p class="muted">${TL('Czytam PDF…', 'Reading the PDF…')}</p>`;
  try {
    tripImport = parseTripPdf(await pdfItems(file));
    tripImport.file = file.name;
  } catch (e) { box.innerHTML = `<p class="muted warn-text">❌ ${esc(e.message)}</p>`; return; }
  const r = tripImport;
  if (!r.days.length && !r.sites.length) { box.innerHTML = `<p class="muted">${TL('Nie znalazłem w tym PDF programu dni ani miejsc nurkowych.', 'No day program or dive sites found in this PDF.')}</p>`; return; }
  const fd = s => new Date(s + 'T00:00').toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short' });
  box.innerHTML = `<div class="imp-box">
    <b>📄 ${esc(file.name)}</b>
    <ul>
      ${r.days.length ? `<li>${TL('Program', 'Program')}: <b>${r.days.length} ${TL('dni', 'days')}</b></li>` : ''}
      ${r.sites.length ? `<li>${TL('Miejsca nurkowe', 'Dive sites')}: ${r.sites.map(s => `${esc(s.name)}${s.depth ? ` <small>${s.min != null ? s.min + '–' : ''}${s.depth} m</small>` : ''}`).join(', ')}</li>` : ''}
      ${r.dates ? `<li>${TL('Termin', 'Dates')}: ${fd(r.dates[0])} – ${fd(r.dates[1])}</li>` : ''}
      ${r.price ? `<li>${TL('Cena', 'Price')}: ${esc(r.price)}</li>` : ''}
      ${r.excluded.length ? `<li>${TL('Nie wliczone', 'Not included')}: ${r.excluded.map(esc).join(' · ')}</li>` : ''}
    </ul>
    <div class="imp-act"><button class="btn-solid" onclick="applyTripImport()">${TL('Dodaj do wyjazdu', 'Add to trip')}</button>
      <button class="btn-ghost" onclick="tripImport = null; document.getElementById('trip-import').innerHTML = ''">${TL('Anuluj', 'Cancel')}</button></div>
  </div>`;
}
async function applyTripImport() {
  const r = tripImport;
  if (!r || !currentTripId) return;
  const d = (await tripRef().get()).data();
  const plan = d.plan || [];
  r.sites.forEach(s => {
    const have = plan.find(p => norm(p.name) === norm(s.name) || (knownSite(p.name) && knownSite(p.name) === knownSite(s.name)));
    if (have) { if (have.depth == null) have.depth = s.depth; if (have.min == null && s.min != null) have.min = s.min; }
    else plan.push({ name: s.name, depth: s.depth, min: s.min, done: false });
  });
  const upd = { plan, program: { days: r.days, excluded: r.excluded, price: r.price, cur: r.cur, gearIncluded: r.gearIncluded, file: r.file, at: new Date().toISOString() } };
  if (!d.date && r.dates) { upd.date = r.dates[0]; upd.end = r.dates[1]; }
  await tripRef().update(upd);
  tripImport = null;
  document.getElementById('trip-import').innerHTML = '';
  showToast(TL('Dodano program wyjazdu ✓', 'Trip program added ✓'));
}

// --- program, day by day; day 1 = arrival ---
function programDay1(t) {
  const arr = arrivalInfo(t);
  if (arr) return new Date(new Date(arr.at).toDateString()).getTime();
  return parseDay(t.date);
}
function renderProgram() {
  const el = document.getElementById('trip-program');
  const t = currentTrip;
  if (!el || !t) return;
  const pr = t.program;
  if (!pr || !(pr.days || []).length) {
    el.innerHTML = `<p class="muted">${TL('Wczytaj PDF z planem wyjazdu (od biura lub bazy nurkowej) — rozpiszę dni, wraki i głębokości.', 'Load the trip plan PDF (from the agency or dive centre) — I will lay out the days, sites and depths.')}</p>`;
    return;
  }
  const d1 = programDay1(t), today = todayMs();
  const fd = ms => new Date(ms).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  el.innerHTML = pr.days.map(d => {
    const at = d1 != null ? d1 + (d.n - 1) * dayMs : null;
    const now = at === today, past = at != null && at < today;
    return `<details class="pday${now ? ' today' : ''}${past ? ' past' : ''}"${now ? ' open' : ''}>
      <summary><span class="pd-n">${d.n}</span><div><b>${esc(d.title || TL('Dzień', 'Day') + ' ' + d.n)}</b>
        <small>${at != null ? fd(at) : ''}${(d.sites || []).length ? ' · 🤿 ' + d.sites.map(esc).join(' · ') : ''}</small></div></summary>
      ${(d.plan || []).map(l => `<p>${esc(l)}</p>`).join('')}
      ${d.note ? `<p class="pd-note">${esc(d.note)}</p>` : ''}
      ${d.desc ? `<p class="pd-desc">${esc(d.desc)}</p>` : ''}
    </details>`;
  }).join('') + `<p class="pl-foot">📄 ${esc(pr.file || '')}${pr.price ? ' · ' + esc(pr.price) : ''}</p>`;
}
// Open the dive planner at this depth
function planAtDepth(depth) {
  switchTab('plan');
  if (depth) setPlanner('depth', +depth);
}

// --- money ---
// Starting lines. For pesos the prices come from AlFresco Busuanga's menu (main ₱320–490,
// beer ₱110–150, shake ₱200, water ₱60) and the Coron dive shop's rental list.
function budgetDefaults(t) {
  const pr = t.program || {}, days = pr.days || [];
  const n = days.length || Math.max(1, Math.round(((parseDay(t.end) || 0) - (programDay1(t) || 0)) / dayMs) + 1) || 7;
  const diveDays = days.filter(d => (d.sites || []).length).length || Math.round(n * 0.6);
  const lunchDays = ((pr.excluded || []).join(' ').match(/lunch[^•]*?dni\w*\s+([\d\s,i]+)/i) || [, ''])[1].match(/\d+/g) || [];
  const freeDays = Math.max(0, n - diveDays - lunchDays.length - 1);
  const php = (pr.cur || 'PHP') === 'PHP';
  const P = v => php ? v : 0;
  const L = (pl, en, price, qty, pay) => ({ name: TL(pl, en), price: P(price), qty, pay });
  return { cur: pr.cur || 'PHP', home: 'PLN', usd: 100, buffer: 15, lines: [
    L('Kolacje (hotel, karta)', 'Dinners (hotel, card)', 900, Math.max(0, n - 1 - (lunchDays.length ? 1 : 0)), 'card'),
    L('Posiłki poza hotelem', 'Meals out', 1000, lunchDays.length + (lunchDays.length ? 1 : 0), 'cash'),
    L('Lunch w dni bez łodzi', 'Lunch on non-boat days', 500, freeDays, 'card'),
    L('Woda, kawa, shake w ciągu dnia', 'Water, coffee, shakes', 300, n, 'cash'),
    L('Napiwki: załoga i przewodnik', 'Tips: boat crew and guide', 300, diveDays, 'cash'),
    L('Nitrox (opcjonalnie, za butlę)', 'Nitrox (optional, per fill)', 350, 0, 'cash'),
    L('Latarka z wypożyczalni (dzień)', 'Torch rental (per day)', 200, 0, 'cash'),
    L('Wejściówki (np. Maquinit Hot Springs)', 'Entry fees (e.g. hot springs)', 200, 1, 'cash'),
    L('Transport lokalny (tricycle)', 'Local transport (tricycle)', 500, 1, 'cash'),
    L('Pamiątki dla rodziny', 'Souvenirs for family', 5000, 1, 'cash'),
    L('Drobne: pralnia, apteka, SIM', 'Small stuff: laundry, pharmacy, SIM', 1500, 1, 'cash'),
  ] };
}
const myBudget = () => currentTrip && currentTrip.budget && currentTrip.budget[myUid()];
let fxRates = {}, budgetTimer = null;
async function loadRates(cur) {
  if (fxRates[cur]) return fxRates[cur];
  const cacheKey = 'fx:' + cur;
  try { const c = JSON.parse(localStorage.getItem(cacheKey) || 'null'); if (c && Date.now() - c.t < 12 * 3600e3) return (fxRates[cur] = c); } catch (e) {}
  let rates = null, date = '';
  try {
    const j = await (await fetch(`https://api.frankfurter.dev/v1/latest?base=${cur}&symbols=PLN,USD,SEK,EUR`)).json();
    if (j.rates) { rates = j.rates; date = j.date; }
  } catch (e) {}
  if (!rates) try {
    const j = await (await fetch(`https://open.er-api.com/v6/latest/${cur}`)).json();
    if (j.rates) { rates = j.rates; date = (j.time_last_update_utc || '').slice(5, 16); }
  } catch (e) {}
  if (!rates) return null;
  rates[cur] = 1;
  const r = { rates, date, t: Date.now() };
  try { localStorage.setItem(cacheKey, JSON.stringify(r)); } catch (e) {}
  return (fxRates[cur] = r);
}
async function startBudget() {
  await tripRef().update({ ['budget.' + myUid()]: budgetDefaults(currentTrip) });
}
function saveBudget(b, now) {
  clearTimeout(budgetTimer);
  const go = () => tripRef().update({ ['budget.' + myUid()]: b }).catch(e => showToast('❌ ' + e.message));
  if (now) go(); else budgetTimer = setTimeout(go, 700);
}
function editBudget(i, key, val) {
  const b = JSON.parse(JSON.stringify(myBudget()));
  if (i < 0) b[key] = val; else b.lines[i][key] = val;
  saveBudget(b, i < 0 || key === 'pay');
  if (i < 0 || key === 'pay') { currentTrip.budget[myUid()] = b; renderBudget(); } else { currentTrip.budget[myUid()] = b; renderBudgetTotals(); }
}
function addBudgetLine() {
  const b = JSON.parse(JSON.stringify(myBudget()));
  b.lines.push({ name: TL('Nowa pozycja', 'New item'), price: 0, qty: 1, pay: 'cash' });
  currentTrip.budget[myUid()] = b; saveBudget(b, true); renderBudget();
}
function removeBudgetLine(i) {
  const b = JSON.parse(JSON.stringify(myBudget()));
  b.lines.splice(i, 1);
  currentTrip.budget[myUid()] = b; saveBudget(b, true); renderBudget();
}
async function resetBudget() {
  if (!confirm(TL('Przywrócić domyślne pozycje? Twoje zmiany w kwotach znikną.', 'Restore the default items? Your edits will be lost.'))) return;
  await startBudget();
}
function renderBudget() {
  const el = document.getElementById('trip-budget');
  const t = currentTrip;
  if (!el || !t) return;
  const b = myBudget();
  // a save comes back as a snapshot while typing: keep the fields, refresh only the sums
  if (b && el.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') { renderBudgetTotals(); return; }
  if (!b) {
    el.innerHTML = `<p class="muted">${TL('Policzę, ile gotówki zamówić (waluta lokalna i dolary), a co zapłacisz kartą — na dzień i na cały wyjazd. Każdą kwotę możesz zmienić.',
      'I will work out how much cash to order (local currency and dollars) and what goes on the card — per day and for the whole trip. Every amount is editable.')}</p>
      <button class="btn-solid cl-wide" onclick="startBudget()">💰 ${TL('Policz pieniądze na wyjazd', 'Plan trip money')}</button>`;
    return;
  }
  const sign = CUR_SIGN[b.cur] || b.cur;
  el.innerHTML = `
    <div class="bud-top">
      <label>${TL('Waluta na miejscu', 'Local currency')} <select class="edit-input" onchange="editBudget(-1, 'cur', this.value)">${CURRENCIES.map(c => `<option${c === b.cur ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
      <label>${TL('Przelicz na', 'Show in')} <select class="edit-input" onchange="editBudget(-1, 'home', this.value)">${['PLN', 'SEK', 'EUR'].map(c => `<option${c === b.home ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    </div>
    <div class="bud-lines">${b.lines.map((l, i) => `
      <div class="bud-line">
        <input class="edit-input bud-name" value="${esc(l.name)}" oninput="editBudget(${i}, 'name', this.value)">
        <span class="bud-calc"><input type="number" class="edit-input" min="0" value="${l.price || ''}" placeholder="0" oninput="editBudget(${i}, 'price', +this.value || 0)"><i>${sign} ×</i>
          <input type="number" class="edit-input bud-qty" min="0" value="${l.qty}" oninput="editBudget(${i}, 'qty', +this.value || 0)"></span>
        <button class="bud-pay ${l.pay}" onclick="editBudget(${i}, 'pay', '${l.pay === 'cash' ? 'card' : 'cash'}')">${l.pay === 'cash' ? '💵' : '💳'}</button>
        <button class="rem-del" onclick="removeBudgetLine(${i})" aria-label="Delete">✕</button>
      </div>`).join('')}</div>
    <div class="bud-act"><button class="chip-btn" onclick="addBudgetLine()">+ ${TL('Dodaj pozycję', 'Add item')}</button>
      <button class="chip-btn" onclick="resetBudget()">↺ ${TL('Domyślne', 'Defaults')}</button></div>
    <p class="pl-note">💵 ${TL('gotówka', 'cash')} · 💳 ${TL('karta — dotknij, żeby zmienić', 'card — tap to switch')}</p>
    <div id="bud-totals"></div>`;
  renderBudgetTotals();
}
async function renderBudgetTotals() {
  const el = document.getElementById('bud-totals');
  const b = myBudget();
  if (!el || !b) return;
  const sum = pay => b.lines.filter(l => l.pay === pay).reduce((a, l) => a + (+l.price || 0) * (+l.qty || 0), 0);
  const cash = sum('cash'), card = sum('card');
  const pr = (currentTrip.program || {}).days || [];
  const days = pr.length || Math.max(1, Math.round(((parseDay(currentTrip.end) || 0) - (programDay1(currentTrip) || 0)) / dayMs) + 1) || 1;
  const order = Math.ceil(cash * (1 + (+b.buffer || 0) / 100) / 500) * 500;
  const sign = CUR_SIGN[b.cur] || b.cur;
  const fx = await loadRates(b.cur);
  const conv = v => fx && fx.rates[b.home] ? ` <small>≈ ${Math.round(v * fx.rates[b.home]).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB')} ${b.home}</small>` : '';
  const f = v => Math.round(v).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB') + ' ' + sign;
  if (!document.getElementById('bud-totals')) return;
  el.innerHTML = `<div class="bud-sum">
      <div><small>${TL('Gotówka', 'Cash')}</small><b>${f(cash)}</b>${conv(cash)}</div>
      <div><small>${TL('Karta', 'Card')}</small><b>${f(card)}</b>${conv(card)}</div>
      <div><small>${TL('Razem / dzień', 'Total / day')}</small><b>${f((cash + card) / days)}</b>${conv((cash + card) / days)}</div>
    </div>
    <div class="bud-order">
      <div class="dw-h">🏦 ${TL('Do zamówienia', 'To order')}</div>
      <div class="dw-row"><span>${b.cur} (${TL('gotówka', 'cash')} + <input type="number" class="edit-input bud-mini" min="0" max="100" value="${b.buffer}" onchange="editBudget(-1, 'buffer', +this.value || 0)">% ${TL('zapasu', 'spare')})</span><b>${f(order)}</b></div>
      <div class="dw-row"><span>USD ${TL('na awaryjną rezerwę', 'emergency reserve')}</span><b>$ <input type="number" class="edit-input bud-mini" min="0" step="50" value="${b.usd}" onchange="editBudget(-1, 'usd', +this.value || 0)"></b></div>
      <div class="dw-row"><span>${TL('Razem w', 'Total in')} ${b.home}</span><b>${fx && fx.rates[b.home] ? '≈ ' + Math.round(order * fx.rates[b.home] + (b.usd || 0) * (fx.rates[b.home] / (fx.rates.USD || 1))).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB') + ' ' + b.home : '—'}</b></div>
      <small>${fx ? TL(`Kurs z ${fx.date}. W kantorze będzie trochę gorszy.`, `Rate from ${fx.date}. Exchange offices are a bit worse.`) : TL('Brak kursu (offline).', 'No exchange rate (offline).')}</small>
    </div>
    <ul class="bud-tips">
      <li>${TL('Płacąc kartą, zawsze wybieraj walutę lokalną, nie złotówki — przewalutowanie terminala (DCC) jest drogie.', 'When paying by card always choose the local currency — the terminal\'s conversion (DCC) is expensive.')}</li>
      <li>${TL('Napiwki, bary poza hotelem, targ i tricycle — tylko gotówka, najlepiej w małych nominałach.', 'Tips, bars outside the hotel, markets and tricycles — cash only, best in small notes.')}</li>
      <li>${TL('Dolary to rezerwa na wypadek, gdyby karta nie działała — dolary wymienisz wszędzie.', 'Dollars are a reserve in case the card fails — they can be exchanged anywhere.')}</li>
      ${(currentTrip.program || {}).gearIncluded ? `<li>${TL('Sprzęt jest wliczony w cenę wyjazdu — wypożyczenie dolicz tylko za latarkę, jeśli nie masz swojej.', 'Gear is included in the trip price — only add a torch rental if you have no torch.')}</li>` : ''}
    </ul>`;
}

function renderTripTab() {
  renderTripCard();
  renderProgram();
  renderBudget();
}
