const CACHE_NAME = 'spark-editor-v15';

// File dell'app + tutte le immagini dei pedali (WebP leggere): così l'app funziona completamente offline
importScripts('catalog.js');

const appFiles = [
  './', './index.html', './labs.html',
  './catalog.js', './pedal_info.js', './cloud_presets.js',
  './validator.js', './ai_engine.js', './store.js', './share.js', './live.js',
  './manifest.json', './icona-app.png', './icona-192.png', './icona-512.png'
];
const imageFiles = Object.values(catalog).flat().map(p => p.img).filter(Boolean).map(p => './' + p);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // un file mancante non deve far fallire l'installazione
      Promise.all(appFiles.concat(imageFiles).map(f => cache.add(f).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // Le chiamate all'AI (altro dominio) e i POST non passano mai dalla cache
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (/\.(webp|jpg|jpeg|png)$/i.test(url.pathname)) {
    // Immagini: cache prima, poi rete
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }
  // Codice e pagine: rete prima (gli aggiornamenti arrivano subito), cache se sei offline
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
