import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

/**
 * Component for displaying a list of study guides within a category
 */
const StudyGuideList = ({ studyGuides, sectionId, categoryId, selectedGuideId, isLoading, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Study Guides</h3>
          {onClose && (
            <button
              onClick={onClose}
              className={`md:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-white hover:text-white/80'}`}
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>
        <div className={`flex justify-center items-center p-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-gray-700 border-t-teal-500' : 'border-gray-200 border-t-teal-700'} animate-spin mr-3`}></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Study Guides</h3>
        {onClose && (
          <button
            onClick={onClose}
            className={`md:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-white hover:text-white/80'}`}
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>

      {studyGuides && studyGuides.length > 0 ? (
        <ul className="list-none p-0 m-0">
          {studyGuides.map(guide => (
            <li
              key={guide.id}
              className={`p-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded transition-colors ${guide.id === selectedGuideId ? isDark ? 'bg-teal-900/30' : 'bg-teal-50' : 'bg-transparent'}`}
            >
              <Link
                to={`/study/${sectionId}/${categoryId}/${guide.id}`}
                className={`${isDark ? 'text-teal-400' : 'text-teal-700'} no-underline block w-full`}
                onClick={handleLinkClick}
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`text-center p-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <p>No study guides available</p>
        </div>
      )}
    </div>
  );
};

export default StudyGuideList;
