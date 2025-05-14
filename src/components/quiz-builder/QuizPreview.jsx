import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { questionsService } from '../../services/api/questions';

// Helper to create initial answers state from questions
const createInitialAnswers = (questions) => {
  const initial = {};
  questions.forEach(q => {
    initial[q.id] = q.question_type === 'check_all_that_apply' ? [] : '';
  });
  return initial;
};

const QuizPreview = ({ quiz }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionData, setQuestionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!quiz.questions || quiz.questions.length === 0) {
        setQuestionData([]);
        setIsLoading(false);
        return;
      }

      try {
        const questionIds = quiz.questions.map(q => typeof q === 'string' ? q : q.id);
        const fetchedQuestions = await Promise.all(
          questionIds.map(id => questionsService.get(id))
        );
        const questions = fetchedQuestions.filter(q => q); // Filter out any null values
        setQuestionData(questions);
        setSelectedAnswers(createInitialAnswers(questions));
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [quiz.questions]);

  // Format time (seconds) to MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return 'No time limit';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render question based on its type
  const renderQuestion = (question) => {
    if (!question) return null;

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-3 border rounded-md cursor-pointer transition-colors text-left flex items-center ${
                  selectedAnswers[question.id] === option
                    ? isDark ? 'border-teal-500 bg-teal-900/30' : 'border-teal-500 bg-teal-50'
                    : isDark ? 'border-slate-600 hover:border-teal-500 bg-slate-700' : 'border-slate-200 hover:border-teal-500 bg-white'
                }`}
                onClick={() => setSelectedAnswers({
                  ...selectedAnswers,
                  [question.id]: option
                })}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-2
                    ${isDark ? 'border-slate-400' : 'border-slate-300'}
                    ${selectedAnswers[question.id] === option ? 'bg-teal-600 border-teal-600' : 'bg-transparent'}`}>
                    {selectedAnswers[question.id] === option && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'check_all_that_apply':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-3 border rounded-md cursor-pointer transition-colors text-left flex items-center ${
                  selectedAnswers[question.id]?.includes(option)
                    ? isDark ? 'border-teal-500 bg-teal-900/30' : 'border-teal-500 bg-teal-50'
                    : isDark ? 'border-slate-600 hover:border-teal-500 bg-slate-700' : 'border-slate-200 hover:border-teal-500 bg-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const currentAnswers = selectedAnswers[question.id] || [];
                  const newAnswers = currentAnswers.includes(option)
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option];
                  setSelectedAnswers({
                    ...selectedAnswers,
                    [question.id]: newAnswers
                  });
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedAnswers[question.id]?.includes(option)}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center mr-2 rounded
                    ${isDark ? 'border-slate-400' : 'border-slate-300'}
                    ${selectedAnswers[question.id]?.includes(option) ? 'bg-teal-600 border-teal-600' : 'bg-transparent'}`}>
                    {selectedAnswers[question.id]?.includes(option) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex space-x-4">
            <button
              className={`flex-1 p-3 border rounded-md cursor-pointer transition-colors flex items-center justify-center ${
                selectedAnswers[question.id] === 'true'
                  ? isDark ? 'border-teal-500 bg-teal-900/30' : 'border-teal-500 bg-teal-50'
                  : isDark ? 'border-slate-600 hover:border-teal-500 bg-slate-700' : 'border-slate-200 hover:border-teal-500 bg-white'
              }`}
              onClick={() => setSelectedAnswers({
                ...selectedAnswers,
                [question.id]: 'true'
              })}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-2
                  ${isDark ? 'border-slate-400' : 'border-slate-300'}
                  ${selectedAnswers[question.id] === 'true' ? 'bg-teal-600 border-teal-600' : 'bg-transparent'}`}>
                  {selectedAnswers[question.id] === 'true' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>True</span>
              </div>
            </button>
            <button
              className={`flex-1 p-3 border rounded-md cursor-pointer transition-colors flex items-center justify-center ${
                selectedAnswers[question.id] === 'false'
                  ? isDark ? 'border-teal-500 bg-teal-900/30' : 'border-teal-500 bg-teal-50'
                  : isDark ? 'border-slate-600 hover:border-teal-500 bg-slate-700' : 'border-slate-200 hover:border-teal-500 bg-white'
              }`}
              onClick={() => setSelectedAnswers({
                ...selectedAnswers,
                [question.id]: 'false'
              })}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-2
                  ${isDark ? 'border-slate-400' : 'border-slate-300'}
                  ${selectedAnswers[question.id] === 'false' ? 'bg-teal-600 border-teal-600' : 'bg-transparent'}`}>
                  {selectedAnswers[question.id] === 'false' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>False</span>
              </div>
            </button>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>{quiz.title}</h3>
        {quiz.description && (
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-4`}>{quiz.description}</p>
        )}
        <div className={`flex gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <div>Time Limit: {formatTime(quiz.time_limit)}</div>
          <div>Passing Score: {quiz.passing_score}%</div>
          {quiz.is_practice && (
            <div className={`${isDark ? 'text-teal-400' : 'text-teal-600'} font-medium`}>Practice Quiz</div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Loading questions...</p>
        </div>
      ) : questionData && questionData.length > 0 ? (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Question {currentQuestionIndex + 1} of {questionData.length}
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 text-sm border rounded ${isDark ? 'border-slate-600 text-gray-300 hover:border-slate-500' : 'border-slate-200 text-slate-700 hover:border-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  className={`px-3 py-1 text-sm border rounded ${isDark ? 'border-slate-600 text-gray-300 hover:border-slate-500' : 'border-slate-200 text-slate-700 hover:border-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={currentQuestionIndex === questionData.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
            <div className={`h-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded overflow-hidden`}>
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questionData.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <p className={`text-lg font-medium mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {questionData[currentQuestionIndex].question_text}
            </p>
            {renderQuestion(questionData[currentQuestionIndex])}
          </div>
        </div>
      ) : (
        <div className={`text-center p-8 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>No questions added to this quiz yet.</p>
        </div>
      )}
    </div>
  );
};

export default QuizPreview;
