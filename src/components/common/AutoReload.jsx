import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../contexts/NetworkContext';

const AutoReload = ({ children }) => {
  const { isOnline, reconnectCount } = useNetworkStatus();
  const [isReloading, setIsReloading] = useState(false);
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    if (reconnectCount > 0) {
      console.log('[AUTO RELOAD] Network reconnected, checking for failed chunks...');
      
      // Show reconnected message briefly
      setShowReconnectedMessage(true);
      setTimeout(() => setShowReconnectedMessage(false), 3000);

      // Check if there are any failed dynamic imports by trying to reload the current route
      const hasFailedChunks = sessionStorage.getItem('hasNetworkError');
      
      if (hasFailedChunks) {
        console.log('[AUTO RELOAD] Failed chunks detected, reloading page...');
        setIsReloading(true);
        
        // Clear the error flag
        sessionStorage.removeItem('hasNetworkError');
        
        // Reload after a short delay to ensure network is stable
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  }, [reconnectCount]);

  // Listen for chunk load errors and mark them
  useEffect(() => {
    const handleChunkError = (event) => {
      if (event.target.tagName === 'SCRIPT' && event.target.src.includes('assets/')) {
        console.log('[AUTO RELOAD] Chunk load error detected:', event.target.src);
        sessionStorage.setItem('hasNetworkError', 'true');
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('Failed to fetch') || 
           event.reason.message.includes('dynamically imported module'))) {
        console.log('[AUTO RELOAD] Dynamic import error detected:', event.reason.message);
        sessionStorage.setItem('hasNetworkError', 'true');
      }
    };

    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (isReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Reconnected! Reloading app...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {/* Network status notifications */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}
      
      {showReconnectedMessage && isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span className="text-sm font-medium">Connection restored</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoReload;