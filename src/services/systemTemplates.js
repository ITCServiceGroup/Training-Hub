import {
  getSystemTemplateDefinition,
  systemTemplateRegistry,
} from "../data/systemTemplateRegistry";
import { validateSystemTemplate } from "../data/templateContract";

class SystemTemplatesService {
  constructor() {
    this.templatePromises = new Map();
  }

  getMetadata(definition) {
    const { load: _load, ...metadata } = definition;
    return {
      ...metadata,
      loadContent: () => this.loadContent(metadata.id),
    };
  }

  async loadTemplate(id) {
    const definition = getSystemTemplateDefinition(id);
    if (!definition) return null;

    if (!this.templatePromises.has(id)) {
      this.templatePromises.set(
        id,
        definition
          .load()
          .then((template) => validateSystemTemplate(template, definition))
          .catch((error) => {
            this.templatePromises.delete(id);
            throw error;
          }),
      );
    }

    return this.templatePromises.get(id);
  }

  async loadContent(id) {
    const template = await this.loadTemplate(id);
    return template?.content ?? null;
  }

  /**
   * Get all system templates
   * @returns {Array} Array of system templates
   */
  async getAll() {
    return systemTemplateRegistry.map((definition) =>
      this.getMetadata(definition),
    );
  }

  /**
   * Get system template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Template object or null if not found
   */
  async getById(id) {
    return this.loadTemplate(id);
  }

  /**
   * Get system templates by category
   * @param {string} category - Category name
   * @returns {Array} Array of templates in the category
   */
  async getByCategory(category) {
    if (category === "All") {
      return this.getAll();
    }
    return systemTemplateRegistry
      .filter((template) => template.category === category)
      .map((definition) => this.getMetadata(definition));
  }

  /**
   * Search system templates
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching templates
   */
  async search(searchTerm) {
    if (!searchTerm) {
      return this.getAll();
    }

    const term = searchTerm.toLowerCase();
    return systemTemplateRegistry
      .filter(
        (template) =>
          template.name.toLowerCase().includes(term) ||
          template.description.toLowerCase().includes(term) ||
          template.category.toLowerCase().includes(term) ||
          template.tags.some((tag) => tag.toLowerCase().includes(term)),
      )
      .map((definition) => this.getMetadata(definition));
  }

  /**
   * Get all unique categories from system templates
   * @returns {Array} Array of category names
   */
  async getCategories() {
    const categories = [
      ...new Set(systemTemplateRegistry.map((template) => template.category)),
    ];
    return categories.sort();
  }

  /**
   * Get all unique tags from system templates
   * @returns {Array} Array of tag names
   */
  async getTags() {
    const tags = [
      ...new Set(systemTemplateRegistry.flatMap((template) => template.tags)),
    ];
    return tags.sort();
  }

  /**
   * Check if a template is a system template
   * @param {Object} template - Template object
   * @returns {boolean} True if it's a system template
   */
  isSystemTemplate(template) {
    return (
      template.isSystemTemplate === true || template.id?.startsWith("system-")
    );
  }
}

export const systemTemplatesService = new SystemTemplatesService();
export default systemTemplatesService;
