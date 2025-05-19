import { useNode, Element } from '@craftjs/core';
import React, { useEffect } from 'react'; // Removed useState
import { CollapsibleSectionSettings } from './CollapsibleSectionSettings';
import { Resizer } from '../Resizer';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';

// Default props for the CollapsibleSectionV2 component
const defaultProps = {
  background: {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 31, g: 41, b: 55, a: 1 }
  },
  color: {
    light: { r: 51, g: 51, b: 51, a: 1 },
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
    color: {
      light: { r: 0, g: 0, b: 0, a: 0.15 },
      dark: { r: 255, g: 255, b: 255, a: 0.15 }
    }
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
  title: 'CollapsibleSection',
  stepsEnabled: false,
  numberOfSteps: 3,
  headerBackground: {
    light: { r: 245, g: 247, b: 250, a: 1 },
    dark: { r: 51, g: 65, b: 85, a: 1 }
  },
  headerTextColor: {
    light: { r: 0, g: 0, b: 0, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  headerFontSize: 16, // Header font size in pixels
  expanded: false, // Default to collapsed in the viewer
  currentStep: 1, // Added currentStep to defaultProps
  stepButtonColor: {
    light: { r: 13, g: 148, b: 136, a: 1 }, // #0d9488 (teal-600)
    dark: { r: 13, g: 148, b: 136, a: 1 }  // Same teal color for dark mode
  },
  stepIndicatorColor: {
    light: { r: 13, g: 148, b: 136, a: 1 }, // #0d9488 (teal-600)
    dark: { r: 13, g: 148, b: 136, a: 1 }  // Same teal color for dark mode
  },
  autoConvertColors: true // Whether to automatically convert colors between themes
};

export const CollapsibleSection = (componentProps) => { // Renamed to avoid conflict
  // Get current theme
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        color: {
          light: { r: 0, g: 0, b: 0, a: 0.15 },
          dark: { r: 255, g: 255, b: 255, a: 0.15 }
        }
      }
    };
  }
  // Now 'props' is the final, correctly structured props object to be used throughout.

  // Determine if we're in the editor or viewer
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


  // Ensure currentStep is valid when numberOfSteps changes
  useEffect(() => {
    if (props.stepsEnabled && props.currentStep > props.numberOfSteps) {
      setProp(propUpdater => propUpdater.currentStep = 1);
    }
  }, [props.numberOfSteps, props.currentStep, props.stepsEnabled, setProp]);

  const handleNextStep = () => {
    if (props.currentStep < props.numberOfSteps) {
      const newStep = props.currentStep + 1;
      setProp(propUpdater => propUpdater.currentStep = newStep);
    }
  };

  const handlePrevStep = () => {
    if (props.currentStep > 1) {
      const newStep = props.currentStep - 1;
      setProp(propUpdater => propUpdater.currentStep = newStep);
    }
  };

  // Get theme-aware colors
  const getBackgroundColor = () => {
    try {
      const color = getThemeColor(props.background, isDark, 'container', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating background color:', error);
      return isDark ? 'rgba(31, 41, 55, 1)' : 'rgba(255, 255, 255, 1)';
    }
  };

  const getTextColor = () => {
    try {
      const color = getThemeColor(props.color, isDark, 'text', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating text color:', error);
      return isDark ? 'rgba(229, 231, 235, 1)' : 'rgba(51, 51, 51, 1)';
    }
  };

  const getHeaderBackgroundColor = () => {
    try {
      const color = getThemeColor(props.headerBackground, isDark, 'container', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating header background color:', error);
      return isDark ? 'rgba(51, 65, 85, 1)' : 'rgba(245, 247, 250, 1)';
    }
  };

  const getHeaderTextColor = () => {
    try {
      // Log the headerTextColor property for debugging
      console.log('getHeaderTextColor - props.headerTextColor:', JSON.stringify(props.headerTextColor));

      // Ensure headerTextColor is properly initialized
      if (!props.headerTextColor) {
        console.warn('getHeaderTextColor - headerTextColor is missing, using default');
        const defaultColor = isDark ?
          { r: 229, g: 231, b: 235, a: 1 } : // Default dark mode text color
          { r: 0, g: 0, b: 0, a: 1 };        // Default light mode text color
        return `rgba(${defaultColor.r}, ${defaultColor.g}, ${defaultColor.b}, ${defaultColor.a})`;
      }

      // If headerTextColor is a simple RGBA object (legacy format)
      if ('r' in props.headerTextColor) {
        console.log('getHeaderTextColor - using legacy format:', JSON.stringify(props.headerTextColor));
        const color = props.headerTextColor;
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
      }

      // If headerTextColor has theme-specific colors
      if (props.headerTextColor.light && props.headerTextColor.dark) {
        const themeColor = isDark ? props.headerTextColor.dark : props.headerTextColor.light;
        console.log('getHeaderTextColor - using theme-specific color:', JSON.stringify(themeColor));
        return `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a || 1})`;
      }

      // Use getThemeColor as a fallback
      const color = getThemeColor(props.headerTextColor, isDark, 'text', props.autoConvertColors);
      console.log('getHeaderTextColor - after getThemeColor:', JSON.stringify(color));

      const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      console.log('getHeaderTextColor - final rgba:', rgba);

      return rgba;
    } catch (error) {
      console.warn('Error generating header text color:', error);
      return isDark ? 'rgba(229, 231, 235, 1)' : 'rgba(0, 0, 0, 1)';
    }
  };

  const getBorderColor = () => {
    try {
      const color = getThemeColor(props.border.color, isDark, 'container', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating border color:', error);
      return isDark ? 'rgba(75, 85, 99, 1)' : 'rgba(204, 204, 204, 1)';
    }
  };

  const getShadowColor = () => {
    try {
      const color = getThemeColor(props.shadow.color, isDark, 'shadow', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating shadow color:', error);
      return isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    }
  };

  const getStepButtonColor = () => {
    try {
      const color = getThemeColor(props.stepButtonColor, isDark, 'button', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating step button color:', error);
      return '#0d9488'; // Default teal color
    }
  };

  const getStepIndicatorColor = () => {
    try {
      const color = getThemeColor(props.stepIndicatorColor, isDark, 'button', props.autoConvertColors);
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    } catch (error) {
      console.warn('Error generating step indicator color:', error);
      return '#0d9488'; // Default teal color
    }
  };

  const content = (
    <div
      ref={connect}
      className={`craft-collapsible-section main-component ${isInViewer ? 'in-viewer' : ''} ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
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
          backgroundColor: getHeaderBackgroundColor(),
          borderBottom: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderTop: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderLeft: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderRight: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
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
            ? `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px ${getShadowColor()}`
            : 'none',
        }}
        onClick={() => setProp(propUpdater => propUpdater.expanded = !props.expanded)}
      >
        <div style={{
          fontWeight: 'bold',
          fontSize: `${props.headerFontSize}px`,
          color: getHeaderTextColor()
        }}>{props.title}</div>
        <div style={{ transform: props.expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </div>
      </div>

      {props.expanded && (
        <div className={`craft-collapsible-content ${props.border.style === 'none' ? 'no-border' : ''}`} style={{
          padding: '10px',
          borderLeft: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderRight: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderBottom: props.border.style !== 'none' ? `${props.border.width}px ${props.border.style} ${getBorderColor()}` : 'none',
          borderBottomLeftRadius: `${props.radius}px`,
          borderBottomRightRadius: `${props.radius}px`,
          boxShadow: props.expanded && props.shadow.enabled
            ? `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px ${getShadowColor()}`
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
                          backgroundColor: isCurrentStep ? getStepIndicatorColor() : '#e5e7eb',
                          color: isCurrentStep ? 'white' : '#4b5563',
                          border: isCurrentStep ? `2px solid ${getStepIndicatorColor()}` : '1px solid #d1d5db',
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
                    backgroundColor: props.currentStep > 1 ? getStepButtonColor() : '#e5e7eb',
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
                    backgroundColor: props.currentStep < props.numberOfSteps ? getStepButtonColor() : '#e5e7eb',
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
      {parseInt(props.margin[0]) > 0 && (
        <div style={{ height: `${parseInt(props.margin[0])}px`, width: '100%' }} />
      )}

      {/* Horizontal flexbox for left/right margins */}
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Left margin spacer */}
        {parseInt(props.margin[3]) > 0 && (
          <div style={{ width: `${parseInt(props.margin[3])}px`, flexShrink: 0 }} />
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
        {parseInt(props.margin[1]) > 0 && (
          <div style={{ width: `${parseInt(props.margin[1])}px`, flexShrink: 0 }} />
        )}
      </div>

      {/* Bottom margin spacer */}
      {parseInt(props.margin[2]) > 0 && (
        <div style={{ height: `${parseInt(props.margin[2])}px`, width: '100%' }} />
      )}
    </>
  );
};

CollapsibleSection.craft = {
  displayName: 'CollapsibleSection',
  props: {
    ...defaultProps,
    // Handle backward compatibility for colors by converting single color objects to theme-aware format
    get background() {
      if (defaultProps.background.light && defaultProps.background.dark) {
        return defaultProps.background;
      }
      const lightColor = defaultProps.background;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'container')
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
    get headerBackground() {
      if (defaultProps.headerBackground.light && defaultProps.headerBackground.dark) {
        return defaultProps.headerBackground;
      }
      const lightColor = defaultProps.headerBackground;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'container')
      };
    },
    get headerTextColor() {
      if (defaultProps.headerTextColor.light && defaultProps.headerTextColor.dark) {
        return defaultProps.headerTextColor;
      }
      const lightColor = defaultProps.headerTextColor;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'text')
      };
    },
    get stepButtonColor() {
      if (defaultProps.stepButtonColor.light && defaultProps.stepButtonColor.dark) {
        return defaultProps.stepButtonColor;
      }
      const lightColor = defaultProps.stepButtonColor;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'button')
      };
    },
    get stepIndicatorColor() {
      if (defaultProps.stepIndicatorColor.light && defaultProps.stepIndicatorColor.dark) {
        return defaultProps.stepIndicatorColor;
      }
      const lightColor = defaultProps.stepIndicatorColor;
      return {
        light: lightColor,
        dark: convertToThemeColor(lightColor, true, 'button')
      };
    },
    get shadow() {
      if (defaultProps.shadow && defaultProps.shadow.color) {
        if (defaultProps.shadow.color.light && defaultProps.shadow.color.dark) {
          return defaultProps.shadow;
        }
        const lightColor = defaultProps.shadow.color;
        return {
          ...defaultProps.shadow,
          color: {
            light: lightColor,
            dark: convertToThemeColor(lightColor, true, 'shadow')
          }
        };
      }
      return defaultProps.shadow;
    },
    get border() {
      if (defaultProps.border && defaultProps.border.color) {
        if (defaultProps.border.color.light && defaultProps.border.color.dark) {
          return defaultProps.border;
        }
        const lightColor = defaultProps.border.color;
        return {
          ...defaultProps.border,
          color: {
            light: lightColor,
            dark: convertToThemeColor(lightColor, true, 'container')
          }
        };
      }
      return defaultProps.border;
    },
    autoConvertColors: true
  },
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
