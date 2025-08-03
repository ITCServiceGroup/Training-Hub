import React, { createContext, useContext, useState, useEffect } from 'react';

const FullscreenContext = createContext();

export const useFullscreen = () => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};

export const FullscreenProvider = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isFullscreen]);

  return (
    <FullscreenContext.Provider value={{
      isFullscreen,
      toggleFullscreen,
      exitFullscreen
    }}>
      {children}
    </FullscreenContext.Provider>
  );
};

export default FullscreenContext;