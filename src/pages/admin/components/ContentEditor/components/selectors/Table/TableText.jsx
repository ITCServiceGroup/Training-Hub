import { useNode, useEditor } from '@craftjs/core';
import React, { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';

/**
 * TableText component - A simplified version of the Text component specifically for table cells
 * This component doesn't include list formatting or other complex features that might break tables
 */
export const TableText = ({
  fontSize = '15',
  textAlign = 'left',
  fontWeight = '500',
  color = { r: 92, g: 90, b: 90, a: 1 },
  text = 'Text',
  onChange = null,
}) => {
  // Use a ref to store the HTML content
  const htmlContent = useRef(text || 'Click to edit');
  
  const {
    connectors: { connect },
    actions: { setProp },
    selected
  } = useNode((node) => ({
    selected: node.events.selected
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Update the HTML content when text changes
  useEffect(() => {
    htmlContent.current = text || 'Click to edit';
    
    // Force a re-render by setting a prop
    setProp(props => {
      props._lastUpdate = Date.now();
    });
  }, [text, setProp]);

  return (
    <ContentEditable
      innerRef={connect}
      html={htmlContent.current}
      disabled={!enabled}
      onClick={(e) => {
        // Prevent event propagation to allow selecting the text without selecting the table
        if (!selected) {
          e.stopPropagation();
        }
      }}
      onChange={(e) => {
        const newValue = e.target.value;
        
        // Immediate update for table cells
        setProp((prop) => (prop.text = newValue));
        
        // If custom onChange handler is provided, call it
        if (onChange) onChange(newValue);
      }}
      className="craft-table-text"
      tagName="div"
      style={{
        width: '100%',
        color: `rgba(${Object.values(color)})`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
        minHeight: '24px',
        cursor: 'text',
        outline: selected ? '1px solid rgba(13, 148, 136, 0.5)' : 'none'
      }}
    />
  );
};

TableText.craft = {
  displayName: 'TableText',
  props: {
    fontSize: '15',
    textAlign: 'left',
    fontWeight: '500',
    color: { r: 92, g: 90, b: 90, a: 1 },
    text: 'Text',
    _lastUpdate: 0, // Add this to help with re-rendering
  },
  related: {
    toolbar: null, // No toolbar for table text
  },
};
