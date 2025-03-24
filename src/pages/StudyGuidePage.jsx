import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const StudyGuidePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock categories data
  const categories = [
    { 
      id: 'installation', 
      name: 'Installation', 
      description: 'Installation guides and procedures.',
      icon: '📥',
      topics: 12,
      color: '#0891b2'
    },
    { 
      id: 'service', 
      name: 'Service', 
      description: 'Service and maintenance procedures.',
      icon: '🔧',
      topics: 18,
      color: '#0e7490'
    },
    { 
      id: 'troubleshooting', 
      name: 'Troubleshooting', 
      description: 'Common issues and how to resolve them.',
      icon: '🔍',
      topics: 15,
      color: '#0c4a6e'
    },
    { 
      id: 'networking', 
      name: 'Networking', 
      description: 'Network setup and configuration guides.',
      icon: '🌐',
      topics: 10,
      color: '#0369a1'
    }
  ];
  
  // Mock topics for a selected category
  const topics = [
    { id: 'topic1', title: 'Getting Started', completed: true },
    { id: 'topic2', title: 'Basic Configuration', completed: true },
    { id: 'topic3', title: 'Advanced Settings', completed: false },
    { id: 'topic4', title: 'Troubleshooting Common Issues', completed: false },
    { id: 'topic5', title: 'Best Practices', completed: false }
  ];
  
  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Find the current category if categoryId is provided
  const currentCategory = categoryId ? 
    categories.find(cat => cat.id === categoryId) : null;
  
  // Styles
  const pageStyles = {
    padding: '1rem 0',
    maxWidth: '100%'
  };
  
  const headerStyles = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };
  
  const titleStyles = {
    fontSize: '2rem',
    color: '#0f766e',
    margin: '0'
  };
  
  const searchContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '400px',
    width: '100%'
  };
  
  const searchInputStyles = {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    width: '100%',
    fontSize: '1rem'
  };
  
  const breadcrumbStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b'
  };
  
  const breadcrumbLinkStyles = {
    color: '#0f766e',
    textDecoration: 'none',
    marginRight: '0.5rem'
  };
  
  const breadcrumbSeparatorStyles = {
    margin: '0 0.5rem'
  };
  
  const categoryGridStyles = {
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
  
  const categoryCardHoverStyles = {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
  
  const buttonHoverStyles = {
    backgroundColor: '#0c5e57'
  };
  
  // Content page styles
  const contentLayoutStyles = {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem'
  };
  
  const sidebarStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const sidebarTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#0f172a'
  };
  
  const topicListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };
  
  const topicItemStyles = {
    padding: '0.75rem 0',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };
  
  const topicLinkStyles = {
    color: '#0f766e',
    textDecoration: 'none',
    flex: 1
  };
  
  const completedIconStyles = {
    color: '#10b981',
    fontSize: '1rem'
  };
  
  const contentStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const contentTitleStyles = {
    fontSize: '1.75rem',
    color: '#0f172a',
    marginBottom: '1.5rem'
  };
  
  const contentTextStyles = {
    lineHeight: '1.7',
    color: '#334155'
  };
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/study/${categoryId}`);
  };
  
  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Study Guides</h2>
        <div style={searchContainerStyles}>
          <input
            type="text"
            placeholder="Search study guides..."
            style={searchInputStyles}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {categoryId ? (
        <>
          <div style={breadcrumbStyles}>
            <Link to="/study" style={breadcrumbLinkStyles}>Study Guides</Link>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <span>{currentCategory?.name || categoryId}</span>
          </div>
          
          <div style={contentLayoutStyles}>
            <div style={sidebarStyles}>
              <h3 style={sidebarTitleStyles}>Topics</h3>
              <ul style={topicListStyles}>
                {topics.map(topic => (
                  <li key={topic.id} style={topicItemStyles}>
                    {topic.completed && <span style={completedIconStyles}>✓</span>}
                    <a href="#" style={topicLinkStyles} onClick={(e) => e.preventDefault()}>
                      {topic.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={contentStyles}>
              <h2 style={contentTitleStyles}>
                {currentCategory?.name || categoryId}: Getting Started
              </h2>
              <div style={contentTextStyles}>
                <p>
                  Welcome to the {currentCategory?.name || categoryId} study guide. This guide will help you understand the key concepts and procedures related to this topic.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <h3>Key Concepts</h3>
                <ul>
                  <li>Understanding the basics of {currentCategory?.name || categoryId}</li>
                  <li>Setting up your environment</li>
                  <li>Best practices for implementation</li>
                  <li>Troubleshooting common issues</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Select a category below to start learning.</p>
          
          <div style={categoryGridStyles}>
            {filteredCategories.map(category => (
              <div 
                key={category.id}
                style={categoryCardStyles}
                onClick={() => handleCategoryClick(category.id)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, categoryCardHoverStyles);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={iconContainerStyles(category.color)}>
                  <span>{category.icon}</span>
                </div>
                <h3 style={categoryTitleStyles}>{category.name}</h3>
                <p style={categoryDescStyles}>{category.description}</p>
                <div style={categoryMetaStyles}>
                  <span>{category.topics} Topics</span>
                </div>
                <button 
                  style={buttonStyles}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, buttonHoverStyles);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f766e';
                  }}
                >
                  View Guide
                </button>
              </div>
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No study guides found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyGuidePage;
