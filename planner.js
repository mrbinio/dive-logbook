// Dive planner: "how long can I stay?" from just a tank and a gas.
// For every depth: the no-deco limit (air table via EAD for nitrox) and the gas limit
// (bottom gas + ascent at 9 m/min + 3 min stop at 5 m, keeping a reserve), whichever
// comes first. SAC comes from the logbook when it has tank data. Pick a depth (or a
// site from the trip plan) for details; warnings only appear once you type a time.
const NDL_TABLE = { 10: 219, 12: 147, 14: 98, 16: 72, 18: 56, 20: 45, 22: 37, 24: 29, 25: 27, 26: 25, 28: 22, 30: 20, 32: 16, 34: 14, 35: 13, 36: 12, 38: 10, 40: 9, 42: 8 };
const PLAN_DEPTHS = [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 40];
const TANKS = [['al80', 'AL80', 11.1], ['10', '10 L', 10], ['12', '12 L', 12], ['15', '15 L', 15], ['d12', '2×12 L', 24]];
const GASES = [[21, 'Powietrze', 'Air'], [32, 'EAN32'], [36, 'EAN36']];
const PLAN_DEFAULT = { tank: 12, start: 200, o2: 21, reserve: 'bar', sac: null, ppo2: 1.4, depth: null, time: null };
const DEFAULT_SAC = 18;   // without logbook data: a careful guess for a relaxed recreational diver

let planner = Object.assign({}, PLAN_DEFAULT);
let plannerMoreOpen = false;
try { Object.assign(planner, JSON.parse(localStorage.getItem('planner') || '{}'), { depth: null, time: null }); } catch (e) {}
function savePlanner() { try { const { depth, time, ...keep } = planner; localStorage.setItem('planner', JSON.stringify(keep)); } catch (e) {} }

const fmt1 = n => (Math.round(n * 10) / 10).toString().replace('.', lang === 'pl' ? ',' : '.');
const pAbs = d => d / 10 + 1;
const gasName = o2 => o2 === 21 ? TL('Powietrze', 'Air') : 'EAN' + o2;

// Conservative: an EAD between table rows uses the deeper row
function getNDL(depth, fO2) {
  const ead = (1 - fO2) / 0.79 * (depth + 10) - 10;
  if (ead < 10) return Infinity;
  const row = Object.keys(NDL_TABLE).map(Number).sort((a, b) => a - b).find(d => d >= ead - 1e-9);
  return row == null ? 0 : NDL_TABLE[row];
}
function myPlannerSac() {
  const tr = typeof DiveTools !== 'undefined' && typeof dives !== 'undefined' ? DiveTools.sacTrend(dives) : null;
  return tr ? { value: Math.round(tr.avg * 10) / 10, count: tr.count } : null;
}
function plannerSac() { return planner.sac || (myPlannerSac() || {}).value || DEFAULT_SAC; }
function reserveBar() { return planner.reserve === 'third' ? Math.round(planner.start / 3) : 50; }
function ascentLitres(d, sac) {
  const up = sac * pAbs(d / 2) * (d / 9);
  return up + (d > 6 ? sac * pAbs(5) * 3 : 0);
}
function limitsAt(d) {
  const sac = plannerSac(), fO2 = planner.o2 / 100;
  const mod = Math.floor((planner.ppo2 / fO2 - 1) * 10);
  const usable = (planner.start - reserveBar()) * planner.tank;
  const gas = Math.max(0, Math.floor((usable - ascentLitres(d, sac)) / (sac * pAbs(d))));
  const ndl = getNDL(d, fO2);
  return { d, mod, ndl, gas, max: Math.min(ndl, gas), by: ndl <= gas ? 'ndl' : 'gas', tooDeep: d > mod };
}
const bestMix = d => Math.max(21, Math.min(40, Math.floor(planner.ppo2 / pAbs(d) * 100)));

