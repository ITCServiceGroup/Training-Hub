import React, { useEffect, useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaPuzzlePiece } from 'react-icons/fa';
import { InteractiveSettings } from './InteractiveSettings';
import InteractiveRenderer from './InteractiveRenderer';

export const Interactive = ({
  name,
  title,
  description,
  iconUrl,
  margin = ['0', '0', '0', '0'],
  titleTextColor = {
    light: { r: 44, g: 62, b: 80, a: 1 }, // Default dark text for light mode
    dark: { r: 241, g: 245, b: 249, a: 1 } // Default light text for dark mode
  },
  buttonColor = {
    light: { r: 15, g: 118, b: 110, a: 1 }, // Default teal for light mode
    dark: { r: 20, g: 184, b: 166, a: 1 } // Default lighter teal for dark mode
  },
  primaryBackgroundColor = {
    light: { r: 248, g: 249, b: 250, a: 1 }, // Light gray for light mode
    dark: { r: 30, g: 41, b: 59, a: 1 } // Dark slate for dark mode
  },
  secondaryBackgroundColor = {
    light: { r: 255, g: 255, b: 255, a: 1 }, // White for light mode
    dark: { r: 15, g: 23, b: 42, a: 1 } // Darker slate for dark mode
  },
  autoConvertColors = true
}) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
    dragged: node.events.dragged
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const [elementData, setElementData] = useState(null);

  // Fetch element data when component mounts or name changes
  useEffect(() => {
    if (name) {
      // Use absolute path in dev, relative in production
      const elementsPath = import.meta.env.DEV ? '/interactive-elements/elements.json' : './interactive-elements/elements.json';
      fetch(elementsPath)
        .then(response => response.json())
        .then(elements => {
          const element = elements.find(el => el.name === name);
          if (element) {
            // Convert absolute paths to work with current environment
            const basePath = import.meta.env.DEV ? '' : '.';
            const processedElement = {
              ...element,
              iconUrl: element.iconUrl?.startsWith('/') ? `${basePath}${element.iconUrl}` : element.iconUrl,
              thumbnailUrl: element.thumbnailUrl?.startsWith('/') ? `${basePath}${element.thumbnailUrl}` : element.thumbnailUrl
            };
            setElementData(processedElement);
          } else {
            console.error(`Interactive element "${name}" not found in elements.json`);
          }
        })
        .catch(error => {
          console.error('Error fetching interactive elements:', error);
        });
    }
  }, [name]);

  // Extract margin values
  const topMargin = parseInt(margin[0]) || 0;
  const rightMargin = parseInt(margin[1]) || 0;
  const bottomMargin = parseInt(margin[2]) || 0;
  const leftMargin = parseInt(margin[3]) || 0;

  // If editor is disabled (view mode), render the actual interactive element
  if (!enabled && name) {
    // Use the InteractiveRenderer component for proper isolation
    return (
      <div
        className="interactive-element-wrapper w-full"
        style={{
          width: '100%',
          maxWidth: '100%',
          display: 'block',
          margin: `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`
        }}
      >
        <InteractiveRenderer
          name={name}
          titleTextColor={titleTextColor}
          buttonColor={buttonColor}
          primaryBackgroundColor={primaryBackgroundColor}
          secondaryBackgroundColor={secondaryBackgroundColor}
        />
      </div>
    );
  }

  // If editor is enabled (edit mode), render the placeholder
  return (
    <div
      ref={ref => connect(drag(ref))}
      className={`interactive-element-container p-4 border-2 ${selected ? 'border-primary' : 'border-dashed border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-slate-700 w-full`}
      style={{
        minHeight: '100px',
        margin: `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`
      }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {elementData ? (
          <>
            <img
              src={elementData.iconUrl || iconUrl || elementData.thumbnailUrl}
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
              <FaPuzzlePiece size={24} className="text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Interactive Element Placeholder</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Please select an interactive element type in the settings panel
            </p>
            <div className="mt-3 text-xs text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-400 rounded-md px-3 py-1">
              Click this element and use the settings panel →
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
    description: 'Select an interactive element from the settings',
    iconUrl: '',
    margin: ['0', '0', '0', '0'], // [top, right, bottom, left]
    titleTextColor: {
      light: { r: 44, g: 62, b: 80, a: 1 }, // Default dark text for light mode
      dark: { r: 241, g: 245, b: 249, a: 1 } // Default light text for dark mode
    },
    buttonColor: {
      light: { r: 15, g: 118, b: 110, a: 1 }, // Default teal for light mode
      dark: { r: 20, g: 184, b: 166, a: 1 } // Default lighter teal for dark mode
    },
    primaryBackgroundColor: {
      light: { r: 248, g: 249, b: 250, a: 1 }, // Light gray for light mode
      dark: { r: 30, g: 41, b: 59, a: 1 } // Dark slate for dark mode
    },
    secondaryBackgroundColor: {
      light: { r: 255, g: 255, b: 255, a: 1 }, // White for light mode
      dark: { r: 15, g: 23, b: 42, a: 1 } // Darker slate for dark mode
    },
    autoConvertColors: true
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
