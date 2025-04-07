// Process content to replace shortcodes with custom element tags (similar to StudyGuideViewer)
export const processContentForWebComponents = (content) => {
  if (!content) return '';
  const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
  // Replace shortcode with the corresponding custom element tag
  return content.replace(shortcodeRegex, (match, name) => {
    // Basic validation for name
    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      console.warn(`Invalid interactive element name found: ${name}`);
      return `<p class="text-red-500 border border-red-500 p-1">[Invalid interactive element: ${name}]</p>`;
    }
    // Construct the custom element tag name (e.g., fiber-fault -> fiber-fault-simulator)
    const tagName = `${name}-simulator`; // Assuming this convention matches the definition
    console.log(`Replacing shortcode for "${name}" with <${tagName}>`);
    return `<${tagName}></${tagName}>`;
  });
};

// Function to prepare HTML content for preview
export const prepareContentForPreview = (htmlContent) => {
  if (!htmlContent) return htmlContent;

  // Only process HTML content
  if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
    return htmlContent;
  }

  // Process empty paragraphs
  let processedContent = htmlContent;

  // Extract body content to process
  const bodyMatch = processedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    let bodyContent = bodyMatch[1];

    // Replace empty paragraphs with divs that have height
    bodyContent = bodyContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Also handle paragraphs with non-breaking spaces or just spaces
    bodyContent = bodyContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');

    // Replace consecutive <br> tags with empty lines
    bodyContent = bodyContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');

    // Replace the body content in the full HTML
    processedContent = processedContent.replace(bodyMatch[0], `<body>${bodyContent}</body>`);
  }

  // Add a comment to help with debugging
  const debugComment = `
<!--
Preview content prepared by StudyGuideEditor/htmlUtils
Timestamp: ${new Date().toISOString()}
Content length: ${processedContent.length}
-->
`;

  // Find the head tag to insert our comment
  const headIndex = processedContent.indexOf('<head>');
  if (headIndex !== -1) {
    return processedContent.slice(0, headIndex + 6) + debugComment + processedContent.slice(headIndex + 6);
  }

  return processedContent;
};

// Extract body content from full HTML document
export const extractBodyContent = (htmlContent) => {
  if (!htmlContent) return '';

  // Check if it's a full HTML document
  if (htmlContent.includes('<body')) {
    const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : htmlContent;
  }

  return htmlContent;
};

// Helper to extract style content from a full HTML string
export const extractStyleContent = (fullHtml) => {
  return fullHtml?.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || '';
};

// Helper to extract and deduplicate script content
export const extractUniqueScriptContent = (htmlContent) => {
  // Find all script tags that don't have src attribute
  const scriptMatches = htmlContent?.match(/<script(?![^>]*?\bsrc\b)[^>]*>([\s\S]*?)<\/script>/ig) || [];
  if (!scriptMatches.length) return '';

  // Extract content from each script tag and deduplicate
  const uniqueScripts = new Set();
  scriptMatches.forEach(script => {
    const content = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1].trim();
    if (content) uniqueScripts.add(content);
  });

  // Join unique scripts with newlines
  return Array.from(uniqueScripts).join('\n\n');
};

// Get full HTML document for saving or HTML mode view
export const getFullHtmlForSave = (bodyContentToSave, title, initialContent) => {
  // Construct the HTML while preserving script content
  let baseStyles = `
    @import url('/fonts/inter.css');
    body { font-family: 'Inter', sans-serif; line-height: 1.6; margin: 20px; }
    .section { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 4px; }
    h1, h2, h3 { color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
    .interactive-placeholder { background-color: #f0f7ff; border: 1px solid #bbd6ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
  `;

  const styleContent = extractStyleContent(initialContent) || baseStyles;

  // Generate the final HTML with proper whitespace and indentation
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `    <title>${title || 'Study Guide'}</title>`,
    '    <style>',
    `        ${styleContent.trim()}`,
    '    </style>',
    '</head>',
    '<body>',
    bodyContentToSave, // This now includes the script tag if present in RTE content
    '</body>',
    '</html>'
  ].join('\n');
};
