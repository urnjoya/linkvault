const CACHE_NAME = "linkvault-cache-v1.0.0";
const urlsToCache = [
    "/linkvault/",
    "/linkvault/index.html",

    "/linkvault/css/style.css",
    "/linkvault/css/dark.css",

    "/linkvault/js/core.js",
    "/linkvault/js/links.js",
    "/linkvault/js/ui.js",
    "/linkvault/js/organize.js",
    "/linkvault/js/tools.js",
    "/linkvault/js/backup.js",
    "/linkvault/js/analytics.js",
    "/linkvault/js/pwa.js",
    "/linkvault/js/app.js"
];

// INSTALL
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// FETCH
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// ACTIVATE
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});
