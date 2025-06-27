import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuizBuilderPage from '../../components/quiz-builder/QuizBuilderPage';
import AccessCodeManager from '../../components/quiz/access-codes/AccessCodeManager';
import { quizzesService } from '../../services/api/quizzes';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { section, quizId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archiveConfirmation, setArchiveConfirmation] = useState({ isOpen: false, quizId: null });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Determine current section from the URL path
  const currentSection = location.pathname.includes('/builder') ? 'builder' :
                        location.pathname.includes('/codes') ? 'codes' : null;

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
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Quizzes</h2>
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

      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text="Loading quizzes..." />
          </div>
        ) : quizzes.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            No quizzes found. Create your first quiz to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Quiz Name</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Questions</th>
                <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Type</th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-600' : 'divide-slate-200'}`}>
              {quizzes.map(quiz => (
              <tr key={quiz.id} className={isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}>
                <td className="px-4 py-4">
                  <div className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{quiz.title}</div>
                  {quiz.description && (
                    <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{quiz.description}</div>
                  )}
                </td>
                <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {quiz.questionCount} questions
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {quiz.is_practice ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      }`}>
                        Practice Only
                      </span>
                    ) : (
                      <div className="space-y-1">
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
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      Edit
                    </button>
                    {!quiz.is_practice && (
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                        onClick={() => handleManageCodes(quiz)}
                      >
                        Access Codes
                      </button>
                    )}
                    <button
                      type="button"
                      className={`px-4 py-2 ${
                        isDark
                          ? 'bg-slate-800 border-orange-500 text-orange-500 hover:bg-orange-900 hover:text-orange-200'
                          : 'bg-white border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                      } border font-medium rounded-lg transition-colors`}
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
