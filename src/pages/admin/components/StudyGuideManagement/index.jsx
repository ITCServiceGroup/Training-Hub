import React from 'react';
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
  onBackToCategories
}) => {
  // Using Tailwind classes instead of inline styles

  return (
    <div className="flex flex-col gap-4">
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
          <h2 className="text-2xl font-bold text-gray-800">Study Guides</h2>
          {category && (
            <div className="flex items-center text-lg font-semibold text-gray-800 mt-3 py-2 px-3 bg-gray-100 rounded-md border border-gray-200">
              <FaFileAlt className="mr-2 text-base" />
              <span>Category: {category.name}</span>
            </div>
          )}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
          onClick={onCreateNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Create New Study Guide</span>
        </button>
      </div>

      <StudyGuideList
        studyGuides={studyGuides} // Pass the prop to ensure immediate updates
        onSelect={onSelect}
        selectedId={selectedId}
        onReorder={onReorder}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default StudyGuideManagement;
