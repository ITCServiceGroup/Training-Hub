/**
 * Text Context Menu Component
 * Floating menu that appears when text is selected, providing formatting options
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaUnlink,
  FaEdit,
  FaTimes
} from 'react-icons/fa';

const TextContextMenu = ({ 
  isVisible,
  position,
  selectedText,
  activeFormats = {},
  onFormat,
  onClose,
  containerRef
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!isVisible || !position || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let { x, y } = position;

    // Center the menu horizontally by subtracting half its width
    x = x - (menuRect.width / 2);

    // Adjust horizontal position to keep within viewport
    if (x + menuRect.width > viewport.width - 10) {
      x = viewport.width - menuRect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewport.height - 10) {
      y = y - menuRect.height - 10; // Show above selection
    }
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [isVisible, position]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Don't close if clicking within the container (ContentEditable)
        if (containerRef?.current && containerRef.current.contains(event.target)) {
          return;
        }
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose, containerRef]);

  if (!isVisible || !selectedText) {
    return null;
  }

  const formatButtons = [
    {
      id: 'bold',
      icon: FaBold,
      label: 'Bold',
      shortcut: 'Ctrl+B',
      isActive: activeFormats.bold
    },
    {
      id: 'italic',
      icon: FaItalic,
      label: 'Italic',
      shortcut: 'Ctrl+I',
      isActive: activeFormats.italic
    },
    {
      id: 'underline',
      icon: FaUnderline,
      label: 'Underline',
      shortcut: 'Ctrl+U',
      isActive: activeFormats.underline
    }
  ];

  // Create link buttons based on whether there's an existing link
  const linkButtons = activeFormats.link ? [
    // When there's an existing link, show both Edit and Remove buttons
    {
      id: 'editLink',
      icon: FaEdit,
      label: 'Edit Link',
      shortcut: 'Ctrl+K',
      isActive: false,
      isLink: true
    },
    {
      id: 'removeLink',
      icon: FaUnlink,
      label: 'Remove Link',
      shortcut: '',
      isActive: false,
      isLink: true
    }
  ] : [
    // When there's no link, show Add Link button
    {
      id: 'link',
      icon: FaLink,
      label: 'Add Link',
      shortcut: 'Ctrl+K',
      isActive: false,
      isLink: true
    }
  ];

  const handleFormatClick = (formatId) => {
    onFormat(formatId);
  };

  // Render the context menu using a portal to ensure it's at the document root
  // This prevents any stacking context issues from parent components
  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      data-context-menu="text-formatting"
      className={`fixed flex items-center rounded-lg shadow-lg border ${
        isDark
          ? 'bg-slate-800 border-slate-600'
          : 'bg-white border-gray-200'
      }`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translateY(-100%)',
        marginTop: '-8px',
        zIndex: 99999 // Much higher than any toolbar z-index to ensure it's always on top
      }}
    >
      {/* Arrow pointing down to selection */}
      <div 
        className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
          isDark ? 'border-t-slate-800' : 'border-t-white'
        }`}
        style={{ marginTop: '-1px' }}
      />

      {/* Format buttons */}
      <div className="flex items-center p-1 gap-1">
        {formatButtons.map((button, index) => (
          <button
            key={button.id}
            onClick={() => handleFormatClick(button.id)}
            title={`${button.label} (${button.shortcut})`}
            className={`p-2 rounded-md transition-colors ${
              button.isActive
                ? isDark
                  ? 'bg-primary text-white'
                  : 'bg-primary text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <button.icon size={14} />
          </button>
        ))}

        {/* Separator */}
        <div className={`w-px h-6 mx-1 ${
          isDark ? 'bg-slate-600' : 'bg-gray-300'
        }`} />

        {/* Link buttons */}
        {linkButtons.map((button, index) => (
          <button
            key={button.id}
            onClick={() => handleFormatClick(button.id)}
            title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            className={`p-2 rounded-md transition-colors ${
              button.id === 'removeLink'
                ? isDark
                  ? 'text-red-400 hover:bg-red-900 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-100 hover:text-red-700'
                : (button.id === 'editLink' || button.id === 'link')
                  ? isDark
                    ? 'text-blue-400 hover:bg-blue-900 hover:text-blue-300'
                    : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                  : isDark
                    ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <button.icon size={14} />
          </button>
        ))}

        {/* Separator */}
        <div className={`w-px h-6 mx-1 ${
          isDark ? 'bg-slate-600' : 'bg-gray-300'
        }`} />

        {/* Close button */}
        <button
          onClick={onClose}
          title="Close"
          className={`p-2 rounded-md transition-colors ${
            isDark
              ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Selected text preview */}
      {selectedText.length > 30 && (
        <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded ${
          isDark 
            ? 'bg-slate-700 text-gray-300 border border-slate-600' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          "{selectedText.substring(0, 30)}..."
        </div>
      )}
    </div>,
    document.body // Render at document root to avoid stacking context issues
  );
};

export default TextContextMenu;
