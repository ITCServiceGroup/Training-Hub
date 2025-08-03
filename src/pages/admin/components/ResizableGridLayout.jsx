import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResizableGridLayout = ({
  children,
  layout,
  onLayoutChange,
  onResize,
  className = '',
  isDraggable = true,
  isResizable = true,
  ...props
}) => {
  // Auto-scroll state and refs
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  // Auto-scroll configuration
  const SCROLL_ZONE_HEIGHT = 100; // Height of scroll zone in pixels
  const SCROLL_SPEED = 10; // Pixels to scroll per frame
  const SCROLL_INTERVAL = 16; // ~60fps

  // Auto-scroll function - called from global mouse move
  const handleAutoScroll = useCallback((e) => {
    if (!isDragging) return;
    
    const mouseY = e.clientY;
    const rect = window.innerHeight;
    
    // Find the scrollable container (main content area in AdminLayout)
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) {
      return;
    }
    
    // Calculate scroll zones
    const topZone = SCROLL_ZONE_HEIGHT;
    const bottomZone = rect - SCROLL_ZONE_HEIGHT;
    
    let scrollDirection = 0;
    let scrollSpeed = SCROLL_SPEED;
    
    // Check if mouse is in scroll zones
    if (mouseY < topZone) {
      // Near top - scroll up
      scrollDirection = -1;
      // Increase speed the closer to the edge
      scrollSpeed = Math.max(5, SCROLL_SPEED * (1 - mouseY / topZone));
    } else if (mouseY > bottomZone) {
      // Near bottom - scroll down  
      scrollDirection = 1;
      // Increase speed the closer to the edge
      scrollSpeed = Math.max(5, SCROLL_SPEED * ((mouseY - bottomZone) / SCROLL_ZONE_HEIGHT));
    }
    
    if (scrollDirection !== 0 && !isScrollingRef.current) {
      isScrollingRef.current = true;
      
      const scroll = () => {
        if (!isDragging) {
          isScrollingRef.current = false;
          return;
        }
        
        // Scroll the container instead of the window
        scrollContainer.scrollBy(0, scrollDirection * scrollSpeed);
        
        // Continue scrolling if still in scroll zone
        scrollTimeoutRef.current = setTimeout(scroll, SCROLL_INTERVAL);
      };
      
      scroll();
    } else if (scrollDirection === 0) {
      // Stop scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      isScrollingRef.current = false;
    }
  }, [isDragging, SCROLL_ZONE_HEIGHT, SCROLL_SPEED, SCROLL_INTERVAL]);

  // Set up global mouse move listener when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleAutoScroll);
      return () => {
        document.removeEventListener('mousemove', handleAutoScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
        isScrollingRef.current = false;
      };
    }
  }, [isDragging, handleAutoScroll]);

  // Grid configuration
  const gridConfig = useMemo(() => ({
    // Breakpoints for responsive behavior
    breakpoints: { lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 },
    // Columns for each breakpoint
    cols: { lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 },
    // Row height in pixels - increased for better chart visibility
    rowHeight: 375, // Increased from 350 to 375 for better label spacing
    // Margin between items [horizontal, vertical]
    margin: [24, 24],
    // Container padding [horizontal, vertical]
    containerPadding: [0, 0],
    // Resize constraints - added left-side handles
    resizeHandles: ['se', 'sw', 'e', 'w', 's'], // southeast, southwest, east, west, south handles
  }), []);

  // Handle layout changes (drag and drop)
  const handleLayoutChange = useCallback((newLayout, allLayouts) => {
    if (onLayoutChange) {
      onLayoutChange(newLayout, allLayouts);
    }
  }, [onLayoutChange]);

  // Handle resize events
  const handleResize = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    // Apply constraints: max 2 rows height, max 3 columns width
    const constrainedItem = {
      ...newItem,
      w: Math.min(newItem.w, 3), // Max 3 columns
      h: Math.min(newItem.h, 2), // Max 2 rows
    };

    if (onResize) {
      onResize(layout, oldItem, constrainedItem, placeholder, e, element);
    }
  }, [onResize]);

  // Handle resize stop events
  const handleResizeStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    // Apply final constraints
    const constrainedItem = {
      ...newItem,
      w: Math.min(newItem.w, 3), // Max 3 columns
      h: Math.min(newItem.h, 2), // Max 2 rows
    };

    // Update the layout with constrained values
    const updatedLayout = layout.map(item => 
      item.i === constrainedItem.i ? constrainedItem : item
    );

    if (onLayoutChange) {
      onLayoutChange(updatedLayout);
    }
  }, [onLayoutChange]);

  // Handle drag start
  const handleDragStart = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setIsDragging(true);
  }, []);

  // Handle drag stop
  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setIsDragging(false);
    // Clean up any ongoing scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    isScrollingRef.current = false;
  }, []);

  return (
    <div className={`resizable-grid-container ${className}`}>
      <ResponsiveGridLayout
        {...gridConfig}
        layouts={{
          lg: layout,
          md: layout,
          sm: layout.map(item => ({ ...item, w: Math.min(item.w, 2) })),
          xs: layout.map(item => ({ ...item, w: 1 })),
          xxs: layout.map(item => ({ ...item, w: 1 }))
        }}
        onLayoutChange={handleLayoutChange}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        isDraggable={isDraggable}
        isResizable={isResizable}
        draggableCancel=".dashboard-tile-content"
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
        autoSize={true}
        {...props}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};

export default ResizableGridLayout;
