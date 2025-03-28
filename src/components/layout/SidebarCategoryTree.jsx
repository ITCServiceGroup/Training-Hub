import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CategoryContext } from './AdminLayout';
import { sectionsService } from '../../services/api/sections';
import { FaFileAlt, FaList, FaLayerGroup, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SidebarCategoryItem = ({ 
  category, 
  onSelect, 
  selectedId, 
  sidebarLinkStyles
}) => {
  const navigate = useNavigate();
  const { resetStudyGuideSelection } = useContext(CategoryContext);
  
  const handleCategoryClick = () => {
    // Reset any selected study guide
    resetStudyGuideSelection();
    
    // Select the category
    onSelect(category);
    
    // Navigate to the study guides page if not already there
    navigate('/admin/study-guides');
  };

  // Styles
  const categoryItemStyles = {
    marginLeft: '4px',
    position: 'relative',
    padding: '8px 0'
  };

  const categoryLinkStyles = {
    ...sidebarLinkStyles,
    backgroundColor: selectedId === category.id ? '#0f766e' : 'transparent',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  };

  return (
    <div style={categoryItemStyles}>
      <div 
        style={categoryLinkStyles}
        onClick={handleCategoryClick}
      >
        <FaFileAlt style={{ marginRight: '8px', fontSize: '16px' }} />
        <span>{category.name}</span>
      </div>
    </div>
  );
};

const SidebarSectionItem = ({ 
  section, 
  categories, 
  onSelectCategory, 
  selectedCategoryId, 
  sidebarLinkStyles,
  onSectionClick
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const sectionCategories = categories.filter(cat => cat.section_id === section.id);
  const hasCategories = sectionCategories.length > 0;

  const handleSectionClick = () => {
    // Navigate to the categories management page for this section
    onSectionClick(section);
  };

  const handleExpandToggle = (e) => {
    e.stopPropagation(); // Prevent triggering the section click
    setIsExpanded(!isExpanded);
  };

  // Styles
  const sectionItemStyles = {
    marginBottom: '4px',
    position: 'relative',
    marginLeft: '8px'
  };

  const sectionHeaderStyles = {
    ...sidebarLinkStyles,
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  const categoriesContainerStyles = {
    marginTop: '4px',
    marginLeft: '12px',
    borderLeft: '1px solid #4B5563',
    paddingLeft: '8px'
  };

  const expandIconStyles = {
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px'
  };

  return (
    <div style={sectionItemStyles}>
      <div style={sectionHeaderStyles}>
        <span 
          style={expandIconStyles}
          onClick={handleExpandToggle}
        >
          {isExpanded ? 
            <FaChevronDown /> : 
            <FaChevronRight />
          }
        </span>
        <div 
          style={{ display: 'flex', alignItems: 'center', flex: 1 }}
          onClick={handleSectionClick}
        >
          <FaList style={{ fontSize: '16px', marginRight: '8px' }} />
          <span>{section.name}</span>
        </div>
      </div>
      
      {isExpanded && hasCategories && (
        <div style={categoriesContainerStyles}>
          {sectionCategories.map(category => (
            <SidebarCategoryItem
              key={category.id}
              category={category}
              onSelect={onSelectCategory}
              selectedId={selectedCategoryId}
              sidebarLinkStyles={sidebarLinkStyles}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarCategoryTree = ({ 
  onSelectCategory, 
  selectedCategoryId,
  sidebarLinkStyles
}) => {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { resetStudyGuideSelection } = useContext(CategoryContext);

  useEffect(() => {
    // Only load data if we're on the study guides page
    if (location.pathname.includes('/admin/study-guides')) {
      loadData();
    }
  }, [location.pathname]);

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

  const handleSectionsClick = () => {
    // Reset any selected category or study guide
    resetStudyGuideSelection();
    onSelectCategory(null);
    
    // Dispatch a custom event to reset the selected section in StudyGuides component
    const event = new CustomEvent('resetSections', { detail: null });
    window.dispatchEvent(event);
    
    // Navigate to the study guides page (which will show sections)
    navigate('/admin/study-guides');
  };

  const handleSectionClick = (section) => {
    // Navigate to the categories management page for this section
    resetStudyGuideSelection();
    onSelectCategory(null);
    navigate('/admin/study-guides');
    
    // This will trigger the StudyGuides component to show the categories for this section
    const event = new CustomEvent('sectionSelected', { detail: section });
    window.dispatchEvent(event);
  };

  const handleExpandToggle = (e) => {
    e.stopPropagation(); // Prevent triggering the sections click
    setIsExpanded(!isExpanded);
  };

  // Only show if we're on the study guides page
  if (!location.pathname.includes('/admin/study-guides')) {
    return null;
  }

  // Styles
  const containerStyles = {
    marginTop: '8px'
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 'bold'
  };

  const expandIconStyles = {
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px'
  };

  const headerTextStyles = {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flex: 1
  };

  const loadingStyles = {
    padding: '12px',
    color: '#9CA3AF',
    fontSize: '14px',
    textAlign: 'center'
  };

  const errorStyles = {
    padding: '12px',
    color: '#EF4444',
    fontSize: '14px'
  };

  const sectionsContainerStyles = {
    marginTop: '8px'
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <span 
          style={expandIconStyles}
          onClick={handleExpandToggle}
        >
          {isExpanded ? 
            <FaChevronDown /> : 
            <FaChevronRight />
          }
        </span>
        <div 
          style={headerTextStyles}
          onClick={handleSectionsClick}
        >
          <FaLayerGroup style={{ fontSize: '18px', marginRight: '8px' }} />
          <span>Sections</span>
        </div>
      </div>

      {isExpanded && (
        <div>
          {isLoading ? (
            <div style={loadingStyles}>Loading...</div>
          ) : error ? (
            <div style={errorStyles}>{error}</div>
          ) : (
            <div style={sectionsContainerStyles}>
              {sections.map(section => (
                <SidebarSectionItem
                  key={section.id}
                  section={section}
                  categories={categories}
                  onSelectCategory={onSelectCategory}
                  selectedCategoryId={selectedCategoryId}
                  sidebarLinkStyles={sidebarLinkStyles}
                  onSectionClick={handleSectionClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarCategoryTree;
