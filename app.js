const T = {
  en: {
    logDive:'Log Dive', myDives:'My Dives', shop:'Shop', checklist:'Checklist', diveMap:'Map', stats:'Stats', certs:'Certs', gear:'Gear',
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
    logDive:'Loguj', myDives:'Moje nurki', shop:'Sklep', checklist:'Checklista', diveMap:'Mapa', stats:'Statystyki', certs:'Certyfikaty', gear:'Sprzęt',
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
  document.getElementById('tab-stats').innerHTML = '📊 ' + t('stats');
  document.getElementById('tab-map').innerHTML = '🗺 ' + t('diveMap');
  document.getElementById('tab-certs').innerHTML = '🎓 ' + t('certs');
  document.getElementById('tab-gear').innerHTML = '🔧 ' + t('gear');
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
const storage = firebase.storage();
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
  // Load or join shared trip checklist
  joinPendingTrip().then(joined => { if (!joined) loadOrCreateTrip(); });
  subscribeCerts();
  subscribeGear();
}

function hideApp() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-header').style.display = 'none';
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('user-menu').style.display = 'none';
  if (unsubDives) { unsubDives(); unsubDives = null; }
  if (unsubTrip) { unsubTrip(); unsubTrip = null; }
  if (unsubCerts) { unsubCerts(); unsubCerts = null; }
  if (unsubGear) { unsubGear(); unsubGear = null; }
  currentTripId = null;
  dives = []; certs = []; gear = [];
}

if (!checkSharedMap()) {
  auth.onAuthStateChanged(user => {
    if (user) showApp(user);
    else hideApp();
  });
}

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
    const tabs=['log','history','stats','map','certs','gear','checklist','shop'];
    t.classList.toggle('active', tabs[i]===tab);
  });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(tab==='history') renderDives();
  if(tab==='stats') renderStats();
  if(tab==='map') renderDiveMap();
  if(tab==='certs') renderCerts();
  if(tab==='gear') renderGear();
  if(tab==='checklist' && !currentTripId) loadOrCreateTrip();
}

let formGps = null;
let formMap = null;

async function searchGPSByName(siteFieldId, locFieldId, gpsFieldId, callback) {
  const site = document.getElementById(siteFieldId)?.value?.trim() || '';
  const loc = document.getElementById(locFieldId)?.value?.trim() || '';
  const query = (site + ' ' + loc).trim();
  if (!query) { showToast(lang==='pl'?'Wpisz nazwę miejsca':'Enter site name first'); return; }
  const gpsField = document.getElementById(gpsFieldId);
  gpsField.value = lang==='pl'?'Szukam...':'Searching...';
  try {
    const resp = await fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(query)+'&format=json&limit=1');
    const results = await resp.json();
    if (results.length) {
      const lat = Math.round(parseFloat(results[0].lat)*10000)/10000;
      const lng = Math.round(parseFloat(results[0].lon)*10000)/10000;
      gpsField.value = lat + ', ' + lng;
      if (callback) callback(lat, lng);
    } else {
      gpsField.value = '';
      showToast(lang==='pl'?'Nie znaleziono':'Location not found');
    }
  } catch(e) { gpsField.value = ''; showToast('❌ ' + e.message); }
}

function searchFormGPS() {
  searchGPSByName('f-site', 'f-location', 'f-gps', function(lat, lng) {
    formGps = {lat, lng};
    getGPS(); // open map centered on found location
  });
}

function searchEditGPS() {
  searchGPSByName('e-site', 'e-location', 'e-gps', function(lat, lng) {
    openEditMap(); // open map centered on found location
  });
}

function getGPS() {
  const mapEl = document.getElementById('f-gps-map');
  mapEl.style.display = 'block';
  if (formMap) formMap.remove();

  // Start with current location or default
  const startPos = formGps ? [formGps.lat, formGps.lng] : [50.06, 19.94];
  const startZoom = formGps ? 14 : 3;

  document.getElementById('f-gps').value = t('gpsGetting');

  function initMap(lat, lng, zoom) {
    formMap = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(formMap);
    var marker = null;
    if (formGps) {
      marker = L.marker([formGps.lat, formGps.lng], {draggable: true}).addTo(formMap);
      marker.on('dragend', function() {
        var p = marker.getLatLng();
        setFormGps(Math.round(p.lat*10000)/10000, Math.round(p.lng*10000)/10000);
      });
    }
    formMap.on('click', function(e) {
      var lt = Math.round(e.latlng.lat*10000)/10000;
      var ln = Math.round(e.latlng.lng*10000)/10000;
      if (marker) marker.setLatLng([lt, ln]);
      else { marker = L.marker([lt, ln], {draggable: true}).addTo(formMap); marker.on('dragend', function(){ var p=marker.getLatLng(); setFormGps(Math.round(p.lat*10000)/10000, Math.round(p.lng*10000)/10000); }); }
      setFormGps(lt, ln);
    });
    setTimeout(function(){ formMap.invalidateSize(); }, 100);
  }

  function setFormGps(lat, lng) {
    formGps = { lat: lat, lng: lng };
    document.getElementById('f-gps').value = lat + ', ' + lng;
  }

  // Try to get current location, but show map immediately
  if (!formGps && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = Math.round(pos.coords.latitude*10000)/10000;
      var lng = Math.round(pos.coords.longitude*10000)/10000;
      formMap.setView([lat, lng], 12);
      document.getElementById('f-gps').value = lang==='pl'?'Kliknij na mapę':'Click on map';
    }, function() {
      document.getElementById('f-gps').value = lang==='pl'?'Kliknij na mapę':'Click on map';
    }, { enableHighAccuracy: true, timeout: 5000 });
  } else {
    document.getElementById('f-gps').value = formGps ? formGps.lat+', '+formGps.lng : (lang==='pl'?'Kliknij na mapę':'Click on map');
  }

  initMap(startPos[0], startPos[1], startZoom);
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
  let attachHTML = '';
  if (!d.depthProfile || d.depthProfile.length < 2) {
    attachHTML += `<label style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1px dashed var(--border-light);border-radius:8px;cursor:pointer;color:var(--accent);font-size:0.75rem;font-weight:700;margin-top:12px;transition:all 0.2s;">
      📥 ${lang==='pl'?'Dołącz dane Suunto':'Attach Suunto data'}
      <input type="file" accept=".json" style="display:none" onchange="attachSuuntoToDiv('${id}',this)">
    </label>`;
  }
  // Photos section
  attachHTML += `<div style="margin-top:12px;">
    <div id="dive-photos" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;"></div>
    <label style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1px dashed var(--border-light);border-radius:8px;cursor:pointer;color:var(--accent);font-size:0.75rem;font-weight:700;transition:all 0.2s;">
      📷 ${lang==='pl'?'Dodaj zdjęcia':'Add photos'}
      <input type="file" accept="image/*" multiple style="display:none" onchange="uploadPhotos('${id}',this)">
    </label>
  </div>`;
  attachWrap.innerHTML = attachHTML;

  // Load existing photos
  loadPhotos(id);

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
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
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
      <label style="display:flex;flex-direction:column;gap:2px;grid-column:1/-1;">${t('gpsLabel')}
        <div style="display:flex;gap:6px;"><input id="e-gps" class="edit-input" style="flex:1;" value="${d.gps?d.gps.lat+', '+d.gps.lng:''}" placeholder="Search 🔍 or pick on map 📍"><button type="button" onclick="searchEditGPS()" style="background:var(--accent-dim);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--accent);cursor:pointer;">🔍</button><button type="button" onclick="openEditMap()" style="background:var(--accent-dim);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--accent);cursor:pointer;">📍</button></div>
        <div id="e-gps-map" style="display:none;height:200px;border-radius:8px;overflow:hidden;margin-top:4px;border:1px solid var(--border);"></div>
      </label>
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

