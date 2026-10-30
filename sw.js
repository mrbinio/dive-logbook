// Offline support: the app shell opens without a connection.
// Own files: network first (always the newest deploy), cache as fallback.
// Libraries and fonts from CDNs: cache first (versioned URLs never change).
// Firestore/Auth traffic is never touched — Firestore keeps its own offline cache.
const CACHE = 'mrbinio-v22';
const SHELL = ['./', 'index.html', 'style.css', 'theme.css', 'app.js', 'divetools.js', 'ocean.js', 'intro.js', 'sharecard.js', 'badges.js', 'wrapped.js', 'signature.js', 'push.js', 'trip.js', 'planner.js', 'tripplan.js',
  'suunto.js', 'shearwater.js', 'dive3d.js', 'diver.svg', 'icon.svg', 'icon-192.png', 'manifest.json'];
const CDN = ['www.gstatic.com', 'unpkg.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'sql.js.org'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // no-cache: revalidate with the server; GitHub Pages sends max-age=600, which would keep an old version for 10 min
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
    return;
  }

  // Only the Firebase SDK files from gstatic, not other Google endpoints
  const isSdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (CDN.includes(url.hostname) && (url.hostname !== 'www.gstatic.com' || isSdk)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});

// Push notifications sent by functions/main.py
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: e.data && e.data.text() }; }
  const shown = self.registration.showNotification(d.title || 'Mr.Binio', {
    body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag, icon: 'icon-192.png', badge: 'icon-192.png',
    vibrate: [60, 40, 60], timestamp: Date.now(),
    // keep only ?tab=… so the click opens this copy of the app (GitHub Pages or Firebase), not the server's URL
    data: { url: new URL(new URL(d.url || './', self.registration.scope).search, self.registration.scope).href }
  });
  // Number of overdue reminders on the Home Screen icon
  const badge = typeof d.badge !== 'number' || !navigator.setAppBadge ? null
    : d.badge ? navigator.setAppBadge(d.badge) : navigator.clearAppBadge();
  e.waitUntil(Promise.all([shown, badge && badge.catch(() => {})]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    // An open app switches to the tab named in the url (?tab=gear, ?tab=checklist…)
    for (const c of list) { if ('focus' in c) { c.postMessage({ type: 'open', url }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
