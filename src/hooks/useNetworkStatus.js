import { useState, useEffect, useRef } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const lastOnlineTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now();
      console.log('[NETWORK] Connection restored');
      
      setIsOnline(true);
      
      // Only count as reconnection if we were actually offline for more than 1 second
      if (wasOffline && (now - lastOnlineTimeRef.current > 1000)) {
        setReconnectCount(prev => {
          const newCount = prev + 1;
          console.log('[NETWORK] Reconnection detected, count:', newCount);
          return newCount;
        });
      }
      
      setWasOffline(false);
      lastOnlineTimeRef.current = now;
    };

    const handleOffline = () => {
      console.log('[NETWORK] Connection lost');
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, reconnectCount]);

  console.log('[NETWORK STATUS HOOK] Returning values:', { isOnline, wasOffline, reconnectCount });
  
  return {
    isOnline,
    wasOffline,
    isReconnected: isOnline && wasOffline,
    reconnectCount // This changes each time we reconnect, useful for triggering effects
  };
};

export default useNetworkStatus;