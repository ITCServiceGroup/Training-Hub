/**
 * This file contains a patch for the CollapsibleSection component to ensure
 * that components dropped into a step get the correct data-step attribute.
 *
 * PERFORMANCE: Console.log statements removed to reduce overhead during drag operations.
 */

import { useEditor } from '@craftjs/core';
import { useEffect } from 'react';

export const useCollapsibleSectionPatch = () => {
  const { actions, query } = useEditor();

  useEffect(() => {
    // Function to handle the drop event
    const handleDrop = (e) => {
      try {
        // Find the target step container
        const stepContainer = e.target.closest('[data-step]');
        if (!stepContainer) return;

        // Get the step number
        const stepNumber = stepContainer.getAttribute('data-step');
        if (!stepNumber) return;

        // Get the node ID from the dataTransfer object
        const nodeId = e.dataTransfer.getData('node-id');
        if (!nodeId) return;

        // Set the data-step attribute on the dropped component
        setTimeout(() => {
          try {
            // Find the parent CollapsibleSection node
            const node = query.node(nodeId).get();
            const parentId = node.data.parent;
            const parentNode = query.node(parentId).get();

            // Only proceed if the parent is a CollapsibleSection
            if (parentNode.data.displayName === 'Collapsible Section') {
              // Set the data-step attribute
              actions.setProp(nodeId, (props) => {
                props['data-step'] = parseInt(stepNumber);
              });
            }
          } catch (error) {
            console.error('CollapsibleSectionPatch: Error setting data-step attribute:', error);
          }
        }, 100); // Small delay to ensure the component is fully added to the editor
      } catch (error) {
        console.error('CollapsibleSectionPatch: Error in drop handler:', error);
      }
    };

    // Add event listener for drop events
    document.addEventListener('drop', handleDrop, true);

    // Return cleanup function
    return () => {
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [actions, query]);

  return null;
};
