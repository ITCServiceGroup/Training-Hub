/**
 * Comparison Layout Template
 * Perfect for comparing different concepts, products, or approaches side by side
 */

export const comparisonLayoutTemplate = {
  id: 'system-comparison-layout',
  name: 'Comparison Layout',
  description: 'Perfect for comparing different concepts, products, or approaches side by side',
  category: 'Layout',
  tags: ['comparison', 'layout', 'analysis', 'side-by-side'],
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
        "intro",
        "comparison",
        "UoWqSCVHCh"
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
        "textAlign": "center",
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
        "text": "Comparison Analysis",
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
    "intro": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "center",
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
          "24",
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
        "text": "This template helps you compare different options, concepts, or approaches in a clear and organized manner.",
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
    "comparison": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "flexDirection": "row",
        "alignItems": "flex-start",
        "justifyContent": "space-between",
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
        "autoConvertColors": true,
        "borderRadius": "8px",
        "display": "grid",
        "gridTemplateColumns": "1fr 1fr",
        "gap": "20px"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": [
        "option1",
        "option2"
      ],
      "linkedNodes": {}
    },
    "option1": {
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
          "0",
          "0"
        ],
        "background": {
          "light": {
            "r": 219,
            "g": 234,
            "b": 254,
            "a": 1
          },
          "dark": {
            "r": 11,
            "g": 64,
            "b": 135,
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
        "width": "48%",
        "height": "auto",
        "autoConvertColors": true,
        "borderRadius": "8px",
        "border": "2px solid #3b82f6"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "comparison",
      "hidden": false,
      "nodes": [
        "option1title",
        "option1pros",
        "CyCJtgQXt6",
        "37_l7seMOh",
        "option1cons"
      ],
      "linkedNodes": {}
    },
    "option1title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 22,
        "lineHeight": 1.5,
        "textAlign": "center",
        "fontWeight": "600",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
        "text": "Option A",
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
      "parent": "option1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "option1pros": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 18,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          0,
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
        "text": "Advantages:",
        "listType": "none",
        "inTable": false,
        "hasIcon": true,
        "iconName": "check",
        "iconColor": {
          "light": {
            "r": 53,
            "g": 190,
            "b": 26,
            "a": 1
          },
          "dark": {
            "r": 56,
            "g": 219,
            "b": 24,
            "a": 1
          }
        },
        "_lastUpdate": 1748362957317,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "option1cons": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 16,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          20
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
        "text": "• Limitation one\n• Limitation two",
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
        "_lastUpdate": 1748363172968,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "option2": {
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
          "0",
          "0"
        ],
        "background": {
          "light": {
            "r": 220,
            "g": 252,
            "b": 231,
            "a": 1
          },
          "dark": {
            "r": 11,
            "g": 136,
            "b": 54,
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
        "width": "48%",
        "height": "auto",
        "autoConvertColors": true,
        "borderRadius": "8px",
        "border": "2px solid #22c55e"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "comparison",
      "hidden": false,
      "nodes": [
        "option2title",
        "czvHTnnO4t",
        "option2pros",
        "nOEBg4vkvs",
        "option2cons"
      ],
      "linkedNodes": {}
    },
    "option2title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 22,
        "lineHeight": 1.5,
        "textAlign": "center",
        "fontWeight": "600",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
        "text": "Option B",
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
      "parent": "option2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "option2pros": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 16,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          20
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
        "text": "• Benefit one\n• Benefit two\n• Benefit three",
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
        "_lastUpdate": 1748363047898,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "option2cons": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 16,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          20
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
        "text": "• Limitation one\n• Limitation two",
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
        "_lastUpdate": 1748363177193,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "CyCJtgQXt6": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 16,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          20
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
        "text": "• Benefit one\n• Benefit two\n• Benefit three",
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
        "_lastUpdate": 1748362962236,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "czvHTnnO4t": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 18,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          0,
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
        "text": "Advantages:",
        "listType": "none",
        "inTable": false,
        "hasIcon": true,
        "iconName": "check",
        "iconColor": {
          "light": {
            "r": 53,
            "g": 190,
            "b": 26,
            "a": 1
          },
          "dark": {
            "r": 56,
            "g": 219,
            "b": 24,
            "a": 1
          }
        },
        "_lastUpdate": 1748362957317,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "nOEBg4vkvs": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 18,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          0,
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
        "text": "Disadvantages:",
        "listType": "none",
        "inTable": false,
        "hasIcon": true,
        "iconName": "error",
        "iconColor": {
          "light": {
            "r": 190,
            "g": 26,
            "b": 26,
            "a": 1
          },
          "dark": {
            "r": 219,
            "g": 24,
            "b": 24,
            "a": 1
          }
        },
        "_lastUpdate": 1748362957317,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "37_l7seMOh": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 18,
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "400",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
          0,
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
        "text": "Disadvantages:",
        "listType": "none",
        "inTable": false,
        "hasIcon": true,
        "iconName": "error",
        "iconColor": {
          "light": {
            "r": 190,
            "g": 26,
            "b": 26,
            "a": 1
          },
          "dark": {
            "r": 219,
            "g": 24,
            "b": 24,
            "a": 1
          }
        },
        "_lastUpdate": 1748362957317,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "option1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "2WYtXRwLAU": {
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
            "r": 252,
            "g": 232,
            "b": 220,
            "a": 1
          },
          "dark": {
            "r": 136,
            "g": 58,
            "b": 11,
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
        "color": {
          "r": 0,
          "g": 0,
          "b": 0,
          "a": 1
        }
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "UoWqSCVHCh",
      "hidden": false,
      "nodes": [
        "t0WKJOfsh_",
        "jl6ZN3heTt"
      ],
      "linkedNodes": {}
    },
    "UoWqSCVHCh": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "flexDirection": "column",
        "alignItems": "flex-start",
        "justifyContent": "flex-start",
        "padding": [
          "0",
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
        "autoConvertColors": true,
        "color": {
          "r": 0,
          "g": 0,
          "b": 0,
          "a": 1
        }
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "ROOT",
      "hidden": false,
      "nodes": [
        "2WYtXRwLAU"
      ],
      "linkedNodes": {}
    },
    "jl6ZN3heTt": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "left",
        "fontWeight": "500",
        "color": {
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
        "text": "Based on the comparison above:\n\n• Each option has distinct advantages and limitations\n• Option A emphasizes [strengths]\n• Option B provides [strengths]\n• Consider your specific needs and requirements when choosing\n• Key factors to weigh: cost, implementation, and long-term benefits\n\nRemember: The best choice depends on your unique situation and goals.",
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
      "parent": "2WYtXRwLAU",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "t0WKJOfsh_": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": 22,
        "lineHeight": 1.5,
        "textAlign": "center",
        "fontWeight": "600",
        "color": {
          "light": {
            "r": 59,
            "g": 59,
            "b": 60,
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
        "text": "Summary",
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
        "_lastUpdate": 1748363835482,
        "autoConvertColors": true
      },
      "displayName": "Text",
      "custom": {},
      "parent": "2WYtXRwLAU",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  })
};

export default comparisonLayoutTemplate;
