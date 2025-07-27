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
        return await this.enrichWithQuizMetadata(data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching filtered results:', error);
      throw error;
    }
  }

  /**
   * Enrich quiz results with metadata from v2_quizzes table
   * @param {Array} data - Raw quiz results data
   * @returns {Promise<Array>} - Enriched quiz results with metadata
   */
  async enrichWithQuizMetadata(data) {
    try {
      console.log('QuizResults: Starting metadata enrichment for', data.length, 'records');
      
      // Step 1: Get all unique quiz_ids (non-null)
      const quizIds = [...new Set(data.map(result => result.quiz_id).filter(Boolean))];
      console.log('QuizResults: Found', quizIds.length, 'unique quiz IDs:', quizIds);
      
      // Step 2: Fetch quiz metadata by ID
      let quizMap = {};
      if (quizIds.length > 0) {
        const { data: quizData, error: quizError } = await supabase
          .from('v2_quizzes')
          .select('id, title, passing_score')
          .in('id', quizIds);

        if (!quizError && quizData) {
          console.log('QuizResults: Retrieved quiz metadata:', quizData);
          quizData.forEach(quiz => {
            let passingScore = parseFloat(quiz.passing_score) || 0.7;
            // If passing_score is stored as percentage (80), convert to decimal (0.8)
            if (passingScore > 1) {
              passingScore = passingScore / 100;
            }
            quizMap[quiz.id] = {
              title: quiz.title,
              passing_score: passingScore // Ensure decimal format
            };
          });
        } else {
          console.error('QuizResults: Error fetching quiz metadata by ID:', quizError);
        }
      }

      // Step 3: For records without quiz_id, try to match by quiz_type (title)
      const recordsWithoutQuizId = data.filter(result => !result.quiz_id);
      if (recordsWithoutQuizId.length > 0) {
        const quizTypes = [...new Set(recordsWithoutQuizId.map(result => result.quiz_type).filter(Boolean))];
        console.log('QuizResults: Found', recordsWithoutQuizId.length, 'records without quiz_id, trying to match', quizTypes.length, 'quiz types');

        if (quizTypes.length > 0) {
          const { data: quizDataByTitle, error: titleError } = await supabase
            .from('v2_quizzes')
            .select('id, title, passing_score')
            .in('title', quizTypes);

          if (!titleError && quizDataByTitle) {
            console.log('QuizResults: Retrieved quiz metadata by title:', quizDataByTitle);
            quizDataByTitle.forEach(quiz => {
              let passingScore = parseFloat(quiz.passing_score) || 0.7;
              // If passing_score is stored as percentage (80), convert to decimal (0.8)
              if (passingScore > 1) {
                passingScore = passingScore / 100;
              }
              quizMap[`title_${quiz.title}`] = {
                title: quiz.title,
                passing_score: passingScore // Ensure decimal format
              };
            });
          }
        }
      }

      console.log('QuizResults: Final quiz metadata map:', quizMap);

      // Step 4: Enrich all records with metadata
      const enrichedData = data.map((result, index) => {
        let quizMetadata = null;
        
        // Try to match by quiz_id first
        if (result.quiz_id && quizMap[result.quiz_id]) {
          quizMetadata = quizMap[result.quiz_id];
        }
        // Fallback to title matching
        else if (result.quiz_type && quizMap[`title_${result.quiz_type}`]) {
          quizMetadata = quizMap[`title_${result.quiz_type}`];
        }

        const enriched = {
          ...result,
          quiz_title: quizMetadata?.title || result.quiz_type || 'Unknown Quiz',
          passing_score: quizMetadata?.passing_score || 0.7, // Clean decimal format
          has_quiz_metadata: !!quizMetadata
        };

        // Debug first few records
        if (index < 3) {
          console.log(`QuizResults: Record ${index + 1} enriched:`, {
            quiz_id: result.quiz_id,
            quiz_type: result.quiz_type,
            found_metadata: !!quizMetadata,
            final_passing_score: enriched.passing_score,
            quiz_title: enriched.quiz_title
          });
        }

        return enriched;
      });

      // Step 5: Summary statistics
      const stats = {
        total_records: enrichedData.length,
        with_metadata: enrichedData.filter(r => r.has_quiz_metadata).length,
        without_metadata: enrichedData.filter(r => !r.has_quiz_metadata).length,
        unique_quizzes: [...new Set(enrichedData.map(r => r.quiz_title))].length
      };
      console.log('QuizResults: Enrichment complete:', stats);

      return enrichedData;
    } catch (error) {
      console.error('QuizResults: Error during metadata enrichment:', error);
      
      // Fallback: return data with defaults
      return data.map(result => ({
        ...result,
        quiz_title: result.quiz_type || 'Unknown Quiz',
        passing_score: 0.7, // Default 70%
        has_quiz_metadata: false
      }));
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
