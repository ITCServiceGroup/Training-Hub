import { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { BiSolidError, BiCheck, BiX } from 'react-icons/bi';
import { useTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';


const QuizReview = ({
  quiz,
  selectedAnswers,
  onSubmit,
  onBack,
  timeLeft,
  isSubmitting = false
}) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  // Count answered and unanswered questions (memoized)
  const { answeredCount, unansweredCount } = useMemo(() => {
    if (quiz.is_practice) {
      const answered = Object.values(selectedAnswers)
        .filter(answer => answer?.answer !== undefined).length;
      return {
        answeredCount: answered,
        unansweredCount: quiz.questions.length - answered
      };
    } else {
      const answered = Object.keys(selectedAnswers).length;
      return {
        answeredCount: answered,
        unansweredCount: quiz.questions.length - answered
      };
    }
  }, [quiz.is_practice, quiz.questions.length, selectedAnswers]);

  // Format time remaining (memoized)
  const formattedTimeLeft = useMemo(() => {
    if (!timeLeft) return null;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Your Answers</h3>

      <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg space-y-4`}>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Questions Answered</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{answeredCount} / {quiz.questions.length}</p>
          </div>

          {timeLeft !== null && (
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time Remaining</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formattedTimeLeft}</p>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className={`p-4 ${isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-100 border-amber-300'} border rounded-lg`}>
            <p className={isDark ? 'text-amber-400' : 'text-amber-900'}>
              <span className="font-bold">Warning:</span> You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
            </p>
          </div>
        )}

        <div className={`p-4 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'} border rounded-lg`}>
          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            Once you submit, you will not be able to change your answers. Make sure you have reviewed all questions before proceeding.
          </p>
        </div>
      </div>

      <div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Question Summary</h4>
        <div className="space-y-3">
          {quiz.questions.map((question, index) => {
            const answer = selectedAnswers[question.id];
            let isAnswered, statusClasses;

            if (quiz.is_practice) {
              isAnswered = answer?.answer !== undefined;
              if (isAnswered) {
                statusClasses = answer.isCorrect
                  ? isDark ? "bg-green-900/30 border-green-700 hover:bg-green-900/40" : "bg-green-100 border-green-300 hover:bg-green-200"
                  : isDark ? "bg-red-900/30 border-red-700 hover:bg-red-900/40" : "bg-red-100 border-red-300 hover:bg-red-200";
              } else {
                statusClasses = isDark ? "bg-amber-900/30 border-amber-700 hover:bg-amber-900/40" : "bg-amber-100 border-amber-300 hover:bg-amber-200";
              }
            } else {
              isAnswered = answer !== undefined;
              statusClasses = isAnswered
                ? isDark ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "bg-slate-100 border-slate-300 hover:bg-slate-200"
                : isDark ? "bg-amber-900/30 border-amber-700 hover:bg-amber-900/40" : "bg-amber-100 border-amber-300 hover:bg-amber-200";
            }

            const renderOptions = () => {
              if (!isAnswered) {
                return (
                  <div className={`flex items-center ${isDark ? 'text-amber-400' : 'text-amber-600'} mt-1`}>
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
                                'border-primary': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect && !isDark,
                                'bg-green-900/30 border-green-700': isCorrect && isDark,
                                'bg-red-50 border-red-500': isIncorrect && !isDark,
                                'bg-red-900/30 border-red-700': isIncorrect && isDark,
                                'border-slate-300': !isSelected && !quiz.is_practice && !isDark,
                                'border-slate-400': !isSelected && !quiz.is_practice && isDark
                              }
                            )}
                            style={{
                              backgroundColor: isSelected && !quiz.is_practice
                                ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15)
                                : undefined
                            }}
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
                                'border-primary': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect && !isDark,
                                'bg-green-900/30 border-green-700': isCorrect && isDark,
                                'bg-red-50 border-red-500': isIncorrect && !isDark,
                                'bg-red-900/30 border-red-700': isIncorrect && isDark,
                                'border-slate-300': !isSelected && !quiz.is_practice && !isDark,
                                'border-slate-400': !isSelected && !quiz.is_practice && isDark
                              }
                            )}
                            style={{
                              backgroundColor: isSelected && !quiz.is_practice
                                ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15)
                                : undefined
                            }}
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
                                'border-primary': isSelected && !quiz.is_practice,
                                'bg-green-50 border-green-500': isCorrect && !isDark,
                                'bg-green-900/30 border-green-700': isCorrect && isDark,
                                'bg-red-50 border-red-500': isIncorrect && !isDark,
                                'bg-red-900/30 border-red-700': isIncorrect && isDark,
                                'border-slate-300': !isSelected && !quiz.is_practice && !isDark,
                                'border-slate-400': !isSelected && !quiz.is_practice && isDark
                              }
                            )}
                            style={{
                              backgroundColor: isSelected && !quiz.is_practice
                                ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15)
                                : undefined
                            }}
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
                <div className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} text-lg`}>
                  Q{index + 1}
                </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
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

      <div className={`flex justify-between items-center pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => onBack()}
          className={`px-6 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-lg font-medium transition-colors`}
        >
          Back to Quiz
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={classNames(
            "px-6 py-2 text-white rounded-lg font-medium transition-colors",
            {
              'opacity-90 hover:opacity-100': unansweredCount > 0,
              'opacity-50 cursor-not-allowed': isSubmitting
            }
          )}
          style={{
            backgroundColor: currentPrimaryColor,
            borderColor: currentPrimaryColor
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = hexToRgba(currentPrimaryColor, 0.9);
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = currentPrimaryColor;
            }
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>

      {unansweredCount > 0 && (
        <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
  timeLeft: PropTypes.number,
  isSubmitting: PropTypes.bool
};

export default memo(QuizReview);
