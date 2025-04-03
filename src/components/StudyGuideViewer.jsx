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
