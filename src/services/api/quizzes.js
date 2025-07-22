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
   * Get all active quizzes with their question count, category details, and section details.
   * @returns {Promise<Array>} - Quizzes with nested category and section information.
   */
  async getAllWithQuestionCount() {
    try {
      // 1. Fetch all active quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from(this.tableName)
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;
      if (!quizzes || quizzes.length === 0) return [];

      // 2. Extract all unique category IDs from all quizzes
      const allCategoryIds = quizzes.reduce((acc, quiz) => {
        const ids = typeof quiz.category_ids === 'string' 
          ? JSON.parse(quiz.category_ids) 
          : quiz.category_ids || [];
        return [...new Set([...acc, ...ids])];
      }, []);

      if (allCategoryIds.length === 0) {
        // Return quizzes with empty categories and 0 question count if no categories are linked
        return quizzes.map(quiz => ({ ...quiz, questionCount: 0, categories: [] }));
      }

      // 3. Fetch all relevant categories including section_id
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('v2_categories')
        .select('id, name, section_id')
        .in('id', allCategoryIds);

      if (categoriesError) throw categoriesError;

      // 4. Extract unique section IDs from categories
      const allSectionIds = [...new Set(categoriesData.map(cat => cat.section_id).filter(Boolean))];

      // 5. Fetch relevant sections
      let sectionsMap = {};
      if (allSectionIds.length > 0) {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('v2_sections')
          .select('id, name')
          .in('id', allSectionIds);

        if (sectionsError) throw sectionsError;
        sectionsMap = sectionsData.reduce((map, section) => {
          map[section.id] = section;
          return map;
        }, {});
      }
      
      // 6. Create a map for categories for quick lookup
      const categoriesMap = categoriesData.reduce((map, category) => {
        map[category.id] = {
          ...category,
          section: sectionsMap[category.section_id] || null // Embed section info
        };
        return map;
      }, {});

      // 7. Get actual question counts for each quiz from the junction table
      const quizIds = quizzes.map(quiz => quiz.id);
      const { data: quizQuestionCounts, error: countError } = await supabase
        .from('v2_quiz_questions')
        .select('quiz_id')
        .in('quiz_id', quizIds);

      if (countError) {
          console.warn('Could not count quiz questions:', countError.message);
          // We can proceed but counts might be inaccurate or missing
      }

      // Create a map of quiz_id to question count
      const questionCountMap = {};
      if (quizQuestionCounts) {
        quizQuestionCounts.forEach(relation => {
          questionCountMap[relation.quiz_id] = (questionCountMap[relation.quiz_id] || 0) + 1;
        });
      }

      // 8. Combine data for each quiz
      const enhancedQuizzes = quizzes.map(quiz => {
        const categoryIds = typeof quiz.category_ids === 'string'
          ? JSON.parse(quiz.category_ids)
          : quiz.category_ids || [];

        const quizCategories = categoryIds
          .map(id => categoriesMap[id])
          .filter(Boolean); // Filter out potential nulls if a category wasn't found

        // Use the actual count of questions assigned to this specific quiz
        const actualQuestionCount = questionCountMap[quiz.id] || 0;

        return {
          ...quiz,
          questionCount: actualQuestionCount, // Using the actual quiz question count
          categories: quizCategories, // Embed full category and section info
        };
      });

      return enhancedQuizzes;
    } catch (error) {
      console.error('Error fetching quizzes with category and section details:', error.message);
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
        .is('archived_at', null) // Only fetch non-archived practice quizzes
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
        .is('archived_at', null) // Only fetch non-archived quizzes
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
   * Count practice quizzes by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} - Count of practice quizzes in the specified category
   */
  async countPracticeQuizzesByCategory(categoryId) {
    try {
      // Get all practice quizzes and filter in JavaScript since JSONB array contains is tricky
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category_ids')
        .or('is_practice.eq.true,has_practice_mode.eq.true')
        .is('archived_at', null);

      if (error) {
        throw error;
      }

      // Filter by category ID in JavaScript
      const count = data.filter(quiz => {
        const categoryIds = typeof quiz.category_ids === 'string'
          ? JSON.parse(quiz.category_ids)
          : quiz.category_ids || [];
        return categoryIds.includes(categoryId);
      }).length;

      return count;
    } catch (error) {
      console.error('Error counting practice quizzes by category:', error.message);
      return 0;
    }
  }

  /**
   * Get all archived quizzes.
   * @returns {Promise<Array>} - Archived quizzes.
   */
  async getArchivedQuizzes() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .not('archived_at', 'is', null) // Filter for quizzes where archived_at is NOT null
        .order('archived_at', { ascending: false }); // Order by archive date

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching archived quizzes:', error.message);
      throw error;
    }
  }

  /**
   * Restore an archived quiz by setting archived_at to null.
   * @param {string} id - Quiz ID to restore
   * @returns {Promise<Object>} - The updated (restored) quiz data
   */
  async restore(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ archived_at: null }) // Set archived_at to null
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error restoring quiz ${id}:`, error.message);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Exception during quiz restore:', error.message);
      throw error;
    }
  }


  /**
   * Get quizzes that contain specific questions
   * @param {Array<string>} questionIds - Array of question IDs
   * @returns {Promise<Object>} - Object mapping question IDs to arrays of quiz titles
   */
  async getQuizzesForQuestions(questionIds) {
    try {
      if (!questionIds || questionIds.length === 0) {
        return {};
      }

      // Get quiz-question relationships for the specified questions
      const { data: relations, error: relationsError } = await supabase
        .from('v2_quiz_questions')
        .select(`
          question_id,
          quiz_id,
          v2_quizzes!inner(id, title, archived_at)
        `)
        .in('question_id', questionIds);

      if (relationsError) throw relationsError;

      // Filter out archived quizzes and group by question ID
      const questionQuizMap = {};

      relations.forEach(relation => {
        // Skip archived quizzes
        if (relation.v2_quizzes.archived_at) return;

        const questionId = relation.question_id;
        const quizTitle = relation.v2_quizzes.title;

        if (!questionQuizMap[questionId]) {
          questionQuizMap[questionId] = [];
        }

        questionQuizMap[questionId].push(quizTitle);
      });

      return questionQuizMap;
    } catch (error) {
      console.error('Error fetching quizzes for questions:', error.message);
      throw error;
    }
  }

  /**
   * Archive a quiz (soft delete) by setting the archived_at timestamp.
   * Overrides the BaseService delete method.
   * @param {string} id - Quiz ID to archive
   * @returns {Promise<Object>} - The updated (archived) quiz data
   */
  async delete(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error archiving quiz ${id}:`, error.message);
        throw error;
      }
      // Return the updated record to confirm archival
      return data;
    } catch (error) {
      // Catch potential exceptions during the update process
      console.error('Exception during quiz archive:', error.message);
      throw error;
    }
  }

  /**
   * Validate and clean up invalid category references in a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} - Updated quiz with valid category IDs
   */
  async validateAndCleanupCategories(quizId) {
    try {
      // Get the quiz
      const { data: quiz, error: quizError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      if (!quiz) throw new Error('Quiz not found');

      const categoryIds = typeof quiz.category_ids === 'string'
        ? JSON.parse(quiz.category_ids)
        : quiz.category_ids || [];

      if (categoryIds.length === 0) {
        return quiz; // No categories to validate
      }

      // Check which categories actually exist
      const { data: existingCategories, error: categoriesError } = await supabase
        .from('v2_categories')
        .select('id')
        .in('id', categoryIds);

      if (categoriesError) throw categoriesError;

      const existingCategoryIds = existingCategories.map(cat => cat.id);
      const validCategoryIds = categoryIds.filter(id => existingCategoryIds.includes(id));

      // If some categories were invalid, update the quiz
      if (validCategoryIds.length !== categoryIds.length) {
        const { data: updatedQuiz, error: updateError } = await supabase
          .from(this.tableName)
          .update({ category_ids: validCategoryIds })
          .eq('id', quizId)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedQuiz;
      }

      return quiz;
    } catch (error) {
      console.error('Error validating quiz categories:', error.message);
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
      // Get the *active* quiz
      const { data: quiz, error: quizError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .is('archived_at', null) // Ensure the quiz is not archived
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

  /**
   * Get content linked to a specific quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} - Content linked to the quiz
   */
  async getLinkedStudyGuides(quizId) {
    try {
      const { data, error } = await supabase
        .from('v2_study_guides')
        .select(`
          id,
          title,
          v2_categories(
            id,
            name,
            v2_sections(
              id,
              name
            )
          )
        `)
        .eq('linked_quiz_id', quizId)
        .eq('is_published', true)
        .order('title');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching linked content:', error.message);
      throw error;
    }
  }
}

export const quizzesService = new QuizzesService();
