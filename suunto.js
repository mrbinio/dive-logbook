// Suunto JSON parser
function parseSuuntoJSON(json) {
  const dl = json.DeviceLog;
  const h = dl.Header;
  const samples = dl.Samples;

  const dateTime = h.DateTime;
  const date = dateTime ? dateTime.substring(0,10) : '';
  const maxDepth = h.Depth?.Max || 0;
  const avgDepth = h.DepthAverage || 0;
  const diveTime = Math.round((h.DiveTime || 0) / 60);

  const tempK = h.Temperature?.Min || h.Temperature?.Max;
  const tempC = tempK ? Math.round((tempK - 273.15) * 10) / 10 : null;

  // GPS - Route Origin has real coords, inline GPS is in radians
  const routeSample = samples.find(s => s.DiveRouteOrigin);
  const gps = routeSample?.DiveRouteOrigin;
  const originLat = gps?.Latitude || null;
  const originLng = gps?.Longitude || null;

  // GPS track points (in radians, convert to degrees)
  const rad2deg = r => r * (180 / Math.PI);
  const gpsSamples = samples.filter(s => 'Latitude' in s && s.Latitude !== undefined);
  const startTime = samples.find(s => 'Depth' in s)?.TimeISO8601;
  const t0 = startTime ? new Date(startTime).getTime() : 0;

  const gpsTrack = gpsSamples.map(s => ({
    lat: rad2deg(s.Latitude),
    lng: rad2deg(s.Longitude),
    alt: s.GPSAltitude || 0,
    time: Math.round((new Date(s.TimeISO8601).getTime() - t0) / 1000)
  }));

  // Depth profile
  const depthSamples = samples.filter(s => 'Depth' in s && s.Depth !== undefined);
  const depthStart = depthSamples.length ? new Date(depthSamples[0].TimeISO8601).getTime() : 0;
  const depthProfile = depthSamples.map(s => ({
    time: Math.round((new Date(s.TimeISO8601).getTime() - depthStart) / 1000),
    depth: Math.round(s.Depth * 100) / 100
  }));

  // Temperature profile (downsample to ~100 points)
  const tempSamples = samples.filter(s => 'Temperature' in s && s.Temperature !== null);
  const tempProfile = [];
  const step = Math.max(1, Math.floor(tempSamples.length / 100));
  for (let i = 0; i < tempSamples.length; i += step) {
    const s = tempSamples[i];
    tempProfile.push({
      time: Math.round((new Date(s.TimeISO8601).getTime() - depthStart) / 1000),
      temp: Math.round((s.Temperature - 273.15) * 10) / 10
    });
  }

  const device = dl.Device?.Name || 'Suunto';
  const sw = dl.Device?.Info?.SW || '';

  return {
    site: '',
    location: '',
    date,
    type: 'Recreational',
    depth: Math.round(maxDepth * 100) / 100,
    avgDepth: Math.round(avgDepth * 100) / 100,
    duration: diveTime,
    temp: tempC,
    visibility: '',
    buddy: '',
    cert: '',
    rating: 0,
    notes: '',
    source: 'suunto',
    device: device + (sw ? ' v' + sw : ''),
    gps: (originLat && originLng) ? { lat: originLat, lng: originLng } : null,
    gpsTrack: gpsTrack.length ? gpsTrack : null,
    depthProfile,
    tempProfile
  };
}

