/**
 * Developer Configuration
 * Controls debug logging for system templates
 */

const developerConfig = {
  // Enable debug logging for system templates
  debugSystemTemplates: false
};

/**
 * Log debug information for system templates
 * @param {string} message - Debug message
 * @param {any} data - Additional data to log
 */
export const debugLog = (message, data = null) => {
  if (developerConfig.debugSystemTemplates) {
    console.log(`[SystemTemplates Debug] ${message}`, data);
  }
};
