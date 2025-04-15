import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QuizResults = ({ 
  quiz, 
  selectedAnswers, 
  score, 
  timeTaken, 
  onRetry = () => {}, 
  onExit, 
  isPractice = false 
}) => {
  // Get result message based on score
  const getResultMessage = () => {
    const passingScore = quiz.passing_score || 70;
    
    if (score.percentage >= passingScore) {
      if (score.percentage >= 90) return 'Excellent work!';
      if (score.percentage >= 80) return 'Great job!';
      return 'Good job!';
    }
    
    return 'Keep practicing!';
  };

  // Format time taken
  const formatTimeTaken = () => {
    if (!timeTaken) return 'N/A';
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Check if answer was correct
  const isAnswerCorrect = (question, answerData) => {
    if (answerData === undefined) return false;
    
    const answer = isPractice ? answerData.answer : answerData;
    if (answer === undefined) return false;

    switch (question.question_type) {
      case 'multiple_choice':
        return answer === question.correct_answer;
      case 'check_all_that_apply':
        return Array.isArray(answer) &&
          Array.isArray(question.correct_answer) &&
          answer.length === question.correct_answer.length &&
          answer.every(a => question.correct_answer.includes(a));
      case 'true_false':
        return answer === question.correct_answer;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className={classNames(
            "inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold",
            score.percentage >= (quiz.passing_score || 70)
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          )}>
            {score.percentage}%
          </div>
        </div>

        <h2 className={classNames(
          "text-2xl font-bold mb-2",
          score.percentage >= (quiz.passing_score || 70)
            ? "text-green-700"
            : "text-amber-700"
        )}>
          {getResultMessage()}
        </h2>

        <div className="flex justify-center gap-8 text-slate-600">
          <div>
            <p className="text-sm">Score</p>
            <p className="font-bold">{score.correct} / {score.total}</p>
          </div>
          <div>
            <p className="text-sm">Time Taken</p>
            <p className="font-bold">{formatTimeTaken()}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-12">
        <button
          className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          onClick={onExit}
        >
          Back to Quizzes
        </button>
        
        {isPractice && (
          <button
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-bold text-slate-900 border-b pb-2">
          Question Review
        </h3>

        {quiz.questions.map((question, index) => {
          const answerData = selectedAnswers[question.id];
          const isCorrect = isAnswerCorrect(question, answerData);
          const answer = isPractice ? answerData?.answer : answerData;

          return (
            <div 
              key={question.id}
              className={classNames(
                "p-6 rounded-lg border",
                isCorrect 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className={classNames(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm",
                  isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
                )}>
                  {isCorrect ? "✓" : "✗"}
                </span>
                <div>
                  <p className="font-medium text-slate-900">
                    Question {index + 1}: {question.question_text}
                  </p>
                  <p className={classNames(
                    "text-sm mt-1",
                    isCorrect ? "text-green-700" : "text-red-700"
                  )}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
              </div>

              {/* Show answer details */}
              <div className="ml-9 space-y-3">
                {question.question_type === 'multiple_choice' && (
                  question.options.map((option, optionIndex) => {
                    const isSelected = answer === optionIndex;
                    const isCorrectOption = question.correct_answer === optionIndex;

                    return (
                      <div
                        key={optionIndex}
                        className={classNames(
                          "p-3 rounded",
                          {
                            'bg-green-100 border border-green-500': isCorrectOption,
                            'bg-red-100 border border-red-500': isSelected && !isCorrectOption,
                            'bg-white border border-slate-200': !isSelected && !isCorrectOption
                          }
                        )}
                      >
                        {option}
                        {isCorrectOption && <span className="ml-2 text-green-600">✓</span>}
                        {isSelected && !isCorrectOption && <span className="ml-2 text-red-600">✗</span>}
                      </div>
                    );
                  })
                )}

                {question.question_type === 'check_all_that_apply' && (
                  question.options.map((option, optionIndex) => {
                    const isSelected = Array.isArray(answer) && answer.includes(optionIndex);
                    const isCorrectOption = question.correct_answer.includes(optionIndex);

                    return (
                      <div
                        key={optionIndex}
                        className={classNames(
                          "p-3 rounded",
                          {
                            'bg-green-100 border border-green-500': isCorrectOption,
                            'bg-red-100 border border-red-500': isSelected && !isCorrectOption,
                            'bg-white border border-slate-200': !isSelected && !isCorrectOption
                          }
                        )}
                      >
                        {option}
                        {isCorrectOption && <span className="ml-2 text-green-600">✓</span>}
                        {isSelected && !isCorrectOption && <span className="ml-2 text-red-600">✗</span>}
                      </div>
                    );
                  })
                )}

                {question.question_type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={classNames(
                        "p-3 text-center rounded",
                        {
                          'bg-green-100 border border-green-500': question.correct_answer === true,
                          'bg-red-100 border border-red-500': answer === true && !question.correct_answer,
                          'bg-white border border-slate-200': answer !== true && !question.correct_answer
                        }
                      )}
                    >
                      True
                      {question.correct_answer === true && <span className="ml-2 text-green-600">✓</span>}
                      {answer === true && !question.correct_answer && <span className="ml-2 text-red-600">✗</span>}
                    </div>
                    <div
                      className={classNames(
                        "p-3 text-center rounded",
                        {
                          'bg-green-100 border border-green-500': question.correct_answer === false,
                          'bg-red-100 border border-red-500': answer === false && question.correct_answer,
                          'bg-white border border-slate-200': answer !== false && question.correct_answer
                        }
                      )}
                    >
                      False
                      {question.correct_answer === false && <span className="ml-2 text-green-600">✓</span>}
                      {answer === false && question.correct_answer && <span className="ml-2 text-red-600">✗</span>}
                    </div>
                  </div>
                )}

                {!isCorrect && question.explanation && (
                  <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                    <p className="font-medium text-red-800">Explanation:</p>
                    <p className="mt-1 text-red-700">{question.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

QuizResults.propTypes = {
  quiz: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    passing_score: PropTypes.number,
    questions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      question_text: PropTypes.string.isRequired,
      question_type: PropTypes.oneOf(['multiple_choice', 'check_all_that_apply', 'true_false']).isRequired,
      options: PropTypes.arrayOf(PropTypes.string),
      correct_answer: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.bool
      ]).isRequired,
      explanation: PropTypes.string
    })).isRequired
  }).isRequired,
  selectedAnswers: PropTypes.object.isRequired,
  score: PropTypes.shape({
    correct: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  }).isRequired,
  timeTaken: PropTypes.number,
  onRetry: PropTypes.func, // Made optional
  onExit: PropTypes.func.isRequired,
  isPractice: PropTypes.bool
};

// Removed defaultProps, defaults are now in the function signature

export default QuizResults;
