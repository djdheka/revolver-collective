// Revolver Collective (public site) — minimal service worker
// Caches the homepage shell so it loads instantly and survives brief connection drops.
// Separate cache name from the admin panel's service worker, so the two never conflict.

const CACHE_NAME = 'revolver-site-v1';
const APP_SHELL = [
  '/index.html',
  '/site-manifest.json',
  '/site-icon-192.png',
  '/site-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first: always try fresh content first, only fall back to the
  // cached shell if the network request fails (e.g. brief connection drop).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
