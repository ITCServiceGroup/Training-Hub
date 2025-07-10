import React, { useRef, useState, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import { TableText } from './TableText';
import { TableSettings } from './TableSettings';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

// Default props for the Table component
const defaultProps = {
  width: '100%',
  height: 'auto',
  // Keep the array as [Top, Right, Bottom, Left] internally for backward compatibility
  // But we'll interpret it as [Top, Bottom, Left, Right] in the UI and when applying styles
  margin: ['0', '0', '0', '0'],
  padding: ['0', '0', '0', '0'],
  tableData: {
    cells: {},
    rowCount: 4,
    columnCount: 4,
    hasHeader: true
  },
  columnWidths: [25, 25, 25, 25], // Default equal widths as percentages
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: {
    light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
    dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
  },
  headerBackgroundColor: {
    light: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
    dark: { r: 31, g: 41, b: 55, a: 1 } // #1f2937
  },
  radius: 0,
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: {
      light: { r: 0, g: 0, b: 0, a: 0.15 },
      dark: { r: 255, g: 255, b: 255, a: 0.15 }
    }
  },
  alternateRowColor: {
    light: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
    dark: { r: 17, g: 24, b: 39, a: 0.5 } // #111827
  },
  cellPadding: 8,
  cellAlignment: 'middle',
  fontSize: 14,
  headerFontSize: 14,
  textAlign: 'left',
  headerTextAlign: 'left',
  linkColor: {
    light: { r: 59, g: 130, b: 246, a: 1 }, // Blue-500
    dark: { r: 96, g: 165, b: 250, a: 1 }   // Blue-400
  },
  linkHoverColor: {
    light: { r: 37, g: 99, b: 235, a: 1 },  // Blue-600
    dark: { r: 59, g: 130, b: 246, a: 1 }   // Blue-500
  },
  autoConvertColors: true // Add auto color conversion property
};

/**
 * Table component for the ContentEditor
 */
