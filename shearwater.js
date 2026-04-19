// Shearwater Cloud .db (SQLite) parser using sql.js
let sqlJsLoaded = null;

function loadSqlJs() {
  if (sqlJsLoaded) return sqlJsLoaded;
  sqlJsLoaded = new Promise((resolve, reject) => {
    if (window.initSqlJs) return window.initSqlJs({ locateFile: f => 'https://sql.js.org/dist/' + f }).then(resolve);
    const s = document.createElement('script');
    s.src = 'https://sql.js.org/dist/sql-wasm.js';
    s.onload = () => window.initSqlJs({ locateFile: f => 'https://sql.js.org/dist/' + f }).then(resolve);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return sqlJsLoaded;
}

async function parseShearwaterDB(arrayBuffer) {
  const SQL = await loadSqlJs();
  const db = new SQL.Database(new Uint8Array(arrayBuffer));

  const rows = db.exec(`
    SELECT 
      d.DiveId,
      d.DiveDate,
      REPLACE(d.Depth, ',', '.') as maxDepth,
      d.DiveLengthTime,
      d.Site,
      d.Location,
      d.Buddy,
      d.Notes,
      d.SerialNumber,
      d.GPS_StartLocation,
      l.calculated_values_from_samples
    FROM dive_details d
    LEFT JOIN log_data l ON d.DiveId = l.log_id
    WHERE d.DiveDate IS NOT NULL
    ORDER BY d.DiveDate ASC
  `);

  db.close();
  if (!rows.length || !rows[0].values.length) return [];

  const cols = rows[0].columns;
  return rows[0].values.map(row => {
    const r = {};
    cols.forEach((c, i) => r[c] = row[i]);

    const calc = r.calculated_values_from_samples ? JSON.parse(r.calculated_values_from_samples) : {};
    const depthVal = parseFloat(r.maxDepth) || 0;
    const durationSec = parseInt(r.DiveLengthTime) || 0;
    const date = r.DiveDate ? r.DiveDate.substring(0, 10) : '';
    const avgDepth = calc.AverageDepth ? Math.round(calc.AverageDepth * 100) / 100 : 0;
    const minTemp = calc.MinTemp || null;
    const minNDL = calc.MinNDL != null && calc.MinNDL < 999 ? Math.round(calc.MinNDL) : null;

    let gps = null;
    if (r.GPS_StartLocation) {
      try {
        const g = JSON.parse(r.GPS_StartLocation);
        if (g.lat && g.lng) gps = { lat: g.lat, lng: g.lng };
      } catch(e) {}
    }

    return {
      site: r.Site || '',
      location: r.Location || '',
      date,
      type: 'Recreational',
      depth: Math.round(depthVal * 100) / 100,
      avgDepth,
      duration: Math.round(durationSec / 60),
      temp: minTemp,
      visibility: '',
      buddy: r.Buddy || '',
      cert: '',
      rating: 0,
      notes: r.Notes || '',
      source: 'shearwater',
      device: 'Shearwater' + (r.SerialNumber ? ' ' + r.SerialNumber : ''),
      safetyStop: false,
      minNDL,
      gps,
      gpsTrack: null,
      depthProfile: [],
      tempProfile: []
    };
  });
}
