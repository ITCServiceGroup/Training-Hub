import React, { useState, useEffect } from 'react';
import { questionsService } from '../../../services/api/questions';
import { categoriesService } from '../../../services/api/categories';

const OrphanedQuestionsManager = () => {
  const [orphanedQuestions, setOrphanedQuestions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [questions, categories] = await Promise.all([
        getOrphanedQuestions(),
        categoriesService.getAllCategories()
      ]);
      setOrphanedQuestions(questions);
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Error loading orphaned questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrphanedQuestions = async () => {
    return await questionsService.getOrphaned();
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(orphanedQuestions.map(q => q.id));
  };

  const handleSelectNone = () => {
    setSelectedQuestions([]);
  };

  const handleAssignToCategory = async () => {
    if (!targetCategoryId || selectedQuestions.length === 0) return;

    try {
      setIsAssigning(true);
      await questionsService.moveToCategory(selectedQuestions, targetCategoryId);
      
      // Reload data to refresh the list
      await loadData();
      setSelectedQuestions([]);
      setTargetCategoryId('');
    } catch (error) {
      console.error('Error assigning questions to category:', error);
      alert('Failed to assign questions. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedQuestions.length === 0) return;
    
    if (!confirm(`Are you sure you want to permanently delete ${selectedQuestions.length} orphaned question(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsAssigning(true);
      // Delete questions one by one
      for (const questionId of selectedQuestions) {
        await questionsService.delete(questionId);
      }
      
      // Reload data to refresh the list
      await loadData();
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert('Failed to delete questions. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading orphaned questions...</div>
      </div>
    );
  }

  if (orphanedQuestions.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Orphaned Questions
        </h2>
        <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-green-600 dark:text-green-400 font-medium">
            ✓ No orphaned questions found
          </div>
          <div className="text-sm text-green-500 dark:text-green-300 mt-1">
            All quiz questions are properly assigned to categories.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Orphaned Questions ({orphanedQuestions.length})
      </h2>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          ⚠️ Questions without categories found
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          These questions are not associated with any category and won't appear in quizzes. 
          Please assign them to appropriate categories or delete them.
        </div>
      </div>

      {/* Action Controls */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign selected questions to category:
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a category...</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.sections?.name} → {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAssignToCategory}
              disabled={!targetCategoryId || selectedQuestions.length === 0 || isAssigning}
              className="py-2 px-4 bg-blue-600 border border-transparent rounded-md text-sm text-white cursor-pointer hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedQuestions.length} Question(s)`}
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedQuestions.length === 0 || isAssigning}
              className="py-2 px-4 bg-red-600 border border-transparent rounded-md text-sm text-white cursor-pointer hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* Question Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedQuestions.length} of {orphanedQuestions.length} questions selected
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select None
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {orphanedQuestions.map(question => (
          <div key={question.id} className="flex items-start space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
            <input
              type="checkbox"
              id={`question-${question.id}`}
              checked={selectedQuestions.includes(question.id)}
              onChange={() => handleQuestionToggle(question.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
                  {question.question_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(question.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                {question.question_text}
              </div>
              {question.explanation && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Explanation: {question.explanation.substring(0, 100)}
                  {question.explanation.length > 100 ? '...' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrphanedQuestionsManager;
