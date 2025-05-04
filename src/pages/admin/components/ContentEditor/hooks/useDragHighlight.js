import { useEffect } from 'react';
import { useEditor } from '@craftjs/core';

/**
 * Custom hook to add visual feedback during drag operations
 * This directly manipulates the DOM to add classes and styles
 * for better visual feedback during drag and drop operations
 */
export const useDragHighlight = () => {
  const { connectors, query } = useEditor((state) => ({
    dragged: state.events.dragged,
  }));

  useEffect(() => {
    let lastHoveredContainer = null;

    // Function to handle drag start
    const handleDragStart = () => {
      console.log('Drag started');
      // Get the craftjs-renderer element
      const renderer = document.querySelector('.craftjs-renderer');
      if (!renderer) return;

      // Add a class to the renderer to indicate dragging is active
      renderer.classList.add('dragging-active');

      // Find all container elements that can accept drops
      const containers = document.querySelectorAll('.craft-container.is-canvas');
      containers.forEach((container) => {
        // Skip the container being dragged
        if (container.getAttribute('draggable') === 'true') return;

        // Add a class to highlight potential drop targets
        container.setAttribute('data-can-drop', 'true');

        // Calculate nesting depth for visual hierarchy
        let depth = 0;
        let parent = container.parentElement;
        while (parent) {
          if (parent.classList.contains('craft-container')) {
            depth++;
          }
          parent = parent.parentElement;
          // Prevent infinite loops
          if (depth > 10) break;
        }

        // Cap depth at 3 for styling
        depth = Math.min(depth, 3);
        if (depth > 0) {
          container.classList.add(`depth-${depth}`);
        }
      });
    };

    // Function to handle drag over
    const handleDragOver = (e) => {
      // Prevent default to allow drop
      e.preventDefault();

      // Find the closest container element
      const container = e.target.closest('.craft-container.is-canvas');

      // If we're hovering over a container
      if (container) {
        // If this is a different container than the last one we hovered over
        if (lastHoveredContainer && lastHoveredContainer !== container) {
          // Remove hover effect from the previous container
          lastHoveredContainer.classList.remove('drag-hover');
        }

        // Add hover effect to the current container
        container.classList.add('drag-hover');
        lastHoveredContainer = container;

        // Set the dropEffect to move
        e.dataTransfer.dropEffect = 'move';
      } else if (lastHoveredContainer) {
        // If we're not hovering over a container, remove hover effect from the last one
        lastHoveredContainer.classList.remove('drag-hover');
        lastHoveredContainer = null;
      }
    };

    // Function to handle drag end
    const handleDragEnd = () => {
      console.log('Drag ended');
      // Get the craftjs-renderer element
      const renderer = document.querySelector('.craftjs-renderer');
      if (!renderer) return;

      // Remove the dragging class
      renderer.classList.remove('dragging-active');

      // Find all container elements and remove the highlight
      const containers = document.querySelectorAll('.craft-container.is-canvas');
      containers.forEach((container) => {
        container.removeAttribute('data-can-drop');
        container.classList.remove('depth-1', 'depth-2', 'depth-3', 'drag-hover');
      });

      // Reset the last hovered container
      lastHoveredContainer = null;
    };

    // Set up event listeners for drag operations
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drop', handleDragEnd); // Also handle drop events

    // Clean up event listeners
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  return null;
};
