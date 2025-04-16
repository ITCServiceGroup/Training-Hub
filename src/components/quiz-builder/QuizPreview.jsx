import React, { useState, useEffect } from 'react';
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
              <div
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedAnswers[question.id] === option
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:border-teal-500'
                }`}
                onClick={() => setSelectedAnswers({
                  ...selectedAnswers,
                  [question.id]: option
                })}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`preview-answer-${question.id}`}
                    className="h-4 w-4 text-teal-600 border-slate-300"
                    checked={selectedAnswers[question.id] === option}
                    onChange={() => {}}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'check_all_that_apply':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedAnswers[question.id]?.includes(option)
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:border-teal-500'
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
                <div className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 border-slate-300 rounded pointer-events-none"
                    checked={selectedAnswers[question.id]?.includes(option)}
                    onChange={() => {}} // Empty handler to prevent React warning
                    tabIndex={-1}
                  />
                  <span className="ml-2">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex space-x-4">
            <div
              className={`flex-1 p-3 border rounded-md cursor-pointer transition-colors ${
                selectedAnswers[question.id] === 'true'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 hover:border-teal-500'
              }`}
              onClick={() => setSelectedAnswers({
                ...selectedAnswers,
                [question.id]: 'true'
              })}
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`preview-answer-${question.id}`}
                  className="h-4 w-4 text-teal-600 border-slate-300"
                  checked={selectedAnswers[question.id] === 'true'}
                  onChange={() => {}}
                />
                <span className="ml-2">True</span>
              </label>
            </div>
            <div
              className={`flex-1 p-3 border rounded-md cursor-pointer transition-colors ${
                selectedAnswers[question.id] === 'false'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 hover:border-teal-500'
              }`}
              onClick={() => setSelectedAnswers({
                ...selectedAnswers,
                [question.id]: 'false'
              })}
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`preview-answer-${question.id}`}
                  className="h-4 w-4 text-teal-600 border-slate-300"
                  checked={selectedAnswers[question.id] === 'false'}
                  onChange={() => {}}
                />
                <span className="ml-2">False</span>
              </label>
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-slate-600 mb-4">{quiz.description}</p>
        )}
        <div className="flex gap-4 text-sm text-slate-500">
          <div>Time Limit: {formatTime(quiz.time_limit)}</div>
          <div>Passing Score: {quiz.passing_score}%</div>
          {quiz.is_practice && (
            <div className="text-teal-600 font-medium">Practice Quiz</div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-slate-600">Loading questions...</p>
        </div>
      ) : questionData && questionData.length > 0 ? (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-slate-500">
                Question {currentQuestionIndex + 1} of {questionData.length}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm border border-slate-200 rounded hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 text-sm border border-slate-200 rounded hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={currentQuestionIndex === questionData.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="h-1 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questionData.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-lg font-medium mb-6">
              {questionData[currentQuestionIndex].question_text}
            </p>
            {renderQuestion(questionData[currentQuestionIndex])}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">No questions added to this quiz yet.</p>
        </div>
      )}
    </div>
  );
};

export default QuizPreview;
