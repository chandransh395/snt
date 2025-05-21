
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
