import { useNode, useEditor } from '@craftjs/core';
import React, { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

import { TextSettings } from './TextSettings';
import { ICONS, ICON_NAME_MAP } from '@/components/icons';

// Add global CSS for proper list rendering
const listStyles = `
/* Base component styles */
.craft-text-component {
  min-height: 24px !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* Base list styles */
.craft-text-component ul,
.craft-text-component ol {
  list-style-position: outside !important;
  padding-left: 24px !important;
  margin: 0 !important;
  width: calc(100% - 24px) !important;
}

.craft-text-component ul {
  list-style-type: disc !important;
}

.craft-text-component ol {
  list-style-type: decimal !important;
}

.craft-text-component li {
  display: list-item !important;
  width: 100% !important;
  padding-left: 4px !important;
}

/* Text alignment specific styles */
.craft-text-component[style*="text-align: center"] ul,
.craft-text-component[style*="text-align: center"] ol {
  text-align: center !important;
}

.craft-text-component[style*="text-align: right"] ul,
.craft-text-component[style*="text-align: right"] ol {
  text-align: right !important;
}

/* Fix for bullet/number position with alignment */
.craft-text-component[style*="text-align: center"] ul,
.craft-text-component[style*="text-align: center"] ol,
.craft-text-component[style*="text-align: right"] ul,
.craft-text-component[style*="text-align: right"] ol {
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
}

.craft-text-component[style*="text-align: center"] li,
.craft-text-component[style*="text-align: right"] li {
  list-style-position: inside !important;
  padding-left: 0 !important;
}
`;

// Add the styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = listStyles;
  document.head.appendChild(styleElement);
}

// Helper function to format text with list type
const formatTextWithListType = (text, listType) => {
  if (!text || text === ' ') return text;

  // If text already has list markup, extract the content
  let content = text;
  if (content.includes('<ul') || content.includes('<ol')) {
    // Extract content from existing list
    content = content
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<ol[^>]*>/g, '')
      .replace(/<\/ol>/g, '')
      .replace(/<li[^>]*>/g, '')
      .replace(/<\/li>/g, '\n')
      .trim();
  }

  // Split content by newlines to create list items
  const lines = content.split('\n');
  if (lines.length === 0 || (lines.length === 1 && !lines[0].trim())) {
    lines[0] = 'Click to edit';
  }

  if (listType === 'bullet') {
    // Use style attribute to ensure bullets are visible
    return '<ul style="list-style-type: disc; list-style-position: outside; padding-left: 24px; width: calc(100% - 24px);">' +
           lines.map(line => `<li style="display: list-item; padding-left: 4px;">${line}</li>`).join('') +
           '</ul>';
  } else if (listType === 'number') {
    // Use style attribute to ensure numbers are visible
    return '<ol style="list-style-type: decimal; list-style-position: outside; padding-left: 24px; width: calc(100% - 24px);">' +
           lines.map(line => `<li style="display: list-item; padding-left: 4px;">${line}</li>`).join('') +
           '</ol>';
  } else {
    // No list formatting - preserve line breaks
    return lines.join('<br>');
  }
};

