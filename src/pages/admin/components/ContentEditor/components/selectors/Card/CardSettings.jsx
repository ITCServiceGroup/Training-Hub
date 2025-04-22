import React from 'react';
import { useNode } from '@craftjs/core';

export const CardSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const {
    background,
    padding,
    radius,
    shadow,
    border,
    width,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      background: props.background || { r: 255, g: 255, b: 255, a: 1 },
      padding: props.padding || ['16', '16', '16', '16'],
      radius: props.radius || 8,
      shadow: props.shadow || 1,
      border: props.border || {
        style: 'solid',
        width: 1,
        color: { r: 229, g: 231, b: 235, a: 1 },
      },
      width: props.width || '100%',
    };
  });

  return (
    <div className="card-settings">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Background
        </label>
        <div className="flex items-center">
          <div
            className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600 mr-2"
            style={{
              background: `rgba(${Object.values(background)})`,
            }}
          ></div>
          <input
            type="text"
            value={`rgba(${Object.values(background)})`}
            disabled
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Width
        </label>
        <input
          type="text"
          value={width}
          onChange={(e) => actions.setProp((props) => { props.width = e.target.value; })}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
          placeholder="100%, 300px, etc."
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Padding
        </label>
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

      <div className="mb-3">
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
            className="w-full mr-2"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{radius}px</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Shadow
        </label>
        <div className="flex items-center">
          <input
            type="range"
            value={shadow}
            min={0}
            max={10}
            onChange={(e) => actions.setProp((props) => { props.shadow = parseInt(e.target.value); })}
            className="w-full mr-2"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{shadow}</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Border Style
        </label>
        <div className="flex space-x-1">
          <button
            className={`px-2 py-1 text-xs rounded ${
              border.style === 'none'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
            }`}
            onClick={() => actions.setProp((props) => { props.border = { ...props.border, style: 'none' }; })}
          >
            None
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              border.style === 'solid'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
            }`}
            onClick={() => actions.setProp((props) => { props.border = { ...props.border, style: 'solid' }; })}
          >
            Solid
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              border.style === 'dashed'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
            }`}
            onClick={() => actions.setProp((props) => { props.border = { ...props.border, style: 'dashed' }; })}
          >
            Dashed
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              border.style === 'dotted'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
            }`}
            onClick={() => actions.setProp((props) => { props.border = { ...props.border, style: 'dotted' }; })}
          >
            Dotted
          </button>
        </div>
      </div>

      {border.style !== 'none' && (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Width
            </label>
            <div className="flex items-center">
              <input
                type="range"
                value={border.width}
                min={0}
                max={10}
                onChange={(e) => actions.setProp((props) => { props.border = { ...props.border, width: parseInt(e.target.value) }; })}
                className="w-full mr-2"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{border.width}px</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Color
            </label>
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600 mr-2"
                style={{
                  background: `rgba(${Object.values(border.color)})`,
                }}
              ></div>
              <input
                type="text"
                value={`rgba(${Object.values(border.color)})`}
                disabled
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
