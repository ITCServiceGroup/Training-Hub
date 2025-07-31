// Shared PDF generation utilities for quiz results

// Helper function to check if an answer is correct
export const isAnswerCorrect = (question, answerData, isPractice = false) => {
  if (answerData === undefined) return false;

  const answer = isPractice ? answerData?.answer : answerData;
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

// Helper function to format question type for display
export const formatQuestionType = (type) => {
  switch (type) {
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'check_all_that_apply':
      return 'Check All That Apply';
    case 'true_false':
      return 'True/False';
    default:
      return type;
  }
};

// Build PDF content HTML - this is the exact same function used in QuizTaker
export const buildPdfContentHtml = (quiz, selectedAnswers, score, timeTaken, ldap, isPractice = false) => {
  // Ensure score object has all required properties
  const safeScore = {
    correct: score?.correct ?? 0,
    total: score?.total ?? 0,
    percentage: score?.percentage ?? 0
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Determine pass/fail status
  const passingScore = quiz.passing_score || 70; // Use quiz passing score or default to 70%
  const passed = safeScore.percentage >= passingScore;
  const statusColor = passed ? '#16a34a' : '#dc2626';
  const statusBgColor = passed ? '#f0fdf4' : '#fef2f2';
  const statusText = passed ? 'PASSED' : 'FAILED';

  console.log('PDF generation - Score:', safeScore);
  console.log('Status values:', { statusColor, statusBgColor, statusText, passed });

  let summaryHTML = `
    <div style="background: white; color: black; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; line-height: 1.6; page-break-inside: auto;">
      <!-- Beautiful Compact Header -->
      <div style="margin-bottom: 30px; page-break-after: avoid;">
        <!-- Main Header Bar -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); color: white; padding: 30px 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3); position: relative; overflow: hidden;">
          <!-- Subtle overlay for depth -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%); pointer-events: none;"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
            <!-- Left: Title Section -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">Quiz Results</h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.9; font-weight: 400; line-height: 1.3;">${quiz.title}</p>
            </div>

            <!-- Right: Score Badge -->
            <div style="background: ${passed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); margin-left: 30px; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 800; margin: 0 0 2px 0; line-height: 1.1;">${safeScore.correct}/${safeScore.total}</div>
                <div style="font-size: 14px; font-weight: 600; opacity: 0.95; margin: 0; line-height: 1.2;">${safeScore.percentage}% • ${statusText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 500px; margin: 0 auto;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 80px;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 5px 0; line-height: 1.2;">Student ID</div>
            <div style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0; line-height: 1.3;">${ldap}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 80px;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 5px 0; line-height: 1.2;">Time Taken</div>
            <div style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0; line-height: 1.3;">${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</div>
          </div>
        </div>

        <!-- Date and Time -->
        <div style="margin-top: 20px; color: #64748b; font-size: 14px;">
          <div style="font-weight: 600;">${formattedDate}</div>
          <div style="margin-top: 2px;">Completed at ${formattedTime}</div>
        </div>
      </div>

      <!-- Results Section -->
      <div id="summary" style="page-break-inside: auto;">
        <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; page-break-after: avoid;">
          <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Detailed Review</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Review your answers and explanations for each question below.</p>
        </div>
        <ul style="list-style: none; padding: 0; page-break-inside: auto;">
  `;

  quiz.questions.forEach((question, index) => {
    const answerData = selectedAnswers[question.id];
    const correct = isAnswerCorrect(question, answerData, isPractice);
    const answer = isPractice ? answerData?.answer : answerData;

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
          : 'No Selection';
      }
    }

    // Determine correct answer text
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
      <li style="page-break-inside: avoid !important; break-inside: avoid; margin-bottom: 30px; border: 2px solid ${correct ? '#16a34a' : '#dc2626'}; border-radius: 12px; background: white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Question Header -->
        <div style="background: ${correct ? '#f0fdf4' : '#fef2f2'}; border-bottom: 1px solid ${correct ? '#16a34a' : '#dc2626'}; padding: 15px 20px; page-break-inside: avoid !important; break-inside: avoid;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="background: ${correct ? '#16a34a' : '#dc2626'}; color: white; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600;">
              Question ${index + 1}
            </div>
            <div style="color: ${correct ? '#16a34a' : '#dc2626'}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${formatQuestionType(question.question_type)}
            </div>
          </div>
          <h3 style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600; line-height: 1.4; page-break-after: avoid;">${question.question_text}</h3>
        </div>

        <!-- Question Content -->
        <div class="question-block" style="padding: 20px; page-break-inside: avoid !important; break-inside: avoid;">
          <div style="page-break-inside: avoid !important; break-inside: avoid;">
          <!-- Answer Sections -->
          <div style="display: block; margin-bottom: 15px; page-break-inside: avoid !important; break-inside: avoid;">
            <!-- Your Answer -->
            <div style="background: ${correct ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${correct ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Your Answer</div>
              <div style="color: ${correct ? '#16a34a' : '#dc2626'}; font-size: 14px; font-weight: 500; line-height: 1.4;">${userAnswerText}</div>
            </div>

            <!-- Correct Answer (always show) -->
            <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Correct Answer</div>
              <div style="color: #16a34a; font-size: 14px; font-weight: 500; line-height: 1.4;">${correctAnswerText}</div>
            </div>
          </div>

          ${question.explanation ? `
          <!-- Explanation -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 15px; margin-top: 15px; page-break-inside: avoid !important; break-inside: avoid;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Explanation</div>
            <div style="color: #475569; font-size: 14px; line-height: 1.5;">${question.explanation}</div>
          </div>` : ''}
        </div>
      </li>`;
  });

  summaryHTML += `</ul></div></div>
    <style>
      @media print {
        .question-block {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        li {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          orphans: 3;
          widows: 3;
        }
        h1, h2, h3, h4 {
          page-break-after: avoid !important;
          orphans: 3;
          widows: 3;
        }
        p {
          orphans: 2;
          widows: 2;
        }
      }
    </style>`;

  // Debug: Log the exact score badge HTML
  const scoreBadgeStart = summaryHTML.indexOf('<!-- Score Badge -->');
  const scoreBadgeEnd = summaryHTML.indexOf('<!-- Details Grid -->');
  const scoreBadgeHtml = summaryHTML.substring(scoreBadgeStart, scoreBadgeEnd);
  console.log('Score Badge HTML:', scoreBadgeHtml);

  return summaryHTML;
};

// Test function - can be called from browser console: window.testPdfGeneration()
window.testPdfGeneration = () => {
  const testQuiz = {
    title: "Test Quiz",
    passing_score: 70,
    questions: [
      {
        id: "1",
        question_text: "What is 2 + 2?",
        question_type: "multiple_choice",
        options: ["3", "4", "5", "6"],
        correct_answer: 1,
        explanation: "2 + 2 equals 4"
      }
    ]
  };

  const testSelectedAnswers = {
    "1": 1
  };

  const testScore = {
    correct: 1,
    total: 1,
    percentage: 100
  };

  const testTimeTaken = 120;
  const testLdap = "testuser";

  console.log('=== TESTING PDF GENERATION ===');
  const htmlContent = buildPdfContentHtml(testQuiz, testSelectedAnswers, testScore, testTimeTaken, testLdap, false);

  // Create a temporary div to display the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '50px';
  tempDiv.style.left = '50px';
  tempDiv.style.width = '800px';
  tempDiv.style.height = '600px';
  tempDiv.style.background = 'white';
  tempDiv.style.border = '2px solid red';
  tempDiv.style.zIndex = '9999';
  tempDiv.style.overflow = 'auto';
  tempDiv.style.padding = '20px';

  document.body.appendChild(tempDiv);

  console.log('Test HTML preview added to page. Check the red-bordered box.');
  console.log('To remove it, run: document.body.removeChild(document.querySelector("div[style*=\'border: 2px solid red\']"))');

  return htmlContent;
};
