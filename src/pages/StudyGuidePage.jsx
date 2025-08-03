import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { studyGuidesService } from '../services/api/studyGuides';
import { sectionsService } from '../services/api/sections';
import { searchService } from '../services/api/search';
import SectionGrid from '../components/SectionGrid';
import CategoryGrid from '../components/CategoryGrid';
import StudyGuideList from '../components/StudyGuideList'; // Sidebar list
import PublicStudyGuideList from '../components/PublicStudyGuideList'; // Main content list
import StudyGuideViewer from '../components/StudyGuideViewer';
import SearchResults from '../components/SearchResults';

const StudyGuidePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { sectionId, categoryId, studyGuideId } = useParams();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderScrolledAway, setIsHeaderScrolledAway] = useState(false); // State for header scroll

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
        // For public pages, only show published study guides
        const data = await sectionsService.getSectionsWithCategories(true);
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
            // For public pages, only show published study guides
            const guides = await studyGuidesService.getByCategoryId(categoryId, true);
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

        // Check if the guide is published - only show published guides to public users
        if (!guide.is_published) {
          console.log('[StudyGuidePage] Guide is not published, redirecting to category page');
          setStudyGuideError('This study guide is not available.');
          // Redirect to the category page
          navigate(`/study/${sectionId}/${categoryId}`);
          return;
        }

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


  // Effect to handle scroll position for sticky mobile menu/sidebar
  useEffect(() => {
    const HEADER_HEIGHT_THRESHOLD = 60; // Reduced height of the header in pixels

    // Simple throttle function
    const throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const handleScroll = () => {
      const scrolled = window.scrollY > HEADER_HEIGHT_THRESHOLD;
      // Only update state if it actually changes
      setIsHeaderScrolledAway(prevState => {
        if (prevState !== scrolled) {
          // console.log(`Header scrolled away: ${scrolled}`); // Debug log
          return scrolled;
        }
        return prevState;
      });
    };

    const throttledHandleScroll = throttle(handleScroll, 100); // Throttle scroll checks every 100ms

    window.addEventListener('scroll', throttledHandleScroll);
    // Initial check in case the page loads already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  // Handler for selecting a guide from the public list
  const handlePublicGuideSelect = (guide) => {
    if (guide && sectionId && categoryId) {
      navigate(`/study/${sectionId}/${categoryId}/${guide.id}`);
    }
  };

  // Handler for search
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchService.searchAll(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Clear search results when navigating
  useEffect(() => {
    setSearchResults(null);
    setSearchQuery('');
  }, [sectionId, categoryId, studyGuideId]);

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Using Tailwind classes instead of inline styles

  // Render breadcrumb navigation (using derived state)
  const renderBreadcrumbs = () => {
    return (
      <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        {sectionId && (
          <Link
            to={`/study/${sectionId}`}
            className={`text-secondary hover:text-secondary/80 no-underline mr-1 transition-colors ${!categoryId ? 'font-bold' : 'font-normal'}`}
          >
            {currentSection?.name || 'Section'}
          </Link>
        )}

        {categoryId && (
          <>
            <span className="mx-1">›</span>
            <Link
              to={`/study/${sectionId}/${categoryId}`}
              className={`text-secondary hover:text-secondary/80 no-underline mr-1 transition-colors ${!studyGuideId ? 'font-bold' : 'font-normal'}`}
            >
              {currentCategory?.name || 'Category'}
            </Link>
          </>
        )}

        {studyGuideId && currentStudyGuide && (
          <>
            <span className="mx-1">›</span>
            <span className={`font-bold ${isDark ? 'text-white' : ''}`}>{currentStudyGuide.title}</span>
          </>
        )}
      </div>
    );
  };

  // Combine loading states
  const isPageLoading = isLoadingSections || (sectionId && categories.length === 0 && !sectionsError); // Consider sections loading or categories not yet derived

  return (
    <div className="py-2 w-full flex flex-col flex-1">
      <div className="py-3 px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/study" className="no-underline">
              <h2 className={`text-3xl text-primary m-0 hover:opacity-90 transition-opacity`}>Learn</h2>
            </Link>
            {(sectionId || categoryId || studyGuideId) && (
              <div className="ml-2 pt-1">
                {renderBreadcrumbs()}
              </div>
            )}
          </div>
          <div className="flex items-center max-w-md w-full relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search sections, categories, guides, and content..."
              className={`py-2 px-3 border rounded text-sm w-full ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-slate-200 text-slate-900'}`}
              style={{ padding: '8px 12px', marginBottom: '0' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary/80 transition-colors`}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <FaTimes size={14} />
              </button>
            )}
            {isSearching && (
              <div className={`absolute ${searchQuery ? 'right-8' : 'right-3'} top-1/2 -translate-y-1/2`}>
                <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-gray-700 border-t-primary' : 'border-gray-200 border-t-primary'} animate-spin`}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error messages */}
      <div className="px-8">
        {sectionsError && <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-3 rounded-lg mb-2 text-sm`}>{sectionsError}</div>}
        {studyGuidesError && <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-3 rounded-lg mb-2 text-sm`}>{studyGuidesError}</div>}
        {studyGuideError && <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-3 rounded-lg mb-2 text-sm`}>{studyGuideError}</div>}
      </div>

      {/* Search Results */}
      <div className="flex flex-col">
        {searchResults && searchQuery ? (
          <div className="mt-4 px-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Search Results for "{searchQuery}"
              </h2>
              <button
                onClick={handleClearSearch}
                className={`px-3 py-1 text-sm rounded bg-secondary hover:bg-secondary/80 text-white transition-colors`}
              >
                Clear Search
              </button>
            </div>
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              searchQuery={searchQuery}
              onResultClick={handleClearSearch}
            />
          </div>
        ) : (
          /* Main content area with conditional rendering based on navigation state */
          !sectionId ? (
            /* Section view (no section selected) */
            <div className="px-8">
              <p className={`text-sm ${isDark ? 'text-gray-300' : ''} mt-1 mb-2`}>Select a section below to start learning.</p>
              <SectionGrid
                sections={sectionsData} // Use context data
                isLoading={isLoadingSections} // Use context loading state
                searchQuery={searchQuery}
              />
            </div>
          ) : !categoryId ? (
            /* Category view (section selected, no category selected) */
            <div className="px-8">
              <p className={`text-sm ${isDark ? 'text-gray-300' : ''} mt-1 mb-2`}>Select a category below to view study guides.</p>
              <CategoryGrid
                categories={categories} // Use derived categories state
                sectionId={sectionId}
                isLoading={isLoadingSections} // Still depends on sections loading
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            /* Study guide view (section and category selected) */
            <div
              className="flex relative w-full max-w-full"
              style={{ overflow: 'visible !important' }}
            >
            {/* Mobile menu button - Adjusted top based on scroll */}
            <button
              className={`md:hidden fixed ${isHeaderScrolledAway ? 'top-4' : 'top-16'} right-4 z-[60] p-2 ${isDark ? 'bg-slate-800 text-secondary hover:text-secondary/80' : 'bg-white text-secondary hover:text-secondary/80'} rounded-lg shadow-lg transition-colors`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
              <div
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[50]"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar with study guide list - sticky on desktop, fixed on mobile */}
            <div
              className={`
                fixed md:sticky left-0 z-[55] md:z-auto
                w-[250px] flex-shrink-0 transform transition-transform duration-300 ease-in-out
                ${isHeaderScrolledAway ? 'top-0 h-[calc(100vh-60px)]' : 'top-[60px] h-[calc(100vh-180px)]'}
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isDark ? 'bg-slate-800 md:bg-transparent' : 'bg-white md:bg-transparent'}
                md:top-0 md:self-start
              `}
              style={{
                height: 'calc(100vh - 240px)',
                maxHeight: 'calc(100vh - 240px)'
              }}
            >
            <StudyGuideList
              studyGuides={studyGuides}
              sectionId={sectionId}
              categoryId={categoryId}
              categoryName={currentCategory?.name}
              selectedGuideId={studyGuideId}
              isLoading={isLoadingStudyGuides}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main content area: Show list or viewer */}
          <div
            className="w-full md:ml-8 pr-8 mb-4"
            style={{ overflow: 'visible !important' }}
          >
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
      ))}
      </div>
    </div>
  );
};

export default StudyGuidePage;
