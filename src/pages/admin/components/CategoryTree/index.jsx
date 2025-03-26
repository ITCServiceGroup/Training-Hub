import React, { useState, useEffect } from 'react';
import { categoriesService } from '../../../../services/api/categories';
import { sectionsService } from '../../../../services/api/sections';
import CategoryForm from './CategoryForm';
import SectionForm from './SectionForm';

const CategoryItem = ({ category, onSelect, selectedId, onCategoryUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditSubmit = async (formData) => {
    try {
      await categoriesService.update(category.id, formData);
      setIsEditing(false);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesService.delete(category.id);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Styles
  const categoryItemStyles = {
    marginLeft: '16px',
    marginTop: '12px',
    marginBottom: '12px'
  };

  const categoryCardStyles = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    backgroundColor: selectedId === category.id ? '#EBF5FF' : '#FFFFFF',
    borderLeft: selectedId === category.id ? '4px solid #3B82F6' : '1px solid #E5E7EB',
    borderTop: '1px solid #E5E7EB',
    borderRight: '1px solid #E5E7EB',
    borderBottom: '1px solid #E5E7EB'
  };

  const categoryContentStyles = {
    padding: '12px',
    cursor: 'pointer'
  };

  const categoryHeaderStyles = {
    display: 'flex',
    alignItems: 'center'
  };

  const iconStyles = {
    color: '#3B82F6',
    marginRight: '8px'
  };

  const titleStyles = {
    fontWeight: '500',
    color: '#1F2937'
  };

  const descriptionStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const footerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '4px',
    padding: '8px',
    backgroundColor: '#F9FAFB',
    borderTop: '1px solid #F3F4F6',
    opacity: isHovered || selectedId === category.id ? 1 : 0,
    transition: 'opacity 0.2s'
  };

  const editButtonStyles = {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#D97706',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const deleteButtonStyles = {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#DC2626',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const formContainerStyles = {
    marginTop: '8px'
  };

  return (
    <div style={categoryItemStyles}>
      <div 
        style={categoryCardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          style={categoryContentStyles}
          onClick={() => onSelect(category)}
        >
          <div style={categoryHeaderStyles}>
            <div style={iconStyles}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={titleStyles}>{category.name}</div>
          </div>
          {category.description && (
            <div style={descriptionStyles}>
              {category.description}
            </div>
          )}
        </div>
        
        <div style={footerStyles}>
          <button
            onClick={() => setIsEditing(true)}
            style={editButtonStyles}
            title="Edit category"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={deleteButtonStyles}
            title="Delete category"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={formContainerStyles}>
          <CategoryForm
            initialData={category}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
          />
        </div>
      )}
    </div>
  );
};

