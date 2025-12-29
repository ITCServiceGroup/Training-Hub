/**
 * This file contains a direct override for craft.js's drag and drop functionality.
 *
 * The issue is that the move action isn't being triggered when dropping an existing component.
 * This patch directly overrides the craft.js drag and drop behavior to manually trigger the move action.
 * It accepts the craft.js editor actions object as an argument.
 *
 * PERFORMANCE: Console.log statements removed to reduce overhead during drag operations.
 */

// Function to override the craft.js drag and drop behavior
export const applyCraftJsDragDropOverride = (actions) => {
  // Function to handle the dragstart event
  const handleDragStart = (e) => {
    // Get the element being dragged
    const draggedElement = e.target;

    // Set a data attribute to mark the element as being dragged
    draggedElement.setAttribute('data-dragging', 'true');

    // Store the node ID in the dataTransfer object
    const nodeId = draggedElement.getAttribute('data-id') ||
                  draggedElement.getAttribute('data-node-id') ||
                  draggedElement.id;

    if (nodeId) {
      e.dataTransfer.setData('node-id', nodeId);
    }
  };

  // Function to handle the drop event
  const handleDrop = (e) => {
    // Prevent default action
    e.preventDefault();

    // Get the node ID from the dataTransfer object
    const nodeId = e.dataTransfer.getData('node-id');

    if (!nodeId) {
      return;
    }

    // Find the target container
    const targetContainer = e.target.closest('.craft-container.is-canvas');

    if (!targetContainer) {
      return;
    }

    // Get the node ID of the target container
    const targetId = targetContainer.getAttribute('data-id') ||
                    targetContainer.getAttribute('data-node-id') ||
                    targetContainer.id;

    if (!targetId) {
      return;
    }

    // Manually trigger the move action using the provided actions object
    try {
      if (actions && typeof actions.move === 'function') {
        actions.move(nodeId, targetId, 0);
      }
    } catch (error) {
      console.error('CraftJsDragDropOverride: Error triggering move action:', error);
    }

    // Clean up dragging attribute
    document.querySelectorAll('[data-dragging="true"]').forEach((el) => {
      el.removeAttribute('data-dragging');
    });
  };

  // Function to handle the dragend event
  const handleDragEnd = () => {
    // Clean up
    document.querySelectorAll('[data-dragging="true"]').forEach((el) => {
      el.removeAttribute('data-dragging');
    });
  };

  // Add event listeners for drag start, drop, and end
  // Drag over is handled by useDragHighlight now
  document.addEventListener('dragstart', handleDragStart, true);
  document.addEventListener('drop', handleDrop, true);
  document.addEventListener('dragend', handleDragEnd, true);

  // Return a cleanup function
  return () => {
    document.removeEventListener('dragstart', handleDragStart, true);
    document.removeEventListener('drop', handleDrop, true);
    document.removeEventListener('dragend', handleDragEnd, true);
  };
};
