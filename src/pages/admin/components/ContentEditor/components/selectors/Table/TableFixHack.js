/**
 * This module provides a direct DOM manipulation solution to fix the table selection issue.
 * It bypasses the normal Craft.js selection system to force the toolbar to stay with the table.
 */

// Store references to the current table toolbar and its position
let currentTableToolbar = null;
let originalTablePosition = null;

/**
 * Captures the current table toolbar position before any row/column operations
 */
export const captureTableToolbar = () => {
  try {
    // Blur any active element to prevent focus issues
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // Find the toolbar for this table
    const toolbars = document.querySelectorAll('.px-2.py-2.text-white.bg-teal-600.fixed');

    // Find the toolbar that belongs to this table (by checking if it contains the table name)
    for (const toolbar of toolbars) {
      if (toolbar.textContent.includes('Table')) {
        currentTableToolbar = toolbar;
        originalTablePosition = {
          left: toolbar.style.left,
          top: toolbar.style.top,
          zIndex: toolbar.style.zIndex,
          display: toolbar.style.display
        };

        // Lock the toolbar position immediately
        toolbar.style.position = 'fixed';
        toolbar.style.pointerEvents = 'none';
        break;
      }
    }
  } catch (error) {
    console.error('Error capturing table toolbar:', error);
  }
};

/**
 * Restores the table toolbar to its original position after row/column operations
 */
export const restoreTableToolbar = () => {
  try {
    if (currentTableToolbar && originalTablePosition) {
      // Force the toolbar back to its original position
      currentTableToolbar.style.left = originalTablePosition.left;
      currentTableToolbar.style.top = originalTablePosition.top;
      currentTableToolbar.style.zIndex = originalTablePosition.zIndex;
      currentTableToolbar.style.display = originalTablePosition.display || 'flex';
      currentTableToolbar.style.position = 'fixed';
      currentTableToolbar.style.pointerEvents = 'auto';

      // Clear references immediately
      currentTableToolbar = null;
      originalTablePosition = null;
    }
  } catch (error) {
    console.error('Error restoring table toolbar:', error);
  }
};

/**
 * Prevents any cell from being selected after a row/column operation
 */
export const preventCellSelection = () => {
  try {
    // Blur any active element first
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // Find all content editable elements in table cells
    const cellEditables = document.querySelectorAll('td [contenteditable="true"]');

    // Make cells non-editable
    cellEditables.forEach(editable => {
      editable.setAttribute('contenteditable', 'false');
      // Remove any existing selection
      const selection = window.getSelection();
      selection.removeAllRanges();
    });

    // Restore editability after ensuring toolbar is properly positioned
    requestAnimationFrame(() => {
      cellEditables.forEach(editable => {
        editable.setAttribute('contenteditable', 'true');
      });
    });
  } catch (error) {
    console.error('Error preventing cell selection:', error);
  }
};
