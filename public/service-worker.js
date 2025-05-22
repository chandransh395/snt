const CACHE_NAME = 'seeta-narayan-cache-v3';
const DYNAMIC_CACHE = 'seeta-narayan-dynamic-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/placeholder.svg',
  '/destinations',
  '/about',
  '/blog',
  '/contact'
];

// Assets that should definitely be cached
const STATIC_ASSETS = [
  '/src/index.css',
  '/src/App.css',
  '/lovable-uploads/6c2cfdb5-e191-4f38-a35b-c5357e126036.png'
];

// Error handling helper
const handleError = (error, action) => {
  console.error(`Service worker ${action} error:`, error);
};

// Helper to determine if a request is for an API call
const isApiRequest = (url) => {
  return url.includes('/api/') || 
         url.includes('/supabase') ||
         url.includes('githubusercontent.com') ||
         url.includes('cdn.jsdelivr.net');
};

// Helper to determine if a request is for a static asset
const isStaticAsset = (url) => {
  return url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i);
};

// Helper function to determine if a page should work offline
const isNavigationRequest = (request) => {
  return request.mode === 'navigate' || 
    (request.method === 'GET' && 
     request.headers.get('accept') && 
     request.headers.get('accept').includes('text/html'));
};

// Helper function to add to cache
const addToCache = (cacheName, request, response) => {
  if (response && response.ok) {
    const clone = response.clone();
    caches.open(cacheName).then(cache => {
      cache.put(request, clone);
    });
  }
  return response;
};

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll([...urlsToCache, ...STATIC_ASSETS]);
      })
      .then(() => {
        console.log('[ServiceWorker] Successfully cached app shell');
        return self.skipWaiting();
      })
      .catch(error => {
        handleError(error, 'installation');
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }).filter(Boolean)
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
      .catch(error => handleError(error, 'activation'))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Don't cache cross-origin requests to improve performance
  if (url.origin !== self.location.origin) {
    if (!isApiRequest(request.url)) {
      // For third-party assets, use network with cache fallback
      event.respondWith(
        fetch(request)
          .then(response => {
            // Only cache successful responses
            return addToCache(DYNAMIC_CACHE, request, response);
          })
          .catch(() => {
            return caches.match(request);
          })
      );
    }
    return;
  }

  // API Requests - Network only with offline fallback message
  if (isApiRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          if (isNavigationRequest(request)) {
            return caches.match('/offline.html');
          }
          
          // Return a simple JSON response for API requests
          return new Response(
            JSON.stringify({ 
              error: true, 
              message: 'You are currently offline. Please check your connection.' 
            }),
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }
  
  // HTML Navigation Requests - try cache first, then network
  if (isNavigationRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            const updateCache = fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                  const clone = networkResponse.clone();
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, clone);
                  });
                }
              })
              .catch(() => console.log('[ServiceWorker] Network request failed for:', request.url));
            
            // Don't wait for the network update
            event.waitUntil(updateCache);
            return cachedResponse;
          }
          
          // If not in cache, try network
          return fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.ok) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, clone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Static Assets (JS, CSS, Images, Fonts) - Cache First, Then Network
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            const updateCache = fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, networkResponse.clone());
                  });
                }
              })
              .catch(() => {});
            
            event.waitUntil(updateCache);
            return cachedResponse;
          }
          
          return fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.ok) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, clone);
                });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // Default strategy for everything else - network first, then cache
  event.respondWith(
    fetch(request)
      .then(response => {
        return addToCache(DYNAMIC_CACHE, request, response);
      })
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            return cachedResponse || caches.match('/offline.html');
          });
      })
  );
});

// Handle connectivity changes to notify client pages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_CONNECTIVITY') {
    const clientId = event.source.id;
    
    fetch('/ping.json?_=' + Date.now(), { cache: 'no-store' })
      .then(() => {
        // Connected
        self.clients.get(clientId).then(client => {
          if (client) {
            client.postMessage({
              type: 'CONNECTIVITY_CHANGE',
              status: 'online'
            });
          }
        });
      })
      .catch(() => {
        // Disconnected
        self.clients.get(clientId).then(client => {
          if (client) {
            client.postMessage({
              type: 'CONNECTIVITY_CHANGE',
              status: 'offline'
            });
          }
        });
      });
  }
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

// Listen for network status changes
self.addEventListener('online', event => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTIVITY_CHANGE',
        status: 'online'
      });
    });
  });
});

self.addEventListener('offline', event => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTIVITY_CHANGE',
        status: 'offline'
      });
    });
  });
});
