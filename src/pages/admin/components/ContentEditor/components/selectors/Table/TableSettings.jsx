import React, { useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';
import { captureTableToolbar, restoreTableToolbar, preventCellSelection } from './TableFixHack';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { convertToThemeColor, getThemeColor } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';

// Helper function to ensure both theme colors exist
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';
  const colorKeys = ['borderColor', 'headerBackgroundColor', 'alternateRowColor'];

  colorKeys.forEach(colorKey => {
    // Ensure the color property has the expected structure
    if (!props[colorKey]) {
      // Set default values based on the color key
      if (colorKey === 'borderColor') {
        props[colorKey] = {
          light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
          dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
        };
      } else if (colorKey === 'headerBackgroundColor') {
        props[colorKey] = {
          light: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
          dark: { r: 31, g: 41, b: 55, a: 1 } // #1f2937
        };
      } else if (colorKey === 'alternateRowColor') {
        props[colorKey] = {
          light: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
          dark: { r: 17, g: 24, b: 39, a: 0.5 } // #111827
        };
      }
    }

    // Handle legacy format (single RGBA object)
    if ('r' in props[colorKey]) {
      const oldColor = { ...props[colorKey] };
      props[colorKey] = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'table')
      };
    }

    // Ensure both light and dark properties exist with appropriate defaults
    if (!props[colorKey].light) {
      if (colorKey === 'borderColor') {
        props[colorKey].light = { r: 229, g: 231, b: 235, a: 1 }; // #e5e7eb
      } else if (colorKey === 'headerBackgroundColor') {
        props[colorKey].light = { r: 243, g: 244, b: 246, a: 1 }; // #f3f4f6
      } else if (colorKey === 'alternateRowColor') {
        props[colorKey].light = { r: 249, g: 250, b: 251, a: 1 }; // #f9fafb
      }
    }

    if (!props[colorKey].dark) {
      if (colorKey === 'borderColor') {
        props[colorKey].dark = { r: 75, g: 85, b: 99, a: 1 }; // #4b5563
      } else if (colorKey === 'headerBackgroundColor') {
        props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 }; // #1f2937
      } else if (colorKey === 'alternateRowColor') {
        props[colorKey].dark = { r: 17, g: 24, b: 39, a: 0.5 }; // #111827
      }
    }

    // If one theme is missing, generate it from the other
    if (props[colorKey][currentTheme] && !props[colorKey][oppositeTheme]) {
      props[colorKey][oppositeTheme] = convertToThemeColor(props[colorKey][currentTheme], !isDark, 'table');
    } else if (props[colorKey][oppositeTheme] && !props[colorKey][currentTheme]) {
      props[colorKey][currentTheme] = convertToThemeColor(props[colorKey][oppositeTheme], isDark, 'table');
    }
  });

  return props;
};

