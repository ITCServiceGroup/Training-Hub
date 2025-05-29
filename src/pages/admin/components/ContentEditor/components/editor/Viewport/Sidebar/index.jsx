import { useEditor } from '@craftjs/core';
import React from 'react';
import classNames from 'classnames';

import { SidebarItem } from './SidebarItem';

export const Sidebar = () => {
  const { active, related, enabled } = useEditor((state, query) => {
    // Get the currently selected node id
    const currentNodeId = query.getEvent('selected').first();

    return {
      active: currentNodeId,
      related: currentNodeId && state.nodes[currentNodeId] && state.nodes[currentNodeId].related,
      enabled: state.options.enabled
    };
  });

  return (
    <div
      className={classNames([
        'sidebar settings-panel w-64 h-full bg-white dark:bg-slate-700 border-l border-gray-200 dark:border-slate-600 overflow-auto transition',
        {
          'opacity-0 mr-[-260px]': !enabled
        }
      ])}
      onClick={(e) => {
        // Stop click propagation from sidebar to prevent deselection
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Stop mousedown propagation as well
        e.stopPropagation();
      }}
    >
      <div className="px-4 py-4 settings-panel-content">
        <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-4">Settings</h3>
        <div
          className="py-1 h-full settings-panel-body"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {active && related && related.toolbar && (
            <div className="settings-toolbar" onClick={(e) => e.stopPropagation()}>
              {React.createElement(related.toolbar)}
            </div>
          )}
          {!active && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Select an element to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
};
