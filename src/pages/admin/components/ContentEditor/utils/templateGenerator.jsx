/**
 * Template generation utilities for the toolbox
 * Converts template configurations to CraftJS elements
 */

/**
 * Create a CraftJS element from component configuration
 * @param {Object} CraftElement - CraftJS Element component
 * @param {Object} componentMap - Map of component names to components
 * @param {string} componentName - Name of the component
 * @param {Object} props - Component props
 * @param {Array} children - Child elements
 * @returns {JSX.Element} - CraftJS element
 */
export const createCraftElement = (CraftElement, componentMap, componentName, props = {}, children = null) => {
  const Component = componentMap[componentName];
  if (!Component) {
    console.warn(`Component '${componentName}' not found in componentMap`);
    return null;
  }

  if (children && Array.isArray(children)) {
    return (
      <CraftElement canvas={props.canvas} is={Component} {...props}>
        {children.map((child, index) => 
          createCraftElement(CraftElement, componentMap, child.component, child.props, child.children)
        )}
      </CraftElement>
    );
  }

  return <CraftElement canvas={props.canvas} is={Component} {...props} />;
};

/**
 * Generate a basic component toolbox item
 * @param {Object} config - Component configuration
 * @param {Object} CraftElement - CraftJS Element component  
 * @param {Object} componentMap - Map of component names to components
 * @param {Function} create - Craft create function
 * @param {Function} ref - React ref function
 * @returns {JSX.Element} - Toolbox item JSX
 */
export const generateBasicComponent = (config, CraftElement, componentMap, create, ref) => {
  const Component = componentMap[config.id];
  if (!Component) {
    console.warn(`Component '${config.id}' not found in componentMap`);
    return null;
  }

  return (
    <div
      key={config.id}
      ref={(refElement) => {
        if (refElement) {
          create(
            refElement,
            <CraftElement is={Component} {...config.props} />
          );
        }
        if (ref) ref(refElement);
      }}
    >
      <div className="toolbox-item" title={config.title}>
        {/* Icon will be rendered by the parent component */}
      </div>
    </div>
  );
};

/**
 * Generate a smart template toolbox item
 * @param {Object} template - Template configuration
 * @param {Object} CraftElement - CraftJS Element component
 * @param {Object} componentMap - Map of component names to components  
 * @param {Function} create - Craft create function
 * @param {Function} ref - React ref function
 * @returns {JSX.Element} - Toolbox item JSX
 */
export const generateSmartTemplate = (template, CraftElement, componentMap, create, ref) => {
  const ContainerComponent = componentMap.Container;
  if (!ContainerComponent) {
    console.warn('Container component not found for template:', template.id);
    return null;
  }

  const buildChildren = (children) => {
    if (!children || !Array.isArray(children)) return null;

    return children.map((child, index) => {
      const Component = componentMap[child.component];
      if (!Component) {
        console.warn(`Template child component '${child.component}' not found`);
        return null;
      }

      if (child.children && Array.isArray(child.children)) {
        return (
          <CraftElement key={index} canvas={child.props?.canvas} is={Component} {...child.props}>
            {buildChildren(child.children)}
          </CraftElement>
        );
      }

      return <CraftElement key={index} is={Component} {...child.props} />;
    });
  };

  return (
    <div
      key={template.id}
      ref={(refElement) => {
        if (refElement) {
          create(
            refElement,
            <CraftElement canvas is={ContainerComponent} {...template.containerProps}>
              {buildChildren(template.children)}
            </CraftElement>
          );
        }
        if (ref) ref(refElement);
      }}
    >
      <div className="toolbox-item" title={template.title}>
        {/* Icon will be rendered by the parent component */}
      </div>
    </div>
  );
};

/**
 * Create component map from imported components
 * @param {Object} components - Object containing imported components
 * @returns {Object} - Component map with normalized keys
 */
export const createComponentMap = (components) => {
  return {
    Container: components.Container,
    Text: components.Text,
    Image: components.Image,
    Icon: components.Icon,
    Button: components.Button,
    'horizontal-line': components.HorizontalLine,
    HorizontalLine: components.HorizontalLine,
    Table: components.Table,
    'collapsible-section': components.CollapsibleSection,
    CollapsibleSection: components.CollapsibleSection,
    Tabs: components.Tabs,
    'tabs': components.Tabs,
    Interactive: components.Interactive,
    'interactive': components.Interactive,
    // Normalized keys for template generation
    'container': components.Container,
    'text': components.Text,
    'image': components.Image,
    'icon': components.Icon,
    'button': components.Button,
    'table': components.Table
  };
};