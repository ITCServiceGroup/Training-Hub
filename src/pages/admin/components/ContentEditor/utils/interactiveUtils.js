/**
 * Utility functions for handling interactive elements in the ContentEditor
 */

/**
 * Converts a shortcode string to an Interactive component node for Craft.js
 * @param {string} shortcode - The shortcode string in format [interactive name="element-name"]
 * @returns {Object|null} - A Craft.js node object or null if invalid
 */
export const shortcodeToInteractiveNode = (shortcode) => {
  // Extract the name from the shortcode
  const nameMatch = shortcode.match(/\[interactive name="([^"]+)"\]/);
  if (!nameMatch || !nameMatch[1]) {
    console.error('Invalid interactive shortcode format:', shortcode);
    return null;
  }

  const name = nameMatch[1];
  
  // Fetch element data from elements.json
  // Use absolute path in dev, relative in production
  const elementsPath = import.meta.env.DEV ? '/interactive-elements/elements.json' : './interactive-elements/elements.json';
  return fetch(elementsPath)
    .then(response => response.json())
    .then(elements => {
      const element = elements.find(el => el.name === name);
      if (!element) {
        console.error(`Interactive element "${name}" not found in elements.json`);
        return null;
      }

      // Create a Craft.js node for the Interactive component
      return {
        type: {
          resolvedName: 'Interactive'
        },
        props: {
          name: element.name,
          title: element.title,
          description: element.description
        },
        displayName: 'Interactive',
        custom: {
          displayName: element.title
        }
      };
    })
    .catch(error => {
      console.error('Error fetching interactive elements:', error);
      return null;
    });
};

/**
 * Converts an Interactive component node to a shortcode string
 * @param {Object} node - The Craft.js node object
 * @returns {string} - The shortcode string
 */
export const interactiveNodeToShortcode = (node) => {
  if (!node || !node.props || !node.props.name) {
    console.error('Invalid interactive node:', node);
    return '';
  }

  return `[interactive name="${node.props.name}"]`;
};

/**
 * Processes HTML content to replace shortcodes with Interactive components
 * @param {string} content - The HTML content with shortcodes
 * @returns {Promise<string>} - The processed content with Interactive components
 */
export const processShortcodes = async (content) => {
  if (!content) return content;

  // Find all shortcodes in the content
  const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
  const matches = content.match(shortcodeRegex);
  
  if (!matches) return content;

  let processedContent = content;
  
  // Process each shortcode
  for (const shortcode of matches) {
    const node = await shortcodeToInteractiveNode(shortcode);
    if (node) {
      // Replace the shortcode with a placeholder that can be processed by Craft.js
      processedContent = processedContent.replace(
        shortcode,
        `<div data-interactive="${node.props.name}"></div>`
      );
    }
  }

  return processedContent;
};

/**
 * Processes Craft.js content to replace Interactive components with shortcodes
 * @param {Object} craftContent - The Craft.js content object
 * @returns {Object} - The processed content with shortcodes
 */
export const processInteractives = (craftContent) => {
  if (!craftContent) return craftContent;

  // Deep clone the content to avoid modifying the original
  const processedContent = JSON.parse(JSON.stringify(craftContent));
  
  // Recursively process all nodes
  const processNode = (nodeId, nodes) => {
    const node = nodes[nodeId];
    
    // If this is an Interactive node, convert it to a shortcode
    if (node && node.type && node.type.resolvedName === 'Interactive') {
      // Create a Text node with the shortcode
      const shortcode = interactiveNodeToShortcode(node);
      nodes[nodeId] = {
        type: {
          resolvedName: 'Text'
        },
        props: {
          text: shortcode,
          fontSize: '16',
          textAlign: 'center'
        },
        displayName: 'Interactive Shortcode',
        custom: {
          displayName: node.props.title || 'Interactive Element'
        }
      };
    }
    
    // Process child nodes
    if (node && node.nodes && node.nodes.length) {
      node.nodes.forEach(childId => processNode(childId, nodes));
    }
  };
  
  // Start processing from the ROOT node
  if (processedContent.ROOT) {
    processNode('ROOT', processedContent);
  }
  
  return processedContent;
};
