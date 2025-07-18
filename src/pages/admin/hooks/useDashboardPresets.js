import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getDefaultPreset, 
  getPresetById, 
  presetToTileOrder 
} from '../config/dashboardPresets';

const STORAGE_KEY = 'dashboard_preset_preference';

export const useDashboardPresets = () => {
  const { user } = useAuth();
  const [currentPreset, setCurrentPreset] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPreset, setPreviewPreset] = useState(null);

  // Load saved preset preference on mount
  useEffect(() => {
    const loadSavedPreset = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== 'null' && saved !== 'undefined') {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.presetId && parsed.userId) {
            const { presetId, userId } = parsed;

            // Only load if it's for the current user
            if (userId === user?.id) {
              const preset = getPresetById(presetId);
              if (preset) {
                setCurrentPreset(preset);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load saved preset preference:', error);
        // Clear corrupted data
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (clearError) {
          console.warn('Failed to clear corrupted preset data:', clearError);
        }
      }

      // Fallback to default preset
      setCurrentPreset(getDefaultPreset());
    };

    if (user?.id) {
      loadSavedPreset();
    } else {
      // Set default preset even without user
      setCurrentPreset(getDefaultPreset());
    }
  }, [user?.id]);

  // Save preset preference to localStorage
  const savePresetPreference = useCallback((preset) => {
    if (!user?.id || !preset || !preset.id) return;

    try {
      const preference = {
        presetId: preset.id,
        userId: user.id,
        timestamp: Date.now()
      };
      const serialized = JSON.stringify(preference);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save preset preference:', error);
    }
  }, [user?.id]);

  // Apply a preset
  const applyPreset = useCallback((preset) => {
    if (!preset) return;
    
    setCurrentPreset(preset);
    setIsPreviewMode(false);
    setPreviewPreset(null);
    savePresetPreference(preset);
  }, [savePresetPreference]);

  // Start preview mode
  const startPreview = useCallback((preset) => {
    if (!preset) return;
    
    setIsPreviewMode(true);
    setPreviewPreset(preset);
  }, []);

  // Stop preview mode
  const stopPreview = useCallback(() => {
    setIsPreviewMode(false);
    setPreviewPreset(null);
  }, []);

  // Get the active preset (preview or current)
  const getActivePreset = useCallback(() => {
    return isPreviewMode ? previewPreset : currentPreset;
  }, [isPreviewMode, previewPreset, currentPreset]);

  // Get tile order for current/preview preset
  const getTileOrder = useCallback(() => {
    const activePreset = getActivePreset();
    return activePreset ? presetToTileOrder(activePreset) : [];
  }, [getActivePreset]);

  // Get default filters for current/preview preset
  const getDefaultFilters = useCallback(() => {
    const activePreset = getActivePreset();
    return activePreset?.defaultFilters || {
      dateRange: {
        preset: 'last_month',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_month'
    };
  }, [getActivePreset]);

  // Check if a preset is currently active
  const isPresetActive = useCallback((presetId) => {
    const activePreset = getActivePreset();
    return activePreset?.id === presetId;
  }, [getActivePreset]);

  // Get layout configuration for current preset
  const getLayoutConfig = useCallback(() => {
    const activePreset = getActivePreset();
    if (!activePreset) return { layout: 'default' };
    
    return {
      layout: activePreset.layout || 'default',
      tiles: activePreset.tiles || []
    };
  }, [getActivePreset]);

  // Reset to default preset
  const resetToDefault = useCallback(() => {
    const defaultPreset = getDefaultPreset();
    applyPreset(defaultPreset);
  }, [applyPreset]);

  return {
    // State
    currentPreset,
    isPreviewMode,
    previewPreset,
    
    // Actions
    applyPreset,
    startPreview,
    stopPreview,
    resetToDefault,
    
    // Getters
    getActivePreset,
    getTileOrder,
    getDefaultFilters,
    getLayoutConfig,
    isPresetActive,
    
    // Utilities
    savePresetPreference
  };
};

export default useDashboardPresets;
