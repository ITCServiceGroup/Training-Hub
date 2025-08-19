import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const lastOnlineTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now();
      console.log('[NETWORK CONTEXT] Connection restored');
      
      setIsOnline(true);
      
      // Only count as reconnection if we were actually offline for more than 1 second
      if (wasOffline && (now - lastOnlineTimeRef.current > 1000)) {
        setReconnectCount(prev => {
          const newCount = prev + 1;
          console.log('[NETWORK CONTEXT] Reconnection detected, count:', newCount);
          return newCount;
        });
      }
      
      setWasOffline(false);
      lastOnlineTimeRef.current = now;
    };

    const handleOffline = () => {
      console.log('[NETWORK CONTEXT] Connection lost');
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

  const value = {
    isOnline,
    wasOffline,
    isReconnected: isOnline && wasOffline,
    reconnectCount
  };

  console.log('[NETWORK CONTEXT] Providing values:', value);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within a NetworkProvider');
  }
  console.log('[NETWORK CONTEXT] Hook called, returning:', context);
  return context;
};

export default NetworkContext;