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
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: { r: 0, g: 0, b: 0, a: 0.15 }
  },
  radius: 0,
  width: '100%', // Percentage-based width
  height: 'auto' // Pixel-based height or 'auto'
};

export const Container = (props) => {
  props = {
    ...defaultProps,
    ...props,
  };

  if (typeof props.shadow === 'number') {
    const shadowValue = props.shadow;
    props.shadow = {
      enabled: shadowValue > 0,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.15 }
    };
  }

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
    height,
    children,
  } = props;

  const containerRef = useRef(null);
  const { actions } = useNode();
  const { query } = useEditor();
  const { id, isActive, data, isDragged } = useNode(node => ({
    id: node.id,
    isActive: node.events.selected,
    data: node.data,
    isDragged: node.events.dragged
  }));

  const isContainer = data.custom?.isCanvas;
  const debug = process.env.NODE_ENV === 'development';
  const log = (message, data) => {
    if (debug) {
      console.log(`[Container ${id}] ${message}`, data || '');
    }
  };

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const contentDiv = container.querySelector('div > div');
    if (!contentDiv) {
      log('Content div not found');
      return;
    }

    const currentHeightSetting = props.height;
    if (currentHeightSetting !== 'auto') {
      log('Height is manually set, skipping auto-resize check');
      return;
    }

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

    if (isOverflowing) {
      log('Content overflow detected, ensuring height remains auto');
    }
  }, [actions, log, props.height]);

  useEffect(() => {
    if (!containerRef.current) return;

    log('Setting up auto-resize observer');

    const observer = new MutationObserver(() => {
      log('Content changed, checking for overflow');
      setTimeout(() => {
        checkOverflow();
      }, 100);
    });

    const contentDiv = containerRef.current.querySelector('div > div');
    if (contentDiv) {
      observer.observe(contentDiv, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }

    checkOverflow();

    return () => {
      observer.disconnect();
      log('Observer disconnected');
    };
  }, [checkOverflow, log]);

  // Extract margin values [Top, Right, Bottom, Left]
  const topMarginValue = parseInt(margin[0]) || 0;
  const rightMarginValue = parseInt(margin[1]) || 0;
  const bottomMarginValue = parseInt(margin[2]) || 0;
  const leftMarginValue = parseInt(margin[3]) || 0;

  const containerContent = (
    <div
      data-can-drop={isContainer && isDragged ? 'true' : undefined}
      className={`craft-container ${isContainer ? 'is-canvas' : ''} ${isDragged ? 'is-dragging' : ''} ${flexDirection === 'row' ? 'craft-container-horizontal' : ''}`}
      style={{
        display: 'flex',
        justifyContent,
        flexDirection,
        alignItems,
        width: '100%',
        height: height || 'auto',
        background: `rgba(${Object.values(background)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        boxShadow: shadow.enabled
          ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
          : 'none',
        borderRadius: `${radius}px`,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
          return child;
        }
        let childStyle = { ...(child.props.style || {}) };
        const childWidth = child.props.style?.width || 'auto';

        if (flexDirection === 'row') {
          childStyle.flexGrow = 0;
          childStyle.flexShrink = 1;
          childStyle.flexBasis = '0%';
          childStyle.minWidth = 0;
          childStyle.boxSizing = 'border-box';
          childStyle.width = childWidth;
          childStyle.maxWidth = childWidth;
          delete childStyle.flex;
        } else {
          childStyle.width = 'auto';
          childStyle.maxWidth = '100%';
          childStyle.alignSelf = alignItems;
        }

        return React.cloneElement(child, {
          style: childStyle
        });
      })}
    </div>
  );

  return (
    <>
      {/* Top margin spacer */}
      {topMarginValue > 0 && (
        <div style={{ height: `${topMarginValue}px`, width: '100%', pointerEvents: 'none' }} />
      )}

      {/* Horizontal flexbox for left/right margins */}
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Left margin spacer */}
        {leftMarginValue > 0 && (
          <div style={{ width: `${leftMarginValue}px`, flexShrink: 0, pointerEvents: 'none' }} />
        )}

        {/* Main content */}
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
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
              margin: 0,
              padding: 0
            }}
            onResize={(width, height) => {
              try {
                log('Manual resize', { width, height });
                actions.setProp((props) => {
                  const widthNum = parseInt(width);
                  props.width = widthNum ? `${widthNum}%` : '100%';

                  const heightNum = parseInt(height);
                  props.height = heightNum ? `${heightNum}px` : 'auto';
                });
              } catch (error) {
                console.error('Error applying resize:', error);
              }
            }}
          >
            {containerContent}
          </Resizer>
        </div>

        {/* Right margin spacer */}
        {rightMarginValue > 0 && (
          <div style={{ width: `${rightMarginValue}px`, flexShrink: 0, pointerEvents: 'none' }} />
        )}
      </div>

      {/* Bottom margin spacer */}
      {bottomMarginValue > 0 && (
        <div style={{ height: `${bottomMarginValue}px`, width: '100%', pointerEvents: 'none' }} />
      )}
    </>
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
