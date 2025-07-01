import { BaseService } from './base';
import { supabase } from '../../config/supabase';

class QuestionsService extends BaseService {
  constructor() {
    super('v2_questions');
  }

  /**
   * Get a single question by ID
   * @param {string} id - Question ID
   * @returns {Promise<Object>} - Question data
   */
  async get(id) {
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
      console.error('Error fetching question:', error.message);
      throw error;
    }
  }

  /**
   * Get questions by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} - Questions in the specified category
   */
  async getByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching questions by category:', error.message);
      throw error;
    }
  }

  /**
   * Get questions by multiple categories
   * @param {Array<string>} categoryIds - Array of category IDs
   * @param {number} limit - Maximum number of questions to return (null for no limit)
   * @returns {Promise<Array>} - Questions from the specified categories
   */
  async getByCategoryIds(categoryIds, limit = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .in('category_id', categoryIds)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      // Only apply limit if specified
      if (limit !== null && limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching questions by category IDs:', error.message);
      throw error;
    }
  }

  /**
   * Get random questions from specified categories
   * @param {Array<string>} categoryIds - Array of category IDs
   * @param {number} count - Number of questions to return
   * @returns {Promise<Array>} - Random questions from the specified categories
   */
  async getRandomByCategoryIds(categoryIds, count = 10) {
    try {
      // Get all questions from the categories
      const { data: allQuestions, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('category_id', categoryIds);

      if (error) {
        throw error;
      }

      // Shuffle and limit to count
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error fetching random questions:', error.message);
      throw error;
    }
  }

  /**
   * Get orphaned questions (questions with null category_id)
   * @returns {Promise<Array>} - Orphaned questions
   */
  async getOrphaned() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .is('category_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orphaned questions:', error.message);
      throw error;
    }
  }

  /**
   * Get question count for categories in a section
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} - Total number of questions in the section
   */
  async getCountBySection(sectionId) {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .in('category_id',
          supabase
            .from('v2_categories')
            .select('id')
            .eq('section_id', sectionId)
        );

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting question count by section:', error.message);
      throw error;
    }
  }

  /**
   * Create a new question
   * @param {Object} question - Question data
   * @returns {Promise<Object>} - Created question
   */
  async create(question) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([question])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating question:', error.message);
      throw error;
    }
  }

  /**
   * Update a question
   * @param {string} id - Question ID
   * @param {Object} updates - Question updates
   * @returns {Promise<Object>} - Updated question
   */
  async update(id, updates) {
    try {
      // Ensure updated_at is set to current timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatesWithTimestamp)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating question:', error.message);
      throw error;
    }
  }

  /**
   * Move questions from one category to another
   * @param {Array<string>} questionIds - Array of question IDs to move
   * @param {string} newCategoryId - Target category ID
   * @returns {Promise<Array>} - Updated questions
   */
  async moveToCategory(questionIds, newCategoryId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ category_id: newCategoryId })
        .in('id', questionIds)
        .select();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error moving questions to category:', error.message);
      throw error;
    }
  }

  /**
   * Delete a question
   * @param {string} id - Question ID
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
      console.error('Error deleting question:', error.message);
      throw error;
    }
  }
}

export const questionsService = new QuestionsService();
