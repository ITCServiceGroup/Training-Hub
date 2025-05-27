/**
 * Template Example - Copy this file to create new system templates
 * 
 * Instructions:
 * 1. Copy this file and rename it to your template name (e.g., "my-awesome-template.js")
 * 2. Update the template object below with your content
 * 3. Import and add it to the systemTemplates array in ../systemTemplates.js
 * 4. Make sure all padding and margin values are arrays, not strings
 */

export const templateExampleTemplate = {
  id: 'system-template-example', // Must start with 'system-' and be unique
  name: 'Template Example',
  description: 'A template description that explains what this template is for and when to use it',
  category: 'Basic', // Basic, Interactive, Educational, Layout, Advanced, Business
  tags: ['example', 'template', 'guide'], // Array of relevant tags
  isSystemTemplate: true, // Always true for system templates
  content: JSON.stringify({
    "ROOT": {
      "type": { "resolvedName": "Container" },
      "isCanvas": true,
      "props": {
        "background": "#ffffff",
        "padding": ["20", "20", "20", "20"] // IMPORTANT: Use arrays, not strings
      },
      "displayName": "Container",
      "custom": {},
      "hidden": false,
      "nodes": ["title", "content"], // List of child node IDs
      "linkedNodes": {}
    },
    "title": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "Template Title",
        "fontSize": "28",
        "fontWeight": "bold",
        "textAlign": "left",
        "color": "#1f2937",
        "padding": ["0", "0", "0", "0"], // IMPORTANT: Use arrays
        "margin": ["0", "0", "16", "0"]   // IMPORTANT: Use arrays
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "content": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "Add your template content here. Remember to use proper padding and margin arrays.",
        "fontSize": "16",
        "fontWeight": "400",
        "textAlign": "left",
        "color": "#374151",
        "padding": ["0", "0", "0", "0"], // IMPORTANT: Use arrays
        "margin": ["0", "0", "0", "0"]   // IMPORTANT: Use arrays
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  })
};

// IMPORTANT NOTES:
// 1. All padding and margin values MUST be arrays like ["top", "right", "bottom", "left"]
// 2. Do NOT use strings like "20px" - use arrays like ["20", "20", "20", "20"]
// 3. Colors can be hex strings like "#1f2937"
// 4. Make sure parent-child relationships are correct
// 5. Test your template by loading it in the editor

export default templateExampleTemplate;
