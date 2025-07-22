import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import StudyGuideList from '../StudyGuideList';
import BreadcrumbNav from '../BreadcrumbNav';
import { FaFileAlt } from 'react-icons/fa';

const StudyGuideManagement = ({
  section,
  category,
  studyGuides,
  onSelect,
  selectedId,
  onCreateNew,
  isLoading,
  error,
  onReorder,
  onBackToCategories,
  onCopy,
  onMove,
  onUpdateDescription
}) => {
  // Using Tailwind classes instead of inline styles
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-700 sticky top-0 z-10 pb-4">
        <BreadcrumbNav
          items={[
            {
              label: 'Sections',
              onClick: () => onBackToCategories(null)
            },
            {
              label: section?.name || '',
              onClick: () => onBackToCategories(section)
            },
            {
              label: category?.name || ''
            }
          ]}
        />

        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Content</h2>
            {category && (
              <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-white mt-3 py-2 px-3 bg-gray-100 dark:bg-slate-700 rounded-md border border-gray-200 dark:border-slate-600">
                <FaFileAlt className="mr-2 text-base" />
                <span>Category: {category.name}</span>
              </div>
            )}
          </div>
          <button
            className="bg-primary hover:bg-primary-dark text-white border-none py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
            onClick={onCreateNew}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Create New Content</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <StudyGuideList
          studyGuides={studyGuides} // Pass the prop to ensure immediate updates
          onSelect={onSelect}
          selectedId={selectedId}
          onReorder={onReorder}
          onCopy={onCopy}
          onMove={onMove}
          onUpdateDescription={onUpdateDescription}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default StudyGuideManagement;
