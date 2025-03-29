import React, { useState, useEffect, useContext } from 'react';
import StudyGuideEditor from './components/StudyGuideEditor';
import StudyGuideManagement from './components/StudyGuideManagement';
import SectionManagement from './components/SectionManagement';
import CategoryManagement from './components/CategoryManagement';
import { studyGuidesService } from '../../services/api/studyGuides';
import { sectionsService } from '../../services/api/sections';
import { CategoryContext } from '../../components/layout/AdminLayout';

const StudyGuides = () => {
  const { selectedCategory, setSelectedCategory, setResetStudyGuideSelection, sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGuides, setStudyGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resetSelection = () => {
      setSelectedStudyGuide(null);
      setIsCreating(false);
    };
    
    setResetStudyGuideSelection(() => resetSelection);
    
    return () => {
      setResetStudyGuideSelection(() => () => {});
    };
  }, [setResetStudyGuideSelection]);

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

  useEffect(() => {
    if (selectedCategory) {
      loadStudyGuides();
      
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
      // Optimistically update UI
      const newSectionsData = sectionsData.map(section => {
        if (section.v2_categories) {
          return {
            ...section,
            v2_categories: section.v2_categories.map(category => {
              if (category.id === selectedCategory.id) {
                return {
                  ...category,
                  study_guides: (category.study_guides || []).filter(guide => guide.id !== selectedStudyGuide.id)
                };
              }
              return category;
            })
          };
        }
        return section;
      });
      
      // Update local state
      setStudyGuides(prev => prev.filter(guide => guide.id !== selectedStudyGuide.id));
      
      // Update context
      optimisticallyUpdateSectionsOrder(newSectionsData);
      
      // Make API call
      await studyGuidesService.delete(selectedStudyGuide.id);
      setSelectedStudyGuide(null);
    } catch (error) {
      console.error('Error deleting study guide:', error);
      await loadStudyGuides(); // Revert on error
      throw error;
    }
  };

  const handleSave = async (studyGuideData) => {
    try {
      let savedGuide;
      const display_order = Math.max(...studyGuides.map(g => g.display_order), -1) + 1;

      if (isCreating) {
        // Optimistically update the UI before API call
        const tempId = 'temp-' + Date.now();
        const newGuide = {
          id: tempId,
          ...studyGuideData,
          category_id: selectedCategory.id,
          display_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Update local state
        setStudyGuides(prev => [...prev, newGuide]);

        // Update context with temporary ID
        const tempSectionsData = sectionsData.map(section => {
          if (section.v2_categories) {
            return {
              ...section,
              v2_categories: section.v2_categories.map(category => {
                if (category.id === selectedCategory.id) {
                  return {
                    ...category,
                    study_guides: [...(category.study_guides || []), newGuide]
                  };
                }
                return category;
              })
            };
          }
          return section;
        });
        optimisticallyUpdateSectionsOrder(tempSectionsData);

        // Make API call
        savedGuide = await studyGuidesService.create({
          ...studyGuideData,
          category_id: selectedCategory.id,
          display_order
        });

        // Update local state with real ID
        setStudyGuides(prev => prev.map(guide => 
          guide.id === tempId ? savedGuide : guide
        ));

        // Update context with real ID
        const finalSectionsData = sectionsData.map(section => {
          if (section.v2_categories) {
            return {
              ...section,
              v2_categories: section.v2_categories.map(category => {
                if (category.id === selectedCategory.id) {
                  return {
                    ...category,
                    study_guides: (category.study_guides || []).map(guide =>
                      guide.id === tempId ? savedGuide : guide
                    )
                  };
                }
                return category;
              })
            };
          }
          return section;
        });
        optimisticallyUpdateSectionsOrder(finalSectionsData);

      } else {
        // Update existing guide
        // Optimistically update UI
        const updatedGuide = {
          ...selectedStudyGuide,
          ...studyGuideData,
          updated_at: new Date().toISOString()
        };

        // Update local state
        setStudyGuides(prev => prev.map(guide =>
          guide.id === selectedStudyGuide.id ? updatedGuide : guide
        ));

        // Update context
        const newSectionsData = sectionsData.map(section => {
          if (section.v2_categories) {
            return {
              ...section,
              v2_categories: section.v2_categories.map(category => {
                if (category.id === selectedCategory.id) {
                  return {
                    ...category,
                    study_guides: (category.study_guides || []).map(guide =>
                      guide.id === selectedStudyGuide.id ? updatedGuide : guide
                    )
                  };
                }
                return category;
              })
            };
          }
          return section;
        });
        optimisticallyUpdateSectionsOrder(newSectionsData);

        // Make API call
        savedGuide = await studyGuidesService.update(selectedStudyGuide.id, studyGuideData);
      }
      
      setIsCreating(false);
      setSelectedStudyGuide(null);
    } catch (error) {
      console.error('Error saving study guide:', error);
      await loadStudyGuides(); // Revert on error
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

              // Optimistically update local state
              const updatedGuides = [...studyGuides];
              updates.forEach(update => {
                const guide = updatedGuides.find(g => g.id === update.id);
                if (guide) {
                  guide.display_order = update.display_order;
                }
              });
              updatedGuides.sort((a, b) => a.display_order - b.display_order);
              setStudyGuides(updatedGuides);

              // Update context
              const newSectionsData = sectionsData.map(section => {
                if (section.v2_categories) {
                  return {
                    ...section,
                    v2_categories: section.v2_categories.map(category => {
                      if (category.id === selectedCategory.id) {
                        return {
                          ...category,
                          study_guides: updatedGuides
                        };
                      }
                      return category;
                    })
                  };
                }
                return section;
              });
              optimisticallyUpdateSectionsOrder(newSectionsData);

              // Make API call
              const updatesWithCategory = updates.map(update => ({
                ...update,
                category_id: selectedCategory.id
              }));
              await studyGuidesService.updateOrder(updatesWithCategory);
            } catch (err) {
              console.error('Error updating order:', err);
              await loadStudyGuides(); // Revert on error
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
