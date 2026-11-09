// Flights, part two: the jet lag plan and the reminders, both worked out from the flights alone,
// so they fit any trip. functions/main.py sends the same reminders as push notifications
// (keep the two in step). Times are shown in the local time of the place they happen.
// Jet lag rules (CDC Yellow Book, Mayo Clinic): sleep on the plane when it is night at the
// destination; going east, seek morning light, going west, afternoon light; the body shifts
// about 1 h a day going east and 1.5 h going west.

// UTC offset in minutes from an ISO time ("…+09:00")
const flOff = iso => { const m = /([+-])(\d\d):?(\d\d)$/.exec(iso || ''); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0; };
// The same moment as local ISO text at a given offset, so flDay / flClock can format it
const flAt = (ms, off) => new Date(ms + off * 60000).toISOString().slice(0, 16);
const flCc = code => ((flData && flData.ap && flData.ap[code]) || {}).cc || null;
// Consecutive flights with less than `gapH` hours on the ground form one journey
function flJourneys(gapH) {
  const fl = flFlights().slice().sort((a, b) => Date.parse(a.dep) - Date.parse(b.dep)), out = [];
  let cur = [];
  fl.forEach((f, i) => {
    cur.push(f);
    const nx = fl[i + 1];
    if (!nx || Date.parse(nx.dep) - Date.parse(f.arr) >= gapH * 3600e3) { out.push(cur); cur = []; }
  });
  return out;
}

// --- jet lag ---
const FL_NIGHT = [22, 6];   // night at the destination: 22:00–06:00
function flSleepOn(f, off) {
  const a = Date.parse(f.dep), b = Date.parse(f.arr), step = 5 * 60000;
  let asleep = 0, first = null, last = null;
  for (let t = a; t < b; t += step) {
    const h = new Date(t + off * 60000).getUTCHours();
    if (h >= FL_NIGHT[0] || h < FL_NIGHT[1]) { asleep += step; if (first == null) first = t; last = t + step; }
  }
  const len = b - a;
  const kind = asleep >= Math.min(4 * 3600e3, len * .6) ? 'sleep' : asleep >= 90 * 60000 ? 'part' : 'awake';
  return { kind, asleep, from: first == null ? 0 : first - a, to: last == null ? 0 : last - a, len, off };
}
function flJetModel() {
  const js = flJourneys(24);
  if (!js.length) return [];
  let body = flOff(js[0][0].dep);
  const out = [];
  js.forEach((j, k) => {
    const last = j[j.length - 1], to = flOff(last.arr), shift = to - body;
    body = to;
    if (Math.abs(shift) < 180) return;
    out.push({ first: k === 0, shift, east: shift > 0, to, place: flApName(last.to), arr: last.arr, dep: j[0].dep,
      flights: j.map(f => ({ f, s: flSleepOn(f, to) })), days: Math.ceil(Math.abs(shift) / (shift > 0 ? 60 : 90)) });
  });
  return out;
}
function flJetHTML() {
  const model = flJetModel();
  if (!model.length) return '';
  const hrs = m => `${m > 0 ? '+' : '−'}${Math.abs(m) / 60 % 1 ? (Math.abs(m) / 60).toFixed(1).replace('.', lang === 'pl' ? ',' : '.') : Math.abs(m) / 60} h`;
  const hh = ms => { const h = Math.round(ms / 1800e3) / 2; return `${String(h).replace('.', lang === 'pl' ? ',' : '.')} h`; };
  const dayOf = (iso, d) => { const t = Date.parse(iso.slice(0, 10) + 'T12:00:00Z') + d * 864e5; return flDay(new Date(t).toISOString()); };
  return `<section class="fl-jet"><h3>😴 ${TL('Plan na zmianę czasu', 'Jet lag plan')}</h3>${model.map(m => {
    const steps = [];
    if (m.first) steps.push(['🛏️', `${dayOf(m.dep, -3)} – ${dayOf(m.dep, -1)}`, TL('Przed wylotem', 'Before you fly'),
      m.east ? TL('Kładź się i wstawaj o 1 h wcześniej każdego dnia. Rano wychodź na jasne światło, wieczorem przyciemnij ekrany.', 'Go to bed and get up 1 h earlier each day. Get bright light in the morning, dim screens in the evening.')
        : TL('Kładź się i wstawaj o 1 h później każdego dnia. Wieczorem bądź przy jasnym świetle.', 'Go to bed and get up 1 h later each day. Keep bright light in the evening.')]);
    m.flights.forEach(({ f, s }) => {
      const a = Date.parse(f.dep), b = Date.parse(f.arr);
      const there = `${TL('U celu', 'At the destination')}: ${flClock(flAt(a, m.to))} → ${flClock(flAt(b, m.to))}`;
      const what = s.kind === 'sleep' ? [TL('Śpij', 'Sleep'), s.from < 3600e3 && s.len - s.to < 3600e3 ? TL('Prawie cały lot, bo u celu jest noc.', 'Most of the flight: it is night at the destination.')
          : TL(`Od ok. ${hh(s.from)} po starcie przez ok. ${hh(s.asleep)}.`, `From about ${hh(s.from)} after take-off for about ${hh(s.asleep)}.`)]
        : s.kind === 'part' ? [TL('Prześpij część', 'Sleep part of it'), TL(`Ok. ${hh(s.asleep)}, od ok. ${hh(s.from)} po starcie. Resztę lotu nie śpij.`, `About ${hh(s.asleep)}, from about ${hh(s.from)} after take-off. Stay awake for the rest.`)]
        : [TL('Nie śpij', 'Stay awake'), TL('U celu jest dzień. Najwyżej krótka drzemka, do 30 min.', 'It is daytime at the destination. A short nap at most, up to 30 min.')];
      steps.push([s.kind === 'awake' ? '☀️' : '😴', `${esc(f.no)} · ${esc(f.from)} → ${esc(f.to)}`, what[0], `${what[1]} ${there}.`, s.kind]);
    });
    steps.push(['🌅', `${TL('Od', 'From')} ${flDay(m.arr)}`, TL(`Na miejscu: ${m.place}`, `On arrival: ${m.place}`),
      (m.east ? TL('Rano wychodź na światło dzienne, późnym wieczorem go unikaj. Pierwszego wieczoru kładź się o zwykłej porze miejscowej, nawet jeśli nie jesteś śpiący.', 'Get daylight in the morning, avoid it late in the evening. On the first evening go to bed at the usual local time, even if you are not sleepy.')
        : TL('Po południu i wieczorem bądź na świetle dziennym, rano przez pierwsze dni go unikaj. Nie kładź się przed ok. 21:00.', 'Get daylight in the afternoon and evening, avoid it in the morning for the first days. Do not go to bed before about 21:00.'))
      + ' ' + TL(`Organizm przestawi się w ok. ${m.days} dni.`, `Your body will adjust in about ${m.days} days.`)]);
    return `<div class="fl-jet-j"><div class="fl-jet-head"><b>${hrs(m.shift)}</b><span>${m.east ? TL('zegar do przodu', 'clock forward') : TL('zegar do tyłu', 'clock back')} · ${esc(m.place)}</span></div>
      <ol>${steps.map(s => `<li class="${s[4] || ''}"><i>${s[0]}</i><div><small>${s[1]}</small><b>${esc(s[2])}</b><span>${esc(s[3])}</span></div></li>`).join('')}</ol></div>`;
  }).join('')}<p class="fl-jet-src">${TL('Zasady', 'Rules')}: <a href="https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html" target="_blank" rel="noopener">CDC Yellow Book</a>, <a href="https://www.mayoclinic.org/diseases-conditions/jet-lag/diagnosis-treatment/drc-20374031" target="_blank" rel="noopener">Mayo Clinic</a>. ${TL('Noc u celu liczę jako 22:00–06:00.', 'Night at the destination is taken as 22:00–06:00.')}</p></section>`;
}

