import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import { getIconByName } from '../utils/iconMappings';
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

  // Get icon and color based on section data or fallback to name-based detection
  const getSectionIcon = (section) => {
    // If the section has a custom icon set, use it
    if (section.icon) {
      const { component: IconComponent } = getIconByName(section.icon);
      return {
        icon: <IconComponent size={24} color="white" />,
        color: currentSecondaryColor // Always use secondary color
      };
    }

    // Fallback to name-based detection for backward compatibility
    const name = section.name.toLowerCase();
    let iconName = 'Book';

    if (name.includes('network')) iconName = 'Network';
    else if (name.includes('install')) iconName = 'Download';
    else if (name.includes('service')) iconName = 'Wrench';
    else if (name.includes('troubleshoot')) iconName = 'Search';
    else if (name.includes('security')) iconName = 'Lock';
    else if (name.includes('hardware')) iconName = 'Laptop';
    else if (name.includes('software')) iconName = 'Chart';
    else if (name.includes('advanced')) iconName = 'Rocket';

    const { component: IconComponent } = getIconByName(iconName);
    return {
      icon: <IconComponent size={24} color="white" />,
      color: currentSecondaryColor // Always use secondary color
    };
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
        const { icon, color } = getSectionIcon(section);
        const categoryCount = section.v2_categories?.length || 0;

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
              {icon}
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
