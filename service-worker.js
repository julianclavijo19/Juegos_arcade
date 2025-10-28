// Service Worker para PWA
const CACHE_NAME = 'arcade-retro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/soundSystem.js',
  '/js/particles.js',
  '/js/achievements.js',
  '/js/stats.js',
  '/js/themes.js',
  '/games/tetris/tetris.html',
  '/games/tetris/tetris.js',
  '/games/tictactoe/tictactoe.html',
  '/games/tictactoe/tictactoe.js',
  '/games/snake/snake.html',
  '/games/snake/snake.js',
  '/games/pong/pong.html',
  '/games/pong/pong.js',
  '/games/spaceinvaders/spaceinvaders.html',
  '/games/spaceinvaders/spaceinvaders.js',
  '/games/connectfour/connectfour.html',
  '/games/connectfour/connectfour.js'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }
        
        // Clonar request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

