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
        savedQuizData = await quizzesService.create(quiz);
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
  }, [quiz, quizId, navigate, showToast]);

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

  return (
    <div className="py-4 max-w-full min-h-screen flex flex-col">
      {/* Back Button */}
      <div className="mb-6">
        <button
          className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} font-medium rounded-lg transition-colors`}
          onClick={handleBack}
        >
          ← Back to Quizzes
        </button>
      </div>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl ${isDark ? 'text-primary-light' : 'text-primary-dark'} m-0`}>
            {quizId ? 'Edit Quiz' : 'Create Quiz'}
          </h2>
          {quizId && quiz.title && (
            <h3 className={`text-xl ${isDark ? 'text-gray-300' : 'text-slate-600'} mt-2 mb-0 font-normal`}>
              {quiz.title}
            </h3>
          )}
        </div>
        <button
          className="bg-primary-dark hover:bg-primary text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>

      {error && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-4 rounded-lg mb-6`}>{error}</div>
      )}

      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6 flex-1 flex flex-col`}>
        <div className="flex mb-6 relative">
          {/* Add bottom border that spans the full width */}
          <div className={`absolute bottom-0 left-0 right-0 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          <div className="flex gap-1">
            {/* Quiz Details Tab */}
            <button
              className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                activeTab === 'metadata'
                  ? 'bg-primary-dark text-white border-slate-200 z-10' // Active: primary bg, white text
                  : isDark
                    ? 'bg-slate-700 text-gray-300 border-transparent hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200' // Inactive: darker gray, even darker on hover
              }`}
              onClick={() => setActiveTab('metadata')}
            >
              Quiz Details
            </button>

            {/* Questions Tab */}
            <button
              className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                activeTab === 'questions'
                  ? 'bg-primary-dark text-white border-slate-200 z-10'
                  : isDark
                    ? 'bg-slate-700 text-gray-300 border-transparent hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </button>

            {/* Preview Tab */}
            <button
              className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                activeTab === 'preview'
                  ? 'bg-primary-dark text-white border-slate-200 z-10'
                  : isDark
                    ? 'bg-slate-700 text-gray-300 border-transparent hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
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
