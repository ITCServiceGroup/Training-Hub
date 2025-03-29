import React, { useState, useContext, useEffect } from 'react'; // Ensure useEffect is imported
import { useLocation, useNavigate } from 'react-router-dom';
import { CategoryContext } from './AdminLayout';
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
    resetStudyGuideSelection();
    onSelect(category);
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

// Modified SidebarSectionItem for individual state persistence
const SidebarSectionItem = ({ 
  section, 
  onSelectCategory, 
  selectedCategoryId, 
  sidebarLinkStyles,
  onSectionClick,
}) => {
  const storageKey = `sidebarSectionExpanded_${section.id}`;
  
  // Initialize state from localStorage, defaulting to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      // Default to true if nothing saved or if not explicitly 'false'
      return savedState !== 'false'; 
    } catch (e) {
      console.error("Failed to read localStorage for section:", section.id, e);
      return true; // Default to expanded on error
    }
  });

  const sectionCategories = section.v2_categories || [];
  const hasCategories = sectionCategories.length > 0;

  // Save state to localStorage whenever it changes for this specific section
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, isExpanded);
    } catch (e) {
      console.error("Failed to write to localStorage for section:", section.id, e);
    }
  }, [isExpanded, storageKey]); // Depend on isExpanded and storageKey

  const handleSectionClick = () => {
    onSectionClick(section);
  };

  // Toggle and save state
  const handleExpandToggle = (e) => {
    e.stopPropagation(); 
    setIsExpanded(prevExpanded => !prevExpanded); // Use functional update
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
          onClick={handleExpandToggle} // Use updated handler
        >
          {/* Show icon only if categories exist */}
          {hasCategories ? (isExpanded ? <FaChevronDown /> : <FaChevronRight />) : <span style={{ width: '12px', display: 'inline-block' }}></span>} 
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

// Main SidebarCategoryTree component remains largely the same
const SidebarCategoryTree = ({ 
  onSelectCategory, 
  selectedCategoryId,
  sidebarLinkStyles,
}) => {
  const {
    sectionsData: sections, 
    isLoadingSections: isLoading, 
    sectionsError: error, 
    resetStudyGuideSelection,
  } = useContext(CategoryContext);

  const [isOverallExpanded, setIsOverallExpanded] = useState(() => { // Renamed state variable
    try {
      const savedState = localStorage.getItem('sidebarSectionsExpanded');
      return savedState === 'true'; 
    } catch (e) {
      console.error("Failed to read localStorage:", e);
      return false; 
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('sidebarSectionsExpanded', isOverallExpanded);
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  }, [isOverallExpanded]);

  const handleSectionsClick = () => {
    resetStudyGuideSelection();
    onSelectCategory(null);
    const event = new CustomEvent('resetSections', { detail: null });
    window.dispatchEvent(event);
    navigate('/admin/study-guides');
  };

  const handleSectionClick = (section) => {
    resetStudyGuideSelection();
    onSelectCategory(null);
    navigate('/admin/study-guides');
    const event = new CustomEvent('sectionSelected', { detail: section });
    window.dispatchEvent(event);
  };

  const handleOverallExpandToggle = (e) => { // Renamed handler
    e.stopPropagation(); 
    setIsOverallExpanded(prevExpanded => !prevExpanded); 
  };

  if (!location.pathname.includes('/admin/study-guides')) {
    return null;
  }

  // Styles remain the same...
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
          onClick={handleOverallExpandToggle} // Use renamed handler
        >
          {isOverallExpanded ? 
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

      {isOverallExpanded && ( // Use renamed state variable
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
