/* Service worker de EH Barbería: permite instalar la app en el celular.
   Siempre busca primero la versión nueva en internet (así los cambios que subas
   a GitHub se ven de una vez) y solo usa la copia guardada si no hay conexión.
   Firebase, Telegram y los demás servicios externos no pasan por aquí. */
const CACHE = 'eh-barberia-v1';
const BASICOS = ['./', './index.html', './manifest.json', './img/logo.png', './img/icon-192.png', './img/icon-512.png'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).catch(() => {}));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  ev.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
