/**
 * Developer Configuration
 * Controls developer-only features and settings
 */

export const developerConfig = {
  // Enable system template creation features
  enableSystemTemplateCreation: true,
  
  // Developer email or identifier (you can change this to your email)
  developerIdentifier: 'developer@traininghub.com',
  
  // Enable debug logging for system templates
  debugSystemTemplates: false,
  
  // Show system template development tools
  showDevTools: true
};

/**
 * Check if current user is a developer
 * You can modify this function to check against your actual user system
 * @param {Object} user - Current user object
 * @returns {boolean} True if user is a developer
 */
export const isDeveloper = (user) => {
  // For now, this is a simple check - you can enhance this
  // to check against your actual authentication system
  return user?.email === developerConfig.developerIdentifier ||
         user?.role === 'developer' ||
         user?.isDeveloper === true;
};

/**
 * Check if system template creation is enabled
 * @returns {boolean} True if enabled
 */
export const isSystemTemplateCreationEnabled = () => {
  return developerConfig.enableSystemTemplateCreation;
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

export default developerConfig;
