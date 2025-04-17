import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying a grid of sections
 */
const SectionGrid = ({ sections, isLoading, searchQuery }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => {
    navigate(`/study/${sectionId}`);
  };

  // Get default icon and color based on section name
  const getSectionIcon = (section) => {
    const name = section.name.toLowerCase();

    if (name.includes('network')) return { icon: '🌐', color: '#0369a1' };
    if (name.includes('install')) return { icon: '📥', color: '#0891b2' };
    if (name.includes('service')) return { icon: '🔧', color: '#0e7490' };
    if (name.includes('troubleshoot')) return { icon: '🔍', color: '#0c4a6e' };
    if (name.includes('security')) return { icon: '🔒', color: '#7e22ce' };
    if (name.includes('hardware')) return { icon: '💻', color: '#15803d' };
    if (name.includes('software')) return { icon: '📊', color: '#b45309' };
    if (name.includes('advanced')) return { icon: '🚀', color: '#0e7490' };

    // Default
    return { icon: '📚', color: '#0f766e' };
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-12 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full border-3 ${isDark ? 'border-gray-700 border-t-teal-500' : 'border-gray-200 border-t-teal-700'} animate-spin mr-4`}></div>
        <span>Loading sections...</span>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {filteredSections.map(section => {
        const { icon, color } = getSectionIcon(section);
        const categoryCount = section.v2_categories?.length || 0;

        return (
          <div
            key={section.id}
            className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6 cursor-pointer flex flex-col h-full transition-all hover:translate-y-[-5px] hover:shadow-md`}
            onClick={() => handleSectionClick(section.id)}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: color || '#0f766e' }}
            >
              <span>{icon}</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{section.name}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4 flex-1`}>{section.description || 'No description available'}</p>
            <div className={`flex justify-between ${isDark ? 'text-gray-500' : 'text-slate-400'} text-sm mt-auto`}>
              <span>{categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}</span>
            </div>
            <button
              className={`${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-700 hover:bg-teal-800'} text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors mt-4 w-full`}
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
