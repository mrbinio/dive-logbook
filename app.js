const T = {
  en: {
    logDive:'Log Dive', myDives:'My Dives', shop:'Shop',
    newEntry:'New', diveEntry:'Dive Entry',
    diveSite:'Dive Site', sitePh:'e.g. Blue Hole, Dahab',
    location:'Location / Country', locPh:'e.g. Egypt',
    date:'Date', diveType:'Dive Type',
    maxDepth:'Max Depth (m)', bottomTime:'Bottom Time (min)',
    waterTemp:'Water Temp (°C)', visibility:'Visibility (m)',
    buddy:'Buddy / Divemaster', buddyPh:'e.g. Anna, DM Marco',
    cert:'Certification / Agency', certPh:'e.g. PADI OW, SSI',
    rating:'Rating', notes:'Notes & Highlights',
    notesPh:'Marine life spotted, gear used, conditions, memorable moments...',
    logBtn:'▼ Log this dive', dives:'Dives', maxD:'Max Depth', time:'Bottom Time',
    searchPh:'🔍 Search site, location...', allTypes:'All Types',
    noResults:'No results', noDives:'No dives logged yet',
    trySearch:'Try a different search', logFirst:'Log your first dive!',
    shopTitle:'Mr.Binio — Shop', shopDesc:'Dive gear, courses, accessories — all in one place',
    goShop:'🛒 Go to shop justadive.pl',
    deleteDive:'🗑 Delete this log', confirmDelete:'Delete this dive log?',
    saved:'✅ Dive saved!', deleted:'🗑 Log deleted',
    enterSite:'⚠️ Enter dive site name', errorSave:'❌ Save error: ',
    errorDelete:'❌ Delete error: ',
    subtitle:'DIVE LOGBOOK',
    importBtn:'📥 Import Suunto',
    importSuccess:'✅ Suunto dive imported!',
    avgDepth:'Avg Depth', device:'Device', gpsMap:'GPS Map',
    gpsLabel:'GPS Location', gpsBtn:'📍', gpsGetting:'Getting location...'  },
  pl: {
    logDive:'Loguj', myDives:'Moje nurki', shop:'Sklep',
    newEntry:'Nowy', diveEntry:'Wpis nurkowy',
    diveSite:'Miejsce nurkowania', sitePh:'np. Blue Hole, Dahab',
    location:'Lokalizacja / Kraj', locPh:'np. Egipt',
    date:'Data', diveType:'Typ nurkowania',
    maxDepth:'Maks. głębokość (m)', bottomTime:'Czas dna (min)',
    waterTemp:'Temp. wody (°C)', visibility:'Widoczność (m)',
    buddy:'Buddy / Divemaster', buddyPh:'np. Anna, DM Marco',
    cert:'Certyfikat / Agencja', certPh:'np. PADI OW, SSI',
    rating:'Ocena', notes:'Notatki i wrażenia',
    notesPh:'Widziane życie morskie, sprzęt, warunki, niezapomniane momenty...',
    logBtn:'▼ Zapisz nurkowanie', dives:'Nurkowań', maxD:'Maks. głęb.', time:'Czas dna',
    searchPh:'🔍 Szukaj miejsca, lokalizacji...', allTypes:'Wszystkie typy',
    noResults:'Brak wyników', noDives:'Brak zapisanych nurkowań',
    trySearch:'Spróbuj innego wyszukiwania', logFirst:'Zaloguj swoje pierwsze nurkowanie!',
    shopTitle:'Mr.Binio — Sklep', shopDesc:'Sprzęt nurkowy, kursy, akcesoria — wszystko w jednym miejscu',
    goShop:'🛒 Przejdź do sklepu justadive.pl',
    deleteDive:'🗑 Usuń ten log', confirmDelete:'Usunąć ten log nurkowania?',
    saved:'✅ Nurkowanie zapisane!', deleted:'🗑 Log usunięty',
    enterSite:'⚠️ Podaj nazwę miejsca nurkowania', errorSave:'❌ Błąd zapisu: ',
    errorDelete:'❌ Błąd usuwania: ',
    subtitle:'DZIENNIK NURKOWY',
    importBtn:'📥 Import Suunto',
    importSuccess:'✅ Nurkowanie z Suunto zaimportowane!',
    avgDepth:'Śr. głęb.', device:'Urządzenie', gpsMap:'Mapa GPS',
    gpsLabel:'Lokalizacja GPS', gpsBtn:'📍', gpsGetting:'Pobieranie lokalizacji...'
  }
};

let lang = localStorage.getItem('aq_lang') || 'en';
function t(key) { return T[lang][key] || T.en[key] || key; }

