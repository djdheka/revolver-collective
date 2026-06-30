// Revolver Admin — minimal service worker
// Caches the app shell so it loads instantly and survives brief connection drops.
// Live data (events, mixtapes, etc.) still always comes fresh from Supabase —
// this only caches the static page itself, never your database content.

const CACHE_NAME = 'revolver-admin-v1';
const APP_SHELL = [
  '/admin.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
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
  // Network-first for everything: always try to get the latest version,
  // only fall back to the cached shell if the network request fails
  // (e.g. brief connection drop). This keeps admin data accurate while
  // still preventing a blank screen if the connection hiccups.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
