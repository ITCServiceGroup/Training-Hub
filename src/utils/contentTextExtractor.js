/**
 * Utility functions for extracting plain text from various content formats
 * Used for search functionality and content previews
 */

/**
 * Extract plain text from Craft.js JSON content
 * @param {string|object} content - The content to extract text from (JSON string or object)
 * @returns {string} - The extracted plain text
 */
export const extractTextFromContent = (content) => {
  if (!content) return '';

  try {
    // If content is already plain text (not JSON), just clean and return it
    if (typeof content === 'string') {
      // Quick check if this is likely plain text and not JSON/HTML
      if (!content.includes('{') && !content.includes('<') &&
          !content.includes('"text":') && !content.includes('\\"text\\":')) {
        return cleanTextContent(content);
      }

      // If it's HTML content, extract text from it
      if (content.includes('<') && content.includes('>') &&
          (content.includes('<p>') || content.includes('<div>') || content.includes('<span>'))) {
        return extractTextFromHtml(content);
      }
    }

    // Try to extract text directly using regex first (works even with malformed JSON)
    if (typeof content === 'string' &&
        (content.includes('"text":') || content.includes('\\"text\\":'))) {
      // Extract all text values from JSON-like strings
      const directExtract = extractTextDirectly(content);
      if (directExtract && directExtract.length > 10) {
        return directExtract;
      }
    }

    // Parse the content if it's a string
    let parsedContent = content;
    if (typeof content === 'string') {
      try {
        // Handle double-stringified JSON (common in Craft.js saved content)
        if (content.includes('\\"ROOT\\"') || content.includes('\\"props\\"')) {
          try {
            // First parse to get the string
            const firstParse = JSON.parse(content);
            // Then parse the string to get the object
            parsedContent = JSON.parse(firstParse);
          } catch (e) {
            // If double parsing fails, try single parse
            try {
              parsedContent = JSON.parse(content);
            } catch (parseError) {
              // If all parsing fails, use direct extraction
              return extractTextDirectly(content);
            }
          }
        } else if (content.startsWith('{') && content.endsWith('}')) {
          // Regular JSON
          try {
            parsedContent = JSON.parse(content);
          } catch (parseError) {
            // If parsing fails, use direct extraction
            return extractTextDirectly(content);
          }
        } else if (content.startsWith('"') && content.endsWith('"')) {
          // Quoted JSON string
          try {
            const unquoted = JSON.parse(content);
            if (typeof unquoted === 'string' && unquoted.startsWith('{') && unquoted.endsWith('}')) {
              try {
                parsedContent = JSON.parse(unquoted);
              } catch (parseError) {
                // If parsing fails, use the unquoted content
                return extractTextDirectly(unquoted);
              }
            } else {
              parsedContent = unquoted;
            }
          } catch (e) {
            // If parsing fails, use the original content
            return cleanTextContent(content);
          }
        } else {
          // Not JSON, use as is
          return cleanTextContent(content);
        }
      } catch (e) {
        // If parsing fails, use the original content
        return cleanTextContent(content);
      }
    }

    // If we have a parsed object, extract text from it
    if (typeof parsedContent === 'object' && parsedContent !== null) {
      const extractedText = extractTextFromCraftNodes(parsedContent);
      if (extractedText && extractedText.trim().length > 0) {
        return extractedText;
      }
    }

    // If we couldn't parse or extract, try direct extraction one more time
    if (typeof content === 'string') {
      const directExtract = extractTextDirectly(content);
      if (directExtract && directExtract.length > 0) {
        return directExtract;
      }
    }

    // Last resort: return the original content cleaned
    return cleanTextContent(String(content));
  } catch (e) {
    console.error('Error extracting text from content:', e);
    // Try direct extraction as a last resort
    if (typeof content === 'string') {
      return extractTextDirectly(content);
    }
    return '';
  }
};

/**
 * Extract text directly from a string using regex patterns
 * This is useful when JSON parsing fails
 * @param {string} str - The string to extract text from
 * @returns {string} - The extracted text
 */
