import React, { useState, useEffect, useRef } from 'react';
import { Editor, Frame as CraftFrame, Element as CraftElement, useEditor } from '@craftjs/core';
import { useTheme } from '../../../../contexts/ThemeContext';

import { Viewport } from './components/editor/Viewport';
import { RenderNode } from './components/editor/RenderNode';
import { Container } from './components/selectors/Container';
import { Text } from './components/selectors/Text';
import { Button } from './components/selectors/Button';
import { Image } from './components/selectors/Image';
import { Card } from './components/selectors/Card';
import { Interactive } from './components/selectors/Interactive';

import './styles.css';

// Wrapper component to access editor actions and render the actual editor UI
const EditorInner = ({ editorJson, initialTitle, onSave, onCancel, onDelete, isNew }) => {
  const { actions, query } = useEditor(); // Get actions and query from context
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);

  // Create a ref to store the previous editorJson value
  const prevEditorJsonRef = useRef(null);

  // Effect to handle editorJson changes and deserialization
  useEffect(() => {
    // If no editorJson or no actions, use default content
    if (!editorJson || !actions) {
      return;
    }

    // Only process if editorJson has changed
    if (prevEditorJsonRef.current === editorJson) {
      return;
    }

    prevEditorJsonRef.current = editorJson;

    try {
      const parsedData = JSON.parse(editorJson);
      if (parsedData && parsedData.ROOT) {
        // Deserialize only if content is valid and different from current
        const currentNodes = query.serialize();
        if (JSON.stringify(currentNodes) !== editorJson) {
          actions.deserialize(parsedData);
        }
      }
    } catch (error) {
      console.warn('EditorInner: Error deserializing content:', error);
    }
  }, [editorJson, actions, query]); // Add query to dependencies

  // Update title when initialTitle changes (e.g., selecting a different guide)
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleSave = async (shouldExit = true) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      // Get the latest JSON directly using query.serialize() before saving
      const currentJsonToSave = JSON.stringify(query.serialize());
      console.log('Saving content with data:', {
        title,
        contentLength: currentJsonToSave?.length || 0,
        shouldExit
      });

      // Call the onSave prop passed down from ContentEditor -> StudyGuides
      await onSave({
        title,
        content: currentJsonToSave, // Use freshly serialized content
        shouldExit
      });

      console.log('Content save initiated successfully');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSave(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      onDelete(); // Call the onDelete prop passed down
    }
  };

  // Render the actual editor UI
  return (
    <>
      {/* Title Input */}
      <div className="flex w-full h-[38px] justify-between items-center mb-2"> {/* Added margin-bottom */}
        <div className="w-[70%] h-full">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full h-full px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 text-gray-700 bg-white'} rounded-md text-sm box-border outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
            placeholder="Enter content title"
            required
          />
        </div>
      </div>

      {/* Main Editor Area - Viewport and Frame */}
      <div className="flex flex-grow gap-4" style={{ flex: '1 1 auto', minHeight: '600px' }}> {/* Added container div */}
        <Viewport>
          <CraftFrame>
            {/* Always render the default content */}
            <CraftElement
              canvas
              is={Container}
              width="100%"
              height="auto"
              background={{ r: 255, g: 255, b: 255, a: 1 }}
              padding={['20', '20', '20', '20']}
              custom={{ displayName: 'Root Container', isCanvas: true }}
            >
              <Text
                fontSize="20"
                fontWeight="400"
                text="Click to edit this text"
              />
            </CraftElement>
          </CraftFrame>
        </Viewport>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        {!isNew && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`py-2 px-4 ${isDark ? 'bg-slate-800 hover:bg-red-900/30' : 'bg-white hover:bg-red-50'} border border-red-600 text-red-600 rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}
          >
            Delete
          </button>
        )}
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={onCancel} // Use the onCancel prop passed down
          className={`py-2 px-4 ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-white' : 'bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-400 text-gray-700'} rounded-md text-sm cursor-pointer transition-colors`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          className={`py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save and Continue'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className={`py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save and Exit')}
        </button>
      </div>
    </>
  );
};


// Main ContentEditor component: Sets up the Editor provider
const ContentEditor = ({
  initialTitle = '',
  editorJson, // Prop from parent (StudyGuides)
  onJsonChange, // Callback to parent (StudyGuides)
  onSave,       // Callback to parent (StudyGuides)
  onCancel,     // Callback to parent (StudyGuides)
  onDelete,     // Callback to parent (StudyGuides)
  isNew = false,
  selectedStudyGuide = null // Keep for context if needed
}) => {

  return (
    <div className="content-editor flex flex-col gap-2 w-full flex-grow h-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Editor
          resolver={{ Container, Text, Button, Image, Card, Interactive }}
          enabled={true}
          onRender={RenderNode}
          options={{ studyGuideId: selectedStudyGuide?.id || 'new' }}
          indicator={{ success: '#0d9488', error: '#ef4444' }}
          onNodesChange={(query) => {
            // Only process changes if we have a callback and the editor is ready
            if (!onJsonChange || !query) return;
            
            try {
              const currentJson = JSON.stringify(query.serialize());
              const currentNodes = query.getNodes();
              
              // Skip if no content yet or content hasn't changed
              if (!currentJson || currentJson === editorJson) return;
              
              // Skip initial setup updates
              if (Object.keys(currentNodes).length <= 2 && !editorJson) return;
              
              // Use ref for debouncing
              if (window.jsonChangeTimeout) {
                clearTimeout(window.jsonChangeTimeout);
              }
              
              window.jsonChangeTimeout = setTimeout(() => {
                const latestJson = JSON.stringify(query.serialize());
                if (latestJson !== editorJson) {
                  onJsonChange(latestJson);
                }
              }, 1000);
              
            } catch (error) {
              console.error("Error serializing editor state in onNodesChange:", error);
            }
          }}
        >
          {/* Render the inner component that contains the actual UI and uses the editor context */}
          <EditorInner
            editorJson={editorJson}           // Pass the JSON state down
            initialTitle={initialTitle}       // Pass title down
            onSave={onSave}                   // Pass save handler down
            onCancel={onCancel}               // Pass cancel handler down
            onDelete={onDelete}               // Pass delete handler down
            isNew={isNew}                     // Pass isNew flag down
            // selectedStudyGuide is available via options, no need to pass down unless EditorInner specifically needs it
          />
        </Editor>
    </div>
  );
};

ContentEditor.displayName = 'ContentEditor';

export default ContentEditor;
