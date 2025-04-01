import React, { useEffect, useRef, useState } from 'react';
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

const PreviewModal = ({ isOpen, onClose, content, title }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

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

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5px', // Further reduced from 10px
      zIndex: 50
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '1400px', // Reduced from 1800px to 1400px
      maxHeight: '98vh', // Increased from 95vh to 98vh
      height: '98vh', // Added explicit height
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    header: {
      padding: '6px 12px', // Further reduced padding
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '40px', // Fixed height instead of minHeight
      flexShrink: 0 // Prevent header from shrinking
    },
    title: {
      fontSize: '1rem', // Further reduced from 1.1rem
      fontWeight: '600',
      color: '#111827'
    },
    closeButton: {
      padding: '4px', // Further reduced from 6px
      borderRadius: '4px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    previewContainer: {
      flex: 1, // Take up all available space
      display: 'flex', // Use flexbox
      flexDirection: 'column', // Stack children vertically
      overflow: 'hidden',
      padding: '0', // Remove all padding
      height: 'calc(98vh - 40px)', // Use full height minus header
      minHeight: '0' // Remove minimum height constraint
    },
    iframe: {
      flex: 1, // Take up all available space
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '0',
      backgroundColor: 'white',
      display: 'block',
      opacity: isLoading ? 0 : 1,
      transition: 'opacity 0.2s ease'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      opacity: isLoading ? 1 : 0,
      visibility: isLoading ? 'visible' : 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease'
    },
    loadingText: {
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    loadingDot: {
      width: '6px',
      height: '6px',
      backgroundColor: '#6b7280',
      borderRadius: '50%',
      animation: 'pulse 1s infinite'
    }
  };

  // Use content as the key to force iframe remount on content change
  const iframeKey = content; 

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
      aria-labelledby="preview-modal-title"
    >
      <div style={styles.modalOverlay} aria-hidden="true">
        <Dialog.Panel style={styles.modalContent}>
          <div style={styles.header}>
            <Dialog.Title id="preview-modal-title" style={styles.title}>
              {title || 'Study Guide Preview'}
            </Dialog.Title>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              aria-label="Close preview"
            >
              <FaTimes size={20} aria-hidden="true" />
            </button>
          </div>
          <div style={styles.previewContainer} className="relative">
            <div
              style={styles.loadingOverlay}
              role="status"
              aria-label="Loading preview content"
            >
              <div style={styles.loadingText}>
                <span>Loading preview</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        ...styles.loadingDot,
                        animationDelay: `${i * 0.2}s`
                      }}
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
                style={styles.iframe}
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
                    
                    // Add base styles to the document
                    const baseStyle = iframeDoc.createElement('style');
                    baseStyle.textContent = `
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
                        color: #333;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        margin-top: 0;
                        margin-bottom: 0.5em;
                        color: #111827;
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
                      
                      /* Add any extracted styles */
                      ${styleContent}
                    `;
                    iframeDoc.head.appendChild(baseStyle);
                    
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
                        script.src = new URL(scriptPath, window.location.origin).href;
                        script.async = false; // Ensure scripts load in order if needed
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
