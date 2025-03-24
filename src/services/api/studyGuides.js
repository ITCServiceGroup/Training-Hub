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
  async getByCategory(categoryId) {
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
}

export const studyGuidesService = new StudyGuidesService();
