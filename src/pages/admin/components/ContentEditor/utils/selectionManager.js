/**
 * Selection management utilities for the ContentEditor
 * Handles node selection restoration and management across editor sessions
 */

import { loadSelectedNode, saveSelectedNode, clearSelectedNode, retryWithBackoff } from './draftManager';

/**
 * Create selection management hooks and utilities
 * @param {object} query - Craft.js query object
 * @param {object} actions - Craft.js actions object
 * @param {object} selectedStudyGuide - Current study guide
 * @returns {object} - Selection management functions and refs
 */
export const createSelectionManager = (query, actions, selectedStudyGuide) => {
  // Refs to track selection restoration state
  const isRestoringSelectionRef = { current: false };
  const lastSelectionChangeRef = { current: 0 };

  /**
   * Restore node selection with retry logic
   * @param {string} studyGuideId - The study guide ID
   * @returns {Promise<boolean>} - Success status
   */
  const restoreSelection = async (studyGuideId) => {
    const { nodeId } = loadSelectedNode(studyGuideId);
    if (!nodeId) return false;

    // Do not override an existing selection
    try {
      const selectedNodes = query.getState().events.selected;
      if (selectedNodes && selectedNodes.size > 0) {
        return false;
      }
    } catch (_) {}

    console.log('ContentEditor: Attempting to restore selection for node:', nodeId);
    isRestoringSelectionRef.current = true;

    const success = await retryWithBackoff(() => {
      try {
        // Check if node exists by looking in the nodes collection
        const nodes = query.getNodes();
        if (nodes[nodeId]) {
          console.log('ContentEditor: Node exists, selecting:', nodeId);
          actions.selectNode(nodeId);
          lastSelectionChangeRef.current = Date.now();
          return true;
        }
      } catch (err) {
        console.warn('ContentEditor: Error selecting node during restore:', err);
      }
      return false;
    });

    // Add a small delay before allowing selection clearing again
    setTimeout(() => {
      isRestoringSelectionRef.current = false;
      console.log('ContentEditor: Selection restoration completed, success:', success);
    }, 500);

    return success;
  };

  /**
   * Handle node selection changes
   * @param {object} query - Craft.js query object
   */
  const handleNodesChange = (query) => {
    const studyGuideId = selectedStudyGuide?.id || 'new';
    const selectedNodes = query.getState().events.selected;
    const currentTime = Date.now();

    if (selectedNodes.size > 0) {
      const selectedNodeId = Array.from(selectedNodes)[0];
      console.log('ContentEditor: onNodesChange - saving selection:', selectedNodeId);
      saveSelectedNode(studyGuideId, selectedNodeId);
      lastSelectionChangeRef.current = currentTime;
    } else {
      // Only clear selection if we're not currently restoring and enough time has passed
      // since the last selection change to avoid clearing during restoration
      const timeSinceLastChange = currentTime - lastSelectionChangeRef.current;
      const shouldClear = !isRestoringSelectionRef.current && timeSinceLastChange > 1000;

      if (shouldClear) {
        console.log('ContentEditor: onNodesChange - clearing selection (no nodes selected)');
        clearSelectedNode(studyGuideId);
      } else {
        console.log('ContentEditor: onNodesChange - skipping clear (restoring or recent change)', {
          isRestoring: isRestoringSelectionRef.current,
          timeSinceLastChange
        });
      }
    }
  };

  /**
   * Check and restore selection if unexpectedly deselected
   * @param {string} studyGuideId - The study guide ID
   */
  const checkAndRestoreSelection = (studyGuideId) => {
    const { nodeId } = loadSelectedNode(studyGuideId);

    if (!nodeId || !query || !actions) return;

    try {
      const selectedNodes = query.getState().events.selected;

      // Only attempt to restore if NOTHING is selected
      if (selectedNodes.size === 0 && !isRestoringSelectionRef.current) {
        const timeSinceLastChange = Date.now() - lastSelectionChangeRef.current;
        if (timeSinceLastChange > 2000) {
          console.log('ContentEditor: No selection detected, attempting restore');
          restoreSelection(studyGuideId);
        }
      }
    } catch (err) {
      // Ignore errors during check
    }
  };

  /**
   * Create visibility change handler
   * @param {string} studyGuideId - The study guide ID
   */
  const createVisibilityChangeHandler = (studyGuideId) => {
    return async () => {
      if (document.hidden) {
        const selectedNodes = query.getState().events.selected;
        if (selectedNodes.size > 0) {
          console.log('ContentEditor: Page hidden, saving selection:', Array.from(selectedNodes)[0]);
          saveSelectedNode(studyGuideId, Array.from(selectedNodes)[0], { fromVisibilityChange: true });
        }
      } else {
        // Only restore if nothing is currently selected
        setTimeout(async () => {
          try {
            const selectedNodes = query.getState().events.selected;
            if (selectedNodes.size === 0) {
              console.log('ContentEditor: Page visible, restoring selection');
              await restoreSelection(studyGuideId);
            }
          } catch (_) {}
        }, 100);
      }
    };
  };

  /**
   * Create focus handler
   * @param {string} studyGuideId - The study guide ID
   */
  const createFocusHandler = (studyGuideId) => {
    return async () => {
      // Only restore if nothing is currently selected
      setTimeout(async () => {
        try {
          const selectedNodes = query.getState().events.selected;
          if (selectedNodes.size === 0) {
            console.log('ContentEditor: Window focused, restoring selection');
            await restoreSelection(studyGuideId);
          }
        } catch (_) {}
      }, 50);
    };
  };

  /**
   * Create blur handler
   * @param {string} studyGuideId - The study guide ID
   */
  const createBlurHandler = (studyGuideId) => {
    return () => {
      const selectedNodes = query.getState().events.selected;
      if (selectedNodes.size > 0) {
        console.log('ContentEditor: Window blurred, saving selection:', Array.from(selectedNodes)[0]);
        saveSelectedNode(studyGuideId, Array.from(selectedNodes)[0], { fromBlur: true });
      }
    };
  };

  return {
    isRestoringSelectionRef,
    lastSelectionChangeRef,
    restoreSelection,
    handleNodesChange,
    checkAndRestoreSelection,
    createVisibilityChangeHandler,
    createFocusHandler,
    createBlurHandler
  };
};