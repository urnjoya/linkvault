const CACHE_NAME = "linkvault-cache-v2";

const urlsToCache = [
    "/",
    "/index.html",

    "/css/style.css",
    "/css/cards.css",
    "/css/nav.css",
    "/css/popup.css",
    "/css/dark.css",

    "/js/core.js",
    "/js/links.js",
    "/js/ui.js",
    "/js/organize.js",
    "/js/tools.js",
    "/js/backup.js",
    "/js/analytics.js",
    "/js/pwa.js",
    "/js/app.js"
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