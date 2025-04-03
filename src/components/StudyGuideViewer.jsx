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


  // Using Tailwind classes instead of inline styles

  // Loading and Empty states remain the same
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow h-full overflow-auto w-full">
        <div className="flex justify-center items-center p-8 text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-teal-700 animate-spin mr-3"></div>
          <span>Loading study guide...</span>
        </div>
      </div>
    );
  }

  if (!studyGuide) {
    return (
      <div className="bg-white rounded-lg p-8 shadow h-full overflow-auto w-full">
        <div className="text-center p-8 text-slate-500 flex flex-col items-center justify-center h-full">
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
    <div className="bg-white rounded-lg p-8 shadow h-full overflow-auto w-full">
      <h2 className="text-2xl text-slate-900 mb-6 border-b border-slate-200 pb-3">{studyGuide.title}</h2>
      <iframe
        ref={iframeRef} // Ref for the main iframe
        title={studyGuide.title}
        // Set srcDoc to the content processed for web components
        srcDoc={processContentForWebComponents(studyGuide.content)}
        className="w-full min-h-[600px] border-none bg-white overflow-auto"
        style={{ height: 'calc(100vh - 300px)' }} // Keep this one style for dynamic calculation
        // Sandbox is still good practice for the main content iframe
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default StudyGuideViewer;
