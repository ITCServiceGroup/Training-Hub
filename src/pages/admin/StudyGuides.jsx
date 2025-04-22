import React, { useState, useEffect, useContext, useCallback } from 'react';

import ContentEditor from './components/ContentEditor';
import StudyGuideManagement from './components/StudyGuideManagement';
import SectionManagement from './components/SectionManagement';
import CategoryManagement from './components/CategoryManagement';
import { studyGuidesService } from '../../services/api/studyGuides';
import { sectionsService } from '../../services/api/sections';
import { CategoryContext } from '../../components/layout/AdminLayout';

// Helper function to handle content initialization and validation
const getInitialJson = (studyGuide, isCreatingFlag) => {
  // For new guides or no content, return null to start with empty editor
  if (isCreatingFlag || !studyGuide?.content) {
    console.log('Starting with empty editor: isCreating=', isCreatingFlag);
    return null;
  }

  const content = studyGuide.content;
  console.log('Processing content type:', typeof content);

  // Function to validate ROOT node
  const validateRootNode = (obj) => {
    if (!obj || !obj.ROOT) {
      console.warn('Content is missing required ROOT node');
      return false;
    }
    // Ensure ROOT node has required properties
    if (!obj.ROOT.type || !obj.ROOT.nodes) {
      console.warn('ROOT node is missing required properties');
      return false;
    }
    return true;
  };

  try {
    // Case 1: Content is already an object
    if (typeof content === 'object' && content !== null) {
      console.log('Content is an object, validating structure...');
      if (validateRootNode(content)) {
        // Check if the ROOT node has any children
        if (content.ROOT.nodes && content.ROOT.nodes.length > 0) {
          console.log('ROOT node has children:', content.ROOT.nodes);
        } else {
          console.log('ROOT node has no children, adding a default Text node');

          // Create a new Text node
          const textNodeId = `text-${Date.now()}`;

          // Add the Text node to the ROOT node's nodes array
          content.ROOT.nodes = [textNodeId];

          // Add the Text node to the content object
          content[textNodeId] = {
            type: { resolvedName: 'Text' },
            isCanvas: false,
            props: {
              fontSize: '20',
              fontWeight: '400',
              text: 'Click to edit this text'
            },
            displayName: 'Text',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {}
          };
        }

        return JSON.stringify(content);
      }
      return null;
    }

    // Case 2: Content is a string
    if (typeof content === 'string') {
      const trimmed = content.trim();

      // Handle double-stringified JSON (legacy format)
      if (trimmed.startsWith('"{\\"ROOT\\":')) {
        console.log('Detected potential double-stringified JSON');
        const parsedOnce = JSON.parse(trimmed);
        const parsedTwice = JSON.parse(parsedOnce);

        if (validateRootNode(parsedTwice)) {
          console.log('Successfully processed double-stringified JSON');

          // Check if the ROOT node has any children
          if (parsedTwice.ROOT.nodes && parsedTwice.ROOT.nodes.length > 0) {
            console.log('ROOT node has children:', parsedTwice.ROOT.nodes);
          } else {
            console.log('ROOT node has no children, adding a default Text node');

            // Create a new Text node
            const textNodeId = `text-${Date.now()}`;

            // Add the Text node to the ROOT node's nodes array
            parsedTwice.ROOT.nodes = [textNodeId];

            // Add the Text node to the parsed object
            parsedTwice[textNodeId] = {
              type: { resolvedName: 'Text' },
              isCanvas: false,
              props: {
                fontSize: '20',
                fontWeight: '400',
                text: 'Click to edit this text'
              },
              displayName: 'Text',
              custom: {},
              hidden: false,
              nodes: [],
              linkedNodes: {}
            };

            // Re-stringify the modified object
            return JSON.stringify(parsedTwice);
          }

          return parsedOnce; // Return single-stringified version
        }
        return null;
      }

      // Handle normal stringified JSON
      if (trimmed.startsWith('{')) {
        console.log('Processing normal JSON string');
        const parsed = JSON.parse(trimmed);

        if (validateRootNode(parsed)) {
          // Check if the ROOT node has any children
          if (parsed.ROOT.nodes && parsed.ROOT.nodes.length > 0) {
            console.log('ROOT node has children:', parsed.ROOT.nodes);
          } else {
            console.log('ROOT node has no children, adding a default Text node');

            // Create a new Text node
            const textNodeId = `text-${Date.now()}`;

            // Add the Text node to the ROOT node's nodes array
            parsed.ROOT.nodes = [textNodeId];

            // Add the Text node to the parsed object
            parsed[textNodeId] = {
              type: { resolvedName: 'Text' },
              isCanvas: false,
              props: {
                fontSize: '20',
                fontWeight: '400',
                text: 'Click to edit this text'
              },
              displayName: 'Text',
              custom: {},
              hidden: false,
              nodes: [],
              linkedNodes: {}
            };
          }

          return JSON.stringify(parsed); // Return the stringified version
        }
        return null;
      }
    }

    console.warn('Unrecognized content format:', typeof content);
    return null;

  } catch (error) {
    console.error('Error processing study guide content:', error);
    return null;
  }
};


