import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { convertToThemeColor } from '../../../utils/themeColors';

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
        props[colorKey].light = { r: 13, g: 148, b: 136, a: 1 }; // #0d9488 (teal-600)
      } else if (colorKey === 'stepIndicatorColor') {
        props[colorKey].light = { r: 13, g: 148, b: 136, a: 1 }; // #0d9488 (teal-600)
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
        props[colorKey].dark = { r: 13, g: 148, b: 136, a: 1 }; // #0d9488 (teal-600)
      } else if (colorKey === 'stepIndicatorColor') {
        props[colorKey].dark = { r: 13, g: 148, b: 136, a: 1 }; // #0d9488 (teal-600)
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
        light: { r: 13, g: 148, b: 136, a: 1 }, // #0d9488 (teal-600)
        dark: { r: 13, g: 148, b: 136, a: 1 }  // Same teal color for dark mode
      },
      stepIndicatorColor: props.stepIndicatorColor || {
        light: { r: 13, g: 148, b: 136, a: 1 }, // #0d9488 (teal-600)
        dark: { r: 13, g: 148, b: 136, a: 1 }  // Same teal color for dark mode
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
    const r = parseInt(newColor.substring(1, 3), 16);
    const g = parseInt(newColor.substring(3, 5), 16);
    const b = parseInt(newColor.substring(5, 7), 16);

    // Add debug logging for header text color changes
    if (colorKey === 'headerTextColor') {
      console.log(`Changing headerTextColor to: rgb(${r}, ${g}, ${b})`);
    }

    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Get current alpha or default to 1
      const currentAlpha = props[colorKey] &&
                          props[colorKey][currentTheme] &&
                          typeof props[colorKey][currentTheme].a !== 'undefined' ?
                          props[colorKey][currentTheme].a : 1;

      const newThemeColor = { r, g, b, a: currentAlpha };

      // Log before update if it's headerTextColor
      if (colorKey === 'headerTextColor') {
        console.log('Before update - headerTextColor:', JSON.stringify(props.headerTextColor));
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
  const getCurrentThemeColorValue = (colorObj) => {
    if (!colorObj) return '#000000';

    const currentTheme = isDark ? 'dark' : 'light';

    // Handle theme-aware color objects
    if (colorObj[currentTheme]) {
      const themeColor = colorObj[currentTheme];
      return `#${Math.round(themeColor.r).toString(16).padStart(2, '0')}${Math.round(themeColor.g).toString(16).padStart(2, '0')}${Math.round(themeColor.b).toString(16).padStart(2, '0')}`;
    }

    // Handle legacy format (single RGBA object)
    if ('r' in colorObj) {
      return `#${Math.round(colorObj.r).toString(16).padStart(2, '0')}${Math.round(colorObj.g).toString(16).padStart(2, '0')}${Math.round(colorObj.b).toString(16).padStart(2, '0')}`;
    }

    return '#000000';
  };

  // Helper function to get the current theme opacity value
  const getCurrentThemeOpacity = (colorObj) => {
    if (!colorObj) return 1;

    const currentTheme = isDark ? 'dark' : 'light';

    // Handle theme-aware color objects
    if (colorObj[currentTheme]) {
      return colorObj[currentTheme].a !== undefined ? colorObj[currentTheme].a : 1;
    }

    // Handle legacy format (single RGBA object)
    if ('a' in colorObj) {
      return colorObj.a;
    }

    return 1;
  };

  // Helper function to handle border color change
  const handleBorderColorChange = (newColor) => {
    const r = parseInt(newColor.substring(1, 3), 16);
    const g = parseInt(newColor.substring(3, 5), 16);
    const b = parseInt(newColor.substring(5, 7), 16);

    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Get current alpha or default to 1
      const currentAlpha = props.border.color &&
                          props.border.color[currentTheme] &&
                          typeof props.border.color[currentTheme].a !== 'undefined' ?
                          props.border.color[currentTheme].a : 1;

      const newThemeColor = { r, g, b, a: currentAlpha };

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newThemeColor, !isDark, 'container');

        props.border.color = {
          ...props.border.color,
          [currentTheme]: newThemeColor,
          [oppositeTheme]: oppositeColor
        };
      } else {
        // Only update the current theme's color
        props.border.color = {
          ...props.border.color,
          [currentTheme]: newThemeColor
        };
      }
    });
  };

  // Helper function to handle border opacity change
  const handleBorderOpacityChange = (opacity) => {
    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Create a new color object with the updated opacity
      const newThemeColor = {
        ...props.border.color[currentTheme],
        a: opacity
      };

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newThemeColor, !isDark, 'container');

        props.border.color = {
          ...props.border.color,
          [currentTheme]: newThemeColor,
          [oppositeTheme]: oppositeColor
        };
      } else {
        // Only update the current theme's color
        props.border.color = {
          ...props.border.color,
          [currentTheme]: newThemeColor
        };
      }
    });
  };

  // Helper function to handle shadow color change
  const handleShadowColorChange = (newColor) => {
    const hex = newColor.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Get current alpha or default to 0.15
      const currentAlpha = props.shadow.color &&
                          props.shadow.color[currentTheme] &&
                          typeof props.shadow.color[currentTheme].a !== 'undefined' ?
                          props.shadow.color[currentTheme].a : 0.15;

      const newThemeColor = { r, g, b, a: currentAlpha };

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newThemeColor, !isDark, 'shadow');

        props.shadow.color = {
          ...props.shadow.color,
          [currentTheme]: newThemeColor,
          [oppositeTheme]: oppositeColor
        };
      } else {
        // Only update the current theme's color
        props.shadow.color = {
          ...props.shadow.color,
          [currentTheme]: newThemeColor
        };
      }
    });
  };

  // Helper function to handle shadow opacity change
  const handleShadowOpacityChange = (opacity) => {
    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // Create a new color object with the updated opacity
      const newThemeColor = {
        ...props.shadow.color[currentTheme],
        a: opacity
      };

      if (props.autoConvertColors) {
        // Auto-convert the color for the opposite theme
        const oppositeColor = convertToThemeColor(newThemeColor, !isDark, 'shadow');

        props.shadow.color = {
          ...props.shadow.color,
          [currentTheme]: newThemeColor,
          [oppositeTheme]: oppositeColor
        };
      } else {
        // Only update the current theme's color
        props.shadow.color = {
          ...props.shadow.color,
          [currentTheme]: newThemeColor
        };
      }
    });
  };

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
                  className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
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
                <input
                  type="color"
                  value={getCurrentThemeColorValue(background)}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getCurrentThemeOpacity(background)}
                  onChange={(e) => handleOpacityChange('background', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={getCurrentThemeColorValue(headerBackground)}
                  onChange={(e) => handleColorChange('headerBackground', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getCurrentThemeOpacity(headerBackground)}
                  onChange={(e) => handleOpacityChange('headerBackground', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Text Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={getCurrentThemeColorValue(headerTextColor)}
                  onChange={(e) => handleColorChange('headerTextColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getCurrentThemeOpacity(headerTextColor)}
                  onChange={(e) => handleOpacityChange('headerTextColor', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Header Font Size</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={12}
                  max={32}
                  value={headerFontSize}
                  onChange={(e) => actions.setProp((props) => { props.headerFontSize = parseInt(e.target.value); })}
                  className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{headerFontSize}px</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Arrow Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={getCurrentThemeColorValue(color)}
                  onChange={(e) => handleColorChange('color', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getCurrentThemeOpacity(color)}
                  onChange={(e) => handleOpacityChange('color', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
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
                        ? 'bg-teal-600 text-white'
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
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={border.width}
                      onChange={(e) => actions.setProp((props) => {
                        props.border = { ...props.border, width: parseInt(e.target.value) };
                      })}
                      className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{border.width}px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={getCurrentThemeColorValue(border.color)}
                      onChange={(e) => handleBorderColorChange(e.target.value)}
                      className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getCurrentThemeOpacity(border.color)}
                      onChange={(e) => handleBorderOpacityChange(parseFloat(e.target.value))}
                      className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Border Radius</label>
              <div className="flex items-center">
                <input
                  type="range"
                  value={radius}
                  min={0}
                  max={50}
                  onChange={(e) => actions.setProp((props) => { props.radius = parseInt(e.target.value); })}
                  className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{radius}px</span>
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
                  className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
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
                      <input
                        type="color"
                        value={getCurrentThemeColorValue(shadow.color)}
                        onChange={(e) => handleShadowColorChange(e.target.value)}
                        className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={getCurrentThemeOpacity(shadow.color)}
                        onChange={(e) => handleShadowOpacityChange(parseFloat(e.target.value))}
                        className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                      />
                    </div>
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
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.stepsEnabled = false; })}
                >
                  Off
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    stepsEnabled
                      ? 'bg-teal-600 text-white'
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
                    <input
                      type="color"
                      value={getCurrentThemeColorValue(stepButtonColor)}
                      onChange={(e) => handleColorChange('stepButtonColor', e.target.value)}
                      className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getCurrentThemeOpacity(stepButtonColor)}
                      onChange={(e) => handleOpacityChange('stepButtonColor', parseFloat(e.target.value))}
                      className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Step Indicator Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={getCurrentThemeColorValue(stepIndicatorColor)}
                      onChange={(e) => handleColorChange('stepIndicatorColor', e.target.value)}
                      className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getCurrentThemeOpacity(stepIndicatorColor)}
                      onChange={(e) => handleOpacityChange('stepIndicatorColor', parseFloat(e.target.value))}
                      className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                    />
                  </div>
                </div>

                <div className="flex items-start mb-2">
                  <input
                    type="checkbox"
                    id="autoConvertStepColors"
                    checked={autoConvertColors}
                    onChange={(e) => actions.setProp((props) => { props.autoConvertColors = e.target.checked; })}
                    className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5"
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
