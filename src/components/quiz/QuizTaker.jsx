import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import PropTypes from 'prop-types';
import html2pdf from 'html2pdf.js'; // Import html2pdf
import { supabase } from '../../config/supabase'; // Import supabase client
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
  // Ref for PDF content generation without rendering it
  const pdfContentRef = useRef(null);
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

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft !== null) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const handleStartQuiz = () => {
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
          isCorrect
        }
      }));
    } else {
      // For regular quizzes, just store the answer
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer
      }));
    }
  };

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === undefined) return;

      let isCorrect = false;
      switch (question.question_type) {
        case 'multiple_choice':
          isCorrect = selectedAnswer === question.correct_answer;
          break;
        case 'check_all_that_apply':
          if (Array.isArray(selectedAnswer) && Array.isArray(question.correct_answer)) {
            isCorrect = 
              selectedAnswer.length === question.correct_answer.length &&
              selectedAnswer.every(a => question.correct_answer.includes(a));
          }
          break;
        case 'true_false':
          isCorrect = selectedAnswer === question.correct_answer;
          break;
      }
      if (isCorrect) correctCount++;
    });

    return {
      correct: correctCount,
      total: totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100)
    };
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    const finalScore = calculateScore();
    setScore(finalScore); // Set score state for UI

    // For non-practice quizzes, generate PDF and save the result
    if (!quiz.is_practice && accessCodeData) {
      let pdfUrl = null;
      try {
        // 1. Generate PDF content HTML (similar to old quiz.js buildSummaryHTML)
        const pdfHtml = buildPdfContentHtml(quiz, selectedAnswers, finalScore, timeTaken, accessCodeData.ldap);
        
        // 2. Generate and Upload PDF
        pdfUrl = await generateAndUploadPdf(accessCodeData.ldap, pdfHtml);
        if (!pdfUrl) {
           console.warn('PDF generation/upload failed. Saving result without PDF URL.');
           // Optionally alert the user here if needed
        }

        // 3. Save quiz result to DB
        await quizResultsService.create({
          quiz_id: quiz.id,
          ldap: accessCodeData.ldap,
          supervisor: accessCodeData.supervisor,
          market: accessCodeData.market,
          score_value: finalScore.percentage, // Keep as percentage (0-100)
          score_text: `${finalScore.correct}/${finalScore.total} (${finalScore.percentage}%)`, // New format
          answers: selectedAnswers,
          time_taken: timeTaken,
          date_of_test: new Date().toISOString(), // Add date_of_test
          quiz_type: quiz.title, // Add quiz_type
          pdf_url: pdfUrl // Add the generated PDF URL (or null if failed)
        });

        // 4. Mark access code as used
        await accessCodesService.markAsUsed(accessCode);

      } catch (error) {
        console.error('Failed to save quiz result or generate PDF:', error);
        // Consider more robust error handling/user feedback
      }
    }

    setQuizCompleted(true); // Move to results screen regardless of PDF success
    setIsReviewing(false);
  };

  // Navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsReviewing(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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
        onExit={() => window.location.hash = '/'} // Use hash routing
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
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Review Answers'}
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

    let userAnswerText = 'N/A';
    let correctAnswerText = 'N/A';

    if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
       userAnswerText = answer !== undefined && question.options ? (question.options[answer] ?? (answer === true ? 'True' : answer === false ? 'False' : 'No Answer')) : 'No Answer';
       correctAnswerText = question.options ? (question.options[question.correct_answer] ?? (question.correct_answer === true ? 'True' : 'False')) : (question.correct_answer === true ? 'True' : 'False');
    } else if (question.question_type === 'check_all_that_apply') {
       userAnswerText = Array.isArray(answer) && answer.length > 0 ? answer.map(idx => question.options[idx]).join(', ') : 'No Answer';
       correctAnswerText = Array.isArray(question.correct_answer) ? question.correct_answer.map(idx => question.options[idx]).join(', ') : 'N/A';
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
const generateAndUploadPdf = async (ldap, htmlContent) => {
  try {
    console.log('Starting PDF generation...');
    const cleanLDAP = ldap.replace(/[^a-z0-9]/gi, '').toLowerCase(); // Sanitize LDAP
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Create timestamp
    const filename = `${cleanLDAP}-${timestamp}.pdf`; // Unique filename
    const bucketName = 'quiz-pdfs'; // Target bucket

    console.log('Generating PDF for:', filename);

    const pdfBlob = await html2pdf().set({
      margin: [10, 10, 10, 10], // Margins in mm [top, left, bottom, right]
      filename: filename, // Default filename if save() is called
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false }, // Increase scale for better quality
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'avoid-all'] } // Avoid breaking elements unnecessarily
    }).from(htmlContent).output('blob');

    console.log('PDF Blob created, size:', pdfBlob.size);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filename, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false // Don't overwrite existing files with the same name (though unlikely with timestamp)
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    console.log('Supabase upload successful:', uploadData);

    // Construct the public URL (adjust if your bucket/setup differs)
    // Note: This assumes the bucket is public or you have policies allowing access.
    // If the bucket is private, you'd need to generate a signed URL instead.
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
    
    console.log('Public URL data:', urlData);
    return urlData?.publicUrl || filename; // Return URL if available, otherwise just the path

  } catch (err) {
    console.error('Error during PDF generation or upload:', err);
    return null; // Indicate failure
  }
};


export default QuizTaker;
