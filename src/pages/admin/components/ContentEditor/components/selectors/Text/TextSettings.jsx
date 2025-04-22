import React from 'react';
import { useNode } from '@craftjs/core';

export const TextSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const {
    fontSize,
    textAlign,
    fontWeight,
    text,
    color,
    shadow,
    margin,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      fontSize: props.fontSize || 16,
      textAlign: props.textAlign || 'left',
      fontWeight: props.fontWeight || '500',
      text: props.text || 'Text',
      color: props.color || { r: 92, g: 90, b: 90, a: 1 },
      shadow: props.shadow || 0,
      margin: props.margin || [0, 0, 0, 0],
    };
  });

  return (
    <div className="text-settings">
      {/* Typography Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Typography
        </label>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Text Content
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
      </div>

      {/* Appearance Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Appearance
        </label>
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
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Shadow
          </label>
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

      {/* Spacing Section */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Margin
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Top</label>
            <input
              type="number"
              value={margin[0]}
              onChange={(e) => {
                const newMargin = [...margin];
                newMargin[0] = parseInt(e.target.value);
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
                newMargin[1] = parseInt(e.target.value);
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
                newMargin[2] = parseInt(e.target.value);
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
                newMargin[3] = parseInt(e.target.value);
                actions.setProp((props) => { props.margin = newMargin; });
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
