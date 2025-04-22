import React from 'react';
import { useEditor } from '@craftjs/core';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import CraftRenderer from '../../../../../../components/craft/CraftRenderer';

/**
 * Preview component for the ContentEditor
 * Renders the current editor content in a preview mode using CraftRenderer
 */
export const Preview = () => {
  const { query } = useEditor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get the current editor state
  const json = query.serialize();

  // Simplified preview using CraftRenderer directly
  return (
    <div className={`preview-container w-full h-full ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-md overflow-hidden`}>
      {json ? (
        <CraftRenderer jsonContent={json} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No content to preview
        </div>
      )}
    </div>
  );


};

export default Preview;
