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
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1F2937'
  };

  const categoryIndicatorStyles = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#F3F4F6',
    borderRadius: '0.375rem',
    border: '1px solid #E5E7EB'
  };

  const createButtonStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={containerStyles}>
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

      <div style={headerStyles}>
        <div>
          <h2 style={titleStyles}>Study Guides</h2>
          {category && (
            <div style={categoryIndicatorStyles}>
              <FaFileAlt style={{ marginRight: '0.5rem', fontSize: '1rem' }} />
              <span>Category: {category.name}</span>
            </div>
          )}
        </div>
        <button
          style={createButtonStyles}
          onClick={onCreateNew}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3B82F6';
          }}
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
