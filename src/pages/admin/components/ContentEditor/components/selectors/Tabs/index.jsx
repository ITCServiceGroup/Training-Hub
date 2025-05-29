import { useNode, Element } from '@craftjs/core';
import React, { useState, useEffect, useRef } from 'react';
import { TabsSettings } from './TabsSettings';
import { Resizer } from '../Resizer';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

// Default props for the Tabs component
const defaultProps = {
  background: {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 31, g: 41, b: 55, a: 1 }
  },
  color: {
    light: { r: 0, g: 0, b: 0, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  padding: [10, 10, 10, 10],
  margin: [0, 0, 0, 0],
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: { r: 0, g: 0, b: 0, a: 0.15 }
  },
  radius: 4,
  border: {
    style: 'solid',
    width: 1,
    color: {
      light: { r: 204, g: 204, b: 204, a: 1 },
      dark: { r: 75, g: 85, b: 99, a: 1 }
    }
  },
  width: 'auto',
  height: 'auto',
  numberOfTabs: 3,
  tabTitles: ['Tab 1', 'Tab 2', 'Tab 3'],
  tabBackground: {
    light: { r: 245, g: 247, b: 250, a: 1 },
    dark: { r: 51, g: 65, b: 85, a: 1 }
  },
  activeTabBackground: {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 31, g: 41, b: 55, a: 1 }
  },
  tabAlignment: 'left',
  autoConvertColors: true,
};

