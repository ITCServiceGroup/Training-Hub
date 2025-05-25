import React, { useState, useContext, useEffect } from 'react'; // Ensure useEffect is imported
import { useLocation, useNavigate } from 'react-router-dom';
import { CategoryContext } from './AdminLayout';
import { FaFileAlt, FaList, FaLayerGroup, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SidebarCategoryItem = ({
  category,
  onSelect,
  selectedId
}) => {
  const navigate = useNavigate();
  const { resetStudyGuideSelection } = useContext(CategoryContext);

  const handleCategoryClick = () => {
    resetStudyGuideSelection();
    onSelect(category);
    navigate('/admin/study-guides');
  };

  return (
    <div className="ml-1 relative py-2">
      <div
        className={`text-white flex items-center cursor-pointer p-3 rounded text-sm ${selectedId === category.id ? 'bg-primary' : 'bg-transparent'}`}
        onClick={handleCategoryClick}
      >
        <FaFileAlt className="mr-2 text-base" />
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

  // Using Tailwind classes instead of inline styles

  return (
    <div className="mb-1 relative ml-2">
      <div className="text-white p-3 rounded cursor-pointer flex items-center">
        <span
          className="cursor-pointer text-xs mr-2"
          onClick={handleExpandToggle}
        >
          {/* Show icon only if categories exist */}
          {hasCategories ? (isExpanded ? <FaChevronDown /> : <FaChevronRight />) : <span className="w-3 inline-block"></span>}
        </span>
        <div
          className="flex items-center flex-1"
          onClick={handleSectionClick}
        >
          <FaList className="text-base mr-2" />
          <span>{section.name}</span>
        </div>
      </div>

      {isExpanded && hasCategories && (
        <div className="mt-1 ml-3 border-l border-gray-600 pl-2">
          {sectionCategories.map(category => (
            <SidebarCategoryItem
              key={category.id}
              category={category}
              onSelect={onSelectCategory}
              selectedId={selectedCategoryId}
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
  selectedCategoryId
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

  // Using Tailwind classes instead of inline styles


  return (
    <div className="mt-2">
      <div className="flex items-center p-3 rounded text-white font-bold">
        <span
          className="cursor-pointer text-xs mr-2"
          onClick={handleOverallExpandToggle}
        >
          {isOverallExpanded ?
            <FaChevronDown /> :
            <FaChevronRight />
          }
        </span>
        <div
          className="cursor-pointer flex items-center flex-1"
          onClick={handleSectionsClick}
        >
          <FaLayerGroup className="text-lg mr-2" />
          <span>Sections</span>
        </div>
      </div>

      {isOverallExpanded && (
        <div>
          {isLoading ? (
            <div className="p-3 text-gray-400 text-sm text-center">Loading...</div>
          ) : error ? (
            <div className="p-3 text-red-500 text-sm">{error}</div>
          ) : (
            <div className="mt-2">
              {sections.map(section => (
                <SidebarSectionItem
                  key={section.id}
                  section={section}
                  onSelectCategory={onSelectCategory}
                  selectedCategoryId={selectedCategoryId}
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
