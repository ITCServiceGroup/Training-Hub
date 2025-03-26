import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple selection management utility - kept outside of render tree
const selectionManager = {
  // Save the current selection
  save: (doc) => {
    try {
      const selection = doc.getSelection();
      if (selection.rangeCount > 0) {
        return selection.getRangeAt(0).cloneRange();
      }
    } catch (e) {
      console.error('Error saving selection:', e);
    }
    return null;
  },
  
  // Restore a saved selection
  restore: (doc, range) => {
    try {
      if (!range) return;
      
      const selection = doc.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.error('Error restoring selection:', e);
    }
  }
};

// Format button component
const FormatButton = ({ 
  command, 
  value, 
  icon, 
  title, 
  onClick,
  editorIframe,
  formatDoc
}) => {
  // Helper function to check active state directly from the document
  const isActive = () => {
    if (!editorIframe || !editorIframe.contentDocument) return false;
    
    try {
      if (command === 'formatBlock') {
        const currentValue = editorIframe.contentDocument.queryCommandValue('formatBlock');
        return currentValue ? currentValue.toLowerCase() === value?.replace(/[<>]/g, '').toLowerCase() : false;
      }
      return editorIframe.contentDocument.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else {
      formatDoc(command, value);
    }
  };

  // Button styles with active state
  const buttonStyle = {
    backgroundColor: isActive() ? '#E5E7EB' : 'white',
    border: `1px solid ${isActive() ? '#9CA3AF' : '#D1D5DB'}`,
    borderRadius: '4px',
    padding: '6px 10px',
    margin: '0 2px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    color: isActive() ? '#111827' : '#374151',
    minWidth: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isActive() ? '#D1D5DB' : '#F3F4F6';
        e.currentTarget.style.borderColor = '#9CA3AF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isActive() ? '#E5E7EB' : 'white';
        e.currentTarget.style.borderColor = isActive() ? '#9CA3AF' : '#D1D5DB';
      }}
    >
      {icon}
    </button>
  );
};

FormatButton.displayName = 'FormatButton';

