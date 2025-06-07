import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { convertToThemeColor, getThemeColor } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';

// Helper function to ensure both theme colors exist
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';
  const colorKeys = ['background', 'color', 'tabBackground', 'activeTabBackground'];

  colorKeys.forEach(colorKey => {
    // Ensure the color property has the expected structure
    if (!props[colorKey]) {
      // Set default values based on the color key
      if (colorKey === 'background') {
        props[colorKey] = {
          light: { r: 255, g: 255, b: 255, a: 1 },
          dark: { r: 31, g: 41, b: 55, a: 1 }
        };
      } else if (colorKey === 'color') {
        props[colorKey] = {
          light: { r: 0, g: 0, b: 0, a: 1 },
          dark: { r: 229, g: 231, b: 235, a: 1 }
        };
      } else if (colorKey === 'tabBackground') {
        props[colorKey] = {
          light: { r: 245, g: 247, b: 250, a: 1 },
          dark: { r: 51, g: 65, b: 85, a: 1 }
        };
      } else if (colorKey === 'activeTabBackground') {
        props[colorKey] = {
          light: { r: 255, g: 255, b: 255, a: 1 },
          dark: { r: 31, g: 41, b: 55, a: 1 }
        };
      }
    }

    // Handle legacy format (single RGBA object)
    if ('r' in props[colorKey]) {
      const oldColor = { ...props[colorKey] };
      props[colorKey] = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, colorKey === 'color' ? 'text' : 'tabs')
      };
    }

    // Ensure both light and dark properties exist
    if (!props[colorKey].light) {
      if (colorKey === 'background') {
        props[colorKey].light = { r: 255, g: 255, b: 255, a: 1 };
      } else if (colorKey === 'color') {
        props[colorKey].light = { r: 0, g: 0, b: 0, a: 1 };
      } else if (colorKey === 'tabBackground') {
        props[colorKey].light = { r: 245, g: 247, b: 250, a: 1 };
      } else if (colorKey === 'activeTabBackground') {
        props[colorKey].light = { r: 255, g: 255, b: 255, a: 1 };
      }
    }

    if (!props[colorKey].dark) {
      if (colorKey === 'background') {
        props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 };
      } else if (colorKey === 'color') {
        props[colorKey].dark = { r: 229, g: 231, b: 235, a: 1 };
      } else if (colorKey === 'tabBackground') {
        props[colorKey].dark = { r: 51, g: 65, b: 85, a: 1 };
      } else if (colorKey === 'activeTabBackground') {
        props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 };
      }
    }

    // If one theme is missing, generate it from the other
    if (props[colorKey][currentTheme] && !props[colorKey][oppositeTheme]) {
      props[colorKey][oppositeTheme] = convertToThemeColor(props[colorKey][currentTheme], !isDark, colorKey === 'color' ? 'text' : 'tabs');
    } else if (props[colorKey][oppositeTheme] && !props[colorKey][currentTheme]) {
      props[colorKey][currentTheme] = convertToThemeColor(props[colorKey][oppositeTheme], isDark, colorKey === 'color' ? 'text' : 'tabs');
    }
  });

  // Handle border color separately
  if (props.border && props.border.color) {
    // Handle legacy format (single RGBA object)
    if ('r' in props.border.color) {
      const oldColor = { ...props.border.color };
      props.border.color = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'tabs')
      };
    }

    // Ensure both light and dark properties exist
    if (!props.border.color.light) {
      props.border.color.light = { r: 204, g: 204, b: 204, a: 1 };
    }

    if (!props.border.color.dark) {
      props.border.color.dark = { r: 75, g: 85, b: 99, a: 1 };
    }

    // If one theme is missing, generate it from the other
    if (props.border.color[currentTheme] && !props.border.color[oppositeTheme]) {
      props.border.color[oppositeTheme] = convertToThemeColor(props.border.color[currentTheme], !isDark, 'tabs');
    } else if (props.border.color[oppositeTheme] && !props.border.color[currentTheme]) {
      props.border.color[currentTheme] = convertToThemeColor(props.border.color[oppositeTheme], isDark, 'tabs');
    }
  }

  // Handle shadow color
  if (props.shadow && props.shadow.color) {
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

    // If one theme is missing, generate it from the other
    if (props.shadow.color[currentTheme] && !props.shadow.color[oppositeTheme]) {
      props.shadow.color[oppositeTheme] = convertToThemeColor(props.shadow.color[currentTheme], !isDark, 'shadow');
    } else if (props.shadow.color[oppositeTheme] && !props.shadow.color[currentTheme]) {
      props.shadow.color[currentTheme] = convertToThemeColor(props.shadow.color[oppositeTheme], isDark, 'shadow');
    }
  }

  return props;
};

