import { useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@craftjs/core';

/**
 * Custom hook to add visual feedback during drag operations
 * This directly manipulates the DOM to add classes and styles
 * for better visual feedback during drag and drop operations
 *
 * IMPORTANT: This hook only adds visual styling and does NOT
 * interfere with craft.js's drag and drop functionality
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Throttled dragover handler to reduce CPU usage during extended drags
 * - Cached DOM queries to avoid repeated lookups
 * - Uses requestAnimationFrame for smooth scrolling
 * - Minimizes style recalculations during drag
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

  // Performance optimization refs
  const lastDragOverTimeRef = useRef(0);
  const lastHoveredContainerRef = useRef(null);
  const containersRef = useRef(null); // Cache container elements
  const dragOverThrottleRef = useRef(null); // For throttling dragover

  // Auto-scroll constants - optimized for performance
  const SCROLL_SPEED = 5; // Slightly increased for better responsiveness
  const SCROLL_BOUNDARY = 100; // Reduced zone size for more precise control
  const HIGH_SPEED_BOUNDARY = 40; // Inner zone for faster scrolling
  const TARGET_FRAME_TIME = 16; // 60fps target
  const MAX_FRAME_TIME = 32; // Cap frame time to prevent large jumps
  const DRAG_OVER_THROTTLE_MS = 16; // Throttle dragover to ~60fps max

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

  // Optimized auto-scroll function with high-speed zone
  const autoScroll = useCallback((clientY) => {
    // If not dragging, stop any scrolling
    if (!isDraggingRef.current) {
      stopAutoScroll();
      return;
    }

    // Use cached renderer
    const renderer = rendererRef.current;
    if (!renderer) return;

    // Get renderer's position relative to the viewport
    const rect = renderer.getBoundingClientRect();
    const topBoundary = rect.top + SCROLL_BOUNDARY;
    const bottomBoundary = rect.bottom - SCROLL_BOUNDARY;
    const topHighSpeedBoundary = rect.top + HIGH_SPEED_BOUNDARY;
    const bottomHighSpeedBoundary = rect.bottom - HIGH_SPEED_BOUNDARY;

    if (clientY < topBoundary) {
      // Scroll up - use high-speed zone for faster scrolling near edge
      const isInHighSpeedZone = clientY < topHighSpeedBoundary;
      const distance = Math.max(1, topBoundary - clientY);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1);
      // Double speed in high-speed zone
      const speed = Math.ceil(SCROLL_SPEED * factor * (isInHighSpeedZone ? 2 : 1));

      updateScrollParams(-1, speed); // -1 for up direction

      // Only update class if not already set (reduces DOM writes)
      if (!renderer.classList.contains('scroll-near-top')) {
        renderer.classList.remove('scroll-near-bottom');
        renderer.classList.add('scroll-near-top');
      }

    } else if (clientY > bottomBoundary) {
      // Scroll down - use high-speed zone for faster scrolling near edge
      const isInHighSpeedZone = clientY > bottomHighSpeedBoundary;
      const distance = Math.max(1, clientY - bottomBoundary);
      const factor = Math.min(distance / SCROLL_BOUNDARY, 1);
      // Double speed in high-speed zone
      const speed = Math.ceil(SCROLL_SPEED * factor * (isInHighSpeedZone ? 2 : 1));

      updateScrollParams(1, speed); // 1 for down direction

      // Only update class if not already set (reduces DOM writes)
      if (!renderer.classList.contains('scroll-near-bottom')) {
        renderer.classList.remove('scroll-near-top');
        renderer.classList.add('scroll-near-bottom');
      }

    } else {
      // In the middle - stop scrolling
      stopAutoScroll();
      renderer.classList.remove('scroll-near-top', 'scroll-near-bottom');
    }
  }, [updateScrollParams, stopAutoScroll]);

  // Optimized handler for drag over with throttling
  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Necessary to allow dropping

    const now = performance.now();

    // Throttle the expensive operations
    if (now - lastDragOverTimeRef.current < DRAG_OVER_THROTTLE_MS) {
      // Still need to handle auto-scroll even when throttled
      autoScroll(e.clientY);
      return;
    }
    lastDragOverTimeRef.current = now;

    // Find target container - use event target for efficiency
    const targetContainer = e.target.closest('.craft-container.is-canvas');

    // Only update classes if the hovered container changed
    if (targetContainer !== lastHoveredContainerRef.current) {
      // Remove drag-hover from previous container
      if (lastHoveredContainerRef.current) {
        lastHoveredContainerRef.current.classList.remove('drag-hover');
      }

      // Add drag-hover to new container
      if (targetContainer) {
        targetContainer.classList.add('drag-hover');
      }

      lastHoveredContainerRef.current = targetContainer;
    }

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

    // Clear cached elements and state
    rendererRef.current = null;
    containersRef.current = null;
    lastHoveredContainerRef.current = null;
    lastDragOverTimeRef.current = 0;

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
      containersRef.current = null;
      lastHoveredContainerRef.current = null;
      lastDragOverTimeRef.current = 0;

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