const StudyGuides = () => {
  const { selectedCategory, setSelectedCategory, setResetStudyGuideSelection, sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGuides, setStudyGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to hold the current editor content as JSON string
  const [currentEditorJson, setCurrentEditorJson] = useState(null);

  // Single effect to handle editor JSON state
  useEffect(() => {
    let shouldUpdate = false;
    let newJson = null;

    // Case 1: Selection changed or creating new
    if (selectedStudyGuide || isCreating) {
      newJson = getInitialJson(selectedStudyGuide, isCreating);
      shouldUpdate = true;
    }
    
    // Case 2: Clearing selection
    if (!selectedStudyGuide && !isCreating && currentEditorJson !== null) {
      shouldUpdate = true;
    }

    // Only update state if necessary
    if (shouldUpdate && newJson !== currentEditorJson) {
      setCurrentEditorJson(newJson);
    }
  }, [selectedStudyGuide, isCreating, currentEditorJson]);


  useEffect(() => {
    const resetSelection = () => {
      setSelectedStudyGuide(null);
      setIsCreating(false);
      setCurrentEditorJson(null); // Reset editor state on cancel/exit
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
    // State update happens via useEffect watching selectedStudyGuide
  };

  const handleCreateNew = () => {
    setSelectedStudyGuide(null);
    setIsCreating(true);
    // State update happens via useEffect watching isCreating
  };

  const handleDelete = async () => {
    if (!selectedStudyGuide) return;
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
      setCurrentEditorJson(null); // Clear editor state
    } catch (error) {
      console.error('Error deleting study guide:', error);
      await loadStudyGuides(); // Revert on error
      throw error;
    }
  };

  // Memoized callback for ContentEditor to update the state
  const handleJsonChange = useCallback((newJson) => {
    // Validate JSON structure before updating
    try {
      if (newJson) {
        const parsed = JSON.parse(newJson);
        if (!parsed || !parsed.ROOT) {
          console.warn('Invalid editor content structure');
          return;
        }
      }
      
      setCurrentEditorJson(prevJson => {
        // Only update if content has actually changed
        if (newJson !== prevJson) {
          return newJson;
        }
        return prevJson;
      });
    } catch (error) {
      console.error('Error processing editor content:', error);
    }
  }, []); // No dependencies needed since we use functional updates

  const handleSave = async (studyGuideData) => {
    // studyGuideData contains { title, content, shouldExit }
    const { title, content, shouldExit = true } = studyGuideData;

    // Use content from studyGuideData if available, otherwise fall back to currentEditorJson
    const contentToSave = content || currentEditorJson;

    console.log('StudyGuides handleSave - Content from studyGuideData:', content ? 'present' : 'missing');
    console.log('StudyGuides handleSave - Content from currentEditorJson:', currentEditorJson ? 'present' : 'missing');
    console.log('StudyGuides handleSave - Final contentToSave:', contentToSave ? 'present' : 'missing');

    if (!contentToSave) {
        console.error("Attempted to save null/empty content.");
        alert("Cannot save empty content.");
        return;
    }

    try {
      let savedGuide;
      const display_order = Math.max(...studyGuides.map(g => g.display_order), -1) + 1;

      // Construct data payload for API
      const dataToSaveApi = { title, content: contentToSave };

      if (isCreating) {
        // Optimistically update the UI before API call
        const tempId = 'temp-' + Date.now();
        const newGuide = {
          id: tempId,
          ...dataToSaveApi, // Use API payload
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
          ...dataToSaveApi, // Use API payload
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

        // Only exit if shouldExit is true
        if (shouldExit) {
          setIsCreating(false);
          setSelectedStudyGuide(null);
          setCurrentEditorJson(null); // Clear editor state
        } else {
          // If not exiting, set the selected study guide to the newly created one
          setIsCreating(false);
          setSelectedStudyGuide(savedGuide);
          // The useEffect watching selectedStudyGuide will update currentEditorJson
        }

      } else {
        // Update existing guide
        // Optimistically update UI
        const updatedGuide = {
          ...selectedStudyGuide,
          ...dataToSaveApi, // Use API payload
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
        savedGuide = await studyGuidesService.update(selectedStudyGuide.id, dataToSaveApi);

        // Only exit if shouldExit is true
        if (shouldExit) {
          setSelectedStudyGuide(null);
          setCurrentEditorJson(null); // Clear editor state
        } else {
          // If not exiting, update the selected study guide with the saved data
          setSelectedStudyGuide(savedGuide);
           // The useEffect watching selectedStudyGuide will update currentEditorJson
        }
      }
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

  // Using Tailwind classes instead of inline styles

  const renderContent = () => {
    if (selectedStudyGuide || isCreating) {
      // Pass the state and callback to ContentEditor
      return (
        <ContentEditor
          key={`editor-${selectedStudyGuide?.id || 'new'}-${Date.now()}-${currentEditorJson ? 'loaded' : 'empty'}`} // Add key to force remount
          initialTitle={selectedStudyGuide?.title || ''}
          editorJson={currentEditorJson} // Pass current JSON state
          onJsonChange={handleJsonChange} // Pass callback to update state
          onSave={handleSave} // Pass modified handleSave
          onCancel={() => {
            setIsCreating(false);
            setSelectedStudyGuide(null);
            setCurrentEditorJson(null); // Clear editor state on cancel
          }}
          isNew={isCreating}
          onDelete={handleDelete}
          selectedStudyGuide={selectedStudyGuide} // Keep for context if needed
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
    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6" style={{ height: 'calc(100vh - 100px)' }}>
      <div
        className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-sm dark:shadow-md"
        style={{
          height: 'calc(100vh - 150px)',
          minHeight: '700px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-grow flex flex-col" style={{ flex: '1 1 auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudyGuides;
