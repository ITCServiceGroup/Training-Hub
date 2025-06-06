import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { useTheme } from '../../contexts/ThemeContext';
import { countSearchTermOccurrences } from '../../utils/contentTextExtractor';

// Import the components used in the ContentEditor
// These need to match exactly what's used in the ContentEditor
import { Container } from '../../pages/admin/components/ContentEditor/components/selectors/Container';
import { Text } from '../../pages/admin/components/ContentEditor/components/selectors/Text';
import { CollapsibleSection } from '../../pages/admin/components/ContentEditor/components/selectors/CollapsibleSection';
import { Button } from '../../pages/admin/components/ContentEditor/components/selectors/Button';
import { Image } from '../../pages/admin/components/ContentEditor/components/selectors/Image';
import { Card } from '../../pages/admin/components/ContentEditor/components/selectors/Card';
import { Interactive } from '../../pages/admin/components/ContentEditor/components/selectors/Interactive';
import { Table } from '../../pages/admin/components/ContentEditor/components/selectors/Table';
import { TableText } from '../../pages/admin/components/ContentEditor/components/selectors/Table/TableText';
import { Tabs } from '../../pages/admin/components/ContentEditor/components/selectors/Tabs'; // Added Tabs import
import InteractiveRenderer from '../../pages/admin/components/ContentEditor/components/selectors/Interactive/InteractiveRenderer';

import './CraftRenderer.css';

/**
 * Component for rendering Craft.js JSON content without editing capabilities
 * This follows the official Craft.js documentation for rendering JSON content
 */
