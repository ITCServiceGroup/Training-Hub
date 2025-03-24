import { supabase } from '../../config/supabase';

/**
 * Base API service for Supabase database operations
 */
export class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Get all items from the table
   * @param {Object} options - Query options
   * @param {Object} options.filters - Filter conditions
   * @param {string} options.orderBy - Order by column
   * @param {boolean} options.ascending - Order direction
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of items
   */
  async getAll({ filters = {}, orderBy = 'created_at', ascending = false, limit = 100, offset = 0 } = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order(orderBy, { ascending })
        .limit(limit)
        .range(offset, offset + limit - 1);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching all from ${this.tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get an item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} - Item data
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
      console.error(`Error fetching ${this.tableName} by ID:`, error.message);
      throw error;
    }
  }

  /**
   * Create a new item
   * @param {Object} item - Item data
   * @returns {Promise<Object>} - Created item
   */
  async create(item) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(item)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Update an existing item
   * @param {string} id - Item ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} - Updated item
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
      console.error(`Error updating ${this.tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete an item
   * @param {string} id - Item ID
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
      console.error(`Error deleting ${this.tableName}:`, error.message);
      throw error;
    }
  }
}
