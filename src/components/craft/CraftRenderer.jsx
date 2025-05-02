import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { useTheme } from '../../contexts/ThemeContext';

// Import the components used in the ContentEditor
// These need to match exactly what's used in the ContentEditor
import { Container } from '../../pages/admin/components/ContentEditor/components/selectors/Container';
import { Text } from '../../pages/admin/components/ContentEditor/components/selectors/Text';
import { Button } from '../../pages/admin/components/ContentEditor/components/selectors/Button';
import { Image } from '../../pages/admin/components/ContentEditor/components/selectors/Image';
import { Card } from '../../pages/admin/components/ContentEditor/components/selectors/Card';
import { Interactive } from '../../pages/admin/components/ContentEditor/components/selectors/Interactive';
import { Table } from '../../pages/admin/components/ContentEditor/components/selectors/Table';
import { TableText } from '../../pages/admin/components/ContentEditor/components/selectors/Table/TableText';
import InteractiveRenderer from '../../pages/admin/components/ContentEditor/components/selectors/Interactive/InteractiveRenderer';

import './CraftRenderer.css';

/**
 * Component for rendering Craft.js JSON content without editing capabilities
 * This follows the official Craft.js documentation for rendering JSON content
 */
const CraftRenderer = ({ jsonContent }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [parsedContent, setParsedContent] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [interactiveElements, setInteractiveElements] = React.useState([]);

  // Add custom styles for the renderer
  const rendererStyles = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#1e293b',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    padding: '15px',
    borderRadius: '4px',
  };

  // Find all interactive elements in the content
  const findInteractiveElements = (content) => {
    if (!content) return [];

    const elements = [];
    const findInteractives = (nodes) => {
      Object.values(nodes).forEach(node => {
        if (node.type && node.type.resolvedName === 'Interactive' && node.props && node.props.name) {
          elements.push(node.props.name);
        }
      });
    };

    if (content.ROOT && content.nodes) {
      findInteractives(content.nodes);
    }

    return [...new Set(elements)]; // Return unique elements
  };

  // Parse the JSON content when the component mounts or jsonContent changes
  React.useEffect(() => {
    console.log('CraftRenderer: Received content type:', typeof jsonContent);
    console.log('CraftRenderer: Content preview:', typeof jsonContent === 'string'
      ? jsonContent.substring(0, 100)
      : 'Non-string content');

    try {
      // Handle different formats of JSON content
      let parsed;

      if (typeof jsonContent === 'string') {
        console.log('CraftRenderer: Attempting to parse string content');
        try {
          // First try direct parsing
          parsed = JSON.parse(jsonContent);
          console.log('CraftRenderer: First parse successful, result type:', typeof parsed);

          // Check if the parsed content is also a string (double-stringified)
          if (typeof parsed === 'string') {
            console.log('CraftRenderer: Parsed result is still a string, attempting second parse');
            parsed = JSON.parse(parsed);
            console.log('CraftRenderer: Second parse successful, result type:', typeof parsed);
          }
        } catch (parseError) {
          console.log('CraftRenderer: Initial parse failed:', parseError.message);
          // If that fails, try removing outer quotes and parsing again
          if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
            console.log('CraftRenderer: Content appears to be quoted, attempting to unquote');
            const unescaped = jsonContent.slice(1, -1).replace(/\\\"/, '\"');
            parsed = JSON.parse(unescaped);
            console.log('CraftRenderer: Unquoted parse successful');
          } else {
            console.log('CraftRenderer: Content is not quoted, cannot parse');
            throw parseError; // Re-throw if we can't handle it
          }
        }
      } else {
        // If it's already an object, use it directly
        console.log('CraftRenderer: Content is already an object, using directly');
        parsed = jsonContent;
      }

      console.log('CraftRenderer: Successfully parsed JSON content');
      setParsedContent(parsed);
      setError(null);

      // Find interactive elements in the content
      const elements = findInteractiveElements(parsed);
      setInteractiveElements(elements);
      console.log('CraftRenderer: Found interactive elements:', elements);
    } catch (err) {
      console.error('CraftRenderer: Error parsing JSON content:', err);
      setError(`Error parsing JSON: ${err.message}`);
    }
  }, [jsonContent]);

  // Prepare the render content based on state
  const renderContent = () => {
    // If there's an error, show an error message
    if (error) {
      return (
        <div className={`craft-renderer error p-4 ${isDark ? 'bg-red-900/20 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-300'} border rounded-md`}>
          <p className="font-medium mb-2">Error rendering content: {error}</p>
          <p className="text-sm">This content was created with the new editor but cannot be displayed properly.</p>
        </div>
      );
    }

    // If content is still being parsed, show a loading message
    if (!parsedContent) {
      return (
        <div className={`craft-renderer loading p-4 ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-white text-gray-700'} rounded-md`}>
          <p>Loading content...</p>
        </div>
      );
    }

    // If we have parsed content, render the Craft.js editor
    return (
      <div className={`craft-renderer w-full h-full ${isDark ? 'dark-mode' : 'light-mode'}`} style={rendererStyles}>
        {/* We don't need placeholders anymore as InteractiveRenderer handles this */}

        <Editor
          resolver={{
            Container,
            Text,
            Button,
            Image,
            Card,
            Interactive,
            Table,
            TableText
          }}
          enabled={false} // Disable editing
          onRender={({ render }) => render}
        >
          {/* Use the data prop as recommended in the Craft.js documentation */}
          <Frame data={parsedContent}>
            {/* The Frame will render the content based on the JSON data */}
          </Frame>
        </Editor>
      </div>
    );
  };



  // We still need a useEffect hook to maintain the same hook order,
  // but we don't need to do anything in it since InteractiveRenderer handles script loading
  React.useEffect(() => {
    // Log interactive elements for debugging
    if (interactiveElements.length && parsedContent) {
      console.log('CraftRenderer: Found interactive elements:', interactiveElements);
    }
  }, [interactiveElements, parsedContent]);

  // Return the appropriate content based on state
  return renderContent();
};

export default CraftRenderer;