const CraftRenderer = React.forwardRef(({ jsonContent, searchTerm }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [parsedContent, setParsedContent] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [interactiveElements, setInteractiveElements] = React.useState([]);
  const rendererRef = React.useRef(null);

  // Add custom styles for the renderer
  const rendererStyles = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#1e293b',
    width: '100%',
    overflow: 'auto',
    padding: '0',
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
              }
            }
          } catch (parseError) {
            console.log('CraftRenderer: Initial parse failed:', parseError.message);
            if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
              console.log('CraftRenderer: Content appears to be quoted, attempting to unquote');
              try {
                const unescaped = jsonContent.slice(1, -1).replace(/\\"/g, '"');
                parsed = JSON.parse(unescaped);
                console.log('CraftRenderer: Unquoted parse successful');
              } catch (unescapeError) {
                console.log('CraftRenderer: Unquoted parse failed:', unescapeError.message);
                throw unescapeError;
              }
            } else {
              console.log('CraftRenderer: Content is not quoted, cannot parse');
              throw parseError;
            }
          }
        } else if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
          console.log('CraftRenderer: Content appears to be a quoted string, attempting to unquote');
          try {
            const unescaped = jsonContent.slice(1, -1).replace(/\\"/g, '"');
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
        console.log('CraftRenderer: Content is already an object, using directly');
        parsed = jsonContent;
      } else {
        console.log('CraftRenderer: Content is neither a string nor an object');
        throw new Error('Content must be a JSON string or object');
      }

      if (!parsed || typeof parsed !== 'object' || (!parsed.ROOT && !parsed.root)) {
        console.error('CraftRenderer: Parsed content does not have the expected Craft.js structure');
        setError('Content does not have the expected structure. It may not be a valid Craft.js JSON.');
        return;
      }

      // No specific pre-processing for Tabs or CollapsibleSection children props needed here,
      // as components now use standard canvas rendering.
      console.log('CraftRenderer: Skipping specific children prop population for Tabs/CollapsibleSection.');

      const filteredContent = filterDefaultPlaceholders(parsed);
      console.log('CraftRenderer: Filtered out default placeholder text nodes');
      setParsedContent(filteredContent);
      setError(null);

      const elements = findInteractiveElements(filteredContent);
      setInteractiveElements(elements);
      console.log('CraftRenderer: Found interactive elements:', elements);

      console.log('CraftRenderer: Successfully parsed JSON content');
    } catch (err) {
      console.error('CraftRenderer: Error parsing JSON content:', err);
      setError(`Error parsing JSON: ${err.message}`);
    }
  }, [jsonContent]);

  const renderContent = () => {
    if (error) {
      return (
        <div className={`craft-renderer error p-4 ${isDark ? 'bg-red-900/20 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-300'} border rounded-md`}>
          <p className="font-medium mb-2">Error rendering content: {error}</p>
          <p className="text-sm">This content was created with the new editor but cannot be displayed properly.</p>
        </div>
      );
    }

    if (!parsedContent) {
      return (
        <div className={`craft-renderer loading p-4 ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-white text-gray-700'} rounded-md`}>
          <p>Loading content...</p>
        </div>
      );
    }

    return (
      <div
        ref={rendererRef}
        className={`craft-renderer w-full h-full ${isDark ? 'dark-mode' : 'light-mode'}`}
        style={rendererStyles}
      >
        <Editor
          resolver={{
            Container,
            Text,
            Button,
            Image,
            Card,
            Interactive,
            Table,
            TableText,
            CollapsibleSection,
            'Collapsible Section': CollapsibleSection,
            Tabs
          }}
          enabled={false}
          onRender={({ render, node }) => {
            if (node && node.data && node.data.type) {
              // Check if node.data.type is a string (like 'div') or an object with resolvedName
              const nodeResolvedName = typeof node.data.type === 'string' ? node.data.type : node.data.type.resolvedName;

              if (nodeResolvedName === 'Container' &&
                  node.data.props && node.data.props.flexDirection === 'row') {
                const originalRender = render;
                return (props) => {
                  const element = originalRender(props);
                  if (element && element.props && element.props.className) {
                    if (!element.props.className.includes('craft-container-horizontal')) {
                      const newClassName = `${element.props.className} craft-container-horizontal`;
                      return React.cloneElement(element, { className: newClassName });
                    }
                  }
                  return element;
                };
              }

              if (nodeResolvedName === 'CollapsibleSection') {
                // Attempt to correct isCanvas mismatch for existing data
                if (node.data.isCanvas === true) {
                  // This is a direct mutation. If Craft.js has already processed this node based on the
                  // incorrect isCanvas value before onRender is called for it, this might be too late.
                  // However, onRender is often used for such last-minute adjustments.
                  node.data.isCanvas = false;
                }

                if (node.data.props) {
                  // Removed the explicit setting of node.data.props.expanded
                  // defaultProps in the component itself should handle if 'expanded' is missing from saved JSON.

                  // No longer need to ensure stepXChildren props exist here
                  if (node.data.props.border && node.data.props.border.style === 'none') {
                    const originalRender = render;
                    return (props) => {
                      const element = originalRender(props);
                      if (element) {
                        return React.cloneElement(element, {
                          className: `${element.props.className || ''} no-border-override`
                        });
                      }
                      return element;
                    };
                  }
                }
              }

              if (nodeResolvedName === 'Tabs') {
                if (node.data.props) {
                  // No longer need to ensure tabXChildren props exist here
                  if (node.data.props.border && node.data.props.border.style === 'none') {
                    const originalRender = render;
                    return (props) => {
                      const element = originalRender(props);
                      if (element) {
                        return React.cloneElement(element, {
                          className: `${element.props.className || ''} no-border-override`
                        });
                      }
                      return element;
                    };
                  }
                }
              }


            }
            return render;
          }}
        >
          <Frame data={parsedContent} />
        </Editor>
      </div>
    );
  };

  React.useEffect(() => {
    if (interactiveElements.length && parsedContent) {
      console.log('CraftRenderer: Found interactive elements:', interactiveElements);
    }
  }, [interactiveElements, parsedContent]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    highlightSearchTerm: (term) => {
      if (!term || !rendererRef.current) return 0;

      try {
        // Get the renderer DOM element
        const rendererElement = rendererRef.current;

        // Get all text content from the renderer for consistent counting
        const allText = rendererElement.textContent || '';
        // Use our consistent counting method to get the expected number of matches
        const expectedMatches = countSearchTermOccurrences(allText, term);
        console.log(`CraftRenderer: Expected to find ${expectedMatches} matches for "${term}" based on consistent counting method`);

        // First, remove any existing highlights
        const existingHighlights = rendererElement.querySelectorAll('.search-highlight');
        existingHighlights.forEach(el => {
          const parent = el.parentNode;
          parent.replaceChild(document.createTextNode(el.textContent), el);
          // Normalize the parent to merge adjacent text nodes
          parent.normalize();
        });

        // Note: We're now just highlighting without relying on our own count
        // The StudyGuideViewer component will use its own consistent count

        // Function to highlight text in a node
        const highlightTextInNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const lowerText = text.toLowerCase();
            const lowerTerm = term.toLowerCase();

            if (lowerText.includes(lowerTerm)) {
              const parts = [];
              let lastIndex = 0;
              let index = lowerText.indexOf(lowerTerm);
              let matchesInNode = 0;

              while (index !== -1) {
                // Add text before the match
                if (index > lastIndex) {
                  parts.push(document.createTextNode(text.substring(lastIndex, index)));
                }

                // Create highlight element for the match
                const highlight = document.createElement('span');
                highlight.className = 'search-highlight';
                highlight.style.backgroundColor = '#ffeb3b';
                highlight.style.color = '#000';
                highlight.style.padding = '0 2px';
                highlight.style.borderRadius = '2px';
                highlight.style.border = '1px solid #f59e0b';
                highlight.style.boxShadow = '0 0 2px rgba(0,0,0,0.2)';
                // Use the actual case from the original text
                highlight.textContent = text.substring(index, index + lowerTerm.length);
                parts.push(highlight);

                // Count this match
                matchesInNode++;

                // Update lastIndex
                lastIndex = index + lowerTerm.length;

                // Find next occurrence
                index = lowerText.indexOf(lowerTerm, lastIndex);
              }

              // Add remaining text
              if (lastIndex < text.length) {
                parts.push(document.createTextNode(text.substring(lastIndex)));
              }

              // Replace the original text node with the highlighted parts
              if (parts.length > 0) {
                const fragment = document.createDocumentFragment();
                parts.forEach(part => fragment.appendChild(part));
                node.parentNode.replaceChild(fragment, node);
                return matchesInNode; // Return the number of matches in this node
              }
            }
          }
          return 0; // No matches in this node
        };

        // Create a snapshot of the DOM before we start modifying it
        // This is important because TreeWalker can get confused when we modify the DOM
        const allTextNodes = [];
        const collectTextNodes = (root) => {
          const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                // Skip empty text nodes and nodes in script/style elements
                if (node.textContent.trim() === '') return NodeFilter.FILTER_REJECT;
                const parent = node.parentNode;
                if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
              }
            },
            false
          );

          let node;
          while ((node = walker.nextNode())) {
            allTextNodes.push(node);
          }
        };

        // Collect all text nodes first
        collectTextNodes(rendererElement);

        // Now process each text node
        let totalMatches = 0;
        const highlightedNodes = [];

        allTextNodes.forEach(node => {
          const matchesInNode = highlightTextInNode(node);
          if (matchesInNode > 0) {
            totalMatches += matchesInNode;
            highlightedNodes.push(node);
          }
        });

        // Log the actual count for debugging
        console.log(`Found ${totalMatches} actual matches for "${term}" using DOM traversal`);

        // No longer auto-scrolling to the first highlight
        // Just log the number of matches found
        if (totalMatches > 0) {
          console.log(`Found ${totalMatches} matches for "${term}" - auto-scrolling disabled`);
        }

        // Always return the expected count from our consistent counting method
        // This ensures the count shown in the study guide matches the count in search results
        if (totalMatches !== expectedMatches) {
          console.log(`WARNING: DOM traversal found ${totalMatches} matches but consistent counting method found ${expectedMatches} matches. Using consistent count.`);
        }

        // Always return the expected count to ensure consistency
        return expectedMatches;
      } catch (e) {
        console.error('Error highlighting search term:', e);
        return 0;
      }
    }
  }));

  // Apply search highlighting when searchTerm changes or content is loaded
  React.useEffect(() => {
    if (searchTerm && rendererRef.current && parsedContent) {
      // Wait a bit for the content to fully render
      const timer = setTimeout(() => {
        try {
          const api = ref.current;
          if (api && api.highlightSearchTerm) {
            const count = api.highlightSearchTerm(searchTerm);
            console.log(`CraftRenderer useEffect: Applied highlighting for "${searchTerm}", found ${count} matches`);
          }
        } catch (e) {
          console.error('Error highlighting search term:', e);
        }
      }, 1500); // Increased timeout to ensure content is fully rendered

      return () => clearTimeout(timer);
    }
  }, [searchTerm, parsedContent, ref, isDark]);

  return renderContent();
});

export default CraftRenderer;
