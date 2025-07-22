import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import tinymce from 'tinymce/tinymce';
import { Dialog } from '@headlessui/react';
import { Editor } from '@tinymce/tinymce-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import PreviewModal from '../PreviewModal';
// Import API functions and Auth context if needed for the modal later
// import { listMedia } from '../../../../services/api/media'; // No longer needed here
// import { useAuth } from '../../../../contexts/AuthContext'; // No longer needed directly here
import MediaSelectionModal from '../MediaSelectionModal'; // Import the actual modal component
import TemplateSelector from '../../../../components/TemplateSelector';
import {
  extractBodyContent,
  extractStyleContent,
  extractUniqueScriptContent,
  getFullHtmlForSave,
  prepareContentForPreview,
  processContentForWebComponents,
} from './utils/htmlUtils';
import {
  applyGridWrapper,
  getAdjacentContent,
  getGridWrapper,
  unwrapImageFromGrid,
} from './utils/imageGridUtils';
import { baseEditorConfig } from './tinymceConfig';
import { getThemeAppliedHex, getBaseHex } from '../../../../utils/themeColors'; // Import theme color utilities (Removed getThemeColorCssVariables)
import HtmlModeView from './HtmlModeView'; // Import the new component


const StudyGuideEditor = ({
  initialContent = '',
  initialTitle = '',
  onSave,
  onCancel,
  onDelete,
  isNew = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Reference to the TinyMCE editor instance
  const editorRef = useRef(null);
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
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // State for media modal visibility
  const mediaPickerCallbackRef = useRef(null); // Ref to store TinyMCE's file picker callback
  const mediaPickerFileTypeRef = useRef('file'); // Ref to store the type ('image', 'media', 'file')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Listen for the custom event from the TinyMCE plugin
  useEffect(() => {
    const handleOpenMediaLibraryModal = (event) => {
      console.log('Received openMediaLibraryModal event');
      setIsMediaModalOpen(true);

      // Store the editor reference for later use
      if (event.detail && event.detail.editor) {
        editorRef.current = event.detail.editor;
      }
    };

    // Add event listener
    document.addEventListener('openMediaLibraryModal', handleOpenMediaLibraryModal);

    // Also check for the global flag
    const checkGlobalFlag = () => {
      if (window.openMediaLibraryModal) {
        console.log('Detected openMediaLibraryModal flag');
        window.openMediaLibraryModal = false;
        setIsMediaModalOpen(true);
      }
    };

    // Check the flag periodically
    const intervalId = setInterval(checkGlobalFlag, 500);

    // Clean up
    return () => {
      document.removeEventListener('openMediaLibraryModal', handleOpenMediaLibraryModal);
      clearInterval(intervalId);
    };
  }, []);

  // Extract body content from initialContent and preserve user edits
  useEffect(() => {
    // Extract and set body content
    // Set initial content (body) for the editor
    // Note: TinyMCE should handle the full body content including scripts
    setContent(extractBodyContent(initialContent));
    isInitialMount.current = false; // Mark initial mount as done

    setTitle(initialTitle);
    isEditorInitialized.current = false;
  }, [initialContent, initialTitle]);

  const handleDelete = async () => {
    try {
      await onDelete();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting study guide:', error);
      alert('Failed to delete study guide');
    }
  };

  const handleSave = async (shouldExit = true) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      // Reconstruct full HTML only on save using the utility function
      const fullHtmlToSave = isHtmlMode ? htmlModeContent : getFullHtmlForSave(content, title, initialContent);
      await onSave({
        title,
        content: fullHtmlToSave,
        shouldExit // Pass whether to exit after saving
      });
    } catch (error) {
      console.error('Error saving study guide:', error);
      alert('Failed to save study guide');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSave(false);
  };

  // Debug state to track content changes
  const [debugInfo, setDebugInfo] = useState({
    lastRichTextContent: '',
    lastHtmlContent: ''
  });

  const toggleMode = () => {
    if (!isHtmlMode) {
      // Switching from Rich Text to HTML mode
      // Use the utility function to generate the full HTML
      const fullHtml = getFullHtmlForSave(content, title, initialContent);
      setHtmlModeContent(fullHtml);
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

  // Function to handle media selection from the modal
  const handleSelectMedia = (selectedMedia) => {
    console.log('Media selected:', selectedMedia);

    // Get the URL and alt text
    const url = selectedMedia.public_url;
    const alt = selectedMedia.alt_text || selectedMedia.file_name || '';

    console.log('Inserting media with URL:', url);

    // Clear the callback ref *before* insertion to avoid potential conflicts
    mediaPickerCallbackRef.current = null;

    if (editorRef.current) {
      const editor = editorRef.current; // Get editor instance
      try {
        // Create the image element using the editor's DOM methods
        const imgNode = editor.dom.create('img', {
          src: url,
          alt: alt,
          width: '800' // Set default width
        });

        // Insert the image node at the cursor position
        editor.selection.setNode(imgNode); // Insert and select the node
        console.log('Direct insertion successful, node:', imgNode);

        // --- Apply grid wrapper automatically ---
        // Call the refactored function directly with the editor instance and the new node
        // Ensure the node is still selected before applying
        const selectedNode = editor.selection.getNode();
        if (selectedNode && selectedNode.nodeName === 'IMG' && selectedNode === imgNode) {
           applyGridWrapper(editor, selectedNode, 'center');
           console.log('Applied center grid to newly inserted image.');
        } else {
           console.warn('Newly inserted image node not selected, cannot apply grid automatically.');
           // As a fallback, maybe try finding the image by src if selection fails?
           const insertedImg = editor.dom.select(`img[src="${url}"]`)[0];
           if (insertedImg) {
               console.log('Fallback: Found image by src, applying grid.');
               applyGridWrapper(editor, insertedImg, 'center');
           } else {
               console.error('Could not find inserted image to apply grid.');
           }
        }

      } catch (error) {
        console.error('Direct insertion or grid application failed:', error);
      }
    } else {
      console.error('No editor reference available');
    }

    // Close the modal
    setIsMediaModalOpen(false);
  };

  // TinyMCE file picker callback
  const filePickerCallback = (callback, value, meta) => {
    mediaPickerCallbackRef.current = callback; // Store the callback
    mediaPickerFileTypeRef.current = meta.filetype; // Store the file type ('image', 'media', 'file')

    // Open the media selection modal
    setIsMediaModalOpen(true);
  };

  // --- Generate Theme Override Styles for Editor Content ---
  // REMOVED: const themeVariables = getThemeColorCssVariables();
  // REMOVED: const themeOverrideStyles = `...`;
  // --- End Theme Override Styles ---

  // Combine base config with dynamic parts
  const editorConfig = {
    ...baseEditorConfig, // Spread the static config (color_map is now static from base)
    // REMOVED: content_style: `${baseEditorConfig.content_style || ''}\n\n${themeOverrideStyles}`,
    content_css: isDark ? '/tinymce/content-dark.css' : '/tinymce/content-light.css', // Load theme-specific CSS
    content_style: baseEditorConfig.content_style || '', // Keep base content styles if any
    height: 850, // Keep dynamic height setting here
    skin: isDark ? 'oxide-dark' : 'oxide', // Use dark skin when in dark mode
    body_class: isDark ? 'mce-dark-mode' : '', // Add dark mode class via config
    // Setup function remains here as it needs component scope (state, refs, handlers)
    setup: function(editor) {
      // Helper to get selected image (remains inside setup as it uses editor directly)
      const getSelectedImage = () => {
        const node = editor.selection.getNode();
        return node.nodeName === 'IMG' ? node : null;
      };

      // Process existing content to ensure all image grids have proper structure
      editor.on('SetContent', function() {
        // Find all content cells
        const contentCells = editor.dom.select('.image-grid-wrapper > .content-cell');

        contentCells.forEach(cell => {
          // If the content cell is empty, add a paragraph to make it editable
          if (!cell.firstChild || (cell.childNodes.length === 1 && cell.firstChild.nodeName === 'BR')) {
            const p = editor.dom.create('p', {}, '<br>');
            cell.appendChild(p);
          }

          // Ensure all text nodes are wrapped in paragraphs
          Array.from(cell.childNodes).forEach(node => {
            if (node.nodeType === 3 && node.nodeValue.trim()) { // Text node with content
              const p = editor.dom.create('p');
              p.appendChild(node.cloneNode());
              cell.replaceChild(p, node);
            }
          });
        });
      });

      // Ensure empty paragraphs are preserved
      editor.on('BeforeSetContent', function(e) {
        // Replace consecutive <p><br></p> patterns with a special marker
        if (e.content) {
          // Replace empty paragraphs with a special marker
          e.content = e.content.replace(/<p><br><\/p>/g, '<p data-mce-empty="1"><br></p>');
        }
      });

      // Preserve empty paragraphs on save - REMOVED - Now handled by prepareContentForPreview
      // editor.on('GetContent', function(e) {
      //  ... logic removed ...
      // });

      editor.on('init', function() {
        // Ensure TinyMCE preserves inline styles
        editor.serializer.addAttributeFilter('style', function(nodes) {
          let i = nodes.length;
          while (i--) {
            const node = nodes[i];
            const value = node.attr('style');
            if (value) {
              // Ensure the style attribute is preserved
              node.attr('data-mce-style', value);
            }
          }
        });

        // Set up preview callback
        editor.windowManager.customPreviewCallback = (editorContent) => {
          console.log('Preview callback received content:', {
            length: editorContent?.length,
            isFullHtml: editorContent?.includes('<!DOCTYPE html'),
            hasBody: editorContent?.includes('<body'),
          });

          // If it's not full HTML, wrap it using the utility function
          let contentToPreview = editorContent?.includes('<!DOCTYPE html')
            ? editorContent
            : getFullHtmlForSave(editorContent, title, initialContent); // Use util

          // Prepare content for preview using the utility function
          contentToPreview = prepareContentForPreview(contentToPreview); // Use util

          console.log('Setting preview content, length:', contentToPreview?.length);
          setPreviewContent(contentToPreview || '');
          setIsPreviewOpen(true);
        };

        // Add custom command for media browser
        editor.addCommand('mceMediaBrowser', function() {
          // Open the media selection modal
          setIsMediaModalOpen(true);
        });

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

        // --- Override Standard Alignment Commands ---
        const commands = ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyNone'];
        const alignments = ['left', 'center', 'right', 'none']; // Corresponding alignment for grid

        commands.forEach((command, index) => {
          const alignment = alignments[index];

          editor.addCommand(command, function() {
            const img = getSelectedImage();
            const node = editor.selection.getNode(); // Get current node at selection
            const contentCell = editor.dom.getParent(node, '.content-cell'); // Check if node is inside a content cell

            if (img) {
              // Case 1: Image is selected
              console.log(`Image selected, applying grid alignment: ${alignment}`);
              applyGridWrapper(editor, img, alignment);
            } else if (contentCell) {
              // Case 2: Selection starts inside a content cell (and is not an image)
              console.log(`Selection inside content cell, applying style: ${alignment}`);
              const blocks = editor.selection.getSelectedBlocks();
              blocks.forEach(block => {
                // Ensure the block is actually within the cell before styling
                if (editor.dom.isChildOf(block, contentCell)) {
                  if (alignment === 'none') {
                    editor.dom.setStyle(block, 'text-align', null);
                  } else {
                    editor.dom.setStyle(block, 'text-align', alignment);
                  }
                }
              });
              editor.nodeChanged(); // Force UI update
            } else {
              // Case 3: Standard text/block selected (outside image grid)
              console.log(`Standard selection, applying formatter: ${alignment}`);
              if (alignment === 'none') {
                 // Remove all alignment formats using the formatter
                 editor.formatter.remove('alignleft');
                 editor.formatter.remove('aligncenter');
                 editor.formatter.remove('alignright');
                 editor.formatter.remove('alignjustify');
              } else {
                 // Apply the specific alignment format using the formatter
                 // Use the correct formatter name (align + alignment)
                 editor.formatter.apply('align' + alignment);
              }
            }
          });
        });
        // --- End Command Overrides ---

        // --- Define Custom Quickbar Buttons ---
        const quickbarAlignments = [
          { name: 'alignGridLeft', icon: 'align-left', tooltip: 'Align image left (Grid)', alignment: 'left' },
          { name: 'alignGridCenter', icon: 'align-center', tooltip: 'Align image center (Grid)', alignment: 'center' },
          { name: 'alignGridRight', icon: 'align-right', tooltip: 'Align image right (Grid)', alignment: 'right' },
          { name: 'alignGridNone', icon: 'align-justify', tooltip: 'Remove image alignment (Grid)', alignment: 'none' } // Using justify icon for 'none'
        ];

        quickbarAlignments.forEach(item => {
          editor.ui.registry.addButton(item.name, {
            icon: item.icon,
            tooltip: item.tooltip,
            onAction: () => {
              const img = getSelectedImage();
              if (img) {
                applyGridWrapper(editor, img, item.alignment); // Pass editor instance
              }
            },
            // Update button state based on current selection's wrapper class using NodeChange
            onSetup: (buttonApi) => {
              const nodeChangeHandler = () => {
                const node = editor.selection.getNode(); // Get the currently selected node
                let currentAlignment = 'none';
                // Use refactored getGridWrapper, passing editor instance
                const wrapper = getGridWrapper(editor, node);

                if (wrapper) {
                  if (editor.dom.hasClass(wrapper, 'align-left')) currentAlignment = 'left';
                  else if (editor.dom.hasClass(wrapper, 'align-center')) currentAlignment = 'center';
                  else if (editor.dom.hasClass(wrapper, 'align-right')) currentAlignment = 'right';
                } else if (node.nodeName === 'IMG' && !wrapper) {
                  // If it's an image not in a wrapper, it's effectively 'none'
                  currentAlignment = 'none';
                }
                // Check if buttonApi and setActive exist before calling
                if (buttonApi && typeof buttonApi.setActive === 'function') {
                   buttonApi.setActive(currentAlignment === item.alignment);
                } else {
                   console.warn('buttonApi.setActive is not available for', item.name);
                }
              };

              // Listen to NodeChange event
              editor.on('NodeChange', nodeChangeHandler);

              // Return the cleanup function
              return () => editor.off('NodeChange', nodeChangeHandler);
            },
          });
         });
         // --- End Custom Quickbar Buttons ---

         // --- Intercept Color Application Commands ---
         editor.on('ExecCommand', (e) => {
           const command = e.command;
           const value = e.value;

           // Check for commands that apply colors
           if ((command === 'mceApplyTextcolor' || command === 'ForeColor') && value?.color) {
             const baseHex = value.color.replace('#', '');
             const themeHex = getThemeAppliedHex(baseHex, isDark);
             console.log(`Intercepted ${command}: Base=${baseHex}, Theme=${themeHex}, isDark=${isDark}`);
             e.preventDefault(); // Prevent original command
             editor.formatter.apply('forecolor', { value: '#' + themeHex });
           } else if ((command === 'mceApplyBackColor' || command === 'HiliteColor') && value?.color) {
             const baseHex = value.color.replace('#', '');
             const themeHex = getThemeAppliedHex(baseHex, isDark);
             console.log(`Intercepted ${command}: Base=${baseHex}, Theme=${themeHex}, isDark=${isDark}`);
             e.preventDefault(); // Prevent original command
             editor.formatter.apply('backcolor', { value: '#' + themeHex });
           } else if (command === 'mceSetInlineStyle' && value?.key === 'border-color') {
             // --- NEW: Intercept border color application to apply CSS classes ---
             const originalSelectedHex = value.value.replace('#', '').toUpperCase();
             console.log(`Intercepted ${command} for border-color: Original=${originalSelectedHex}`);
             e.preventDefault(); // Prevent original command

             const imgNode = getSelectedImage(); // Assumes getSelectedImage() is available
             if (imgNode) {
                 // 1. Map original hex to class suffix
                 const colorNameToSuffix = (hex) => {
                     // Map based on baseColorMap and user table hexes
                     const map = {
                         '34495E': 'navy-blue',
                         '000000': 'black',
                         'FFFFFF': 'white',
                         'ECF0F1': 'light-gray', // User table hex
                         '7E8C8D': 'dark-gray',  // User table hex
                         'CED4D9': 'medium-gray',// User table hex
                         '95A5A6': 'gray',       // User table hex
                         'BFEDD2': 'light-green',
                         'FBEEB8': 'light-yellow',
                         'F8CAC6': 'light-red',
                         'ECCAFA': 'light-purple',
                         'C2E0F4': 'light-blue', // Base hex for Light Blue
                         '2DC26B': 'green',
                         'F1C40F': 'yellow',
                         'E03E2D': 'red',
                         'B96AD9': 'purple',
                         '3598DB': 'blue',
                         '169179': 'dark-turquoise',
                         'E67E23': 'orange',
                         'BA372A': 'dark-red',
                         '843FA1': 'dark-purple',
                         '236FA1': 'dark-blue',
                     };
                     return map[hex] || null; // Return null if no match
                 };

                 const classSuffix = colorNameToSuffix(originalSelectedHex);

                 // Get existing classes to remove old border class
                 const existingClasses = editor.dom.getAttrib(imgNode, 'class') || '';
                 const classesToRemove = existingClasses.split(' ').filter(cls => cls.startsWith('img-border-'));

                 // Remove existing border classes first
                 classesToRemove.forEach(cls => editor.dom.removeClass(imgNode, cls));

                 // Remove inline border styles
                 editor.dom.setStyle(imgNode, 'border-color', null);
                 editor.dom.setStyle(imgNode, 'border-style', null);
                 editor.dom.setStyle(imgNode, 'border-width', null);
                 // Remove data attribute if it exists
                 editor.dom.setAttrib(imgNode, 'data-base-border-color', null);


                 if (classSuffix) {
                     // Add the new class if a valid color was selected
                     const newClass = `img-border-${classSuffix}`;
                     console.log(`Applying class: ${newClass}`);
                     editor.dom.addClass(imgNode, newClass);
                 } else {
                     // If no class suffix (e.g., 'Remove color' or unknown hex),
                     // we've already removed the classes and styles above.
                     console.log(`No class suffix found for hex: ${originalSelectedHex}. Border removed.`);
                 }
             } else {
                 console.warn('Could not get selected image node to apply border class');
             }
             // --- End NEW border color logic ---
           }
           // Add more command checks if needed
         });
         // --- End Color Application Interception ---

         // --- REMOVED Post-processing logic ---

       }); // End editor.on('init')

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
    // File picker callback remains here as it needs component scope (refs, state setters)
    file_picker_callback: filePickerCallback,
  };

  // Styles have been converted to Tailwind CSS classes

  return (
    <div className="flex flex-col gap-2 w-full flex-grow min-h-0">
      {/* Wrapper for Title and Toggle Button with right-aligned button */}
      <div className="flex w-full h-[38px] justify-between">
        {/* Title input in a div with fixed width percentage */}
        <div className="w-[70%] h-full">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full h-full px-3 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 text-gray-700 bg-white'} rounded-md text-sm box-border outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
            placeholder="Enter study guide title"
            required
          />
        </div>

        {/* Button aligned to the right */}
        <div className="h-full">
          <button
            type="button"
            onClick={toggleMode}
            className={`h-full px-4 ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-white' : 'bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-400 text-gray-700'} rounded-md text-sm cursor-pointer whitespace-nowrap box-border outline-none transition-colors`}
          >
            {isHtmlMode ? 'Switch to Rich Text' : 'Switch to HTML'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="w-full overflow-hidden flex-grow min-h-0">
        {isHtmlMode ? (
          <HtmlModeView
            htmlModeContent={htmlModeContent}
            onHtmlContentChange={(e) => setHtmlModeContent(e.target.value)}
            iframeRef={iframeRef}
            initialContent={initialContent}
            title={title}
          />
        ) : (
          <div className="w-full h-full">
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
              key={theme} // Force re-initialization when theme changes
              tinymceScriptSrc="/tinymce/tinymce.min.js"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">
        {!isNew && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className={`py-2 px-4 ${isDark ? 'bg-slate-800 hover:bg-red-900/30' : 'bg-white hover:bg-red-50'} border border-red-600 text-red-600 rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}
          >
            Delete
          </button>
        )}
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={onCancel}
          className={`py-2 px-4 bg-secondary hover:bg-secondary/80 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          className={`py-2 px-4 bg-primary hover:bg-primary-dark text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save and Continue'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className={`py-2 px-4 bg-secondary hover:bg-secondary/80 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : (isNew ? 'Create' : 'Save and Exit')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Dialog.Panel className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-6 rounded-lg max-w-md w-[90%]`}>
            <Dialog.Title className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              Delete Content
            </Dialog.Title>
            <Dialog.Description className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-5`}>
              Are you sure you want to delete this content? This action cannot be undone and all associated data will be permanently lost.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className={`py-2 px-4 ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-white' : 'bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-400 text-gray-700'} rounded-md text-sm cursor-pointer transition-colors`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white border border-transparent rounded-md text-sm cursor-pointer transition-colors hover:-translate-y-0.5"
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

      {/* Render the Media Selection Modal */}
      <MediaSelectionModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectMedia={handleSelectMedia}
        filterFileType={mediaPickerFileTypeRef.current} // Pass the type to filter if needed
      />

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <Dialog
          open={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white rounded-lg max-w-4xl w-full mx-auto">
              <TemplateSelector 
                onSelect={handleTemplateSelect} 
                onCancel={() => setIsTemplateModalOpen(false)} 
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

StudyGuideEditor.displayName = 'StudyGuideEditor';

export default StudyGuideEditor;
