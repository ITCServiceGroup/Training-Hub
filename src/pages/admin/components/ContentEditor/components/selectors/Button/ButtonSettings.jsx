import React from 'react';
import { useNode } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

export const ButtonSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    size
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
      size: props.size || 'medium'
    };
  });

  const handleColorChange = (colorKey, newColor) => {
    const r = parseInt(newColor.substring(1, 3), 16);
    const g = parseInt(newColor.substring(3, 5), 16);
    const b = parseInt(newColor.substring(5, 7), 16);
    
    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';
      
      // Create the new color for the current theme
      const newThemeColor = { r, g, b, a: props[colorKey][currentTheme].a };
      // Generate the opposite theme color
      const oppositeColor = convertToThemeColor(newThemeColor, !isDark);
      
      // Update both theme colors
      props[colorKey] = {
        [currentTheme]: newThemeColor,
        [oppositeTheme]: oppositeColor
      };
    });
  };

  const handleOpacityChange = (colorKey, opacity) => {
    actions.setProp((props) => {
      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';
      
      // Create the new color for the current theme
      const newThemeColor = { ...props[colorKey][currentTheme], a: opacity };
      // Generate the opposite theme color
      const oppositeColor = convertToThemeColor(newThemeColor, !isDark);
      
      // Update both theme colors
      props[colorKey] = {
        [currentTheme]: newThemeColor,
        [oppositeTheme]: oppositeColor
      };
    });
  };

  return (
    <div className="button-settings">
      {/* Content Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content
        </label>
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
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'small'; })}
            >
              Small
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                size === 'medium'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'medium'; })}
            >
              Medium
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                size === 'large'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.size = 'large'; })}
            >
              Large
            </button>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Font Size
          </label>
          <div className="flex items-center">
            <input
              type="range"
              value={fontSize}
              min={10}
              max={40}
              onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
              className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{fontSize}px</span>
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
      </div>

      {/* Style Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Style
        </label>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Button Style
          </label>
          <div className="flex space-x-1">
            <button
              className={`px-2 py-1 text-xs rounded ${
                buttonStyle === 'filled'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.buttonStyle = 'filled'; })}
            >
              Filled
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                buttonStyle === 'outline'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.buttonStyle = 'outline'; })}
            >
              Outline
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                buttonStyle === 'text'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
              }`}
              onClick={() => actions.setProp((props) => { props.buttonStyle = 'text'; })}
            >
              Text
            </button>
          </div>
        </div>

        {buttonStyle === 'outline' && (
          <div className="mb-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Border Width
            </label>
            <div className="flex items-center">
              <input
                type="range"
                value={borderWidth}
                min={1}
                max={10}
                onChange={(e) => actions.setProp((props) => { props.borderWidth = parseInt(e.target.value); })}
                className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{borderWidth}px</span>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Border Radius
          </label>
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

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Default Colors
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(getThemeColor(background, isDark, 'button').r).toString(16).padStart(2, '0')}${Math.round(getThemeColor(background, isDark, 'button').g).toString(16).padStart(2, '0')}${Math.round(getThemeColor(background, isDark, 'button').b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getThemeColor(background, isDark, 'button').a}
                  onChange={(e) => handleOpacityChange('background', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Text</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(getThemeColor(color, isDark, 'button').r).toString(16).padStart(2, '0')}${Math.round(getThemeColor(color, isDark, 'button').g).toString(16).padStart(2, '0')}${Math.round(getThemeColor(color, isDark, 'button').b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('color', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getThemeColor(color, isDark, 'button').a}
                  onChange={(e) => handleOpacityChange('color', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Hover Colors
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(getThemeColor(hoverBackground, isDark, 'button').r).toString(16).padStart(2, '0')}${Math.round(getThemeColor(hoverBackground, isDark, 'button').g).toString(16).padStart(2, '0')}${Math.round(getThemeColor(hoverBackground, isDark, 'button').b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('hoverBackground', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getThemeColor(hoverBackground, isDark, 'button').a}
                  onChange={(e) => handleOpacityChange('hoverBackground', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Text</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(getThemeColor(hoverColor, isDark, 'button').r).toString(16).padStart(2, '0')}${Math.round(getThemeColor(hoverColor, isDark, 'button').g).toString(16).padStart(2, '0')}${Math.round(getThemeColor(hoverColor, isDark, 'button').b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('hoverColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={getThemeColor(hoverColor, isDark, 'button').a}
                  onChange={(e) => handleOpacityChange('hoverColor', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Spacing
        </label>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Padding
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Top</label>
              <input
                type="number"
                value={padding[0]}
                onChange={(e) => {
                  const newPadding = [...padding];
                  newPadding[0] = e.target.value;
                  actions.setProp((props) => { props.padding = newPadding; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Right</label>
              <input
                type="number"
                value={padding[1]}
                onChange={(e) => {
                  const newPadding = [...padding];
                  newPadding[1] = e.target.value;
                  actions.setProp((props) => { props.padding = newPadding; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Bottom</label>
              <input
                type="number"
                value={padding[2]}
                onChange={(e) => {
                  const newPadding = [...padding];
                  newPadding[2] = e.target.value;
                  actions.setProp((props) => { props.padding = newPadding; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Left</label>
              <input
                type="number"
                value={padding[3]}
                onChange={(e) => {
                  const newPadding = [...padding];
                  newPadding[3] = e.target.value;
                  actions.setProp((props) => { props.padding = newPadding; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Margin
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Top</label>
              <input
                type="number"
                value={margin[0]}
                onChange={(e) => {
                  const newMargin = [...margin];
                  newMargin[0] = e.target.value;
                  actions.setProp((props) => { props.margin = newMargin; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Right</label>
              <input
                type="number"
                value={margin[1]}
                onChange={(e) => {
                  const newMargin = [...margin];
                  newMargin[1] = e.target.value;
                  actions.setProp((props) => { props.margin = newMargin; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Bottom</label>
              <input
                type="number"
                value={margin[2]}
                onChange={(e) => {
                  const newMargin = [...margin];
                  newMargin[2] = e.target.value;
                  actions.setProp((props) => { props.margin = newMargin; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Left</label>
              <input
                type="number"
                value={margin[3]}
                onChange={(e) => {
                  const newMargin = [...margin];
                  newMargin[3] = e.target.value;
                  actions.setProp((props) => { props.margin = newMargin; });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
