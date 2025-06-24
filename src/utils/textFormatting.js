/**
 * Text Formatting Utilities
 * Handles text formatting operations like bold, italic, underline, and links
 */

import TextSelectionManager from './textSelection.js';

export class TextFormatter {
  // Supported formatting types
  static FORMATS = {
    BOLD: 'bold',
    ITALIC: 'italic',
    UNDERLINE: 'underline',
    LINK: 'link'
  };

  // HTML tag mappings for formats
  static TAG_MAP = {
    [TextFormatter.FORMATS.BOLD]: 'strong',
    [TextFormatter.FORMATS.ITALIC]: 'em',
    [TextFormatter.FORMATS.UNDERLINE]: 'u',
    [TextFormatter.FORMATS.LINK]: 'a'
  };

  /**
   * Validate a URL
   * @param {string} url - The URL to validate
   * @returns {Object} Validation result with isValid and normalizedUrl
   */
  static validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Use native URL constructor for validation - it's fast and reliable
    try {
      const urlObj = new URL(normalizedUrl);

      // Basic security checks
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return { isValid: false, error: 'Invalid domain' };
      }

      // Block dangerous protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }

      // Block localhost and private IPs for security
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return { isValid: false, error: 'Private and localhost URLs are not allowed' };
      }

      return {
        isValid: true,
        normalizedUrl: urlObj.href,
        domain: urlObj.hostname
      };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Get active formats for the current selection
   * @param {HTMLElement} container - The container element to check within
   * @returns {Object} Object with format names as keys and boolean values
   */
  static getActiveFormats(container) {
    const selectionData = TextSelectionManager.getSelectionInElement(container);
    
    if (!selectionData) {
      return {};
    }

    const formats = {};
    
    // Check each format type
    Object.values(this.FORMATS).forEach(format => {
      formats[format] = this.isFormatActive(format, selectionData);
    });

    return formats;
  }

  /**
   * Check if a specific format is active in the selection
   * @param {string} format - The format to check
   * @param {Object} selectionData - Selection data from TextSelectionManager
   * @returns {boolean}
   */
  static isFormatActive(format, selectionData) {
    if (!selectionData) return false;

    const tagName = this.TAG_MAP[format];
    if (!tagName) return false;

    // Check if selection is within the specified tag
    const startElement = selectionData.startContainer.nodeType === Node.ELEMENT_NODE 
      ? selectionData.startContainer 
      : selectionData.startContainer.parentElement;

    const endElement = selectionData.endContainer.nodeType === Node.ELEMENT_NODE 
      ? selectionData.endContainer 
      : selectionData.endContainer.parentElement;

    // Check if both start and end are within the same format tag
    const startFormatElement = startElement?.closest(tagName);
    const endFormatElement = endElement?.closest(tagName);

    return startFormatElement && endFormatElement && startFormatElement === endFormatElement;
  }

  /**
   * Apply formatting to the current selection
   * @param {string} format - The format to apply
   * @param {Object} options - Additional options (e.g., url for links, color for styling)
   * @param {HTMLElement} container - The container element
   * @returns {boolean} Success status
   */
  static applyFormat(format, options = {}, container) {
    const selectionData = TextSelectionManager.getSelectionInElement(container);
    
    if (!selectionData) {
      return false;
    }

    try {
      const tagName = this.TAG_MAP[format];
      if (!tagName) {
        throw new Error(`Unknown format: ${format}`);
      }

      // Special handling for links
      if (format === this.FORMATS.LINK) {
        return this.applyLinkFormat(selectionData, options);
      }

      // For other formats, use standard wrapping
      return this.wrapSelectionWithTag(selectionData, tagName, options);
    } catch (error) {
      console.warn('Failed to apply format:', error);
      return false;
    }
  }

  /**
   * Remove formatting from the current selection
   * @param {string} format - The format to remove
   * @param {HTMLElement} container - The container element
   * @returns {boolean} Success status
   */
  static removeFormat(format, container) {
    const selectionData = TextSelectionManager.getSelectionInElement(container);
    
    if (!selectionData) {
      return false;
    }

    try {
      const tagName = this.TAG_MAP[format];
      if (!tagName) {
        throw new Error(`Unknown format: ${format}`);
      }

      return this.unwrapSelectionFromTag(selectionData, tagName);
    } catch (error) {
      console.warn('Failed to remove format:', error);
      return false;
    }
  }

  /**
   * Toggle formatting on the current selection
   * @param {string} format - The format to toggle
   * @param {Object} options - Additional options
   * @param {HTMLElement} container - The container element
   * @returns {boolean} Success status
   */
  static toggleFormat(format, options = {}, container) {
    const isActive = this.isFormatActive(format, TextSelectionManager.getSelectionInElement(container));
    
    if (isActive) {
      return this.removeFormat(format, container);
    } else {
      return this.applyFormat(format, options, container);
    }
  }

  /**
   * Apply link formatting with URL validation
   * @param {Object} selectionData - Selection data
   * @param {Object} options - Options including url and styling
   * @returns {boolean} Success status
   */
  static applyLinkFormat(selectionData, options) {
    const { url, target = '_blank', rel = 'noopener noreferrer', style = '' } = options;
    
    // Validate URL
    const validation = this.validateUrl(url);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create link HTML
    const attributes = [
      `href="${validation.normalizedUrl}"`,
      target ? `target="${target}"` : '',
      rel ? `rel="${rel}"` : '',
      style ? `style="${style}"` : ''
    ].filter(Boolean).join(' ');

    const linkHtml = `<a ${attributes}>${selectionData.text}</a>`;

    return TextSelectionManager.replaceSelection(linkHtml, true);
  }

  /**
   * Wrap selection with a specific HTML tag
   * @param {Object} selectionData - Selection data
   * @param {string} tagName - The tag name to wrap with
   * @param {Object} options - Additional options for styling
   * @returns {boolean} Success status
   */
  static wrapSelectionWithTag(selectionData, tagName, options = {}) {
    const { style = '', className = '' } = options;
    
    const attributes = [
      style ? `style="${style}"` : '',
      className ? `class="${className}"` : ''
    ].filter(Boolean).join(' ');

    const wrappedHtml = `<${tagName}${attributes ? ' ' + attributes : ''}>${selectionData.text}</${tagName}>`;

    return TextSelectionManager.replaceSelection(wrappedHtml, true);
  }

  /**
   * Remove tag wrapping from selection
   * @param {Object} selectionData - Selection data
   * @param {string} tagName - The tag name to remove
   * @returns {boolean} Success status
   */
  static unwrapSelectionFromTag(selectionData, tagName) {
    // Find the closest tag element
    const startElement = selectionData.startContainer.nodeType === Node.ELEMENT_NODE
      ? selectionData.startContainer
      : selectionData.startContainer.parentElement;

    const formatElement = startElement?.closest(tagName);

    if (!formatElement) {
      return false;
    }

    try {
      // Preserve inner HTML content (including other formatting tags)
      const innerContent = formatElement.innerHTML;

      // Create a document fragment to hold the inner content
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = innerContent;

      // Move all child nodes to the fragment
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      // Replace the format element with its inner content
      formatElement.parentNode.insertBefore(fragment, formatElement);
      formatElement.parentNode.removeChild(formatElement);

      // Try to maintain selection on the unwrapped content
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        // Keep the existing selection if possible
        return true;
      }

      return true;
    } catch (error) {
      console.warn('Failed to unwrap tag:', error);
      return false;
    }
  }

  /**
   * Get link data from current selection if it's within a link
   * @param {HTMLElement} container - The container element
   * @returns {Object|null} Link data with url, text, and element
   */
  static getLinkAtSelection(container) {
    const selectionData = TextSelectionManager.getSelectionInElement(container);
    
    if (!selectionData) {
      return null;
    }

    const linkElement = TextSelectionManager.getClosestElementByTag('a');
    
    if (!linkElement) {
      return null;
    }

    return {
      url: linkElement.href,
      text: linkElement.textContent,
      element: linkElement,
      target: linkElement.target,
      rel: linkElement.rel
    };
  }

  /**
   * Clean up empty or invalid formatting tags
   * @param {HTMLElement} container - The container to clean
   */
  static cleanupFormatting(container) {
    if (!container) return;

    // Remove empty formatting tags
    const emptyTags = container.querySelectorAll('strong:empty, em:empty, u:empty, a:empty');
    emptyTags.forEach(tag => tag.remove());

    // Remove nested identical tags (e.g., <strong><strong>text</strong></strong>)
    Object.values(this.TAG_MAP).forEach(tagName => {
      const nestedTags = container.querySelectorAll(`${tagName} ${tagName}`);
      nestedTags.forEach(innerTag => {
        const outerTag = innerTag.parentElement;
        if (outerTag.tagName.toLowerCase() === tagName) {
          // Move inner content to outer tag and remove inner tag
          while (innerTag.firstChild) {
            outerTag.insertBefore(innerTag.firstChild, innerTag);
          }
          innerTag.remove();
        }
      });
    });
  }
}

export default TextFormatter;