export const Table = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  const {
    width,
    height,
    margin,
    padding,
    tableData,
    columnWidths,
    borderStyle,
    borderWidth,
    borderColor,
    headerBackgroundColor,
    alternateRowColor,
    cellPadding,
    cellAlignment,
    fontSize,
    headerFontSize,
    textAlign,
    headerTextAlign,
    linkColor,
    linkHoverColor,
    radius,
    shadow,
    autoConvertColors
  } = props;

  // Get theme (used for styling)
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Reference to the table element
  const tableRef = useRef(null);

  // State for column resizing using refs for stable event handlers
  const isResizingRef = useRef(false);
  const resizingColumnRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthsRef = useRef([]);
  const [isResizing, setIsResizing] = useState(false);

  // Get node information from craft.js
  const {
    connectors: { connect },
    actions,
    selected,
    hovered
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered
  }));

  // Initialize column widths if they don't exist or are mismatched
  const initializeColumnWidths = useCallback(() => {
    if (!columnWidths || columnWidths.length !== tableData.columnCount) {
      const equalWidth = 100 / tableData.columnCount;
      const newWidths = Array(tableData.columnCount).fill(equalWidth);
      actions.setProp((props) => {
        props.columnWidths = newWidths;
      });
      return newWidths;
    }
    return columnWidths;
  }, [columnWidths, tableData.columnCount, actions]);

  // Get current column widths (initialize if needed)
  const currentColumnWidths = initializeColumnWidths();

  // Create stable event handlers using refs
  const handleColumnResizeMove = useCallback((e) => {
    console.log('Mouse move during resize');
    if (!isResizingRef.current || resizingColumnRef.current === null) return;

    const deltaX = e.clientX - startXRef.current;
    const tableWidth = tableRef.current?.offsetWidth || 0;

    if (tableWidth === 0) return;

    // Calculate the percentage change
    const deltaPercent = (deltaX / tableWidth) * 100;

    // Create new widths array
    const newWidths = [...startWidthsRef.current];
    const minWidth = 5; // Minimum column width percentage

    // Adjust current column and next column
    if (resizingColumnRef.current < newWidths.length - 1) {
      const currentWidth = startWidthsRef.current[resizingColumnRef.current];
      const nextWidth = startWidthsRef.current[resizingColumnRef.current + 1];

      const newCurrentWidth = Math.max(minWidth, currentWidth + deltaPercent);
      const newNextWidth = Math.max(minWidth, nextWidth - deltaPercent);

      // Only update if both columns can maintain minimum width
      if (newCurrentWidth >= minWidth && newNextWidth >= minWidth) {
        newWidths[resizingColumnRef.current] = newCurrentWidth;
        newWidths[resizingColumnRef.current + 1] = newNextWidth;

        console.log('Updating column widths:', newWidths);

        // Update the component props
        actions.setProp((props) => {
          props.columnWidths = newWidths;
        });
      }
    }
  }, [actions]);

  const handleColumnResizeEnd = useCallback(() => {
    console.log('Column resize end');
    isResizingRef.current = false;
    resizingColumnRef.current = null;
    startXRef.current = 0;
    startWidthsRef.current = [];
    setIsResizing(false);

    // Remove global mouse event listeners
    document.removeEventListener('mousemove', handleColumnResizeMove);
    document.removeEventListener('mouseup', handleColumnResizeEnd);
  }, [handleColumnResizeMove]);

  // Column resize start handler
  const handleColumnResizeStart = useCallback((columnIndex, e) => {
    console.log('Column resize start:', columnIndex, e);
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    resizingColumnRef.current = columnIndex;
    startXRef.current = e.clientX;
    startWidthsRef.current = [...currentColumnWidths];
    setIsResizing(true);

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleColumnResizeMove);
    document.addEventListener('mouseup', handleColumnResizeEnd);
  }, [currentColumnWidths, handleColumnResizeMove, handleColumnResizeEnd]);

  // Handle cell content change
  const handleCellContentChange = (rowIndex, colIndex, content) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    actions.setProp((props) => {
      if (!props.tableData.cells) {
        props.tableData.cells = {};
      }
      props.tableData.cells[cellKey] = content;
    });
  };

  // Get cell content
  const getCellContent = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    // Return empty string if no content exists to trigger placeholder
    return tableData.cells && tableData.cells[cellKey] ? tableData.cells[cellKey] : '';
  };

  // Calculate border style for reference (used in cell borders)
  // const borderStyleValue = `${borderWidth}px ${borderStyle} rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;


  // Render table cells
  const renderCells = () => {
    const rows = [];

    for (let i = 0; i < tableData.rowCount; i++) {
      const cells = [];
      const isHeader = tableData.hasHeader && i === 0;

      for (let j = 0; j < tableData.columnCount; j++) {
        const cellContent = getCellContent(i, j);
        const cellKey = `${i}-${j}`;

        // Determine if this cell is a corner cell for border radius
        const isTopRow = i === 0;
        const isBottomRow = i === tableData.rowCount - 1;
        const isLeftColumn = j === 0;
        const isRightColumn = j === tableData.columnCount - 1;

        // Calculate border radius for corner cells
        let cellBorderRadius = '';
        if (radius > 0) {
          const radiusValue = `${radius}px`;
          if (isTopRow && isLeftColumn) {
            cellBorderRadius = `${radiusValue} 0 0 0`;
          } else if (isTopRow && isRightColumn) {
            cellBorderRadius = `0 ${radiusValue} 0 0`;
          } else if (isBottomRow && isLeftColumn) {
            cellBorderRadius = `0 0 0 ${radiusValue}`;
          } else if (isBottomRow && isRightColumn) {
            cellBorderRadius = `0 0 ${radiusValue} 0`;
          }
        }

        // Debug log to check cellAlignment value
        if (i === 0 && j === 0) {
          console.log('Table cellAlignment value:', cellAlignment);
        }

        cells.push(
          <td
            key={cellKey}
            className={`craft-table-cell cell-align-${cellAlignment} ${isHeader ? 'craft-table-header' : ''} ${!isHeader && ((tableData.hasHeader && i % 2 === 0) || (!tableData.hasHeader && i % 2 === 1)) ? 'craft-table-row-alternate' : ''}`}
            style={{
              padding: `${cellPadding}px`,
              width: `${currentColumnWidths[j] || (100 / tableData.columnCount)}%`,
              border: borderStyle !== 'none' ?
                `${Math.max(borderWidth, 1)}px ${borderStyle} rgba(${Object.values(getThemeColor(borderColor, isDark, 'table', autoConvertColors))})` :
                'none',
              backgroundColor: isHeader
                ? `rgba(${Object.values(getThemeColor(headerBackgroundColor, isDark, 'table', autoConvertColors))})`
                : (!isHeader && ((tableData.hasHeader && i % 2 === 0) || (!tableData.hasHeader && i % 2 === 1)))
                  ? `rgba(${Object.values(getThemeColor(alternateRowColor, isDark, 'table', autoConvertColors))})`
                  : 'transparent',
              // Add a subtle outline when borders are none to help distinguish cells
              outline: borderStyle === 'none' ? (theme === 'dark' ? '1px solid rgba(55, 65, 81, 0.2)' : '1px solid rgba(229, 231, 235, 0.5)') : 'none',
              position: 'relative',
              borderRadius: cellBorderRadius,
              // Ensure pointer events work for text selection
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => {
              // Allow text selection within cells, but prevent table selection
              e.stopPropagation();
            }}
          >
            <TableText
              text={cellContent}
              fontSize={isHeader ? headerFontSize.toString() : fontSize.toString()}
              fontWeight={isHeader ? '600' : '400'}
              textAlign={isHeader ? headerTextAlign : textAlign}
              linkColor={linkColor}
              linkHoverColor={linkHoverColor}
              autoConvertColors={autoConvertColors}
              onChange={(newContent) => handleCellContentChange(i, j, newContent)}
            />

          </td>
        );
      }

      rows.push(<tr key={i}>{cells}</tr>);
    }

    return rows;
  };

  return (
    <div
      className="table-outer-wrapper"
      style={{
        // Apply margins to the outer wrapper only
        // Convert from internal [Top, Right, Bottom, Left] to CSS order
        // Handle empty or undefined values by defaulting to 0
        margin: `${parseInt(margin[0]) || 0}px ${parseInt(margin[3]) || 0}px ${parseInt(margin[2]) || 0}px ${parseInt(margin[1]) || 0}px`,
        // Make sure the wrapper doesn't affect the table's dimensions
        display: 'inline-block',
        boxSizing: 'content-box',
        // Ensure the wrapper doesn't interfere with pointer events
        pointerEvents: 'none'
      }}
    >
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        ref={connect}
        className={`craft-table table-fix ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{
          // Convert from internal [Top, Right, Bottom, Left] to CSS order
          // Handle empty or undefined values by defaulting to 0
          padding: `${parseInt(padding[0]) || 0}px ${parseInt(padding[3]) || 0}px ${parseInt(padding[2]) || 0}px ${parseInt(padding[1]) || 0}px`,
          width: width,
          height: height,
          position: 'relative',
          boxSizing: 'border-box',
          zIndex: selected ? 1 : 'auto',
          overflow: 'visible',
          pointerEvents: 'none', // Always set to none and control with CSS
          // Remove margin from here as it's now on the wrapper
          margin: 0
        }}
    >
      {/* Resize handles - always rendered but only visible when selected via CSS */}
      <div
        className="table-handle-tl"
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
          // Find the resize handle within this specific table component
          const resizeHandle = e.currentTarget.closest('.craft-table').querySelector('.react-resizable-handle-nw');
          if (resizeHandle) {
            console.log('Dispatching event to NW handle');
            resizeHandle.dispatchEvent(event);
          } else {
            console.log('NW resize handle not found');
          }
        }}
      ></div>
      <div
        className="table-handle-tr"
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
          // Find the resize handle within this specific table component
          const resizeHandle = e.currentTarget.closest('.craft-table').querySelector('.react-resizable-handle-ne');
          if (resizeHandle) {
            console.log('Dispatching event to NE handle');
            resizeHandle.dispatchEvent(event);
          } else {
            console.log('NE resize handle not found');
          }
        }}
      ></div>
      <div
        className="table-handle-bl"
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
          // Find the resize handle within this specific table component
          const resizeHandle = e.currentTarget.closest('.craft-table').querySelector('.react-resizable-handle-sw');
          if (resizeHandle) {
            console.log('Dispatching event to SW handle');
            resizeHandle.dispatchEvent(event);
          } else {
            console.log('SW resize handle not found');
          }
        }}
      ></div>
      <div
        className="table-handle-br"
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
          // Find the resize handle within this specific table component
          const resizeHandle = e.currentTarget.closest('.craft-table').querySelector('.react-resizable-handle-se');
          if (resizeHandle) {
            console.log('Dispatching event to SE handle');
            resizeHandle.dispatchEvent(event);
          } else {
            console.log('SE resize handle not found');
          }
        }}
      ></div>
      <div
        className="table-content-wrapper"
        style={{
          width: '100%',
          height: 'auto',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
        <table
          ref={tableRef}
          style={{
            width: '100%',
            height: 'auto',
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
            borderRadius: `${radius}px`,
            overflow: 'hidden',
            border: borderStyle !== 'none' ?
              `${Math.max(borderWidth, 1)}px ${borderStyle} rgba(${Object.values(getThemeColor(borderColor, isDark, 'table', autoConvertColors))})` :
              'none',
            boxShadow: shadow.enabled
              ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(getThemeColor(shadow.color, isDark, 'shadow', autoConvertColors))})`
              : 'none',
          }}
        >
          <tbody>
            {renderCells()}
          </tbody>
        </table>

        {/* Column resize handles positioned over the table */}
        {selected && tableRef.current && currentColumnWidths.map((_, index) => {
          if (index >= tableData.columnCount - 1) return null; // Skip last column

          // Calculate the position of the resize handle
          let leftPosition = 0;
          for (let i = 0; i <= index; i++) {
            leftPosition += currentColumnWidths[i] || (100 / tableData.columnCount);
          }

          return (
            <div
              key={`resize-handle-${index}`}
              className="column-resize-handle"
              onMouseDown={(e) => handleColumnResizeStart(index, e)}
              style={{
                position: 'absolute',
                top: 0,
                left: `${leftPosition}%`,
                width: '4px',
                height: '100%',
                cursor: 'col-resize',
                backgroundColor: 'rgba(0, 123, 255, 0.1)', // Slight blue background for visibility
                zIndex: 1000,
                borderRight: '2px solid transparent',
                pointerEvents: 'auto',
                transform: 'translateX(-2px)' // Center the handle on the border
              }}
              onMouseEnter={(e) => {
                e.target.style.borderRight = '2px solid var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderRight = '2px solid transparent';
              }}
            />
          );
        })}
      </div>
    </Resizer>
    </div>
  );
};

