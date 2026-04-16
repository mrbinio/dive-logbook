// Suunto JSON parser
function parseSuuntoJSON(json) {
  const dl = json.DeviceLog;
  const h = dl.Header;
  const samples = dl.Samples;

  // Basic info
  const dateTime = h.DateTime;
  const date = dateTime ? dateTime.substring(0,10) : '';
  const maxDepth = h.Depth?.Max || 0;
  const avgDepth = h.DepthAverage || 0;
  const diveTime = Math.round((h.DiveTime || 0) / 60); // seconds to minutes

  // Temperature (Kelvin to Celsius) - Min in Suunto is actually warmest for water
  const tempK = h.Temperature?.Min || h.Temperature?.Max;
  const tempC = tempK ? Math.round((tempK - 273.15) * 10) / 10 : null;

  // GPS from DiveRouteOrigin
  const routeSample = samples.find(s => s.DiveRouteOrigin);
  const gps = routeSample?.DiveRouteOrigin;
  const lat = gps?.Latitude || null;
  const lng = gps?.Longitude || null;

  // Depth profile - extract time + depth pairs
  const depthSamples = samples.filter(s => 'Depth' in s && s.Depth !== undefined);
  const startTime = depthSamples.length ? new Date(depthSamples[0].TimeISO8601).getTime() : 0;
  const depthProfile = depthSamples.map(s => ({
    time: Math.round((new Date(s.TimeISO8601).getTime() - startTime) / 1000),
    depth: Math.round(s.Depth * 100) / 100
  }));

  // Temperature profile (sample every ~10th to keep it manageable)
  const tempSamples = samples.filter(s => 'Temperature' in s && s.Temperature !== null);
  const tempProfile = [];
  const step = Math.max(1, Math.floor(tempSamples.length / 100));
  for (let i = 0; i < tempSamples.length; i += step) {
    const s = tempSamples[i];
    tempProfile.push({
      time: Math.round((new Date(s.TimeISO8601).getTime() - startTime) / 1000),
      temp: Math.round((s.Temperature - 273.15) * 10) / 10
    });
  }

  // Device info
  const device = dl.Device?.Name || 'Suunto';
  const sw = dl.Device?.Info?.SW || '';

  return {
    site: '', // user can fill in
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
    gps: (lat && lng) ? { lat, lng } : null,
    depthProfile,
    tempProfile
  };
}

// Handle file import
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

      // Save to Firebase
      const docRef = await divesCol.add(dive);
      showToast(t('importSuccess'));

      // Switch to history and open the dive
      switchTab('history');
      setTimeout(() => openModal(docRef.id), 500);
    } catch(err) {
      showToast('❌ ' + (lang==='pl' ? 'Błąd importu: ' : 'Import error: ') + err.message);
    }
    fileInput.value = '';
  };
  reader.readAsText(file);
}
