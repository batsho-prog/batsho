/* Batsho Service Worker - sw.js */
self.addEventListener('push', function(event){
  let data = {};
  try{ data = event.data ? event.data.json() : {}; }catch(e){ data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Batsho';
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: (data.data && data.data.url) || data.url || '/' },
    vibrate: [200,100,200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for(let c of list){ if(c.url.includes(self.location.origin) && 'focus' in c){ c.navigate(url); return c.focus(); } }
    if(clients.openWindow) return clients.openWindow(url);
  }));
});
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(clients.claim()); });

