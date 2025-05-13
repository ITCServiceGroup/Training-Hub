import { useNode, Element } from '@craftjs/core';
import React, { useEffect } from 'react'; // Removed useState
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
  expanded: false, // Default to collapsed in the viewer
  currentStep: 1 // Added currentStep to defaultProps
};

export const CollapsibleSection = (componentProps) => { // Renamed to avoid conflict
  // Merge default props with provided props
  let props = { // Use let to allow modification for shadow backward compatibility
    ...defaultProps,
    ...componentProps,
  };

  // Handle backward compatibility for shadow property
  if (typeof props.shadow === 'number') {
    const shadowValue = props.shadow;
    // Create a new props object with the updated shadow
    props = {
      ...props,
      shadow: {
        enabled: shadowValue > 0,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 }
      }
    };
  }
  // Now 'props' is the final, correctly structured props object to be used throughout.

  // Determine if we're in the editor or viewer
  const isInEditor = typeof document !== 'undefined' &&
                    document.querySelector('.craft-editor') !== null;
  const isInViewer = typeof document !== 'undefined' &&
                    document.querySelector('.craft-renderer') !== null; // Keep for potential viewer-specific logic

  const {
    connectors: { connect },
    selected,
    hovered,
    id,
    actions: { setProp }
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered,
    id: node.id
  }));

  // Extract props, including `expanded` and `currentStep` which are now managed by Craft.js
  // These are now extracted from the 'props' which is the merged and potentially modified object
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
    expanded, // Directly from props
    currentStep // Directly from props
  } = props;


  // Ensure currentStep is valid when numberOfSteps changes
  useEffect(() => {
    if (stepsEnabled && props.currentStep > props.numberOfSteps) { // Use props.currentStep and props.numberOfSteps
      setProp(propUpdater => propUpdater.currentStep = 1);
    }
  }, [props.numberOfSteps, props.currentStep, stepsEnabled, setProp]);

  const handleNextStep = () => {
    if (props.currentStep < props.numberOfSteps) { // Use props.currentStep and props.numberOfSteps
      const newStep = props.currentStep + 1;
      setProp(propUpdater => propUpdater.currentStep = newStep);
    }
  };

  const handlePrevStep = () => {
    if (props.currentStep > 1) { // Use props.currentStep
      const newStep = props.currentStep - 1;
      setProp(propUpdater => propUpdater.currentStep = newStep);
    }
  };

  // Extract margin values [Top, Right, Bottom, Left]
  const topMarginValue = parseInt(props.margin[0]) || 0;
  const rightMarginValue = parseInt(props.margin[1]) || 0; // Corrected index for right margin
  const bottomMarginValue = parseInt(props.margin[2]) || 0;
  const leftMarginValue = parseInt(props.margin[3]) || 0; // Corrected index for left margin

  const content = (
    <div
      ref={connect}
      className={`craft-collapsible-section main-component ${isInViewer ? 'in-viewer' : ''} ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
      style={{
        backgroundColor: `rgba(${Object.values(props.background)})`,
        color: `rgba(${Object.values(props.color)})`,
        padding: `${props.padding[0]}px ${props.padding[1]}px ${props.padding[2]}px ${props.padding[3]}px`,
        borderRadius: `${props.radius}px`,
        border: 'none',
        width: '100%',
        position: 'relative',
        margin: 0,
      }}
      data-id={id}
    >
      <div
        className={`craft-collapsible-header ${props.border.style === 'none' ? 'no-border' : ''}`}
        style={{
          backgroundColor: `rgba(${Object.values(props.headerBackground)})`,
          borderBottom: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderTop: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderLeft: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderRight: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          padding: '10px',
          borderTopLeftRadius: `${props.radius}px`,
          borderTopRightRadius: `${props.radius}px`,
          borderBottomLeftRadius: props.expanded ? '0px' : `${props.radius}px`,
          borderBottomRightRadius: props.expanded ? '0px' : `${props.radius}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: !props.expanded && props.shadow.enabled
            ? `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px rgba(${Object.values(props.shadow.color)})`
            : 'none',
        }}
        onClick={() => setProp(propUpdater => propUpdater.expanded = !props.expanded)}
      >
        <div style={{
          fontWeight: 'bold',
          fontSize: `${props.headerFontSize}px`,
          color: `rgba(${Object.values(props.headerTextColor)})`
        }}>{props.title}</div>
        <div style={{ transform: props.expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </div>
      </div>

      {props.expanded && (
        <div className={`craft-collapsible-content ${props.border.style === 'none' ? 'no-border' : ''}`} style={{
          padding: '10px',
          borderLeft: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderRight: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderBottom: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} rgba(${Object.values(props.border.color)})` : 'none',
          borderBottomLeftRadius: `${props.radius}px`,
          borderBottomRightRadius: `${props.radius}px`,
          boxShadow: props.expanded && props.shadow.enabled
            ? `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px rgba(${Object.values(props.shadow.color)})`
            : 'none',
        }}>
          {props.stepsEnabled ? (
            <>
              <div className="craft-steps-header" style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {Array.from({ length: props.numberOfSteps }, (_, i) => {
                    const stepNumber = i + 1;
                    const isCurrentStep = stepNumber === props.currentStep;

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
                          setProp(propUpdater => propUpdater.currentStep = stepNumber);
                        }}
                      >
                        {stepNumber}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="craft-steps-container">
                {Array.from({ length: props.numberOfSteps }, (_, i) => {
                  const stepNumber = i + 1;

                  return (
                    <div
                      key={`step-${stepNumber}-container`}
                      style={{
                        display: stepNumber === props.currentStep ? 'block' : 'none',
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
                        {/* Children will be rendered here by Craft.js if their parent is this canvas ID */}
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
                    backgroundColor: props.currentStep > 1 ? '#0d9488' : '#e5e7eb',
                    color: props.currentStep > 1 ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: props.currentStep > 1 ? 'pointer' : 'not-allowed',
                    opacity: props.currentStep > 1 ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevStep();
                  }}
                  disabled={props.currentStep <= 1}
                >
                  ← Back
                </button>

                <button
                  className="craft-step-nav-button"
                  style={{
                    padding: '5px 10px',
                    backgroundColor: props.currentStep < props.numberOfSteps ? '#0d9488' : '#e5e7eb',
                    color: props.currentStep < props.numberOfSteps ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: props.currentStep < props.numberOfSteps ? 'pointer' : 'not-allowed',
                    opacity: props.currentStep < props.numberOfSteps ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  disabled={props.currentStep >= props.numberOfSteps}
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
              width: props.width, // Ensure Resizer gets width from final props
              height: props.height, // Ensure Resizer gets height from final props
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
  displayName: 'CollapsibleSection',
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
