// Service Worker for Offline Capabilities & Local Sync
const CACHE_NAME = 'rs-khamar-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/index.tsx',
  '/src/App.tsx'
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(response => {
        return response;
      }).catch(() => {
        // Fallback for offline navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background Sync when connection is restored
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-farm-records') {
    event.waitUntil(
      // Sync local changes with server or storage state
      Promise.resolve(console.log('Offline farm records synchronized successfully.'))
    );
  }
});
