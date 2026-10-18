// Service worker StageTerrain : garde l'application utilisable sans réseau.
// À l'installation, il télécharge la page ET tous les fichiers qu'elle utilise
// (JavaScript, CSS, icônes) pour pouvoir les servir plus tard hors ligne.
// Les données (entretiens) ne passent pas par ici : elles sont mises en file
// d'attente dans le navigateur puis envoyées à Supabase au retour du réseau.
const CACHE = 'stageterrain-v3'
const BASE = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png']

async function toutMettreEnCache() {
  const cache = await caches.open(CACHE)
  const rep = await fetch('/index.html', { cache: 'reload' })
  const html = await rep.clone().text()
  // Récupère tous les fichiers /assets/... cités dans la page (noms générés par Vite)
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
  await cache.put('/index.html', rep.clone())
  await cache.put('/', rep)
  await cache.addAll([...new Set([...BASE.filter((u) => u !== '/' && u !== '/index.html'), ...assets])])
}

self.addEventListener('install', (event) => {
  event.waitUntil(toutMettreEnCache())
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

  // Ouverture de l'application : réseau d'abord (pour avoir la dernière version),
  // sinon la page gardée en cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copie = res.clone()
            caches.open(CACHE).then((c) => c.put('/index.html', copie))
          }
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Fichiers (JS, CSS, images) : cache d'abord, sinon réseau (et on garde une copie)
  event.respondWith(
    caches.match(req).then(
      (trouve) =>
        trouve ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copie = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copie))
          }
          return res
        })
    )
  )
})