let editMap = null;
function openEditMap() {
  const mapEl = document.getElementById('e-gps-map');
  mapEl.style.display = 'block';
  if (editMap) { editMap.remove(); editMap = null; }
  const gpsVal = document.getElementById('e-gps').value.trim();
  let lat = 50.06, lng = 19.94, zoom = 3;
  if (gpsVal && gpsVal.includes(',')) {
    const parts = gpsVal.split(',');
    lat = parseFloat(parts[0]); lng = parseFloat(parts[1]); zoom = 14;
  }
  editMap = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView([lat, lng], zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(editMap);
  var marker = zoom > 3 ? L.marker([lat, lng], {draggable:true}).addTo(editMap) : null;
  if (marker) marker.on('dragend', function(){ var p=marker.getLatLng(); document.getElementById('e-gps').value=Math.round(p.lat*10000)/10000+', '+Math.round(p.lng*10000)/10000; });
  editMap.on('click', function(e) {
    var lt=Math.round(e.latlng.lat*10000)/10000, ln=Math.round(e.latlng.lng*10000)/10000;
    if(marker) marker.setLatLng([lt,ln]); else { marker=L.marker([lt,ln],{draggable:true}).addTo(editMap); marker.on('dragend',function(){var p=marker.getLatLng();document.getElementById('e-gps').value=Math.round(p.lat*10000)/10000+', '+Math.round(p.lng*10000)/10000;}); }
    document.getElementById('e-gps').value = lt+', '+ln;
  });
  setTimeout(function(){ editMap.invalidateSize(); }, 100);
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
  // Parse GPS from edit field
  const gpsVal = document.getElementById('e-gps').value.trim();
  if (gpsVal && gpsVal.includes(',')) {
    const parts = gpsVal.split(',');
    update.gps = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  } else {
    update.gps = null;
  }
  if (editMap) { editMap.remove(); editMap = null; }
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






// === PHOTOS ===
async function uploadPhotos(diveId, input) {
  const files = input.files;
  if (!files.length) return;
  const uid = myUid();
  const photosDiv = document.getElementById('dive-photos');
  for (const file of files) {
    const name = Date.now() + '_' + file.name;
    const ref = storage.ref(`users/${uid}/dives/${diveId}/${name}`);
    photosDiv.innerHTML += `<div style="padding:8px;font-size:0.7rem;color:var(--text-dim);">⏳ ${lang==='pl'?'Wysyłanie...':'Uploading...'}</div>`;
    await ref.put(file);
    const url = await ref.getDownloadURL();
    // Save photo URL to dive document
    await divesCol.doc(diveId).update({
      photos: firebase.firestore.FieldValue.arrayUnion({url, name})
    });
  }
  input.value = '';
  loadPhotos(diveId);
  showToast(lang==='pl'?'📷 Zdjęcia dodane!':'📷 Photos added!');
}

function loadPhotos(diveId) {
  const d = dives.find(x => x.id === diveId);
  const photosDiv = document.getElementById('dive-photos');
  if (!photosDiv) return;
  const photos = d?.photos || [];
  if (!photos.length) { photosDiv.innerHTML = ''; return; }
  photosDiv.innerHTML = photos.map((p, i) => `
    <div style="position:relative;width:80px;height:80px;border-radius:6px;overflow:hidden;border:1px solid var(--border);">
      <img src="${p.url}" style="width:100%;height:100%;object-fit:cover;cursor:pointer;" onclick="openPhotoFull('${p.url}')">
      <button onclick="deletePhoto('${diveId}',${i})" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.7);border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.6rem;cursor:pointer;line-height:18px;">✕</button>
    </div>
  `).join('');
}

function openPhotoFull(url) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  overlay.innerHTML = `<img src="${url}" style="max-width:95%;max-height:95%;object-fit:contain;border-radius:8px;">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

async function deletePhoto(diveId, index) {
  if (!confirm(lang==='pl'?'Usunąć zdjęcie?':'Delete photo?')) return;
  const d = dives.find(x => x.id === diveId);
  const photos = [...(d.photos || [])];
  const photo = photos[index];
  photos.splice(index, 1);
  await divesCol.doc(diveId).update({ photos });
  // Delete from storage
  try {
    const uid = myUid();
    await storage.ref(`users/${uid}/dives/${diveId}/${photo.name}`).delete();
  } catch(e) { /* file may not exist */ }
  loadPhotos(diveId);
}

// === CERTS ===
let certs = [];
let unsubCerts = null;

function subscribeCerts() {
  const uid = myUid(); if (!uid) return;
  if (unsubCerts) unsubCerts();
  unsubCerts = db.collection('users').doc(uid).collection('certs').orderBy('date','desc').onSnapshot(snap => {
    certs = snap.docs.map(doc => ({id:doc.id, ...doc.data()}));
    if (document.getElementById('panel-certs').classList.contains('active')) renderCerts();
  });
}

function renderCerts() {
  const list = document.getElementById('certs-list');
  if (!certs.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-dim);padding:20px;font-size:0.78rem;">${lang==='pl'?'Brak certyfikatów. Dodaj swój pierwszy!':'No certifications yet. Add your first!'}</div>`;
    return;
  }
  list.innerHTML = certs.map(c => `
    <div style="padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;position:relative;">
      <div style="font-weight:800;font-size:0.85rem;color:var(--accent);">${c.name}</div>
      <div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">
        ${c.agency?'<span style="background:var(--accent-dim);padding:2px 8px;border-radius:4px;font-weight:600;">'+c.agency+'</span> ':''}
        ${c.date?'📅 '+c.date:''}
      </div>
      ${c.number?'<div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">🔢 '+c.number+'</div>':''}
      ${c.instructor?'<div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">👨‍🏫 '+c.instructor+'</div>':''}
      <button onclick="deleteCert('${c.id}')" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;opacity:0.5;">✕</button>
    </div>
  `).join('');
}

