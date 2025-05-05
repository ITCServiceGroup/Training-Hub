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

  // Helper function to filter out default placeholder text nodes
  const filterDefaultPlaceholders = (content) => {
    // If content is not an object, return it as is
    if (!content || typeof content !== 'object') return content;

    // Create a deep copy to avoid mutating the original
    const filteredContent = JSON.parse(JSON.stringify(content));

    // List of default placeholder texts
    const defaultTexts = [
      "Click to edit this text",
      "Double-click to edit",
      "Edit this text",
      "Enter text here"
    ];

    // Function to check if a node is a default placeholder
    const isDefaultPlaceholder = (node) => {
      return node &&
             node.type &&
             node.type.resolvedName === 'Text' &&
             node.props &&
             node.props.text &&
             defaultTexts.includes(node.props.text);
    };

    // Function to process nodes recursively and return a list of node IDs to remove
    const findPlaceholdersToRemove = (nodeId, nodes, parentId = null) => {
      const node = nodes[nodeId];
      let nodesToRemove = [];

      // If this is a default placeholder text node, add it to the removal list
      if (isDefaultPlaceholder(node)) {
        nodesToRemove.push({ id: nodeId, parentId });
      }

      // Process child nodes
      if (node && node.nodes && Array.isArray(node.nodes)) {
        node.nodes.forEach(childId => {
          if (nodes[childId]) {
            const childNodesToRemove = findPlaceholdersToRemove(childId, nodes, nodeId);
            nodesToRemove = [...nodesToRemove, ...childNodesToRemove];
          }
        });
      }

      // Process linked nodes
      if (node && node.linkedNodes) {
        Object.entries(node.linkedNodes).forEach(([key, childId]) => {
          if (nodes[childId]) {
            const childNodesToRemove = findPlaceholdersToRemove(childId, nodes, nodeId);
            nodesToRemove = [...nodesToRemove, ...childNodesToRemove];
          }
        });
      }

      return nodesToRemove;
    };

    // Start processing from ROOT if it exists
    if (filteredContent.ROOT) {
      const nodesToRemove = findPlaceholdersToRemove('ROOT', filteredContent);

      // Remove the placeholder nodes from their parent's nodes array
      nodesToRemove.forEach(({ id, parentId }) => {
        if (parentId && filteredContent[parentId] && filteredContent[parentId].nodes) {
          // Remove from parent's nodes array
          filteredContent[parentId].nodes = filteredContent[parentId].nodes.filter(
            nodeId => nodeId !== id
          );

          // Also remove from linkedNodes if present
          if (filteredContent[parentId].linkedNodes) {
            Object.entries(filteredContent[parentId].linkedNodes).forEach(([key, linkedId]) => {
              if (linkedId === id) {
                delete filteredContent[parentId].linkedNodes[key];
              }
            });
          }
        }

        // We could delete the node itself, but keeping it for reference
        // Just mark it as hidden to be safe
        if (filteredContent[id]) {
          filteredContent[id].hidden = true;
        }
      });
    }

    return filteredContent;
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

        // Check if the content is already a valid JSON string
        if (jsonContent.trim().startsWith('{') && jsonContent.trim().endsWith('}')) {
          try {
            // First try direct parsing
            parsed = JSON.parse(jsonContent);
            console.log('CraftRenderer: First parse successful, result type:', typeof parsed);

            // Check if the parsed content is also a string (double-stringified)
            if (typeof parsed === 'string') {
              console.log('CraftRenderer: Parsed result is still a string, attempting second parse');
              try {
                parsed = JSON.parse(parsed);
                console.log('CraftRenderer: Second parse successful, result type:', typeof parsed);
              } catch (secondParseError) {
                console.log('CraftRenderer: Second parse failed, treating first parse result as content:', secondParseError.message);
                // If second parse fails, use the result from the first parse
                // This handles cases where the content is a valid JSON string but not a Craft.js structure
              }
            }
          } catch (parseError) {
            console.log('CraftRenderer: Initial parse failed:', parseError.message);
            // If that fails, try removing outer quotes and parsing again
            if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
              console.log('CraftRenderer: Content appears to be quoted, attempting to unquote');
              try {
                // Handle escaped quotes properly
                const unescaped = jsonContent.slice(1, -1).replace(/\\"/g, '"');
                parsed = JSON.parse(unescaped);
                console.log('CraftRenderer: Unquoted parse successful');
              } catch (unescapeError) {
                console.log('CraftRenderer: Unquoted parse failed:', unescapeError.message);
                throw unescapeError;
              }
            } else {
              console.log('CraftRenderer: Content is not quoted, cannot parse');
              throw parseError; // Re-throw if we can't handle it
            }
          }
        } else if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
          // Handle case where the entire content is a quoted string
          console.log('CraftRenderer: Content appears to be a quoted string, attempting to unquote');
          try {
            // Handle escaped quotes properly
            const unescaped = jsonContent.slice(1, -1).replace(/\\"/g, '"');

            // Check if the unescaped content is a JSON object
            if (unescaped.trim().startsWith('{') && unescaped.trim().endsWith('}')) {
              parsed = JSON.parse(unescaped);
              console.log('CraftRenderer: Unquoted parse successful');
            } else {
              console.log('CraftRenderer: Unquoted content is not a JSON object');
              throw new Error('Unquoted content is not a valid JSON object');
            }
          } catch (unescapeError) {
            console.log('CraftRenderer: Unquoted parse failed:', unescapeError.message);
            throw unescapeError;
          }
        } else {
          console.log('CraftRenderer: Content does not appear to be JSON');
          throw new Error('Content is not in a recognized JSON format');
        }
      } else if (typeof jsonContent === 'object' && jsonContent !== null) {
        // If it's already an object, use it directly
        console.log('CraftRenderer: Content is already an object, using directly');
        parsed = jsonContent;
      } else {
        console.log('CraftRenderer: Content is neither a string nor an object');
        throw new Error('Content must be a JSON string or object');
      }

      // Validate that the parsed content has the expected Craft.js structure
      if (!parsed || typeof parsed !== 'object' || (!parsed.ROOT && !parsed.root)) {
        console.error('CraftRenderer: Parsed content does not have the expected Craft.js structure');
        setError('Content does not have the expected structure. It may not be a valid Craft.js JSON.');
        return;
      }

      console.log('CraftRenderer: Successfully parsed JSON content');

      // Filter out default placeholder text nodes
      const filteredContent = filterDefaultPlaceholders(parsed);
      console.log('CraftRenderer: Filtered out default placeholder text nodes');

      setParsedContent(filteredContent);
      setError(null);

      // Find interactive elements in the content
      const elements = findInteractiveElements(filteredContent);
      setInteractiveElements(elements);
      console.log('CraftRenderer: Found interactive elements:', elements);

      console.log('CraftRenderer: Successfully parsed JSON content');
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
          onRender={({ render, node }) => {
            // First check if node exists and has the necessary properties
            if (node && node.data && node.data.type &&
                node.data.type.resolvedName === 'Container' &&
                node.data.props && node.data.props.flexDirection === 'row') {
              // Add a class to ensure horizontal containers are properly styled
              const originalRender = render;
              return (props) => {
                const element = originalRender(props);
                // Ensure the craft-container-horizontal class is applied
                if (element && element.props && element.props.className) {
                  if (!element.props.className.includes('craft-container-horizontal')) {
                    const newClassName = `${element.props.className} craft-container-horizontal`;
                    return React.cloneElement(element, { className: newClassName });
                  }
                }
                return element;
              };
            }
            // Just return the original render function if conditions aren't met
            return render;
          }}
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
