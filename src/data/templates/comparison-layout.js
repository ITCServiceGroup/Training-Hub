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
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "UoWqSCVHCh",
      "1IDpL0fqku",
      "w7y4G8wAtO",
      "mJfvyjQjx0",
      "0HIeCt4dst"
    ],
    "linkedNodes": {}
  },
  "title": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 30,
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "bold",
      "color": {
        "light": {
          "r": 31,
          "g": 41,
          "b": 55,
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 137,
          "g": 165,
          "b": 206,
          "a": 1
        },
        "dark": {
          "r": 50,
          "g": 95,
          "b": 161,
          "a": 1
        }
      },
      "shadow": {
        "enabled": true,
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
      "fontSize": 24,
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "fontWeight": "700",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 127,
          "g": 222,
          "b": 160,
          "a": 1
        },
        "dark": {
          "r": 26,
          "g": 182,
          "b": 80,
          "a": 1
        }
      },
      "shadow": {
        "enabled": true,
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
      "fontSize": 24,
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "fontWeight": "700",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "fontWeight": "700",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "fontWeight": "700",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 206,
          "g": 158,
          "b": 127,
          "a": 1
        },
        "dark": {
          "r": 169,
          "g": 95,
          "b": 47,
          "a": 1
        }
      },
      "shadow": {
        "enabled": true,
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
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
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
      "fontSize": 24,
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "2WYtXRwLAU",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "w7y4G8wAtO": {
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
          "r": 180,
          "g": 224,
          "b": 255,
          "a": 1
        },
        "dark": {
          "r": 12,
          "g": 95,
          "b": 153,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "100%",
      "height": "auto",
      "autoConvertColors": true
    },
    "displayName": "Container",
    "custom": {
      "isCanvas": true
    },
    "parent": "ROOT",
    "hidden": false,
    "nodes": [
      "-zxni4Q7dC",
      "f6EmUca_bn",
      "7XdEAg1APy",
      "Tq56Z3j0b5"
    ],
    "linkedNodes": {}
  },
  "-zxni4Q7dC": {
    "type": {
      "resolvedName": "Container"
    },
    "isCanvas": true,
    "props": {
      "flexDirection": "column",
      "alignItems": "flex-start",
      "justifyContent": "flex-start",
      "padding": [
        "10",
        "10",
        "10",
        "10"
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "23%",
      "height": "auto",
      "autoConvertColors": true
    },
    "displayName": "Container",
    "custom": {
      "isCanvas": true
    },
    "parent": "w7y4G8wAtO",
    "hidden": false,
    "nodes": [
      "1T9LiccELG",
      "lKOgzEqX3Q"
    ],
    "linkedNodes": {}
  },
  "1T9LiccELG": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "18",
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 1",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "-zxni4Q7dC",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "lKOgzEqX3Q": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "14",
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250292864,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "-zxni4Q7dC",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "f6EmUca_bn": {
    "type": {
      "resolvedName": "Container"
    },
    "isCanvas": true,
    "props": {
      "flexDirection": "column",
      "alignItems": "flex-start",
      "justifyContent": "flex-start",
      "padding": [
        "10",
        "10",
        "10",
        "10"
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "23%",
      "height": "auto",
      "autoConvertColors": true
    },
    "displayName": "Container",
    "custom": {
      "isCanvas": true
    },
    "parent": "w7y4G8wAtO",
    "hidden": false,
    "nodes": [
      "OgASGpAetc",
      "IxKbwoWWJm"
    ],
    "linkedNodes": {}
  },
  "OgASGpAetc": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "18",
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 2",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "f6EmUca_bn",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "IxKbwoWWJm": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "14",
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250313722,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "f6EmUca_bn",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "7XdEAg1APy": {
    "type": {
      "resolvedName": "Container"
    },
    "isCanvas": true,
    "props": {
      "flexDirection": "column",
      "alignItems": "flex-start",
      "justifyContent": "flex-start",
      "padding": [
        "10",
        "10",
        "10",
        "10"
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "23%",
      "height": "auto",
      "autoConvertColors": true
    },
    "displayName": "Container",
    "custom": {
      "isCanvas": true
    },
    "parent": "w7y4G8wAtO",
    "hidden": false,
    "nodes": [
      "d89bJtebIl",
      "57NSoZWBh4"
    ],
    "linkedNodes": {}
  },
  "d89bJtebIl": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "18",
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 3",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "7XdEAg1APy",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "57NSoZWBh4": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "14",
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250863468,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "7XdEAg1APy",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "Tq56Z3j0b5": {
    "type": {
      "resolvedName": "Container"
    },
    "isCanvas": true,
    "props": {
      "flexDirection": "column",
      "alignItems": "flex-start",
      "justifyContent": "flex-start",
      "padding": [
        "10",
        "10",
        "10",
        "10"
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "solid",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "23%",
      "height": "auto",
      "autoConvertColors": true
    },
    "displayName": "Container",
    "custom": {
      "isCanvas": true
    },
    "parent": "w7y4G8wAtO",
    "hidden": false,
    "nodes": [
      "mtH8qJaWdS",
      "QX1jvItFEu"
    ],
    "linkedNodes": {}
  },
  "mtH8qJaWdS": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "18",
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 4",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "Tq56Z3j0b5",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "QX1jvItFEu": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": "14",
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250865697,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "Tq56Z3j0b5",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "1IDpL0fqku": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 30,
      "lineHeight": 1.5,
      "textAlign": "center",
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
      "text": "Option 2",
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
      "_lastUpdate": 1754249943268,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "ROOT",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "mJfvyjQjx0": {
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
        "19",
        "20",
        "19"
      ],
      "margin": [
        "0",
        "0",
        "0",
        "0"
      ],
      "background": {
        "light": {
          "r": 180,
          "g": 224,
          "b": 255,
          "a": 1
        },
        "dark": {
          "r": 12,
          "g": 95,
          "b": 153,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "4u12dgD1MJ",
      "2xyvu1UYSG"
    ],
    "linkedNodes": {}
  },
  "4u12dgD1MJ": {
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "49%",
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
    "parent": "mJfvyjQjx0",
    "hidden": false,
    "nodes": [
      "NGElyMW4_8",
      "cHabVNLQX3"
    ],
    "linkedNodes": {}
  },
  "NGElyMW4_8": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 18,
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 5",
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
      "_lastUpdate": 1754250723121,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "4u12dgD1MJ",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "cHabVNLQX3": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 14,
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250645737,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "4u12dgD1MJ",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "2xyvu1UYSG": {
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
      "width": "49%",
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
    "parent": "mJfvyjQjx0",
    "hidden": false,
    "nodes": [
      "ajnitMD3YB",
      "kZKMYp2HzN"
    ],
    "linkedNodes": {}
  },
  "ajnitMD3YB": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 18,
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "text": "Option 6",
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
      "_lastUpdate": 1754250723121,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "2xyvu1UYSG",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "kZKMYp2HzN": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 14,
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
      "text": "Benefit one\nBenefit two\nBenefit three\nBenefit four\nBenefit five",
      "listType": "bullet",
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
      "_lastUpdate": 1754250645737,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "2xyvu1UYSG",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "0HIeCt4dst": {
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
          "r": 180,
          "g": 224,
          "b": 255,
          "a": 1
        },
        "dark": {
          "r": 12,
          "g": 95,
          "b": 153,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
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
      "oBfrJlFp3H"
    ],
    "linkedNodes": {}
  },
  "oBfrJlFp3H": {
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
          "a": 0.6
        },
        "dark": {
          "r": 31,
          "g": 41,
          "b": 55,
          "a": 1
        }
      },
      "borderStyle": "none",
      "borderWidth": 1,
      "borderColor": {
        "light": {
          "r": 229,
          "g": 231,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 75,
          "g": 85,
          "b": 99,
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
      "radius": 8,
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
    "parent": "0HIeCt4dst",
    "hidden": false,
    "nodes": [
      "oaNQvILatg",
      "DACtBKV6Le"
    ],
    "linkedNodes": {}
  },
  "oaNQvILatg": {
    "type": {
      "resolvedName": "Text"
    },
    "isCanvas": false,
    "props": {
      "fontSize": 18,
      "lineHeight": 1.5,
      "textAlign": "center",
      "fontWeight": "700",
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
      "_lastUpdate": 0,
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "oBfrJlFp3H",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  },
  "DACtBKV6Le": {
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
      "text": "Text Block",
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
      "autoConvertColors": true,
      "enableFormatting": true,
      "linkColor": {
        "light": {
          "r": 59,
          "g": 130,
          "b": 246,
          "a": 1
        },
        "dark": {
          "r": 96,
          "g": 165,
          "b": 250,
          "a": 1
        }
      },
      "linkHoverColor": {
        "light": {
          "r": 37,
          "g": 99,
          "b": 235,
          "a": 1
        },
        "dark": {
          "r": 147,
          "g": 197,
          "b": 253,
          "a": 1
        }
      }
    },
    "displayName": "Text",
    "custom": {},
    "parent": "oBfrJlFp3H",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  }
})
};

export default comparisonLayoutTemplate;
