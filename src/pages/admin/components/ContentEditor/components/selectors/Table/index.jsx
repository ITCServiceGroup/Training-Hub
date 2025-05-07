import React, { useRef } from 'react';
import { useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import { TableText } from './TableText';
import { TableSettings } from './TableSettings';
import { useTheme } from '../../../../../../../contexts/ThemeContext';

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
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
  headerBackgroundColor: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
  alternateRowColor: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
  cellPadding: 8,
  cellAlignment: 'middle',
  fontSize: 14,
  headerFontSize: 14,
  textAlign: 'left',
  headerTextAlign: 'left'
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
    headerTextAlign
  } = props;

  // Get theme (used for styling)
  const { theme } = useTheme();

  // Reference to the table element
  const tableRef = useRef(null);

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

  // We don't need the editor state for this simplified implementation

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

        cells.push(
          <td
            key={cellKey}
            className={`craft-table-cell ${isHeader ? 'craft-table-header' : ''} ${!isHeader && ((tableData.hasHeader && i % 2 === 0) || (!tableData.hasHeader && i % 2 === 1)) ? 'craft-table-row-alternate' : ''}`}
            style={{
              padding: `${cellPadding}px`,
              verticalAlign: cellAlignment,
              border: borderStyle !== 'none' ?
                `${Math.max(borderWidth, 1)}px ${borderStyle} rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})` :
                'none',
              backgroundColor: isHeader
                ? `rgba(${headerBackgroundColor.r}, ${headerBackgroundColor.g}, ${headerBackgroundColor.b}, ${headerBackgroundColor.a})`
                : (!isHeader && ((tableData.hasHeader && i % 2 === 0) || (!tableData.hasHeader && i % 2 === 1)))
                  ? `rgba(${alternateRowColor.r}, ${alternateRowColor.g}, ${alternateRowColor.b}, ${alternateRowColor.a})`
                  : 'transparent',
              // Add a subtle outline when borders are none to help distinguish cells
              outline: borderStyle === 'none' ? (theme === 'dark' ? '1px solid rgba(55, 65, 81, 0.2)' : '1px solid rgba(229, 231, 235, 0.5)') : 'none',
              position: 'relative'
            }}
          >
            <TableText
              text={cellContent}
              fontSize={isHeader ? headerFontSize.toString() : fontSize.toString()}
              fontWeight={isHeader ? '600' : '400'}
              textAlign={isHeader ? headerTextAlign : textAlign}
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
        className={`craft-table table-fix ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
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
          height: '100%',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
        <table
          ref={tableRef}
          style={{
            width: '100%',
            height: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
            border: borderStyle !== 'none' ?
              `${Math.max(borderWidth, 1)}px ${borderStyle} rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})` :
              'none'
          }}
        >
          <tbody>
            {renderCells()}
          </tbody>
        </table>
      </div>
    </Resizer>
    </div>
  );
};

// Define craft.js configuration for the component
Table.craft = {
  displayName: 'Table',
  props: defaultProps,
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
