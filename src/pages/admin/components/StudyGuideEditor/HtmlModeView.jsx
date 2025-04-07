import React, { useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import {
  extractBodyContent,
  extractStyleContent,
  extractUniqueScriptContent,
  processContentForWebComponents,
} from './utils/htmlUtils'; // Import necessary utils

const HtmlModeView = ({
  htmlModeContent,
  onHtmlContentChange,
  iframeRef,
  initialContent, // Needed for script/style extraction for preview
  title // Needed for preview iframe title (though not currently used in iframe logic)
}) => {

  // Effect to manually update iframe content in HTML mode with interactive element support
  useEffect(() => {
    const setupIframeContent = async () => {
      if (!iframeRef.current) return;

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentWindow.document;

      // Extract parts from the full HTML content in the textarea
      const fullHtml = htmlModeContent;
      const styleContent = extractStyleContent(fullHtml);
      const bodyContent = extractBodyContent(fullHtml);
      const mainScriptContent = extractUniqueScriptContent(fullHtml);

      // Process body content to handle empty paragraphs and replace shortcodes
      let processedBodyContent = bodyContent;
      processedBodyContent = processedBodyContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');
      processedBodyContent = processedBodyContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');
      processedBodyContent = processedBodyContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');
      processedBodyContent = processContentForWebComponents(processedBodyContent);

      // Write the basic structure
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html><head></head><body><div id="content"></div></body></html>');
      iframeDoc.close();

      // Inject styles first
      const styleEl = iframeDoc.createElement('style');
      styleEl.textContent = styleContent || `
        body { font-family: 'Inter', sans-serif; line-height: 1.6; margin: 20px; }
        img { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        p { white-space: pre-wrap; }
        .empty-line { height: 1em; display: block; margin: 1em 0; }
        .loading { text-align: center; padding: 20px; color: #666; }
      `;
      iframeDoc.head.appendChild(styleEl);

      // Show loading state
      const contentDiv = iframeDoc.getElementById('content');
      contentDiv.innerHTML = '<div class="loading">Loading interactive elements...</div>';

      // Find required interactive elements
      const requiredElements = new Set();
      const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
      let match;
      while ((match = shortcodeRegex.exec(bodyContent)) !== null) {
        if (/^[a-zA-Z0-9-]+$/.test(match[1])) {
          requiredElements.add(match[1]);
        }
      }

      // Load interactive element scripts with proper error handling
      const loadScript = (elementName) => {
        return new Promise((resolve, reject) => {
          const scriptPath = `/interactive-elements/${elementName}/index.js`;
          const script = iframeDoc.createElement('script');
          script.type = 'module';
          script.src = new URL(scriptPath, window.location.origin).href;
          
          script.onload = () => {
            console.log(`Successfully loaded script for ${elementName}`);
            resolve();
          };
          
          script.onerror = (error) => {
            console.error(`Failed to load script for ${elementName}:`, error);
            reject(error);
          };

          iframeDoc.head.appendChild(script);
        });
      };

      try {
        // Load all required scripts concurrently
        await Promise.all(Array.from(requiredElements).map(loadScript));
        console.log('All interactive element scripts loaded successfully');

        // Now that scripts are loaded, inject the content
        contentDiv.innerHTML = processedBodyContent;

        // Finally, inject any additional script content
        if (mainScriptContent) {
          console.log('Injecting additional script content');
          const mainScript = iframeDoc.createElement('script');
          mainScript.textContent = mainScriptContent;
          mainScript.type = 'module';
          iframeDoc.body.appendChild(mainScript);
        }
      } catch (error) {
        console.error('Error loading interactive elements:', error);
        contentDiv.innerHTML = `
          <div style="color: #e53e3e; padding: 12px; border: 1px solid #feb2b2; border-radius: 4px; margin: 12px 0;">
            Error loading interactive elements. Please try refreshing the page.
          </div>
          ${processedBodyContent}
        `;
      }
    };

    setupIframeContent();
  }, [htmlModeContent, initialContent, iframeRef]);

  return (
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
                onChange={onHtmlContentChange} // Use the passed handler
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
            {/* Make this outer div full height flex column */}
            <div className="flex flex-col gap-2 h-full">
              <label className="text-sm font-medium text-gray-700 flex-shrink-0"> {/* Prevent label from shrinking */}
                 Preview
               </label>
               {/* Let this div grow and handle overflow */}
               <div className="border border-gray-300 rounded-md p-4 overflow-auto flex-grow">
                 <iframe
                   ref={iframeRef} // Use the passed ref
                   className="w-full h-full border-none block"
                  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
                  title="Preview" // Use the passed title prop if needed for accessibility
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

HtmlModeView.displayName = 'HtmlModeView';

export default HtmlModeView;