async function addCert() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { showToast(lang==='pl'?'Wpisz nazwę certyfikatu':'Enter certification name'); return; }
  const cert = {
    name,
    agency: document.getElementById('c-agency').value.trim() || null,
    date: document.getElementById('c-date').value || null,
    number: document.getElementById('c-number').value.trim() || null,
    instructor: document.getElementById('c-instructor').value.trim() || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  const uid = myUid();
  await db.collection('users').doc(uid).collection('certs').add(cert);
  ['c-name','c-agency','c-date','c-number','c-instructor'].forEach(id => document.getElementById(id).value = '');
  showToast(lang==='pl'?'✅ Certyfikat dodany!':'✅ Certification added!');
}

async function deleteCert(id) {
  if (!confirm(lang==='pl'?'Usunąć ten certyfikat?':'Delete this certification?')) return;
  const uid = myUid();
  await db.collection('users').doc(uid).collection('certs').doc(id).delete();
}


// === GEAR ===
let gear = [];
let unsubGear = null;

function subscribeGear() {
  const uid = myUid(); if (!uid) return;
  if (unsubGear) unsubGear();
  unsubGear = db.collection('users').doc(uid).collection('gear').orderBy('category').onSnapshot(snap => {
    gear = snap.docs.map(doc => ({id:doc.id, ...doc.data()}));
    if (document.getElementById('panel-gear').classList.contains('active')) renderGear();
  });
}

function renderGear() {
  const list = document.getElementById('gear-list');
  if (!gear.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-dim);padding:20px;font-size:0.78rem;">${lang==='pl'?'Brak sprzętu. Dodaj swój pierwszy!':'No gear yet. Add your first!'}</div>`;
    return;
  }
  const now = new Date();
  list.innerHTML = gear.map(g => {
    let serviceStatus = '';
    if (g.lastService && g.intervalMonths) {
      const next = new Date(g.lastService);
      next.setMonth(next.getMonth() + parseInt(g.intervalMonths));
      const daysLeft = Math.round((next - now) / (1000*60*60*24));
      if (daysLeft < 0) serviceStatus = `<span style="color:var(--danger);font-weight:700;">⚠️ ${lang==='pl'?'Przeterminowany!':'Overdue!'}</span>`;
      else if (daysLeft < 30) serviceStatus = `<span style="color:#f59e0b;font-weight:600;">⏰ ${daysLeft}d left</span>`;
      else serviceStatus = `<span style="color:var(--text-muted);">✅ ${lang==='pl'?'Następny':'Next'}: ${next.toISOString().substring(0,10)}</span>`;
    }
    const catIcons = {Regulator:'🫧',['BCD/Wing']:'🦺',Computer:'⌚',Drysuit:'🥶',Wetsuit:'🩱',Fins:'🦶',Mask:'🤿',Light:'🔦',Tank:'🛢',Other:'📦'};
    return `
    <div style="padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;position:relative;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:1.2rem;">${catIcons[g.category]||'📦'}</span>
        <div style="flex:1;">
          <div style="font-weight:800;font-size:0.82rem;">${g.name}</div>
          <div style="font-size:0.68rem;color:var(--text-dim);">${g.category}${g.purchased?' · Bought '+g.purchased:''}</div>
        </div>
      </div>
      ${serviceStatus?'<div style="font-size:0.68rem;margin-top:6px;">'+serviceStatus+'</div>':''}
      <button onclick="deleteGear('${g.id}')" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;opacity:0.5;">✕</button>
    </div>`;
  }).join('');
}

