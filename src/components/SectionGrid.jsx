import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying a grid of sections
 */
const SectionGrid = ({ sections, isLoading, searchQuery }) => {
  const navigate = useNavigate();
  
  // Styles
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  };
  
  const sectionCardStyles = {
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
  
  const sectionTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#0f172a'
  };
  
  const sectionDescStyles = {
    color: '#64748b',
    marginBottom: '1rem',
    flex: '1'
  };
  
  const sectionMetaStyles = {
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
      <div style={loadingStyles}>
        <div style={spinnerStyles}></div>
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
      <div style={emptyStyles}>
        {searchQuery 
          ? <p>No sections found matching "{searchQuery}"</p>
          : <p>No sections available</p>
        }
      </div>
    );
  }

  return (
    <div style={gridStyles}>
      {filteredSections.map(section => {
        const { icon, color } = getSectionIcon(section);
        const categoryCount = section.v2_categories?.length || 0;
        
        return (
          <div 
            key={section.id}
            style={sectionCardStyles}
            onClick={() => handleSectionClick(section.id)}
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
            <h3 style={sectionTitleStyles}>{section.name}</h3>
            <p style={sectionDescStyles}>{section.description || 'No description available'}</p>
            <div style={sectionMetaStyles}>
              <span>{categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}</span>
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
              View Categories
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SectionGrid;
