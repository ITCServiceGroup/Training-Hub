/**
 * Link Dialog Component
 * Modal dialog for creating and editing links with URL validation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaTimes, FaExternalLinkAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import TextFormatter from '../../utils/textFormatting';

const LinkDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialUrl = '', 
  selectedText = '',
  isEditing = false 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [url, setUrl] = useState(initialUrl);
  const [displayText, setDisplayText] = useState(selectedText);
  const [validation, setValidation] = useState({ isValid: true, error: '' });
  const [isValidating, setIsValidating] = useState(false);
  
  const urlInputRef = useRef(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setDisplayText(selectedText);
      setValidation({ isValid: true, error: '' });
      
      // Focus URL input after a short delay to ensure dialog is rendered
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
          urlInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, initialUrl, selectedText]);

  // Validate URL as user types (debounced)
  useEffect(() => {
    if (!url.trim()) {
      setValidation({ isValid: true, error: '' });
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsValidating(true);
      const result = TextFormatter.validateUrl(url);
      setValidation(result);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleSave = () => {
    if (!url.trim()) {
      setValidation({ isValid: false, error: 'URL is required' });
      return;
    }

    if (!displayText.trim()) {
      setValidation({ isValid: false, error: 'Link text is required' });
      return;
    }

    const urlValidation = TextFormatter.validateUrl(url);
    if (!urlValidation.isValid) {
      setValidation(urlValidation);
      return;
    }

    onSave({
      url: urlValidation.normalizedUrl,
      text: displayText.trim(),
      domain: urlValidation.domain
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    // Clear validation error when user starts typing
    if (validation.error) {
      setValidation({ isValid: true, error: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${
        isDark ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {isEditing ? 'Edit Link' : 'Add Link'}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-opacity-10 hover:bg-gray-500 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              URL
            </label>
            <div className="relative">
              <input
                ref={urlInputRef}
                type="text"
                value={url}
                onChange={handleUrlChange}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${
                  validation.error && !validation.isValid 
                    ? 'border-red-500 focus:ring-red-500' 
                    : ''
                }`}
              />
              
              {/* Validation indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValidating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                )}
                {!isValidating && url.trim() && validation.isValid && (
                  <FaCheck className="text-green-500" size={14} />
                )}
                {!isValidating && url.trim() && !validation.isValid && (
                  <FaExclamationTriangle className="text-red-500" size={14} />
                )}
              </div>
            </div>
            
            {/* Validation error */}
            {validation.error && !validation.isValid && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FaExclamationTriangle className="mr-1" size={12} />
                {validation.error}
              </p>
            )}
            
            {/* URL preview */}
            {validation.isValid && validation.domain && (
              <p className={`mt-1 text-sm flex items-center ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <FaExternalLinkAlt className="mr-1" size={10} />
                {validation.domain}
              </p>
            )}
          </div>

          {/* Display Text Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Link Text
            </label>
            <input
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter link text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Info text */}
          <p className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Links will open in a new tab for security.
          </p>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t ${
          isDark ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              isDark 
                ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!url.trim() || !displayText.trim() || !validation.isValid || isValidating}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
              !url.trim() || !displayText.trim() || !validation.isValid || isValidating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            }`}
          >
            {isEditing ? 'Update Link' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDialog;
