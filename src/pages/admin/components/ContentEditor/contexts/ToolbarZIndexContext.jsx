import React, { createContext, useContext, useCallback, useState } from 'react';

const BASE_Z_INDEX = 9999;
const MODAL_Z_INDEX = 10000; // Higher z-index for modals

const ToolbarZIndexContext = createContext({
  updateZIndex: () => {},
  getZIndex: () => BASE_Z_INDEX,
  getModalZIndex: () => MODAL_Z_INDEX,
  resetZIndices: () => {}
});

export const ToolbarZIndexProvider = ({ children }) => {
  const [zIndices, setZIndices] = useState(new Map());
  const [counter, setCounter] = useState(BASE_Z_INDEX);

  const updateZIndex = useCallback((nodeId) => {
    setCounter(prev => prev + 1);
    setZIndices(prev => new Map(prev).set(nodeId, counter));
  }, [counter]);

  const getZIndex = useCallback((nodeId) => {
    return zIndices.get(nodeId) || BASE_Z_INDEX;
  }, [zIndices]);

  const resetZIndices = useCallback(() => {
    setZIndices(new Map());
    setCounter(BASE_Z_INDEX);
  }, []);

  const getModalZIndex = useCallback(() => {
    return MODAL_Z_INDEX;
  }, []);

  return (
    <ToolbarZIndexContext.Provider value={{ updateZIndex, getZIndex, getModalZIndex, resetZIndices }}>
      {children}
    </ToolbarZIndexContext.Provider>
  );
};

export const useToolbarZIndex = () => {
  const context = useContext(ToolbarZIndexContext);
  if (!context) {
    throw new Error('useToolbarZIndex must be used within a ToolbarZIndexProvider');
  }
  return context;
};
