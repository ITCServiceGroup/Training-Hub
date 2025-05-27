import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import { getIconByName } from '../utils/iconMappings';

/**
 * Component for displaying a grid of categories
 */
const CategoryGrid = ({ categories, isLoading, searchQuery, sectionId }) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];

  const handleCategoryClick = (categoryId, sectionId) => {
    navigate(`/study/${sectionId}/${categoryId}`);
  };

  // Get icon and color based on category data or fallback to name-based detection
  const getCategoryIcon = (category) => {
    // If the category has a custom icon set, use it
    if (category.icon) {
      const { component: IconComponent } = getIconByName(category.icon);
      return {
        icon: <IconComponent size={24} color="white" />,
        color: currentSecondaryColor // Always use secondary color
      };
    }

    // Fallback to name-based detection for backward compatibility
    const name = category.name.toLowerCase();
    let iconName = 'Book';

    if (name.includes('network')) iconName = 'Network';
    else if (name.includes('install')) iconName = 'Download';
    else if (name.includes('service')) iconName = 'Wrench';
    else if (name.includes('troubleshoot')) iconName = 'Search';
    else if (name.includes('security')) iconName = 'Lock';
    else if (name.includes('hardware')) iconName = 'Laptop';
    else if (name.includes('software')) iconName = 'Chart';

    const { component: IconComponent } = getIconByName(iconName);
    return {
      icon: <IconComponent size={24} color="white" />,
      color: currentSecondaryColor // Always use secondary color
    };
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full border-3 ${isDark ? 'border-gray-700 border-t-primary-light' : 'border-gray-200 border-t-primary-dark'} animate-spin mr-4`}></div>
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
        // Only count published study guides
        const studyGuideCount = category.v2_study_guides?.filter(guide => guide.is_published)?.length || 0;

        return (
          <div
            key={category.id}
            className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6 cursor-pointer flex flex-col items-center text-center h-full transition-all hover:translate-y-[-5px] hover:shadow-md`}
            onClick={() => handleCategoryClick(category.id, sectionId)}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4 flex-1`}>{category.description || 'No description available'}</p>
            <div className={`flex justify-between ${isDark ? 'text-gray-500' : 'text-slate-400'} text-sm mt-auto w-full`}>
              <span>{studyGuideCount} {studyGuideCount === 1 ? 'Study Guide' : 'Study Guides'}</span>
            </div>
            <button
              className={`${isDark ? 'bg-primary hover:bg-primary-light' : 'bg-primary-dark hover:bg-primary'} text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors mt-4 w-full`}
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
