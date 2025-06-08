import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaCog, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import ColorPicker from '../../../../../../../components/common/ColorPicker';
import { convertToThemeColor, getThemeColor } from '../../../utils/themeColors';

export const InteractiveSettings = () => {
  const { actions, name, id, related } = useNode((node) => ({
    name: node.data.custom.displayName || node.data.displayName,
    id: node.id,
    related: node.related
  }));

  const { setProp, props } = useNode((node) => ({
    props: node.data.props
  }));

  const [interactiveElements, setInteractiveElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSpacing, setShowSpacing] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Extract props with defaults
  const {
    titleTextColor = {
      light: { r: 44, g: 62, b: 80, a: 1 },
      dark: { r: 241, g: 245, b: 249, a: 1 }
    },
    buttonColor = {
      light: { r: 15, g: 118, b: 110, a: 1 },
      dark: { r: 20, g: 184, b: 166, a: 1 }
    },
    primaryBackgroundColor = {
      light: { r: 248, g: 249, b: 250, a: 1 },
      dark: { r: 30, g: 41, b: 59, a: 1 }
    },
    secondaryBackgroundColor = {
      light: { r: 255, g: 255, b: 255, a: 1 },
      dark: { r: 15, g: 23, b: 42, a: 1 }
    },
    autoConvertColors = true
  } = props;

  // Initialize margin with default values if not set
  const margin = props.margin || ['0', '0', '0', '0'];

  // Fetch available interactive elements
  useEffect(() => {
    setLoading(true);
    // Use absolute path in dev, relative in production
    const elementsPath = import.meta.env.DEV ? '/interactive-elements/elements.json' : './interactive-elements/elements.json';
    fetch(elementsPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(elements => {
        // Convert absolute paths to work with current environment
        const basePath = import.meta.env.DEV ? '' : '.';
        const processedElements = elements.map(element => ({
          ...element,
          iconUrl: element.iconUrl?.startsWith('/') ? `${basePath}${element.iconUrl}` : element.iconUrl,
          thumbnailUrl: element.thumbnailUrl?.startsWith('/') ? `${basePath}${element.thumbnailUrl}` : element.thumbnailUrl
        }));
        setInteractiveElements(processedElements);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching interactive elements:', error);
        setError('Failed to load interactive elements');
        setLoading(false);
      });
  }, []);

  const handleElementSelect = (element) => {
    setProp((props) => {
      props.name = element.name;
      props.title = element.title;
      props.description = element.description;
      // Also store the iconUrl to ensure it's available for the component
      props.iconUrl = element.iconUrl || element.thumbnailUrl;
    });
  };

  if (loading) {
    return <div className="p-2 text-gray-500 dark:text-gray-400">Loading interactive elements...</div>;
  }

  if (error) {
    return <div className="p-2 text-red-500">{error}</div>;
  }

  return (
    <div className="interactive-settings">
      {props.name ? (
        <div className="mb-4 p-3 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-md">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-primary/20 dark:bg-primary/30 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-light" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-primary dark:text-primary-light">Currently Selected</span>
          </div>
          <div className="flex items-center p-2 bg-white dark:bg-slate-700 rounded-md border border-gray-200 dark:border-gray-600">
            <img
              src={props.iconUrl || interactiveElements.find(el => el.name === props.name)?.iconUrl}
              alt={props.title}
              className="w-10 h-10 mr-3 object-contain"
            />
            <div>
              <div className="font-medium text-gray-800 dark:text-white">{props.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{props.description}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-yellow-100 dark:bg-yellow-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Please Select an Interactive Element</span>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Choose an interactive element from the list below to add to your content.
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Interactive Elements
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
          {interactiveElements.length > 0 ? (
            interactiveElements.map((element) => (
              <div
                key={element.name}
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 ${
                  props.name === element.name ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40' : 'border border-transparent'
                }`}
                onClick={() => handleElementSelect(element)}
              >
                <img
                  src={element.iconUrl || element.thumbnailUrl}
                  alt={element.title}
                  className="w-10 h-10 mr-3 object-contain"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{element.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{element.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
              No interactive elements available
            </div>
          )}
        </div>
      </div>

      {/* Spacing Settings */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus-visible:ring focus-visible:ring-teal-500 focus-visible:ring-opacity-50"
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <div className="flex items-center">
            <FaCog className="mr-2" />
            <span>Spacing</span>
          </div>
          <svg
            className={`w-5 h-5 transform ${showSpacing ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Element Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Element Margin
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
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
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
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
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
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
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
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
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

      {/* Appearance Settings - Only show if an element is selected */}
      {props.name && (
        <div className="mb-4">
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus-visible:ring focus-visible:ring-teal-500 focus-visible:ring-opacity-50"
            onClick={() => setShowAppearance(!showAppearance)}
          >
            <div className="flex items-center">
              <FaCog className="mr-2" />
              <span>Appearance</span>
            </div>
            <svg
              className={`w-5 h-5 transform ${showAppearance ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showAppearance && (
            <div className="space-y-4 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
              {/* Auto Convert Colors Checkbox */}
              <div className="mb-3 relative">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoConvertColors"
                    checked={autoConvertColors}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setProp((props) => {
                        props.autoConvertColors = isChecked;

                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';

                        // If turning auto-convert on, update all colors
                        if (isChecked) {
                          // Update title text color
                          if (props.titleTextColor && props.titleTextColor[currentTheme]) {
                            const currentColor = props.titleTextColor[currentTheme];
                            props.titleTextColor[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'text');
                          }

                          // Update button color
                          if (props.buttonColor && props.buttonColor[currentTheme]) {
                            const currentColor = props.buttonColor[currentTheme];
                            props.buttonColor[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'button');
                          }

                          // Update primary background color
                          if (props.primaryBackgroundColor && props.primaryBackgroundColor[currentTheme]) {
                            const currentColor = props.primaryBackgroundColor[currentTheme];
                            props.primaryBackgroundColor[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'background');
                          }

                          // Update secondary background color
                          if (props.secondaryBackgroundColor && props.secondaryBackgroundColor[currentTheme]) {
                            const currentColor = props.secondaryBackgroundColor[currentTheme];
                            props.secondaryBackgroundColor[oppositeTheme] = convertToThemeColor(currentColor, !isDark, 'background');
                          }
                        }
                      });
                    }}
                    className="mr-2 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="autoConvertColors" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Auto-convert colors between themes
                  </label>
                </div>
              </div>

              {/* Title Text Color */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Title Text Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                </label>
                <div className="flex items-center">
                  <ColorPicker
                    color={getThemeColor(titleTextColor, isDark, 'text')}
                    onChange={(newColor) => {
                      setProp((props) => {
                        // Ensure titleTextColor has the expected structure
                        if (!props.titleTextColor) {
                          props.titleTextColor = {
                            light: { r: 44, g: 62, b: 80, a: 1 },
                            dark: { r: 241, g: 245, b: 249, a: 1 }
                          };
                        }

                        // Handle legacy format (single RGBA object)
                        if ('r' in props.titleTextColor) {
                          const oldColor = { ...props.titleTextColor };
                          props.titleTextColor = {
                            light: oldColor,
                            dark: convertToThemeColor(oldColor, true, 'text')
                          };
                        }

                        // Ensure both light and dark properties exist
                        if (!props.titleTextColor.light) {
                          props.titleTextColor.light = { r: 44, g: 62, b: 80, a: 1 };
                        }
                        if (!props.titleTextColor.dark) {
                          props.titleTextColor.dark = { r: 241, g: 245, b: 249, a: 1 };
                        }

                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';

                        if (props.autoConvertColors) {
                          // Auto-convert the color for the opposite theme
                          const oppositeColor = convertToThemeColor(newColor, !isDark, 'text');

                          props.titleTextColor = {
                            ...props.titleTextColor,
                            [currentTheme]: newColor,
                            [oppositeTheme]: oppositeColor
                          };
                        } else {
                          // Only update the current theme's color
                          props.titleTextColor = {
                            ...props.titleTextColor,
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
                      Title Text Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={(() => {
                          try {
                            const oppositeTheme = isDark ? 'light' : 'dark';
                            const currentTheme = isDark ? 'dark' : 'light';

                            // Ensure we have a valid color for the opposite theme
                            if (titleTextColor && titleTextColor[oppositeTheme] &&
                                typeof titleTextColor[oppositeTheme].r !== 'undefined' &&
                                typeof titleTextColor[oppositeTheme].g !== 'undefined' &&
                                typeof titleTextColor[oppositeTheme].b !== 'undefined') {
                              return titleTextColor[oppositeTheme];
                            } else if (titleTextColor && titleTextColor[currentTheme]) {
                              // If opposite theme color is missing but current theme exists, convert it
                              return convertToThemeColor(titleTextColor[currentTheme], !isDark, 'text');
                            }
                            // Default fallback colors
                            return !isDark ?
                              { r: 241, g: 245, b: 249, a: 1 } :
                              { r: 44, g: 62, b: 80, a: 1 };
                          } catch (error) {
                            console.warn('Error getting opposite theme color:', error);
                            return !isDark ?
                              { r: 241, g: 245, b: 249, a: 1 } :
                              { r: 44, g: 62, b: 80, a: 1 };
                          }
                        })()}
                        onChange={(newColor) => {
                          setProp((props) => {
                            // Ensure titleTextColor has the expected structure
                            if (!props.titleTextColor) {
                              props.titleTextColor = {
                                light: { r: 44, g: 62, b: 80, a: 1 },
                                dark: { r: 241, g: 245, b: 249, a: 1 }
                              };
                            }

                            // Handle legacy format (single RGBA object)
                            if ('r' in props.titleTextColor) {
                              const oldColor = { ...props.titleTextColor };
                              props.titleTextColor = {
                                light: oldColor,
                                dark: convertToThemeColor(oldColor, true, 'text')
                              };
                            }

                            // Ensure both light and dark properties exist
                            if (!props.titleTextColor.light) {
                              props.titleTextColor.light = { r: 44, g: 62, b: 80, a: 1 };
                            }
                            if (!props.titleTextColor.dark) {
                              props.titleTextColor.dark = { r: 241, g: 245, b: 249, a: 1 };
                            }

                            const oppositeTheme = isDark ? 'light' : 'dark';

                            // Only update the opposite theme's color
                            props.titleTextColor = {
                              ...props.titleTextColor,
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

              {/* Button Color */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Button Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                </label>
                <div className="flex items-center">
                  <ColorPicker
                    color={getThemeColor(buttonColor, isDark, 'button')}
                    onChange={(newColor) => {
                      setProp((props) => {
                        // Ensure buttonColor has the expected structure
                        if (!props.buttonColor) {
                          props.buttonColor = {
                            light: { r: 15, g: 118, b: 110, a: 1 },
                            dark: { r: 20, g: 184, b: 166, a: 1 }
                          };
                        }

                        // Handle legacy format (single RGBA object)
                        if ('r' in props.buttonColor) {
                          const oldColor = { ...props.buttonColor };
                          props.buttonColor = {
                            light: oldColor,
                            dark: convertToThemeColor(oldColor, true, 'button')
                          };
                        }

                        // Ensure both light and dark properties exist
                        if (!props.buttonColor.light) {
                          props.buttonColor.light = { r: 15, g: 118, b: 110, a: 1 };
                        }
                        if (!props.buttonColor.dark) {
                          props.buttonColor.dark = { r: 20, g: 184, b: 166, a: 1 };
                        }

                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';

                        if (props.autoConvertColors) {
                          // Auto-convert the color for the opposite theme
                          const oppositeColor = convertToThemeColor(newColor, !isDark, 'button');

                          props.buttonColor = {
                            ...props.buttonColor,
                            [currentTheme]: newColor,
                            [oppositeTheme]: oppositeColor
                          };
                        } else {
                          // Only update the current theme's color
                          props.buttonColor = {
                            ...props.buttonColor,
                            [currentTheme]: newColor
                          };
                        }
                      });
                    }}
                    componentType="button"
                  />
                </div>

                {!autoConvertColors && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Button Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={(() => {
                          try {
                            const oppositeTheme = isDark ? 'light' : 'dark';
                            const currentTheme = isDark ? 'dark' : 'light';

                            // Ensure we have a valid color for the opposite theme
                            if (buttonColor && buttonColor[oppositeTheme] &&
                                typeof buttonColor[oppositeTheme].r !== 'undefined' &&
                                typeof buttonColor[oppositeTheme].g !== 'undefined' &&
                                typeof buttonColor[oppositeTheme].b !== 'undefined') {
                              return buttonColor[oppositeTheme];
                            } else if (buttonColor && buttonColor[currentTheme]) {
                              // If opposite theme color is missing but current theme exists, convert it
                              return convertToThemeColor(buttonColor[currentTheme], !isDark, 'button');
                            }
                            // Default fallback colors
                            return !isDark ?
                              { r: 20, g: 184, b: 166, a: 1 } :
                              { r: 15, g: 118, b: 110, a: 1 };
                          } catch (error) {
                            console.warn('Error getting opposite theme color:', error);
                            return !isDark ?
                              { r: 20, g: 184, b: 166, a: 1 } :
                              { r: 15, g: 118, b: 110, a: 1 };
                          }
                        })()}
                        onChange={(newColor) => {
                          setProp((props) => {
                            // Ensure buttonColor has the expected structure
                            if (!props.buttonColor) {
                              props.buttonColor = {
                                light: { r: 15, g: 118, b: 110, a: 1 },
                                dark: { r: 20, g: 184, b: 166, a: 1 }
                              };
                            }

                            // Handle legacy format (single RGBA object)
                            if ('r' in props.buttonColor) {
                              const oldColor = { ...props.buttonColor };
                              props.buttonColor = {
                                light: oldColor,
                                dark: convertToThemeColor(oldColor, true, 'button')
                              };
                            }

                            // Ensure both light and dark properties exist
                            if (!props.buttonColor.light) {
                              props.buttonColor.light = { r: 15, g: 118, b: 110, a: 1 };
                            }
                            if (!props.buttonColor.dark) {
                              props.buttonColor.dark = { r: 20, g: 184, b: 166, a: 1 };
                            }

                            const oppositeTheme = isDark ? 'light' : 'dark';

                            // Only update the opposite theme's color
                            props.buttonColor = {
                              ...props.buttonColor,
                              [oppositeTheme]: newColor
                            };
                          });
                        }}
                        componentType="button"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                    </p>
                  </div>
                )}
              </div>

              {/* Primary Background Color */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Primary Background Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                </label>
                <div className="flex items-center">
                  <ColorPicker
                    color={getThemeColor(primaryBackgroundColor, isDark, 'background')}
                    onChange={(newColor) => {
                      setProp((props) => {
                        // Ensure primaryBackgroundColor has the expected structure
                        if (!props.primaryBackgroundColor) {
                          props.primaryBackgroundColor = {
                            light: { r: 248, g: 249, b: 250, a: 1 },
                            dark: { r: 30, g: 41, b: 59, a: 1 }
                          };
                        }

                        // Handle legacy format (single RGBA object)
                        if ('r' in props.primaryBackgroundColor) {
                          const oldColor = { ...props.primaryBackgroundColor };
                          props.primaryBackgroundColor = {
                            light: oldColor,
                            dark: convertToThemeColor(oldColor, true, 'background')
                          };
                        }

                        // Ensure both light and dark properties exist
                        if (!props.primaryBackgroundColor.light) {
                          props.primaryBackgroundColor.light = { r: 248, g: 249, b: 250, a: 1 };
                        }
                        if (!props.primaryBackgroundColor.dark) {
                          props.primaryBackgroundColor.dark = { r: 30, g: 41, b: 59, a: 1 };
                        }

                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';

                        if (props.autoConvertColors) {
                          // Auto-convert the color for the opposite theme
                          const oppositeColor = convertToThemeColor(newColor, !isDark, 'background');

                          props.primaryBackgroundColor = {
                            ...props.primaryBackgroundColor,
                            [currentTheme]: newColor,
                            [oppositeTheme]: oppositeColor
                          };
                        } else {
                          // Only update the current theme's color
                          props.primaryBackgroundColor = {
                            ...props.primaryBackgroundColor,
                            [currentTheme]: newColor
                          };
                        }
                      });
                    }}
                    componentType="background"
                  />
                </div>

                {!autoConvertColors && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Primary Background Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={(() => {
                          try {
                            const oppositeTheme = isDark ? 'light' : 'dark';
                            const currentTheme = isDark ? 'dark' : 'light';

                            // Ensure we have a valid color for the opposite theme
                            if (primaryBackgroundColor && primaryBackgroundColor[oppositeTheme] &&
                                typeof primaryBackgroundColor[oppositeTheme].r !== 'undefined' &&
                                typeof primaryBackgroundColor[oppositeTheme].g !== 'undefined' &&
                                typeof primaryBackgroundColor[oppositeTheme].b !== 'undefined') {
                              return primaryBackgroundColor[oppositeTheme];
                            } else if (primaryBackgroundColor && primaryBackgroundColor[currentTheme]) {
                              // If opposite theme color is missing but current theme exists, convert it
                              return convertToThemeColor(primaryBackgroundColor[currentTheme], !isDark, 'background');
                            }
                            // Default fallback colors
                            return !isDark ?
                              { r: 30, g: 41, b: 59, a: 1 } :
                              { r: 248, g: 249, b: 250, a: 1 };
                          } catch (error) {
                            console.warn('Error getting opposite theme color:', error);
                            return !isDark ?
                              { r: 30, g: 41, b: 59, a: 1 } :
                              { r: 248, g: 249, b: 250, a: 1 };
                          }
                        })()}
                        onChange={(newColor) => {
                          setProp((props) => {
                            // Ensure primaryBackgroundColor has the expected structure
                            if (!props.primaryBackgroundColor) {
                              props.primaryBackgroundColor = {
                                light: { r: 248, g: 249, b: 250, a: 1 },
                                dark: { r: 30, g: 41, b: 59, a: 1 }
                              };
                            }

                            // Handle legacy format (single RGBA object)
                            if ('r' in props.primaryBackgroundColor) {
                              const oldColor = { ...props.primaryBackgroundColor };
                              props.primaryBackgroundColor = {
                                light: oldColor,
                                dark: convertToThemeColor(oldColor, true, 'background')
                              };
                            }

                            // Ensure both light and dark properties exist
                            if (!props.primaryBackgroundColor.light) {
                              props.primaryBackgroundColor.light = { r: 248, g: 249, b: 250, a: 1 };
                            }
                            if (!props.primaryBackgroundColor.dark) {
                              props.primaryBackgroundColor.dark = { r: 30, g: 41, b: 59, a: 1 };
                            }

                            const oppositeTheme = isDark ? 'light' : 'dark';

                            // Only update the opposite theme's color
                            props.primaryBackgroundColor = {
                              ...props.primaryBackgroundColor,
                              [oppositeTheme]: newColor
                            };
                          });
                        }}
                        componentType="background"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Directly edit the {!isDark ? 'dark' : 'light'} mode color without switching themes.
                    </p>
                  </div>
                )}
              </div>

              {/* Secondary Background Color */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Secondary Background Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                </label>
                <div className="flex items-center">
                  <ColorPicker
                    color={getThemeColor(secondaryBackgroundColor, isDark, 'background')}
                    onChange={(newColor) => {
                      setProp((props) => {
                        // Ensure secondaryBackgroundColor has the expected structure
                        if (!props.secondaryBackgroundColor) {
                          props.secondaryBackgroundColor = {
                            light: { r: 255, g: 255, b: 255, a: 1 },
                            dark: { r: 15, g: 23, b: 42, a: 1 }
                          };
                        }

                        // Handle legacy format (single RGBA object)
                        if ('r' in props.secondaryBackgroundColor) {
                          const oldColor = { ...props.secondaryBackgroundColor };
                          props.secondaryBackgroundColor = {
                            light: oldColor,
                            dark: convertToThemeColor(oldColor, true, 'background')
                          };
                        }

                        // Ensure both light and dark properties exist
                        if (!props.secondaryBackgroundColor.light) {
                          props.secondaryBackgroundColor.light = { r: 255, g: 255, b: 255, a: 1 };
                        }
                        if (!props.secondaryBackgroundColor.dark) {
                          props.secondaryBackgroundColor.dark = { r: 15, g: 23, b: 42, a: 1 };
                        }

                        const currentTheme = isDark ? 'dark' : 'light';
                        const oppositeTheme = isDark ? 'light' : 'dark';

                        if (props.autoConvertColors) {
                          // Auto-convert the color for the opposite theme
                          const oppositeColor = convertToThemeColor(newColor, !isDark, 'background');

                          props.secondaryBackgroundColor = {
                            ...props.secondaryBackgroundColor,
                            [currentTheme]: newColor,
                            [oppositeTheme]: oppositeColor
                          };
                        } else {
                          // Only update the current theme's color
                          props.secondaryBackgroundColor = {
                            ...props.secondaryBackgroundColor,
                            [currentTheme]: newColor
                          };
                        }
                      });
                    }}
                    componentType="background"
                  />
                </div>

                {!autoConvertColors && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Secondary Background Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                    </label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={(() => {
                          try {
                            const oppositeTheme = isDark ? 'light' : 'dark';
                            const currentTheme = isDark ? 'dark' : 'light';

                            // Ensure we have a valid color for the opposite theme
                            if (secondaryBackgroundColor && secondaryBackgroundColor[oppositeTheme] &&
                                typeof secondaryBackgroundColor[oppositeTheme].r !== 'undefined' &&
                                typeof secondaryBackgroundColor[oppositeTheme].g !== 'undefined' &&
                                typeof secondaryBackgroundColor[oppositeTheme].b !== 'undefined') {
                              return secondaryBackgroundColor[oppositeTheme];
                            } else if (secondaryBackgroundColor && secondaryBackgroundColor[currentTheme]) {
                              // If opposite theme color is missing but current theme exists, convert it
                              return convertToThemeColor(secondaryBackgroundColor[currentTheme], !isDark, 'background');
                            }
                            // Default fallback colors
                            return !isDark ?
                              { r: 15, g: 23, b: 42, a: 1 } :
                              { r: 255, g: 255, b: 255, a: 1 };
                          } catch (error) {
                            console.warn('Error getting opposite theme color:', error);
                            return !isDark ?
                              { r: 15, g: 23, b: 42, a: 1 } :
                              { r: 255, g: 255, b: 255, a: 1 };
                          }
                        })()}
                        onChange={(newColor) => {
                          setProp((props) => {
                            // Ensure secondaryBackgroundColor has the expected structure
                            if (!props.secondaryBackgroundColor) {
                              props.secondaryBackgroundColor = {
                                light: { r: 255, g: 255, b: 255, a: 1 },
                                dark: { r: 15, g: 23, b: 42, a: 1 }
                              };
                            }

                            // Handle legacy format (single RGBA object)
                            if ('r' in props.secondaryBackgroundColor) {
                              const oldColor = { ...props.secondaryBackgroundColor };
                              props.secondaryBackgroundColor = {
                                light: oldColor,
                                dark: convertToThemeColor(oldColor, true, 'background')
                              };
                            }

                            // Ensure both light and dark properties exist
                            if (!props.secondaryBackgroundColor.light) {
                              props.secondaryBackgroundColor.light = { r: 255, g: 255, b: 255, a: 1 };
                            }
                            if (!props.secondaryBackgroundColor.dark) {
                              props.secondaryBackgroundColor.dark = { r: 15, g: 23, b: 42, a: 1 };
                            }

                            const oppositeTheme = isDark ? 'light' : 'dark';

                            // Only update the opposite theme's color
                            props.secondaryBackgroundColor = {
                              ...props.secondaryBackgroundColor,
                              [oppositeTheme]: newColor
                            };
                          });
                        }}
                        componentType="background"
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
      )}
    </div>
  );
};
