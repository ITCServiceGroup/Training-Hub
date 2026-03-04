import { useState, useEffect, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesService } from '../../services/api/quizzes';
import { useToast } from '../common/ToastContainer';
import LoadingSpinner from '../common/LoadingSpinner';
import QuizMetadataForm from './QuizMetadataForm';
import QuestionManager from './QuestionManager';
import QuizPreview from './QuizPreview';
import ConfirmationDialog from '../common/ConfirmationDialog'; // Import the new modal
import { useContentVisibility } from '../../hooks/useContentVisibility';
import RequestApprovalButton from '../common/RequestApprovalButton';

// Helper function to get initial state with preferences
const getInitialQuizState = () => {
  const defaultTimerMins = localStorage.getItem('quizDefaultTimer');
  const defaultQRand = localStorage.getItem('quizDefaultQuestionRandomization');
  const defaultARand = localStorage.getItem('quizDefaultAnswerRandomization');

  // Convert timer from minutes to seconds, handle null/invalid
  const timeLimitSeconds = defaultTimerMins ? parseInt(defaultTimerMins, 10) * 60 : null;

  return {
    title: '',
    description: '',
    category_ids: [],
    time_limit: !isNaN(timeLimitSeconds) && timeLimitSeconds > 0 ? timeLimitSeconds : null, // Store as seconds or null
    passing_score: 70, // Default passing score
    is_practice: false,
    has_practice_mode: false, // Add default for this field if needed
    randomize_questions: defaultQRand !== null ? JSON.parse(defaultQRand) : true, // Default to true if not set
    randomize_answers: defaultARand !== null ? JSON.parse(defaultARand) : true, // Default to true if not set
    questions: []
  };
};


const QuizBuilderPage = memo(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getNewContentDefaults } = useContentVisibility();
  // Initialize state using the helper function
  const [quiz, setQuiz] = useState(getInitialQuizState());
  const [initialQuizState, setInitialQuizState] = useState(null); // Store initial state for change detection
  // Removed duplicate initialQuizState line and stray closing brace
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('metadata');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State for modal visibility

  // Fetch quiz data if editing an existing quiz
  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        setIsLoading(true);
        try {
          const data = await quizzesService.getWithQuestions(quizId);
          // Ensure all fields exist in fetched data, merging with defaults if necessary
          const mergedData = { ...getInitialQuizState(), ...data };
          setQuiz(mergedData);
          setInitialQuizState(JSON.parse(JSON.stringify(mergedData))); // Deep copy for comparison
        } catch (error) {
          setError('Failed to load quiz');
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuiz();
    }
  }, [quizId]);

  // Handle saving the quiz
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let savedQuizData;
      if (quizId) {
        savedQuizData = await quizzesService.update(quizId, quiz);
        // Show success toast for updates
        showToast('Quiz updated successfully!', 'success');
        // Update initial state after successful save
        setInitialQuizState(JSON.parse(JSON.stringify(savedQuizData)));
        setQuiz(savedQuizData); // Ensure local state matches saved state
      } else {
        // Get RBAC defaults for new content
        const rbacDefaults = getNewContentDefaults();

        // Create quiz with RBAC fields
        savedQuizData = await quizzesService.create({
          ...quiz,
          ...rbacDefaults
        });
        // Show success toast for new quiz creation
        showToast('Quiz created successfully!', 'success');
        // Navigate back to quiz list after creating new quiz
        navigate('/admin/quizzes');
      }
    } catch (error) {
      setError('Failed to save quiz');
      showToast('Failed to save quiz', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [quiz, quizId, navigate, showToast, getNewContentDefaults]);

  // Update quiz data
  const handleQuizChange = useCallback((updatedQuiz) => {
    setQuiz(updatedQuiz);
  }, []);

  // Check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!initialQuizState) return false; // No initial state to compare against (e.g., creating new)
    // Simple JSON string comparison for deep equality check
    return JSON.stringify(quiz) !== JSON.stringify(initialQuizState);
  }, [quiz, initialQuizState]);

  // Handle navigation back to the quiz list
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges()) {
      setIsConfirmModalOpen(true); // Open the modal instead of window.confirm
    } else {
      navigate('/admin/quizzes');
    }
  }, [hasUnsavedChanges, navigate]);

  // Action to take when confirming leave in modal
  const confirmLeave = useCallback(() => {
    setIsConfirmModalOpen(false);
    navigate('/admin/quizzes');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  const hasCategories = Array.isArray(quiz.category_ids) && quiz.category_ids.length > 0;
  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

  return (
    <div className="py-4 max-w-full min-h-screen flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} font-medium rounded-lg transition-colors`}
          onClick={handleBack}
        >
          ← Back to Quizzes
        </button>
      </div>

      <div className={`rounded-xl border p-6 md:p-7 ${
        isDark
          ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900'
          : 'border-slate-200 bg-gradient-to-r from-sky-50 to-white'
      }`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={`text-xs uppercase tracking-wide font-semibold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
              Quiz Builder
            </p>
            <h2 className={`mt-1 text-3xl md:text-4xl font-bold ${isDark ? 'text-primary-light' : 'text-primary-dark'} m-0`}>
              {quizId ? 'Edit Quiz' : 'Create Quiz'}
            </h2>
            <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {quizId
                ? (quiz.title || 'Configure quiz settings, question selection, and learner experience.')
                : 'Set up quiz details first, then add questions and review before publishing.'
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {quizId && quiz && (
              <RequestApprovalButton
                content={quiz}
                contentType="quiz"
                onRequestSuccess={() => {
                  showToast('Approval request submitted successfully', 'success');
                }}
              />
            )}
            <button
              className="bg-primary-dark hover:bg-primary text-white border-none rounded-lg py-3 px-5 text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {hasCategories ? `${quiz.category_ids.length} categories linked` : 'No categories selected'}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {questionCount} question{questionCount === 1 ? '' : 's'}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            quiz.is_practice
              ? (isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
              : quiz.has_practice_mode
                ? (isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-800')
                : (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
          }`}>
            {quiz.is_practice ? 'Practice Only' : quiz.has_practice_mode ? 'Assessment + Practice' : 'Assessment'}
          </span>
        </div>
      </div>

      {error && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-200'} border p-4 rounded-lg`}>{error}</div>
      )}

      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-4 md:p-6 flex-1 flex flex-col`}>
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'metadata'
                ? 'bg-primary-dark text-white'
                : isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('metadata')}
          >
            1. Quiz Details
          </button>
          <button
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'questions'
                ? 'bg-primary-dark text-white'
                : isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('questions')}
          >
            2. Questions
          </button>
          <button
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-primary-dark text-white'
                : isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            3. Preview
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'metadata' && (
            <QuizMetadataForm
              quiz={quiz}
              onChange={handleQuizChange}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionManager
              quiz={quiz}
              onChange={handleQuizChange}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'preview' && (
            <QuizPreview quiz={quiz} />
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmLeave}
        title="Unsaved Changes"
        description="Are you sure you want to leave? Your changes will not be saved."
        confirmButtonText="Leave"
        cancelButtonText="Stay"
        confirmButtonVariant="danger"
      />
    </div>
  );
});

QuizBuilderPage.displayName = 'QuizBuilderPage';

export default QuizBuilderPage;
