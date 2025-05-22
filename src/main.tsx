
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

// Create a custom offline manager
const OfflineManager = {
  init() {
    this.setupListeners();
    this.checkInitialStatus();
  },

  setupListeners() {
    // Listen to the custom events from service worker
    window.addEventListener('connectivity-change', (event) => {
      const { status } = event.detail;
      console.log('Connectivity status:', status);
      
      // Dispatch a custom event that components can listen for
      document.dispatchEvent(new CustomEvent('app-connectivity', {
        detail: { isOnline: status === 'online' }
      }));

      // Add or remove the offline class from the body
      if (status === 'offline') {
        document.body.classList.add('app-offline');
        this.disableNetworkButtons();
      } else {
        document.body.classList.remove('app-offline');
        this.enableNetworkButtons();
      }
    });
  },

  checkInitialStatus() {
    // Initial check
    const initialStatus = navigator.onLine ? 'online' : 'offline';
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { status: initialStatus }
    }));
  },

  disableNetworkButtons() {
    // Find all buttons and links that should be disabled offline
    const networkElements = document.querySelectorAll('button[data-requires-network], a[data-requires-network]');
    networkElements.forEach(el => {
      el.classList.add('offline-disabled');
      if (el.tagName === 'BUTTON') {
        (el as HTMLButtonElement).disabled = true;
      }
    });
  },

  enableNetworkButtons() {
    // Re-enable previously disabled elements
    const disabledElements = document.querySelectorAll('.offline-disabled');
    disabledElements.forEach(el => {
      el.classList.remove('offline-disabled');
      if (el.tagName === 'BUTTON') {
        (el as HTMLButtonElement).disabled = false;
      }
    });
  }
};

// Initialize the offline manager
window.addEventListener('DOMContentLoaded', () => {
  OfflineManager.init();
});

// Add performance monitoring
const performanceObserver = () => {
  if ('PerformanceObserver' in window) {
    try {
      // Observer for long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Only log long tasks over 100ms
          if (entry.duration > 100) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Observer for layout shifts (CLS)
      if ('layout-shift' in PerformanceObserver.supportedEntryTypes) {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // @ts-ignore - LayoutShift is not in TypeScript yet
            if (entry.value > 0.1) {
              console.warn(`Large layout shift detected: ${entry.value.toFixed(4)}`, entry);
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Observer for largest contentful paint
      if ('largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          // @ts-ignore - LargestContentfulPaint is not in TypeScript yet
          console.log(`Largest Contentful Paint: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
      }

      // Observer for first input delay
      if ('first-input' in PerformanceObserver.supportedEntryTypes) {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // @ts-ignore - FirstInputDelay is not in TypeScript yet
            const delay = entry.processingStart - entry.startTime;
            console.log(`First Input Delay: ${delay.toFixed(2)}ms`);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'], buffered: true });
      }

    } catch (e) {
      console.error('Error setting up performance observer:', e);
    }
  }
};

// Run performance monitoring
performanceObserver();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
