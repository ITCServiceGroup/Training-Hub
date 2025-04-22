import React from 'react';
import { useNode } from '@craftjs/core';

export const ContainerSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const {
    background,
    padding,
    margin,
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    radius,
    shadow,
    width,
    height,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      background: props.background || { r: 255, g: 255, b: 255, a: 1 },
      padding: props.padding || ['0', '0', '0', '0'],
      margin: props.margin || ['0', '0', '0', '0'],
      flexDirection: props.flexDirection || 'column',
      alignItems: props.alignItems || 'flex-start',
      justifyContent: props.justifyContent || 'flex-start',
      fillSpace: props.fillSpace || 'no',
      radius: props.radius || 0,
      shadow: props.shadow || 0,
      width: props.width || '100%',
      height: props.height || 'auto',
    };
  });

  return (
    <div className="container-settings">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Layout
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Direction</label>
            <div className="flex space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded ${
                  flexDirection === 'row'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.flexDirection = 'row'; })}
              >
                Row
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${
                  flexDirection === 'column'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.flexDirection = 'column'; })}
              >
                Column
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fill Space</label>
            <div className="flex space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded ${
                  fillSpace === 'yes'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.fillSpace = 'yes'; })}
              >
                Yes
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${
                  fillSpace === 'no'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => actions.setProp((props) => { props.fillSpace = 'no'; })}
              >
                No
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Align Items</label>
            <select
              value={alignItems}
              onChange={(e) => actions.setProp((props) => { props.alignItems = e.target.value; })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            >
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Justify Content</label>
            <select
              value={justifyContent}
              onChange={(e) => actions.setProp((props) => { props.justifyContent = e.target.value; })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            >
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Spacing
        </label>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Padding</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Top</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Right</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bottom</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Left</label>
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
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Margin</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Top</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Right</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bottom</label>
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
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Left</label>
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

      <div className="mb-3">
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
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              placeholder="100%, 200px, etc."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
            <input
              type="text"
              value={height}
              onChange={(e) => actions.setProp((props) => { props.height = e.target.value; })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              placeholder="auto, 200px, etc."
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Appearance
        </label>
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
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Shadow</label>
            <div className="flex items-center">
              <input
                type="range"
                value={shadow}
                min={0}
                max={100}
                onChange={(e) => actions.setProp((props) => { props.shadow = parseInt(e.target.value); })}
                className="w-full mr-2 accent-teal-600 [&::-webkit-slider-thumb]:bg-teal-600"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{shadow}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
