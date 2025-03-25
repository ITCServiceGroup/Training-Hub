import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Quiz Results service for interacting with v2_quiz_results table
 */
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
    sortField = 'date_of_test',
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

      // Apply sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

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
   * Get total count of quiz results
   * @returns {Promise<number>} - Total count
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
      console.error('Error fetching total count:', error);
      throw error;
    }
  }

  /**
   * Get recent quiz results
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} - Recent quiz results
   */
  async getRecentResults(limit = 5) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('date_of_test', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching recent results:', error);
      throw error;
    }
  }
}

export const quizResultsService = new QuizResultsService();
