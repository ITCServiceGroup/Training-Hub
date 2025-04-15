import { BaseService } from './base';
import { supabase } from '../../config/supabase';

class QuizResultsService extends BaseService {
  constructor() {
    super('v2_quiz_results');
  }

  /**
   * Get filtered quiz results
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Filtered quiz results
   */
  async getFilteredResults({
    startDate,
    endDate,
    supervisors,
    ldaps,
    markets,
    minScore,
    maxScore,
    minTime,
    maxTime,
    sortField = 'created_at',
    sortOrder = 'desc'
  }) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (startDate) {
        query = query.gte('date_of_test', startDate);
      }
      if (endDate) {
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        query = query.lt('date_of_test', endDatePlusOne.toISOString().split('T')[0]);
      }
      if (supervisors?.length) {
        query = query.in('supervisor', supervisors);
      }
      if (ldaps?.length) {
        query = query.in('ldap', ldaps);
      }
      if (markets?.length) {
        query = query.in('market', markets);
      }
      if (minScore !== null && minScore !== undefined) {
        query = query.gte('score_value', minScore);
      }
      if (maxScore !== null && maxScore !== undefined) {
        query = query.lte('score_value', maxScore);
      }
      if (minTime !== null && minTime !== undefined) {
        query = query.gte('time_taken', minTime);
      }
      if (maxTime !== null && maxTime !== undefined) {
        query = query.lte('time_taken', maxTime);
      }

      // Handle sorting - map created_at to date_of_test
      const actualSortField = sortField === 'created_at' ? 'date_of_test' : sortField;
      query = query.order(actualSortField, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching filtered results:', error);
      throw error;
    }
  }

  /**
   * Get distinct values for a column
   * @param {string} column - Column name
   * @returns {Promise<Array>} - Distinct values
   */
  async getDistinctValues(column) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(column)
        .not(column, 'is', null);

      if (error) {
        throw error;
      }

      // Extract unique values
      const values = [...new Set(data.map(item => item[column]))];
      return values.sort();
    } catch (error) {
      console.error(`Error fetching distinct ${column} values:`, error);
      throw error;
    }
  }

  /**
   * Create a new quiz result
   * @param {Object} result - Quiz result data
   * @returns {Promise<Object>} - Created quiz result
   */
  async create(result) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([result])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating quiz result:', error.message);
      throw error;
    }
  }

  /**
   * Get results for a specific quiz type
   * @param {string} quizType - Quiz type
   * @returns {Promise<Array>} - Quiz results
   */
  async getByQuizId(quizType) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('quiz_type', quizType)
        .order('date_of_test', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching results by quiz type:', error.message);
      throw error;
    }
  }

  /**
   * Get results for a specific user
   * @param {string} ldap - LDAP username
   * @returns {Promise<Array>} - Quiz results
   */
  async getByUserIdentifier(ldap) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('ldap', ldap)
        .order('date_of_test', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching results by user identifier:', error.message);
      throw error;
    }
  }

  /**
   * Get total count of quiz results
   * @returns {Promise<number>} - Total count of quiz results
   */
  async getTotalCount() {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count;
    } catch (error) {
      console.error('Error getting total count:', error.message);
      throw error;
    }
  }

  /**
   * Get recent quiz results
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Recent quiz results
   */
  async getRecentResults(limit = 5) {
    try {
      console.log('Getting recent results with limit:', limit);
      const results = await this.getFilteredResults({
        sortField: 'date_of_test',
        sortOrder: 'desc'
      });

      console.log('Filtered results before slice:', results);
      const limitedResults = results.slice(0, limit);
      console.log('Limited results:', limitedResults);

      return limitedResults.map(result => {
        console.log('Processing result:', result);
        return {
          id: result.id,
          type: 'quiz_completion',
          user: result.ldap || '-',
          item: result.quiz_type || 'Quiz',
          date: result.date_of_test,
          score: result.score_text || '-'
        };
      });
    } catch (error) {
      console.error('Error in getRecentResults:', error);
      throw error;
    }
  }
}

export const quizResultsService = new QuizResultsService();
