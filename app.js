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
    avgDepth:'Avg Depth', device:'Device', gpsMap:'GPS Map'
  },
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
    avgDepth:'Śr. głęb.', device:'Urządzenie', gpsMap:'Mapa GPS'
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
        <h3>${d.site}${d.location?` <span style="color:var(--text-dim);font-weight:400">· ${d.location}</span>`:''}</h3>
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

  // Depth profile chart
  let extraHTML = '';
  if(d.depthProfile && d.depthProfile.length > 2) {
    extraHTML += `<div class="modal-section-title">Depth Profile</div><canvas id="depth-chart" height="160" style="width:100%;background:var(--bg-input);border-radius:8px;"></canvas>`;
  }
  // GPS map
  if(d.gps && d.gps.lat && d.gps.lng) {
    const lat = d.gps.lat, lng = d.gps.lng;
    extraHTML += `<div class="modal-section-title">${t('gpsMap')}</div>
      <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="display:block;border-radius:8px;overflow:hidden;">
        <img src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=480x200&markers=color:red%7C${lat},${lng}&style=feature:all|element:geometry|color:0x0f1923&style=feature:water|color:0x142030&key=" 
          onerror="this.parentElement.innerHTML='<div style=\\'padding:14px;background:var(--bg-input);border-radius:8px;text-align:center;font-size:0.78rem;color:var(--text-dim)\\'>📍 <a href=\\'https://www.google.com/maps?q=${lat},${lng}\\' target=\\'_blank\\' style=\\'color:var(--accent)\\'>Open in Google Maps</a> (${lat.toFixed(4)}, ${lng.toFixed(4)})</div>'"
          style="width:100%;display:block;" alt="Dive location">
      </a>`;
  }

  document.getElementById('m-notes-wrap').innerHTML =
    extraHTML +
    (d.notes ? `<div class="modal-section-title">Notes</div><div class="modal-notes">${d.notes}</div>` : '');

  document.getElementById('m-delete').textContent = t('deleteDive');
  document.getElementById('m-delete').onclick = ()=>deleteDive(id);
  document.getElementById('modal').classList.add('open');

  // Draw depth chart after DOM update
  if(d.depthProfile && d.depthProfile.length > 2) {
    setTimeout(()=>drawDepthChart(d.depthProfile), 50);
  }
}

function drawDepthChart(profile) {
  const canvas = document.getElementById('depth-chart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = 320;
  ctx.scale(2,2);
  const W = rect.width, H = 160;
  const pad = {t:12,r:10,b:24,l:36};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;

  const maxD = Math.max(...profile.map(p=>p.depth));
  const maxT = profile[profile.length-1].time;

  // Grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.5;
  for(let i=0;i<=4;i++){
    const y = pad.t + (cH/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.font = '9px Inter,system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxD/4*i)+'m', pad.l-4, y+3);
  }
  // Time labels
  ctx.textAlign = 'center';
  for(let i=0;i<=4;i++){
    const x = pad.l + (cW/4)*i;
    ctx.fillText(Math.round(maxT/4*i/60)+'min', x, H-4);
  }

  // Depth line
  ctx.beginPath();
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  profile.forEach((p,i)=>{
    const x = pad.l + (p.time/maxT)*cW;
    const y = pad.t + (p.depth/maxD)*cH;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Fill
  const lastP = profile[profile.length-1];
  ctx.lineTo(pad.l + (lastP.time/maxT)*cW, pad.t);
  ctx.lineTo(pad.l, pad.t);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0,pad.t,0,H);
  grad.addColorStop(0,'rgba(45,212,191,0.01)');
  grad.addColorStop(1,'rgba(45,212,191,0.15)');
  ctx.fillStyle = grad;
  ctx.fill();
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
