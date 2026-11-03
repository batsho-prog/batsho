const C='batsho-v7',SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png','supabase.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// cache first, refresh in the background: slow or blocked networks no longer delay page loads
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
if(r.method!=='GET'||/(supabase\.co|zegocloud\.com|zego\.im)$/.test(u.hostname))return;
e.respondWith(caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(hit=>{
const net=fetch(r).then(n=>{if(n.ok||n.type==='opaque'){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return n}).catch(()=>null);
if(hit){e.waitUntil(net);return hit}
return net.then(n=>n||caches.match('index.html'))}))});
