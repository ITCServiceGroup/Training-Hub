import React, { useState, useEffect } from 'react';
import { sectionsService } from '../../services/api/sections';
import { categoriesService } from '../../services/api/categories';

const QuizMetadataForm = ({ quiz, onChange, isLoading }) => {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Fetch sections and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsData = await sectionsService.getSectionsWithCategories();
        setSections(sectionsData);

        // Flatten categories from all sections
        const allCategories = sectionsData.reduce((acc, section) => {
          return [...acc, ...(section.v2_categories || [])];
        }, []);

        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to load sections and categories', error);
      }
    };

    fetchData();
  }, []);

  // Handle form field changes
  const handleChange = (field, value) => {
    onChange({
      ...quiz,
      [field]: value
    });
  };

  // Handle category selection
  const handleCategoryChange = (categoryId, isSelected) => {
    const updatedCategoryIds = isSelected
      ? [...quiz.category_ids, categoryId]
      : quiz.category_ids.filter(id => id !== categoryId);

    onChange({
      ...quiz,
      category_ids: updatedCategoryIds
    });
  };

  // Filter categories by selected section
  const filteredCategories = selectedSectionId
    ? categories.filter(category => category.section_id === selectedSectionId)
    : categories;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Quiz Title
        </label>
        <input
          type="text"
          className="w-full py-2 px-3 border border-slate-300 rounded-md"
          value={quiz.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={isLoading}
          placeholder="Enter quiz title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full py-2 px-3 border border-slate-300 rounded-md"
          value={quiz.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          disabled={isLoading}
          placeholder="Enter quiz description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            className="w-full py-2 px-3 border border-slate-300 rounded-md"
            value={quiz.time_limit ? Math.floor(quiz.time_limit / 60) : ''}
            onChange={(e) => {
              const minutes = parseInt(e.target.value, 10);
              handleChange('time_limit', isNaN(minutes) ? null : minutes * 60);
            }}
            min="0"
            placeholder="No time limit"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            className="w-full py-2 px-3 border border-slate-300 rounded-md"
            value={quiz.passing_score || ''}
            onChange={(e) => handleChange('passing_score', parseFloat(e.target.value))}
            min="0"
            max="100"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Quiz Mode Options</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded"
                checked={quiz.is_practice || false}
                onChange={(e) => {
                  const isPracticeChecked = e.target.checked;
                  // Update both flags in a single state update
                  onChange({
                    ...quiz,
                    is_practice: isPracticeChecked,
                    // If checking practice-only, ensure has_practice_mode is false
                    has_practice_mode: isPracticeChecked ? false : quiz.has_practice_mode
                  });
                }}
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-slate-700">
                Practice Quiz Only (no access code required, immediate feedback)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded"
                checked={quiz.has_practice_mode || false}
                onChange={(e) => {
                  const hasPracticeModeChecked = e.target.checked;
                  // Update both flags in a single state update
                  onChange({
                    ...quiz,
                    has_practice_mode: hasPracticeModeChecked,
                    // If checking has_practice_mode, ensure is_practice is false
                    is_practice: hasPracticeModeChecked ? false : quiz.is_practice
                  });
                }}
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-slate-700">
                Enable Practice Mode (allows practice attempts alongside regular quiz)
              </span>
            </label>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {quiz.is_practice 
              ? "Practice-only quizzes are always accessible without access codes and provide immediate feedback."
              : quiz.has_practice_mode
                ? "This quiz will be available as both a regular quiz (requires access code) and a practice quiz."
                : "This is a regular quiz that requires an access code to attempt."}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Filter Categories by Section
        </label>
        <select
          className="w-full py-2 px-3 border border-slate-300 rounded-md"
          value={selectedSectionId || ''}
          onChange={(e) => setSelectedSectionId(e.target.value || null)}
          disabled={isLoading}
        >
          <option value="">All Sections</option>
          {sections.map(section => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Categories
        </label>
        <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-md p-2">
          {filteredCategories.map(category => (
            <label key={category.id} className="flex items-center p-2 hover:bg-slate-50">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded"
                checked={quiz.category_ids.includes(category.id)}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-slate-700">
                {category.name}
              </span>
            </label>
          ))}

          {filteredCategories.length === 0 && (
            <p className="text-sm text-slate-500 p-2">No categories found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMetadataForm;
