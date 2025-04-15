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
   * @param {number} limit - Maximum number of questions to return
   * @returns {Promise<Array>} - Questions from the specified categories
   */
  async getByCategoryIds(categoryIds, limit = 100) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('category_id', categoryIds)
        .limit(limit);

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
      console.error('Error updating question:', error.message);
      throw error;
    }
  }
}

export const questionsService = new QuestionsService();
