import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../../../../../../contexts/ThemeContext';

/**
 * Component for rendering interactive elements in an iframe for proper isolation
 */
const InteractiveRenderer = ({ name }) => {
  const iframeRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!name || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Create a fresh document structure
    iframeDoc.open();
    iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    iframeDoc.close();

    // Add styles to the iframe
    const style = iframeDoc.createElement('style');
    style.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        margin: 0;
        padding: 0;
        background-color: ${isDark ? '#1e293b' : '#ffffff'};
        color: ${isDark ? '#f8fafc' : '#1e293b'};
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100%;
        overflow: hidden;
        width: 100%;
      }
      .interactive-element-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        box-sizing: border-box;
      }

      /* Override host element styles to ensure full width */
      :host {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      /* Override simulator-container styles */
      .simulator-container {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Override vis-container styles */
      #vis-container {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      /* Override any responsive styles in the interactive elements */
      @media (max-width: 1350px) {
        /* Force desktop layout for elements with tablet breakpoints */
        #vis-container {
          grid-template-columns: repeat(12, 1fr) !important;
          grid-template-rows: repeat(1, auto) !important;
        }
      }
      @media (max-width: 768px) {
        /* Force desktop layout for elements with mobile breakpoints */
        #vis-container {
          grid-template-columns: repeat(12, 1fr) !important;
          grid-template-rows: repeat(1, auto) !important;
        }
        .node {
          max-width: 60px !important;
          font-size: 0.8em !important;
        }
        /* Ensure all columns are visible in trace output */
        .trace-row {
          grid-template-columns: 35px repeat(3, 65px) 20px auto !important;
        }
        .trace-header-row span:nth-child(4),
        .trace-row span:nth-child(4) {
          display: inline-block !important;
        }
        .trace-col-sep { grid-column: 5 !important; }
        .trace-col-ip { grid-column: 6 !important; }
        #trace-output-container { font-size: 14px !important; }
      }
    `;
    iframeDoc.head.appendChild(style);

    // Add meta tag for viewport with a fixed width to ensure desktop layout
    const meta = iframeDoc.createElement('meta');
    meta.setAttribute('name', 'viewport');
    // Use a fixed width of 1400px to ensure desktop layout is always used
    meta.setAttribute('content', 'width=1400, initial-scale=1.0');
    iframeDoc.head.appendChild(meta);

    // Create a div for the content
    const contentDiv = iframeDoc.createElement('div');
    contentDiv.className = 'interactive-element-wrapper';
    iframeDoc.body.appendChild(contentDiv);

    // Create the custom element
    const tagName = `${name}-simulator`;
    const customElement = iframeDoc.createElement(tagName);
    contentDiv.appendChild(customElement);

    // Load the script for the interactive element
    const script = iframeDoc.createElement('script');
    script.src = `/interactive-elements/${name}/index.js`;
    script.type = 'module';
    iframeDoc.head.appendChild(script);

    // Add a script to override the max-width of the vis-container
    const overrideScript = iframeDoc.createElement('script');
    overrideScript.textContent = `
      // Wait for the custom element to be defined and rendered
      setTimeout(() => {
        // Override the max-width of the vis-container
        const visContainer = document.getElementById('vis-container');
        if (visContainer) {
          visContainer.style.maxWidth = '100%';
          visContainer.style.width = '100%';
        }

        // Override the max-width of the simulator-container
        const simulatorContainer = document.querySelector('.simulator-container');
        if (simulatorContainer) {
          simulatorContainer.style.maxWidth = '100%';
          simulatorContainer.style.width = '100%';
        }

        // Override the max-width of the host element
        const customElement = document.querySelector('${name}-simulator');
        if (customElement && customElement.shadowRoot) {
          const styleElement = document.createElement('style');
          styleElement.textContent = \`
            :host {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin: 0 !important;
            }
            .simulator-container {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            #vis-container {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin: 0 !important;
            }
          \`;
          customElement.shadowRoot.appendChild(styleElement);
        }
      }, 500);
    `;
    iframeDoc.head.appendChild(overrideScript);

    // Adjust iframe height based on content
    const resizeObserver = new ResizeObserver(() => {
      if (contentDiv.scrollHeight > 0) {
        iframe.style.height = `${contentDiv.scrollHeight + 20}px`;
      }
    });

    resizeObserver.observe(contentDiv);

    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [name, isDark]);

  return (
    <iframe
      ref={iframeRef}
      title={`Interactive: ${name}`}
      className="w-full border-none"
      style={{
        minHeight: '200px',
        height: '100%',
        overflow: 'hidden',
        width: '100%',
        display: 'block',
        maxWidth: '100%'
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default InteractiveRenderer;
