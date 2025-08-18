import { useNode, useEditor } from '@craftjs/core';
import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { Resizable } from 're-resizable';
import { debounce } from 'debounce';
import classNames from 'classnames';
import { useTheme } from '../../../../../../../contexts/ThemeContext';

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from '../../../utils/numToMeasurement';

// Convert to forwardRef to properly handle refs
export const Resizer = forwardRef(({ propKey, children, onResize, hideOverlayHandles = false, ...props }, forwardedRef) => {
  const {
    id,
    actions,
    connectors: { connect },
    nodeWidth,
    nodeHeight,
    active,
  } = useNode((node) => ({
    active: node.events.selected,
    nodeWidth: node.data.props[propKey.width],
    nodeHeight: node.data.props[propKey.height],
  }));

  const { isRootNode } = useEditor((_, query) => {
    return {
      isRootNode: query.node(id).isRoot(),
    };
  });

  const resizable = useRef(null);
  const isResizing = useRef(false);
  const editingDimensions = useRef(null);
  const nodeDimensions = useRef(null);
  nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

  const [internalDimensions, setInternalDimensions] = useState({
    width: nodeWidth,
    height: nodeHeight,
  });

  const updateInternalDimensionsInPx = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;

    const width = percentToPx(
      nodeWidth,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).width
    );
    const height = percentToPx(
      nodeHeight,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).height
    );

    setInternalDimensions({
      width,
      height,
    });
  }, []);

  const updateInternalDimensionsWithOriginal = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;
    setInternalDimensions({
      width: nodeWidth,
      height: nodeHeight,
    });
  }, []);

  const getUpdatedDimensions = (width, height) => {
    const dom = resizable.current.resizable;
    if (!dom) return;

    const currentWidth = parseInt(editingDimensions.current.width),
      currentHeight = parseInt(editingDimensions.current.height);

    return {
      width: currentWidth + parseInt(width),
      height: currentHeight + parseInt(height),
    };
  };

  useEffect(() => {
    if (!isResizing.current) updateInternalDimensionsWithOriginal();
  }, [nodeWidth, nodeHeight, updateInternalDimensionsWithOriginal]);

  useEffect(() => {
    const listener = debounce(updateInternalDimensionsWithOriginal, 1);
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [updateInternalDimensionsWithOriginal]);

  // Get theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware handle styles
  const handleStyles = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'var(--color-primary)', // Use primary color
    borderRadius: '50%',
    display: 'block',
    border: isDark ? '2px solid #1f2937' : '2px solid #fff', // dark: gray-800, light: white
    boxShadow: isDark
      ? '0px 0px 12px -1px rgba(255, 255, 255, 0.25)'
      : '0px 0px 12px -1px rgba(0, 0, 0, 0.25)',
    zIndex: 2,
    pointerEvents: 'auto'
  };

  // Check if this is a CollapsibleSection or Tabs component for width-only resizing
  const isCollapsibleSection = props.className?.includes('craft-collapsible-section');
  const isTabs = props.className?.includes('craft-tabs');

  return (
    <Resizable
      enable={[
        'top',
        'left',
        'bottom',
        'right',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
      ].reduce((acc, key) => {
        // For CollapsibleSection and Tabs, only enable left and right resizing
        if (isCollapsibleSection || isTabs) {
          acc[key] = active && (key === 'left' || key === 'right');
        } else {
          acc[key] = active;
        }
        return acc;
      }, {})}
      className={classNames({
        'm-auto': isRootNode
      })}
      style={{
        boxSizing: 'border-box',
        minHeight: '50px',
        position: 'relative',
        width: '100%',
        height: '100%',
        // Special handling for tables to ensure they don't block pointer events
        pointerEvents: props.className?.includes('table-fix') ? 'none' : 'auto'
      }}
      ref={(ref) => {
        if (ref) {
          resizable.current = ref;
          // Handle both the internal connect ref and the forwarded ref
          connect(resizable.current.resizable);

          // Forward the ref if provided
          if (forwardedRef) {
            if (typeof forwardedRef === 'function') {
              forwardedRef(resizable.current.resizable);
            } else {
              forwardedRef.current = resizable.current.resizable;
            }
          }
        }
      }}
      size={internalDimensions}
      onResizeStart={(e) => {
        updateInternalDimensionsInPx();
        e.preventDefault();
        e.stopPropagation();
        const dom = resizable.current.resizable;
        if (!dom) return;
        editingDimensions.current = {
          width: dom.getBoundingClientRect().width,
          height: dom.getBoundingClientRect().height,
        };
        isResizing.current = true;
      }}
      onResize={(_, __, ___, d) => {
        const dom = resizable.current.resizable;
        let { width, height } = getUpdatedDimensions(d.width, d.height);
        if (isPercentage(nodeWidth))
          width =
            pxToPercent(width, getElementDimensions(dom.parentElement).width) +
            '%';
        else width = `${width}px`;

        if (isPercentage(nodeHeight))
          height =
            pxToPercent(
              height,
              getElementDimensions(dom.parentElement).height
            ) + '%';
        else height = `${height}px`;

        if (isPercentage(width) && dom.parentElement.style.width === 'auto') {
          width = editingDimensions.current.width + d.width + 'px';
        }

        if (isPercentage(height) && dom.parentElement.style.height === 'auto') {
          height = editingDimensions.current.height + d.height + 'px';
        }

        actions.setProp((prop) => {
          prop[propKey.width] = width;
          prop[propKey.height] = height;
        }, 500);
      }}
      onResizeStop={() => {
        isResizing.current = false;
        updateInternalDimensionsWithOriginal();

        if (typeof onResize === 'function') {
          const dom = resizable.current.resizable;
          if (dom) {
            const width = dom.style.width;
            const height = dom.style.height;
            onResize(width, height);
          }
        }
      }}
      {...props}
    >
      <div style={{
        // Remove display: 'flex' from this inner wrapper
        width: '100%',
        height: '100%',
        // display: 'flex', // REMOVED
        position: 'relative',
        boxSizing: 'border-box',
        // Special handling for tables to ensure they don't block pointer events
        pointerEvents: props.className?.includes('table-fix') && !active ? 'none' : 'auto',
        ...(props.style || {})
      }}>
        {children}
      </div>
      {active && !hideOverlayHandles && !props.className?.includes('craft-table') && !props.className?.includes('craft-collapsible-section') && !props.className?.includes('craft-tabs') && (
        <>
          {/* Corner resize handles (visual only) */}
          <div style={{...handleStyles, top: '-5px', left: '-5px', cursor: 'nw-resize'}} />
          <div style={{...handleStyles, top: '-5px', right: '-5px', cursor: 'ne-resize'}} />
          <div style={{...handleStyles, bottom: '-5px', left: '-5px', cursor: 'sw-resize'}} />
          <div style={{...handleStyles, bottom: '-5px', right: '-5px', cursor: 'se-resize'}} />
        </>
      )}
    </Resizable>
  );
});
