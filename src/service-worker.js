/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const CACHE = 'cache-v1';

// Daftar asset yang akan di-cache
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate dan cleanup cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
      self.clients.claim();
    })
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Skip caching untuk request dengan no-store
  const url = new URL(event.request.url);
  // Skip caching untuk halaman utama dan tebakan
  if (url.pathname === '/' || url.pathname.startsWith('/tebakan/')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const response = await fetch(event.request);
        
        // Hanya cache response yang valid dan bukan dari halaman dinamis
        if (response.status === 200 && 
            !response.headers.get('Cache-Control')?.includes('no-store') &&
            !url.pathname.startsWith('/lomba/')) {
          cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        return cache.match(event.request);
      }
    })()
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 