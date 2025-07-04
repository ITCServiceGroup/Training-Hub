import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { sectionsService } from '../../services/api/sections';
import { categoriesService } from '../../services/api/categories';
import { studyGuidesService } from '../../services/api/studyGuides';

const QuizMetadataForm = ({ quiz, onChange, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [studyGuides, setStudyGuides] = useState([]);
  const [linkedStudyGuides, setLinkedStudyGuides] = useState([]);

  // Fetch sections, categories, and study guides
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

        // Fetch published study guides for linking
        const studyGuidesData = await studyGuidesService.getPublishedForQuizLinking();
        setStudyGuides(studyGuidesData);
      } catch (error) {
        console.error('Failed to load sections, categories, and study guides', error);
      }
    };

    fetchData();
  }, []);

  // Clean up invalid category IDs when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && quiz.category_ids.length > 0) {
      const validCategoryIds = quiz.category_ids.filter(id =>
        categories.some(cat => cat.id === id)
      );

      // Only update if there are invalid categories to remove
      if (validCategoryIds.length !== quiz.category_ids.length) {
        onChange({
          ...quiz,
          category_ids: validCategoryIds
        });
      }
    }
  }, [categories, quiz.category_ids, onChange]);

  // Load linked study guides when quiz changes
  useEffect(() => {
    const loadLinkedStudyGuides = async () => {
      if (quiz.id) {
        try {
          const { quizzesService } = await import('../../services/api/quizzes');
          const linkedGuides = await quizzesService.getLinkedStudyGuides(quiz.id);
          setLinkedStudyGuides(linkedGuides.map(guide => guide.id));
        } catch (error) {
          console.error('Error loading linked study guides:', error);
        }
      }
    };

    loadLinkedStudyGuides();
  }, [quiz.id]);

  // Handle form field changes
  const handleChange = (field, value) => {
    onChange({
      ...quiz,
      [field]: value
    });
  };

  // Handle study guide linking
  const handleStudyGuideLink = async (studyGuideId, shouldLink) => {
    // Don't allow linking if quiz hasn't been saved yet
    if (!quiz.id) {
      console.warn('Cannot link study guides to unsaved quiz');
      return;
    }

    try {
      console.log('Linking study guide:', studyGuideId, 'to quiz:', quiz.id, 'shouldLink:', shouldLink);
      if (shouldLink) {
        // Link the study guide to this quiz
        await studyGuidesService.updateLinkedQuiz(studyGuideId, quiz.id);
        setLinkedStudyGuides(prev => [...prev, studyGuideId]);
        console.log('Successfully linked study guide');
      } else {
        // Unlink the study guide from this quiz
        await studyGuidesService.updateLinkedQuiz(studyGuideId, null);
        setLinkedStudyGuides(prev => prev.filter(id => id !== studyGuideId));
        console.log('Successfully unlinked study guide');
      }
    } catch (error) {
      console.error('Error updating study guide link:', error);
      // You might want to show a toast notification here
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryId, isSelected) => {
    let updatedCategoryIds;

    if (isSelected) {
      updatedCategoryIds = [...quiz.category_ids, categoryId];
    } else {
      updatedCategoryIds = quiz.category_ids.filter(id => id !== categoryId);
    }

    // Clean up any invalid category IDs by checking against available categories
    const validCategoryIds = updatedCategoryIds.filter(id =>
      categories.some(cat => cat.id === id)
    );

    onChange({
      ...quiz,
      category_ids: validCategoryIds
    });
  };

  // Filter categories by selected section
  const filteredCategories = selectedSectionId
    ? categories.filter(category => category.section_id === selectedSectionId)
    : categories;

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-1`}>
          Quiz Title
        </label>
        <input
          type="text"
          className={`w-full py-2 px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-md`}
          value={quiz.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={isLoading}
          placeholder="Enter quiz title"
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-1`}>
          Description
        </label>
        <textarea
          className={`w-full py-2 px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-md`}
          value={quiz.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          disabled={isLoading}
          placeholder="Enter quiz description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-1`}>
            Time Limit (minutes)
          </label>
          <input
            type="number"
            className={`w-full py-2 px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-md`}
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
          <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-1`}>
            Passing Score (%)
          </label>
          <input
            type="number"
            className={`w-full py-2 px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-md`}
            value={quiz.passing_score || ''}
            onChange={(e) => handleChange('passing_score', parseFloat(e.target.value))}
            min="0"
            max="100"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Quiz Mode Options and Randomization Options - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Quiz Mode Options */}
        <div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>Quiz Mode Options</h3>
          <div className="space-y-2">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
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
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Practice Quiz Only (no access code required, immediate feedback)
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded flex-shrink-0 mt-0.5"
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
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Enable Practice Mode (allows practice attempts alongside regular quiz)
              </span>
            </label>
          </div>
        </div>

        {/* Right Column - Randomization Options */}
        <div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>Randomization Options</h3>
          <div className="space-y-2">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded flex-shrink-0 mt-0.5"
                checked={quiz.randomize_questions || false}
                onChange={(e) => handleChange('randomize_questions', e.target.checked)}
                disabled={isLoading}
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Randomize question order
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 border-slate-300 rounded flex-shrink-0 mt-0.5"
                checked={quiz.randomize_answers || false}
                onChange={(e) => handleChange('randomize_answers', e.target.checked)}
                disabled={isLoading}
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Randomize answer options
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Description text below both sections */}
      <div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          {quiz.is_practice
            ? "Practice-only quizzes are always accessible without access codes and provide immediate feedback."
            : quiz.has_practice_mode
              ? "This quiz will be available as both a regular quiz (requires access code) and a practice quiz."
              : "This is a regular quiz that requires an access code to attempt."}
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-1`}>
          Filter Categories by Section
        </label>
        <select
          className={`w-full py-2 px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-md`}
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

      {/* Categories and Study Guides Section - Side by side layout */}
      <div className={`grid gap-6 ${quiz.id && (quiz.is_practice || quiz.has_practice_mode) ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Select Categories */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>
            Select Categories
          </label>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-3`}>
            Choose which categories this quiz will include questions from.
          </p>
          <div className={`max-h-60 overflow-y-auto border ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'} rounded-md p-2`}>
            {filteredCategories.map(category => (
              <label key={category.id} className={`flex items-start p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                <input
                  type="checkbox"
                  className={`h-4 w-4 text-teal-600 ${isDark ? 'border-slate-500' : 'border-slate-300'} rounded flex-shrink-0 mt-0.5`}
                  checked={quiz.category_ids.includes(category.id)}
                  onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  disabled={isLoading}
                />
                <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {category.name}
                </span>
              </label>
            ))}

            {filteredCategories.length === 0 && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'} p-2`}>No categories found</p>
            )}
          </div>
        </div>

        {/* Study Guide Linking Section */}
        {(quiz.is_practice || quiz.has_practice_mode) && (
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>
              Link Study Guides
            </label>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-3`}>
              Select study guides that should show a "Take Practice Quiz" button linking to this quiz.
              {!quiz.id && (
                <span className={`block mt-1 text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>
                  Note: Save the quiz first to enable study guide linking.
                </span>
              )}
            </p>
            <div className={`max-h-60 overflow-y-auto border ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'} rounded-md p-2`}>
              {(() => {
                // Filter study guides to only show those from selected categories
                const filteredStudyGuides = quiz.category_ids && quiz.category_ids.length > 0
                  ? studyGuides.filter(guide =>
                      guide.v2_categories && quiz.category_ids.includes(guide.v2_categories.id)
                    )
                  : studyGuides;

                return filteredStudyGuides.map(guide => (
                  <label key={guide.id} className={`flex items-center p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} ${!quiz.id ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      className={`h-4 w-4 text-teal-600 ${isDark ? 'border-slate-500' : 'border-slate-300'} rounded`}
                      checked={linkedStudyGuides.includes(guide.id)}
                      onChange={(e) => handleStudyGuideLink(guide.id, e.target.checked)}
                      disabled={isLoading || !quiz.id}
                    />
                    <div className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      <div className="font-medium">{guide.title}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {guide.v2_categories?.v2_sections?.name} → {guide.v2_categories?.name}
                      </div>
                    </div>
                  </label>
                ));
              })()}

              {(() => {
                const filteredStudyGuides = quiz.category_ids && quiz.category_ids.length > 0
                  ? studyGuides.filter(guide =>
                      guide.v2_categories && quiz.category_ids.includes(guide.v2_categories.id)
                    )
                  : studyGuides;

                if (filteredStudyGuides.length === 0) {
                  if (quiz.category_ids && quiz.category_ids.length > 0) {
                    return (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'} p-2`}>
                        No published study guides available in the selected categories
                      </p>
                    );
                  } else {
                    return (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'} p-2`}>
                        No published study guides available. Please select categories for this quiz first.
                      </p>
                    );
                  }
                }
                return null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMetadataForm;