export const TableSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { actions: { setProp }, id, borderStyle, borderWidth, borderColor, headerBackgroundColor, alternateRowColor, cellPadding, cellAlignment, tableData, columnWidths, padding, margin, width, height, fontSize, headerFontSize, textAlign, headerTextAlign, radius, shadow, autoConvertColors } = useNode((node) => ({
    id: node.id,
    borderStyle: node.data.props.borderStyle,
    borderWidth: node.data.props.borderWidth,
    borderColor: node.data.props.borderColor,
    headerBackgroundColor: node.data.props.headerBackgroundColor,
    alternateRowColor: node.data.props.alternateRowColor,
    cellPadding: node.data.props.cellPadding,
    cellAlignment: node.data.props.cellAlignment,
    tableData: node.data.props.tableData,
    columnWidths: node.data.props.columnWidths,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    width: node.data.props.width,
    height: node.data.props.height,
    fontSize: node.data.props.fontSize,
    headerFontSize: node.data.props.headerFontSize,
    textAlign: node.data.props.textAlign,
    headerTextAlign: node.data.props.headerTextAlign,
    radius: node.data.props.radius,
    shadow: node.data.props.shadow,
    autoConvertColors: node.data.props.autoConvertColors
  }));

  // Get editor actions for selecting nodes and history.ignore functionality
  const { actions } = useEditor();

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    // Use history.ignore to prevent automatic theme color initialization from being tracked in undo history
    actions.history.ignore().setProp(id, (props) => {
      return ensureThemeColors(props, isDark);
    });
  }, [actions, id, isDark]);

  const handleColorChange = (colorKey, newColor) => {
    setProp((props) => {
      try {
        // Ensure the color property has the expected structure
        if (!props[colorKey]) {
          // Set default values based on the color key
          if (colorKey === 'borderColor') {
            props[colorKey] = {
              light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
              dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
            };
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey] = {
              light: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
              dark: { r: 31, g: 41, b: 55, a: 1 } // #1f2937
            };
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey] = {
              light: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
              dark: { r: 17, g: 24, b: 39, a: 0.5 } // #111827
            };
          } else {
            // Generic fallback
            props[colorKey] = {
              light: { r: 255, g: 255, b: 255, a: 1 },
              dark: { r: 51, g: 65, b: 85, a: 1 }
            };
          }
        }

        // Handle legacy format (single RGBA object)
        if ('r' in props[colorKey]) {
          const oldColor = { ...props[colorKey] };
          props[colorKey] = {
            light: oldColor,
            dark: convertToThemeColor(oldColor, true, 'table')
          };
        }

        // Ensure both light and dark properties exist with appropriate defaults
        if (!props[colorKey].light) {
          if (colorKey === 'borderColor') {
            props[colorKey].light = { r: 229, g: 231, b: 235, a: 1 }; // #e5e7eb
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey].light = { r: 243, g: 244, b: 246, a: 1 }; // #f3f4f6
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey].light = { r: 249, g: 250, b: 251, a: 1 }; // #f9fafb
          } else {
            props[colorKey].light = { r: 255, g: 255, b: 255, a: 1 };
          }
        }

        if (!props[colorKey].dark) {
          if (colorKey === 'borderColor') {
            props[colorKey].dark = { r: 75, g: 85, b: 99, a: 1 }; // #4b5563
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 }; // #1f2937
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey].dark = { r: 17, g: 24, b: 39, a: 0.5 }; // #111827
          } else {
            props[colorKey].dark = { r: 51, g: 65, b: 85, a: 1 };
          }
        }

        const currentTheme = isDark ? 'dark' : 'light';
        const oppositeTheme = isDark ? 'light' : 'dark';

        // Ensure autoConvertColors property exists
        if (typeof props.autoConvertColors === 'undefined') {
          props.autoConvertColors = true;
        }

        if (props.autoConvertColors) {
          // Auto-convert the color for the opposite theme
          const oppositeColor = convertToThemeColor(newColor, !isDark, 'table');

          props[colorKey] = {
            ...props[colorKey],
            [currentTheme]: newColor,
            [oppositeTheme]: oppositeColor
          };
        } else {
          // Only update the current theme's color
          props[colorKey] = {
            ...props[colorKey],
            [currentTheme]: newColor
          };
        }
      } catch (error) {
        console.warn('Error in handleColorChange:', error);
        // Provide a safe fallback
        props[colorKey] = {
          light: { r: 255, g: 255, b: 255, a: 1 },
          dark: { r: 51, g: 65, b: 85, a: 1 }
        };
      }
    });
  };

  // Handler for opposite theme color change
  const handleOppositeThemeColorChange = (colorKey, newColor) => {
    setProp((props) => {
      try {
        // Ensure the color property has the expected structure
        if (!props[colorKey]) {
          // Set default values based on the color key
          if (colorKey === 'borderColor') {
            props[colorKey] = {
              light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
              dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
            };
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey] = {
              light: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
              dark: { r: 31, g: 41, b: 55, a: 1 } // #1f2937
            };
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey] = {
              light: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
              dark: { r: 17, g: 24, b: 39, a: 0.5 } // #111827
            };
          } else {
            // Generic fallback
            props[colorKey] = {
              light: { r: 255, g: 255, b: 255, a: 1 },
              dark: { r: 51, g: 65, b: 85, a: 1 }
            };
          }
        }

        // Handle legacy format (single RGBA object)
        if ('r' in props[colorKey]) {
          const oldColor = { ...props[colorKey] };
          props[colorKey] = {
            light: oldColor,
            dark: convertToThemeColor(oldColor, true, 'table')
          };
        }

        // Ensure both light and dark properties exist with appropriate defaults
        if (!props[colorKey].light) {
          if (colorKey === 'borderColor') {
            props[colorKey].light = { r: 229, g: 231, b: 235, a: 1 }; // #e5e7eb
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey].light = { r: 243, g: 244, b: 246, a: 1 }; // #f3f4f6
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey].light = { r: 249, g: 250, b: 251, a: 1 }; // #f9fafb
          } else {
            props[colorKey].light = { r: 255, g: 255, b: 255, a: 1 };
          }
        }

        if (!props[colorKey].dark) {
          if (colorKey === 'borderColor') {
            props[colorKey].dark = { r: 75, g: 85, b: 99, a: 1 }; // #4b5563
          } else if (colorKey === 'headerBackgroundColor') {
            props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 }; // #1f2937
          } else if (colorKey === 'alternateRowColor') {
            props[colorKey].dark = { r: 17, g: 24, b: 39, a: 0.5 }; // #111827
          } else {
            props[colorKey].dark = { r: 51, g: 65, b: 85, a: 1 };
          }
        }

        const oppositeTheme = isDark ? 'light' : 'dark';

        // Only update the opposite theme's color
        props[colorKey] = {
          ...props[colorKey],
          [oppositeTheme]: newColor
        };
      } catch (error) {
        console.warn('Error in handleOppositeThemeColorChange:', error);
        // Provide a safe fallback
        props[colorKey] = {
          light: { r: 255, g: 255, b: 255, a: 1 },
          dark: { r: 51, g: 65, b: 85, a: 1 }
        };
      }
    });
  };

  // Toggle sections
  const [showTableStructure, setShowTableStructure] = React.useState(true);
  const [showTableStyle, setShowTableStyle] = React.useState(true);
  const [showTableSpacing, setShowTableSpacing] = React.useState(true);
  const [showTooltip, setShowTooltip] = React.useState(false);

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

                      // Update column widths to maintain equal distribution
                      const newColumnCount = props.tableData.columnCount;
                      const equalWidth = 100 / newColumnCount;
                      props.columnWidths = Array(newColumnCount).fill(equalWidth);
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

                        // Update column widths to maintain equal distribution
                        const newColumnCount = props.tableData.columnCount;
                        const equalWidth = 100 / newColumnCount;
                        props.columnWidths = Array(newColumnCount).fill(equalWidth);
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
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
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

      {/* Color Settings Section */}
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
                <div className="w-3/4 flex items-center">
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
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={10}
                    max={40}
                    value={fontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 10 && value <= 40) {
                        setProp((props) => {
                          props.fontSize = value;
                        });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Font size in pixels"
                  />
                </div>
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
                      ? 'bg-primary text-white'
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
                      ? 'bg-primary text-white'
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
                      ? 'bg-primary text-white'
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
                    <div className="w-3/4 flex items-center">
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
                        className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                      />
                    </div>
                    <div className="w-1/4 flex items-center">
                      <input
                        type="number"
                        min={10}
                        max={40}
                        value={headerFontSize}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 10 && value <= 40) {
                            setProp((props) => {
                              props.headerFontSize = value;
                            });
                          }
                        }}
                        className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                        aria-label="Header font size in pixels"
                      />
                    </div>
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
                          ? 'bg-primary text-white'
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
                          ? 'bg-primary text-white'
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
                          ? 'bg-primary text-white'
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
                        ? 'bg-primary text-white'
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
                <div className="w-3/4 flex items-center">
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
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={borderWidth}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 1 && value <= 10) {
                        setProp((props) => {
                          props.borderWidth = value;
                        });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Border width in pixels"
                  />
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Radius</label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    value={radius}
                    min={0}
                    max={50}
                    onChange={(e) => setProp((props) => { props.radius = parseInt(e.target.value); })}
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={radius}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0 && value <= 50) {
                        setProp((props) => { props.radius = value; });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Border radius in pixels"
                  />
                </div>
              </div>
            </div>

            {/* Auto-convert colors between themes */}
            <div className="mb-3 relative">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConvertColors"
                  checked={autoConvertColors}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setProp((props) => {
                      // Update the autoConvertColors flag
                      props.autoConvertColors = isChecked;

                      // When disabling auto-convert, make sure both light and dark theme colors are properly set
                      if (!isChecked) {
                        // Use the ensureThemeColors helper to ensure both light and dark colors are set
                        return ensureThemeColors(props, isDark);
                      }

                      // If turning auto-convert on, update all colors
                      if (isChecked) {
                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';
                        const colorKeys = ['borderColor', 'headerBackgroundColor', 'alternateRowColor'];

                        colorKeys.forEach(colorKey => {
                          // If the current theme color exists, update the opposite theme color
                          if (props[colorKey] && props[colorKey][currentTheme]) {
                            const currentColor = props[colorKey][currentTheme];
                            props[colorKey][oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'table');
                          }
                        });
                      }

                      return props;
                    });
                  }}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="autoConvertColors" className="text-xs text-gray-700 dark:text-gray-300 mr-1">
                  Auto convert colors between light and dark mode
                </label>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex-shrink-0"
                  onClick={() => setShowTooltip(!showTooltip)}
                  aria-label="Show explanation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showTooltip && (
                  <div className="absolute z-10 right-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded shadow-lg text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    When enabled, colors will automatically be converted between light and dark mode.
                    When disabled, you can set different colors for each mode.
                    <div className="absolute inset-0 bg-transparent" onClick={() => setShowTooltip(false)}></div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (borderColor && borderColor[currentTheme] &&
                          typeof borderColor[currentTheme].r !== 'undefined' &&
                          typeof borderColor[currentTheme].g !== 'undefined' &&
                          typeof borderColor[currentTheme].b !== 'undefined') {
                        return borderColor[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 75, g: 85, b: 99, a: 1 } :
                        { r: 229, g: 231, b: 235, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 75, g: 85, b: 99, a: 1 } :
                        { r: 229, g: 231, b: 235, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('borderColor', newColor)}
                  componentType="table"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Border Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (borderColor && borderColor[oppositeTheme] &&
                              typeof borderColor[oppositeTheme].r !== 'undefined' &&
                              typeof borderColor[oppositeTheme].g !== 'undefined' &&
                              typeof borderColor[oppositeTheme].b !== 'undefined') {
                            return borderColor[oppositeTheme];
                          } else if (borderColor && borderColor[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(borderColor[currentTheme], !isDark, 'table');
                          }
                          // Fallback to default color for opposite theme
                          return isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 75, g: 85, b: 99, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 75, g: 85, b: 99, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => handleOppositeThemeColorChange('borderColor', newColor)}
                      componentType="table"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Header Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (headerBackgroundColor && headerBackgroundColor[currentTheme] &&
                          typeof headerBackgroundColor[currentTheme].r !== 'undefined' &&
                          typeof headerBackgroundColor[currentTheme].g !== 'undefined' &&
                          typeof headerBackgroundColor[currentTheme].b !== 'undefined') {
                        return headerBackgroundColor[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 243, g: 244, b: 246, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 243, g: 244, b: 246, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('headerBackgroundColor', newColor)}
                  componentType="table"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Header Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (headerBackgroundColor && headerBackgroundColor[oppositeTheme] &&
                              typeof headerBackgroundColor[oppositeTheme].r !== 'undefined' &&
                              typeof headerBackgroundColor[oppositeTheme].g !== 'undefined' &&
                              typeof headerBackgroundColor[oppositeTheme].b !== 'undefined') {
                            return headerBackgroundColor[oppositeTheme];
                          } else if (headerBackgroundColor && headerBackgroundColor[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(headerBackgroundColor[currentTheme], !isDark, 'table');
                          }
                          // Fallback to default color for opposite theme
                          return isDark ?
                            { r: 243, g: 244, b: 246, a: 1 } :
                            { r: 31, g: 41, b: 55, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return isDark ?
                            { r: 243, g: 244, b: 246, a: 1 } :
                            { r: 31, g: 41, b: 55, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => handleOppositeThemeColorChange('headerBackgroundColor', newColor)}
                      componentType="table"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Alternate Row Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (alternateRowColor && alternateRowColor[currentTheme] &&
                          typeof alternateRowColor[currentTheme].r !== 'undefined' &&
                          typeof alternateRowColor[currentTheme].g !== 'undefined' &&
                          typeof alternateRowColor[currentTheme].b !== 'undefined') {
                        return alternateRowColor[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 17, g: 24, b: 39, a: 0.5 } :
                        { r: 249, g: 250, b: 251, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 17, g: 24, b: 39, a: 0.5 } :
                        { r: 249, g: 250, b: 251, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('alternateRowColor', newColor)}
                  componentType="table"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Alternate Row Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (alternateRowColor && alternateRowColor[oppositeTheme] &&
                              typeof alternateRowColor[oppositeTheme].r !== 'undefined' &&
                              typeof alternateRowColor[oppositeTheme].g !== 'undefined' &&
                              typeof alternateRowColor[oppositeTheme].b !== 'undefined') {
                            return alternateRowColor[oppositeTheme];
                          } else if (alternateRowColor && alternateRowColor[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(alternateRowColor[currentTheme], !isDark, 'table');
                          }
                          // Fallback to default color for opposite theme
                          return isDark ?
                            { r: 249, g: 250, b: 251, a: 1 } :
                            { r: 17, g: 24, b: 39, a: 0.5 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return isDark ?
                            { r: 249, g: 250, b: 251, a: 1 } :
                            { r: 17, g: 24, b: 39, a: 0.5 };
                        }
                      })()}
                      onChange={(newColor) => handleOppositeThemeColorChange('alternateRowColor', newColor)}
                      componentType="table"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shadow Settings */}
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableShadow"
                  checked={shadow?.enabled || false}
                  onChange={(e) => {
                    setProp((props) => {
                      if (!props.shadow) {
                        props.shadow = {
                          enabled: e.target.checked,
                          x: 0,
                          y: 4,
                          blur: 8,
                          spread: 0,
                          color: {
                            light: { r: 0, g: 0, b: 0, a: 0.15 },
                            dark: { r: 255, g: 255, b: 255, a: 0.15 }
                          }
                        };
                      } else {
                        props.shadow.enabled = e.target.checked;
                      }
                    });
                  }}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                />
                <label
                  htmlFor="enableShadow"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer leading-none pt-1"
                >
                  Enable Shadow
                </label>
              </div>
              {shadow?.enabled && (
                <div className="space-y-2 pl-6 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X Offset</label>
                      <input
                        type="number"
                        value={shadow?.x || 0}
                        onChange={(e) => setProp((props) => {
                          if (!props.shadow) {
                            props.shadow = {
                              enabled: true,
                              x: parseInt(e.target.value),
                              y: 4,
                              blur: 8,
                              spread: 0,
                              color: {
                                light: { r: 0, g: 0, b: 0, a: 0.15 },
                                dark: { r: 255, g: 255, b: 255, a: 0.15 }
                              }
                            };
                          } else {
                            props.shadow.x = parseInt(e.target.value);
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Offset</label>
                      <input
                        type="number"
                        value={shadow?.y || 4}
                        onChange={(e) => setProp((props) => {
                          if (!props.shadow) {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: parseInt(e.target.value),
                              blur: 8,
                              spread: 0,
                              color: {
                                light: { r: 0, g: 0, b: 0, a: 0.15 },
                                dark: { r: 255, g: 255, b: 255, a: 0.15 }
                              }
                            };
                          } else {
                            props.shadow.y = parseInt(e.target.value);
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blur</label>
                      <input
                        type="number"
                        value={shadow?.blur || 8}
                        onChange={(e) => setProp((props) => {
                          if (!props.shadow) {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: 4,
                              blur: parseInt(e.target.value),
                              spread: 0,
                              color: {
                                light: { r: 0, g: 0, b: 0, a: 0.15 },
                                dark: { r: 255, g: 255, b: 255, a: 0.15 }
                              }
                            };
                          } else {
                            props.shadow.blur = parseInt(e.target.value);
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</label>
                      <input
                        type="number"
                        value={shadow?.spread || 0}
                        onChange={(e) => setProp((props) => {
                          if (!props.shadow) {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: 4,
                              blur: 8,
                              spread: parseInt(e.target.value),
                              color: {
                                light: { r: 0, g: 0, b: 0, a: 0.15 },
                                dark: { r: 255, g: 255, b: 255, a: 0.15 }
                              }
                            };
                          } else {
                            props.shadow.spread = parseInt(e.target.value);
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Shadow Color */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Shadow Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={(() => {
                          try {
                            const currentTheme = isDark ? 'dark' : 'light';
                            // Always use the current theme's color directly
                            if (shadow?.color && shadow.color[currentTheme] &&
                                typeof shadow.color[currentTheme].r !== 'undefined' &&
                                typeof shadow.color[currentTheme].g !== 'undefined' &&
                                typeof shadow.color[currentTheme].b !== 'undefined') {
                              return shadow.color[currentTheme];
                            }
                            // Fallback to default color for current theme
                            return isDark ?
                              { r: 255, g: 255, b: 255, a: 0.15 } :
                              { r: 0, g: 0, b: 0, a: 0.15 };
                          } catch (error) {
                            console.warn('Error getting current theme shadow color:', error);
                            return isDark ?
                              { r: 255, g: 255, b: 255, a: 0.15 } :
                              { r: 0, g: 0, b: 0, a: 0.15 };
                          }
                        })()}
                        onChange={(newColor) => {
                          setProp((props) => {
                            const currentTheme = isDark ? 'dark' : 'light';
                            const oppositeTheme = isDark ? 'light' : 'dark';

                            if (!props.shadow) {
                              props.shadow = {
                                enabled: true,
                                x: 0,
                                y: 4,
                                blur: 8,
                                spread: 0,
                                color: {
                                  [currentTheme]: newColor,
                                  [oppositeTheme]: isDark ?
                                    { r: 0, g: 0, b: 0, a: 0.15 } :
                                    { r: 255, g: 255, b: 255, a: 0.15 }
                                }
                              };
                            } else {
                              if (!props.shadow.color) {
                                props.shadow.color = {};
                              }

                              if (props.autoConvertColors) {
                                // Auto-convert the color for the opposite theme
                                const oppositeColor = convertToThemeColor(newColor, !isDark, 'shadow');

                                props.shadow.color = {
                                  ...props.shadow.color,
                                  [currentTheme]: newColor,
                                  [oppositeTheme]: oppositeColor
                                };
                              } else {
                                // Only update the current theme's color
                                props.shadow.color = {
                                  ...props.shadow.color,
                                  [currentTheme]: newColor
                                };
                              }
                            }
                          });
                        }}
                        componentType="shadow"
                      />
                    </div>

                    {/* Show opposite theme color control when auto-convert is disabled */}
                    {!autoConvertColors && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Shadow Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                        </label>
                        <div className="flex items-center">
                          <ColorPicker
                            color={(() => {
                              try {
                                const oppositeTheme = isDark ? 'light' : 'dark';
                                const currentTheme = isDark ? 'dark' : 'light';

                                // Ensure we have a valid color for the opposite theme
                                if (shadow?.color && shadow.color[oppositeTheme] &&
                                    typeof shadow.color[oppositeTheme].r !== 'undefined' &&
                                    typeof shadow.color[oppositeTheme].g !== 'undefined' &&
                                    typeof shadow.color[oppositeTheme].b !== 'undefined') {
                                  return shadow.color[oppositeTheme];
                                } else if (shadow?.color && shadow.color[currentTheme]) {
                                  // If opposite theme color is missing but current theme exists, convert it
                                  return convertToThemeColor(shadow.color[currentTheme], !isDark, 'shadow');
                                }
                                // Fallback to default color for opposite theme
                                return !isDark ?
                                  { r: 255, g: 255, b: 255, a: 0.15 } :
                                  { r: 0, g: 0, b: 0, a: 0.15 };
                              } catch (error) {
                                console.warn('Error getting opposite theme shadow color:', error);
                                return !isDark ?
                                  { r: 255, g: 255, b: 255, a: 0.15 } :
                                  { r: 0, g: 0, b: 0, a: 0.15 };
                              }
                            })()}
                            onChange={(newColor) => {
                              setProp((props) => {
                                const oppositeTheme = isDark ? 'light' : 'dark';

                                if (!props.shadow) {
                                  props.shadow = {
                                    enabled: true,
                                    x: 0,
                                    y: 4,
                                    blur: 8,
                                    spread: 0,
                                    color: {
                                      [oppositeTheme]: newColor
                                    }
                                  };
                                } else {
                                  if (!props.shadow.color) {
                                    props.shadow.color = {};
                                  }

                                  // Only update the opposite theme's color
                                  props.shadow.color = {
                                    ...props.shadow.color,
                                    [oppositeTheme]: newColor
                                  };
                                }
                              });
                            }}
                            componentType="shadow"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                        ? 'bg-primary text-white'
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
