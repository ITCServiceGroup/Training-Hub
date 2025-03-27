import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying a grid of categories
 */
const CategoryGrid = ({ categories, isLoading, searchQuery, sectionId }) => {
  const navigate = useNavigate();
  
  // Styles
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  };
  
  const categoryCardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };
  
  const iconContainerStyles = (color) => ({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: color || '#0f766e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem'
  });
  
  const categoryTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#0f172a'
  };
  
  const categoryDescStyles = {
    color: '#64748b',
    marginBottom: '1rem',
    flex: '1'
  };
  
  const categoryMetaStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginTop: 'auto'
  };
  
  const buttonStyles = {
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '1rem',
    width: '100%'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    color: '#64748b'
  };

  const spinnerStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#0f766e',
    animation: 'spin 1s linear infinite',
    marginRight: '1rem'
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  };

  const handleCategoryClick = (categoryId, sectionId) => {
    navigate(`/study/${sectionId}/${categoryId}`);
  };

  // Get default icon and color based on category name
  const getCategoryIcon = (category) => {
    const name = category.name.toLowerCase();
    
    if (name.includes('network')) return { icon: '🌐', color: '#0369a1' };
    if (name.includes('install')) return { icon: '📥', color: '#0891b2' };
    if (name.includes('service')) return { icon: '🔧', color: '#0e7490' };
    if (name.includes('troubleshoot')) return { icon: '🔍', color: '#0c4a6e' };
    if (name.includes('security')) return { icon: '🔒', color: '#7e22ce' };
    if (name.includes('hardware')) return { icon: '💻', color: '#15803d' };
    if (name.includes('software')) return { icon: '📊', color: '#b45309' };
    
    // Default
    return { icon: '📚', color: '#0f766e' };
  };

  if (isLoading) {
    return (
      <div style={loadingStyles}>
        <div style={spinnerStyles}></div>
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
      <div style={emptyStyles}>
        {searchQuery 
          ? <p>No categories found matching "{searchQuery}"</p>
          : <p>No categories available</p>
        }
      </div>
    );
  }

  return (
    <div style={gridStyles}>
      {filteredCategories.map(category => {
        const { icon, color } = getCategoryIcon(category);
        const studyGuideCount = category.v2_study_guides?.length || 0;
        
        return (
          <div 
            key={category.id}
            style={categoryCardStyles}
            onClick={() => handleCategoryClick(category.id, sectionId)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={iconContainerStyles(color)}>
              <span>{icon}</span>
            </div>
            <h3 style={categoryTitleStyles}>{category.name}</h3>
            <p style={categoryDescStyles}>{category.description || 'No description available'}</p>
            <div style={categoryMetaStyles}>
              <span>{studyGuideCount} {studyGuideCount === 1 ? 'Study Guide' : 'Study Guides'}</span>
            </div>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0c5e57';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0f766e';
              }}
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
