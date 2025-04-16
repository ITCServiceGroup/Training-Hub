import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesService } from '../../services/api/quizzes';
import QuizMetadataForm from './QuizMetadataForm';
import QuestionManager from './QuestionManager';
import QuizPreview from './QuizPreview';
import ConfirmationDialog from '../common/ConfirmationDialog'; // Import the new modal

const QuizBuilderPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category_ids: [],
    time_limit: null,
    passing_score: 70,
    is_practice: false,
    questions: []
  });
  const [initialQuizState, setInitialQuizState] = useState(null); // Store initial state
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
          setQuiz(data);
          setInitialQuizState(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
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
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let savedQuizData;
      if (quizId) {
        savedQuizData = await quizzesService.update(quizId, quiz);
      } else {
        savedQuizData = await quizzesService.create(quiz);
        // Navigate to edit page for the new quiz, but stay on the page for updates
        navigate(`/admin/quizzes/edit/${savedQuizData.id}`, { replace: true }); 
      }
      // Update initial state after successful save
      setInitialQuizState(JSON.parse(JSON.stringify(savedQuizData)));
      setQuiz(savedQuizData); // Ensure local state matches saved state
    } catch (error) {
      setError('Failed to save quiz');
    } finally {
      setIsLoading(false);
    }
  };

  // Update quiz data
  const handleQuizChange = (updatedQuiz) => {
    setQuiz(updatedQuiz);
  };

  // Check for unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialQuizState) return false; // No initial state to compare against (e.g., creating new)
    // Simple JSON string comparison for deep equality check
    return JSON.stringify(quiz) !== JSON.stringify(initialQuizState);
  };

  // Handle navigation back to the quiz list
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setIsConfirmModalOpen(true); // Open the modal instead of window.confirm
    } else {
      navigate('/admin/quizzes');
    }
  };

  // Action to take when confirming leave in modal
  const confirmLeave = () => {
    setIsConfirmModalOpen(false);
    navigate('/admin/quizzes');
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading quiz...</div>;
  }

  return (
    <div className="py-4 max-w-full">
      {/* Back Button */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          onClick={handleBack}
        >
          ← Back to Quizzes
        </button>
      </div>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl text-teal-700 m-0">
            {quizId ? 'Edit Quiz' : 'Create Quiz'}
          </h2>
          {quizId && quiz.title && (
            <h3 className="text-xl text-slate-600 mt-2 mb-0 font-normal">
              {quiz.title}
            </h3>
          )}
        </div>
        <button
          className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex mb-6 relative">
          {/* Add bottom border that spans the full width */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200"></div>
          
          <div className="flex gap-1">
            {/* Quiz Details Tab */}
            <button
              className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                activeTab === 'metadata'
                  ? 'bg-teal-700 text-white border-slate-200 z-10' // Active: teal bg, white text
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
                  ? 'bg-teal-700 text-white border-slate-200 z-10'
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
                  ? 'bg-teal-700 text-white border-slate-200 z-10'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
        </div>

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
};

export default QuizBuilderPage;
