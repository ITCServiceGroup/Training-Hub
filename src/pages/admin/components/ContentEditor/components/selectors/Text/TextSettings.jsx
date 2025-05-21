import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import { FaChevronDown, FaListUl, FaListOl, FaTimes } from 'react-icons/fa';
import { ICONS, ICON_CATEGORIES } from '@/components/icons';
import ColorPicker from '../../../../../../../components/common/ColorPicker';

// Helper function to ensure both theme colors exist
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';

  // Ensure text color has both themes
  if (props.color) {
    // Handle legacy format (single RGBA object)
    if ('r' in props.color) {
      const oldColor = { ...props.color };
      props.color = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'text')
      };
    } else {
      // If one theme is missing, generate it from the other
      if (props.color[currentTheme] && !props.color[oppositeTheme]) {
        props.color[oppositeTheme] = convertToThemeColor(props.color[currentTheme], !isDark, 'text');
      } else if (props.color[oppositeTheme] && !props.color[currentTheme]) {
        props.color[currentTheme] = convertToThemeColor(props.color[oppositeTheme], isDark, 'text');
      }
    }
  }

  // Ensure icon color has both themes
  if (props.iconColor) {
    // Handle legacy format (single RGBA object)
    if ('r' in props.iconColor) {
      const oldColor = { ...props.iconColor };
      props.iconColor = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'icon')
      };
    } else {
      // If one theme is missing, generate it from the other
      if (props.iconColor[currentTheme] && !props.iconColor[oppositeTheme]) {
        props.iconColor[oppositeTheme] = convertToThemeColor(props.iconColor[currentTheme], !isDark, 'icon');
      } else if (props.iconColor[oppositeTheme] && !props.iconColor[currentTheme]) {
        props.iconColor[currentTheme] = convertToThemeColor(props.iconColor[oppositeTheme], isDark, 'icon');
      }
    }
  }

  // Ensure shadow color has both themes
  if (props.shadow && props.shadow.color) {
    // Handle legacy format (single RGBA object)
    if ('r' in props.shadow.color) {
      const oldColor = { ...props.shadow.color };
      props.shadow.color = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'shadow')
      };
    } else {
      // If one theme is missing, generate it from the other
      if (props.shadow.color[currentTheme] && !props.shadow.color[oppositeTheme]) {
        props.shadow.color[oppositeTheme] = convertToThemeColor(props.shadow.color[currentTheme], !isDark, 'shadow');
      } else if (props.shadow.color[oppositeTheme] && !props.shadow.color[currentTheme]) {
        props.shadow.color[currentTheme] = convertToThemeColor(props.shadow.color[oppositeTheme], isDark, 'shadow');
      }
    }
  }

  return props;
};

