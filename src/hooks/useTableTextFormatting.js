/**
 * Table Text Formatting Hook
 * A specialized version of useTextFormatting for table cells that handles
 * the unique challenges of text selection within table components
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { TextFormatter } from '../utils/textFormatting';
import TextSelectionManager from '../utils/textSelection';

export const useTableTextFormatting = (containerRef, onTextChange) => {
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
   * Handle text selection changes - modified for table cells
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
    }, 50); // Even faster response for table cells
  }, [containerRef, updateActiveFormats, selectedText, showContextMenu]);

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

        if (formatType === 'editLink' && existingLink) {
          // Open link dialog for editing
          setLinkDialogData({
            url: existingLink.url,
            text: existingLink.text,
            isEditing: true
          });
          setShowLinkDialog(true);
          return true;
        } else if (formatType === 'removeLink' && existingLink) {
          // Remove the link directly
          success = TextFormatter.removeFormat('link', containerRef.current);
          
          if (success && onTextChange) {
            onTextChange(containerRef.current.innerHTML, true);
          }
          
          return success;
        } else if (formatType === 'link') {
          // Save current selection for link creation
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
          }

          // Open link dialog for new link
          setLinkDialogData({
            url: '',
            text: selectedText,
            isEditing: false
          });
          setShowLinkDialog(true);
          return true;
        }
      } else {
        // For other formats (bold, italic, underline), apply directly
        // Store selection position before formatting
        const selection = window.getSelection();
        let selectionStartOffset = -1;
        let selectionEndOffset = -1;

        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Calculate absolute text position within the container
          const walker = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let currentOffset = 0;
          let node;
          while (node = walker.nextNode()) {
            if (node === range.startContainer) {
              selectionStartOffset = currentOffset + range.startOffset;
            }
            if (node === range.endContainer) {
              selectionEndOffset = currentOffset + range.endOffset;
              break;
            }
            currentOffset += node.textContent.length;
          }
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
                let endNode = null;
                let startOffset = 0;
                let endOffset = 0;
                let node;

                while (node = walker.nextNode()) {
                  const nodeLength = node.textContent.length;
                  
                  if (!startNode && currentOffset + nodeLength >= selectionStartOffset) {
                    startNode = node;
                    startOffset = selectionStartOffset - currentOffset;
                  }
                  
                  if (!endNode && currentOffset + nodeLength >= selectionEndOffset) {
                    endNode = node;
                    endOffset = selectionEndOffset - currentOffset;
                    break;
                  }
                  
                  currentOffset += nodeLength;
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
                  setTimeout(() => {
                    updateActiveFormats();
                  }, 50);
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
   * Handle link save from dialog
   */
  const handleLinkSave = useCallback((linkData, linkColors = {}) => {
    if (!containerRef.current) {
      setShowLinkDialog(false);
      return;
    }

    // Use text from linkData if selectedText is not available
    const textToUse = linkData.text || selectedText;
    if (!textToUse || !textToUse.trim()) {
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

      // Create link HTML with proper styling
      let styleAttr = '';
      if (linkColors.color) {
        const { r, g, b, a } = linkColors.color;
        styleAttr = ` style="color: rgba(${r}, ${g}, ${b}, ${a}); text-decoration: underline;"`;
      } else if (linkData.style) {
        styleAttr = ` style="${linkData.style}"`;
      }

      const linkHtml = `<a href="${validation.normalizedUrl}" target="_blank" rel="noopener noreferrer"${styleAttr}>${textToUse}</a>`;

      // Restore the saved selection range if we have one
      if (savedRangeRef.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);

        // Set flag to prevent ContentEditor interference during link insertion
        isUpdatingContentRef.current = true;

        // Use the proper TextSelectionManager method to replace selection
        const success = TextSelectionManager.replaceSelection(linkHtml, false);

        if (success) {
          // Notify of change with formatting flag to prevent interference
          if (onTextChange) {
            onTextChange(containerRef.current.innerHTML, true);
          }
        }

        // Clear the saved range
        savedRangeRef.current = null;

        // Clear the flag after a short delay to allow DOM to stabilize
        setTimeout(() => {
          isUpdatingContentRef.current = false;
        }, 100);
      }

      // Delay closing the dialog and clearing state to allow DOM changes to take effect
      setTimeout(() => {
        // Close the dialog
        setShowLinkDialog(false);
        setLinkDialogData({ url: '', text: '', isEditing: false });

        // Clear selection state
        setSelectedText('');
        setShowContextMenu(false);
      }, 150);
    } catch (error) {
      console.warn('Failed to save link:', error);
    }
  }, [containerRef, onTextChange, selectedText]);

  /**
   * Close context menu
   */
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setSelectedText('');
    setActiveFormats({});
    lastSelectionRef.current = null;
  }, []);

  /**
   * Close link dialog
   */
  const closeLinkDialog = useCallback(() => {
    setShowLinkDialog(false);
    setLinkDialogData({ url: '', text: '', isEditing: false });
    savedRangeRef.current = null;
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e) => {
    if (!containerRef.current) return;

    // Check for formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormat('underline');
          break;
        case 'k':
          e.preventDefault();
          applyFormat('link');
          break;
      }
    }
  }, [applyFormat]);

  /**
   * Set up event listeners - modified for table cells
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent Craft.js from interfering with text selection
    const preventCraftJsInterference = (e) => {
      // If we're selecting text, stop Craft.js from handling the event
      if (e.target === container || container.contains(e.target)) {
        e.stopImmediatePropagation();
      }
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    container.addEventListener('keydown', handleKeyDown);

    // Add high-priority event listeners to prevent Craft.js interference
    container.addEventListener('mousedown', preventCraftJsInterference, true);
    container.addEventListener('mouseup', preventCraftJsInterference, true);
    container.addEventListener('click', preventCraftJsInterference, true);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('mousedown', preventCraftJsInterference, true);
      container.removeEventListener('mouseup', preventCraftJsInterference, true);
      container.removeEventListener('click', preventCraftJsInterference, true);

      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelectionChange, handleKeyDown]);

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

export default useTableTextFormatting;
