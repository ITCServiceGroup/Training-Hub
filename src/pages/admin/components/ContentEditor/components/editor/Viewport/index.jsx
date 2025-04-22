import { useEditor } from '@craftjs/core';
import React, { useState, useCallback, useEffect } from 'react';

import { Toolbox } from './Toolbox';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Preview from '../Preview';

export const Viewport = ({ children }) => {
  const {
    enabled,
    connectors,
    actions
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [activeTab, setActiveTab] = useState('editor');
  const [isEditingEnabled, setIsEditingEnabled] = useState(true);

  // Reset editor state when switching tabs
  useEffect(() => {
    if (activeTab === 'preview') {
      setIsEditingEnabled(false);
    } else {
      setIsEditingEnabled(true);
    }
  }, [activeTab]);

  // Update editor state
  useEffect(() => {
    if (actions) {
      actions.setOptions(options => ({
        ...options,
        enabled: isEditingEnabled
      }));
    }
  }, [isEditingEnabled, actions]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="viewport">
      <div className="flex h-full overflow-hidden flex-row w-full">
        <Toolbox />
        <div className="page-container flex flex-1 h-full flex-col">
          <Header />

          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'editor'
                ? 'text-teal-600 border-b-2 border-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => handleTabChange('editor')}
            >
              Editor
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'preview'
                ? 'text-teal-600 border-b-2 border-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => handleTabChange('preview')}
            >
              Preview
            </button>
          </div>

          {/* Editor tab */}
          {activeTab === 'editor' && (
            <div
              className={`craftjs-renderer flex-1 h-full w-full transition pb-8 overflow-auto ${enabled ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
              ref={(ref) => {
                connectors.select(connectors.hover(ref, null), null);
              }}
            >
              <div className="relative flex-col flex items-center pt-8">
                {children}
              </div>
            </div>
          )}

          {/* Preview tab */}
          {activeTab === 'preview' && (
            <div className="flex-1 h-full w-full overflow-auto bg-white dark:bg-slate-900 p-4">
              <Preview />
            </div>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  );
};
