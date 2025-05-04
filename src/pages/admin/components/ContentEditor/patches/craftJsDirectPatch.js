/**
 * This file contains a direct patch for craft.js's drag and drop functionality.
 * 
 * The issue is that the move action isn't being triggered when dropping an existing component.
 * This patch directly modifies the craft.js Editor component to add our custom event handlers.
 */

import React, { useEffect } from 'react';
import { useEditor } from '@craftjs/core';

// Custom component to inject our event handlers into the craft.js Editor
export const CraftJsDirectPatch = () => {
  const { actions, query } = useEditor();

  useEffect(() => {
    console.log('CraftJsDirectPatch: Applying direct patch...');

    // Store the editor instance in the window object for easier access
    window.craftJsEditor = {
      actions,
      query
    };

    // Function to handle the dragend event
    const handleDragEnd = (e) => {
      console.log('CraftJsDirectPatch: Dragend event triggered', e);

      // Find the dragged element
      const draggedElement = document.querySelector('[data-dragging="true"]');
      if (!draggedElement) {
        console.log('CraftJsDirectPatch: No dragged element found');
        return;
      }

      console.log('CraftJsDirectPatch: Dragged element found', draggedElement);

      // Find the indicator element
      const indicator = document.querySelector('.indicator-box');
      if (!indicator) {
        console.log('CraftJsDirectPatch: No indicator found, skipping move');
        return;
      }

      console.log('CraftJsDirectPatch: Indicator found, attempting to trigger move');

      // Get the node ID of the dragged element
      const nodeId = draggedElement.getAttribute('data-id') || 
                    draggedElement.getAttribute('data-node-id') ||
                    draggedElement.id;
                    
      if (!nodeId) {
        console.log('CraftJsDirectPatch: Could not determine node ID');
        return;
      }
      
      console.log('CraftJsDirectPatch: Node ID:', nodeId);

      // Find the target container
      const targetContainer = document.querySelector('.craft-container.drag-hover');
      if (!targetContainer) {
        console.log('CraftJsDirectPatch: No target container found');
        return;
      }
      
      console.log('CraftJsDirectPatch: Target container found', targetContainer);

      // Get the node ID of the target container
      const targetId = targetContainer.getAttribute('data-id') || 
                      targetContainer.getAttribute('data-node-id') ||
                      targetContainer.id;
                      
      if (!targetId) {
        console.log('CraftJsDirectPatch: Could not determine target ID');
        return;
      }
      
      console.log('CraftJsDirectPatch: Target ID:', targetId);

      // Try to manually trigger the move action
      try {
        console.log('CraftJsDirectPatch: Triggering move action', { nodeId, targetId });
        actions.move(nodeId, targetId, 0);
        console.log('CraftJsDirectPatch: Move action triggered successfully');
      } catch (error) {
        console.error('CraftJsDirectPatch: Error triggering move action:', error);
      }
    };

    // Add the global dragend handler
    document.addEventListener('dragend', handleDragEnd, true);
    
    console.log('CraftJsDirectPatch: Applied direct patch');
    
    // Return a cleanup function
    return () => {
      document.removeEventListener('dragend', handleDragEnd, true);
      delete window.craftJsEditor;
    };
  }, [actions, query]);

  // This component doesn't render anything
  return null;
};