async function addGear() {
  const name = document.getElementById('g-name').value.trim();
  if (!name) { showToast(lang==='pl'?'Wpisz nazwę sprzętu':'Enter gear name'); return; }
  const item = {
    name,
    category: document.getElementById('g-category').value,
    purchased: document.getElementById('g-purchased').value || null,
    lastService: document.getElementById('g-last-service').value || null,
    intervalMonths: document.getElementById('g-interval').value || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  const uid = myUid();
  await db.collection('users').doc(uid).collection('gear').add(item);
  ['g-name','g-purchased','g-last-service'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('g-interval').value = '';
  showToast(lang==='pl'?'✅ Sprzęt dodany!':'✅ Gear added!');
}

async function deleteGear(id) {
  if (!confirm(lang==='pl'?'Usunąć ten sprzęt?':'Delete this gear?')) return;
  const uid = myUid();
  await db.collection('users').doc(uid).collection('gear').doc(id).delete();
}

// === STATS ===
function renderStats() {
  if (!dives.length) {
    document.getElementById('stats-summary').innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:20px;">No dives yet</div>';
    document.getElementById('stats-charts').innerHTML = '';
    return;
  }

  const totalDives = dives.length;
  const totalTime = dives.reduce((s,d) => s + (d.duration||0), 0);
  const maxDepth = Math.max(...dives.map(d => d.depth||0));
  const avgDepth = Math.round(dives.reduce((s,d) => s + (d.depth||0), 0) / totalDives * 10) / 10;
  const totalHours = Math.round(totalTime / 60 * 10) / 10;
  const uniqueSites = [...new Set(dives.map(d => d.site).filter(Boolean))].length;
  const avgTemp = dives.filter(d=>d.temp).length ? Math.round(dives.filter(d=>d.temp).reduce((s,d)=>s+parseFloat(d.temp),0)/dives.filter(d=>d.temp).length*10)/10 : null;

  // SAC rates
  const sacDives = dives.filter(d => d.tank&&d.tank.start&&d.tank.end&&d.tank.size&&d.duration&&(d.avgDepth||d.depth));
  const avgSac = sacDives.length ? Math.round(sacDives.reduce((s,d) => {
    const avg = d.avgDepth || d.depth*0.6;
    return s + ((d.tank.start-d.tank.end)*d.tank.size)/((avg/10)+1)/d.duration;
  }, 0) / sacDives.length * 10) / 10 : null;

  const summaryHTML = [
    {val: totalDives, label: lang==='pl'?'Nurkowań':'Dives'},
    {val: totalHours+'h', label: lang==='pl'?'Czas pod wodą':'Time underwater'},
    {val: maxDepth+'m', label: lang==='pl'?'Maks. głębokość':'Max depth'},
    {val: avgDepth+'m', label: lang==='pl'?'Śr. głębokość':'Avg depth'},
    {val: uniqueSites, label: lang==='pl'?'Miejsc':'Sites'},
    {val: avgTemp?avgTemp+'°C':'—', label: lang==='pl'?'Śr. temp.':'Avg temp'},
  ];
  if (avgSac) summaryHTML.push({val: avgSac+' L/min', label: 'Avg SAC'});

  document.getElementById('stats-summary').innerHTML = summaryHTML.map(s =>
    `<div style="text-align:center;padding:10px;background:var(--surface);border-radius:8px;border:1px solid var(--border);">
      <div style="font-size:1.2rem;font-weight:800;color:var(--accent);">${s.val}</div>
      <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">${s.label}</div>
    </div>`).join('');

  // Charts
  let chartsHTML = '';

  // Dives per month (last 12 months)
  const months = {};
  dives.forEach(d => { if(d.date) { const m = d.date.substring(0,7); months[m] = (months[m]||0)+1; } });
  const sortedMonths = Object.keys(months).sort().slice(-12);
  if (sortedMonths.length > 1) {
    const maxCount = Math.max(...sortedMonths.map(m => months[m]));
    chartsHTML += `<div style="margin-top:16px;"><div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);margin-bottom:8px;">${lang==='pl'?'Nurkowań / miesiąc':'Dives / month'}</div>
      <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">
        ${sortedMonths.map(m => {
          const h = Math.max(4, (months[m]/maxCount)*100);
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
            <div style="font-size:0.55rem;color:var(--text-dim);">${months[m]}</div>
            <div style="width:100%;height:${h}%;background:var(--accent);border-radius:3px;min-height:4px;"></div>
            <div style="font-size:0.5rem;color:var(--text-muted);transform:rotate(-45deg);white-space:nowrap;">${m.substring(5)}</div>
          </div>`;
        }).join('')}
      </div></div>`;
  }

  // Depth trend
  const divesByDate = [...dives].filter(d=>d.date&&d.depth).sort((a,b)=>a.date.localeCompare(b.date));
  if (divesByDate.length > 2) {
    const maxD = Math.max(...divesByDate.map(d=>d.depth));
    chartsHTML += `<div style="margin-top:16px;"><div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);margin-bottom:8px;">${lang==='pl'?'Trend głębokości':'Depth trend'}</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:60px;">
        ${divesByDate.slice(-30).map(d => {
          const h = Math.max(4, (d.depth/maxD)*100);
          return `<div style="flex:1;background:linear-gradient(to top,#8b5cf6,#2dd4bf);border-radius:2px;height:${h}%;" title="${d.date}: ${d.depth}m"></div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.5rem;color:var(--text-muted);margin-top:2px;">
        <span>${divesByDate[Math.max(0,divesByDate.length-30)].date}</span><span>${divesByDate[divesByDate.length-1].date}</span>
      </div></div>`;
  }

  // Top sites
  const siteCounts = {};
  dives.forEach(d => { if(d.site) siteCounts[d.site] = (siteCounts[d.site]||0)+1; });
  const topSites = Object.entries(siteCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (topSites.length) {
    const topMax = topSites[0][1];
    chartsHTML += `<div style="margin-top:16px;"><div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);margin-bottom:8px;">${lang==='pl'?'Ulubione miejsca':'Top sites'}</div>
      ${topSites.map(([site,count]) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:0.72rem;">
          <div style="flex:1;background:var(--border);border-radius:3px;height:8px;overflow:hidden;"><div style="height:100%;width:${count/topMax*100}%;background:var(--accent);border-radius:3px;"></div></div>
          <span style="white-space:nowrap;color:var(--text-dim);min-width:20px;text-align:right;">${count}</span>
          <span style="white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${site}</span>
        </div>`).join('')}
      </div>`;
  }

  // Dive types pie-like
  const typeCounts = {};
  dives.forEach(d => { typeCounts[d.type||'Other'] = (typeCounts[d.type||'Other']||0)+1; });
  const typeColors = {Recreational:'#2dd4bf',Technical:'#8b5cf6',Cave:'#f59e0b',Night:'#6366f1',Wreck:'#ef4444',Drift:'#06b6d4',Deep:'#ec4899',Training:'#22c55e'};
  chartsHTML += `<div style="margin-top:16px;"><div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);margin-bottom:8px;">${lang==='pl'?'Typy nurkowań':'Dive types'}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${Object.entries(typeCounts).map(([type,count]) => `
        <div style="padding:4px 10px;border-radius:12px;font-size:0.68rem;font-weight:600;background:${typeColors[type]||'#64748b'}22;color:${typeColors[type]||'#64748b'};border:1px solid ${typeColors[type]||'#64748b'}44;">${type} (${count})</div>
      `).join('')}
    </div></div>`;

  document.getElementById('stats-charts').innerHTML = chartsHTML;
}


