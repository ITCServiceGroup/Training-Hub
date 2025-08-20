/**
 * Toolbox component templates configuration
 * Defines all components and templates available in the toolbox
 */

// Basic Components
export const BASIC_COMPONENTS = [
  {
    id: 'container',
    title: 'Container',
    icon: 'FaSquare',
    props: {
      canvas: true,
      background: { r: 255, g: 255, b: 255, a: 1 },
      color: { r: 0, g: 0, b: 0, a: 1 },
      height: 'auto',
      width: '100%',
      padding: ['20', '20', '20', '20']
    }
  },
  {
    id: 'text',
    title: 'Text',
    icon: 'FaFont',
    props: {
      fontSize: '16',
      textAlign: 'left',
      text: 'Text Block'
    }
  },
  {
    id: 'image',
    title: 'Image',
    icon: 'FaImage',
    props: {
      src: 'https://placehold.co/300x200',
      alt: 'Placeholder'
    }
  },
  {
    id: 'video',
    title: 'Video',
    icon: 'FaPlay',
    props: {
      src: '',
      embedUrl: '',
      alt: 'Video',
      width: '100%',
      aspectRatio: '16/9',
      controls: true
    }
  },
  {
    id: 'icon',
    title: 'Icon',
    icon: 'FaStar',
    props: {
      iconName: 'star',
      iconSize: 60
    }
  },
  {
    id: 'button',
    title: 'Button',
    icon: 'FaMousePointer',
    props: {
      text: 'Click Me',
      size: 'medium',
      background: { 
        light: { r: 59, g: 130, b: 246, a: 1 }, 
        dark: { r: 96, g: 165, b: 250, a: 1 } 
      },
      hoverBackground: { 
        light: { r: 37, g: 99, b: 235, a: 1 }, 
        dark: { r: 59, g: 130, b: 246, a: 1 } 
      }
    }
  },
  {
    id: 'horizontal-line',
    title: 'Horizontal Line',
    icon: 'FaGripLines',
    props: {
      width: 'auto',
      thickness: 2,
      color: {
        light: { r: 156, g: 163, b: 175, a: 1 },
        dark: { r: 107, g: 114, b: 128, a: 1 }
      },
      alignment: 'center'
    }
  },
  {
    id: 'table',
    title: 'Table',
    icon: 'FaTable',
    props: {
      width: '100%',
      tableData: {
        cells: {},
        rowCount: 4,
        columnCount: 4,
        hasHeader: true
      }
    }
  },
  {
    id: 'collapsible-section',
    title: 'Collapsible Section',
    icon: 'FaChevronDown',
    props: {
      canvas: true,
      width: '100%',
      background: { r: 255, g: 255, b: 255, a: 1 },
      padding: ['16', '16', '16', '16'],
      title: 'Collapsible Section',
      stepsEnabled: false,
      numberOfSteps: 3
    }
  },
  {
    id: 'tabs',
    title: 'Tabs',
    icon: 'FaColumns',
    props: {
      canvas: true,
      width: '100%',
      background: { r: 255, g: 255, b: 255, a: 1 },
      padding: ['16', '16', '16', '16'],
      numberOfTabs: 3,
      tabTitles: ['Tab 1', 'Tab 2', 'Tab 3']
    }
  },
  {
    id: 'interactive',
    title: 'Interactive Element',
    icon: 'FaPuzzlePiece',
    props: {
      name: '',
      title: 'Interactive Element',
      description: 'Select an interactive element from the settings panel'
    }
  }
];