const StudyGuideEditor = ({ 
  initialContent = '', 
  initialTitle = '',
  onSave,
  onCancel,
  isNew = false
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editorIframe, setEditorIframe] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const isMounted = useRef(false);
  const contentRef = useRef(content);
  const lastSelectionRef = useRef(null);

  // Keep contentRef updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Initialize content state
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Set mounted flag
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setupIframe = useCallback((iframe) => {
    if (!isMounted.current || !iframe?.contentWindow) return;

    try {
      const doc = iframe.contentDocument;
      
      // Create the document structure
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              html { height: 100%; }
              body {
                font-family: system-ui;
                margin: 0;
                padding: 16px;
                height: 100%;
                box-sizing: border-box;
                max-width: 100%;
                min-height: 100%;
                outline: none;
                line-height: 1.5;
              }
              * { box-sizing: inherit; }
              img, table {
                max-width: 100%;
                height: auto;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              td, th {
                word-break: break-word;
                padding: 8px;
                border: 1px solid #e5e7eb;
              }
              p { margin: 0 0 1em 0; }
              p:last-child { margin-bottom: 0; }
            </style>
          </head>
          <body spellcheck="true">${content || '<p><br></p>'}</body>
        </html>
      `);
      doc.close();

      // Set reference and enable editing
      setEditorIframe(iframe);
      doc.designMode = 'on';
      
      // Create event handlers
      const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        doc.execCommand('insertText', false, text);
      };

      const handleSelectionChange = () => {
        if (isMounted.current) {
          // Save the current selection whenever it changes
          lastSelectionRef.current = selectionManager.save(doc);
          
          // Force toolbar buttons to update their state
          setForceUpdate(prev => prev + 1);
        }
      };

      const handleBlur = () => {
        if (isMounted.current) {
          // Only update content when focus leaves the editor
          const newContent = doc.body.innerHTML;
          if (newContent !== contentRef.current) {
            contentRef.current = newContent;
            setContent(newContent);
          }
        }
      };
      
      // Add event listeners
      doc.addEventListener('paste', handlePaste);
      doc.addEventListener('selectionchange', handleSelectionChange);
      doc.addEventListener('blur', handleBlur);
      doc.addEventListener('mouseup', handleSelectionChange);
      doc.addEventListener('keyup', handleSelectionChange);
      doc.addEventListener('click', handleSelectionChange);
      
      // Focus the editor
      doc.body.focus();

      // Return cleanup function
      return () => {
        try {
          doc.removeEventListener('paste', handlePaste);
          doc.removeEventListener('selectionchange', handleSelectionChange);
          doc.removeEventListener('blur', handleBlur);
          doc.removeEventListener('mouseup', handleSelectionChange);
          doc.removeEventListener('keyup', handleSelectionChange);
          doc.removeEventListener('click', handleSelectionChange);
          doc.designMode = 'off';
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      };
    } catch (error) {
      console.error('Setup error:', error);
      return () => {};
    }
  }, [content]);

  // Initialize the editor iframe
  useEffect(() => {
    let cleanup = () => {};

    if (isHtmlMode) {
      setEditorIframe(null);
      return cleanup;
    }

    // Get the iframe element
    const iframe = document.getElementById('richTextEditor');
    if (!iframe) return cleanup;

    // Setup after a brief delay to ensure frame is ready
    const timer = setTimeout(() => {
      cleanup = setupIframe(iframe) || (() => {});
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [isHtmlMode, setupIframe]);

  // Handle HTML mode changes
  const handleHtmlChange = (e) => {
    setContent(e.target.value);
    setPreviewKey(prev => prev + 1);
  };

  const toggleMode = () => {
    try {
      if (!isHtmlMode) {
        syncContent();
      }
      setIsHtmlMode(!isHtmlMode);
    } catch (error) {
      console.error('Error toggling editor mode:', error);
      alert('Failed to toggle editor mode. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!isHtmlMode) {
      syncContent();
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        content
      });
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    } finally {
      setIsSaving(false);
    }
  };

  // Sync iframe content with React state
  const syncContent = useCallback(() => {
    if (!editorIframe || !isMounted.current) return;
    try {
      const newContent = editorIframe.contentDocument.body.innerHTML;
      if (newContent !== contentRef.current) {
        setContent(newContent);
      }
    } catch (e) {
      console.error('Error syncing content:', e);
    }
  }, [editorIframe]);

  // Helper function to select word at cursor if no selection exists
  const selectWordAtCursor = useCallback((doc) => {
    const selection = doc.getSelection();
    
    // If there's already a selection, don't change it
    if (!selection.isCollapsed) return true;
    
    // Get the current node and offset
    const node = selection.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;
    
    const text = node.textContent;
    const offset = selection.anchorOffset;
    
    // Find word boundaries
    let startOffset = offset;
    let endOffset = offset;
    
    // Find start of word
    while (startOffset > 0 && !/\s/.test(text[startOffset - 1])) {
      startOffset--;
    }
    
    // Find end of word
    while (endOffset < text.length && !/\s/.test(text[endOffset])) {
      endOffset++;
    }
    
    // If we found a word, select it
    if (startOffset !== endOffset) {
      selection.setBaseAndExtent(node, startOffset, node, endOffset);
      return true;
    }
    
    return false;
  }, []);
  
  // Specialized function for inline formatting (bold, italic, underline)
  const applyInlineFormat = useCallback((command) => {
    if (!editorIframe) return;
    
    try {
      const doc = editorIframe.contentDocument;
      console.log(`Applying ${command} format`);
      
      // Save current selection
      const savedRange = lastSelectionRef.current || selectionManager.save(doc);
      
      // Make sure there's a selection
      const hasSelection = selectWordAtCursor(doc);
      console.log(`Has selection: ${hasSelection}`);
      
      // Execute command directly on the document
      doc.execCommand(command, false, null);
      console.log(`Executed ${command} command`);
      
      // Restore selection immediately
      if (savedRange) {
        selectionManager.restore(doc, savedRange);
        doc.body.focus();
      }
      
      // Force toolbar buttons to update their state
      setForceUpdate(prev => prev + 1);
      
    } catch (e) {
      console.error(`Error applying ${command} format:`, e);
    }
  }, [editorIframe, selectWordAtCursor]);
  
  // Standard formatDoc function for block-level formatting
  const formatDoc = useCallback((command, value = null) => {
    if (!editorIframe) return;
    
    try {
      const doc = editorIframe.contentDocument;
      
      // Save current selection
      const savedRange = lastSelectionRef.current || selectionManager.save(doc);
      
      // Execute command directly on the document
      doc.execCommand(command, false, value);
      
      // Restore selection immediately
      if (savedRange) {
        selectionManager.restore(doc, savedRange);
        doc.body.focus();
      }
      
      // Force toolbar buttons to update their state
      setForceUpdate(prev => prev + 1);
      
    } catch (e) {
      console.error('Error executing command:', e);
    }
  }, [editorIframe]);

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      width: '100%'
    },
    toggleButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    toggleButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer'
    },
    editorContainer: {
      width: '100%',
      overflow: 'hidden'
    },
    htmlEditorContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      padding: '16px'
    },
    htmlEditorColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    textarea: {
      width: '100%',
      height: '500px',
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '8px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px'
    },
    previewContainer: {
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      padding: '16px',
      height: '500px',
      overflow: 'auto'
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none'
    },
    actionContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '16px'
    },
    toolbar: {
      display: 'flex',
      padding: '8px',
      borderBottom: '1px solid #E5E7EB',
      flexWrap: 'wrap',
      gap: '4px',
      backgroundColor: '#F9FAFB'
    },
    divider: {
      width: '1px',
      backgroundColor: '#D1D5DB',
      margin: '0 8px',
      alignSelf: 'stretch'
    },
    editorIframe: {
      width: '100%',
      height: '500px',
      border: '1px solid #D1D5DB',
      borderTop: 'none',
      borderRadius: '0 0 6px 6px'
    },
    saveButton: {
      padding: '8px 16px',
      backgroundColor: '#3B82F6',
      border: '1px solid transparent',
      borderRadius: '6px',
      fontSize: '14px',
      color: 'white',
      cursor: isSaving ? 'not-allowed' : 'pointer',
      opacity: isSaving ? 0.5 : 1
    },
    cancelButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Title Input */}
      <div style={styles.formGroup}>
        <label htmlFor="title" style={styles.label}>
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          placeholder="Enter study guide title"
          required
        />
      </div>

      {/* Mode Toggle */}
      <div style={styles.toggleButtonContainer}>
        <button
          type="button"
          onClick={toggleMode}
          style={styles.toggleButton}
        >
          {isHtmlMode ? 'Switch to Rich Text' : 'Switch to HTML'}
        </button>
      </div>

      {/* Editor */}
      <div style={styles.editorContainer}>
        {isHtmlMode ? (
          <div style={styles.htmlEditorContainer}>
            <div style={styles.htmlEditorColumn}>
              <label style={styles.label}>
                HTML Editor
              </label>
              <textarea
                value={content}
                onChange={handleHtmlChange}
                style={styles.textarea}
                placeholder="Enter HTML content"
              />
            </div>
            <div style={styles.htmlEditorColumn}>
              <label style={styles.label}>
                Preview
              </label>
              <div style={styles.previewContainer}>
                <iframe
                  key={previewKey}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <style>
                          body {
                            font-family: system-ui;
                            margin: 0;
                            padding: 16px;
                            box-sizing: border-box;
                            max-width: 100%;
                          }
                          img, table {
                            max-width: 100%;
                            height: auto;
                          }
                          table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          td, th {
                            word-break: break-word;
                          }
                        </style>
                      </head>
                      <body>${content}</body>
                    </html>
                  `}
                  style={styles.iframe}
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Toolbar */}
            <div style={styles.toolbar}>
              {/* Text formatting */}
              <button
                style={{
                  backgroundColor: editorIframe?.contentDocument?.queryCommandState('bold') ? '#E5E7EB' : 'white',
                  border: `1px solid ${editorIframe?.contentDocument?.queryCommandState('bold') ? '#9CA3AF' : '#D1D5DB'}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  margin: '0 2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: editorIframe?.contentDocument?.queryCommandState('bold') ? '#111827' : '#374151',
                  minWidth: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyInlineFormat('bold');
                }}
                onMouseDown={(e) => e.preventDefault()}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                style={{
                  backgroundColor: editorIframe?.contentDocument?.queryCommandState('italic') ? '#E5E7EB' : 'white',
                  border: `1px solid ${editorIframe?.contentDocument?.queryCommandState('italic') ? '#9CA3AF' : '#D1D5DB'}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  margin: '0 2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: editorIframe?.contentDocument?.queryCommandState('italic') ? '#111827' : '#374151',
                  minWidth: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyInlineFormat('italic');
                }}
                onMouseDown={(e) => e.preventDefault()}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                style={{
                  backgroundColor: editorIframe?.contentDocument?.queryCommandState('underline') ? '#E5E7EB' : 'white',
                  border: `1px solid ${editorIframe?.contentDocument?.queryCommandState('underline') ? '#9CA3AF' : '#D1D5DB'}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  margin: '0 2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: editorIframe?.contentDocument?.queryCommandState('underline') ? '#111827' : '#374151',
                  minWidth: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyInlineFormat('underline');
                }}
                onMouseDown={(e) => e.preventDefault()}
                title="Underline (Ctrl+U)"
              >
                U
              </button>
              
              <div style={styles.divider}></div>
              
              {/* Headings */}
              <FormatButton 
                command="formatBlock"
                value="<h1>"
                icon="H1"
                title="Heading 1"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`h1-${forceUpdate}`}
              />
              <FormatButton 
                command="formatBlock"
                value="<h2>"
                icon="H2"
                title="Heading 2"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`h2-${forceUpdate}`}
              />
              <FormatButton 
                command="formatBlock"
                value="<h3>"
                icon="H3"
                title="Heading 3"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`h3-${forceUpdate}`}
              />
              <FormatButton 
                command="formatBlock"
                value="<p>"
                icon="P"
                title="Paragraph"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`p-${forceUpdate}`}
              />
              
              <div style={styles.divider}></div>
              
              {/* Lists */}
              <FormatButton 
                command="insertUnorderedList"
                icon="• List"
                title="Bullet List"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`ul-${forceUpdate}`}
              />
              <FormatButton 
                command="insertOrderedList"
                icon="1. List"
                title="Numbered List"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`ol-${forceUpdate}`}
              />
              
              <div style={styles.divider}></div>
              
              {/* Alignment */}
              <FormatButton 
                command="justifyLeft"
                icon="←"
                title="Align Left"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`left-${forceUpdate}`}
              />
              <FormatButton 
                command="justifyCenter"
                icon="↔"
                title="Align Center"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`center-${forceUpdate}`}
              />
              <FormatButton 
                command="justifyRight"
                icon="→"
                title="Align Right"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`right-${forceUpdate}`}
              />
              
              <div style={styles.divider}></div>
              
              {/* Insert */}
              <FormatButton 
                command="insertImage"
                icon="Image"
                title="Insert Image"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`image-${forceUpdate}`}
                onClick={() => {
                  // Save selection before prompt
                  if (editorIframe && editorIframe.contentDocument) {
                    lastSelectionRef.current = selectionManager.save(editorIframe.contentDocument);
                  }
                  
                  const url = prompt('Enter image URL:');
                  if (url) {
                    // Restore selection before inserting
                    if (lastSelectionRef.current && editorIframe && editorIframe.contentDocument) {
                      selectionManager.restore(editorIframe.contentDocument, lastSelectionRef.current);
                      editorIframe.contentDocument.execCommand('insertImage', false, url);
                      
                      // Force update to refresh button states
                      setForceUpdate(prev => prev + 1);
                    }
                  }
                }}
              />
              <FormatButton 
                command="createLink"
                icon="Link"
                title="Insert Link"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`link-${forceUpdate}`}
                onClick={() => {
                  // Save selection before prompt
                  if (editorIframe && editorIframe.contentDocument) {
                    lastSelectionRef.current = selectionManager.save(editorIframe.contentDocument);
                  }
                  
                  const url = prompt('Enter link URL:');
                  if (url) {
                    // Restore selection before inserting
                    if (lastSelectionRef.current && editorIframe && editorIframe.contentDocument) {
                      selectionManager.restore(editorIframe.contentDocument, lastSelectionRef.current);
                      editorIframe.contentDocument.execCommand('createLink', false, url);
                      
                      // Force update to refresh button states
                      setForceUpdate(prev => prev + 1);
                    }
                  }
                }}
              />
              <FormatButton 
                command="insertHTML"
                icon="Table"
                title="Insert Table"
                editorIframe={editorIframe}
                formatDoc={formatDoc}
                key={`table-${forceUpdate}`}
                onClick={() => formatDoc('insertHTML', '<table border="1" style="border-collapse: collapse; width: 100%;"><tr><td style="border: 1px solid #ccc; padding: 8px;">Cell 1</td><td style="border: 1px solid #ccc; padding: 8px;">Cell 2</td></tr><tr><td style="border: 1px solid #ccc; padding: 8px;">Cell 3</td><td style="border: 1px solid #ccc; padding: 8px;">Cell 4</td></tr></table>')}
              />
            </div>
            
            {/* Rich Text Editor Iframe */}
            <iframe 
              id="richTextEditor"
              style={styles.editorIframe}
              title="Rich Text Editor"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actionContainer}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save')}
        </button>
      </div>
    </div>
  );
};

StudyGuideEditor.displayName = 'StudyGuideEditor';

export default StudyGuideEditor;
