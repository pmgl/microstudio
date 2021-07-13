var VERSION = 'v2';

var cacheFiles = [];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.open(VERSION).then(cache => cache.match(event.request)) ;
        })
    )
}) ;
