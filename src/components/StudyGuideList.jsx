import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import LoadingSpinner from './common/LoadingSpinner';

/**
 * Component for displaying a list of study guides within a category
 */
const StudyGuideList = ({ studyGuides, sectionId, categoryId, categoryName, selectedGuideId, isLoading, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow h-full flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10 pb-2 pt-0 bg-inherit">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{categoryName || 'Study Guides'}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className={`md:hidden p-2 text-secondary hover:text-secondary/80 transition-colors`}
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>
        <div className="p-4">
          <LoadingSpinner size="md" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow h-full flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto`}>
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 pb-2 pt-0 bg-inherit">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{categoryName || 'Study Guides'}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className={`md:hidden p-2 text-secondary hover:text-secondary/80 transition-colors`}
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>

      {studyGuides && studyGuides.length > 0 ? (
        <ul className="list-none p-0 m-0 overflow-y-auto">
          {studyGuides.map(guide => (
            <li
              key={guide.id}
              className={`p-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded transition-colors ${guide.id === selectedGuideId ? isDark ? 'bg-primary/20' : 'bg-primary/10' : 'bg-transparent'}`}
            >
              <Link
                to={`/study/${sectionId}/${categoryId}/${guide.id}`}
                className={`text-secondary hover:text-secondary/80 no-underline block w-full transition-colors`}
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
