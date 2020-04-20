const CACHE_NAME = 'pwa-test-v1';
const CACHE_FILES = [
  '.',
  'index.html',
  'assets/js/common.js',
  'assets/js/main.js',
  'assets/js/index.js',
  'assets/img/favicon.ico',
  'assets/img/pwa-test-192x192.png',
  // 'https://maps.googleapis.com/maps/api/js',
  'assets/vendor/bootstrap.min.css',
  'assets/vendor/fontawesome/css/fontawesome.min.css',
  'assets/vendor/fontawesome/css/solid.min.css',
  'assets/vendor/jquery-3.5.0.min.js',
  'assets/vendor/popper.min.js',
  'assets/vendor/bootstrap.min.js',
  'assets/vendor/jsQR.min.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
});

self.addEventListener('activate', event => {
  var deleteCacheNames = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !deleteCacheNames.includes(key);
        }).map(key => {
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
          return response;
      }

      // fetch用リクエストをclone
      let fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }

        // cache用responseをclone
        let responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
              });

        return response;
      });
    })
  );
});