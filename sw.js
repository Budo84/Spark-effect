const CACHE_NAME = 'spark-editor-v11';

// I nomi devono essere IDENTICI a quelli nella tua cartella GitHub
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icona-app.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Salvataggio icone in corso...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Questo serve a cancellare la vecchia cache v10 e attivare la v11
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
