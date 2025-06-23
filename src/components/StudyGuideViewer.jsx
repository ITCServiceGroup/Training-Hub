import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaClipboardList } from 'react-icons/fa';
import CraftRenderer from './craft/CraftRenderer';
import { countSearchTermOccurrences, extractTextFromContent } from '../utils/contentTextExtractor';
import LoadingSpinner from './common/LoadingSpinner';

/**
 * Component for displaying study guide content using Craft.js renderer
 */
const StudyGuideViewer = ({ studyGuide, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
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

  // Loading and Empty states
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow w-full h-full flex items-center justify-center`}>
        <LoadingSpinner size="lg" text="Loading study guide..." />
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow w-full h-full flex items-center justify-center`}>
        <div className={`text-center p-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <p>Select a study guide to view its content</p>
        </div>
      </div>
    );
  }


  // Render the study guide using CraftRenderer
  return (
    <div
      className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow w-full flex flex-col`}
      style={{ 
        height: 'calc(100vh - 170px)', // Account for header (~60px) + footer (~80px)
        maxHeight: 'calc(100vh - 170px)'}}
    >
      {/* Fixed header section */}
      <div className={`flex justify-between items-center px-6 pt-4 flex-shrink-0`}>
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
                      ? 'bg-secondary text-white hover:bg-secondary/80'
                      : 'bg-secondary/20 text-secondary hover:bg-secondary/30'
                  } transition-colors`}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <span className="text-xs font-bold">×</span>
                </button>
              </div>
            )}
          </div>
          {studyGuide && studyGuide.linked_quiz_id && (
            <button
              onClick={() => {
                navigate(`/quiz/${studyGuide.linked_quiz_id}`);
              }}
              className={`bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2`}
            >
              <FaClipboardList /> Take Practice Quiz
            </button>
          )}
        </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 pt-0 pb-8">
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
          <div className="mt-4 pt-4">
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
};

export default StudyGuideViewer;