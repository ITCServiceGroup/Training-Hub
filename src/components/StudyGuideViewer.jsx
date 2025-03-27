import React from 'react';

/**
 * Component for displaying study guide content
 */
const StudyGuideViewer = ({ studyGuide, isLoading }) => {
  // Styles
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
  
  const contentStyles = {
    lineHeight: '1.7',
    color: '#334155'
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

  // Create a complete HTML document for the iframe
  const createIframeContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.7;
              color: #334155;
              margin: 0;
              padding: 0;
            }
            
            /* Add any default styles for study guide content here */
            h1, h2, h3, h4, h5, h6 {
              color: #0f172a;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            
            p {
              margin-bottom: 1em;
            }
            
            code {
              background-color: #f1f5f9;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
            }
            
            pre {
              background-color: #f1f5f9;
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1em;
            }
            
            th, td {
              border: 1px solid #e2e8f0;
              padding: 0.5em;
              text-align: left;
            }
            
            th {
              background-color: #f8fafc;
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            a {
              color: #0f766e;
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
            
            /* Ensure content doesn't overflow */
            * {
              max-width: 100%;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${studyGuide.content}
        </body>
      </html>
    `;
  };

  return (
    <div style={containerStyles}>
      <h2 style={titleStyles}>{studyGuide.title}</h2>
      <iframe
        title={studyGuide.title}
        srcDoc={createIframeContent()}
        style={{
          width: '100%',
          height: 'calc(100vh - 300px)', // Use viewport height with offset for header, title, etc.
          minHeight: '600px', // Ensure a minimum height
          border: 'none',
          backgroundColor: 'white',
          overflow: 'auto'
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default StudyGuideViewer;
