/**
 * JSON parsing utilities for the ContentEditor
 * Handles complex double-stringified JSON scenarios from database storage
 */

/**
 * Recursively parse stringified JSON properties
 * @param {any} value - The value to parse
 * @param {number} depth - Current recursion depth (prevents infinite loops)
 * @returns {any} - The parsed value
 */
export function deepParseJsonStrings(value, depth = 0) {
  // Prevent infinite recursion
  if (depth > 10) {
    console.warn('deepParseJsonStrings: Maximum recursion depth reached');
    return value;
  }

  // 1. Try to parse if it's a string that looks like JSON
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        value = JSON.parse(value); // Parse the string first
      } catch (e) {
        // Not valid JSON, or already parsed by a previous step, return original string
        return value;
      }
    } else {
      // Not a JSON-like string, return as is
      return value;
    }
  }

  // 2. If it's now an array after parsing (or was originally an array), recurse on its items
  if (Array.isArray(value)) {
    return value.map(item => deepParseJsonStrings(item, depth + 1));
  }

  // 3. If it's now an object after parsing (or was originally an object), recurse on its properties
  if (typeof value === 'object' && value !== null) {
    const newObj = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        newObj[key] = deepParseJsonStrings(value[key], depth + 1); // Recurse on each property value
      }
    }
    return newObj;
  }

  // 4. If it's not a string, array, or object (e.g., number, boolean), return as is
  return value;
}

/**
 * Safely parse potentially double-stringified JSON
 * @param {string|object} content - The content to parse
 * @param {string} context - Context for logging purposes
 * @returns {object|null} - The parsed object or null if invalid
 */
export function safeParseJson(content, context = 'unknown') {
  if (!content) {
    return null;
  }

  // If already an object, return as is
  if (typeof content === 'object' && content !== null) {
    return content;
  }

  // If not a string, can't parse
  if (typeof content !== 'string') {
    console.warn(`safeParseJson (${context}): Content is not a string or object:`, typeof content);
    return null;
  }

  // Debug logging for draft context
  if (context === 'draft') {
    console.log(`safeParseJson debug - content length: ${content.length}`);
    console.log(`safeParseJson debug - starts with: "${content.substring(0, 20)}"`);
    console.log(`safeParseJson debug - ends with: "${content.substring(content.length - 20)}"`);
  }

  let result = content;
  let attempts = 0;
  const maxAttempts = 5; // Allow more attempts for complex cases

  try {
    // Keep trying to parse while we have a string that looks like JSON
    while (typeof result === 'string' && attempts < maxAttempts) {
      const trimmed = result.trim();

      // Check if it looks like JSON
      if (!trimmed ||
          (!trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('"'))) {
        break;
      }

      try {
        const parsed = JSON.parse(result);
        attempts++;

        // Debug logging for draft context
        if (context === 'draft') {
          console.log(`safeParseJson debug - attempt ${attempts}, parsed type: ${typeof parsed}`);
          if (typeof parsed === 'object' && parsed !== null) {
            console.log(`safeParseJson debug - parsed object keys:`, Object.keys(parsed).slice(0, 5));
          }
        }

        // If parsing succeeded and we got an object, we're done
        if (typeof parsed === 'object' && parsed !== null) {
          if (attempts > 1 && context !== 'editorJson prop') {
            console.log(`safeParseJson (${context}): Successfully parsed after ${attempts} attempts`);
          }
          return parsed;
        }

        // If we got another string, continue parsing
        if (typeof parsed === 'string' && parsed !== result) {
          result = parsed;
          if (context === 'draft') {
            console.log(`safeParseJson debug - continuing with new string, length: ${result.length}`);
          }
        } else {
          // If we got the same result or something unexpected, stop
          if (context === 'draft') {
            console.log(`safeParseJson debug - stopping, same result or unexpected type`);
          }
          break;
        }
      } catch (parseError) {
        // If parsing failed, we can't continue
        if (attempts === 0) {
          console.error(`safeParseJson (${context}): Initial parse failed:`, parseError.message);
        }
        break;
      }
    }

    // If we still have a string after all attempts, return null
    if (typeof result === 'string') {
      console.warn(`safeParseJson (${context}): Could not parse to object after ${attempts} attempts. Content preview:`, result.substring(0, 200));
      return null;
    }

    return result;
  } catch (error) {
    console.error(`safeParseJson (${context}): Unexpected error:`, error);
    return null;
  }
}

/**
 * Sanitize editor JSON data before deserializing to Craft.js
 * @param {object} jsonData - The JSON data to sanitize
 * @param {object} componentMap - Map of component names to components
 * @returns {object|null} - The sanitized JSON data
 */
export const sanitizeEditorJson = (jsonData, componentMap) => {
  if (!jsonData || typeof jsonData !== 'object') {
    console.error("sanitizeEditorJson received non-object jsonData:", jsonData);
    return null;
  }

  const processNode = (node) => {
    if (!node || typeof node !== 'object' || !node.data || typeof node.data !== 'object') {
      return node;
    }

    if (typeof node.data.props !== 'object' || node.data.props === null) node.data.props = {};
    if (typeof node.data.custom !== 'object' || node.data.custom === null) node.data.custom = {};
    if (typeof node.data.linkedNodes !== 'object' || node.data.linkedNodes === null) node.data.linkedNodes = {};

    if (node.data.displayName && (!node.data.type || typeof node.data.type === 'string')) {
      const componentType = componentMap[node.data.displayName];
      if (componentType) {
        node.data.type = componentType;
      } else {
        console.warn(`Sanitize: Unknown component displayName '${node.data.displayName}' or type '${node.data.type}' not in componentMap.`);
      }
    }

    if (node.data.displayName === 'Collapsible Section') {
      node.data.type = componentMap['Collapsible Section'];
      if (node.data.props && node.data.props.stepsEnabled) {
        const numberOfSteps = node.data.props.numberOfSteps || 3;
        for (let i = 1; i <= numberOfSteps; i++) {
          const stepPropName = `step${i}Children`;
          if (!node.data.props[stepPropName] || !Array.isArray(node.data.props[stepPropName])) {
            node.data.props[stepPropName] = [];
          }
        }
      }
    }

    if (node.data.linkedNodes) {
      Object.keys(node.data.linkedNodes).forEach(key => {
        const linkedNodeId = node.data.linkedNodes[key];
        if (jsonData[linkedNodeId]) {
          jsonData[linkedNodeId] = processNode(jsonData[linkedNodeId]);
        }
      });
    }

    if (node.data.nodes) {
      node.data.nodes.forEach(childId => {
        if (jsonData[childId]) {
          jsonData[childId] = processNode(jsonData[childId]);
        }
      });
    }
    return node;
  };

  Object.keys(jsonData).forEach(nodeId => {
    if (typeof jsonData[nodeId] === 'object' && jsonData[nodeId] !== null) {
        jsonData[nodeId] = processNode(jsonData[nodeId]);
    } else {
        console.warn(`sanitizeEditorJson: Node ${nodeId} is not an object, skipping processNode. Value:`, jsonData[nodeId]);
    }
  });

  return jsonData;
};