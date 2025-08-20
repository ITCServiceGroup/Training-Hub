import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Sections service for interacting with sections table
 */
class SectionsService extends BaseService {
  constructor() {
    super('sections');
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
        .order('display_order', { nullsLast: true });

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
   * Get a section by ID
   * @param {string} id - Section ID
   * @returns {Promise<Object>} - Section with the specified ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching section by ID:', error.message);
      throw error;
    }
  }

  /**
   * Get sections with their categories
   * @param {boolean} publishedOnly - Whether to return only published study guides
   * @returns {Promise<Array>} - Sections with categories
   */
  async getSectionsWithCategories(publishedOnly = false) {
    console.log('[Sections Service] Fetching sections with categories...');
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          categories (
            *,
            study_guides (
              id, category_id, title, description, is_published, display_order, updated_at
            )
          )
        `)
        // Order sections first, then categories within sections, then study guides within categories
        .order('display_order', { nullsLast: true })
        .order('display_order', { foreignTable: 'categories', nullsLast: true })
        .order('display_order', { foreignTable: 'categories.study_guides', nullsLast: true });

      // Execute the query
      const { data: fetchedData, error } = await query;

      if (error) {
        console.error('[Sections Service] Error fetching sections:', error);
        throw error;
      }

      // Create a new variable for the filtered data
      let processedData = fetchedData;

      if (publishedOnly && processedData) {
        // Filter to only include published study guides
        processedData = processedData.map(section => ({
          ...section,
          categories: section.categories.map(category => ({
            ...category,
            study_guides: category.study_guides.filter(guide => guide.is_published)
          }))
        }));
      }

      console.log('[Sections Service] Successfully fetched sections:', processedData?.length || 0, 'sections');
      return processedData;
    } catch (error) {
      console.error('[Sections Service] Error in getSectionsWithCategories:', error.message);
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
  /**
   * Update display order for multiple sections
   * @param {Array<Object>} updates - Array of updates
   * @param {string} updates[].id - Section ID
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
      console.error('Error updating section order:', error.message);
      throw error;
    }
  }
}

export const sectionsService = new SectionsService();
