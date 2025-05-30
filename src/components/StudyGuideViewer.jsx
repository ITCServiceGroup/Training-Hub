import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import CraftRenderer from './craft/CraftRenderer';
import { searchService } from '../services/api/search';
import { countSearchTermOccurrences, extractTextFromContent } from '../utils/contentTextExtractor';

/**
 * Component for displaying study guide content with interactive element support (Web Component Method)
 */
const StudyGuideViewer = ({ studyGuide, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const iframeRef = useRef(null); // Ref for the main content iframe
  const location = useLocation();
  const craftRendererRef = useRef(null); // Ref for the CraftRenderer component

  // State to track if debug mode is enabled
  const [showDebug, setShowDebug] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHighlighted, setSearchHighlighted] = useState(false);
  const [searchMatchCount, setSearchMatchCount] = useState(0);

  // Check for debug mode and search parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setShowDebug(urlParams.get('debug') === 'true');

    // Check for search parameter
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm('');
      setSearchHighlighted(false);
      setSearchMatchCount(0);
    }
  }, [location.search]);

  // Effect to handle search highlighting
  // Function to get the search count directly from the content
  const getSearchMatchCount = (content, term) => {
    if (!content || !term) return 0;

    try {
      // Extract text from content
      const extractedText = extractTextFromContent(content);
      if (!extractedText) return 0;

      // Count occurrences using our consistent counting method
      const count = countSearchTermOccurrences(extractedText, term);
      console.log(`StudyGuideViewer: Direct count found ${count} matches for "${term}"`);
      return count;
    } catch (e) {
      console.error('Error counting search term occurrences:', e);
      return 0;
    }
  };

  useEffect(() => {
    if (searchTerm && studyGuide?.content) {
      // First, get the direct count from the content
      const directCount = getSearchMatchCount(studyGuide.content, searchTerm);

      // Set the count from our direct calculation
      setSearchMatchCount(directCount);
      setSearchHighlighted(directCount > 0);

      // Wait for content to be fully rendered, then highlight (but don't use its count)
      const timer = setTimeout(() => {
        try {
          if (craftRendererRef.current) {
            // Call the highlight method on the CraftRenderer but ignore its count
            craftRendererRef.current.highlightSearchTerm(searchTerm);
            console.log(`StudyGuideViewer: Highlighted search term "${searchTerm}" (using pre-calculated count of ${directCount})`);
          }
        } catch (e) {
          console.error('Error highlighting search term:', e);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setSearchHighlighted(false);
      setSearchMatchCount(0);
    }
  }, [searchTerm, studyGuide, isLoading]);

  // Effect to inject component definition scripts after the main iframe loads
  useEffect(() => {
    const mainIframe = iframeRef.current;
    if (!mainIframe || !studyGuide || !studyGuide.content) return;

    const handleLoad = () => {
      console.log("Main content iframe loaded (for Web Components).");
      const iframeDoc = mainIframe.contentWindow?.document;
      if (!iframeDoc) {
        console.error("Could not access main iframe document.");
        return;
      }

      // Find all unique interactive element names required by the content
      const requiredElements = new Set();
      const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
      let match;
      while ((match = shortcodeRegex.exec(studyGuide.content)) !== null) {
          if (/^[a-zA-Z0-9-]+$/.test(match[1])) { // Basic validation
             requiredElements.add(match[1]);
          }
      }

      console.log("Required interactive elements:", requiredElements);

      // Inject the definition script for each required element if not defined in the iframe context
      requiredElements.forEach(elementName => {
        const tagName = `${elementName}-simulator`;
        const scriptPath = `/interactive-elements/${elementName}/index.js`;
        const iframeWindow = mainIframe.contentWindow;

        // Check if the element is already defined in *this* iframe's context
        if (iframeWindow && !iframeWindow.customElements.get(tagName)) {
          console.log(`Element <${tagName}> not defined. Injecting script: ${scriptPath}`);
          const script = iframeDoc.createElement('script');
          script.src = scriptPath;
          script.type = 'module'; // Add type="module" for ES module support
          script.async = false; // Ensure sequential loading

          // Add error handling for script loading itself
          script.onerror = () => console.error(`Failed to load script: ${scriptPath}`);

          // Append the script to the iframe's body
          iframeDoc.body.appendChild(script);

          // Use whenDefined to wait for the element registration
          iframeWindow.customElements.whenDefined(tagName)
            .then(() => {
              console.log(`Element <${tagName}> successfully defined and registered.`);
            })
            .catch(error => {
              console.error(`Error waiting for element <${tagName}> definition:`, error);
            });

        } else if (iframeWindow && iframeWindow.customElements.get(tagName)) {
          console.log(`Element <${tagName}> already defined in this iframe. Skipping script injection: ${scriptPath}`);
        } else {
          console.warn(`Could not access iframe window or customElements registry to check for <${tagName}>.`);
        }
      });
    };

    // Use 'load' event for srcDoc changes
    mainIframe.addEventListener('load', handleLoad);

    // Cleanup function
    return () => {
      if (mainIframe) {
        mainIframe.removeEventListener('load', handleLoad);
        console.log("Removed main iframe load listener.");
      }
    };
  // Rerun effect only when study guide *content* actually changes
  }, [studyGuide?.content]);


  // Using Tailwind classes instead of inline styles

  // Loading and Empty states remain the same
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 shadow h-full overflow-auto w-full`}>
        <div className={`flex justify-center items-center p-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-gray-700 border-t-teal-500' : 'border-gray-200 border-t-teal-700'} animate-spin mr-3`}></div>
          <span>Loading study guide...</span>
        </div>
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 shadow h-full overflow-auto w-full`}>
        <div className={`text-center p-8 ${isDark ? 'text-gray-400' : 'text-slate-500'} flex flex-col items-center justify-center h-full`}>
          <p>Select a study guide to view its content</p>
        </div>
      </div>
    );
  }

  // Helper to extract style content from a full HTML string
  const extractStyleContent = (fullHtml) => {
    return fullHtml?.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || '';
  };

  // Helper to extract body content from full HTML document
  const extractBodyContent = (htmlContent) => {
    if (!htmlContent) return '';
    // Check if it's a full HTML document
    if (htmlContent.includes('<body')) {
      const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return match ? match[1] : htmlContent; // Return body content or original if no body tag
    }
    // Assume it's body content if no body tag found
    return htmlContent;
  };


  // Process *body* content to replace shortcodes with custom element tags
  // and ensure empty paragraphs are preserved
  const processBodyContentForWebComponents = (bodyContent) => {
    console.log('Processing body content for Web Components:', bodyContent);
    if (!bodyContent) return '';

    // Log the original content for debugging
    console.log('Original content:', bodyContent);

    // First, replace all empty paragraphs with a special marker
    // This is a more aggressive approach to ensure empty paragraphs are preserved
    let processedContent = bodyContent;

    // Replace empty paragraphs with a div that has height
    processedContent = processedContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Also handle paragraphs with non-breaking spaces or just spaces
    processedContent = processedContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Replace consecutive <br> tags with empty lines
    processedContent = processedContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

    // Handle TinyMCE specific empty paragraphs (only if they are visually empty)
    processedContent = processedContent.replace(/<p data-mce-empty="1">(?:<br>|\s|&nbsp;)*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Log the processed content for debugging
    console.log('Processed content (after ALL empty line handling):', processedContent);

    // Replace shortcodes with custom elements wrapped in full-width div
    processedContent = processedContent.replace(/\[interactive name="([^"]+)"\]/g, (_, name) => {
      if (!/^[a-zA-Z0-9-]+$/.test(name)) {
        console.warn(`Invalid interactive element name found in viewer: ${name}`);
        return `<p style="color: red; border: 1px solid red; padding: 5px;">[Invalid interactive element: ${name}]</p>`;
      }
      const tagName = `${name}-simulator`;
      console.log(`Viewer replacing shortcode for "${name}" with <${tagName}>`);

      // Add a script to override the viewport meta tag and styles for this specific interactive element
      return `
        <div style="display: block; width: 100%; box-sizing: border-box;">
          <${tagName} style="width: 100%; max-width: 100%; box-sizing: border-box;"></${tagName}>
          <script>
            // Find the closest iframe containing this element
            (function() {
              // Force desktop layout by overriding any media queries
              const style = document.createElement('style');
              style.textContent = \`
                @media (max-width: 1350px) {
                  #vis-container {
                    grid-template-columns: repeat(12, 1fr) !important;
                    grid-template-rows: repeat(1, auto) !important;
                  }
                }
                @media (max-width: 768px) {
                  #vis-container {
                    grid-template-columns: repeat(12, 1fr) !important;
                    grid-template-rows: repeat(1, auto) !important;
                  }
                  .node {
                    max-width: 60px !important;
                    font-size: 0.8em !important;
                  }
                  .trace-row {
                    grid-template-columns: 35px repeat(3, 65px) 20px auto !important;
                  }
                  .trace-header-row span:nth-child(4),
                  .trace-row span:nth-child(4) {
                    display: inline-block !important;
                  }
                  .trace-col-sep { grid-column: 5 !important; }
                  .trace-col-ip { grid-column: 6 !important; }
                  #trace-output-container { font-size: 14px !important; }
                }
              \`;
              document.head.appendChild(style);

              // Find and update any viewport meta tags
              const viewportMeta = document.querySelector('meta[name="viewport"]');
              if (viewportMeta) {
                viewportMeta.setAttribute('content', 'width=1400, initial-scale=1.0');
              } else {
                const meta = document.createElement('meta');
                meta.setAttribute('name', 'viewport');
                meta.setAttribute('content', 'width=1400, initial-scale=1.0');
                document.head.appendChild(meta);
              }

              // Wait for the custom element to be defined and rendered
              setTimeout(() => {
                // Override the max-width of the vis-container
                const visContainer = document.getElementById('vis-container');
                if (visContainer) {
                  visContainer.style.maxWidth = '100%';
                  visContainer.style.width = '100%';
                  visContainer.style.margin = '0';
                }

                // Override the max-width of the simulator-container
                const simulatorContainer = document.querySelector('.simulator-container');
                if (simulatorContainer) {
                  simulatorContainer.style.maxWidth = '100%';
                  simulatorContainer.style.width = '100%';
                }

                // Override the max-width of the host element
                const customElement = document.querySelector('${tagName}');
                if (customElement && customElement.shadowRoot) {
                  const styleElement = document.createElement('style');
                  styleElement.textContent = \`
                    :host {
                      width: 100% !important;
                      max-width: 100% !important;
                      box-sizing: border-box !important;
                      margin: 0 !important;
                    }
                    .simulator-container {
                      width: 100% !important;
                      max-width: 100% !important;
                      box-sizing: border-box !important;
                    }
                    #vis-container {
                      width: 100% !important;
                      max-width: 100% !important;
                      box-sizing: border-box !important;
                      margin: 0 !important;
                    }
                  \`;
                  customElement.shadowRoot.appendChild(styleElement);
                }
              }, 500);
            })();
          </script>
        </div>
      `;
    });

    return processedContent;
  };

  // Check if content is JSON or HTML
  const isJsonContent = (() => {
    try {
      if (!studyGuide.content) return false;

      // Log the content type and a preview for debugging
      console.log('StudyGuideViewer content type:', typeof studyGuide.content);
      console.log('Content preview:', typeof studyGuide.content === 'string' ? studyGuide.content.substring(0, 100) : 'Non-string content');

      // If it's an object, it's likely JSON
      if (typeof studyGuide.content === 'object') {
        console.log('Content is already an object, likely Craft.js JSON');
        return true;
      }

      // If it's a string, check if it looks like Craft.js JSON
      if (typeof studyGuide.content === 'string') {
        const content = studyGuide.content.trim();

        // Check if it's a JSON string (starts with { and ends with })
        if (content.startsWith('{') && content.endsWith('}')) {
          console.log('Content appears to be a JSON object string');

          // Simple check: if it contains "resolvedName" and "props", it's likely Craft.js JSON
          if (content.includes('resolvedName') && content.includes('props')) {
            console.log('Content appears to be Craft.js JSON');
            return true;
          }

          // Check if it contains "ROOT" or "root", which are common in Craft.js JSON
          if (content.includes('"ROOT"') || content.includes('"root"')) {
            console.log('Content appears to contain ROOT/root node, likely Craft.js JSON');
            return true;
          }

          // Try to parse it as JSON
          try {
            const parsed = JSON.parse(content);
            // If it has ROOT or nodes, it's likely Craft.js JSON
            if (parsed.ROOT || parsed.root ||
                (typeof parsed === 'object' && Object.values(parsed).some(v => v && v.props && v.props.text))) {
              console.log('Content is valid JSON with Craft.js structure');
              return true;
            }
          } catch (parseError) {
            // If parsing fails, it's not valid JSON
            console.log('Content is not valid JSON:', parseError.message);
          }
        }
        // Check if it's a quoted JSON string (starts with " and ends with ")
        else if (content.startsWith('"') && content.endsWith('"')) {
          console.log('Content appears to be a quoted string, checking if it contains JSON');

          try {
            // Try to parse the quoted string
            const unquoted = JSON.parse(content);

            // If the result is a string and looks like JSON
            if (typeof unquoted === 'string') {
              const unquotedTrimmed = unquoted.trim();
              if (unquotedTrimmed.startsWith('{') && unquotedTrimmed.endsWith('}')) {
                console.log('Unquoted content appears to be a JSON string');

                // Check for Craft.js indicators
                if (unquoted.includes('resolvedName') ||
                    unquoted.includes('"ROOT"') ||
                    unquoted.includes('"root"')) {
                  console.log('Unquoted content appears to be Craft.js JSON');
                  return true;
                }

                // Try to parse the unquoted content
                try {
                  const parsedUnquoted = JSON.parse(unquoted);
                  if (parsedUnquoted.ROOT || parsedUnquoted.root ||
                      (typeof parsedUnquoted === 'object' &&
                       Object.values(parsedUnquoted).some(v => v && v.props && v.props.text))) {
                    console.log('Unquoted content is valid JSON with Craft.js structure');
                    return true;
                  }
                } catch (innerParseError) {
                  console.log('Failed to parse unquoted content as JSON:', innerParseError.message);
                }
              }
            }
          } catch (unquoteError) {
            console.log('Failed to unquote content:', unquoteError.message);
          }
        }

        // Additional check for HTML content
        if (content.includes('<html') || content.includes('<body') || content.includes('<head')) {
          console.log('Content appears to be HTML');
          return false;
        }
      }

      return false;
    } catch (e) {
      // If any error occurs, assume it's not JSON
      console.error('Error checking if content is JSON:', e);
      return false;
    }
  })();

  // If it's JSON content, use the CraftRenderer
  if (isJsonContent) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-2 sm:p-8 shadow h-full overflow-auto w-full`}>
        <div className={`flex justify-between items-center mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{studyGuide.title}</h2>
            {searchTerm && (
              <div className={`ml-2 px-3 py-1 text-xs rounded-full ${
                searchHighlighted
                  ? (isDark ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary/10 text-primary border border-primary/30')
                  : (isDark ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-800')
              } flex items-center shadow-sm`}>
                <FaSearch size={10} className="mr-1" />
                <span>
                  {searchHighlighted
                    ? `Found ${searchMatchCount} ${searchMatchCount === 1 ? 'match' : 'matches'} for "${searchTerm}"`
                    : `Searching for: ${searchTerm}`}
                </span>
                <button
                  onClick={() => {
                    // Clear the search term
                    setSearchTerm('');
                    setSearchHighlighted(false);
                    setSearchMatchCount(0);

                    // Remove the search parameter from the URL
                    const urlParams = new URLSearchParams(location.search);
                    urlParams.delete('search');

                    // Update the URL without reloading the page
                    const newUrl = `${location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
                    window.history.pushState({}, '', newUrl);

                    // Clear highlights in the renderer
                    if (craftRendererRef.current) {
                      // Call highlightSearchTerm with empty string to clear highlights
                      craftRendererRef.current.highlightSearchTerm('');

                      // Additional cleanup for any remaining highlights
                      setTimeout(() => {
                        try {
                          // Find the renderer element
                          const rendererElement = document.querySelector('.craft-renderer');
                          if (rendererElement) {
                            // Remove any remaining highlights
                            const existingHighlights = rendererElement.querySelectorAll('.search-highlight, .search-highlight-iframe, .iframe-search-marker, .interactive-highlight-label');
                            existingHighlights.forEach(el => {
                              if (el.parentNode) {
                                if (el.classList.contains('interactive-highlight-label')) {
                                  // Just remove label elements
                                  el.parentNode.removeChild(el);
                                } else if (el.classList.contains('iframe-search-marker')) {
                                  // Just remove marker elements
                                  el.parentNode.removeChild(el);
                                } else {
                                  // For text highlights, replace with the original text
                                  const parent = el.parentNode;
                                  parent.replaceChild(document.createTextNode(el.textContent), el);
                                  // Normalize the parent to merge adjacent text nodes
                                  parent.normalize();
                                }
                              }
                            });

                            // Remove highlight borders from interactive elements
                            const interactiveElements = rendererElement.querySelectorAll('.interactive-element-wrapper');
                            interactiveElements.forEach(el => {
                              el.style.border = '';
                              el.style.boxShadow = '';
                            });

                            console.log('Manually cleared all remaining highlights');
                          }
                        } catch (e) {
                          console.error('Error manually clearing highlights:', e);
                        }
                      }, 100);
                    }
                  }}
                  className={`ml-2 flex items-center justify-center w-4 h-4 rounded-full ${
                    isDark
                      ? 'bg-teal-700 text-teal-200 hover:bg-teal-600'
                      : 'bg-teal-200 text-teal-800 hover:bg-teal-300'
                  } transition-colors`}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <span className="text-xs font-bold">×</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`ml-2 px-2 py-1 text-xs rounded ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              {showDebug ? 'Hide Debug' : 'Debug'}
            </button>
          </div>
          {studyGuide && studyGuide.category_id && (
            <button
              onClick={() => window.location.href = `/practice-quiz/${studyGuide.category_id}`}
              className={`bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2`}
            >
              <span>📝</span> Take Practice Quiz
            </button>
          )}
        </div>
        <div className="h-full" style={{ height: 'calc(100% - 60px)' }}>
          {/* Process the content before passing it to CraftRenderer */}
          {(() => {
            // Prepare the content for the CraftRenderer
            let processedContent = studyGuide.content;

            // If it's a string that might be double-stringified JSON, try to parse it once
            if (typeof processedContent === 'string') {
              try {
                console.log('StudyGuideViewer: Processing content of type string');

                // Check if it's a quoted JSON string
                if (processedContent.trim().startsWith('"') && processedContent.trim().endsWith('"')) {
                  console.log('StudyGuideViewer: Content appears to be a quoted string, attempting to unquote');
                  const unquoted = JSON.parse(processedContent);

                  if (typeof unquoted === 'string') {
                    console.log('StudyGuideViewer: Unquoted content is still a string');

                    if (unquoted.includes('"ROOT"') || unquoted.includes('"root"') || unquoted.includes('resolvedName')) {
                      console.log('StudyGuideViewer: Unquoted content appears to be Craft.js JSON');
                      // processedContent = unquoted; // This was the line before, now we use the parsed object directly if possible

                      // Try to parse it to validate and fix any issues
                      try {
                        const parsedJson = JSON.parse(unquoted); // Parse the inner JSON string to an object
                        console.log('StudyGuideViewer: Successfully parsed unquoted content to object.');
                        // No specific pre-processing needed here for Tabs or CollapsibleSection
                        // as the components now handle their children via standard Craft.js canvas rendering.
                        // The CraftRenderer will receive the parsed JSON and Craft.js will resolve children.
                        processedContent = parsedJson; // Pass the JS object to CraftRenderer
                      } catch (parseError) {
                        console.error('StudyGuideViewer: Error parsing unquoted content. Content was:', unquoted, 'Error:', parseError);
                        // If parsing the unquoted string fails, pass the unquoted string itself.
                        // CraftRenderer will attempt to parse it.
                        processedContent = unquoted;
                      }
                    }
                  } else if (typeof unquoted === 'object' && unquoted !== null) {
                    // If unquoting directly results in an object (content was single-stringified JSON object)
                    console.log('StudyGuideViewer: Unquoted content is an object. Using directly.');
                    processedContent = unquoted;
                  }
                } else if (processedContent.trim().startsWith('{') && processedContent.trim().endsWith('}')) {
                  // Content is a single-stringified JSON object
                  try {
                    const parsedJson = JSON.parse(processedContent);
                    console.log('StudyGuideViewer: Successfully parsed single-stringified JSON to object.');
                    processedContent = parsedJson; // Pass the JS object
                  } catch (e) {
                    console.error('StudyGuideViewer: Error parsing single-stringified JSON. Passing as string.', e);
                    // Let CraftRenderer handle it as a string if direct parse fails
                  }
                }
              } catch (e) {
                console.log('StudyGuideViewer: Failed to pre-process content, passing as is:', e.message);
                // Continue with original content if pre-processing fails
              }
            }

            return <CraftRenderer
              ref={craftRendererRef}
              jsonContent={processedContent}
              searchTerm={searchTerm}
            />;
          })()}

          {/* Show debug info if debug mode is enabled */}
          {showDebug && (
            <div className="mt-4 border-t border-gray-300 dark:border-slate-700 pt-4">
              <div className="mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Debug Information</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Raw JSON content:</p>
                <pre className={`mt-2 p-2 rounded text-xs overflow-auto max-h-96 ${isDark ? 'bg-slate-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                  {typeof studyGuide.content === 'string' ? studyGuide.content : JSON.stringify(studyGuide.content, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For HTML content, continue with the existing approach
  // Extract styles and body, process body, then construct srcDoc
  const fullContent = studyGuide.content || '';
  const styles = extractStyleContent(fullContent);
  const bodyContent = extractBodyContent(fullContent);
  const processedBody = processBodyContentForWebComponents(bodyContent);

  // Define CSS variables and override rules based on theme
  const themeStyles = `
    /* Theme Swapping Colors */
    :root {
      /* Light Mode Values */
      --swap-navy-blue: #34495E;
      --swap-black: #000000;
      --swap-white: #FFFFFF;
      --swap-light-gray: #7E8C8D; /* Uses Dark Gray hex in light mode */
      --swap-dark-gray: #7E8C8D;
      --swap-medium-gray: #95A5A6; /* Uses Gray hex in light mode */
      --swap-gray: #95A5A6;
    }
    body.dark-theme {
      /* Dark Mode Values */
      --swap-navy-blue: #C2E0F4; /* Becomes Light Blue */
      --swap-black: #FFFFFF; /* Becomes White */
      --swap-white: #000000; /* Becomes Black */
      --swap-light-gray: #ECF0F1;
      --swap-dark-gray: #ECF0F1; /* Becomes Light Gray */
      --swap-medium-gray: #CED4D9;
      --swap-gray: #CED4D9; /* Becomes Medium Gray */
    }

    /* --- Theme Color Overrides for Inline Styles --- */

    /* Dark Mode Viewing: Override light mode inline styles */
    /* Navy Blue (#34495E) -> Light Blue (#C2E0F4) */
    body.dark-theme [style*="color: #34495E"], body.dark-theme [style*="color: #34495e"] { color: var(--swap-navy-blue) !important; }
    body.dark-theme [style*="border-color: #34495E"], body.dark-theme [style*="border-color: #34495e"] { border-color: var(--swap-navy-blue) !important; }
    /* Black (#000000) -> White (#FFFFFF) */
    body.dark-theme [style*="color: #000000"] { color: var(--swap-black) !important; }
    body.dark-theme [style*="border-color: #000000"] { border-color: var(--swap-black) !important; }
    /* White (#FFFFFF) -> Black (#000000) */
    body.dark-theme [style*="color: #FFFFFF"], body.dark-theme [style*="color: #ffffff"] { color: var(--swap-white) !important; }
    body.dark-theme [style*="border-color: #FFFFFF"], body.dark-theme [style*="border-color: #ffffff"] { border-color: var(--swap-white) !important; }
    /* Light Gray (saved as Dark Gray #7E8C8D in light mode) -> becomes Light Gray #ECF0F1 in dark */
    body.dark-theme [style*="color: #7E8C8D"], body.dark-theme [style*="color: #7e8c8d"] { color: var(--swap-light-gray) !important; }
    body.dark-theme [style*="border-color: #7E8C8D"], body.dark-theme [style*="border-color: #7e8c8d"] { border-color: var(--swap-light-gray) !important; }
    /* Medium Gray (saved as Gray #95A5A6 in light mode) -> becomes Medium Gray #CED4D9 in dark */
    body.dark-theme [style*="color: #95A5A6"], body.dark-theme [style*="color: #95a5a6"] { color: var(--swap-medium-gray) !important; }
    body.dark-theme [style*="border-color: #95A5A6"], body.dark-theme [style*="border-color: #95a5a6"] { border-color: var(--swap-medium-gray) !important; }


    /* Light Mode Viewing: Override dark mode inline styles */
    /* Light Blue (#C2E0F4) -> Navy Blue (#34495E) */
    body:not(.dark-theme) [style*="color: #C2E0F4"], body:not(.dark-theme) [style*="color: #c2e0f4"] { color: var(--swap-navy-blue) !important; }
    body:not(.dark-theme) [style*="border-color: #C2E0F4"], body:not(.dark-theme) [style*="border-color: #c2e0f4"] { border-color: var(--swap-navy-blue) !important; }
    /* White (#FFFFFF) -> Black (#000000) */
    body:not(.dark-theme) [style*="color: #FFFFFF"], body:not(.dark-theme) [style*="color: #ffffff"] { color: var(--swap-black) !important; }
    body:not(.dark-theme) [style*="border-color: #FFFFFF"], body:not(.dark-theme) [style*="border-color: #ffffff"] { border-color: var(--swap-black) !important; }
    /* Black (#000000) -> White (#FFFFFF) */
    body:not(.dark-theme) [style*="color: #000000"] { color: var(--swap-white) !important; }
    body:not(.dark-theme) [style*="border-color: #000000"] { border-color: var(--swap-white) !important; }
    /* Dark Gray (saved as Light Gray #ECF0F1 in dark mode) -> becomes Dark Gray #7E8C8D in light */
    body:not(.dark-theme) [style*="color: #ECF0F1"], body:not(.dark-theme) [style*="color: #ecf0f1"] { color: var(--swap-dark-gray) !important; }
    body:not(.dark-theme) [style*="border-color: #ECF0F1"], body:not(.dark-theme) [style*="border-color: #ecf0f1"] { border-color: var(--swap-dark-gray) !important; }
    /* Gray (saved as Medium Gray #CED4D9 in dark mode) -> becomes Gray #95A5A6 in light */
    body:not(.dark-theme) [style*="color: #CED4D9"], body:not(.dark-theme) [style*="color: #ced4d9"] { color: var(--swap-gray) !important; }
    body:not(.dark-theme) [style*="border-color: #CED4D9"], body:not(.dark-theme) [style*="border-color: #ced4d9"] { border-color: var(--swap-gray) !important; }
    /* --- End Theme Color Overrides --- */
  `;

  // Construct the full HTML for the iframe srcDoc
  const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${studyGuide.title || 'Study Guide Content'}</title>
      <style>
        /* Base iframe styles */
        body {
          margin: 0;
          padding: 15px;
          padding-bottom: 40px;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          /* Ensure proper rendering context */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Reset potential interfering styles */
          text-size-adjust: none;
          -webkit-text-size-adjust: none;
          /* Dark mode support */
          background-color: ${isDark ? '#1e293b' : '#ffffff'};
          color: ${isDark ? '#f8fafc' : '#1e293b'};
        }

        /* Dark mode heading colors */
        h1, h2, h3 {
          color: ${isDark ? '#f1f5f9' : '#1e293b'}; /* Lighter color for headings in dark mode */
        }

        /* Ensure web components have proper display */
        /* Target all interactive elements with the -simulator suffix */
        [class$="-simulator"], [id$="-simulator"], *[id$="-simulator"], *[class$="-simulator"],
        *-simulator, *-simulator-simulator, router-simulator-simulator,
        fiber-fault-simulator, mac-address-explorer-simulator, channel-overlap-visualizer-simulator,
        packet-loss-analyzer-simulator, traceroute-simulator-simulator, command-builder-simulator {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          box-sizing: border-box !important;
        }

        /* Override simulator-container styles */
        .simulator-container {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Override vis-container styles */
        #vis-container {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 0 !important;
        }

        /* Force desktop layout for all interactive elements */
        @media (max-width: 1350px) {
          #vis-container {
            grid-template-columns: repeat(12, 1fr) !important;
            grid-template-rows: repeat(1, auto) !important;
          }
        }
        @media (max-width: 768px) {
          #vis-container {
            grid-template-columns: repeat(12, 1fr) !important;
            grid-template-rows: repeat(1, auto) !important;
          }
          .node {
            max-width: 60px !important;
            font-size: 0.8em !important;
          }
          .trace-row {
            grid-template-columns: 35px repeat(3, 65px) 20px auto !important;
          }
          .trace-header-row span:nth-child(4),
          .trace-row span:nth-child(4) {
            display: inline-block !important;
          }
          .trace-col-sep { grid-column: 5 !important; }
          .trace-col-ip { grid-column: 6 !important; }
          #trace-output-container { font-size: 14px !important; }
        }

        /* Remove any inherited styles from parent document */
        [class$="-simulator"] *, [id$="-simulator"] *, *[id$="-simulator"] *, *[class$="-simulator"] *,
        *-simulator *, *-simulator-simulator *, router-simulator-simulator *,
        fiber-fault-simulator *, mac-address-explorer-simulator *, channel-overlap-visualizer-simulator *,
        packet-loss-analyzer-simulator *, traceroute-simulator-simulator *, command-builder-simulator * {
          box-sizing: border-box !important;
        }
        /* Preserve whitespace in paragraphs */
        p { white-space: pre-wrap; }
        /* Empty line divs have inline styles, no specific class rule needed here */
        /* Remove potentially conflicting rules for p[data-empty] */

        /* Force bottom padding by adding margin to last element */
        body > *:last-child {
          margin-bottom: 40px !important;
        }

        /* Also target interactive elements specifically */
        [class$="-simulator"]:last-child, [id$="-simulator"]:last-child,
        *[id$="-simulator"]:last-child, *[class$="-simulator"]:last-child {
          margin-bottom: 40px !important;
        }
        /* Image Grid Layout Styles */
        .image-grid-wrapper {
          display: grid !important;
          gap: 1em;
          margin-bottom: 1em;
          padding: 5px;
        }
        .image-grid-wrapper.align-left {
          grid-template-columns: auto 1fr;
        }
        .image-grid-wrapper.align-right {
          grid-template-columns: 1fr auto;
        }
        .image-grid-wrapper.align-center {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        .image-grid-wrapper > .grid-cell {
          min-width: 0;
        }
        .image-grid-wrapper > .image-cell {
          display: flex;
          align-items: flex-start;
        }
        .image-grid-wrapper.align-right > .image-cell {
          grid-column: 2;
        }
        .image-grid-wrapper.align-right > .content-cell {
          grid-column: 1;
          grid-row: 1;
        }
        .image-grid-wrapper > .image-cell > img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* Image Style Options */
        .image-grid-wrapper > .image-cell > img.border-thin {
          border: 1px solid ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-medium {
          border: 2px solid ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-thick {
          border: 4px solid ${isDark ? '#475569' : '#e0e0e0'};
        }
        /* Custom border colors will be applied as inline styles */
        .image-grid-wrapper > .image-cell > img.border-color-custom {
          /* This class just indicates that a custom color is being used */
          /* The actual color is set via inline style */
        }
        /* Border Style Options */
        .image-grid-wrapper > .image-cell > img.border-style-solid {
          border-style: solid;
        }
        .image-grid-wrapper > .image-cell > img.border-style-dashed {
          border-style: dashed;
        }
        .image-grid-wrapper > .image-cell > img.border-style-dotted {
          border-style: dotted;
        }
        /* Border Color Options */
        .image-grid-wrapper > .image-cell > img.border-color-gray {
          border-color: ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-black {
          border-color: ${isDark ? '#f8fafc' : '#000000'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-blue {
          border-color: ${isDark ? 'var(--primary-light)' : 'var(--primary-dark)'}; /* Use dynamic primary colors */
        }
        .image-grid-wrapper > .image-cell > img.border-color-red {
          border-color: ${isDark ? '#f87171' : '#dc2626'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-green {
          border-color: ${isDark ? '#34d399' : '#16a34a'};
        }

        /* Fallback: Apply solid border style when thickness is present but no style is specified */
        .image-grid-wrapper > .image-cell > img.border-thin:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
        .image-grid-wrapper > .image-cell > img.border-medium:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
        .image-grid-wrapper > .image-cell > img.border-thick:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted) {
          border-style: solid;
        }
        .image-grid-wrapper > .image-cell > img.rounded-sm {
          border-radius: 4px;
        }
        .image-grid-wrapper > .image-cell > img.rounded-md {
          border-radius: 8px;
        }
        .image-grid-wrapper > .image-cell > img.rounded-lg {
          border-radius: 16px;
        }
        .image-grid-wrapper > .image-cell > img.rounded-full {
          border-radius: 9999px;
        }
        /* End Image Style Options */
        .image-grid-wrapper > .content-cell {
          min-height: 2em;
          display: block;
          height: 100%;
          padding: 0.25em;
        }
        .image-grid-wrapper > .content-cell > p {
          margin: 0 0 0.5em 0;
          white-space: pre-wrap;
        }
        .image-grid-wrapper > .content-cell > p:last-child {
          margin-bottom: 0;
        }
        /* Honor text alignment styles */
        .image-grid-wrapper > .content-cell[style*="text-align"],
        .image-grid-wrapper > .content-cell > p[style*="text-align"] {
          display: block;
        }
        /* Inject styles extracted from saved content */
        ${styles}

        /* Inject theme-specific variables and overrides */
        ${themeStyles}
      </style>
      <link rel="stylesheet" href="/fonts/inter.css"> <!-- Ensure fonts are loaded -->
    </head>
    <body class="${isDark ? 'dark-theme' : ''}">
      ${processedBody}
    </body>
    </html>
  `;


  // Main component return statement
  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-2 sm:p-8 pb-6 sm:pb-12 shadow overflow-hidden w-full flex flex-col h-full`}> {/* Use h-full since parent has fixed height, added bottom padding */}
      <div className={`flex justify-between items-center mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
        <div className="flex items-center gap-2">
          <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{studyGuide.title}</h2>
          {searchTerm && (
            <div className={`ml-2 px-3 py-1 text-xs rounded-full ${
              searchHighlighted
                ? (isDark ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary/10 text-primary border border-primary/30')
                : (isDark ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-800')
            } flex items-center shadow-sm`}>
              <FaSearch size={10} className="mr-1" />
              <span>
                {searchHighlighted
                  ? `Found ${searchMatchCount} ${searchMatchCount === 1 ? 'match' : 'matches'} for "${searchTerm}"`
                  : `Searching for: ${searchTerm}`}
              </span>
              <button
                onClick={() => {
                  // Clear the search term
                  setSearchTerm('');
                  setSearchHighlighted(false);
                  setSearchMatchCount(0);

                  // Remove the search parameter from the URL
                  const urlParams = new URLSearchParams(location.search);
                  urlParams.delete('search');

                  // Update the URL without reloading the page
                  const newUrl = `${location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
                  window.history.pushState({}, '', newUrl);

                  // For HTML iframe version, we need to clear highlights in the iframe
                  if (iframeRef.current) {
                    try {
                      // Try to access the iframe content
                      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;

                      if (iframeDoc) {
                        // Remove any search highlight elements
                        const highlights = iframeDoc.querySelectorAll('.search-highlight, .search-highlight-iframe');
                        highlights.forEach(el => {
                          if (el.parentNode) {
                            // Replace with the original text
                            const parent = el.parentNode;
                            parent.replaceChild(iframeDoc.createTextNode(el.textContent), el);
                            // Normalize the parent to merge adjacent text nodes
                            parent.normalize();
                          }
                        });

                        console.log('Cleared highlights in iframe');
                      } else {
                        // If we can't access the document directly, reload the iframe
                        console.log('Could not access iframe document, reloading iframe');
                        const currentSrcDoc = iframeRef.current.srcDoc;
                        iframeRef.current.srcDoc = '';
                        setTimeout(() => {
                          iframeRef.current.srcDoc = currentSrcDoc;
                        }, 10);
                      }
                    } catch (e) {
                      console.error('Error clearing iframe highlights:', e);
                      // Fallback to reloading the iframe
                      const currentSrcDoc = iframeRef.current.srcDoc;
                      iframeRef.current.srcDoc = '';
                      setTimeout(() => {
                        iframeRef.current.srcDoc = currentSrcDoc;
                      }, 10);
                    }
                  }
                }}
                className={`ml-2 flex items-center justify-center w-4 h-4 rounded-full ${
                  isDark
                    ? 'bg-teal-700 text-teal-200 hover:bg-teal-600'
                    : 'bg-teal-200 text-teal-800 hover:bg-teal-300'
                } transition-colors`}
                aria-label="Clear search"
                title="Clear search"
              >
                <span className="text-xs font-bold">×</span>
              </button>
            </div>
          )}
        </div>
        {studyGuide && studyGuide.category_id && (
          <button
            onClick={() => window.location.href = `/practice-quiz/${studyGuide.category_id}`}
            className={`bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2`}
          >
            <span>📝</span> Take Practice Quiz
          </button>
        )}
      </div>
      <iframe
        ref={iframeRef} // Ref for the main iframe
        title={studyGuide.title}
        // Set srcDoc to the manually constructed HTML with injected styles
        srcDoc={iframeHtml}
        className="w-full border-none bg-white overflow-auto flex-1"
        // Sandbox is still good practice for the main content iframe
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default StudyGuideViewer;