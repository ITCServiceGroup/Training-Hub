import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component for displaying a list of study guides within a category
 */
const StudyGuideList = ({ studyGuides, sectionId, categoryId, selectedGuideId, isLoading }) => {
  // Styles
  const containerStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#0f172a'
  };
  
  const listStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };
  
  const itemStyles = (isSelected) => ({
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s'
  });
  
  const linkStyles = {
    color: '#0f766e',
    textDecoration: 'none',
    display: 'block',
    width: '100%'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    color: '#64748b'
  };

  const spinnerStyles = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #E5E7EB',
    borderTopColor: '#0f766e',
    animation: 'spin 1s linear infinite',
    marginRight: '0.75rem'
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: '1rem',
    color: '#64748b'
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <h3 style={titleStyles}>Study Guides</h3>
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>Study Guides</h3>
      
      {studyGuides && studyGuides.length > 0 ? (
        <ul style={listStyles}>
          {studyGuides.map(guide => (
            <li 
              key={guide.id} 
              style={itemStyles(guide.id === selectedGuideId)}
            >
              <Link 
                to={`/study/${sectionId}/${categoryId}/${guide.id}`} 
                style={linkStyles}
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div style={emptyStyles}>
          <p>No study guides available</p>
        </div>
      )}
    </div>
  );
};

export default StudyGuideList;
