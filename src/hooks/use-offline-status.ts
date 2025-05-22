
import { useState, useEffect } from 'react';

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleConnectivityChange(event: Event) {
      const customEvent = event as CustomEvent;
      setIsOffline(!(customEvent.detail?.isOnline ?? navigator.onLine));
    }

    // Listen for our custom app-connectivity event
    document.addEventListener('app-connectivity', handleConnectivityChange);
    
    // Also listen for standard online/offline events as fallback
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));

    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      document.removeEventListener('app-connectivity', handleConnectivityChange);
      window.removeEventListener('online', () => setIsOffline(false));
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  }, []);

  return isOffline;
}
