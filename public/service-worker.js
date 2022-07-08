const PRECACHE = 'precache-v3.20220708';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/noted-logo-animated.gif',
    '/noted-logo-static.gif',
    '/noted-logo-static-96.png',
    '/noted-logo-static-144.png',
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
  const staticCaches = [PRECACHE];

  event.waitUntil(
    caches.keys()
      .then((names) => names.filter(name => !staticCaches.includes(name)))
      .then(
        (cachesToDelete) => Promise.all(
          cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))
        )
      )
      .then(() => self.clients.claim())
  );
});

// https://developer.chrome.com/docs/workbox/caching-strategies-overview/
self.addEventListener('fetch', async (event) => {
  if (event.request.destination === 'image') {
    // caches.match(event.request.url).then((cachedResponse) => {
    //   // Return a cached response if we have one
    //   if (cachedResponse) {
    //     return cachedResponse;
    //   }

    //   caches.open(RUNTIME).then((cache) => {
    //     // Otherwise, hit the network
    //     return fetch(event.request).then((fetchedResponse) => {
    //       // Add the network response to the cache for later visits
    //       cache.put(event.request, fetchedResponse.clone());

    //       // Return the network response
    //       return fetchedResponse;
    //     });
    //   });
    // });

    event.respondWith(caches.match(event.request).then((cachedResponse) => {
      const fetchedResponse = fetch(event.request).then((networkResponse) => {
        // This clone needs it's own variable, or else an error could result.
        const responseClone = networkResponse.clone();
        caches.open(RUNTIME).then((cache) => cache.put(event.request, responseClone));

        return networkResponse;
      });

      return cachedResponse || fetchedResponse;
    }));
  };
});
