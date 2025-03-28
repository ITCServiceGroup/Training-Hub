import React, { useState, useEffect, useContext } from 'react';
import StudyGuideEditor from './components/StudyGuideEditor';
import StudyGuideManagement from './components/StudyGuideManagement';
import SectionManagement from './components/SectionManagement';
import CategoryManagement from './components/CategoryManagement';
import { studyGuidesService } from '../../services/api/studyGuides';
import { sectionsService } from '../../services/api/sections';
import { CategoryContext } from '../../components/layout/AdminLayout';

const StudyGuides = () => {
  const { selectedCategory, setSelectedCategory, setResetStudyGuideSelection } = useContext(CategoryContext);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGuides, setStudyGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset function for clearing study guide selection
  useEffect(() => {
    const resetSelection = () => {
      setSelectedStudyGuide(null);
      setIsCreating(false);
    };
    
    setResetStudyGuideSelection(() => resetSelection);
    
    // Clean up when component unmounts
    return () => {
      setResetStudyGuideSelection(() => () => {});
    };
  }, [setResetStudyGuideSelection]);

  // Listen for section selection from sidebar
  useEffect(() => {
    const handleSectionSelected = (event) => {
      setSelectedSection(event.detail);
      setSelectedCategory(null);
    };

    const handleResetSections = () => {
      setSelectedSection(null);
      setSelectedCategory(null);
    };

    window.addEventListener('sectionSelected', handleSectionSelected);
    window.addEventListener('resetSections', handleResetSections);
    
    return () => {
      window.removeEventListener('sectionSelected', handleSectionSelected);
      window.removeEventListener('resetSections', handleResetSections);
    };
  }, []);

  // Load study guides when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadStudyGuides();
      
      // If we have a category but no section, load the section
      if (!selectedSection && selectedCategory.section_id) {
        loadSection(selectedCategory.section_id);
      }
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

  const loadSection = async (sectionId) => {
    try {
      const section = await sectionsService.getById(sectionId);
      setSelectedSection(section);
    } catch (err) {
      console.error('Error loading section:', err);
    }
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
      throw error;
    }
  };

  const handleSave = async (studyGuideData) => {
    try {
      if (isCreating) {
        await studyGuidesService.create({
          ...studyGuideData,
          category_id: selectedCategory.id,
          display_order: 0
        });
      } else {
        await studyGuidesService.update(selectedStudyGuide.id, studyGuideData);
      }
      
      setIsCreating(false);
      setSelectedStudyGuide(null);
      await loadStudyGuides();
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedCategory(null);
  };

  const handleBackToCategories = (section) => {
    if (section) {
      setSelectedSection(section);
      setSelectedCategory(null);
    } else {
      handleBackToSections();
    }
  };

  // Container styles
  const containerStyles = {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  };

  const contentStyles = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    minHeight: '500px'
  };

  // Render appropriate view based on selection state
  const renderContent = () => {
    if (selectedStudyGuide || isCreating) {
      return (
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
      );
    }

    if (selectedCategory) {
      return (
        <StudyGuideManagement
          section={selectedSection}
          category={selectedCategory}
          studyGuides={studyGuides}
          onSelect={handleStudyGuideSelect}
          selectedId={selectedStudyGuide?.id}
          onCreateNew={handleCreateNew}
          isLoading={isLoading}
          error={error}
          onBackToCategories={handleBackToCategories}
          onReorder={async (updates) => {
            try {
              if (!selectedCategory) return;
              const updatesWithCategory = updates.map(update => ({
                ...update,
                category_id: selectedCategory.id
              }));
              await studyGuidesService.updateOrder(updatesWithCategory);
              await loadStudyGuides();
            } catch (err) {
              console.error('Error updating order:', err);
              alert('Failed to update order');
            }
          }}
        />
      );
    }

    if (selectedSection) {
      return (
        <CategoryManagement
          section={selectedSection}
          onViewStudyGuides={handleCategorySelect}
          onBack={handleBackToSections}
        />
      );
    }

    return (
      <SectionManagement
        onViewCategories={handleSectionSelect}
      />
    );
  };

  return (
    <div style={containerStyles}>
      <div style={contentStyles}>
        {renderContent()}
      </div>
    </div>
  );
};

export default StudyGuides;
