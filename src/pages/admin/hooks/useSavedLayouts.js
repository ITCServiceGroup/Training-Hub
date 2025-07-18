import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSavedLayouts,
  saveLayout,
  deleteLayout,
  setDefaultLayout,
  getDefaultLayout,
  duplicateLayout,
  createLayoutFromCurrentState,
  validateLayout
} from '../services/savedLayoutsService';

export const useSavedLayouts = () => {
  const { user } = useAuth();
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [defaultLayoutId, setDefaultLayoutId] = useState(null);

  // Load saved layouts on mount and user change
  useEffect(() => {
    loadSavedLayouts();
  }, [user?.id]);

  const loadSavedLayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const layouts = await getSavedLayouts(user?.id);
      setSavedLayouts(layouts);
      
      // Find default layout
      const defaultLayout = layouts.find(l => l.is_default);
      setDefaultLayoutId(defaultLayout?.id || null);
    } catch (err) {
      setError('Failed to load saved layouts');
      console.error('Error loading saved layouts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const saveCurrentLayout = useCallback(async (name, description, tileOrder, globalFilters, layoutType = 'custom') => {
    setError(null);
    
    try {
      // Validate inputs
      if (!name || name.trim().length === 0) {
        throw new Error('Layout name is required');
      }
      
      if (!tileOrder || tileOrder.length === 0) {
        throw new Error('Cannot save empty layout');
      }

      // Create layout from current state
      const layoutData = createLayoutFromCurrentState(tileOrder, globalFilters, layoutType);
      layoutData.name = name.trim();
      layoutData.description = description?.trim() || '';

      // Validate layout
      const validation = validateLayout(layoutData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const savedLayout = await saveLayout(user?.id, layoutData);
      
      // Refresh layouts list
      await loadSavedLayouts();
      
      return savedLayout;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.id, loadSavedLayouts]);

  const updateLayout = useCallback(async (layoutId, updates) => {
    setError(null);
    
    try {
      const existingLayout = savedLayouts.find(l => l.id === layoutId);
      if (!existingLayout) {
        throw new Error('Layout not found');
      }

      const updatedLayout = { ...existingLayout, ...updates };
      
      // Validate updated layout
      const validation = validateLayout(updatedLayout);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      await saveLayout(user?.id, updatedLayout);
      await loadSavedLayouts();
      
      return updatedLayout;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.id, savedLayouts, loadSavedLayouts]);

  const deleteLayoutById = useCallback(async (layoutId) => {
    setError(null);
    
    try {
      await deleteLayout(user?.id, layoutId);
      await loadSavedLayouts();
      
      // If deleted layout was default, clear default
      if (layoutId === defaultLayoutId) {
        setDefaultLayoutId(null);
      }
    } catch (err) {
      setError('Failed to delete layout');
      throw err;
    }
  }, [user?.id, defaultLayoutId, loadSavedLayouts]);

  const setLayoutAsDefault = useCallback(async (layoutId) => {
    setError(null);
    
    try {
      await setDefaultLayout(user?.id, layoutId);
      setDefaultLayoutId(layoutId);
      await loadSavedLayouts();
    } catch (err) {
      setError('Failed to set default layout');
      throw err;
    }
  }, [user?.id, loadSavedLayouts]);

  const duplicateLayoutById = useCallback(async (layoutId, newName) => {
    setError(null);
    
    try {
      const duplicated = await duplicateLayout(user?.id, layoutId, newName);
      await loadSavedLayouts();
      return duplicated;
    } catch (err) {
      setError('Failed to duplicate layout');
      throw err;
    }
  }, [user?.id, loadSavedLayouts]);

  const getLayoutById = useCallback((layoutId) => {
    return savedLayouts.find(l => l.id === layoutId) || null;
  }, [savedLayouts]);

  const getDefaultLayoutData = useCallback(() => {
    return savedLayouts.find(l => l.is_default) || null;
  }, [savedLayouts]);

  const hasUnsavedChanges = useCallback((currentTileOrder, currentFilters, activeLayoutId) => {
    if (!activeLayoutId) return false;
    
    const activeLayout = getLayoutById(activeLayoutId);
    if (!activeLayout) return false;
    
    // Compare tile order
    const activeTileOrder = activeLayout.tiles
      .sort((a, b) => a.priority - b.priority)
      .map(tile => tile.id);
    
    const tilesChanged = JSON.stringify(activeTileOrder) !== JSON.stringify(currentTileOrder);
    
    // Compare filters (simplified comparison)
    const filtersChanged = JSON.stringify(activeLayout.filters) !== JSON.stringify(currentFilters);
    
    return tilesChanged || filtersChanged;
  }, [getLayoutById]);

  const canSaveLayout = useCallback(() => {
    // Check if user has reached maximum layouts
    return savedLayouts.length < 10; // MAX_LAYOUTS_PER_USER
  }, [savedLayouts.length]);

  const getLayoutStats = useCallback(() => {
    return {
      total: savedLayouts.length,
      hasDefault: !!defaultLayoutId,
      canSaveMore: canSaveLayout()
    };
  }, [savedLayouts.length, defaultLayoutId, canSaveLayout]);

  // Convert saved layout to tile order (for compatibility with existing system)
  const layoutToTileOrder = useCallback((layout) => {
    if (!layout || !layout.tiles) return [];
    
    return layout.tiles
      .sort((a, b) => a.priority - b.priority)
      .map(tile => tile.id);
  }, []);

  // Convert saved layout to filters
  const layoutToFilters = useCallback((layout) => {
    if (!layout || !layout.filters) return {};
    return layout.filters;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    savedLayouts,
    loading,
    error,
    defaultLayoutId,
    
    // Actions
    saveCurrentLayout,
    updateLayout,
    deleteLayoutById,
    setLayoutAsDefault,
    duplicateLayoutById,
    loadSavedLayouts,
    clearError,
    
    // Getters
    getLayoutById,
    getDefaultLayoutData,
    getLayoutStats,
    
    // Utilities
    hasUnsavedChanges,
    canSaveLayout,
    layoutToTileOrder,
    layoutToFilters,
    
    // Validation
    validateLayout
  };
};

export default useSavedLayouts;