function setLang(l) {
  lang = l;
  localStorage.setItem('aq_lang', l);
  applyLang();
}

function toggleLang() {
  setLang(lang === 'en' ? 'pl' : 'en');
}

function applyLang() {
  document.getElementById('lang-btn').textContent = lang === 'en' ? '🇵🇱 PL' : '🇬🇧 EN';
  document.getElementById('brand-sub').textContent = t('subtitle');
  // Tabs
  document.getElementById('tab-log').innerHTML = '📋 ' + t('logDive');
  document.getElementById('tab-history').innerHTML = '🌊 ' + t('myDives');
  document.getElementById('tab-shop').innerHTML = '🛒 ' + t('shop');
  // Form labels
  const labels = {
    'l-site':t('diveSite'),'l-loc':t('location'),'l-date':t('date'),
    'l-type':t('diveType'),'l-depth':t('maxDepth'),'l-dur':t('bottomTime'),
    'l-temp':t('waterTemp'),'l-vis':t('visibility'),
    'l-buddy':t('buddy'),'l-cert':t('cert'),'l-rating':t('rating'),'l-notes':t('notes')
  };
  for(const[id,txt] of Object.entries(labels)) {
    const el = document.getElementById(id);
    if(el) el.textContent = txt;
  }
  // Placeholders
  document.getElementById('f-site').placeholder = t('sitePh');
  document.getElementById('f-location').placeholder = t('locPh');
  document.getElementById('f-buddy').placeholder = t('buddyPh');
  document.getElementById('f-cert').placeholder = t('certPh');
  document.getElementById('f-notes').placeholder = t('notesPh');
  document.getElementById('search-input').placeholder = t('searchPh');
  // Buttons
  document.getElementById('btn-log').textContent = t('logBtn');
  document.getElementById('filter-type').options[0].text = t('allTypes');
  // Card title
  document.getElementById('card-title-text').innerHTML = '🧭 ' + t('newEntry') + ' <span class="accent">' + t('diveEntry') + '</span>';
  // Stats labels
  document.getElementById('sl-dives').textContent = t('dives');
  document.getElementById('sl-depth').textContent = t('maxD');
  document.getElementById('sl-time').textContent = t('time');
  // Shop
  document.getElementById('shop-title').textContent = t('shopTitle');
  document.getElementById('shop-desc').textContent = t('shopDesc');
  document.getElementById('shop-btn-text').textContent = t('goShop');
  document.getElementById('import-btn-text').textContent = t('importBtn');
  const gpsLabel = document.getElementById('l-gps');
  if(gpsLabel) gpsLabel.textContent = t('gpsLabel');
  // Re-render dives
  renderDives();
}

// Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAbO13N1ypFMUTPTA4T_ccCpPe7t6SzQQg",
  authDomain: "dive-logbook-c0b37.firebaseapp.com",
  projectId: "dive-logbook-c0b37",
  storageBucket: "dive-logbook-c0b37.firebasestorage.app",
  messagingSenderId: "416389167201",
  appId: "1:416389167201:web:2f2ad02160f2606d315220"
});
const db = firebase.firestore();
const divesCol = db.collection('dives');

let dives = [];
let currentRating = 0;

document.getElementById('f-date').valueAsDate = new Date();

divesCol.orderBy('createdAt','desc').onSnapshot(snap => {
  dives = snap.docs.map(doc => ({ id:doc.id, ...doc.data() }));
  dives.forEach((d,i) => d.num = dives.length - i);
  updateStats();
  if(document.getElementById('panel-history').classList.contains('active')) renderDives();
});

function updateStats() {
  document.getElementById('total-dives').textContent = dives.length;
  const maxD = dives.length ? Math.max(...dives.map(d=>d.depth||0)) : 0;
  document.getElementById('max-depth-stat').textContent = maxD + 'm';
  const totalMin = dives.reduce((a,d)=>a+(d.duration||0),0);
  document.getElementById('total-time-stat').textContent = totalMin>=60 ? (totalMin/60).toFixed(1)+'h' : totalMin+'m';
}

function updateDepthBar(val) {
  const pct = Math.min((val/60)*100,100);
  document.getElementById('depth-fill').style.width = pct+'%';
  document.getElementById('depth-val').textContent = (val||0)+' m';
}

function setRating(n) {
  currentRating = n;
  document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('active',i<n));
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t,i)=>{
    const tabs=['log','history','shop'];
    t.classList.toggle('active', tabs[i]===tab);
  });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(tab==='history') renderDives();
}

let formGps = null;
let formMap = null;

