// Push notifications (Web Push with VAPID). The phone subscribes here and the
// subscription is saved to users/{uid}/push/{id}; functions/main.py sends the
// "OK to fly" and reminder notifications. On iPhone this works only when the
// app was added to the Home Screen (iOS 16.4+).
const VAPID_PUBLIC_KEY = 'BCr9lFlqmjZIM7iORoHQOFKqcBw3MK969pzHaF015ewY0psDnEu5-QJl1bmhxh7t_VbEmY8edA16z6fLwe8UKeI';
const PL = (pl, en) => lang === 'pl' ? pl : en;

function pushSupported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isStandalone() { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; }
function b64ToBytes(s) {
  const pad = '='.repeat((4 - s.length % 4) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
async function subDocId(sub) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sub.endpoint));
  return Array.from(new Uint8Array(h).slice(0, 12), b => b.toString(16).padStart(2, '0')).join('');
}
// null until checked; the Home tile asks to turn notifications on while false
let pushOn = null;
function setPushOn(on) {
  const was = pushOn;
  pushOn = on;
  if (was !== null && was !== on && document.getElementById('panel-home')?.classList.contains('active')) renderHome();
}
function homePushTile() {
  if (!pushSupported() || (isIOS() && !isStandalone()) || Notification.permission === 'denied') return '';
  if (pushOn === null) {
    currentSubscription().catch(() => null).then(s => {
      pushOn = !!s;
      if (!s && document.getElementById('panel-home')?.classList.contains('active')) renderHome();
    });
    return '';
  }
  if (pushOn) return '';
  return `<section class="tile tile-remind tile-push" onclick="enablePush()">
    <small>${PL('Powiadomienia', 'Notifications')}</small>
    <p>${PL('Włącz, a telefon da znać, kiedy możesz lecieć, i przypomni o serwisie, badaniach i ubezpieczeniu.',
      'Turn on and your phone will tell you when it is OK to fly, and remind you about service, medical and insurance.')}</p>
    <button class="btn-solid">${PL('Włącz powiadomienia', 'Turn on notifications')}</button>
  </section>`;
}
function pushCol() { return db.collection('users').doc(myUid()).collection('push'); }

async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

async function enablePush() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { showToast(PL('Powiadomienia są zablokowane w ustawieniach telefonu', 'Notifications are blocked in your settings')); return renderPushCard(); }
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ||
      await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC_KEY) });
    await pushCol().doc(await subDocId(sub)).set({
      subscription: JSON.parse(JSON.stringify(sub)), lang,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Stockholm',
      device: navigator.userAgent.slice(0, 120), createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast(PL('Powiadomienia włączone', 'Notifications on'));
    setPushOn(true);
  } catch (e) {
    showToast('❌ ' + e.message);
  }
  renderPushCard();
}

async function disablePush() {
  try {
    const sub = await currentSubscription();
    if (sub) { await pushCol().doc(await subDocId(sub)).delete().catch(() => {}); await sub.unsubscribe(); }
    showToast(PL('Powiadomienia wyłączone', 'Notifications off'));
  } catch (e) { showToast('❌ ' + e.message); }
  renderPushCard();
}

async function testPush() {
  try {
    const res = await firebase.app().functions('us-central1').httpsCallable('test_push')();
    showToast(PL(`Wysłano na ${res.data.sent} urządz.`, `Sent to ${res.data.sent} device(s)`));
  } catch (e) {
    showToast(PL('Serwer powiadomień jeszcze nie działa', 'The notification server is not live yet') + ' (' + (e.code || e.message) + ')');
  }
}

async function renderPushCard() {
  const el = document.getElementById('push-card-body');
  if (!el) return;
  if (!pushSupported() || (isIOS() && !isStandalone())) {
    el.innerHTML = `<p class="muted">${isIOS()
      ? PL('Na iPhonie powiadomienia działają tylko z aplikacji na ekranie początkowym: w Safari dotknij <b>Udostępnij</b> → <b>Do ekranu początkowego</b>, otwórz aplikację z ikony i wróć tutaj.',
           'On iPhone notifications only work from the Home Screen app: in Safari tap <b>Share</b> → <b>Add to Home Screen</b>, open the app from its icon and come back here.')
      : PL('Ta przeglądarka nie obsługuje powiadomień push.', 'This browser does not support push notifications.')}</p>`;
    return;
  }
  const sub = await currentSubscription().catch(() => null);
  setPushOn(!!sub);
  const blocked = Notification.permission === 'denied';
  el.innerHTML = `
    <p class="muted">${PL('Telefon przypomni Ci, kiedy kończy się zakaz lotu, oraz o serwisie sprzętu, badaniach i ubezpieczeniu (14 dni, 3 dni i w dniu terminu).',
      'Your phone will tell you when the no-fly time ends, and remind you about gear service, medical and insurance (14 days, 3 days and on the day).')}</p>
    ${blocked ? `<p class="muted warn-text">${PL('Powiadomienia są zablokowane w ustawieniach telefonu dla tej aplikacji.', 'Notifications are blocked for this app in your phone settings.')}</p>` : ''}
    <div class="push-actions">
      ${sub ? `<span class="push-on">● ${PL('Włączone na tym urządzeniu', 'On for this device')}</span>
        <button class="btn-ghost" onclick="testPush()">${PL('Wyślij test', 'Send a test')}</button>
        <button class="btn-ghost" onclick="disablePush()">${PL('Wyłącz', 'Turn off')}</button>`
      : `<button class="btn-solid" onclick="enablePush()" ${blocked ? 'disabled' : ''}>${PL('Włącz powiadomienia', 'Turn on notifications')}</button>`}
    </div>`;
}
