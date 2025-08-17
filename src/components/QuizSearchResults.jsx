import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaFolder, FaFile, FaSearch, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import { getSearchResultIcon } from '../utils/iconHelpers';

/**
 * Component for displaying quiz search results
 */
const QuizSearchResults = ({
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


  // Helper function to handle quiz selection
  const handleQuizSelect = (quiz) => {
    // Find the first category with a section to construct proper URL
    const categoryWithSection = quiz.categories?.find(cat => cat.section?.id);
    
    if (categoryWithSection) {
      // Navigate to practice mode with section and category context
      navigate(`/quiz/practice/${categoryWithSection.section.id}/${categoryWithSection.id}/${quiz.id}`);
    } else {
      // Fallback to direct quiz access
      navigate(`/quiz/${quiz.id}`);
    }
    onResultClick();
  };

  // Check if we have any results
  const hasResults = results && (
    results.sections.length > 0 ||
    results.categories.length > 0 ||
    results.quizzes.length > 0
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
              const { IconComponent, iconProps, color } = getSearchResultIcon(section, currentSecondaryColor, 'section');
              return (
                <div
                  key={section.id}
                  className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    navigate(`/quiz/practice/${section.id}`);
                    onResultClick();
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      <IconComponent {...iconProps} />
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
              const { IconComponent, iconProps, color } = getSearchResultIcon(category, currentSecondaryColor, 'category');
              return (
                <div
                  key={category.id}
                  className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    navigate(`/quiz/practice/${category.sections?.id}/${category.id}`);
                    onResultClick();
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      <IconComponent {...iconProps} />
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

      {/* Quizzes */}
      {results.quizzes.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Quizzes ({results.quizzes.length})
          </h3>
          <div className="space-y-3">
            {results.quizzes.map(quiz => (
              <div
                key={quiz.id}
                className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => handleQuizSelect(quiz)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${isDark ? 'bg-primary/20' : 'bg-primary/10'} mr-3`}>
                    <FaQuestionCircle size={16} className={`text-primary`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{quiz.title}</h4>
                      <div className="flex flex-col items-end gap-1">
                        {quiz.is_practice ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                          }`}>
                            Practice Quiz
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark'
                            }`}>
                              Assessment
                            </span>
                            {quiz.has_practice_mode && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                              }`}>
                                Practice Available
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap text-xs mb-2">
                      {quiz.categories?.map((category, index) => (
                        <React.Fragment key={category.id}>
                          <span className={`${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {category.name}
                          </span>
                          {category.section && (
                            <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'} ml-1`}>
                              ({category.section.name})
                            </span>
                          )}
                          {index < quiz.categories.length - 1 && <span className="mx-2">•</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    {quiz.description && (
                      <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-sm mb-2`}>
                        {quiz.description}
                      </p>
                    )}
                    <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      <span>{quiz.questionCount || 0} Questions</span>
                      {quiz.time_limit && (
                        <span>{Math.floor(quiz.time_limit / 60)} Min Limit</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSearchResults;