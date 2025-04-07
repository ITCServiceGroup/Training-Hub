import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { Editor } from '@tinymce/tinymce-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import PreviewModal from '../PreviewModal';
// Import API functions and Auth context if needed for the modal later
// import { listMedia } from '../../../../services/api/media'; // No longer needed here
import { useAuth } from '../../../../contexts/AuthContext';
import MediaSelectionModal from '../MediaSelectionModal'; // Import the actual modal component


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
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // State for media modal visibility
  const mediaPickerCallbackRef = useRef(null); // Ref to store TinyMCE's file picker callback
  const mediaPickerFileTypeRef = useRef('file'); // Ref to store the type ('image', 'media', 'file')

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

  // Process content to replace shortcodes with custom element tags (similar to StudyGuideViewer)
  const processContentForWebComponents = (content) => {
    if (!content) return '';
    const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
    // Replace shortcode with the corresponding custom element tag
    return content.replace(shortcodeRegex, (match, name) => {
      // Basic validation for name
      if (!/^[a-zA-Z0-9-]+$/.test(name)) {
        console.warn(`Invalid interactive element name found: ${name}`);
        return `<p class="text-red-500 border border-red-500 p-1">[Invalid interactive element: ${name}]</p>`;
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

      // Process body content to handle empty paragraphs and replace shortcodes
      let processedBodyContent = bodyContent;

      // Replace empty paragraphs with divs that have height
      processedBodyContent = processedBodyContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

      // Also handle paragraphs with non-breaking spaces or just spaces
      processedBodyContent = processedBodyContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

      // Replace consecutive <br> tags with empty lines
      processedBodyContent = processedBodyContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

      // Process shortcodes
      processedBodyContent = processContentForWebComponents(processedBodyContent);

      // Write the basic structure
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
      iframeDoc.close();

      // Inject styles
      const styleEl = iframeDoc.createElement('style');
      styleEl.textContent = styleContent || `
        body { font-family: 'Inter', sans-serif; line-height: 1.6; margin: 20px; }
        img { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        /* Preserve whitespace in paragraphs */
        p { white-space: pre-wrap; }
        /* Style for empty lines */
        .empty-line { height: 1em; display: block; margin: 1em 0; }
      `;
      iframeDoc.head.appendChild(styleEl);

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
          script.type = 'module'; // Load as ES Module
          script.src = new URL(scriptPath, window.location.origin).href;
          // script.async = false; // Removed - Modules are deferred by default
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

    // Process empty paragraphs
    let processedContent = htmlContent;

    // Extract body content to process
    const bodyMatch = processedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      let bodyContent = bodyMatch[1];

      // Replace empty paragraphs with divs that have height
      bodyContent = bodyContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

      // Also handle paragraphs with non-breaking spaces or just spaces
      bodyContent = bodyContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

      // Replace consecutive <br> tags with empty lines
      bodyContent = bodyContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

      // Replace the body content in the full HTML
      processedContent = processedContent.replace(bodyMatch[0], `<body>${bodyContent}</body>`);
    }

    // Add a comment to help with debugging
    const debugComment = `
<!--
  Preview content prepared by StudyGuideEditor
  Timestamp: ${new Date().toISOString()}
  Content length: ${processedContent.length}
-->
`;

    // Find the head tag to insert our comment
    const headIndex = processedContent.indexOf('<head>');
    if (headIndex !== -1) {
      return processedContent.slice(0, headIndex + 6) + debugComment + processedContent.slice(headIndex + 6);
    }

    return processedContent;
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

  const handleSave = async (shouldExit = true) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      // Reconstruct full HTML only on save
      await onSave({
        title,
        content: getFullHtmlForSave(content), // Pass current body content
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

  // --- Grid Layout Helper Functions (Refactored) ---
  // These functions now need the editor instance passed to them

  const getGridWrapper = (editor, node) => {
     if (!editor || !node) return null;
     // Start from the node and go up the DOM tree
     let currentNode = node;
     while (currentNode && currentNode !== editor.getBody()) {
        if (editor.dom.hasClass(currentNode, 'image-grid-wrapper')) {
           // Found a wrapper, now ensure it's the outermost one related to this node
           let parentWrapper = editor.dom.getParent(currentNode.parentNode, '.image-grid-wrapper');
           // Keep going up until we find the top-level wrapper for this context
           while (parentWrapper) {
              currentNode = parentWrapper;
              parentWrapper = editor.dom.getParent(currentNode.parentNode, '.image-grid-wrapper');
           }
           return currentNode; // Return the outermost wrapper found
        }
        currentNode = currentNode.parentNode;
     }
     return null; // No wrapper found in the ancestry
  };


  const unwrapImageFromGrid = (editor, wrapperNode) => {
     if (!editor || !wrapperNode) return;
     console.log('Unwrapping image from grid:', wrapperNode);
     const imgElement = wrapperNode.querySelector('.image-cell > img'); // Get the actual img element

     // Get content from the content cell
     const contentCell = wrapperNode.querySelector('.content-cell');
     let contentNodes = [];

     if (contentCell) {
         // Get all direct children of the content cell
         contentNodes = Array.from(contentCell.childNodes);
     }

     // Place image back before the wrapper
     if (imgElement) {
         editor.dom.insertAfter(imgElement, wrapperNode);
         // Remove any alignment classes from the image itself
         editor.dom.removeClass(imgElement, 'align-left align-right align-center');
         // Remove float styles if they exist
         editor.dom.setStyle(imgElement, 'float', '');
         editor.dom.removeClass(imgElement, 'mce-floatleft mce-floatright');
     }

     // Place content nodes back after the image
     let lastNode = imgElement || wrapperNode; // Start inserting after the image or wrapper

     // If there are no content nodes but there was content in the cell, create a paragraph
     if (contentNodes.length === 0) {
         if (contentCell && contentCell.innerHTML.trim()) {
             // There was some content that wasn't wrapped in a block element
             const p = editor.dom.create('p');
             p.innerHTML = contentCell.innerHTML;
             editor.dom.insertAfter(p, lastNode);
             lastNode = p;
         }
     } else {
         // Insert all content nodes after the image
         contentNodes.forEach(node => {
             editor.dom.insertAfter(node, lastNode);
             lastNode = node; // Update last node for correct order
         });
     }

     // Remove the now empty wrapper
     editor.dom.remove(wrapperNode);

     // Reselect the image if it exists
     if (imgElement) {
         editor.selection.select(imgElement);
     }
     editor.nodeChanged(); // Notify editor of changes
  };

  const getAdjacentContent = (editor, imgNode) => {
      if (!editor || !imgNode) return null;
      // Try to find the next sibling paragraph or div. Adjust logic as needed.
      let next = imgNode.parentNode.nextSibling;
      while (next && (next.nodeType === 3 && !next.nodeValue.trim())) { // Skip empty text nodes
        next = next.nextSibling;
      }
      // Only consider paragraphs or divs for now
      if (next && (next.nodeName === 'P' || next.nodeName === 'DIV')) {
        return next;
      }

      // If no adjacent content found, create a new paragraph *after* the image's block parent
      const parentBlock = editor.dom.getParent(imgNode, editor.dom.isBlock);
      const insertAfterNode = parentBlock || imgNode; // Insert after the block parent or image itself
      const newParagraph = editor.dom.create('p', {}, '<br>'); // Create paragraph with BR
      editor.dom.insertAfter(newParagraph, insertAfterNode);
      return newParagraph;
  };


  const applyGridWrapper = (editor, imgNode, alignment) => {
     if (!editor || !imgNode) return;
     editor.undoManager.transact(() => {
         console.log(`Applying grid alignment: ${alignment} to image:`, imgNode);
         // Find the direct parent cell and then the wrapper
         // const imgCell = editor.dom.getParent(imgNode, '.grid-cell.image-cell'); // This might be unreliable if imgNode isn't in cell yet
         // let wrapper = imgCell ? editor.dom.getParent(imgCell, '.image-grid-wrapper') : null;
         // If not found via cell, try finding wrapper via getGridWrapper (might be selected differently)
         // if (!wrapper) {
         let wrapper = getGridWrapper(editor, imgNode); // Use refactored helper
         // }
         console.log('Existing wrapper found:', wrapper);

         // If alignment is 'none', unwrap if currently wrapped
         if (alignment === 'none') {
             if (wrapper) {
                 unwrapImageFromGrid(editor, wrapper); // Use refactored helper
             } else {
                 // If not wrapped, ensure no float/alignment styles remain on the image itself
                 editor.dom.setStyle(imgNode, 'float', '');
                 editor.dom.removeClass(imgNode, 'mce-floatleft mce-floatright');
                 editor.dom.removeClass(imgNode, 'align-left align-right align-center');
                 console.log('Alignment none: Image was not wrapped, ensured no styles remain.');
             }
             // No need to select image here, unwrap handles it if needed
             editor.nodeChanged();
             return; // Exit after handling 'none'
         }

         // --- Applying an alignment (left, center, right) ---

         // If the image is ALREADY in a wrapper, just update the class
         if (wrapper) {
             console.log('Wrapper exists, updating alignment class.');
             // Get the current alignment before changing it
             let currentAlignment = 'left'; // Default
             if (editor.dom.hasClass(wrapper, 'align-left')) currentAlignment = 'left';
             else if (editor.dom.hasClass(wrapper, 'align-center')) currentAlignment = 'center';
             else if (editor.dom.hasClass(wrapper, 'align-right')) currentAlignment = 'right';

             // Remove old alignment class and add new one
             editor.dom.removeClass(wrapper, 'align-left align-right align-center'); // Remove old alignment
             editor.dom.addClass(wrapper, `align-${alignment}`); // Add new alignment

             // Ensure image inside doesn't have conflicting styles
             const imgInWrapper = wrapper.querySelector('.image-cell > img');
             if (imgInWrapper) {
                 editor.dom.setStyle(imgInWrapper, 'float', '');
                 editor.dom.removeClass(imgInWrapper, 'mce-floatleft mce-floatright');
             }

             // If changing from center to left/right or vice versa, we need to adjust the grid structure
             if ((currentAlignment === 'center' && (alignment === 'left' || alignment === 'right')) ||
                 ((currentAlignment === 'left' || currentAlignment === 'right') && alignment === 'center')) {
                 // Force a reflow of the grid by toggling a class
                 editor.dom.toggleClass(wrapper, 'reflow-grid');
                 setTimeout(() => {
                     editor.dom.toggleClass(wrapper, 'reflow-grid');
                 }, 10);
             }
         } else {
             // Wrapper does NOT exist, need to create it
             console.log('Wrapper does not exist, creating new one.');
             const adjacentContent = getAdjacentContent(editor, imgNode); // Use refactored helper
             console.log('Adjacent content found:', adjacentContent);

             // Create the wrapper and cells
             wrapper = editor.dom.create('div', { class: `image-grid-wrapper align-${alignment}` });
             const newImgCell = editor.dom.create('div', { class: 'grid-cell image-cell' });

             // Create a content container that will hold the text
             const contentCell = editor.dom.create('div', { class: 'grid-cell content-cell' });

             // Determine the node to insert the wrapper *after* (image or its parent paragraph if it's the only child)
             const parentNode = imgNode.parentNode;
             const insertAfterNode = (parentNode && parentNode.nodeName === 'P' && parentNode.childNodes.length === 1) ? parentNode : imgNode;
             console.log('Inserting wrapper after:', insertAfterNode);

             editor.dom.insertAfter(wrapper, insertAfterNode);

             // Move the image into the image cell
             newImgCell.appendChild(imgNode); // This moves the imgNode
             wrapper.appendChild(newImgCell);

             // Move adjacent content into the content cell (if found)
             if (adjacentContent) {
                 // Check if adjacentContent is already the wrapper we just inserted (can happen if getAdjacentContent created it)
                 if (adjacentContent !== wrapper) {
                    contentCell.appendChild(adjacentContent); // Move adjacent content
                 } else {
                    // If adjacentContent *is* the wrapper, it means we created a new paragraph inside it.
                    // We need to find that paragraph. This case might need refinement.
                    console.warn("Adjacent content was the newly created paragraph, check logic.");
                    const p = adjacentContent.querySelector('p'); // Assuming getAdjacentContent created a p
                    if (p) contentCell.appendChild(p);
                    else contentCell.appendChild(editor.dom.create('p', {}, '<br>')); // Fallback
                 }
             } else {
                 // If no adjacent content, add a paragraph to make it editable
                 const p = editor.dom.create('p', {}, '<br>');
                 contentCell.appendChild(p);
             }
             wrapper.appendChild(contentCell);

             // Ensure the moved image doesn't have conflicting styles
             editor.dom.setStyle(imgNode, 'float', '');
             editor.dom.removeClass(imgNode, 'mce-floatleft mce-floatright');
             editor.dom.removeClass(imgNode, 'align-left align-right align-center');
         }

         // Select the image after applying any alignment to maintain context
         editor.selection.select(imgNode);

         editor.nodeChanged(); // Important to update editor state
     });
  };
  // --- End Grid Layout Helper Functions (Refactored) ---

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


  // Editor configuration
  const editorConfig = {
    height: 850, // Set fixed pixel height
    menubar: true,
    license_key: 'gpl',
    base_url: '/tinymce',
    external_plugins: {
      // Define the path to the custom plugin JS file relative to the public root
      'interactives': '/tinymce/plugins/interactives/plugin.js',
      'custompreview': '/tinymce/plugins/custompreview/plugin.js',
      'medialibrary': '/tinymce/plugins/medialibrary/plugin.js'
    },
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', // Removed autoresize
      'interactives', 'custompreview', 'medialibrary', 'image', 'imagetools', 'quickbars'
    ],
    // autoresize_bottom_margin: 50, // Removed autoresize setting
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | image medialibrary link table interactives | ' +
      'imageoptions rotateleft rotateright | code custompreview | help',
    // Setup function to handle content processing and style injection
    setup: function(editor) {

      // Helper to get selected image (remains inside setup as it uses editor directly)
      const getSelectedImage = () => {
        const node = editor.selection.getNode();
        return node.nodeName === 'IMG' ? node : null;
      };

      // Add a special handler for the content cell
      editor.on('keydown', function(e) {
        // Check if we're inside a content cell
        const node = editor.selection.getNode();
        const contentCell = editor.dom.getParent(node, '.content-cell');

        if (contentCell && e.keyCode === 13) { // Enter key inside content cell
          e.preventDefault(); // Prevent default Enter behavior

          // Get the current selection range
          const rng = editor.selection.getRng();
          const currentNode = rng.startContainer;

          // Find the current paragraph or parent element
          let currentParagraph = node;
          if (currentNode.nodeType === 3) { // Text node
            currentParagraph = currentNode.parentNode;
          }

          // Find the closest paragraph or div
          while (currentParagraph && currentParagraph.nodeName !== 'P' && currentParagraph.nodeName !== 'DIV' && !editor.dom.hasClass(currentParagraph, 'content-cell')) {
            currentParagraph = currentParagraph.parentNode;
          }

          // Handle text splitting if we're in the middle of text
          if (currentNode.nodeType === 3 && rng.startOffset > 0 && rng.startOffset < currentNode.nodeValue.length) {
            // We're in the middle of a text node, split it
            const textBefore = currentNode.nodeValue.substring(0, rng.startOffset);
            const textAfter = currentNode.nodeValue.substring(rng.startOffset);

            // Update current text node with text before cursor
            currentNode.nodeValue = textBefore;

            // Create a new paragraph with text after cursor
            const newP = editor.dom.create('p');
            if (textAfter.trim()) {
              newP.appendChild(editor.dom.doc.createTextNode(textAfter));
            } else {
              newP.appendChild(editor.dom.create('br'));
            }

            // Insert the new paragraph after the current paragraph
            if (currentParagraph && (currentParagraph.nodeName === 'P' || currentParagraph.nodeName === 'DIV') && !editor.dom.hasClass(currentParagraph, 'content-cell')) {
              editor.dom.insertAfter(newP, currentParagraph);
            } else {
              // If we couldn't find a paragraph, insert at the end of the content cell
              contentCell.appendChild(newP);
            }

            // Set cursor to beginning of new paragraph
            editor.selection.setCursorLocation(newP, 0);
          } else {
            // Create a new empty paragraph
            const newP = editor.dom.create('p', {}, '<br>');

            // Insert the new paragraph after the current paragraph
            if (currentParagraph && (currentParagraph.nodeName === 'P' || currentParagraph.nodeName === 'DIV') && !editor.dom.hasClass(currentParagraph, 'content-cell')) {
              editor.dom.insertAfter(newP, currentParagraph);
            } else {
              // If we couldn't find a paragraph, insert at the end of the content cell
              contentCell.appendChild(newP);
            }

            // Set cursor to the new paragraph
            editor.selection.setCursorLocation(newP, 0);
          }

          return false; // Prevent further handling
        }
      });



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

      // Preserve empty paragraphs on save
      editor.on('GetContent', function(e) {
        // Make sure empty paragraphs are preserved
        if (e.content) {
          // Find all paragraphs with only <br> and ensure they're preserved
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = e.content;

          // Find all paragraphs with only <br>
          const emptyParagraphs = tempDiv.querySelectorAll('p');
          emptyParagraphs.forEach(p => {
            if (p.innerHTML === '<br>' || p.innerHTML === '<br/>') {
              // Replace with a div that has height and margin
              const emptyDiv = document.createElement('div');
              emptyDiv.className = 'empty-line';
              emptyDiv.style.height = '1em';
              emptyDiv.style.display = 'block';
              emptyDiv.style.margin = '1em 0';
              p.parentNode.replaceChild(emptyDiv, p);
            }
          });

          e.content = tempDiv.innerHTML;
        }
      });

      editor.on('init', function() {
        // Set up preview callback
        editor.windowManager.customPreviewCallback = (editorContent) => {
          console.log('Preview callback received content:', {
            length: editorContent?.length,
            isFullHtml: editorContent?.includes('<!DOCTYPE html'),
            hasBody: editorContent?.includes('<body'),
          });

          // Process empty paragraphs in the editor content
          let processedContent = editorContent;

          // Replace empty paragraphs with divs that have height
          processedContent = processedContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

          // Also handle paragraphs with non-breaking spaces or just spaces
          processedContent = processedContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

          // Replace consecutive <br> tags with empty lines
          processedContent = processedContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

          // If it's not full HTML, wrap it
          let contentToPreview = processedContent?.includes('<!DOCTYPE html')
            ? processedContent
            : getFullHtmlForSave(processedContent);

          // Prepare content for preview
          contentToPreview = prepareContentForPreview(contentToPreview);

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
            const node = editor.selection.getNode();
            const contentCell = editor.dom.getParent(node, '.content-cell');

            if (img) {
              // Image selected: Apply grid logic using refactored function
              console.log(`Image selected, applying grid alignment: ${alignment}`);
              applyGridWrapper(editor, img, alignment); // Pass editor instance
            } else if (contentCell) {
              // We're inside a content cell, apply alignment to the paragraph or div
              console.log(`Content cell selected, applying text alignment: ${alignment}`);

              // Find the current paragraph or parent element
              let currentParagraph = node;
              if (node.nodeType === 3) { // Text node
                currentParagraph = node.parentNode;
              }

              // Find the closest paragraph or div within the content cell
              while (currentParagraph && currentParagraph.nodeName !== 'P' && currentParagraph.nodeName !== 'DIV' && !editor.dom.hasClass(currentParagraph, 'content-cell')) {
                currentParagraph = currentParagraph.parentNode;
              }

              // If we found a paragraph or div and it's not the content cell itself
              if (currentParagraph && (currentParagraph.nodeName === 'P' || currentParagraph.nodeName === 'DIV') && !editor.dom.hasClass(currentParagraph, 'content-cell')) {
                // Remove all alignment classes
                editor.dom.setStyle(currentParagraph, 'text-align', '');

                // Apply the new alignment
                if (alignment !== 'none') {
                  editor.dom.setStyle(currentParagraph, 'text-align', alignment);
                }
              } else {
                // If we couldn't find a paragraph, apply to the content cell itself
                // Remove all alignment classes
                editor.dom.setStyle(contentCell, 'text-align', '');

                // Apply the new alignment
                if (alignment !== 'none') {
                  editor.dom.setStyle(contentCell, 'text-align', alignment);
                }
              }
            } else {
              // Text or other element selected: Execute default behavior
              console.log(`Non-image selected, executing default command: ${command}`);
              // For JustifyNone, remove all alignment formats
              if (command === 'JustifyNone') {
                 editor.formatter.remove('alignleft');
                 editor.formatter.remove('aligncenter');
                 editor.formatter.remove('alignright');
                 editor.formatter.remove('alignjustify'); // Just in case
              } else {
                 // Use toggle format for standard alignments
                 editor.execCommand('mceToggleFormat', false, alignment);
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
            // Update button state based on current selection's wrapper class
            onSetup: (buttonApi) => {
               const unbind = editor.selection.selectorChangedWithUnbind(
                 'img, .image-grid-wrapper', // Check if image or wrapper is selected/focused
                 (state, args) => {
                    const node = args.node;
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

                    buttonApi.setActive(currentAlignment === item.alignment);
                    // Disable if no image is selected? Or rely on quickbar context?
                    // buttonApi.setDisabled(!getSelectedImage()); // Maybe not needed if quickbar handles context
                 }
               ).unbind;
               return unbind; // Return the unbind function for cleanup
            }
          });
        });
        // --- End Custom Quickbar Buttons ---

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
    // Prevent TinyMCE from filtering out custom elements and attributes, allow all attributes for flexibility
    extended_valid_elements: '*[*]', // Allow any element with any attribute
    custom_elements: '~custom-element', // Allow custom elements (prefix with ~ if needed)
    // valid_children removed as styles are injected into head
    content_style: `
      /* --- Image Grid Layout Styles (Increased Specificity) --- */
      body .image-grid-wrapper { /* Added body prefix */
        display: grid !important; /* Added !important for testing */
        gap: 1em; /* Spacing between image and text */
        margin-bottom: 1em; /* Space below the grid */
        padding: 5px; /* Optional: Add padding for visual separation */
        border: 1px dashed #e0e0e0; /* Border for visual aid during editing */
      }
      body .image-grid-wrapper.align-left { /* Added body prefix */
        grid-template-columns: auto 1fr; /* Image takes auto width, text takes rest */
      }
      body .image-grid-wrapper.align-right { /* Added body prefix */
        grid-template-columns: 1fr auto; /* Text takes first column, image takes auto width */
      }
      body .image-grid-wrapper.align-center { /* Added body prefix */
        grid-template-columns: 1fr; /* Single column for centered image */
        /* REMOVED: justify-items: center; */ /* Don't center all items */
      }
      body .image-grid-wrapper.align-center > .image-cell { /* Added body prefix */
        justify-self: center; /* Center only the image cell */
        grid-row: 1; /* Ensure image cell is in the first row */
        grid-column: 1; /* Ensure image cell is in the first column */
      }
      body .image-grid-wrapper.align-center > .content-cell { /* Added body prefix */
        grid-row: 2; /* Place content cell in the second row */
        grid-column: 1; /* Ensure content cell spans the column */
      }
      body .image-grid-wrapper > .grid-cell { /* Added body prefix */
        /* Cells take up the defined grid area */
        min-width: 0; /* Prevent overflow issues in flex/grid children */
      }
      body .image-grid-wrapper > .image-cell { /* Added body prefix */
         /* Styles specific to the image cell if needed */
         display: flex; /* Use flex to help center if needed */
         align-items: flex-start; /* Align image to top */
      }
       body .image-grid-wrapper.align-right > .image-cell { /* Added body prefix */
         grid-column: 2; /* Ensure image is in the second column for right align */
       }
       body .image-grid-wrapper.align-right > .content-cell { /* Added body prefix */
         grid-column: 1; /* Ensure content is in the first column for right align */
         grid-row: 1; /* Ensure content stays in the first row */
       }
      body .image-grid-wrapper > .image-cell > img { /* Added body prefix */
        max-width: 100%; /* Image scales within its cell */
        height: auto;
        display: block; /* Remove extra space below image */
      }
      body .image-grid-wrapper > .content-cell { /* Added body prefix */
        /* Styles specific to the content cell if needed */
        min-height: 2em; /* Ensure there's always space to click and edit */
        display: block; /* Ensure it's a block element */
        height: 100%; /* Take full height of the grid cell */
        padding: 0.25em;
      }
      /* Style paragraphs in content cell */
      body .image-grid-wrapper > .content-cell > p {
        margin: 0 0 0.5em 0;
        min-height: 1em;
        white-space: pre-wrap;
      }
      /* Honor text alignment styles */
      body .image-grid-wrapper > .content-cell[style*="text-align"],
      body .image-grid-wrapper > .content-cell > p[style*="text-align"] {
        display: block;
      }
      /* Add a special class to force reflow when changing alignment */
      body .image-grid-wrapper.reflow-grid {
        opacity: 0.99;
      }
      /* Make sure the content cell is always editable */
      body .image-grid-wrapper > .content-cell:empty::after {
        content: '';
        display: block;
        min-height: 1em;
        cursor: text;
      }
      /* Ensure paragraphs in content cell are properly contained */
      body .image-grid-wrapper .editable-container > p {
        margin: 0 0 0.5em 0; /* Reduce bottom margin */
      }
      body .image-grid-wrapper .editable-container > p:last-child {
        margin-bottom: 0; /* Remove bottom margin from last paragraph */
      }
      /* --- End Image Grid Layout Styles --- */

      /* --- Interactive Element Clearing (Increased Specificity) --- */
      /* Use a more specific selector if possible, but this targets elements ending with -simulator */
      /* Consider adding a common class to all interactive elements if this is too broad */
      body [id$='-simulator'], body [is$='-simulator'] { /* Added body prefix */
         clear: both; /* Clear floats from elements *before* the grid wrapper */
         display: block !important; /* Added !important for testing */
         margin-top: 1.5em; /* Add space above the simulator */
         width: 100%; /* Ensure it takes full width */
      }
      /* --- End Interactive Element Clearing --- */

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
      p { margin: 0 0 1em 0; white-space: pre-wrap; }
      p:last-child { margin-bottom: 0; }
    `,
    // Core settings only
    branding: false,
    promotion: false,
    removed_menuitems: 'help',
    verify_html: false,
    element_format: 'html',
    schema: 'html5',
    allow_script_urls: true,
    // Preserve line breaks
    forced_root_block: 'p',
    keep_styles: true,
    entity_encoding: 'raw',
    // Ensure empty paragraphs are preserved
    formats: {
      removeformat: [
        { selector: '*', remove: 'all', split: true, expand: false, block_expand: true, deep: true }
      ]
    },
    content_security_policy: "default-src 'self'; img-src 'self' data: https://scmwpoowjhzawvmiyohz.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';",
    // Add the file picker callback
    file_picker_types: 'image media file', // Specify which types should use the picker
    file_picker_callback: filePickerCallback,

    // Image editing options
    image_advtab: true, // Advanced image options
    image_caption: true, // Enable image captions
    image_dimensions: true, // Show dimensions in image dialog
    image_title: true, // Enable image title field

    // Image resizing options
    resize_img_proportional: true, // Maintain aspect ratio when resizing
    object_resizing: 'img,table', // Allow resizing of images and tables
    resize: true, // Enable editor resizing

    // Image toolbar options
    image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',

    // Custom image toolbar buttons
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    // Use the NEW custom buttons for the image quickbar
    quickbars_image_toolbar: 'alignGridLeft alignGridCenter alignGridRight alignGridNone | rotateleft rotateright | imageoptions',

    // Enable contextmenu for images
    contextmenu: 'link image table' // Keep standard context menu
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
            className="w-full h-full px-3 border border-gray-300 rounded-md text-sm box-border outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter study guide title"
            required
          />
        </div>

        {/* Button aligned to the right */}
        <div className="h-full">
          <button
            type="button"
            onClick={toggleMode}
            className="h-full px-4 bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 rounded-md text-sm text-gray-700 cursor-pointer whitespace-nowrap box-border outline-none transition-colors"
          >
            {isHtmlMode ? 'Switch to Rich Text' : 'Switch to HTML'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="w-full overflow-hidden flex-grow min-h-0">
        {isHtmlMode ? (
          <div className="w-full flex flex-col flex-grow h-[850px]">
            <div className="flex-1 min-h-0 h-full">
              <PanelGroup direction="horizontal" className="h-full">
              <Panel defaultSize={50} minSize={30}>
                <div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden">
                  <label className="text-sm font-medium text-gray-700">
                    HTML Editor (Full Document)
                  </label>
                  <textarea
                    value={htmlModeContent}
                    onChange={(e) => setHtmlModeContent(e.target.value)}
                    className="w-full h-[calc(100%-30px)] font-mono text-sm p-2 border border-gray-300 rounded-md resize-none overflow-auto focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter full HTML document content"
                  />
                </div>
              </Panel>

              <PanelResizeHandle>
                <div
                  className="w-1 mx-2 bg-gray-300 rounded transition-colors cursor-col-resize h-full hover:bg-gray-400"
                />
              </PanelResizeHandle>

              <Panel defaultSize={50} minSize={30}>
                <div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden">
                  <label className="text-sm font-medium text-gray-700">
                    Preview
                  </label>
                  <div className="border border-gray-300 rounded-md p-4 h-[calc(100%-30px)]">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-none block"
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
            className="py-2 px-4 bg-white hover:bg-red-50 border border-red-600 text-red-600 rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5"
          >
            Delete
          </button>
        )}
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 rounded-md text-sm text-gray-700 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          className={`py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save and Continue'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className={`py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white border border-transparent rounded-md text-sm cursor-pointer transition-all hover:-translate-y-0.5 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <Dialog.Panel className="bg-white p-6 rounded-lg max-w-md w-[90%]">
            <Dialog.Title className="text-lg font-bold text-gray-900 mb-3">
              Delete Study Guide
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this study guide? This action cannot be undone and all associated data will be permanently lost.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2 px-4 bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 rounded-md text-sm text-gray-700 cursor-pointer transition-colors"
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
    </div>
  );
};

StudyGuideEditor.displayName = 'StudyGuideEditor';

export default StudyGuideEditor;
