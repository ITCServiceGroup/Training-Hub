import { useEffect, useCallback } from 'react';
import { useEditor } from '@craftjs/core';

/**
 * Custom hook to add visual feedback during drag operations
 * This directly manipulates the DOM to add classes and styles
 * for better visual feedback during drag and drop operations
 *
 * IMPORTANT: This hook only adds visual styling and does NOT
 * interfere with craft.js's drag and drop functionality
 */
export const useDragHighlight = () => {
  const { query } = useEditor((state) => ({
    // We might not need the state directly anymore, but keep it for now
    // dragged: state.events.dragged,
  }));

  // Handler for drag start
  const handleDragStart = useCallback(() => {
    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Add global dragging indicator
    renderer.classList.add('dragging-active');

    // Highlight potential drop targets
    const containers = document.querySelectorAll('.craft-container.is-canvas');
    containers.forEach((container) => {
      // Skip the container being dragged (if it's marked as draggable)
      // Note: The override patch sets 'data-dragging', not 'draggable' directly on the container usually
      const isBeingDragged = container.closest('[data-dragging="true"]');
      if (isBeingDragged) return;

      container.setAttribute('data-can-drop', 'true');

      // Calculate and add depth classes
      let depth = 0;
      let parent = container.parentElement;
      while (parent) {
        if (parent.classList.contains('craft-container')) {
          depth++;
        }
        parent = parent.parentElement;
        if (depth > 10) break; // Prevent infinite loops
      }
      depth = Math.min(depth, 3); // Cap depth
      if (depth > 0) {
        container.classList.add(`depth-${depth}`);
      }
    });
  }, []);

  // Handler for drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Necessary to allow dropping

    const targetContainer = e.target.closest('.craft-container.is-canvas');
    const allContainers = document.querySelectorAll('.craft-container.is-canvas');

    allContainers.forEach(container => {
      if (container === targetContainer) {
        container.classList.add('drag-hover');
      } else {
        container.classList.remove('drag-hover');
      }
    });
  }, []);

  // Handler for drag end (also covers drop)
  const handleDragEnd = useCallback(() => {
    // Clean up all visual indicators
    const renderer = document.querySelector('.craftjs-renderer');
    if (renderer) {
      renderer.classList.remove('dragging-active');
    }
    const containers = document.querySelectorAll('.craft-container.is-canvas');
    containers.forEach((container) => {
      container.removeAttribute('data-can-drop');
      container.classList.remove('depth-1', 'depth-2', 'depth-3', 'drag-hover');
    });
  }, []);


  useEffect(() => {
    // Add event listeners to the document
    // Use capture phase for dragstart to catch it early
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('dragover', handleDragOver, false);
    // Use capture phase for dragend to ensure cleanup even if drop target prevents bubbling
    document.addEventListener('dragend', handleDragEnd, true);

    // Clean up listeners on unmount
    return () => {
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('dragover', handleDragOver, false);
      document.removeEventListener('dragend', handleDragEnd, true);

      // Ensure styles are cleaned up on unmount as well
      handleDragEnd(); // Call handler directly to clean styles
    };
  }, [handleDragStart, handleDragOver, handleDragEnd]); // Add handlers to dependency array

  // This hook doesn't render anything itself
  return null;
};
