import React, { useEffect, useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { InteractiveSettings } from './InteractiveSettings';
import InteractiveRenderer from './InteractiveRenderer';

export const Interactive = ({ name, title, description }) => {
  const { connectors: { connect, drag }, selected, actions, isActive } = useNode((node) => ({
    selected: node.events.selected,
    dragged: node.events.dragged,
    isActive: node.events.selected
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const [elementData, setElementData] = useState(null);

  // Fetch element data when component mounts or name changes
  useEffect(() => {
    if (name) {
      fetch('/interactive-elements/elements.json')
        .then(response => response.json())
        .then(elements => {
          const element = elements.find(el => el.name === name);
          if (element) {
            setElementData(element);
          } else {
            console.error(`Interactive element "${name}" not found in elements.json`);
          }
        })
        .catch(error => {
          console.error('Error fetching interactive elements:', error);
        });
    }
  }, [name]);

  // If editor is disabled (view mode), render the actual interactive element
  if (!enabled && name) {
    // Use the InteractiveRenderer component for proper isolation
    return (
      <div className="interactive-element-wrapper w-full my-4" style={{ width: '100%', maxWidth: '100%', display: 'block' }}>
        <InteractiveRenderer name={name} />
      </div>
    );
  }

  // If editor is enabled (edit mode), render the placeholder
  return (
    <div
      ref={ref => connect(drag(ref))}
      className={`interactive-element-container p-4 border-2 ${selected ? 'border-teal-600' : 'border-dashed border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-slate-700 w-full`}
      style={{ minHeight: '100px' }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {elementData ? (
          <>
            <img
              src={elementData.iconUrl}
              alt={elementData.title}
              className="w-16 h-16 mb-2 object-contain"
            />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">{elementData.title || title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">{elementData.description || description}</p>
            <div className="mt-2 text-xs text-teal-600 dark:text-teal-400">
              Interactive Element: {name}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mb-2 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-300">?</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title || 'Interactive Element'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">{description || 'Loading...'}</p>
            <div className="mt-2 text-xs text-teal-600 dark:text-teal-400">
              {name || 'Select an interactive element'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Define craft.js configuration for the component
Interactive.craft = {
  displayName: 'Interactive',
  props: {
    name: '',
    title: 'Interactive Element',
    description: 'Select an interactive element from the settings'
  },
  rules: {
    canDrag: () => true,
    canDrop: (dropTarget) => {
      // Allow dropping into any canvas element (like Container)
      return dropTarget.data.custom?.isCanvas || dropTarget.data.isCanvas;
    },
    canMoveIn: () => false,
    canMoveOut: () => true
  },
  related: {
    toolbar: InteractiveSettings
  }
};
