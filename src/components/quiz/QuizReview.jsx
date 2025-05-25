import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { BiSolidError, BiCheck, BiX } from 'react-icons/bi';

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

      <div className="p-6 bg-slate-100 rounded-lg space-y-4">
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
          <div className="p-4 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-amber-900">
              <span className="font-bold">Warning:</span> You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
            </p>
          </div>
        )}

        <div className="p-4 bg-slate-200 border border-slate-300 rounded-lg">
          <p className="text-slate-700">
            Once you submit, you will not be able to change your answers. Make sure you have reviewed all questions before proceeding.
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Question Summary</h4>
        <div className="space-y-3">
          {quiz.questions.map((question, index) => {
            const answer = selectedAnswers[question.id];
            let isAnswered, statusClasses;

            if (quiz.is_practice) {
              isAnswered = answer?.answer !== undefined;
              if (isAnswered) {
                statusClasses = answer.isCorrect
                  ? "bg-green-100 border-green-300 hover:bg-green-200"
                  : "bg-red-100 border-red-300 hover:bg-red-200";
              } else {
                statusClasses = "bg-amber-100 border-amber-300 hover:bg-amber-200";
              }
            } else {
              isAnswered = answer !== undefined;
              statusClasses = isAnswered
                ? "bg-slate-100 border-slate-300 hover:bg-slate-200"
                : "bg-amber-100 border-amber-300 hover:bg-amber-200";
            }

            const renderOptions = () => {
              if (!isAnswered) {
                return (
                  <div className="flex items-center text-amber-600 mt-1">
                    <BiSolidError className="w-5 h-5" />
                    <span className="ml-2 font-medium">Not answered</span>
                  </div>
                );
              }

              switch (question.question_type) {
                case 'multiple_choice':
                  return (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, idx) => {
                        const isSelected = quiz.is_practice ? answer?.answer === idx : answer === idx;
                        const isCorrect = quiz.is_practice && isSelected && answer?.isCorrect;
                        const isIncorrect = quiz.is_practice && isSelected && !answer?.isCorrect;

                        return (
                          <div
                            key={idx}
                            className={classNames(
                              "flex items-center p-3 rounded border",
                              {
                                'bg-primary/10 border-primary': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect,
                                'bg-red-50 border-red-500': isIncorrect,
                                'border-slate-300': !isSelected && !quiz.is_practice
                              }
                            )}
                          >
                            <div className="flex-1">{option}</div>
                            {isSelected && (
                              <div className="ml-2">
                                {quiz.is_practice ? (
                                  isCorrect ? (
                                    <BiCheck className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <BiX className="w-5 h-5 text-red-600" />
                                  )
                                ) : (
                                  <BiCheck className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );

                case 'check_all_that_apply':
                  return (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, idx) => {
                        const isSelected = quiz.is_practice
                          ? Array.isArray(answer?.answer) && answer.answer.includes(idx)
                          : Array.isArray(answer) && answer.includes(idx);
                        const isCorrect = quiz.is_practice && isSelected && answer?.isCorrect;
                        const isIncorrect = quiz.is_practice && isSelected && !answer?.isCorrect;

                        return (
                          <div
                            key={idx}
                            className={classNames(
                              "flex items-center p-3 rounded border",
                              {
                                'bg-teal-50 border-teal-600': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect,
                                'bg-red-50 border-red-500': isIncorrect,
                                'border-slate-300': !isSelected && !quiz.is_practice
                              }
                            )}
                          >
                            <div className="flex-1">{option}</div>
                            {isSelected && (
                              <div className="ml-2">
                                {quiz.is_practice ? (
                                  isCorrect ? (
                                    <BiCheck className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <BiX className="w-5 h-5 text-red-600" />
                                  )
                                ) : (
                                  <BiCheck className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );

                case 'true_false':
                  return (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {['True', 'False'].map((option, idx) => {
                        const isSelected = quiz.is_practice ? answer?.answer === (idx === 0) : answer === (idx === 0);
                        const isCorrect = quiz.is_practice && isSelected && answer?.isCorrect;
                        const isIncorrect = quiz.is_practice && isSelected && !answer?.isCorrect;

                        return (
                          <div
                            key={idx}
                            className={classNames(
                              "flex items-center justify-between p-3 rounded border",
                              {
                                'bg-primary/10 border-primary': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect,
                                'bg-red-50 border-red-500': isIncorrect,
                                'border-slate-300': !isSelected && !quiz.is_practice
                              }
                            )}
                          >
                            <div>{option}</div>
                            {isSelected && (
                              <div className="ml-2">
                                {quiz.is_practice ? (
                                  isCorrect ? (
                                    <BiCheck className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <BiX className="w-5 h-5 text-red-600" />
                                  )
                                ) : (
                                  <BiCheck className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );

                default:
                  return null;
              }
            };

            return (
              <button
                key={question.id}
                onClick={() => onBack(index)}
              className={classNames(
                "w-full text-left p-6 border rounded-lg transition-colors",
                statusClasses
              )}
              >
              <div className="flex gap-6">
                <div className="font-bold text-slate-700 text-lg">
                  Q{index + 1}
                </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-4">
                      {question.question_text}
                    </div>
                    {renderOptions()}
                  </div>
                </div>
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
            "px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors",
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
      question_text: PropTypes.string.isRequired,
      question_type: PropTypes.oneOf(['multiple_choice', 'check_all_that_apply', 'true_false']).isRequired,
      options: PropTypes.arrayOf(PropTypes.string)
    })).isRequired,
    is_practice: PropTypes.bool
  }).isRequired,
  selectedAnswers: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  timeLeft: PropTypes.number
};

export default QuizReview;
