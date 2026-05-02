// RealityCheck Service Worker — minimal, enables PWA installability + share target
const CACHE = 'realitycheck-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
)

self.addEventListener('fetch', e => {
  // Network-first: always try live, fall back to cache for navigation
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/') ?? fetch(e.request))
    )
    return
  }
  e.respondWith(fetch(e.request))
})
