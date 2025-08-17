import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import { getSectionIcon } from '../utils/iconHelpers';
import LoadingSpinner from './common/LoadingSpinner';

/**
 * Component for displaying a grid of sections
 */
const SectionGrid = ({ sections, isLoading, searchQuery, navigationPath = 'study' }) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];

  const handleSectionClick = (sectionId) => {
    if (navigationPath === 'quiz') {
      navigate(`/quiz/practice/${sectionId}`);
    } else {
      navigate(`/study/${sectionId}`);
    }
  };


  if (isLoading) {
    return (
      <div className="p-12">
        <LoadingSpinner size="lg" text="Loading sections..." />
      </div>
    );
  }

  // Filter sections based on search query
  const filteredSections = searchQuery
    ? sections.filter(section =>
        section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sections;

  if (filteredSections.length === 0) {
    return (
      <div className={`text-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        {searchQuery
          ? <p>No sections found matching "{searchQuery}"</p>
          : <p>No sections available</p>
        }
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {filteredSections.map(section => {
        const { IconComponent, iconProps, color } = getSectionIcon(section, currentSecondaryColor);
        const categoryCount = section.categories?.length || 0;

        return (
          <div
            key={section.id}
            className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg border-2 border-gray-300 dark:border-slate-500 shadow p-6 cursor-pointer flex flex-col items-center text-center h-full transition-all hover:translate-y-[-5px] hover:shadow-md`}
            onClick={() => handleSectionClick(section.id)}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: color }}
            >
              <IconComponent {...iconProps} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{section.name}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4 flex-1 whitespace-pre-wrap`}>{section.description || 'No description available'}</p>
            <div className={`flex justify-between ${isDark ? 'text-gray-500' : 'text-slate-400'} text-sm mt-auto w-full`}>
              <span>{categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}</span>
            </div>
            <button
              className={`bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors mt-4 w-full`}
            >
              View Categories
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SectionGrid;
