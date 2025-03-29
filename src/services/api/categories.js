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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, v2_sections(*)')
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching all categories:', error.message);
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          v2_study_guides(*)
        `)
        .eq('section_id', sectionId)
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      return data;
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          v2_sections(*),
          v2_study_guides(*)
        `)
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      return data;
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
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating category:', error.message);
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