function getGPS() {
  if (!navigator.geolocation) { showToast('❌ GPS not supported'); return; }
  document.getElementById('f-gps').value = t('gpsGetting');
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = Math.round(pos.coords.latitude * 10000) / 10000;
    const lng = Math.round(pos.coords.longitude * 10000) / 10000;
    formGps = { lat, lng };
    document.getElementById('f-gps').value = lat + ', ' + lng;
    // Show mini map
    const mapEl = document.getElementById('f-gps-map');
    mapEl.style.display = 'block';
    if (formMap) formMap.remove();
    formMap = L.map(mapEl, { zoomControl: false, attributionControl: false }).setView([lat, lng], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(formMap);
    L.circleMarker([lat, lng], { radius: 8, color: '#2dd4bf', fillColor: '#2dd4bf', fillOpacity: 0.3, weight: 2 }).addTo(formMap);
    setTimeout(() => formMap.invalidateSize(), 100);
  }, () => {
    document.getElementById('f-gps').value = '';
    showToast('❌ ' + (lang==='pl' ? 'Nie udało się pobrać GPS' : 'Could not get GPS'));
  }, { enableHighAccuracy: true });
}

async function saveDive() {
  const site = document.getElementById('f-site').value.trim();
  if(!site){ showToast(t('enterSite')); return; }
  const dive = {
    site,
    location: document.getElementById('f-location').value.trim(),
    date: document.getElementById('f-date').value,
    type: document.getElementById('f-type').value,
    depth: parseFloat(document.getElementById('f-depth').value)||0,
    duration: parseInt(document.getElementById('f-duration').value)||0,
    temp: document.getElementById('f-temp').value,
    visibility: document.getElementById('f-visibility').value,
    buddy: document.getElementById('f-buddy').value.trim(),
    cert: document.getElementById('f-cert').value.trim(),
    rating: currentRating,
    notes: document.getElementById('f-notes').value.trim(),
    gps: formGps || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  try {
    await divesCol.add(dive);
    resetForm();
    showToast(t('saved'));
  } catch(e) { showToast(t('errorSave') + e.message); }
}

function resetForm() {
  ['f-site','f-location','f-depth','f-duration','f-temp','f-visibility','f-buddy','f-cert','f-notes'].forEach(id=>{
    document.getElementById(id).value='';
  });
  document.getElementById('f-date').valueAsDate = new Date();
  document.getElementById('f-type').value='Recreational';
  updateDepthBar(0); setRating(0); currentRating=0;
  formGps = null;
  document.getElementById('f-gps').value = '';
  document.getElementById('f-gps-map').style.display = 'none';
  if(formMap) { formMap.remove(); formMap = null; }
}

function renderDives() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const type = document.getElementById('filter-type').value;
  const grid = document.getElementById('dives-grid');
  let filtered = dives.filter(d=>{
    const mq = !q || d.site.toLowerCase().includes(q)||(d.location||'').toLowerCase().includes(q);
    const mt = !type || d.type===type;
    return mq && mt;
  });
  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state">
      <span class="empty-icon">🌊</span>
      <h3>${dives.length?t('noResults'):t('noDives')}</h3>
      <p>${dives.length?t('trySearch'):t('logFirst')}</p>
    </div>`;
    return;
  }
  grid.innerHTML = filtered.map(d=>`
    <div class="dive-card" onclick="openModal('${d.id}')">
      <div class="dive-num">#${d.num}</div>
      <div class="dive-info">
        <h3>${d.site||d.location||(d.source==='suunto'?'Suunto Dive':'Dive')}${d.location&&d.site?` <span style="color:var(--text-dim);font-weight:400">· ${d.location}</span>`:''}</h3>
        <div class="dive-meta">
          ${d.date?`<div class="chip">📅 <span>${formatDate(d.date)}</span></div>`:''}
          <div class="chip">🤿 <span>${d.type}</span></div>
          ${d.duration?`<div class="chip">⏱ <span>${d.duration} min</span></div>`:''}
          ${d.buddy?`<div class="chip">👤 <span>${d.buddy}</span></div>`:''}
        </div>
        ${d.rating?`<div style="margin-top:4px;font-size:0.75rem">${'⭐'.repeat(d.rating)}</div>`:''}
      </div>
      <div class="dive-depth-col">
        <div class="depth-big">${d.depth}</div>
        <div class="depth-unit">meters</div>
      </div>
    </div>
  `).join('');
}

function formatDate(s) {
  if(!s) return '';
  const d = new Date(s+'T00:00:00');
  const loc = lang==='pl'?'pl-PL':'en-GB';
  return d.toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'});
}

function openModal(id) {
  const d = dives.find(x=>x.id===id);
  if(!d) return;
  document.getElementById('m-num').textContent = 'DIVE #'+d.num;
  document.getElementById('m-site').textContent = (d.site||'Suunto Dive')+(d.location?` — ${d.location}`:'');
  document.getElementById('m-meta').innerHTML = `${d.date?`📅 ${formatDate(d.date)} &nbsp;·&nbsp; `:''}🤿 ${d.type}${d.rating?' &nbsp;'+'⭐'.repeat(d.rating):''}${d.device?' &nbsp;·&nbsp; ⌚ '+d.device:''}`;

  const stats=[
    {val:d.depth+'m',label:'Max Depth'},
    {val:(d.avgDepth?d.avgDepth+'m':'—'),label:t('avgDepth')},
    {val:d.duration+' min',label:'Bottom Time'},
    {val:d.temp?d.temp+'°C':'—',label:'Water Temp'},
    {val:d.visibility?d.visibility+'m':'—',label:'Visibility'},
    {val:d.buddy||'—',label:'Buddy'},
  ];
  document.getElementById('m-stats').innerHTML = stats.map(s=>`
    <div class="m-stat"><div class="m-stat-val">${s.val}</div><div class="m-stat-label">${s.label}</div></div>
  `).join('');

  // Depth profile + map
  let extraHTML = '';
  if(d.depthProfile && d.depthProfile.length > 2) {
    extraHTML += `<div class="modal-section-title">3D Dive View</div><div id="dive-3d" style="position:relative;"></div>`;
    extraHTML += `<div class="modal-section-title">Depth Profile</div><div id="dive-viz"></div>`;
  }
  if(d.gps && d.gps.lat && d.gps.lng) {
    extraHTML += `<div class="modal-section-title">${t('gpsMap')}</div>
      <div id="dive-map" style="height:180px;border-radius:8px;overflow:hidden;border:1px solid var(--border);"></div>`;
  }

  document.getElementById('m-notes-wrap').innerHTML =
    extraHTML +
    (d.notes ? `<div class="modal-section-title">Notes</div><div class="modal-notes">${d.notes}</div>` : '');

  document.getElementById('m-delete').textContent = t('deleteDive');
  document.getElementById('m-delete').onclick = ()=>deleteDive(id);

  // Attach Suunto button (only if no depth profile yet)
  const attachWrap = document.getElementById('m-attach-wrap');
  if (!d.depthProfile || d.depthProfile.length < 2) {
    attachWrap.innerHTML = `<label style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1px dashed var(--border-light);border-radius:8px;cursor:pointer;color:var(--accent);font-size:0.75rem;font-weight:700;margin-top:12px;transition:all 0.2s;">
      📥 ${lang==='pl'?'Dołącz dane Suunto':'Attach Suunto data'}
      <input type="file" accept=".json" style="display:none" onchange="attachSuuntoToDiv('${id}',this)">
    </label>`;
  } else {
    attachWrap.innerHTML = '';
  }

  document.getElementById('modal').classList.add('open');

  // Render viz after DOM - wait for modal to be fully visible
  if(d.depthProfile && d.depthProfile.length > 2) {
    setTimeout(()=>{
      try { render3DViz('dive-3d', d); } catch(e) { console.warn('3D error:', e); }
      try { renderDiveViz('dive-viz', d); } catch(e) { console.warn('Viz error:', e); }
    }, 300);
  }
  if(d.gps && d.gps.lat && d.gps.lng) {
    setTimeout(()=>{
      const map = L.map('dive-map',{zoomControl:false,attributionControl:false}).setView([d.gps.lat, d.gps.lng], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
      L.circleMarker([d.gps.lat, d.gps.lng],{radius:8,color:'#2dd4bf',fillColor:'#2dd4bf',fillOpacity:0.3,weight:2}).addTo(map);
      if(d.gpsTrack && d.gpsTrack.length > 1) {
        const coords = d.gpsTrack.map(p=>[p.lat,p.lng]);
        L.polyline(coords,{color:'#8b5cf6',weight:3,opacity:0.7}).addTo(map);
      }
      setTimeout(()=>map.invalidateSize(),100);
    }, 100);
  }
}

async function deleteDive(id) {
  if(!confirm(t('confirmDelete'))) return;
  try {
    await divesCol.doc(id).delete();
    closeModalDirect();
    showToast(t('deleted'));
  } catch(e) { showToast(t('errorDelete') + e.message); }
}

function closeModal(e){ if(e.target===document.getElementById('modal')) closeModalDirect(); }
function closeModalDirect(){ document.getElementById('modal').classList.remove('open'); }

function showToast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3000);
}

applyLang();
