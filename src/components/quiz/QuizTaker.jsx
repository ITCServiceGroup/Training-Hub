import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import html2pdf from 'html2pdf.js';
import { supabase } from '../../config/supabase';
import { shuffleArray, shuffleQuestionOptions } from '../../utils/shuffleUtils';
import { quizzesService } from '../../services/api/quizzes';
import { quizResultsService } from '../../services/api/quizResults';
import { accessCodesService } from '../../services/api/accessCodes';
import QuizTimer from './QuizTimer';
import QuestionDisplay from './QuestionDisplay';
import QuizReview from './QuizReview';
import QuizResults from './QuizResults';

// Helper function to format question type (similar to old quiz.js)
const formatQuestionType = (type) => {
  switch (type) {
    case 'multiple_choice': return 'Multiple Choice';
    case 'true_false': return 'True/False';
    case 'check_all_that_apply': return 'Check All That Apply';
    default: return 'Unknown Type';
  }
};

// Helper function to check answer correctness (needed for PDF generation)
const isAnswerCorrect = (question, answerData, isPractice) => {
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


const QuizTaker = ({ quizId, accessCode, testTakerInfo }) => {
  // Refs
  const pdfContentRef = useRef(null);
  const timeoutPromiseRef = useRef(null);
  const submitInProgressRef = useRef(false);
  const timeoutTimeoutRef = useRef(null); // Moved ref to top level
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(null);
  const [accessCodeData, setAccessCodeData] = useState(null);
  const [isCurrentPracticeQuestionAnswered, setIsCurrentPracticeQuestionAnswered] = useState(false); // New state for practice mode

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let quizData;
        
        if (accessCode) {
          // Validate access code first
          const codeData = await accessCodesService.validateCode(accessCode);
          if (!codeData) {
            setError('Invalid access code');
            setIsLoading(false);
            return;
          }
          setAccessCodeData(codeData);
          
          // Use quiz ID from access code
          quizData = await quizzesService.getWithQuestions(codeData.quiz_id);
          // Force practice mode off when using access code
          quizData.is_practice = false;
          
          // Apply randomization if enabled
          if (quizData.randomize_questions) {
            quizData.questions = shuffleArray(quizData.questions);
          }
          if (quizData.randomize_answers) {
            quizData.questions = quizData.questions.map(q => shuffleQuestionOptions(q));
          }
          
          setQuiz(quizData);
        } else if (quizId) {
          // Load quiz directly if ID is provided
          quizData = await quizzesService.getWithQuestions(quizId);
          
          // Validate quiz access
          if (!quizData.is_practice && !quizData.has_practice_mode) {
            setError('This quiz requires an access code');
            setIsLoading(false);
            return;
          }
          
          // Force practice mode on for direct access
          quizData.is_practice = true;
          
          // Apply randomization if enabled
          if (quizData.randomize_questions) {
            quizData.questions = shuffleArray(quizData.questions);
          }
          if (quizData.randomize_answers) {
            quizData.questions = quizData.questions.map(q => shuffleQuestionOptions(q));
          }
          
          setQuiz(quizData);
        }
      } catch (error) {
        if (error.message) {
          setError(error.message);
        } else {
          setError('Failed to load quiz');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, accessCode]);

  // Submit quiz handler - defined before timer effect
  const handleSubmitQuiz = useCallback(async (isTimeout = false) => {
    // Prevent multiple submissions
    if (submitInProgressRef.current) return;
    submitInProgressRef.current = true;

    // Calculate score - defined inside handleSubmitQuiz again
    const calculateScore = () => {
      if (!quiz || !quiz.questions) {
         return { correct: 0, total: 0, percentage: 0 };
      }
      let correctCount = 0;
      const totalQuestions = quiz.questions.length;

      quiz.questions.forEach(question => {
        const answerData = selectedAnswers[question.id];
        if (answerData === undefined) return;

        // Get the actual answer value, considering practice mode format
        const answer = quiz.is_practice ? answerData.answer : answerData;
        if (answer === undefined) return; // Skip if practice answer object doesn't have 'answer'

        let isCorrect = false;
        switch (question.question_type) {
          case 'multiple_choice':
            isCorrect = answer === question.correct_answer;
            break;
          case 'check_all_that_apply':
            // Ensure answer is an array for comparison
            if (Array.isArray(answer) && Array.isArray(question.correct_answer)) {
              isCorrect =
                answer.length === question.correct_answer.length &&
                answer.every(a => question.correct_answer.includes(a));
            }
            break;
          case 'true_false':
            isCorrect = answer === question.correct_answer;
            break;
        }
        if (isCorrect) correctCount++;
      });

      return {
        correct: correctCount,
        total: totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
      };
    };

    try {
      const finalScore = calculateScore(); // Use the inner function
      setScore(finalScore);

      // For non-practice quizzes, generate PDF and save the result
      if (!quiz.is_practice && accessCodeData) {
        let pdfUrl = null;
        try {
          const pdfHtml = buildPdfContentHtml(quiz, selectedAnswers, finalScore, timeTaken, accessCodeData.ldap);
          pdfUrl = await generateAndUploadPdf(accessCodeData.ldap, pdfHtml, accessCodeData, quiz);

          if (!pdfUrl) {
            console.warn('PDF generation/upload failed. Saving result without PDF URL.');
          }

          // Save quiz result to DB
          await quizResultsService.create({
            ldap: accessCodeData.ldap,
            supervisor: accessCodeData.supervisor,
            market: accessCodeData.market,
            quiz_id: quiz.id,
            quiz_type: quiz.title,
            score_value: finalScore.percentage / 100,
            score_text: `${finalScore.correct}/${finalScore.total} (${finalScore.percentage}%)`,
            answers: selectedAnswers,
            time_taken: timeTaken,
            date_of_test: new Date().toISOString(),
            pdf_url: pdfUrl
          });

          // Mark access code as used
          await accessCodesService.markAsUsed(accessCode);
        } catch (error) {
          console.error('Failed to save quiz result or generate PDF:', error);
          if (isTimeout) {
            throw error; // Re-throw for timeout handling
          }
        }
      }

      // Set completion states
      setQuizCompleted(true);
      setIsReviewing(false);
    } catch (error) {
      console.error('Quiz submission failed:', error);
      if (isTimeout) {
        // Force completion on timeout
        setQuizCompleted(true);
        setIsReviewing(false);
      }
    } finally {
      submitInProgressRef.current = false;
    }
    // calculateScore is not needed in deps as it's defined inside
  }, [quiz, accessCodeData, accessCode, timeTaken, selectedAnswers]); // Removed stable state setters AND calculateScore

  // Timeout handler
  const handleTimeout = useCallback(async (clearTimer) => {
    if (timeoutPromiseRef.current) return; // Prevent multiple timeouts

    // Clear timer if provided
    if (clearTimer) clearTimer();
    setTimeLeft(0);

    try {
      timeoutPromiseRef.current = handleSubmitQuiz(true);
      await timeoutPromiseRef.current;
    } catch (error) {
      console.error('Failed to submit quiz on timeout:', error);
      // Force completion on timeout error
      setQuizCompleted(true);
      setIsReviewing(false);
    } finally {
      timeoutPromiseRef.current = null;
    }
  }, [handleSubmitQuiz]); // Removed stable state setters

  // Timer effect
  useEffect(() => {
    let timer;

    const startTimer = () => {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0 && !timeoutPromiseRef.current) {
            // Schedule timeout handling for next tick to avoid state update conflicts
            timeoutTimeoutRef.current = setTimeout(() => {
              handleTimeout(() => {
                if (timer) clearInterval(timer);
              });
            }, 0);
            return 0;
          }
          return newTime;
        });
        setTimeTaken(prev => prev + 1);
      }, 1000);
    };

    if (quizStarted && !quizCompleted && timeLeft !== null && !timeoutPromiseRef.current) {
      startTimer();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timeoutTimeoutRef.current) clearTimeout(timeoutTimeoutRef.current);
      
      // Cleanup pending submission promise *without* setting state here
      if (timeoutPromiseRef.current) {
        timeoutPromiseRef.current
          .catch(error => {
            // Log error, but don't set state in cleanup
            console.error('Error during cleanup of timeout submission:', error);
          })
          .finally(() => {
            // Ensure ref is cleared even if component unmounts during submission
            timeoutPromiseRef.current = null;
          });
      }
    };
  }, [quizStarted, quizCompleted, timeLeft, handleTimeout]); // handleTimeout is stable via useCallback


  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const handleStartQuiz = () => {
    // Load a fresh copy of questions and shuffle if needed
    let questions = [...quiz.questions];
    if (quiz.randomize_questions) {
      questions = shuffleArray(questions);
    }
    if (quiz.randomize_answers) {
      questions = questions.map(q => shuffleQuestionOptions(q));
    }
    setQuiz({ ...quiz, questions });
    
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setIsReviewing(false);
    if (quiz.time_limit) {
      setTimeLeft(quiz.time_limit);
    }
    setTimeTaken(0);
  };

  // Handle answer selection and provide immediate feedback in practice mode
  const handleSelectAnswer = (answer) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    // For practice mode, check answer immediately
    if (quiz.is_practice) {
      let isCorrect = false;
      switch (currentQuestion.question_type) {
        case 'multiple_choice':
          isCorrect = answer === currentQuestion.correct_answer;
          break;
        case 'check_all_that_apply':
          if (Array.isArray(answer) && Array.isArray(currentQuestion.correct_answer)) {
            isCorrect = 
              answer.length === currentQuestion.correct_answer.length &&
              answer.every(a => currentQuestion.correct_answer.includes(a));
          }
          break;
        case 'true_false':
          isCorrect = answer === currentQuestion.correct_answer;
          break;
      }

      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          answer,
          showFeedback: true,
          isCorrect,
        }
      }));
      setIsCurrentPracticeQuestionAnswered(true); // Mark as answered for practice mode
    } else {
      // For regular quizzes, just store the answer
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer
      }));
    }
  };

  // Navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsCurrentPracticeQuestionAnswered(false); // Reset for next question
    } else {
      // Last question behavior
      if (quiz.is_practice) {
        // Skip review step for practice mode, submit directly
        handleSubmitQuiz();
      } else {
        // Go to review screen for non-practice quizzes
        setIsReviewing(true);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsCurrentPracticeQuestionAnswered(false); // Reset when going back
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center p-8">Quiz not found</div>;
  }

  // Quiz completed screen
  if (quizCompleted) {
    return (
      <QuizResults
        quiz={quiz}
        selectedAnswers={selectedAnswers}
        score={score}
        timeTaken={timeTaken}
        onRetry={quiz.is_practice ? handleStartQuiz : undefined}
        onExit={() => window.location.hash = '/admin/quizzes'} // Navigate to quizzes page
        isPractice={quiz.is_practice}
      />
    );
  }

  // Review screen
  if (isReviewing) {
    return (
      <QuizReview
        quiz={quiz}
        selectedAnswers={selectedAnswers}
        onSubmit={handleSubmitQuiz}
        onBack={(questionIndex) => {
          setIsReviewing(false);
          if (typeof questionIndex === 'number') {
            setCurrentQuestionIndex(questionIndex);
          }
        }}
        timeLeft={timeLeft}
      />
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{quiz.title}</h2>
        {quiz.description && (
          <p className="text-slate-600 mb-6">{quiz.description}</p>
        )}
        
        <div className="flex gap-8 mb-8">
          <div>
            <p className="text-sm text-slate-500">Questions</p>
            <p className="font-bold">{quiz.questions.length}</p>
          </div>
          {quiz.time_limit && (
            <div>
              <p className="text-sm text-slate-500">Time Limit</p>
              <p className="font-bold">{Math.floor(quiz.time_limit / 60)} minutes</p>
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500">Passing Score</p>
            <p className="font-bold">{quiz.passing_score || 70}%</p>
          </div>
        </div>

        <button
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Quiz taking screen
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{quiz.title}</h2>
          <p className="text-slate-500">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>

        {timeLeft !== null && (
          <QuizTimer
            timeLeft={timeLeft}
            formatTime={formatTime}
            isWarning={timeLeft < 300} // Warning when less than 5 minutes left
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-8">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={quiz.is_practice ? selectedAnswers[currentQuestion.id]?.answer : selectedAnswers[currentQuestion.id]}
          onSelectAnswer={handleSelectAnswer}
          isPractice={quiz.is_practice}
          showFeedback={quiz.is_practice && selectedAnswers[currentQuestion.id]?.showFeedback}
          isCorrect={quiz.is_practice && selectedAnswers[currentQuestion.id]?.isCorrect}
        />

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>

          <button
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNextQuestion}
            disabled={quiz.is_practice && !isCurrentPracticeQuestionAnswered} // Disable if practice and not answered
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : (quiz.is_practice ? 'Finish Quiz' : 'Review Answers')}
          </button>
        </div>
      </div>
    </div>
  );
};

QuizTaker.propTypes = {
  quizId: PropTypes.string,
  accessCode: PropTypes.string,
  testTakerInfo: PropTypes.shape({
    ldap: PropTypes.string,
    email: PropTypes.string,
    supervisor: PropTypes.string,
    market: PropTypes.string
  })
};

// --- PDF Generation Functions (adapted from quiz.js) ---

// Builds the HTML string for the PDF content
const buildPdfContentHtml = (quiz, selectedAnswers, score, timeTaken, ldap) => {
  let summaryHTML = `
    <div style="background: white; padding: 20px; font-family: Arial, sans-serif; width: 210mm; min-height: 297mm; box-sizing: border-box;">
    <div style="margin-bottom: 20px; text-align: center;">
      <h1 style="margin-bottom: 10px;">Quiz Results: ${quiz.title}</h1>
      <h2 style="margin-bottom: 5px;">Score: ${score.correct}/${score.total} (${score.percentage}%)</h2>
      <h3 style="margin: 0;">LDAP: ${ldap}</h3>
      <p style="margin: 0;">Time Taken: ${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds</p>
      <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
      <div id="summary">
        <h2 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Detailed Summary:</h2>
        <ul style="list-style: none; padding: 0;">
  `;
  quiz.questions.forEach((question, index) => {
    const answerData = selectedAnswers[question.id];
    const correct = isAnswerCorrect(question, answerData, quiz.is_practice); // Use helper
    const answer = quiz.is_practice ? answerData?.answer : answerData;

    let userAnswerText = 'No Answer Provided'; // Default for unanswered
    let correctAnswerText = 'N/A'; // Default for correct answer text

    // Only determine user answer text if an answer was actually selected
    if (answer !== undefined) {
      if (question.question_type === 'multiple_choice') {
        userAnswerText = question.options?.[answer] ?? 'Invalid Answer Index';
      } else if (question.question_type === 'true_false') {
        userAnswerText = answer === true ? 'True' : 'False';
      } else if (question.question_type === 'check_all_that_apply') {
        userAnswerText = Array.isArray(answer) && answer.length > 0
          ? answer.map(idx => question.options?.[idx] ?? 'Invalid Index').join(', ')
          : 'No Selection'; // Should not happen if answer is defined array, but safe fallback
      }
    }

    // Determine correct answer text (remains mostly the same, added safety checks)
    if (question.question_type === 'multiple_choice') {
      correctAnswerText = question.options?.[question.correct_answer] ?? 'N/A';
    } else if (question.question_type === 'true_false') {
      correctAnswerText = question.correct_answer === true ? 'True' : 'False';
    } else if (question.question_type === 'check_all_that_apply') {
      correctAnswerText = Array.isArray(question.correct_answer)
        ? question.correct_answer.map(idx => question.options?.[idx] ?? 'Invalid Index').join(', ')
        : 'N/A';
    }


    summaryHTML += `
      <li style="page-break-inside: avoid; margin-bottom: 25px; border: 1px solid ${correct ? '#a3e6b4' : '#fecaca'}; padding: 15px; border-radius: 5px; background-color: ${correct ? '#f0fdf4' : '#fef2f2'};">
        <div class="question-block">
          <p style="font-weight: bold; margin-bottom: 5px;">Question ${index + 1}: ${question.question_text}</p>
          <p style="font-size: 0.9em; color: #555; margin-bottom: 10px;">Type: ${formatQuestionType(question.question_type)}</p>
          <div style="display: flex; gap: 20px; margin-bottom: 10px;">
            <div style="flex: 1;">
              <h4 style="margin: 0 0 5px 0; font-size: 0.95em;">Your Answer:</h4>
              <p style="margin: 0; font-size: 0.9em; color: ${correct ? 'green' : 'red'};">${userAnswerText}</p>
            </div>
            ${!correct ? `
            <div style="flex: 1;">
              <h4 style="margin: 0 0 5px 0; font-size: 0.95em;">Correct Answer:</h4>
              <p style="margin: 0; font-size: 0.9em;">${correctAnswerText}</p>
            </div>` : ''}
          </div>
          ${question.explanation ? `
          <div style="border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px;">
            <p style="font-weight: bold; margin: 0 0 5px 0; font-size: 0.9em;">Explanation:</p>
            <p style="margin: 0; font-size: 0.9em; color: #333;">${question.explanation}</p>
          </div>` : ''}
        </div>
      </li>`;
  });
  summaryHTML += `</ul></div></div>`;
  return summaryHTML;
};

// Generates and uploads the PDF, returns the public URL or path
const generateAndUploadPdf = async (ldap, htmlContent, accessCodeData, quiz) => {
  try {
    console.log('Starting PDF generation...');

    // Generate PDF blob
    const pdfBlob = await html2pdf().set({
      margin: [10, 10, 10, 10],
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'avoid-all'] }
    }).from(htmlContent).output('blob');

    console.log('PDF Blob created, size:', pdfBlob.size);

    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(pdfBlob);
    const base64Data = await base64Promise;

    // Call the Edge Function to handle the upload
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-quiz-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        pdfData: base64Data,
        accessCode: accessCodeData.code,
        ldap: ldap,
        quizId: quiz.id
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload PDF');
    }

    const { pdf_url } = await response.json();
    return pdf_url;

  } catch (err) {
    console.error('Error during PDF generation or upload:', err);
    return null;
  }
};


export default QuizTaker;
