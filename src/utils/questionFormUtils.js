/**
 * Utility functions and constants for question form components
 */

// Constants
export const QUESTION_LIMITS = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  MIN_CORRECT_ANSWERS: 1
};

/**
 * Gets consistent styling classes for form elements
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {object} - Object with styling classes
 */
export const getFormStyles = (isDark) => ({
  input: `w-full py-2 px-3 border ${
    isDark
      ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
  } rounded-md focus:ring-1 focus:ring-primary focus:border-primary`,
  
  radio: `text-primary ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`,
  
  checkbox: `text-teal-600 rounded ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`,
  
  button: {
    primary: 'bg-primary-dark text-white px-3 py-1 rounded text-sm hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
    remove: `${
      isDark ? 'text-red-400 hover:text-red-300 border-red-400' : 'text-red-500 hover:text-red-700 border-red-500'
    } border rounded disabled:opacity-50 disabled:cursor-not-allowed`
  },
  
  text: {
    heading: `text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`,
    label: `cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-700'}`,
    formLabel: `block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`,
    error: `text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`,
    warning: `text-sm ${isDark ? 'text-amber-400' : 'text-amber-500'}`,
    info: `text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`
  }
});

/**
 * Validation functions for question forms
 */
export const validateOptions = {
  /**
   * Validates minimum number of options
   * @param {Array} options - Array of option strings
   * @returns {boolean} - Whether validation passes
   */
  hasMinimumOptions: (options) => options.length >= QUESTION_LIMITS.MIN_OPTIONS,
  
  /**
   * Validates maximum number of options
   * @param {Array} options - Array of option strings
   * @returns {boolean} - Whether validation passes
   */
  hasMaximumOptions: (options) => options.length <= QUESTION_LIMITS.MAX_OPTIONS,
  
  /**
   * Validates that all options have content
   * @param {Array} options - Array of option strings
   * @returns {boolean} - Whether validation passes
   */
  hasValidContent: (options) => options.every(option => option.trim().length > 0),
  
  /**
   * Validates that at least one correct answer is selected
   * @param {number|Array|boolean} correctAnswers - Correct answer(s)
   * @returns {boolean} - Whether validation passes
   */
  hasCorrectAnswers: (correctAnswers) => {
    if (Array.isArray(correctAnswers)) {
      return correctAnswers.length >= QUESTION_LIMITS.MIN_CORRECT_ANSWERS;
    }
    return correctAnswers !== undefined && correctAnswers !== null;
  },
  
  /**
   * Validates check-all-that-apply specific rules
   * @param {Array} options - Array of option strings
   * @param {Array} correctAnswers - Array of correct answer indices
   * @returns {object} - Validation result with warnings
   */
  validateCheckAll: (options, correctAnswers) => ({
    isValid: correctAnswers.length > 0 && correctAnswers.length < options.length,
    hasNoCorrect: correctAnswers.length === 0,
    hasAllCorrect: correctAnswers.length === options.length && options.length > 0
  })
};

/**
 * Helper functions for managing option arrays
 */
export const optionHelpers = {
  /**
   * Adds a new empty option
   * @param {Array} options - Current options array
   * @returns {Array} - New options array with empty option added
   */
  addOption: (options) => [...options, ''],
  
  /**
   * Removes option at specified index
   * @param {Array} options - Current options array
   * @param {number} index - Index to remove
   * @returns {Array} - New options array with option removed
   */
  removeOption: (options, index) => options.filter((_, i) => i !== index),
  
  /**
   * Updates option at specified index
   * @param {Array} options - Current options array
   * @param {number} index - Index to update
   * @param {string} value - New value
   * @returns {Array} - New options array with updated option
   */
  updateOption: (options, index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    return newOptions;
  }
};

/**
 * Helper functions for managing correct answers
 */
export const answerHelpers = {
  /**
   * Updates correct answer for multiple choice (adjusts for removed options)
   * @param {number} currentAnswer - Current correct answer index
   * @param {number} removedIndex - Index of removed option
   * @returns {number} - Adjusted correct answer index
   */
  adjustMultipleChoiceAnswer: (currentAnswer, removedIndex) => {
    if (currentAnswer === removedIndex) return 0;
    if (currentAnswer > removedIndex) return currentAnswer - 1;
    return currentAnswer;
  },
  
  /**
   * Updates correct answers for check-all-that-apply (adjusts for removed options)
   * @param {Array} currentAnswers - Current correct answer indices
   * @param {number} removedIndex - Index of removed option
   * @returns {Array} - Adjusted correct answer indices
   */
  adjustCheckAllAnswers: (currentAnswers, removedIndex) => {
    return currentAnswers
      .filter(answerIndex => answerIndex !== removedIndex)
      .map(answerIndex => answerIndex > removedIndex ? answerIndex - 1 : answerIndex);
  },
  
  /**
   * Toggles correct answer for check-all-that-apply
   * @param {Array} currentAnswers - Current correct answer indices
   * @param {number} index - Index to toggle
   * @param {boolean} isChecked - Whether to add or remove
   * @returns {Array} - Updated correct answer indices
   */
  toggleCheckAllAnswer: (currentAnswers, index, isChecked) => {
    if (isChecked) {
      return [...currentAnswers, index].sort((a, b) => a - b);
    }
    return currentAnswers.filter(i => i !== index);
  }
};

export default {
  QUESTION_LIMITS,
  getFormStyles,
  validateOptions,
  optionHelpers,
  answerHelpers
};