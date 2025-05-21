
const CACHE_NAME = 'seeta-narayan-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
  '/destinations',
  '/about',
  '/blog'
];

// Error handling helper
const handleError = (error, action) => {
  console.error(`Service worker ${action} error:`, error);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => handleError(error, 'installation'))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        }).filter(Boolean)
      );
    }).then(() => {
      // Take control of all clients as soon as the service worker activates
      return self.clients.claim();
    }).catch(error => handleError(error, 'activation'))
  );
});

// Improved fetch event handler with network-first strategy for API routes and cache-first for assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network first strategy for API routes and dynamic content
  if (request.url.includes('/api/') || 
      request.url.includes('/auth') || 
      request.url.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Cache first for HTML navigation routes (destinations, about, blog)
  if (request.mode === 'navigate' || 
     (request.method === 'GET' && 
      request.headers.get('accept') && 
      request.headers.get('accept').includes('text/html'))) {
    
    // Try cache first for these specific routes
    const isSpecificRoute = ['/destinations', '/about', '/blog'].some(route => 
      url.pathname === route || url.pathname.startsWith(`${route}/`)
    );
    
    if (isSpecificRoute) {
      event.respondWith(
        caches.match(request)
          .then(response => {
            return response || fetch(request)
              .then(fetchResponse => {
                // Clone the response to store in cache
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseToCache);
                  });
                return fetchResponse;
              })
              .catch(() => {
                // If both cache and network fail, show offline page
                return caches.match('/offline.html');
              });
          })
      );
      return;
    }
    
    // For other navigation routes, try network first then cache
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets (images, CSS, JS)
  if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
              return fetchResponse;
            });
        })
    );
    return;
  }
  
  // Default strategy
  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request)
          .catch(() => {
            // If it's a navigation request, return the offline page
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // For images, you could return a default offline image
            if (request.url.match(/\.(jpg|png|gif|svg)$/)) {
              return caches.match('/placeholder.svg');
            }
            return new Response('Network error occurred', {
              status: 503,
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
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
      },
      vibrate: [100, 50, 100],
      timestamp: Date.now()
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
      clients.matchAll({type: 'window'})
        .then(function(clientList) {
          // Check if there is already a window/tab open with the target URL
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is already open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
        .catch(error => handleError(error, 'notification click'))
    );
  }
});
