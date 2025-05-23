const CACHE_NAME = 'seeta-narayan-cache-v5';
const DYNAMIC_CACHE = 'seeta-narayan-dynamic-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/placeholder.svg',
  '/lovable-uploads/de74e9a8-b3db-4168-826f-b38d88c1951b.png'
];

// Routes that should be cached for offline access
const OFFLINE_ROUTES = [
  '/',
  '/about',
  '/destinations',
  '/blog', 
  '/contact'
];

// Assets that should definitely be cached with versioning
const STATIC_ASSETS = [
  '/src/index.css',
  '/src/App.css',
  '/lovable-uploads/6c2cfdb5-e191-4f38-a35b-c5357e126036.png',
  '/lovable-uploads/de74e9a8-b3db-4168-826f-b38d88c1951b.png'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 24 * 60 * 60 * 1000, // 24 hours for static assets
  DYNAMIC: 12 * 60 * 60 * 1000, // 12 hours for dynamic content
  API: 5 * 60 * 1000 // 5 minutes for API responses
};

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

// Helper to check if this is a route we should handle offline
const isOfflineRoute = (url) => {
  const path = new URL(url).pathname;
  return OFFLINE_ROUTES.some(route => {
    return path === route || path.startsWith(`${route}/`);
  });
};

// Cache with timestamp for freshness checks
const addToCache = (cacheName, request, response, duration = CACHE_DURATIONS.STATIC) => {
  if (response && response.ok) {
    const clone = response.clone();
    const responseWithTimestamp = clone.blob().then(blob => {
      const headers = new Headers(clone.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-duration', duration.toString());
      return new Response(blob, {
        status: clone.status,
        statusText: clone.statusText,
        headers: headers
      });
    });
    
    caches.open(cacheName).then(cache => {
      responseWithTimestamp.then(timestampedResponse => {
        cache.put(request, timestampedResponse);
      });
    });
  }
  return response;
};

// Check if cached response is fresh
const isCacheFresh = (cachedResponse) => {
  const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
  const cacheDuration = cachedResponse.headers.get('sw-cache-duration');
  
  if (!cacheTimestamp || !cacheDuration) {
    return false; // No timestamp, consider stale
  }
  
  const age = Date.now() - parseInt(cacheTimestamp);
  return age < parseInt(cacheDuration);
};

// Stale-while-revalidate strategy
const staleWhileRevalidate = (request, cacheName, duration) => {
  return caches.match(request).then(cachedResponse => {
    const fetchPromise = fetch(request).then(networkResponse => {
      return addToCache(cacheName, request, networkResponse, duration);
    }).catch(() => cachedResponse);
    
    if (cachedResponse && isCacheFresh(cachedResponse)) {
      // Return fresh cached response immediately
      return cachedResponse;
    } else if (cachedResponse) {
      // Return stale cache but update in background
      fetchPromise.catch(() => {}); // Silent background update
      return cachedResponse;
    } else {
      // No cache, wait for network
      return fetchPromise;
    }
  });
};

// Helper function to get the index.html for client-side routing
const getIndexHtmlFromCache = () => {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match('/index.html');
  });
};

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll([...urlsToCache, ...STATIC_ASSETS, ...OFFLINE_ROUTES]);
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
  
  // Don't cache cross-origin requests except for specific APIs
  if (url.origin !== self.location.origin) {
    if (!isApiRequest(request.url)) {
      event.respondWith(
        staleWhileRevalidate(request, DYNAMIC_CACHE, CACHE_DURATIONS.DYNAMIC)
      );
    }
    return;
  }

  // API Requests - Cache with short duration
  if (isApiRequest(request.url)) {
    event.respondWith(
      staleWhileRevalidate(request, DYNAMIC_CACHE, CACHE_DURATIONS.API)
        .catch(() => {
          if (isNavigationRequest(request)) {
            return caches.match('/offline.html');
          }
          
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
  
  // HTML Navigation Requests - Implement SPA/Offline support with caching
  if (isNavigationRequest(request)) {
    event.respondWith(
      staleWhileRevalidate(request, CACHE_NAME, CACHE_DURATIONS.STATIC)
        .catch(() => {
          if (isOfflineRoute(request.url)) {
            return getIndexHtmlFromCache();
          }
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Static Assets - Cache first with background updates
  if (isStaticAsset(request.url)) {
    event.respondWith(
      staleWhileRevalidate(request, CACHE_NAME, CACHE_DURATIONS.STATIC)
        .catch(() => caches.match('/placeholder.svg'))
    );
    return;
  }
  
  // Default strategy - stale while revalidate
  event.respondWith(
    staleWhileRevalidate(request, DYNAMIC_CACHE, CACHE_DURATIONS.DYNAMIC)
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
