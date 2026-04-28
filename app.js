const T = {
  en: {
    logDive:'Log Dive', myDives:'My Dives', shop:'Shop', checklist:'Checklist',
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
    importBtn:'📥 Import Suunto / Shearwater',
    importSuccess:'✅ Dive imported!',
    avgDepth:'Avg Depth', device:'Device', gpsMap:'GPS Map',
    gpsLabel:'GPS Location', gpsBtn:'📍', gpsGetting:'Getting location...', googleBtn:'Sign in with Google',
    emailSignIn:'Sign in', emailRegister:'Create account', toggleToRegister:'No account? Register', toggleToLogin:'Have an account? Sign in', orText:'or', forgot:'Forgot password?', resetSent:'📧 Reset link sent! Check your email.', resetError:'Enter your email above first.',
    weights:'Ballast (kg)', suit:'Suit', suitNone:'None', suitShorty:'Shorty', suitWet:'Wetsuit', suitSemi:'Semi-dry', suitDry:'Drysuit',
    tank:'Tank', tankSize:'Size (L)', tankStart:'Start (bar)', tankEnd:'End (bar)', tankMat:'Material', tankSteel:'Steel', tankAlu:'Aluminium',
    current:'Current', currentNone:'None', currentLight:'Light', currentMedium:'Medium', currentStrong:'Strong',
    waves:'Waves', wavesNone:'None', wavesLight:'Light', wavesMedium:'Medium', wavesHeavy:'Heavy',
    entry:'Entry', entryShore:'Shore', entryBoat:'Boat', entryPlatform:'Platform', entryOther:'Other',
    feeling:'Feeling'  },
  pl: {
    logDive:'Loguj', myDives:'Moje nurki', shop:'Sklep', checklist:'Checklista',
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
    importBtn:'📥 Import Suunto / Shearwater',
    importSuccess:'✅ Nurkowanie zaimportowane!',
    avgDepth:'Śr. głęb.', device:'Urządzenie', gpsMap:'Mapa GPS',
    gpsLabel:'Lokalizacja GPS', gpsBtn:'📍', gpsGetting:'Pobieranie lokalizacji...', googleBtn:'Zaloguj się przez Google',
    emailSignIn:'Zaloguj się', emailRegister:'Utwórz konto', toggleToRegister:'Nie masz konta? Zarejestruj się', toggleToLogin:'Masz konto? Zaloguj się', orText:'lub', forgot:'Zapomniałem hasła', resetSent:'📧 Link wysłany! Sprawdź email.', resetError:'Wpisz najpierw email powyżej.',
    weights:'Balast (kg)', suit:'Pianka', suitNone:'Brak', suitShorty:'Shorty', suitWet:'Mokra', suitSemi:'Półsucha', suitDry:'Sucha',
    tank:'Butla', tankSize:'Rozmiar (L)', tankStart:'Start (bar)', tankEnd:'Koniec (bar)', tankMat:'Materiał', tankSteel:'Stal', tankAlu:'Aluminium',
    current:'Prąd', currentNone:'Brak', currentLight:'Słaby', currentMedium:'Średni', currentStrong:'Silny',
    waves:'Fale', wavesNone:'Brak', wavesLight:'Lekkie', wavesMedium:'Średnie', wavesHeavy:'Duże',
    entry:'Wejście', entryShore:'Z brzegu', entryBoat:'Z łodzi', entryPlatform:'Z platformy', entryOther:'Inne',
    feeling:'Samopoczucie'
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
  document.getElementById('tab-checklist').innerHTML = '✅ ' + t('checklist');
  document.getElementById('tab-shop').innerHTML = '🛒 ' + t('shop');
  // Form labels
  const labels = {
    'l-site':t('diveSite'),'l-loc':t('location'),'l-date':t('date'),
    'l-type':t('diveType'),'l-depth':t('maxDepth'),'l-avg-depth':t('avgDepth'),'l-dur':t('bottomTime'),
    'l-temp':t('waterTemp'),'l-vis':t('visibility'),
    'l-buddy':t('buddy'),'l-cert':t('cert'),'l-rating':t('rating'),'l-notes':t('notes'),
    'l-weights':t('weights'),'l-suit':t('suit'),'l-tank-size':t('tankSize'),
    'l-tank-mat':t('tankMat'),'l-tank-start':t('tankStart'),'l-tank-end':t('tankEnd'),
    'l-current':t('current'),'l-waves':t('waves'),'l-entry':t('entry'),'l-feeling':t('feeling')
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
  const googleBtnText = document.getElementById('google-btn-text');
  if(googleBtnText) googleBtnText.textContent = t('googleBtn');
  const loginOr = document.getElementById('login-or');
  if(loginOr) loginOr.textContent = t('orText');
  const btnEmail = document.getElementById('btn-email-submit');
  if(btnEmail) btnEmail.textContent = isRegisterMode ? t('emailRegister') : t('emailSignIn');
  const toggleText = document.getElementById('toggle-mode-text');
  if(toggleText) toggleText.textContent = isRegisterMode ? t('toggleToLogin') : t('toggleToRegister');
  const forgotText = document.getElementById('forgot-text');
  if(forgotText) forgotText.textContent = t('forgot');
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
let divesCol;
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

let dives = [];
let currentRating = 0;
let unsubDives = null;

document.getElementById('f-date').valueAsDate = new Date();

function signInGoogle() {
  auth.signInWithPopup(googleProvider).catch(e => {
    const el = document.getElementById('login-error');
    el.textContent = e.message; el.style.display = 'block';
  });
}

function resetPassword() {
  const email = document.getElementById('f-email').value.trim();
  const errEl = document.getElementById('login-error');
  if (!email) { errEl.textContent = t('resetError'); errEl.style.display = 'block'; return; }
  auth.sendPasswordResetEmail(email).then(() => {
    errEl.style.color = 'var(--accent)';
    errEl.textContent = t('resetSent'); errEl.style.display = 'block';
    setTimeout(() => { errEl.style.color = ''; exitForgotMode(); }, 4000);
  }).catch(e => { errEl.textContent = e.message; errEl.style.display = 'block'; });
}

let isForgotMode = false;
function enterForgotMode() {
  isForgotMode = true;
  document.getElementById('f-password').style.display = 'none';
  document.getElementById('btn-email-submit').textContent = lang==='pl'?'📧 Wyślij link':'📧 Send reset link';
  document.getElementById('btn-forgot').style.display = 'none';
  document.getElementById('btn-toggle-mode').style.display = 'none';
  document.getElementById('login-error').style.display = 'none';
}
function exitForgotMode() {
  isForgotMode = false;
  document.getElementById('f-password').style.display = '';
  document.getElementById('btn-email-submit').textContent = isRegisterMode ? t('emailRegister') : t('emailSignIn');
  document.getElementById('btn-forgot').style.display = '';
  document.getElementById('btn-toggle-mode').style.display = '';
}

let isRegisterMode = false;

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('btn-email-submit').textContent = isRegisterMode ? t('emailRegister') : t('emailSignIn');
  document.getElementById('toggle-mode-text').textContent = isRegisterMode ? t('toggleToLogin') : t('toggleToRegister');
  document.getElementById('login-error').style.display = 'none';
}

function handleEmailAuth(e) {
  e.preventDefault();
  if (isForgotMode) { resetPassword(); return false; }
  const email = document.getElementById('f-email').value;
  const pass = document.getElementById('f-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  const action = isRegisterMode
    ? auth.createUserWithEmailAndPassword(email, pass)
    : auth.signInWithEmailAndPassword(email, pass);
  action.catch(err => { errEl.textContent = err.message; errEl.style.display = 'block'; });
  return false;
}

function logOut() {
  auth.signOut();
}

function showApp(user) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-header').style.display = '';
  document.getElementById('app-container').style.display = '';
  document.getElementById('user-menu').style.display = 'flex';
  const avatar = document.getElementById('user-avatar');
  avatar.src = user.photoURL || '';
  avatar.title = user.displayName || user.email || '';

  // Set user-specific collection
  divesCol = db.collection('users').doc(user.uid).collection('dives');

  // One-time migration from old shared 'dives' collection — only for original owner
  const OWNER_EMAIL = 'damianbiniarz@gmail.com';
  const migrated = localStorage.getItem('dives_migrated_' + user.uid);
  if (!migrated && user.email === OWNER_EMAIL) {
    db.collection('dives').get().then(snap => {
      if (snap.empty) return;
      const batch = db.batch();
      snap.docs.forEach(doc => {
        batch.set(divesCol.doc(doc.id), doc.data());
      });
      return batch.commit();
    }).then(() => {
      localStorage.setItem('dives_migrated_' + user.uid, '1');
      console.log('Migration complete');
    }).catch(e => console.warn('Migration error:', e));
  }

  // Subscribe to this user's dives only
  if (unsubDives) unsubDives();
  unsubDives = divesCol.orderBy('createdAt','desc').onSnapshot(snap => {
    dives = snap.docs.map(doc => ({ id:doc.id, ...doc.data() }));
    dives.forEach((d,i) => d.num = dives.length - i);
    updateStats();
    if(document.getElementById('panel-history').classList.contains('active')) renderDives();
  });
  checkReminder();
}

function hideApp() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-header').style.display = 'none';
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('user-menu').style.display = 'none';
  if (unsubDives) { unsubDives(); unsubDives = null; }
  dives = [];
}

auth.onAuthStateChanged(user => {
  if (user) showApp(user);
  else hideApp();
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
    const tabs=['log','history','checklist','shop'];
    t.classList.toggle('active', tabs[i]===tab);
  });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(tab==='history') renderDives();
  if(tab==='checklist') renderChecklist();
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
    avgDepth: parseFloat(document.getElementById('f-avg-depth').value)||null,
    duration: parseInt(document.getElementById('f-duration').value)||0,
    temp: document.getElementById('f-temp').value,
    visibility: document.getElementById('f-visibility').value,
    buddy: document.getElementById('f-buddy').value.trim(),
    cert: document.getElementById('f-cert').value.trim(),
    weights: parseFloat(document.getElementById('f-weights').value)||null,
    suit: document.getElementById('f-suit').value||null,
    tank: {
      size: parseFloat(document.getElementById('f-tank-size').value)||null,
      material: document.getElementById('f-tank-mat').value||null,
      start: parseInt(document.getElementById('f-tank-start').value)||null,
      end: parseInt(document.getElementById('f-tank-end').value)||null
    },
    current: document.getElementById('f-current').value||null,
    waves: document.getElementById('f-waves').value||null,
    entry: document.getElementById('f-entry').value||null,
    feeling: parseInt(document.getElementById('f-feeling').value)||null,
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
  ['f-site','f-location','f-depth','f-avg-depth','f-duration','f-temp','f-visibility','f-buddy','f-cert','f-notes','f-weights','f-tank-size','f-tank-start','f-tank-end'].forEach(id=>{
    document.getElementById(id).value='';
  });
  ['f-suit','f-tank-mat','f-current','f-waves','f-entry','f-feeling'].forEach(id=>{
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
  if(d.safetyStop) stats.push({val:'✅',label:'Safety Stop'});
  if(d.minNDL!=null) stats.push({val:d.minNDL+' min',label:'Min NDL'});
  if(d.weights) stats.push({val:d.weights+' kg',label:t('weights')});
  if(d.suit) stats.push({val:d.suit,label:t('suit')});
  if(d.tank&&d.tank.size) stats.push({val:d.tank.size+'L'+(d.tank.material?' '+d.tank.material:''),label:t('tank')});
  if(d.tank&&d.tank.start) stats.push({val:d.tank.start+'→'+(d.tank.end||'?')+' bar',label:'Pressure'});
  // SAC rate auto-calculation
  if(d.tank&&d.tank.start&&d.tank.end&&d.tank.size&&d.duration&&(d.avgDepth||d.depth)){
    const avgD = d.avgDepth || d.depth * 0.6;
    const sac = ((d.tank.start - d.tank.end) * d.tank.size) / ((avgD/10)+1) / d.duration;
    if(sac>0&&sac<50) stats.push({val:sac.toFixed(1)+' L/min',label:'SAC Rate'});
  }
  if(d.current) stats.push({val:d.current,label:t('current')});
  if(d.waves) stats.push({val:d.waves,label:t('waves')});
  if(d.entry) stats.push({val:d.entry,label:t('entry')});
  if(d.feeling) stats.push({val:['😟','😐','🙂','😊','🤩'][d.feeling-1]||d.feeling,label:t('feeling')});
  if(d.weather) stats.push({val:d.weather.condition||'—',label:'Weather'});
  if(d.weather?.wind) stats.push({val:d.weather.wind+' km/h',label:'Wind'});
  if(d.weather?.airTempMax) stats.push({val:d.weather.airTempMin+'–'+d.weather.airTempMax+'°C',label:'Air Temp'});
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
  document.getElementById('m-delete').style.display = '';
  document.getElementById('m-edit').style.display = '';

  // Edit button
  document.getElementById('m-edit').textContent = lang==='pl'?'✏️ Edytuj':'✏️ Edit';
  document.getElementById('m-edit').onclick = ()=>openEditMode(id);

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

function openEditMode(id) {
  const d = dives.find(x=>x.id===id);
  if(!d) return;
  const modal = document.querySelector('.modal');
  const suitOpts = ['','None','Shorty','Wetsuit','Semi-dry','Drysuit'].map(v=>`<option value="${v}"${d.suit===v?' selected':''}>${v||'—'}</option>`).join('');
  const currentOpts = ['','None','Light','Medium','Strong'].map(v=>`<option value="${v}"${d.current===v?' selected':''}>${v||'—'}</option>`).join('');
  const wavesOpts = ['','None','Light','Medium','Heavy'].map(v=>`<option value="${v}"${d.waves===v?' selected':''}>${v||'—'}</option>`).join('');
  const entryOpts = ['','Shore','Boat','Platform','Other'].map(v=>`<option value="${v}"${d.entry===v?' selected':''}>${v||'—'}</option>`).join('');
  const feelOpts = ['',1,2,3,4,5].map(v=>`<option value="${v}"${d.feeling==v?' selected':''}>${v?v+' '+['😟','😐','🙂','😊','🤩'][v-1]:'—'}</option>`).join('');

  const editHTML = `
    <div class="edit-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;font-size:0.75rem;">
      <label style="display:flex;flex-direction:column;gap:2px;">${t('diveSite')}<input id="e-site" value="${d.site||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('location')}<input id="e-location" value="${d.location||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('date')}<input id="e-date" type="date" value="${d.date||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('maxDepth')}<input id="e-depth" type="number" value="${d.depth||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('avgDepth')}<input id="e-avg-depth" type="number" step="0.1" value="${d.avgDepth||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('bottomTime')}<input id="e-duration" type="number" value="${d.duration||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('waterTemp')}<input id="e-temp" type="number" value="${d.temp||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('visibility')}<input id="e-visibility" type="number" value="${d.visibility||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('buddy')}<input id="e-buddy" value="${d.buddy||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('cert')}<input id="e-cert" value="${d.cert||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('weights')}<input id="e-weights" type="number" step="0.5" value="${d.weights||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('suit')}<select id="e-suit" class="edit-input">${suitOpts}</select></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('tankSize')}<input id="e-tank-size" type="number" value="${d.tank?.size||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('tankMat')}<input id="e-tank-mat" value="${d.tank?.material||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('tankStart')}<input id="e-tank-start" type="number" value="${d.tank?.start||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('tankEnd')}<input id="e-tank-end" type="number" value="${d.tank?.end||''}" class="edit-input"></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('current')}<select id="e-current" class="edit-input">${currentOpts}</select></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('waves')}<select id="e-waves" class="edit-input">${wavesOpts}</select></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('entry')}<select id="e-entry" class="edit-input">${entryOpts}</select></label>
      <label style="display:flex;flex-direction:column;gap:2px;">${t('feeling')}<select id="e-feeling" class="edit-input">${feelOpts}</select></label>
      <label style="display:flex;flex-direction:column;gap:2px;grid-column:1/-1;">${t('notes')}<textarea id="e-notes" class="edit-input" rows="3">${d.notes||''}</textarea></label>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn-primary" style="flex:1;" onclick="saveEdit('${id}')">💾 ${lang==='pl'?'Zapisz':'Save'}</button>
      <button class="btn-delete" style="flex:1;" onclick="openModal('${id}')">✕ ${lang==='pl'?'Anuluj':'Cancel'}</button>
    </div>
  `;

  document.getElementById('m-stats').innerHTML = '';
  document.getElementById('m-notes-wrap').innerHTML = editHTML;
  document.getElementById('m-delete').style.display = 'none';
  document.getElementById('m-edit').style.display = 'none';
  document.getElementById('m-attach-wrap').innerHTML = '';
}

async function saveEdit(id) {
  const update = {
    site: document.getElementById('e-site').value.trim(),
    location: document.getElementById('e-location').value.trim(),
    date: document.getElementById('e-date').value,
    depth: parseFloat(document.getElementById('e-depth').value)||0,
    avgDepth: parseFloat(document.getElementById('e-avg-depth').value)||null,
    duration: parseInt(document.getElementById('e-duration').value)||0,
    temp: document.getElementById('e-temp').value||null,
    visibility: document.getElementById('e-visibility').value||null,
    buddy: document.getElementById('e-buddy').value.trim(),
    cert: document.getElementById('e-cert').value.trim(),
    weights: parseFloat(document.getElementById('e-weights').value)||null,
    suit: document.getElementById('e-suit').value||null,
    tank: {
      size: parseFloat(document.getElementById('e-tank-size').value)||null,
      material: document.getElementById('e-tank-mat').value||null,
      start: parseInt(document.getElementById('e-tank-start').value)||null,
      end: parseInt(document.getElementById('e-tank-end').value)||null
    },
    current: document.getElementById('e-current').value||null,
    waves: document.getElementById('e-waves').value||null,
    entry: document.getElementById('e-entry').value||null,
    feeling: parseInt(document.getElementById('e-feeling').value)||null,
    notes: document.getElementById('e-notes').value.trim()
  };
  try {
    await divesCol.doc(id).update(update);
    showToast(lang==='pl'?'✅ Zapisano!':'✅ Saved!');
    setTimeout(()=>openModal(id), 200);
  } catch(e) { showToast('❌ ' + e.message); }
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


// === CHECKLIST ===
const DEFAULT_CHECKLIST = [
  'Komputer nurkowy','Maska','Płetwy','Automaty','Suchar / Pianka','Buty nurkowe',
  'Kaptur','Rękawice','Latarka','Bojka + kołowrotek','Wing / BCD','Balast',
  'Butle','Klucze (imbus, 14, 15, 17)','Ocieplacz / Undersuit','Skarpety',
  'Ręcznik','Woda do picia','Czapka','Talk do suchara','Spray do nosa',
  'Zapasowe baterie','Ładowarka do latarki','Kamera','Nóż / Easy cut',
  'Marker / Zippo','Manszety zapasowe','Linery do rękawic'
];

function getChecklist() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { items: [], checked: [], wishlist: [], nextDate: '' };
  const stored = localStorage.getItem('checklist_' + uid);
  if (stored) return JSON.parse(stored);
  return { items: [...DEFAULT_CHECKLIST], checked: [], wishlist: [], nextDate: '' };
}

function saveChecklist() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const data = getChecklist();
  data.nextDate = document.getElementById('cl-next-date').value || '';
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  scheduleNotification(data.nextDate);
}

function renderChecklist() {
  const data = getChecklist();
  const container = document.getElementById('checklist-items');
  document.getElementById('cl-next-date').value = data.nextDate || '';
  container.innerHTML = data.items.map((item, i) => {
    const checked = data.checked.includes(i);
    return `<div class="cl-item" style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.78rem;">
      <input type="checkbox" ${checked?'checked':''} onchange="toggleCheckItem(${i})" style="accent-color:var(--accent);width:18px;height:18px;cursor:pointer;">
      <span style="${checked?'text-decoration:line-through;opacity:0.5;':''}flex:1;">${item}</span>
      <button onclick="removeCheckItem(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.9rem;padding:2px 6px;">✕</button>
    </div>`;
  }).join('');
  // Progress
  const pct = data.items.length ? Math.round(data.checked.length / data.items.length * 100) : 0;
  container.insertAdjacentHTML('beforebegin',
    document.getElementById('cl-progress') ? '' :
    `<div id="cl-progress" style="margin-bottom:8px;"></div>`);
  const prog = document.getElementById('cl-progress');
  if (prog) prog.innerHTML = `<div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;"><div style="background:var(--accent);height:100%;width:${pct}%;transition:width 0.3s;"></div></div><div style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;">${data.checked.length}/${data.items.length} — ${pct}%</div>`;
  // Wishlist
  const wContainer = document.getElementById('wishlist-items');
  wContainer.innerHTML = data.wishlist.map((item, i) => {
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.75rem;color:var(--accent);">
      <span style="flex:1;">• ${item}</span>
      <button onclick="promoteWish(${i})" title="Add to checklist" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:0.8rem;">↑</button>
      <button onclick="removeWish(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;">✕</button>
    </div>`;
  }).join('');
}

function toggleCheckItem(i) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  const idx = data.checked.indexOf(i);
  if (idx >= 0) data.checked.splice(idx, 1); else data.checked.push(i);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  renderChecklist();
}

function addChecklistItem() {
  const input = document.getElementById('cl-new-item');
  const val = input.value.trim(); if (!val) return;
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  data.items.push(val);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  input.value = '';
  renderChecklist();
}

function removeCheckItem(i) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  data.items.splice(i, 1);
  data.checked = data.checked.filter(c => c !== i).map(c => c > i ? c-1 : c);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  renderChecklist();
}

function addWishlistItem() {
  const input = document.getElementById('cl-new-wish');
  const val = input.value.trim(); if (!val) return;
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  data.wishlist.push(val);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  input.value = '';
  renderChecklist();
}

function removeWish(i) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  data.wishlist.splice(i, 1);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  renderChecklist();
}

function promoteWish(i) {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  const item = data.wishlist.splice(i, 1)[0];
  data.items.push(item);
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  renderChecklist();
}

function resetChecklist() {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const data = getChecklist();
  // Move wishlist items to main checklist
  data.wishlist.forEach(w => { if (!data.items.includes(w)) data.items.push(w); });
  data.checked = [];
  data.wishlist = [];
  data.nextDate = '';
  localStorage.setItem('checklist_' + uid, JSON.stringify(data));
  renderChecklist();
  showToast(lang==='pl'?'✅ Checklista zresetowana!':'✅ Checklist reset!');
}

function scheduleNotification(dateStr) {
  if (!dateStr || !('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission();
  // Store reminder date — check on app load
  const uid = auth.currentUser?.uid; if (!uid) return;
  localStorage.setItem('cl_remind_' + uid, dateStr);
}

function checkReminder() {
  const uid = auth.currentUser?.uid; if (!uid) return;
  const dateStr = localStorage.getItem('cl_remind_' + uid);
  if (!dateStr) return;
  const diveDate = new Date(dateStr);
  const now = new Date();
  const diff = (diveDate - now) / (1000*60*60);
  // Remind if dive is within 24h
  if (diff > 0 && diff <= 24 && Notification.permission === 'granted') {
    const data = getChecklist();
    const unchecked = data.items.length - data.checked.length;
    if (unchecked > 0) {
      new Notification('🤿 Dive tomorrow!', { body: `${unchecked} items unchecked on your checklist`, icon: 'icon.svg' });
    }
    localStorage.removeItem('cl_remind_' + uid);
  }
}

applyLang();

function handleImport(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();

  if (name.endsWith('.db')) {
    // Shearwater Cloud SQLite
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const divesList = await parseShearwaterDB(e.target.result);
        if (!divesList.length) { showToast('❌ No dives found in file'); return; }
        let count = 0;
        for (const dive of divesList) {
          dive.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          await divesCol.add(dive);
          count++;
        }
        showToast(t('importSuccess') + ' (' + count + ')');
        switchTab('history');
      } catch(err) {
        showToast('❌ ' + err.message);
      }
      fileInput.value = '';
    };
    reader.readAsArrayBuffer(file);
  } else {
    // Suunto JSON — use existing handler
    handleSuuntoImport(fileInput);
  }
}
