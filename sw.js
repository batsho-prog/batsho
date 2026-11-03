// sw.js: Batsho
// يجمع: التخزين المؤقت للعمل بدون إنترنت + الإشعارات خارج التطبيق (Push)
// غيّر رقم الإصدار عند كل تحديث كبير حتى يتحدّث عند المستخدمين.
const VERSION = 'batsho-v3';
const SHELL = [
  './', 'index.html', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png',
  'privacy.html', 'terms.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // نخزّن كل ملف على حدة: غياب ملف واحد لا يفشل التثبيت كله
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// الشبكة أولًا (نسخة محدّثة دائمًا)، وإذا انقطع الإنترنت نرجع للمخزّن.
// نتعامل مع ملفات الموقع نفسه فقط، أما Supabase وZEGO وغيرها فلا نتدخل فيها أبدًا.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined)),
      ),
  );
});

// ===== الإشعارات خارج التطبيق =====
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Batsho', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined, // نفس الـ tag يستبدل الإشعار السابق بدل تكديسه
    dir: 'rtl',
    lang: 'ar',
    data: { url: d.url || './' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); } // التطبيق مفتوح: نرجع إليه
      return self.clients.openWindow(url);
    }),
  );
});
