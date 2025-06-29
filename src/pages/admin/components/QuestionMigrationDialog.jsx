import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { categoriesService } from '../../../services/api/categories';
import { questionsService } from '../../../services/api/questions';
import { useTheme } from '../../../contexts/ThemeContext';

const QuestionMigrationDialog = ({
  isOpen,
  onClose,
  onComplete,
  categoryId,
  categoryName,
  questions = []
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Select all questions by default
      setSelectedQuestions(questions.map(q => q.id));
    }
  }, [isOpen, questions]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const allCategories = await categoriesService.getAllCategories();
      // Filter out the current category
      const filtered = allCategories.filter(cat => cat.id !== categoryId);
      setAvailableCategories(filtered);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(questions.map(q => q.id));
  };

  const handleSelectNone = () => {
    setSelectedQuestions([]);
  };

  const handleMigrate = async () => {
    if (!targetCategoryId || selectedQuestions.length === 0) return;

    try {
      setIsMigrating(true);
      await questionsService.moveToCategory(selectedQuestions, targetCategoryId);
      onComplete();
    } catch (error) {
      console.error('Error migrating questions:', error);
      alert('Failed to migrate questions. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const targetCategory = availableCategories.find(cat => cat.id === targetCategoryId);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Dialog.Panel className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-2xl w-[90%] max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Migrate Quiz Questions
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-300 mb-5">
            Before deleting the category "{categoryName}", you need to move its quiz questions to another category.
          </Dialog.Description>

          {/* Target Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Move questions to:
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            >
              <option value="">Select a category...</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.v2_sections?.name} → {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select questions to migrate ({selectedQuestions.length} of {questions.length} selected):
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-primary-dark hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleSelectNone}
                  className="text-xs text-primary-dark hover:underline"
                >
                  Select None
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-slate-600 rounded-md p-3 bg-gray-50 dark:bg-slate-700">
              {questions.map(question => (
                <div key={question.id} className="flex items-start space-x-3 mb-3 last:mb-0">
                  <input
                    type="checkbox"
                    id={`question-${question.id}`}
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => handleQuestionToggle(question.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`question-${question.id}`}
                    className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <div className="font-medium">{question.question_type.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {question.question_text.substring(0, 100)}
                      {question.question_text.length > 100 ? '...' : ''}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              disabled={isMigrating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMigrate}
              disabled={!targetCategoryId || selectedQuestions.length === 0 || isMigrating}
              className="py-2 px-4 bg-primary-dark border border-transparent rounded-md text-sm text-white cursor-pointer hover:bg-primary hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMigrating ? 'Migrating...' : `Migrate ${selectedQuestions.length} Question(s)`}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default QuestionMigrationDialog;
