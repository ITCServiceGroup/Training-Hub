import { Element as CraftElement, useEditor } from '@craftjs/core';
import React from 'react';
import { FaFont, FaSquare, FaImage, FaRegCreditCard, FaPuzzlePiece, FaTable, FaChevronDown, FaColumns } from 'react-icons/fa';

import { Container } from '../../selectors/Container';
import { Text } from '../../selectors/Text';
import { Image } from '../../selectors/Image';
import { Card } from '../../selectors/Card';
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
              <CraftElement
                canvas
                is={Card}
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['16', '16', '16', '16']}
              >
                <Text fontSize="18" fontWeight="700" text="Card Title" />
                <Text fontSize="14" text="Card content goes here. You can add more elements inside this card." />
              </CraftElement>
            );
          }}
        >
          <div className="toolbox-item" title="Card">
            <FaRegCreditCard size={24} />
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
      </div>
    </div>
  );
};
