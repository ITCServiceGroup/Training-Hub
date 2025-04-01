import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { Editor } from '@tinymce/tinymce-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import PreviewModal from '../PreviewModal';

const StudyGuideEditor = ({
  initialContent = '',
  initialTitle = '',
  onSave,
  onCancel,
  onDelete,
  isNew = false
}) => {
  const [content, setContent] = useState(''); // State now holds only BODY content
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const iframeRef = useRef(null); // Ref for the preview iframe
  const isInitialMount = useRef(true); // Track if this is the first mount
  // REMOVED: const [scriptContent, setScriptContent] = useState('');
  const isEditorInitialized = useRef(false); // Ref to track editor initialization
  const [htmlModeContent, setHtmlModeContent] = useState(''); // State for HTML mode textarea content
  const [previewContent, setPreviewContent] = useState(''); // State for preview content

  // Process content to replace shortcodes with custom element tags (similar to StudyGuideViewer)
  const processContentForWebComponents = (content) => {
    if (!content) return '';
    const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
    // Replace shortcode with the corresponding custom element tag
    return content.replace(shortcodeRegex, (match, name) => {
      // Basic validation for name
      if (!/^[a-zA-Z0-9-]+$/.test(name)) {
        console.warn(`Invalid interactive element name found: ${name}`);
        return `<p style="color: red; border: 1px solid red; padding: 5px;">[Invalid interactive element: ${name}]</p>`;
      }
      // Construct the custom element tag name (e.g., fiber-fault -> fiber-fault-simulator)
      const tagName = `${name}-simulator`; // Assuming this convention matches the definition
      console.log(`Replacing shortcode for "${name}" with <${tagName}>`);
      return `<${tagName}></${tagName}>`;
    });
  };

  // Effect to manually update iframe content in HTML mode with interactive element support
  useEffect(() => {
    // Only run if in HTML mode and the iframe ref is available
    if (isHtmlMode && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentWindow.document;

      // Extract parts from the full HTML content in the textarea
      const fullHtml = htmlModeContent;
      const styleContent = extractStyleContent(fullHtml);
      const bodyContent = extractBodyContent(fullHtml);
      // Extract and deduplicate all script content
      const mainScriptContent = extractUniqueScriptContent(fullHtml);

      // Process body content to replace shortcodes with custom element tags
      const processedBodyContent = processContentForWebComponents(bodyContent);

      // Write the basic structure
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
      iframeDoc.close();

      // Inject styles
      if (styleContent) {
        const styleEl = iframeDoc.createElement('style');
        styleEl.textContent = styleContent;
        iframeDoc.head.appendChild(styleEl);
      }

      // Inject processed body content
      iframeDoc.body.innerHTML = processedBodyContent;

      // --- Inject Interactive Element Scripts ---
      const injectedScripts = new Set();
      const requiredElements = new Set();
      const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
      let match;
      // Scan the *original* body content for shortcodes
      while ((match = shortcodeRegex.exec(bodyContent)) !== null) {
         if (/^[a-zA-Z0-9-]+$/.test(match[1])) { // Basic validation
           requiredElements.add(match[1]);
         }
      }

      console.log("Required interactive elements in HTML preview:", requiredElements);

      requiredElements.forEach(elementName => {
        // Use the new standard filename 'index.js'
        const scriptPath = `/interactive-elements/${elementName}/index.js`;
        if (!injectedScripts.has(scriptPath)) {
          // Construct the tag name based on the element name
          const tagName = `${elementName}-simulator`;
          console.log(`Injecting script for <${tagName}> in HTML preview: ${scriptPath}`);
          const script = iframeDoc.createElement('script');
          // Use absolute URL to ensure correct path from iframe context
          script.src = new URL(scriptPath, window.location.origin).href;
          script.async = false; // Ensure scripts load in order if needed
          script.onerror = () => console.error(`Failed to load script in preview: ${scriptPath}`);
          iframeDoc.body.appendChild(script);
          injectedScripts.add(scriptPath);
        }
      });
      // --- End Interactive Element Script Injection ---

      // Only inject script if it exists in the current HTML content
      const currentScripts = extractUniqueScriptContent(htmlModeContent);
      if (currentScripts) {
        console.log("Injecting current script content in HTML preview.");
        const mainScriptEl = iframeDoc.createElement('script');
        mainScriptEl.textContent = currentScripts;
        // Ensure main script runs after interactive elements are potentially defined
        mainScriptEl.defer = true;
        iframeDoc.body.appendChild(mainScriptEl);
      } else {
        console.log("No script content found in current HTML");
      }
    }
  }, [htmlModeContent, isHtmlMode]); // Update HTML preview when content or mode changes

  // Extract body and script content from initialContent and preserve user edits
  useEffect(() => {
    // Extract and set body content
    // Set initial content (body + script) for the editor
    // Note: TinyMCE should handle the full body content including scripts
    setContent(extractBodyContent(initialContent)); 
    isInitialMount.current = false; // Mark initial mount as done
    
    setTitle(initialTitle);
    isEditorInitialized.current = false;
  }, [initialContent, initialTitle]);

  // Function to prepare HTML content for preview
  const prepareContentForPreview = (htmlContent) => {
    if (!htmlContent) return htmlContent;
    
    // Only process HTML content
    if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
      return htmlContent;
    }
    
    // Add a comment to help with debugging
    const debugComment = `
<!-- 
  Preview content prepared by StudyGuideEditor
  Timestamp: ${new Date().toISOString()}
  Content length: ${htmlContent.length}
-->
`;

    // Find the head tag to insert our comment
    const headIndex = htmlContent.indexOf('<head>');
    if (headIndex !== -1) {
      return htmlContent.slice(0, headIndex + 6) + debugComment + htmlContent.slice(headIndex + 6);
    }
    
    return htmlContent;
  };
  
  // Extract body content from full HTML document
  const extractBodyContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Check if it's a full HTML document
    if (htmlContent.includes('<body')) {
      const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return match ? match[1] : htmlContent;
    }
    
    return htmlContent;
  };

  // Helper to extract style content from a full HTML string
  const extractStyleContent = (fullHtml) => {
    return fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || '';
  };

  // Helper to extract and deduplicate script content
  const extractUniqueScriptContent = (htmlContent) => {
    // Find all script tags that don't have src attribute
    const scriptMatches = htmlContent.match(/<script(?![^>]*?\bsrc\b)[^>]*>([\s\S]*?)<\/script>/ig) || [];
    if (!scriptMatches.length) return '';

    // Extract content from each script tag and deduplicate
    const uniqueScripts = new Set();
    scriptMatches.forEach(script => {
      const content = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1].trim();
      if (content) uniqueScripts.add(content);
    });

    // Join unique scripts with newlines
    return Array.from(uniqueScripts).join('\n\n');
  };

  // Get full HTML document for saving or HTML mode view
  const getFullHtmlForSave = (bodyContentToSave) => {
    // In HTML mode, use the content exactly as it is
    if (isHtmlMode) {
      return htmlModeContent;
    }

    // Otherwise, construct the HTML while preserving script content
    let baseStyles = `
      @import url('/fonts/inter.css');
      body { font-family: 'Inter', sans-serif; line-height: 1.6; margin: 20px; }
      .section { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 4px; }
      h1, h2, h3 { color: #333; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background-color: #f2f2f2; }
      .interactive-placeholder { background-color: #f0f7ff; border: 1px solid #bbd6ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    `;
    
    const styleContent = extractStyleContent(initialContent) || baseStyles;

    // Generate the final HTML with proper whitespace and indentation
    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `    <title>${title || 'Study Guide'}</title>`,
      '    <style>',
      `        ${styleContent.trim()}`,
      '    </style>',
      '</head>',
      '<body>',
      bodyContentToSave, // This now includes the script tag if present in RTE content
      // REMOVED: explicit scriptContent append
      '</body>',
      '</html>'
    ].join('\n');
  };

  // Removed the extra useEffect for setContent(initialContent)

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
      // Reconstruct full HTML only on save
      await onSave({
        title,
        content: getFullHtmlForSave(content) // Pass current body content
      });
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    } finally {
      setIsSaving(false);
    }
  };

  // Reference to the TinyMCE editor instance
  const editorRef = useRef(null);
  
  // Debug state to track content changes
  const [debugInfo, setDebugInfo] = useState({
    lastRichTextContent: '',
    lastHtmlContent: ''
  });

  const toggleMode = () => {
    if (!isHtmlMode) {
      // Switching from Rich Text to HTML mode
      // Use current script content to rebuild HTML
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Study Guide'}</title>
    <style>
        ${extractStyleContent(initialContent) || ''}
    </style>
</head>
<body>
    ${content} 
</body>
</html>`;

      setHtmlModeContent(fullHtml);
      // REMOVED: console.log referencing deleted scriptContent
      console.log("Switching to HTML mode"); 
    } else {
      // Switching from HTML to Rich Text mode
      // Extract only the body content
      const newBodyContent = extractBodyContent(htmlModeContent);
      // Set RTE content to full body extracted from HTML mode (includes script)
      setContent(newBodyContent); 
      
      // REMOVED: scriptContent update logic
      
      console.log("Switching to Rich Text mode");
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Editor configuration
  const editorConfig = {
    height: 700, // Set fixed pixel height
    menubar: true,
    license_key: 'gpl',
    base_url: '/tinymce',
    external_plugins: {
      // Define the path to the custom plugin JS file relative to the public root
      'interactives': '/tinymce/plugins/interactives/plugin.js',
      'custompreview': '/tinymce/plugins/custompreview/plugin.js'
    },
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', // Removed autoresize
      'interactives', 'custompreview'
    ],
    // autoresize_bottom_margin: 50, // Removed autoresize setting
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | image link table interactives | code custompreview | help',
    // Setup function to handle content processing and style injection
    setup: function(editor) {
      editor.on('init', function() {
        // Set up preview callback
      editor.windowManager.customPreviewCallback = (editorContent) => {
        console.log('Preview callback received content:', {
          length: editorContent?.length,
          isFullHtml: editorContent?.includes('<!DOCTYPE html'),
          hasBody: editorContent?.includes('<body'),
        });

        // If it's not full HTML, wrap it
        let contentToPreview = editorContent?.includes('<!DOCTYPE html') 
          ? editorContent 
          : getFullHtmlForSave(editorContent);

        // Prepare content for preview
        contentToPreview = prepareContentForPreview(contentToPreview);

        console.log('Setting preview content, length:', contentToPreview?.length);
        setPreviewContent(contentToPreview || '');
        setIsPreviewOpen(true);
      };
        
        try {
          const head = editor.getDoc().head;
          const styleContent = extractStyleContent(initialContent); // Use the helper
          if (styleContent && head) {
            const styleEl = editor.getDoc().createElement('style');
            styleEl.textContent = styleContent;
            head.appendChild(styleEl);
            console.log("Injected styles into TinyMCE head.");
          } else {
            console.log("No style content found or head not available for injection.");
          }
        } catch (err) {
          console.error("Error injecting styles into TinyMCE:", err);
        }
      });

      // Process content before it's loaded into the editor
      editor.on('BeforeSetContent', function(e) {
        // Replace shortcodes with placeholders for visual editing
        if (e.content) {
          e.content = e.content.replace(/\[interactive name="([^"]+)"\]/g, function(match, name) {
            return `<span class="interactive-placeholder" data-interactive-name="${name}" contenteditable="false">[Interactive: ${name}]</span>`;
          });
        }
      });

      // Process content when it's retrieved from the editor
      editor.on('GetContent', function(e) {
        // Replace placeholders with shortcodes for saving
        if (e.content) {
          e.content = e.content.replace(/<span class="interactive-placeholder" data-interactive-name="([^"]+)"[^>]*>\[Interactive: [^\]]+\]<\/span>/g, function(match, name) {
            return `[interactive name="${name}"]`;
          });
        }
      });
    },
    // Prevent TinyMCE from filtering out custom elements and attributes, allow all attributes for flexibility
    extended_valid_elements: '*[*]', // Allow any element with any attribute
    custom_elements: '~custom-element', // Allow custom elements (prefix with ~ if needed)
    // valid_children removed as styles are injected into head
    content_style: `
      /* Base styles for the placeholder */
      .interactive-placeholder {
        display: inline-block;
        background-color: #f0f7ff;
        border: 1px solid #bbd6ff;
        border-radius: 4px;
        padding: 4px 8px;
        margin: 2px 0;
        font-family: monospace;
        cursor: pointer;
        user-select: none;
      }
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
    content_security_policy: "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';"
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px', // Reduced gap
      width: '100%',
      flexGrow: 1, // Added to allow vertical expansion
      minHeight: 0 // Added for flexbox height calculation
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
      overflow: 'hidden',
      flexGrow: 1, // Keep flexGrow
      minHeight: 0, // Keep minHeight
      // height: 'calc(100% - 172px)', // Removed explicit height calculation
      // display: 'flex', // REMOVE flex display
      // flexDirection: 'column' // REMOVE flex direction
    },
    htmlEditorContainer: {
      width: '100%',
      // height: '600px', // Removed fixed height
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1 // Added to allow vertical expansion
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
                    HTML Editor (Full Document)
                  </label>
                  <textarea
                    value={htmlModeContent} // Use dedicated state for HTML mode
                    onChange={(e) => setHtmlModeContent(e.target.value)} // Update dedicated state
                    style={styles.textarea}
                    placeholder="Enter full HTML document content"
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
                      ref={iframeRef} // Assign the ref - content will be injected via useEffect
                      // Remove srcDoc - we manage content manually
                      style={styles.iframe}
                      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
                      title="Preview"
                    />
                  </div>
                </div>
              </Panel>
              </PanelGroup>
            </div>
          </div>
        ) : (
          // Removed wrapper div
          <Editor
            value={content} // Pass body content state directly
            onEditorChange={(newContent, editor) => {
                // Simplified: Directly update the body content state
              console.log("Editor content changed, updating state.");
              setContent(newContent);

              // Update debug info (optional)
              setDebugInfo(prev => ({
                ...prev,
                lastRichTextContent: newContent,
                // lastHtmlContent: getFullHtmlForSave(newContent) // Could reconstruct here if needed for debug
              }));
            }}
            onInit={(evt, editor) => {
              editorRef.current = editor; // Store editor reference
              isEditorInitialized.current = true; // Mark editor as initialized
              console.log("TinyMCE editor initialized");
            }}
              init={editorConfig}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
            />
          // Removed wrapper div
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

      {/* Add PreviewModal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewContent('');
        }}
        content={previewContent}
        title={title}
      />
    </div>
  );
};

StudyGuideEditor.displayName = 'StudyGuideEditor';

export default StudyGuideEditor;
