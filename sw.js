const CACHE_NAME = 'dive-logbook-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './suunto.js',
  './shearwater.js',
  './dive3d.js',
  './icon.svg',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/three@0.160.0/build/three.min.js',
  'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for Firebase/API calls, cache-first for assets
  if (e.request.url.includes('firebaseio') || e.request.url.includes('googleapis') || e.request.url.includes('firestore') || e.request.url.includes('nominatim') || e.request.url.includes('open-meteo')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return resp;
    })));
  }
});
