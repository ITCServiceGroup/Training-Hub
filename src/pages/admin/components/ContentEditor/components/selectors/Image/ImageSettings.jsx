import React from 'react';
import { useNode } from '@craftjs/core';

export const ImageSettings = () => {
  const { actions, selected } = useNode((node) => ({
    selected: node.id,
  }));

  const {
    src,
    alt,
    width,
    height,
    radius,
    alignment,
    border,
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
    };
  });

  return (
    <div className="image-settings">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={src}
          onChange={(e) => actions.setProp((props) => { props.src = e.target.value; })}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => actions.setProp((props) => { props.alt = e.target.value; })}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
        />
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
          Height
        </label>
        <input
          type="text"
          value={height}
          onChange={(e) => actions.setProp((props) => { props.height = e.target.value; })}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
          placeholder="auto, 200px, etc."
        />
      </div>

      <div className="mb-3">
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
