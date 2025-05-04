import { useEditor } from '@craftjs/core';
import React from 'react';

import { Toolbox } from './Toolbox';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Viewport = ({ children }) => {
  const {
    enabled,
    connectors,
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <div className="viewport">
      <div className="flex h-full overflow-hidden flex-row w-full">
        <Toolbox />
        <div className="page-container flex flex-1 h-full flex-col overflow-hidden">
          <Header />
          <div
            className={`craftjs-renderer flex-1 w-full transition pb-8 overflow-auto ${enabled ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
            ref={(ref) => {
              connectors.select(connectors.hover(ref, null), null);
            }}
            style={{ maxHeight: 'calc(100% - 48px)' }} /* 48px accounts for the header height */
            data-editor-drag-area="true" /* Add this attribute to help with drag detection */
          >
            <div className="relative flex-col flex items-center pt-8">
              {children}
            </div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
};
