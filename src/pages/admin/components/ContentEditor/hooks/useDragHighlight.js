import { useEffect, useCallback, useRef } from 'react';
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

  // Refs for auto-scrolling
  const scrollAnimationRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Auto-scroll constants
  const SCROLL_SPEED = 20; // Base scroll speed in pixels per frame
  const SCROLL_BOUNDARY = 120; // Distance from edge to trigger scrolling (in pixels)
  const SCROLL_ACCELERATION = 1.5; // How much to accelerate scrolling as you get closer to the edge

  // Handler for drag start
  const handleDragStart = useCallback(() => {
    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Set dragging state
    isDraggingRef.current = true;

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

  // Function to handle auto-scrolling
  const autoScroll = useCallback((clientY) => {
    // Cancel any existing animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    // If not dragging, don't scroll
    if (!isDraggingRef.current) return;

    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Get renderer's position relative to the viewport
    const rect = renderer.getBoundingClientRect();
    const topBoundary = rect.top + SCROLL_BOUNDARY;
    const bottomBoundary = rect.bottom - SCROLL_BOUNDARY;

    // Calculate scroll direction and speed
    let scrollAmount = 0;

    // Remove any existing scroll indicator classes
    renderer.classList.remove('scroll-near-top', 'scroll-near-bottom');

    if (clientY < topBoundary) {
      // Scroll up - the closer to the top, the faster
      const distance = Math.max(1, topBoundary - clientY);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1) * SCROLL_ACCELERATION;
      scrollAmount = -SCROLL_SPEED * factor;

      // Add visual indicator for scrolling up
      renderer.classList.add('scroll-near-top');
    } else if (clientY > bottomBoundary) {
      // Scroll down - the closer to the bottom, the faster
      const distance = Math.max(1, clientY - bottomBoundary);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1) * SCROLL_ACCELERATION;
      scrollAmount = SCROLL_SPEED * factor;

      // Add visual indicator for scrolling down
      renderer.classList.add('scroll-near-bottom');
    }

    // If we need to scroll
    if (scrollAmount !== 0) {
      // Perform the scroll
      renderer.scrollTop += scrollAmount;

      // Continue scrolling on the next frame
      scrollAnimationRef.current = requestAnimationFrame(() => autoScroll(clientY));
    }
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

    // Trigger auto-scrolling based on mouse position
    autoScroll(e.clientY);
  }, [autoScroll]);

  // Handler for drag end (also covers drop)
  const handleDragEnd = useCallback(() => {
    // Stop auto-scrolling
    isDraggingRef.current = false;
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    // Clean up all visual indicators
    const renderer = document.querySelector('.craftjs-renderer');
    if (renderer) {
      renderer.classList.remove('dragging-active', 'scroll-near-top', 'scroll-near-bottom');
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
    document.addEventListener('drop', handleDragEnd, true); // Also handle drop events

    // Clean up listeners on unmount
    return () => {
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('dragover', handleDragOver, false);
      document.removeEventListener('dragend', handleDragEnd, true);
      document.removeEventListener('drop', handleDragEnd, true);

      // Ensure styles are cleaned up on unmount as well
      handleDragEnd(); // Call handler directly to clean styles

      // Cancel any ongoing animation
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [handleDragStart, handleDragOver, handleDragEnd]); // Add handlers to dependency array

  // This hook doesn't render anything itself
  return null;
};
