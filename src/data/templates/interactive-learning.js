/**
 * Interactive Learning Template
 * Template with interactive elements, collapsible sections, and engaging components
 */

export const interactiveLearningTemplate = {
  id: 'system-interactive-learning',
  name: 'Interactive Learning',
  description: 'Template with interactive elements, collapsible sections, and engaging components for dynamic learning',
  category: 'Interactive',
  tags: ['interactive', 'collapsible', 'advanced'],
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
          "light": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          },
          "dark": {
            "r": 31,
            "g": 41,
            "b": 55,
            "a": 1
          }
        },
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "radius": 0,
        "width": "100%",
        "height": "auto",
        "autoConvertColors": true
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "hidden": false,
      "nodes": [
        "title",
        "overview",
        "keypoints",
        "howworks",
        "LYgHw4qqHR",
        "ryZpE8aN63",
        "NlbpMQb4tv"
      ],
      "linkedNodes": {}
    },
    "title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "28",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "bold",
        "color": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        },
        "margin": [
          "0",
          "0",
          "16",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "Interactive Study Guide",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "overview": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "r": 75,
          "g": 85,
          "b": 99,
          "a": 1
        },
        "margin": [
          "0",
          "0",
          "20",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "This interactive template includes collapsible sections, key concepts, and hands-on elements to enhance learning.",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "keypoints": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "flexDirection": "column",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "padding": [
          "16",
          "16",
          "16",
          "16"
        ],
        "margin": [
          "0",
          "0",
          "20",
          "0"
        ],
        "background": {
          "r": 227,
          "g": 242,
          "b": 253,
          "a": 1
        },
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "radius": 0,
        "width": "100%",
        "height": "auto",
        "autoConvertColors": true,
        "borderRadius": "8px"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": [
        "keyheading",
        "point1",
        "point2",
        "point3"
      ],
      "linkedNodes": {}
    },
    "keyheading": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "18",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "600",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "12",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "Key Concepts:",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "keypoints",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "point1": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "8",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Important concept one with detailed explanation",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "keypoints",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "point2": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "8",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Important concept two with practical examples",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "keypoints",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "point3": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "0",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Important concept three with real-world applications",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "keypoints",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "howworks": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "flexDirection": "column",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "padding": [
          "16",
          "16",
          "16",
          "16"
        ],
        "margin": [
          "0",
          "0",
          "20",
          "0"
        ],
        "background": {
          "light": {
            "r": 243,
            "g": 229,
            "b": 245,
            "a": 1
          },
          "dark": {
            "r": 106,
            "g": 28,
            "b": 117,
            "a": 1
          }
        },
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "radius": 0,
        "width": "100%",
        "height": "auto",
        "autoConvertColors": true,
        "borderRadius": "8px"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": [
        "howheading",
        "step1",
        "step2",
        "step3"
      ],
      "linkedNodes": {}
    },
    "howheading": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "18",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "600",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "12",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "How It Works:",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "howworks",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step1": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "8",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Step-by-step process explanation",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "howworks",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step2": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "8",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Technical details and implementation",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "howworks",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step3": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 96,
            "g": 96,
            "b": 96,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": [
          "0",
          "0",
          "0",
          "0"
        ],
        "padding": [
          "0",
          "0",
          "0",
          "0"
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.25
            }
          }
        },
        "text": "• Best practices and troubleshooting tips",
        "listType": "none",
        "inTable": false,
        "hasIcon": false,
        "iconName": "edit",
        "iconColor": {
          "light": {
            "r": 92,
            "g": 90,
            "b": 90,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "_lastUpdate": 0,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "howworks",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "LYgHw4qqHR": {
      "type": {
        "resolvedName": "Interactive"
      },
      "isCanvas": false,
      "props": {
        "name": "",
        "title": "Interactive Element",
        "description": "Select an interactive element from the settings panel",
        "iconUrl": "",
        "margin": [
          "0",
          "0",
          "0",
          "0"
        ],
        "titleTextColor": {
          "light": {
            "r": 44,
            "g": 62,
            "b": 80,
            "a": 1
          },
          "dark": {
            "r": 241,
            "g": 245,
            "b": 249,
            "a": 1
          }
        },
        "buttonColor": {
          "light": {
            "r": 15,
            "g": 118,
            "b": 110,
            "a": 1
          },
          "dark": {
            "r": 20,
            "g": 184,
            "b": 166,
            "a": 1
          }
        },
        "primaryBackgroundColor": {
          "light": {
            "r": 248,
            "g": 249,
            "b": 250,
            "a": 1
          },
          "dark": {
            "r": 30,
            "g": 41,
            "b": 59,
            "a": 1
          }
        },
        "secondaryBackgroundColor": {
          "light": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          },
          "dark": {
            "r": 15,
            "g": 23,
            "b": 42,
            "a": 1
          }
        },
        "autoConvertColors": true
      },
      "displayName": "Interactive",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "ryZpE8aN63": {
      "type": {
        "resolvedName": "Collapsible Section"
      },
      "isCanvas": true,
      "props": {
        "background": {
          "light": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          },
          "dark": {
            "r": 31,
            "g": 41,
            "b": 55,
            "a": 1
          }
        },
        "color": {
          "light": {
            "r": 51,
            "g": 51,
            "b": 51,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "padding": [
          "16",
          "0",
          "16",
          "0"
        ],
        "margin": [
          0,
          0,
          0,
          0
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 255,
              "g": 255,
              "b": 255,
              "a": 0.15
            }
          }
        },
        "radius": 4,
        "border": {
          "style": "solid",
          "width": 1,
          "color": {
            "light": {
              "r": 204,
              "g": 204,
              "b": 204,
              "a": 1
            },
            "dark": {
              "r": 75,
              "g": 85,
              "b": 99,
              "a": 1
            }
          }
        },
        "width": "100%",
        "height": "auto",
        "title": "Detailed Explanation",
        "stepsEnabled": false,
        "numberOfSteps": 3,
        "headerBackground": {
          "light": {
            "r": 245,
            "g": 247,
            "b": 250,
            "a": 1
          },
          "dark": {
            "r": 51,
            "g": 65,
            "b": 85,
            "a": 1
          }
        },
        "headerTextColor": {
          "light": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "headerFontSize": 16,
        "expanded": true,
        "currentStep": 1,
        "stepButtonColor": {
          "light": {
            "r": 15,
            "g": 118,
            "b": 110,
            "a": 1
          },
          "dark": {
            "r": 20,
            "g": 184,
            "b": 166,
            "a": 1
          }
        },
        "stepIndicatorColor": {
          "light": {
            "r": 15,
            "g": 118,
            "b": 110,
            "a": 1
          },
          "dark": {
            "r": 20,
            "g": 184,
            "b": 166,
            "a": 1
          }
        },
        "autoConvertColors": true
      },
      "displayName": "CollapsibleSection",
      "custom": {
        "isCanvas": false
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["detailedExplanationText"],
      "linkedNodes": {
        "content-canvas": "zo-19V0rON"
      }
    },
    "NlbpMQb4tv": {
      "type": {
        "resolvedName": "Collapsible Section"
      },
      "isCanvas": true,
      "props": {
        "background": {
          "light": {
            "r": 255,
            "g": 255,
            "b": 255,
            "a": 1
          },
          "dark": {
            "r": 31,
            "g": 41,
            "b": 55,
            "a": 1
          }
        },
        "color": {
          "light": {
            "r": 51,
            "g": 51,
            "b": 51,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "padding": [
          "16",
          "0",
          "16",
          "0"
        ],
        "margin": [
          0,
          0,
          0,
          0
        ],
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0,
          "color": {
            "light": {
              "r": 0,
              "g": 0,
              "b": 0,
              "a": 0.15
            },
            "dark": {
              "r": 255,
              "g": 255,
              "b": 255,
              "a": 0.15
            }
          }
        },
        "radius": 4,
        "border": {
          "style": "solid",
          "width": 1,
          "color": {
            "light": {
              "r": 204,
              "g": 204,
              "b": 204,
              "a": 1
            },
            "dark": {
              "r": 75,
              "g": 85,
              "b": 99,
              "a": 1
            }
          }
        },
        "width": "100%",
        "height": "auto",
        "title": "Practice Examples",
        "stepsEnabled": false,
        "numberOfSteps": 3,
        "headerBackground": {
          "light": {
            "r": 245,
            "g": 247,
            "b": 250,
            "a": 1
          },
          "dark": {
            "r": 51,
            "g": 65,
            "b": 85,
            "a": 1
          }
        },
        "headerTextColor": {
          "light": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "headerFontSize": 16,
        "expanded": false,
        "currentStep": 1,
        "stepButtonColor": {
          "light": {
            "r": 15,
            "g": 118,
            "b": 110,
            "a": 1
          },
          "dark": {
            "r": 20,
            "g": 184,
            "b": 166,
            "a": 1
          }
        },
        "stepIndicatorColor": {
          "light": {
            "r": 15,
            "g": 118,
            "b": 110,
            "a": 1
          },
          "dark": {
            "r": 20,
            "g": 184,
            "b": 166,
            "a": 1
          }
        },
        "autoConvertColors": true
      },
      "displayName": "CollapsibleSection",
      "custom": {
        "isCanvas": false
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["practiceContent"],
      "linkedNodes": {
        "content-canvas": "practiceCanvas"
      }
    },
    "practiceContent": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 75,
            "g": 85,
            "b": 99,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": ["0", "0", "0", "0"],
        "padding": ["0", "0", "0", "0"],
        "text": "Practice Section Components:\n\n• Add Tables for example problems\n• Include Images for visual exercises\n• Use Containers to group related practice items\n• Create Tabs for different difficulty levels\n\nTip: Enable Steps mode to create guided practice exercises with progressive difficulty.\n\nExample Practice Format:\n1. Scenario: [Example scenario description]\n   • Step 1: Initial approach\n   • Step 2: Implementation details\n   • Step 3: Testing and validation\n   Solution: [Detailed solution walkthrough]\n\n2. Challenge Problem:\n   [Problem description]\n   Hint: Start by identifying key components\n\nNote: You can include any combination of components to create engaging practice materials."
      },
      "displayName": "Text",
      "custom": {},
      "parent": "practiceCanvas",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "practiceCanvas": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-container is-canvas collapsible-section-canvas",
        "style": {
          "width": "100%",
          "position": "relative",
          "minHeight": "100px",
          "border": "none"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "NlbpMQb4tv",
      "hidden": false,
      "nodes": ["practiceContent"],
      "linkedNodes": {}
    },
    "detailedExplanationText": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 75,
            "g": 85,
            "b": 99,
            "a": 1
          },
          "dark": {
            "r": 229,
            "g": 231,
            "b": 235,
            "a": 1
          }
        },
        "margin": ["0", "0", "16", "0"],
        "padding": ["0", "0", "0", "0"],
        "text": "Components for Detailed Explanations:\n\n• Add Tables to organize complex information\n• Include Images to illustrate key concepts\n• Use Tabs to separate different topics\n• Create Containers to group related content\n\nTip: Enable Steps mode to create guided learning paths with progressive content disclosure.\n\nExample Section Organization:\n1. Topic Introduction\n   • Key definitions\n   • Core concepts\n   • Visual aids\n   Solution: Real-world applications\n\n2. Detailed Breakdown:\n   • Technical concepts\n   • Component interactions\n   • Best practices\n\nNote: Use any combination of components to create clear, structured explanations."
      },
      "displayName": "Text",
      "custom": {},
      "parent": "zo-19V0rON",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "zo-19V0rON": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-container is-canvas collapsible-section-canvas",
        "style": {
          "width": "100%",
          "position": "relative",
          "minHeight": "100px",
          "border": "none"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "ryZpE8aN63",
      "hidden": false,
      "nodes": ["detailedExplanationText"],
      "linkedNodes": {}
    }
  })
};

export default interactiveLearningTemplate;
