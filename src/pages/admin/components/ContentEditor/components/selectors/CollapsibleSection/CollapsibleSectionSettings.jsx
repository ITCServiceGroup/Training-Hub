import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { convertToThemeColor, getThemeColor } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';

// Helper function to ensure theme colors are properly initialized
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';

  // Add debug logging for headerTextColor
  console.log('ensureThemeColors - initial headerTextColor:', JSON.stringify(props.headerTextColor));

  // List of color properties to check and update
  const colorKeys = ['background', 'color', 'headerBackground', 'headerTextColor', 'stepButtonColor', 'stepIndicatorColor'];

  // Process each color property
  colorKeys.forEach(colorKey => {
    // Skip if the property doesn't exist
    if (!props[colorKey]) return;

    // Handle legacy format (single RGBA object)
    if ('r' in props[colorKey]) {
      const oldColor = { ...props[colorKey] };
      props[colorKey] = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'container')
      };
    }

    // Ensure both light and dark properties exist with appropriate defaults
    if (!props[colorKey].light) {
      if (colorKey === 'background') {
        props[colorKey].light = { r: 255, g: 255, b: 255, a: 1 };
      } else if (colorKey === 'color') {
        props[colorKey].light = { r: 51, g: 51, b: 51, a: 1 };
      } else if (colorKey === 'headerBackground') {
        props[colorKey].light = { r: 245, g: 247, b: 250, a: 1 };
      } else if (colorKey === 'headerTextColor') {
        props[colorKey].light = { r: 0, g: 0, b: 0, a: 1 };
      } else if (colorKey === 'stepButtonColor') {
        props[colorKey].light = { r: 15, g: 118, b: 110, a: 1 }; // Default primary color light
      } else if (colorKey === 'stepIndicatorColor') {
        props[colorKey].light = { r: 15, g: 118, b: 110, a: 1 }; // Default primary color light
      }
    }

    if (!props[colorKey].dark) {
      if (colorKey === 'background') {
        props[colorKey].dark = { r: 31, g: 41, b: 55, a: 1 };
      } else if (colorKey === 'color') {
        props[colorKey].dark = { r: 229, g: 231, b: 235, a: 1 };
      } else if (colorKey === 'headerBackground') {
        props[colorKey].dark = { r: 51, g: 65, b: 85, a: 1 };
      } else if (colorKey === 'headerTextColor') {
        props[colorKey].dark = { r: 229, g: 231, b: 235, a: 1 };
      } else if (colorKey === 'stepButtonColor') {
        props[colorKey].dark = { r: 20, g: 184, b: 166, a: 1 }; // Default primary color dark
      } else if (colorKey === 'stepIndicatorColor') {
        props[colorKey].dark = { r: 20, g: 184, b: 166, a: 1 }; // Default primary color dark
      }
    }

    // If one theme is missing, generate it from the other
    if (props[colorKey][currentTheme] && !props[colorKey][oppositeTheme]) {
      // Determine the component type for proper color conversion
      const componentType = colorKey === 'headerTextColor' ? 'text' :
                           (colorKey === 'stepButtonColor' || colorKey === 'stepIndicatorColor') ? 'button' : 'container';

      props[colorKey][oppositeTheme] = convertToThemeColor(props[colorKey][currentTheme], !isDark, componentType);
    } else if (props[colorKey][oppositeTheme] && !props[colorKey][currentTheme]) {
      // Determine the component type for proper color conversion
      const componentType = colorKey === 'headerTextColor' ? 'text' :
                           (colorKey === 'stepButtonColor' || colorKey === 'stepIndicatorColor') ? 'button' : 'container';

      props[colorKey][currentTheme] = convertToThemeColor(props[colorKey][oppositeTheme], isDark, componentType);
    }
  });

  // Handle border color
  if (props.border && props.border.color) {
    // Handle legacy format (single RGBA object)
    if ('r' in props.border.color) {
      const oldColor = { ...props.border.color };
      props.border.color = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'container')
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
      props.border.color[oppositeTheme] = convertToThemeColor(props.border.color[currentTheme], !isDark, 'container');
    } else if (props.border.color[oppositeTheme] && !props.border.color[currentTheme]) {
      props.border.color[currentTheme] = convertToThemeColor(props.border.color[oppositeTheme], isDark, 'container');
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
      props.shadow.color.dark = { r: 255, g: 255, b: 255, a: 0.15 };
    }

    // If one theme is missing, generate it from the other
    if (props.shadow.color[currentTheme] && !props.shadow.color[oppositeTheme]) {
      props.shadow.color[oppositeTheme] = convertToThemeColor(props.shadow.color[currentTheme], !isDark, 'shadow');
    } else if (props.shadow.color[oppositeTheme] && !props.shadow.color[currentTheme]) {
      props.shadow.color[currentTheme] = convertToThemeColor(props.shadow.color[oppositeTheme], isDark, 'shadow');
    }
  }

  // Final check for headerTextColor to ensure it's properly set
  if (props.headerTextColor) {
    console.log('ensureThemeColors - final headerTextColor:', JSON.stringify(props.headerTextColor));
  } else {
    console.warn('ensureThemeColors - headerTextColor is still missing after initialization');
  }

  return props;
};

