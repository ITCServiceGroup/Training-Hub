/**
 * System Templates - Pre-built templates available to all users
 * These templates are stored in the codebase and don't require database storage
 *
 * Templates are now organized in individual files for better maintainability
 */

// Import individual template files
import { interactiveLearningTemplate } from './templates/interactive-learning.js';
import { comparisonLayoutTemplate } from './templates/comparison-layout.js';
import { signatureTemplateOne } from './templates/signature-template-one.js';
import { signatureTemplateTwo } from './templates/signature-template-two.js';
import { signatureTemplateThree } from './templates/signature-template-three.js';
import { signatureTemplateFour } from './templates/signature-template-four.js';
import { signatureTemplateFive } from './templates/signature-template-five.js';
import { googleInspiredTemplateOne } from './templates/google-inspired-template-one.js';
import { googleInspiredTemplateTwo } from './templates/google-inspired-template-two.js';
import { googleInspiredTemplateThree } from './templates/google-inspired-template-three.js';
import { googleInspiredTemplateFour } from './templates/google-inspired-template-four.js';
import { googleInspiredTemplateFive } from './templates/google-inspired-template-five.js';

// Export the combined array of system templates
export const systemTemplates = [
  // Original templates
  interactiveLearningTemplate,
  comparisonLayoutTemplate,
  // Signature Series templates (in numerical order)
  signatureTemplateOne,
  signatureTemplateTwo,
  signatureTemplateThree,
  signatureTemplateFour,
  signatureTemplateFive,
  // Google Inspired Series templates (in numerical order)
  googleInspiredTemplateOne,
  googleInspiredTemplateTwo,
  googleInspiredTemplateThree,
  googleInspiredTemplateFour,
  googleInspiredTemplateFive
];

export default systemTemplates;
