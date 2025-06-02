import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import html2pdf from 'html2pdf.js';
import { buildPdfContentHtml } from '../../utils/pdfGenerator';

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

  // Generate and download PDF manually
  const handleDownloadPdf = () => {
    if (!accessCodeData) {
      console.warn('No access code data available for PDF generation');
      return;
    }

    console.log('Generating PDF with data:', {
      quiz: quiz.title,
      questionsCount: quiz.questions.length,
      selectedAnswers: Object.keys(selectedAnswers).length,
      score: score,
      ldap: accessCodeData.ldap
    });

    const pdfContent = buildPdfContentHtml(quiz, selectedAnswers, score, timeTaken, accessCodeData.ldap, isPractice);

    console.log('Generated PDF content length:', pdfContent.length);
    console.log('PDF content preview:', pdfContent.substring(0, 500));

    const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
    const filename = `${accessCodeData.ldap}-quiz-results-${timestamp}.pdf`;

    // Try direct HTML to PDF conversion without DOM manipulation
    console.log('Attempting direct HTML to PDF conversion...');

    html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 1,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
        allowTaint: false,
        removeContainer: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(pdfContent).save().then(() => {
      console.log('PDF generated successfully via direct conversion');
    }).catch((error) => {
      console.error('Direct PDF generation failed:', error);
      console.error('Error details:', error.message, error.stack);

      // Fallback: try with DOM element approach
      console.log('Trying DOM element approach...');
      tryDomElementPdf(pdfContent, filename, accessCodeData.ldap);
    });
  };

  // Try DOM element approach as fallback
  const tryDomElementPdf = (pdfContent, filename, ldap) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pdfContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.background = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.width = '800px'; // Fixed width instead of mm
    tempDiv.style.padding = '20px';
    tempDiv.style.boxSizing = 'border-box';
    document.body.appendChild(tempDiv);

    // Wait for DOM to be ready
    setTimeout(() => {
      console.log('DOM element dimensions:', {
        scrollWidth: tempDiv.scrollWidth,
        scrollHeight: tempDiv.scrollHeight,
        offsetWidth: tempDiv.offsetWidth,
        offsetHeight: tempDiv.offsetHeight
      });

      html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          width: tempDiv.scrollWidth,
          height: tempDiv.scrollHeight,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(tempDiv).save().then(() => {
        console.log('PDF generated successfully via DOM element');
        document.body.removeChild(tempDiv);
      }).catch((error) => {
        console.error('DOM element PDF generation failed:', error);
        document.body.removeChild(tempDiv);

        // Final fallback: simple PDF
        console.log('Trying final simple PDF fallback...');
        generateSimplePdf(quiz, selectedAnswers, score, timeTaken, ldap);
      });
    }, 100); // Small delay to ensure DOM is ready
  };

  // Fallback simple PDF generation
  const generateSimplePdf = (quiz, selectedAnswers, score, timeTaken, ldap) => {
    console.log('Generating simple PDF...');

    const simpleContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white; color: black; width: 100%; max-width: 800px;">
        <h1 style="color: black; margin-bottom: 20px;">Quiz Results: ${quiz.title}</h1>
        <h2 style="color: black; margin-bottom: 15px;">Score: ${score.correct}/${score.total} (${score.percentage}%)</h2>
        <p style="color: black; margin: 10px 0;"><strong>LDAP:</strong> ${ldap}</p>
        <p style="color: black; margin: 10px 0;"><strong>Time Taken:</strong> ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds</p>
        <p style="color: black; margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr style="margin: 20px 0; border: 1px solid #ccc;">
        <h3 style="color: black; margin-bottom: 15px;">Questions:</h3>
        ${quiz.questions.map((q, i) => `
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd;">
            <p style="color: black; margin: 0; font-weight: bold;">Q${i + 1}: ${q.question_text}</p>
          </div>
        `).join('')}
      </div>
    `;

    console.log('Simple content length:', simpleContent.length);

    // Try direct conversion first
    const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
    const filename = `${ldap}-quiz-results-simple-${timestamp}.pdf`;

    html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: filename,
      image: { type: 'jpeg', quality: 0.9 },
      html2canvas: {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(simpleContent).save().then(() => {
      console.log('Simple PDF generated successfully via direct conversion');
    }).catch((error) => {
      console.error('Simple PDF direct conversion failed:', error);

      // Try with DOM element as last resort
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = simpleContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.background = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      setTimeout(() => {
        html2pdf().from(tempDiv).save().then(() => {
          console.log('Simple PDF generated via DOM element');
          document.body.removeChild(tempDiv);
        }).catch((finalError) => {
          console.error('All PDF generation methods failed:', finalError);
          document.body.removeChild(tempDiv);
          alert('PDF generation failed. Please try again or contact support.');
        });
      }, 100);
    });
  };


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
          {getResultMessage()}
        </h2>

        <div className={`flex justify-center gap-8 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
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

export default QuizResults;
