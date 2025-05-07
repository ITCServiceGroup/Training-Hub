import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown } from 'react-icons/fa';

export const TabsSettings = () => {
  // State for collapsible sections
  const [showGeneral, setShowGeneral] = useState(true);
  const [showAppearance, setShowAppearance] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);

  const { actions } = useNode();

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
    numberOfTabs,
    tabTitles,
    tabBackground,
    activeTabBackground,
  } = useNode((node) => ({
    ...node.data.props
  }));

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
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showGeneral ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowGeneral(!showGeneral)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            General
          </label>
          <FaChevronDown
            className={`transition-transform ${showGeneral ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showGeneral && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Tabs</label>
              <input
                type="number"
                min="1"
                value={numberOfTabs}
                onChange={(e) => {
                  const newNumberOfTabs = parseInt(e.target.value) || 1;
                  actions.setProp((props) => {
                    // Update number of tabs
                    props.numberOfTabs = newNumberOfTabs;
                    // Ensure tabTitles array matches the new number of tabs
                    props.tabTitles = Array.from({ length: newNumberOfTabs }, (_, i) => {
                      return props.tabTitles[i] || `Tab ${i + 1}`;
                    });
                  });
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Tab Titles */}
            {Array.from({ length: numberOfTabs }, (_, index) => (
              <div key={`tab-title-${index}`}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Tab {index + 1} Title
                </label>
                <input
                  type="text"
                  value={tabTitles[index] || `Tab ${index + 1}`}
                  onChange={(e) => {
                    actions.setProp((props) => {
                      const newTitles = [...props.tabTitles];
                      newTitles[index] = e.target.value;
                      props.tabTitles = newTitles;
                    });
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (%)</label>
                <input
                  type="text"
                  value={width.replace('%', '')}
                  onChange={(e) => {
                    const value = e.target.value.trim();
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Container Background</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Inactive Tab Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(tabBackground.r).toString(16).padStart(2, '0')}${Math.round(tabBackground.g).toString(16).padStart(2, '0')}${Math.round(tabBackground.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('tabBackground', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={tabBackground.a}
                  onChange={(e) => handleOpacityChange('tabBackground', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Active Tab Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={`#${Math.round(activeTabBackground.r).toString(16).padStart(2, '0')}${Math.round(activeTabBackground.g).toString(16).padStart(2, '0')}${Math.round(activeTabBackground.b).toString(16).padStart(2, '0')}`}
                  onChange={(e) => handleColorChange('activeTabBackground', e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded mr-2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={activeTabBackground.a}
                  onChange={(e) => handleOpacityChange('activeTabBackground', parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Text Color</label>
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
                        actions.setProp((props) => {
                          props.border = {
                            ...props.border,
                            color: {
                              ...props.border.color,
                              r: parseInt(hex.substring(0, 2), 16),
                              g: parseInt(hex.substring(2, 4), 16),
                              b: parseInt(hex.substring(4, 6), 16)
                            }
                          };
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
                  checked={shadow.enabled}
                  onChange={(e) => actions.setProp((props) => {
                    props.shadow = { ...props.shadow, enabled: e.target.checked };
                  })}
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
                        value={shadow.x}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, x: parseInt(e.target.value) };
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Offset</label>
                      <input
                        type="number"
                        value={shadow.y}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, y: parseInt(e.target.value) };
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
                        value={shadow.blur}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, blur: parseInt(e.target.value) };
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</label>
                      <input
                        type="number"
                        value={shadow.spread}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = { ...props.shadow, spread: parseInt(e.target.value) };
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
                        value={`#${Math.round(shadow.color.r).toString(16).padStart(2, '0')}${Math.round(shadow.color.g).toString(16).padStart(2, '0')}${Math.round(shadow.color.b).toString(16).padStart(2, '0')}`}
                        onChange={(e) => {
                          const hex = e.target.value.substring(1);
                          actions.setProp((props) => {
                            props.shadow = {
                              ...props.shadow,
                              color: {
                                ...props.shadow.color,
                                r: parseInt(hex.substring(0, 2), 16),
                                g: parseInt(hex.substring(2, 4), 16),
                                b: parseInt(hex.substring(4, 6), 16)
                              }
                            };
                          });
                        }}
                        className="w-8 h-8 p-0 border border-gray-300 dark:border-slate-600 rounded"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={shadow.color.a}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow = {
                            ...props.shadow,
                            color: { ...props.shadow.color, a: parseFloat(e.target.value) }
                          };
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
            {/* Padding */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Padding</label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div key={side}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{side}</label>
                    <input
                      type="number"
                      value={padding[index] === '' || padding[index] === '0' ? '' : parseInt(padding[index])}
                      onChange={(e) => {
                        actions.setProp((props) => {
                          const newPadding = [...props.padding];
                          newPadding[index] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          props.padding = newPadding;
                        });
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Margin</label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div key={side}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{side}</label>
                    <input
                      type="number"
                      value={margin[index] === '' || margin[index] === '0' ? '' : parseInt(margin[index])}
                      onChange={(e) => {
                        actions.setProp((props) => {
                          const newMargin = [...props.margin];
                          newMargin[index] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          props.margin = newMargin;
                        });
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-slate-700 text-gray-700 dark:text-gray-200"
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
