
const CACHE_NAME = 'seeta-narayan-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Error handling helper
const handleError = (error, action) => {
  console.error(`Service worker ${action} error:`, error);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => handleError(error, 'installation'))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Safety check for null/undefined request
        if (!event.request || !event.request.url) {
          return fetch(event.request);
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Safety check for null/undefined response
            if (!response || !response.url) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Don't cache API requests, admin routes, or if response is invalid
            if (!event.request.url.includes('/api/') && 
                !event.request.url.includes('/admin') && 
                response && 
                response.status === 200) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => handleError(error, 'caching'));
            }

            return response;
          }
        ).catch(error => {
          handleError(error, 'fetch');
          // Try to return something from cache on network failure
          return caches.match('/offline.html') || new Response('Network error occurred', {
            status: 503,
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
      .catch(error => {
        handleError(error, 'cache match');
        return fetch(event.request);
      })
  );
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        }).filter(Boolean)
      );
    }).catch(error => handleError(error, 'activation'))
  );
});

// Handle push notifications
self.addEventListener('push', function(event) {
  try {
    let notificationData = { title: 'New Notification', body: 'You have a new notification', url: '/' };
    
    if (event.data) {
      try {
        notificationData = event.data.json();
      } catch (e) {
        const text = event.data.text();
        notificationData = { 
          title: 'New Notification', 
          body: text,
          url: '/'
        };
      }
    }
    
    const options = {
      body: notificationData.body || 'You have a new notification',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      data: {
        url: notificationData.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  } catch (error) {
    handleError(error, 'push notification');
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
        .catch(error => handleError(error, 'notification click'))
    );
  }
});

// Add an offline fallback page
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/offline.html');
      })
    );
  }
});
