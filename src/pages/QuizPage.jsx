import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizzesService } from '../services/api/quizzes';
import QuizTaker from '../components/quiz/QuizTaker';
import { groupBy } from 'lodash'; // Assuming lodash is available, or implement a simple groupBy

const QuizPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { quizId, accessCode } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [localAccessCode, setLocalAccessCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available quizzes (now includes category and section data)
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const data = await quizzesService.getAllWithQuestionCount();
        // Show practice quizzes and quizzes with practice mode
        setQuizzes(data.filter(quiz => quiz.is_practice || quiz.has_practice_mode));
      } catch (error) {
        setError('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    if (!quizId && !accessCode) {
      fetchQuizzes();
    }
  }, [quizId, accessCode]);

  // Handle access code submission
  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (localAccessCode) {
      navigate(`/quiz/access/${localAccessCode}`);
    }
  };

  // Handle quiz selection
  const handleQuizSelect = (quiz) => {
    navigate(`/quiz/${quiz.id}`);
  };

  // Filter quizzes based on search query first
  const filteredQuizzes = useMemo(() => {
    return searchQuery
      ? quizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : quizzes;
  }, [quizzes, searchQuery]);

  // Group filtered quizzes by Section -> Category
  const groupedQuizzes = useMemo(() => {
    if (!filteredQuizzes || filteredQuizzes.length === 0) {
      return {};
    }

    // Group by Section ID first
    const bySection = groupBy(filteredQuizzes, quiz => {
      // Find the first category with a valid section
      const categoryWithSection = quiz.categories?.find(cat => cat.section?.id);
      return categoryWithSection?.section?.id || 'uncategorized'; // Group under 'uncategorized' if no section found
    });

    // Within each section, group by Category ID
    const fullyGrouped = {};
    for (const sectionId in bySection) {
      const sectionQuizzes = bySection[sectionId];
      const sectionInfo = sectionQuizzes[0]?.categories?.find(cat => cat.section?.id === sectionId)?.section;

      fullyGrouped[sectionId] = {
        sectionName: sectionInfo?.name || 'Uncategorized Quizzes',
        categories: groupBy(sectionQuizzes, quiz => {
           // Find the primary category for grouping (can refine this logic if needed)
           const primaryCategory = quiz.categories?.find(cat => cat.section_id === sectionId) || quiz.categories?.[0];
           return primaryCategory?.id || 'uncategorized';
        })
      };
    }

    // Add category names to the structure
    for (const sectionId in fullyGrouped) {
        for (const categoryId in fullyGrouped[sectionId].categories) {
            const quizzesInCategory = fullyGrouped[sectionId].categories[categoryId];
            const categoryInfo = quizzesInCategory[0]?.categories?.find(cat => cat.id === categoryId);
            fullyGrouped[sectionId].categories[categoryId] = {
                categoryName: categoryInfo?.name || 'Uncategorized',
                quizzes: quizzesInCategory
            };
        }
    }

    return fullyGrouped;
  }, [filteredQuizzes]);

  // If we have a quiz ID or access code, show the QuizTaker
  if (quizId || accessCode) {
    return (
      <div className="py-2 w-full">
        <div className="mb-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link to="/quiz" className="no-underline">
              <h2 className={`text-3xl ${isDark ? 'text-teal-400' : 'text-teal-700'} m-0 hover:opacity-90 transition-opacity`}>Quizzes</h2>
            </Link>
          </div>
        </div>
        <QuizTaker
          quizId={quizId}
          accessCode={accessCode}
        />
      </div>
    );
  }

  // Otherwise show the quiz list and access code entry
  return (
    <div className="py-2 w-full">
      <div className="mb-1 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/quiz" className="no-underline">
              <h2 className={`text-3xl ${isDark ? 'text-teal-400' : 'text-teal-700'} m-0 hover:opacity-90 transition-opacity`}>Quizzes</h2>
            </Link>
          </div>
          <div className="flex items-center max-w-md w-full">
            <input
              type="text"
              placeholder="Search quizzes..."
              className={`py-2 px-3 border rounded text-sm w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-slate-200 text-slate-900'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Access Code Entry - More compact */}
      <div className="max-w-2xl mx-auto mb-6 mt-4">
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-lg p-5 border`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
            Have an Access Code?
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-4 text-sm`}>
            If you have an access code for a specific quiz, enter it below to begin.
          </p>
          <form onSubmit={handleAccessCodeSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter access code"
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-slate-300 text-slate-900'}`}
              value={localAccessCode}
              onChange={(e) => setLocalAccessCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button
              type="submit"
              className={`px-5 py-2 ${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-600 hover:bg-teal-700'} text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
              disabled={!localAccessCode}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className={`p-3 ${isDark ? 'bg-red-900/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg mb-2 text-sm`}>
          {error}
        </div>
      )}

      {/* Practice Quizzes Section - Grouped */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'} mb-3`}>Practice Quizzes</h2>
        <p className={`text-sm ${isDark ? 'text-gray-300' : ''} mt-1 mb-2`}>Select a quiz below to start practicing.</p>
        {isLoading ? (
          <div className="text-center py-6">
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-sm`}>Loading quizzes...</p>
          </div>
        ) : Object.keys(groupedQuizzes).length === 0 ? (
          <div className="text-center py-6">
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-sm`}>No practice quizzes found{searchQuery ? ' matching your search' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedQuizzes).map(([sectionId, sectionData]) => (
              <div key={sectionId}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-teal-300 border-slate-700' : 'text-teal-600 border-slate-300'} mb-3 border-b pb-2`}>
                  {sectionData.sectionName}
                </h3>
                <div className="space-y-5">
                  {Object.entries(sectionData.categories).map(([categoryId, categoryData]) => (
                    <div key={categoryId}>
                      <h4 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'} mb-3`}>
                        {categoryData.categoryName}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryData.quizzes.map(quiz => (
                          <div
                            key={quiz.id}
                            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col`}
                            onClick={() => handleQuizSelect(quiz)}
                          >
                            <div className="p-6 flex-grow">
                              <div className="mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ?
                                  (quiz.is_practice ? 'bg-green-900/50 text-green-400' : 'bg-teal-900/50 text-teal-400') :
                                  (quiz.is_practice ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-teal-800')
                                }`}>
                                  {quiz.is_practice ? 'Practice Quiz' : 'Practice Mode Available'}
                                </span>
                              </div>
                              <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                                {quiz.title}
                              </h5>
                              {quiz.description && (
                                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-sm mb-4 line-clamp-3`}>{quiz.description}</p>
                              )}
                              <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                                <span>{quiz.questionCount} Questions</span>
                                {quiz.time_limit && (
                                  <span>{Math.floor(quiz.time_limit / 60)} Min Limit</span>
                                )}
                              </div>
                            </div>
                            <div className={`px-6 py-4 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'} border-t`}>
                              {quiz.is_practice ? (
                                <button
                                  className={`w-full py-2 ${isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 hover:bg-green-700'} text-white text-sm font-medium rounded-lg transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleQuizSelect(quiz);
                                  }}
                                >
                                  Start Practice Quiz
                                </button>
                              ) : (
                                <button
                                  className={`w-full py-2 ${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-600 hover:bg-teal-700'} text-white text-sm font-medium rounded-lg transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleQuizSelect(quiz);
                                  }}
                                >
                                  Start Practice Mode
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Code Entry - Removed from here */}

    </div>
  );
};

export default QuizPage;
