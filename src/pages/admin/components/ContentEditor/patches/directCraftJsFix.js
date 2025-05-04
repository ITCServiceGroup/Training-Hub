/**
 * This file contains a direct patch for craft.js's drag and drop functionality.
 * 
 * The issue is that the move action isn't being triggered when dropping an existing component.
 * This patch directly adds event listeners to handle the drag and drop operations.
 */

export const applyDirectCraftJsFix = () => {
  console.log('Applying direct craft.js fix...');

  // Function to get the craft.js editor instance
  const getEditor = () => {
    // Find all elements with data-craftjs-editor attribute
    const editorElements = document.querySelectorAll('[data-craftjs-editor]');
    if (editorElements.length === 0) {
      console.error('Could not find craft.js editor element');
      return null;
    }

    // Get the first editor element
    const editorElement = editorElements[0];

    // Try to get the React component instance
    if (!editorElement._reactProps) {
      console.error('Could not find React props on editor element');
      return null;
    }

    // Return the editor instance
    return editorElement._reactProps.editor;
  };

  // Add a global dragend handler to ensure move is triggered
  const handleDragEnd = (e) => {
    console.log('Global dragend handler triggered', e);

    // Get the craftjs-renderer element
    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Find the dragged element
    const draggedElement = document.querySelector('[data-dragging="true"]');
    if (!draggedElement) {
      console.log('No dragged element found');
      return;
    }

    console.log('Dragged element found', draggedElement);

    // Find the indicator element
    const indicator = document.querySelector('.indicator-box');
    if (!indicator) {
      console.log('No indicator found, skipping move');
      return;
    }

    console.log('Indicator found, attempting to trigger move');

    // Get the position of the indicator
    const indicatorRect = indicator.getBoundingClientRect();
    console.log('Indicator position:', indicatorRect);

    // Find all container elements
    const containers = document.querySelectorAll('.craft-container.is-canvas');
    
    // Find the container that contains the indicator
    let targetContainer = null;
    let closestDistance = Infinity;
    
    containers.forEach((container) => {
      const containerRect = container.getBoundingClientRect();
      
      // Calculate the distance between the container and the indicator
      const distance = Math.sqrt(
        Math.pow(containerRect.left + containerRect.width / 2 - indicatorRect.left - indicatorRect.width / 2, 2) +
        Math.pow(containerRect.top + containerRect.height / 2 - indicatorRect.top - indicatorRect.height / 2, 2)
      );
      
      // Update the closest container
      if (distance < closestDistance) {
        closestDistance = distance;
        targetContainer = container;
      }
    });
    
    if (!targetContainer) {
      console.log('No target container found');
      return;
    }
    
    console.log('Target container found', targetContainer);

    // Try to manually trigger the move
    try {
      // Get the node ID of the dragged element
      const nodeId = draggedElement.getAttribute('data-id') || 
                    draggedElement.getAttribute('data-node-id') ||
                    draggedElement.id;
                    
      if (!nodeId) {
        console.log('Could not determine node ID');
        return;
      }
      
      console.log('Node ID:', nodeId);
      
      // Get the node ID of the target container
      const targetId = targetContainer.getAttribute('data-id') || 
                      targetContainer.getAttribute('data-node-id') ||
                      targetContainer.id;
                      
      if (!targetId) {
        console.log('Could not determine target ID');
        return;
      }
      
      console.log('Target ID:', targetId);
      
      // Get the index where to insert the dragged element
      // This is a rough approximation based on the indicator position
      const targetRect = targetContainer.getBoundingClientRect();
      const relativeY = indicatorRect.top - targetRect.top;
      const relativeX = indicatorRect.left - targetRect.left;
      
      // Get all child elements of the target container
      const childElements = Array.from(targetContainer.children);
      
      // Find the index where to insert the dragged element
      let insertIndex = 0;
      
      for (let i = 0; i < childElements.length; i++) {
        const childRect = childElements[i].getBoundingClientRect();
        
        // If the indicator is below the child element, increment the index
        if (relativeY > childRect.top - targetRect.top + childRect.height / 2) {
          insertIndex = i + 1;
        }
      }
      
      console.log('Insert index:', insertIndex);
      
      // Try to get the editor instance
      const editor = window.craftJsEditor;
      
      if (editor) {
        console.log('Found editor instance, triggering move action');
        editor.actions.move(nodeId, targetId, insertIndex);
      } else {
        console.log('Could not find editor instance');
      }
    } catch (error) {
      console.error('Error triggering move action:', error);
    }
  };

  // Add the global dragend handler
  document.addEventListener('dragend', handleDragEnd, true);
  
  console.log('Applied direct craft.js fix');
  
  // Return a cleanup function
  return () => {
    document.removeEventListener('dragend', handleDragEnd, true);
  };
};
