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
  expanded: false // Default to collapsed in the viewer
};

export const CollapsibleSection = (props) => {
  props = {
    ...defaultProps,
    ...props,
  };

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

  const isInEditor = typeof document !== 'undefined' &&
                    document.querySelector('.craft-editor') !== null;
  const isInViewer = typeof document !== 'undefined' &&
                    document.querySelector('.craft-renderer') !== null;

  const [expanded, setExpanded] = useState(isInEditor ? true :
                                          (isInViewer ? false :
                                          (props.expanded || defaultProps.expanded)));
  const [currentStep, setCurrentStep] = useState(1);

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
  } = props;

  useEffect(() => {
    const checkContext = () => {
      const inEditor = typeof document !== 'undefined' &&
                      document.querySelector('.craft-editor') !== null;
      const inViewer = typeof document !== 'undefined' &&
                      document.querySelector('.craft-renderer') !== null;

      if (inEditor && !expanded) {
        setExpanded(true);
      }
      if (inViewer && expanded && !props.expanded) {
        setExpanded(false);
      }
    };

    const timer = setTimeout(checkContext, 100);
    return () => clearTimeout(timer);
  }, [expanded, props.expanded]);

  useEffect(() => {
    if (currentStep > numberOfSteps) {
      setCurrentStep(1);
    }
  }, [numberOfSteps, currentStep]);

  const handleNextStep = () => {
    if (currentStep < numberOfSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepChildren = {};
  for (let i = 1; i <= numberOfSteps; i++) {
    stepChildren[i] = [];
  }

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
        className="craft-collapsible-header"
        style={{
          backgroundColor: `rgba(${Object.values(headerBackground)})`,
          borderBottom: expanded ? (border.style !== 'none' ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})` : 'none') : 'none',
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
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ fontWeight: 'bold' }}>{title}</div>
        <div style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </div>
      </div>

      {expanded && (
        <div className="craft-collapsible-content" style={{
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
