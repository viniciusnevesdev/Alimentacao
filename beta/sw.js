const CACHE='nutritrack-beta-v12';
const ASSETS=['./','./index.html','../layout-fixes.css','./manifest.webmanifest','./app.js','./base-index.html','./base-app.js','./styles.css','./nutrition-data.js','./tab-animation.css','./tab-animation.js','./icon-beta-192.png','./icon-beta-512.png','./apple-touch-icon.png','./favicon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();}); 
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('nutritrack-beta-')&&key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
