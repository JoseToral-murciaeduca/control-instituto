const CACHE_NAME = 'instituto-v2';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // Ignorar peticiones a la API de imágenes para que siempre traiga una nueva
    if (event.request.url.includes('pollinations.ai') || event.request.url.includes('openstreetmap')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});