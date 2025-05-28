/**
 * Signature Series Template Five
 * Part of the Signature Series collection of professional templates
 */

export const signatureTemplateFive = {
  id: 'system-signature-05',
  name: '05 - Signature Template',
  description: 'Part of the Signature Series - A professionally designed template with a distinctive layout',
  category: 'Signature Series',
  tags: ['signature-series', 'professional', 'system'],
  isSystemTemplate: true,
  content: JSON.stringify({
    "ROOT": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "flexDirection": "column",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "padding": [
          "20",
          "20",
          "20",
          "20"
        ],
        "margin": [
          "0",
          "0",
          "0",
          "0"
        ],
        "background": {
          "r": 255,
          "g": 255,
          "b": 255,
          "a": 1
        },
        "shadow": {
          "enabled": false
        },
        "radius": 0,
        "width": "100%",
        "height": "auto"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "nodes": ["title"],
      "linkedNodes": {}
    },
    "title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "28",
        "textAlign": "center",
        "fontWeight": "bold",
        "color": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        },
        "text": "05 - Signature Template"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "nodes": [],
      "linkedNodes": {}
    }
  })
};

export default signatureTemplateFive;
