/**
 * Basic Text Layout Template
 * A simple template with text components and basic formatting
 */

export const basicTextLayoutTemplate = {
  id: 'system-basic-text',
  name: 'Basic Text Layout',
  description: 'A simple template with text components and basic formatting for straightforward content presentation',
  category: 'Basic',
  tags: ['text', 'simple', 'beginner'],
  isSystemTemplate: true,
  content: JSON.stringify({
    "ROOT": {
      "type": { "resolvedName": "Container" },
      "isCanvas": true,
      "props": {
        "background": { r: 255, g: 255, b: 255, a: 1 },
        "padding": ["20", "20", "20", "20"]
      },
      "displayName": "Container",
      "custom": {},
      "hidden": false,
      "nodes": ["heading1", "intro", "section1", "content1"],
      "linkedNodes": {}
    },
    "heading1": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "Study Guide Title",
        "fontSize": "28",
        "fontWeight": "bold",
        "textAlign": "left",
        "color": { r: 31, g: 41, b: 55, a: 1 },
        "padding": ["0", "0", "0", "0"],
        "margin": ["0", "0", "16", "0"]
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "intro": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "This study guide provides comprehensive coverage of the topic with clear explanations and practical examples.",
        "fontSize": "16",
        "fontWeight": "400",
        "textAlign": "left",
        "color": { r: 75, g: 85, b: 99, a: 1 },
        "padding": ["0", "0", "0", "0"],
        "margin": ["0", "0", "20", "0"]
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "section1": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "1. Introduction",
        "fontSize": "20",
        "fontWeight": "600",
        "textAlign": "left",
        "color": { r: 31, g: 41, b: 55, a: 1 },
        "padding": ["0", "0", "0", "0"],
        "margin": ["0", "0", "12", "0"]
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "content1": {
      "type": { "resolvedName": "Text" },
      "isCanvas": false,
      "props": {
        "text": "Add your content here. This template provides a clean, simple layout perfect for text-based study materials.",
        "fontSize": "16",
        "fontWeight": "400",
        "textAlign": "left",
        "color": { r: 55, g: 65, b: 81, a: 1 },
        "padding": ["0", "0", "0", "0"],
        "margin": ["0", "0", "0", "0"]
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

export default basicTextLayoutTemplate;
