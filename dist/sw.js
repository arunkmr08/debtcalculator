/* Simple, vanilla service worker for offline-first shell + last-seen data */
const CACHE_NAME = 'debtcalc-shell-v1';
const DATA_KEY = 'debtcalc.state.v1'; // matches your store key
const CORE_ASSETS = [
  '/',             // SPA entry
  '/index.html',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Network-first for HTML (keeps app up to date)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return resp;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for everything else (assets)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return resp;
      });
    })
  );
});

// Optional: handle a message to clear cache (e.g., during deployments)
self.addEventListener('message', (e) => {
  if (e.data === 'clear-cache') {
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    );
  }
});