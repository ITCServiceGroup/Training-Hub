import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TemplatePreview = ({ content, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create a more representative wireframe
  const createSimpleWireframe = () => {
    return [
      { type: 'text', isHeading: true, text: 'Main Heading' },
      { type: 'text', isHeading: false, text: 'Introduction paragraph with multiple lines of content that explains the topic and provides context for the learning material.' },
      { type: 'text', isHeading: true, text: 'Section Title', size: 'medium' },
      { type: 'container', backgroundColor: '#e3f2fd', children: [
        { type: 'text', isHeading: true, text: 'Key Concepts:', size: 'small' },
        { type: 'text', isHeading: false, text: '• Important point one' },
        { type: 'text', isHeading: false, text: '• Important point two' },
        { type: 'text', isHeading: false, text: '• Important point three' }
      ]},
      { type: 'container', backgroundColor: '#f3e5f5', children: [
        { type: 'text', isHeading: true, text: 'How It Works:', size: 'small' },
        { type: 'text', isHeading: false, text: '• Step-by-step explanation' },
        { type: 'text', isHeading: false, text: '• Technical details and process' },
        { type: 'text', isHeading: false, text: '• Additional information' }
      ]},
      { type: 'interactive', subtype: 'simulator' },
      { type: 'text', isHeading: false, text: 'Conclusion paragraph that summarizes the key learning points.' }
    ];
  };

  // Parse the template content and create a wireframe representation
  const parseContent = (contentString) => {
    try {
      if (!contentString) {
        return createSimpleWireframe();
      }

      const parsed = typeof contentString === 'string' ? JSON.parse(contentString) : contentString;

      if (!parsed || !parsed.ROOT) {
        return createSimpleWireframe();
      }



      const components = [];

      // Recursively parse nodes
      const parseNode = (nodeId, depth = 0) => {
        const node = parsed[nodeId];
        if (!node) return null;

        const componentType = node.type?.resolvedName || 'Unknown';
        const props = node.props || {};

        // Create wireframe representation based on component type
        switch (componentType) {
          case 'Text':
            const fontSize = parseInt(props.fontSize) || 16;
            const fontWeight = props.fontWeight || '400';
            const text = props.text || 'Text';

            return {
              type: 'text',
              text: text,
              isHeading: fontSize > 18 || fontWeight === 'bold' || fontWeight === '600' || fontWeight === '700',
              size: fontSize > 24 ? 'large' : fontSize > 18 ? 'medium' : 'small',
              depth: depth || 0
            };

          case 'Button':
            return {
              type: 'button',
              text: props.text || 'Button',
              depth: depth || 0
            };

          case 'Image':
            return {
              type: 'image',
              width: props.width || '100%',
              height: props.height || '200px',
              depth: depth || 0
            };

          case 'Container':
            const children = node.nodes?.map(childId => parseNode(childId, depth + 1)).filter(Boolean) || [];
            const flexDirection = props.flexDirection || 'column';
            const gridTemplateColumns = props.gridTemplateColumns;
            const gap = props.gap || '0px';
            const background = props.background || props.backgroundColor;



            return {
              type: 'container',
              backgroundColor: background,
              padding: props.padding,
              children,
              depth: depth || 0,
              flexDirection: flexDirection,
              gridTemplateColumns: gridTemplateColumns,
              gap: gap,
              isGrid: !!gridTemplateColumns,
              isRow: flexDirection === 'row'
            };

          case 'Card':
            const cardChildren = node.nodes?.map(childId => parseNode(childId, depth + 1)).filter(Boolean) || [];
            return {
              type: 'card',
              children: cardChildren,
              depth: depth || 0
            };

          case 'Interactive':
          case 'OSTab':
          case 'TutorialButton':
          case 'Simulator':
            return {
              type: 'interactive',
              subtype: componentType.toLowerCase(),
              text: props.title || props.text || 'Interactive Element',
              depth: depth || 0
            };

          case 'Table':
            return {
              type: 'table',
              rows: 3,
              cols: 3,
              depth: depth || 0
            };

          case 'CollapsibleSection':
          case 'Collapsible Section':
            return {
              type: 'collapsible',
              content: 'Collapsible Section',
              depth: depth || 0
            };

          case 'Tabs':
            return {
              type: 'tabs',
              content: 'Tab Component',
              depth: depth || 0
            };

          default:
            return {
              type: 'unknown',
              content: componentType,
              depth: depth || 0
            };
        }
      };

      // Parse root nodes
      if (parsed.ROOT.nodes) {
        parsed.ROOT.nodes.forEach(nodeId => {
          const component = parseNode(nodeId, 0);
          if (component) {
            components.push(component);
          }
        });
      }

      return components;
    } catch (error) {
      console.error('Error parsing template content:', error);
      return createSimpleWireframe();
    }
  };

  const renderWireframe = (component, index) => {
    const baseClasses = `mb-1 rounded`;

    switch (component.type) {
      case 'text':
        const isHeading = component.isHeading;
        const size = component.size;
        let height = 'h-2';
        let width = '100%';

        if (isHeading) {
          if (size === 'large') {
            height = 'h-5';
            width = '70%';
          } else if (size === 'medium') {
            height = 'h-4';
            width = '75%';
          } else {
            height = 'h-3';
            width = '80%';
          }
        } else {
          // Show actual text content as mini preview
          const textLength = component.text?.length || 0;
          if (textLength > 100) {
            height = 'h-3'; // Multi-line text
          } else if (textLength > 50) {
            height = 'h-2'; // Medium text
          } else {
            height = 'h-2'; // Short text
          }

          // For text in containers, ensure it doesn't overflow
          if (component.depth > 0 || component.inGridContainer) {
            width = '95%'; // Leave some margin in containers
          }
        }

        // For grid containers, ensure content is properly centered
        const textStyle = {
          width: width,
          marginLeft: (component.depth === 0 || component.inGridContainer || component.parentIsGrid) ? 0 : (component.depth || 0) * 8
        };

        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-slate-600' : 'bg-gray-300'} ${height} max-w-full`}
            style={textStyle}
          />
        );

      case 'button':
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-blue-600' : 'bg-blue-400'} h-3`}
            style={{
              width: '60px',
              marginLeft: (component.depth === 0 || component.inGridContainer || component.parentIsGrid) ? 0 : (component.depth || 0) * 8
            }}
          />
        );

      case 'image':
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-slate-500' : 'bg-gray-400'} h-8 flex items-center justify-center`}
            style={{ marginLeft: (component.depth === 0 || component.inGridContainer || component.parentIsGrid) ? 0 : (component.depth || 0) * 8 }}
          >
            <div className={`w-4 h-4 ${isDark ? 'bg-slate-400' : 'bg-gray-300'} rounded`} />
          </div>
        );

      case 'container':
        const hasBackground = component.backgroundColor;
        let containerStyle = { marginLeft: component.depth === 0 ? 0 : (component.depth || 0) * 8 };
        let containerClasses = `${baseClasses} border p-1 overflow-hidden`;



        // Handle grid and row layouts - prioritize grid over flexbox
        if (component.gridTemplateColumns) {
          // For grid layouts, use CSS grid
          if (component.gridTemplateColumns === '1fr 1fr') {
            containerClasses += ' grid grid-cols-2 gap-1';
          } else {
            containerClasses += ' grid gap-1';
          }
        } else if (component.flexDirection === 'row') {
          // For row layouts, use flexbox
          containerClasses += ' flex flex-row gap-1';
        }

        // Enhanced background color detection with precise RGB matching
        if (hasBackground) {
          if (typeof hasBackground === 'object' && hasBackground.light) {
            // Handle light/dark theme objects
            const lightBg = hasBackground.light;
            if (lightBg.r !== undefined && lightBg.g !== undefined && lightBg.b !== undefined) {
              // Pure white containers: { r: 255, g: 255, b: 255 }
              if (lightBg.r === 255 && lightBg.g === 255 && lightBg.b === 255) {
                containerClasses += ` ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`;
              }
              // Exact match for Option A blue: { r: 219, g: 234, b: 254 }
              else if (lightBg.r === 219 && lightBg.g === 234 && lightBg.b === 254) {
                containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
              }
              // Exact match for Option B green: { r: 220, g: 252, b: 231 }
              else if (lightBg.r === 220 && lightBg.g === 252 && lightBg.b === 231) {
                containerClasses += ` ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'}`;
              }
              // Exact match for Summary orange: { r: 252, g: 232, b: 220 }
              else if (lightBg.r === 252 && lightBg.g === 232 && lightBg.b === 220) {
                containerClasses += ` ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
              }
              // Exact match for Interactive Learning keypoints blue: { r: 227, g: 242, b: 253 }
              else if (lightBg.r === 227 && lightBg.g === 242 && lightBg.b === 253) {
                containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
              }
              // Exact match for Interactive Learning howworks purple: { r: 243, g: 229, b: 245 }
              else if (lightBg.r === 243 && lightBg.g === 229 && lightBg.b === 245) {
                containerClasses += ` ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`;
              }
              // Fallback to range-based detection for other blue-ish colors
              else if (lightBg.r > 200 && lightBg.g > 230 && lightBg.b > 250) {
                containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
              }
              // Fallback to range-based detection for other green-ish colors
              else if (lightBg.r > 210 && lightBg.g > 240 && lightBg.b > 220) {
                containerClasses += ` ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'}`;
              }
              // Fallback to range-based detection for other orange-ish colors
              else if (lightBg.r > 240 && lightBg.g > 220 && lightBg.b > 210) {
                containerClasses += ` ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
              }
              // Fallback to range-based detection for other purple-ish colors
              else if (lightBg.r > 230 && lightBg.g > 220 && lightBg.b > 240) {
                containerClasses += ` ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`;
              }
              else {
                containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
              }
            }
          } else if (typeof hasBackground === 'object' && hasBackground.r !== undefined && hasBackground.g !== undefined && hasBackground.b !== undefined) {
            // Direct RGBA object - exact matches first
            // Pure white containers: { r: 255, g: 255, b: 255 }
            if (hasBackground.r === 255 && hasBackground.g === 255 && hasBackground.b === 255) {
              containerClasses += ` ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`;
            }
            // Comparison template colors
            else if (hasBackground.r === 219 && hasBackground.g === 234 && hasBackground.b === 254) {
              containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
            }
            else if (hasBackground.r === 220 && hasBackground.g === 252 && hasBackground.b === 231) {
              containerClasses += ` ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'}`;
            }
            else if (hasBackground.r === 252 && hasBackground.g === 232 && hasBackground.b === 220) {
              containerClasses += ` ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
            }
            // Interactive Learning template colors
            else if (hasBackground.r === 227 && hasBackground.g === 242 && hasBackground.b === 253) {
              containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
            }
            else if (hasBackground.r === 243 && hasBackground.g === 229 && hasBackground.b === 245) {
              containerClasses += ` ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`;
            }
            // Fallback to range-based detection
            else if (hasBackground.r > 200 && hasBackground.g > 230 && hasBackground.b > 250) {
              containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
            }
            else if (hasBackground.r > 210 && hasBackground.g > 240 && hasBackground.b > 220) {
              containerClasses += ` ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'}`;
            }
            else if (hasBackground.r > 240 && hasBackground.g > 220 && hasBackground.b > 210) {
              containerClasses += ` ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
            }
            else if (hasBackground.r > 230 && hasBackground.g > 220 && hasBackground.b > 240) {
              containerClasses += ` ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`;
            }
            else {
              containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
            }
          } else if (typeof hasBackground === 'string') {
            // String color - legacy support
            if (hasBackground.includes('blue') || hasBackground.includes('#e3f2fd')) {
              containerClasses += ` ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
            } else if (hasBackground.includes('green')) {
              containerClasses += ` ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'}`;
            } else if (hasBackground.includes('orange')) {
              containerClasses += ` ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
            } else if (hasBackground.includes('purple') || hasBackground.includes('#f3e5f5')) {
              containerClasses += ` ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`;
            } else {
              containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
            }
          } else {
            containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
          }
        } else {
          containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
        }

        return (
          <div
            key={index}
            className={containerClasses}
            style={containerStyle}
          >
            {component.children?.map((child, childIndex) => {
              // For children in grid/row containers, adjust their positioning
              if (component.gridTemplateColumns || component.flexDirection === 'row') {
                return (
                  <div key={`${index}-${childIndex}`} className="flex-1 min-w-0 p-1 space-y-1">
                    {renderWireframe({ ...child, depth: 0, inGridContainer: true, parentIsGrid: true }, `${index}-${childIndex}`)}
                  </div>
                );
              }
              return renderWireframe({ ...child, parentIsGrid: component.parentIsGrid }, `${index}-${childIndex}`);
            })}
          </div>
        );

      case 'card':
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'} border p-1 shadow-sm`}
            style={{ marginLeft: (component.depth || 0) * 8 }}
          >
            {component.children?.map((child, childIndex) => renderWireframe({ ...child, parentIsGrid: component.parentIsGrid }, `${index}-${childIndex}`))}
          </div>
        );

      case 'interactive':
        let interactiveIcon = '⚡';
        let interactiveColor = isDark ? 'bg-green-600' : 'bg-green-400';

        if (component.subtype) {
          switch (component.subtype) {
            case 'collapsiblesection':
              interactiveIcon = '▼';
              interactiveColor = isDark ? 'bg-purple-600' : 'bg-purple-400';
              break;
            case 'ostab':
              interactiveIcon = '⊞';
              interactiveColor = isDark ? 'bg-orange-600' : 'bg-orange-400';
              break;
            case 'tutorialbutton':
              interactiveIcon = '🎯';
              interactiveColor = isDark ? 'bg-blue-600' : 'bg-blue-400';
              break;
            case 'simulator':
              interactiveIcon = '🔧';
              interactiveColor = isDark ? 'bg-teal-600' : 'bg-teal-400';
              break;
          }
        }

        return (
          <div
            key={index}
            className={`${baseClasses} ${interactiveColor} h-6 flex items-center justify-center`}
            style={{ marginLeft: (component.depth || 0) * 8 }}
          >
            <div className="text-xs text-white">{interactiveIcon}</div>
          </div>
        );

      case 'table':
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-slate-600' : 'bg-gray-300'} p-1`}
            style={{ marginLeft: (component.depth || 0) * 8 }}
          >
            <div className="grid grid-cols-3 gap-px">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 ${isDark ? 'bg-slate-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        );

      case 'collapsible':
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-purple-600' : 'bg-purple-400'} h-4 flex items-center px-1`}
            style={{ marginLeft: (component.depth || 0) * 8 }}
          >
            <div className="text-xs text-white">▼</div>
          </div>
        );

      case 'tabs':
        return (
          <div
            key={index}
            className={`${baseClasses}`}
            style={{ marginLeft: (component.depth || 0) * 8 }}
          >
            <div className="flex gap-1 mb-1">
              {[1, 2, 3].map(tab => (
                <div
                  key={tab}
                  className={`h-2 w-8 ${isDark ? 'bg-orange-600' : 'bg-orange-400'} rounded-t`}
                />
              ))}
            </div>
            <div className={`h-6 ${isDark ? 'bg-slate-600' : 'bg-gray-300'} rounded-b`} />
          </div>
        );

      default:
        return (
          <div
            key={index}
            className={`${baseClasses} ${isDark ? 'bg-gray-600' : 'bg-gray-400'} h-3`}
            style={{
              width: '80%',
              marginLeft: (component.depth || 0) * 8
            }}
          />
        );
    }
  };

  const components = parseContent(content);

  // Always show wireframe now since parseContent returns a fallback

  return (
    <div className={`${className} ${isDark ? 'bg-slate-800' : 'bg-white'} p-3 rounded border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
      <div className="space-y-1 max-h-56 overflow-hidden">
        {components.map((component, index) => renderWireframe(component, index))}
      </div>
    </div>
  );
};

export default TemplatePreview;
