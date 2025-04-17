import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying a grid of categories
 */
const CategoryGrid = ({ categories, isLoading, searchQuery, sectionId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId, sectionId) => {
    navigate(`/study/${sectionId}/${categoryId}`);
  };

  // Get default icon and color based on category name
  const getCategoryIcon = (category) => {
    const name = category.name.toLowerCase();

    if (name.includes('network')) return { icon: '🌐', color: '#0369a1' };
    if (name.includes('install')) return { icon: '📥', color: '#0891b2' };
    if (name.includes('service')) return { icon: '🔧', color: '#0e7490' };
    if (name.includes('troubleshoot')) return { icon: '🔍', color: '#0c4a6e' };
    if (name.includes('security')) return { icon: '🔒', color: '#7e22ce' };
    if (name.includes('hardware')) return { icon: '💻', color: '#15803d' };
    if (name.includes('software')) return { icon: '📊', color: '#b45309' };

    // Default
    return { icon: '📚', color: '#0f766e' };
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full border-3 ${isDark ? 'border-gray-700 border-t-teal-500' : 'border-gray-200 border-t-teal-700'} animate-spin mr-4`}></div>
        <span>Loading categories...</span>
      </div>
    );
  }

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categories;

  if (filteredCategories.length === 0) {
    return (
      <div className={`text-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        {searchQuery
          ? <p>No categories found matching "{searchQuery}"</p>
          : <p>No categories available</p>
        }
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {filteredCategories.map(category => {
        const { icon, color } = getCategoryIcon(category);
        const studyGuideCount = category.v2_study_guides?.length || 0;

        return (
          <div
            key={category.id}
            className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6 cursor-pointer flex flex-col h-full transition-all hover:translate-y-[-5px] hover:shadow-md`}
            onClick={() => handleCategoryClick(category.id, sectionId)}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: color || '#0f766e' }}
            >
              <span>{icon}</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4 flex-1`}>{category.description || 'No description available'}</p>
            <div className={`flex justify-between ${isDark ? 'text-gray-500' : 'text-slate-400'} text-sm mt-auto`}>
              <span>{studyGuideCount} {studyGuideCount === 1 ? 'Study Guide' : 'Study Guides'}</span>
            </div>
            <button
              className={`${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-700 hover:bg-teal-800'} text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors mt-4 w-full`}
            >
              View Guides
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
