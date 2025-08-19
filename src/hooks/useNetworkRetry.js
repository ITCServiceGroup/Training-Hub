import { useEffect, useRef, useCallback } from 'react';
import useNetworkStatus from './useNetworkStatus';

const useNetworkRetry = () => {
  const { isOnline, reconnectCount } = useNetworkStatus();
  const retryFunctionsRef = useRef(new Set());
  const lastReconnectCountRef = useRef(0);

  // Register a function to be called when network is restored
  const registerRetry = useCallback((retryFunction, key) => {
    const retryItem = { fn: retryFunction, key: key || Date.now() };
    retryFunctionsRef.current.add(retryItem);
    console.log('[NETWORK RETRY] Registered retry function:', retryItem.key, 'Total registered:', retryFunctionsRef.current.size);

    // Return a cleanup function to unregister
    return () => {
      retryFunctionsRef.current.delete(retryItem);
      console.log('[NETWORK RETRY] Unregistered retry function:', retryItem.key, 'Remaining:', retryFunctionsRef.current.size);
    };
  }, []);

  // Manually trigger all registered retry functions
  const retryAll = useCallback(async () => {
    console.log('[NETWORK RETRY] Manually triggering retry for', retryFunctionsRef.current.size, 'registered functions...');
    
    if (retryFunctionsRef.current.size === 0) {
      console.log('[NETWORK RETRY] No functions registered for retry');
      return;
    }

    const retryPromises = Array.from(retryFunctionsRef.current).map(async (retryItem) => {
      try {
        console.log('[NETWORK RETRY] Executing retry function:', retryItem.key);
        await retryItem.fn();
        console.log('[NETWORK RETRY] Successfully retried function:', retryItem.key);
      } catch (error) {
        console.error('[NETWORK RETRY] Failed to retry function:', retryItem.key, error);
      }
    });

    await Promise.allSettled(retryPromises);
    console.log('[NETWORK RETRY] Retry process completed');
  }, []);

  // Auto-retry when network reconnect count changes
  useEffect(() => {
    if (reconnectCount > 0 && reconnectCount !== lastReconnectCountRef.current) {
      console.log('[NETWORK RETRY] Network reconnection detected! Count:', reconnectCount, 'Previous:', lastReconnectCountRef.current);
      lastReconnectCountRef.current = reconnectCount;
      
      console.log('[NETWORK RETRY] Will retry', retryFunctionsRef.current.size, 'functions in 1 second...');
      
      // Small delay to ensure network is stable
      setTimeout(() => {
        retryAll();
      }, 1000);
    }
  }, [reconnectCount, retryAll]);

  return {
    registerRetry,
    retryAll,
    isOnline,
    reconnectCount
  };
};

export default useNetworkRetry;