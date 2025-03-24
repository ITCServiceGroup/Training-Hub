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
   * Get categories by section
   * @param {string} section - Section name (e.g., 'install', 'service')
   * @returns {Promise<Array>} - Categories in the specified section
   */
  async getBySection(section) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('section', section)
        .order('name');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching categories by section:', error.message);
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
          v2_study_guides(*)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching categories with study guides:', error.message);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
