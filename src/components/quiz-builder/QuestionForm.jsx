import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MultipleChoiceForm from './question-types/MultipleChoiceForm';
import CheckAllThatApplyForm from './question-types/CheckAllThatApplyForm';
import TrueFalseForm from './question-types/TrueFalseForm';

const QuestionForm = ({ question, categoryId, onSave, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    category_id: categoryId || '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with question data if editing
  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        category_id: question.category_id || categoryId || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || 0,
        explanation: question.explanation || ''
      });
    }
  }, [question, categoryId]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (error) {
      setError('Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when changing question type
  const handleQuestionTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      question_type: type,
      options: type === 'true_false' ? null : ['', '', '', ''],
      correct_answer: type === 'check_all_that_apply' ? [] : type === 'true_false' ? false : 0
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-4 rounded-lg`}>{error}</div>
      )}

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'} mb-1`}>
          Question Text
        </label>
        <textarea
          className={`w-full py-2 px-3 border ${
            isDark
              ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
          } rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500`}
          value={formData.question_text}
          onChange={(e) => handleChange('question_text', e.target.value)}
          rows={3}
          required
          disabled={isLoading}
          placeholder="Enter your question"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'} mb-1`}>
          Question Type
        </label>
        <select
          className={`w-full py-2 px-3 border ${
            isDark
              ? 'border-slate-600 bg-slate-700 text-white'
              : 'border-slate-300 bg-white text-slate-900'
          } rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500`}
          value={formData.question_type}
          onChange={(e) => handleQuestionTypeChange(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="multiple_choice">Multiple Choice (Single Answer)</option>
          <option value="check_all_that_apply">Multiple Choice (Check All That Apply)</option>
          <option value="true_false">True/False</option>
        </select>
      </div>

      {/* Render different form based on question type */}
      {formData.question_type === 'multiple_choice' && (
        <MultipleChoiceForm
          options={formData.options}
          correctAnswer={formData.correct_answer}
          onChange={(options, correctAnswer) => {
            handleChange('options', options);
            handleChange('correct_answer', correctAnswer);
          }}
          disabled={isLoading}
          isDark={isDark}
        />
      )}

      {formData.question_type === 'check_all_that_apply' && (
        <CheckAllThatApplyForm
          options={formData.options}
          correctAnswers={Array.isArray(formData.correct_answer) ? formData.correct_answer : []}
          onChange={(options, correctAnswers) => {
            handleChange('options', options);
            handleChange('correct_answer', correctAnswers);
          }}
          disabled={isLoading}
          isDark={isDark}
        />
      )}

      {formData.question_type === 'true_false' && (
        <TrueFalseForm
          correctAnswer={formData.correct_answer === true}
          onChange={(correctAnswer) => {
            handleChange('correct_answer', correctAnswer);
          }}
          disabled={isLoading}
          isDark={isDark}
        />
      )}

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'} mb-1`}>
          Explanation (shown for incorrect answers in practice mode)
        </label>
        <textarea
          className={`w-full py-2 px-3 border ${
            isDark
              ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
          } rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500`}
          value={formData.explanation}
          onChange={(e) => handleChange('explanation', e.target.value)}
          rows={3}
          disabled={isLoading}
          placeholder="Explain why the correct answer is correct"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className={`py-2 px-4 ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600'
              : 'bg-slate-500 hover:bg-slate-600'
          } text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 bg-teal-700 text-white rounded-md hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