const extractTextDirectly = (str) => {
  if (typeof str !== 'string') return '';

  let extractedText = '';

  // Extract text from "text":"value" patterns (common in Craft.js)
  const textRegex = /"text"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = textRegex.exec(str)) !== null) {
    extractedText += match[1] + ' ';
  }

  // Extract text from escaped "text":"value" patterns
  const escapedTextRegex = /\\"text\\"\s*:\s*\\"([^"]+)\\"/g;
  while ((match = escapedTextRegex.exec(str)) !== null) {
    extractedText += match[1] + ' ';
  }

  // Extract text from "children":"value" patterns
  const childrenRegex = /"children"\s*:\s*"([^"]+)"/g;
  while ((match = childrenRegex.exec(str)) !== null) {
    extractedText += match[1] + ' ';
  }

  // Extract text from "childrenString":"value" patterns
  const childrenStringRegex = /"childrenString"\s*:\s*"([^"]+)"/g;
  while ((match = childrenStringRegex.exec(str)) !== null) {
    extractedText += match[1] + ' ';
  }

  // Extract text from HTML-like content
  const htmlRegex = />([^<>]+)</g;
  while ((match = htmlRegex.exec(str)) !== null) {
    if (match[1] && match[1].trim()) {
      extractedText += match[1].trim() + ' ';
    }
  }

  // If we still don't have much text, try to extract any quoted strings that look like text
  if (extractedText.length < 10) {
    const quotedStrings = [];
    const stringRegex = /"((?:\\"|[^"])*)"/g;

    while ((match = stringRegex.exec(str)) !== null) {
      const extractedString = match[1];
      if (extractedString &&
          extractedString.length > 5 &&
          /[a-zA-Z]{3,}/.test(extractedString) &&
          !['id', 'type', 'props', 'data', 'nodes', 'ROOT', 'resolvedName'].includes(extractedString)) {
        quotedStrings.push(extractedString);
      }
    }

    // Filter out strings that are likely not text content
    const likelyTextStrings = quotedStrings.filter(text => {
      // Skip strings that look like IDs or other non-text values
      if (text.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return false;
      if (text.match(/^[0-9a-f]{24}$/i)) return false; // MongoDB ObjectId format
      if (text.match(/^\d+$/)) return false; // Just numbers
      if (text.match(/^[#0-9a-f]{3,7}$/i)) return false; // Likely a color code

      // Keep strings that have spaces or look like sentences
      return text.includes(' ') || (text.length > 5 && /[A-Za-z]/.test(text));
    });

    if (likelyTextStrings.length > 0) {
      extractedText += likelyTextStrings.join(' ');
    }
  }

  return cleanTextContent(extractedText);
};

/**
 * Extract text from Craft.js nodes recursively
 * @param {object} nodes - The Craft.js nodes object
 * @returns {string} - The extracted text
 */
const extractTextFromCraftNodes = (nodes) => {
  const textContent = [];

  // Function to extract text from nodes in visual order
  const extractTextInVisualOrder = (nodeId, allNodes) => {
    const node = allNodes[nodeId];
    if (!node) return;

    // Skip hidden nodes
    if (node.hidden === true) return;

    // Extract text from Text components
    if (node.type &&
        (node.type.resolvedName === 'Text' ||
         (typeof node.type === 'object' && node.type.resolvedName === 'Text')) &&
        node.props) {

      // Extract text from props
      if (node.props.text && typeof node.props.text === 'string') {
        textContent.push(node.props.text);
      }

      // Extract text from children string
      if (node.props.childrenString && typeof node.props.childrenString === 'string') {
        textContent.push(node.props.childrenString);
      }

      // Extract text from children
      if (node.props.children && typeof node.props.children === 'string') {
        textContent.push(node.props.children);
      }
    }

    // Process child nodes in order
    if (node.nodes && Array.isArray(node.nodes)) {
      node.nodes.forEach(childId => {
        extractTextInVisualOrder(childId, allNodes);
      });
    }

    // Process linked nodes
    if (node.linkedNodes) {
      Object.values(node.linkedNodes).forEach(linkedNodeId => {
        extractTextInVisualOrder(linkedNodeId, allNodes);
      });
    }
  };

  // Function to extract text from any node structure
  const extractTextFromAnyNode = (node) => {
    if (!node) return;

    // Skip hidden nodes
    if (node.hidden === true) return;

    // Extract text from props
    if (node.props) {
      if (node.props.text && typeof node.props.text === 'string') {
        textContent.push(node.props.text);
      }
      if (node.props.childrenString && typeof node.props.childrenString === 'string') {
        textContent.push(node.props.childrenString);
      }
      if (node.props.children && typeof node.props.children === 'string') {
        textContent.push(node.props.children);
      }

      // Handle props.data which might contain nested content
      if (node.props.data && typeof node.props.data === 'object') {
        Object.values(node.props.data).forEach(value => {
          if (typeof value === 'string' && value.length > 5) {
            textContent.push(value);
          }
        });
      }
    }

    // Extract from data.props (another common structure)
    if (node.data && node.data.props) {
      if (node.data.props.text && typeof node.data.props.text === 'string') {
        textContent.push(node.data.props.text);
      }
      if (node.data.props.childrenString && typeof node.data.props.childrenString === 'string') {
        textContent.push(node.data.props.childrenString);
      }
      if (node.data.props.children && typeof node.data.props.children === 'string') {
        textContent.push(node.data.props.children);
      }
    }

    // Process child nodes
    if (node.nodes && Array.isArray(node.nodes)) {
      node.nodes.forEach(childId => {
        if (typeof childId === 'string' && nodes[childId]) {
          extractTextFromAnyNode(nodes[childId]);
        }
      });
    }

    // Process linked nodes
    if (node.linkedNodes) {
      Object.values(node.linkedNodes).forEach(linkedNodeId => {
        if (typeof linkedNodeId === 'string' && nodes[linkedNodeId]) {
          extractTextFromAnyNode(nodes[linkedNodeId]);
        }
      });
    }

    // Process children array if it exists
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        if (typeof child === 'string') {
          textContent.push(child);
        } else if (typeof child === 'object') {
          extractTextFromAnyNode(child);
        }
      });
    }
  };

  // Try different approaches to extract text

  // 1. Start extraction from the ROOT node if it exists
  if (nodes.ROOT) {
    extractTextInVisualOrder('ROOT', nodes);
  } else if (nodes.root) {
    // Some Craft.js structures use lowercase 'root'
    extractTextInVisualOrder('root', nodes);
  } else {
    // 2. If no ROOT node, try to extract from all top-level nodes
    Object.keys(nodes).forEach(nodeId => {
      const node = nodes[nodeId];

      // Skip if this is not a top-level node
      if (node.parent) return;

      extractTextInVisualOrder(nodeId, nodes);
    });
  }

  // 3. If we didn't get any text, try a more aggressive approach
  if (textContent.length === 0) {
    // Extract all text from all nodes regardless of structure
    Object.values(nodes).forEach(node => {
      extractTextFromAnyNode(node);
    });
  }

  // 4. If we still don't have text, try one more approach for complex nested structures
  if (textContent.length === 0) {
    // Look for any string property that might contain text
    const findTextInObject = (obj, depth = 0) => {
      if (depth > 5) return; // Prevent infinite recursion

      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        // Skip common non-text properties
        if (['id', 'type', 'parent', 'nodes', 'linkedNodes'].includes(key)) return;

        if (typeof value === 'string' && value.length > 5 && /[a-zA-Z]{3,}/.test(value)) {
          // Only add strings that look like actual text (contain at least 3 consecutive letters)
          textContent.push(value);
        } else if (typeof value === 'object' && value !== null) {
          findTextInObject(value, depth + 1);
        }
      });
    };

    findTextInObject(nodes);
  }

  // Join all text content with spaces
  return textContent.join(' ');
};

