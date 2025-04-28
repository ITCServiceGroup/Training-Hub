import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { ContainerSettings } from './ContainerSettings';
import { Resizer } from '../Resizer';

// Default props for the Container component
const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100%',
  height: 'auto'
};

// Container component directly using Resizer
export const Container = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

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

    // Calculate total content height (including padding)
    const computedStyle = window.getComputedStyle(contentDiv);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const contentHeight = contentDiv.scrollHeight + paddingTop + paddingBottom;
    const containerHeight = container.clientHeight;
    const isOverflowing = contentHeight > containerHeight;

    log('Checking overflow', {
      contentHeight,
      containerHeight,
      isOverflowing,
      currentHeight: container.style.height
    });

    // Always set to auto when content changes, it will naturally collapse if not needed
    if (isOverflowing) {
      log('Content overflow detected, setting height to auto');
      actions.setProp((props) => {
        props.height = 'auto';
      });
    }
  }, [actions, log]);

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

    // Start observing the container
    observer.observe(containerRef.current, {
      childList: true,  // Watch for added/removed children
      subtree: true,    // Watch all descendants
      characterData: true, // Watch for text changes
      attributes: true // Watch for attribute changes
    });

    // Initial check
    checkOverflow();

    // Clean up on unmount
    return () => {
      observer.disconnect();
      log('Observer disconnected');
    };
  }, [checkOverflow, log]);

  // Extract props
  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    padding,
    margin,
    shadow,
    radius,
    children,
  } = props;

  return (
    <div style={{
      marginTop: `${margin[0]}px`,
      width: '100%'
    }}>
      <Resizer
        ref={containerRef}
        propKey={{ width: 'width', height: 'height' }}
        style={{
          position: 'relative',
          display: 'flex',
          marginBottom: `${margin[2]}px`,
          minHeight: '50px',
          width: '100%',
          boxSizing: 'border-box',
          flexGrow: fillSpace === 'yes' ? 1 : 0,
          flexShrink: 0,
          flexBasis: 'auto',
          paddingLeft: margin[3] ? `${margin[3]}px` : 0,
          paddingRight: margin[1] ? `${margin[1]}px` : 0,
        }}
        onResize={(width, height) => {
          try {
            log('Manual resize', { width, height });
            // Apply the manual resize dimensions
            actions.setProp((props) => {
              props.width = width;
              props.height = height;
            });
            // Force a check after manual resize
            setTimeout(checkOverflow, 100);
          } catch (error) {
            console.error('Error applying resize:', error);
          }
        }}
      >
        <div style={{
            flex: '1 1 100%',
            display: 'flex',
            justifyContent,
            flexDirection,
            alignItems,
            background: `rgba(${Object.values(background)})`,
            padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
            boxShadow: shadow === 0 ? 'none' : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
            borderRadius: `${radius}px`,
          }}
        >
          {children}
        </div>
      </Resizer>
    </div>
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
