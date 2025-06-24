/**
 * Demo page for testing text formatting functionality
 * This page demonstrates the new text formatting features
 */

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import TextFormatter from '../utils/textFormatting';
import TextSelectionManager from '../utils/textSelection';
import useTextFormatting from '../hooks/useTextFormatting';
import TextContextMenu from '../components/common/TextContextMenu';
import LinkDialog from '../components/common/LinkDialog';

const TextFormattingDemo = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [content, setContent] = useState('Select this text and try formatting it with bold, italic, underline, or links!');
  const contentRef = React.useRef(null);

  const {
    activeFormats,
    selectedText,
    showContextMenu,
    contextMenuPosition,
    showLinkDialog,
    linkDialogData,
    applyFormat,
    handleLinkSave,
    closeContextMenu,
    closeLinkDialog
  } = useTextFormatting(contentRef, (newHtml) => {
    setContent(newHtml);
  });

  const handleManualFormat = (formatType) => {
    if (!selectedText) {
      alert('Please select some text first!');
      return;
    }
    applyFormat(formatType);
  };

  const testUrlValidation = () => {
    const testUrls = [
      'https://example.com',
      'example.com',
      'invalid-url',
      'http://test.com/path'
    ];

    const results = testUrls.map(url => ({
      url,
      result: TextFormatter.validateUrl(url)
    }));

    console.log('URL Validation Results:', results);
    alert('Check console for URL validation results');
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Text Formatting Demo</h1>
        
        {/* Demo Content Area */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Interactive Text Editor</h2>
          <div className="relative">
            <div
              ref={contentRef}
              contentEditable
              className={`p-4 border-2 border-dashed rounded-lg min-h-32 focus:outline-none focus:border-blue-500 ${
                isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-300 bg-white'
              }`}
              style={{
                fontSize: '16px',
                lineHeight: '1.5'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={(e) => setContent(e.target.innerHTML)}
            />

            {/* Context Menu */}
            <TextContextMenu
              isVisible={showContextMenu}
              position={contextMenuPosition}
              selectedText={selectedText}
              activeFormats={activeFormats}
              onFormat={applyFormat}
              onClose={closeContextMenu}
              containerRef={contentRef}
            />

            {/* Link Dialog */}
            <LinkDialog
              isOpen={showLinkDialog}
              onClose={closeLinkDialog}
              onSave={handleLinkSave}
              initialUrl={linkDialogData.url}
              selectedText={linkDialogData.text}
              isEditing={linkDialogData.isEditing}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Select text and use the context menu, keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K), or the buttons below.
          </p>
        </div>

        {/* Manual Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Manual Controls</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleManualFormat('bold')}
              className={`px-4 py-2 rounded ${
                activeFormats.bold 
                  ? 'bg-blue-500 text-white' 
                  : isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => handleManualFormat('italic')}
              className={`px-4 py-2 rounded ${
                activeFormats.italic 
                  ? 'bg-blue-500 text-white' 
                  : isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => handleManualFormat('underline')}
              className={`px-4 py-2 rounded ${
                activeFormats.underline 
                  ? 'bg-blue-500 text-white' 
                  : isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Underline
            </button>
            <button
              onClick={() => handleManualFormat('link')}
              className={`px-4 py-2 rounded ${
                activeFormats.link 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}
            >
              {activeFormats.link ? 'Remove Link' : 'Add Link'}
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <p><strong>Selected Text:</strong> {selectedText || 'None'}</p>
            <p><strong>Active Formats:</strong> {Object.entries(activeFormats).filter(([_, active]) => active).map(([format]) => format).join(', ') || 'None'}</p>
            <p><strong>Context Menu Visible:</strong> {showContextMenu ? 'Yes' : 'No'}</p>
            <p><strong>Link Dialog Open:</strong> {showLinkDialog ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Utilities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Utilities</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testUrlValidation}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test URL Validation
            </button>
            <button
              onClick={() => {
                const hasSelection = TextSelectionManager.hasSelection();
                const selectionData = TextSelectionManager.getSelection();
                console.log('Selection Test:', { hasSelection, selectionData });
                alert(`Has Selection: ${hasSelection}\nCheck console for details`);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Test Selection Detection
            </button>
            <button
              onClick={() => {
                setContent('This is <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, and <a href="https://example.com">linked</a> text.');
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Load Sample Content
            </button>
            <button
              onClick={() => {
                setContent('Select this text and try formatting it with bold, italic, underline, or links!');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset Content
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Select text in the editor above</li>
            <li>Use the context menu that appears</li>
            <li>Try keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+K (Link)</li>
            <li>Use the manual control buttons</li>
            <li>Test URL validation and selection detection with the utility buttons</li>
            <li>Load sample content to see formatted text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextFormattingDemo;
