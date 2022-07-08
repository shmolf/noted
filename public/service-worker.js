const PRECACHE = 'precache-v3.20220708';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/public/noted-logo-animated.gif',
    '/public/noted-logo-static.gif',
    '/public/noted-logo-static-96.png',
    '/public/noted-logo-static-144.png',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE, RUNTIME];

  event.waitUntil(
    caches.keys()
      .then((names) => names.filter(name => !currentCaches.includes(name)))
      .then(
        (cachesToDelete) => Promise.all(
          cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))
        )
      )
      .then(() => self.clients.claim())
  );
});
