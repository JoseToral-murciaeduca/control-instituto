const CACHE_NAME = 'instituto-v1';
const urlsToCache = [
    '/control-instituto/',
    '/control-instituto/index.html',
    '/control-instituto/app.js',
    '/control-instituto/manifest.json'
];

// Instalar y guardar en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Interceptar peticiones (Modo Offline)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});