export const Tabs = (props) => {
  // Add containerRef for the Resizer component
  const containerRef = useRef(null);

  props = {
    ...defaultProps,
    ...props,
  };

  // Helper function to safely get node data
  const getSafeNodeData = (node) => {
    try {
      // First check if node exists at all
      if (!node) {
        return {
          selected: false,
          hovered: false,
          id: undefined,
          pendingDeletion: false
        };
      }

      // Check if the node is marked for deletion
      if (node.data?._pendingDeletion) {
        console.log('[Tabs] Node is marked for deletion, returning safe defaults');
        return {
          selected: false,
          hovered: false,
          id: undefined,
          pendingDeletion: true
        };
      }

      return {
        selected: node.events?.selected || false,
        hovered: node.events?.hovered || false,
        id: node.id,
        pendingDeletion: false
      };
    } catch (error) {
      console.log('[Tabs] Error in getSafeNodeData:', error);
      return {
        selected: false,
        hovered: false,
        id: undefined,
        pendingDeletion: false
      };
    }
  };

  // Get theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    connectors: { connect },
    selected,
    hovered,
    id,
    pendingDeletion
  } = useNode(getSafeNodeData);

  // Create a localStorage key for the active tab
  const tabStorageKey = `tabs-active-tab-${id}`;

  // Initialize activeTab from localStorage or default to 0
  const getInitialActiveTab = () => {
    // First check if component is being deleted or id is undefined
    if (pendingDeletion || !id) {
      console.log('[Tabs] Component is being deleted or ID is undefined, defaulting to tab 0');
      return 0;
    }

    try {
      if (typeof window !== 'undefined') {
        const savedTab = localStorage.getItem(tabStorageKey);
        if (savedTab !== null) {
          const tab = parseInt(savedTab, 10);
          // Ensure the tab is valid (between 0 and numberOfTabs-1)
          const maxTabs = props.numberOfTabs || defaultProps.numberOfTabs;
          if (!isNaN(tab) && tab >= 0 && tab < maxTabs) {
            console.log(`[Tabs ${id}] Initial active tab from localStorage:`, tab);
            return tab;
          }
        }
      }
    } catch (error) {
      // Ignore localStorage errors during component initialization/cleanup
      console.log(`[Tabs] Ignoring localStorage access during initialization/cleanup:`, error.message);
    }
    return 0; // Default to first tab
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    // Skip if component is being deleted or id is undefined
    if (pendingDeletion || !id) {
      console.log('[Tabs] Skipping localStorage operations - component is being deleted or initialized');
      return;
    }

    // Use a try-catch block for the entire effect to handle any errors
    try {
      console.log(`[Tabs ${id}] Active tab changed to:`, activeTab);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(tabStorageKey, String(activeTab));
        console.log(`[Tabs ${id}] Saved active tab to localStorage:`, activeTab);
      }

      // Ensure tab is valid when numberOfTabs changes
      if (activeTab >= props.numberOfTabs) {
        setActiveTab(0);
      }
    } catch (error) {
      // Ignore localStorage errors during component cleanup
      console.log(`[Tabs] Ignoring localStorage operation during cleanup:`, error.message);
    }
  }, [activeTab, id, tabStorageKey, props.numberOfTabs, pendingDeletion]);

  const {
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    border,
    width,
    height,
    numberOfTabs,
    tabTitles,
    tabBackground,
    activeTabBackground,
    tabAlignment,
    autoConvertColors,
  } = props;

  // Extract margin values [Top, Right, Bottom, Left]
  const topMarginValue = parseInt(margin[0]) || 0;
  const rightMarginValue = parseInt(margin[3]) || 0;
  const bottomMarginValue = parseInt(margin[2]) || 0;
  const leftMarginValue = parseInt(margin[1]) || 0;

  const content = (
    <div
      style={{
        // Force vertical drop indicators by creating a flex column parent
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <div
        ref={(dom) => {
          try {
            // Only connect if both dom and connect are available, id exists, and component is not being deleted
            if (dom && connect && id && !pendingDeletion) {
              connect(dom);
            }
          } catch (error) {
            console.log('[Tabs] Ignoring connector during cleanup:', error.message);
          }
        }}
        className={`craft-tabs main-component ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
        style={{
          backgroundColor: `rgba(${Object.values(getThemeColor(background, isDark, 'tabs', autoConvertColors))})`,
          color: `rgba(${Object.values(getThemeColor(color, isDark, 'text', autoConvertColors))})`,
          padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
          borderRadius: `${radius}px`,
          border: 'none', /* Removed outer border */
          width: '100%',
          position: 'relative',
          margin: 0,
          boxShadow: shadow.enabled
            ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(getThemeColor(shadow.color, isDark, 'shadow', autoConvertColors))})`
            : 'none',
        }}
        data-id={id}
      >
      {/* Tab Navigation */}
      <div
        className="craft-tabs-navigation"
        style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '-1px',
          position: 'relative',
          zIndex: 1,
          justifyContent: tabAlignment === 'center' ? 'center' :
                         tabAlignment === 'space-between' ? 'space-between' :
                         tabAlignment === 'right' ? 'flex-end' : 'flex-start',
          width: '100%'
        }}
      >
        {Array.from({ length: numberOfTabs }, (_, index) => (
          <div
            key={`tab-${index}`}
            onClick={() => {
              // Skip if component is being deleted
              if (pendingDeletion) {
                console.log('[Tabs] Ignoring tab click - component is being deleted');
                return;
              }

              try {
                setActiveTab(index);
                if (id) {
                  console.log(`[Tabs ${id}] Clicked on tab:`, index);
                }
                // The useEffect will handle saving to localStorage
              } catch (error) {
                // Ignore errors during component cleanup
                console.log('[Tabs] Ignoring tab click during cleanup');
              }
            }}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: activeTab === index
                ? `rgba(${Object.values(getThemeColor(activeTabBackground, isDark, 'tabs', autoConvertColors))})`
                : `rgba(${Object.values(getThemeColor(tabBackground, isDark, 'tabs', autoConvertColors))})`,
              border: border.style !== 'none'
                ? `${border.width}px ${border.style} rgba(${Object.values(getThemeColor(border.color, isDark, 'tabs', autoConvertColors))})`
                : 'none',
              borderBottom: activeTab === index || border.style === 'none' ? 'none' : undefined,
              borderTopLeftRadius: `${radius}px`,
              borderTopRightRadius: `${radius}px`,
              marginBottom: activeTab === index && border.style !== 'none' ? `-${border.width}px` : 0,
              position: 'relative',
              color: `rgba(${Object.values(getThemeColor(color, isDark, 'text', autoConvertColors))})`,
              ...(tabAlignment === 'space-between' && {
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              })
            }}
          >
            {tabTitles[index] || `Tab ${index + 1}`}
          </div>
        ))}
      </div>

      {/* Tab Content Area */}
      <div
        className="craft-tabs-content"
        style={{
          backgroundColor: `rgba(${Object.values(getThemeColor(activeTabBackground, isDark, 'tabs', autoConvertColors))})`,
          border: border.style !== 'none'
            ? `${border.width}px ${border.style} rgba(${Object.values(getThemeColor(border.color, isDark, 'tabs', autoConvertColors))})`
            : 'none',
          borderTopRightRadius: `${radius}px`,
          borderBottomLeftRadius: `${radius}px`,
          borderBottomRightRadius: `${radius}px`,
          padding: '16px',
          minHeight: '100px'
        }}
      >
        {Array.from({ length: numberOfTabs }, (_, index) => (
          <div
            key={`tab-content-${index}`}
            style={{
              display: activeTab === index ? 'block' : 'none',
              width: '100%'
            }}
          >
            <Element
              id={`tab-${index}-canvas`}
              canvas
              is="div"
              className="craft-tab-content craft-container is-canvas"
              style={{
                width: '100%',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {/* Children will be rendered here by Craft.js if their parent is this canvas ID */}
            </Element>
          </div>
        ))}
      </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Top margin spacer */}
      {topMarginValue > 0 && (
        <div style={{ height: `${topMarginValue}px`, width: '100%' }} />
      )}

      {/* Horizontal flexbox for left/right margins */}
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Left margin spacer */}
        {leftMarginValue > 0 && (
          <div style={{ width: `${leftMarginValue}px`, flexShrink: 0 }} />
        )}

        {/* Main content */}
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Resizer
            ref={containerRef}
            propKey={{ width: 'width', height: 'height' }}
            className="craft-tabs"
            style={{
              position: 'relative',
              display: 'flex',
              minHeight: '50px',
              width: '100%',
              boxSizing: 'border-box',
              flexShrink: 0,
              flexBasis: 'auto',
              margin: 0,
              padding: 0,
              pointerEvents: 'auto'
            }}
          >
            {content}
          </Resizer>
        </div>

        {/* Right margin spacer */}
        {rightMarginValue > 0 && (
          <div style={{ width: `${rightMarginValue}px`, flexShrink: 0 }} />
        )}
      </div>

      {/* Bottom margin spacer */}
      {bottomMarginValue > 0 && (
        <div style={{ height: `${bottomMarginValue}px`, width: '100%' }} />
      )}
    </div>
  );
};

Tabs.craft = {
  displayName: 'Tabs',
  props: {
    ...defaultProps,
    // Handle backward compatibility for theme colors
    get background() {
      if (defaultProps.background.light && defaultProps.background.dark) {
        return defaultProps.background;
      }
      const lightColor = defaultProps.background;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'tabs')
      };
    },
    get color() {
      if (defaultProps.color.light && defaultProps.color.dark) {
        return defaultProps.color;
      }
      const lightColor = defaultProps.color;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'text')
      };
    },
    get 'border.color'() {
      if (defaultProps.border.color.light && defaultProps.border.color.dark) {
        return defaultProps.border.color;
      }
      const lightColor = defaultProps.border.color;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'tabs')
      };
    },
    get tabBackground() {
      if (defaultProps.tabBackground.light && defaultProps.tabBackground.dark) {
        return defaultProps.tabBackground;
      }
      const lightColor = defaultProps.tabBackground;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'tabs')
      };
    },
    get activeTabBackground() {
      if (defaultProps.activeTabBackground.light && defaultProps.activeTabBackground.dark) {
        return defaultProps.activeTabBackground;
      }
      const lightColor = defaultProps.activeTabBackground;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'tabs')
      };
    }
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: TabsSettings
  }
};