function exportPDF() {
  if (!dives.length) { showToast(lang==='pl'?'Brak nurkowań':'No dives to export'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Mr.Binio Dive — Logbook', pw/2, y, {align:'center'});
  y += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(myName() + ' | ' + new Date().toLocaleDateString(), pw/2, y, {align:'center'});
  y += 6;

  // Summary
  const totalDives = dives.length;
  const totalTime = Math.round(dives.reduce((s,d)=>s+(d.duration||0),0)/60*10)/10;
  const maxD = Math.max(...dives.map(d=>d.depth||0));
  doc.setFontSize(8);
  doc.text(`Total: ${totalDives} dives | ${totalTime}h underwater | Max depth: ${maxD}m`, pw/2, y, {align:'center'});
  y += 10;

  // Table header
  doc.setFillColor(45, 212, 191);
  doc.rect(10, y, pw-20, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);
  const cols = [12, 32, 62, 100, 118, 136, 154, 172];
  const headers = ['#','Date','Site','Location','Depth','Time','Temp','Buddy'];
  headers.forEach((h,i) => doc.text(h, cols[i], y+5));
  y += 9;
  doc.setTextColor(50);
  doc.setFont(undefined, 'normal');

  // Rows
  const sorted = [...dives].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  sorted.forEach((d, idx) => {
    if (y > 275) { doc.addPage(); y = 15; }
    if (idx % 2 === 0) { doc.setFillColor(245,245,245); doc.rect(10, y-3, pw-20, 6, 'F'); }
    doc.setFontSize(6.5);
    doc.text(String(idx+1), cols[0], y);
    doc.text(d.date||'', cols[1], y);
    doc.text((d.site||'').substring(0,20), cols[2], y);
    doc.text((d.location||'').substring(0,18), cols[3], y);
    doc.text(d.depth?d.depth+'m':'', cols[4], y);
    doc.text(d.duration?d.duration+'min':'', cols[5], y);
    doc.text(d.temp?d.temp+'°C':'', cols[6], y);
    doc.text((d.buddy||'').substring(0,12), cols[7], y);
    y += 6;
  });

  // Footer
  y += 5;
  if (y > 280) { doc.addPage(); y = 15; }
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Generated by Mr.Binio Dive Logbook — mrbinio.github.io/dive-logbook', pw/2, y, {align:'center'});

  doc.save('dive-logbook-' + new Date().toISOString().substring(0,10) + '.pdf');
  showToast(lang==='pl'?'📄 PDF wygenerowany!':'📄 PDF exported!');
}

// === DIVE MAP ===
let worldMap = null;
let mapMarkers = [];

function renderDiveMap() {
  const el = document.getElementById('dive-world-map');
  const sitesWithGps = dives.filter(d => d.gps && d.gps.lat && d.gps.lng);

  if (!worldMap) {
    worldMap = L.map(el, { zoomControl: true, attributionControl: false }).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(worldMap);
  }

  // Clear old markers
  mapMarkers.forEach(m => worldMap.removeLayer(m));
  mapMarkers = [];

  if (!sitesWithGps.length) {
    setTimeout(() => worldMap.invalidateSize(), 100);
    return;
  }

  // Group dives by site (same GPS within ~100m)
  const sites = [];
  sitesWithGps.forEach(d => {
    const existing = sites.find(s =>
      Math.abs(s.lat - d.gps.lat) < 0.001 && Math.abs(s.lng - d.gps.lng) < 0.001
    );
    if (existing) { existing.dives.push(d); }
    else { sites.push({ lat: d.gps.lat, lng: d.gps.lng, dives: [d] }); }
  });

  sites.forEach(site => {
    const best = site.dives.reduce((a, b) => (b.rating || 0) > (a.rating || 0) ? b : a, site.dives[0]);
    const maxRating = Math.max(...site.dives.map(d => d.rating || 0));
    const color = maxRating >= 4 ? '#22c55e' : maxRating === 3 ? '#eab308' : maxRating >= 1 ? '#3b82f6' : '#94a3b8';

    const marker = L.circleMarker([site.lat, site.lng], {
      radius: 8 + site.dives.length * 2,
      color: color, fillColor: color, fillOpacity: 0.4, weight: 2
    }).addTo(worldMap);

    const popupHTML = `
      <div style="font-family:Inter,system-ui;min-width:160px;">
        <div style="font-weight:800;font-size:0.85rem;margin-bottom:4px;">${best.site || 'Dive Site'}</div>
        <div style="font-size:0.7rem;color:#666;margin-bottom:6px;">${best.location || ''}</div>
        ${site.dives.map(d => `
          <div style="font-size:0.68rem;padding:3px 0;border-top:1px solid #eee;">
            ${d.date ? '📅 '+d.date+' · ' : ''}${d.depth}m · ${d.duration}min
            ${d.rating ? ' · '+'⭐'.repeat(d.rating) : ''}
          </div>
        `).join('')}
        <div style="font-size:0.65rem;color:#888;margin-top:4px;">${site.dives.length} dive${site.dives.length>1?'s':''}</div>
      </div>`;
    marker.bindPopup(popupHTML);
    mapMarkers.push(marker);
  });

  // Fit bounds
  const bounds = L.latLngBounds(sites.map(s => [s.lat, s.lng]));
  worldMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  setTimeout(() => worldMap.invalidateSize(), 100);
}

function shareMap() {
  const uid = myUid();
  const url = window.location.origin + window.location.pathname + '?shared_map=' + uid;
  if (navigator.share) {
    navigator.share({ title: 'My Dive Map', url: url });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast(lang==='pl' ? '🔗 Link skopiowany!' : '🔗 Link copied!');
    });
  }
}

