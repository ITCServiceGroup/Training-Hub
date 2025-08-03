import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

// Helper function to decode HTML entities
const decodeHtmlEntities = (text) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Helper function to strip HTML tags
const stripHtmlTags = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper function to extract a preview from HTML or JSON content
const extractPreview = (content, maxLength = 300) => {
  if (!content) return '';

  // Check if content is JSON (Craft.js format)
  const isJsonContent = (() => {
    try {
      // Check if it's a string that looks like JSON
      if (typeof content === 'string') {
        const trimmed = content.trim();

        // Check for JSON object format
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))) {

          // Look for Craft.js indicators
          if (trimmed.includes('resolvedName') ||
              trimmed.includes('"ROOT"') ||
              trimmed.includes('"root"') ||
              trimmed.includes('\\"ROOT\\"') ||
              trimmed.includes('\\"root\\"') ||
              trimmed.includes('\\"resolvedName\\"')) {
            return true;
          }

          // Look for text properties which indicate content
          if (trimmed.includes('"text"') || trimmed.includes('\\"text\\"')) {
            return true;
          }

          // Try parsing it
          try {
            let parsed = JSON.parse(trimmed);

            // Handle double-stringified JSON
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch (innerError) {
                // If we can't parse it as JSON, but it has text indicators, still treat as JSON
                if (parsed.includes('"text"') || parsed.includes('\\"text\\"')) {
                  return true;
                }
              }
            }

            // Check for Craft.js structure
            if (parsed.ROOT || parsed.root ||
                (typeof parsed === 'object' &&
                 Object.values(parsed).some(v => v && v.props && v.props.text))) {
              return true;
            }
          } catch (e) {
            // Not valid JSON or not Craft.js format
            // But if it has text indicators, still treat as JSON for extraction
            if (trimmed.includes('"text"') || trimmed.includes('\\"text\\"')) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  })();

  // If it's JSON content, extract text from it
  if (isJsonContent) {
    try {
      // Try to parse the JSON content
      let parsed;
      if (typeof content === 'string') {
        try {
          parsed = JSON.parse(content);
          // Handle double-stringified JSON
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
        } catch (e) {
          // If parsing fails, try to extract text directly
          return "Interactive content created with Content Editor";
        }
      } else {
        parsed = content;
      }

      // Extract text from Text components in the correct visual order
      let textContent = [];

      // Helper function to check if text is a default placeholder
      const isDefaultText = (text) => {
        const defaultTexts = [
          "Click to edit this text",
          "Double-click to edit",
          "Edit this text",
          "Enter text here"
        ];
        return defaultTexts.includes(text);
      };

      // Function to extract text following the visual hierarchy
      const extractTextInVisualOrder = (rootNode, allNodes) => {
        if (!rootNode || !allNodes) return;

        // Skip processing if this is a hidden node
        if (rootNode.hidden === true) return;

        // If this is a Text component, add its text to our collection
        if (rootNode.type && rootNode.type.resolvedName === 'Text' &&
            rootNode.props && rootNode.props.text &&
            typeof rootNode.props.text === 'string') {

          // Skip default placeholder text
          if (!isDefaultText(rootNode.props.text)) {
            textContent.push(rootNode.props.text);
          }
        }

        // Process child nodes in the order they appear in the nodes array
        if (rootNode.nodes && Array.isArray(rootNode.nodes)) {
          rootNode.nodes.forEach(nodeId => {
            if (allNodes[nodeId]) {
              extractTextInVisualOrder(allNodes[nodeId], allNodes);
            }
          });
        }

        // Process linked nodes
        if (rootNode.linkedNodes) {
          Object.values(rootNode.linkedNodes).forEach(nodeId => {
            if (allNodes[nodeId]) {
              extractTextInVisualOrder(allNodes[nodeId], allNodes);
            }
          });
        }
      };

      // Recursive function for backward compatibility and to catch any nodes
      // that might not be in the visual hierarchy
      const extractTextFromNodes = (nodes) => {
        if (!nodes) return;

        Object.values(nodes).forEach(node => {
          // Skip processing if this is a hidden node
          if (node.hidden === true) return;

          // Check for Text components
          if (node.type && node.type.resolvedName === 'Text' &&
              node.props && node.props.text &&
              typeof node.props.text === 'string') {

            // Skip default placeholder text
            if (!isDefaultText(node.props.text)) {
              // Only add if not already in the array
              if (!textContent.includes(node.props.text)) {
                textContent.push(node.props.text);
              }
            }
          }

          // Check for nodes property (for nested components)
          if (node.nodes) {
            extractTextFromNodes(node.nodes);
          }

          // Check for linkedNodes property
          if (node.linkedNodes) {
            extractTextFromNodes(node.linkedNodes);
          }
        });
      };

      // First try to extract text in visual order
      if (parsed.ROOT) {
        // Extract text following the visual hierarchy
        extractTextInVisualOrder(parsed.ROOT, parsed);
      }

      // If we didn't get any text, fall back to the old method
      if (textContent.length === 0) {
        // Check different possible structures
        if (parsed.nodes) {
          extractTextFromNodes(parsed.nodes);
        } else if (parsed.ROOT && parsed.ROOT.nodes) {
          extractTextFromNodes(parsed.ROOT.nodes);
        } else if (parsed.ROOT) {
          // Try to extract from ROOT directly
          extractTextFromNodes({ ROOT: parsed.ROOT });
        } else {
          // Try to extract from the entire object
          extractTextFromNodes(parsed);
        }
      }

      // If we found text content, use it
      if (textContent.length > 0) {
        let preview = textContent.join(' ').replace(/\s+/g, ' ').trim();
        preview = stripHtmlTags(preview);
        preview = decodeHtmlEntities(preview);
        return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
      }

      // Try to extract any text from the JSON string as a last resort
      if (typeof content === 'string') {
        // Look for text patterns in the JSON string
        const textMatches = content.match(/"text":"([^"]+)"/g);
        if (textMatches && textMatches.length > 0) {
          const extractedTexts = textMatches.map(match => {
            return match.replace(/"text":"/, '').replace(/"$/, '');
          });

          if (extractedTexts.length > 0) {
            let preview = extractedTexts.join(' ').replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();
            preview = stripHtmlTags(preview);
            preview = decodeHtmlEntities(preview);
            return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
          }
        }

        // Try to handle double-escaped JSON strings
        if (content.includes('\\"text\\"')) {
          const doubleEscapedMatches = content.match(/\\"text\\":\\"([^\\]+)\\"/g);
          if (doubleEscapedMatches && doubleEscapedMatches.length > 0) {
            const extractedTexts = doubleEscapedMatches.map(match => {
              return match.replace(/\\"text\\":\\"/, '').replace(/\\"$/, '');
            });

            if (extractedTexts.length > 0) {
              let preview = extractedTexts.join(' ').replace(/\\\\/g, '\\').replace(/\s+/g, ' ').trim();
              preview = stripHtmlTags(preview);
              preview = decodeHtmlEntities(preview);
              return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
            }
          }
        }
      }

      // Default message if no text found
      return "Interactive content created with Content Editor";
    } catch (error) {
      console.error("Error extracting preview from JSON:", error);
      return "Interactive content created with Content Editor";
    }
  }

  // For HTML content, use the DOMParser approach
  try {
    // Use DOMParser for safer parsing in modern browsers
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Remove unwanted tags
    const unwantedTags = doc.querySelectorAll('style, script, meta, link, head');
    unwantedTags.forEach(tag => tag.remove());

    // Prioritize specific content elements
    const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    let preview = '';
    for (let i = 0; i < Math.min(contentElements.length, 3); i++) {
      const text = contentElements[i].textContent?.trim();
      if (text && text.length > 20) { // Prefer slightly longer text blocks
        preview = text;
        break;
      }
    }

    // Fallback to general text content if no suitable element found
    if (!preview) {
      preview = doc.body?.textContent?.replace(/\s+/g, ' ')?.trim() || '';
    }

    // Apply HTML cleaning to the preview
    preview = stripHtmlTags(preview);
    preview = decodeHtmlEntities(preview);

    return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
  } catch (error) {
    console.error("Error extracting preview:", error);
    // Basic fallback if DOM parsing fails
    let textContent = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    textContent = stripHtmlTags(textContent);
    textContent = decodeHtmlEntities(textContent);
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  }
};

