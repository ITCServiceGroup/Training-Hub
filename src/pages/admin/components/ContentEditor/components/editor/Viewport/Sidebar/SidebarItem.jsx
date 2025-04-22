import { useEditor } from '@craftjs/core';
import React from 'react';
import { FaTrash } from 'react-icons/fa';

export const SidebarItem = ({ title, settings: Settings, isDeletable }) => {
  const { actions, selected } = useEditor((state, query) => {
    return {
      selected: state.events.selected,
    };
  });

  // Debug the settings
  React.useEffect(() => {
    console.log('SidebarItem settings:', { title, Settings, isDeletable });
  }, [title, Settings, isDeletable]);

  return (
    <div className="sidebar-item mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white">{title}</h4>
        {isDeletable && (
          <button
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              actions.delete(selected);
            }}
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-md">
        {Settings ? (
          <Settings />
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No settings available for this component.
          </div>
        )}
      </div>
    </div>
  );
};
