import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { FaCog } from 'react-icons/fa';

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
  const [showSpacing, setShowSpacing] = useState(false);

  // Initialize margin with default values if not set
  const margin = props.margin || ['0', '0', '0', '0'];

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
      {props.name ? (
        <div className="mb-4 p-3 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-md">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-primary/20 dark:bg-primary/30 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-light" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-primary dark:text-primary-light">Currently Selected</span>
          </div>
          <div className="flex items-center p-2 bg-white dark:bg-slate-700 rounded-md border border-gray-200 dark:border-gray-600">
            <img
              src={props.iconUrl || interactiveElements.find(el => el.name === props.name)?.iconUrl}
              alt={props.title}
              className="w-10 h-10 mr-3 object-contain"
            />
            <div>
              <div className="font-medium text-gray-800 dark:text-white">{props.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{props.description}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-yellow-100 dark:bg-yellow-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Please Select an Interactive Element</span>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Choose an interactive element from the list below to add to your content.
          </p>
        </div>
      )}

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
                  props.name === element.name ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40' : 'border border-transparent'
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

      {/* Spacing Settings */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus-visible:ring focus-visible:ring-teal-500 focus-visible:ring-opacity-50"
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <div className="flex items-center">
            <FaCog className="mr-2" />
            <span>Spacing</span>
          </div>
          <svg
            className={`w-5 h-5 transform ${showSpacing ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Element Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Element Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Top</label>
                  <input
                    type="number"
                    value={margin[0] === '' || margin[0] === '0' ? '' : parseInt(margin[0])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[0] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Right</label>
                  <input
                    type="number"
                    value={margin[1] === '' || margin[1] === '0' ? '' : parseInt(margin[1])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[1] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Bottom</label>
                  <input
                    type="number"
                    value={margin[2] === '' || margin[2] === '0' ? '' : parseInt(margin[2])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[2] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Left</label>
                  <input
                    type="number"
                    value={margin[3] === '' || margin[3] === '0' ? '' : parseInt(margin[3])}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newMargin = [...margin];
                      // If the field is empty, set it to 0
                      newMargin[3] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                      setProp((props) => { props.margin = newMargin; });
                    }}
                    onFocus={(e) => {
                      // Clear the field if it's 0 when focused
                      if (e.target.value === '0' || e.target.value === 0) {
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
