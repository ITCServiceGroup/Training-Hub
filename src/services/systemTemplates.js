/**
 * System Templates Service
 * Handles system templates stored in the codebase
 */

import { systemTemplates } from '../data/systemTemplates';

class SystemTemplatesService {
  constructor() {
    this.templates = systemTemplates;
  }

  /**
   * Get all system templates
   * @returns {Array} Array of system templates
   */
  getAll() {
    return [...this.templates];
  }

  /**
   * Get system template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Template object or null if not found
   */
  getById(id) {
    return this.templates.find(template => template.id === id) || null;
  }

  /**
   * Get system templates by category
   * @param {string} category - Category name
   * @returns {Array} Array of templates in the category
   */
  getByCategory(category) {
    if (category === 'All') {
      return this.getAll();
    }
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Search system templates
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching templates
   */
  search(searchTerm) {
    if (!searchTerm) {
      return this.getAll();
    }

    const term = searchTerm.toLowerCase();
    return this.templates.filter(template =>
      template.name.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.category.toLowerCase().includes(term) ||
      template.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  /**
   * Get all unique categories from system templates
   * @returns {Array} Array of category names
   */
  getCategories() {
    const categories = [...new Set(this.templates.map(template => template.category))];
    return categories.sort();
  }

  /**
   * Get all unique tags from system templates
   * @returns {Array} Array of tag names
   */
  getTags() {
    const tags = [...new Set(this.templates.flatMap(template => template.tags))];
    return tags.sort();
  }



  /**
   * Check if a template is a system template
   * @param {Object} template - Template object
   * @returns {boolean} True if it's a system template
   */
  isSystemTemplate(template) {
    return template.isSystemTemplate === true || template.id?.startsWith('system-');
  }
}

export const systemTemplatesService = new SystemTemplatesService();
export default systemTemplatesService;
