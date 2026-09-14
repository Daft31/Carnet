// Service worker minimal pour rendre Kalo installable (PWA) et utilisable hors-ligne
// une fois déjà visitée. Stratégie volontairement simple : réseau en priorité,
// copie mise en cache au passage, secours sur le cache si le réseau échoue
// (offline). Uniquement pour les requêtes GET same-origin : les appels vers
// l'API Mammouth (/api/parse-meal, potentiellement cross-origin sur GitHub
// Pages), Open Food Facts et les CDN externes ne sont jamais interceptés.
const CACHE = 'kalo-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