export const TextSettings = () => {
  const { actions } = useNode((node) => ({
    selected: node.id,
  }));

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Toggle sections
  const [showTextStructure, setShowTextStructure] = useState(true);
  const [showTextStyle, setShowTextStyle] = useState(true);
  const [showTextSpacing, setShowTextSpacing] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    actions.setProp((props) => {
      return ensureThemeColors(props, isDark);
    });
  }, [actions, isDark]);

    const {
      fontSize,
      lineHeight,
      textAlign,
      fontWeight,
      text,
      color: colorProp,
      shadow,
      margin,
      padding,
      listType,
      hasIcon,
      iconName,
      iconColor: iconColorProp,
      autoConvertColors,
    } = useNode((node) => {
    const props = node.data.props || {};

    // Handle backward compatibility for shadow
    let shadowValue = props.shadow;
    if (typeof shadowValue === 'number') {
      shadowValue = {
        enabled: shadowValue > 0,
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: shadowValue / 100 }
      };
    }

    return {
      fontSize: props.fontSize || 16,
      lineHeight: props.lineHeight || 1.5,
      textAlign: props.textAlign || 'left',
      fontWeight: props.fontWeight || '500',
      text: props.text || 'Text',
      color: props.color || {
        light: { r: 92, g: 90, b: 90, a: 1 },
        dark: { r: 229, g: 231, b: 235, a: 1 }
      },
      shadow: shadowValue || {
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
      listType: props.listType || 'none',
      margin: props.margin || [0, 0, 0, 0],
      padding: props.padding || [0, 0, 0, 0],
      hasIcon: props.hasIcon || false,
      iconName: props.iconName || 'edit',
      iconColor: props.iconColor || {
        light: { r: 92, g: 90, b: 90, a: 1 },
        dark: { r: 229, g: 231, b: 235, a: 1 }
      },
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true,
    };
  });

  return (
    <div className="text-settings">



      {/* Text Structure Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextStructure ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextStructure(!showTextStructure)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Structure
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextStructure ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextStructure && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Text Content */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Text Content (supports HTML tags)
              </label>
              <textarea
                value={text}
                onChange={(e) => actions.setProp((props) => { props.text = e.target.value; })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                rows={4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Align
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'left'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'left'; })}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'center'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'center'; })}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'right'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'right'; })}
                >
                  Right
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Weight
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    fontWeight === '400'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.fontWeight = '400'; })}
                >
                  Regular
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    fontWeight === '500'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.fontWeight = '500'; })}
                >
                  Medium
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    fontWeight === '700'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.fontWeight = '700'; })}
                >
                  Bold
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                List Format
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'none'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'none'; })}
                  title="No List"
                >
                  <FaTimes size={12} className="mr-1" /> None
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'bullet'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'bullet'; })}
                  title="Bullet List"
                >
                  <FaListUl size={12} className="mr-1" /> Bullet
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'number'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'number'; })}
                  title="Numbered List"
                >
                  <FaListOl size={12} className="mr-1" /> Number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextStyle(!showTextStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextStyle && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">


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
                    max={80}
                    onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
                    className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600 [&::-moz-range-thumb]:bg-teal-600"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={fontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 10 && value <= 80) {
                        actions.setProp((props) => { props.fontSize = value; });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Font size in pixels"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Line Height
              </label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    value={lineHeight}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => actions.setProp((props) => { props.lineHeight = parseFloat(e.target.value); })}
                    className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600 [&::-moz-range-thumb]:bg-teal-600"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={3}
                    step={0.1}
                    value={lineHeight}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 3) {
                        actions.setProp((props) => { props.lineHeight = value; });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Line height value"
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
                    actions.setProp((props) => {
                      props.autoConvertColors = isChecked;

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      // If turning auto-convert on, update all colors
                      if (isChecked) {
                        // Update text color
                        if (props.color && props.color[currentTheme]) {
                          const currentColor = props.color[currentTheme];
                          props.color[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'text');
                        }

                        // Update icon color
                        if (props.iconColor && props.iconColor[currentTheme]) {
                          const currentIconColor = props.iconColor[currentTheme];
                          props.iconColor[oppositeTheme] = convertToThemeColor(currentIconColor, !isDark, 'icon');
                        }

                        // Update shadow color
                        if (props.shadow && props.shadow.color && props.shadow.color[currentTheme]) {
                          const currentShadowColor = props.shadow.color[currentTheme];
                          props.shadow.color[oppositeTheme] = convertToThemeColor(currentShadowColor, !isDark, 'shadow');
                        }
                      } else {
                        // When turning auto-convert off, ensure both theme colors exist
                        return ensureThemeColors(props, isDark);
                      }

                      return props;
                    });
                  }}
                  className="mr-2 h-4 w-4 text-teal-600 border-gray-300 rounded"
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
                Text Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(colorProp, isDark, 'text')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      // Ensure color has the expected structure
                      if (!props.color) {
                        props.color = {
                          light: { r: 92, g: 90, b: 90, a: 1 },
                          dark: { r: 229, g: 231, b: 235, a: 1 }
                        };
                      }

                      // Handle legacy format (single RGBA object)
                      if ('r' in props.color) {
                        const oldColor = { ...props.color };
                        props.color = {
                          light: oldColor,
                          dark: convertToThemeColor(oldColor, true, 'text')
                        };
                      }

                      // Ensure both light and dark properties exist
                      if (!props.color.light) {
                        props.color.light = { r: 92, g: 90, b: 90, a: 1 };
                      }
                      if (!props.color.dark) {
                        props.color.dark = { r: 229, g: 231, b: 235, a: 1 };
                      }

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'text');

                        props.color = {
                          ...props.color,
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update the current theme's color
                        props.color = {
                          ...props.color,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
                  componentType="text"
                />
              </div>

              {!autoConvertColors && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Text Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (colorProp && colorProp[oppositeTheme] &&
                              typeof colorProp[oppositeTheme].r !== 'undefined' &&
                              typeof colorProp[oppositeTheme].g !== 'undefined' &&
                              typeof colorProp[oppositeTheme].b !== 'undefined') {
                            return colorProp[oppositeTheme];
                          } else if (colorProp && colorProp[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(colorProp[currentTheme], !isDark, 'text');
                          }
                          // Default fallback colors
                          return !isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 92, g: 90, b: 90, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return !isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 92, g: 90, b: 90, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          // Ensure color has the expected structure
                          if (!props.color) {
                            props.color = {
                              light: { r: 92, g: 90, b: 90, a: 1 },
                              dark: { r: 229, g: 231, b: 235, a: 1 }
                            };
                          }

                          // Handle legacy format (single RGBA object)
                          if ('r' in props.color) {
                            const oldColor = { ...props.color };
                            props.color = {
                              light: oldColor,
                              dark: convertToThemeColor(oldColor, true, 'text')
                            };
                          }

                          // Ensure both light and dark properties exist
                          if (!props.color.light) {
                            props.color.light = { r: 92, g: 90, b: 90, a: 1 };
                          }
                          if (!props.color.dark) {
                            props.color.dark = { r: 229, g: 231, b: 235, a: 1 };
                          }

                          const oppositeTheme = isDark ? 'light' : 'dark';

                          // Only update the opposite theme's color
                          props.color = {
                            ...props.color,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                      componentType="text"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>
            <div className="mb-3">
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  id="enableIcon"
                  checked={hasIcon}
                  onChange={(e) => actions.setProp((props) => { props.hasIcon = e.target.checked; })}
                  className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
                />
                <label
                  htmlFor="enableIcon"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer leading-none pt-1"
                >
                  Add Icon
                </label>
              </div>

              {hasIcon && (
                <>
                  <div className="mt-3 mb-3 pl-6">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Select Icon
                    </label>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                        <div key={category} className="mb-3">
                          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{category}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(icons).map(([value, label]) => {
                              const Icon = ICONS[value];
                              return (
                                <button
                                  key={value}
                                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                                    iconName === value
                                      ? 'bg-teal-600 text-white'
                                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                                  }`}
                                  onClick={() => actions.setProp((props) => { props.iconName = value; })}
                                  title={label}
                                >
                                  <Icon size={20} className="p-1" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3 pl-6">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Icon Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={getThemeColor(iconColorProp, isDark, 'icon', autoConvertColors)}
                        onChange={(newColor) => {
                          actions.setProp((props) => {
                            // Ensure iconColor has the expected structure
                            if (!props.iconColor) {
                              props.iconColor = {
                                light: { r: 92, g: 90, b: 90, a: 1 },
                                dark: { r: 229, g: 231, b: 235, a: 1 }
                              };
                            }

                            // Handle legacy format (single RGBA object)
                            if ('r' in props.iconColor) {
                              const oldColor = { ...props.iconColor };
                              props.iconColor = {
                                light: oldColor,
                                dark: convertToThemeColor(oldColor, true, 'icon')
                              };
                            }

                            // Ensure both light and dark properties exist
                            if (!props.iconColor.light) {
                              props.iconColor.light = { r: 92, g: 90, b: 90, a: 1 };
                            }
                            if (!props.iconColor.dark) {
                              props.iconColor.dark = { r: 229, g: 231, b: 235, a: 1 };
                            }

                            const currentTheme = isDark ? 'dark' : 'light';
                            const oppositeTheme = isDark ? 'light' : 'dark';

                            if (props.autoConvertColors) {
                              // Auto-convert the color for the opposite theme
                              const oppositeColor = convertToThemeColor(newColor, !isDark, 'icon');

                              props.iconColor = {
                                ...props.iconColor,
                                [currentTheme]: newColor,
                                [oppositeTheme]: oppositeColor
                              };
                            } else {
                              // Only update the current theme's color
                              props.iconColor = {
                                ...props.iconColor,
                                [currentTheme]: newColor
                              };
                            }
                          });
                        }}
                        componentType="icon"
                      />
                    </div>

                    {!autoConvertColors && (
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Icon Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                        </label>
                        <div className="flex items-center">
                          <ColorPicker
                            color={(() => {
                              try {
                                const oppositeTheme = isDark ? 'light' : 'dark';
                                const currentTheme = isDark ? 'dark' : 'light';

                                // Ensure we have a valid color for the opposite theme
                                if (iconColorProp && iconColorProp[oppositeTheme] &&
                                    typeof iconColorProp[oppositeTheme].r !== 'undefined' &&
                                    typeof iconColorProp[oppositeTheme].g !== 'undefined' &&
                                    typeof iconColorProp[oppositeTheme].b !== 'undefined') {
                                  return iconColorProp[oppositeTheme];
                                } else if (iconColorProp && iconColorProp[currentTheme]) {
                                  // If opposite theme color is missing but current theme exists, convert it
                                  return convertToThemeColor(iconColorProp[currentTheme], !isDark, 'icon');
                                }
                                // Default fallback colors
                                return !isDark ?
                                  { r: 229, g: 231, b: 235, a: 1 } :
                                  { r: 92, g: 90, b: 90, a: 1 };
                              } catch (error) {
                                console.warn('Error getting opposite theme color:', error);
                                return !isDark ?
                                  { r: 229, g: 231, b: 235, a: 1 } :
                                  { r: 92, g: 90, b: 90, a: 1 };
                              }
                            })()}
                            onChange={(newColor) => {
                              actions.setProp((props) => {
                                // Ensure iconColor has the expected structure
                                if (!props.iconColor) {
                                  props.iconColor = {
                                    light: { r: 92, g: 90, b: 90, a: 1 },
                                    dark: { r: 229, g: 231, b: 235, a: 1 }
                                  };
                                }

                                // Handle legacy format (single RGBA object)
                                if ('r' in props.iconColor) {
                                  const oldColor = { ...props.iconColor };
                                  props.iconColor = {
                                    light: oldColor,
                                    dark: convertToThemeColor(oldColor, true, 'icon')
                                  };
                                }

                                // Ensure both light and dark properties exist
                                if (!props.iconColor.light) {
                                  props.iconColor.light = { r: 92, g: 90, b: 90, a: 1 };
                                }
                                if (!props.iconColor.dark) {
                                  props.iconColor.dark = { r: 229, g: 231, b: 235, a: 1 };
                                }

                                const oppositeTheme = isDark ? 'light' : 'dark';

                                // Only update the opposite theme's color
                                props.iconColor = {
                                  ...props.iconColor,
                                  [oppositeTheme]: newColor
                                };
                              });
                            }}
                            componentType="icon"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mb-3">
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  id="enableTextShadow"
                  checked={shadow.enabled || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    actions.setProp((props) => {
                      // Ensure shadow is an object
                      if (typeof props.shadow === 'number') {
                        props.shadow = {
                          enabled: isChecked,
                          x: 0,
                          y: 2,
                          blur: 4,
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
                            dark: convertToThemeColor(oldColor, true, 'shadow')
                          };
                        }
                      }
                    });
                  }}
                  className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
                />
                <label
                  htmlFor="enableTextShadow"
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
                              y: 2,
                              blur: 4,
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
                                dark: convertToThemeColor(oldColor, true, 'shadow')
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
                        value={shadow.y || 2}
                        onChange={(e) => actions.setProp((props) => {
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: parseInt(e.target.value),
                              blur: 4,
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
                                dark: convertToThemeColor(oldColor, true, 'shadow')
                              };
                            }
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blur</label>
                    <input
                      type="number"
                      value={shadow.blur || 4}
                      onChange={(e) => actions.setProp((props) => {
                        if (typeof props.shadow === 'number') {
                          props.shadow = {
                            enabled: true,
                            x: 0,
                            y: 2,
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
                              dark: convertToThemeColor(oldColor, true, 'shadow')
                            };
                          }
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    />
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
                                y: 2,
                                blur: 4,
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
                      <div
                        className="ml-3 flex-1 h-8 rounded"
                        style={{
                          backgroundColor: (() => {
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
                              return `rgba(${shadowColor.r || 0}, ${shadowColor.g || 0}, ${shadowColor.b || 0}, ${shadowColor.a || (isDark ? 0.25 : 0.15)})`;
                            } catch (error) {
                              return `rgba(0, 0, 0, ${isDark ? 0.25 : 0.15})`;
                            }
                          })()
                        }}
                      ></div>
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
                                    y: 2,
                                    blur: 4,
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
                          <div
                            className="ml-3 flex-1 h-8 rounded"
                            style={{
                              backgroundColor: (() => {
                                try {
                                  const oppositeTheme = isDark ? 'light' : 'dark';
                                  if (shadow.color && shadow.color[oppositeTheme]) {
                                    const color = shadow.color[oppositeTheme];
                                    return `rgba(${color.r || 0}, ${color.g || 0}, ${color.b || 0}, ${color.a || (!isDark ? 0.15 : 0.25)})`;
                                  }
                                  return `rgba(0, 0, 0, ${!isDark ? 0.15 : 0.25})`;
                                } catch (error) {
                                  return `rgba(0, 0, 0, ${!isDark ? 0.15 : 0.25})`;
                                }
                              })()
                            }}
                          ></div>
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
        )}
      </div>

      {/* Text Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextSpacing(!showTextSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={margin[0] === 0 ? '' : margin[0]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[0] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[2] === 0 ? '' : margin[2]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[2] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[3] === 0 ? '' : margin[3]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[3] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[1] === 0 ? '' : margin[1]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[1] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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

            {/* Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Padding
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={padding[0] === 0 ? '' : padding[0]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[0] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[2] === 0 ? '' : padding[2]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[2] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[3] === 0 ? '' : padding[3]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[3] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[1] === 0 ? '' : padding[1]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[1] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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