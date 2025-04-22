import React from 'react';
import { useNode } from '@craftjs/core';

export const TextSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const { fontSize, textAlign, fontWeight, text } = useNode((node) => {
    const props = node.data.props || {};
    return {
      fontSize: props.fontSize || 16,
      textAlign: props.textAlign || 'left',
      fontWeight: props.fontWeight || '500',
      text: props.text || 'Text',
    };
  });

  return (
    <div className="text-settings">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Text
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
          Font Size
        </label>
        <div className="flex items-center">
          <input
            type="range"
            value={fontSize}
            min={10}
            max={80}
            onChange={(e) => actions.setProp((props) => { props.fontSize = parseInt(e.target.value); })}
            className="w-full mr-2"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{fontSize}px</span>
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
    </div>
  );
};