const SectionItem = ({ section, categories, onSelectCategory, selectedCategoryId, onSectionUpdate, onCategoryUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditSubmit = async (formData) => {
    try {
      await sectionsService.update(section.id, formData);
      setIsEditing(false);
      onSectionUpdate();
    } catch (err) {
      console.error('Error updating section:', err);
    }
  };

  const handleAddCategory = async (formData) => {
    try {
      await categoriesService.create({
        ...formData,
        section_id: section.id
      });
      setIsAddingCategory(false);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this section and all its categories?')) return;
    try {
      await sectionsService.delete(section.id);
      onSectionUpdate();
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  const sectionCategories = categories.filter(cat => cat.section_id === section.id);
  const hasCategories = sectionCategories.length > 0;

  // Get a color based on section name for visual distinction
  const getSectionColor = (name) => {
    const colors = [
      { from: '#3B82F6', to: '#2563EB' }, // blue
      { from: '#14B8A6', to: '#0D9488' }, // teal
      { from: '#8B5CF6', to: '#7C3AED' }, // purple
      { from: '#10B981', to: '#059669' }, // green
      { from: '#6366F1', to: '#4F46E5' }, // indigo
    ];
    
    // Simple hash function to get consistent color for same name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sectionColor = getSectionColor(section.name);

  // Styles
  const sectionItemStyles = {
    marginBottom: '24px'
  };

  const sectionCardStyles = {
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    transition: 'all 0.2s'
  };

  const headerStyles = {
    background: `linear-gradient(to right, ${sectionColor.from}, ${sectionColor.to})`,
    padding: '16px'
  };

  const headerContentStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const headerLeftStyles = {
    display: 'flex',
    alignItems: 'center'
  };

  const expandButtonStyles = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    color: 'white',
    marginRight: '12px',
    border: 'none',
    cursor: 'pointer'
  };

  const titleContainerStyles = {
    color: 'white'
  };

  const titleStyles = {
    fontWeight: 'bold',
    fontSize: '18px'
  };

  const descriptionStyles = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginTop: '4px'
  };

  const countStyles = {
    color: 'white',
    fontSize: '14px'
  };

  const footerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderTop: '1px solid #E5E7EB'
  };

  const hintTextStyles = {
    fontSize: '13px',
    color: '#6B7280',
    fontStyle: 'italic',
    marginRight: '20px'
  };

  const buttonContainerStyles = {
    display: 'flex',
    gap: '8px'
  };

  const addCategoryButtonStyles = {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#3B82F6',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const editButtonStyles = {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#D97706',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const deleteButtonStyles = {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#DC2626',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const formContainerStyles = {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const categoriesContainerStyles = {
    marginTop: '12px',
    paddingLeft: '8px',
    borderLeft: '2px solid #E5E7EB'
  };

  return (
    <div style={sectionItemStyles}>
      <div 
        style={sectionCardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={headerStyles}>
          <div style={headerContentStyles}>
            <div style={headerLeftStyles}>
              {hasCategories && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={expandButtonStyles}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <div style={titleContainerStyles}>
                <h3 style={titleStyles}>
                  {section.name}
                </h3>
                {section.description && (
                  <p style={descriptionStyles}>
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            <div style={countStyles}>
              {sectionCategories.length} {sectionCategories.length === 1 ? 'category' : 'categories'}
            </div>
          </div>
        </div>

        <div style={footerStyles}>
          <div style={hintTextStyles}>
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </div>
          
          <div style={buttonContainerStyles}>
            <button
              onClick={() => setIsAddingCategory(true)}
              style={addCategoryButtonStyles}
              title="Add category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Category
            </button>
            <button
              onClick={() => setIsEditing(true)}
              style={editButtonStyles}
              title="Edit section"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={deleteButtonStyles}
              title="Delete section"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div style={formContainerStyles}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#4B5563' }}>
            Edit Section
          </div>
          <SectionForm
            initialData={section}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
          />
        </div>
      )}

      {isAddingCategory && (
        <div style={formContainerStyles}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#4B5563' }}>
            Add New Category
          </div>
          <CategoryForm
            section={section}
            onSubmit={handleAddCategory}
            onCancel={() => setIsAddingCategory(false)}
          />
        </div>
      )}
      
      {isExpanded && hasCategories && (
        <div style={categoriesContainerStyles}>
          {sectionCategories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              onSelect={onSelectCategory}
              selectedId={selectedCategoryId}
              onCategoryUpdate={onCategoryUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ onSelectCategory, selectedCategoryId }) => {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingSection, setIsAddingSection] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isLoading) setIsLoading(true);
    try {
      // Load sections and categories
      const sectionsData = await sectionsService.getSectionsWithCategories();
      setSections(sectionsData);
      
      // Flatten categories from all sections
      const allCategories = [];
      sectionsData.forEach(section => {
        if (section.v2_categories && section.v2_categories.length > 0) {
          allCategories.push(...section.v2_categories);
        }
      });
      
      setCategories(allCategories);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (formData) => {
    try {
      await sectionsService.create(formData);
      setIsAddingSection(false);
      await loadData();
    } catch (err) {
      setError('Failed to create section');
      console.error('Error creating section:', err);
    }
  };

  // Styles
  const containerStyles = {
    marginBottom: '16px'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const titleStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1F2937'
  };

  const addButtonStyles = {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#3B82F6',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const formContainerStyles = {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const contentContainerStyles = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px'
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

  const emptyStateStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 16px',
    textAlign: 'center'
  };

  const emptyIconStyles = {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    marginBottom: '16px'
  };

  const emptyTitleStyles = {
    color: '#6B7280',
    marginBottom: '16px'
  };

  const emptyDescriptionStyles = {
    color: '#9CA3AF',
    fontSize: '14px'
  };

  const sectionsContainerStyles = {
    padding: '16px'
  };

  if (isLoading) {
    return (
      <div style={loadingStyles}>
        <div style={spinnerStyles}></div>
        <span style={loadingTextStyles}>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyles}>
        <svg xmlns="http://www.w3.org/2000/svg" style={errorIconStyles} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>Study Guide Categories</h3>
        <button
          onClick={() => setIsAddingSection(true)}
          style={addButtonStyles}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Section
        </button>
      </div>

      {isAddingSection && (
        <div style={formContainerStyles}>
          <SectionForm
            onSubmit={handleAddSection}
            onCancel={() => setIsAddingSection(false)}
          />
        </div>
      )}

      <div style={contentContainerStyles}>
        {sections.length === 0 ? (
          <div style={emptyStateStyles}>
            <svg xmlns="http://www.w3.org/2000/svg" style={emptyIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p style={emptyTitleStyles}>No sections found.</p>
            <p style={emptyDescriptionStyles}>Create a section to get started with organizing your study guides.</p>
          </div>
        ) : (
          <div style={sectionsContainerStyles}>
            {sections.map(section => (
              <SectionItem
                key={section.id}
                section={section}
                categories={categories}
                onSelectCategory={onSelectCategory}
                selectedCategoryId={selectedCategoryId}
                onSectionUpdate={loadData}
                onCategoryUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