// --- reminders: the same list functions/main.py sends ---
// Entry forms by destination country; opens = hours before arrival
const FL_ENTRY = { PH: { name: 'eTravel', url: 'https://etravel.gov.ph', opens: 72 } };
function flReminders() {
  if (!flData) return [];
  const out = [], fl = flFlights().slice().sort((a, b) => Date.parse(a.dep) - Date.parse(b.dep));
  const starts = new Set(flJourneys(6).map(j => j[0]));
  fl.forEach((f, i) => {
    const dep = Date.parse(f.dep), off = flOff(f.dep), prev = fl[i - 1];
    const intl = !(flCc(f.from) && flCc(f.from) === flCc(f.to));
    const by = dep - (intl ? 3 : 2) * 3600e3, at = (t, o) => `${flClock(flAt(t, o))}`;
    if (starts.has(f)) {
      out.push({ key: 'day:' + f.no + f.dep, at: dep - 24 * 3600e3, until: dep, ic: '✈️',
        t: TL(`Jutro: ${f.no} ${f.from} → ${f.to} o ${flClock(f.dep)}`, `Tomorrow: ${f.no} ${f.from} → ${f.to} at ${flClock(f.dep)}`),
        b: [f.tFrom ? `Terminal ${f.tFrom.replace(/^T/, '')}` : '', TL('Sprawdź odprawę online', 'Check online check-in'), TL(`Na lotnisku bądź do ${at(by, off)}`, `Be at the airport by ${at(by, off)}`)].filter(Boolean).join(' · ') });
      // an hour before "be at the airport"; at night, the evening before instead
      let go = by - 3600e3, early = false;
      const h = new Date(go + off * 60000).getUTCHours();
      if (h < 6) { const d = new Date(go + off * 60000); d.setUTCHours(-3, 0, 0, 0); go = d.getTime() - off * 60000; early = true; }   // -3 h = 21:00 the day before
      out.push({ key: 'go:' + f.no + f.dep, at: go, until: dep, ic: '🧳',
        t: early ? TL(`Jutro wcześnie: na lotnisku do ${at(by, off)}`, `Early tomorrow: at the airport by ${at(by, off)}`) : TL('Czas jechać na lotnisko', 'Time to head to the airport'),
        b: TL(`${f.no} o ${flClock(f.dep)}${f.tFrom ? ' z T' + f.tFrom.replace(/^T/, '') : ''}. Bądź na lotnisku do ${at(by, off)} (${intl ? '3' : '2'} h przed lotem).`,
          `${f.no} at ${flClock(f.dep)}${f.tFrom ? ' from T' + f.tFrom.replace(/^T/, '') : ''}. Be at the airport by ${at(by, off)} (${intl ? '3' : '2'} h before).`) });
    } else if (prev && f.pnr && prev.pnr && f.pnr !== prev.pnr) {
      out.push({ key: 'sep:' + f.no + f.dep, at: Date.parse(prev.arr), until: dep, ic: '🔁',
        t: TL(`Osobny bilet: odbierz bagaż na ${f.no}`, `Separate ticket: collect your bag for ${f.no}`),
        b: TL(`${f.no} o ${flClock(f.dep)}${f.tFrom ? ' z T' + f.tFrom.replace(/^T/, '') : ''}. Nadaj bagaż od nowa i idź od razu do odprawy.`, `${f.no} at ${flClock(f.dep)}${f.tFrom ? ' from T' + f.tFrom.replace(/^T/, '') : ''}. Check your bag in again and go straight to check-in.`) });
    }
    if (f.bag && (f.bag.st === 'buy' || f.bag.st === 'no'))
      out.push({ key: 'bag:' + f.no + f.dep, at: dep - 72 * 3600e3, until: dep, ic: '🧳', quiet: true,
        t: TL(`Brak bagażu rejestrowanego: ${f.no}`, `No checked bag: ${f.no}`), b: f.bag.t || '' });
    const form = FL_ENTRY[flCc(f.to)];
    if (form && flCc(f.from) && flCc(f.from) !== flCc(f.to)) {
      const arr = Date.parse(f.arr);
      out.push({ key: 'entry:' + f.no + f.arr, at: arr - form.opens * 3600e3, until: arr, ic: '📝', quiet: true,
        t: TL(`${form.name}: możesz się już zarejestrować`, `${form.name}: registration is open`),
        b: TL(`Przylot ${flDay(f.arr)} o ${flClock(f.arr)} (${flApName(f.to)}). Tylko ${form.url.replace('https://', '')}, za darmo.`, `Arrival ${flDay(f.arr)} at ${flClock(f.arr)} (${flApName(f.to)}). Only ${form.url.replace('https://', '')}, free.`) });
    }
  });
  return out.sort((a, b) => a.at - b.at);
}
// Where you are at a given moment by the itinerary: the last place landed (or the first departure)
function flWhere(t) {
  const fl = flFlights().slice().sort((a, b) => Date.parse(a.dep) - Date.parse(b.dep));
  let w = fl.length ? { off: flOff(fl[0].dep), code: fl[0].from } : { off: -new Date().getTimezoneOffset(), code: '' };
  fl.forEach(f => { if (Date.parse(f.arr) <= t) w = { off: flOff(f.arr), code: f.to }; });
  return w;
}
function flRemHTML() {
  const now = Date.now(), list = flReminders().filter(r => r.until > now);
  if (!list.length) return '';
  return `<details class="fl-rem"><summary>🔔 ${TL('Przypomnienia', 'Reminders')} <span>${list.length}</span></summary>
    <p class="fl-rem-note">${TL('Przyjdą jako powiadomienia, jeśli masz je włączone na stronie głównej. Godziny według czasu miejsca, w którym wtedy będziesz.', 'They arrive as notifications when you have them on (Home). Times are local to where you will be.')}${list.some(r => r.quiet) ? ' ' + TL('Te z 🌙 czekają do rana, jeśli wypadną w nocy.', 'Those with 🌙 wait for the morning if they fall at night.') : ''}</p>
    <ul>${list.map(r => { const w = flWhere(r.at); return `<li><small>${esc(flDay(flAt(r.at, w.off)))} · ${flClock(flAt(r.at, w.off))} · ${esc(flApName(w.code))}${r.quiet ? ' 🌙' : ''}</small><b>${r.ic} ${esc(r.t)}</b><span>${esc(r.b)}</span></li>`; }).join('')}</ul></details>`;
}
