import { useNode, Element } from '@craftjs/core';
import React, { useState, useEffect } from 'react';
import { CollapsibleSectionSettings } from './CollapsibleSectionSettings';
import { Resizer } from '../Resizer';

// Default props for the CollapsibleSectionV2 component
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
  title: 'Collapsible Section',
  stepsEnabled: false,
  numberOfSteps: 3,
  headerBackground: { r: 240, g: 240, b: 240, a: 1 },
  headerTextColor: { r: 0, g: 0, b: 0, a: 1 }, // Header text color
  headerFontSize: 16, // Header font size in pixels
  expanded: false // Default to collapsed in the viewer
};

// Keep track of renders for debugging
const renderCounts = {};

export const CollapsibleSection = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  // Debug re-renders
  const nodeInfo = useNode((node) => ({ nodeId: node.id }));
  const nodeId = nodeInfo.nodeId;
  if (!renderCounts[nodeId]) {
    renderCounts[nodeId] = 0;
  }
  renderCounts[nodeId]++;
  console.log(`[CollapsibleSection ${nodeId}] Render #${renderCounts[nodeId]}, props.expanded:`, props.expanded);

  // Handle backward compatibility for shadow property
  if (typeof props.shadow === 'number') {
    const shadowValue = props.shadow;
    props.shadow = {
      enabled: shadowValue > 0,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.15 }
    };
  }

  // Determine if we're in the editor or viewer
  const isInEditor = typeof document !== 'undefined' &&
                    document.querySelector('.craft-editor') !== null;
  const isInViewer = typeof document !== 'undefined' &&
                    document.querySelector('.craft-renderer') !== null;

  // Get the node ID and other info from useNode hook
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

  // Create a stable localStorage key based on the component ID
  const localStorageKey = `collapsible-section-expanded-${id}`;

  // Initialize expanded state based on localStorage or context
  const getInitialExpandedState = () => {
    // Check localStorage first for both editor and viewer contexts
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(localStorageKey);
      if (savedState !== null) {
        console.log(`[CollapsibleSection ${id}] Initial state from localStorage:`, savedState === 'true');
        return savedState === 'true';
      }
    }

    // If no localStorage state:
    // In editor context, default to expanded
    if (isInEditor) {
      console.log(`[CollapsibleSection ${id}] No localStorage state, defaulting to true in editor`);
      return true;
    }

    // In viewer or other contexts, use props or default to false
    const initialState = props.expanded !== undefined ? props.expanded : false;
    console.log(`[CollapsibleSection ${id}] Initial state in viewer:`, initialState);
    return initialState;
  };

  // Use the initial state from localStorage or defaults
  const [expanded, setExpanded] = useState(getInitialExpandedState());

  // Debug when expanded state changes
  useEffect(() => {
    console.log(`[CollapsibleSection ${id}] Expanded state changed to:`, expanded);

    // Save to localStorage whenever expanded state changes
    if (isInEditor && typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, String(expanded));
      console.log(`[CollapsibleSection ${id}] Saved to localStorage from useEffect:`, expanded);
    }
  }, [expanded, id, isInEditor, localStorageKey]);

  // Check if props.expanded is changing and overriding our state
  useEffect(() => {
    if (props.expanded !== undefined) {
      console.log(`[CollapsibleSection ${id}] props.expanded changed to:`, props.expanded);
      console.log(`[CollapsibleSection ${id}] Current state is:`, expanded);

      // If props.expanded is different from our state, it might be overriding it
      if (props.expanded !== expanded) {
        console.log(`[CollapsibleSection ${id}] WARNING: props.expanded (${props.expanded}) is different from state (${expanded})`);

        // IMPORTANT: In the editor, we want to prioritize our localStorage state over props
        if (isInEditor && typeof window !== 'undefined') {
          const savedState = localStorage.getItem(localStorageKey);
          if (savedState !== null) {
            const savedExpanded = savedState === 'true';
            if (savedExpanded !== props.expanded) {
              console.log(`[CollapsibleSection ${id}] Overriding props.expanded with localStorage value:`, savedExpanded);
              // Use a timeout to ensure this happens after any other state updates
              setTimeout(() => {
                setExpanded(savedExpanded);
              }, 0);
            }
          }
        }
      }
    }
  }, [props.expanded, expanded, id, isInEditor, localStorageKey]);
  // Extract all props first
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
    title,
    stepsEnabled,
    numberOfSteps,
    headerBackground,
    headerTextColor,
    headerFontSize,
  } = props;

  // Create a localStorage key for the current step
  const stepStorageKey = `collapsible-section-step-${id}`;

  // Initialize currentStep from localStorage or default to 1
  const getInitialStep = () => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(stepStorageKey);
      if (savedStep !== null) {
        const step = parseInt(savedStep, 10);
        const maxSteps = numberOfSteps || 1; // Ensure we have a valid number
        // Ensure the step is valid (between 1 and numberOfSteps)
        if (!isNaN(step) && step >= 1 && step <= maxSteps) {
          console.log(`[CollapsibleSection ${id}] Initial step from localStorage:`, step);
          return step;
        }
      }
    }
    return 1; // Default to first step
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);

  // Custom setExpanded function that allows toggling in both editor and viewer
  const handleSetExpanded = (newExpandedState) => {
    console.log(`[CollapsibleSection ${id}] Setting expanded state to:`, newExpandedState, 'Triggered by user click');

    // Allow toggling in both editor and viewer
    setExpanded(newExpandedState);

    // Save the state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, String(newExpandedState));
      console.log(`[CollapsibleSection ${id}] Saved to localStorage from handleSetExpanded:`, newExpandedState);
    }
  };

  // Props are already extracted above

  // Track component lifecycle
  useEffect(() => {
    console.log(`[CollapsibleSection ${id}] Component mounted`);

    // Check if there are any props that might be causing re-renders
    console.log(`[CollapsibleSection ${id}] Props:`, {
      title,
      width,
      height,
      stepsEnabled,
      numberOfSteps
    });

    return () => {
      console.log(`[CollapsibleSection ${id}] Component unmounted`);
    };
  }, [id, title, width, height, stepsEnabled, numberOfSteps]);

  // Track props changes
  useEffect(() => {
    console.log(`[CollapsibleSection ${id}] Props changed:`, {
      title,
      width,
      height,
      stepsEnabled,
      numberOfSteps,
      'props.expanded': props.expanded
    });
  }, [id, title, width, height, stepsEnabled, numberOfSteps, props.expanded]);

  // We no longer force the component to always be expanded in the editor
  // Instead, we respect the user's preference saved in localStorage

  // Save currentStep to localStorage whenever it changes
  useEffect(() => {
    console.log(`[CollapsibleSection ${id}] Current step changed to:`, currentStep);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(stepStorageKey, String(currentStep));
      console.log(`[CollapsibleSection ${id}] Saved step to localStorage:`, currentStep);
    }

    // Ensure step is valid when numberOfSteps changes
    if (currentStep > numberOfSteps) {
      setCurrentStep(1);
    }
  }, [numberOfSteps, currentStep, id, stepStorageKey]);

  const handleNextStep = () => {
    if (currentStep < numberOfSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      // We don't need to explicitly save to localStorage here since the useEffect will handle it
      console.log(`[CollapsibleSection ${id}] Moving to next step:`, newStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);

      // We don't need to explicitly save to localStorage here since the useEffect will handle it
      console.log(`[CollapsibleSection ${id}] Moving to previous step:`, newStep);
    }
  };

  // Initialize step children with props or empty arrays
  const stepChildren = {};
  for (let i = 1; i <= numberOfSteps; i++) {
    const stepPropName = `step${i}Children`;
    stepChildren[i] = props[stepPropName] || [];
  }

  // Debug step children
  useEffect(() => {
    if (stepsEnabled) {
      for (let i = 1; i <= numberOfSteps; i++) {
        const stepPropName = `step${i}Children`;
        if (props[stepPropName] && props[stepPropName].length > 0) {
          console.log(`[CollapsibleSection ${id}] Step ${i} has ${props[stepPropName].length} children:`, props[stepPropName]);
        }
      }
    }
  }, [id, stepsEnabled, numberOfSteps, props]);

  // Extract margin values [Top, Right, Bottom, Left]
  const topMarginValue = parseInt(margin[0]) || 0;
  const rightMarginValue = parseInt(margin[3]) || 0;
  const bottomMarginValue = parseInt(margin[2]) || 0;
  const leftMarginValue = parseInt(margin[1]) || 0;

  const content = (
    <div
      ref={connect}
      className={`craft-collapsible-section main-component ${isInViewer ? 'in-viewer' : ''} ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
      style={{
        backgroundColor: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        borderRadius: `${radius}px`,
        border: 'none',
        width: '100%',
        position: 'relative',
        margin: 0,
      }}
      data-id={id}
    >
      <div
        className={`craft-collapsible-header ${border.style === 'none' ? 'no-border' : ''}`}
        style={{
          backgroundColor: `rgba(${Object.values(headerBackground)})`,
          borderBottom: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderTop: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderLeft: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderRight: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          padding: '10px',
          borderTopLeftRadius: `${radius}px`,
          borderTopRightRadius: `${radius}px`,
          borderBottomLeftRadius: expanded ? '0px' : `${radius}px`,
          borderBottomRightRadius: expanded ? '0px' : `${radius}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: !expanded && shadow.enabled
            ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
            : 'none',
        }}
        onClick={() => handleSetExpanded(!expanded)}
      >
        <div style={{
          fontWeight: 'bold',
          fontSize: `${headerFontSize}px`,
          color: `rgba(${Object.values(headerTextColor)})`
        }}>{title}</div>
        <div style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </div>
      </div>

      {expanded && (
        <div className={`craft-collapsible-content ${border.style === 'none' ? 'no-border' : ''}`} style={{
          padding: '10px',
          borderLeft: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderRight: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderBottom: border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none',
          borderBottomLeftRadius: `${radius}px`,
          borderBottomRightRadius: `${radius}px`,
          boxShadow: expanded && shadow.enabled
            ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
            : 'none',
        }}>
          {stepsEnabled ? (
            <>
              <div className="craft-steps-header" style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {Array.from({ length: numberOfSteps }, (_, i) => {
                    const stepNumber = i + 1;
                    const isCurrentStep = stepNumber === currentStep;

                    return (
                      <div
                        key={`step-indicator-${stepNumber}`}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isCurrentStep ? '#0d9488' : '#e5e7eb',
                          color: isCurrentStep ? 'white' : '#4b5563',
                          border: isCurrentStep ? '2px solid #0d9488' : '1px solid #d1d5db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: isCurrentStep ? 'bold' : 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep(stepNumber);
                          console.log(`[CollapsibleSection ${id}] Clicked on step indicator:`, stepNumber);
                          // The useEffect will handle saving to localStorage
                        }}
                      >
                        {stepNumber}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="craft-steps-container">
                {Array.from({ length: numberOfSteps }, (_, i) => {
                  const stepNumber = i + 1;

                  return (
                    <div
                      key={`step-${stepNumber}-container`}
                      style={{
                        display: stepNumber === currentStep ? 'block' : 'none',
                        width: '100%'
                      }}
                    >
                      <Element
                        id={`step-${stepNumber}-canvas`}
                        canvas
                        is="div"
                        className="craft-step-content craft-container is-canvas collapsible-section-canvas"
                        style={{
                          minHeight: '100px',
                          width: '100%',
                          position: 'relative',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                      >
                        {props[`step${stepNumber}Children`]}
                      </Element>
                    </div>
                  );
                })}
              </div>

              <div className="craft-steps-navigation" style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  className="craft-step-nav-button"
                  style={{
                    padding: '5px 10px',
                    backgroundColor: currentStep > 1 ? '#0d9488' : '#e5e7eb',
                    color: currentStep > 1 ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentStep > 1 ? 'pointer' : 'not-allowed',
                    opacity: currentStep > 1 ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevStep();
                  }}
                  disabled={currentStep <= 1}
                >
                  ← Back
                </button>

                <button
                  className="craft-step-nav-button"
                  style={{
                    padding: '5px 10px',
                    backgroundColor: currentStep < numberOfSteps ? '#0d9488' : '#e5e7eb',
                    color: currentStep < numberOfSteps ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentStep < numberOfSteps ? 'pointer' : 'not-allowed',
                    opacity: currentStep < numberOfSteps ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  disabled={currentStep >= numberOfSteps}
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <Element
              id="content-canvas"
              canvas
              is="div"
              className="craft-container is-canvas collapsible-section-canvas"
              style={{
                width: '100%',
                position: 'relative',
                minHeight: '100px',
                border: 'none'
              }}
            >
              {props.children}
            </Element>
          )}
        </div>
      )}
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

CollapsibleSection.craft = {
  displayName: 'Collapsible Section',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: CollapsibleSectionSettings
  },
  custom: {
    isCanvas: false
  }
};
