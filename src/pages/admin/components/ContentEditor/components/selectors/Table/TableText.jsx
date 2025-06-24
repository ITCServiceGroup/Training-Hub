import { useNode, useEditor } from '@craftjs/core';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import useTableTextFormatting from '../../../../../../../hooks/useTableTextFormatting';
import TextContextMenu from '../../../../../../../components/common/TextContextMenu';
import LinkDialog from '../../../../../../../components/common/LinkDialog';


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
  linkColor = {
    light: { r: 59, g: 130, b: 246, a: 1 }, // Blue-500
    dark: { r: 96, g: 165, b: 250, a: 1 }   // Blue-400
  },
  linkHoverColor = {
    light: { r: 37, g: 99, b: 235, a: 1 },  // Blue-600
    dark: { r: 59, g: 130, b: 246, a: 1 }   // Blue-500
  },
  autoConvertColors = true,
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

  // Create a ref for the ContentEditable element to use with text formatting
  const contentEditableRef = useRef(null);

  // Text formatting functionality
  const {
    activeFormats,
    selectedText,
    showContextMenu,
    contextMenuPosition,
    showLinkDialog,
    linkDialogData,
    applyFormat,
    handleLinkSave,
    closeContextMenu,
    closeLinkDialog
  } = useTableTextFormatting(contentEditableRef, (newHtml, isFormattingOperation = false) => {
    // Update the component when formatting changes
    if (enabled) {
      // Update our refs immediately to prevent conflicts with handleChange
      htmlContent.current = newHtml;

      // Update placeholder state
      setIsPlaceholder(newHtml === '' || newHtml === 'Click to edit');

      // Update the table cell content
      setProp((prop) => (prop.text = newHtml));

      // If custom onChange handler is provided, call it
      if (onChange) onChange(newHtml);
    }
  });

  // Handle link save with theme colors applied
  const handleLinkSaveWithColors = React.useCallback((linkData) => {
    try {
      const currentLinkColor = getThemeColor(linkColor, isDark, 'link', autoConvertColors);
      const linkColors = {
        color: currentLinkColor
      };
      return handleLinkSave(linkData, linkColors);
    } catch (error) {
      console.warn('Error getting link colors, using default:', error);
      return handleLinkSave(linkData);
    }
  }, [handleLinkSave, linkColor, isDark, autoConvertColors]);

  // Generate dynamic link styles with a stable ID based on component
  const componentId = React.useMemo(() => {
    return `table-text-component-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const linkStyles = React.useMemo(() => {
    try {
      const currentLinkColor = getThemeColor(linkColor, isDark, 'link', autoConvertColors);
      const currentLinkHoverColor = getThemeColor(linkHoverColor, isDark, 'link', autoConvertColors);

      return `
        .${componentId} a {
          color: rgba(${currentLinkColor.r}, ${currentLinkColor.g}, ${currentLinkColor.b}, ${currentLinkColor.a}) !important;
          text-decoration: underline !important;
          transition: color 0.2s ease !important;
        }
        .${componentId} a:hover {
          color: rgba(${currentLinkHoverColor.r}, ${currentLinkHoverColor.g}, ${currentLinkHoverColor.b}, ${currentLinkHoverColor.a}) !important;
        }
      `;
    } catch (error) {
      console.warn('Error generating link styles:', error);
      return `
        .${componentId} a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        .${componentId} a:hover {
          color: #2563eb !important;
        }
      `;
    }
  }, [
    componentId,
    linkColor?.light?.r, linkColor?.light?.g, linkColor?.light?.b, linkColor?.light?.a,
    linkColor?.dark?.r, linkColor?.dark?.g, linkColor?.dark?.b, linkColor?.dark?.a,
    linkHoverColor?.light?.r, linkHoverColor?.light?.g, linkHoverColor?.light?.b, linkHoverColor?.light?.a,
    linkHoverColor?.dark?.r, linkHoverColor?.dark?.g, linkHoverColor?.dark?.b, linkHoverColor?.dark?.a,
    isDark,
    autoConvertColors
  ]);

  // Update the HTML content when text changes from props
  useEffect(() => {
    // Check if this is a placeholder text
    const newIsPlaceholder = text === '' || text === 'Click to edit';
    setIsPlaceholder(newIsPlaceholder);

    // Only set the content if not focused or if it's not a placeholder
    if (!isFocused || !newIsPlaceholder) {
      htmlContent.current = newIsPlaceholder ? (isFocused ? '' : 'Click to edit') : text;
    }
  }, [text, isFocused]);

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);

    // If this is a placeholder, clear the content when focused
    if (isPlaceholder) {
      htmlContent.current = '';
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
    <div
      ref={connect}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Inject dynamic link styles */}
      <style>{linkStyles}</style>

      <div
        ref={(el) => {
          contentEditableRef.current = el;
        }}
        contentEditable={enabled}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: htmlContent.current }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={(e) => {
          const newValue = e.target.innerHTML;
          htmlContent.current = newValue;

          // Update placeholder state
          setIsPlaceholder(newValue === '' || newValue === 'Click to edit');

          // Immediate update for table cells
          setProp((prop) => (prop.text = newValue));

          // If custom onChange handler is provided, call it
          if (onChange) onChange(newValue);
        }}
        onClick={(e) => {
          // Prevent event propagation to allow selecting the text without selecting the table
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          // Prevent table event handlers from interfering with text selection
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          // Prevent table event handlers from interfering with text selection
          e.stopPropagation();
        }}
        onSelectStart={(e) => {
          // Allow text selection within the cell
          e.stopPropagation();
        }}
        onDragStart={(e) => {
          // Prevent dragging of text content from interfering with table drag
          e.stopPropagation();
        }}
        className={`craft-table-text ${componentId} ${isPlaceholder && !isFocused ? 'placeholder' : ''}`}
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
          outline: selected ? '1px solid var(--color-primary)' : 'none',
          border: 'none',
          background: 'transparent',
          padding: 0,
          margin: 0,
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          msUserSelect: 'text'
        }}
      />

      {/* Context Menu for text formatting */}
      {enabled && (
        <TextContextMenu
          isVisible={showContextMenu}
          position={contextMenuPosition}
          selectedText={selectedText}
          activeFormats={activeFormats}
          onFormat={applyFormat}
          onClose={closeContextMenu}
          containerRef={contentEditableRef}
        />
      )}

      {/* Link Dialog */}
      <LinkDialog
        isOpen={showLinkDialog}
        onClose={closeLinkDialog}
        onSave={handleLinkSaveWithColors}
        initialUrl={linkDialogData.url}
        selectedText={linkDialogData.text}
        isEditing={linkDialogData.isEditing}
      />
    </div>
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
    linkColor: {
      light: { r: 59, g: 130, b: 246, a: 1 }, // Blue-500
      dark: { r: 96, g: 165, b: 250, a: 1 }   // Blue-400
    },
    linkHoverColor: {
      light: { r: 37, g: 99, b: 235, a: 1 },  // Blue-600
      dark: { r: 59, g: 130, b: 246, a: 1 }   // Blue-500
    },
    autoConvertColors: true,
    text: '', // Default to empty string to trigger placeholder
  },
  related: {
    toolbar: null, // No individual toolbar for table text - settings are handled at table level
  },
};