export const CollapsibleSectionSettings = () => {
  // State for collapsible sections
  const [showContent, setShowContent] = useState(true);
  const [showAppearance, setShowAppearance] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);

  // Get current theme
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { actions, setProp } = useNode((node) => ({
    selected: node.id,
  }));

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
    title,
    stepsEnabled,
    numberOfSteps,
    headerBackground,
    headerTextColor,
    headerFontSize,
    stepButtonColor,
    stepIndicatorColor,
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
      color: props.color || {
        light: { r: 51, g: 51, b: 51, a: 1 },
        dark: { r: 229, g: 231, b: 235, a: 1 }
      },
      padding: props.padding || ['0', '0', '0', '0'],
      margin: props.margin || ['0', '0', '0', '0'],
      radius: props.radius || 0,
      shadow: shadowValue || {
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
      border: props.border || {
        style: 'none',
        width: 1,
        color: {
          light: { r: 204, g: 204, b: 204, a: 1 },
          dark: { r: 75, g: 85, b: 99, a: 1 }
        }
      },
      width: props.width || '100%',
      height: props.height || 'auto',
      title: props.title || 'Collapsible Section',
      stepsEnabled: props.stepsEnabled || false,
      numberOfSteps: props.numberOfSteps || 1,
      headerBackground: props.headerBackground || {
        light: { r: 245, g: 247, b: 250, a: 1 },
        dark: { r: 51, g: 65, b: 85, a: 1 }
      },
      headerTextColor: props.headerTextColor || {
        light: { r: 0, g: 0, b: 0, a: 1 },
        dark: { r: 229, g: 231, b: 235, a: 1 }
      },
      headerFontSize: props.headerFontSize || 16,
      stepButtonColor: props.stepButtonColor || {
        light: { r: 15, g: 118, b: 110, a: 1 }, // Default primary color light
        dark: { r: 20, g: 184, b: 166, a: 1 }   // Default primary color dark
      },
      stepIndicatorColor: props.stepIndicatorColor || {
        light: { r: 15, g: 118, b: 110, a: 1 }, // Default primary color light
        dark: { r: 20, g: 184, b: 166, a: 1 }   // Default primary color dark
      },
      autoConvertColors: typeof props.autoConvertColors !== 'undefined' ? props.autoConvertColors : true
    };
  });

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    setProp((props) => {
      // Add console logging to debug header text color
      console.log('Before ensureThemeColors - headerTextColor:', JSON.stringify(props.headerTextColor));
      const updatedProps = ensureThemeColors(props, isDark);
      console.log('After ensureThemeColors - headerTextColor:', JSON.stringify(updatedProps.headerTextColor));
      return updatedProps;
    });
  }, [setProp, isDark]);

  const handleColorChange = (colorKey, newColor) => {
    // Add debug logging for header text color changes
    if (colorKey === 'headerTextColor') {
      console.log(`Changing headerTextColor to:`, newColor);
    }

    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Log before update if it's headerTextColor
      if (colorKey === 'headerTextColor') {
        console.log('Before update - headerTextColor:', JSON.stringify(props.headerTextColor));
      }

      // Determine the component type for proper color conversion
      const componentType = colorKey === 'headerTextColor' ? 'text' :
                           (colorKey === 'stepButtonColor' || colorKey === 'stepIndicatorColor') ? 'button' : 'container';

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newColor, !isDark, componentType);

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

      // Log after update if it's headerTextColor
      if (colorKey === 'headerTextColor') {
        console.log('After update - headerTextColor:', JSON.stringify(props.headerTextColor));

        // Force a deep clone of the headerTextColor to ensure it's properly saved
        if (props.headerTextColor) {
          const currentThemeColor = props.headerTextColor[currentTheme];
          const oppositeThemeColor = props.headerTextColor[oppositeTheme];

          // Create a new object to ensure the reference changes
          props.headerTextColor = {
            [currentTheme]: { ...currentThemeColor },
            [oppositeTheme]: { ...oppositeThemeColor }
          };

          console.log('After deep clone - headerTextColor:', JSON.stringify(props.headerTextColor));
        }
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

      // Special handling for headerTextColor to ensure it's properly saved
      if (colorKey === 'headerTextColor') {
        // Force a deep clone of the headerTextColor
        const currentTheme = isDark ? 'dark' : 'light';
        const currentThemeColor = props.headerTextColor[currentTheme];
        const oppositeThemeColor = props.headerTextColor[oppositeTheme];

        // Create a new object to ensure the reference changes
        props.headerTextColor = {
          [currentTheme]: { ...currentThemeColor },
          [oppositeTheme]: { ...oppositeThemeColor }
        };
      }
    });
  };

  const handleOpacityChange = (colorKey, opacity) => {
    // Add debug logging for header text color opacity changes
    if (colorKey === 'headerTextColor') {
      console.log(`Changing headerTextColor opacity to: ${opacity}`);
    }

    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Create a new color object with the updated opacity
      const newThemeColor = {
        ...props[colorKey][currentTheme],
        a: opacity
      };

      // Log before update if it's headerTextColor
      if (colorKey === 'headerTextColor') {
        console.log('Before opacity update - headerTextColor:', JSON.stringify(props.headerTextColor));
      }

      // Determine the component type for proper color conversion
      const componentType = colorKey === 'headerTextColor' ? 'text' :
                           (colorKey === 'stepButtonColor' || colorKey === 'stepIndicatorColor') ? 'button' : 'container';

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newThemeColor, !isDark, componentType);

        props[colorKey] = {
          ...props[colorKey],
          [currentTheme]: newThemeColor,
          [oppositeTheme]: oppositeColor
        };
      } else {
        // Only update the current theme's color
        props[colorKey] = {
          ...props[colorKey],
          [currentTheme]: newThemeColor
        };
      }

      // Log after update if it's headerTextColor
      if (colorKey === 'headerTextColor') {
        console.log('After opacity update - headerTextColor:', JSON.stringify(props.headerTextColor));

        // Force a deep clone of the headerTextColor to ensure it's properly saved
        if (props.headerTextColor) {
          const currentThemeColor = props.headerTextColor[currentTheme];
          const oppositeThemeColor = props.headerTextColor[oppositeTheme];

          // Create a new object to ensure the reference changes
          props.headerTextColor = {
            [currentTheme]: { ...currentThemeColor },
            [oppositeTheme]: { ...oppositeThemeColor }
          };

          console.log('After deep clone (opacity) - headerTextColor:', JSON.stringify(props.headerTextColor));
        }
      }
    });
  };

  // Helper function to get the current theme color value for display
  // These helper functions are no longer needed as they've been replaced by the ColorPicker component
  // which handles color conversion and theme-aware color management internally

  return (
    <div className="settings-container">
      {/* General Settings */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showContent ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowContent(!showContent)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            General
          </label>
          <FaChevronDown
            className={`transition-transform ${showContent ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showContent && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => actions.setProp((props) => { props.title = e.target.value; })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (%)</label>
                <input
                  type="text"
                  value={width.replace('%', '')}
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
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                <input
                  type="text"
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
                        const colorKeys = ['background', 'color', 'headerBackground', 'headerTextColor'];

                        colorKeys.forEach(colorKey => {
                          // If the current theme color exists, update the opposite theme color
                          if (props[colorKey] && props[colorKey][currentTheme]) {
                            const currentColor = props[colorKey][currentTheme];
                            props[colorKey][oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'container');
                          }
                        });

                        // Handle border color
                        if (props.border && props.border.color && props.border.color[currentTheme]) {
                          const currentColor = props.border.color[currentTheme];
                          props.border.color[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'container');
                        }

                        // Handle shadow color
                        if (props.shadow && props.shadow.color && props.shadow.color[currentTheme]) {
                          const currentColor = props.shadow.color[currentTheme];
                          props.shadow.color[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'shadow');
                        }
                      }

                      return props;
                    });
                  }}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="autoConvertColors"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Auto-convert colors between themes
                </label>
                <div className="relative ml-1 group">
                  <FaInfoCircle className="text-gray-400 dark:text-gray-500 cursor-help" size={12} />
                  <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 p-2 rounded shadow-lg text-xs text-gray-600 dark:text-gray-300 hidden group-hover:block z-10">
                    When enabled, colors will automatically convert between light and dark themes. When disabled, you can set different colors for each theme independently.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Content Background</label>
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
                  componentType="container"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Content Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
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
                      componentType="container"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Background</label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (headerBackground && headerBackground[currentTheme] &&
                          typeof headerBackground[currentTheme].r !== 'undefined' &&
                          typeof headerBackground[currentTheme].g !== 'undefined' &&
                          typeof headerBackground[currentTheme].b !== 'undefined') {
                        return headerBackground[currentTheme];
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
                  onChange={(newColor) => handleColorChange('headerBackground', newColor)}
                  componentType="container"
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
                          if (headerBackground && headerBackground[oppositeTheme] &&
                              typeof headerBackground[oppositeTheme].r !== 'undefined' &&
                              typeof headerBackground[oppositeTheme].g !== 'undefined' &&
                              typeof headerBackground[oppositeTheme].b !== 'undefined') {
                            return headerBackground[oppositeTheme];
                          } else if (headerBackground && headerBackground[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(headerBackground[currentTheme], !isDark, 'container');
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
                      onChange={(newColor) => handleOppositeThemeColorChange('headerBackground', newColor)}
                      componentType="container"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Text Color</label>
              <div className="flex items-center">
                <ColorPicker
                  color={(() => {
                    try {
                      const currentTheme = isDark ? 'dark' : 'light';
                      // Always use the current theme's color directly, not the converted color
                      if (headerTextColor && headerTextColor[currentTheme] &&
                          typeof headerTextColor[currentTheme].r !== 'undefined' &&
                          typeof headerTextColor[currentTheme].g !== 'undefined' &&
                          typeof headerTextColor[currentTheme].b !== 'undefined') {
                        return headerTextColor[currentTheme];
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
                  onChange={(newColor) => handleColorChange('headerTextColor', newColor)}
                  componentType="text"
                />
              </div>

              {/* Show opposite theme color control when auto-convert is disabled */}
              {!autoConvertColors && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Header Text Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          const currentTheme = isDark ? 'dark' : 'light';

                          // Ensure we have a valid color for the opposite theme
                          if (headerTextColor && headerTextColor[oppositeTheme] &&
                              typeof headerTextColor[oppositeTheme].r !== 'undefined' &&
                              typeof headerTextColor[oppositeTheme].g !== 'undefined' &&
                              typeof headerTextColor[oppositeTheme].b !== 'undefined') {
                            return headerTextColor[oppositeTheme];
                          } else if (headerTextColor && headerTextColor[currentTheme]) {
                            // If opposite theme color is missing but current theme exists, convert it
                            return convertToThemeColor(headerTextColor[currentTheme], !isDark, 'text');
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
                      onChange={(newColor) => handleOppositeThemeColorChange('headerTextColor', newColor)}
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Font Size</label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    min={12}
                    max={32}
                    value={headerFontSize}
                    onChange={(e) => actions.setProp((props) => { props.headerFontSize = parseInt(e.target.value); })}
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={12}
                    max={32}
                    value={headerFontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 12 && value <= 32) {
                        actions.setProp((props) => { props.headerFontSize = value; });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Header font size in pixels"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Arrow Color</label>
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
                        { r: 51, g: 51, b: 51, a: 1 };
                    } catch (error) {
                      console.warn('Error getting current theme color:', error);
                      return isDark ?
                        { r: 229, g: 231, b: 235, a: 1 } :
                        { r: 51, g: 51, b: 51, a: 1 };
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
                    Arrow Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
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
                            { r: 51, g: 51, b: 51, a: 1 };
                        } catch (error) {
                          console.warn('Error getting opposite theme color:', error);
                          return !isDark ?
                            { r: 229, g: 231, b: 235, a: 1 } :
                            { r: 51, g: 51, b: 51, a: 1 };
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
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Color</label>
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
                            const oppositeColor = convertToThemeColor(newColor, !isDark, 'container');

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
                      componentType="container"
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
                                return convertToThemeColor(border.color[currentTheme], !isDark, 'container');
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
                          componentType="container"
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
                          color: { r: 0, g: 0, b: 0, a: 0.15 }
                        };
                      } else {
                        props.shadow.enabled = isChecked;
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
                              color: { r: 0, g: 0, b: 0, a: 0.15 }
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
                        value={shadow.y || 4}
                        onChange={(e) => actions.setProp((props) => {
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: parseInt(e.target.value),
                              blur: 8,
                              spread: 0,
                              color: { r: 0, g: 0, b: 0, a: 0.15 }
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
                        value={shadow.blur || 8}
                        onChange={(e) => actions.setProp((props) => {
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: 4,
                              blur: parseInt(e.target.value),
                              spread: 0,
                              color: { r: 0, g: 0, b: 0, a: 0.15 }
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
                        value={shadow.spread || 0}
                        onChange={(e) => actions.setProp((props) => {
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: 4,
                              blur: 8,
                              spread: parseInt(e.target.value),
                              color: { r: 0, g: 0, b: 0, a: 0.15 }
                            };
                          } else {
                            props.shadow.spread = parseInt(e.target.value);
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Shadow Color</label>
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

      {/* Steps Settings */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showSteps ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowSteps(!showSteps)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Steps
          </label>
          <FaChevronDown
            className={`transition-transform ${showSteps ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSteps && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Enable Steps</label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    !stepsEnabled
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.stepsEnabled = false; })}
                >
                  Off
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    stepsEnabled
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.stepsEnabled = true; })}
                >
                  On
                </button>
              </div>
            </div>
            {stepsEnabled && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Steps</label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfSteps}
                    onChange={(e) => actions.setProp((props) => { props.numberOfSteps = parseInt(e.target.value) || 1; })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Step Button Color</label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const currentTheme = isDark ? 'dark' : 'light';
                          // Always use the current theme's color directly, not the converted color
                          if (stepButtonColor && stepButtonColor[currentTheme] &&
                              typeof stepButtonColor[currentTheme].r !== 'undefined' &&
                              typeof stepButtonColor[currentTheme].g !== 'undefined' &&
                              typeof stepButtonColor[currentTheme].b !== 'undefined') {
                            return stepButtonColor[currentTheme];
                          }
                          // Fallback to default color for current theme
                          return isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                        } catch (error) {
                          console.warn('Error getting current theme color:', error);
                          return isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                        }
                      })()}
                      onChange={(newColor) => handleColorChange('stepButtonColor', newColor)}
                      componentType="button"
                    />
                  </div>

                  {/* Show opposite theme color control when auto-convert is disabled */}
                  {!autoConvertColors && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Step Button Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                      </label>
                      <div className="flex items-center">
                        <ColorPicker
                          color={(() => {
                            try {
                              const oppositeTheme = isDark ? 'light' : 'dark';
                              const currentTheme = isDark ? 'dark' : 'light';

                              // Ensure we have a valid color for the opposite theme
                              if (stepButtonColor && stepButtonColor[oppositeTheme] &&
                                  typeof stepButtonColor[oppositeTheme].r !== 'undefined' &&
                                  typeof stepButtonColor[oppositeTheme].g !== 'undefined' &&
                                  typeof stepButtonColor[oppositeTheme].b !== 'undefined') {
                                return stepButtonColor[oppositeTheme];
                              } else if (stepButtonColor && stepButtonColor[currentTheme]) {
                                // If opposite theme color is missing but current theme exists, convert it
                                return convertToThemeColor(stepButtonColor[currentTheme], !isDark, 'button');
                              }
                              // Fallback to default color for opposite theme
                              return !isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                            } catch (error) {
                              console.warn('Error getting opposite theme color:', error);
                              return !isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                            }
                          })()}
                          onChange={(newColor) => handleOppositeThemeColorChange('stepButtonColor', newColor)}
                          componentType="button"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Step Indicator Color</label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const currentTheme = isDark ? 'dark' : 'light';
                          // Always use the current theme's color directly, not the converted color
                          if (stepIndicatorColor && stepIndicatorColor[currentTheme] &&
                              typeof stepIndicatorColor[currentTheme].r !== 'undefined' &&
                              typeof stepIndicatorColor[currentTheme].g !== 'undefined' &&
                              typeof stepIndicatorColor[currentTheme].b !== 'undefined') {
                            return stepIndicatorColor[currentTheme];
                          }
                          // Fallback to default color for current theme
                          return isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                        } catch (error) {
                          console.warn('Error getting current theme color:', error);
                          return isDark ? { r: 20, g: 184, b: 166, a: 1 } : { r: 15, g: 118, b: 110, a: 1 }; // Default primary colors
                        }
                      })()}
                      onChange={(newColor) => handleColorChange('stepIndicatorColor', newColor)}
                      componentType="button"
                    />
                  </div>

                  {/* Show opposite theme color control when auto-convert is disabled */}
                  {!autoConvertColors && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Step Indicator Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                      </label>
                      <div className="flex items-center">
                        <ColorPicker
                          color={(() => {
                            try {
                              const oppositeTheme = isDark ? 'light' : 'dark';
                              const currentTheme = isDark ? 'dark' : 'light';

                              // Ensure we have a valid color for the opposite theme
                              if (stepIndicatorColor && stepIndicatorColor[oppositeTheme] &&
                                  typeof stepIndicatorColor[oppositeTheme].r !== 'undefined' &&
                                  typeof stepIndicatorColor[oppositeTheme].g !== 'undefined' &&
                                  typeof stepIndicatorColor[oppositeTheme].b !== 'undefined') {
                                return stepIndicatorColor[oppositeTheme];
                              } else if (stepIndicatorColor && stepIndicatorColor[currentTheme]) {
                                // If opposite theme color is missing but current theme exists, convert it
                                return convertToThemeColor(stepIndicatorColor[currentTheme], !isDark, 'button');
                              }
                              // Fallback to default color for opposite theme
                              return isDark ? { r: 15, g: 118, b: 110, a: 1 } : { r: 20, g: 184, b: 166, a: 1 }; // Default primary colors
                            } catch (error) {
                              console.warn('Error getting opposite theme color:', error);
                              return isDark ? { r: 15, g: 118, b: 110, a: 1 } : { r: 20, g: 184, b: 166, a: 1 }; // Default primary colors
                            }
                          })()}
                          onChange={(newColor) => handleOppositeThemeColorChange('stepIndicatorColor', newColor)}
                          componentType="button"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start mb-2">
                  <input
                    type="checkbox"
                    id="autoConvertStepColors"
                    checked={autoConvertColors}
                    onChange={(e) => actions.setProp((props) => { props.autoConvertColors = e.target.checked; })}
                    className="mr-2 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                  />
                  <div className="flex items-center">
                    <label
                      htmlFor="autoConvertStepColors"
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer leading-none pt-1"
                    >
                      Auto-convert colors between themes
                    </label>
                    <div className="relative ml-1 group">
                      <FaInfoCircle className="text-gray-400 dark:text-gray-500 cursor-help" size={12} />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        When enabled, colors will automatically convert between light and dark themes. When disabled, you can set different colors for each theme.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
            Section Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Section Padding
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
                      actions.setProp((props) => {
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
                      actions.setProp((props) => {
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
                    value={padding[3] === '' || padding[3] === '0' ? '' : parseInt(padding[3])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      actions.setProp((props) => {
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
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Right</label>
                  <input
                    type="number"
                    value={padding[1] === '' || padding[1] === '0' ? '' : parseInt(padding[1])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      actions.setProp((props) => {
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
              </div>
            </div>

            {/* Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Section Margin
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
                      actions.setProp((props) => {
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
                      actions.setProp((props) => {
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
                      actions.setProp((props) => {
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
                      actions.setProp((props) => {
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
          </div>
        )}
      </div>


    </div>
  );
};
