import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QuizReview = ({ 
  quiz, 
  selectedAnswers, 
  onSubmit, 
  onBack, 
  timeLeft 
}) => {
  // Count answered and unanswered questions
  const countAnswers = () => {
    if (quiz.is_practice) {
      const answeredCount = Object.values(selectedAnswers)
        .filter(answer => answer?.answer !== undefined).length;
      return {
        answered: answeredCount,
        unanswered: quiz.questions.length - answeredCount
      };
    } else {
      const answeredCount = Object.keys(selectedAnswers).length;
      return {
        answered: answeredCount,
        unanswered: quiz.questions.length - answeredCount
      };
    }
  };

  const { answered: answeredCount, unanswered: unansweredCount } = countAnswers();

  // Format time remaining
  const formatTimeLeft = () => {
    if (!timeLeft) return null;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Review Your Answers</h3>
      
      <div className="p-6 bg-slate-50 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-sm text-slate-500">Questions Answered</p>
            <p className="text-2xl font-bold text-slate-900">{answeredCount} / {quiz.questions.length}</p>
          </div>

          {timeLeft !== null && (
            <div>
              <p className="text-sm text-slate-500">Time Remaining</p>
              <p className="text-2xl font-bold text-slate-900">{formatTimeLeft()}</p>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <span className="font-bold">Warning:</span> You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
            </p>
          </div>
        )}

        <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg">
          <p className="text-slate-600">
            Once you submit, you will not be able to change your answers. Make sure you have reviewed all questions before proceeding.
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Question Summary</h4>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {quiz.questions.map((question, index) => {
            const answer = selectedAnswers[question.id];
            let isAnswered, statusClasses;
            
            if (quiz.is_practice) {
              isAnswered = answer?.answer !== undefined;
              if (isAnswered) {
                statusClasses = answer.isCorrect
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200";
              } else {
                statusClasses = "bg-amber-100 text-amber-800 hover:bg-amber-200";
              }
            } else {
              isAnswered = answer !== undefined;
              statusClasses = isAnswered
                ? "bg-teal-100 text-teal-800 hover:bg-teal-200"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200";
            }
            
            return (
              <button
                key={question.id}
                onClick={() => onBack(index)}
                className={classNames(
                  "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  statusClasses
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onBack()}
          className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
        >
          Back to Quiz
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={classNames(
            "px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors",
            {
              'opacity-90 hover:opacity-100': unansweredCount > 0
            }
          )}
        >
          Submit Quiz
        </button>
      </div>

      {unansweredCount > 0 && (
        <p className="text-sm text-center text-slate-500">
          You can submit with unanswered questions, but they will be marked as incorrect.
        </p>
      )}
    </div>
  );
};

QuizReview.propTypes = {
  quiz: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    questions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      question_text: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  selectedAnswers: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  timeLeft: PropTypes.number
};

export default QuizReview;
