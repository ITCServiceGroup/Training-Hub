import { useEffect, memo, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { pdfService } from '../../services/pdfService';
import { getQuizStateColors } from '../../utils/colorUtils';

const QuizResults = ({
  quiz,
  selectedAnswers,
  score,
  timeTaken,
  onRetry = () => {},
  onExit,
  isPractice = false,
  accessCodeData = null
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Early return if score is null/undefined
  if (!score || typeof score.percentage !== 'number') {
    return (
      <div className={`text-center p-8 ${isDark ? 'text-gray-300' : ''}`}>
        <div>Calculating results...</div>
      </div>
    );
  }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get quiz state colors for theming
  const stateColors = getQuizStateColors(isDark);

  // Generate and download PDF using React-PDF
  const handleDownloadPdf = useCallback(async () => {
    if (!accessCodeData) {
      console.warn('No access code data available for PDF generation');
      return;
    }

    console.log('Starting professional PDF download with React-PDF...');

    try {
      await pdfService.downloadQuizReportPDF({
        quiz,
        selectedAnswers,
        score,
        timeTaken,
        ldap: accessCodeData.ldap,
        isPractice,
        accessCodeData
      });

      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [accessCodeData, quiz, selectedAnswers, score, timeTaken, isPractice]);




  // Get result message based on score (memoized)
  const resultMessage = useMemo(() => {
    const passingScore = quiz.passing_score || 70;

    if (score.percentage >= passingScore) {
      if (score.percentage >= 90) return 'Excellent work!';
      if (score.percentage >= 80) return 'Great job!';
      return 'Good job!';
    }

    return 'Keep practicing!';
  }, [score.percentage, quiz.passing_score]);

  // Format time taken (memoized)
  const formattedTime = useMemo(() => {
    if (!timeTaken || timeTaken <= 0) return 'Not recorded';
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    return `${minutes}m ${seconds}s`;
  }, [timeTaken]);

  // Check if answer was correct (memoized)
  const isAnswerCorrect = useCallback((question, answerData) => {
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
  }, [isPractice]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className={classNames(
            "inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold",
            score.percentage >= (quiz.passing_score || 70)
              ? isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
              : isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
          )}>
            {score.percentage}%
          </div>
        </div>

        <h2 className={classNames(
          "text-2xl font-bold mb-2",
          score.percentage >= (quiz.passing_score || 70)
            ? isDark ? "text-green-400" : "text-green-700"
            : isDark ? "text-amber-400" : "text-amber-700"
        )}>
          {resultMessage}
        </h2>

        <div className={`flex justify-center gap-8 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
          <div>
            <p className="text-sm">Score</p>
            <p className="font-bold">{score.correct} / {score.total}</p>
          </div>
          <div>
            <p className="text-sm">Time Taken</p>
            <p className="font-bold">{formattedTime}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-12">
        <button
          className={`px-6 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-lg font-medium transition-colors`}
          // onClick={onExit} // Original prop might be admin-specific
          onClick={() => window.location.hash = '/quiz'} // Navigate to public quiz list
        >
          Back to Quizzes
        </button>

        {!isPractice && accessCodeData && (
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </button>
        )}

        {isPractice && (
          <button
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>

      <div className="space-y-8">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white border-slate-700' : 'text-slate-900 border-slate-200'} border-b pb-2`}>
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
                  ? isDark ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200"
                  : isDark ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-200"
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
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Question {index + 1}: {question.question_text}
                  </p>
                  <p className={classNames(
                    "text-sm mt-1",
                    isCorrect
                      ? isDark ? "text-green-400" : "text-green-700"
                      : isDark ? "text-red-400" : "text-red-700"
                  )}>
                    {answer === undefined ? "Incorrect (Unanswered)" : (isCorrect ? "Correct" : "Incorrect")}
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
                              'bg-green-100 border border-green-500': isCorrectOption && !isDark, // Highlight correct option (light)
                            'bg-green-900/30 border border-green-700': isCorrectOption && isDark, // Highlight correct option (dark)
                            'bg-red-100 border border-red-500': isSelected && !isCorrectOption && !isDark, // Highlight selected wrong option (light)
                            'bg-red-900/30 border border-red-700': isSelected && !isCorrectOption && isDark, // Highlight selected wrong option (dark)
                            'bg-white border border-slate-200': !isCorrectOption && !isSelected && !isDark, // Default (light)
                            'bg-slate-800 border border-slate-700': !isCorrectOption && !isSelected && isDark // Default (dark)
                          }
                        )}
                      >
                        <span className={isDark && !isCorrectOption && !isSelected ? 'text-white' : ''}>{option}</span>
                        {/* Show check only for the correct option */}
                        {isCorrectOption && <span className="ml-2 text-green-600">✓</span>}
                        {/* Show cross only if this specific option was selected and it's wrong */}
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
                            'bg-green-100 border border-green-500': isCorrectOption && !isDark, // Highlight correct options (light)
                            'bg-green-900/30 border border-green-700': isCorrectOption && isDark, // Highlight correct options (dark)
                            'bg-red-100 border border-red-500': isSelected && !isCorrectOption && !isDark, // Highlight selected wrong options (light)
                            'bg-red-900/30 border border-red-700': isSelected && !isCorrectOption && isDark, // Highlight selected wrong options (dark)
                            'bg-white border border-slate-200': !isCorrectOption && !isSelected && !isDark, // Default (light)
                            'bg-slate-800 border border-slate-700': !isCorrectOption && !isSelected && isDark // Default (dark)
                          }
                        )}
                      >
                        <span className={isDark && !isCorrectOption && !isSelected ? 'text-white' : ''}>{option}</span>
                        {/* Show check only for the correct options */}
                        {isCorrectOption && <span className="ml-2 text-green-600">✓</span>}
                        {/* Show cross only if this specific option was selected and it's wrong */}
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
                            'bg-green-100 border border-green-500': question.correct_answer === true && !isDark, // Highlight correct True (light)
                            'bg-green-900/30 border border-green-700': question.correct_answer === true && isDark, // Highlight correct True (dark)
                            'bg-red-100 border border-red-500': answer === true && question.correct_answer === false && !isDark, // Selected True, but was False (light)
                            'bg-red-900/30 border border-red-700': answer === true && question.correct_answer === false && isDark, // Selected True, but was False (dark)
                            'bg-white border border-slate-200': question.correct_answer === false && answer !== true && !isDark, // Default (light)
                            'bg-slate-800 border border-slate-700': question.correct_answer === false && answer !== true && isDark // Default (dark)
                          }
                        )}
                      >
                        <span className={isDark && question.correct_answer === false && answer !== true ? 'text-white' : ''}>True</span>
                        {question.correct_answer === true && <span className="ml-2 text-green-600">✓</span>}
                        {answer === true && question.correct_answer === false && <span className="ml-2 text-red-600">✗</span>}
                    </div>
                    <div
                        className={classNames(
                          "p-3 text-center rounded",
                          {
                            'bg-green-100 border border-green-500': question.correct_answer === false && !isDark, // Highlight correct False (light)
                            'bg-green-900/30 border border-green-700': question.correct_answer === false && isDark, // Highlight correct False (dark)
                            'bg-red-100 border border-red-500': answer === false && question.correct_answer === true && !isDark, // Selected False, but was True (light)
                            'bg-red-900/30 border border-red-700': answer === false && question.correct_answer === true && isDark, // Selected False, but was True (dark)
                            'bg-white border border-slate-200': question.correct_answer === true && answer !== false && !isDark, // Default (light)
                            'bg-slate-800 border border-slate-700': question.correct_answer === true && answer !== false && isDark // Default (dark)
                          }
                        )}
                      >
                        <span className={isDark && question.correct_answer === true && answer !== false ? 'text-white' : ''}>False</span>
                        {question.correct_answer === false && <span className="ml-2 text-green-600">✓</span>}
                        {answer === false && question.correct_answer === true && <span className="ml-2 text-red-600">✗</span>}
                    </div>
                  </div>
                )}

                {!isCorrect && question.explanation && (
                  <div className={`mt-4 p-3 rounded border ${isDark ? 'bg-slate-800 border-red-800' : 'bg-white border-red-200'}`}>
                    <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-800'}`}>Explanation:</p>
                    <p className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>{question.explanation}</p>
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
  isPractice: PropTypes.bool,
  accessCodeData: PropTypes.shape({
    ldap: PropTypes.string,
    code: PropTypes.string,
    supervisor: PropTypes.string,
    market: PropTypes.string
  })
};

// Removed defaultProps, defaults are now in the function signature

export default memo(QuizResults);
