import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studyGuidesService } from '../services/api/studyGuides';
import { sectionsService } from '../services/api/sections';
import SectionGrid from '../components/SectionGrid';
import CategoryGrid from '../components/CategoryGrid';
import StudyGuideList from '../components/StudyGuideList'; // Sidebar list
import PublicStudyGuideList from '../components/PublicStudyGuideList'; // Main content list
import StudyGuideViewer from '../components/StudyGuideViewer';

const StudyGuidePage = () => {
  const { sectionId, categoryId, studyGuideId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Manage sections data locally instead of from context
  const [sectionsData, setSectionsData] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState(null);

  // Effect to fetch sections data
  useEffect(() => {
    const fetchSections = async () => {
      console.log('[StudyGuidePage] Starting to fetch sections...');
      setIsLoadingSections(true);
      setSectionsError(null);
      try {
        const data = await sectionsService.getSectionsWithCategories();
        console.log('[StudyGuidePage] Sections data received:', data?.length || 0, 'sections');
        setSectionsData(data || []);
      } catch (error) {
        console.error('[StudyGuidePage] Error loading sections:', error);
        setSectionsError('Failed to load sections. Please try again later.');
      } finally {
        console.log('[StudyGuidePage] Setting isLoadingSections to false');
        setIsLoadingSections(false);
      }
    };

    console.log('[StudyGuidePage] Initial sections fetch effect running');
    fetchSections();
  }, []); // Only fetch once on mount

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

  // Derive current section and its categories from sections data when sectionId or sectionsData changes
   useEffect(() => {
    console.log('[StudyGuidePage] Section derivation effect running:', {
      sectionId,
      'sectionsData.length': sectionsData?.length || 0,
      isLoadingSections
    });

    if (sectionId && sectionsData.length > 0) {
      const section = sectionsData.find(sec => sec.id === sectionId);
      console.log('[StudyGuidePage] Found section:', section?.name || 'Not found');
      setCurrentSection(section || { id: sectionId, name: 'Loading...' });
      setCategories(section?.v2_categories || []);
      console.log('[StudyGuidePage] Set categories:', section?.v2_categories?.length || 0, 'categories');
    } else if (!sectionId) {
      console.log('[StudyGuidePage] No sectionId, clearing section and categories');
      setCurrentSection(null);
      setCategories([]);
    } else if (sectionId && isLoadingSections) {
      console.log('[StudyGuidePage] Sections still loading, showing loading state');
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

  // Handler for selecting a guide from the public list
  const handlePublicGuideSelect = (guide) => {
    if (guide && sectionId && categoryId) {
      navigate(`/study/${sectionId}/${categoryId}/${guide.id}`);
    }
  };

  // Using Tailwind classes instead of inline styles

  // Render breadcrumb navigation (using derived state)
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center mb-6 text-sm text-slate-500">
        <Link to="/study" className="text-teal-700 no-underline mr-2">Study Guides</Link>

        {sectionId && (
          <>
            <span className="mx-2">›</span>
            <Link
              to={`/study/${sectionId}`}
              className={`text-teal-700 no-underline mr-2 ${!categoryId ? 'font-bold' : 'font-normal'}`}
            >
              {currentSection?.name || 'Section'}
            </Link>
          </>
        )}

        {categoryId && (
          <>
            <span className="mx-2">›</span>
            <Link
              to={`/study/${sectionId}/${categoryId}`}
              className={`text-teal-700 no-underline mr-2 ${!studyGuideId ? 'font-bold' : 'font-normal'}`}
            >
              {currentCategory?.name || 'Category'}
            </Link>
          </>
        )}

        {studyGuideId && currentStudyGuide && (
          <>
            <span className="mx-2">›</span>
            <span className="font-bold">{currentStudyGuide.title}</span>
          </>
        )}
      </div>
    );
  };

  // Combine loading states
  const isPageLoading = isLoadingSections || (sectionId && categories.length === 0 && !sectionsError); // Consider sections loading or categories not yet derived

  return (
    <div className="py-4 w-full">
      <div className="mb-2 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-4xl text-teal-700 m-0">Study Guides</h2>
        <div className="flex items-center max-w-md w-full">
          <input
            type="text"
            placeholder="Search study guides..."
            className="py-3 px-3 border border-slate-200 rounded text-base w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error messages */}
      {sectionsError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{sectionsError}</div>}
      {/* Removed categoriesError as it's covered by sectionsError */}
      {studyGuidesError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{studyGuidesError}</div>}
      {studyGuideError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{studyGuideError}</div>}

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
        <div className="flex w-full gap-8 min-h-[calc(100vh-250px)] max-w-full">
          {/* Sidebar with study guide list - always visible when category is selected */}
          <div className="w-[250px] flex-shrink-0">
            <StudyGuideList
              studyGuides={studyGuides}
              sectionId={sectionId}
              categoryId={categoryId}
              selectedGuideId={studyGuideId}
              isLoading={isLoadingStudyGuides} // Use specific loading state for list
            />
          </div>

          {/* Main content area: Show list or viewer */}
          <div className="flex-1 w-full">
            {studyGuideId ? (
              <StudyGuideViewer
                studyGuide={currentStudyGuide}
                isLoading={isLoadingStudyGuide} // Only pass the guide-specific loading state
              />
            ) : (
              // Show the public list when no specific guide is selected
              <PublicStudyGuideList
                studyGuides={studyGuides}
                onSelect={handlePublicGuideSelect} // Use the new handler
                isLoading={isLoadingStudyGuides} // Use the list loading state
                error={studyGuidesError} // Pass error state
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGuidePage;
