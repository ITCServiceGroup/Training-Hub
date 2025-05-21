import React, { useState, useEffect, useRef } from 'react';
import { Editor, Frame as CraftFrame, Element as CraftElement, useEditor } from '@craftjs/core';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useToast } from '../../../../components/common/ToastContainer';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog';
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
import { Card } from './components/selectors/Card';
import { Interactive } from './components/selectors/Interactive';
import { Table } from './components/selectors/Table';
import { TableText } from './components/selectors/Table/TableText';
import { CollapsibleSection } from './components/selectors/CollapsibleSection';
import { Tabs } from './components/selectors/Tabs';

// Helper function to recursively parse stringified JSON properties
function deepParseJsonStrings(value) {
  // 1. Try to parse if it's a string that looks like JSON
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        value = JSON.parse(value); // Parse the string first
      } catch (e) {
        // Not valid JSON, or already parsed by a previous step, return original string
        return value;
      }
    } else {
      // Not a JSON-like string, return as is
      return value;
    }
  }

  // 2. If it's now an array after parsing (or was originally an array), recurse on its items
  if (Array.isArray(value)) {
    return value.map(item => deepParseJsonStrings(item));
  }

  // 3. If it's now an object after parsing (or was originally an object), recurse on its properties
  if (typeof value === 'object' && value !== null) {
    const newObj = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        newObj[key] = deepParseJsonStrings(value[key]); // Recurse on each property value
      }
    }
    return newObj;
  }

  // 4. If it's not a string, array, or object (e.g., number, boolean), return as is
  return value;
}

// Function to sanitize editor JSON data before deserializing
const sanitizeEditorJson = (jsonData) => {
  if (!jsonData || typeof jsonData !== 'object') { // Ensure jsonData is an object
    console.error("sanitizeEditorJson received non-object jsonData:", jsonData);
    return null; // Or a default empty state like { ROOT: {...} }
  }

  const componentMap = {
    'Container': Container,
    'Text': Text,
    'Button': Button,
    'Image': Image,
    'Card': Card,
    'Interactive': Interactive,
    'Table': Table,
    'Table Text': TableText,
    'Collapsible Section': CollapsibleSection,
    'Tabs': Tabs
  };

  const processNode = (node) => {
    if (!node || typeof node !== 'object' || !node.data || typeof node.data !== 'object') {
      // If node or node.data isn't an object, it might be a remnant of bad parsing or an unexpected structure.
      // console.warn("processNode encountered invalid node or node.data structure:", node);
      return node; // Or handle more gracefully, e.g., by returning a default error node structure
    }

    if (typeof node.data.props !== 'object' || node.data.props === null) node.data.props = {};
    if (typeof node.data.custom !== 'object' || node.data.custom === null) node.data.custom = {};
    if (typeof node.data.linkedNodes !== 'object' || node.data.linkedNodes === null) node.data.linkedNodes = {};

    if (node.data.displayName && (!node.data.type || typeof node.data.type === 'string')) {
      const componentType = componentMap[node.data.displayName];
      if (componentType) {
        node.data.type = componentType;
      } else {
        console.warn(`Sanitize: Unknown component displayName '${node.data.displayName}' or type '${node.data.type}' not in componentMap.`);
      }
    }

    if (node.data.displayName === 'Collapsible Section') {
      node.data.type = CollapsibleSection;
      if (node.data.props && node.data.props.stepsEnabled) {
        const numberOfSteps = node.data.props.numberOfSteps || 3;
        for (let i = 1; i <= numberOfSteps; i++) {
          const stepPropName = `step${i}Children`;
          if (!node.data.props[stepPropName] || !Array.isArray(node.data.props[stepPropName])) {
            node.data.props[stepPropName] = [];
          }
        }
      }
    }

    if (node.data.linkedNodes) {
      Object.keys(node.data.linkedNodes).forEach(key => {
        const linkedNodeId = node.data.linkedNodes[key];
        if (jsonData[linkedNodeId]) {
          jsonData[linkedNodeId] = processNode(jsonData[linkedNodeId]);
        }
      });
    }

    if (node.data.nodes) {
      node.data.nodes.forEach(childId => {
        if (jsonData[childId]) {
          jsonData[childId] = processNode(jsonData[childId]);
        }
      });
    }
    return node;
  };

  Object.keys(jsonData).forEach(nodeId => {
    if (typeof jsonData[nodeId] === 'object' && jsonData[nodeId] !== null) {
        jsonData[nodeId] = processNode(jsonData[nodeId]);
    } else {
        // This case should ideally not be hit if pre-parsing is done correctly
        console.warn(`sanitizeEditorJson: Node ${nodeId} is not an object, skipping processNode. Value:`, jsonData[nodeId]);
    }
  });

  return jsonData;
};

