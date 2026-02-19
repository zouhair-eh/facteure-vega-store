// ===== VEGA STORE — Service Worker =====
const CACHE_NAME = 'vega-store-v2';
const URLS_TO_CACHE = ['/'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    e.waitUntil(clients.claim());
});

// ✅ FETCH HANDLER — obligatoire pour que Chrome autorise l'installation PWA
self.addEventListener('fetch', e => {
    // Réseau d'abord, cache en fallback
    e.respondWith(
        fetch(e.request).catch(() =>
            caches.match(e.request).then(r => r || fetch(e.request))
        )
    );
});

// Réception notification push
self.addEventListener('push', e => {
    let data = { title: '📊 VEGA STORE', body: 'Nouvelle mise à jour !' };
    try { data = { ...data, ...e.data.json() }; } catch (_) { }
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.svg',
            vibrate: [200, 100, 200],
            tag: 'vega-notif',
            renotify: true
        })
    );
});

// Clic sur notification
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const c of list) {
            if ('focus' in c) return c.focus();
        }
        return clients.openWindow('/');
    }));
});
