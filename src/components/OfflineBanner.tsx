
import { useOfflineStatus } from '@/hooks/use-offline-status';
import { Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const isOffline = useOfflineStatus();
  const [visible, setVisible] = useState(false);
  
  // Add a slight delay for visibility to create a smooth transition
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isOffline) {
      timeout = setTimeout(() => setVisible(true), 100);
    } else {
      setVisible(false);
    }
    
    return () => clearTimeout(timeout);
  }, [isOffline]);

  if (!isOffline && !visible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 p-2 bg-red-600 text-white flex items-center justify-center space-x-2 z-50 text-sm transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <WifiOff size={16} />
      <span>You're offline. Some features may be limited but you can still browse the site.</span>
    </div>
  );
};

export default OfflineBanner;