function handleSuuntoImport(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.DeviceLog) {
        showToast('❌ ' + (lang==='pl' ? 'To nie jest plik Suunto' : 'Not a Suunto file'));
        return;
      }
      const dive = parseSuuntoJSON(json);
      dive.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await divesCol.add(dive);
      showToast(t('importSuccess'));

      // Auto-fill site name from GPS reverse geocoding
      if (dive.gps && dive.gps.lat && dive.gps.lng) {
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${dive.gps.lat}&lon=${dive.gps.lng}&format=json&zoom=14`);
          const geo = await resp.json();
          if (geo && geo.address) {
            const a = geo.address;
            const site = a.beach || a.bay || a.water || a.natural || a.tourism || a.leisure || a.village || a.town || a.city || '';
            const location = a.state ? (a.state + ', ' + (a.country || '')) : (a.country || '');
            if (site || location) {
              await divesCol.doc(docRef.id).update({
                site: site || (lang==='pl' ? 'Nurkowanie' : 'Dive'),
                location: location
              });
            }
          }
        } catch(e) { /* geocoding failed, user can edit later */ }
      }

      // If still no site name, prompt
      const updatedDoc = await divesCol.doc(docRef.id).get();
      if (!updatedDoc.data().site) {
        const siteName = prompt(lang==='pl' ? 'Podaj nazwę miejsca nurkowania:' : 'Enter dive site name:', '');
        if (siteName) await divesCol.doc(docRef.id).update({ site: siteName.trim() });
      }

      switchTab('history');
      setTimeout(() => openModal(docRef.id), 500);
    } catch(err) {
      showToast('❌ ' + (lang==='pl' ? 'Błąd importu: ' : 'Import error: ') + err.message);
    }
    fileInput.value = '';
  };
  reader.readAsText(file);
}

// Interactive depth profile visualization
function renderDiveViz(containerId, dive) {
  const el = document.getElementById(containerId);
  if (!el || !dive.depthProfile || dive.depthProfile.length < 3) return;

  const profile = dive.depthProfile;
  const maxD = Math.max(...profile.map(p => p.depth));
  const maxT = profile[profile.length - 1].time;

  el.innerHTML = `
    <div style="position:relative;touch-action:none;user-select:none;" id="viz-wrap">
      <canvas id="viz-canvas" style="width:100%;height:200px;display:block;border-radius:8px;"></canvas>
      <div id="viz-tooltip" style="display:none;position:absolute;top:8px;left:50%;transform:translateX(-50%);
        background:rgba(8,13,19,0.92);border:1px solid var(--border-light);border-radius:8px;padding:8px 14px;
        pointer-events:none;z-index:10;text-align:center;backdrop-filter:blur(8px);">
        <div id="vt-depth" style="font-size:1.3rem;font-weight:800;color:var(--accent);line-height:1;"></div>
        <div id="vt-time" style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;letter-spacing:1px;"></div>
        ${dive.tempProfile?.length ? '<div id="vt-temp" style="font-size:0.65rem;color:var(--text-dim);margin-top:1px;"></div>' : ''}
      </div>
      <div id="viz-line" style="display:none;position:absolute;top:0;bottom:0;width:1px;background:var(--accent);opacity:0.5;pointer-events:none;"></div>
      <div id="viz-dot" style="display:none;position:absolute;width:10px;height:10px;border-radius:50%;background:var(--accent);
        box-shadow:0 0 12px rgba(45,212,191,0.5);pointer-events:none;transform:translate(-50%,-50%);"></div>
    </div>
  `;

  const canvas = document.getElementById('viz-canvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('viz-wrap');

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pad = { t: 8, r: 6, b: 20, l: 32 };
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;

    // Background
    ctx.fillStyle = '#0b1119';
    ctx.fillRect(0, 0, W, H);

    // Depth zones (subtle)
    const zones = [
      { d: 10, color: 'rgba(45,212,191,0.03)' },
      { d: 20, color: 'rgba(45,212,191,0.05)' },
      { d: 40, color: 'rgba(139,92,246,0.05)' }
    ];
    zones.forEach(z => {
      if (maxD > z.d * 0.5) {
        const y = pad.t + (Math.min(z.d, maxD) / maxD) * cH;
        ctx.fillStyle = z.color;
        ctx.fillRect(pad.l, pad.t, cW, y - pad.t);
      }
    });

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    ctx.font = '9px Inter,system-ui';
    ctx.fillStyle = '#334155';
    const depthSteps = maxD <= 15 ? 5 : maxD <= 30 ? 10 : 20;
    for (let d = 0; d <= maxD; d += depthSteps) {
      const y = pad.t + (d / maxD) * cH;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(d + 'm', pad.l - 3, y + 3);
    }
    // Time labels
    ctx.textAlign = 'center';
    const timeSteps = maxT <= 600 ? 120 : maxT <= 1800 ? 300 : 600;
    for (let t = 0; t <= maxT; t += timeSteps) {
      const x = pad.l + (t / maxT) * cW;
      const min = Math.floor(t / 60);
      ctx.fillText(min + 'min', x, H - 4);
    }

    // Depth fill gradient
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    profile.forEach(p => {
      ctx.lineTo(pad.l + (p.time / maxT) * cW, pad.t + (p.depth / maxD) * cH);
    });
    ctx.lineTo(pad.l + (profile[profile.length - 1].time / maxT) * cW, pad.t);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
    grad.addColorStop(0, 'rgba(45,212,191,0.02)');
    grad.addColorStop(0.5, 'rgba(45,212,191,0.08)');
    grad.addColorStop(1, 'rgba(139,92,246,0.12)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Depth line
    ctx.beginPath();
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    profile.forEach((p, i) => {
      const x = pad.l + (p.time / maxT) * cW;
      const y = pad.t + (p.depth / maxD) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    return { W, H, pad, cW, cH };
  }

  const dims = draw();

  // Interactive touch/mouse
  function handleInteraction(clientX) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const { pad, cW, cH } = dims;
    const ratio = Math.max(0, Math.min(1, (x - pad.l) / cW));
    const timeAt = ratio * maxT;

    // Find closest sample
    let closest = profile[0];
    let minDiff = Infinity;
    for (const p of profile) {
      const diff = Math.abs(p.time - timeAt);
      if (diff < minDiff) { minDiff = diff; closest = p; }
    }

    const px = pad.l + (closest.time / maxT) * cW;
    const py = pad.t + (closest.depth / maxD) * cH;

    document.getElementById('viz-tooltip').style.display = 'block';
    document.getElementById('viz-line').style.display = 'block';
    document.getElementById('viz-line').style.left = px + 'px';
    document.getElementById('viz-dot').style.display = 'block';
    document.getElementById('viz-dot').style.left = px + 'px';
    document.getElementById('viz-dot').style.top = py + 'px';

    const min = Math.floor(closest.time / 60);
    const sec = Math.floor(closest.time % 60);
    document.getElementById('vt-depth').textContent = closest.depth.toFixed(1) + ' m';
    document.getElementById('vt-time').textContent = min + ':' + String(sec).padStart(2, '0');

    // Find temp at this time
    if (dive.tempProfile?.length) {
      const tempEl = document.getElementById('vt-temp');
      if (tempEl) {
        let ct = dive.tempProfile[0];
        for (const tp of dive.tempProfile) {
          if (Math.abs(tp.time - closest.time) < Math.abs(ct.time - closest.time)) ct = tp;
        }
        tempEl.textContent = '🌡 ' + ct.temp + '°C';
      }
    }
  }

  function hideTooltip() {
    document.getElementById('viz-tooltip').style.display = 'none';
    document.getElementById('viz-line').style.display = 'none';
    document.getElementById('viz-dot').style.display = 'none';
  }

  let touchStartX = 0, touchStartY = 0, isHorizontal = null;

  canvas.addEventListener('mousemove', e => handleInteraction(e.clientX));
  canvas.addEventListener('mouseleave', hideTooltip);

  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isHorizontal = null;
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (isHorizontal === null && (dx > 5 || dy > 5)) {
      isHorizontal = dx > dy;
    }
    if (isHorizontal) {
      e.preventDefault();
      handleInteraction(e.touches[0].clientX);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => { isHorizontal = null; hideTooltip(); });
}
