/**
 * Text Selection Management Utilities
 * Handles text selection, range management, and ContentEditable interactions
 */

export class TextSelectionManager {
  /**
   * Get the current text selection
   * @returns {Object|null} Selection object with text, range, and metadata
   */
  static getSelection() {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // Check if selection is empty
    if (!selectedText || selectedText.trim() === '') {
      return null;
    }

    return {
      text: selectedText,
      range: range.cloneRange(), // Clone to preserve the range
      selection: selection,
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      collapsed: range.collapsed,
      commonAncestor: range.commonAncestorContainer
    };
  }

  /**
   * Check if there's currently selected text
   * @returns {boolean}
   */
  static hasSelection() {
    const selection = window.getSelection();
    return selection && selection.rangeCount > 0 && !selection.isCollapsed && selection.toString().trim() !== '';
  }

  /**
   * Get selection within a specific element
   * @param {HTMLElement} element - The container element
   * @returns {Object|null} Selection object if selection is within the element
   */
  static getSelectionInElement(element) {
    const selectionData = this.getSelection();
    
    if (!selectionData || !element) {
      return null;
    }

    // Check if the selection is within the specified element
    const isWithinElement = element.contains(selectionData.commonAncestor) ||
                           element.contains(selectionData.startContainer) ||
                           element.contains(selectionData.endContainer);

    if (!isWithinElement) {
      return null;
    }

    return selectionData;
  }

  /**
   * Preserve the current selection state
   * @returns {Object|null} Serialized selection data
   */
  static preserveSelection() {
    const selectionData = this.getSelection();
    
    if (!selectionData) {
      return null;
    }

    // Create a more robust preservation method
    const range = selectionData.range;
    
    // Find text nodes and their positions for more reliable restoration
    const getTextNodePath = (node, container) => {
      const path = [];
      let current = node;
      
      while (current && current !== container) {
        const parent = current.parentNode;
        if (parent) {
          const index = Array.from(parent.childNodes).indexOf(current);
          path.unshift(index);
        }
        current = parent;
      }
      
      return path;
    };

    const containerElement = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
      ? range.commonAncestorContainer 
      : range.commonAncestorContainer.parentElement;

    return {
      text: selectionData.text,
      startPath: getTextNodePath(range.startContainer, containerElement),
      endPath: getTextNodePath(range.endContainer, containerElement),
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      containerElement: containerElement,
      timestamp: Date.now()
    };
  }

