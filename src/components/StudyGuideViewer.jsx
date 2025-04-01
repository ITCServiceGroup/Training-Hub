import React, { useEffect, useRef } from 'react';

/**
 * Component for displaying study guide content with interactive element support (Web Component Method)
 */
const StudyGuideViewer = ({ studyGuide, isLoading }) => {
  const iframeRef = useRef(null); // Ref for the main content iframe

  // Effect to inject component definition scripts after the main iframe loads
  useEffect(() => {
    const mainIframe = iframeRef.current;
    if (!mainIframe || !studyGuide || !studyGuide.content) return;

    // Use a Set to track which component scripts have already been injected
    const injectedScripts = new Set();

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

      // Inject the definition script for each required element if not already injected
      requiredElements.forEach(elementName => {
        // Use the standardized 'index.js' filename
        const scriptPath = `/interactive-elements/${elementName}/index.js`;

        if (!injectedScripts.has(scriptPath)) {
          const tagName = `${elementName}-simulator`; // Construct tag name for logging
          console.log(`Injecting script for <${tagName}>: ${scriptPath}`);
          const script = iframeDoc.createElement('script');
          script.src = scriptPath;
          script.async = false; // Important: Load definitions before body parsing if possible
          script.onerror = () => console.error(`Failed to load script: ${scriptPath}`);
          iframeDoc.body.appendChild(script); // Append to body, browser handles execution timing
          injectedScripts.add(scriptPath);
        } else {
           console.log(`Script already injected for ${elementName}: ${scriptPath}`);
        }
      });
    };

    // Use 'load' event for srcDoc changes
    mainIframe.addEventListener('load', handleLoad);

    // Initial load check (though less critical now as injection happens after load)
     if (mainIframe.contentWindow && mainIframe.contentWindow.document.readyState === 'complete') {
       console.log("Main iframe already complete on effect run, calling handleLoad.");
       handleLoad();
     } else {
       console.log("Main iframe not complete on effect run, waiting for load event.");
     }

    // Cleanup function
    return () => {
      if (mainIframe) {
        mainIframe.removeEventListener('load', handleLoad);
        console.log("Removed main iframe load listener.");
      }
    };
  }, [studyGuide]); // Rerun effect when studyGuide changes


  // Styles (kept for main viewer container)
  const containerStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    height: '100%',
    overflow: 'auto',
    width: '100%'
  };

  const titleStyles = {
    fontSize: '1.75rem',
    color: '#0f172a',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.75rem'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    color: '#64748b'
  };

  const spinnerStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #E5E7EB',
    borderTopColor: '#0f766e',
    animation: 'spin 1s linear infinite',
    marginRight: '0.75rem'
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  };

  // Loading and Empty states remain the same
  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <span>Loading study guide...</span>
        </div>
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div style={containerStyles}>
        <div style={emptyStateStyles}>
          <p>Select a study guide to view its content</p>
        </div>
      </div>
    );
  }

  // Process content to replace shortcodes with custom element tags
  const processContentForWebComponents = (content) => {
    console.log('Raw Content for Web Components:', content);
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


  // Main component return statement
  return (
    <div style={containerStyles}>
      <h2 style={titleStyles}>{studyGuide.title}</h2>
      <iframe
        ref={iframeRef} // Ref for the main iframe
        title={studyGuide.title}
        // Set srcDoc to the content processed for web components
        srcDoc={processContentForWebComponents(studyGuide.content)}
        style={{
          width: '100%',
          height: 'calc(100vh - 300px)', // Adjust height as needed
          minHeight: '600px',
          border: 'none', // No border for the main iframe itself
          backgroundColor: 'white',
          overflow: 'auto'
        }}
        // Sandbox is still good practice for the main content iframe
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default StudyGuideViewer;
