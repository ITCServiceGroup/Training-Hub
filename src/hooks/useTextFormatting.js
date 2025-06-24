/**
 * Text Formatting Hook
 * Manages text formatting state and operations for ContentEditable components
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import TextSelectionManager from '../utils/textSelection';
import TextFormatter from '../utils/textFormatting';

export const useTextFormatting = (containerRef, onTextChange) => {
  const [activeFormats, setActiveFormats] = useState({});
  const [selectedText, setSelectedText] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkDialogData, setLinkDialogData] = useState({ url: '', text: '', isEditing: false });

  const selectionTimeoutRef = useRef(null);
  const lastSelectionRef = useRef(null);
  const isUpdatingContentRef = useRef(false);
  const savedRangeRef = useRef(null);

  /**
   * Update active formats based on current selection
   */
  const updateActiveFormats = useCallback(() => {
    if (!containerRef.current) return;

    const formats = TextFormatter.getActiveFormats(containerRef.current);
    setActiveFormats(formats);
  }, [containerRef]);

  /**
   * Handle text selection changes
   */
  const handleSelectionChange = useCallback(() => {
    // Skip if we're currently updating content to prevent loops
    if (isUpdatingContentRef.current) {
      return;
    }

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Debounce selection handling to avoid excessive updates
    selectionTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      // Check for any text selection first
      const globalSelection = window.getSelection();
      const hasAnySelection = globalSelection && globalSelection.rangeCount > 0 && !globalSelection.isCollapsed;

      if (!hasAnySelection) {
        // No selection anywhere, hide context menu
        if (selectedText || showContextMenu) {
          setSelectedText('');
          setShowContextMenu(false);
          setActiveFormats({});
          lastSelectionRef.current = null;
        }
        return;
      }

      // Check if the selection is within our container
      const selectionData = TextSelectionManager.getSelectionInElement(containerRef.current);

      if (selectionData && selectionData.text.trim()) {
        // Only update if the selection has actually changed
        const currentText = selectionData.text;
        if (currentText !== selectedText) {
          setSelectedText(currentText);
          updateActiveFormats();

          // Calculate position for context menu
          const range = selectionData.range;
          const rect = range.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          setContextMenuPosition({
            x: rect.left + (rect.width / 2), // Center horizontally on selection
            y: rect.top + window.scrollY - 8 // Position above selection with small gap, accounting for scroll
          });

          setShowContextMenu(true);
          lastSelectionRef.current = selectionData;
        }
      } else {
        // Selection exists but not in our container, hide context menu
        if (selectedText || showContextMenu) {
          setSelectedText('');
          setShowContextMenu(false);
          setActiveFormats({});
          lastSelectionRef.current = null;
        }
      }
    }, 150);
  }, [containerRef, updateActiveFormats]);

  /**
   * Apply formatting to selected text
   */
  const applyFormat = useCallback((formatType, options = {}) => {
    if (!containerRef.current) return false;

    try {
      let success = false;

      if (formatType === 'link' || formatType === 'editLink' || formatType === 'removeLink') {
        // Handle link formatting specially
        const existingLink = TextFormatter.getLinkAtSelection(containerRef.current);

        if (formatType === 'removeLink' && existingLink) {
          // Remove existing link - replace the link element with its text content
          try {
            const linkElement = existingLink.element;
            const textContent = linkElement.textContent;
            const textNode = document.createTextNode(textContent);

            // Replace the link element with just its text
            linkElement.parentNode.replaceChild(textNode, linkElement);

            // Select the text that was previously linked
            const range = document.createRange();
            range.selectNodeContents(textNode);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // Update the component content
            if (onTextChange) {
              onTextChange(containerRef.current.innerHTML);
            }

            // Update active formats to reflect the link removal
            updateActiveFormats();

            return true;
          } catch (error) {
            console.warn('Failed to remove link:', error);
            return false;
          }
        } else if ((formatType === 'editLink' || formatType === 'link') && existingLink) {
          // Edit existing link
          setLinkDialogData({
            url: existingLink.url,
            text: existingLink.text,
            isEditing: true
          });
          setShowLinkDialog(true);
          return true;
        } else if ((formatType === 'link') && selectedText) {
          // Create new link - save the current selection range
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
          }

          setLinkDialogData({
            url: '',
            text: selectedText,
            isEditing: false
          });
          setShowLinkDialog(true);
          return true;
        }
      } else {
        // Handle other formatting (bold, italic, underline)
        // Save the current selection range before applying formatting
        const currentSelection = window.getSelection();
        let savedRange = null;
        let selectionStartOffset = 0;
        let selectionEndOffset = 0;

        if (currentSelection && currentSelection.rangeCount > 0) {
          savedRange = currentSelection.getRangeAt(0).cloneRange();

          // Calculate the absolute position of the selection within the container
          const containerRange = document.createRange();
          containerRange.selectNodeContents(containerRef.current);
          containerRange.setEnd(savedRange.startContainer, savedRange.startOffset);
          selectionStartOffset = containerRange.toString().length;
          selectionEndOffset = selectionStartOffset + selectedText.length;
        }

        // Set flag to prevent selection change loops during formatting
        isUpdatingContentRef.current = true;

        success = TextFormatter.toggleFormat(formatType, options, containerRef.current);

        if (success) {
          // Update the text content - pass flag to indicate this is a formatting operation
          if (onTextChange) {
            onTextChange(containerRef.current.innerHTML, true);
          }

          // Restore selection using the absolute position after DOM update
          setTimeout(() => {
            try {
              if (containerRef.current && selectionStartOffset >= 0) {
                // Create a range to find the text at the original position
                const walker = document.createTreeWalker(
                  containerRef.current,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );

                let currentOffset = 0;
                let startNode = null;
                let startOffset = 0;
                let endNode = null;
                let endOffset = 0;

                // Find the start position
                let textNode;
                while (textNode = walker.nextNode()) {
                  const nodeLength = textNode.textContent.length;

                  if (currentOffset + nodeLength > selectionStartOffset && !startNode) {
                    startNode = textNode;
                    startOffset = selectionStartOffset - currentOffset;
                  }

                  if (currentOffset + nodeLength >= selectionEndOffset && !endNode) {
                    endNode = textNode;
                    endOffset = selectionEndOffset - currentOffset;
                    break;
                  }

                  currentOffset += nodeLength;
                }

                // Ensure we have valid nodes and offsets
                if (startNode && !endNode) {
                  endNode = startNode;
                  endOffset = startOffset + selectedText.length;
                }

                // Clamp offsets to valid ranges
                if (startNode) {
                  startOffset = Math.max(0, Math.min(startOffset, startNode.textContent.length));
                }
                if (endNode) {
                  endOffset = Math.max(0, Math.min(endOffset, endNode.textContent.length));
                }

                // Create and apply the selection if we found the positions
                if (startNode && endNode) {
                  const range = document.createRange();
                  range.setStart(startNode, Math.max(0, startOffset));
                  range.setEnd(endNode, Math.min(endNode.textContent.length, endOffset));

                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);

                  // Update the selected text state to keep context menu visible
                  setSelectedText(selectedText);

                  // Update active formats with a small delay to ensure DOM is stable
                  // and the selection is properly established
                  setTimeout(() => {
                    updateActiveFormats();
                  }, 50); // Increased delay to ensure everything is stable
                } else {
                  // Fallback: clear selection state
                  setSelectedText('');
                  setShowContextMenu(false);
                }
              }

              isUpdatingContentRef.current = false;
            } catch (error) {
              console.warn('Failed to restore selection after formatting:', error);
              isUpdatingContentRef.current = false;
              // Fallback: clear selection state
              setSelectedText('');
              setShowContextMenu(false);
            }
          }, 100);

          // Clean up any formatting issues
          setTimeout(() => {
            TextFormatter.cleanupFormatting(containerRef.current);
          }, 200);
        } else {
          isUpdatingContentRef.current = false;
        }
      }

      return success;
    } catch (error) {
      console.warn('Failed to apply format:', error);
      return false;
    }
  }, [containerRef, selectedText, onTextChange, updateActiveFormats]);

  /**
   * Remove formatting from selected text
   */
  const removeFormat = useCallback((formatType) => {
    if (!containerRef.current) return false;

    try {
      const success = TextFormatter.removeFormat(formatType, containerRef.current);
      
      if (success) {
        if (onTextChange) {
          onTextChange(containerRef.current.innerHTML);
        }
        updateActiveFormats();
      }

      return success;
    } catch (error) {
      console.warn('Failed to remove format:', error);
      return false;
    }
  }, [containerRef, onTextChange, updateActiveFormats]);

  /**
   * Handle link creation/editing
   */
  const handleLinkSave = useCallback((linkData, linkColors = {}) => {
    console.log('handleLinkSave called with:', linkData);

    if (!containerRef.current) {
      console.warn('No container ref available');
      setShowLinkDialog(false);
      return;
    }

    // Use text from linkData if selectedText is not available
    const textToUse = linkData.text || selectedText;
    if (!textToUse || !textToUse.trim()) {
      console.warn('No text available for link');
      setShowLinkDialog(false);
      return;
    }

    try {
      // Validate URL first
      const validation = TextFormatter.validateUrl(linkData.url);
      if (!validation.isValid) {
        console.warn('Invalid URL:', validation.error);
        return;
      }

      console.log('URL validation passed:', validation);

      // Create link HTML with the text from the dialog or selected text
      const linkText = textToUse;

      // Build inline styles for the link if colors are provided
      let styleAttr = '';
      if (linkColors.color) {
        const { r, g, b, a } = linkColors.color;
        styleAttr = ` style="color: rgba(${r}, ${g}, ${b}, ${a}); text-decoration: underline;"`;
      }

      const linkHtml = `<a href="${validation.normalizedUrl}" target="_blank" rel="noopener noreferrer"${styleAttr}>${linkText}</a>`;

      console.log('Created link HTML:', linkHtml);

      // Set flag to prevent selection change loops
      isUpdatingContentRef.current = true;

      // Restore the saved selection range if we have one
      if (savedRangeRef.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);

        // Use the proper TextSelectionManager method to replace selection
        const success = TextSelectionManager.replaceSelection(linkHtml, false);

        if (success) {
          console.log('Link added successfully using TextSelectionManager');

          // Notify of change
          if (onTextChange) {
            onTextChange(containerRef.current.innerHTML);
          }
        } else {
          console.warn('Failed to replace selection with link');
        }

        // Clear the saved range
        savedRangeRef.current = null;
      } else {
        console.warn('No saved selection range available');
      }

      // Clear the flag after a short delay
      setTimeout(() => {
        isUpdatingContentRef.current = false;
      }, 100);

      // Close dialogs and clear state
      setShowLinkDialog(false);
      setShowContextMenu(false);
      setSelectedText('');
      setActiveFormats({});

    } catch (error) {
      console.error('Failed to save link:', error);
      setShowLinkDialog(false);
    }
  }, [containerRef, onTextChange]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((event) => {
    if (!containerRef.current) return;

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    
    if (!isCtrlOrCmd) return;

    let formatType = null;
    let preventDefault = true;

    switch (event.key.toLowerCase()) {
      case 'b':
        formatType = 'bold';
        break;
      case 'i':
        formatType = 'italic';
        break;
      case 'u':
        formatType = 'underline';
        break;
      case 'k':
        formatType = 'link';
        break;
      default:
        preventDefault = false;
    }

    if (formatType && preventDefault) {
      event.preventDefault();
      
      // Ensure we have a selection for formatting
      const selectionData = TextSelectionManager.getSelectionInElement(containerRef.current);
      if (selectionData && selectionData.text.trim()) {
        applyFormat(formatType);
      }
    }
  }, [containerRef, applyFormat]);

  /**
   * Close context menu
   */
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setSelectedText('');
    setActiveFormats({});
  }, []);

  /**
   * Close link dialog
   */
  const closeLinkDialog = useCallback(() => {
    setShowLinkDialog(false);
  }, []);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    container.addEventListener('keydown', handleKeyDown);

    // Add interval to force check if context menu should be hidden
    const checkInterval = setInterval(() => {
      if (showContextMenu) {
        const globalSelection = window.getSelection();
        const hasSelection = globalSelection && globalSelection.rangeCount > 0 && !globalSelection.isCollapsed;

        if (!hasSelection) {
          // No selection anywhere, force hide context menu
          setShowContextMenu(false);
          setSelectedText('');
          setActiveFormats({});
          lastSelectionRef.current = null;
        }
      }
    }, 100); // Check every 100ms

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      container.removeEventListener('keydown', handleKeyDown);
      clearInterval(checkInterval);

      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelectionChange, handleKeyDown, showContextMenu]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    activeFormats,
    selectedText,
    showContextMenu,
    contextMenuPosition,
    showLinkDialog,
    linkDialogData,
    
    // Actions
    applyFormat,
    removeFormat,
    handleLinkSave,
    closeContextMenu,
    closeLinkDialog,
    updateActiveFormats,
    
    // Utilities
    hasSelection: () => TextSelectionManager.hasSelection(),
    getSelectedText: () => selectedText,
    getCurrentFormats: () => activeFormats
  };
};

export default useTextFormatting;
