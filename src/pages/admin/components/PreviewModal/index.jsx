import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';

/**
 * Helper function to extract style content from HTML
 */
const extractStyleContent = (htmlContent) => {
  if (!htmlContent) return '';

  // Find all style tags and extract their content
  const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const styleContents = styleMatches.map(match => {
    const content = match.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return content ? content[1].trim() : '';
  });

  return styleContents.join('\n\n');
};

/**
 * Helper function to extract body content from HTML
 */
const extractBodyContent = (htmlContent) => {
  if (!htmlContent) return '';

  // Check if it's a full HTML document with a body tag
  if (htmlContent.includes('<body')) {
    const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : htmlContent;
  }

  // If no body tag but has HTML structure, try to extract content between head and html closing tags
  if (htmlContent.includes('</head>') && htmlContent.includes('</html>')) {
    const match = htmlContent.match(/<\/head>([\s\S]*)<\/html>/i);
    if (match) {
      // Further clean up by removing any potential html closing tag in the extracted content
      return match[1].replace(/<\/html>/i, '');
    }
  }

  // If it has HTML tag but no clear body, try to extract everything after the opening html tag
  if (htmlContent.includes('<html')) {
    const match = htmlContent.match(/<html[^>]*>([\s\S]*)/i);
    if (match) {
      // Remove any closing html tag
      return match[1].replace(/<\/html>/i, '');
    }
  }

  return htmlContent;
};

/**
 * Helper function to extract script content from HTML
 */
const extractScriptContent = (htmlContent) => {
  if (!htmlContent) return '';

  // Find all script tags without src attribute and extract their content
  const scriptMatches = htmlContent.match(/<script(?![^>]*?\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi) || [];

  if (scriptMatches.length === 0) {
    // If no script tags found, check if there's any JavaScript-like code in the content
    // This helps with content that might have JavaScript but not in proper script tags
    if (htmlContent.includes('function') ||
        htmlContent.includes('var ') ||
        htmlContent.includes('let ') ||
        htmlContent.includes('const ') ||
        htmlContent.includes('=>')) {

      console.log('Found potential JavaScript code outside of script tags');

      // Try to extract JavaScript-like code blocks
      const jsBlocks = [];

      // Look for function declarations
      const functionMatches = htmlContent.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g) || [];
      jsBlocks.push(...functionMatches);

      // Look for variable declarations with function expressions
      const varFunctionMatches = htmlContent.match(/(?:var|let|const)\s+\w+\s*=\s*function\s*\([^)]*\)\s*\{[\s\S]*?\}/g) || [];
      jsBlocks.push(...varFunctionMatches);

      // Look for arrow functions
      const arrowFunctionMatches = htmlContent.match(/(?:var|let|const)\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}/g) || [];
      jsBlocks.push(...arrowFunctionMatches);

      if (jsBlocks.length > 0) {
        return jsBlocks.join('\n\n');
      }
    }

    return '';
  }

  const scriptContents = scriptMatches.map(match => {
    const content = match.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return content ? content[1].trim() : '';
  });

  return scriptContents.join('\n\n');
};

/**
 * Process content to replace shortcodes with custom element tags
 * This matches the approach used in StudyGuideViewer
 */
const processContentForWebComponents = (content) => {
  if (!content) return '';

  // Log the original content for debugging
  console.log('PreviewModal - Original content:', content);

  // Re-adding empty line processing here to ensure consistency,
  // matching StudyGuideViewer and handling potential inconsistencies from editor.
  let processedContent = content;

  // Replace empty paragraphs with a div that has height
  processedContent = processedContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

  // Also handle paragraphs with non-breaking spaces or just spaces
  processedContent = processedContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

  // Replace consecutive <br> tags with empty lines
  processedContent = processedContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

  // Handle TinyMCE specific empty paragraphs (only if they are visually empty)
  processedContent = processedContent.replace(/<p data-mce-empty="1">(?:<br>|\s|&nbsp;)*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');


  // Log the processed content for debugging
  console.log('PreviewModal - Processed content (after empty line handling):', processedContent);

  // Replace shortcodes with custom elements wrapped in centering div
  return processedContent.replace(/\[interactive name="([^"]+)"\]/g, (match, name) => {
    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      console.warn(`Invalid interactive element name found in preview: ${name}`);
      return `<p style="color: red; border: 1px solid red; padding: 5px;">[Invalid interactive element: ${name}]</p>`;
    }
    const tagName = `${name}-simulator`;
    console.log(`Preview replacing shortcode for "${name}" with <${tagName}>`);
    return `<div style="display: block; text-align: center;"><${tagName}></${tagName}></div>`;
  });
};

