// Dive calculations used by the app: start/end times, surface interval and
// no-fly time, SAC, depth-profile checks, duplicate detection for imports and
// a conditions lookup (Open-Meteo). Pure functions apart from fetchConditions.
window.DiveTools = (function () {
  const MIN = 60e3, HOUR = 60 * MIN;

  // Start time in ms. `estimated` when only the date is known (then the dive is
  // assumed to end at 23:59 that day, which errs on the safe side for flying).
  function startOf(d) {
    if (d.startTime) { const t = Date.parse(d.startTime); if (!isNaN(t)) return { t, estimated: false }; }
    if (d.date && d.time) { const t = Date.parse(d.date + 'T' + d.time); if (!isNaN(t)) return { t, estimated: false }; }
    if (d.date) { const t = Date.parse(d.date + 'T23:59'); if (!isNaN(t)) return { t: t - (d.duration || 0) * MIN, estimated: true }; }
    return null;
  }
  function endOf(d) {
    const s = startOf(d);
    return s ? { t: s.t + (d.duration || 0) * MIN, estimated: s.estimated } : null;
  }

  // Surface interval and no-fly time after the most recent dive.
  // Rules follow the DAN flying-after-diving guidelines: 12 h after a single
  // no-deco dive, 18 h after repetitive or multi-day diving, 24 h after a dive
  // that hit decompression (NDL 0). Guidance only, not medical advice.
  function surfaceStatus(dives, now = Date.now()) {
    const ends = dives.map(d => ({ d, e: endOf(d) })).filter(x => x.e).sort((a, b) => b.e.t - a.e.t);
    if (!ends.length) return null;
    const last = ends[0];
    const since = now - last.e.t;
    if (since < 0 || since > 48 * HOUR) return null;
    const recent = ends.filter(x => last.e.t - x.e.t < 30 * HOUR);
    const deco = recent.some(x => x.d.minNDL === 0);
    const hours = deco ? 24 : recent.length > 1 ? 18 : 12;
    const flyAt = last.e.t + hours * HOUR;
    return {
      dive: last.d, estimated: last.e.estimated, surfaceMs: since,
      ruleHours: hours, reason: deco ? 'deco' : recent.length > 1 ? 'repetitive' : 'single',
      flyAt, flyInMs: Math.max(0, flyAt - now)
    };
  }

  // Surface air consumption in L/min (needs tank size, start/end pressure, time).
  function sac(d) {
    const tk = d.tank || {};
    if (!(tk.size && tk.start && tk.end && d.duration && (d.avgDepth || d.depth))) return null;
    const avgD = d.avgDepth || d.depth * 0.6;
    const v = ((tk.start - tk.end) * tk.size) / ((avgD / 10) + 1) / d.duration;
    return v > 0 && v < 60 ? v : null;
  }
  // Average SAC of the last n dives that have it, plus the n before for a trend
  function sacTrend(dives, n = 10) {
    const vals = dives.map(sac).filter(v => v != null);
    if (!vals.length) return null;
    const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
    const cur = avg(vals.slice(0, n));
    const prev = vals.length > n ? avg(vals.slice(n, 2 * n)) : null;
    return { avg: cur, prev, count: Math.min(n, vals.length), series: vals.slice(0, 30).reverse() };
  }

  // Ascent rate (over ~30 s windows) and safety stop from a depth profile
  // [{time: s, depth: m}]. Limit 10 m/min, safety stop = 3+ min at 3–6 m.
  function analyzeProfile(profile, maxRate = 10) {
    if (!profile || profile.length < 5) return null;
    const p = profile.filter(x => x && isFinite(x.time) && isFinite(x.depth));
    let worst = { rate: 0, depth: 0, time: 0 }, fast = [];
    for (let i = 0, j = 0; i < p.length; i++) {
      while (j < p.length && p[j].time - p[i].time < 30) j++;
      if (j >= p.length) break;
      const dt = (p[j].time - p[i].time) / 60;
      const rate = (p[i].depth - p[j].depth) / dt;
      if (rate > worst.rate) worst = { rate, depth: p[i].depth, time: p[i].time };
      if (rate > maxRate) fast.push([p[i].time, p[j].time]);
    }
    // merge overlapping fast windows
    const segs = [];
    fast.forEach(([a, b]) => { const l = segs[segs.length - 1]; if (l && a <= l[1]) l[1] = Math.max(l[1], b); else segs.push([a, b]); });
    const maxD = Math.max(...p.map(x => x.depth));
    const iMax = p.findIndex(x => x.depth === maxD);
    let best = 0, run = 0, runStart = null, depthSum = 0, bestDepth = 0;
    for (let i = iMax + 1; i < p.length; i++) {
      if (p[i].depth >= 2.5 && p[i].depth <= 6.5) {
        if (runStart == null) { runStart = p[i - 1].time; depthSum = 0; run = 0; }
        run++; depthSum += p[i].depth;
        const dur = p[i].time - runStart;
        if (dur > best) { best = dur; bestDepth = depthSum / run; }
      } else runStart = null;
    }
    return {
      maxAscent: worst.rate, maxAscentDepth: worst.depth, fastSegments: segs, limit: maxRate,
      safetyStopSec: best, safetyStopDepth: bestDepth, safetyStopNeeded: maxD > 10
    };
  }

  // Imports: find the logbook entry that is the same dive (same date and start
  // within 20 min, or similar depth/time when start times are unknown).
  const deviceKey = s => (s || '').replace(/\s+v[\d.]+.*$/i, '').trim().toLowerCase();
  function findMatch(list, dive) {
    const b = startOf(dive);
    return list.find(d => {
      if (!d.date || d.date !== dive.date) return false;
      const a = startOf(d);
      if (a && b && !a.estimated && !b.estimated) return Math.abs(a.t - b.t) <= 20 * MIN;
      return Math.abs((d.depth || 0) - (dive.depth || 0)) <= 1.5 && Math.abs((d.duration || 0) - (dive.duration || 0)) <= 6;
    }) || null;
  }
  function sameComputer(existing, dive) {
    const k = deviceKey(dive.device);
    if (!k) return false;
    return deviceKey(existing.device) === k || (existing.computers || []).some(c => deviceKey(c.device) === k);
  }

  // Weather + sea conditions for a dive date and position (Open-Meteo, no key).
  const WCODE = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Snow', 80: 'Showers', 81: 'Heavy showers', 95: 'Thunderstorm' };
  async function fetchConditions(lat, lng, date) {
    const q = `latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}`;
    const daily = 'daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,weathercode&timezone=auto';
    const getJSON = url => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
    let w = await getJSON(`https://archive-api.open-meteo.com/v1/archive?${q}&${daily}`);
    if (!w || !w.daily || w.daily.temperature_2m_max?.[0] == null) w = await getJSON(`https://api.open-meteo.com/v1/forecast?${q}&${daily}`);
    const m = await getJSON(`https://marine-api.open-meteo.com/v1/marine?${q}&daily=wave_height_max&hourly=sea_surface_temperature&timezone=auto`);
    const out = {};
    if (w && w.daily && w.daily.temperature_2m_max?.[0] != null) {
      out.weather = {
        airTempMax: w.daily.temperature_2m_max[0], airTempMin: w.daily.temperature_2m_min?.[0],
        wind: w.daily.windspeed_10m_max?.[0], condition: WCODE[w.daily.weathercode?.[0]] || null
      };
    }
    if (m && m.daily && m.daily.wave_height_max?.[0] != null) out.waveMax = m.daily.wave_height_max[0];
    const sst = m && m.hourly && (m.hourly.sea_surface_temperature || []).filter(v => v != null);
    if (sst && sst.length) out.seaTemp = Math.round(sst.reduce((a, v) => a + v, 0) / sst.length * 10) / 10;
    return out;
  }

  return { startOf, endOf, surfaceStatus, sac, sacTrend, analyzeProfile, findMatch, sameComputer, deviceKey, fetchConditions };
})();
