import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import { ContainerSettings } from './ContainerSettings';
import { Resizer } from '../Resizer';

// Default props for the Container component
const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 31, g: 41, b: 55, a: 1 }
  },
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: {
    light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
    dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
  },
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: {
      light: { r: 0, g: 0, b: 0, a: 0.15 },
      dark: { r: 0, g: 0, b: 0, a: 0.25 }
    }
  },
  radius: 0,
  width: '100%', // Percentage-based width
  height: 'auto', // Pixel-based height or 'auto'
  autoConvertColors: true // Whether to automatically convert colors between themes
};

// Container component directly using Resizer
export const Container = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  // Handle backward compatibility for shadow property
  if (typeof props.shadow === 'number') {
    const shadowValue = props.shadow;
    // Create a new props object instead of modifying props directly
    props = {
      ...props,
      shadow: {
        enabled: shadowValue > 0,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: {
          light: { r: 0, g: 0, b: 0, a: 0.15 },
          dark: { r: 0, g: 0, b: 0, a: 0.25 }
        }
      }
    };
  }

  // Handle backward compatibility for shadow color
  if (props.shadow && props.shadow.color && 'r' in props.shadow.color) {
    const oldColor = { ...props.shadow.color };
    // Create a new shadow object instead of modifying props directly
    props = {
      ...props,
      shadow: {
        ...props.shadow,
        color: {
          light: oldColor,
          dark: convertToThemeColor(oldColor, true)
        }
      }
    };
  }

  // Extract props *after* merging defaults
  const {
    flexDirection,
    alignItems,
    justifyContent,
    background: backgroundProp,
    padding,
    margin,
    borderStyle,
    borderWidth,
    borderColor,
    shadow,
    radius,
    width,
    height, // Use the height from props
    children,
    autoConvertColors,
  } = props;


  // Reference to the container's DOM element
  const containerRef = useRef(null);

  // Get theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get node actions
  const { actions } = useNode();

  // Get query for localStorage
  const { query } = useEditor();

  // Get the node ID and drag state
  const { id, isActive, data, isDragged, selected, hovered } = useNode(node => ({
    id: node.id,
    isActive: node.events.selected,
    data: node.data,
    isDragged: node.events.dragged,
    selected: node.events.selected,
    hovered: node.events.hovered
  }));

  const isContainer = data.custom?.isCanvas;

  // Simple debug log function - disabled to reduce console noise
  const debug = false; // process.env.NODE_ENV === 'development';
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


  // Extract margin values
  const topMarginValue = parseInt(margin[0]) || 0;
  const rightMarginValue = parseInt(margin[3]) || 0;
  const bottomMarginValue = parseInt(margin[2]) || 0;
  const leftMarginValue = parseInt(margin[1]) || 0;

  // Create a wrapper with top and bottom margins as separate divs
  return (
    <>
      {/* Invisible spacer div for top margin */}
      {topMarginValue > 0 && (
        <div
          style={{
            height: `${topMarginValue}px`,
            width: '100%',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* The actual container with only right and left margins */}
      <Resizer
        ref={containerRef}
        propKey={{ width: 'width', height: 'height' }}
        style={{
          position: 'relative',
          display: 'flex',
          minHeight: '50px',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
          flexBasis: 'auto',
          // Apply only right and left margins - don't interfere with justifyContent
          margin: `0px ${rightMarginValue}px 0px ${leftMarginValue}px`,
          // Add horizontal alignment for column containers with width < 100%
          alignSelf: (() => {
            // Only apply horizontal alignment for column containers with width < 100%
            if (flexDirection === 'column' && width !== '100%') {
              if (alignItems === 'center') {
                return 'center';
              } else if (alignItems === 'flex-end') {
                return 'flex-end';
              } else {
                return 'flex-start';
              }
            }
            return 'auto'; // Default - don't interfere with parent's justifyContent
          })(),
          padding: 0,
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
          data-can-drop={isContainer && isDragged ? 'true' : undefined}
          className={`craft-container ${isContainer ? 'is-canvas' : ''} ${isDragged ? 'is-dragging' : ''} ${flexDirection === 'row' ? 'craft-container-horizontal' : ''} ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
          style={{
            display: 'flex',
            justifyContent,
            flexDirection,
            alignItems,
            width: '100%',
            height: height || 'auto',
            background: (() => {
              try {
                const color = getThemeColor(backgroundProp, isDark, 'container');
                return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
              } catch (error) {
                console.warn('Error generating background color:', error);
                return isDark ? 'rgba(31, 41, 55, 1)' : 'rgba(255, 255, 255, 1)';
              }
            })(),
            padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
            boxShadow: (() => {
              if (!shadow || !shadow.enabled) return 'none';
              try {
                const { x, y, blur, spread, color } = shadow;
                if (!color) return 'none';

                // Get the appropriate shadow color for the current theme
                let shadowColor;
                if (color.light && color.dark) {
                  // Theme-aware color
                  shadowColor = isDark ? color.dark : color.light;
                } else if ('r' in color) {
                  // Legacy format (single RGBA object)
                  shadowColor = getThemeColor(color, isDark, 'shadow', autoConvertColors);
                } else {
                  // Fallback
                  shadowColor = isDark ?
                    { r: 255, g: 255, b: 255, a: 0.15 } :
                    { r: 0, g: 0, b: 0, a: 0.15 };
                }

                return `${x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px rgba(${shadowColor.r || 0}, ${shadowColor.g || 0}, ${shadowColor.b || 0}, ${shadowColor.a || 0.15})`;
              } catch (error) {
                console.warn('Error generating shadow:', error);
                return 'none';
              }
            })(),
            border: borderStyle !== 'none' ?
              `${Math.max(borderWidth, 1)}px ${borderStyle} rgba(${Object.values(getThemeColor(borderColor, isDark, 'container', autoConvertColors))})` :
              'none',
            borderRadius: `${radius}px`,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Custom resize handles for the container */}
          {selected && (
            <>
              <div
                className="container-handle-tl"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  // Create a new mouse event with the view property
                  const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    view: window
                  });
                  // Find the resize handle within this specific container
                  const resizeHandle = e.currentTarget.closest('.craft-container').querySelector('.react-resizable-handle-nw');
                  if (resizeHandle) {
                    resizeHandle.dispatchEvent(event);
                  }
                }}
              ></div>
              <div
                className="container-handle-tr"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    view: window
                  });
                  const resizeHandle = e.currentTarget.closest('.craft-container').querySelector('.react-resizable-handle-ne');
                  if (resizeHandle) {
                    resizeHandle.dispatchEvent(event);
                  }
                }}
              ></div>
              <div
                className="container-handle-bl"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    view: window
                  });
                  const resizeHandle = e.currentTarget.closest('.craft-container').querySelector('.react-resizable-handle-sw');
                  if (resizeHandle) {
                    resizeHandle.dispatchEvent(event);
                  }
                }}
              ></div>
              <div
                className="container-handle-br"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    view: window
                  });
                  const resizeHandle = e.currentTarget.closest('.craft-container').querySelector('.react-resizable-handle-se');
                  if (resizeHandle) {
                    resizeHandle.dispatchEvent(event);
                  }
                }}
              ></div>
            </>
          )}

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

            // We don't need to add a class to children anymore
            // The CSS will target children of .craft-container-horizontal directly
            return React.cloneElement(child, {
              style: childStyle
            });
          })}
        </div>
      </Resizer>

      {/* Invisible spacer div for bottom margin */}
      {bottomMarginValue > 0 && (
        <div
          style={{
            height: `${bottomMarginValue}px`,
            width: '100%',
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    ...defaultProps,
    // Pre-compute the color values instead of using getters to avoid dynamic prop changes
    borderColor: defaultProps.borderColor,
    // Handle backward compatibility by converting single color to theme-aware format
    get background() {
      const lightColor = defaultProps.background.light;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'container'),
      };
    },
    get shadow() {
      const defaultShadow = defaultProps.shadow;
      if (defaultShadow && defaultShadow.color && 'r' in defaultShadow.color) {
        const lightColor = defaultShadow.color;
        return {
          ...defaultShadow,
          color: {
            light: lightColor,
            dark: convertToThemeColor(lightColor, true, 'shadow'),
          }
        };
      }
      return defaultShadow;
    },
    autoConvertColors: true
  },
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
