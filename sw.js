// یہ سروس ورکر ہمیشہ پہلے انٹرنیٹ سے تازہ فائل لیتا ہے۔
// انٹرنیٹ نہ ہو تو آخری محفوظ کاپی سے ایپ چلتی ہے۔
// اس لیے index.html بدلنے پر یہاں کچھ بدلنے کی ضرورت نہیں۔
const CACHE = 'circuit-trainer';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: 'reload' })).then(r => r.ok && c.put(f, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const isPage = r.mode === 'navigate';
  e.respondWith(
    fetch(r, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(isPage ? './index.html' : r, copy));
        }
        return res;
      })
      .catch(() => caches.match(isPage ? './index.html' : r).then(hit => hit || caches.match('./index.html')))
  );
});
