const cacheName = 'deathcloud-v1';
const assets = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/login.js',
  '/manifest.json',
  '/assets/icon.svg'
];

self.addEventListener('install', installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
