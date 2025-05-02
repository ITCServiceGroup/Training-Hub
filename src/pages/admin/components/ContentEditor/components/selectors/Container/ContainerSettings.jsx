import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown } from 'react-icons/fa';

export const ContainerSettings = () => {
  const { actions } = useNode((node) => ({
    selected: node.id,
  }));

  // Toggle sections
  const [showStructure, setShowStructure] = useState(true);
  const [showStyle, setShowStyle] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);

  const {
    background,
    padding,
    margin,
    flexDirection,
    alignItems,
    justifyContent,
    radius,
    shadow,
    width,
    height,
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
      padding: props.padding || ['0', '0', '0', '0'],
      margin: props.margin || ['0', '0', '0', '0'],
      flexDirection: props.flexDirection || 'column',
      alignItems: props.alignItems || 'flex-start',
      justifyContent: props.justifyContent || 'flex-start',
      radius: props.radius || 0,
      shadow: shadowValue || {
        enabled: false,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      },
      width: props.width || '100%',
      height: props.height || 'auto',
    };
  });

  return (
    <div className="text-settings">
      {/* Container Structure Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showStructure ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowStructure(!showStructure)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Structure
          </label>
          <FaChevronDown
            className={`transition-transform ${showStructure ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showStructure && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Dimensions */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Dimensions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (%)</label>
                  <input
                    type="number"
                    value={width ? width.replace('%', '') : '100'}
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
                    placeholder="100"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                  <input
                    type="number"
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
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Layout Controls */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Layout</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Direction</label>
                  <div className="flex space-x-1">
                    <button
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        flexDirection === 'row'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => actions.setProp((props) => { props.flexDirection = 'row'; })}
                      title="Arrange items horizontally in a row"
                    >
                      Horizontal
                    </button>
                    <button
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        flexDirection === 'column'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      }`}
                      onClick={() => actions.setProp((props) => { props.flexDirection = 'column'; })}
                      title="Stack items vertically in a column"
                    >
                      Vertical
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {flexDirection === 'column' ? 'Horizontal Alignment' : 'Vertical Alignment'}
                    <span className="ml-1 text-gray-400 dark:text-gray-500" title={
                      flexDirection === 'column'
                        ? "Set how items are aligned horizontally within the container"
                        : "Set how items are aligned vertically within the container"
                    }>(?)</span>
                  </label>
                  <select
                    value={alignItems}
                    onChange={(e) => actions.setProp((props) => { props.alignItems = e.target.value; })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  >
                    <option value="flex-start">{flexDirection === 'column' ? 'Left' : 'Top'}</option>
                    <option value="center">{flexDirection === 'column' ? 'Center Horizontally' : 'Center Vertically'}</option>
                    <option value="flex-end">{flexDirection === 'column' ? 'Right' : 'Bottom'}</option>
                    <option value="stretch">{flexDirection === 'column' ? 'Fill Width' : 'Fill Height'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {flexDirection === 'column' ? 'Vertical Distribution' : 'Horizontal Distribution'}
                    <span className="ml-1 text-gray-400 dark:text-gray-500" title={
                      flexDirection === 'column'
                        ? "Control the vertical spacing between items"
                        : "Control the horizontal spacing between items"
                    }>(?)</span>
                  </label>
                  <select
                    value={justifyContent}
                    onChange={(e) => actions.setProp((props) => { props.justifyContent = e.target.value; })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  >
                    <option value="flex-start">{flexDirection === 'column' ? 'Top' : 'Left'}</option>
                    <option value="center">{flexDirection === 'column' ? 'Center Vertically' : 'Center Horizontally'}</option>
                    <option value="flex-end">{flexDirection === 'column' ? 'Bottom' : 'Right'}</option>
                    <option value="space-between">Space Between Items</option>
                    <option value="space-around">{flexDirection === 'column' ? 'Even Vertical Spacing' : 'Even Horizontal Spacing'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowStyle(!showStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showStyle && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Background */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Background
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(background.r).toString(16).padStart(2, '0')}${Math.round(background.g).toString(16).padStart(2, '0')}${Math.round(background.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => {
                    const hex = e.target.value.substring(1);
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    actions.setProp((props) => {
                      props.background = { ...props.background, r, g, b };
                    });
                  }}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={background.a}
                  onChange={(e) => {
                    actions.setProp((props) => {
                      props.background = { ...props.background, a: parseFloat(e.target.value) };
                    });
                  }}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            {/* Border Radius and Shadow */}
            <div className="grid grid-cols-1 gap-2">
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
                                props.shadow.color = {
                                  ...props.shadow.color,
                                  r: parseInt(hex.substring(0, 2), 16),
                                  g: parseInt(hex.substring(2, 4), 16),
                                  b: parseInt(hex.substring(4, 6), 16),
                                };
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
                          className="flex-1 accent-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Container Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Container Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Container Margin
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
              </div>
            </div>

            {/* Container Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Container Padding
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
