import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';

export const InteractiveSettings = () => {
  const { actions, name, id, related } = useNode((node) => ({
    name: node.data.custom.displayName || node.data.displayName,
    id: node.id,
    related: node.related
  }));

  const { setProp, props } = useNode((node) => ({
    props: node.data.props
  }));

  const [interactiveElements, setInteractiveElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available interactive elements
  useEffect(() => {
    setLoading(true);
    fetch('/interactive-elements/elements.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(elements => {
        setInteractiveElements(elements);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching interactive elements:', error);
        setError('Failed to load interactive elements');
        setLoading(false);
      });
  }, []);

  const handleElementSelect = (element) => {
    setProp((props) => {
      props.name = element.name;
      props.title = element.title;
      props.description = element.description;
      // Also store the iconUrl to ensure it's available for the component
      props.iconUrl = element.iconUrl || element.thumbnailUrl;
    });
  };

  if (loading) {
    return <div className="p-2 text-gray-500 dark:text-gray-400">Loading interactive elements...</div>;
  }

  if (error) {
    return <div className="p-2 text-red-500">{error}</div>;
  }

  return (
    <div className="interactive-settings">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Selected Element
        </label>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {props.name ? `${props.title} (${props.name})` : 'None selected'}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Interactive Elements
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
          {interactiveElements.length > 0 ? (
            interactiveElements.map((element) => (
              <div
                key={element.name}
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 ${
                  props.name === element.name ? 'bg-gray-100 dark:bg-slate-600' : ''
                }`}
                onClick={() => handleElementSelect(element)}
              >
                <img
                  src={element.iconUrl || element.thumbnailUrl}
                  alt={element.title}
                  className="w-10 h-10 mr-3 object-contain"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{element.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{element.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
              No interactive elements available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
