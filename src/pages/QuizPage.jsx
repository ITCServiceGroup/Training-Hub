import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { quizzesService } from '../services/api/quizzes';
import { sectionsService } from '../services/api/sections';
import { searchService } from '../services/api/search';
import QuizTaker from '../components/quiz/QuizTaker';
import SectionGrid from '../components/SectionGrid';
import CategoryGrid from '../components/CategoryGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuizSearchResults from '../components/QuizSearchResults';
import { groupBy } from 'lodash'; // Assuming lodash is available, or implement a simple groupBy

const QuizPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { quizId, accessCode, sectionId, categoryId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizCounts, setQuizCounts] = useState({});
  const [localAccessCode, setLocalAccessCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Load sections with categories (for proper ordering and category counts)
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoadingSections(true);
      try {
        const data = await sectionsService.getSectionsWithCategories(true); // Get published content for public view
        setSections(data);
      } catch (error) {
        setError('Failed to load sections');
      } finally {
        setIsLoadingSections(false);
      }
    };

    if (!quizId && !accessCode) {
      fetchSections();
    }
  }, [quizId, accessCode]);

  // Load categories when section is selected
  useEffect(() => {
    if (!sectionId) {
      setCategories([]);
      setQuizCounts({});
      return;
    }

    setIsLoadingCategories(true);
    try {
      const section = sections.find(s => s.id === sectionId);

      if (section && section.v2_categories) {
        // Categories are already ordered by display_order from the API
        setCategories(section.v2_categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [sectionId, sections]);

  // Load quiz counts for categories when categories are loaded
  useEffect(() => {
    const fetchQuizCounts = async () => {
      if (categories.length === 0) {
        setQuizCounts({});
        return;
      }

      try {
        const counts = {};
        await Promise.all(
          categories.map(async (category) => {
            const count = await quizzesService.countPracticeQuizzesByCategory(category.id);
            counts[category.id] = count;
          })
        );
        setQuizCounts(counts);
      } catch (error) {
        console.error('Failed to load quiz counts:', error);
        setQuizCounts({});
      }
    };

    fetchQuizCounts();
  }, [categories]);

  // Load available quizzes when category is selected
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!categoryId) {
        setQuizzes([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await quizzesService.getAllWithQuestionCount();
        // Filter by category and show practice quizzes and quizzes with practice mode
        const filteredQuizzes = data.filter(quiz => {
          const categoryIds = typeof quiz.category_ids === 'string'
            ? JSON.parse(quiz.category_ids)
            : quiz.category_ids || [];

          return (quiz.is_practice || quiz.has_practice_mode) &&
                 categoryIds.includes(categoryId);
        });
        setQuizzes(filteredQuizzes);
      } catch (error) {
        setError('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    if (!quizId && !accessCode && categoryId) {
      fetchQuizzes();
    }
  }, [quizId, accessCode, categoryId]);

  // Handle access code submission
  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (localAccessCode) {
      navigate(`/quiz/access/${localAccessCode}`);
    }
  };

  // Handle quiz selection
  const handleQuizSelect = (quiz) => {
    // Include section and category context in the URL if available
    if (sectionId && categoryId) {
      navigate(`/quiz/${quiz.id}?from=practice&sectionId=${sectionId}&categoryId=${categoryId}`);
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  // Handler for search
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchService.searchQuizzes(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching quiz content:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Clear search results when navigating
  useEffect(() => {
    setSearchResults(null);
    setSearchQuery('');
  }, [sectionId, categoryId, quizId]);

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Filter quizzes based on search query only when not using global search
  const filteredQuizzes = useMemo(() => {
    // If we have search results from global search, don't filter locally
    if (searchResults && searchQuery) {
      return quizzes;
    }
    
    // Otherwise, filter locally if there's a search query but no global results
    return searchQuery && !searchResults
      ? quizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : quizzes;
  }, [quizzes, searchQuery, searchResults]);

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
      <div className="py-2 w-full flex flex-col flex-1">
        <div className="py-3 px-8">
          <div className="flex items-center gap-2">
            <Link to="/quiz" className="no-underline">
              <h2 className={`text-3xl ${isDark ? 'text-primary-light' : 'text-primary-dark'} m-0 hover:opacity-90 transition-opacity`} style={{marginTop: '-14px'}}>Quizzes</h2>
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
    <div className="py-2 w-full flex flex-col flex-1">
      <div className="py-3 px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/quiz" className="no-underline">
              <h2 className={`text-3xl ${isDark ? 'text-primary-light' : 'text-primary-dark'} m-0 hover:opacity-90 transition-opacity`} style={{marginTop: '-14px'}}>Quizzes</h2>
            </Link>
          </div>
          <div className="flex items-center max-w-md w-full relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search sections, categories, and quizzes..."
              className={`py-2 px-3 border rounded text-sm w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-slate-200 text-slate-900'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary/80 transition-colors`}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <FaTimes size={14} />
              </button>
            )}
            {isSearching && (
              <div className={`absolute ${searchQuery ? 'right-8' : 'right-3'} top-1/2 -translate-y-1/2`}>
                <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-gray-700 border-t-primary' : 'border-gray-200 border-t-primary'} animate-spin`}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && searchQuery ? (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Search Results for "{searchQuery}"
            </h2>
            <button
              onClick={handleClearSearch}
              className={`px-3 py-1 text-sm rounded bg-secondary hover:bg-secondary/80 text-white transition-colors`}
            >
              Clear Search
            </button>
          </div>
          <QuizSearchResults
            results={searchResults}
            isLoading={isSearching}
            searchQuery={searchQuery}
            onResultClick={handleClearSearch}
          />
        </div>
      ) : (
        <>
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
              name="accessCode"
              autoComplete="off"
              placeholder="Enter access code"
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm h-10 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-slate-300 text-slate-900'}`}
              value={localAccessCode}
              onChange={(e) => setLocalAccessCode(e.target.value.toUpperCase())}
              maxLength={8}
              data-form-type="other"
            />
            <button
              type="submit"
              className={`px-5 py-2 ${isDark ? 'bg-primary hover:bg-primary-light' : 'bg-primary-dark hover:bg-primary'} text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm h-10`}
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

      {/* Main content area with conditional rendering based on navigation state */}
      {!sectionId ? (
          /* Section view (no section selected) */
          <div className="px-8">
            <p className={`text-sm ${isDark ? 'text-gray-300' : ''} mt-1 mb-2`}>Select a section below to view the practice quiz categories.</p>
            <SectionGrid
              sections={sections}
              isLoading={isLoadingSections}
              searchQuery={searchResults ? '' : searchQuery}
              navigationPath="quiz"
            />
          </div>
        ) : !categoryId ? (
          /* Category view (section selected, no category selected) */
          <div className="px-8">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => navigate('/quiz')}
                className={`text-sm ${isDark ? 'text-primary-light hover:text-primary' : 'text-primary-dark hover:text-primary'} hover:underline`}
              >
                ← Back to Sections
              </button>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : ''} mt-1 mb-2`}>Select a category below to view practice quizzes.</p>
            <CategoryGrid
              categories={categories}
              sectionId={sectionId}
              isLoading={isLoadingCategories}
              searchQuery={searchResults ? '' : searchQuery}
              navigationPath="quiz"
              quizCounts={quizCounts}
            />
          </div>
        ) : (
          /* Quiz view (section and category selected) */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => navigate(`/quiz/practice/${sectionId}`)}
                className={`text-sm ${isDark ? 'text-primary-light hover:text-primary' : 'text-primary-dark hover:text-primary'} hover:underline`}
              >
                ← Back to Categories
              </button>
            </div>
            {isLoading ? (
              <div className="p-8">
                <LoadingSpinner size="lg" text="Loading quizzes..." />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-6">
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-sm`}>No practice quizzes found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <div
                    key={quiz.id}
                    className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col`}
                    onClick={() => handleQuizSelect(quiz)}
                  >
                    <div className="p-6 flex-grow">
                      <div className="mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ?
                          (quiz.is_practice ? 'bg-green-900/50 text-green-400' : 'bg-primary/20 text-primary-light') :
                          (quiz.is_practice ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary-dark')
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
                        <span>{quiz.questionCount || quiz.question_count || 0} Questions</span>
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
                          className={`w-full py-2 ${isDark ? 'bg-primary hover:bg-primary-light' : 'bg-primary-dark hover:bg-primary'} text-white text-sm font-medium rounded-lg transition-colors`}
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
            )}
          </div>
        )}

        </>
      )}
    </div>
  );
};

export default QuizPage;
