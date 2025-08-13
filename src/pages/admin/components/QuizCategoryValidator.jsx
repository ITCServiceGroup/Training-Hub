import React, { useState, useEffect } from 'react';
import { quizzesService } from '../../../services/api/quizzes';
import { categoriesService } from '../../../services/api/categories';
import { supabase } from '../../../config/supabase';

const QuizCategoryValidator = () => {
  const [quizzesWithIssues, setQuizzesWithIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);

  useEffect(() => {
    checkQuizCategories();
  }, []);

  const checkQuizCategories = async () => {
    try {
      setIsLoading(true);
      
      // Get all quizzes
      const { data: allQuizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .is('archived_at', null);

      if (quizzesError) throw quizzesError;

      // Get all existing categories
      const allCategories = await categoriesService.getAll();
      const existingCategoryIds = allCategories.map(cat => cat.id);

      // Check each quiz for invalid category references
      const problematicQuizzes = [];
      
      for (const quiz of allQuizzes) {
        const categoryIds = typeof quiz.category_ids === 'string'
          ? JSON.parse(quiz.category_ids)
          : quiz.category_ids || [];

        const invalidCategoryIds = categoryIds.filter(id => !existingCategoryIds.includes(id));
        
        if (invalidCategoryIds.length > 0) {
          problematicQuizzes.push({
            ...quiz,
            invalidCategoryIds,
            validCategoryIds: categoryIds.filter(id => existingCategoryIds.includes(id))
          });
        }
      }

      setQuizzesWithIssues(problematicQuizzes);
    } catch (error) {
      console.error('Error checking quiz categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixQuizCategories = async () => {
    try {
      setIsFixing(true);
      let fixed = 0;

      for (const quiz of quizzesWithIssues) {
        try {
          await quizzesService.validateAndCleanupCategories(quiz.id);
          fixed++;
        } catch (error) {
          console.error(`Error fixing quiz ${quiz.id}:`, error);
        }
      }

      setFixedCount(fixed);
      // Recheck after fixing
      await checkQuizCategories();
    } catch (error) {
      console.error('Error fixing quiz categories:', error);
    } finally {
      setIsFixing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Checking quiz categories...</div>
      </div>
    );
  }

  if (quizzesWithIssues.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quiz Category Validator
        </h2>
        <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-green-600 dark:text-green-400 font-medium">
            ✓ All quizzes have valid category references
          </div>
          <div className="text-sm text-green-500 dark:text-green-300 mt-1">
            No cleanup needed.
          </div>
          {fixedCount > 0 && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-2">
              Recently fixed {fixedCount} quiz(es).
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Quiz Category Validator
      </h2>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          ⚠️ {quizzesWithIssues.length} quiz(es) with invalid category references found
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          These quizzes reference categories that no longer exist. This can cause errors when editing quizzes.
        </div>
        <button
          onClick={fixQuizCategories}
          disabled={isFixing}
          className="py-2 px-4 bg-blue-600 border border-transparent rounded-md text-sm text-white cursor-pointer hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFixing ? 'Fixing...' : 'Fix All Issues'}
        </button>
      </div>

      {/* List of problematic quizzes */}
      <div className="space-y-4">
        {quizzesWithIssues.map(quiz => (
          <div key={quiz.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {quiz.title}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {quiz.id.substring(0, 8)}...
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {quiz.description || 'No description'}
            </div>
            
            <div className="text-sm">
              <div className="text-red-600 dark:text-red-400 mb-1">
                <strong>Invalid category IDs:</strong> {quiz.invalidCategoryIds.join(', ')}
              </div>
              {quiz.validCategoryIds.length > 0 && (
                <div className="text-green-600 dark:text-green-400">
                  <strong>Valid category IDs:</strong> {quiz.validCategoryIds.join(', ')}
                </div>
              )}
              {quiz.validCategoryIds.length === 0 && (
                <div className="text-orange-600 dark:text-orange-400">
                  <strong>Warning:</strong> This quiz will have no categories after cleanup
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizCategoryValidator;
