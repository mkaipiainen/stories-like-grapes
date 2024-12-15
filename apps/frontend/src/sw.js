import { precacheAndRoute } from 'workbox-precaching';

// Injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: 'icon-192x192.png', // or your custom icon
		});
	}
});

self.addEventListener('notificationclick', event => {
	event.notification.close();
	event.waitUntil(
		clients.openWindow('/') // or a specific URL
	);
});
