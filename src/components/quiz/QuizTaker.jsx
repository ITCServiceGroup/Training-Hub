import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';
import { supabase } from '../../config/supabase';
import { shuffleArray, shuffleQuestionOptions } from '../../utils/shuffleUtils';
import { quizzesService } from '../../services/api/quizzes';
import { quizResultsService } from '../../services/api/quizResults';
import { accessCodesService } from '../../services/api/accessCodes';
import { categoriesService } from '../../services/api/categories';
import QuizTimer from './QuizTimer';
import QuestionDisplay from './QuestionDisplay';
import QuizReview from './QuizReview';
import QuizResults from './QuizResults';
import { pdfService } from '../../services/pdfService';
import { FaSpinner } from 'react-icons/fa';




const QuizTaker = ({ quizId, accessCode, testTakerInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation context
  const [categoryInfo, setCategoryInfo] = useState(null);

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

  // Load category information for back navigation
  useEffect(() => {
    const loadCategoryInfo = async () => {
      const urlParams = new URLSearchParams(location.search);
      const fromParam = urlParams.get('from');
      const sectionId = urlParams.get('sectionId');
      const categoryId = urlParams.get('categoryId');

      if (fromParam === 'practice' && categoryId) {
        try {
          const category = await categoriesService.getById(categoryId);
          setCategoryInfo({ ...category, sectionId });
        } catch (error) {
          console.error('Failed to load category info:', error);
        }
      }
    };

    loadCategoryInfo();
  }, [location.search]);

  // Submit quiz handler - defined before timer effect
  const handleSubmitQuiz = useCallback(async (isTimeout = false) => {
    // Prevent multiple submissions
    if (submitInProgressRef.current) return;
    submitInProgressRef.current = true;
    setIsSubmitting(true);

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
          pdfUrl = await pdfService.uploadQuizResultsPDF({
            quiz,
            selectedAnswers,
            score: finalScore,
            timeTaken,
            ldap: accessCodeData.ldap,
            isPractice: quiz.is_practice,
            accessCodeData
          }, accessCodeData);

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
      setIsSubmitting(false);
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
    return <div className={`text-center p-8 ${isDark ? 'text-gray-300' : ''}`}>Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className={`p-6 ${isDark ? 'bg-red-900/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg`}>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => navigate('/study-guide')}
          className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-lg font-medium transition-colors`}
        >
          Return to Study Guides
        </button>
      </div>
    );
  }

  if (!quiz) {
    return <div className={`text-center p-8 ${isDark ? 'text-gray-300' : ''}`}>Quiz not found</div>;
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
        onExit={() => navigate('/study-guide')} // Navigate back to study guides
        isPractice={quiz.is_practice}
        accessCodeData={accessCodeData}
      />
    );
  }

  // Review screen
  if (isReviewing) {
    return (
      <>
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
          isSubmitting={isSubmitting}
        />

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 max-w-md mx-4 text-center shadow-xl`}>
              <FaSpinner className={`animate-spin text-4xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                Saving Your Results
              </h3>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Please wait while we save your quiz results. You will be redirected to the results page shortly.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow`}>
        {/* Back navigation */}
        {categoryInfo && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/quiz/practice/${categoryInfo.sectionId}/${categoryInfo.id}`)}
              className={`text-sm ${isDark ? 'text-primary-light hover:text-primary' : 'text-primary-dark hover:text-primary'} hover:underline`}
            >
              ← Back to {categoryInfo.name}
            </button>
          </div>
        )}

        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>{quiz.title}</h2>
        {quiz.description && (
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>{quiz.description}</p>
        )}

        <div className="flex gap-8 mb-8">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Questions</p>
            <p className={`font-bold ${isDark ? 'text-white' : ''}`}>{quiz.questions.length}</p>
          </div>
          {quiz.time_limit && (
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Time Limit</p>
              <p className={`font-bold ${isDark ? 'text-white' : ''}`}>{Math.floor(quiz.time_limit / 60)} minutes</p>
            </div>
          )}
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Passing Score</p>
            <p className={`font-bold ${isDark ? 'text-white' : ''}`}>{quiz.passing_score || 70}%</p>
          </div>
        </div>

        <button
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
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
    <>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{quiz.title}</h2>
            <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
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
        <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full mb-8`}>
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <QuestionDisplay
            question={currentQuestion}
            selectedAnswer={quiz.is_practice ? selectedAnswers[currentQuestion.id]?.answer : selectedAnswers[currentQuestion.id]}
            onSelectAnswer={handleSelectAnswer}
            isPractice={quiz.is_practice}
            showFeedback={quiz.is_practice && selectedAnswers[currentQuestion.id]?.showFeedback}
            isCorrect={quiz.is_practice && selectedAnswers[currentQuestion.id]?.isCorrect}
          />

          <div className={`flex justify-between mt-8 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              className={`px-6 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            <button
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNextQuestion}
              disabled={quiz.is_practice && !isCurrentPracticeQuestionAnswered} // Disable if practice and not answered
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : (quiz.is_practice ? 'Finish Quiz' : 'Review Answers')}
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay for practice quiz submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 max-w-md mx-4 text-center shadow-xl`}>
            <FaSpinner className={`animate-spin text-4xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
              Saving Your Results
            </h3>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Please wait while we save your quiz results and generate your certificate. You will be redirected to the results page shortly.
            </p>
          </div>
        </div>
      )}
    </>
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

// PDF generation is now handled by the pdfService using React-PDF


export default QuizTaker;
