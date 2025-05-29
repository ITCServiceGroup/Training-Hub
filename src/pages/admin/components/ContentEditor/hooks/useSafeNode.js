import { useNode } from '@craftjs/core';
import { useRef, useCallback } from 'react';

/**
 * A safer version of useNode that handles cases where nodes might not exist
 * This prevents the "Node does not exist, it may have been removed" errors
 */
export const useSafeNode = (collect) => {
  const lastValidStateRef = useRef(null);
  
  const safeCollect = useCallback((node) => {
    if (!node) {
      // Return the last valid state if available, otherwise return safe defaults
      return lastValidStateRef.current || {
        selected: false,
        hovered: false,
        id: null
      };
    }
    
    try {
      const result = collect ? collect(node) : {
        selected: node.events.selected,
        hovered: node.events.hovered,
        id: node.id
      };
      
      // Store the last valid state
      lastValidStateRef.current = result;
      return result;
    } catch (error) {
      console.warn('useSafeNode: Error in collector function:', error);
      // Return the last valid state or safe defaults
      return lastValidStateRef.current || {
        selected: false,
        hovered: false,
        id: null
      };
    }
  }, [collect]);

  try {
    return useNode(safeCollect);
  } catch (error) {
    console.warn('useSafeNode: useNode hook failed:', error);
    
    // Return safe defaults when useNode fails completely
    return {
      connectors: {
        connect: (ref) => ref,
        drag: (ref) => ref
      },
      selected: false,
      hovered: false,
      id: null,
      actions: {
        setProp: () => console.warn('useSafeNode: setProp called on invalid node'),
        setCustom: () => console.warn('useSafeNode: setCustom called on invalid node'),
        setHidden: () => console.warn('useSafeNode: setHidden called on invalid node')
      },
      related: false,
      inNodeContext: false
    };
  }
};

export default useSafeNode;
