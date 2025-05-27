/**
 * Step-by-Step Guide Template
 * A structured template for creating detailed step-by-step tutorials and procedures
 */

export const stepByStepGuideTemplate = {
  id: 'system-step-by-step-guide',
  name: 'Step-by-Step Guide',
  description: 'A structured template for creating detailed step-by-step tutorials and procedures',
  category: 'Educational',
  tags: ['tutorial', 'steps', 'procedure', 'guide'],
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
        "WW-tI-KaFS"
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
        "text": "Step-by-Step Guide",
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
        "text": "This guide will walk you through the process step by step. Follow each step carefully to achieve the best results.",
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
    "step1": {
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
          "16",
          "0"
        ],
        "background": {
          "light": {
            "r": 240,
            "g": 249,
            "b": 255,
            "a": 1
          },
          "dark": {
            "r": 10,
            "g": 79,
            "b": 125,
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
        "border": "1px solid #0ea5e9"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "8_0nCXU_Ga",
      "hidden": false,
      "nodes": [
        "step1title",
        "step1content"
      ],
      "linkedNodes": {}
    },
    "step1title": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Step 1: Getting Started",
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
      "parent": "step1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step1content": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Begin by setting up your workspace and gathering all necessary materials. Make sure you have everything you need before proceeding to the next step.",
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
      "parent": "step1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step2": {
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
          "16",
          "0"
        ],
        "background": {
          "light": {
            "r": 240,
            "g": 253,
            "b": 244,
            "a": 1
          },
          "dark": {
            "r": 10,
            "g": 126,
            "b": 46,
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
        "border": "1px solid #22c55e"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "4PjduD2qy3",
      "hidden": false,
      "nodes": [
        "step2title",
        "step2content"
      ],
      "linkedNodes": {}
    },
    "step2title": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Step 2: Implementation",
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
      "parent": "step2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step2content": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Now that you're prepared, begin the main implementation process. Follow the instructions carefully and take your time to ensure accuracy.",
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
      "parent": "step2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step3": {
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
            "r": 254,
            "g": 252,
            "b": 232,
            "a": 1
          },
          "dark": {
            "r": 129,
            "g": 118,
            "b": 10,
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
        "border": "1px solid #eab308"
      },
      "displayName": "Container",
      "custom": {
        "isCanvas": true
      },
      "parent": "6k8yz7hQyN",
      "hidden": false,
      "nodes": [
        "step3title",
        "step3content"
      ],
      "linkedNodes": {}
    },
    "step3title": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Step 3: Verification and Testing",
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
      "parent": "step3",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "step3content": {
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
            "r": 57,
            "g": 57,
            "b": 57,
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
        "text": "Test your implementation to ensure everything is working correctly. Verify that all requirements have been met and make any necessary adjustments.",
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
      "parent": "step3",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "conclusion": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "fontSize": "16",
        "lineHeight": 1.5,
        "textAlign": "center",
        "fontWeight": "500",
        "color": {
          "light": {
            "r": 5,
            "g": 150,
            "b": 105,
            "a": 1
          },
          "dark": {
            "r": 23,
            "g": 203,
            "b": 147,
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
          "12",
          "12",
          "12",
          "12"
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
        "text": "Congratulations! You have successfully completed all the steps. Review your work and ensure everything meets the expected standards.",
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
        "background": {
          "r": 236,
          "g": 253,
          "b": 245,
          "a": 1
        },
        "borderRadius": "6px"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "3y8ivSfZC2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "WW-tI-KaFS": {
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
          "16",
          "16",
          "16"
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
        "title": "Collapsible Section with Steps Enabled",
        "stepsEnabled": true,
        "numberOfSteps": 4,
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
      "nodes": [],
      "linkedNodes": {
        "content-canvas": "Gz5g5Chd6J",
        "step-1-canvas": "8_0nCXU_Ga",
        "step-2-canvas": "4PjduD2qy3",
        "step-3-canvas": "6k8yz7hQyN",
        "step-4-canvas": "3y8ivSfZC2"
      }
    },
    "Gz5g5Chd6J": {
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
      "parent": "WW-tI-KaFS",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "8_0nCXU_Ga": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-step-content craft-container is-canvas collapsible-section-canvas",
        "style": {
          "minHeight": "100px",
          "width": "100%",
          "position": "relative",
          "border": "none",
          "borderRadius": "4px",
          "padding": "8px"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "WW-tI-KaFS",
      "hidden": false,
      "nodes": [
        "step1"
      ],
      "linkedNodes": {}
    },
    "4PjduD2qy3": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-step-content craft-container is-canvas collapsible-section-canvas",
        "style": {
          "minHeight": "100px",
          "width": "100%",
          "position": "relative",
          "border": "none",
          "borderRadius": "4px",
          "padding": "8px"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "WW-tI-KaFS",
      "hidden": false,
      "nodes": [
        "step2"
      ],
      "linkedNodes": {}
    },
    "6k8yz7hQyN": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-step-content craft-container is-canvas collapsible-section-canvas",
        "style": {
          "minHeight": "100px",
          "width": "100%",
          "position": "relative",
          "border": "none",
          "borderRadius": "4px",
          "padding": "8px"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "WW-tI-KaFS",
      "hidden": false,
      "nodes": [
        "step3"
      ],
      "linkedNodes": {}
    },
    "3y8ivSfZC2": {
      "type": "div",
      "isCanvas": true,
      "props": {
        "className": "craft-step-content craft-container is-canvas collapsible-section-canvas",
        "style": {
          "minHeight": "100px",
          "width": "100%",
          "position": "relative",
          "border": "none",
          "borderRadius": "4px",
          "padding": "8px"
        }
      },
      "displayName": "div",
      "custom": {},
      "parent": "WW-tI-KaFS",
      "hidden": false,
      "nodes": [
        "conclusion"
      ],
      "linkedNodes": {}
    }
  })
};

export default stepByStepGuideTemplate;
