import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { Editor } from '@tinymce/tinymce-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

const StudyGuideEditor = ({
  initialContent = '',
  initialTitle = '',
  onSave,
  onCancel,
  onDelete,
  isNew = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const iframeRef = useRef(null); // Ref for the preview iframe
  const [scriptContent, setScriptContent] = useState(''); // Store script content separately

  // Effect to manually update iframe content in HTML mode
  useEffect(() => {
    if (isHtmlMode && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(content);
      iframeDoc.close();
    }
  }, [content, isHtmlMode]);

  // Extract script content from initialContent when component mounts
  useEffect(() => {
    const scriptMatch = initialContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch && scriptMatch[1]) {
      setScriptContent(scriptMatch[1]);
    }
  }, [initialContent]);

  // Extract body content from full HTML document
  const extractBodyContent = (htmlContent) => {
    const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : htmlContent;
  };

  // Get full HTML document with head and body
  const getFullHtml = (bodyContent) => {
    if (bodyContent.includes('<!DOCTYPE html>')) {
      return bodyContent; // Already a full document
    }
    
    // Extract style content from current content
    const styleContent = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Study Guide'}</title>
    <style>
        ${styleContent}
    </style>
</head>
<body>
    ${bodyContent}
    ${scriptContent ? `<script>\n${scriptContent}\n</script>` : ''}
</body>
</html>`;
  };

  // Initialize content state
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleDelete = async () => {
    try {
      await onDelete();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting study guide:', error);
      alert('Failed to delete study guide');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      // When saving, ensure we're sending the full HTML document
      await onSave({
        title,
        content: getFullHtml(content)
      });
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMode = () => {
    setIsHtmlMode(!isHtmlMode);
  };

    // Editor configuration
  const editorConfig = {
    height: 500,
    menubar: true,
    license_key: 'gpl',
    base_url: '/tinymce',
    external_plugins: {
      // Define the path to the custom plugin JS file relative to the public root
      'interactives': '/tinymce/plugins/interactives/plugin.js'
    },
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount',
      'interactives' // Ensure the plugin name is also listed here to be loaded
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | image link table interactives | code | help', // Add the button here
    content_style: `
      @import url('/fonts/inter.css');
      body { 
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        margin: 0;
        padding: 16px;
        box-sizing: border-box;
        max-width: 100%;
        min-height: 100%;
        outline: none;
        line-height: 1.5;
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
        padding: 8px;
        border: 1px solid #e5e7eb;
      }
      p { margin: 0 0 1em 0; }
      p:last-child { margin-bottom: 0; }
    `,
    // Core settings only
    branding: false,
    verify_html: false,
    element_format: 'html',
    schema: 'html5',
    allow_script_urls: true,
    content_security_policy: "default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
  };

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
      width: '100%',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    },
    panelGroupContainer: {
      flex: 1,
      minHeight: 0,  /* Important for Firefox */
      height: '100%'
    },
    resizeHandle: {
      width: '4px',
      margin: '0 8px',
      background: '#D1D5DB',
      borderRadius: '2px',
      transition: 'background-color 0.2s',
      cursor: 'col-resize',
      height: '100%'  /* Ensure handle fills height */
    },
    resizeHandleHovered: {
      background: '#9CA3AF'
    },
    htmlEditorColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100%',
      minHeight: 0  /* Important for Firefox */
    },
    textarea: {
      width: '100%',
      height: 'calc(100% - 30px)',  /* Subtract label height */
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '8px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      resize: 'none'
    },
    previewContainer: {
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      padding: '16px',
      height: 'calc(100% - 30px)',  /* Subtract label height */
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
    deleteButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #DC2626',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#DC2626',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    cancelButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '12px'
    },
    modalText: {
      fontSize: '14px',
      color: '#4B5563',
      marginBottom: '20px'
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    modalCancelButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer'
    },
    modalDeleteButton: {
      padding: '8px 16px',
      backgroundColor: '#DC2626',
      border: '1px solid transparent',
      borderRadius: '6px',
      fontSize: '14px',
      color: 'white',
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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
        >
          {isHtmlMode ? 'Switch to Rich Text' : 'Switch to HTML'}
        </button>
      </div>

      {/* Editor */}
      <div style={styles.editorContainer}>
        {isHtmlMode ? (
          <div style={styles.htmlEditorContainer}>
            <div style={styles.panelGroupContainer}>
              <PanelGroup direction="horizontal" style={{ height: '100%' }}>
              <Panel defaultSize={50} minSize={30}>
                <div style={styles.htmlEditorColumn}>
                  <label style={styles.label}>
                    HTML Editor
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={styles.textarea}
                    placeholder="Enter HTML content"
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle>
                <div
                  style={styles.resizeHandle}
                  onMouseEnter={e => e.currentTarget.style.background = '#9CA3AF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#D1D5DB'}
                />
              </PanelResizeHandle>
              
              <Panel defaultSize={50} minSize={30}>
                <div style={styles.htmlEditorColumn}>
                  <label style={styles.label}>
                    Preview
                  </label>
                  <div style={styles.previewContainer}>
                    <iframe
                      ref={iframeRef} // Assign the ref
                      // srcDoc is removed as we write content manually via useEffect
                      style={styles.iframe}
                      sandbox="allow-scripts allow-same-origin allow-downloads"
                      title="Preview"
                    />
                  </div>
                </div>
              </Panel>
              </PanelGroup>
            </div>
          </div>
        ) : (
          <Editor
            value={extractBodyContent(content)}
            onEditorChange={(newContent, editor) => {
              // When using TinyMCE, wrap its content in full HTML structure
              setContent(getFullHtml(newContent));
            }}
            init={editorConfig}
            tinymceScriptSrc="/tinymce/tinymce.min.js"
          />
        )}
      </div>

      {/* Actions */}
      <div style={styles.actionContainer}>
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={styles.deleteButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Delete
          </button>
        )}
        <div style={{ flex: 1 }}></div>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#3B82F6';
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          {isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div style={styles.modalOverlay}>
          <Dialog.Panel style={styles.modalContent}>
            <Dialog.Title style={styles.modalTitle}>
              Delete Study Guide
            </Dialog.Title>
            <Dialog.Description style={styles.modalText}>
              Are you sure you want to delete this study guide? This action cannot be undone and all associated data will be permanently lost.
            </Dialog.Description>
            <div style={styles.modalButtons}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={styles.modalCancelButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={styles.modalDeleteButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#B91C1C';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

StudyGuideEditor.displayName = 'StudyGuideEditor';

export default StudyGuideEditor;
