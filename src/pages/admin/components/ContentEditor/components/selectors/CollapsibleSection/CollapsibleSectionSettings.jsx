import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown } from 'react-icons/fa';

export const CollapsibleSectionSettings = () => {
  // State for collapsible sections
  const [showContent, setShowContent] = useState(true);
  const [showAppearance, setShowAppearance] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);

  const { actions } = useNode((node) => ({
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
      background: props.background || { r: 255, g: 255, b: 255, a: 1 },
      color: props.color || { r: 51, g: 51, b: 51, a: 1 },
      padding: props.padding || ['0', '0', '0', '0'],
      margin: props.margin || ['0', '0', '0', '0'],
      radius: props.radius || 0,
      shadow: shadowValue || {
        enabled: false,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      },
      border: props.border || { style: 'none', width: 1, color: { r: 0, g: 0, b: 0, a: 1 } },
      width: props.width || '100%',
      height: props.height || 'auto',
      title: props.title || 'Collapsible Section',
      stepsEnabled: props.stepsEnabled || false,
      numberOfSteps: props.numberOfSteps || 1,
      headerBackground: props.headerBackground || { r: 245, g: 247, b: 250, a: 1 },
      headerTextColor: props.headerTextColor || { r: 0, g: 0, b: 0, a: 1 },
      headerFontSize: props.headerFontSize || 16
    };
  });

  const handleColorChange = (colorKey, newColor) => {
    actions.setProp((props) => {
      props[colorKey] = {
        ...props[colorKey],
        r: parseInt(newColor.substring(1, 3), 16),
        g: parseInt(newColor.substring(3, 5), 16),
        b: parseInt(newColor.substring(5, 7), 16)
      };
    });
  };

  const handleOpacityChange = (colorKey, opacity) => {
    actions.setProp((props) => {
      props[colorKey] = { ...props[colorKey], a: opacity };
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
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Content Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(background.r).toString(16).padStart(2, '0')}${Math.round(background.g).toString(16).padStart(2, '0')}${Math.round(background.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={background.a}
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
                  value={`#${Math.round(headerBackground.r).toString(16).padStart(2, '0')}${Math.round(headerBackground.g).toString(16).padStart(2, '0')}${Math.round(headerBackground.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('headerBackground', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={headerBackground.a}
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
                  value={`#${Math.round(headerTextColor.r).toString(16).padStart(2, '0')}${Math.round(headerTextColor.g).toString(16).padStart(2, '0')}${Math.round(headerTextColor.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('headerTextColor', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={headerTextColor.a}
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Content Text Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(color.r).toString(16).padStart(2, '0')}${Math.round(color.g).toString(16).padStart(2, '0')}${Math.round(color.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('color', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={color.a}
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
                      value={`#${Math.round(border.color.r).toString(16).padStart(2, '0')}${Math.round(border.color.g).toString(16).padStart(2, '0')}${Math.round(border.color.b).toString(16).padStart(2, '0')}`}
                      onChange={(e) => {
                        const hex = e.target.value.substring(1);
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        actions.setProp((props) => {
                          props.border = { ...props.border, color: { ...props.border.color, r, g, b } };
                        });
                      }}
                      className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={border.color.a}
                      onChange={(e) => actions.setProp((props) => {
                        props.border = {
                          ...props.border,
                          color: { ...props.border.color, a: parseFloat(e.target.value) }
                        };
                      })}
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
                        value={`#${Math.round((shadow.color?.r || 0)).toString(16).padStart(2, '0')}${Math.round((shadow.color?.g || 0)).toString(16).padStart(2, '0')}${Math.round((shadow.color?.b || 0)).toString(16).padStart(2, '0')}`}
                        onChange={(e) => {
                          const hex = e.target.value.substring(1);
                          actions.setProp((props) => {
                            if (typeof props.shadow === 'number') {
                              props.shadow = {
                                enabled: true,
                                x: 0,
                                y: 4,
                                blur: 8,
                                spread: 0,
                                color: {
                                  r: parseInt(hex.substring(0, 2), 16),
                                  g: parseInt(hex.substring(2, 4), 16),
                                  b: parseInt(hex.substring(4, 6), 16),
                                  a: 0.15
                                }
                              };
                            } else if (!props.shadow.color) {
                              props.shadow.color = {
                                r: parseInt(hex.substring(0, 2), 16),
                                g: parseInt(hex.substring(2, 4), 16),
                                b: parseInt(hex.substring(4, 6), 16),
                                a: 0.15
                              };
                            } else {
                              props.shadow.color.r = parseInt(hex.substring(0, 2), 16);
                              props.shadow.color.g = parseInt(hex.substring(2, 4), 16);
                              props.shadow.color.b = parseInt(hex.substring(4, 6), 16);
                            }
                          });
                        }}
                        className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={shadow.color?.a || 0.15}
                        onChange={(e) => actions.setProp((props) => {
                          const opacity = parseFloat(e.target.value);
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: 4,
                              blur: 8,
                              spread: 0,
                              color: { r: 0, g: 0, b: 0, a: opacity }
                            };
                          } else if (!props.shadow.color) {
                            props.shadow.color = { r: 0, g: 0, b: 0, a: opacity };
                          } else {
                            props.shadow.color.a = opacity;
                          }
                        })}
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
