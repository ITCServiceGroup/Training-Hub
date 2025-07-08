import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { ICONS, ICON_CATEGORIES } from '@/components/icons';
import ColorPicker from '../../../../../../../components/common/ColorPicker';

// Helper function to ensure both theme colors exist
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';

  // Ensure iconColor has both themes
  if (props.iconColor) {
    if ('r' in props.iconColor) {
      // Legacy format - convert to theme format
      const oldColor = { ...props.iconColor };
      props.iconColor = {
        light: oldColor,
        dark: convertToThemeColor(oldColor, true, 'icon')
      };
    } else {
      // Ensure both themes exist
      if (!props.iconColor.light) {
        props.iconColor.light = { r: 92, g: 90, b: 90, a: 1 };
      }
      if (!props.iconColor.dark) {
        props.iconColor.dark = { r: 229, g: 231, b: 235, a: 1 };
      }
    }
  }

  return props;
};

export const IconSettings = () => {
  const { actions, id } = useNode((node) => ({
    id: node.id
  }));
  const { actions: editorActions } = useEditor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Toggle sections
  const [showIconSettings, setShowIconSettings] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Local state for icon size input
  const [localIconSize, setLocalIconSize] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    // Use history.ignore to prevent automatic theme color initialization from being tracked in undo history
    // and use the node ID directly to avoid race conditions
    if (id && editorActions) {
      try {
        editorActions.history.ignore().setProp(id, (props) => {
          return ensureThemeColors(props, isDark);
        });
      } catch (error) {
        console.warn('IconSettings: Error initializing theme colors:', error);
      }
    }
  }, [editorActions, id, isDark]);

  const {
    iconName,
    iconColor: iconColorProp,
    iconSize,
    iconAlign,
    margin,
    padding,
    autoConvertColors,
  } = useNode((node) => {
    const props = node.data.props || {};

    return {
      iconName: props.iconName || 'star',
      iconColor: props.iconColor || {
        light: { r: 92, g: 90, b: 90, a: 1 },
        dark: { r: 229, g: 231, b: 235, a: 1 }
      },
      iconSize: props.iconSize || 24,
      iconAlign: props.iconAlign || 'center',
      margin: props.margin || ['0', '0', '0', '0'],
      padding: props.padding || ['0', '0', '0', '0'],
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true,
    };
  });

  // Sync local icon size with component state
  useEffect(() => {
    setLocalIconSize(iconSize.toString());
  }, [iconSize]);

  // Handle icon size input commit (Enter, Tab, or blur)
  const handleIconSizeCommit = () => {
    const value = parseInt(localIconSize, 10);
    if (!isNaN(value)) {
      // Clamp the value between 8 and 1000
      const clampedValue = Math.max(8, Math.min(1000, value));
      actions.setProp((props) => {
        props.iconSize = clampedValue;
      });
      setLocalIconSize(clampedValue.toString());
    } else {
      // Reset to current value if invalid
      setLocalIconSize(iconSize.toString());
    }
  };

  // Get all icons organized by category for the selector
  const iconsByCategory = Object.entries(ICON_CATEGORIES).map(([category, icons]) => ({
    category,
    icons: Object.entries(icons).map(([key, name]) => ({ key, name }))
  }));

  // Filter icons based on search term
  const filteredIconsByCategory = searchTerm.trim() === ''
    ? iconsByCategory
    : iconsByCategory.map(({ category, icons }) => ({
        category,
        icons: icons.filter(({ key, name }) =>
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(({ icons }) => icons.length > 0);

  return (
    <div className="icon-settings">
      {/* Icon Settings Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showIconSettings ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowIconSettings(!showIconSettings)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Icon Settings
          </label>
          <FaChevronDown
            className={`transition-transform ${showIconSettings ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showIconSettings && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Icon Selector */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Icon
              </label>
              <button
                className="w-full p-2 border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-gray-700 dark:text-white rounded-md text-left flex items-center justify-between"
                onClick={() => {
                  const newState = !showIconSelector;
                  setShowIconSelector(newState);
                  // Clear search when closing the selector
                  if (!newState) {
                    setSearchTerm('');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {ICONS[iconName] && React.createElement(ICONS[iconName], { size: 16 })}
                  <span>{ICON_CATEGORIES[Object.keys(ICON_CATEGORIES).find(cat => 
                    ICON_CATEGORIES[cat][iconName]
                  )]?.[iconName] || iconName}</span>
                </div>
                <FaChevronDown className={`transition-transform ${showIconSelector ? 'rotate-180' : ''}`} size={12} />
              </button>

              {showIconSelector && (
                <div className="mt-2 border border-gray-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-600">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-200 dark:border-slate-500">
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-slate-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm.trim() !== '' && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {(() => {
                          const totalIcons = filteredIconsByCategory.reduce((sum, { icons }) => sum + icons.length, 0);
                          return `${totalIcons} icon${totalIcons !== 1 ? 's' : ''} found`;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Icon Grid */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredIconsByCategory.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No icons found matching "{searchTerm}"
                      </div>
                    ) : (
                      filteredIconsByCategory.map(({ category, icons }) => (
                    <div key={category} className="border-b border-gray-200 dark:border-slate-500 last:border-b-0">
                      <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </div>
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {icons.map(({ key, name }) => (
                          <button
                            key={key}
                            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-500 flex items-center justify-center ${
                              iconName === key ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                            onClick={() => {
                              actions.setProp((props) => {
                                props.iconName = key;
                              });
                              setShowIconSelector(false);
                              setSearchTerm(''); // Clear search when icon is selected
                            }}
                            title={name}
                          >
                            {ICONS[key] && React.createElement(ICONS[key], { size: 16 })}
                          </button>
                        ))}
                      </div>
                    </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auto Convert Colors Toggle */}
            <div className="mb-3 relative">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConvertColorsIcon"
                  checked={autoConvertColors}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    actions.setProp((props) => {
                      props.autoConvertColors = isChecked;

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      // If turning auto-convert on, update all colors
                      if (isChecked) {
                        // Update icon color
                        if (props.iconColor && props.iconColor[currentTheme]) {
                          const currentIconColor = props.iconColor[currentTheme];
                          props.iconColor[oppositeTheme] = convertToThemeColor(currentIconColor, !isDark, 'icon');
                        }
                      } else {
                        // When turning auto-convert off, ensure both theme colors exist
                        return ensureThemeColors(props, isDark);
                      }

                      return props;
                    });
                  }}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="autoConvertColorsIcon" className="text-xs text-gray-700 dark:text-gray-300 mr-1">
                  Auto convert colors between light and dark mode
                </label>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex-shrink-0"
                  onClick={() => setShowTooltip(!showTooltip)}
                  type="button"
                >
                  <FaQuestionCircle size={12} />
                </button>
                {showTooltip && (
                  <div className="absolute z-10 right-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded shadow-lg text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    When enabled, colors will automatically be converted between light and dark mode.
                  </div>
                )}
              </div>
            </div>

            {/* Icon Color */}
            <div className="mb-3">
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
                          return iconColorProp[oppositeTheme] || { r: 92, g: 90, b: 90, a: 1 };
                        } catch (e) {
                          return { r: 92, g: 90, b: 90, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const oppositeTheme = isDark ? 'light' : 'dark';

                          // Ensure iconColor has the expected structure
                          if (!props.iconColor) {
                            props.iconColor = {
                              light: { r: 92, g: 90, b: 90, a: 1 },
                              dark: { r: 229, g: 231, b: 235, a: 1 }
                            };
                          }

                          props.iconColor = {
                            ...props.iconColor,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                      componentType="icon"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Icon Size */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Size (pixels) - Range: 8-1000
              </label>
              <input
                type="text"
                value={localIconSize}
                onChange={(e) => {
                  // Allow any input during typing
                  setLocalIconSize(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    handleIconSizeCommit();
                  }
                }}
                onBlur={handleIconSizeCommit}
                className="w-full p-2 border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-gray-700 dark:text-white rounded-md"
                placeholder="24"
              />
            </div>

            {/* Icon Alignment */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Alignment
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-3 py-1 text-xs rounded ${
                    iconAlign === 'left'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    actions.setProp((props) => {
                      props.iconAlign = 'left';
                    });
                  }}
                >
                  Left
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded ${
                    iconAlign === 'center'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    actions.setProp((props) => {
                      props.iconAlign = 'center';
                    });
                  }}
                >
                  Center
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded ${
                    iconAlign === 'right'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => {
                    actions.setProp((props) => {
                      props.iconAlign = 'right';
                    });
                  }}
                >
                  Right
                </button>
              </div>
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
            {/* Icon Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Icon Margin
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
                    min={0}
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
                    min={0}
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
                    min={0}
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

            {/* Icon Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Icon Padding
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
