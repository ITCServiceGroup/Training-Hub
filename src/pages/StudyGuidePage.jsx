import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categoriesService } from '../services/api/categories';
import { studyGuidesService } from '../services/api/studyGuides';
import { sectionsService } from '../services/api/sections';
import SectionGrid from '../components/SectionGrid';
import CategoryGrid from '../components/CategoryGrid';
import StudyGuideList from '../components/StudyGuideList';
import StudyGuideViewer from '../components/StudyGuideViewer';

const StudyGuidePage = () => {
  const { sectionId, categoryId, studyGuideId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for data
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studyGuides, setStudyGuides] = useState([]);
  const [currentStudyGuide, setCurrentStudyGuide] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  
  // Loading states
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingStudyGuides, setIsLoadingStudyGuides] = useState(false);
  const [isLoadingStudyGuide, setIsLoadingStudyGuide] = useState(false);
  
  // Error states
  const [sectionsError, setSectionsError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [studyGuidesError, setStudyGuidesError] = useState(null);
  const [studyGuideError, setStudyGuideError] = useState(null);

  // Fetch sections
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoadingSections(true);
      setSectionsError(null);
      
      try {
        const data = await sectionsService.getSectionsWithCategories();
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSectionsError('Failed to load sections. Please try again later.');
      } finally {
        setIsLoadingSections(false);
      }
    };
    
    fetchSections();
  }, []);

  // Fetch categories when section changes
  useEffect(() => {
    if (!sectionId) {
      setCategories([]);
      setCurrentSection(null);
      return;
    }
    
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      
      try {
        const cats = await categoriesService.getBySectionId(sectionId);
        setCategories(cats);
        
        // Find current section
        const section = sections.find(sec => sec.id === sectionId);
        setCurrentSection(section || { id: sectionId, name: 'Unknown Section' });
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [sectionId, sections]);

  // Fetch study guides when category changes
  useEffect(() => {
    if (!categoryId) {
      setStudyGuides([]);
      setCurrentCategory(null);
      return;
    }
    
    const fetchStudyGuides = async () => {
      setIsLoadingStudyGuides(true);
      setStudyGuidesError(null);
      
      try {
        const guides = await studyGuidesService.getByCategoryId(categoryId);
        setStudyGuides(guides);
        
        // Find current category
        const category = categories.find(cat => cat.id === categoryId);
        setCurrentCategory(category || { id: categoryId, name: 'Unknown Category' });
      } catch (error) {
        console.error('Error fetching study guides:', error);
        setStudyGuidesError('Failed to load study guides. Please try again later.');
      } finally {
        setIsLoadingStudyGuides(false);
      }
    };
    
    fetchStudyGuides();
  }, [categoryId, categories]);

  // Fetch specific study guide when studyGuideId changes
  useEffect(() => {
    if (!studyGuideId) {
      setCurrentStudyGuide(null);
      return;
    }
    
    const fetchStudyGuide = async () => {
      setIsLoadingStudyGuide(true);
      setStudyGuideError(null);
      
      try {
        const guide = await studyGuidesService.getWithCategory(studyGuideId);
        setCurrentStudyGuide(guide);
      } catch (error) {
        console.error('Error fetching study guide:', error);
        setStudyGuideError('Failed to load study guide. Please try again later.');
      } finally {
        setIsLoadingStudyGuide(false);
      }
    };
    
    fetchStudyGuide();
  }, [studyGuideId]);

  // Styles
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

  // Render breadcrumb navigation
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
      {categoriesError && <div style={errorStyles}>{categoriesError}</div>}
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
            sections={sections} 
            isLoading={isLoadingSections}
            searchQuery={searchQuery}
          />
        </>
      ) : !categoryId ? (
        /* Category view (section selected, no category selected) */
        <>
          <p>Select a category below to view study guides.</p>
          <CategoryGrid 
            categories={categories} 
            sectionId={sectionId}
            isLoading={isLoadingCategories}
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
              isLoading={isLoadingStudyGuides}
            />
          </div>
          
          {/* Main content area */}
          <div style={mainContentStyles}>
            <StudyGuideViewer
              studyGuide={currentStudyGuide}
              isLoading={isLoadingStudyGuide}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGuidePage;
