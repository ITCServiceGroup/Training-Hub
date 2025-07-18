/**
 * Unified Dashboard Configurations Hook
 * 
 * This hook replaces the separate useDashboardPresets, useSavedLayouts, 
 * and useTileLibrary hooks with a single, unified configuration system.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAllConfigurations,
  getConfigurationById,
  saveConfiguration,
  deleteConfiguration,
  setDefaultConfiguration,
  getDefaultConfiguration,
  cloneConfigurationById,
  updateConfigurationUsage
} from '../services/dashboardConfigurationService';
import { SYSTEM_CONFIGURATIONS } from '../types/DashboardConfiguration';
// Removed userPreferencesService imports - using configuration-based tile orders instead
import {
  CONFIGURATION_TYPES,
  validateConfiguration,
  createEmptyConfiguration,
  cloneConfiguration
} from '../types/DashboardConfiguration';

export const useDashboardConfigurations = () => {
  const { user } = useAuth();
  
  // State
  const [configurations, setConfigurations] = useState([]);
  const [activeConfiguration, setActiveConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfiguration, setEditingConfiguration] = useState(null);

  // Load all configurations on mount and user change
  useEffect(() => {
    loadConfigurations();
  }, [user?.id]);

  // Load default configuration when configurations are loaded
  useEffect(() => {
    if (configurations.length > 0 && !activeConfiguration) {
      loadDefaultConfiguration();
    }
  }, [configurations]);

  /**
   * Load all configurations for the current user
   */
  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allConfigs = await getAllConfigurations(user?.id);
      setConfigurations(allConfigs);
    } catch (err) {
      setError('Failed to load dashboard configurations');
      console.error('Error loading configurations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Load and set the default configuration
   */
  const loadDefaultConfiguration = useCallback(async () => {
    try {
      const defaultConfig = await getDefaultConfiguration(user?.id);
      if (defaultConfig) {
        setActiveConfiguration(defaultConfig);
        await updateConfigurationUsage(user?.id, defaultConfig.id);
      }
    } catch (err) {
      console.error('Error loading default configuration:', err);
      // Fallback to first available configuration
      if (configurations.length > 0) {
        setActiveConfiguration(configurations[0]);
      }
    }
  }, [user?.id, configurations]);

  /**
   * Apply a configuration (make it active)
   */
  const applyConfiguration = useCallback(async (configId) => {
    setError(null);
    
    try {
      const config = await getConfigurationById(user?.id, configId);
      if (!config) {
        throw new Error('Configuration not found');
      }

      setActiveConfiguration(config);
      await updateConfigurationUsage(user?.id, configId);
      
      console.log('✅ Applied configuration:', config.name);
      return config;
    } catch (err) {
      setError('Failed to apply configuration');
      console.error('Error applying configuration:', err);
      throw err;
    }
  }, [user?.id]);

  /**
   * Save a configuration (create or update)
   */
  const saveConfigurationData = useCallback(async (configData) => {
    setError(null);
    
    try {
      const validation = validateConfiguration(configData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const savedConfig = await saveConfiguration(user?.id, configData);
      
      // Refresh configurations list
      await loadConfigurations();
      
      console.log('✅ Saved configuration:', savedConfig.name || savedConfig.id);
      return savedConfig;
    } catch (err) {
      setError(err.message);
      console.error('Error saving configuration:', err);
      throw err;
    }
  }, [user?.id, loadConfigurations]);

  /**
   * Delete a configuration
   */
  const deleteConfigurationById = useCallback(async (configId) => {
    setError(null);
    
    try {
      // Cannot delete system configurations
      const config = configurations.find(c => c.id === configId);
      if (config?.type === CONFIGURATION_TYPES.SYSTEM) {
        throw new Error('Cannot delete system configurations');
      }

      await deleteConfiguration(user?.id, configId);
      
      // If deleted configuration was active, switch to default
      if (activeConfiguration?.id === configId) {
        await loadDefaultConfiguration();
      }
      
      // Refresh configurations list
      await loadConfigurations();
      
      console.log('🗑️ Deleted configuration:', configId);
    } catch (err) {
      setError('Failed to delete configuration');
      console.error('Error deleting configuration:', err);
      throw err;
    }
  }, [user?.id, configurations, activeConfiguration, loadDefaultConfiguration, loadConfigurations]);

  /**
   * Set a configuration as default
   */
  const setAsDefault = useCallback(async (configId) => {
    setError(null);
    console.log('🎯 setAsDefault called with configId:', configId);
    console.log('🎯 Current user:', user?.id);

    try {
      const result = await setDefaultConfiguration(user?.id, configId);
      console.log('🎯 setDefaultConfiguration result:', result);

      console.log('⭐ Set as default:', configId);

      // For user configurations, we need to reload from database to get updated is_default values
      // For system configurations, the default is stored in localStorage and will be picked up by defaultConfiguration computed value
      const systemConfig = Object.values(SYSTEM_CONFIGURATIONS).find(config => config.id === configId);
      console.log('🎯 Is system config?', !!systemConfig);

      if (!systemConfig) {
        // This is a user configuration - reload to get updated database values
        console.log('🎯 Reloading configurations for user config...');
        await loadConfigurations();
        console.log('🎯 Configurations reloaded');
      } else {
        // This is a system configuration - just force a re-render to update defaultConfiguration computed value
        console.log('🎯 Force re-render for system config...');
        setConfigurations(prev => [...prev]);
      }

    } catch (err) {
      setError('Failed to set default configuration');
      console.error('🎯 Error setting default:', err);
      throw err;
    }
  }, [user?.id, loadConfigurations]);

  /**
   * Clone a configuration
   */
  const cloneConfigurationData = useCallback(async (configId, newName) => {
    setError(null);
    
    try {
      const clonedConfig = await cloneConfigurationById(user?.id, configId, newName);
      await loadConfigurations();
      
      console.log('📋 Cloned configuration:', clonedConfig.name);
      return clonedConfig;
    } catch (err) {
      setError('Failed to clone configuration');
      console.error('Error cloning configuration:', err);
      throw err;
    }
  }, [user?.id, loadConfigurations]);

  /**
   * Create a new empty configuration
   */
  const createNewConfiguration = useCallback((name = 'New Configuration') => {
    const newConfig = createEmptyConfiguration(name);
    newConfig.metadata.createdBy = user?.id || 'anonymous';
    return newConfig;
  }, [user?.id]);

  /**
   * Start editing a configuration
   */
  const startEditing = useCallback((configId = null) => {
    if (configId) {
      const config = configurations.find(c => c.id === configId);
      if (config) {
        // Clone for editing to avoid modifying original
        setEditingConfiguration(cloneConfiguration(config));
      }
    } else {
      // Create new configuration
      setEditingConfiguration(createNewConfiguration());
    }
    setIsEditing(true);
  }, [configurations, createNewConfiguration]);

  /**
   * Stop editing (cancel)
   */
  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setEditingConfiguration(null);
  }, []);

  /**
   * Save the currently editing configuration
   */
  const saveEditingConfiguration = useCallback(async () => {
    if (!editingConfiguration) return;
    
    try {
      const savedConfig = await saveConfigurationData(editingConfiguration);
      setIsEditing(false);
      setEditingConfiguration(null);
      return savedConfig;
    } catch (err) {
      // Error is already handled in saveConfigurationData
      throw err;
    }
  }, [editingConfiguration, saveConfigurationData]);

  /**
   * Update the editing configuration
   */
  const updateEditingConfiguration = useCallback((updates) => {
    if (!editingConfiguration) return;
    
    setEditingConfiguration(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, [editingConfiguration]);

  // Computed values
  const systemConfigurations = useMemo(() => 
    configurations.filter(c => c.type === CONFIGURATION_TYPES.SYSTEM),
    [configurations]
  );

  const userConfigurations = useMemo(() => 
    configurations.filter(c => c.type === CONFIGURATION_TYPES.USER),
    [configurations]
  );

  const defaultConfiguration = useMemo(() => {
    console.log('🔍 Computing defaultConfiguration...');
    console.log('🔍 All configurations:', configurations.map(c => ({ id: c.id, name: c.name, isDefault: c.isDefault, type: c.type })));

    // Check for local default preference first (for system configurations)
    const localDefault = localStorage.getItem('default_dashboard_configuration');
    console.log('🔍 Local default from localStorage:', localDefault);

    if (localDefault) {
      const localDefaultConfig = configurations.find(c => c.id === localDefault);
      if (localDefaultConfig) {
        console.log('🔍 Found local default config:', localDefaultConfig.name);
        return localDefaultConfig;
      }
    }

    // Check for user configuration marked as default
    const userDefault = configurations.find(c => c.isDefault);
    console.log('🔍 User default config:', userDefault ? userDefault.name : 'none');

    if (userDefault) {
      console.log('🔍 Returning user default:', userDefault.name);
      return userDefault;
    }

    // Fallback to first system configuration
    console.log('🔍 Falling back to first system config:', systemConfigurations[0]?.name);
    return systemConfigurations[0];
  }, [configurations, systemConfigurations]);

  const canCreateMore = useMemo(() => 
    userConfigurations.length < 20, // MAX_USER_CONFIGURATIONS
    [userConfigurations]
  );

  const stats = useMemo(() => ({
    total: configurations.length,
    system: systemConfigurations.length,
    user: userConfigurations.length,
    hasDefault: !!defaultConfiguration,
    canCreateMore
  }), [configurations, systemConfigurations, userConfigurations, defaultConfiguration, canCreateMore]);

  /**
   * Get current tile order from active configuration
   */
  const getCurrentTileOrder = useCallback(() => {
    if (!activeConfiguration) {
      console.log('📋 getCurrentTileOrder: No active configuration');
      return [];
    }

    // Get tile order directly from configuration
    if (activeConfiguration.tiles && activeConfiguration.tiles.length > 0) {
      const tileOrder = activeConfiguration.tiles
        .sort((a, b) => a.priority - b.priority)
        .map(tile => tile.id);
      console.log('📋 getCurrentTileOrder (effective):', tileOrder);
      return tileOrder;
    }

    console.log('📋 getCurrentTileOrder: No tiles in configuration');
    return [];
  }, [activeConfiguration]);

  /**
   * Get current filters from active configuration
   */
  const getCurrentFilters = useCallback(() => {
    return activeConfiguration?.filters || {};
  }, [activeConfiguration]);

  /**
   * Update tile order for user configurations only
   * (System configurations are read-only and cannot be reordered)
   */
  const updateTileOrder = useCallback(async (configId, newTileOrder) => {
    console.log('🔧 updateTileOrder called:', { configId, newTileOrder });
    setError(null);

    try {
      // Find the configuration
      const config = configurations.find(c => c.id === configId);
      if (!config) {
        console.warn(`❌ Configuration ${configId} not found`);
        return false;
      }

      console.log('📋 Found configuration:', config.name, config.type);

      // Only allow updating user configurations
      if (config.type === 'system') {
        console.warn('🏛️ System configurations are read-only and cannot be reordered');
        return false;
      }

      // For user configurations, update the configuration directly
      console.log('👤 User configuration - updating configuration');

      // Create updated tiles array with new priorities
      console.log('🔄 Current tiles:', config.tiles.map(t => `${t.id}(${t.priority})`));
      console.log('🎯 New tile order:', newTileOrder);

      const updatedTiles = newTileOrder.map((tileId, index) => {
        const existingTile = config.tiles.find(t => t.id === tileId);
        if (existingTile) {
          return {
            ...existingTile,
            priority: index
          };
        }
        // If tile doesn't exist in config, create a basic one
        console.warn(`⚠️ Tile ${tileId} not found in configuration, creating basic tile`);
        return {
          id: tileId,
          position: { x: 0, y: 0 },
          size: { w: 1, h: 1 },
          priority: index,
          config: {},
          customSettings: {}
        };
      });

      console.log('✅ Updated tiles:', updatedTiles.map(t => `${t.id}(${t.priority})`));

      // Update the configuration
      const updatedConfig = {
        ...config,
        tiles: updatedTiles,
        metadata: {
          ...config.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      // Save the updated configuration
      console.log('💾 Saving updated configuration...');
      const result = await saveConfigurationData(updatedConfig);
      console.log('💾 Save result:', result);

      console.log('✅ Updated tile order for configuration:', config.name);
      return true;
    } catch (err) {
      setError('Failed to update tile order');
      console.error('Error updating tile order:', err);
      return false;
    }
  }, [configurations, saveConfigurationData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    configurations,
    activeConfiguration,
    loading,
    error,
    isEditing,
    editingConfiguration,
    
    // Computed
    systemConfigurations,
    userConfigurations,
    defaultConfiguration,
    stats,
    
    // Actions
    loadConfigurations,
    applyConfiguration,
    saveConfigurationData,
    deleteConfigurationById,
    setAsDefault,
    cloneConfigurationData,
    createNewConfiguration,
    
    // Editing
    startEditing,
    stopEditing,
    saveEditingConfiguration,
    updateEditingConfiguration,
    
    // Utilities
    getCurrentTileOrder,
    getCurrentFilters,
    updateTileOrder,
    clearError
  };
};

export default useDashboardConfigurations;