export const TabsSettings = () => {
  // Get theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for collapsible sections
  const [showGeneral, setShowGeneral] = useState(true);
  const [showAppearance, setShowAppearance] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const { actions } = useNode();

const {
  background,
  color,
  padding,
  margin,
  radius,
  shadow,
  border,
  width,
  height,
  numberOfTabs,
  tabTitles,
  tabBackground,
  activeTabBackground,
  tabAlignment,
  autoConvertColors,
  titleFontSize,
  titleFontWeight,
  } = useNode((node) => ({
    ...node.data.props
  }));

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    actions.setProp((props) => {
      return ensureThemeColors(props, isDark);
    });
  }, [actions, isDark]);

  const handleColorChange = (colorKey, newColor) => {
    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newColor, !isDark, colorKey === 'color' ? 'text' : 'tabs');

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
    });
  };

  // Handler for opposite theme color change
  const handleOppositeThemeColorChange = (colorKey, newColor) => {
    actions.setProp((props) => {
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Only update the opposite theme's color
      props[colorKey] = {
        ...props[colorKey],
        [oppositeTheme]: newColor
      };
    });
  };

  return (
    <div className="settings-container">
      {/* General Settings */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showGeneral ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowGeneral(!showGeneral)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            General
          </label>
          <FaChevronDown
            className={`transition-transform ${showGeneral ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showGeneral && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Tabs</label>
              <input
                type="number"
                min="1"
                value={numberOfTabs}
                onChange={(e) => {
                  const newNumberOfTabs = parseInt(e.target.value) || 1;
                  actions.setProp((props) => {
                    // Update number of tabs
                    props.numberOfTabs = newNumberOfTabs;
                    // Ensure tabTitles array matches the new number of tabs
                    props.tabTitles = Array.from({ length: newNumberOfTabs }, (_, i) => {
                      return props.tabTitles[i] || `Tab ${i + 1}`;
                    });
                  });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Tab Titles */}
            {Array.from({ length: numberOfTabs }, (_, index) => (
              <div key={`tab-title-${index}`}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Tab {index + 1} Title
                </label>
                <input
                  type="text"
                  value={tabTitles[index] || `Tab ${index + 1}`}
                  onChange={(e) => {
                    actions.setProp((props) => {
                      const newTitles = [...props.tabTitles];
                      newTitles[index] = e.target.value;
                      props.tabTitles = newTitles;
                    });
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                />
              </div>
            ))}

            {/* Tab Alignment */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Tab Alignment
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    tabAlignment === 'left' || !tabAlignment
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.tabAlignment = 'left'; })}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    tabAlignment === 'center'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.tabAlignment = 'center'; })}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    tabAlignment === 'right'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.tabAlignment = 'right'; })}
                >
                  Right
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    tabAlignment === 'space-between'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.tabAlignment = 'space-between'; })}
                >
                  Equal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (%)</label>
                <input
                  type="text"
                  value={width.replace('%', '')}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value === '' || !isNaN(value)) {
                      actions.setProp((props) => {
                        props.width = value ? `${value}%` : '100%';
                      });
                    }
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                <input
                  type="text"
                  value={height === 'auto' ? '' : height.replace('px', '')}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    actions.setProp((props) => {
                      props.height = value ? `${value}px` : 'auto';
                    });
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  placeholder="auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appearance Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showAppearance ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowAppearance(!showAppearance)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Appearance
          </label>
          <FaChevronDown
            className={`transition-transform ${showAppearance ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showAppearance && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
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
                        const colorKeys = ['background', 'color', 'tabBackground', 'activeTabBackground'];

                        colorKeys.forEach(colorKey => {
                          // If the current theme color exists, update the opposite theme color
                          if (props[colorKey] && props[colorKey][currentTheme]) {
                            const currentColor = props[colorKey][currentTheme];
                            props[colorKey][oppositeTheme] = convertToThemeColor(
                              currentColor,
                              !isDark,
                              colorKey === 'color' ? 'text' : 'tabs'
                            );
                          }
                        });

                        // Handle border color separately
                        if (props.border && props.border.color && props.border.color[currentTheme]) {
                          props.border.color[oppositeTheme] = convertToThemeColor(props.border.color[currentTheme], !isDark, 'tabs');
                        }

                        // Handle shadow color
                        if (props.shadow && props.shadow.color && props.shadow.color[currentTheme]) {
                          props.shadow.color[oppositeTheme] = convertToThemeColor(props.shadow.color[currentTheme], !isDark, 'shadow');
                        }
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

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Container Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (background && background[currentTheme] &&
                          typeof background[currentTheme].r !== 'undefined' &&
                          typeof background[currentTheme].g !== 'undefined' &&
                          typeof background[currentTheme].b !== 'undefined') {
                        return background[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 255, g: 255, b: 255, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 255, g: 255, b: 255, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('background', newColor)}
                  componentType="tabs"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Container Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
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
                            return convertToThemeColor(background[currentTheme], !isDark, 'tabs');
                          }
                          // Fallback to default color for opposite theme
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
                      onChange={(newColor) => handleOppositeThemeColorChange('background', newColor)}
                      componentType="tabs"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Inactive Tab Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (tabBackground && tabBackground[currentTheme] &&
                          typeof tabBackground[currentTheme].r !== 'undefined' &&
                          typeof tabBackground[currentTheme].g !== 'undefined' &&
                          typeof tabBackground[currentTheme].b !== 'undefined') {
                        return tabBackground[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 51, g: 65, b: 85, a: 1 } :
                        { r: 245, g: 247, b: 250, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 51, g: 65, b: 85, a: 1 } :
                        { r: 245, g: 247, b: 250, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('tabBackground', newColor)}
                  componentType="tabs"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Inactive Tab Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (tabBackground && tabBackground[oppositeTheme] &&
                              typeof tabBackground[oppositeTheme].r !== 'undefined' &&
                              typeof tabBackground[oppositeTheme].g !== 'undefined' &&
                              typeof tabBackground[oppositeTheme].b !== 'undefined') {
                            return tabBackground[oppositeTheme];
                          } else if (tabBackground && tabBackground[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(tabBackground[currentTheme], !isDark, 'tabs');
                          }
                          // Fallback to default color for opposite theme
                          return !isDark ?
                            { r: 51, g: 65, b: 85, a: 1 } :
                            { r: 245, g: 247, b: 250, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return !isDark ?
                            { r: 51, g: 65, b: 85, a: 1 } :
                            { r: 245, g: 247, b: 250, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => handleOppositeThemeColorChange('tabBackground', newColor)}
                      componentType="tabs"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Active Tab Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (activeTabBackground && activeTabBackground[currentTheme] &&
                          typeof activeTabBackground[currentTheme].r !== 'undefined' &&
                          typeof activeTabBackground[currentTheme].g !== 'undefined' &&
                          typeof activeTabBackground[currentTheme].b !== 'undefined') {
                        return activeTabBackground[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 255, g: 255, b: 255, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 31, g: 41, b: 55, a: 1 } :
                        { r: 255, g: 255, b: 255, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('activeTabBackground', newColor)}
                  componentType="tabs"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Active Tab Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (activeTabBackground && activeTabBackground[oppositeTheme] &&
                              typeof activeTabBackground[oppositeTheme].r !== 'undefined' &&
                              typeof activeTabBackground[oppositeTheme].g !== 'undefined' &&
                              typeof activeTabBackground[oppositeTheme].b !== 'undefined') {
                            return activeTabBackground[oppositeTheme];
                          } else if (activeTabBackground && activeTabBackground[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(activeTabBackground[currentTheme], !isDark, 'tabs');
                          }
                          // Fallback to default color for opposite theme
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
                      onChange={(newColor) => handleOppositeThemeColorChange('activeTabBackground', newColor)}
                      componentType="tabs"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Title Text Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (color && color[currentTheme] &&
                          typeof color[currentTheme].r !== 'undefined' &&
                          typeof color[currentTheme].g !== 'undefined' &&
                          typeof color[currentTheme].b !== 'undefined') {
                        return color[currentTheme];
                      }
                      // Fallback to default color for current theme
                      return isDark ?
                        { r: 229, g: 231, b: 235, a: 1 } :
                        { r: 0, g: 0, b: 0, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 229, g: 231, b: 235, a: 1 } :
                        { r: 0, g: 0, b: 0, a: 1 };
                    }
                  })()}
                  onChange={(newColor) => handleColorChange('color', newColor)}
                  componentType="text"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
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
                          if (color && color[oppositeTheme] &&
                              typeof color[oppositeTheme].r !== 'undefined' &&
                              typeof color[oppositeTheme].g !== 'undefined' &&
                              typeof color[oppositeTheme].b !== 'undefined') {
                            return color[oppositeTheme];
                          } else if (color && color[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(color[currentTheme], !isDark, 'text');
                          }
                          // Fallback to default color for opposite theme
                          return !isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 0, g: 0, b: 0, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return !isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 0, g: 0, b: 0, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => handleOppositeThemeColorChange('color', newColor)}
                      componentType="text"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tab Title Font Size</label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    min={12}
                    max={80}
                    value={titleFontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      actions.setProp((props) => {
                        props.titleFontSize = value;
                      });
                    }}
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={12}
                    max={80}
                    value={titleFontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 12 && value <= 80) {
                        actions.setProp((props) => {
                          props.titleFontSize = value;
                        });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Font size in pixels"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tab Title Font Weight</label>
              <div className="flex space-x-1">
                {['Regular', 'Medium', 'Bold'].map((weight) => {
                  const weightValue = weight === 'Regular' ? '400' :
                                    weight === 'Medium' ? '500' : '700';
                  return (
                    <button
                      key={weight}
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        titleFontWeight === weightValue
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => actions.setProp((props) => { props.titleFontWeight = weightValue; })}
                      style={{ fontWeight: weightValue }}
                    >
                      {weight}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Style</label>
              <div className="flex space-x-1">
                {['none', 'solid', 'dashed', 'dotted'].map((style) => (
                  <button
                    key={style}
                    className={`px-2 py-1 text-xs rounded capitalize ${
                      border.style === style
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => { props.border = { ...props.border, style }; })}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {border.style !== 'none' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Width</label>
                  <div className="flex items-center">
                    <div className="w-3/4 flex items-center">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={border.width}
                        onChange={(e) => actions.setProp((props) => {
                          props.border = { ...props.border, width: parseInt(e.target.value) };
                        })}
                        className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                      />
                    </div>
                    <div className="w-1/4 flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={border.width}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 1 && value <= 10) {
                            actions.setProp((props) => {
                              props.border = { ...props.border, width: value };
                            });
                          }
                        }}
                        className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                        aria-label="Border width in pixels"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Border Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const currentTheme = isDark ? 'dark' : 'light';
                          // Always use the current theme's color directly, not the converted color
                          if (border.color && border.color[currentTheme] &&
                              typeof border.color[currentTheme].r !== 'undefined' &&
                              typeof border.color[currentTheme].g !== 'undefined' &&
                              typeof border.color[currentTheme].b !== 'undefined') {
                            return border.color[currentTheme];
                          }
                          // Fallback to default color for current theme
                          return isDark ?
                            { r: 75, g: 85, b: 99, a: 1 } :
                            { r: 204, g: 204, b: 204, a: 1 };
                        } catch (error) {
                          console.warn('Error getting current theme color:', error);
                          return isDark ?
                            { r: 75, g: 85, b: 99, a: 1 } :
                            { r: 204, g: 204, b: 204, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const currentTheme = isDark ? 'dark' : 'light';
                          const oppositeTheme = isDark ? 'light' : 'dark';

                          if (props.autoConvertColors) {
                            // Auto-convert the color for the opposite theme
                            const oppositeColor = convertToThemeColor(newColor, !isDark, 'tabs');

                            props.border = {
                              ...props.border,
                              color: {
                                ...props.border.color,
                                [currentTheme]: newColor,
                                [oppositeTheme]: oppositeColor
                              }
                            };
                          } else {
                            // Only update the current theme's color
                            props.border = {
                              ...props.border,
                              color: {
                                ...props.border.color,
                                [currentTheme]: newColor
                              }
                            };
                          }
                        });
                      }}
                      componentType="tabs"
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
                              if (border.color && border.color[oppositeTheme] &&
                                  typeof border.color[oppositeTheme].r !== 'undefined' &&
                                  typeof border.color[oppositeTheme].g !== 'undefined' &&
                                  typeof border.color[oppositeTheme].b !== 'undefined') {
                                return border.color[oppositeTheme];
                              } else if (border.color && border.color[currentTheme]) {
                                // If opposite theme color is missing but current theme exists, convert it
                                return convertToThemeColor(border.color[currentTheme], !isDark, 'tabs');
                              }
                              // Fallback to default color for opposite theme
                              return !isDark ?
                                { r: 75, g: 85, b: 99, a: 1 } :
                                { r: 204, g: 204, b: 204, a: 1 };
                            } catch (error) {
                              console.warn('Error getting opposite theme color:', error);
                              return !isDark ?
                                { r: 75, g: 85, b: 99, a: 1 } :
                                { r: 204, g: 204, b: 204, a: 1 };
                            }
                          })()}
                          onChange={(newColor) => {
                            actions.setProp((props) => {
                              const oppositeTheme = isDark ? 'light' : 'dark';

                              props.border = {
                                ...props.border,
                                color: {
                                  ...props.border.color,
                                  [oppositeTheme]: newColor
                                }
                              };
                            });
                          }}
                          componentType="tabs"
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
                  checked={shadow.enabled}
                  onChange={(e) => actions.setProp((props) => {
                    props.shadow = { ...props.shadow, enabled: e.target.checked };
                  })}
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
                        value={shadow.x}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, x: parseInt(e.target.value) };
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Offset</label>
                      <input
                        type="number"
                        value={shadow.y}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, y: parseInt(e.target.value) };
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
                        value={shadow.blur}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, blur: parseInt(e.target.value) };
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</label>
                      <input
                        type="number"
                        value={shadow.spread}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, spread: parseInt(e.target.value) };
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
                            const currentTheme = isDark ? 'dark' : 'light';
                            // Always use the current theme's color directly, not the converted color
                            if (shadow.color && shadow.color[currentTheme] &&
                                typeof shadow.color[currentTheme].r !== 'undefined' &&
                                typeof shadow.color[currentTheme].g !== 'undefined' &&
                                typeof shadow.color[currentTheme].b !== 'undefined') {
                              return shadow.color[currentTheme];
                            }
                            // Fallback to default color for current theme
                            return isDark ?
                              { r: 0, g: 0, b: 0, a: 0.25 } :
                              { r: 0, g: 0, b: 0, a: 0.15 };
                          } catch (error) {
                            console.warn('Error getting current theme color:', error);
                            return isDark ?
                              { r: 0, g: 0, b: 0, a: 0.25 } :
                              { r: 0, g: 0, b: 0, a: 0.15 };
                          }
                        })()}
                        onChange={(newColor) => {
                          actions.setProp((props) => {
                            const currentTheme = isDark ? 'dark' : 'light';
                            const oppositeTheme = isDark ? 'light' : 'dark';

                            if (props.autoConvertColors) {
                              // Auto-convert the color for the opposite theme
                              const oppositeColor = convertToThemeColor(newColor, !isDark, 'shadow');

                              props.shadow = {
                                ...props.shadow,
                                color: {
                                  ...props.shadow.color,
                                  [currentTheme]: newColor,
                                  [oppositeTheme]: oppositeColor
                                }
                              };
                            } else {
                              // Only update the current theme's color
                              props.shadow = {
                                ...props.shadow,
                                color: {
                                  ...props.shadow.color,
                                  [currentTheme]: newColor
                                }
                              };
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
                                // Fallback to default color for opposite theme
                                return !isDark ?
                                  { r: 0, g: 0, b: 0, a: 0.25 } :
                                  { r: 0, g: 0, b: 0, a: 0.15 };
                              } catch (error) {
                                console.warn('Error getting opposite theme color:', error);
                                return !isDark ?
                                  { r: 0, g: 0, b: 0, a: 0.25 } :
                                  { r: 0, g: 0, b: 0, a: 0.15 };
                              }
                            })()}
                            onChange={(newColor) => {
                              actions.setProp((props) => {
                                const oppositeTheme = isDark ? 'light' : 'dark';

                                props.shadow = {
                                  ...props.shadow,
                                  color: {
                                    ...props.shadow.color,
                                    [oppositeTheme]: newColor
                                  }
                                };
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

      {/* Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Padding */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Padding</label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div key={side}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{side}</label>
                    <input
                      type="number"
                      value={padding[index] === '' || padding[index] === '0' ? '' : parseInt(padding[index])}
                      onChange={(e) => {
                        actions.setProp((props) => {
                          const newPadding = [...props.padding];
                          newPadding[index] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          props.padding = newPadding;
                        });
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Margin</label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div key={side}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{side}</label>
                    <input
                      type="number"
                      value={margin[index] === '' || margin[index] === '0' ? '' : parseInt(margin[index])}
                      onChange={(e) => {
                        actions.setProp((props) => {
                          const newMargin = [...props.margin];
                          newMargin[index] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          props.margin = newMargin;
                        });
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
