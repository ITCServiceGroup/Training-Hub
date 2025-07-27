/**
 * Content measurement utilities for dynamic PDF layout
 * Estimates content dimensions and calculates optimal page layouts
 */

// Font size configurations from QuizQuestionSection styles
const FONT_SIZES = {
  questionText: 9,
  responseText: 8,
  explanationText: 10,
  questionNumber: 10,
  questionType: 8,
  responseHeader: 9,
  explanationHeader: 9,
};

// Layout constants
const LAYOUT_CONSTANTS = {
  // Page dimensions (A4)
  pageHeight: 842, // A4 height in points
  pageWidth: 595,  // A4 width in points
  
  // Page margins and spacing (very conservative estimates)
  pageMargins: 40,
  headerHeight: 80, // More conservative header space
  footerHeight: 80, // More conservative footer space
  
  // Question card base dimensions
  cardPadding: 8,
  cardMarginBottom: 6,
  cardBorder: 1,
  
  // Question header height
  questionHeaderHeight: 35,
  
  // Response section height (fixed for two columns)
  responseRowHeight: 45,
  
  // Explanation section base height
  explanationHeaderHeight: 15,
  explanationPadding: 10,
  
  // Line height multipliers
  lineHeights: {
    questionText: 1.3,
    responseText: 1.2,
    explanationText: 1.4,
  }
};

/**
 * Estimate text height based on font size, line height, and character count
 * @param {string} text - The text to measure
 * @param {number} fontSize - Font size in points
 * @param {number} lineHeight - Line height multiplier
 * @param {number} maxWidth - Maximum width for text wrapping
 * @returns {number} Estimated height in points
 */
function estimateTextHeight(text, fontSize, lineHeight, maxWidth) {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  // Average character width is approximately 60% of font size for Helvetica
  const avgCharWidth = fontSize * 0.6;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const estimatedLines = Math.ceil(text.length / charsPerLine);
  
  // Apply minimum of 1 line
  const lines = Math.max(1, estimatedLines);
  
  return lines * fontSize * lineHeight;
}

/**
 * Calculate the estimated height of a single question card
 * @param {Object} question - Question object
 * @param {boolean} hasExplanation - Whether explanation will be shown
 * @returns {number} Estimated height in points
 */
function calculateQuestionCardHeight(question, hasExplanation = true) {
  const { cardPadding, questionHeaderHeight } = LAYOUT_CONSTANTS;
  
  // Calculate response row height based on question type
  let responseRowHeight = LAYOUT_CONSTANTS.responseRowHeight;
  
  // Check all that apply questions need more space for bullet points
  if (question.question_type === 'check_all_that_apply') {
    const correctAnswerCount = Array.isArray(question.correct_answer) ? question.correct_answer.length : 1;
    // Estimate additional height: each bullet point adds ~15px
    responseRowHeight += Math.max(0, (correctAnswerCount - 1) * 15);
  }
  
  // Base height includes padding, header, and response row
  let totalHeight = cardPadding * 2 + questionHeaderHeight + responseRowHeight;
  
  // Calculate question text height
  const questionTextMaxWidth = 500; // Approximate width after padding
  const questionTextHeight = estimateTextHeight(
    question.question_text,
    FONT_SIZES.questionText,
    LAYOUT_CONSTANTS.lineHeights.questionText,
    questionTextMaxWidth
  );
  
  totalHeight += questionTextHeight + 6; // 6px margin bottom
  
  // Add explanation height if present
  if (hasExplanation && question.explanation) {
    const explanationMaxWidth = 480; // Width inside explanation box
    const explanationTextHeight = estimateTextHeight(
      question.explanation,
      FONT_SIZES.explanationText,
      LAYOUT_CONSTANTS.lineHeights.explanationText,
      explanationMaxWidth
    );
    
    totalHeight += LAYOUT_CONSTANTS.explanationHeaderHeight + 
                   explanationTextHeight + 
                   LAYOUT_CONSTANTS.explanationPadding * 2 + 
                   8; // 8px margin top
  }
  
  return Math.ceil(totalHeight);
}

/**
 * Calculate optimal questions per page using simple buffer zone approach
 * @param {Array} questions - Array of question objects
 * @param {number} availableHeight - Available height on page
 * @param {number} bufferZoneHeight - Height of buffer zone at bottom of page (default: 40px)
 * @returns {Array} Array of question groups for each page
 */
