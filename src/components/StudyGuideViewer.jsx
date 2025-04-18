import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Component for displaying study guide content with interactive element support (Web Component Method)
 */
const StudyGuideViewer = ({ studyGuide, isLoading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const iframeRef = useRef(null); // Ref for the main content iframe

  // Effect to inject component definition scripts after the main iframe loads
  useEffect(() => {
    const mainIframe = iframeRef.current;
    if (!mainIframe || !studyGuide || !studyGuide.content) return;

    const handleLoad = () => {
      console.log("Main content iframe loaded (for Web Components).");
      const iframeDoc = mainIframe.contentWindow?.document;
      if (!iframeDoc) {
        console.error("Could not access main iframe document.");
        return;
      }

      // Find all unique interactive element names required by the content
      const requiredElements = new Set();
      const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
      let match;
      while ((match = shortcodeRegex.exec(studyGuide.content)) !== null) {
          if (/^[a-zA-Z0-9-]+$/.test(match[1])) { // Basic validation
             requiredElements.add(match[1]);
          }
      }

      console.log("Required interactive elements:", requiredElements);

      // Inject the definition script for each required element if not defined in the iframe context
      requiredElements.forEach(elementName => {
        const tagName = `${elementName}-simulator`;
        const scriptPath = `/interactive-elements/${elementName}/index.js`;
        const iframeWindow = mainIframe.contentWindow;

        // Check if the element is already defined in *this* iframe's context
        if (iframeWindow && !iframeWindow.customElements.get(tagName)) {
          console.log(`Element <${tagName}> not defined. Injecting script: ${scriptPath}`);
          const script = iframeDoc.createElement('script');
          script.src = scriptPath;
          script.type = 'module'; // Add type="module" for ES module support
          script.async = false; // Ensure sequential loading

          // Add error handling for script loading itself
          script.onerror = () => console.error(`Failed to load script: ${scriptPath}`);

          // Append the script to the iframe's body
          iframeDoc.body.appendChild(script);

          // Use whenDefined to wait for the element registration
          iframeWindow.customElements.whenDefined(tagName)
            .then(() => {
              console.log(`Element <${tagName}> successfully defined and registered.`);
            })
            .catch(error => {
              console.error(`Error waiting for element <${tagName}> definition:`, error);
            });

        } else if (iframeWindow && iframeWindow.customElements.get(tagName)) {
          console.log(`Element <${tagName}> already defined in this iframe. Skipping script injection: ${scriptPath}`);
        } else {
          console.warn(`Could not access iframe window or customElements registry to check for <${tagName}>.`);
        }
      });
    };

    // Use 'load' event for srcDoc changes
    mainIframe.addEventListener('load', handleLoad);

    // Cleanup function
    return () => {
      if (mainIframe) {
        mainIframe.removeEventListener('load', handleLoad);
        console.log("Removed main iframe load listener.");
      }
    };
  // Rerun effect only when study guide *content* actually changes
  }, [studyGuide?.content]);


  // Using Tailwind classes instead of inline styles

  // Loading and Empty states remain the same
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 shadow h-full overflow-auto w-full`}>
        <div className={`flex justify-center items-center p-8 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-gray-700 border-t-teal-500' : 'border-gray-200 border-t-teal-700'} animate-spin mr-3`}></div>
          <span>Loading study guide...</span>
        </div>
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 shadow h-full overflow-auto w-full`}>
        <div className={`text-center p-8 ${isDark ? 'text-gray-400' : 'text-slate-500'} flex flex-col items-center justify-center h-full`}>
          <p>Select a study guide to view its content</p>
        </div>
      </div>
    );
  }

  // Helper to extract style content from a full HTML string
  const extractStyleContent = (fullHtml) => {
    return fullHtml?.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || '';
  };

  // Helper to extract body content from full HTML document
  const extractBodyContent = (htmlContent) => {
    if (!htmlContent) return '';
    // Check if it's a full HTML document
    if (htmlContent.includes('<body')) {
      const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return match ? match[1] : htmlContent; // Return body content or original if no body tag
    }
    // Assume it's body content if no body tag found
    return htmlContent;
  };


  // Process *body* content to replace shortcodes with custom element tags
  // and ensure empty paragraphs are preserved
  const processBodyContentForWebComponents = (bodyContent) => {
    console.log('Processing body content for Web Components:', bodyContent);
    if (!bodyContent) return '';

    // Log the original content for debugging
    console.log('Original content:', bodyContent);

    // First, replace all empty paragraphs with a special marker
    // This is a more aggressive approach to ensure empty paragraphs are preserved
    let processedContent = bodyContent;

    // Replace empty paragraphs with a div that has height
    processedContent = processedContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Also handle paragraphs with non-breaking spaces or just spaces
    processedContent = processedContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Replace consecutive <br> tags with empty lines
    processedContent = processedContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

    // Log the processed content for debugging
    console.log('Processed content (after empty line handling):', processedContent);

    // Replace shortcodes with custom elements wrapped in centering div
    processedContent = processedContent.replace(/\[interactive name="([^"]+)"\]/g, (match, name) => {
      if (!/^[a-zA-Z0-9-]+$/.test(name)) {
        console.warn(`Invalid interactive element name found in viewer: ${name}`);
        return `<p style="color: red; border: 1px solid red; padding: 5px;">[Invalid interactive element: ${name}]</p>`;
      }
      const tagName = `${name}-simulator`;
      console.log(`Viewer replacing shortcode for "${name}" with <${tagName}>`);
      return `<div style="display: block;"><${tagName}></${tagName}></div>`; // Removed text-align: center
    });

    return processedContent;
  };

  // Extract styles and body, process body, then construct srcDoc
  const fullContent = studyGuide.content || '';
  const styles = extractStyleContent(fullContent);
  const bodyContent = extractBodyContent(fullContent);
  const processedBody = processBodyContentForWebComponents(bodyContent);

  // Construct the full HTML for the iframe srcDoc
  const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${studyGuide.title || 'Study Guide Content'}</title>
      <style>
        /* Base iframe styles */
        body {
          margin: 0;
          padding: 15px;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          /* Ensure proper rendering context */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Reset potential interfering styles */
          text-size-adjust: none;
          -webkit-text-size-adjust: none;
          /* Dark mode support */
          background-color: ${isDark ? '#1e293b' : '#ffffff'};
          color: ${isDark ? '#f8fafc' : '#1e293b'};
        }

        /* Ensure web components have proper display */
        router-simulator-simulator {
          display: block;
          margin: 0 auto;
          width: fit-content !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* Remove any inherited styles from parent document */
        router-simulator-simulator * {
          box-sizing: content-box;
        }
        /* Preserve whitespace in paragraphs */
        p { white-space: pre-wrap; }
        /* Ensure empty paragraphs have height */
        p[data-empty="true"] { min-height: 1em; display: block; }
        /* Ensure consecutive empty paragraphs are visible */
        p + p[data-empty="true"] { margin-top: 1em; }
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

        /* Image Style Options */
        .image-grid-wrapper > .image-cell > img.border-thin {
          border: 1px solid ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-medium {
          border: 2px solid ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-thick {
          border: 4px solid ${isDark ? '#475569' : '#e0e0e0'};
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
          border-color: ${isDark ? '#475569' : '#e0e0e0'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-black {
          border-color: ${isDark ? '#f8fafc' : '#000000'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-blue {
          border-color: ${isDark ? '#14b8a6' : '#0f766e'}; /* Changed from blue to teal */
        }
        .image-grid-wrapper > .image-cell > img.border-color-red {
          border-color: ${isDark ? '#f87171' : '#dc2626'};
        }
        .image-grid-wrapper > .image-cell > img.border-color-green {
          border-color: ${isDark ? '#34d399' : '#16a34a'};
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
        /* End Image Style Options */
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
        /* Inject styles extracted from saved content */
        ${styles}
      </style>
      <link rel="stylesheet" href="/fonts/inter.css"> <!-- Ensure fonts are loaded -->
    </head>
    <body>
      ${processedBody}
    </body>
    </html>
  `;


  // Main component return statement
  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-2 sm:p-8 shadow h-full overflow-auto w-full`}> {/* Changed p-8 to p-2 sm:p-8 */}
      <div className={`flex justify-between items-center mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-3`}>
        <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{studyGuide.title}</h2>
        {studyGuide && studyGuide.category_id && (
          <button
            onClick={() => window.location.href = `/practice-quiz/${studyGuide.category_id}`}
            className={`${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-700 hover:bg-teal-800'} text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2`}
          >
            <span>📝</span> Take Practice Quiz
          </button>
        )}
      </div>
      <iframe
        ref={iframeRef} // Ref for the main iframe
        title={studyGuide.title}
        // Set srcDoc to the manually constructed HTML with injected styles
        srcDoc={iframeHtml}
        className="w-full border-none bg-white overflow-auto"
        style={{ height: 'calc(100% - 60px)' }} // Adjusted to fill container minus the title height
        // Sandbox is still good practice for the main content iframe
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default StudyGuideViewer;
