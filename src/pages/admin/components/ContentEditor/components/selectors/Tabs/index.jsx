import { useNode, Element } from '@craftjs/core';
import React, { useState, useEffect } from 'react';
import { TabsSettings } from './TabsSettings';
import { Resizer } from '../Resizer';

// Default props for the Tabs component
const defaultProps = {
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
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
    color: { r: 204, g: 204, b: 204, a: 1 }
  },
  width: 'auto',
  height: 'auto',
  numberOfTabs: 3,
  tabTitles: ['Tab 1', 'Tab 2', 'Tab 3'],
  tabBackground: { r: 245, g: 247, b: 250, a: 1 },
  activeTabBackground: { r: 255, g: 255, b: 255, a: 1 },
  tabAlignment: 'left',
};

export const Tabs = (props) => {
  props = {
    ...defaultProps,
    ...props,
  };

  const {
    connectors: { connect },
    selected,
    hovered,
    id
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered,
    id: node.id
  }));

  // Create a localStorage key for the active tab
  const tabStorageKey = `tabs-active-tab-${id}`;

  // Initialize activeTab from localStorage or default to 0
  const getInitialActiveTab = () => {
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
    return 0; // Default to first tab
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
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
  }, [activeTab, id, tabStorageKey, props.numberOfTabs]);

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
  } = props;

  // Extract margin values [Top, Right, Bottom, Left]
  const topMarginValue = parseInt(margin[0]) || 0;
  const rightMarginValue = parseInt(margin[3]) || 0;
  const bottomMarginValue = parseInt(margin[2]) || 0;
  const leftMarginValue = parseInt(margin[1]) || 0;

  const content = (
    <div
      ref={connect}
      className={`craft-tabs main-component ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
      style={{
        backgroundColor: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        borderRadius: `${radius}px`,
        border: 'none', /* Removed outer border */
        width: '100%',
        position: 'relative',
        margin: 0,
        boxShadow: shadow.enabled
          ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
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
                         tabAlignment === 'space-between' ? 'space-between' : 'flex-start',
          width: '100%'
        }}
      >
        {Array.from({ length: numberOfTabs }, (_, index) => (
          <div
            key={`tab-${index}`}
            onClick={() => {
              setActiveTab(index);
              console.log(`[Tabs ${id}] Clicked on tab:`, index);
              // The useEffect will handle saving to localStorage
            }}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: activeTab === index
                ? `rgba(${Object.values(activeTabBackground)})`
                : `rgba(${Object.values(tabBackground)})`,
              border: border.style !== 'none'
                ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
                : 'none',
              borderBottom: activeTab === index ? 'none' : undefined,
              borderTopLeftRadius: `${radius}px`,
              borderTopRightRadius: `${radius}px`,
              marginBottom: activeTab === index ? `-${border.width}px` : 0,
              position: 'relative',
              color: `rgba(${Object.values(color)})`,
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
          backgroundColor: `rgba(${Object.values(activeTabBackground)})`,
          border: border.style !== 'none'
            ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
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
              {props[`tab${index}Children`]}
            </Element>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
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
            propKey={{ width: 'width', height: 'height' }}
            style={{
              width,
              height,
              margin: 0
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
    </>
  );
};

Tabs.craft = {
  displayName: 'Tabs',
  props: defaultProps,
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
