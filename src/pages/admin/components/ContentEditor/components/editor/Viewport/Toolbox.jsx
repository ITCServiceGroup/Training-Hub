import { Element as CraftElement, useEditor } from '@craftjs/core';
import React from 'react';
import { FaFont, FaSquare, FaImage, FaStar, FaPuzzlePiece, FaTable, FaChevronDown, FaColumns, FaRegStar, FaListOl, FaIdCard, FaMousePointer } from 'react-icons/fa';
import { HiViewColumns } from 'react-icons/hi2';
import { BsLayoutThreeColumns, BsGrid1X2, BsViewStacked } from 'react-icons/bs';
import { MdViewColumn, MdViewWeek } from 'react-icons/md';

import { Container } from '../../selectors/Container';
import { Text } from '../../selectors/Text';
import { Image } from '../../selectors/Image';
import { Icon } from '../../selectors/Icon';
import { Button } from '../../selectors/Button';
import { Interactive } from '../../selectors/Interactive';
import { Table } from '../../selectors/Table';
import { CollapsibleSection } from '../../selectors/CollapsibleSection';
import { Tabs } from '../../selectors/Tabs';
import classNames from 'classnames';

export const Toolbox = () => {
  const {
    connectors: { create },
    enabled
  } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  return (
    <div className={classNames([
      'toolbox transition w-16 h-full flex flex-col bg-white dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600',
      {
        'opacity-0 w-0': !enabled,
      }
    ])}>
      <div className="flex flex-1 flex-col items-center pt-3 gap-3 relative">

        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                color={{ r: 0, g: 0, b: 0, a: 1 }}
                height="auto"
                width="100%"
                padding={['20', '20', '20', '20']}
              ></CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Container">
            <FaSquare size={24} />
          </div>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement is={Text} fontSize="16" textAlign="left" text="Text Block" />
            );
          }}
        >
          <div className="toolbox-item" title="Text">
            <FaFont size={24} />
          </div>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement is={Image} src="https://placehold.co/300x200" alt="Placeholder" />
            );
          }}
        >
          <div className="toolbox-item" title="Image">
            <FaImage size={24} />
          </div>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement is={Icon} iconName="star" iconSize={60} />
            );
          }}
        >
          <div className="toolbox-item" title="Icon">
            <FaStar size={24} />
          </div>
        </div>
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement is={Button} text="Click Me" size="medium" background={{ light: { r: 59, g: 130, b: 246, a: 1 }, dark: { r: 96, g: 165, b: 250, a: 1 } }} hoverBackground={{ light: { r: 37, g: 99, b: 235, a: 1 }, dark: { r: 59, g: 130, b: 246, a: 1 } }} />
            );
          }}
        >
          <div className="toolbox-item" title="Button">
            <FaMousePointer size={24} />
          </div>
        </div>


        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                is={Table}
                width="100%"
                tableData={{
                  cells: {},
                  rowCount: 4,
                  columnCount: 4,
                  hasHeader: true
                }}
              />
            );
          }}
        >
          <div className="toolbox-item" title="Table">
            <FaTable size={24} />
          </div>
        </div>

        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={CollapsibleSection}
                width="100%"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['16', '16', '16', '16']}
                title="Collapsible Section"
                stepsEnabled={false}
                numberOfSteps={3}
              />
            );
          }}
        >
          <div className="toolbox-item" title="Collapsible Section">
            <FaChevronDown size={24} />
          </div>
        </div>

        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Tabs}
                width="100%"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['16', '16', '16', '16']}
                numberOfTabs={3}
                tabTitles={['Tab 1', 'Tab 2', 'Tab 3']}
              />
            );
          }}
        >
          <div className="toolbox-item" title="Tabs">
            <FaColumns size={24} />
          </div>
        </div>



        {/* Interactive Elements Button */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                is={Interactive}
                name=""
                title="Interactive Element"
                description="Select an interactive element from the settings panel"
              />
            );
          }}
        >
          <div className="toolbox-item" title="Interactive Element">
            <FaPuzzlePiece size={24} />
          </div>
        </div>

        {/* Smart Templates Section */}
        <div className="w-full px-2 mt-4 mb-2">
          <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
          </div>
        </div>

        {/* Feature Card Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                background={{ light: { r: 255, g: 255, b: 255, a: 1 }, dark: { r: 31, g: 41, b: 55, a: 1 } }}
                padding={['24', '24', '24', '24']}
                radius={8}
                shadow={{ enabled: true, x: 0, y: 2, blur: 8, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.1 } }}
                borderStyle="solid"
                borderWidth={1}
                borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}
                alignItems="center"
                width="100%"
              >
                <Icon iconName="star" iconSize={64} iconAlign="center" margin={['0', '0', '16', '0']} iconColor={{ light: { r: 59, g: 130, b: 246, a: 1 }, dark: { r: 96, g: 165, b: 250, a: 1 } }} />
                <Text fontSize="20" fontWeight="600" text="Feature Title" textAlign="center" margin={['0', '0', '12', '0']} />
                <Text fontSize="16" text="Describe your feature here." textAlign="center" margin={['0', '0', '20', '0']} />
                <Button text="Learn More" size="medium" background={{ light: { r: 59, g: 130, b: 246, a: 1 }, dark: { r: 96, g: 165, b: 250, a: 1 } }} hoverBackground={{ light: { r: 37, g: 99, b: 235, a: 1 }, dark: { r: 59, g: 130, b: 246, a: 1 } }} />
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Feature Card">
            <FaIdCard size={24} />
          </div>
        </div>

        {/* Hero Section Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                background={{ light: { r: 248, g: 250, b: 252, a: 1 }, dark: { r: 15, g: 23, b: 42, a: 1 } }}
                padding={['60', '40', '60', '40']}
                width="100%"
                alignItems="center"
              >
                <Text fontSize="48" fontWeight="700" text="Your Amazing Headline" textAlign="center" margin={['0', '0', '16', '0']} />
                <Text fontSize="20" text="Supporting text that explains your value proposition." textAlign="center" margin={['0', '0', '32', '0']} />
                <Button text="Get Started" size="large" background={{ light: { r: 59, g: 130, b: 246, a: 1 }, dark: { r: 96, g: 165, b: 250, a: 1 } }} hoverBackground={{ light: { r: 37, g: 99, b: 235, a: 1 }, dark: { r: 59, g: 130, b: 246, a: 1 } }} />
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Hero Section">
            <FaRegStar size={24} />
          </div>
        </div>

        {/* Two Column Layout Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                flexDirection="row"
                width="100%"
                padding={['20', '20', '20', '20']}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <CraftElement canvas is={Container} width="48%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="24" fontWeight="600" text="Left Column" margin={['0', '0', '16', '0']} />
                  <Text fontSize="16" text="Content for the left column." />
                </CraftElement>
                <CraftElement canvas is={Container} width="48%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="24" fontWeight="600" text="Right Column" margin={['0', '0', '16', '0']} />
                  <Text fontSize="16" text="Content for the right column." />
                </CraftElement>
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Two Column Layout">
            <FaColumns size={24} />
          </div>
        </div>

        {/* Three Column Layout Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                flexDirection="row"
                width="100%"
                padding={['20', '20', '20', '20']}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <CraftElement canvas is={Container} width="32%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="20" fontWeight="600" text="Column 1" margin={['0', '0', '12', '0']} />
                  <Text fontSize="16" text="First column content." />
                </CraftElement>
                <CraftElement canvas is={Container} width="32%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="20" fontWeight="600" text="Column 2" margin={['0', '0', '12', '0']} />
                  <Text fontSize="16" text="Second column content." />
                </CraftElement>
                <CraftElement canvas is={Container} width="32%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="20" fontWeight="600" text="Column 3" margin={['0', '0', '12', '0']} />
                  <Text fontSize="16" text="Third column content." />
                </CraftElement>
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Three Column Layout">
            <BsLayoutThreeColumns size={24} />
          </div>
        </div>

        {/* Four Column Layout Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                flexDirection="row"
                width="100%"
                padding={['20', '20', '20', '20']}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <CraftElement canvas is={Container} width="23%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="18" fontWeight="600" text="Column 1" margin={['0', '0', '12', '0']} />
                  <Text fontSize="14" text="First column." />
                </CraftElement>
                <CraftElement canvas is={Container} width="23%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="18" fontWeight="600" text="Column 2" margin={['0', '0', '12', '0']} />
                  <Text fontSize="14" text="Second column." />
                </CraftElement>
                <CraftElement canvas is={Container} width="23%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="18" fontWeight="600" text="Column 3" margin={['0', '0', '12', '0']} />
                  <Text fontSize="14" text="Third column." />
                </CraftElement>
                <CraftElement canvas is={Container} width="23%" padding={['0', '8', '0', '8']} borderStyle="solid" borderWidth={1} borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}>
                  <Text fontSize="18" fontWeight="600" text="Column 4" margin={['0', '0', '12', '0']} />
                  <Text fontSize="14" text="Fourth column." />
                </CraftElement>
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Four Column Layout">
            <HiViewColumns size={24} />
          </div>
        </div>

        {/* Step Card Template */}
        <div
          ref={(ref) => {
            create(
              ref,
              <CraftElement
                canvas
                is={Container}
                background={{ light: { r: 255, g: 255, b: 255, a: 1 }, dark: { r: 31, g: 41, b: 55, a: 1 } }}
                padding={['20', '20', '20', '20']}
                radius={8}
                borderStyle="solid"
                borderWidth={1}
                borderColor={{ light: { r: 229, g: 231, b: 235, a: 1 }, dark: { r: 75, g: 85, b: 99, a: 1 } }}
                flexDirection="row"
                alignItems="flex-start"
                width="100%"
              >
                <CraftElement
                  canvas
                  is={Container}
                  width="60px"
                  height="60px"
                  background={{ light: { r: 59, g: 130, b: 246, a: 1 }, dark: { r: 96, g: 165, b: 250, a: 1 } }}
                  radius={30}
                  alignItems="center"
                  justifyContent="center"
                  margin={['0', '16', '0', '0']}
                >
                  <Text fontSize="24" fontWeight="700" text="1" textAlign="center" color={{ light: { r: 255, g: 255, b: 255, a: 1 }, dark: { r: 255, g: 255, b: 255, a: 1 } }} />
                </CraftElement>
                <CraftElement canvas is={Container} width="calc(100% - 76px)">
                  <Text fontSize="20" fontWeight="600" text="Step Title" margin={['0', '0', '8', '0']} />
                  <Text fontSize="16" text="Describe this step in your process or tutorial." />
                </CraftElement>
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Step Card">
            <FaListOl size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
