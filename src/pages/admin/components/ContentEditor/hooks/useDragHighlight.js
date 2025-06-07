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

  // Optimized refs for drag state
  const isDraggingRef = useRef(false);
  const scrollAnimationRef = useRef(null);
  const currentScrollDirectionRef = useRef(0); // -1 for up, 0 for none, 1 for down
  const currentScrollSpeedRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const rendererRef = useRef(null); // Cache renderer element
  const isScrollingRef = useRef(false); // Track if actively scrolling

  // Auto-scroll constants - optimized for performance
  const SCROLL_SPEED = 4; // Reduced for smoother scrolling
  const SCROLL_BOUNDARY = 150; // Distance from edge to trigger scrolling
  const TARGET_FRAME_TIME = 16; // Slightly faster than 60fps for responsiveness
  const MAX_FRAME_TIME = 32; // Cap frame time to prevent large jumps

  // Optimized scroll animation loop
  const scrollAnimationLoop = useCallback((currentTime) => {
    // Early exit if not dragging - prevents unnecessary work
    if (!isDraggingRef.current) {
      scrollAnimationRef.current = null;
      isScrollingRef.current = false;
      lastFrameTimeRef.current = 0;
      return;
    }

    // Initialize timing on first frame
    if (lastFrameTimeRef.current === 0) {
      lastFrameTimeRef.current = currentTime;
      scrollAnimationRef.current = requestAnimationFrame(scrollAnimationLoop);
      return;
    }

    // Calculate frame delta with capping to prevent large jumps
    const deltaTime = Math.min(currentTime - lastFrameTimeRef.current, MAX_FRAME_TIME);

    // Only scroll if enough time has passed and we have scroll parameters
    if (deltaTime >= TARGET_FRAME_TIME && currentScrollDirectionRef.current !== 0 && currentScrollSpeedRef.current > 0) {
      // Use cached renderer or get it once
      if (!rendererRef.current) {
        rendererRef.current = document.querySelector('.craftjs-renderer');
      }

      const renderer = rendererRef.current;
      if (renderer) {
        // Calculate scroll amount with frame time normalization
        const normalizedDelta = deltaTime / TARGET_FRAME_TIME;
        const scrollAmount = currentScrollDirectionRef.current * currentScrollSpeedRef.current * normalizedDelta;

        // Get current scroll position
        const currentScroll = renderer.scrollTop;
        const maxScroll = renderer.scrollHeight - renderer.clientHeight;

        // Calculate new position with bounds checking
        const newScroll = Math.max(0, Math.min(currentScroll + scrollAmount, maxScroll));

        // Only update if there's a meaningful change (reduces reflows)
        if (Math.abs(newScroll - currentScroll) > 0.5) {
          renderer.scrollTop = newScroll;
          isScrollingRef.current = true;
        }
      }

      lastFrameTimeRef.current = currentTime;
    }

    // Continue animation loop only if still needed
    if (isDraggingRef.current) {
      scrollAnimationRef.current = requestAnimationFrame(scrollAnimationLoop);
    } else {
      scrollAnimationRef.current = null;
      isScrollingRef.current = false;
    }
  }, []);

  // Start the scroll animation (only once per drag operation)
  const startScrollAnimation = useCallback(() => {
    // Don't start if already running
    if (scrollAnimationRef.current) return;

    // Reset timing and state
    lastFrameTimeRef.current = 0;
    isScrollingRef.current = false;

    // Start animation loop
    scrollAnimationRef.current = requestAnimationFrame(scrollAnimationLoop);
  }, [scrollAnimationLoop]);

  // Update scroll parameters (optimized for frequent calls)
  const updateScrollParams = useCallback((direction, speed) => {
    // Only update if values actually changed to prevent unnecessary work
    if (currentScrollDirectionRef.current !== direction || currentScrollSpeedRef.current !== speed) {
      currentScrollDirectionRef.current = direction;
      currentScrollSpeedRef.current = speed;

      // Start animation if not already running and we need to scroll
      if (direction !== 0 && speed > 0 && !scrollAnimationRef.current) {
        startScrollAnimation();
      }
    }
  }, [startScrollAnimation]);

  // Stop auto-scroll (optimized)
  const stopAutoScroll = useCallback(() => {
    // Only update if actually changing to prevent unnecessary work
    if (currentScrollDirectionRef.current !== 0 || currentScrollSpeedRef.current !== 0) {
      currentScrollDirectionRef.current = 0;
      currentScrollSpeedRef.current = 0;
    }
    // Don't cancel the animation - let it continue running but with no scroll
  }, []);

  // Handler for drag start
  const handleDragStart = useCallback(() => {
    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Cache renderer for performance
    rendererRef.current = renderer;

    // Clear any existing scroll state completely
    currentScrollDirectionRef.current = 0;
    currentScrollSpeedRef.current = 0;
    lastFrameTimeRef.current = 0;
    isScrollingRef.current = false;

    // Cancel any existing animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    // Set dragging state
    isDraggingRef.current = true;

    // Add global dragging indicator
    renderer.classList.add('dragging-active');

    // Highlight potential drop targets (existing containers)
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

    // Highlight Table, Tabs, and CollapsibleSection components for wireframe visibility
    const specialComponents = document.querySelectorAll('.craft-table, .craft-tabs, .craft-collapsible-section');
    specialComponents.forEach((component) => {
      // Skip the component being dragged
      const isBeingDragged = component.closest('[data-dragging="true"]');
      if (isBeingDragged) return;

      component.setAttribute('data-wireframe-visible', 'true');
    });
  }, [stopAutoScroll]);

  // Simple auto-scroll function
  const autoScroll = useCallback((clientY) => {
    // If not dragging, stop any scrolling
    if (!isDraggingRef.current) {
      stopAutoScroll();
      return;
    }

    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    // Get renderer's position relative to the viewport
    const rect = renderer.getBoundingClientRect();
    const topBoundary = rect.top + SCROLL_BOUNDARY;
    const bottomBoundary = rect.bottom - SCROLL_BOUNDARY;

    // Remove any existing scroll indicator classes
    renderer.classList.remove('scroll-near-top', 'scroll-near-bottom');

    if (clientY < topBoundary) {
      // Scroll up - calculate speed based on distance from boundary
      const distance = Math.max(1, topBoundary - clientY);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1);
      const speed = Math.ceil(SCROLL_SPEED * factor);

      updateScrollParams(-1, speed); // -1 for up direction
      renderer.classList.add('scroll-near-top');

    } else if (clientY > bottomBoundary) {
      // Scroll down - calculate speed based on distance from boundary
      const distance = Math.max(1, clientY - bottomBoundary);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1);
      const speed = Math.ceil(SCROLL_SPEED * factor);

      updateScrollParams(1, speed); // 1 for down direction
      renderer.classList.add('scroll-near-bottom');

    } else {
      // In the middle - stop scrolling
      stopAutoScroll();
    }
  }, [updateScrollParams, stopAutoScroll]);

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
    // Stop dragging and scrolling immediately
    isDraggingRef.current = false;

    // Clear all scroll state
    currentScrollDirectionRef.current = 0;
    currentScrollSpeedRef.current = 0;
    lastFrameTimeRef.current = 0;
    isScrollingRef.current = false;

    // Clear cached renderer
    rendererRef.current = null;

    // Cancel animation frame
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

    // Clean up wireframe indicators for special components
    const specialComponents = document.querySelectorAll('.craft-table, .craft-tabs, .craft-collapsible-section');
    specialComponents.forEach((component) => {
      component.removeAttribute('data-wireframe-visible');
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

      // Complete cleanup on unmount
      isDraggingRef.current = false;
      currentScrollDirectionRef.current = 0;
      currentScrollSpeedRef.current = 0;
      lastFrameTimeRef.current = 0;
      isScrollingRef.current = false;
      rendererRef.current = null;

      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
      handleDragEnd(); // Call handler directly to clean styles
    };
  }, [handleDragStart, handleDragOver, handleDragEnd]); // Add handlers to dependency array

  // This hook doesn't render anything itself
  return null;
};
