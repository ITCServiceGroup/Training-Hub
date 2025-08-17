import { BaseService } from './base';
import { supabase } from '../../config/supabase';

/**
 * Study Guides service for interacting with study_guides table
 */
class StudyGuidesService extends BaseService {
  constructor() {
    super('study_guides');
  }

  /**
   * Get study guides by category
   * @param {string} categoryId - Category ID
   * @param {boolean} publishedOnly - Whether to return only published study guides
   * @returns {Promise<Array>} - Study guides in the specified category
   */
  async getByCategoryId(categoryId, publishedOnly = false) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('category_id', categoryId);

      // If publishedOnly is true, only return published study guides
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query.order('display_order');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching study guides by category:', error.message);
      throw error;
    }
  }

  /**
   * Get study guide with category details
   * @param {string} id - Study guide ID
   * @returns {Promise<Object>} - Study guide with category details
   */
  async getWithCategory(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching study guide with category:', error.message);
      throw error;
    }
  }

  /**
   * Create a new study guide
   * @param {Object} studyGuide - Study guide data
   * @param {string} studyGuide.title - Study guide title
   * @param {string} studyGuide.content - Study guide content
   * @param {string} studyGuide.category_id - Category ID
   * @param {number} studyGuide.display_order - Display order
   * @returns {Promise<Object>} - Created study guide
   */
  async create(studyGuide) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([studyGuide])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating study guide:', error.message);
      throw error;
    }
  }

  /**
   * Update a study guide
   * @param {string} id - Study guide ID
   * @param {Object} updates - Study guide updates
   * @returns {Promise<Object>} - Updated study guide
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
      console.error('Error updating study guide:', error.message);
      throw error;
    }
  }

  /**
   * Update display order for multiple study guides
   * @param {Array<Object>} updates - Array of updates
   * @param {string} updates[].id - Study guide ID
   * @param {number} updates[].display_order - New display order
   * @returns {Promise<void>}
   */
  async updateOrder(updates) {
    try {
      // Process each update sequentially to ensure proper ordering
      for (const { id, display_order } of updates) {
        const { error } = await supabase
          .from(this.tableName)
          .update({ display_order })
          .eq('id', id);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating study guide order:', error.message);
      throw error;
    }
  }

  /**
   * Delete a study guide
   * @param {string} id - Study guide ID
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
      console.error('Error deleting study guide:', error.message);
      throw error;
    }
  }

  /**
   * Get the total count of study guides
   * @returns {Promise<number>} - Total number of study guides
   */
  async getCount() {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });
      if (error) {
        throw error;
      }
      return count || 0;
    } catch (error) {
      console.error('Error getting study guide count:', error.message);
      return 0;
    }
  }

  /**
   * Copy a study guide to the same or different category
   * @param {string} id - Study guide ID to copy
   * @param {string} targetCategoryId - Target category ID
   * @returns {Promise<Object>} - Newly created study guide
   */
  async copyStudyGuide(id, targetCategoryId) {
    try {
      // First get the study guide to copy
      const { data: studyGuide, error: fetchError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Get the highest display order in the target category
      const { data: categoryGuides, error: orderError } = await supabase
        .from(this.tableName)
        .select('display_order')
        .eq('category_id', targetCategoryId)
        .order('display_order', { ascending: false })
        .limit(1);

      if (orderError) {
        throw orderError;
      }

      const highestOrder = categoryGuides.length > 0 ? categoryGuides[0].display_order : -1;
      const newDisplayOrder = highestOrder + 1;

      // Create a new study guide with copied content
      const newStudyGuide = {
        title: `${studyGuide.title} (Copy)`,
        content: studyGuide.content,
        category_id: targetCategoryId,
        display_order: newDisplayOrder
      };

      const { data: createdGuide, error: createError } = await supabase
        .from(this.tableName)
        .insert([newStudyGuide])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return createdGuide;
    } catch (error) {
      console.error('Error copying study guide:', error.message);
      throw error;
    }
  }

  /**
   * Move a study guide to a different category
   * @param {string} id - Study guide ID to move
   * @param {string} targetCategoryId - Target category ID
   * @returns {Promise<Object>} - Updated study guide
   */
  async moveStudyGuide(id, targetCategoryId) {
    try {
      // Get the highest display order in the target category
      const { data: categoryGuides, error: orderError } = await supabase
        .from(this.tableName)
        .select('display_order')
        .eq('category_id', targetCategoryId)
        .order('display_order', { ascending: false })
        .limit(1);

      if (orderError) {
        throw orderError;
      }

      const highestOrder = categoryGuides.length > 0 ? categoryGuides[0].display_order : -1;
      const newDisplayOrder = highestOrder + 1;

      // Update the study guide with the new category and display order
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          category_id: targetCategoryId,
          display_order: newDisplayOrder
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error moving study guide:', error.message);
      throw error;
    }
  }

  /**
   * Toggle the publish status of a study guide
   * @param {string} id - Study guide ID
   * @param {boolean} isPublished - New publish status
   * @returns {Promise<Object>} - Updated study guide
   */
  async togglePublishStatus(id, isPublished) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error toggling study guide publish status:', error.message);
      throw error;
    }
  }

  /**
   * Update the linked quiz for a study guide
   * @param {string} id - Study guide ID
   * @param {string|null} quizId - Quiz ID to link, or null to unlink
   * @returns {Promise<Object>} - Updated study guide
   */
  async updateLinkedQuiz(id, quizId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ linked_quiz_id: quizId })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating study guide linked quiz:', error.message);
      throw error;
    }
  }

  /**
   * Get all published study guides for quiz linking dropdown
   * @returns {Promise<Array>} - Published study guides with basic info
   */
  async getPublishedForQuizLinking() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          id,
          title,
          categories(
            id,
            name,
            sections(
              id,
              name
            )
          )
        `)
        .eq('is_published', true)
        .order('title');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching published study guides for quiz linking:', error.message);
      throw error;
    }
  }

  /**
   * Check if a study guide has a conflicting quiz link
   * @param {string} studyGuideId - Study guide ID to check
   * @param {string} newQuizId - New quiz ID that we want to link to
   * @returns {Promise<Object>} - Conflict information { hasConflict: boolean, existingQuizTitle?: string, existingQuizId?: string }
   */
  async checkQuizLinkConflict(studyGuideId, newQuizId) {
    try {
      // First get the study guide to see if it has an existing link
      const { data: studyGuide, error: studyGuideError } = await supabase
        .from(this.tableName)
        .select('linked_quiz_id')
        .eq('id', studyGuideId)
        .single();

      if (studyGuideError) {
        throw studyGuideError;
      }

      // If no existing link, no conflict
      if (!studyGuide.linked_quiz_id) {
        return { hasConflict: false };
      }

      // If existing link is the same as new quiz, no conflict
      if (studyGuide.linked_quiz_id === newQuizId) {
        return { hasConflict: false };
      }

      // Get the title of the existing linked quiz
      const { data: existingQuiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('id', studyGuide.linked_quiz_id)
        .single();

      if (quizError) {
        // If we can't get quiz details, just return conflict without details
        console.warn('Could not fetch existing quiz details:', quizError.message);
        return { 
          hasConflict: true, 
          existingQuizId: studyGuide.linked_quiz_id,
          existingQuizTitle: 'Unknown Quiz' 
        };
      }

      return {
        hasConflict: true,
        existingQuizId: existingQuiz.id,
        existingQuizTitle: existingQuiz.title
      };
    } catch (error) {
      console.error('Error checking quiz link conflict:', error.message);
      throw error;
    }
  }
}

export const studyGuidesService = new StudyGuidesService();
