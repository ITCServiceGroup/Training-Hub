import { useNode, useEditor } from '@craftjs/core';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Resizable } from 're-resizable';
import { debounce } from 'debounce';
import classNames from 'classnames';

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from '../../../utils/numToMeasurement';

export const Resizer = ({ propKey, children, onResize, ...props }) => {
  const {
    id,
    actions,
    connectors: { connect },
    fillSpace,
    nodeWidth,
    nodeHeight,
    parent,
    active,
  } = useNode((node) => ({
    parent: node.data.parent,
    active: node.events.selected,
    nodeWidth: node.data.props[propKey.width],
    nodeHeight: node.data.props[propKey.height],
    fillSpace: node.data.props.fillSpace,
  }));

  const { isRootNode, parentDirection } = useEditor((state, query) => {
    return {
      parentDirection:
        parent &&
        state.nodes[parent] &&
        state.nodes[parent].data.props.flexDirection,
      isRootNode: query.node(id).isRoot(),
    };
  });

  const resizable = useRef(null);
  const isResizing = useRef(false);
  const editingDimensions = useRef(null);
  const nodeDimensions = useRef(null);
  nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

  /**
   * Using an internal value to ensure the width/height set in the node is converted to px
   * because the <re-resizable /> library does not work well with percentages.
   */
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
        acc[key] = active;
        return acc;
      }, {})}
      className={classNames({
        'm-auto': isRootNode
      })}
      style={{
        boxSizing: 'border-box',
        minHeight: '50px',
        position: 'relative',
        width: '100%'
      }}
      ref={(ref) => {
        if (ref) {
          resizable.current = ref;
          connect(resizable.current.resizable);
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

        // Update with debounce to improve performance
        actions.setProp((prop) => {
          prop[propKey.width] = width;
          prop[propKey.height] = height;
        }, 500);
      }}
      onResizeStop={() => {
        isResizing.current = false;
        updateInternalDimensionsWithOriginal();

        // Call the onResize callback if provided
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
        width: '100%',
        height: '100%',
        display: 'flex',
        ...(props.style || {})
      }}>
        {children}
      </div>
      {active && (
        <div className="resize-indicators" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <span style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#0d9488',
            borderRadius: '50%',
            display: 'block',
            boxShadow: '0px 0px 12px -1px rgba(0, 0, 0, 0.25)',
            zIndex: 99999,
            pointerEvents: 'none',
            border: '2px solid #fff',
            top: '-5px',
            left: '-5px'
          }}></span>
          <span style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#0d9488',
            borderRadius: '50%',
            display: 'block',
            boxShadow: '0px 0px 12px -1px rgba(0, 0, 0, 0.25)',
            zIndex: 99999,
            pointerEvents: 'none',
            border: '2px solid #fff',
            top: '-5px',
            right: '-5px'
          }}></span>
          <span style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#0d9488',
            borderRadius: '50%',
            display: 'block',
            boxShadow: '0px 0px 12px -1px rgba(0, 0, 0, 0.25)',
            zIndex: 99999,
            pointerEvents: 'none',
            border: '2px solid #fff',
            bottom: '-5px',
            left: '-5px'
          }}></span>
          <span style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#0d9488',
            borderRadius: '50%',
            display: 'block',
            boxShadow: '0px 0px 12px -1px rgba(0, 0, 0, 0.25)',
            zIndex: 99999,
            pointerEvents: 'none',
            border: '2px solid #fff',
            bottom: '-5px',
            right: '-5px'
          }}></span>
        </div>
      )}
    </Resizable>
  );
};
