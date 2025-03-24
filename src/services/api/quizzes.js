import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Quizzes service for interacting with v2_quizzes table
 */
class QuizzesService extends BaseService {
  constructor() {
    super('v2_quizzes');
  }

  /**
   * Get quizzes with questions from selected categories
   * @returns {Promise<Array>} - Quizzes with information about included questions
   */
  async getAllWithQuestionCount() {
    try {
      // First, get all quizzes
      const { data: quizzes, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // For each quiz, count questions in its categories
      const enhancedQuizzes = await Promise.all(
        quizzes.map(async (quiz) => {
          // Parse category IDs if stored as JSON string
          const categoryIds = typeof quiz.category_ids === 'string' 
            ? JSON.parse(quiz.category_ids) 
            : quiz.category_ids;
            
          // Get categories
          const { data: categories, error: categoriesError } = await supabase
            .from('v2_categories')
            .select('name')
            .in('id', categoryIds);

          if (categoriesError) {
            console.error('Error fetching categories for quiz:', categoriesError.message);
            return {
              ...quiz,
              questionCount: 0,
              categories: []
            };
          }

          // Count questions in these categories
          const { count, error: countError } = await supabase
            .from('v2_questions')
            .select('*', { count: 'exact', head: true })
            .in('category_id', categoryIds);

          if (countError) {
            console.error('Error counting questions:', countError.message);
            return {
              ...quiz,
              questionCount: 0,
              categories: categories || []
            };
          }

          return {
            ...quiz,
            questionCount: count || 0,
            categories: categories || []
          };
        })
      );

      return enhancedQuizzes;
    } catch (error) {
      console.error('Error fetching quizzes with question count:', error.message);
      throw error;
    }
  }

  /**
   * Get a quiz with its full question set
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} - Quiz with questions
   */
  async getWithQuestions(id) {
    try {
      // Get the quiz
      const { data: quiz, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Parse category IDs if stored as JSON string
      const categoryIds = typeof quiz.category_ids === 'string' 
        ? JSON.parse(quiz.category_ids) 
        : quiz.category_ids;

      // Get questions for these categories
      const { data: questions, error: questionsError } = await supabase
        .from('v2_questions')
        .select('*')
        .in('category_id', categoryIds);

      if (questionsError) {
        throw questionsError;
      }

      return {
        ...quiz,
        questions: questions || []
      };
    } catch (error) {
      console.error('Error fetching quiz with questions:', error.message);
      throw error;
    }
  }
}

export const quizzesService = new QuizzesService();
