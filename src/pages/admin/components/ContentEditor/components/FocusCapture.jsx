import React, { createContext, useContext, useState } from 'react';

// Create a context to manage focus capture state
const FocusCaptureContext = createContext({
  isFocusCaptured: false,
  captureFocus: () => {},
  releaseFocus: () => {},
});

// Custom hook to access the focus capture context
export const useFocusCapture = () => useContext(FocusCaptureContext);

// Provider component that manages focus capture state
export const FocusCaptureProvider = ({ children }) => {
  const [isFocusCaptured, setIsFocusCaptured] = useState(false);
  const [captureTarget, setCaptureTarget] = useState(null);

  // Capture focus and prevent it from being taken by other elements
  const captureFocus = (targetId) => {
    setIsFocusCaptured(true);
    setCaptureTarget(targetId);
    
    // Return a function to release the focus
    return () => {
      setIsFocusCaptured(false);
      setCaptureTarget(null);
    };
  };

  // Release focus capture
  const releaseFocus = () => {
    setIsFocusCaptured(false);
    setCaptureTarget(null);
  };

  return (
    <FocusCaptureContext.Provider
      value={{
        isFocusCaptured,
        captureTarget,
        captureFocus,
        releaseFocus,
      }}
    >
      {children}
    </FocusCaptureContext.Provider>
  );
};
