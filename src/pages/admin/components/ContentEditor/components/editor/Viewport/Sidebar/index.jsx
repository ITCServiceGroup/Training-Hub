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
      related: currentNodeId && state.nodes[currentNodeId].related,
      enabled: state.options.enabled
    };
  });

  return (
    <div className={classNames([
      'sidebar w-64 h-full bg-white dark:bg-slate-700 border-l border-gray-200 dark:border-slate-600 overflow-auto transition',
      {
        'opacity-0 mr-[-260px]': !enabled
      }
    ])}>
      <div className="px-4 py-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-4">Settings</h3>
        <div className="py-1 h-full">
          {active && related && related.toolbar && React.createElement(related.toolbar)}
          {!active && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Select an element to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
};
