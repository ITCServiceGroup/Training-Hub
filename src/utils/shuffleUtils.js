/**
 * Fisher-Yates shuffle algorithm implementation that returns a new array
 * @param {Array} array The array to shuffle
 * @returns {Array} A new shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Shuffle question options while maintaining the correct answer mapping
 * @param {Object} question The question object containing options and correct answers
 * @returns {Object} A new question object with shuffled options and updated correct answers
 */
export const shuffleQuestionOptions = (question) => {
  if (!question.options || !Array.isArray(question.options)) {
    return question;
  }

  const optionsWithIndex = question.options.map((opt, index) => ({ value: opt, index }));
  const shuffledOptions = shuffleArray(optionsWithIndex);

  // Create a mapping of old indices to new indices
  const indexMap = {};
  shuffledOptions.forEach((opt, newIndex) => {
    indexMap[opt.index] = newIndex;
  });

  // Update correct answer(s) based on the question type
  let updatedCorrectAnswer;
  if (question.question_type === 'check_all_that_apply') {
    // For check_all_that_apply, correct_answer is an array of indices
    updatedCorrectAnswer = question.correct_answer.map(index => indexMap[index]);
  } else if (question.question_type === 'multiple_choice') {
    // For multiple_choice, correct_answer is a single index
    updatedCorrectAnswer = indexMap[question.correct_answer];
  } else {
    // For other types (like true_false), keep the original correct_answer
    updatedCorrectAnswer = question.correct_answer;
  }

  return {
    ...question,
    options: shuffledOptions.map(opt => opt.value),
    correct_answer: updatedCorrectAnswer
  };
};
