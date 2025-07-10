import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import ColorPicker from '../../../../../../../components/common/ColorPicker';
import { FaChevronDown } from 'react-icons/fa';

export const HorizontalLineSettings = () => {
  const { actions } = useNode((node) => ({
    props: node.data.props
  }));

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Collapsible sections state
  const [showAppearance, setShowAppearance] = useState(true);
  const [showSpacing, setShowSpacing] = useState(false);

  const {
    width,
    thickness,
    color: colorProp,
    margin,
    alignment,
    autoConvertColors
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      width: props.width || 'auto',
      thickness: props.thickness || 2,
      color: props.color || {
        light: { r: 156, g: 163, b: 175, a: 1 },
        dark: { r: 107, g: 114, b: 128, a: 1 }
      },
      margin: props.margin || ['10', '0', '10', '0'],
      alignment: props.alignment || 'center',
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true
    };
  });

  return (
    <div className="horizontal-line-settings">
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
          <div className="px-2 py-3 bg-white dark:bg-slate-700">
            {/* Width */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Line Width
              </label>
              <div className="flex space-x-1 mb-2">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    width === 'auto'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.width = 'auto'; })}
                >
                  Full Width
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    width !== 'auto'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.width = 200; })}
                >
                  Custom
                </button>
              </div>
              {width !== 'auto' && (
                <div className="flex items-center">
                  <input
                    type="range"
                    min={50}
                    max={800}
                    value={width}
                    onChange={(e) => {
                      actions.setProp((props) => {
                        props.width = parseInt(e.target.value, 10);
                      });
                    }}
                    className="flex-1 mr-2"
                  />
                  <input
                    type="number"
                    min={50}
                    max={800}
                    value={width}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        actions.setProp((props) => {
                          props.width = value;
                        });
                      }
                    }}
                    className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">px</span>
                </div>
              )}
            </div>

            {/* Thickness */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Thickness (px)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={thickness}
                  onChange={(e) => {
                    actions.setProp((props) => {
                      props.thickness = parseInt(e.target.value, 10);
                    });
                  }}
                  className="flex-1 mr-2"
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={thickness}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      actions.setProp((props) => {
                        props.thickness = value;
                      });
                    }
                  }}
                  className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center"
                />
              </div>
            </div>

            {/* Color */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
              </label>
              <div className="flex items-center">
                <ColorPicker
                  color={getThemeColor(colorProp, isDark, 'line')}
                  onChange={(newColor) => {
                    actions.setProp((props) => {
                      // Ensure color has the expected structure
                      if (!props.color) {
                        props.color = {
                          light: { r: 156, g: 163, b: 175, a: 1 },
                          dark: { r: 107, g: 114, b: 128, a: 1 }
                        };
                      }

                      // Handle legacy format (single RGBA object)
                      if ('r' in props.color) {
                        const oldColor = { ...props.color };
                        props.color = {
                          light: oldColor,
                          dark: convertToThemeColor(oldColor, true, 'line')
                        };
                      }

                      // Update the appropriate theme color
                      if (isDark) {
                        props.color.dark = newColor;
                      } else {
                        props.color.light = newColor;
                      }
                    });
                  }}
                />
              </div>
            </div>



            {/* Alignment */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Alignment
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'left'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'left'; })}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'center'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'center'; })}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'right'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'right'; })}
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
          <div className="px-2 py-3 bg-white dark:bg-slate-700">
            {/* Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                Margin (Top, Right, Bottom, Left)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div key={side}>
                    <input
                      type="number"
                      min={0}
                      value={margin[index]}
                      onChange={(e) => {
                        const value = e.target.value;
                        actions.setProp((props) => {
                          props.margin[index] = value;
                        });
                      }}
                      className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center"
                      placeholder={side.charAt(0)}
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
