/* eslint-env browser */

// Service worker used for enabling offline support.
// Uses an "offline-first" strategy, which means that the value from the cache is used first.
// A request for new resources is made in the background.
// If this succeeds, it will be used on the next page load.

const CACHE_NAME = "cache1"; // Change this to force-update the cache.

const urlsToCache = [
    ".",
    "index.html", // Main HTML file
    "manifest.json", // Progressive Web App manifest
    "js/bundle.js", // JS bundle file
    "js/bundle.js.map", // JS source mapping file
    "css/style.css", // Main CSS file
    "css/deps/milligram-1.4.1.css", // Milligram CSS dependency
    "css/deps/normalize-8.0.1.css", // Normalize CSS dependency
    "favicon.ico", // Favicon, IE and fallback for other browsers
    "assets/img/favicon-512x512.png", // Favicon, large
    "assets/img/favicon-192x192.png", // Favicon, medium
    "assets/img/favicon-180x180.png", // Favicon, medium (iOS)
    "assets/img/faq-export-ing-1.png", // Images used in the FAQ
    "assets/img/faq-export-ing-2.png",
    "assets/example-parameters.json", // Demo parameters
];

// Listen for the install event, which fires when the service worker is installing
self.addEventListener("install", (event) => {
    // Ensures the install event doesn't complete until after the cache promise resolves
    // This is so we don't move on to other events until the critical initial cache is done
    event.waitUntil(
        // Open a named cache, then add all the specified URLs to it
        caches
            .open(CACHE_NAME)
            .then((cache) =>
                Promise.all(
                    urlsToCache.map((url) =>
                        cache
                            .add(url)
                            .catch((err) =>
                                console.log(
                                    "Install: failed to fetch " + url + ": ",
                                    err,
                                ),
                            ),
                    ),
                ),
            ),
    );
});

// Listen for the activate event, which is fired after installation
// Activate is when the service worker actually takes over from the previous
// version, which is a good time to clean up old caches
self.addEventListener("activate", (event) => {
    console.log("Service worker active. Ready to serve offline!");
    event.waitUntil(
        // Get the keys of all the old caches
        caches
            .keys()
            // Ensure we don't resolve until all the promises do (i.e. each key has been deleted)
            .then((keys) =>
                Promise.all(
                    keys
                        // Remove any cache that matches the current cache name
                        .filter((key) => key !== CACHE_NAME)
                        // Map over the array of old cache names and delete them all
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
});

// Listen for browser fetch events. These fire any time the browser tries to load
// any outside resources
self.addEventListener("fetch", function (event) {
    // This lets us control the response
    // We pass in a promise that resolves with a response object
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Start fetching the latest content from the server
            const fetchContent = fetch(event.request)
                // Then we open our cache
                .then((response) =>
                    Promise.all([
                        caches.open(CACHE_NAME),
                        Promise.resolve(response),
                    ]),
                )
                // Then we put the request into the cache, so we have it offline next time
                .then(([cache, response]) => {
                    // We have to clone the response as response streams can only be read once
                    // This way we can put one copy in the cache and return the other to the browser
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch((err) => {
                    console.log(
                        "Failed to fetch " + event.request.url + ": ",
                        err,
                    );
                });

            // Check whether we have a matching response for this request in our cache
            if (cachedResponse) {
                // It's in the cache! Serve the response straight from there
                return cachedResponse;
            } else {
                // Wait for the new fetch to complete.
                return fetchContent;
            }
        }),
    );
});
