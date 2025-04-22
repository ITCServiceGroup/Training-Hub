import { useEditor } from '@craftjs/core';
import React, { useState } from 'react';
import { FaUndo, FaRedo, FaEye, FaEyeSlash, FaCode, FaTrash, FaCopy } from 'react-icons/fa';
import classNames from 'classnames';

export const Header = () => {
  const { actions, query, enabled, canUndo, canRedo } = useEditor((state) => ({
    enabled: state.options.enabled,
    canUndo: state.options.history && state.options.history.undoStack.length > 0,
    canRedo: state.options.history && state.options.history.redoStack.length > 0,
  }));

  const [showPreview, setShowPreview] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  const togglePreview = () => {
    actions.setOptions((options) => {
      options.enabled = !options.enabled;
    });
    setShowPreview(!showPreview);
  };

  const copyJSON = () => {
    const json = query.serialize();
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    alert('JSON copied to clipboard!');
  };

  const toggleJSON = () => {
    setShowJSON(!showJSON);
  };

  const resetEditor = () => {
    if (window.confirm('Are you sure you want to reset the editor? This will delete all content.')) {
      actions.deserialize('{"ROOT":{"type":"div","isCanvas":true,"props":{},"displayName":"div","custom":{},"hidden":false,"nodes":[],"linkedNodes":{}}}');
    }
  };

  return (
    <div className="header bg-white dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between h-12 px-4">
      <div className="flex items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-white">Content Editor</h3>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className={classNames([
            'p-2 transition-colors',
            canUndo
              ? 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          ])}
          onClick={() => canUndo && actions.history.undo()}
          title="Undo"
          disabled={!canUndo}
        >
          <FaUndo size={14} />
        </button>
        <button
          className={classNames([
            'p-2 transition-colors',
            canRedo
              ? 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          ])}
          onClick={() => canRedo && actions.history.redo()}
          title="Redo"
          disabled={!canRedo}
        >
          <FaRedo size={14} />
        </button>
        <div className="h-6 border-l border-gray-300 dark:border-slate-600 mx-1"></div>
        <button
          className={`p-2 ${!enabled ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'} hover:text-teal-600 dark:hover:text-teal-400 transition-colors`}
          onClick={togglePreview}
          title={enabled ? 'Preview Mode' : 'Edit Mode'}
        >
          {enabled ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
        </button>
        <button
          className={`p-2 ${showJSON ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'} hover:text-teal-600 dark:hover:text-teal-400 transition-colors`}
          onClick={toggleJSON}
          title="View JSON"
        >
          <FaCode size={14} />
        </button>
        <button
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          onClick={copyJSON}
          title="Copy JSON"
        >
          <FaCopy size={14} />
        </button>
        <button
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          onClick={resetEditor}
          title="Reset Editor"
        >
          <FaTrash size={14} />
        </button>
      </div>

      {showJSON && (
        <div className="absolute top-12 right-0 w-96 h-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-bl-md overflow-auto z-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">JSON Output</h4>
            <pre className="text-xs bg-gray-100 dark:bg-slate-900 p-2 rounded overflow-auto max-h-80">
              {JSON.stringify(query.serialize(), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
