import React, { useState, useCallback, useMemo } from 'react';
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