// Storage utility functions
const getStorageKey = (studyGuideId) => `content_editor_${studyGuideId}_draft`;
const getSelectedNodeKey = (studyGuideId) => `content_editor_${studyGuideId}_selected_node`;
const getSelectionMetaKey = (studyGuideId) => `content_editor_${studyGuideId}_selection_meta`;

const saveSelectedNode = (studyGuideId, nodeId, extraMeta = {}) => {
  if (!nodeId) {
    clearSelectedNode(studyGuideId);
    return;
  }
  localStorage.setItem(getSelectedNodeKey(studyGuideId), nodeId);
  localStorage.setItem(getSelectionMetaKey(studyGuideId), JSON.stringify({ timestamp: Date.now(), nodeId, ...extraMeta }));
};

const loadSelectedNode = (studyGuideId) => {
  const nodeId = localStorage.getItem(getSelectedNodeKey(studyGuideId));
  try {
    const meta = JSON.parse(localStorage.getItem(getSelectionMetaKey(studyGuideId)) || '{}');
    return { nodeId, meta };
  } catch (err) {
    return { nodeId, meta: {} };
  }
};

const clearSelectedNode = (studyGuideId) => {
  localStorage.removeItem(getSelectedNodeKey(studyGuideId));
  localStorage.removeItem(getSelectionMetaKey(studyGuideId));
};

const retryWithBackoff = async (fn, maxAttempts = 5, initialDelay = 100) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (err) { console.warn(`Attempt ${attempt + 1} failed:`, err); }
    await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, attempt)));
  }
  return null;
};

const saveDraft = (studyGuideId, { title, content }) => {
  const key = getStorageKey(studyGuideId);
  const draft = { title, content, timestamp: Date.now(), lastSavedVersion: content };
  localStorage.setItem(key, JSON.stringify(draft));
};

