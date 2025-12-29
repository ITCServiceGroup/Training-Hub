import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuizBuilderPage from '../../components/quiz-builder/QuizBuilderPage';
import AccessCodeManager from '../../components/quiz/access-codes/AccessCodeManager';
import { quizzesService } from '../../services/api/quizzes';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VisibilityBadge from '../../components/common/VisibilityBadge';

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { section, quizId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archiveConfirmation, setArchiveConfirmation] = useState({ isOpen: false, quizId: null });

  // Filter states
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting states
  const [sortField, setSortField] = useState('title'); // 'title', 'questionCount', 'type', 'created_at'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Dropdown states
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Refs for dropdown management
  const sectionDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Determine current section from the URL path
  const currentSection = location.pathname.includes('/builder') ? 'builder' :
                        location.pathname.includes('/codes') ? 'codes' : null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target)) {
        setSectionDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper functions for dropdown management
  const toggleSectionSelection = (sectionId) => {
    setSelectedSections(prev => {
      const newSelection = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      
      // Clear category selections when section selection changes
      // This ensures that categories from unselected sections are not kept selected
      setSelectedCategories([]);
      
      return newSelection;
    });
  };

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Extract unique sections and categories from quizzes for filter options
  const availableFilters = useMemo(() => {
    const sectionsMap = new Map();
    const categoriesMap = new Map();

    quizzes.forEach(quiz => {
      quiz.categories?.forEach(category => {
        // Add section if it exists
        if (category.section && !sectionsMap.has(category.section.id)) {
          sectionsMap.set(category.section.id, category.section);
        }
        
        // Add category only if no sections are selected, or if the category's section is selected
        if (selectedSections.length === 0 || 
            (category.section && selectedSections.includes(category.section.id))) {
          if (!categoriesMap.has(category.id)) {
            categoriesMap.set(category.id, category);
          }
        }
      });
    });

    return {
      sections: Array.from(sectionsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      categories: Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [quizzes, selectedSections]);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort quizzes based on selected filters and sorting
  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes.filter(quiz => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = quiz.title?.toLowerCase().includes(searchLower);
        const matchesDescription = quiz.description?.toLowerCase().includes(searchLower);
        const matchesCategory = quiz.categories?.some(cat =>
          cat.name?.toLowerCase().includes(searchLower)
        );
        const matchesSection = quiz.categories?.some(cat =>
          cat.section?.name?.toLowerCase().includes(searchLower)
        );

        if (!matchesTitle && !matchesDescription && !matchesCategory && !matchesSection) {
          return false;
        }
      }

      // Section filter
      if (selectedSections.length > 0) {
        const hasMatchingSection = quiz.categories?.some(category =>
          category.section && selectedSections.includes(category.section.id)
        );
        if (!hasMatchingSection) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const hasMatchingCategory = quiz.categories?.some(category =>
          selectedCategories.includes(category.id)
        );
        if (!hasMatchingCategory) return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'questionCount':
          aValue = a.questionCount || 0;
          bValue = b.questionCount || 0;
          break;
        case 'type':
          // Sort by type: Practice Only, Assessment, Assessment+Practice
          aValue = a.is_practice ? 'Practice Only' :
                   a.has_practice_mode ? 'Assessment+Practice' : 'Assessment';
          bValue = b.is_practice ? 'Practice Only' :
                   b.has_practice_mode ? 'Assessment+Practice' : 'Assessment';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }

      if (sortField === 'questionCount') {
        // Numeric sorting
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortField === 'created_at') {
        // Date sorting
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // String sorting
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });

    return filtered;
  }, [quizzes, searchTerm, selectedSections, selectedCategories, sortField, sortOrder]);

  // Load quiz data when quizId changes
  useEffect(() => {
    if (quizId) {
      const loadQuiz = async () => {
        try {
          const quiz = await quizzesService.getAllWithQuestionCount();
          const foundQuiz = quiz.find(q => q.id === quizId);
          if (foundQuiz) {
            setSelectedQuiz(foundQuiz);
          } else {
            setError('Quiz not found');
          }
        } catch (error) {
          setError('Failed to load quiz');
        }
      };
      loadQuiz();
    }
  }, [quizId]);

  // Load all quizzes for the list view
  useEffect(() => {
    if (!currentSection) {
      loadQuizzes();
    }
  }, [currentSection]);

  const loadQuizzes = async () => {
    try {
      const data = await quizzesService.getAllWithQuestionCount();
      setQuizzes(data);
    } catch (error) {
      setError('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    navigate('/admin/quizzes/builder');
  };

  const handleEditQuiz = (quiz) => {
    navigate(`/admin/quizzes/builder/${quiz.id}`);
  };

  const handleManageCodes = (quiz) => {
    navigate(`/admin/quizzes/codes/${quiz.id}`);
  };

  const openArchiveConfirmation = (quizId) => {
    setArchiveConfirmation({ isOpen: true, quizId });
  };

  const handleArchiveQuiz = async (quizId) => {
    try {
      // quizzesService.delete now performs an archive (soft delete)
      await quizzesService.delete(quizId);
      // Reload the list of active quizzes
      await loadQuizzes();
    } catch (error) {
      setError('Failed to archive quiz'); // Update error message
    }
  };

  // Show quiz builder if in builder mode
  if (currentSection === 'builder') {
    return <QuizBuilderPage />;
  }

  // Show access code manager if in codes mode
  if (currentSection === 'codes' && quizId && selectedQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} font-medium rounded-lg transition-colors`}
            onClick={() => navigate('/admin/quizzes')}
          >
            ← Back to Quizzes
          </button>
        </div>

        <AccessCodeManager
          quizId={quizId}
          quizTitle={selectedQuiz.title}
        />
      </div>
    );
  }

  // Show quiz list by default
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Quiz</h2>
          <p className={`mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Manage quizzes and access codes
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          onClick={handleCreateQuiz}
        >
          Create New Quiz
        </button>
      </div>

      {error && (
        <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg`}>
          <p className={isDark ? 'text-red-300' : 'text-red-600'}>{error}</p>
        </div>
      )}

      {/* Filter Controls */}
      <div className={`mb-6 p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Search Quizzes
            </label>
            <input
              type="text"
              placeholder="Search by title, description, section, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Section Filter */}
          <div className="relative" ref={sectionDropdownRef}>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Filter by Sections
            </label>
            <button
              type="button"
              onClick={() => setSectionDropdownOpen(!sectionDropdownOpen)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left flex items-center justify-between ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600'
                  : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>
                {selectedSections.length === 0
                  ? 'Select sections...'
                  : `${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''} selected`
                }
              </span>
              <svg className={`w-4 h-4 transition-transform ${sectionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {sectionDropdownOpen && (
              <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                isDark
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-white border-slate-300'
              }`}>
                {availableFilters.sections.length === 0 ? (
                  <div className={`px-3 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No sections available
                  </div>
                ) : (
                  availableFilters.sections.map(section => (
                    <div
                      key={section.id}
                      className={`px-3 py-2 cursor-pointer hover:${isDark ? 'bg-slate-600' : 'bg-slate-50'}`}
                      onClick={(e) => {
                        // Only toggle if clicking on the div itself, not the checkbox
                        if (e.target.type !== 'checkbox') {
                          toggleSectionSelection(section.id);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(section.id)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            toggleSectionSelection(section.id);
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 cursor-pointer"
                          style={{ marginTop: '4px' }}
                        />
                        <div className="ml-3">
                          <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {section.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Filter by Categories
            </label>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left flex items-center justify-between ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600'
                  : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>
                {selectedCategories.length === 0
                  ? 'Select categories...'
                  : `${selectedCategories.length} categor${selectedCategories.length !== 1 ? 'ies' : 'y'} selected`
                }
              </span>
              <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoryDropdownOpen && (
              <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                isDark
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-white border-slate-300'
              }`}>
                {availableFilters.categories.length === 0 ? (
                  <div className={`px-3 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No categories available
                  </div>
                ) : (
                  availableFilters.categories.map(category => (
                    <div
                      key={category.id}
                      className={`px-3 py-2 cursor-pointer hover:${isDark ? 'bg-slate-600' : 'bg-slate-50'}`}
                      onClick={(e) => {
                        // Only toggle if clicking on the div itself, not the checkbox
                        if (e.target.type !== 'checkbox') {
                          toggleCategorySelection(category.id);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            toggleCategorySelection(category.id);
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 cursor-pointer"
                          style={{ marginTop: '5px' }}
                        />
                        <div className="ml-3">
                          <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {category.name}
                            {category.section && (
                              <span className={`ml-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                ({category.section.name})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Summary and Clear */}
        {(searchTerm || selectedSections.length > 0 || selectedCategories.length > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedSections.length > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                    {selectedSections.length} Section{selectedSections.length !== 1 ? 's' : ''}
                  </span>
                )}
                {selectedCategories.length > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                    {selectedCategories.length} Categor{selectedCategories.length !== 1 ? 'ies' : 'y'}
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {filteredQuizzes.length} of {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSections([]);
                  setSelectedCategories([]);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text="Loading quizzes..." />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            {quizzes.length === 0
              ? "No quizzes found. Create your first quiz to get started."
              : "No quizzes match your current filters. Try adjusting your search criteria."
            }
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-primary">
              <tr>
                <th className="text-left text-sm font-medium text-white p-0">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors w-full h-full px-4 py-3"
                  >
                    Quiz Name
                    {sortField === 'title' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-center text-sm font-medium text-white w-32 p-0">
                  <button
                    onClick={() => handleSort('questionCount')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors justify-center w-full h-full px-4 py-3"
                  >
                    Questions
                    {sortField === 'questionCount' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-center text-sm font-medium text-white w-40 p-0">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors justify-center w-full h-full px-4 py-3"
                  >
                    Type
                    {sortField === 'type' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-center text-sm font-medium text-white w-48 p-0">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors justify-center w-full h-full px-4 py-3"
                  >
                    Date Created
                    {sortField === 'created_at' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white">
                  <button className="flex items-center gap-1 justify-center w-full cursor-default">
                    Actions
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-600' : 'divide-slate-200'}`}>
              {filteredQuizzes.map(quiz => (
              <tr key={quiz.id} className={isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{quiz.title}</div>
                    <VisibilityBadge content={quiz} size="sm" />
                  </div>
                  {quiz.description && (
                    <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{quiz.description}</div>
                  )}
                </td>
                <td className={`px-4 py-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {quiz.questionCount} questions
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="space-y-1 flex flex-col items-center">
                    {quiz.is_practice ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      }`}>
                        Practice Only
                      </span>
                    ) : (
                      <div className="space-y-1 flex flex-col items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Assessment
                        </span>
                        {quiz.has_practice_mode && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                            +Practice Mode
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className={`px-4 py-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {new Date(quiz.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-2 min-w-[320px]">
                    <button
                      type="button"
                      className={`px-4 py-2 font-medium rounded-lg transition-colors w-32 whitespace-nowrap flex items-center justify-center ${
                        !quiz.is_practice
                          ? 'bg-primary hover:bg-primary-dark text-white cursor-pointer'
                          : 'bg-transparent text-transparent cursor-default'
                      }`}
                      onClick={!quiz.is_practice ? () => handleManageCodes(quiz) : undefined}
                      disabled={quiz.is_practice}
                    >
                      {!quiz.is_practice ? 'Access Codes' : ''}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors w-16 flex items-center justify-center"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 ${
                        isDark
                          ? 'bg-slate-800 border-orange-500 text-orange-500 hover:bg-orange-900 hover:text-orange-200'
                          : 'bg-white border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                      } border font-medium rounded-lg transition-colors w-20 flex items-center justify-center`}
                      onClick={() => openArchiveConfirmation(quiz.id)}
                      title="Archive quiz"
                    >
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmationDialog
        isOpen={archiveConfirmation.isOpen}
        onClose={() => setArchiveConfirmation({ isOpen: false, quizId: null })}
        onConfirm={() => {
          handleArchiveQuiz(archiveConfirmation.quizId); // Use renamed handler
          setArchiveConfirmation({ isOpen: false, quizId: null });
        }}
        title="Archive Quiz" // Update title
        description="Are you sure you want to archive this quiz? It will be hidden from lists but can be recovered later." // Update description
        confirmButtonText="Archive" // Update button text
        confirmButtonVariant="danger" // Revert to allowed variant
        isDarkMode={isDark} // Pass dark mode state to dialog
      />
    </div>
  );
};

export default AdminQuizzes;
