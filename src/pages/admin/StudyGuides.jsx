import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFullscreen } from '../../contexts/FullscreenContext';
import { useNetworkStatus } from '../../contexts/NetworkContext';

import ContentEditor from './components/ContentEditor';
import StudyGuideManagement from './components/StudyGuideManagement';
import SectionManagement from './components/SectionManagement';
import CategoryManagement from './components/CategoryManagement';
import CategorySelectionModal from './components/CategorySelectionModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import StudyGuideTemplateModal from './components/StudyGuideTemplateModal';
import { studyGuidesService } from '../../services/api/studyGuides';
import { sectionsService } from '../../services/api/sections';
import { CategoryContext } from '../../components/layout/AdminLayout';
import { useCatalog } from '../../hooks/useCatalog';
import { useContentVisibility } from '../../hooks/useContentVisibility';

// Helper function to handle content initialization and validation
const getInitialJson = (studyGuide, isCreatingFlag) => {
  // For new guides or no content, return null to start with empty editor
  if (isCreatingFlag || !studyGuide?.content) {
    console.log('Starting with empty editor: isCreating=', isCreatingFlag);
    return null;
  }

  const content = studyGuide.content;
  // Only log content type if it's not already been processed to reduce console noise
  if (typeof content === 'string' && content.includes('\\"ROOT\\"')) {
    console.log('Processing content type:', typeof content, '(detected double-stringified JSON)');
  } else if (typeof content === 'string') {
    console.log('Processing content type:', typeof content);
  }

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
  const { isFullscreen, exitFullscreen } = useFullscreen();
  const { selectedCategory, setSelectedCategory, setResetStudyGuideSelection, sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext);
  const { isOnline, reconnectCount } = useNetworkStatus();
  const { getGuidesByCategory, refresh } = useCatalog({ mode: 'admin' });
  const { getNewContentDefaults } = useContentVisibility();
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGuides, setStudyGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for copy/move modals
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [guideToAction, setGuideToAction] = useState(null);

  // State for template selection modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // State for confirmation dialogs
  const [isCopyConfirmOpen, setIsCopyConfirmOpen] = useState(false);
  const [isMoveConfirmOpen, setIsMoveConfirmOpen] = useState(false);
  const [isCopySuccessOpen, setIsCopySuccessOpen] = useState(false);
  const [isMoveSuccessOpen, setIsMoveSuccessOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTargetCategoryId, setSelectedTargetCategoryId] = useState(null);
  const [selectedTargetCategoryName, setSelectedTargetCategoryName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      // derive from catalog (works offline)
      setStudyGuides(getGuidesByCategory(selectedCategory.id, false));
      if (!selectedSection && selectedCategory.section_id) {
        loadSection(selectedCategory.section_id);
      }
    } else {
      setStudyGuides([]);
    }
  }, [selectedCategory, getGuidesByCategory]);

  // With useCatalog, list reloads automatically on reconnect via hook.
  useEffect(() => {
    if (!isOnline) setError(null);
  }, [isOnline]);

  const loadSection = async (sectionId) => {
    try {
      const section = await sectionsService.getById(sectionId);
      setSelectedSection(section);
    } catch (err) {
      console.error('Error loading section:', err);
    }
  };

  const handleStudyGuideSelect = async (studyGuide) => {
    setIsCreating(false);
    setIsLoading(true);
    try {
      let full = studyGuide;
      if (!studyGuide?.content) {
        // Fetch full record with content for editor
        full = await studyGuidesService.getById(studyGuide.id);
      }
      setSelectedStudyGuide(full);
      setError(null);
      // Ensure editor has initial JSON promptly
      const initJson = getInitialJson(full, false);
      setCurrentEditorJson(initJson);
    } catch (err) {
      console.error('Error loading study guide details:', err);
      setError('Failed to load study guide content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Show template selection modal instead of directly creating
    setIsTemplateModalOpen(true);
  };

  const handleStartFromScratch = () => {
    setIsTemplateModalOpen(false);
    setSelectedStudyGuide(null);
    setIsCreating(true);
    // State update happens via useEffect watching isCreating
  };

  const handleTemplateSelect = (template) => {
    setIsTemplateModalOpen(false);
    setSelectedStudyGuide(null);
    setIsCreating(true);
    // Set the editor content to the template content
    setCurrentEditorJson(template.content);
  };

  // Function to open the delete confirmation dialog
  const handleDeleteInitiate = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Function to handle the actual deletion after confirmation
  const handleDelete = async () => {
    if (!selectedStudyGuide) return;
    
    // Exit fullscreen when deleting
    if (isFullscreen) {
      exitFullscreen();
    }
    
    try {
      // Optimistically update UI
      const newSectionsData = sectionsData?.map(section => {
        if (section.categories) {
          return {
            ...section,
            categories: section.categories.map(category => {
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
      if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);

      // Make API call
      await studyGuidesService.delete(selectedStudyGuide.id);

      // Close the confirmation dialog
      setIsDeleteConfirmOpen(false);

      // Reset state
      setSelectedStudyGuide(null);
      setCurrentEditorJson(null); // Clear editor state
      await refresh();
      setStudyGuides(selectedCategory ? getGuidesByCategory(selectedCategory.id, false) : []);
    } catch (error) {
      console.error('Error deleting study guide:', error);
      await refresh();
      setIsDeleteConfirmOpen(false);
      throw error;
    }
  };

  // Memoized callback for ContentEditor to update the state
  const handleJsonChange = useCallback((newJson) => {
    // Handle empty or null content
    if (!newJson) {
      setCurrentEditorJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(newJson);

      // Basic structure check
      if (!parsed || typeof parsed !== 'object') {
        return;
      }

      // Check for ROOT node
      if (!parsed.ROOT || typeof parsed.ROOT !== 'object') {
        return;
      }

      // Valid structure found, update state if changed
      setCurrentEditorJson(prevJson => {
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
    // studyGuideData contains { title, content, description, shouldExit, is_published }
    const { title, content, description, shouldExit = true, is_published } = studyGuideData;

    // Use content from studyGuideData if available, otherwise fall back to currentEditorJson
    const contentToSave = content || currentEditorJson;

    console.log('StudyGuides handleSave - Content from studyGuideData:', content ? 'present' : 'missing');
    console.log('StudyGuides handleSave - Content from currentEditorJson:', currentEditorJson ? 'present' : 'missing');
    console.log('StudyGuides handleSave - Final contentToSave:', contentToSave ? 'present' : 'missing');
    console.log('StudyGuides handleSave - Published status:', is_published);

    if (!contentToSave) {
        console.error("Attempted to save null/empty content.");
        alert("Cannot save empty content.");
        return;
    }

    try {
      let savedGuide;
      const display_order = Math.max(...studyGuides.map(g => g.display_order), -1) + 1;

      // Construct data payload for API
      // Use the is_published value and description from ContentEditor if available
      // Preserve existing description if not provided in save data
      const dataToSaveApi = {
        title,
        content: contentToSave,
        description: description !== undefined ? description : selectedStudyGuide?.description, // Preserve existing description if not provided
        is_published: typeof is_published !== 'undefined' ? is_published : (selectedStudyGuide?.is_published || false)
      };

      if (isCreating) {
        // Get RBAC defaults for new content
        const rbacDefaults = getNewContentDefaults();

        // Optimistically update the UI before API call
        const tempId = 'temp-' + Date.now();
        const newGuide = {
          id: tempId,
          ...dataToSaveApi, // Use API payload
          ...rbacDefaults, // Add RBAC fields
          category_id: selectedCategory.id,
          display_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Update local state
        setStudyGuides(prev => [...prev, newGuide]);

        // Update context with temporary ID
        const tempSectionsData = sectionsData?.map(section => {
          if (section.categories) {
            return {
              ...section,
              categories: section.categories.map(category => {
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
        if (tempSectionsData) optimisticallyUpdateSectionsOrder(tempSectionsData);

        // Make API call with RBAC fields
        savedGuide = await studyGuidesService.create({
          ...dataToSaveApi, // Use API payload
          ...rbacDefaults, // Add RBAC fields
          category_id: selectedCategory.id,
          display_order
        });

        await refresh();
        setStudyGuides(getGuidesByCategory(selectedCategory.id, false));

        // Update context with real ID
        const finalSectionsData = sectionsData?.map(section => {
          if (section.categories) {
            return {
              ...section,
              categories: section.categories.map(category => {
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
        if (finalSectionsData) optimisticallyUpdateSectionsOrder(finalSectionsData);

        // Only exit if shouldExit is true
        if (shouldExit) {
          // Exit fullscreen when exiting editing mode
          if (isFullscreen) {
            exitFullscreen();
          }
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
        const newSectionsData = sectionsData?.map(section => {
          if (section.categories) {
            return {
              ...section,
              categories: section.categories.map(category => {
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
        if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);

        // Make API call
        savedGuide = await studyGuidesService.update(selectedStudyGuide.id, dataToSaveApi);
        await refresh();
        setStudyGuides(getGuidesByCategory(selectedCategory.id, false));

        // Only exit if shouldExit is true
        if (shouldExit) {
          // Exit fullscreen when exiting editing mode
          if (isFullscreen) {
            exitFullscreen();
          }
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
      await refresh();
      setStudyGuides(selectedCategory ? getGuidesByCategory(selectedCategory.id, false) : []);
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

  // Handle initiating copy of a study guide
  const handleCopyInitiate = (guide) => {
    setGuideToAction(guide);
    setIsCopyModalOpen(true);
  };

  // Handle initiating move of a study guide
  const handleMoveInitiate = (guide) => {
    setGuideToAction(guide);
    setIsMoveModalOpen(true);
  };

  // Handler for updating study guide description
  const handleUpdateDescription = async (guideId, description) => {
    try {
      const guideToUpdate = studyGuides.find(g => g.id === guideId);
      if (!guideToUpdate) return;

      // Optimistically update UI
      const updatedGuide = {
        ...guideToUpdate,
        description,
        updated_at: new Date().toISOString()
      };

      // Update local state
      setStudyGuides(prev => prev.map(guide =>
        guide.id === guideId ? updatedGuide : guide
      ));

      // Update context
      const newSectionsData = sectionsData?.map(section => {
        if (section.categories) {
          return {
            ...section,
            categories: section.categories.map(category => {
              if (category.id === selectedCategory.id) {
                return {
                  ...category,
                  study_guides: (category.study_guides || []).map(guide =>
                    guide.id === guideId ? updatedGuide : guide
                  )
                };
              }
              return category;
            })
          };
        }
        return section;
      });
      if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);

      // Make API call
      await studyGuidesService.update(guideId, { description });
      await refresh();
      setStudyGuides(getGuidesByCategory(selectedCategory.id, false));
    } catch (error) {
      console.error('Error updating study guide description:', error);
      await refresh();
    }
  };

  // Handle selecting a category for copy
  const handleCopySelect = (targetCategoryId) => {
    // Find the category name for the confirmation dialog
    let categoryName = "the selected category";
    sectionsData?.forEach(section => {
      if (section.categories) {
        section.categories.forEach(category => {
          if (category.id === targetCategoryId) {
            categoryName = category.name;
          }
        });
      }
    });

    // Set state for confirmation dialog
    setSelectedTargetCategoryId(targetCategoryId);
    setSelectedTargetCategoryName(categoryName);
    setIsCopyModalOpen(false);
    setIsCopyConfirmOpen(true);
  };

  // Handle confirming the copy after confirmation dialog
  const handleCopyConfirm = async () => {
    if (!guideToAction || !selectedTargetCategoryId) return;

    try {
      setIsLoading(true);

      // Call the API to copy the study guide
      const copiedGuide = await studyGuidesService.copyStudyGuide(guideToAction.id, selectedTargetCategoryId);

      // If copying to the current category, update the local state
      if (selectedTargetCategoryId === selectedCategory?.id) {
        setStudyGuides(prev => [...prev, copiedGuide].sort((a, b) => a.display_order - b.display_order));

        // Update context
        const newSectionsData = sectionsData?.map(section => {
          if (section.categories) {
            return {
              ...section,
              categories: section.categories.map(category => {
                if (category.id === selectedTargetCategoryId) {
                  return {
                    ...category,
                    study_guides: [...(category.study_guides || []), copiedGuide]
                      .sort((a, b) => a.display_order - b.display_order)
                  };
                }
                return category;
              })
            };
          }
          return section;
        });
        if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);
      }

      // Set success message
      setSuccessMessage(`Study guide "${guideToAction.title}" has been successfully copied to ${selectedTargetCategoryName}.`);

      // Close confirmation dialog and open success dialog
      setIsCopyConfirmOpen(false);
      setIsCopySuccessOpen(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error copying study guide:', error);
      setIsLoading(false);
      setIsCopyConfirmOpen(false);
    }
  };

  // Handle closing the copy success dialog
  const handleCopySuccessClose = () => {
    setIsCopySuccessOpen(false);
    setGuideToAction(null);
    setSelectedTargetCategoryId(null);
    setSelectedTargetCategoryName('');
  };

  // Handle selecting a category for move
  const handleMoveSelect = (targetCategoryId) => {
    // Find the category name for the confirmation dialog
    let categoryName = "the selected category";
    sectionsData?.forEach(section => {
      if (section.categories) {
        section.categories.forEach(category => {
          if (category.id === targetCategoryId) {
            categoryName = category.name;
          }
        });
      }
    });

    // Set state for confirmation dialog
    setSelectedTargetCategoryId(targetCategoryId);
    setSelectedTargetCategoryName(categoryName);
    setIsMoveModalOpen(false);
    setIsMoveConfirmOpen(true);
  };

  // Handle confirming the move after confirmation dialog
  const handleMoveConfirm = async () => {
    if (!guideToAction || !selectedCategory || !selectedTargetCategoryId) return;

    try {
      setIsLoading(true);

      // Call the API to move the study guide
      const movedGuide = await studyGuidesService.moveStudyGuide(guideToAction.id, selectedTargetCategoryId);

      // Remove the guide from the current category
      setStudyGuides(prev => prev.filter(guide => guide.id !== guideToAction.id));

      // Update context
      const newSectionsData = sectionsData?.map(section => {
        if (section.categories) {
          return {
            ...section,
            categories: section.categories.map(category => {
              if (category.id === selectedCategory.id) {
                // Remove from current category
                return {
                  ...category,
                  study_guides: (category.study_guides || []).filter(guide => guide.id !== guideToAction.id)
                };
              } else if (category.id === selectedTargetCategoryId) {
                // Add to target category
                const existingGuides = category.study_guides || [];
                return {
                  ...category,
                  study_guides: [...existingGuides, movedGuide]
                    .sort((a, b) => a.display_order - b.display_order)
                };
              }
              return category;
            })
          };
        }
        return section;
      });
      if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);

      // Set success message
      setSuccessMessage(`Study guide "${guideToAction.title}" has been successfully moved to ${selectedTargetCategoryName}.`);

      // Close confirmation dialog and open success dialog
      setIsMoveConfirmOpen(false);
      setIsMoveSuccessOpen(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error moving study guide:', error);
      setIsLoading(false);
      setIsMoveConfirmOpen(false);
    }
  };

  // Handle closing the move success dialog
  const handleMoveSuccessClose = () => {
    setIsMoveSuccessOpen(false);
    setGuideToAction(null);
    setSelectedTargetCategoryId(null);
    setSelectedTargetCategoryName('');
  };

  // Using Tailwind classes instead of inline styles

  const renderContent = () => {
    if (selectedStudyGuide || isCreating) {
      // Pass the state and callback to ContentEditor
      return (
        <>
          <ContentEditor
            key={`editor-${selectedStudyGuide?.id || 'new'}`} // Only remount when switching guides or modes
            initialTitle={selectedStudyGuide?.title || ''}
            editorJson={currentEditorJson} // Pass current JSON state
            onJsonChange={handleJsonChange} // Pass callback to update state
            onSave={handleSave} // Pass modified handleSave
            onCancel={() => {
              // Exit fullscreen when canceling
              if (isFullscreen) {
                exitFullscreen();
              }
              
              // Clear localStorage draft for 'new' study guide
              const key = `content_editor_new_draft`;
              localStorage.removeItem(key);

              // Reset canceling flag
              window.isCancelingContentEditor = false;

              // Reset state
              setIsCreating(false);
              setSelectedStudyGuide(null);
              setCurrentEditorJson(null); // Clear editor state on cancel
            }}
            isNew={isCreating}
            onDelete={handleDeleteInitiate}
            selectedStudyGuide={selectedStudyGuide} // Keep for context if needed
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleDelete}
            title="Delete Content"
            description={`Are you sure you want to delete "${selectedStudyGuide?.title}"? This action cannot be undone and all associated data will be permanently lost.`}
          />
        </>
      );
    }

    if (selectedCategory) {
      return (
        <>
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
            onCopy={handleCopyInitiate}
            onMove={handleMoveInitiate}
            onUpdateDescription={handleUpdateDescription}
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
                const newSectionsData = sectionsData?.map(section => {
                  if (section.categories) {
                    return {
                      ...section,
                      categories: section.categories.map(category => {
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
                if (newSectionsData) optimisticallyUpdateSectionsOrder(newSectionsData);

                // Make API call
                const updatesWithCategory = updates.map(update => ({
                  ...update,
                  category_id: selectedCategory.id
                }));
                await studyGuidesService.updateOrder(updatesWithCategory);
                await refresh();
                setStudyGuides(getGuidesByCategory(selectedCategory.id, false));
              } catch (err) {
                console.error('Error updating order:', err);
                await refresh();
                alert('Failed to update order');
              }
            }}
          />

          {/* Copy Modal */}
          <CategorySelectionModal
            isOpen={isCopyModalOpen}
            onClose={() => setIsCopyModalOpen(false)}
            onSelect={handleCopySelect}
            title="Select Destination Category"
            actionButtonText="Select"
            currentCategoryId={selectedCategory?.id}
          />

          {/* Move Modal */}
          <CategorySelectionModal
            isOpen={isMoveModalOpen}
            onClose={() => setIsMoveModalOpen(false)}
            onSelect={handleMoveSelect}
            title="Select Destination Category"
            actionButtonText="Select"
            currentCategoryId={selectedCategory?.id}
          />

          {/* Copy Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={isCopyConfirmOpen}
            onClose={() => setIsCopyConfirmOpen(false)}
            onConfirm={handleCopyConfirm}
            title="Copy Content"
            description={`Are you sure you want to copy "${guideToAction?.title}" to ${selectedTargetCategoryName}?`}
            confirmButtonText="Copy"
            confirmButtonVariant="primary"
          />

          {/* Move Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={isMoveConfirmOpen}
            onClose={() => setIsMoveConfirmOpen(false)}
            onConfirm={handleMoveConfirm}
            title="Move Content"
            description={`Are you sure you want to move "${guideToAction?.title}" to ${selectedTargetCategoryName}?`}
            confirmButtonText="Move"
            confirmButtonVariant="primary"
          />

          {/* Copy Success Dialog */}
          <ConfirmationDialog
            isOpen={isCopySuccessOpen}
            onClose={handleCopySuccessClose}
            onConfirm={handleCopySuccessClose}
            title="Success"
            description={successMessage}
            confirmButtonText="OK"
            confirmButtonVariant="primary"
          />

          {/* Move Success Dialog */}
          <ConfirmationDialog
            isOpen={isMoveSuccessOpen}
            onClose={handleMoveSuccessClose}
            onConfirm={handleMoveSuccessClose}
            title="Success"
            description={successMessage}
            confirmButtonText="OK"
            confirmButtonVariant="primary"
          />

          {/* Template Selection Modal */}
          <StudyGuideTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onStartFromScratch={handleStartFromScratch}
            onSelectTemplate={handleTemplateSelect}
          />
        </>
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
    /* Removed gray background (bg-gray-50 dark:bg-slate-800) and padding (p-6) from this outer div */
    <div className="rounded-lg shadow dark:shadow-lg" style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 190px)', overflow: 'hidden' }}>
      <div
        className="bg-white dark:bg-slate-700 rounded-lg shadow-sm dark:shadow-md"
        style={{
          height: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div className={`flex-1 flex flex-col min-h-0 ${isFullscreen ? 'p-4' : 'p-2'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudyGuides;
