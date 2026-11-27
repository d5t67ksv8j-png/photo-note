const CACHE_NAME = 'photo-note-shell-v3';
const APP_FILES = [
  './photo-note.html',
  './index.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('photo-note-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const path = url.pathname;
          if (path.endsWith('/photo-note.html')) await cache.put('./photo-note.html', response.clone());
          else if (path.endsWith('/') || path.endsWith('/index.html')) await cache.put('./index.html', response.clone());
        }
        return response;
      } catch (error) {
        const exact = await cache.match(request, {ignoreSearch:true});
        if (exact) return exact;
        const path = url.pathname;
        if (path.endsWith('/photo-note.html')) return (await cache.match('./photo-note.html')) || (await cache.match('./index.html'));
        return (await cache.match('./index.html')) || (await cache.match('./photo-note.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      return new Response('', {status: 504, statusText: 'Offline'});
    }
  })());
});