// Handle shared map view (public, read-only)
function checkSharedMap() {
  const params = new URLSearchParams(window.location.search);
  const sharedUid = params.get('shared_map');
  if (!sharedUid) return false;
  // Show map in full-screen mode without login
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-header').style.display = 'none';
  document.getElementById('app-container').style.display = '';
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-map').classList.add('active');
  document.querySelector('.tabs-bar').style.display = 'none';
  // Load shared user's dives (read-only)
  db.collection('users').doc(sharedUid).collection('dives').orderBy('createdAt','desc').get().then(snap => {
    dives = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    document.getElementById('map-title').textContent = '🗺 Shared Dive Map (' + dives.length + ' dives)';
    renderDiveMap();
  }).catch(() => {
    document.getElementById('dive-world-map').innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim);">Map not available</div>';
  });
  return true;
}

// === CHECKLIST (Firestore shared trips) ===
const DEFAULT_PERSONAL = [
  'Komputer nurkowy','Maska','Płetwy','Automaty','Suchar / Pianka','Buty nurkowe',
  'Kaptur','Rękawice','Latarka','Bojka + kołowrotek','Wing / BCD','Balast',
  'Ocieplacz / Undersuit','Skarpety','Nóż / Easy cut','Manszety zapasowe','Linery do rękawic'
];
const DEFAULT_SHARED = [
  'Butle','Klucze (imbus, 14, 15, 17)','Ręcznik','Woda do picia','Czapka',
  'Talk do suchara','Spray do nosa','Zapasowe baterie','Ładowarka do latarki',
  'Kamera','Marker / Zippo'
];

let currentTripId = null;
let unsubTrip = null;

function tripsCol() { return db.collection('trips'); }

function myEmail() { return auth.currentUser?.email || ''; }
function myUid() { return auth.currentUser?.uid || ''; }
function myName() { return auth.currentUser?.displayName || myEmail().split('@')[0] || ''; }

async function loadOrCreateTrip() {
  const uid = myUid(); if (!uid) return;
  // Find active trip where I'm a member
  const snap = await tripsCol().where('members','array-contains',uid).where('active','==',true).limit(1).get();
  if (!snap.empty) {
    currentTripId = snap.docs[0].id;
  } else {
    // Create new trip
    const doc = await tripsCol().add({
      active: true,
      date: '',
      site: '',
      createdBy: uid,
      members: [uid],
      memberEmails: [myEmail()],
      memberNames: [myName()],
      shared: DEFAULT_SHARED.map(name => ({name, checked: false})),
      personal: { [uid]: DEFAULT_PERSONAL.map(name => ({name, checked: false})) },
      wishlist: { [uid]: [] }
    });
    currentTripId = doc.id;
  }
  subscribeTrip();
}

function subscribeTrip() {
  if (unsubTrip) unsubTrip();
  if (!currentTripId) return;
  unsubTrip = tripsCol().doc(currentTripId).onSnapshot(snap => {
    if (snap.exists) renderChecklist(snap.data());
  });
}

