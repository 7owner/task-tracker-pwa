const CACHE_NAME = 'task-tracker-v1.0';
const STATIC_CACHE_NAME = 'task-tracker-static-v1.0';

// Ressources essentielles à mettre en cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service worker installé avec succès');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprimer les anciens caches
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activé');
      return self.clients.claim();
    })
  );
});

// Stratégie de cache : Cache First pour les ressources statiques, Network First pour le reste
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Cache First pour les ressources statiques
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            console.log('Ressource servie depuis le cache:', request.url);
            return response;
          }
          
          return fetch(request)
            .then(response => {
              // Cloner la réponse car elle ne peut être consommée qu'une fois
              const responseClone = response.clone();
              
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseClone);
                });
              
              return response;
            });
        })
        .catch(error => {
          console.error('Erreur de récupération:', error);
          
          // Retourner une page offline basique pour l'index
          if (request.url.includes('index.html')) {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Hors ligne - Suivi de Tâches</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
                  .offline { color: #6b7280; }
                  .retry { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                </style>
              </head>
              <body>
                <h1>📱 Suivi de Tâches</h1>
                <p class="offline">Vous êtes hors ligne</p>
                <p>L'application nécessite une connexion Internet pour fonctionner.</p>
                <button class="retry" onclick="location.reload()">Réessayer</button>
              </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          
          throw error;
        })
    );
  } else {
    // Network First pour le reste
    event.respondWith(
      fetch(request)
        .then(response => {
          // Mettre en cache les réponses valides
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Essayer de récupérer depuis le cache en cas d'échec réseau
          return caches.match(request);
        })
    );
  }
});

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Nettoyage périodique du cache
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.keys().then(keys => {
          // Garder seulement les 50 dernières entrées
          if (keys.length > 50) {
            const keysToDelete = keys.slice(0, keys.length - 50);
            return Promise.all(
              keysToDelete.map(key => cache.delete(key))
            );
          }
        });
      });
  }
});
