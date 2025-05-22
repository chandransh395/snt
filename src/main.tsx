
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupSuperAdmin } from './utils/admin-utils';
import { setupBookingNotifications } from './utils/notifications';

// Initialize admin setup
setupSuperAdmin().catch(console.error);

// Initialize booking notifications
setupBookingNotifications();

// Request notification permission if admin
if ('Notification' in window) {
  // Wait for DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    // Check if we're already authorized
    if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  });
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.info('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for service worker updates
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check for updates every hour
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// Add PWA install prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.style.display = 'none';
installButton.className = 'pwa-install-button';
installButton.textContent = 'Install App';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  installButton.style.display = 'block';
  
  document.body.appendChild(installButton);
});

// Add install button functionality
installButton.addEventListener('click', async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    deferredPrompt = null;
    // Hide the install button
    installButton.style.display = 'none';
  }
});

window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed.');
  // Hide the install button
  installButton.style.display = 'none';
});

// Add offline detection
const updateOnlineStatus = () => {
  const offlineIndicator = document.getElementById('offline-indicator');
  
  if (!navigator.onLine) {
    if (!offlineIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'offline-indicator';
      indicator.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        You're offline
      `;
      document.body.appendChild(indicator);
      
      // Add show class with slight delay for animation
      setTimeout(() => {
        indicator.classList.add('show');
      }, 100);
    }
  } else {
    if (offlineIndicator) {
      offlineIndicator.classList.remove('show');
      setTimeout(() => {
        offlineIndicator.remove();
      }, 300);
    }
  }
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();

// Create a performance observer to monitor long tasks
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log long tasks (>50ms) for debugging
        if (entry.duration > 100) {
          console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms', entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.error('PerformanceObserver error:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
