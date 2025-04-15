import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesService } from '../services/api/quizzes';
import QuizTaker from '../components/quiz/QuizTaker';

const QuizPage = () => {
  const { quizId, accessCode } = useParams();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [localAccessCode, setLocalAccessCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available quizzes
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

  // Filter quizzes based on search query
  const filteredQuizzes = searchQuery
    ? quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quizzes;

  // If we have a quiz ID or access code, show the QuizTaker
  if (quizId || accessCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizTaker 
          quizId={quizId} 
          accessCode={accessCode}
        />
      </div>
    );
  }

  // Otherwise show the quiz list and access code entry
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-slate-900">Quizzes</h1>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-600">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-600">No quizzes found</p>
          </div>
        ) : (
          filteredQuizzes.map(quiz => (
            <div 
              key={quiz.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQuizSelect(quiz)}
            >
              <div className="p-6">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quiz.is_practice ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {quiz.is_practice ? 'Practice Quiz' : 'Practice Mode Available'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {quiz.title}
                </h2>
                {quiz.description && (
                  <p className="text-slate-600 mb-4">{quiz.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{quiz.questionCount} Questions</span>
                  {quiz.time_limit && (
                    <span>{Math.floor(quiz.time_limit / 60)} Minutes</span>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                {quiz.is_practice ? (
                  <button 
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuizSelect(quiz);
                    }}
                  >
                    Start Practice Quiz
                  </button>
                ) : (
                  <button 
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuizSelect(quiz);
                    }}
                  >
                    Start Practice Mode
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Access Code Entry */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Have an Access Code?
          </h2>
          <p className="text-slate-600 mb-6">
            If you have an access code for a specific quiz, enter it below to begin.
          </p>
          <form onSubmit={handleAccessCodeSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter access code"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={localAccessCode}
              onChange={(e) => setLocalAccessCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              disabled={!localAccessCode}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
