/*
 * Service worker for offline caching.
 * It caches core assets on installation and serves them from cache when offline.
 */

const CACHE_NAME = 'task-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // External scripts required by the app
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js',
  'https://cdn.jsdelivr.net/npm/babel-standalone@7.24.7/babel.min.js',
  'https://unpkg.com/lucide@0.441.0/dist/umd/lucide.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
