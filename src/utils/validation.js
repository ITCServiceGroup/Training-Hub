/**
 * Validation utilities for form inputs
 */

/**
 * Validates if a string is a valid email address
 * @param {string} email - The email string to validate
 * @returns {boolean} - True if valid email format, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex pattern - more comprehensive than HTML5 validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim());
};

/**
 * Gets a descriptive error message for invalid email
 * @param {string} email - The email string that failed validation
 * @returns {string} - Error message describing the issue
 */
export const getEmailErrorMessage = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required';
  }
  
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail.includes('@')) {
    return 'Email address must contain an @ symbol';
  }
  
  if (trimmedEmail.startsWith('@') || trimmedEmail.endsWith('@')) {
    return 'Email address cannot start or end with @';
  }
  
  if (trimmedEmail.includes('..')) {
    return 'Email address cannot contain consecutive dots';
  }
  
  if (!trimmedEmail.includes('.')) {
    return 'Email address must contain a domain (e.g., example.com)';
  }
  
  return 'Please enter a valid email address';
};