import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Sections service for interacting with v2_sections table
 */
class SectionsService extends BaseService {
  constructor() {
    super('v2_sections');
  }

  /**
   * Get all sections
   * @returns {Promise<Array>} - All sections
   */
  async getAllSections() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching sections:', error.message);
      throw error;
    }
  }

  /**
   * Get sections with their categories
   * @returns {Promise<Array>} - Sections with categories
   */
  async getSectionsWithCategories() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          v2_categories(*)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching sections with categories:', error.message);
      throw error;
    }
  }

  /**
   * Create a new section
   * @param {Object} section - Section data
   * @param {string} section.name - Section name
   * @param {string} section.description - Section description
   * @returns {Promise<Object>} - Created section
   */
  async create(section) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([section])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating section:', error.message);
      throw error;
    }
  }

  /**
   * Update a section
   * @param {string} id - Section ID
   * @param {Object} updates - Section updates
   * @returns {Promise<Object>} - Updated section
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
      console.error('Error updating section:', error.message);
      throw error;
    }
  }

  /**
   * Delete a section
   * @param {string} id - Section ID
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
      console.error('Error deleting section:', error.message);
      throw error;
    }
  }
}

export const sectionsService = new SectionsService();