const PreviewModal = ({ isOpen, onClose, content, title }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setIsLoading(true); // Always start loading when opened or content changes (due to key)
    }
  }, [isOpen, content]); // Reset loading when content changes too (because iframe remounts)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true; // Ensure it's true on mount
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Using Tailwind classes instead of inline styles

  // Use content as the key to force iframe remount on content change
  const iframeKey = content;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-[110]"
      aria-labelledby="preview-modal-title"
    >
      <div className="fixed inset-0 bg-black/75 flex items-start justify-center p-[5px] pt-[60px] z-[110]" aria-hidden="true">
        <Dialog.Panel className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg w-full max-w-[1400px] max-h-[calc(100vh-80px)] h-[calc(100vh-80px)] flex flex-col relative`}>
          <div className={`py-[6px] px-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'} flex justify-between items-center h-10 flex-shrink-0`}>
            <Dialog.Title id="preview-modal-title" className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title || 'Study Guide Preview'}
            </Dialog.Title>
            <button
              className={`p-1 rounded border-none bg-transparent cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} flex items-center justify-center`}
              onClick={onClose}
              aria-label="Close preview"
            >
              <FaTimes size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden p-0 h-[calc(100vh-120px)] min-h-0 relative">
            <div
              className={`absolute inset-0 ${isDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center z-10 transition-opacity duration-200 ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
              role="status"
              aria-label="Loading preview content"
            >
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm font-medium flex items-center gap-2`}>
                <span>Loading preview</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`w-[6px] h-[6px] ${isDark ? 'bg-gray-300' : 'bg-gray-500'} rounded-full animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <style>{`
                  @keyframes pulse {
                    0% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0.3; transform: scale(0.8); }
                  }
                `}</style>
              </div>
            </div>
            {isOpen && ( // Only render iframe when modal is open
              <iframe
                key={iframeKey} // Force remount when key changes
                className={`flex-1 w-full h-full border-none rounded-none ${isDark ? 'bg-white' : 'bg-white'} block transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                sandbox="allow-scripts allow-same-origin"
                title="Study Guide Preview"
                ref={iframeRef}
                onLoad={() => {
                  try {
                    const iframe = iframeRef.current;
                    if (!iframe) return;

                    const iframeDoc = iframe.contentWindow.document;

                    // Create a fresh document structure
                    iframeDoc.open();
                    iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
                    iframeDoc.close();

                    // Define theme-swapping styles
                    const themeStyles = `
                      /* Theme Swapping Colors */
                      :root {
                        /* Light Mode Values */
                        --swap-navy-blue: #34495E;
                        --swap-black: #000000;
                        --swap-white: #FFFFFF;
                        --swap-light-gray: #7E8C8D; /* Uses Dark Gray hex in light mode */
                        --swap-dark-gray: #7E8C8D;
                        --swap-medium-gray: #95A5A6; /* Uses Gray hex in light mode */
                        --swap-gray: #95A5A6;
                      }
                      body.dark-theme {
                        /* Dark Mode Values */
                        --swap-navy-blue: #C2E0F4; /* Becomes Light Blue */
                        --swap-black: #FFFFFF; /* Becomes White */
                        --swap-white: #000000; /* Becomes Black */
                        --swap-light-gray: #ECF0F1;
                        --swap-dark-gray: #ECF0F1; /* Becomes Light Gray */
                        --swap-medium-gray: #CED4D9;
                        --swap-gray: #CED4D9; /* Becomes Medium Gray */
                      }

                      /* --- Theme Color Overrides for Inline Styles --- */

                      /* Dark Mode Viewing: Override light mode inline styles */
                      body.dark-theme [style*="color: #34495E"], body.dark-theme [style*="color: #34495e"] { color: var(--swap-navy-blue) !important; }
                      body.dark-theme [style*="border-color: #34495E"], body.dark-theme [style*="border-color: #34495e"] { border-color: var(--swap-navy-blue) !important; }
                      body.dark-theme [style*="color: #000000"] { color: var(--swap-black) !important; }
                      body.dark-theme [style*="border-color: #000000"] { border-color: var(--swap-black) !important; }
                      body.dark-theme [style*="color: #FFFFFF"], body.dark-theme [style*="color: #ffffff"] { color: var(--swap-white) !important; }
                      body.dark-theme [style*="border-color: #FFFFFF"], body.dark-theme [style*="border-color: #ffffff"] { border-color: var(--swap-white) !important; }
                      body.dark-theme [style*="color: #7E8C8D"], body.dark-theme [style*="color: #7e8c8d"] { color: var(--swap-light-gray) !important; }
                      body.dark-theme [style*="border-color: #7E8C8D"], body.dark-theme [style*="border-color: #7e8c8d"] { border-color: var(--swap-light-gray) !important; }
                      body.dark-theme [style*="color: #95A5A6"], body.dark-theme [style*="color: #95a5a6"] { color: var(--swap-medium-gray) !important; }
                      body.dark-theme [style*="border-color: #95A5A6"], body.dark-theme [style*="border-color: #95a5a6"] { border-color: var(--swap-medium-gray) !important; }


                      /* Light Mode Viewing: Override dark mode inline styles */
                      body:not(.dark-theme) [style*="color: #C2E0F4"], body:not(.dark-theme) [style*="color: #c2e0f4"] { color: var(--swap-navy-blue) !important; }
                      body:not(.dark-theme) [style*="border-color: #C2E0F4"], body:not(.dark-theme) [style*="border-color: #c2e0f4"] { border-color: var(--swap-navy-blue) !important; }
                      body:not(.dark-theme) [style*="color: #FFFFFF"], body:not(.dark-theme) [style*="color: #ffffff"] { color: var(--swap-black) !important; }
                      body:not(.dark-theme) [style*="border-color: #FFFFFF"], body:not(.dark-theme) [style*="border-color: #ffffff"] { border-color: var(--swap-black) !important; }
                      body:not(.dark-theme) [style*="color: #000000"] { color: var(--swap-white) !important; }
                      body:not(.dark-theme) [style*="border-color: #000000"] { border-color: var(--swap-white) !important; }
                      body:not(.dark-theme) [style*="color: #ECF0F1"], body:not(.dark-theme) [style*="color: #ecf0f1"] { color: var(--swap-dark-gray) !important; }
                      body:not(.dark-theme) [style*="border-color: #ECF0F1"], body:not(.dark-theme) [style*="border-color: #ecf0f1"] { border-color: var(--swap-dark-gray) !important; }
                      body:not(.dark-theme) [style*="color: #CED4D9"], body:not(.dark-theme) [style*="color: #ced4d9"] { color: var(--swap-gray) !important; }
                      body:not(.dark-theme) [style*="border-color: #CED4D9"], body:not(.dark-theme) [style*="border-color: #ced4d9"] { border-color: var(--swap-gray) !important; }
                      /* --- End Theme Color Overrides --- */
                    `;

                    // Extract parts from the full HTML content
                    const fullHtml = content || '';
                    const styleContent = extractStyleContent(fullHtml);
                    const bodyContent = extractBodyContent(fullHtml);
                    const scriptContent = extractScriptContent(fullHtml);

                    // Debug content extraction
                    console.log('Content extraction:', {
                      fullHtmlLength: fullHtml.length,
                      hasBody: fullHtml.includes('<body'),
                      hasScripts: fullHtml.includes('<script'),
                      styleContentLength: styleContent.length,
                      bodyContentLength: bodyContent.length,
                      scriptContentLength: scriptContent.length,
                      scriptContentSample: scriptContent ? scriptContent.substring(0, 100) + '...' : 'none'
                    });

                    // Process content to replace shortcodes with custom element tags
                    const processedContent = processContentForWebComponents(bodyContent);

                    // Add base styles and theme styles to the document
                    const combinedStyle = iframeDoc.createElement('style');
                    combinedStyle.textContent = `
                      /* Remove any Google Fonts references */
                      @import url('/fonts/inter.css');

                      /* Font fallbacks for Roboto */
                      @font-face {
                        font-family: 'Roboto';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Inter'), local('Inter-Regular'), url('/fonts/Inter-Regular.woff2') format('woff2');
                      }
                      @font-face {
                        font-family: 'Roboto';
                        font-style: normal;
                        font-weight: 500;
                        src: local('Inter Medium'), local('Inter-Medium'), url('/fonts/Inter-Medium.woff2') format('woff2');
                      }
                      @font-face {
                        font-family: 'Roboto';
                        font-style: normal;
                        font-weight: 600;
                        src: local('Inter SemiBold'), local('Inter-SemiBold'), url('/fonts/Inter-SemiBold.woff2') format('woff2');
                      }
                      @font-face {
                        font-family: 'Roboto';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Inter Bold'), local('Inter-Bold'), url('/fonts/Inter-Bold.woff2') format('woff2');
                      }

                      /* Base styles */
                      body {
                        font-family: 'Inter', sans-serif;
                        line-height: 1.6;
                        margin: 20px;
                        padding: 0;
                        background-color: ${isDark ? '#1e293b' : '#ffffff'}; /* Dark mode background */
                        color: ${isDark ? '#f8fafc' : '#1e293b'}; /* Dark mode text */
                      }
                      /* Preserve whitespace in paragraphs */
                      p { white-space: pre-wrap; }
                      /* Empty line divs have inline styles, no specific class rule needed here */
                      /* Remove potentially conflicting rules for p[data-empty] */
                      h1, h2, h3, h4, h5, h6 {
                        margin-top: 0;
                        margin-bottom: 0.5em;
                        /* Heading color already handled by body color */
                      }
                      p {
                        margin-top: 0;
                        margin-bottom: 1em;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 1em;
                      }
                      th, td {
                        border: 1px solid #e5e7eb;
                        padding: 8px;
                        text-align: left;
                      }
                      th {
                        background-color: #f9fafb;
                      }

                      /* Image Grid Layout Styles */
                      .image-grid-wrapper {
                        display: grid !important;
                        gap: 1em;
                        margin-bottom: 1em;
                        padding: 5px;
                      }
                      .image-grid-wrapper.align-left {
                        grid-template-columns: auto 1fr;
                      }
                      .image-grid-wrapper.align-right {
                        grid-template-columns: 1fr auto;
                      }
                      .image-grid-wrapper.align-center {
                        grid-template-columns: 1fr;
                        justify-items: center;
                      }
                      .image-grid-wrapper > .grid-cell {
                        min-width: 0;
                      }
                      .image-grid-wrapper > .image-cell {
                        display: flex;
                        align-items: flex-start;
                      }
                      .image-grid-wrapper.align-right > .image-cell {
                        grid-column: 2;
                      }
                      .image-grid-wrapper.align-right > .content-cell {
                        grid-column: 1;
                        grid-row: 1;
                      }
                      .image-grid-wrapper > .image-cell > img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                      }
                      .image-grid-wrapper > .content-cell {
                        min-height: 2em;
                        display: block;
                        height: 100%;
                        padding: 0.25em;
                      }
                      .image-grid-wrapper > .content-cell > p {
                        margin: 0 0 0.5em 0;
                        white-space: pre-wrap;
                      }
                      .image-grid-wrapper > .content-cell > p:last-child {
                        margin-bottom: 0;
                      }
      /* Honor text alignment styles */
      .image-grid-wrapper > .content-cell[style*="text-align"],
      .image-grid-wrapper > .content-cell > p[style*="text-align"] {
        display: block;
      }

      /* Image Style Options */
      .image-grid-wrapper > .image-cell > img.border-thin {
        border: 1px solid #e0e0e0;
      }
      .image-grid-wrapper > .image-cell > img.border-medium {
        border: 2px solid #e0e0e0;
      }
      .image-grid-wrapper > .image-cell > img.border-thick {
        border: 4px solid #e0e0e0;
      }
      /* Custom border colors will be applied as inline styles */
      .image-grid-wrapper > .image-cell > img.border-color-custom {
        /* This class just indicates that a custom color is being used */
        /* The actual color is set via inline style */
      }
      /* Border Style Options */
      .image-grid-wrapper > .image-cell > img.border-style-solid {
        border-style: solid;
      }
      .image-grid-wrapper > .image-cell > img.border-style-dashed {
        border-style: dashed;
      }
      .image-grid-wrapper > .image-cell > img.border-style-dotted {
        border-style: dotted;
      }
      /* Border Color Options */
      .image-grid-wrapper > .image-cell > img.border-color-gray {
        border-color: #e0e0e0;
      }
      .image-grid-wrapper > .image-cell > img.border-color-black {
        border-color: #000000;
      }
      .image-grid-wrapper > .image-cell > img.border-color-blue {
        border-color: var(--color-primary); /* Use dynamic primary color */
      }
      .image-grid-wrapper > .image-cell > img.border-color-red {
        border-color: #dc2626;
      }
      .image-grid-wrapper > .image-cell > img.border-color-green {
        border-color: #16a34a;
      }

      /* Fallback: Apply solid border style when thickness is present but no style is specified */
      .image-grid-wrapper > .image-cell > img.border-thin:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
      .image-grid-wrapper > .image-cell > img.border-medium:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
      .image-grid-wrapper > .image-cell > img.border-thick:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted) {
        border-style: solid;
      }
      .image-grid-wrapper > .image-cell > img.rounded-sm {
        border-radius: 4px;
      }
      .image-grid-wrapper > .image-cell > img.rounded-md {
        border-radius: 8px;
      }
      .image-grid-wrapper > .image-cell > img.rounded-lg {
        border-radius: 16px;
      }
      .image-grid-wrapper > .image-cell > img.rounded-full {
        border-radius: 9999px;
      }
                      /* Ensure proper sizing and display of router simulator */
                      router-simulator-simulator {
                        display: block !important;
                        margin: 0 auto !important;
                        width: fit-content !important;
                        height: auto !important;
                        overflow: visible !important;
                      }

                      /* Remove any inherited styles from parent document */
                      router-simulator-simulator * {
                        box-sizing: content-box !important;
                      }

                      /* Enable proper GPU acceleration and prevent flickering */
                      router-simulator-simulator,
                      router-simulator-simulator * {
                        transform: translateZ(0);
                        backface-visibility: hidden;
                        perspective: 1000px;
                      }
                      /* Base styles end here */

                      /* Inject theme-specific variables and overrides */
                      ${themeStyles}
                    `;
                    // Inject user styles first
                    if (styleContent) {
                      const userStyle = iframeDoc.createElement('style');
                      userStyle.textContent = styleContent;
                      iframeDoc.head.appendChild(userStyle);
                      console.log("PreviewModal: Injected user styles.");
                    }
                    // Inject combined base and theme styles second
                    iframeDoc.head.appendChild(combinedStyle);
                    console.log("PreviewModal: Injected base and theme styles.");

                    // Add theme class to body
                    if (isDark) {
                      iframeDoc.body.classList.add('dark-theme');
                    }

                    // Inject processed body content
                    iframeDoc.body.innerHTML = processedContent;

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

                    console.log("Required interactive elements in preview:", requiredElements);

                    requiredElements.forEach(elementName => {
                      // Use the standard filename 'index.js'
                      const scriptPath = `/interactive-elements/${elementName}/index.js`;
                      if (!injectedScripts.has(scriptPath)) {
                        // Construct the tag name based on the element name
                        const tagName = `${elementName}-simulator`;
                        console.log(`Injecting script for <${tagName}> in preview: ${scriptPath}`);
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

                    // Inject any scripts from the original content AFTER interactive elements
                    if (scriptContent) {
                      console.log("Injecting main script content in preview.");
                      const mainScript = iframeDoc.createElement('script');
                      mainScript.textContent = scriptContent;
                      mainScript.defer = true; // Ensure it runs after interactive elements are defined
                      iframeDoc.body.appendChild(mainScript);
                    }

                  } catch (err) {
                    console.error('Error enhancing preview iframe:', err);
                  }

                  if (mountedRef.current) {
                    setIsLoading(false);
                  }
                }}
                onError={() => {
                  console.error('Preview iframe failed to load');
                  if (mountedRef.current) {
                    setIsLoading(false);
                    setHasError(true);
                    // Optionally display an error message within the iframe
                    if (iframeRef.current) {
                      const iframeDoc = iframeRef.current.contentWindow.document;
                      iframeDoc.open();
                      iframeDoc.write(`
                        <div style="color: #ef4444; padding: 20px; border: 1px solid #ef4444; border-radius: 4px;">
                          <h3>Error Loading Preview</h3>
                          <p>Failed to load the preview content. Please try again.</p>
                          <button onclick="window.parent.location.reload()" style="
                            margin-top: 12px;
                            padding: 8px 16px;
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            transition: background-color 0.2s;
                          ">
                          <style>
                            button:hover {
                              background-color: #dc2626 !important;
                            }
                          </style>
                          Reload Page
                          </button>
                        </div>
                      `);
                      iframeDoc.close();
                    }
                  }
                }}
              />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PreviewModal;
