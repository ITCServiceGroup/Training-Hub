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
   * Create a new quiz with questions
   * @param {Object} quiz - Quiz data including questions array
   * @returns {Promise<Object>} - Created quiz
   */
  async create(quiz) {
    const { questions, ...quizData } = quiz;
    
    try {
      // Start a Supabase transaction
      const { data: createdQuiz, error: quizError } = await supabase
        .from(this.tableName)
        .insert([{
          ...quizData,
          category_ids: Array.isArray(quizData.category_ids) ? quizData.category_ids : []
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // If there are questions, create the relationships
      if (questions && questions.length > 0) {
        const questionRelations = questions.map((questionId, index) => ({
          quiz_id: createdQuiz.id,
          question_id: questionId,
          order_index: index
        }));

        const { error: relationsError } = await supabase
          .from('v2_quiz_questions')
          .insert(questionRelations);

        if (relationsError) throw relationsError;
      }

      // Return the quiz with its questions
      return await this.getWithQuestions(createdQuiz.id);
    } catch (error) {
      console.error('Error creating quiz:', error.message);
      throw error;
    }
  }

  /**
   * Update a quiz and its questions
   * @param {string} id - Quiz ID
   * @param {Object} updates - Quiz updates including questions array
   * @returns {Promise<Object>} - Updated quiz
   */
  async update(id, updates) {
    const { questions, ...quizData } = updates;

    try {
      // Update quiz data
      const { error: quizError } = await supabase
        .from(this.tableName)
        .update({
          ...quizData,
          category_ids: Array.isArray(quizData.category_ids) ? quizData.category_ids : []
        })
        .eq('id', id);

      if (quizError) throw quizError;

      // Delete existing question relationships
      const { error: deleteError } = await supabase
        .from('v2_quiz_questions')
        .delete()
        .eq('quiz_id', id);

      if (deleteError) throw deleteError;

      // Create new question relationships
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => typeof q === 'string' ? q : q.id).filter(Boolean);
        const questionRelations = questionIds.map((questionId, index) => ({
          quiz_id: id,
          question_id: questionId,
          order_index: index
        }));

        const { error: relationsError } = await supabase
          .from('v2_quiz_questions')
          .insert(questionRelations);

        if (relationsError) {
          console.error('Error creating question relations:', relationsError);
          throw new Error('Failed to link questions to quiz');
        }
      }

      // Return the updated quiz with its questions
      return await this.getWithQuestions(id);
    } catch (error) {
      console.error('Error updating quiz:', error.message);
      throw error;
    }
  }

  /**
   * Get practice quizzes
   * @returns {Promise<Array>} - Practice quizzes
   */
  async getPracticeQuizzes() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_practice', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching practice quizzes:', error.message);
      throw error;
    }
  }

  /**
   * Get quizzes by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} - Quizzes in the specified category
   */
  async getByCategoryId(categoryId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .contains('category_ids', [categoryId])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching quizzes by category:', error.message);
      throw error;
    }
  }

  /**
   * Get a quiz with its associated questions
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} - Quiz with questions
   */
  async getWithQuestions(id) {
    try {
      // Get the quiz
      const { data: quiz, error: quizError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;
      if (!quiz) throw new Error('Quiz not found');

      // Get the quiz's questions through the junction table
      const { data: relations, error: relationsError } = await supabase
        .from('v2_quiz_questions')
        .select('question_id, order_index')
        .eq('quiz_id', id)
        .order('order_index');

      if (relationsError) throw relationsError;

      // Get the actual questions if there are any relations
      let questions = [];
      if (relations && relations.length > 0) {
        const questionIds = relations.map(r => r.question_id);
        const { data: questionsData, error: questionsError } = await supabase
          .from('v2_questions')
          .select('*')
          .in('id', questionIds);

        if (questionsError) throw questionsError;

        // Sort questions according to the order_index
        questions = relations.map(rel => {
          const question = questionsData.find(q => q.id === rel.question_id);
          return question;
        }).filter(Boolean);
      }

      return {
        ...quiz,
        questions
      };
    } catch (error) {
      console.error('Error fetching quiz with questions:', error.message);
      throw error;
    }
  }
}

export const quizzesService = new QuizzesService();
