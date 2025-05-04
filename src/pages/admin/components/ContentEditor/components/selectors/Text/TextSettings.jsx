import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown, FaListUl, FaListOl, FaTimes } from 'react-icons/fa';

export const TextSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  // Toggle sections
  const [showTextStructure, setShowTextStructure] = useState(true);
  const [showTextStyle, setShowTextStyle] = useState(true);
  const [showTextSpacing, setShowTextSpacing] = useState(true);

  const {
    fontSize,
    textAlign,
    fontWeight,
    text,
    color,
    shadow,
    margin,
    padding,
    listType,
  } = useNode((node) => {
    const props = node.data.props || {};

    // Handle backward compatibility for shadow
    let shadowValue = props.shadow;
    if (typeof shadowValue === 'number') {
      shadowValue = {
        enabled: shadowValue > 0,
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: shadowValue / 100 }
      };
    }

    return {
      fontSize: props.fontSize || 16,
      textAlign: props.textAlign || 'left',
      fontWeight: props.fontWeight || '500',
      text: props.text || 'Text',
      color: props.color || { r: 92, g: 90, b: 90, a: 1 },
      shadow: shadowValue || {
        enabled: false,
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      },
      listType: props.listType || 'none',
      margin: props.margin || [0, 0, 0, 0],
      padding: props.padding || [0, 0, 0, 0],
    };
  });

  return (
    <div className="text-settings">
      {/* Text Structure Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextStructure ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextStructure(!showTextStructure)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Structure
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextStructure ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextStructure && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Text Content */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Text Content (supports HTML tags)
              </label>
              <textarea
                value={text}
                onChange={(e) => actions.setProp((props) => { props.text = e.target.value; })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                rows={4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
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
                  max={80}
                  onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
                  className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{fontSize}px</span>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Align
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'left'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'left'; })}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'center'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'center'; })}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    textAlign === 'right'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.textAlign = 'right'; })}
                >
                  Right
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Weight
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

            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                List Format
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'none'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'none'; })}
                  title="No List"
                >
                  <FaTimes size={12} className="mr-1" /> None
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'bullet'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'bullet'; })}
                  title="Bullet List"
                >
                  <FaListUl size={12} className="mr-1" /> Bullet
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                    listType === 'number'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.listType = 'number'; })}
                  title="Numbered List"
                >
                  <FaListOl size={12} className="mr-1" /> Number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Style Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextStyle ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextStyle(!showTextStyle)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Style
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextStyle ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextStyle && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Text Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(color.r).toString(16).padStart(2, '0')}${Math.round(color.g).toString(16).padStart(2, '0')}${Math.round(color.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => {
                    const hex = e.target.value.substring(1);
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    actions.setProp((props) => {
                      props.color = { ...props.color, r, g, b };
                    });
                  }}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={color.a}
                  onChange={(e) => {
                    actions.setProp((props) => {
                      props.color = { ...props.color, a: parseFloat(e.target.value) };
                    });
                  }}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  id="enableTextShadow"
                  checked={shadow.enabled || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    actions.setProp((props) => {
                      // Ensure shadow is an object
                      if (typeof props.shadow === 'number') {
                        props.shadow = {
                          enabled: isChecked,
                          x: 0,
                          y: 2,
                          blur: 4,
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
                  htmlFor="enableTextShadow"
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
                              y: 2,
                              blur: 4,
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
                        value={shadow.y || 2}
                        onChange={(e) => actions.setProp((props) => {
                          if (typeof props.shadow === 'number') {
                            props.shadow = {
                              enabled: true,
                              x: 0,
                              y: parseInt(e.target.value),
                              blur: 4,
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
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blur</label>
                    <input
                      type="number"
                      value={shadow.blur || 4}
                      onChange={(e) => actions.setProp((props) => {
                        if (typeof props.shadow === 'number') {
                          props.shadow = {
                            enabled: true,
                            x: 0,
                            y: 2,
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
                                y: 2,
                                blur: 4,
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
                              y: 2,
                              blur: 4,
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
        )}
      </div>

      {/* Text Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showTextSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowTextSpacing(!showTextSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Text Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showTextSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showTextSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={margin[0] === 0 ? '' : margin[0]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[0] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[1] === 0 ? '' : margin[1]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[1] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[2] === 0 ? '' : margin[2]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[2] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={margin[3] === 0 ? '' : margin[3]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[3] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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

            {/* Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Padding
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={padding[0] === 0 ? '' : padding[0]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[0] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[1] === 0 ? '' : padding[1]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[1] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[2] === 0 ? '' : padding[2]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[2] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
                    value={padding[3] === 0 ? '' : padding[3]}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newPadding = [...padding];
                      // If the field is empty, set it to 0
                      newPadding[3] = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
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
