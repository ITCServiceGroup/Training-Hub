import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';
import { captureTableToolbar, restoreTableToolbar, preventCellSelection } from './TableFixHack';

export const TableSettings = () => {
  const { actions: { setProp }, id, borderStyle, borderWidth, borderColor, headerBackgroundColor, alternateRowColor, cellPadding, cellAlignment, tableData, padding, margin, width, height, fontSize, headerFontSize, textAlign, headerTextAlign } = useNode((node) => ({
    id: node.id,
    borderStyle: node.data.props.borderStyle,
    borderWidth: node.data.props.borderWidth,
    borderColor: node.data.props.borderColor,
    headerBackgroundColor: node.data.props.headerBackgroundColor,
    alternateRowColor: node.data.props.alternateRowColor,
    cellPadding: node.data.props.cellPadding,
    cellAlignment: node.data.props.cellAlignment,
    tableData: node.data.props.tableData,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    width: node.data.props.width,
    height: node.data.props.height,
    fontSize: node.data.props.fontSize,
    headerFontSize: node.data.props.headerFontSize,
    textAlign: node.data.props.textAlign,
    headerTextAlign: node.data.props.headerTextAlign
  }));

  // Get editor actions for selecting nodes
  const { actions } = useEditor();

  const handleColorChange = (colorKey, newColor) => {
    const hex = newColor.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    setProp((props) => {
      props[colorKey] = { ...props[colorKey], r, g, b };
    });
  };

  const handleOpacityChange = (colorKey, opacity) => {
    setProp((props) => {
      props[colorKey] = { ...props[colorKey], a: opacity };
    });
  };

  // Toggle sections
  const [showTableStructure, setShowTableStructure] = React.useState(true);
  const [showTableStyle, setShowTableStyle] = React.useState(true);
  const [showTableSpacing, setShowTableSpacing] = React.useState(true);

  return (
    <div className="text-settings">
      {/* Table Structure Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTableStructure ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTableStructure(!showTableStructure)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Table Structure
          </label>
          <FaChevronDown
            className={`transition-transform ${showTableStructure ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTableStructure && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Row Controls */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Capture the current toolbar position
                    captureTableToolbar();

                    // Prevent cell selection
                    preventCellSelection();

                    // Add a row
                    setProp((props) => {
                      props.tableData.rowCount += 1;
                    }, 0); // Use 0 delay for immediate update

                    // Select the table node to ensure toolbar stays with it
                    actions.selectNode(id);

                    // Restore the toolbar position after a short delay
                    setTimeout(() => {
                      restoreTableToolbar();

                      // Re-select the table node to ensure toolbar stays with it
                      actions.selectNode(id);
                    }, 100);
                  }}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded"
                >
                  <FaPlus className="inline mr-1" size={10} /> Row
                </button>
                <button
                  onClick={() => {
                    setProp((props) => {
                      if (props.tableData.rowCount > 1) {
                        props.tableData.rowCount -= 1;
                      }
                    });
                  }}
                  disabled={tableData.rowCount <= 1}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMinus className="inline mr-1" size={10} /> Row
                </button>
              </div>

              {/* Column Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Capture the current toolbar position
                    captureTableToolbar();

                    // Prevent cell selection
                    preventCellSelection();

                    // Add a column
                    setProp((props) => {
                      props.tableData.columnCount += 1;
                    }, 0); // Use 0 delay for immediate update

                    // Select the table node to ensure toolbar stays with it
                    actions.selectNode(id);

                    // Restore the toolbar position after a short delay
                    setTimeout(() => {
                      restoreTableToolbar();

                      // Re-select the table node to ensure toolbar stays with it
                      actions.selectNode(id);
                    }, 100);
                  }}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded"
                >
                  <FaPlus className="inline mr-1" size={10} /> Column
                </button>
                <button
                  onClick={() => {
                    setProp((props) => {
                      if (props.tableData.columnCount > 1) {
                        props.tableData.columnCount -= 1;
                      }
                    });
                  }}
                  disabled={tableData.columnCount <= 1}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMinus className="inline mr-1" size={10} /> Column
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Header Row
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={tableData.hasHeader}
                  onChange={(e) => {
                    setProp((props) => {
                      props.tableData.hasHeader = e.target.checked;
                      // If enabling header, initialize header font size and text alignment if not set
                      if (e.target.checked) {
                        // Initialize header font size to match regular font size if not set
                        if (!props.headerFontSize || props.headerFontSize === props.fontSize) {
                          props.headerFontSize = props.fontSize;
                        }
                        // Initialize header text alignment to match regular text alignment if not set
                        if (!props.headerTextAlign) {
                          props.headerTextAlign = props.textAlign;
                        }
                      }
                    });
                  }}
                  className="mr-2 h-4 w-4 text-teal-600 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300" style={{ position: 'relative', top: '-8px' }}>
                  Use first row as header
                </span>
              </div>
            </div>

            {/* Table Dimensions */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Dimensions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (%)</label>
                  <input
                    type="number"
                    value={width ? width.replace('%', '') : '100'}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      // Only update if the value is a valid number
                      if (value === '' || !isNaN(value)) {
                        setProp((props) => {
                          props.width = value ? `${value}%` : '100%';
                        });
                      }
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="100"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height === 'auto' ? '' : height.replace('px', '')}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      // If empty, set to 'auto', otherwise add 'px'
                      setProp((props) => {
                        props.height = value ? `${value}px` : 'auto';
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="auto"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTableStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTableStyle(!showTableStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Table Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showTableStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTableStyle && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Font Size Settings */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Font Size
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  value={fontSize}
                  min={10}
                  max={40}
                  onChange={(e) => {
                    setProp((props) => {
                      props.fontSize = parseInt(e.target.value, 10);
                    });
                  }}
                  className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{fontSize}px</span>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Text Alignment
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'left'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    setProp((props) => {
                      props.textAlign = 'left';
                    });
                  }}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'center'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    setProp((props) => {
                      props.textAlign = 'center';
                    });
                  }}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'right'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    setProp((props) => {
                      props.textAlign = 'right';
                    });
                  }}
                >
                  Right
                </button>
              </div>
            </div>

            {/* Header Font Size - Only show when header is enabled */}
            {tableData.hasHeader && (
              <>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Header Font Size
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      value={headerFontSize}
                      min={10}
                      max={40}
                      onChange={(e) => {
                        setProp((props) => {
                          props.headerFontSize = parseInt(e.target.value, 10);
                        });
                      }}
                      className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{headerFontSize}px</span>
                  </div>
                </div>

                {/* Header Text Alignment */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Header Text Alignment
                  </label>
                  <div className="flex space-x-1">
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        headerTextAlign === 'left'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => {
                        setProp((props) => {
                          props.headerTextAlign = 'left';
                        });
                      }}
                    >
                      Left
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        headerTextAlign === 'center'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => {
                        setProp((props) => {
                          props.headerTextAlign = 'center';
                        });
                      }}
                    >
                      Center
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        headerTextAlign === 'right'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => {
                        setProp((props) => {
                          props.headerTextAlign = 'right';
                        });
                      }}
                    >
                      Right
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Style
              </label>
              <div className="flex space-x-1">
                {['none', 'solid', 'dashed', 'dotted'].map((style) => (
                  <button
                    key={style}
                    className={`px-2 py-1 text-xs rounded capitalize ${
                      borderStyle === style
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => {
                      setProp((props) => {
                        props.borderStyle = style;
                      });
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Width
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  value={borderWidth}
                  min={1}
                  max={10}
                  onChange={(e) => {
                    setProp((props) => {
                      props.borderWidth = parseInt(e.target.value, 10);
                    });
                  }}
                  className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{borderWidth}px</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(borderColor.r).toString(16).padStart(2, '0')}${Math.round(borderColor.g).toString(16).padStart(2, '0')}${Math.round(borderColor.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('borderColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={borderColor.a}
                  onChange={(e) => handleOpacityChange('borderColor', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Header Background
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(headerBackgroundColor.r).toString(16).padStart(2, '0')}${Math.round(headerBackgroundColor.g).toString(16).padStart(2, '0')}${Math.round(headerBackgroundColor.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('headerBackgroundColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={headerBackgroundColor.a}
                  onChange={(e) => handleOpacityChange('headerBackgroundColor', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Alternate Row Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(alternateRowColor.r).toString(16).padStart(2, '0')}${Math.round(alternateRowColor.g).toString(16).padStart(2, '0')}${Math.round(alternateRowColor.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('alternateRowColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={alternateRowColor.a}
                  onChange={(e) => handleOpacityChange('alternateRowColor', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTableSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTableSpacing(!showTableSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Table Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showTableSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTableSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Table Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Table Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={margin[0] === '' || margin[0] === '0' ? '' : parseInt(margin[0])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newMargin = [...props.margin];
                        // If the field is empty, set it to 0
                        newMargin[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.margin = newMargin;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Bottom</label>
                  <input
                    type="number"
                    value={margin[2] === '' || margin[2] === '0' ? '' : parseInt(margin[2])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newMargin = [...props.margin];
                        // If the field is empty, set it to 0
                        newMargin[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.margin = newMargin;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Left</label>
                  <input
                    type="number"
                    value={margin[1] === '' || margin[1] === '0' ? '' : parseInt(margin[1])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newMargin = [...props.margin];
                        // If the field is empty, set it to 0
                        newMargin[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.margin = newMargin;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Right</label>
                  <input
                    type="number"
                    value={margin[3] === '' || margin[3] === '0' ? '' : parseInt(margin[3])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newMargin = [...props.margin];
                        // If the field is empty, set it to 0
                        newMargin[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.margin = newMargin;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Table Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Table Padding
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={padding[0] === '' || padding[0] === '0' ? '' : parseInt(padding[0])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newPadding = [...props.padding];
                        // If the field is empty, set it to 0
                        newPadding[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.padding = newPadding;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Bottom</label>
                  <input
                    type="number"
                    value={padding[2] === '' || padding[2] === '0' ? '' : parseInt(padding[2])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newPadding = [...props.padding];
                        // If the field is empty, set it to 0
                        newPadding[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.padding = newPadding;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Left</label>
                  <input
                    type="number"
                    value={padding[1] === '' || padding[1] === '0' ? '' : parseInt(padding[1])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newPadding = [...props.padding];
                        // If the field is empty, set it to 0
                        newPadding[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.padding = newPadding;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Right</label>
                  <input
                    type="number"
                    value={padding[3] === '' || padding[3] === '0' ? '' : parseInt(padding[3])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setProp((props) => {
                        const newPadding = [...props.padding];
                        // If the field is empty, set it to 0
                        newPadding[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                        props.padding = newPadding;
                      });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Cell Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Cell Padding
              </label>
              <input
                type="number"
                value={cellPadding}
                min={0}
                max={20}
                onChange={(e) => {
                  setProp((props) => {
                    props.cellPadding = parseInt(e.target.value, 10);
                  });
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Cell Vertical Alignment */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Cell Vertical Alignment
              </label>
              <div className="flex space-x-1">
                {[
                  { value: 'top', label: 'Top' },
                  { value: 'middle', label: 'Middle' },
                  { value: 'bottom', label: 'Bottom' }
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`px-2 py-1 text-xs rounded ${
                      cellAlignment === option.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => {
                      setProp((props) => {
                        props.cellAlignment = option.value;
                      });
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
