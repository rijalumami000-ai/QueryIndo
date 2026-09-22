// QUERYINDO High-Performance Service Worker v3.0 (Anti-Stale Cache Strategy)
const CACHE_NAME = 'queryindo-pwa-v3';

// Only precache static brand assets, NEVER HTML or API endpoints
const STATIC_ASSETS = [
  '/logo.png',
  '/favicon.svg',
  '/manifest.json'
];

// Install: Cache only permanent brand assets, skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

// Activate: Evict ALL old caches immediately and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Strict Freshness for HTML & APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // 1. API Endpoints: ALWAYS DIRECT NETWORK (Bypass SW Cache completely)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/health')) {
    return; // Let browser handle network directly
  }

  // 2. Navigation / HTML Document requests: ALWAYS NETWORK FIRST
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          // If network is healthy, return fresh response directly
          return response;
        })
        .catch(() => {
          // Only fallback to offline cache if user is completely without internet
          return caches.match('/index.html') || new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - QueryIndo</title></head><body style="font-family:sans-serif;text-align:center;padding:3rem;background:#090b10;color:#fff;"><h1>Koneksi Terputus</h1><p>Silakan periksa koneksi internet Anda.</p><button onclick="location.reload()" style="padding:0.6rem 1.2rem;background:#00f2fe;color:#000;font-weight:bold;border:none;border-radius:6px;cursor:pointer;">Muat Ulang</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Vite Hashed Assets (/assets/index-*.js, .css): Cache First, safe because filenames are hashed
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Other static assets (images, icons): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
