import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studyGuidesService } from '../services/api/studyGuides'; // Keep only needed service
import { CategoryContext } from '../components/layout/AdminLayout'; // Import context
import SectionGrid from '../components/SectionGrid';
import CategoryGrid from '../components/CategoryGrid';
import StudyGuideList from '../components/StudyGuideList';
import StudyGuideViewer from '../components/StudyGuideViewer';

const StudyGuidePage = () => {
  const { sectionId, categoryId, studyGuideId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Get sections data and loading state from context
  const { sectionsData, isLoadingSections, sectionsError } = useContext(CategoryContext);

  // Local state for guides and current items derived from context/params
  const [studyGuides, setStudyGuides] = useState([]);
  const [currentStudyGuide, setCurrentStudyGuide] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [categories, setCategories] = useState([]); // Categories for the current section

  // Loading states (keep guide-specific ones)
  const [isLoadingStudyGuides, setIsLoadingStudyGuides] = useState(false);
  const [isLoadingStudyGuide, setIsLoadingStudyGuide] = useState(false);

  // Error states (keep guide-specific ones)
  const [studyGuidesError, setStudyGuidesError] = useState(null);
  const [studyGuideError, setStudyGuideError] = useState(null);

  // Derive current section and its categories from context data when sectionId or sectionsData changes
   useEffect(() => {
    if (sectionId && sectionsData.length > 0) {
      const section = sectionsData.find(sec => sec.id === sectionId);
      setCurrentSection(section || { id: sectionId, name: 'Loading...' }); // Show loading state initially
      setCategories(section?.v2_categories || []);
    } else if (!sectionId) {
      setCurrentSection(null);
      setCategories([]);
    }
    // Add a check for when sectionsData is loading
    if (sectionId && isLoadingSections) {
        setCurrentSection({ id: sectionId, name: 'Loading...' });
        setCategories([]);
    }
  }, [sectionId, sectionsData, isLoadingSections]);

  // Derive current category when categoryId or categories change
  useEffect(() => {
     if (categoryId && categories.length > 0) {
       const category = categories.find(cat => cat.id === categoryId);
       setCurrentCategory(category || { id: categoryId, name: 'Loading...' });
     } else if (!categoryId) {
       setCurrentCategory(null);
     }
     // Add a check for when parent section/categories are loading
     if (categoryId && isLoadingSections) {
         setCurrentCategory({ id: categoryId, name: 'Loading...' });
     }
  }, [categoryId, categories, isLoadingSections]);


  // Fetch study guides list when categoryId changes (and categories are available or loading)
  useEffect(() => {
    // Allow fetch if categoryId exists, unless sections have loaded AND categories are confirmed empty
    if (!categoryId || (!isLoadingSections && categories.length === 0 && !categories.some(cat => cat.id === categoryId))) {
      setStudyGuides([]);
      // Don't clear currentCategory here, let the other effect handle it
      return; // Exit if no categoryId, or if sections loaded but this category isn't in the derived list
    }

    // Check if the current category actually exists in the derived list
    const categoryExists = categories.some(cat => cat.id === categoryId);
    if (!categoryExists && !isLoadingSections) { // Avoid fetching if category isn't valid (and sections aren't loading)
        setStudyGuides([]);
        setStudyGuidesError(`Category with ID ${categoryId} not found.`);
        return;
    }


    const fetchStudyGuides = async () => {
      setIsLoadingStudyGuides(true);
      setStudyGuidesError(null);

      try {
        // Fetch guides only if categoryId is valid and derived category exists or sections are still loading
        if (categoryId && (categoryExists || isLoadingSections)) {
            const guides = await studyGuidesService.getByCategoryId(categoryId);
            setStudyGuides(guides);
        } else if (!isLoadingSections) {
             // If sections finished loading but category doesn't exist, clear guides
             setStudyGuides([]);
        }
      } catch (error) {
        console.error('Error fetching study guides:', error);
        setStudyGuidesError('Failed to load study guides. Please try again later.');
      } finally {
        setIsLoadingStudyGuides(false);
      }
    };

    fetchStudyGuides();
  // Depend on categoryId and the derived categories list, and isLoadingSections
  }, [categoryId, categories, isLoadingSections]);


  // Fetch specific study guide when studyGuideId changes
  useEffect(() => {
    console.log(`[StudyGuidePage] Effect for fetching guide runs. studyGuideId: ${studyGuideId}, categoryId: ${categoryId}`);
    if (!studyGuideId) {
      console.log('[StudyGuidePage] No studyGuideId, clearing current guide.');
      setCurrentStudyGuide(null);
      return;
    }

    // Only fetch if categoryId is also present (implies valid path)
    if (!categoryId) {
        console.log('[StudyGuidePage] No categoryId, skipping fetch.');
        return;
    }

    const fetchStudyGuide = async () => {
      console.log(`[StudyGuidePage] Calling fetchStudyGuide for ID: ${studyGuideId}`);
      setIsLoadingStudyGuide(true);
      setStudyGuideError(null);

      try {
        console.log(`[StudyGuidePage] Awaiting studyGuidesService.getWithCategory(${studyGuideId})`);
        const guide = await studyGuidesService.getWithCategory(studyGuideId);
        console.log('[StudyGuidePage] API call successful, received guide:', guide);
        setCurrentStudyGuide(guide);
        // Optionally update currentCategory/Section if needed based on guide details, though derivation effects should handle it
        if (guide && guide.v2_categories && !currentCategory) {
            setCurrentCategory(guide.v2_categories);
        }
        if (guide && guide.v2_categories?.v2_sections && !currentSection) {
            setCurrentSection(guide.v2_categories.v2_sections);
        }

      } catch (error) {
        console.error('[StudyGuidePage] Error fetching study guide:', error);
        setStudyGuideError('Failed to load study guide. Please try again later.');
        setCurrentStudyGuide(null); // Clear on error
      } finally {
        console.log('[StudyGuidePage] Setting isLoadingStudyGuide to false.');
        setIsLoadingStudyGuide(false);
      }
    };

    fetchStudyGuide();
  }, [studyGuideId, categoryId]); // Add categoryId dependency


  // Styles (Copied from original, no changes needed here)
  const pageStyles = {
    padding: '1rem 0',
    width: '100%',
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

  const contentLayoutStyles = {
    display: 'flex',
    width: '100%',
    gap: '2rem',
    minHeight: 'calc(100vh - 250px)', // Use viewport height minus header/footer/margins
    maxWidth: '100%'
  };

  const sidebarStyles = {
    width: '250px',
    flexShrink: 0
  };

  const mainContentStyles = {
    flex: '1 1 auto',
    width: '100%',
    maxWidth: 'calc(100% - 250px - 2rem)' // Subtract sidebar width and gap
  };

  const errorStyles = {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem'
  };

  // Render breadcrumb navigation (using derived state)
  const renderBreadcrumbs = () => {
    return (
      <div style={breadcrumbStyles}>
        <Link to="/study" style={breadcrumbLinkStyles}>Study Guides</Link>

        {sectionId && (
          <>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <Link
              to={`/study/${sectionId}`}
              style={{
                ...breadcrumbLinkStyles,
                fontWeight: !categoryId ? 'bold' : 'normal'
              }}
            >
              {currentSection?.name || 'Section'}
            </Link>
          </>
        )}

        {categoryId && (
          <>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <Link
              to={`/study/${sectionId}/${categoryId}`}
              style={{
                ...breadcrumbLinkStyles,
                fontWeight: !studyGuideId ? 'bold' : 'normal'
              }}
            >
              {currentCategory?.name || 'Category'}
            </Link>
          </>
        )}

        {studyGuideId && currentStudyGuide && (
          <>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <span style={{ fontWeight: 'bold' }}>{currentStudyGuide.title}</span>
          </>
        )}
      </div>
    );
  };

  // Combine loading states
  const isPageLoading = isLoadingSections || (sectionId && categories.length === 0 && !sectionsError); // Consider sections loading or categories not yet derived

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

      {/* Error messages */}
      {sectionsError && <div style={errorStyles}>{sectionsError}</div>}
      {/* Removed categoriesError as it's covered by sectionsError */}
      {studyGuidesError && <div style={errorStyles}>{studyGuidesError}</div>}
      {studyGuideError && <div style={errorStyles}>{studyGuideError}</div>}

      {/* Breadcrumb navigation */}
      {(sectionId || categoryId || studyGuideId) && renderBreadcrumbs()}

      {/* Main content area with conditional rendering based on navigation state */}
      {!sectionId ? (
        /* Section view (no section selected) */
        <>
          <p>Select a section below to start learning.</p>
          <SectionGrid
            sections={sectionsData} // Use context data
            isLoading={isLoadingSections} // Use context loading state
            searchQuery={searchQuery}
          />
        </>
      ) : !categoryId ? (
        /* Category view (section selected, no category selected) */
        <>
          <p>Select a category below to view study guides.</p>
          <CategoryGrid
            categories={categories} // Use derived categories state
            sectionId={sectionId}
            isLoading={isLoadingSections} // Still depends on sections loading
            searchQuery={searchQuery}
          />
        </>
      ) : (
        /* Study guide view (section and category selected) */
        <div style={contentLayoutStyles}>
          {/* Sidebar with study guide list - always visible when category is selected */}
          <div style={sidebarStyles}>
            <StudyGuideList
              studyGuides={studyGuides}
              sectionId={sectionId}
              categoryId={categoryId}
              selectedGuideId={studyGuideId}
              isLoading={isLoadingStudyGuides} // Use specific loading state for list
            />
          </div>

          {/* Main content area */}
          <div style={mainContentStyles}>
            <StudyGuideViewer
              studyGuide={currentStudyGuide}
              isLoading={isLoadingStudyGuide} // Only pass the guide-specific loading state
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGuidePage;
