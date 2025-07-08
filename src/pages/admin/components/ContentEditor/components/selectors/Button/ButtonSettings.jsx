import { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';
import StudyGuideSelector from './StudyGuideSelector';

// Helper function to ensure both theme colors exist
const ensureThemeColors = (props, isDark) => {
  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';

  // Ensure background has both themes
  if (props.background && 'r' in props.background) {
    const oldColor = { ...props.background };
    props.background = {
      [currentTheme]: oldColor,
      [oppositeTheme]: convertToThemeColor(oldColor, !isDark, 'button')
    };
  }

  // Ensure color has both themes
  if (props.color && 'r' in props.color) {
    const oldColor = { ...props.color };
    props.color = {
      [currentTheme]: oldColor,
      [oppositeTheme]: convertToThemeColor(oldColor, !isDark, 'text')
    };
  }

  // Ensure hoverBackground has both themes
  if (props.hoverBackground && 'r' in props.hoverBackground) {
    const oldColor = { ...props.hoverBackground };
    props.hoverBackground = {
      [currentTheme]: oldColor,
      [oppositeTheme]: convertToThemeColor(oldColor, !isDark, 'button')
    };
  }

  // Ensure hoverColor has both themes
  if (props.hoverColor && 'r' in props.hoverColor) {
    const oldColor = { ...props.hoverColor };
    props.hoverColor = {
      [currentTheme]: oldColor,
      [oppositeTheme]: convertToThemeColor(oldColor, !isDark, 'text')
    };
  }

  return props;
};

export const ButtonSettings = () => {
  const { actions, id } = useNode((node) => ({
    id: node.id
  }));
  const { actions: editorActions } = useEditor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Toggle sections
  const [showButtonContent, setShowButtonContent] = useState(true);
  const [showButtonStyle, setShowButtonStyle] = useState(true);
  const [showButtonSpacing, setShowButtonSpacing] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isStudyGuideSelectorOpen, setIsStudyGuideSelectorOpen] = useState(false);

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
        console.warn('ButtonSettings: Error initializing theme colors:', error);
      }
    }
  }, [editorActions, id, isDark]);

  const {
    text,
    fontSize,
    fontWeight,
    buttonStyle,
    radius,
    padding,
    margin,
    background,
    color,
    borderWidth,
    hoverBackground,
    hoverColor,
    size,
    autoConvertColors,
    linkType,
    linkUrl,
    linkStudyGuideId,
    linkStudyGuideTitle,
    linkStudyGuideSectionId,
    linkStudyGuideCategoryId,
    openInNewTab
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      text: props.text || 'Click Me',
      fontSize: props.fontSize || 16,
      fontWeight: props.fontWeight || '500',
      buttonStyle: props.buttonStyle || 'filled',
      radius: props.radius || 4,
      padding: props.padding || ['10', '16', '10', '16'],
      margin: props.margin || ['0', '0', '0', '0'],
      background: props.background || {
        light: { r: 13, g: 148, b: 136, a: 1 },
        dark: { r: 56, g: 189, b: 248, a: 1 }
      },
      color: props.color || {
        light: { r: 255, g: 255, b: 255, a: 1 },
        dark: { r: 255, g: 255, b: 255, a: 1 }
      },
      borderWidth: props.borderWidth || 2,
      hoverBackground: props.hoverBackground || {
        light: { r: 11, g: 133, b: 122, a: 1 },
        dark: { r: 45, g: 178, b: 237, a: 1 }
      },
      hoverColor: props.hoverColor || {
        light: { r: 255, g: 255, b: 255, a: 1 },
        dark: { r: 255, g: 255, b: 255, a: 1 }
      },
      size: props.size || 'medium',
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true,
      linkType: props.linkType || 'none',
      linkUrl: props.linkUrl || '',
      linkStudyGuideId: props.linkStudyGuideId || '',
      linkStudyGuideTitle: props.linkStudyGuideTitle || '',
      linkStudyGuideSectionId: props.linkStudyGuideSectionId || '',
      linkStudyGuideCategoryId: props.linkStudyGuideCategoryId || '',
      openInNewTab: props.openInNewTab !== undefined ? props.openInNewTab : true
    };
  });

  // This function will be removed as we'll use ColorPicker's onChange directly

  return (
    <div className="button-settings">
      {/* Button Content Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showButtonContent ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowButtonContent(!showButtonContent)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Button Content
          </label>
          <FaChevronDown
            className={`transition-transform ${showButtonContent ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showButtonContent && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => actions.setProp((props) => { props.text = e.target.value; })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Size
          </label>
          <div className="flex space-x-1">
            <button
              className={`px-2 py-1 text-xs rounded ${
                size === 'small'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'small'; })}
            >
              Small
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                size === 'medium'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'medium'; })}
            >
              Medium
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                size === 'large'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'large'; })}
            >
              Large
            </button>
          </div>
        </div>
            {/* Font Size */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Font Size
              </label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={fontSize}
                    onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
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
                        actions.setProp((props) => {
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
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Font Weight
          </label>
          <div className="flex space-x-1">
            <button
              className={`px-2 py-1 text-xs rounded ${
                fontWeight === '400'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.fontWeight = '400'; })}
            >
              Regular
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                fontWeight === '500'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.fontWeight = '500'; })}
            >
              Medium
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                fontWeight === '700'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.fontWeight = '700'; })}
            >
              Bold
            </button>
          </div>
        </div>

            {/* Link Settings */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Button Link
              </label>
              <div className="space-y-2">
                {/* Link Type Selection */}
                <div className="flex space-x-1">
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      linkType === 'none'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => { props.linkType = 'none'; })}
                  >
                    No Link
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      linkType === 'url'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => { props.linkType = 'url'; })}
                  >
                    URL
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      linkType === 'study-guide'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => { props.linkType = 'study-guide'; })}
                  >
                    Study Guide
                  </button>
                </div>

                {/* URL Input */}
                {linkType === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => actions.setProp((props) => { props.linkUrl = e.target.value; })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="openInNewTab"
                        checked={openInNewTab}
                        onChange={(e) => actions.setProp((props) => { props.openInNewTab = e.target.checked; })}
                        className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                      />
                      <label htmlFor="openInNewTab" className="text-xs text-gray-700 dark:text-gray-300">
                        Open in new tab
                      </label>
                    </div>
                  </div>
                )}

                {/* Study Guide Selection */}
                {linkType === 'study-guide' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsStudyGuideSelectorOpen(true)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-left"
                    >
                      {linkStudyGuideTitle || 'Select Study Guide...'}
                    </button>
                    {linkStudyGuideTitle && (
                      <button
                        onClick={() => actions.setProp((props) => {
                          props.linkStudyGuideId = '';
                          props.linkStudyGuideTitle = '';
                        })}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showButtonStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowButtonStyle(!showButtonStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Button Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showButtonStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showButtonStyle && (
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
                      props.autoConvertColors = isChecked;

                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      // If turning auto-convert on, update all colors
                      if (isChecked) {
                        // Update background color
                        if (props.background && props.background[currentTheme]) {
                          const currentBgColor = props.background[currentTheme];
                          props.background[oppositeTheme] = convertToThemeColor(currentBgColor, !isDark, 'button');
                        }

                        // Update text color
                        if (props.color && props.color[currentTheme]) {
                          const currentTextColor = props.color[currentTheme];
                          props.color[oppositeTheme] = convertToThemeColor(currentTextColor, !isDark, 'text');
                        }

                        // Update hover background color
                        if (props.hoverBackground && props.hoverBackground[currentTheme]) {
                          const currentHoverBgColor = props.hoverBackground[currentTheme];
                          props.hoverBackground[oppositeTheme] = convertToThemeColor(currentHoverBgColor, !isDark, 'button');
                        }

                        // Update hover text color
                        if (props.hoverColor && props.hoverColor[currentTheme]) {
                          const currentHoverTextColor = props.hoverColor[currentTheme];
                          props.hoverColor[oppositeTheme] = convertToThemeColor(currentHoverTextColor, !isDark, 'text');
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
                <label htmlFor="autoConvertColors" className="text-xs text-gray-700 dark:text-gray-300 mr-1">
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
                    When disabled, you can set different colors for each mode.
                    <div className="absolute inset-0 bg-transparent" onClick={() => setShowTooltip(false)}></div>
                  </div>
                )}
              </div>
            </div>
            {/* Button Style */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Button Style
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    buttonStyle === 'filled'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.buttonStyle = 'filled'; })}
                >
                  Filled
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    buttonStyle === 'outline'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.buttonStyle = 'outline'; })}
                >
                  Outline
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    buttonStyle === 'text'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.buttonStyle = 'text'; })}
                >
                  Text
                </button>
              </div>
            </div>

            {/* Border Width (only for outline style) */}
            {buttonStyle === 'outline' && (
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Border Width
                </label>
                <div className="flex items-center">
                  <div className="w-3/4 flex items-center">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={borderWidth}
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
            )}

            {/* Border Radius */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Border Radius
              </label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={radius}
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
                        actions.setProp((props) => {
                          props.radius = value;
                        });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Border radius in pixels"
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(background, isDark, 'button')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'button');

                        props.background = {
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update current theme
                        props.background = {
                          ...props.background,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
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
                          return background[oppositeTheme] || { r: 13, g: 148, b: 136, a: 1 };
                        } catch (e) {
                          return { r: 13, g: 148, b: 136, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          props.background = {
                            ...props.background,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Text Color */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Text Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(color, isDark, 'button')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'text');

                        props.color = {
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update current theme
                        props.color = {
                          ...props.color,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
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
                          return color[oppositeTheme] || { r: 255, g: 255, b: 255, a: 1 };
                        } catch (e) {
                          return { r: 255, g: 255, b: 255, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          props.color = {
                            ...props.color,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hover Background Color */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Hover Background {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(hoverBackground, isDark, 'button')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'button');

                        props.hoverBackground = {
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update current theme
                        props.hoverBackground = {
                          ...props.hoverBackground,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
                />
              </div>

              {!autoConvertColors && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Hover Background {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          return hoverBackground[oppositeTheme] || { r: 11, g: 133, b: 122, a: 1 };
                        } catch (e) {
                          return { r: 11, g: 133, b: 122, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          props.hoverBackground = {
                            ...props.hoverBackground,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hover Text Color */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Hover Text Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(hoverColor, isDark, 'button')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      const currentTheme = isDark ? 'dark' : 'light';
                      const oppositeTheme = isDark ? 'light' : 'dark';

                      if (props.autoConvertColors) {
                        // Auto-convert the color for the opposite theme
                        const oppositeColor = convertToThemeColor(newColor, !isDark, 'text');

                        props.hoverColor = {
                          [currentTheme]: newColor,
                          [oppositeTheme]: oppositeColor
                        };
                      } else {
                        // Only update current theme
                        props.hoverColor = {
                          ...props.hoverColor,
                          [currentTheme]: newColor
                        };
                      }
                    });
                  }}
                />
              </div>

              {!autoConvertColors && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Hover Text Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={(() => {
                        try {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          return hoverColor[oppositeTheme] || { r: 255, g: 255, b: 255, a: 1 };
                        } catch (e) {
                          return { r: 255, g: 255, b: 255, a: 1 };
                        }
                      })()}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          const oppositeTheme = isDark ? 'light' : 'dark';
                          props.hoverColor = {
                            ...props.hoverColor,
                            [oppositeTheme]: newColor
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Button Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showButtonSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowButtonSpacing(!showButtonSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Button Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showButtonSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showButtonSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Button Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Button Margin
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

            {/* Button Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Button Padding
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

      {/* Study Guide Selector Modal */}
      <StudyGuideSelector
        isOpen={isStudyGuideSelectorOpen}
        onClose={() => setIsStudyGuideSelectorOpen(false)}
        currentSelection={{
          studyGuideId: linkStudyGuideId,
          sectionId: linkStudyGuideSectionId,
          categoryId: linkStudyGuideCategoryId,
          title: linkStudyGuideTitle
        }}
        onSelect={(selectedGuide) => {
          actions.setProp((props) => {
            props.linkStudyGuideId = selectedGuide.id;
            props.linkStudyGuideTitle = selectedGuide.title;
            // Store additional metadata for URL construction
            props.linkStudyGuideSectionId = selectedGuide.sectionId;
            props.linkStudyGuideCategoryId = selectedGuide.categoryId;
          });
          setIsStudyGuideSelectorOpen(false);
        }}
      />
    </div>
  );
};
