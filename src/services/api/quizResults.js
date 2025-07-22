import { BaseService } from './base';
import { supabase } from '../../config/supabase';

class QuizResultsService extends BaseService {
  constructor() {
    super('Quiz Results');
  }

  /**
   * Get filtered quiz results
   * @param {Object} filters - Filter parameters
   * @param {boolean} includeQuizMetadata - Whether to include quiz metadata (passing_score, etc.)
   * @returns {Promise<Array>} - Filtered quiz results
   */
  async getFilteredResults({
    startDate,
    endDate,
    supervisors,
    ldaps,
    markets,
    quizTypes,
    minScore,
    maxScore,
    minTime,
    maxTime,
    sortField = 'date_of_test',
    sortOrder = 'desc',
    includeQuizMetadata = false
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
        console.log('Filtering by supervisors:', supervisors);
        query = query.in('supervisor', supervisors);
      }
      if (ldaps?.length) {
        query = query.in('ldap', ldaps);
      }
      if (markets?.length) {
        query = query.in('market', markets);
      }
      if (quizTypes?.length) {
        query = query.in('quiz_type', quizTypes);
      }
      if (minScore !== null && minScore !== undefined) {
        query = query.gte('score_value', minScore); // Revert: Expect 0-1
      }
      if (maxScore !== null && maxScore !== undefined) {
        query = query.lte('score_value', maxScore); // Revert: Expect 0-1
      }
      if (minTime !== null && minTime !== undefined) {
        query = query.gte('time_taken', minTime);
      }
      if (maxTime !== null && maxTime !== undefined) {
        query = query.lte('time_taken', maxTime);
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Log the query details
      console.log('Query details:', {
        raw_sql: query.toSQL ? query.toSQL() : 'Could not get SQL', // Add check for toSQL method
        filters: {
          startDate,
          endDate,
          supervisors,
          ldaps,
          markets,
          quizTypes,
          minScore,
          maxScore,
          minTime,
          maxTime,
          sortField,
          sortOrder
        }
      });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // If quiz metadata was requested, fetch it separately
      if (includeQuizMetadata && data && data.length > 0) {
        try {
          // First try to use quiz_id if available
          const quizIds = [...new Set(data.map(result => result.quiz_id).filter(Boolean))];
          // If no quiz_id, try to match by quiz_type (title)
          if (quizIds.length === 0) {
            const quizTypes = [...new Set(data.map(result => result.quiz_type).filter(Boolean))];
            
            if (quizTypes.length > 0) {
              // Fetch quiz metadata by matching titles
              const { data: quizData, error: quizError } = await supabase
                .from('v2_quizzes')
                .select('id, title, passing_score')
                .in('title', quizTypes);

              if (!quizError && quizData) {
                // Create a lookup map for quiz metadata by title
                const quizMap = {};
                quizData.forEach(quiz => {
                  quizMap[quiz.title] = quiz;
                });

                // Merge quiz metadata into results using quiz_type
                const enrichedData = data.map(result => ({
                  ...result,
                  quiz_title: result.quiz_type,
                  passing_threshold: quizMap[result.quiz_type]?.passing_score || 0.7, // Default to 70% if missing
                }));
                
                return enrichedData;
              }
            }
          } else {
            // Original logic for quiz_id
            const { data: quizData, error: quizError } = await supabase
              .from('v2_quizzes')
              .select('id, title, passing_score')
              .in('id', quizIds);

            if (!quizError && quizData) {
              // Create a lookup map for quiz metadata
              const quizMap = {};
              quizData.forEach(quiz => {
                quizMap[quiz.id] = quiz;
              });

              // Merge quiz metadata into results
              const enrichedData = data.map(result => ({
                ...result,
                quiz_title: quizMap[result.quiz_id]?.title || null,
                passing_threshold: quizMap[result.quiz_id]?.passing_score || 0.7, // Default to 70% if missing
              }));
              
              return enrichedData;
            }
          }
          
        } catch (quizError) {
          console.warn('Failed to fetch quiz metadata, using defaults:', quizError);
        }

        // Fallback: add default passing threshold without quiz metadata
        return data.map(result => ({
          ...result,
          quiz_title: null,
          passing_threshold: 0.7 // Default to 70%
        }));
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
      console.log(`Fetching distinct values for column: ${column}`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .not(column, 'is', null);

      console.log('Raw data:', data);

      if (error) {
        throw error;
      }

      // Extract unique values
      const values = [...new Set(data.map(item => {
        console.log(`Processing item ${column}:`, item[column]);
        return item[column];
      }))];
      console.log('Unique values:', values);
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
