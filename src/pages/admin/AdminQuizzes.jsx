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
  const { quizId } = useParams();
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

  const getSortIndicator = (field) => {
    if (sortField !== field) {
      return null;
    }
    return sortOrder === 'asc' ? '↑' : '↓';
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

  const summaryStats = useMemo(() => {
    const assessmentCount = quizzes.filter((quiz) => !quiz.is_practice).length;
    const practiceOnlyCount = quizzes.filter((quiz) => quiz.is_practice).length;
    const hybridCount = quizzes.filter((quiz) => !quiz.is_practice && quiz.has_practice_mode).length;
    const totalQuestions = quizzes.reduce((total, quiz) => total + (quiz.questionCount || 0), 0);

    return {
      totalQuizzes: quizzes.length,
      assessmentCount,
      practiceOnlyCount,
      hybridCount,
      totalQuestions
    };
  }, [quizzes]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSections([]);
    setSelectedCategories([]);
  };

  const renderTypeBadge = (quiz) => {
    if (quiz.is_practice) {
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          isDark ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
          Practice Only
        </span>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          isDark ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          Assessment
        </span>
        {quiz.has_practice_mode && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDark ? 'bg-teal-900/40 text-teal-300 border border-teal-700' : 'bg-teal-100 text-teal-800 border border-teal-200'
          }`}>
            + Practice Mode
          </span>
        )}
      </div>
    );
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

  if (currentSection === 'codes' && quizId && !selectedQuiz) {
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
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} p-8`}>
          <LoadingSpinner size="lg" text="Loading quiz details..." />
        </div>
      </div>
    );
  }

  // Show quiz list by default
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`rounded-2xl border p-6 md:p-8 mb-6 ${
        isDark
          ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900'
          : 'border-slate-200 bg-gradient-to-r from-sky-50 to-white'
      }`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
              Admin Quiz System
            </p>
            <h2 className={`mt-1 text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Quiz Management
            </h2>
            <p className={`mt-2 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Build assessments, manage practice modes, and control access code distribution from one workspace.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
            onClick={handleCreateQuiz}
          >
            Create New Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
        <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Quizzes</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.totalQuizzes}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assessment</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{summaryStats.assessmentCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Practice Only</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{summaryStats.practiceOnlyCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dual Mode</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{summaryStats.hybridCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Questions</p>
          <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.totalQuestions}</p>
        </div>
      </div>

      {error && (
        <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg`}>
          <p className={isDark ? 'text-red-300' : 'text-red-600'}>{error}</p>
        </div>
      )}

      <div className={`mb-6 rounded-xl border p-5 md:p-6 ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
      }`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Filter Quiz Library
          </h3>
          {(searchTerm || selectedSections.length > 0 || selectedCategories.length > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Search
            </label>
            <input
              type="text"
              placeholder="Title, description, section, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
              }`}
            />
          </div>

          <div className="relative" ref={sectionDropdownRef}>
            <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Sections
            </label>
            <button
              type="button"
              onClick={() => setSectionDropdownOpen(!sectionDropdownOpen)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left focus:border-transparent focus:ring-2 focus:ring-primary ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">
                {selectedSections.length === 0
                  ? 'All sections'
                  : `${selectedSections.length} selected`
                }
              </span>
              <svg className={`h-4 w-4 transition-transform ${sectionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {sectionDropdownOpen && (
              <div className={`absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-lg ${
                isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'
              }`}>
                {availableFilters.sections.length === 0 ? (
                  <div className={`px-3 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No sections available
                  </div>
                ) : (
                  availableFilters.sections.map((sectionOption) => (
                    <label
                      key={sectionOption.id}
                      className={`flex cursor-pointer items-start gap-3 px-3 py-2 ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(sectionOption.id)}
                        onChange={() => toggleSectionSelection(sectionOption.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                        {sectionOption.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Categories
            </label>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left focus:border-transparent focus:ring-2 focus:ring-primary ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">
                {selectedCategories.length === 0
                  ? 'All categories'
                  : `${selectedCategories.length} selected`
                }
              </span>
              <svg className={`h-4 w-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoryDropdownOpen && (
              <div className={`absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-lg ${
                isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'
              }`}>
                {availableFilters.categories.length === 0 ? (
                  <div className={`px-3 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No categories available
                  </div>
                ) : (
                  availableFilters.categories.map((categoryOption) => (
                    <label
                      key={categoryOption.id}
                      className={`flex cursor-pointer items-start gap-3 px-3 py-2 ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(categoryOption.id)}
                        onChange={() => toggleCategorySelection(categoryOption.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                        {categoryOption.name}
                        {categoryOption.section && (
                          <span className={`ml-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                            ({categoryOption.section.name})
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`mt-4 flex flex-wrap items-center gap-2 border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          {searchTerm && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
              Search: {searchTerm}
            </span>
          )}
          {selectedSections.length > 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-emerald-900/40 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
              {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''}
            </span>
          )}
          {selectedCategories.length > 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
              {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'}
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
            Showing {filteredQuizzes.length} of {quizzes.length}
          </span>
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-sm overflow-hidden`}>
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
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full">
            <thead className={isDark ? 'bg-slate-900/80' : 'bg-slate-100'}>
              <tr>
                <th className={`text-left text-sm font-semibold p-0 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  <button
                    onClick={() => handleSort('title')}
                    className={`flex h-full w-full items-center gap-1 px-5 py-3 transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-slate-900'
                    }`}
                  >
                    Quiz Name
                    <span className="text-xs">{getSortIndicator('title')}</span>
                  </button>
                </th>
                <th className={`text-center text-sm font-semibold w-36 p-0 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  <button
                    onClick={() => handleSort('questionCount')}
                    className={`flex h-full w-full items-center justify-center gap-1 px-4 py-3 transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-slate-900'
                    }`}
                  >
                    Questions
                    <span className="text-xs">{getSortIndicator('questionCount')}</span>
                  </button>
                </th>
                <th className={`text-center text-sm font-semibold w-52 p-0 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  <button
                    onClick={() => handleSort('type')}
                    className={`flex h-full w-full items-center justify-center gap-1 px-4 py-3 transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-slate-900'
                    }`}
                  >
                    Delivery Type
                    <span className="text-xs">{getSortIndicator('type')}</span>
                  </button>
                </th>
                <th className={`text-center text-sm font-semibold w-44 p-0 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  <button
                    onClick={() => handleSort('created_at')}
                    className={`flex h-full w-full items-center justify-center gap-1 px-4 py-3 transition-colors ${
                      isDark ? 'hover:text-white' : 'hover:text-slate-900'
                    }`}
                  >
                    Date Created
                    <span className="text-xs">{getSortIndicator('created_at')}</span>
                  </button>
                </th>
                <th className={`px-4 py-3 text-center text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-600' : 'divide-slate-200'}`}>
              {filteredQuizzes.map(quiz => (
              <tr key={quiz.id} className={isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'}>
                <td className="px-5 py-4 align-top">
                  <div className="flex items-start gap-2">
                    <div className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{quiz.title}</div>
                    <VisibilityBadge content={quiz} size="sm" />
                  </div>
                  {quiz.description && (
                    <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{quiz.description}</div>
                  )}
                  {quiz.categories && quiz.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {quiz.categories.slice(0, 3).map((category) => (
                        <span
                          key={category.id}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {category.name}
                        </span>
                      ))}
                      {quiz.categories.length > 3 && (
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          +{quiz.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className={`px-4 py-4 text-center align-top ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${
                    isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {quiz.questionCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-top">
                  {renderTypeBadge(quiz)}
                </td>
                <td className={`px-4 py-4 text-center align-top ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {new Date(quiz.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-4 py-4 text-center align-top">
                  <div className="mx-auto flex w-[276px] items-center justify-center gap-2 whitespace-nowrap">
                    <button
                      type="button"
                      className={`w-[110px] rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        !quiz.is_practice
                          ? 'bg-primary hover:bg-primary-dark text-white cursor-pointer'
                          : isDark
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      onClick={!quiz.is_practice ? () => handleManageCodes(quiz) : undefined}
                      disabled={quiz.is_practice}
                    >
                      {!quiz.is_practice ? 'Access Codes' : 'No Codes'}
                    </button>
                    <button
                      type="button"
                      className="w-[72px] rounded-lg bg-primary px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`w-[86px] rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-orange-500 text-orange-400 hover:bg-orange-900/30 hover:text-orange-200'
                          : 'bg-white border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                      }`}
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
          </div>
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
