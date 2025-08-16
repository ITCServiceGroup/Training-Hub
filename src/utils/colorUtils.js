/**
 * Utility functions for color manipulation used across quiz components
 */

/**
 * Converts hex color to rgba format
 * @param {string} hex - Hex color code (with or without #)
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
export const hexToRgba = (hex, alpha) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Gets theme-appropriate background colors for quiz states
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {object} - Object with color utilities
 */
export const getQuizStateColors = (isDark) => ({
  correct: {
    bg: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)',
    border: isDark ? 'border-green-700' : 'border-green-500',
    text: isDark ? 'text-green-400' : 'text-green-700'
  },
  incorrect: {
    bg: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)',
    border: isDark ? 'border-red-700' : 'border-red-500', 
    text: isDark ? 'text-red-400' : 'text-red-700'
  },
  default: {
    bg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900'
  }
});

export default { hexToRgba, getQuizStateColors };