/**
 * Extract text from HTML content
 * @param {string} htmlContent - The HTML content
 * @returns {string} - The extracted text
 */
export const extractTextFromHtml = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') return '';

  try {
    // Extract body content if it's a full HTML document
    let bodyContent = htmlContent;
    if (htmlContent.includes('<body')) {
      const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (match) bodyContent = match[1];
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyContent;

    // Get text content
    const text = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up the text
    return cleanTextContent(text);
  } catch (e) {
    console.error('Error extracting text from HTML:', e);

    // Fallback to regex-based extraction
    const textMatches = htmlContent.match(/>([^<>]+)</g) || [];
    const extractedText = textMatches
      .map(match => match.replace(/^>|<$/g, ''))
      .join(' ');

    return cleanTextContent(extractedText);
  }
};

/**
 * Clean up text content by removing extra whitespace, etc.
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
export const cleanTextContent = (text) => {
  if (!text) return '';

  return text
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Count occurrences of a search term in text (case insensitive)
 * This is the single source of truth for counting search term occurrences
 * @param {string} text - The text to search in
 * @param {string} term - The search term to count
 * @returns {number} - The number of occurrences
 */
export const countSearchTermOccurrences = (text, term) => {
  if (!text || !term) return 0;

  // Normalize both text and term for consistent counting
  const normalizedText = cleanTextContent(text).toLowerCase();
  const normalizedTerm = term.toLowerCase().trim();

  if (normalizedTerm === '') return 0;

  // Count occurrences
  let count = 0;
  let pos = normalizedText.indexOf(normalizedTerm);

  while (pos !== -1) {
    count++;
    pos = normalizedText.indexOf(normalizedTerm, pos + 1);
  }

  return count;
};

