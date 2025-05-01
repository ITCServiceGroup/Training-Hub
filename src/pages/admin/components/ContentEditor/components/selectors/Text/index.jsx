import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import ContentEditable from 'react-contenteditable';

import { TextSettings } from './TextSettings';

export const Text = ({
  fontSize = '15',
  textAlign = 'left',
  fontWeight = '500',
  color = { r: 92, g: 90, b: 90, a: 1 },
  shadow = 0,
  text = 'Text',
  margin = ['0', '0', '0', '0'],
  padding = ['0', '0', '0', '0'],
  inTable = false,
  onChange = null,
}) => {
  const {
    connectors: { connect },
    actions: { setProp },
    dom,
    selected
  } = useNode((node) => ({
    dom: node.dom,
    selected: node.events.selected
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Check if this Text component is inside a table cell
  const isInTableCell = React.useMemo(() => {
    if (inTable) return true;
    if (!dom) return false;
    return !!dom.closest('td');
  }, [dom, inTable]);

  // Handle click to prevent selection change when in a table
  const handleClick = React.useCallback((e) => {
    if (isInTableCell && !selected) {
      // If in a table and not already selected, prevent default selection behavior
      e.stopPropagation();
    }
  }, [isInTableCell, selected]);

  return (
    <ContentEditable
      innerRef={connect}
      html={text || (isInTableCell ? ' ' : 'Click to edit')} // Always have content in table cells
      disabled={!enabled}
      onClick={handleClick}
      onChange={(e) => {
        const newValue = e.target.value;
        if (isInTableCell) {
          // Immediate update for table cells
          setProp((prop) => (prop.text = newValue));
          // If custom onChange handler is provided (for table cells), call it
          if (onChange) onChange(newValue);
        } else {
          // Keep the debounce for regular text editing
          setProp((prop) => (prop.text = newValue), 500);
        }
      }}
      tagName="div" // Use div for better table cell compatibility
      style={{
        width: '100%',
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        color: `rgba(${Object.values(color)})`,
        textShadow: `0px 0px 2px rgba(0,0,0,${shadow / 100})`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
        minHeight: isInTableCell ? '24px' : 'auto',
        cursor: 'text',
        // Add a subtle indicator for table cells to help with selection
        outline: isInTableCell && selected ? '1px solid rgba(13, 148, 136, 0.5)' : 'none'
      }}
    />
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    fontSize: '15',
    textAlign: 'left',
    fontWeight: '500',
    color: { r: 92, g: 90, b: 90, a: 1 },
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0'],
    shadow: 0,
    text: 'Text',
    inTable: false,
  },
  related: {
    toolbar: TextSettings,
  },
};