export const Text = ({
  fontSize = '15',
  lineHeight = 1.5,
  textAlign = 'left',
  fontWeight = '500',
  color = {
    light: { r: 92, g: 90, b: 90, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  shadow = {
    enabled: false,
    x: 0,
    y: 2,
    blur: 4,
    spread: 0,
    color: {
      light: { r: 0, g: 0, b: 0, a: 0.15 },
      dark: { r: 0, g: 0, b: 0, a: 0.25 }
    }
  },
  text = 'Text',
  margin = ['0', '0', '0', '0'],
  padding = ['0', '0', '0', '0'],
  listType = 'none', // none, bullet, number
  inTable = false,
  onChange = null,
  hasIcon = false,
  iconName = 'edit', // Default icon from new icon set
  iconColor = {
    light: { r: 92, g: 90, b: 90, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  autoConvertColors = true,
}) => {
  // Store the current text value in a ref to avoid re-renders
  const textValue = useRef(text || 'Click to edit');

  // Store the formatted HTML in a separate ref
  const formattedHtml = useRef(formatTextWithListType(textValue.current, listType));

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

  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  // Update the formatted HTML when text or listType changes from props
  useEffect(() => {
    // Only update if the text from props is different from our current value
    if (text !== textValue.current || listType !== prevListType.current) {
      textValue.current = text;
      formattedHtml.current = formatTextWithListType(text, listType);

      // Update the DOM if needed
      if (dom) {
        try {
          // Force a re-render
          setProp(props => {
            props._lastUpdate = Date.now();
          });
        } catch (error) {
          console.warn('Failed to update Text component props:', error);
        }
      }
    }
  }, [text, listType, setProp, dom]);

  // Keep track of the previous list type to detect changes
  const prevListType = useRef(listType);

  // Update prevListType when it changes
  useEffect(() => {
    prevListType.current = listType;
  }, [listType]);

  // Handle changes to the content
  const handleChange = (e) => {
    let newHtml = e.target.value;
    let plainText = newHtml;

    // Extract plain text from HTML
    if (listType !== 'none') {
      // Extract content from list structure
      plainText = newHtml
        .replace(/<ul[^>]*>/g, '')
        .replace(/<\/ul>/g, '')
        .replace(/<ol[^>]*>/g, '')
        .replace(/<\/ol>/g, '')
        .replace(/<li[^>]*>/g, '')
        .replace(/<\/li>/g, '\n')
        .trim();
    } else {
      // For regular text, preserve line breaks
      plainText = newHtml.replace(/<br\s*\/?>/g, '\n');
    }

    // Update our refs
    textValue.current = plainText;
    formattedHtml.current = newHtml;

    // Update the component props
    if (isInTableCell) {
      // Immediate update for table cells
      setProp((prop) => (prop.text = plainText));
      // If custom onChange handler is provided (for table cells), call it
      if (onChange) onChange(plainText);
    } else {
      // Keep the debounce for regular text editing
      setProp((prop) => (prop.text = plainText), 500);
    }
  };

  // Get the icon component if one is selected
  const IconComponent = hasIcon ? ICONS[iconName] : null;

  return (
    <div className="flex items-center" style={{ width: '100%' }}>
      {hasIcon && IconComponent && (
        <div
          className="flex-shrink-0 flex items-center"
          title={ICON_NAME_MAP[iconName] || "Icon"}
          style={{
            padding: `${Math.max(2, fontSize * 0.1)}px`,
            marginRight: `${Math.max(6, fontSize * 0.5)}px`,
          }}
        >
          <IconComponent
            style={{
              width: `${Math.max(12, fontSize * 0.8)}px`,
              height: `${Math.max(12, fontSize * 0.8)}px`,
              fill: (() => {
                try {
                  console.log('Icon color before conversion:', { iconColor, isDark, autoConvertColors });
                  const color = getThemeColor(iconColor, isDark, 'icon', autoConvertColors);
                  console.log('Icon color after conversion:', color);
                  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                } catch (error) {
                  console.warn('Error generating icon color:', error);
                  return isDark ? 'rgba(229, 231, 235, 1)' : 'rgba(92, 90, 90, 1)';
                }
              })()
            }}
          />
        </div>
      )}
      <ContentEditable
        innerRef={connect}
        html={formattedHtml.current}
        disabled={!enabled}
        onClick={handleClick}
        onChange={handleChange}
        className="craft-text-component"
        tagName="div"
        style={{
          width: '100%',
          margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
          padding: padding.every(p => p === '0' || p === 0)
            ? '4px 0' // Default padding if none is set
            : `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
          color: (() => {
            try {
              const textColor = getThemeColor(color, isDark, 'text');
              return `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${textColor.a})`;
            } catch (error) {
              console.warn('Error generating text color:', error);
              return isDark ? 'rgba(229, 231, 235, 1)' : 'rgba(92, 90, 90, 1)';
            }
          })(),
          textShadow: shadow.enabled
            ? (() => {
                try {
                  // Get the appropriate shadow color for the current theme
                  let shadowColor;
                  if (shadow.color && shadow.color.light && shadow.color.dark) {
                    // Theme-aware color
                    shadowColor = isDark ? shadow.color.dark : shadow.color.light;
                  } else if (shadow.color && 'r' in shadow.color) {
                    // Legacy format (single RGBA object)
                    if (isDark && autoConvertColors) {
                      // Auto-convert to dark mode
                      shadowColor = convertToThemeColor(shadow.color, true, 'shadow');
                    } else {
                      shadowColor = shadow.color;
                    }
                  } else {
                    // Fallback
                    shadowColor = { r: 0, g: 0, b: 0, a: isDark ? 0.25 : 0.15 };
                  }

                  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px rgba(${shadowColor.r || 0}, ${shadowColor.g || 0}, ${shadowColor.b || 0}, ${shadowColor.a || 0.15})`;
                } catch (error) {
                  console.warn('Error generating text shadow:', error);
                  return 'none';
                }
              })()
            : 'none',
          fontSize: `${fontSize}px`,
          fontWeight,
          textAlign,
          lineHeight: lineHeight,
          minHeight: '24px',
          cursor: 'text',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          // Add a subtle indicator for table cells to help with selection
          outline: isInTableCell && selected ? '1px solid rgba(13, 148, 136, 0.5)' : 'none'
        }}
      />
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    fontSize: '15',
    lineHeight: 1.5,
    textAlign: 'left',
    fontWeight: '500',
    color: {
      light: { r: 92, g: 90, b: 90, a: 1 },
      dark: { r: 229, g: 231, b: 235, a: 1 }
    },
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0'],
    shadow: {
      enabled: false,
      x: 0,
      y: 2,
      blur: 4,
      spread: 0,
      color: {
        light: { r: 0, g: 0, b: 0, a: 0.15 },
        dark: { r: 0, g: 0, b: 0, a: 0.25 }
      }
    },
    text: 'Text',
    listType: 'none',
    inTable: false,
    hasIcon: false,
    iconName: 'edit',
    iconColor: {
      light: { r: 92, g: 90, b: 90, a: 1 },
      dark: { r: 229, g: 231, b: 235, a: 1 }
    },
    _lastUpdate: 0,
    autoConvertColors: true,
  },
  related: {
    toolbar: TextSettings,
  },
};
