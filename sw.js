// アプリ一式をスマホに保存して、ホーム画面から素早く開けるようにする Service Worker
const CACHE = 'roulette-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fonts/mochiy-pop-one.woff2',
  'fonts/creepster.woff2',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
];
// ページ本体はネットから最新を取りに行くが、この時間を過ぎたら保存済みのものを表示する
const PAGE_TIMEOUT_MS = 1500;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(pageFirst(req));
  } else {
    // フォント・アイコンなどは保存済みのものをすぐ使う
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});

async function pageFirst(req) {
  const cache = await caches.open(CACHE);
  const network = fetch(req).then(res => {
    if (res.ok) cache.put('index.html', res.clone());
    return res;
  });
  const timeout = new Promise(resolve => setTimeout(resolve, PAGE_TIMEOUT_MS));
  const fresh = await Promise.race([network.catch(() => null), timeout]);
  if (fresh) return fresh;
  const saved = await cache.match('index.html');
  return saved || network;
}
