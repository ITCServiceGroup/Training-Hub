import React, { useState, useEffect } from 'react';
import CategoryTree from './components/CategoryTree';
import StudyGuideEditor from './components/StudyGuideEditor';
import StudyGuideList from './components/StudyGuideList';
import { studyGuidesService } from '../../services/api/studyGuides';

const StudyGuides = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGuides, setStudyGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      loadStudyGuides();
    } else {
      setStudyGuides([]);
    }
  }, [selectedCategory]);

  const loadStudyGuides = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    try {
      const guides = await studyGuidesService.getByCategoryId(selectedCategory.id);
      setStudyGuides(guides.sort((a, b) => a.display_order - b.display_order));
      setError(null);
    } catch (err) {
      console.error('Error loading study guides:', err);
      setError('Failed to load study guides');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSelectedStudyGuide(null);
    setIsCreating(false);
    setError(null);
  };

  const handleStudyGuideSelect = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedStudyGuide(null);
    setIsCreating(true);
  };

  const handleDelete = async () => {
    try {
      await studyGuidesService.delete(selectedStudyGuide.id);
      setSelectedStudyGuide(null);
      await loadStudyGuides();
    } catch (error) {
      console.error('Error deleting study guide:', error);
      throw error; // Let the editor component handle the error display
    }
  };

  const handleSave = async (studyGuideData) => {
    try {
      if (isCreating) {
        await studyGuidesService.create({
          ...studyGuideData,
          category_id: selectedCategory.id,
          display_order: 0 // Will be updated when drag-drop is implemented
        });
      } else {
        await studyGuidesService.update(selectedStudyGuide.id, studyGuideData);
      }
      
      // Reset state and refresh data
      setIsCreating(false);
      setSelectedStudyGuide(null);
      await loadStudyGuides();
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    }
  };

  // Styles
  const containerStyles = {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    padding: '24px'
  };

  const sidebarStyles = {
    gridColumn: 'span 1'
  };

  const contentStyles = {
    gridColumn: 'span 3'
  };

  const sidebarContainerStyles = {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const contentContainerStyles = {
    backgroundColor: 'white',
    padding: window.location.pathname.includes('/admin/study-guides') && (isCreating || selectedStudyGuide) ? '0' : '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    minHeight: '500px'
  };

  const emptyStateStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '48px 16px',
    textAlign: 'center'
  };

  const emptyIconStyles = {
    width: '64px',
    height: '64px',
    color: '#D1D5DB',
    marginBottom: '16px'
  };

  const emptyTitleStyles = {
    fontSize: '18px',
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: '8px'
  };

  const emptyDescriptionStyles = {
    color: '#6B7280',
    maxWidth: '400px'
  };

  const contentHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '16px',
    marginBottom: '24px'
  };

  const titleContainerStyles = {
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1F2937'
  };

  const descriptionStyles = {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px'
  };

  const createButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.2s'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px'
  };

  const spinnerStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 1s linear infinite'
  };

  const loadingTextStyles = {
    marginLeft: '8px',
    color: '#6B7280'
  };

  const errorStyles = {
    padding: '24px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: '8px',
    color: '#DC2626',
    display: 'flex',
    alignItems: 'center'
  };

  const errorIconStyles = {
    marginRight: '8px'
  };

  const editorContainerStyles = {
    backgroundColor: '#F9FAFB',
    borderRadius: '0',
    padding: '24px',
    height: '100%',
    width: '100%'
  };

  // Apply responsive styles for larger screens
  const mediaQueryStyles = window.matchMedia('(min-width: 1024px)').matches ? {
    gridStyles: {
      ...gridStyles,
      gridTemplateColumns: '1fr 3fr'
    },
    sidebarStyles: {
      ...sidebarStyles,
      gridColumn: 'span 1'
    },
    contentStyles: {
      ...contentStyles,
      gridColumn: 'span 1'
    }
  } : {};

  // Merge responsive styles
  const responsiveGridStyles = { ...gridStyles, ...mediaQueryStyles.gridStyles };
  const responsiveSidebarStyles = { ...sidebarStyles, ...mediaQueryStyles.sidebarStyles };
  const responsiveContentStyles = { ...contentStyles, ...mediaQueryStyles.contentStyles };

  return (
    <div style={containerStyles}>
      <div style={responsiveGridStyles}>
        {/* Category Tree */}
        <div style={responsiveSidebarStyles}>
          <div style={sidebarContainerStyles}>
            <CategoryTree 
              onSelectCategory={handleCategorySelect}
              selectedCategoryId={selectedCategory?.id}
            />
          </div>
        </div>
        
        {/* Content Area */}
        <div style={responsiveContentStyles}>
          <div style={contentContainerStyles}>
            {!selectedCategory ? (
              <div style={emptyStateStyles}>
                <svg xmlns="http://www.w3.org/2000/svg" style={emptyIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <h3 style={emptyTitleStyles}>
                  Select a category to manage study guides
                </h3>
                <p style={emptyDescriptionStyles}>
                  Choose a category from the left panel to view, create, or edit study guides for that category.
                </p>
              </div>
            ) : (
              <div>
                <div style={contentHeaderStyles}>
                  <div style={titleContainerStyles}>
                    <h2 style={titleStyles}>
                      {selectedCategory.name}
                    </h2>
                    {selectedCategory.description && (
                      <p style={descriptionStyles}>
                        {selectedCategory.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCreateNew}
                    style={createButtonStyles}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Study Guide
                  </button>
                </div>

                {isLoading ? (
                  <div style={loadingStyles}>
                    <div style={spinnerStyles}></div>
                    <span style={loadingTextStyles}>Loading study guides...</span>
                  </div>
                ) : error ? (
                  <div style={errorStyles}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={errorIconStyles} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                ) : !isCreating && !selectedStudyGuide ? (
                  <StudyGuideList
                    studyGuides={studyGuides}
                    onSelect={handleStudyGuideSelect}
                    selectedId={selectedStudyGuide?.id}
                    onReorder={async (updates) => {
                      try {
                        await studyGuidesService.updateOrder(updates);
                        await loadStudyGuides();
                      } catch (err) {
                        console.error('Error updating order:', err);
                        alert('Failed to update order');
                      }
                    }}
                  />
                ) : (
                  <div style={editorContainerStyles}>
                    <StudyGuideEditor
                      initialContent={selectedStudyGuide?.content || ''}
                      initialTitle={selectedStudyGuide?.title || ''}
                      onSave={handleSave}
                      onCancel={() => {
                        setIsCreating(false);
                        setSelectedStudyGuide(null);
                      }}
                      isNew={isCreating}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGuides;
