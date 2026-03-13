const CACHE = 'asistencia-qr-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // For Google APIs and external scripts, always use network
  if(e.request.url.includes('googleapis') ||
     e.request.url.includes('cdnjs') ||
     e.request.url.includes('script.google.com') ||
     e.request.url.includes('qrserver.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(response){
        if(!response||response.status!==200) return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return response;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
