import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import CraftRenderer from '../craft/CraftRenderer';
import './TemplatePreview.css';

// Helper function to recursively parse stringified JSON properties (copied from ContentEditor)
function deepParseJsonStrings(value, depth = 0) {
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

// Helper function to safely parse potentially double-stringified JSON (copied from ContentEditor)
function safeParseJson(content, context = 'TemplatePreview') {
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

        // If parsing succeeded and we got an object, we're done
        if (typeof parsed === 'object' && parsed !== null) {
          if (attempts > 1) {
            console.log(`safeParseJson (${context}): Successfully parsed after ${attempts} attempts`);
          }
          return parsed;
        }

        // If we got another string, continue parsing
        if (typeof parsed === 'string' && parsed !== result) {
          result = parsed;
        } else {
          // If we got the same result or something unexpected, stop
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

const TemplatePreview = ({ content, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fallback component for when content is invalid or missing
  const renderFallback = (message = 'No content available') => {
    return (
      <div className={`flex items-center justify-center h-full min-h-[200px] ${
        isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'
      } rounded border-2 border-dashed ${
        isDark ? 'border-slate-600' : 'border-gray-300'
      }`}>
        <div className="text-center">
          <div className="text-lg mb-2">📄</div>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    );
  };

  // Validate and prepare content for CraftRenderer
  const prepareContent = () => {
    try {
      if (!content) {
        console.warn('TemplatePreview: No content provided');
        return null;
      }

      console.log('TemplatePreview: Processing content', {
        type: typeof content,
        isString: typeof content === 'string',
        length: typeof content === 'string' ? content.length : 'N/A',
        preview: typeof content === 'string' ? content.substring(0, 100) + '...' : 'Not a string'
      });

      // Use the same robust parsing logic as ContentEditor
      const parsed = safeParseJson(content, 'TemplatePreview');

      if (!parsed) {
        console.warn('TemplatePreview: safeParseJson returned null');
        return null;
      }

      // Apply deep parsing for nested stringified JSON
      const deepParsed = deepParseJsonStrings(parsed);

      console.log('TemplatePreview: Parsed content structure', {
        hasROOT: !!deepParsed?.ROOT,
        keys: deepParsed ? Object.keys(deepParsed) : 'No keys',
        rootType: deepParsed?.ROOT?.type?.resolvedName
      });

      // Validate that it has the expected Craft.js structure
      if (!deepParsed || !deepParsed.ROOT) {
        console.warn('TemplatePreview: Invalid content structure - missing ROOT node', deepParsed);
        return null;
      }

      return deepParsed;
    } catch (error) {
      console.error('TemplatePreview: Error parsing content:', error);
      console.error('TemplatePreview: Content that failed to parse:', content);
      return null;
    }
  };

  // Get the prepared content for rendering
  const preparedContent = prepareContent();
  // Render the template preview
  if (!preparedContent) {
    return (
      <div className={`template-preview ${className} ${isDark ? 'bg-slate-800' : 'bg-white'} rounded border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
        <div className="h-full">
          {renderFallback('Invalid template content')}
        </div>
      </div>
    );
  }

  return (
    <div className={`template-preview ${className} ${isDark ? 'bg-slate-800' : 'bg-white'} rounded border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
      <div className="h-full template-preview-desktop-mode">
        <CraftRenderer
          jsonContent={preparedContent}
          searchTerm=""
        />
      </div>
    </div>
  );
};

export default TemplatePreview;
