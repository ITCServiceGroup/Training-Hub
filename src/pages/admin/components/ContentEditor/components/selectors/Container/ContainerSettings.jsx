import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor, ensureThemeColors, initializeComponentThemeColors, createAutoConvertHandler } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';


export const ContainerSettings = () => {
  const { actions, id } = useNode((node) => ({
    id: node.id,
  }));
  const { actions: editorActions } = useEditor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Toggle sections
  const [showStructure, setShowStructure] = useState(true);
  const [showStyle, setShowStyle] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize theme colors for existing components when first loaded
  // COMMENTED OUT: Container already has proper theme-aware default props
  // useEffect(() => {
  //   initializeComponentThemeColors(editorActions, id, isDark, 'CONTAINER');
  // }, [editorActions, id]);

  const {
    background,
    padding,
    margin,
    flexDirection,
    alignItems,
    justifyContent,
    borderStyle,
    borderWidth,
    borderColor,
    radius,
    shadow,
    width,
    height,
    autoConvertColors,
  } = useNode((node) => {
    const props = node.data.props || {};

    // Handle backward compatibility for shadow
    let shadowValue = props.shadow;
    if (typeof shadowValue === 'number') {
      shadowValue = {
        enabled: shadowValue > 0,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      };
    }

    return {
      background: props.background || {
        light: { r: 255, g: 255, b: 255, a: 1 },
        dark: { r: 31, g: 41, b: 55, a: 1 }
      },
      padding: props.padding || ['0', '0', '0', '0'],
      margin: props.margin || ['0', '0', '0', '0'],
      flexDirection: props.flexDirection || 'column',
      alignItems: props.alignItems || 'flex-start',
      justifyContent: props.justifyContent || 'flex-start',
      borderStyle: props.borderStyle || 'none',
      borderWidth: props.borderWidth || 1,
      borderColor: props.borderColor || {
        light: { r: 229, g: 231, b: 235, a: 1 },
        dark: { r: 75, g: 85, b: 99, a: 1 }
      },
      radius: props.radius || 0,
      shadow: shadowValue || {
        enabled: false,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      },
      width: props.width || '100%',
      height: props.height || 'auto',
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true,
    };
  });

  return (
    <div className="text-settings">
      {/* Container Structure Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showStructure ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowStructure(!showStructure)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Structure
          </label>
          <FaChevronDown
            className={`transition-transform ${showStructure ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showStructure && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Dimensions */}
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
                        actions.setProp((props) => {
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
                      actions.setProp((props) => {
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

            {/* Layout Controls */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Layout</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Direction</label>
                  <div className="flex space-x-1">
                    <button
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        flexDirection === 'row'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => actions.setProp((props) => { props.flexDirection = 'row'; })}
                      title="Arrange items horizontally in a row"
                    >
                      Horizontal
                    </button>
                    <button
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        flexDirection === 'column'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => actions.setProp((props) => { props.flexDirection = 'column'; })}
                      title="Stack items vertically in a column"
                    >
                      Vertical
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {flexDirection === 'column' ? 'Horizontal Alignment' : 'Vertical Alignment'}
                    <span className="ml-1 text-gray-400 dark:text-gray-500" title={
                      flexDirection === 'column'
                        ? "Set how items are aligned horizontally within the container"
                        : "Set how items are aligned vertically within the container"
                    }>(?)</span>
                  </label>
                  <select
                    value={alignItems}
                    onChange={(e) => actions.setProp((props) => { props.alignItems = e.target.value; })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  >
                    <option value="flex-start">{flexDirection === 'column' ? 'Left' : 'Top'}</option>
                    <option value="center">{flexDirection === 'column' ? 'Center Horizontally' : 'Center Vertically'}</option>
                    <option value="flex-end">{flexDirection === 'column' ? 'Right' : 'Bottom'}</option>
                    <option value="stretch">{flexDirection === 'column' ? 'Fill Width' : 'Fill Height'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {flexDirection === 'column' ? 'Vertical Distribution' : 'Horizontal Distribution'}
                    <span className="ml-1 text-gray-400 dark:text-gray-500" title={
                      flexDirection === 'column'
                        ? "Control the vertical spacing between items"
                        : "Control the horizontal spacing between items"
                    }>(?)</span>
                  </label>
                  <select
                    value={justifyContent}
                    onChange={(e) => actions.setProp((props) => { props.justifyContent = e.target.value; })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  >
                    <option value="flex-start">{flexDirection === 'column' ? 'Top' : 'Left'}</option>
                    <option value="center">{flexDirection === 'column' ? 'Center Vertically' : 'Center Horizontally'}</option>
                    <option value="flex-end">{flexDirection === 'column' ? 'Bottom' : 'Right'}</option>
                    <option value="space-between">Space Between Items</option>
                    <option value="space-around">{flexDirection === 'column' ? 'Even Vertical Spacing' : 'Even Horizontal Spacing'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Container Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowStyle(!showStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showStyle && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Auto-convert colors between themes */}
            <div className="mb-3 relative">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConvertColors"
                  checked={autoConvertColors}
                  onChange={(e) => createAutoConvertHandler(actions, isDark, 'CONTAINER')(e.target.checked)}
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

            {/* Background */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(background, isDark, 'container')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      // Ensure background has the expected structure
                      if (!props.background) {
                        props.background = {
                          light: { r: 255, g: 255, b: 255, a: 1 },
                          dark: { r: 31, g: 41, b: 55, a: 1 }
                        };
                      }

                      // Handle legacy format (single RGBA object)
                      if ('r' in props.background) {
                        const oldColor = { ...props.background };
                        props.background = {
                          light: oldColor,
                          dark: convertToThemeColor(oldColor, true, 'container')
                        };
                      }

                      // Ensure both light and dark properties exist
                      if (!props.background.light) {
                        props.background.light = { r: 255, g: 255, b: 255, a: 1 };
                      }
                      if (!props.background.dark) {
                        props.background.dark = { r: 31, g: 41, b: 55, a: 1 };
                      }

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'container');

                        props.background = {
                          ...props.background,
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update the current theme's color
                        props.background = {
                          ...props.background,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
                  componentType="container"
                />
              </div>

              {!autoConvertColors && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (background && background[oppositeTheme] &&
                              typeof background[oppositeTheme].r !== 'undefined' &&
                              typeof background[oppositeTheme].g !== 'undefined' &&
                              typeof background[oppositeTheme].b !== 'undefined') {
                            return background[oppositeTheme];
                          } else if (background && background[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(background[currentTheme], !isDark, 'container');
                          }
                          // Default fallback colors
                          return !isDark ?
                            { r: 31, g: 41, b: 55, a: 1 } :
                            { r: 255, g: 255, b: 255, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return !isDark ?
                            { r: 31, g: 41, b: 55, a: 1 } :
                            { r: 255, g: 255, b: 255, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          // Ensure background has the expected structure
                          if (!props.background) {
                            props.background = {
                              light: { r: 255, g: 255, b: 255, a: 1 },
                              dark: { r: 31, g: 41, b: 55, a: 1 }
                            };
                          }

                          // Handle legacy format (single RGBA object)
                          if ('r' in props.background) {
                            const oldColor = { ...props.background };
                            props.background = {
                              light: oldColor,
                              dark: convertToThemeColor(oldColor, true, 'container')
                            };
                          }

                          // Ensure both light and dark properties exist
                          if (!props.background.light) {
                            props.background.light = { r: 255, g: 255, b: 255, a: 1 };
                          }
                          if (!props.background.dark) {
                            props.background.dark = { r: 31, g: 41, b: 55, a: 1 };
                          }

                          const oppositeTheme = isDark ? 'light' : 'dark';

                          // Only update the opposite theme's color
                          props.background = {
                            ...props.background,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                      componentType="container"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            {/* Border Settings */}
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
                      actions.setProp((props) => {
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
                      actions.setProp((props) => {
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
                        actions.setProp((props) => {
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

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(borderColor, isDark, 'container')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      // Ensure borderColor has the expected structure
                      if (!props.borderColor) {
                        props.borderColor = {
                          light: { r: 229, g: 231, b: 235, a: 1 },
                          dark: { r: 75, g: 85, b: 99, a: 1 }
                        };
                      }

                      // Handle legacy format (single RGBA object)
                      if ('r' in props.borderColor) {
                        const oldColor = { ...props.borderColor };
                        props.borderColor = {
                          light: oldColor,
                          dark: convertToThemeColor(oldColor, true, 'container')
                        };
                      }

                      // Ensure both light and dark properties exist
                      if (!props.borderColor.light) {
                        props.borderColor.light = { r: 229, g: 231, b: 235, a: 1 };
                      }
                      if (!props.borderColor.dark) {
                        props.borderColor.dark = { r: 75, g: 85, b: 99, a: 1 };
                      }

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'container');

                        props.borderColor = {
                          ...props.borderColor,
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update the current theme's color
                        props.borderColor = {
                          ...props.borderColor,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
                  componentType="container"
                />
              </div>

              {!autoConvertColors && (
                <div className="mt-3">
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
                            return convertToThemeColor(borderColor[currentTheme], !isDark, 'container');
                          }
                          // Default fallback colors
                          return !isDark ?
                            { r: 75, g: 85, b: 99, a: 1 } :
                            { r: 229, g: 231, b: 235, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme border color:', error);
                          return !isDark ?
                            { r: 75, g: 85, b: 99, a: 1 } :
                            { r: 229, g: 231, b: 235, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          // Ensure borderColor has the expected structure
                          if (!props.borderColor) {
                            props.borderColor = {
                              light: { r: 229, g: 231, b: 235, a: 1 },
                              dark: { r: 75, g: 85, b: 99, a: 1 }
                            };
                          }

                          // Handle legacy format (single RGBA object)
                          if ('r' in props.borderColor) {
                            const oldColor = { ...props.borderColor };
                            props.borderColor = {
                              light: oldColor,
                              dark: convertToThemeColor(oldColor, true, 'container')
                            };
                          }

                          // Ensure both light and dark properties exist
                          if (!props.borderColor.light) {
                            props.borderColor.light = { r: 229, g: 231, b: 235, a: 1 };
                          }
                          if (!props.borderColor.dark) {
                            props.borderColor.dark = { r: 75, g: 85, b: 99, a: 1 };
                          }

                          const oppositeTheme = isDark ? 'light' : 'dark';

                          // Only update the opposite theme's color
                          props.borderColor = {
                            ...props.borderColor,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                      componentType="container"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode border color without switching themes.
                  </p>
                </div>
              )}
            </div>

            {/* Border Radius and Shadow */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Radius</label>
                <div className="flex items-center">
                  <div className="w-3/4 flex items-center">
                    <input
                      type="range"
                      value={radius}
                      min={0}
                      max={50}
                      onChange={(e) => actions.setProp((props) => { props.radius = parseInt(e.target.value); })}
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
                          actions.setProp((props) => { props.radius = value; });
                        }
                      }}
                      className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                      aria-label="Border radius in pixels"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start mb-2">
                  <input
                    type="checkbox"
                    id="enableShadow"
                    checked={shadow.enabled || false}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      actions.setProp((props) => {
                        // Ensure shadow is an object
                        if (typeof props.shadow === 'number') {
                          props.shadow = {
                            enabled: isChecked,
                            x: 0,
                            y: 4,
                            blur: 8,
                            spread: 0,
                            color: {
                              light: { r: 0, g: 0, b: 0, a: 0.15 },
                              dark: { r: 0, g: 0, b: 0, a: 0.25 }
                            }
                          };
                        } else {
                          props.shadow.enabled = isChecked;

                          // Ensure shadow.color has the theme-aware structure
                          if (props.shadow.color && 'r' in props.shadow.color) {
                            const oldColor = { ...props.shadow.color };
                            props.shadow.color = {
                              light: oldColor,
                              dark: convertToThemeColor(oldColor, true)
                            };
                          }
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
                {shadow.enabled && (
                  <div className="space-y-2 pl-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X Offset</label>
                        <input
                          type="number"
                          value={shadow.x || 0}
                          onChange={(e) => actions.setProp((props) => {
                            if (typeof props.shadow === 'number') {
                              props.shadow = {
                                enabled: true,
                                x: parseInt(e.target.value),
                                y: 4,
                                blur: 8,
                                spread: 0,
                                color: {
                                  light: { r: 0, g: 0, b: 0, a: 0.15 },
                                  dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                }
                              };
                            } else {
                              props.shadow.x = parseInt(e.target.value);

                              // Ensure shadow.color has the theme-aware structure
                              if (props.shadow.color && 'r' in props.shadow.color) {
                                const oldColor = { ...props.shadow.color };
                                props.shadow.color = {
                                  light: oldColor,
                                  dark: convertToThemeColor(oldColor, true)
                                };
                              }
                            }
                          })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Offset</label>
                        <input
                          type="number"
                          value={shadow.y || 4}
                          onChange={(e) => actions.setProp((props) => {
                            if (typeof props.shadow === 'number') {
                              props.shadow = {
                                enabled: true,
                                x: 0,
                                y: parseInt(e.target.value),
                                blur: 8,
                                spread: 0,
                                color: {
                                  light: { r: 0, g: 0, b: 0, a: 0.15 },
                                  dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                }
                              };
                            } else {
                              props.shadow.y = parseInt(e.target.value);

                              // Ensure shadow.color has the theme-aware structure
                              if (props.shadow.color && 'r' in props.shadow.color) {
                                const oldColor = { ...props.shadow.color };
                                props.shadow.color = {
                                  light: oldColor,
                                  dark: convertToThemeColor(oldColor, true)
                                };
                              }
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
                          value={shadow.blur || 8}
                          onChange={(e) => actions.setProp((props) => {
                            if (typeof props.shadow === 'number') {
                              props.shadow = {
                                enabled: true,
                                x: 0,
                                y: 4,
                                blur: parseInt(e.target.value),
                                spread: 0,
                                color: {
                                  light: { r: 0, g: 0, b: 0, a: 0.15 },
                                  dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                }
                              };
                            } else {
                              props.shadow.blur = parseInt(e.target.value);

                              // Ensure shadow.color has the theme-aware structure
                              if (props.shadow.color && 'r' in props.shadow.color) {
                                const oldColor = { ...props.shadow.color };
                                props.shadow.color = {
                                  light: oldColor,
                                  dark: convertToThemeColor(oldColor, true)
                                };
                              }
                            }
                          })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</label>
                        <input
                          type="number"
                          value={shadow.spread || 0}
                          onChange={(e) => actions.setProp((props) => {
                            if (typeof props.shadow === 'number') {
                              props.shadow = {
                                enabled: true,
                                x: 0,
                                y: 4,
                                blur: 8,
                                spread: parseInt(e.target.value),
                                color: {
                                  light: { r: 0, g: 0, b: 0, a: 0.15 },
                                  dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                }
                              };
                            } else {
                              props.shadow.spread = parseInt(e.target.value);

                              // Ensure shadow.color has the theme-aware structure
                              if (props.shadow.color && 'r' in props.shadow.color) {
                                const oldColor = { ...props.shadow.color };
                                props.shadow.color = {
                                  light: oldColor,
                                  dark: convertToThemeColor(oldColor, true)
                                };
                              }
                            }
                          })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Shadow Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                      </label>
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          color={(() => {
                            try {
                              // Get the appropriate shadow color for the current theme
                              let shadowColor;
                              if (shadow.color && shadow.color.light && shadow.color.dark) {
                                // Theme-aware color
                                shadowColor = isDark ? shadow.color.dark : shadow.color.light;
                              } else if (shadow.color && 'r' in shadow.color) {
                                // Legacy format (single RGBA object)
                                shadowColor = shadow.color;
                              } else {
                                // Fallback
                                shadowColor = { r: 0, g: 0, b: 0, a: isDark ? 0.25 : 0.15 };
                              }

                              return shadowColor;
                            } catch (error) {
                              console.warn('Error getting shadow color:', error);
                              return { r: 0, g: 0, b: 0, a: isDark ? 0.25 : 0.15 };
                            }
                          })()}
                          onChange={(newColor) => {
                            actions.setProp((props) => {
                              // Ensure shadow is properly initialized
                              if (typeof props.shadow === 'number') {
                                props.shadow = {
                                  enabled: true,
                                  x: 0,
                                  y: 4,
                                  blur: 8,
                                  spread: 0,
                                  color: {
                                    light: { r: 0, g: 0, b: 0, a: 0.15 },
                                    dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                  }
                                };
                              }

                              // Ensure shadow.color exists
                              if (!props.shadow.color) {
                                props.shadow.color = {
                                  light: { r: 0, g: 0, b: 0, a: 0.15 },
                                  dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                };
                              }

                              // Handle legacy format (single RGBA object)
                              if ('r' in props.shadow.color) {
                                const oldColor = { ...props.shadow.color };
                                props.shadow.color = {
                                  light: oldColor,
                                  dark: convertToThemeColor(oldColor, true, 'shadow')
                                };
                              }

                              // Ensure both light and dark properties exist
                              if (!props.shadow.color.light) {
                                props.shadow.color.light = { r: 0, g: 0, b: 0, a: 0.15 };
                              }
                              if (!props.shadow.color.dark) {
                                props.shadow.color.dark = { r: 0, g: 0, b: 0, a: 0.25 };
                              }

                              const currentTheme = isDark ? 'dark' : 'light';
                              const oppositeTheme = isDark ? 'light' : 'dark';

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
                            });
                          }}
                          componentType="shadow"
                        />
                      </div>

                      {!autoConvertColors && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Shadow Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                          </label>
                          <div className="flex items-center gap-2">
                            <ColorPicker
                              color={(() => {
                                try {
                                  const oppositeTheme = isDark ? 'light' : 'dark';
                                  const currentTheme = isDark ? 'dark' : 'light';

                                  // Ensure we have a valid color for the opposite theme
                                  if (shadow.color && shadow.color[oppositeTheme] &&
                                      typeof shadow.color[oppositeTheme].r !== 'undefined' &&
                                      typeof shadow.color[oppositeTheme].g !== 'undefined' &&
                                      typeof shadow.color[oppositeTheme].b !== 'undefined') {
                                    return shadow.color[oppositeTheme];
                                  } else if (shadow.color && shadow.color[currentTheme]) {
                                    // If opposite theme color is missing but current theme exists, convert it
                                    return convertToThemeColor(shadow.color[currentTheme], !isDark, 'shadow');
                                  }
                                  // Default fallback colors
                                  return { r: 0, g: 0, b: 0, a: !isDark ? 0.15 : 0.25 };
                                } catch (error) {
                                  console.warn('Error getting opposite theme shadow color:', error);
                                  return { r: 0, g: 0, b: 0, a: !isDark ? 0.15 : 0.25 };
                                }
                              })()}
                              onChange={(newColor) => {
                                actions.setProp((props) => {
                                  // Ensure shadow is properly initialized
                                  if (typeof props.shadow === 'number') {
                                    props.shadow = {
                                      enabled: true,
                                      x: 0,
                                      y: 4,
                                      blur: 8,
                                      spread: 0,
                                      color: {
                                        light: { r: 0, g: 0, b: 0, a: 0.15 },
                                        dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                      }
                                    };
                                  }

                                  // Ensure shadow.color exists
                                  if (!props.shadow.color) {
                                    props.shadow.color = {
                                      light: { r: 0, g: 0, b: 0, a: 0.15 },
                                      dark: { r: 0, g: 0, b: 0, a: 0.25 }
                                    };
                                  }

                                  // Handle legacy format (single RGBA object)
                                  if ('r' in props.shadow.color) {
                                    const oldColor = { ...props.shadow.color };
                                    props.shadow.color = {
                                      light: oldColor,
                                      dark: convertToThemeColor(oldColor, true, 'shadow')
                                    };
                                  }

                                  // Ensure both light and dark properties exist
                                  if (!props.shadow.color.light) {
                                    props.shadow.color.light = { r: 0, g: 0, b: 0, a: 0.15 };
                                  }
                                  if (!props.shadow.color.dark) {
                                    props.shadow.color.dark = { r: 0, g: 0, b: 0, a: 0.25 };
                                  }

                                  const oppositeTheme = isDark ? 'light' : 'dark';

                                  // Only update the opposite theme's color
                                  props.shadow.color = {
                                    ...props.shadow.color,
                                    [oppositeTheme]: newColor
                                  };
                                });
                              }}
                              componentType="shadow"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Directly edit the {!isDark ? 'dark' : 'light'} mode shadow color without switching themes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Container Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Container Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={margin[0] === '' || margin[0] === '0' ? '' : parseInt(margin[0])}
                    min={-100}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.margin = newMargin; });
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
                    min={-100}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.margin = newMargin; });
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
                    value={margin[3] === '' || margin[3] === '0' ? '' : parseInt(margin[3])}
                    min={-100}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.margin = newMargin; });
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
                    value={margin[1] === '' || margin[1] === '0' ? '' : parseInt(margin[1])}
                    min={-100}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.margin = newMargin; });
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

            {/* Container Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Container Padding
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
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.padding = newPadding; });
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
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.padding = newPadding; });
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
                    value={padding[3] === '' || padding[3] === '0' ? '' : parseInt(padding[3])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.padding = newPadding; });
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
                    value={padding[1] === '' || padding[1] === '0' ? '' : parseInt(padding[1])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      actions.setProp((props) => { props.padding = newPadding; });
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
          </div>
        )}
      </div>
    </div>
  );
};