  /**
   * Restore a previously preserved selection
   * @param {Object} preservedSelection - The preserved selection data
   * @returns {boolean} Success status
   */
  static restoreSelection(preservedSelection) {
    if (!preservedSelection || !preservedSelection.containerElement) {
      return false;
    }

    try {
      const { startPath, endPath, startOffset, endOffset, containerElement } = preservedSelection;

      // Helper function to get node from path
      const getNodeFromPath = (path, container) => {
        let current = container;
        
        for (const index of path) {
          if (current.childNodes && current.childNodes[index]) {
            current = current.childNodes[index];
          } else {
            return null;
          }
        }
        
        return current;
      };

      const startNode = getNodeFromPath(startPath, containerElement);
      const endNode = getNodeFromPath(endPath, containerElement);

      if (!startNode || !endNode) {
        return false;
      }

      // Create new range
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length || 0));
      range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length || 0));

      // Apply selection
      const selection = window.getSelection();
      selection.removeAllRanges();

      // Validate range is in document before adding
      try {
        if (range.startContainer &&
            range.endContainer &&
            range.startContainer.ownerDocument === document &&
            range.endContainer.ownerDocument === document &&
            document.contains(range.startContainer) &&
            document.contains(range.endContainer)) {
          selection.addRange(range);
        }
      } catch (error) {
        console.warn('Failed to add range to selection:', error);
      }

      return true;
    } catch (error) {
      console.warn('Failed to restore selection:', error);
      return false;
    }
  }

  /**
   * Replace the current selection with new content
   * @param {string} newContent - HTML content to replace selection with
   * @param {boolean} selectNew - Whether to select the new content
   * @returns {boolean} Success status
   */
  static replaceSelection(newContent, selectNew = false) {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    try {
      const range = selection.getRangeAt(0);
      
      // Delete the current selection
      range.deleteContents();

      // Create a document fragment from the new content
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;

      // Move all nodes from temp div to fragment
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      // Insert the new content
      range.insertNode(fragment);

      // Optionally select the new content
      if (selectNew) {
        range.selectNodeContents(fragment);
        selection.removeAllRanges();

        // Validate range is in document before adding
        try {
          if (range.startContainer &&
              range.endContainer &&
              range.startContainer.ownerDocument === document &&
              range.endContainer.ownerDocument === document &&
              document.contains(range.startContainer) &&
              document.contains(range.endContainer)) {
            selection.addRange(range);
          }
        } catch (error) {
          console.warn('Failed to add range to selection:', error);
        }
      } else {
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();

        // Validate range is in document before adding
        try {
          if (range.startContainer &&
              range.endContainer &&
              range.startContainer.ownerDocument === document &&
              range.endContainer.ownerDocument === document &&
              document.contains(range.startContainer) &&
              document.contains(range.endContainer)) {
            selection.addRange(range);
          }
        } catch (error) {
          console.warn('Failed to add range to selection:', error);
        }
      }

      return true;
    } catch (error) {
      console.warn('Failed to replace selection:', error);
      return false;
    }
  }

  /**
   * Clear the current selection
   */
  static clearSelection() {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }

  /**
   * Select all text within an element
   * @param {HTMLElement} element - The element to select text within
   */
  static selectAllInElement(element) {
    if (!element) return;

    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      
      const selection = window.getSelection();
      selection.removeAllRanges();

      // Validate range is in document before adding
      try {
        if (range.startContainer &&
            range.endContainer &&
            range.startContainer.ownerDocument === document &&
            range.endContainer.ownerDocument === document &&
            document.contains(range.startContainer) &&
            document.contains(range.endContainer)) {
          selection.addRange(range);
        }
      } catch (error) {
        console.warn('Failed to add range to selection:', error);
      }
    } catch (error) {
      console.warn('Failed to select all in element:', error);
    }
  }

  /**
   * Get the word at the current cursor position
   * @returns {Object|null} Word data with text and range
   */
  static getWordAtCursor() {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    const text = textNode.textContent;
    const offset = range.startOffset;

    // Find word boundaries
    const wordRegex = /\b\w+\b/g;
    let match;
    
    while ((match = wordRegex.exec(text)) !== null) {
      if (offset >= match.index && offset <= match.index + match[0].length) {
        const wordRange = document.createRange();
        wordRange.setStart(textNode, match.index);
        wordRange.setEnd(textNode, match.index + match[0].length);
        
        return {
          text: match[0],
          range: wordRange,
          startOffset: match.index,
          endOffset: match.index + match[0].length
        };
      }
    }

    return null;
  }

  /**
   * Check if selection spans multiple elements
   * @returns {boolean}
   */
  static isMultiElementSelection() {
    const selectionData = this.getSelection();
    
    if (!selectionData) {
      return false;
    }

    return selectionData.startContainer !== selectionData.endContainer;
  }

  /**
   * Get the closest element of a specific type containing the selection
   * @param {string} tagName - The tag name to search for
   * @returns {HTMLElement|null}
   */
  static getClosestElementByTag(tagName) {
    const selectionData = this.getSelection();
    
    if (!selectionData) {
      return null;
    }

    const startElement = selectionData.startContainer.nodeType === Node.ELEMENT_NODE 
      ? selectionData.startContainer 
      : selectionData.startContainer.parentElement;

    return startElement?.closest(tagName.toLowerCase()) || null;
  }
}

export default TextSelectionManager;