const loadDraft = (studyGuideId, isNew = false) => {
  try {
    if (studyGuideId === 'new' && isNew) return null;
    const key = getStorageKey(studyGuideId);
    const draft = localStorage.getItem(key);
    return draft ? JSON.parse(draft) : null; // This first parse might yield a string if double-stringified
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

const clearDraft = (studyGuideId) => {
  localStorage.removeItem(getStorageKey(studyGuideId));
};

const EditorInner = ({ editorJson, initialTitle, onSave, onCancel, onDelete, isNew, selectedStudyGuide }) => {
  const { actions, query } = useEditor();
  const { theme } = useTheme();
  const { showToast } = useToast();
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

  useDragHighlight();

  useEffect(() => {
    const cleanup1 = applyDirectCraftJsFix();
    const cleanup2 = applyCraftJsDragDropOverride(actions);
    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
    };
  }, [actions]);

  useEffect(() => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    let contentLoaded = false;
    const draft = loadDraft(studyGuideId, isNew); // draft.content might be a string or an already parsed object (if from a previous save of editorJson)

    if (draft && draft.content) {
        if (draft.content !== editorJson) {
            if (draft.title && draft.title.trim() !== '' && (!initialTitle || initialTitle.trim() === '')) {
                setTitle(draft.title);
            }
            try {
                let contentToProcess = draft.content;
                // Ensure contentToProcess is an object after initial potential stringification
                if (typeof contentToProcess === 'string') {
                    console.log("Draft content is a string, attempting initial parse...");
                    try {
                        contentToProcess = JSON.parse(contentToProcess);
                    } catch (e) {
                        console.error("Initial parse of draft.content string failed:", e, draft.content.substring(0,500));
                        return; // Cannot proceed
                    }
                }

                // If after the first parse, it's *still* a string (e.g. "{\"ROOT\":{...}}"), parse again.
                if (typeof contentToProcess === 'string') {
                    console.warn("Draft content is STILL a string after initial parse. Attempting second parse for draft.");
                    try {
                        contentToProcess = JSON.parse(contentToProcess);
                    } catch (e) {
                        console.error("Second parse of draft content string failed:", e, contentToProcess.substring(0,500));
                        return; // Critical error
                    }
                }

                if (contentToProcess && typeof contentToProcess === 'object') {
                    contentToProcess = deepParseJsonStrings(contentToProcess); // Deep parse for nested stringified JSON
                    const sanitizedContent = sanitizeEditorJson(contentToProcess);
                    console.log("Deserializing draft content.");
                    actions.deserialize(sanitizedContent);
                    contentLoaded = true;
                } else {
                    console.error("Draft content could not be resolved to an object for processing.");
                }
            } catch (error) {
                console.error('Error processing draft content for deserialization:', error);
            }
        } else {
            console.log("Draft content is same as editorJson prop, skipping deserialize from draft.");
        }
    }

    const restoreSelection = async () => {
      const { nodeId } = loadSelectedNode(studyGuideId);
      if (!nodeId) return;
      await retryWithBackoff(() => {
        try {
          if (query.node(nodeId).exists()) {
            actions.selectNode(nodeId);
            return true;
          }
        } catch (err) { /* ignore */ }
        return false;
      });
    };

    if (contentLoaded || editorJson) {
      restoreSelection();
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const selectedNodes = query.getState().events.selected;
        if (selectedNodes.size > 0) saveSelectedNode(studyGuideId, Array.from(selectedNodes)[0], { fromVisibilityChange: true });
      } else {
        await restoreSelection();
      }
    };
    const handleFocus = async () => await restoreSelection();
    const handleBlur = () => {
      const selectedNodes = query.getState().events.selected;
      if (selectedNodes.size > 0) saveSelectedNode(studyGuideId, Array.from(selectedNodes)[0], { fromBlur: true });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedStudyGuide, editorJson, actions, query, isNew, initialTitle]);

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
  useEffect(() => {
    if (!editorJson || !actions) return;
    if (prevEditorJsonRef.current === editorJson && query.getNodes() && Object.keys(query.getNodes()).length > 1) {
      console.log("Skipping deserialize of editorJson prop, content string is identical and editor not empty.");
      return;
    }
    prevEditorJsonRef.current = editorJson;

    try {
      let parsedData = editorJson; // Assume editorJson might already be an object from StudyGuides.jsx
      if (typeof editorJson === 'string') {
        console.log("editorJson prop is a string, attempting initial parse...");
        try {
            parsedData = JSON.parse(editorJson);
        } catch (e) {
            console.error("Initial parse of editorJson string failed:", e, editorJson.substring(0,500));
            return; // Cannot proceed
        }
      }

      // If after the first parse (if it was a string), it's *still* a string, parse again.
      if (typeof parsedData === 'string') {
        console.warn("editorJson is STILL a string after initial parse. Attempting second parse.");
        try {
            parsedData = JSON.parse(parsedData);
        } catch (e) {
            console.error("Second parse of editorJson string failed:", e, parsedData.substring(0,500));
            return; // Critical error
        }
      }

      if (parsedData && typeof parsedData === 'object') {
        parsedData = deepParseJsonStrings(parsedData); // Deep parse for nested stringified JSON

        if (parsedData.ROOT) {
            const sanitizedData = sanitizeEditorJson(parsedData);
            console.log("Deserializing editorJson prop.");
            actions.deserialize(sanitizedData);
        } else if (Object.keys(parsedData).length === 0 && (editorJson === '{}' || (typeof editorJson === 'object' && Object.keys(editorJson).length === 0))) {
            console.log("Received empty object for editorJson. Craft.js will load default if this is initial.");
            actions.deserialize(parsedData);
        } else if (!parsedData.ROOT) {
            console.warn("Parsed editorJson does not contain ROOT node after all parsing. Skipping deserialize. Final parsedData:", parsedData);
        }
      } else {
        console.error("editorJson could not be resolved to an object for processing.");
      }
    } catch (error) {
      console.warn('EditorInner: Error deserializing content from editorJson prop:', error);
    }
  }, [editorJson, actions, query]);

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
          title: 'Study Guide Published',
          message: 'Your study guide has been published successfully and is now available to all users in the public study guides section.'
        });
      } else {
        setPublishSuccessDialog({
          isOpen: true,
          title: 'Study Guide Unpublished',
          message: 'Your study guide has been unpublished and is no longer visible to users in the public study guides section.'
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
    <div className="flex flex-col h-full" style={{ position: 'relative', paddingBottom: '60px' }}>
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
              className={`w-full h-full px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 text-gray-700 bg-white'} rounded-md text-sm box-border outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="flex items-center gap-3">
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
                    ? 'bg-slate-700 hover:bg-slate-600 border border-teal-500 text-teal-400'
                    : 'bg-white hover:bg-gray-100 border border-teal-500 text-teal-600'
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
      <div className="flex flex-grow gap-4 overflow-hidden h-full">
        <CraftJsDirectPatch />
        {useCollapsibleSectionPatch()}
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
              <Text fontSize="20" fontWeight="400" text="Click to edit this text" />
            </CraftElement>
          </CraftFrame>
        </Viewport>
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
        <div className="flex-1"></div>
        <button type="button" onClick={handleCancelClick} className={`py-2 px-4 ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-white' : 'bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-400 text-gray-700'} rounded-md text-sm cursor-pointer transition-colors`}>Cancel</button>
        <button type="button" onClick={handleSaveAndContinue} disabled={isSaving} className={`py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSaving ? 'Saving...' : 'Save and Continue'}</button>
        <button type="button" onClick={() => handleSave(true)} disabled={isSaving} className={`py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save and Exit')}</button>
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
    </div>
  );
};

const ContentEditor = ({ initialTitle = '', editorJson, onJsonChange, onSave, onCancel, onDelete, isNew = false, selectedStudyGuide = null }) => {
  useEffect(() => {
    window.isCancelingContentEditor = false;
  }, []);

  return (
    <div className="content-editor flex flex-col gap-2 w-full flex-grow h-full overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 130px)' }}>
      <ToolbarZIndexProvider>
        <Editor
          resolver={{
            Container, Text, Button, Image, Card, Interactive, Table, TableText, CollapsibleSection, 'Collapsible Section': CollapsibleSection, Tabs
          }}
          enabled={true}
          onRender={RenderNode}
          options={{ studyGuideId: selectedStudyGuide?.id || 'new' }}
          indicator={{ success: '#006aff', error: '#ef4444' }}
          onNodesChange={(query) => {
            const studyGuideId = selectedStudyGuide?.id || 'new';
            const selectedNodes = query.getState().events.selected;
            if (selectedNodes.size > 0) {
              saveSelectedNode(studyGuideId, Array.from(selectedNodes)[0]);
            } else {
              clearSelectedNode(studyGuideId);
            }

            if (!onJsonChange || !query) return;

            try {
              // Clear any existing timeout
              if (window.jsonChangeTimeout) clearTimeout(window.jsonChangeTimeout);

              // Set a new timeout to debounce changes
              window.jsonChangeTimeout = setTimeout(() => {
                const latestJson = JSON.stringify(query.serialize());
                if (latestJson !== editorJson && !window.isCancelingContentEditor) {
                  saveDraft(studyGuideId, { title: document.getElementById('title')?.value || '', content: latestJson });
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
          />
        </Editor>
      </ToolbarZIndexProvider>
    </div>
  );
};

ContentEditor.displayName = 'ContentEditor';
export default ContentEditor;
