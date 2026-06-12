const CACHE_NAME = 'instituto-v1';

// Evento de instalación
self.addEventListener('install', () => {
    // Fuerza al service worker en espera a volverse activo
    self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Evento de fetch básico (necesario para que el navegador la considere PWA)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});