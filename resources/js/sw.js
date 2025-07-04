self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('chatbot-static-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/css/app.css',
                '/js/app.js',
                '/images/normal.png',
                '/images/speaking.png',
                '/images/hearing.png',
                // Add other essential assets
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Don't cache API calls
                if (event.request.url.includes('/api/')) {
                    return fetchResponse;
                }
                
                return caches.open('chatbot-dynamic').then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Fallback for offline
            if (event.request.url.includes('/api/')) {
                return new Response(JSON.stringify({ 
                    error: 'You are currently offline' 
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        })
    );
});