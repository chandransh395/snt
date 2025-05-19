
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
