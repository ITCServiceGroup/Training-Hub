import { useNode, useEditor } from '@craftjs/core';
import React, { useEffect, useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

/**
 * TableText component - A simplified version of the Text component specifically for table cells
 * This component doesn't include list formatting or other complex features that might break tables
 */
export const TableText = ({
  fontSize = '15',
  textAlign = 'left',
  fontWeight = '500',
  color = {
    light: { r: 92, g: 90, b: 90, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  text = 'Text',
  onChange = null,
}) => {
  // Track if this is a placeholder
  const [isPlaceholder, setIsPlaceholder] = useState(text === '' || text === 'Click to edit');
  // Track if the cell is focused
  const [isFocused, setIsFocused] = useState(false);

  // Use a ref to store the HTML content
  const htmlContent = useRef(text || '');

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

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Update the HTML content when text changes from props
  useEffect(() => {
    // Check if this is a placeholder text
    const newIsPlaceholder = text === '' || text === 'Click to edit';
    setIsPlaceholder(newIsPlaceholder);

    // Only set the content if not focused or if it's not a placeholder
    if (!isFocused || !newIsPlaceholder) {
      htmlContent.current = newIsPlaceholder ? (isFocused ? '' : 'Click to edit') : text;
    }

    // Force a re-render by setting a prop
    setProp(props => {
      props._lastUpdate = Date.now();
    });
  }, [text, setProp, isFocused]);

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);

    // If this is a placeholder, clear the content when focused
    if (isPlaceholder) {
      htmlContent.current = '';
      // Force a re-render
      setProp(props => {
        props._lastUpdate = Date.now();
      });
    }
  };

  // Handle blur event
  const handleBlur = () => {
    setIsFocused(false);

    // If the content is empty, restore the placeholder
    if (htmlContent.current === '') {
      htmlContent.current = 'Click to edit';
      setIsPlaceholder(true);

      // Update the component props with empty string
      // This ensures the actual stored value is empty, not "Click to edit"
      setProp((prop) => (prop.text = ''));
      if (onChange) onChange('');
    }
  };

  return (
    <ContentEditable
      innerRef={connect}
      html={htmlContent.current}
      disabled={!enabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={(e) => {
        // Prevent event propagation to allow selecting the text without selecting the table
        if (!selected) {
          e.stopPropagation();
        }
      }}
      onChange={(e) => {
        const newValue = e.target.value;
        htmlContent.current = newValue;

        // Update placeholder state
        setIsPlaceholder(newValue === '' || newValue === 'Click to edit');

        // Immediate update for table cells
        setProp((prop) => (prop.text = newValue));

        // If custom onChange handler is provided, call it
        if (onChange) onChange(newValue);
      }}
      className={`craft-table-text ${isPlaceholder && !isFocused ? 'placeholder' : ''}`}
      tagName="div"
      style={{
        width: '100%',
        color: isPlaceholder && !isFocused
          ? `rgba(${Object.values({ ...getThemeColor(color, isDark, 'table'), a: 0.8 })})` // Lighter color for placeholder
          : `rgba(${Object.values(getThemeColor(color, isDark, 'table'))})`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
        minHeight: '24px',
        cursor: 'text',
        outline: selected ? '1px solid rgba(13, 148, 136, 0.7)' : 'none'
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
    color: {
      light: { r: 92, g: 90, b: 90, a: 1 },
      dark: { r: 229, g: 231, b: 235, a: 1 }
    },
    text: '', // Default to empty string to trigger placeholder
    _lastUpdate: 0, // Add this to help with re-rendering
  },
  related: {
    toolbar: null, // No toolbar for table text
  },
};
