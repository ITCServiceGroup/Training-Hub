import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaImage } from 'react-icons/fa';
import { MediaLibrarySelector } from './MediaLibrarySelector';

export const ImageSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [inputValues, setInputValues] = useState({
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0']
  });

  const {
    src,
    alt,
    width,
    height,
    radius,
    alignment,
    border,
    objectFit,
    margin,
    padding,
    shadow,
    backgroundColor,
    aspectRatio,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      src: props.src || 'https://placehold.co/300x200',
      alt: props.alt || 'Image',
      width: props.width || '100%',
      height: props.height || 'auto',
      radius: props.radius || 0,
      alignment: props.alignment || 'center',
      border: props.border || {
        style: 'none',
        width: 0,
        color: { r: 0, g: 0, b: 0, a: 1 },
      },
      objectFit: props.objectFit || 'cover',
      margin: props.margin || ['0', '0', '0', '0'],
      padding: props.padding || ['0', '0', '0', '0'],
      shadow: props.shadow || {
        enabled: false,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 },
      },
      backgroundColor: props.backgroundColor || { r: 255, g: 255, b: 255, a: 0 },
      aspectRatio: props.aspectRatio || 'auto',
    };
  });

  // Initialize or update input values when props change
  useEffect(() => {
    setInputValues({
      margin: margin.map(m => m.replace('px', '')),
      padding: padding.map(p => p.replace('px', ''))
    });
  }, [margin, padding]);

  const handleSpacingChange = (type, index, value) => {
    // Update local state
    setInputValues(prev => ({
      ...prev,
      [type]: prev[type].map((v, i) => i === index ? value : v)
    }));

    // Only update prop if we have a value
    if (value !== '') {
      actions.setProp((props) => {
        props[type][index] = `${value}px`;
      });
    }
  };

  const handleMediaSelect = (item) => {
    actions.setProp((props) => {
      props.src = item.public_url;
      props.alt = item.alt_text || item.file_name;
    });
  };

  return (
    <div className="image-settings space-y-4">
      {/* Image Source Section */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Image Source</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL or Media Library
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={src}
                onChange={(e) => actions.setProp((props) => { props.src = e.target.value; })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
              <button 
                onClick={() => setIsMediaLibraryOpen(true)}
                className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-1"
              >
                <FaImage size={14} />
                <span className="text-sm">Browse</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              Alt Text
              <span className="text-gray-400 text-[10px]">(for accessibility)</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => actions.setProp((props) => { props.alt = e.target.value; })}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              placeholder="Describe the image for screen readers"
            />
          </div>
        </div>
      </div>

      {/* Display Section */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Display</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Object Fit
            </label>
            <div className="flex space-x-1">
              {['cover', 'contain', 'fill', 'none'].map((fit) => (
                <button
                  key={fit}
                  className={`px-2 py-1 text-xs rounded capitalize ${
                    objectFit === fit
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.objectFit = fit; })}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aspect Ratio
            </label>
            <div className="flex space-x-1">
              {['auto', '1/1', '4/3', '16/9'].map((ratio) => (
                <button
                  key={ratio}
                  className={`px-2 py-1 text-xs rounded ${
                    aspectRatio === ratio
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.aspectRatio = ratio; })}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => actions.setProp((props) => { props.width = e.target.value; })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100"
                  style={{ WebkitAppearance: 'inner-spin-button' }}
                  placeholder="100%, 300px"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => actions.setProp((props) => { props.height = e.target.value; })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100"
                  style={{ WebkitAppearance: 'inner-spin-button' }}
                  placeholder="auto, 200px"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alignment
            </label>
            <div className="flex space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded ${
                  alignment === 'left'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.alignment = 'left'; })}
              >
                Left
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${
                  alignment === 'center'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.alignment = 'center'; })}
              >
                Center
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${
                  alignment === 'right'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.alignment = 'right'; })}
              >
                Right
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Spacing</h3>
        <div className="space-y-3">
          {/* Margin Controls */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Margin (px)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Top', 'Right', 'Bottom', 'Left'].map((label, index) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={inputValues.margin[index] || ''}
                    onChange={(e) => handleSpacingChange('margin', index, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Padding Controls */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Padding (px)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Top', 'Right', 'Bottom', 'Left'].map((label, index) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={inputValues.padding[index] || ''}
                    onChange={(e) => handleSpacingChange('padding', index, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Border & Effects Section */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Border & Effects</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Style
            </label>
            <div className="flex space-x-1">
              {['none', 'solid', 'dashed', 'dotted'].map((style) => (
                <button
                  key={style}
                  className={`px-2 py-1 text-xs rounded capitalize ${
                    border.style === style
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => {
                    props.border = { ...props.border, style };
                  })}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {border.style !== 'none' && (
            <>
              <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Width
            </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    value={border.width}
                    min={0}
                    max={10}
                    onChange={(e) => actions.setProp((props) => {
                      props.border.width = parseInt(e.target.value);
                    })}
                    className="w-full mr-2 accent-teal-600"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{border.width}px</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={`#${Math.round(border.color.r).toString(16).padStart(2, '0')}${Math.round(border.color.g).toString(16).padStart(2, '0')}${Math.round(border.color.b).toString(16).padStart(2, '0')}`}
                    onChange={(e) => {
                      const hex = e.target.value.substring(1);
                      actions.setProp((props) => {
                        props.border.color = {
                          ...props.border.color,
                          r: parseInt(hex.substring(0, 2), 16),
                          g: parseInt(hex.substring(2, 4), 16),
                          b: parseInt(hex.substring(4, 6), 16),
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
                    value={border.color.a}
                    onChange={(e) => actions.setProp((props) => {
                      props.border.color.a = parseFloat(e.target.value);
                    })}
                    className="flex-1 accent-teal-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Radius
            </label>
            <div className="flex items-center">
              <input
                type="range"
                value={radius}
                min={0}
                max={50}
                onChange={(e) => actions.setProp((props) => { props.radius = parseInt(e.target.value); })}
                className="w-full mr-2 accent-teal-600"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{radius}px</span>
            </div>
          </div>

          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={shadow.enabled}
                onChange={(e) => actions.setProp((props) => {
                  props.shadow.enabled = e.target.checked;
                })}
                className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Enable Shadow</span>
            </label>
            {shadow.enabled && (
              <div className="space-y-2 pl-6">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X Offset</label>
                    <input
                      type="number"
                      value={shadow.x}
                      onChange={(e) => actions.setProp((props) => {
                        props.shadow.x = parseInt(e.target.value);
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
                        props.shadow.y = parseInt(e.target.value);
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
                        props.shadow.blur = parseInt(e.target.value);
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
                        props.shadow.spread = parseInt(e.target.value);
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
                          props.shadow.color = {
                            ...props.shadow.color,
                            r: parseInt(hex.substring(0, 2), 16),
                            g: parseInt(hex.substring(2, 4), 16),
                            b: parseInt(hex.substring(4, 6), 16),
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
                        props.shadow.color.a = parseFloat(e.target.value);
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

      {/* Media Library Modal */}
      <MediaLibrarySelector
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};