function calculateOptimalPagination(questions, availableHeight = null, bufferZoneHeight = 40) {
  if (!availableHeight) {
    // Calculate available height (page - margins - header - footer)
    availableHeight = LAYOUT_CONSTANTS.pageHeight - 
                     (LAYOUT_CONSTANTS.pageMargins * 2) - 
                     LAYOUT_CONSTANTS.headerHeight - 
                     LAYOUT_CONSTANTS.footerHeight;
  }
  
  const questionPages = [];
  let currentPageQuestions = [];
  let currentPageHeight = 0;
  
  // Simple approach: usable height = available height - buffer zone
  const usableHeight = availableHeight - bufferZoneHeight;
  
  console.log('PDF Pagination Setup:', {
    availableHeight,
    bufferZoneHeight,
    usableHeight,
    totalQuestions: questions.length
  });
  
  for (const question of questions) {
    const questionHeight = calculateQuestionCardHeight(question);
    
    // Simple check: if adding this question would exceed usable height, start new page
    if (currentPageHeight + questionHeight > usableHeight && currentPageQuestions.length > 0) {
      // Start new page
      console.log(`Page ${questionPages.length + 1}: ${currentPageQuestions.length} questions, height: ${currentPageHeight}px`);
      questionPages.push(currentPageQuestions);
      
      currentPageQuestions = [question];
      currentPageHeight = questionHeight + LAYOUT_CONSTANTS.cardMarginBottom;
    } else {
      // Add to current page
      currentPageQuestions.push(question);
      currentPageHeight += questionHeight + LAYOUT_CONSTANTS.cardMarginBottom;
    }
  }
  
  // Add the last page if it has questions
  if (currentPageQuestions.length > 0) {
    console.log(`Page ${questionPages.length + 1}: ${currentPageQuestions.length} questions, height: ${currentPageHeight}px`);
    questionPages.push(currentPageQuestions);
  }
  
  console.log(`Total pages created: ${questionPages.length}`);
  return questionPages;
}

/**
 * CONFIGURABLE BUFFER ZONE - Easy Manual Tuning
 * 
 * To adjust pagination and prevent blank pages:
 * 1. Increase 'height' value if blank pages still occur (try 50, 60, 70, etc.)
 * 2. Decrease 'height' value if too much white space (try 30, 25, 20, etc.)
 * 3. Set 'debug' to true to see pagination details in browser console
 * 4. Test with various quiz lengths and question types
 */
const BUFFER_ZONE_CONFIG = {
  // Buffer zone height in pixels - ADJUST THIS VALUE TO FINE-TUNE
  height: 40, // Recommended: 25-50px range
  
  // Debug mode - shows detailed pagination logs in console
  debug: true
};

/**
 * Analyze content complexity for layout optimization
 * @param {Array} questions - Array of question objects
 * @returns {Object} Analysis results
 */
function analyzeContentComplexity(questions) {
  let totalQuestions = questions.length;
  let totalHeight = 0;
  let questionsWithExplanations = 0;
  let averageQuestionLength = 0;
  let averageExplanationLength = 0;
  
  questions.forEach(question => {
    totalHeight += calculateQuestionCardHeight(question);
    averageQuestionLength += question.question_text?.length || 0;
    
    if (question.explanation) {
      questionsWithExplanations++;
      averageExplanationLength += question.explanation.length;
    }
  });
  
  averageQuestionLength = Math.round(averageQuestionLength / totalQuestions);
  averageExplanationLength = questionsWithExplanations > 0 
    ? Math.round(averageExplanationLength / questionsWithExplanations) 
    : 0;
  
  const averageHeightPerQuestion = Math.round(totalHeight / totalQuestions);
  
  return {
    totalQuestions,
    questionsWithExplanations,
    explanationPercentage: Math.round((questionsWithExplanations / totalQuestions) * 100),
    averageQuestionLength,
    averageExplanationLength,
    averageHeightPerQuestion,
    totalEstimatedHeight: totalHeight,
    complexity: averageHeightPerQuestion > 200 ? 'high' : 
                averageHeightPerQuestion > 150 ? 'medium' : 'low'
  };
}

export {
  calculateQuestionCardHeight,
  calculateOptimalPagination,
  analyzeContentComplexity,
  estimateTextHeight,
  LAYOUT_CONSTANTS,
  FONT_SIZES,
  BUFFER_ZONE_CONFIG
};