// Define craft.js configuration for the component
Table.craft = {
  displayName: 'Table',
  props: {
    ...defaultProps,
    // Pre-compute the color values instead of using getters to avoid dynamic prop changes
    borderColor: defaultProps.borderColor.light && defaultProps.borderColor.dark
      ? defaultProps.borderColor
      : {
          light: defaultProps.borderColor,
          dark: convertToThemeColor(defaultProps.borderColor, true)
        },
    headerBackgroundColor: defaultProps.headerBackgroundColor.light && defaultProps.headerBackgroundColor.dark
      ? defaultProps.headerBackgroundColor
      : {
          light: defaultProps.headerBackgroundColor,
          dark: convertToThemeColor(defaultProps.headerBackgroundColor, true)
        },
    alternateRowColor: defaultProps.alternateRowColor.light && defaultProps.alternateRowColor.dark
      ? defaultProps.alternateRowColor
      : {
          light: defaultProps.alternateRowColor,
          dark: convertToThemeColor(defaultProps.alternateRowColor, true)
        },
    shadow: defaultProps.shadow && defaultProps.shadow.color && defaultProps.shadow.color.light && defaultProps.shadow.color.dark
      ? defaultProps.shadow
      : {
          ...defaultProps.shadow,
          color: {
            light: defaultProps.shadow.color.light || defaultProps.shadow.color,
            dark: defaultProps.shadow.color.dark || convertToThemeColor(defaultProps.shadow.color.light || defaultProps.shadow.color, true, 'shadow')
          }
        }
  },
  rules: {
    canDrag: () => true,
    canDrop: (dropTarget) => {
      // Allow dropping into any canvas element (like Container)
      return dropTarget.data.custom?.isCanvas || dropTarget.data.isCanvas;
    },
    canMoveIn: () => false,
    canMoveOut: () => true
  },
  related: {
    toolbar: TableSettings
  }
};
