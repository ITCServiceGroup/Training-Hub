/**
 * System Templates - Pre-built templates available to all users
 * These templates are stored in the codebase and don't require database storage
 *
 * Templates are now organized in individual files for better maintainability
 */

// Import individual template files
import { basicTextLayoutTemplate } from './templates/basic-text-layout.js';
import { interactiveLearningTemplate } from './templates/interactive-learning.js';
import { comparisonLayoutTemplate } from './templates/comparison-layout.js';
import { stepByStepGuideTemplate } from './templates/step-by-step-guide.js';

// Export the combined array of system templates
export const systemTemplates = [
  basicTextLayoutTemplate,
  interactiveLearningTemplate,
  comparisonLayoutTemplate,
  stepByStepGuideTemplate
];

export default systemTemplates;
