// ===== VEGA STORE — Service Worker =====
const CACHE_NAME = 'vega-store-v1';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(clients.claim());
});

// Réception d'une notification push (depuis serveur)
self.addEventListener('push', e => {
    let data = { title: '📊 VEGA STORE', body: 'Nouvelle mise à jour !', icon: '/icon-192.png' };
    try { data = { ...data, ...e.data.json() }; } catch (_) { }
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'vega-notif',
            renotify: true,
            data: { url: data.url || '/' }
        })
    );
});

// Clic sur la notification → ouvrir le site
self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/';
    e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const c of list) {
            if (c.url.includes('facture') && 'focus' in c) return c.focus();
        }
        return clients.openWindow(url);
    }));
});
