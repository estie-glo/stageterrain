// Service worker StageTerrain : garde l'interface disponible hors ligne.
// Les données (entretiens) ne passent pas par ici : elles sont mises en file
// d'attente dans le navigateur puis envoyées à Supabase au retour du réseau.
const CACHE = 'stageterrain-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/index.html', '/manifest.webmanifest', '/icon.svg'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Supabase : jamais mis en cache

  // Navigation : réseau d'abord, sinon la page en cache
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')))
    return
  }
  // Fichiers statiques : cache d'abord, puis réseau (et on garde une copie)
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
    )
  )
})