function calcPlan() {
  const el = document.getElementById('plan-body');
  if (!el) return;
  const my = myPlannerSac();
  const tankKey = (TANKS.find(t => t[2] === planner.tank) || [])[0];
  const chip = (on, label, click) => `<button class="chip-btn${on ? ' on' : ''}" onclick="${click}">${label}</button>`;
  const sites = ((typeof currentTrip !== 'undefined' && currentTrip && currentTrip.plan) || []).filter(p => +p.depth > 0);
  el.innerHTML = `
    <div class="pl-sec">${TL('Butla', 'Tank')}</div>
    <div class="chip-row">${TANKS.map(t => chip(tankKey === t[0], t[1], `setPlanner('tank', ${t[2]})`)).join('')}</div>
    <div class="pl-sec">${TL('Gaz', 'Gas')}</div>
    <div class="chip-row">${GASES.map(g => chip(planner.o2 === g[0], g.length > 2 ? TL(g[1], g[2]) : g[1], `setPlanner('o2', ${g[0]})`)).join('')}</div>
    <details class="pl-more"${plannerMoreOpen ? ' open' : ''} ontoggle="plannerMoreOpen = this.open">
      <summary>⚙️ ${TL('Więcej ustawień', 'More settings')} <span>${planner.start} bar · SAC ${fmt1(plannerSac())} · ${planner.reserve === 'third' ? TL('zasada ⅓', 'rule of ⅓') : TL('rezerwa 50 bar', '50 bar reserve')}</span></summary>
      <div class="pl-grid">
        <label><span>${TL('Inna butla', 'Other tank')}</span><span class="pl-unit"><input type="number" class="edit-input" step="0.1" min="1" max="40" value="${planner.tank}" oninput="setPlanner('tank', +this.value, true)"> L</span></label>
        <label><span>${TL('Inny nitrox', 'Other nitrox')}</span><span class="pl-unit"><input type="number" class="edit-input" min="21" max="40" value="${planner.o2}" oninput="setPlanner('o2', +this.value, true)"> % O₂</span></label>
        <label><span>${TL('Ciśnienie startowe', 'Start pressure')}</span><span class="pl-unit"><input type="number" class="edit-input" min="50" max="300" value="${planner.start}" oninput="setPlanner('start', +this.value, true)"> bar</span></label>
        <label><span>SAC ${my && !planner.sac ? `· ${TL('z logbooka', 'from logbook')}` : ''}</span><span class="pl-unit"><input type="number" class="edit-input" step="0.5" min="5" max="40" value="${planner.sac || ''}" placeholder="${fmt1(my ? my.value : DEFAULT_SAC)}" oninput="setPlanner('sac', +this.value || null, true)"> L/min</span></label>
      </div>
      <p class="pl-note">${my ? TL(`Twój SAC z ${my.count} ostatnich nurkowań: <b>${fmt1(my.value)} L/min</b>. Możesz wpisać inny.`, `Your SAC from the last ${my.count} dives: <b>${fmt1(my.value)} L/min</b>. You can type another.`)
        : TL(`Brak danych z butli w logbooku — przyjmuję ${DEFAULT_SAC} L/min. Wpisuj ciśnienie początkowe i końcowe, a policzę Twój SAC.`, `No tank data in the logbook — using ${DEFAULT_SAC} L/min. Log start and end pressure and I'll work out your own SAC.`)}</p>
      <div class="pl-sec">${TL('Rezerwa', 'Reserve')}</div>
      <div class="chip-row">${chip(planner.reserve === 'bar', TL('50 bar na powierzchnię', '50 bar at the surface'), "setPlanner('reserve', 'bar')")}
        ${chip(planner.reserve === 'third', TL('Zasada ⅓ (wraki, wnętrza)', 'Rule of thirds (wrecks, overhead)'), "setPlanner('reserve', 'third')")}</div>
    </details>
    ${sites.length ? `<div class="pl-sec">${TL('Z planu wyjazdu', 'From your trip plan')}</div>
      <div class="chip-row">${sites.map(p => chip(planner.depth === +p.depth, `${esc(p.name)} <small>${+p.depth} m</small>`, `setPlanner('depth', ${+p.depth})`)).join('')}</div>` : ''}
    <div id="pl-results"></div>`;
  renderPlanResults();
}

function setPlanner(key, val, keepForm) {
  if (key === 'depth' && planner.depth === val) val = null;   // tap again to close
  planner[key] = val;
  if (key === 'depth') planner.time = null;
  savePlanner();
  if (keepForm) renderPlanResults(); else calcPlan();
  if (key === 'depth' && val) setTimeout(() => document.getElementById('pl-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

function renderPlanResults() {
  const el = document.getElementById('pl-results');
  if (!el) return;
  if (!(planner.tank > 0 && planner.start > 0 && planner.o2 >= 21 && planner.o2 <= 100)) { el.innerHTML = ''; return; }
  const rows = PLAN_DEPTHS.map(limitsAt);
  const cap = 60;
  el.innerHTML = `
    <div class="pl-head"><b>${TL('Ile mogę?', 'How long can I stay?')}</b>
      <span>${fmt1(planner.tank)} L · ${planner.start} bar · ${gasName(planner.o2)} · SAC ${fmt1(plannerSac())}</span></div>
    <div class="pl-legend"><i class="ndl"></i>${TL('limit bezdekompresyjny', 'no-deco limit')} <i class="gas"></i>${TL('gaz', 'gas')}</div>
    <div class="pl-bars">${rows.map(r => r.tooDeep
      ? `<div class="pl-row off"><span class="pl-d">${r.d} m</span><span class="pl-off">${TL(`za głęboko dla ${gasName(planner.o2)} (MOD ${r.mod} m)`, `too deep for ${gasName(planner.o2)} (MOD ${r.mod} m)`)}</span></div>`
      : `<button class="pl-row${planner.depth === r.d ? ' sel' : ''}" onclick="setPlanner('depth', ${r.d})">
          <span class="pl-d">${r.d} m</span>
          <span class="pl-track"><i class="${r.by}" style="width:${Math.max(3, Math.min(r.max, cap) / cap * 100)}%"></i></span>
          <span class="pl-t"><b>${r.max === Infinity ? '—' : r.max >= 100 ? '99+' : r.max}</b> min</span>
        </button>`).join('')}</div>
    <p class="pl-note">${TL('Dotknij głębokości, żeby zobaczyć szczegóły. Czas = do rozpoczęcia wynurzania.', 'Tap a depth for details. Time = until you start the ascent.')}</p>
    ${planner.depth ? planDetail(limitsAt(planner.depth)) : ''}
    <p class="pl-foot">⚠️ ${TL('Tylko do planowania. Zawsze słuchaj komputera nurkowego i swojego szkolenia. Limity z tabeli powietrza (nitrox przez EAD).',
      'For planning only. Always follow your dive computer and training. Limits from an air table (nitrox via EAD).')}</p>`;
}

function planDetail(r) {
  const sac = plannerSac(), d = r.d, fO2 = planner.o2 / 100;
  const ppo2 = Math.round(fO2 * pAbs(d) * 100) / 100;
  const ead = Math.max(0, Math.round((1 - fO2) / 0.79 * (d + 10) - 10));
  const ascBar = Math.ceil(ascentLitres(d, sac) / planner.tank);
  const turn = planner.reserve === 'third' ? planner.start - Math.round(planner.start / 3) : null;
  const mix = bestMix(d);
  const mixNdl = getNDL(d, mix / 100);
  const facts = [
    [r.max === Infinity ? '—' : r.max + ' min', TL('maks. czas na dnie', 'max bottom time')],
    [r.ndl === Infinity ? '200+' : r.ndl + ' min', 'NDL'],
    [r.gas + ' min', TL('starczy gazu', 'gas lasts')],
    [ppo2.toFixed(2).replace('.', lang === 'pl' ? ',' : '.'), 'ppO₂'],
    [r.mod + ' m', 'MOD'],
    [ead + ' m', 'EAD'],
  ];
  const tips = [];
  if (r.tooDeep) tips.push(`<p class="pl-warn">⚠️ ${TL(`${d} m to więcej niż MOD ${r.mod} m dla ${gasName(planner.o2)} przy ppO₂ ${planner.ppo2}.`, `${d} m is deeper than the MOD of ${r.mod} m for ${gasName(planner.o2)} at ppO₂ ${planner.ppo2}.`)}</p>`);
  else tips.push(r.by === 'ndl'
    ? `<p>⏱ ${TL('Tu ogranicza Cię <b>azot</b>, nie gaz — zostanie Ci powietrza.', 'Here <b>nitrogen</b> limits you, not gas — you will have air left.')}</p>`
    : `<p>🫁 ${TL('Tu ogranicza Cię <b>gaz</b> — pilnuj manometru.', 'Here <b>gas</b> limits you — watch your gauge.')}</p>`);
  if (mix > planner.o2 && mixNdl > r.ndl) tips.push(`<p>💡 ${TL(`Najlepszy nitrox na ${d} m: <b>EAN${mix}</b> — NDL ${r.ndl === Infinity ? '200+' : r.ndl} → ${mixNdl === Infinity ? '200+' : mixNdl} min.`, `Best nitrox for ${d} m: <b>EAN${mix}</b> — NDL ${r.ndl} → ${mixNdl} min.`)}</p>`);
  tips.push(`<p>⬆️ ${TL(`Wynurzenie (9 m/min) i przystanek 3 min na 5 m zużyją ok. <b>${ascBar} bar</b>.`, `Ascent (9 m/min) and a 3 min stop at 5 m use about <b>${ascBar} bar</b>.`)}
    ${turn ? TL(` Zawracaj przy <b>${turn} bar</b>.`, ` Turn the dive at <b>${turn} bar</b>.`) : TL(` Zacznij wynurzanie najpóźniej przy <b>${reserveBar() + ascBar} bar</b>.`, ` Start up by <b>${reserveBar() + ascBar} bar</b> at the latest.`)}</p>`);
  return `<div class="pl-detail" id="pl-detail">
    <div class="pl-head"><b>${d} m · ${gasName(planner.o2)}</b><button class="rem-del" onclick="setPlanner('depth', ${d})" aria-label="Close">✕</button></div>
    <div class="pl-facts">${facts.map(f => `<div><b>${f[0]}</b><small>${f[1]}</small></div>`).join('')}</div>
    ${tips.join('')}
    <label class="pl-time"><span>${TL('Mój plan: czas na dnie', 'My plan: bottom time')}</span>
      <span class="pl-unit"><input type="number" class="edit-input" min="1" max="200" value="${planner.time || ''}" placeholder="${r.max === Infinity ? '' : r.max}" oninput="planner.time = +this.value || null; renderPlanTime()"> min</span></label>
    <div id="pl-time-out">${planTimeHTML(r)}</div>
  </div>`;
}
function renderPlanTime() { const el = document.getElementById('pl-time-out'); if (el && planner.depth) el.innerHTML = planTimeHTML(limitsAt(planner.depth)); }
function planTimeHTML(r) {
  const t = planner.time;
  if (!t) return '';
  const sac = plannerSac();
  const used = sac * pAbs(r.d) * t + ascentLitres(r.d, sac);
  const end = Math.round(planner.start - used / planner.tank);
  const out = [`<p>${TL(`Wyjdziesz z ok. <b>${end} bar</b> (zużyjesz ${Math.round(used)} L gazu).`, `You surface with about <b>${end} bar</b> (${Math.round(used)} L of gas).`)}</p>`];
  if (t > r.ndl) out.push(`<p class="pl-warn">⚠️ ${TL(`${t} min to więcej niż NDL ${r.ndl} min na ${r.d} m — wymagana dekompresja.`, `${t} min is over the NDL of ${r.ndl} min at ${r.d} m — deco required.`)}</p>`);
  if (end < reserveBar()) out.push(`<p class="pl-warn">⚠️ ${TL(`To poniżej rezerwy ${reserveBar()} bar.`, `That is below your ${reserveBar()} bar reserve.`)}</p>`);
  if (t <= r.ndl && end >= reserveBar()) out.push(`<p class="pl-ok">✓ ${TL('Plan mieści się w limitach.', 'The plan is within limits.')}</p>`);
  return out.join('');
}