function renderChecklist(trip) {
  if (!trip) return;
  const uid = myUid();
  document.getElementById('cl-next-date').value = trip.date || '';
  document.getElementById('cl-site').value = trip.site || '';
  const calBtn = document.getElementById('cl-cal-btn');
  if (calBtn) calBtn.style.display = trip.date ? '' : 'none';

  // Buddies display
  const buddyDiv = document.getElementById('cl-buddies');
  const others = (trip.memberNames||trip.memberEmails||[]).filter((_,i) => trip.members[i] !== uid);
  buddyDiv.innerHTML = others.length
    ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:4px;">🤝 ${lang==='pl'?'Buddy':'Buddies'}: <strong style="color:var(--accent);">${others.join(', ')}</strong></div>`
    : '';

  // Shared items
  const sharedDiv = document.getElementById('cl-shared-items');
  const shared = trip.shared || [];
  sharedDiv.innerHTML = shared.map((item, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:0.78rem;">
      <input type="checkbox" ${item.checked?'checked':''} onchange="toggleShared(${i})" style="accent-color:var(--accent);width:18px;height:18px;cursor:pointer;">
      <span style="${item.checked?'text-decoration:line-through;opacity:0.5;':''}flex:1;">${item.name}</span>
      <button onclick="removeShared(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.85rem;">✕</button>
    </div>`).join('');

  // Personal items
  const persDiv = document.getElementById('cl-personal-items');
  const pers = (trip.personal && trip.personal[uid]) || [];
  persDiv.innerHTML = pers.map((item, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:0.78rem;">
      <input type="checkbox" ${item.checked?'checked':''} onchange="togglePersonal(${i})" style="accent-color:#8b5cf6;width:18px;height:18px;cursor:pointer;">
      <span style="${item.checked?'text-decoration:line-through;opacity:0.5;':''}flex:1;">${item.name}</span>
      <button onclick="removePersonal(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.85rem;">✕</button>
    </div>`).join('');

  // Buddy personal sections (read-only)
  const buddySections = document.getElementById('cl-buddy-sections');
  let bhtml = '';
  for (const mid of trip.members) {
    if (mid === uid) continue;
    const idx = trip.members.indexOf(mid);
    const bname = (trip.memberNames||[])[idx] || (trip.memberEmails||[])[idx] || mid;
    const bitems = (trip.personal && trip.personal[mid]) || [];
    if (!bitems.length) continue;
    const bChecked = bitems.filter(x=>x.checked).length;
    bhtml += `<div style="margin-top:10px;"><div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);margin-bottom:4px;">👤 ${bname} (${bChecked}/${bitems.length})</div>`;
    bhtml += bitems.map(item => `
      <div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:0.72rem;opacity:0.6;">
        <span style="${item.checked?'text-decoration:line-through;':''}flex:1;">${item.checked?'✅':'⬜'} ${item.name}</span>
      </div>`).join('');
    bhtml += '</div>';
  }
  buddySections.innerHTML = bhtml;

  // Progress
  const allItems = shared.length + pers.length;
  const allChecked = shared.filter(x=>x.checked).length + pers.filter(x=>x.checked).length;
  const pct = allItems ? Math.round(allChecked/allItems*100) : 0;
  document.getElementById('cl-progress').innerHTML = `<div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;"><div style="background:var(--accent);height:100%;width:${pct}%;transition:width 0.3s;"></div></div><div style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;">${allChecked}/${allItems} — ${pct}%</div>`;

  // Wishlist
  const wish = (trip.wishlist && trip.wishlist[uid]) || [];
  document.getElementById('wishlist-items').innerHTML = wish.map((item, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.75rem;color:var(--accent);">
      <span style="flex:1;">• ${item}</span>
      <button onclick="promoteWish(${i})" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:0.8rem;">↑</button>
      <button onclick="removeWish(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;">✕</button>
    </div>`).join('');
}

function tripRef() { return tripsCol().doc(currentTripId); }

async function saveTripMeta() {
  if (!currentTripId) return;
  const date = document.getElementById('cl-next-date').value || '';
  const site = document.getElementById('cl-site').value || '';
  await tripRef().update({ date, site });
  scheduleNotification(date);
  // Show/hide calendar button
  const calBtn = document.getElementById('cl-cal-btn');
  if (calBtn) calBtn.style.display = date ? '' : 'none';
}

function addToCalendar() {
  const date = document.getElementById('cl-next-date').value;
  const site = document.getElementById('cl-site').value || 'Dive';
  if (!date) return;
  const d = date.replace(/-/g, '');
  const title = '🤿 ' + site;
  const desc = 'Dive trip - check your checklist!';
  // Build .ics with attendees if buddies exist
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MrBinioDive//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:' + d,
    'DTEND;VALUE=DATE:' + d,
    'SUMMARY:' + title,
    'DESCRIPTION:' + desc,
    'ORGANIZER;CN=' + myName() + ':mailto:' + myEmail()
  ];
  // Add buddies as attendees
  if (currentTripId) {
    tripsCol().doc(currentTripId).get().then(snap => {
      const trip = snap.data();
      const emails = trip.memberEmails || [];
      emails.forEach((email, i) => {
        if (email !== myEmail()) {
          const name = (trip.memberNames||[])[i] || email;
          lines.push('ATTENDEE;CN=' + name + ';RSVP=TRUE:mailto:' + email);
        }
      });
      finishIcs(lines, date);
    });
  } else {
    finishIcs(lines, date);
  }
}

function finishIcs(lines, date) {
  lines.push('END:VEVENT','END:VCALENDAR');
  const ics = lines.join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'dive-' + date + '.ics';
  a.click();
  URL.revokeObjectURL(url);
}

async function toggleShared(i) {
  const snap = await tripRef().get(); const d = snap.data();
  d.shared[i].checked = !d.shared[i].checked;
  await tripRef().update({ shared: d.shared });
}

async function togglePersonal(i) {
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  d.personal[uid][i].checked = !d.personal[uid][i].checked;
  await tripRef().update({ ['personal.'+uid]: d.personal[uid] });
}

async function addSharedItem() {
  const input = document.getElementById('cl-new-shared');
  const val = input.value.trim(); if (!val) return;
  const snap = await tripRef().get(); const d = snap.data();
  d.shared.push({name:val, checked:false});
  await tripRef().update({ shared: d.shared });
  input.value = '';
}

async function addPersonalItem() {
  const input = document.getElementById('cl-new-personal');
  const val = input.value.trim(); if (!val) return;
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  if (!d.personal[uid]) d.personal[uid] = [];
  d.personal[uid].push({name:val, checked:false});
  await tripRef().update({ ['personal.'+uid]: d.personal[uid] });
  input.value = '';
}

async function removeShared(i) {
  const snap = await tripRef().get(); const d = snap.data();
  d.shared.splice(i, 1);
  await tripRef().update({ shared: d.shared });
}

async function removePersonal(i) {
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  d.personal[uid].splice(i, 1);
  await tripRef().update({ ['personal.'+uid]: d.personal[uid] });
}

async function inviteBuddy() {
  const input = document.getElementById('cl-buddy-email');
  const email = input.value.trim().toLowerCase(); if (!email) return;
  // Find user by email
  // We store the email and resolve uid when they open the app
  const snap = await tripRef().get(); const d = snap.data();
  if (d.memberEmails && d.memberEmails.includes(email)) {
    showToast(lang==='pl'?'Buddy już dodany':'Buddy already added'); return;
  }
  const emails = d.memberEmails || [];
  const names = d.memberNames || [];
  emails.push(email);
  names.push(email.split('@')[0]);
  await tripRef().update({ memberEmails: emails, memberNames: names, pendingInvites: firebase.firestore.FieldValue.arrayUnion(email) });
  input.value = '';
  showToast(lang==='pl'?'📨 Zaproszenie wysłane!':'📨 Invite sent!');
}

async function joinPendingTrip() {
  const uid = myUid(); const email = myEmail();
  // Check if there's a trip with my email in pendingInvites
  const snap = await tripsCol().where('pendingInvites','array-contains',email).where('active','==',true).limit(1).get();
  if (snap.empty) return false;
  const doc = snap.docs[0];
  const d = doc.data();
  // Add me as member
  const members = d.members || [];
  if (!members.includes(uid)) members.push(uid);
  // Update my name in memberNames
  const idx = (d.memberEmails||[]).indexOf(email);
  const names = d.memberNames || [];
  if (idx >= 0) names[idx] = myName();
  // Init my personal list
  const personal = d.personal || {};
  if (!personal[uid]) personal[uid] = DEFAULT_PERSONAL.map(name => ({name, checked:false}));
  const wishlist = d.wishlist || {};
  if (!wishlist[uid]) wishlist[uid] = [];
  await tripsCol().doc(doc.id).update({
    members, memberNames: names, personal, wishlist,
    pendingInvites: firebase.firestore.FieldValue.arrayRemove(email)
  });
  currentTripId = doc.id;
  subscribeTrip();
  return true;
}

async function addWishlistItem() {
  const input = document.getElementById('cl-new-wish');
  const val = input.value.trim(); if (!val) return;
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  const wish = (d.wishlist && d.wishlist[uid]) || [];
  wish.push(val);
  await tripRef().update({ ['wishlist.'+uid]: wish });
  input.value = '';
}

async function removeWish(i) {
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  const wish = d.wishlist[uid] || [];
  wish.splice(i, 1);
  await tripRef().update({ ['wishlist.'+uid]: wish });
}

async function promoteWish(i) {
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  const wish = d.wishlist[uid] || [];
  const item = wish.splice(i, 1)[0];
  const pers = d.personal[uid] || [];
  pers.push({name:item, checked:false});
  await tripRef().update({ ['wishlist.'+uid]: wish, ['personal.'+uid]: pers });
}

async function resetChecklist() {
  if (!confirm(lang==='pl'?'Zresetować checklistę? Wishlist trafi do listy osobistej.':'Reset checklist? Wishlist items will move to personal list.')) return;
  const uid = myUid();
  const snap = await tripRef().get(); const d = snap.data();
  // Uncheck shared
  d.shared.forEach(x => x.checked = false);
  // Move wishlist to personal, uncheck personal
  const pers = (d.personal[uid]||[]).map(x => ({...x, checked:false}));
  const wish = (d.wishlist&&d.wishlist[uid]) || [];
  wish.forEach(w => { if (!pers.find(p=>p.name===w)) pers.push({name:w, checked:false}); });
  await tripRef().update({
    shared: d.shared,
    ['personal.'+uid]: pers,
    ['wishlist.'+uid]: [],
    date: '', site: ''
  });
  showToast(lang==='pl'?'✅ Checklista zresetowana!':'✅ Checklist reset!');
}

async function newTrip() {
  if (!confirm(lang==='pl'?'Zakończyć ten trip i stworzyć nowy?':'End this trip and create a new one?')) return;
  // Deactivate current
  if (currentTripId) await tripRef().update({ active: false });
  const uid = myUid();
  const doc = await tripsCol().add({
    active: true, date: '', site: '',
    createdBy: uid, members: [uid],
    memberEmails: [myEmail()], memberNames: [myName()],
    shared: DEFAULT_SHARED.map(name => ({name, checked:false})),
    personal: { [uid]: DEFAULT_PERSONAL.map(name => ({name, checked:false})) },
    wishlist: { [uid]: [] }
  });
  currentTripId = doc.id;
  subscribeTrip();
  showToast(lang==='pl'?'🆕 Nowy trip!':'🆕 New trip!');
}

function scheduleNotification(dateStr) {
  if (!dateStr || !('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission();
  const uid = myUid(); if (!uid) return;
  localStorage.setItem('cl_remind_' + uid, dateStr);
}

function checkReminder() {
  const uid = myUid(); if (!uid) return;
  const dateStr = localStorage.getItem('cl_remind_' + uid);
  if (!dateStr) return;
  const diff = (new Date(dateStr) - new Date()) / (1000*60*60);
  if (diff > 0 && diff <= 24 && Notification.permission === 'granted') {
    new Notification('🤿 Dive tomorrow!', { body: 'Check your dive checklist!', icon: 'icon.svg' });
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
