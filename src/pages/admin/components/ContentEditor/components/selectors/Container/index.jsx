import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { ContainerSettings } from './ContainerSettings';
import { Resizer } from '../Resizer';

// Default props for the Container component
const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100%', // Percentage-based width
  height: 'auto' // Pixel-based height or 'auto'
};

// Container component directly using Resizer
export const Container = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  // Extract props *after* merging defaults
  const {
    flexDirection,
    alignItems,
    justifyContent,
    background,
    padding,
    margin,
    shadow,
    radius,
    width,
    height, // Use the height from props
    children,
  } = props;


  // Reference to the container's DOM element
  const containerRef = useRef(null);

  // Get node actions
  const { actions } = useNode();

  // Get query for localStorage
  const { query } = useEditor();

  // Get the node ID
  const { id } = useNode(node => ({ id: node.id }));

  // Simple debug log function
  const debug = process.env.NODE_ENV === 'development';
  const log = (message, data) => {
    if (debug) {
      console.log(`[Container ${id}] ${message}`, data || '');
    }
  };

  // Function to check if content is overflowing and resize if needed
  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the content div
    const contentDiv = container.querySelector('div > div');
    if (!contentDiv) {
      log('Content div not found');
      return;
    }

    // Check if current height is 'auto' before potentially resizing
    const currentHeightSetting = props.height; // Use props.height here
    if (currentHeightSetting !== 'auto') {
        log('Height is manually set, skipping auto-resize check');
        return; // Don't auto-resize if height is manually set
    }


    // Calculate total content height (including padding)
    const computedStyle = window.getComputedStyle(contentDiv);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const contentHeight = contentDiv.scrollHeight + paddingTop + paddingBottom;
    const containerHeight = container.clientHeight;
    const isOverflowing = contentHeight > containerHeight;

    log('Checking overflow (height=auto)', {
      contentHeight,
      containerHeight,
      isOverflowing,
      currentHeight: container.style.height
    });

    // Only set to auto if it's currently auto and overflowing
    if (isOverflowing) {
      log('Content overflow detected, ensuring height remains auto');
      // No need to setProp if it's already 'auto' and overflowing,
      // but we might need to ensure the visual height adjusts if it was previously fixed
      // For simplicity, let's assume the browser handles this correctly when height is 'auto'
    }
  }, [actions, log, props.height]); // Add props.height dependency

  // Effect to set up auto-resize
  useEffect(() => {
    if (!containerRef.current) return;

    log('Setting up auto-resize observer');

    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver((mutations) => {
      // Force a check whenever any change occurs
      log('Content changed, checking for overflow');
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        checkOverflow();
      }, 100);
    });

    // Start observing the container's direct children wrapper
     const contentDiv = containerRef.current.querySelector('div > div');
     if (contentDiv) {
        observer.observe(contentDiv, {
          childList: true,  // Watch for added/removed children
          subtree: true,    // Watch all descendants
          characterData: true, // Watch for text changes
          attributes: true // Watch for attribute changes like style
        });
     }


    // Initial check
    checkOverflow();

    // Clean up on unmount
    return () => {
      observer.disconnect();
      log('Observer disconnected');
    };
  }, [checkOverflow, log]);


  return (
    // Remove the outer wrapper div
    <Resizer
      ref={containerRef}
      propKey={{ width: 'width', height: 'height' }}
      // Apply margin directly to Resizer
      style={{
        position: 'relative',
        display: 'flex', // Keep flex on Resizer
        minHeight: '50px',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        flexBasis: 'auto',
        // Apply margin here
        margin: `${parseInt(margin[0]) || 0}px ${parseInt(margin[3]) || 0}px ${parseInt(margin[2]) || 0}px ${parseInt(margin[1]) || 0}px`,
        padding: 0, // Ensure no padding on Resizer itself
        pointerEvents: 'auto'
      }}
      onResize={(width, height) => {
          try {
            log('Manual resize', { width, height });
            actions.setProp((props) => {
              // Convert width to percentage
              const widthNum = parseInt(width);
              props.width = widthNum ? `${widthNum}%` : '100%';

              // Convert height to pixels or auto
              const heightNum = parseInt(height);
              props.height = heightNum ? `${heightNum}px` : 'auto';
            });
            // No automatic checkOverflow after manual resize
          } catch (error) {
            console.error('Error applying resize:', error);
          }
        }}
      >
        <div
          // No specific class needed here unless targeted by other CSS
          style={{
            display: 'flex', // Restore inline flex
            justifyContent,  // Restore inline prop
            flexDirection, // Restore inline prop
            alignItems,    // Restore inline prop
            width: '100%',
            height: height || 'auto', // Use height from props
            background: `rgba(${Object.values(background)})`,
            padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
            boxShadow: shadow === 0 ? 'none' : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
            borderRadius: `${radius}px`,
          }}
        >
          {/* --- NEW Child Handling Logic --- */}
          {React.Children.map(children, child => {
            if (!React.isValidElement(child)) {
              return child; // Skip non-elements
            }
            let childStyle = { ...(child.props.style || {}) };
            // Attempt to get the child's intended width from its style prop
            const childWidth = child.props.style?.width || 'auto';

            if (flexDirection === 'row') {
              // Row: Set basis to 0, prevent grow, allow shrink, constrain with width/maxWidth
              childStyle.flexGrow = 0; // Prevent growing into distributed space
              childStyle.flexShrink = 1;
              childStyle.flexBasis = '0%'; // Distribute space first!
              childStyle.minWidth = 0;
              childStyle.boxSizing = 'border-box';
              childStyle.width = childWidth; // Set target width
              childStyle.maxWidth = childWidth; // Ensure it doesn't exceed target width
              // Remove shorthand flex property
              delete childStyle.flex;
            } else { // Column
              // Column: Apply width: auto and alignSelf to respect parent's alignItems
              childStyle.width = 'auto'; // Allow natural width (alignSelf handles horizontal pos)
              childStyle.maxWidth = '100%'; // Prevent overflow
              childStyle.alignSelf = alignItems; // Explicitly align child based on parent
            }

            return React.cloneElement(child, { style: childStyle });
          })}
        </div>
    </Resizer>
    // End of removed outer wrapper div
  );
};

Container.craft = {
  displayName: 'Container',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: ContainerSettings
  },
  custom: {
    isCanvas: true
  }
};

Container.displayName = 'Container';
