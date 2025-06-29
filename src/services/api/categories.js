import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Categories service for interacting with v2_categories table
 */
class CategoriesService extends BaseService {
  constructor() {
    super('v2_categories');
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} - All categories
   */
  async getAllCategories() {
    try {
      // First get all categories
      const { data: categories, error } = await supabase
        .from(this.tableName)
        .select('id, name, description, section_id, icon, display_order, created_at, updated_at')
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      // Get all sections
      const { data: sections, error: sectionsError } = await supabase
        .from('v2_sections')
        .select('*');

      if (sectionsError) {
        throw sectionsError;
      }

      // Create a map of section IDs to sections for quick lookup
      const sectionsMap = {};
      sections.forEach(section => {
        sectionsMap[section.id] = section;
      });

      // For each category, add its section info
      for (const category of categories) {
        category.v2_sections = sectionsMap[category.section_id];
      }

      return categories;
    } catch (error) {
      console.error('Error fetching all categories:', error.message);
      throw error;
    }
  }

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object|null>} - Category or null if not found
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, description, section_id, icon, display_order, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching category by ID:', error.message);
      throw error;
    }
  }

  /**
   * Get categories by section ID
   * @param {string} sectionId - Section ID
   * @returns {Promise<Array>} - Categories in the specified section
   */
  async getBySectionId(sectionId) {
    try {
      // First get the categories
      const { data: categories, error } = await supabase
        .from(this.tableName)
        .select('id, name, description, section_id, icon, display_order, created_at, updated_at')
        .eq('section_id', sectionId)
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      // Then for each category, get its study guides
      for (const category of categories) {
        const { data: studyGuides, error: studyGuidesError } = await supabase
          .from('v2_study_guides')
          .select('*')
          .eq('category_id', category.id)
          .order('display_order', { nullsLast: true });

        if (studyGuidesError) {
          console.error('Error fetching study guides for category:', studyGuidesError.message);
          category.v2_study_guides = [];
        } else {
          category.v2_study_guides = studyGuides;
        }
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories by section ID:', error.message);
      throw error;
    }
  }

  /**
   * Get all categories with their study guides
   * @returns {Promise<Array>} - Categories with study guides
   */
  async getAllWithStudyGuides() {
    try {
      // First get all categories
      const { data: categories, error } = await supabase
        .from(this.tableName)
        .select('id, name, description, section_id, icon, display_order, created_at, updated_at')
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      // Get all sections
      const { data: sections, error: sectionsError } = await supabase
        .from('v2_sections')
        .select('*');

      if (sectionsError) {
        throw sectionsError;
      }

      // Create a map of section IDs to sections for quick lookup
      const sectionsMap = {};
      sections.forEach(section => {
        sectionsMap[section.id] = section;
      });

      // For each category, get its study guides and add section info
      for (const category of categories) {
        // Add section info
        category.v2_sections = sectionsMap[category.section_id];

        // Get study guides
        const { data: studyGuides, error: studyGuidesError } = await supabase
          .from('v2_study_guides')
          .select('*')
          .eq('category_id', category.id)
          .order('display_order', { nullsLast: true });

        if (studyGuidesError) {
          console.error('Error fetching study guides for category:', studyGuidesError.message);
          category.v2_study_guides = [];
        } else {
          category.v2_study_guides = studyGuides;
        }
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories with study guides:', error.message);
      throw error;
    }
  }

  /**
   * Create a new category
   * @param {Object} category - Category data
   * @param {string} category.name - Category name
   * @param {string} category.description - Category description
   * @param {string} category.section_id - Section ID
   * @returns {Promise<Object>} - Created category
   */
  async create(category) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([category])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating category:', error.message);
      throw error;
    }
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updates - Category updates
   * @returns {Promise<Object>} - Updated category
   */
  async update(id, updates) {
    try {
      // Just perform the update without any select
      await this.updateBasicInfo(id, updates);

      // Return the updates with the id
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating category:', error.message);
      throw error;
    }
  }

  /**
   * Update only the basic info of a category (name, description, icon)
   * This method doesn't try to fetch or return any data to avoid schema cache issues
   * @param {string} id - Category ID
   * @param {Object} updates - Category updates (name, description, icon)
   */
  async updateBasicInfo(id, updates) {
    // Create a new object with only the allowed fields
    const safeUpdates = {};
    if (updates.name !== undefined) safeUpdates.name = updates.name;
    if (updates.description !== undefined) safeUpdates.description = updates.description;
    if (updates.icon !== undefined) safeUpdates.icon = updates.icon;
    if (updates.section_id !== undefined) safeUpdates.section_id = updates.section_id;

    // Perform the update without any select
    const { error } = await supabase
      .from(this.tableName)
      .update(safeUpdates)
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  /**
   * Check if category has associated quiz questions
   * @param {string} id - Category ID
   * @returns {Promise<number>} - Number of associated quiz questions
   */
  async getQuestionCount(id) {
    try {
      const { count, error } = await supabase
        .from('v2_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting question count:', error.message);
      throw error;
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      // First check if there are any quiz questions associated with this category
      const questionCount = await this.getQuestionCount(id);

      if (questionCount > 0) {
        throw new Error(`Cannot delete category: ${questionCount} quiz question(s) are associated with this category. Please reassign or delete the questions first.`);
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting category:', error.message);
      throw error;
    }
  }
  /**
   * Update display order for multiple categories
   * @param {Array<Object>} updates - Array of updates
   * @param {string} updates[].id - Category ID
   * @param {number} updates[].display_order - New display order
   * @returns {Promise<void>}
   */
  async updateOrder(updates) {
    try {
      // Process each update sequentially to ensure proper ordering
      for (const { id, display_order } of updates) {
        const { error } = await supabase
          .from(this.tableName)
          .update({ display_order })
          .eq('id', id);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating category order:', error.message);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