// Helper function to format date (Copied from admin StudyGuideList)
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'In the future'; // Handle potential clock skew
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours < 1) return 'Just now';
        if (diffHours === 1) return '1 hour ago';
        return `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
  }
};

// Simplified Item Component (based on SortableStudyGuideItem)
const PublicStudyGuideItem = ({ guide, onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className={`rounded-lg border-2 ${isDark ? 'border-slate-500' : 'border-gray-300'} overflow-hidden transition-all duration-200 shadow-sm cursor-pointer ${isDark ? 'hover:border-slate-500' : 'hover:border-gray-400'} hover:shadow-md`}
      onClick={() => onSelect(guide)} // Use the passed onSelect handler
    >
      <div className={isDark ? 'bg-slate-800' : 'bg-white'}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} overflow-hidden text-ellipsis whitespace-nowrap`}>
              {guide.title || 'Untitled Guide'}
            </h3>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-4 h-12 overflow-hidden`}>
            {guide.description || extractPreview(guide.content)}
          </div>
        </div>
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'} p-2 px-4 border-t flex justify-between items-center`}>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 mr-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {formatDate(guide.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main List Component
const PublicStudyGuideList = ({ studyGuides = [], onSelect, isLoading, error }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading study guides..." />
      </div>
    );
  }

  if (error) {
    return <div className={`${isDark ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-600 border-red-200'} p-4 rounded-lg border`}>Error loading study guides: {error}</div>;
  }

  if (!studyGuides || studyGuides.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} rounded-lg border min-h-[200px]`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 font-medium`}>No study guides available</p>
        <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>There are currently no study guides in this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {studyGuides.map((guide) => (
        <PublicStudyGuideItem
          key={guide.id}
          guide={guide}
          onSelect={onSelect} // Pass the handler down
        />
      ))}
    </div>
  );
};

export default PublicStudyGuideList;
