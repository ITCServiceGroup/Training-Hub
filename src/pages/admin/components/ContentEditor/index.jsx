import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor, Frame as CraftFrame, Element as CraftElement, useEditor } from '@craftjs/core';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useFullscreen } from '../../../../contexts/FullscreenContext';
import { useToast } from '../../../../components/common/ToastContainer';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { FaFileAlt } from 'react-icons/fa';
import { Viewport } from './components/editor/Viewport';
import { RenderNode } from './components/editor/RenderNode';
import { ToolbarZIndexProvider } from './contexts/ToolbarZIndexContext';
import { useDragHighlight } from './hooks/useDragHighlight';
import { applyDirectCraftJsFix } from './patches/directCraftJsFix';
import { CraftJsDirectPatch } from './patches/craftJsDirectPatch';
import { applyCraftJsDragDropOverride } from './patches/craftJsDragDropOverride';
import { useCollapsibleSectionPatch } from './patches/collapsibleSectionPatch';

// Styles
import './styles.css';
import './styles/dragFeedback.css';

// Import all component types that might be used in the editor
import { Container } from './components/selectors/Container';
import { Text } from './components/selectors/Text';
import { Button } from './components/selectors/Button';
import { Image } from './components/selectors/Image';
import { Icon } from './components/selectors/Icon';
import { Interactive } from './components/selectors/Interactive';
import { Table } from './components/selectors/Table';
import { TableText } from './components/selectors/Table/TableText';
import { CollapsibleSection } from './components/selectors/CollapsibleSection';
import { Tabs } from './components/selectors/Tabs';
import { HorizontalLine } from './components/selectors/HorizontalLine';

// Import utilities
import { deepParseJsonStrings, safeParseJson, sanitizeEditorJson } from './utils/jsonParser';
import { saveDraft, loadDraft, clearDraft, clearSelectedNode } from './utils/draftManager';
import { createSelectionManager } from './utils/selectionManager';
import TemplateCreationModal from './components/TemplateCreationModal';


