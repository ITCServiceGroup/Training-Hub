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
      }
      .interactive-element-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
      }
    `;
    iframeDoc.head.appendChild(style);

    // Add meta tag for viewport
    const meta = iframeDoc.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
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
      style={{ minHeight: '200px', height: '100%', overflow: 'hidden' }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default InteractiveRenderer;