// Smart Templates
export const SMART_TEMPLATES = [
  {
    id: 'feature-card',
    title: 'Feature Card',
    icon: 'FaIdCard',
    children: [
      {
        component: 'Icon',
        props: {
          iconName: 'star',
          iconSize: 64,
          iconAlign: 'center',
          margin: ['0', '0', '16', '0'],
          iconColor: { 
            light: { r: 59, g: 130, b: 246, a: 1 }, 
            dark: { r: 96, g: 165, b: 250, a: 1 } 
          }
        }
      },
      {
        component: 'Text',
        props: {
          fontSize: '20',
          fontWeight: '600',
          text: 'Feature Title',
          textAlign: 'center',
          margin: ['0', '0', '12', '0']
        }
      },
      {
        component: 'Text',
        props: {
          fontSize: '16',
          text: 'Describe your feature here.',
          textAlign: 'center',
          margin: ['0', '0', '20', '0']
        }
      },
      {
        component: 'Button',
        props: {
          text: 'Learn More',
          size: 'medium',
          background: { 
            light: { r: 59, g: 130, b: 246, a: 1 }, 
            dark: { r: 96, g: 165, b: 250, a: 1 } 
          },
          hoverBackground: { 
            light: { r: 37, g: 99, b: 235, a: 1 }, 
            dark: { r: 59, g: 130, b: 246, a: 1 } 
          }
        }
      }
    ],
    containerProps: {
      canvas: true,
      background: { 
        light: { r: 255, g: 255, b: 255, a: 1 }, 
        dark: { r: 31, g: 41, b: 55, a: 1 } 
      },
      padding: ['24', '24', '24', '24'],
      radius: 8,
      shadow: { 
        enabled: true, 
        x: 0, 
        y: 2, 
        blur: 8, 
        spread: 0, 
        color: { r: 0, g: 0, b: 0, a: 0.1 } 
      },
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: { 
        light: { r: 229, g: 231, b: 235, a: 1 }, 
        dark: { r: 75, g: 85, b: 99, a: 1 } 
      },
      alignItems: 'center',
      width: '100%'
    }
  },
  {
    id: 'hero-section',
    title: 'Hero Section',
    icon: 'FaRegStar',
    children: [
      {
        component: 'Text',
        props: {
          fontSize: '48',
          fontWeight: '700',
          text: 'Your Amazing Headline',
          textAlign: 'center',
          margin: ['0', '0', '16', '0']
        }
      },
      {
        component: 'Text',
        props: {
          fontSize: '20',
          text: 'Supporting text that explains your value proposition.',
          textAlign: 'center',
          margin: ['0', '0', '32', '0']
        }
      },
      {
        component: 'Button',
        props: {
          text: 'Get Started',
          size: 'large',
          background: { 
            light: { r: 59, g: 130, b: 246, a: 1 }, 
            dark: { r: 96, g: 165, b: 250, a: 1 } 
          },
          hoverBackground: { 
            light: { r: 37, g: 99, b: 235, a: 1 }, 
            dark: { r: 59, g: 130, b: 246, a: 1 } 
          }
        }
      }
    ],
    containerProps: {
      canvas: true,
      background: { 
        light: { r: 248, g: 250, b: 252, a: 1 }, 
        dark: { r: 15, g: 23, b: 42, a: 1 } 
      },
      padding: ['60', '40', '60', '40'],
      width: '100%',
      alignItems: 'center'
    }
  },
  {
    id: 'steps',
    title: 'Steps',
    icon: 'FaListOl',
    children: [
      {
        component: 'Container',
        props: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: ['20', '20', '20', '20'],
          margin: ['0', '0', '0', '0'],
          background: { r: 255, g: 255, b: 255, a: 1 },
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: { r: 229, g: 231, b: 235, a: 1 },
          shadow: {
            enabled: false,
            x: 0,
            y: 4,
            blur: 8,
            spread: 0,
            color: { r: 0, g: 0, b: 0, a: 0.15 }
          },
          radius: 8,
          width: '100%',
          height: 'auto',
          autoConvertColors: true
        },
        children: [
          {
            component: 'Container',
            props: {
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              padding: ['0', '20', '0', '20'],
              margin: ['0', '0', '0', '0'],
              background: { r: 255, g: 255, b: 255, a: 1 },
              borderStyle: 'none',
              borderWidth: 1,
              borderColor: { r: 229, g: 231, b: 235, a: 1 },
              shadow: {
                enabled: false,
                x: 0,
                y: 4,
                blur: 8,
                spread: 0,
                color: { r: 0, g: 0, b: 0, a: 0.15 }
              },
              radius: 0,
              width: '100%',
              height: 'auto',
              autoConvertColors: true
            },
            children: [
              {
                component: 'Container',
                props: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: ['0', '0', '0', '0'],
                  margin: ['0', '16', '0', '0'],
                  background: { r: 59, g: 130, b: 246, a: 1 },
                  borderStyle: 'none',
                  borderWidth: 1,
                  borderColor: { r: 229, g: 231, b: 235, a: 1 },
                  shadow: {
                    enabled: false,
                    x: 0,
                    y: 4,
                    blur: 8,
                    spread: 0,
                    color: { r: 0, g: 0, b: 0, a: 0.15 }
                  },
                  radius: 30,
                  width: '60px',
                  height: '60px',
                  autoConvertColors: true
                },
                children: [
                  {
                    component: 'Text',
                    props: {
                      fontSize: '24',
                      lineHeight: 1.5,
                      textAlign: 'center',
                      fontWeight: '700',
                      color: { r: 255, g: 255, b: 255, a: 1 },
                      margin: ['0', '0', '0', '0'],
                      padding: ['0', '0', '0', '0'],
                      shadow: {
                        enabled: false,
                        x: 0,
                        y: 2,
                        blur: 4,
                        spread: 0,
                        color: { r: 0, g: 0, b: 0, a: 0.15 }
                      },
                      text: '1',
                      autoConvertColors: true,
                      enableFormatting: true,
                      linkColor: { r: 59, g: 130, b: 246, a: 1 },
                      linkHoverColor: { r: 37, g: 99, b: 235, a: 1 }
                    }
                  }
                ]
              },
              {
                component: 'Container',
                props: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: ['0', '0', '0', '5'],
                  margin: ['0', '0', '0', '0'],
                  background: { r: 255, g: 255, b: 255, a: 1 },
                  borderStyle: 'none',
                  borderWidth: 1,
                  borderColor: { r: 229, g: 231, b: 235, a: 1 },
                  shadow: {
                    enabled: false,
                    x: 0,
                    y: 4,
                    blur: 8,
                    spread: 0,
                    color: { r: 0, g: 0, b: 0, a: 0.15 }
                  },
                  radius: 0,
                  width: '30%',
                  height: 'auto',
                  autoConvertColors: true
                },
                children: [
                  {
                    component: 'Text',
                    props: {
                      fontSize: 22,
                      lineHeight: 1,
                      textAlign: 'left',
                      fontWeight: '600',
                      color: { r: 92, g: 90, b: 90, a: 1 },
                      margin: ['0', '0', 0, '0'],
                      padding: ['0', '0', '0', '0'],
                      shadow: {
                        enabled: false,
                        x: 0,
                        y: 2,
                        blur: 4,
                        spread: 0,
                        color: { r: 0, g: 0, b: 0, a: 0.15 }
                      },
                      text: 'Step Title',
                      autoConvertColors: true,
                      enableFormatting: true,
                      linkColor: { r: 59, g: 130, b: 246, a: 1 },
                      linkHoverColor: { r: 37, g: 99, b: 235, a: 1 }
                    }
                  },
                  {
                    component: 'Text',
                    props: {
                      fontSize: 18,
                      lineHeight: 1.1,
                      textAlign: 'left',
                      fontWeight: '500',
                      color: { r: 92, g: 90, b: 90, a: 1 },
                      margin: ['0', '0', '0', '0'],
                      padding: ['0', '0', '0', '0'],
                      shadow: {
                        enabled: false,
                        x: 0,
                        y: 2,
                        blur: 4,
                        spread: 0,
                        color: { r: 0, g: 0, b: 0, a: 0.15 }
                      },
                      text: 'Describe this step in your process or tutorial.',
                      autoConvertColors: true,
                      enableFormatting: true,
                      linkColor: { r: 59, g: 130, b: 246, a: 1 },
                      linkHoverColor: { r: 37, g: 99, b: 235, a: 1 }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    containerProps: {
      canvas: true,
      background: {
        light: { r: 255, g: 255, b: 255, a: 1 },
        dark: { r: 31, g: 41, b: 55, a: 1 }
      },
      padding: ['0', '0', '0', '0'],
      radius: 0,
      shadow: {
        enabled: false,
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0 }
      },
      borderStyle: 'none',
      borderWidth: 0,
      borderColor: {
        light: { r: 229, g: 231, b: 235, a: 1 },
        dark: { r: 75, g: 85, b: 99, a: 1 }
      },
      width: '100%'
    }
  },
  {
    id: 'two-column',
    title: 'Two Column Layout',
    icon: 'Columns2Icon',
    children: [
      {
        component: 'Container',
        props: {
          canvas: true,
          width: '48%',
          padding: ['0', '8', '0', '8'],
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: { 
            light: { r: 229, g: 231, b: 235, a: 1 }, 
            dark: { r: 75, g: 85, b: 99, a: 1 } 
          }
        },
        children: [
          {
            component: 'Text',
            props: {
              fontSize: '24',
              fontWeight: '600',
              text: 'Left Column',
              margin: ['0', '0', '16', '0']
            }
          },
          {
            component: 'Text',
            props: {
              fontSize: '16',
              text: 'Content for the left column.'
            }
          }
        ]
      },
      {
        component: 'Container',
        props: {
          canvas: true,
          width: '48%',
          padding: ['0', '8', '0', '8'],
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: { 
            light: { r: 229, g: 231, b: 235, a: 1 }, 
            dark: { r: 75, g: 85, b: 99, a: 1 } 
          }
        },
        children: [
          {
            component: 'Text',
            props: {
              fontSize: '24',
              fontWeight: '600',
              text: 'Right Column',
              margin: ['0', '0', '16', '0']
            }
          },
          {
            component: 'Text',
            props: {
              fontSize: '16',
              text: 'Content for the right column.'
            }
          }
        ]
      }
    ],
    containerProps: {
      canvas: true,
      flexDirection: 'row',
      width: '100%',
      padding: ['20', '20', '20', '20'],
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  },
  {
    id: 'three-column',
    title: 'Three Column Layout',
    icon: 'Columns3Icon',
    children: Array.from({ length: 3 }, (_, i) => ({
      component: 'Container',
      props: {
        canvas: true,
        width: '32%',
        padding: ['0', '8', '0', '8'],
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: { 
          light: { r: 229, g: 231, b: 235, a: 1 }, 
          dark: { r: 75, g: 85, b: 99, a: 1 } 
        }
      },
      children: [
        {
          component: 'Text',
          props: {
            fontSize: '20',
            fontWeight: '600',
            text: `Column ${i + 1}`,
            margin: ['0', '0', '12', '0']
          }
        },
        {
          component: 'Text',
          props: {
            fontSize: '16',
            text: `${['First', 'Second', 'Third'][i]} column content.`
          }
        }
      ]
    })),
    containerProps: {
      canvas: true,
      flexDirection: 'row',
      width: '100%',
      padding: ['20', '20', '20', '20'],
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  },
  {
    id: 'four-column',
    title: 'Four Column Layout',
    icon: 'Columns4Icon',
    children: Array.from({ length: 4 }, (_, i) => ({
      component: 'Container',
      props: {
        canvas: true,
        width: '23%',
        padding: ['0', '8', '0', '8'],
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: { 
          light: { r: 229, g: 231, b: 235, a: 1 }, 
          dark: { r: 75, g: 85, b: 99, a: 1 } 
        }
      },
      children: [
        {
          component: 'Text',
          props: {
            fontSize: '18',
            fontWeight: '600',
            text: `Column ${i + 1}`,
            margin: ['0', '0', '12', '0']
          }
        },
        {
          component: 'Text',
          props: {
            fontSize: '14',
            text: `${['First', 'Second', 'Third', 'Fourth'][i]} column.`
          }
        }
      ]
    })),
    containerProps: {
      canvas: true,
      flexDirection: 'row',
      width: '100%',
      padding: ['20', '20', '20', '20'],
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }
];

// Icon mappings for templates
export const ICON_IMPORTS = {
  'FaFont': 'FaFont',
  'FaSquare': 'FaSquare', 
  'FaImage': 'FaImage',
  'FaPlay': 'FaPlay',
  'FaStar': 'FaStar',
  'FaPuzzlePiece': 'FaPuzzlePiece',
  'FaTable': 'FaTable',
  'FaChevronDown': 'FaChevronDown',
  'FaColumns': 'FaColumns',
  'FaRegStar': 'FaRegStar',
  'FaListOl': 'FaListOl',
  'FaIdCard': 'FaIdCard',
  'FaMousePointer': 'FaMousePointer',
  'FaGripLines': 'FaGripLines',
  'BsLayoutThreeColumns': 'BsLayoutThreeColumns',
  'HiViewColumns': 'HiViewColumns'
};