/**
 * Create a snippet of text around a search query
 * @param {string} text - The full text content
 * @param {string} query - The search query
 * @param {number} snippetLength - The maximum length of the snippet
 * @returns {object} - Object containing the snippet and occurrence information
 */
export const createSearchSnippet = (text, query, snippetLength = 200) => {
  if (!text || !query) return { snippet: text || '', occurrences: [], totalOccurrences: 0 };

  // Use the consistent counting method
  const totalOccurrences = countSearchTermOccurrences(text, query);

  // Find all occurrences of the query in the text (case insensitive) for snippet creation
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const occurrences = [];
  let pos = textLower.indexOf(queryLower);

  // Collect positions of all occurrences
  while (pos !== -1) {
    occurrences.push(pos);
    pos = textLower.indexOf(queryLower, pos + 1);
  }

  // Log the actual count for debugging
  console.log(`createSearchSnippet: Found ${totalOccurrences} occurrences of "${query}" in text`);


  // If no occurrences found, return the beginning of the text
  if (occurrences.length === 0) {
    const snippet = text.length > snippetLength
      ? text.substring(0, snippetLength) + '...'
      : text;
    return { snippet, occurrences: [] };
  }

  // If we have multiple occurrences, try to include more of them in the snippet
  let snippetStart, snippetEnd;
  let focusedOccurrenceIndex = 0; // Track which occurrence we're focusing on

  if (occurrences.length === 1) {
    // Only one occurrence, center the snippet around it
    snippetStart = Math.max(0, occurrences[0] - Math.floor(snippetLength / 2));
    snippetEnd = Math.min(text.length, occurrences[0] + query.length + Math.floor(snippetLength / 2));
    focusedOccurrenceIndex = 0;
  } else if (occurrences.length > 1) {
    // Multiple occurrences - try to include as many as possible

    // Find the region with the highest density of occurrences
    let bestRegionStart = 0;
    let bestRegionEnd = 0;
    let maxOccurrencesInRegion = 0;

    // Try different starting points
    for (let i = 0; i < occurrences.length; i++) {
      const regionStart = occurrences[i];
      const regionEnd = regionStart + snippetLength;

      // Count occurrences in this region
      let occurrencesInRegion = 0;
      for (let j = 0; j < occurrences.length; j++) {
        if (occurrences[j] >= regionStart && occurrences[j] <= regionEnd) {
          occurrencesInRegion++;
        }
      }

      if (occurrencesInRegion > maxOccurrencesInRegion) {
        maxOccurrencesInRegion = occurrencesInRegion;
        bestRegionStart = regionStart;
        bestRegionEnd = regionEnd;
        focusedOccurrenceIndex = i;
      }
    }

    // Set the snippet boundaries based on the best region
    snippetStart = Math.max(0, bestRegionStart - Math.floor(snippetLength / 4));
    snippetEnd = Math.min(text.length, bestRegionEnd);

    // If we're still not getting enough context, adjust
    if (snippetEnd - snippetStart < snippetLength) {
      // Add more context at the end if possible
      snippetEnd = Math.min(text.length, snippetStart + snippetLength);

      // If we still have room, add more context at the beginning
      if (snippetEnd - snippetStart < snippetLength) {
        snippetStart = Math.max(0, snippetEnd - snippetLength);
      }
    }
  } else {
    // No occurrences (shouldn't happen, but just in case)
    snippetStart = 0;
    snippetEnd = Math.min(text.length, snippetLength);
  }

  // Extract the snippet
  let snippet = text.substring(snippetStart, snippetEnd);

  // Add ellipsis if needed
  if (snippetStart > 0) snippet = '...' + snippet;
  if (snippetEnd < text.length) snippet = snippet + '...';

  // Calculate the relative positions of occurrences within the snippet
  const snippetOccurrences = occurrences
    .filter(pos => pos >= snippetStart && pos < snippetEnd)
    .map(pos => ({
      position: pos - snippetStart + (snippetStart > 0 ? 3 : 0), // Adjust for ellipsis
      length: query.length
    }));

  // Return both the snippet and occurrence information
  return {
    snippet,
    occurrences: snippetOccurrences,
    totalOccurrences, // Use our consistent count from countSearchTermOccurrences
    focusedOccurrenceIndex
  };
};
