var VERSION = 'v2';

var cacheFiles = [
/*  "https://cdnjs.cloudflare.com/ajax/libs/engine.io-client/3.2.1/engine.io.min.js",

  self.registration.scope,
  self.registration.scope+'js/util/canvas2d.js',
  self.registration.scope+'js/runtime/runtime.js',
  self.registration.scope+'js/runtime/screen.js',
  self.registration.scope+'js/runtime/sprite.js',
  self.registration.scope+'js/runtime/audio/audio.js',
  self.registration.scope+'js/runtime/audio/beeper.js',
  self.registration.scope+'js/play/player.js',
  self.registration.scope+'js/play/playerclient.js',
  self.registration.scope+'sw.js'*/
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener('fetch', function(event) {
  //console.info(event.request);
  if (event.request.method != "GET" || event.request.url.indexOf("/engine.io/")>0)
  {
    return event.respondWith(fetch(event.request)) ;
  }

  /* cache then network with caching */
  event.respondWith(
    caches.open(VERSION).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  );
});
