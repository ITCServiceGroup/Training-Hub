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
   * Submit a new quiz result
   * @param {Object} result - Quiz result data
   * @returns {Promise<Object>} - Created quiz result
   */
  async submitResult(result) {
    try {
      // Validate required fields
      if (!result.quiz_id || 
          !result.user_identifier || 
          result.score_value === undefined || 
          !result.score_text || 
          !result.answers) {
        throw new Error('Missing required quiz result fields');
      }

      return this.create(result);
    } catch (error) {
      console.error('Error submitting quiz result:', error.message);
      throw error;
    }
  }

  /**
   * Get results for a specific quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} - Quiz results
   */
  async getByQuizId(quizId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching quiz results:', error.message);
      throw error;
    }
  }

  /**
   * Get results by user identifier
   * @param {string} userIdentifier - User identifier (e.g., LDAP)
   * @returns {Promise<Array>} - Quiz results for the user
   */
  async getByUserIdentifier(userIdentifier) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          v2_quizzes(title, description)
        `)
        .eq('user_identifier', userIdentifier)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching results by user:', error.message);
      throw error;
    }
  }

  /**
   * Get aggregate statistics for a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} - Quiz statistics
   */
  async getQuizStatistics(quizId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('quiz_id', quizId);

      if (error) {
        throw error;
      }

      // Calculate statistics
      if (!data || data.length === 0) {
        return {
          count: 0,
          avgScore: 0,
          minScore: 0,
          maxScore: 0,
          passingCount: 0,
          passingRate: 0
        };
      }

      const scores = data.map(result => parseFloat(result.score_value));
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      
      // Assuming passing score is 70%
      const passingCount = scores.filter(score => score >= 70).length;
      const passingRate = (passingCount / scores.length) * 100;

      return {
        count: data.length,
        avgScore: avgScore.toFixed(2),
        minScore,
        maxScore,
        passingCount,
        passingRate: passingRate.toFixed(2)
      };
    } catch (error) {
      console.error('Error fetching quiz statistics:', error.message);
      throw error;
    }
  }
}

export const quizResultsService = new QuizResultsService();
