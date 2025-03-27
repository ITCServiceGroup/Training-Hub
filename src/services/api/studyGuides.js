import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Study Guides service for interacting with v2_study_guides table
 */
class StudyGuidesService extends BaseService {
  constructor() {
    super('v2_study_guides');
  }

  /**
   * Get study guides by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} - Study guides in the specified category
   */
  async getByCategoryId(categoryId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching study guides by category:', error.message);
      throw error;
    }
  }

  /**
   * Get study guide with category details
   * @param {string} id - Study guide ID
   * @returns {Promise<Object>} - Study guide with category details
   */
  async getWithCategory(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          v2_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching study guide with category:', error.message);
      throw error;
    }
  }

  /**
   * Create a new study guide
   * @param {Object} studyGuide - Study guide data
   * @param {string} studyGuide.title - Study guide title
   * @param {string} studyGuide.content - Study guide content
   * @param {string} studyGuide.category_id - Category ID
   * @param {number} studyGuide.display_order - Display order
   * @returns {Promise<Object>} - Created study guide
   */
  async create(studyGuide) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([studyGuide])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating study guide:', error.message);
      throw error;
    }
  }

  /**
   * Update a study guide
   * @param {string} id - Study guide ID
   * @param {Object} updates - Study guide updates
   * @returns {Promise<Object>} - Updated study guide
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
      console.error('Error updating study guide:', error.message);
      throw error;
    }
  }

  /**
   * Update display order for multiple study guides
   * @param {Array<Object>} updates - Array of updates
   * @param {string} updates[].id - Study guide ID
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
      console.error('Error updating study guide order:', error.message);
      throw error;
    }
  }

  /**
   * Delete a study guide
   * @param {string} id - Study guide ID
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
      console.error('Error deleting study guide:', error.message);
      throw error;
    }
  }
}

export const studyGuidesService = new StudyGuidesService();
