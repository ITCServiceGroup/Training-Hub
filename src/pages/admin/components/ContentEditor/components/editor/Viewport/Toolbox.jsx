import { Element as CraftElement, useEditor } from '@craftjs/core';
import React from 'react';
import { FaFont, FaSquare, FaImage, FaStar, FaPuzzlePiece, FaTable, FaChevronDown, FaColumns, FaRegStar, FaListOl, FaIdCard, FaMousePointer, FaGripLines } from 'react-icons/fa';
import { HiViewColumns } from 'react-icons/hi2';
import { BsLayoutThreeColumns } from 'react-icons/bs';
import classNames from 'classnames';

import { Container } from '../../selectors/Container';
import { Text } from '../../selectors/Text';
import { Image } from '../../selectors/Image';
import { Icon } from '../../selectors/Icon';
import { Button } from '../../selectors/Button';
import { Interactive } from '../../selectors/Interactive';
import { Table } from '../../selectors/Table';
import { CollapsibleSection } from '../../selectors/CollapsibleSection';
import { Tabs } from '../../selectors/Tabs';
import { HorizontalLine } from '../../selectors/HorizontalLine';
import { BASIC_COMPONENTS, SMART_TEMPLATES } from '../../../utils/toolboxTemplates';
import { generateBasicComponent, generateSmartTemplate, createComponentMap } from '../../../utils/templateGenerator.jsx';

export const Toolbox = () => {
  const {
    connectors: { create },
    enabled
  } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  // Create component map
  const componentMap = createComponentMap({
    Container,
    Text, 
    Image,
    Icon,
    Button,
    Interactive,
    Table,
    CollapsibleSection,
    Tabs,
    HorizontalLine
  });

  // Icon component map
  const iconMap = {
    FaFont,
    FaSquare,
    FaImage, 
    FaStar,
    FaPuzzlePiece,
    FaTable,
    FaChevronDown,
    FaColumns,
    FaRegStar,
    FaListOl,
    FaIdCard,
    FaMousePointer,
    FaGripLines,
    BsLayoutThreeColumns,
    HiViewColumns
  };

  // Render basic component
  const renderBasicComponent = (config) => {
    const IconComponent = iconMap[config.icon];
    const Component = componentMap[config.id] || componentMap[config.id.replace('-', '')];  

    if (!Component) {
      console.warn(`Component '${config.id}' not found`);
      return null;
    }

    return (
      <div
        key={config.id}
        ref={(ref) => {
          if (ref) {
            create(
              ref,
              <CraftElement is={Component} {...config.props} />
            );
          }
        }}
      >
        <div className="toolbox-item" title={config.title}>
          {IconComponent && <IconComponent size={24} />}
        </div>
      </div>
    );
  };

  // Render smart template
  const renderSmartTemplate = (template) => {
    const IconComponent = iconMap[template.icon];
    const ContainerComponent = componentMap.Container;

    if (!ContainerComponent) {
      console.warn('Container component not found for template:', template.id);
      return null;
    }

    const buildChildren = (children) => {
      if (!children || !Array.isArray(children)) return null;

      return children.map((child, index) => {
        const Component = componentMap[child.component] || componentMap[child.component.toLowerCase()];
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
        ref={(ref) => {
          if (ref) {
            create(
              ref,
              <CraftElement canvas is={ContainerComponent} {...template.containerProps}>
                {buildChildren(template.children)}
              </CraftElement>
            );
          }
        }}
      >
        <div className="toolbox-item" title={template.title}>
          {IconComponent && <IconComponent size={24} />}
        </div>
      </div>
    );
  };

  return (
    <div className={classNames([
      'toolbox transition w-16 h-full flex flex-col bg-white dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600',
      {
        'opacity-0 w-0': !enabled,
      }
    ])}>
      <div className="flex flex-1 flex-col items-center pt-3 gap-3 relative">
        {/* Basic Components */}
        {BASIC_COMPONENTS.map(renderBasicComponent)}

        {/* Smart Templates Section */}
        <div className="w-full px-2 mt-4 mb-2">
          <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
          </div>
        </div>

        {/* Smart Templates */}
        {SMART_TEMPLATES.map(renderSmartTemplate)}
      </div>
    </div>
  );
};