const EditorInner = ({ editorJson, initialTitle, onSave, onCancel, onDelete, isNew, selectedStudyGuide, onNodesChangeCallback }) => {
  const { actions, query } = useEditor();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { toggleFullscreen } = useFullscreen();
  const isDark = theme === 'dark';
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(selectedStudyGuide?.is_published || false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [publishSuccessDialog, setPublishSuccessDialog] = useState({
    isOpen: false,
    message: '',
    title: ''
  });
  // Show a loading overlay when editing an existing guide until content is deserialized
  const [isInitialLoading, setIsInitialLoading] = useState(!isNew);

  // Initialize selection manager
  const selectionManager = useMemo(() => 
    createSelectionManager(query, actions, selectedStudyGuide),
    [query, actions, selectedStudyGuide]
  );

  // Create a callback function that handles the restoration logic
  const handleNodesChange = useCallback((query) => {
    selectionManager.handleNodesChange(query);
  }, [selectionManager]);

  // Pass the callback to the parent component
  useEffect(() => {
    if (onNodesChangeCallback) {
      onNodesChangeCallback(handleNodesChange);
    }
  }, [handleNodesChange, onNodesChangeCallback]);

  // Template creation state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);



  useDragHighlight();

  useEffect(() => {
    const cleanup1 = applyDirectCraftJsFix();
    const cleanup2 = applyCraftJsDragDropOverride(actions);
    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
    };
  }, [actions]);

  // Create component map for sanitization
  const componentMap = useMemo(() => ({
    'Container': Container,
    'Text': Text,
    'Button': Button,
    'Image': Image,
    'Interactive': Interactive,
    'Table': Table,
    'Table Text': TableText,
    'Collapsible Section': CollapsibleSection,
    'Tabs': Tabs,
    'Horizontal Line': HorizontalLine
  }), []);

  useEffect(() => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    let contentLoaded = false;
    const draft = loadDraft(studyGuideId, isNew);

    if (draft && draft.content) {
        if (draft.content !== editorJson) {
            // Check if we've already processed this exact draft content
            if (lastProcessedDraftRef.current === draft.content) {
                console.log("Skipping draft processing - already processed this content");
                return;
            }

            if (draft.title && draft.title.trim() !== '' && (!initialTitle || initialTitle.trim() === '')) {
                setTitle(draft.title);
            }
            try {
                // Use the new safe parsing function
                const contentToProcess = safeParseJson(draft.content, 'draft');

                if (contentToProcess && typeof contentToProcess === 'object') {
                    const deepParsedContent = deepParseJsonStrings(contentToProcess);
                    const sanitizedContent = sanitizeEditorJson(deepParsedContent, componentMap);
                    actions.deserialize(sanitizedContent);
                    contentLoaded = true;
                    setIsInitialLoading(false);
                    // Track that we've processed this draft content
                    lastProcessedDraftRef.current = draft.content;
                } else {
                    console.warn("Draft content could not be resolved to an object for processing. Attempting fallback parsing...");
                    // Fallback: try the old parsing method
                    try {
                        let fallbackContent = draft.content;
                        if (typeof fallbackContent === 'string') {
                            fallbackContent = JSON.parse(fallbackContent);
                            if (typeof fallbackContent === 'string') {
                                fallbackContent = JSON.parse(fallbackContent);
                            }
                        }
                        if (fallbackContent && typeof fallbackContent === 'object') {
                            const deepParsedContent = deepParseJsonStrings(fallbackContent);
                            const sanitizedContent = sanitizeEditorJson(deepParsedContent, componentMap);
                            actions.deserialize(sanitizedContent);
                            contentLoaded = true;
                            setIsInitialLoading(false);
                            lastProcessedDraftRef.current = draft.content;
                        } else {
                            console.error("Fallback parsing also failed for draft content.");
                        }
                    } catch (fallbackError) {
                        console.error("Fallback parsing failed:", fallbackError);
                    }
                }
            } catch (error) {
                console.error('Error processing draft content for deserialization:', error);
            }
        } else {
            console.log("Draft content is same as editorJson prop, skipping deserialize from draft.");
        }
    }

    const restoreSelection = () => selectionManager.restoreSelection(studyGuideId);

    if (contentLoaded || editorJson) {
      restoreSelection();
    }

    const handleVisibilityChange = selectionManager.createVisibilityChangeHandler(studyGuideId);
    const handleFocus = selectionManager.createFocusHandler(studyGuideId);
    const handleBlur = selectionManager.createBlurHandler(studyGuideId);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedStudyGuide, editorJson, actions, query, isNew, initialTitle, componentMap, selectionManager]);

  // Add an effect to monitor for unexpected deselections and re-restore if needed
  useEffect(() => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    
    // Check periodically for unexpected deselections
    const interval = setInterval(() => {
      selectionManager.checkAndRestoreSelection(studyGuideId);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedStudyGuide, selectionManager]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.isCancelingContentEditor = false;
    };
  }, [hasUnsavedChanges]);

  const prevEditorJsonRef = useRef(null);
  const lastProcessedDraftRef = useRef(null);
  useEffect(() => {
    if (!editorJson || !actions) return;
    if (prevEditorJsonRef.current === editorJson && query.getNodes() && Object.keys(query.getNodes()).length > 1) {
      console.log("Skipping deserialize of editorJson prop, content string is identical and editor not empty.");
      setIsInitialLoading(false);
      return;
    }
    prevEditorJsonRef.current = editorJson;

    try {
      // Use the new safe parsing function
      const parsedData = safeParseJson(editorJson, 'editorJson prop');

      if (parsedData && typeof parsedData === 'object') {
        const deepParsedData = deepParseJsonStrings(parsedData);

        if (deepParsedData.ROOT) {
            const sanitizedData = sanitizeEditorJson(deepParsedData, componentMap);
            actions.deserialize(sanitizedData);
            setIsInitialLoading(false);
        } else if (Object.keys(deepParsedData).length === 0 && (editorJson === '{}' || (typeof editorJson === 'object' && Object.keys(editorJson).length === 0))) {
            console.log("Received empty object for editorJson. Craft.js will load default if this is initial.");
            actions.deserialize(deepParsedData);
            setIsInitialLoading(false);
        } else if (!deepParsedData.ROOT) {
            console.warn("Parsed editorJson does not contain ROOT node after all parsing. Skipping deserialize. Final parsedData:", deepParsedData);
            setIsInitialLoading(false);
        }
      } else {
        console.error("editorJson could not be resolved to an object for processing.");
        setIsInitialLoading(false);
      }
    } catch (error) {
      console.warn('EditorInner: Error deserializing content from editorJson prop:', error);
      setIsInitialLoading(false);
    }
  }, [editorJson, actions, query, componentMap]);

  useEffect(() => {
    if (initialTitle && initialTitle.trim() !== '') setTitle(initialTitle);
  }, [initialTitle]);

  // Update state when selectedStudyGuide changes
  useEffect(() => {
    if (selectedStudyGuide) {
      setIsPublished(selectedStudyGuide.is_published || false);
    }
  }, [selectedStudyGuide]);

  const handleSave = async (shouldExit = true) => {
    if (!title.trim()) {
      showToast('Please enter a title', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const currentJsonToSave = JSON.stringify(query.serialize());
      // Include the current publish status in the save data
      await onSave({
        title,
        content: currentJsonToSave,
        shouldExit,
        is_published: isPublished // Pass the current publish status
      });
      const studyGuideId = selectedStudyGuide?.id || 'new';
      clearDraft(studyGuideId);
      setHasUnsavedChanges(false);
      showToast('Study guide saved successfully', 'success');
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Failed to save content', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = () => handleSave(false);

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setIsConfirmModalOpen(true);
    } else {
      const studyGuideId = selectedStudyGuide?.id || 'new';
      clearDraft(studyGuideId);
      onCancel();
    }
  };

  const confirmCancel = () => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    window.isCancelingContentEditor = true;
    clearDraft(studyGuideId);
    setIsConfirmModalOpen(false);
    onCancel();
  };

  const handleDeleteClick = () => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    clearDraft(studyGuideId);
    clearSelectedNode(studyGuideId);
    onDelete();
  };

  // Template creation handlers
  const handleSaveAsTemplate = () => {
    if (!title.trim()) {
      showToast('Please enter a title first', 'warning');
      return;
    }
    setIsTemplateModalOpen(true);
  };

  const getCurrentContent = () => JSON.stringify(query.serialize());



  // Handle publish/unpublish
  const handleTogglePublish = async () => {
    if (isNew) {
      showToast('Please save the study guide before publishing.', 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      // Import the service here to avoid circular dependencies
      const { studyGuidesService } = await import('../../../../services/api/studyGuides');

      // Toggle the publish status
      const updatedGuide = await studyGuidesService.togglePublishStatus(
        selectedStudyGuide.id,
        !isPublished
      );

      // Update the local state
      setIsPublished(updatedGuide.is_published);

      // Show a success message using ConfirmationDialog
      if (updatedGuide.is_published) {
        setPublishSuccessDialog({
          isOpen: true,
          title: 'Content Published',
          message: 'Your content has been published successfully and is now available to all users in the public learn section.'
        });
      } else {
        setPublishSuccessDialog({
          isOpen: true,
          title: 'Content Unpublished',
          message: 'Your content has been unpublished and is no longer visible to users in the public learn section.'
        });
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showToast('Failed to update publish status.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Header section with title, description and publish controls */}
      <div className="flex flex-col w-full gap-2 mb-4">
        {/* Title and publish controls */}
        <div className="flex w-full h-[38px] justify-between items-center">
          <div className="w-[70%] h-full">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
              className={`w-full h-full px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 text-gray-700 bg-white'} rounded-md text-sm box-border outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Fullscreen toggle button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`
                p-2 rounded-md text-sm cursor-pointer transition-colors
                ${isDark
                  ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white'
                  : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-600 hover:text-gray-700'
                }
              `}
              title="Toggle Fullscreen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>

            {/* Status indicator */}
            {!isNew && (
              <div className={`flex items-center text-xs font-medium ${
                isPublished
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  isPublished
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-400 dark:bg-gray-500'
                }`}></span>
                {isPublished ? 'Published' : 'Draft'}
              </div>
            )}

            {/* Publish/Unpublish button */}
            {isPublished ? (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isNew || isPublishing}
                className={`
                  py-2 px-4 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2
                  ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDark
                    ? 'bg-slate-700 hover:bg-slate-600 border border-red-500 text-red-400 hover:text-red-300'
                    : 'bg-white hover:bg-gray-100 border border-red-500 text-red-600 hover:text-red-700'
                  }
                `}
              >
                {isPublishing ? 'Updating...' : 'Unpublish'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isNew || isPublishing}
                className={`
                  py-2 px-4 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2
                  ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDark
                    ? 'bg-slate-700 hover:bg-slate-600 border border-primary text-primary'
                    : 'bg-white hover:bg-gray-100 border border-primary text-primary'
                  }
                `}
              >
                {isPublishing ? 'Updating...' : 'Publish'}
              </button>
            )}
          </div>
        </div>


      </div>

      {/* Editor area - takes all available space */}
      <div className="relative flex flex-1 gap-4 overflow-hidden" style={{ minHeight: 0, paddingBottom: '70px' }}>
        <CraftJsDirectPatch />
        {useCollapsibleSectionPatch()}
        <div className={`flex-1 ${isInitialLoading && !isNew ? 'opacity-0 pointer-events-none' : ''}`}>
          <Viewport>
            <CraftFrame>
              <CraftElement
                canvas
                is={Container}
                width="100%"
                height="auto"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['20', '20', '20', '20']}
                custom={{ displayName: 'Root Container', isCanvas: true }}
              >
                {isNew && (
                <Text
                  fontSize="20"
                  fontWeight="400"
                  text="Drag components from the sidebar to begin building your content"
                />
              )}
              </CraftElement>
            </CraftFrame>
          </Viewport>
        </div>
        {isInitialLoading && !isNew && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <LoadingSpinner size="lg" text="Loading content..." />
          </div>
        )}
      </div>

      {/* Action buttons - absolutely positioned at bottom */}
      <div
        className="flex justify-end gap-3 pt-3 pb-2 border-t border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10
        }}
      >
        {!isNew && (
          <button type="button" onClick={handleDeleteClick} className={`py-2 px-4 ${isDark ? 'bg-slate-800 hover:bg-red-900/30' : 'bg-white hover:bg-red-50'} border border-red-600 text-red-600 rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}>Delete</button>
        )}
        <button
          type="button"
          onClick={handleSaveAsTemplate}
          className={`py-2 px-4 flex items-center gap-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} border border-gray-300 rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}
        >
          <FaFileAlt />
          Save as Template
        </button>

        <div className="flex-1"></div>
        <button type="button" onClick={handleCancelClick} className={`py-2 px-4 bg-secondary hover:bg-secondary/80 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}>Cancel</button>
        <button type="button" onClick={handleSaveAndContinue} disabled={isSaving} className={`py-2 px-4 bg-primary hover:bg-primary-dark text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSaving ? 'Saving...' : 'Save and Continue'}</button>
        <button type="button" onClick={() => handleSave(true)} disabled={isSaving} className={`py-2 px-4 bg-primary hover:bg-primary-dark text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save and Exit')}</button>
      </div>

      {/* Confirmation Dialog for unsaved changes */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmCancel}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to cancel?"
        confirmButtonText="Yes, Cancel"
        cancelButtonText="No, Continue Editing"
        confirmButtonVariant="danger"
      />

      {/* Publish Success Dialog */}
      <ConfirmationDialog
        isOpen={publishSuccessDialog.isOpen}
        onClose={() => setPublishSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setPublishSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={publishSuccessDialog.title}
        description={publishSuccessDialog.message}
        confirmButtonText="OK"
        cancelButtonText=""
        confirmButtonVariant="primary"
      />

      {/* Template Creation Modal */}
      <TemplateCreationModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title={title}
        getCurrentContent={getCurrentContent}
        showToast={showToast}
      />


    </div>
  );
};

const ContentEditor = ({ initialTitle = '', editorJson, onJsonChange, onSave, onCancel, onDelete, isNew = false, selectedStudyGuide = null }) => {
  // Store the callback function from EditorInner
  const nodesChangeHandlerRef = useRef(null);

  const setNodesChangeHandler = useCallback((handler) => {
    nodesChangeHandlerRef.current = handler;
  }, []);

  useEffect(() => {
    window.isCancelingContentEditor = false;
  }, []);

  return (
    <div className="content-editor flex flex-col gap-2 w-full h-full overflow-hidden">
      <ToolbarZIndexProvider>
        <Editor
          resolver={{
            Container, Text, Button, Image, Icon, Interactive, Table, TableText, CollapsibleSection, 'Collapsible Section': CollapsibleSection, Tabs, HorizontalLine, 'Horizontal Line': HorizontalLine
          }}
          enabled={true}
          onRender={RenderNode}
          options={{ studyGuideId: selectedStudyGuide?.id || 'new' }}
          indicator={{ success: '#006aff', error: '#ef4444' }}
          onNodesChange={(query) => {
            // Use the handler from EditorInner if available
            if (nodesChangeHandlerRef.current) {
              nodesChangeHandlerRef.current(query);
            }

            if (!onJsonChange || !query) return;

            try {
              // Clear any existing timeout
              if (window.jsonChangeTimeout) clearTimeout(window.jsonChangeTimeout);

              // Set a new timeout to debounce changes
              window.jsonChangeTimeout = setTimeout(() => {
                const latestJson = JSON.stringify(query.serialize());
                if (latestJson !== editorJson && !window.isCancelingContentEditor) {
                  const currentStudyGuideId = selectedStudyGuide?.id;
                  if (currentStudyGuideId) {
                    saveDraft(currentStudyGuideId, { title: document.getElementById('title')?.value || '', content: latestJson });
                  }
                  onJsonChange(latestJson);
                }
              }, 1000);
            } catch (error) {
              console.error("Error serializing editor state in onNodesChange:", error);
            }
          }}
        >
          <EditorInner
            editorJson={editorJson}
            initialTitle={initialTitle}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
            isNew={isNew}
            selectedStudyGuide={selectedStudyGuide}
            onNodesChangeCallback={setNodesChangeHandler}
          />
        </Editor>
      </ToolbarZIndexProvider>
    </div>
  );
};

ContentEditor.displayName = 'ContentEditor';
export default ContentEditor;
