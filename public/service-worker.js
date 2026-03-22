/* eslint-disable no-restricted-globals */
// Cleanup worker: clears old caches and unregisters itself.
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      await self.clients.claim()
    })(),
  )
})

