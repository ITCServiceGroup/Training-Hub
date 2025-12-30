import { lazy } from 'react';

/**
 * Wraps React.lazy() with automatic retry logic for failed chunk loads
 *
 * This solves the common issue where dynamic imports fail due to:
 * - Temporary network issues
 * - Cache mismatches after deployment
 * - CDN hiccups
 *
 * @param {Function} componentImport - The dynamic import function (() => import('./Component'))
 * @param {Object} options - Configuration options
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @param {number} options.retryDelay - Initial delay in ms between retries (default: 1000)
 * @returns {React.LazyExoticComponent} A lazy-loaded component with retry logic
 *
 * @example
 * const HomePage = lazyRetry(() => import('./pages/HomePage'));
 */
const lazyRetry = (componentImport, { retries = 3, retryDelay = 1000 } = {}) => {
  return lazy(async () => {
    const attemptImport = async (attemptsLeft) => {
      try {
        return await componentImport();
      } catch (error) {
        // If we have retries left and it's a chunk loading error
        if (attemptsLeft > 0 && error?.message?.includes('Failed to fetch')) {
          // Log retry attempt (helps with debugging)
          console.log(
            `[Lazy Retry] Failed to load chunk. Retrying... (${retries - attemptsLeft + 1}/${retries})`,
            error.message
          );

          // Wait with exponential backoff
          const delay = retryDelay * Math.pow(2, retries - attemptsLeft);
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry the import
          return attemptImport(attemptsLeft - 1);
        }

        // If no retries left or different error, throw it
        throw error;
      }
    };

    return attemptImport(retries);
  });
};

export default lazyRetry;
