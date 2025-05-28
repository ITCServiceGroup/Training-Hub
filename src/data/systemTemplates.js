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
import { signatureTemplateOne } from './templates/signature-template-one.js';
import { signatureTemplateTwo } from './templates/signature-template-two.js';
import { signatureTemplateThree } from './templates/signature-template-three.js';
import { signatureTemplateFour } from './templates/signature-template-four.js';
import { signatureTemplateFive } from './templates/signature-template-five.js';

// Export the combined array of system templates
export const systemTemplates = [
  // Original templates
  basicTextLayoutTemplate,
  interactiveLearningTemplate,
  comparisonLayoutTemplate,
  stepByStepGuideTemplate,
  // Signature Series templates (in numerical order)
  signatureTemplateOne,
  signatureTemplateTwo,
  signatureTemplateThree,
  signatureTemplateFour,
  signatureTemplateFive
];

export default systemTemplates;
