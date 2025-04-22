import React from 'react';
import { useNode } from '@craftjs/core';

export const ButtonSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const {
    text,
    fontSize,
    fontWeight,
    buttonStyle,
    radius,
    padding,
    background,
    color,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      text: props.text || 'Click Me',
      fontSize: props.fontSize || 16,
      fontWeight: props.fontWeight || '500',
      buttonStyle: props.buttonStyle || 'filled',
      radius: props.radius || 4,
      padding: props.padding || ['10', '16', '10', '16'],
      background: props.background || { r: 13, g: 148, b: 136, a: 1 },
      color: props.color || { r: 255, g: 255, b: 255, a: 1 },
    };
  });

  return (
    <div className="button-settings">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Font Size
        </label>
        <div className="flex items-center">
          <input
            type="range"
            value={fontSize}
            min={10}
            max={40}
            onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
            className="w-full mr-2"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{fontSize}px</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          Background Color
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
          Text Color
        </label>
        <div className="flex items-center">
          <div
            className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600 mr-2"
            style={{
              background: `rgba(${Object.values(color)})`,
            }}
          ></div>
          <input
            type="text"
            value={`rgba(${Object.values(color)})`}
            disabled
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};
