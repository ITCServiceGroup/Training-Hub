/**
 * String matching utilities for handling data quality issues
 * Provides fuzzy matching capabilities for quiz title lookups
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance between strings
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity percentage between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
function calculateSimilarity(a, b) {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 100;
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Normalize string for comparison (trim, lowercase, remove extra spaces)
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
function normalizeString(str) {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Find the best match for a quiz title from available options
 * @param {string} searchTitle - Title to search for
 * @param {Array} availableTitles - Array of available quiz titles
 * @param {number} minSimilarity - Minimum similarity threshold (default: 80)
 * @returns {Object|null} - Best match with title and similarity score, or null
 */
export function findBestQuizMatch(searchTitle, availableTitles, minSimilarity = 80) {
  if (!searchTitle || !availableTitles || availableTitles.length === 0) {
    return null;
  }

  const normalizedSearch = normalizeString(searchTitle);
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const title of availableTitles) {
    const normalizedTitle = normalizeString(title);
    
    // First try exact match after normalization
    if (normalizedSearch === normalizedTitle) {
      return {
        title: title,
        similarity: 100,
        matchType: 'exact'
      };
    }

    // Calculate fuzzy similarity
    const similarity = calculateSimilarity(normalizedSearch, normalizedTitle);
    
    if (similarity > bestSimilarity && similarity >= minSimilarity) {
      bestSimilarity = similarity;
      bestMatch = {
        title: title,
        similarity: similarity,
        matchType: 'fuzzy'
      };
    }
  }

  return bestMatch;
}

/**
 * Create detailed logging information for quiz matching attempts
 * @param {string} searchTitle - Title being searched for
 * @param {Array} availableTitles - Available titles in database
 * @param {Object|null} match - Result from findBestQuizMatch
 * @returns {Object} - Detailed logging information
 */
export function createMatchLog(searchTitle, availableTitles, match) {
  const normalizedSearch = normalizeString(searchTitle);
  
  // Calculate similarities for all available titles for debugging
  const allSimilarities = availableTitles.map(title => ({
    title,
    normalized: normalizeString(title),
    similarity: calculateSimilarity(normalizedSearch, normalizeString(title))
  })).sort((a, b) => b.similarity - a.similarity);

  return {
    searchTitle,
    normalizedSearch,
    availableTitlesCount: availableTitles.length,
    match,
    topMatches: allSimilarities.slice(0, 3), // Show top 3 matches for debugging
    hasExactMatch: allSimilarities.some(item => item.similarity === 100),
    hasFuzzyMatch: allSimilarities.some(item => item.similarity >= 80 && item.similarity < 100)
  };
}

export default {
  findBestQuizMatch,
  createMatchLog,
  calculateSimilarity,
  normalizeString
};