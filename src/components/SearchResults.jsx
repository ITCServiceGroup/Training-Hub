import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaFolder, FaFile, FaSearch, FaChevronRight } from 'react-icons/fa';
import { getIconByName } from '../utils/iconMappings';
import { extractTextFromContent, createSearchSnippet, countSearchTermOccurrences } from '../utils/contentTextExtractor';

/**
 * Component for displaying search results across all content types
 */
const SearchResults = ({
  results,
  isLoading,
  searchQuery,
  onResultClick = () => {}
}) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];

  // Helper function to get section icon
  const getSectionIcon = (section) => {
    if (section.icon) {
      const { component: IconComponent } = getIconByName(section.icon);
      return {
        icon: <IconComponent size={20} color="white" />,
        color: currentSecondaryColor // Always use secondary color
      };
    }

    // Fallback to name-based detection
    const name = section.name.toLowerCase();
    let iconName = 'Book';

    if (name.includes('network')) iconName = 'Network';
    else if (name.includes('install')) iconName = 'Download';
    else if (name.includes('service')) iconName = 'Wrench';
    else if (name.includes('troubleshoot')) iconName = 'Search';
    else if (name.includes('security')) iconName = 'Lock';
    else if (name.includes('hardware')) iconName = 'Laptop';
    else if (name.includes('software')) iconName = 'Chart';
    else if (name.includes('advanced')) iconName = 'Rocket';

    const { component: IconComponent } = getIconByName(iconName);
    return {
      icon: <IconComponent size={20} color="white" />,
      color: currentSecondaryColor // Always use secondary color
    };
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    if (category.icon) {
      const { component: IconComponent } = getIconByName(category.icon);
      return {
        icon: <IconComponent size={20} color="white" />,
        color: currentSecondaryColor // Always use secondary color
      };
    }

    // Fallback to name-based detection
    const name = category.name.toLowerCase();
    let iconName = 'Book';

    if (name.includes('network')) iconName = 'Network';
    else if (name.includes('install')) iconName = 'Download';
    else if (name.includes('service')) iconName = 'Wrench';
    else if (name.includes('troubleshoot')) iconName = 'Search';
    else if (name.includes('security')) iconName = 'Lock';
    else if (name.includes('hardware')) iconName = 'Laptop';
    else if (name.includes('software')) iconName = 'Chart';

    const { component: IconComponent } = getIconByName(iconName);
    return {
      icon: <IconComponent size={20} color="white" />,
      color: currentSecondaryColor // Always use secondary color
    };
  };

  // Helper function to extract a snippet of text from content
  const getContentSnippet = (content, query) => {
    if (!content) return { snippet: '', occurrences: [], totalOccurrences: 0 };

    try {
      // Extract clean text from the content using our utility function
      const extractedText = extractTextFromContent(content);

      // If we couldn't extract any text, return a placeholder
      if (!extractedText || extractedText.trim().length === 0) {
        return {
          snippet: 'This content contains the search term but text extraction is not available.',
          occurrences: [],
          totalOccurrences: 0
        };
      }

      // Count all occurrences using our consistent counting method
      const totalOccurrences = countSearchTermOccurrences(extractedText, query);

      // Create a search snippet with the extracted text
      const snippetInfo = createSearchSnippet(extractedText, query, 200);

      // Override the total occurrences with our more accurate count
      snippetInfo.totalOccurrences = totalOccurrences;

      return snippetInfo;
    } catch (e) {
      console.error('Error extracting content snippet:', e);
      return {
        snippet: 'Error extracting content preview.',
        occurrences: [],
        totalOccurrences: 0
      };
    }
  };

  // Check if we have any results
  const hasResults = results && (
    results.sections.length > 0 ||
    results.categories.length > 0 ||
    results.studyGuides.length > 0 ||
    results.content.length > 0
  );

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full border-3 ${isDark ? 'border-gray-700 border-t-primary-light' : 'border-gray-200 border-t-primary-dark'} animate-spin mr-4`}></div>
        <span>Searching...</span>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className={`text-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <FaSearch size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-xl mb-2">No results found</p>
        <p>Try different keywords or check your spelling</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sections */}
      {results.sections.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sections ({results.sections.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.sections.map(section => {
              const { icon, color } = getSectionIcon(section);
              return (
                <div
                  key={section.id}
                  className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    navigate(`/study/${section.id}`);
                    onResultClick();
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      {icon}
                    </div>
                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{section.name}</h4>
                  </div>
                  {section.description && (
                    <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-sm mb-2`}>
                      {section.description}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <span className={`text-sm ${isDark ? 'text-primary-light' : 'text-primary-dark'} flex items-center`}>
                      View Section <FaChevronRight size={12} className="ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {results.categories.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Categories ({results.categories.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.categories.map(category => {
              const { icon, color } = getCategoryIcon(category);
              return (
                <div
                  key={category.id}
                  className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    navigate(`/study/${category.sections?.id}/${category.id}`);
                    onResultClick();
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</h4>
                      {category.sections && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {category.sections.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-sm mb-2`}>
                      {category.description}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'} flex items-center`}>
                      View Category <FaChevronRight size={12} className="ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Study Guides */}
      {results.studyGuides.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Learn ({results.studyGuides.length})
          </h3>
          <div className="space-y-3">
            {results.studyGuides.map(guide => (
              <div
                key={guide.id}
                className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => {
                  navigate(`/study/${guide.categories?.sections?.id}/${guide.categories?.id}/${guide.id}`);
                  onResultClick();
                }}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${isDark ? 'bg-secondary/20' : 'bg-secondary/10'} mr-3`}>
                    <FaFile size={16} className={`text-secondary`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{guide.title}</h4>
                    <div className="flex flex-wrap text-xs mb-2">
                      {guide.categories && (
                        <span className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mr-2`}>
                          {guide.categories.name}
                        </span>
                      )}
                      {guide.categories?.sections && (
                        <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {guide.categories.sections.name}
                        </span>
                      )}
                    </div>
                    {guide.description && (
                      <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-sm`}>
                        {guide.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Matches */}
      {results.content.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Content Matches ({results.content.length})
          </h3>
          <div className="space-y-3">
            {results.content.map(guide => {
              // Get the snippet and occurrence information
              const snippetInfo = getContentSnippet(guide.content, searchQuery);

              // Get the count directly from the content using our consistent counting method
              // This ensures the count shown here matches what will be shown in the study guide
              let matchCount = 0;

              if (guide.originalContent) {
                // If we have the original content, count directly from it
                matchCount = countSearchTermOccurrences(guide.originalContent, searchQuery);
              } else if (guide.content) {
                // Otherwise use the extracted content
                matchCount = countSearchTermOccurrences(guide.content, searchQuery);
              } else {
                // Fall back to the count from the search service or snippet info
                matchCount = guide.matchCount || snippetInfo.totalOccurrences || 0;
              }

              console.log(`SearchResults: Guide "${guide.title}" has ${matchCount} matches (direct count from content)`);

              // Store the count on the guide object for reference
              guide.matchCount = matchCount;

              return (
                <div
                  key={guide.id}
                  className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    // Navigate to the study guide with search parameters
                    navigate(`/study/${guide.categories?.sections?.id}/${guide.categories?.id}/${guide.id}?search=${encodeURIComponent(searchQuery)}`);
                    onResultClick();
                  }}
                >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${isDark ? 'bg-amber-900' : 'bg-amber-100'} mr-3`}>
                        <FaSearch size={16} className={isDark ? 'text-amber-400' : 'text-amber-700'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{guide.title}</h4>
                          {matchCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-secondary/20 text-secondary' : 'bg-secondary/10 text-secondary'}`}>
                              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap text-xs mb-2">
                          {guide.categories && (
                            <span className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mr-2`}>
                              {guide.categories.name}
                            </span>
                          )}
                          {guide.categories?.sections && (
                            <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                              {guide.categories.sections.name}
                            </span>
                          )}
                        </div>
                        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-100'} p-2 rounded text-sm mt-2`}>
                          <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                            {snippetInfo.snippet}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
