// Service Worker para Web Push Notifications

// Evento: recebe notificação push
self.addEventListener('push', event => {
  const data = event.data?.json() || {};

  const options = {
    body: data.message || 'Nova notificação do HelpDesk',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'HelpDesk', options)
  );
});

// Evento: utilizador clica na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Procura se já existe uma janela aberta
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não existe, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Evento: instalação do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Evento: ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});