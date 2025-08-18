/**
 * Draft management utilities for the ContentEditor
 * Handles localStorage-based draft saving and loading
 */

/**
 * Generate storage keys for drafts and related data
 */
export const getStorageKey = (studyGuideId) => `content_editor_${studyGuideId}_draft`;
export const getSelectedNodeKey = (studyGuideId) => `content_editor_${studyGuideId}_selected_node`;
export const getSelectionMetaKey = (studyGuideId) => `content_editor_${studyGuideId}_selection_meta`;

/**
 * Save the currently selected node to localStorage
 * @param {string} studyGuideId - The study guide ID
 * @param {string} nodeId - The selected node ID
 * @param {object} extraMeta - Additional metadata to store
 */
export const saveSelectedNode = (studyGuideId, nodeId, extraMeta = {}) => {
  if (!nodeId) {
    clearSelectedNode(studyGuideId);
    return;
  }
  localStorage.setItem(getSelectedNodeKey(studyGuideId), nodeId);
  localStorage.setItem(getSelectionMetaKey(studyGuideId), JSON.stringify({ timestamp: Date.now(), nodeId, ...extraMeta }));
};

/**
 * Load the selected node from localStorage
 * @param {string} studyGuideId - The study guide ID
 * @returns {object} - Object containing nodeId and meta data
 */
export const loadSelectedNode = (studyGuideId) => {
  const nodeId = localStorage.getItem(getSelectedNodeKey(studyGuideId));
  try {
    const meta = JSON.parse(localStorage.getItem(getSelectionMetaKey(studyGuideId)) || '{}');
    return { nodeId, meta };
  } catch (err) {
    return { nodeId, meta: {} };
  }
};

/**
 * Clear the selected node from localStorage
 * @param {string} studyGuideId - The study guide ID
 */
export const clearSelectedNode = (studyGuideId) => {
  localStorage.removeItem(getSelectedNodeKey(studyGuideId));
  localStorage.removeItem(getSelectionMetaKey(studyGuideId));
};

/**
 * Save a draft to localStorage
 * @param {string} studyGuideId - The study guide ID
 * @param {object} draftData - Object containing title and content
 */
export const saveDraft = (studyGuideId, { title, content }) => {
  const key = getStorageKey(studyGuideId);
  const draft = { title, content, timestamp: Date.now(), lastSavedVersion: content };
  localStorage.setItem(key, JSON.stringify(draft));
};

/**
 * Load a draft from localStorage
 * @param {string} studyGuideId - The study guide ID
 * @param {boolean} isNew - Whether this is a new study guide
 * @returns {object|null} - The draft data or null if not found
 */
export const loadDraft = (studyGuideId, isNew = false) => {
  try {
    if (studyGuideId === 'new' && isNew) return null;
    const key = getStorageKey(studyGuideId);
    const draft = localStorage.getItem(key);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Clear a draft from localStorage
 * @param {string} studyGuideId - The study guide ID
 */
export const clearDraft = (studyGuideId) => {
  localStorage.removeItem(getStorageKey(studyGuideId));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} - Result of the function or null if all attempts fail
 */
export const retryWithBackoff = async (fn, maxAttempts = 5, initialDelay = 100) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (err) { 
      console.warn(`Attempt ${attempt + 1} failed:`, err); 
    }
    await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, attempt)));
  }
  return null;
};