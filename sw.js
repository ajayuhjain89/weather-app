const CACHE_NAME = "weather-minimal-v2";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/weather.js",
  "/api.js",
  "/icons.js",
  "/favicon.png",
  "/manifest.json",
];

// Install event: skip waiting and pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

// Activate event: clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event: network-first strategy with dynamic caching and offline fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Dynamically cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Avoid caching browser extensions or unsupported schemes
          if (event.request.url.startsWith("http")) {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (this serves the app shell and previous data!)
        return caches.match(event.request);
      }),
  );
});
