import { useTheme } from '../../contexts/ThemeContext';

const TemplatePreview = ({ content, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create a simple wireframe fallback
  const createSimpleWireframe = () => {
    return [
      { type: 'text', isHeading: true, text: 'Template Preview', size: 'large' },
      { type: 'text', isHeading: false, text: 'This template contains various components and layouts.', size: 'medium' },
      { type: 'container', children: [
        { type: 'text', isHeading: true, text: 'Section', size: 'medium' },
        { type: 'text', isHeading: false, text: 'Content will be displayed here.', size: 'small' }
      ], depth: 0 }
    ];
  };

  // Parse template content and create accurate wireframe representation
  const parseContentToWireframe = (contentString) => {
    try {
      if (!contentString) {
        return createSimpleWireframe();
      }

      const parsed = typeof contentString === 'string' ? JSON.parse(contentString) : contentString;

      if (!parsed || !parsed.ROOT) {
        return createSimpleWireframe();
      }

      const components = [];

      // Recursively parse nodes to create wireframe components
      const parseNode = (nodeId, depth = 0) => {
        const node = parsed[nodeId];
        if (!node) return null;

        const componentType = node.type?.resolvedName || 'Unknown';
        const props = node.props || {};

        switch (componentType) {
          case 'Text':
            const fontSize = parseInt(props.fontSize) || 16;
            const fontWeight = props.fontWeight || '400';
            const text = props.text || 'Text';
            const textAlign = props.textAlign || 'left';

            return {
              type: 'text',
              text: text,
              textAlign: textAlign,
              isHeading: fontSize > 18 || fontWeight === 'bold' || fontWeight === '600' || fontWeight === '700',
              size: fontSize > 24 ? 'large' : fontSize > 18 ? 'medium' : 'small',
              depth: depth || 0,
              hasIcon: props.hasIcon || false,
              iconName: props.iconName
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
            const background = props.background;
            const gridTemplateColumns = props.gridTemplateColumns;

            return {
              type: 'container',
              children,
              depth: depth || 0,
              flexDirection,
              background,
              gridTemplateColumns,
              isRow: flexDirection === 'row',
              isGrid: !!gridTemplateColumns,
              hasBackground: !!background
            };

          case 'Card':
            const cardChildren = node.nodes?.map(childId => parseNode(childId, depth + 1)).filter(Boolean) || [];
            return {
              type: 'card',
              children: cardChildren,
              depth: depth || 0
            };

          case 'Interactive':
            return {
              type: 'interactive',
              name: props.name || 'Interactive Element',
              depth: depth || 0
            };

          case 'Table':
            return {
              type: 'table',
              rows: props.rows || 3,
              columns: props.columns || 3,
              depth: depth || 0
            };

          case 'CollapsibleSection':
          case 'Collapsible Section':
            // Parse content from linked canvas
            const collapsibleChildren = [];
            if (node.linkedNodes && node.linkedNodes['content-canvas']) {
              const contentNode = parsed[node.linkedNodes['content-canvas']];
              if (contentNode && contentNode.nodes) {
                contentNode.nodes.forEach(childId => {
                  const child = parseNode(childId, depth + 1);
                  if (child) {
                    collapsibleChildren.push(child);
                  }
                });
              }
            }

            return {
              type: 'collapsible',
              title: props.title || 'Collapsible Section',
              children: collapsibleChildren,
              depth: depth || 0,
              stepsEnabled: props.stepsEnabled || false,
              expanded: props.expanded || false,
              background: props.background
            };

          case 'Tabs':
            return {
              type: 'tabs',
              tabCount: props.tabCount || 2,
              depth: depth || 0,
              background: props.background
            };

          default:
            return {
              type: 'unknown',
              componentType: componentType,
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

      return components.length > 0 ? components : createSimpleWireframe();
    } catch (error) {
      console.error('Error parsing template content for wireframe:', error);
      return createSimpleWireframe();
    }
  };

  // Render wireframe component
  const renderWireframe = (component, index, isNested = false) => {
    const baseClasses = `mb-2 rounded`;
    // Only apply indentation to top-level components, not nested ones
    const indentStyle = isNested ? {} : { marginLeft: (component.depth || 0) * 12 };

    switch (component.type) {
      case 'text':
        const isHeading = component.isHeading;
        const size = component.size;
        let height = 'h-3';
        let width = '100%';
        let textColor = isDark ? 'bg-slate-400' : 'bg-gray-400';

        if (isHeading) {
          textColor = isDark ? 'bg-slate-300' : 'bg-gray-600';
          if (size === 'large') {
            height = 'h-6';
            width = '75%';
          } else if (size === 'medium') {
            height = 'h-5';
            width = '80%';
          } else {
            height = 'h-4';
            width = '85%';
          }
        } else {
          const textLength = component.text?.length || 0;
          if (textLength > 100) {
            height = 'h-4';
            width = '95%';
          } else if (textLength > 50) {
            height = 'h-3';
            width = '90%';
          }
        }

        // Apply text alignment - ensure proper alignment
        let containerClass = '';
        let textStyle = { width };

        if (component.textAlign === 'center') {
          containerClass = 'flex justify-center';
        } else if (component.textAlign === 'right') {
          containerClass = 'flex justify-end';
        } else {
          // Default to left alignment
          containerClass = 'flex justify-start';
        }

        return (
          <div key={index} className={containerClass} style={indentStyle}>
            <div
              className={`${baseClasses} ${textColor} ${height}`}
              style={textStyle}
            />
          </div>
        );

      case 'button':
        return (
          <div key={index} style={indentStyle}>
            <div
              className={`${baseClasses} ${isDark ? 'bg-blue-500' : 'bg-blue-400'} h-4 w-20`}
            />
          </div>
        );

      case 'image':
        return (
          <div key={index} style={indentStyle}>
            <div
              className={`${baseClasses} ${isDark ? 'bg-slate-500' : 'bg-gray-400'} h-12 flex items-center justify-center`}
            >
              <div className={`w-6 h-6 ${isDark ? 'bg-slate-400' : 'bg-gray-300'} rounded`} />
            </div>
          </div>
        );

      case 'container':
        const hasBackground = component.hasBackground;
        let containerClasses = `${baseClasses} border p-2 min-h-[2rem]`;

        if (hasBackground) {
          // Detect background colors and apply appropriate styling
          const bg = component.background;
          if (bg && typeof bg === 'object') {
            const lightBg = bg.light || bg;
            if (lightBg && lightBg.r !== undefined) {
              // Blue-ish backgrounds (like the row container in template: r:195, g:223, b:255)
              if (lightBg.r === 195 && lightBg.g === 223 && lightBg.b === 255) {
                containerClasses += ` ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-100 border-blue-300'}`;
              }
              // Orange/Yellow backgrounds (warning/info containers: r:251, g:239, b:213)
              else if (lightBg.r === 251 && lightBg.g === 239 && lightBg.b === 213) {
                containerClasses += ` ${isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-100 border-orange-300'}`;
              }
              // Red-ish backgrounds (error containers: r:251, g:213, b:213)
              else if (lightBg.r === 251 && lightBg.g === 213 && lightBg.b === 213) {
                containerClasses += ` ${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-300'}`;
              }
              // Green-ish backgrounds
              else if (lightBg.r < 220 && lightBg.g > 240 && lightBg.b < 220) {
                containerClasses += ` ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-300'}`;
              }
              // White backgrounds
              else if (lightBg.r === 255 && lightBg.g === 255 && lightBg.b === 255) {
                containerClasses += ` ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`;
              }
              // Light gray backgrounds (like r:247, g:247, b:247)
              else if (lightBg.r === 247 && lightBg.g === 247 && lightBg.b === 247) {
                containerClasses += ` ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`;
              }
              else {
                containerClasses += ` ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
              }
            }
          } else {
            containerClasses += ` ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100 border-gray-300'}`;
          }
        } else {
          containerClasses += ` ${isDark ? 'border-slate-600' : 'border-gray-300'}`;
        }

        // Handle different layout types
        if (component.isGrid && component.gridTemplateColumns) {
          // Grid layout - prioritize grid over flexbox
          if (component.gridTemplateColumns === '1fr 1fr') {
            containerClasses += ' grid grid-cols-2 gap-1';
          } else if (component.gridTemplateColumns.includes('1fr')) {
            // Count the number of 1fr columns
            const frCount = (component.gridTemplateColumns.match(/1fr/g) || []).length;
            if (frCount === 3) {
              containerClasses += ' grid grid-cols-3 gap-1';
            } else if (frCount === 4) {
              containerClasses += ' grid grid-cols-4 gap-1';
            } else {
              containerClasses += ' grid grid-cols-2 gap-1';
            }
          } else {
            containerClasses += ' grid grid-cols-2 gap-1';
          }
        } else if (component.isRow) {
          // Flexbox row layout - ensure children fit within container
          containerClasses += ' flex flex-row gap-1 overflow-hidden';
        }

        return (
          <div key={index} style={indentStyle}>
            <div className={containerClasses}>
              {component.children?.map((child, childIndex) => {
                // For row layouts, ensure children are properly sized
                const childStyle = component.isRow ? { flex: '1', minWidth: '0' } : {};
                return (
                  <div key={`${index}-${childIndex}`} style={childStyle}>
                    {renderWireframe(child, `${index}-${childIndex}`, true)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'card':
        return (
          <div key={index} style={indentStyle}>
            <div className={`${baseClasses} ${isDark ? 'bg-slate-700 border-slate-500' : 'bg-white border-gray-300'} border p-2 shadow-sm`}>
              {component.children?.map((child, childIndex) =>
                renderWireframe(child, `${index}-${childIndex}`, true)
              )}
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div key={index} style={indentStyle}>
            <div className={`${baseClasses} ${isDark ? 'bg-green-600' : 'bg-green-400'} h-6 flex items-center justify-center`}>
              <div className="text-xs text-white font-medium">⚡ Interactive</div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div key={index} style={indentStyle}>
            <div className={`${baseClasses} ${isDark ? 'bg-slate-600' : 'bg-gray-300'} p-2`}>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`h-2 ${isDark ? 'bg-slate-500' : 'bg-gray-200'} rounded-sm`} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'collapsible':
        // Detect background colors for accurate representation
        let headerBgClass = isDark ? 'bg-purple-600' : 'bg-purple-200';
        let containerBgClass = isDark ? 'bg-purple-700 border-purple-600' : 'bg-purple-100 border-purple-300';

        if (component.background) {
          const bg = component.background;
          const lightBg = bg.light || bg;
          if (lightBg && lightBg.r !== undefined) {
            // Apply similar color detection logic as containers
            if (lightBg.r === 195 && lightBg.g === 223 && lightBg.b === 255) {
              containerBgClass = isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-100 border-blue-300';
              headerBgClass = isDark ? 'bg-blue-700' : 'bg-blue-200';
            } else if (lightBg.r === 251 && lightBg.g === 239 && lightBg.b === 213) {
              containerBgClass = isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-100 border-orange-300';
              headerBgClass = isDark ? 'bg-orange-700' : 'bg-orange-200';
            } else if (lightBg.r === 251 && lightBg.g === 213 && lightBg.b === 213) {
              containerBgClass = isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-300';
              headerBgClass = isDark ? 'bg-red-700' : 'bg-red-200';
            }
          }
        }

        return (
          <div key={index} style={indentStyle}>
            <div className={`${baseClasses} ${containerBgClass} border`}>
              <div className={`flex items-center justify-between p-2 ${headerBgClass} rounded-t`}>
                {/* Wireframe text block instead of actual title text */}
                <div className={`${isDark ? 'bg-slate-300' : 'bg-gray-600'} h-3 w-32 rounded`} />
                <div className="text-xs">▼</div>
              </div>
              {component.expanded && component.children?.length > 0 && (
                <div className="p-2 space-y-1">
                  {component.children.map((child, childIndex) =>
                    renderWireframe(child, `${index}-${childIndex}`, true)
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'tabs':
        // Detect background colors for accurate representation
        let tabBgClass = isDark ? 'bg-blue-600' : 'bg-blue-500';
        let contentBgClass = isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300';
        let inactiveTabClass = isDark ? 'bg-slate-600' : 'bg-gray-200';

        if (component.background) {
          const bg = component.background;
          const lightBg = bg.light || bg;
          if (lightBg && lightBg.r !== undefined) {
            // Apply similar color detection logic
            if (lightBg.r === 195 && lightBg.g === 223 && lightBg.b === 255) {
              tabBgClass = isDark ? 'bg-blue-600' : 'bg-blue-500';
              contentBgClass = isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300';
              inactiveTabClass = isDark ? 'bg-blue-800' : 'bg-blue-200';
            } else if (lightBg.r === 251 && lightBg.g === 239 && lightBg.b === 213) {
              tabBgClass = isDark ? 'bg-orange-600' : 'bg-orange-500';
              contentBgClass = isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-300';
              inactiveTabClass = isDark ? 'bg-orange-800' : 'bg-orange-200';
            } else if (lightBg.r === 251 && lightBg.g === 213 && lightBg.b === 213) {
              tabBgClass = isDark ? 'bg-red-600' : 'bg-red-500';
              contentBgClass = isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-300';
              inactiveTabClass = isDark ? 'bg-red-800' : 'bg-red-200';
            }
          }
        }

        return (
          <div key={index} style={indentStyle}>
            <div className={baseClasses}>
              {/* Tab headers */}
              <div className="flex gap-0 mb-0">
                {Array.from({ length: component.tabCount || 3 }).map((_, tabIndex) => (
                  <div
                    key={tabIndex}
                    className={`px-3 py-2 rounded-t border-t border-l border-r ${
                      tabIndex === 0
                        ? `${tabBgClass} text-white`
                        : `${inactiveTabClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`
                    } ${isDark ? 'border-slate-600' : 'border-gray-300'}`}
                  >
                    {/* Wireframe text for tab label */}
                    <div className={`${isDark ? 'bg-slate-300' : 'bg-gray-600'} h-2 w-12 rounded`} />
                  </div>
                ))}
              </div>
              {/* Tab content area */}
              <div className={`${contentBgClass} border p-3 rounded-b rounded-tr min-h-[3rem]`}>
                {/* Wireframe content blocks */}
                <div className="space-y-2">
                  <div className={`${isDark ? 'bg-slate-400' : 'bg-gray-400'} h-3 w-4/5 rounded`} />
                  <div className={`${isDark ? 'bg-slate-400' : 'bg-gray-400'} h-3 w-3/5 rounded`} />
                  <div className={`${isDark ? 'bg-slate-400' : 'bg-gray-400'} h-3 w-2/3 rounded`} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={index} style={indentStyle}>
            <div className={`${baseClasses} ${isDark ? 'bg-gray-600' : 'bg-gray-400'} h-4 w-3/4`} />
          </div>
        );
    }
  };

  // Get wireframe components
  const wireframeComponents = parseContentToWireframe(content);

  return (
    <div className={`template-preview ${className} ${isDark ? 'bg-slate-800' : 'bg-white'} rounded border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
      <div className="p-4 space-y-2 max-h-full overflow-y-auto">
        {wireframeComponents.map((component, index) => renderWireframe(component, index))}
      </div>
    </div>
  );
};

export default TemplatePreview;
