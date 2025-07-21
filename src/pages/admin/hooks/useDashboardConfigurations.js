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

      // Merge user overrides with system configurations
      const mergedConfigs = mergeUserOverridesWithSystemConfigs(allConfigs, user?.id);

      setConfigurations(mergedConfigs);

      // If there's an active configuration, update it to the merged version
      if (activeConfiguration) {
        const updatedActiveConfig = mergedConfigs.find(c => c.id === activeConfiguration.id);
        if (updatedActiveConfig) {
          console.log('🔄 Updating active configuration to merged version after load');
          setActiveConfiguration(updatedActiveConfig);
        }
      }
    } catch (err) {
      setError('Failed to load dashboard configurations');
      console.error('Error loading configurations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeConfiguration]);

  /**
   * Merge user overrides with system configurations
   * This allows users to have customized versions of system configs without creating duplicates
   */
  const mergeUserOverridesWithSystemConfigs = useCallback((allConfigs, userId) => {
    if (!userId) return allConfigs;

    // Separate system configs, user overrides, and regular user configs
    const systemConfigs = allConfigs.filter(c => c.type === CONFIGURATION_TYPES.SYSTEM);
    const userOverrides = allConfigs.filter(c =>
      c.type === CONFIGURATION_TYPES.USER &&
      c.metadata?.isSystemOverride &&
      c.metadata?.originalSystemConfig
    );
    const regularUserConfigs = allConfigs.filter(c =>
      c.type === CONFIGURATION_TYPES.USER &&
      !c.metadata?.isSystemOverride
    );

    console.log('🔍 Merge debug - System configs:', systemConfigs.length);
    console.log('🔍 Merge debug - User overrides:', userOverrides.length);
    console.log('🔍 Merge debug - Regular user configs:', regularUserConfigs.length);
    console.log('🔍 User overrides found:', userOverrides.map(o => ({
      id: o.id,
      name: o.name,
      originalSystemConfig: o.metadata?.originalSystemConfig
    })));

    // Create merged system configs with user customizations
    const mergedSystemConfigs = systemConfigs.map(systemConfig => {
      const userOverride = userOverrides.find(override =>
        override.metadata?.originalSystemConfig === systemConfig.id
      );

      if (userOverride) {
        // User has customized this system config - use their version but keep system appearance
        console.log('🔄 Merging user customizations for:', systemConfig.name);
        console.log('🔄 System config tiles:', systemConfig.tiles.length, 'tiles');
        console.log('🔄 User override tiles:', userOverride.tiles.length, 'tiles');
        console.log('🔄 User override ID:', userOverride.id);

        const mergedConfig = {
          ...systemConfig, // Keep original system config structure
          tiles: userOverride.tiles, // Use user's customized tiles
          filters: userOverride.filters || systemConfig.filters,
          layout: userOverride.layout || systemConfig.layout,
          metadata: {
            ...systemConfig.metadata,
            customizedBy: userId,
            lastCustomized: userOverride.metadata?.updatedAt,
            userOverrideId: userOverride.id // Track the user override ID for updates
          }
        };

        console.log('🔄 Merged config tiles:', mergedConfig.tiles.length, 'tiles');
        console.log('🔄 First merged tile:', mergedConfig.tiles[0]);
        return mergedConfig;
      }

      // No user customizations - return original system config
      return systemConfig;
    });

    // Return merged configs: customized system configs + regular user configs
    return [...mergedSystemConfigs, ...regularUserConfigs];
  }, []);

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
   * Get current tile configurations from active configuration
   */
  const getCurrentTileConfigs = useCallback(() => {
    if (!activeConfiguration) {
      console.log('📋 getCurrentTileConfigs: No active configuration');
      return [];
    }

    console.log('📋 getCurrentTileConfigs - Active config:', {
      id: activeConfiguration.id,
      name: activeConfiguration.name,
      type: activeConfiguration.type,
      tilesCount: activeConfiguration.tiles?.length || 0,
      hasUserOverrideId: !!activeConfiguration.metadata?.userOverrideId,
      userOverrideId: activeConfiguration.metadata?.userOverrideId
    });

    // Get full tile configurations from configuration
    if (activeConfiguration.tiles && activeConfiguration.tiles.length > 0) {
      const tileConfigs = activeConfiguration.tiles
        .sort((a, b) => a.priority - b.priority)
        .map((tile, index) => {
          // Migration: ensure all required fields are present
          return {
            id: tile.id,
            position: tile.position || { x: index % 3, y: Math.floor(index / 3) },
            size: tile.size || { w: 1, h: 1 },
            priority: tile.priority !== undefined ? tile.priority : index,
            isVisible: tile.isVisible !== undefined ? tile.isVisible : true,
            config: tile.config || {},
            customSettings: tile.customSettings || {}
          };
        });
      console.log('📋 getCurrentTileConfigs (effective):', tileConfigs);
      console.log('📋 First tile details:', tileConfigs[0]);
      return tileConfigs;
    }

    console.log('📋 getCurrentTileConfigs: No tiles in configuration');
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

      // Handle both system and user configurations
      if (config.type === CONFIGURATION_TYPES.SYSTEM) {
        console.log('🏛️ System configuration - creating/updating user-specific customization');
        // Check if user already has an override for this system config
        if (config.metadata?.userOverrideId) {
          console.log('🔄 Updating existing user override:', config.metadata.userOverrideId);
          // Update the existing user override by ID
          return await updateUserOverrideById(config.metadata.userOverrideId, { tileOrder: newTileOrder });
        }
        // For system configs, create a user-specific override in the database
        return await saveSystemConfigurationOverride(config, { tileOrder: newTileOrder });
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

      // Update the active configuration if this is the currently active one
      if (activeConfiguration && activeConfiguration.id === configId) {
        console.log('🔄 Updating active configuration with new tile order');
        setActiveConfiguration(updatedConfig);
      }

      console.log('✅ Updated tile order for configuration:', config.name);
      return true;
    } catch (err) {
      setError('Failed to update tile order');
      console.error('Error updating tile order:', err);
      return false;
    }
  }, [configurations, saveConfigurationData, activeConfiguration]);

  /**
   * Update full tile configurations (position, size, order) for user configurations only
   */
  const updateTileConfigurations = useCallback(async (configId, newTileConfigs) => {
    console.log('🔧 updateTileConfigurations called:', { configId, newTileConfigs });
    setError(null);

    try {
      const config = configurations.find(c => c.id === configId);
      if (!config) {
        console.error('❌ Configuration not found for ID:', configId);
        console.log('📋 Available configurations:', configurations.map(c => ({ id: c.id, name: c.name, type: c.type })));
        throw new Error('Configuration not found');
      }

      console.log('📋 Found configuration:', { id: config.id, name: config.name, type: config.type });
      console.log('🔍 CONFIGURATION_TYPES.SYSTEM:', CONFIGURATION_TYPES.SYSTEM);
      console.log('🔍 config.type === CONFIGURATION_TYPES.SYSTEM:', config.type === CONFIGURATION_TYPES.SYSTEM);

      // Handle both system and user configurations
      if (config.type === CONFIGURATION_TYPES.SYSTEM) {
        console.log('🏛️ System configuration - creating/updating user-specific customization');
        // Check if user already has an override for this system config
        if (config.metadata?.userOverrideId) {
          console.log('🔄 Updating existing user override:', config.metadata.userOverrideId);
          // Update the existing user override by ID
          return await updateUserOverrideById(config.metadata.userOverrideId, { tileConfigurations: newTileConfigs });
        }
        // For system configs, create a user-specific override in the database
        return await saveSystemConfigurationOverride(config, { tileConfigurations: newTileConfigs });
      }

      // For user configurations, update the configuration directly
      console.log('👤 User configuration - updating tile configurations');

      // Validate and prepare tile configurations
      const updatedTiles = newTileConfigs.map((tileConfig, index) => {
        return {
          id: tileConfig.id,
          position: tileConfig.position || { x: 0, y: 0 },
          size: tileConfig.size || { w: 1, h: 1 },
          priority: tileConfig.priority !== undefined ? tileConfig.priority : index,
          isVisible: tileConfig.isVisible !== undefined ? tileConfig.isVisible : true,
          config: tileConfig.config || {},
          customSettings: tileConfig.customSettings || {}
        };
      });

      console.log('✅ Updated tile configurations:', updatedTiles);

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
      console.log('💾 Saving updated configuration with tile configurations...');
      const result = await saveConfigurationData(updatedConfig);
      console.log('💾 Save result:', result);

      // Update the active configuration if this is the currently active one
      if (activeConfiguration && activeConfiguration.id === configId) {
        console.log('🔄 Updating active configuration with new tile data');
        setActiveConfiguration(updatedConfig);
      }

      console.log('✅ Updated tile configurations for configuration:', config.name);
      return true;
    } catch (err) {
      setError('Failed to update tile configurations');
      console.error('Error updating tile configurations:', err);
      return false;
    }
  }, [configurations, saveConfigurationData, activeConfiguration]);

  /**
   * Create a user-specific customization of a system configuration
   */
  const createUserCustomization = useCallback(async (systemConfig, customizations) => {
    console.log('🎨 Creating user customization for system config:', systemConfig.name);
    console.log('🎨 System config details:', { id: systemConfig.id, type: systemConfig.type });
    console.log('🎨 Customizations:', customizations);
    console.log('🎨 User ID:', user?.id);
    setError(null);

    try {
      // Create a user configuration based on the system configuration
      // Don't set an ID - let the saveConfiguration service generate it
      const customizedConfig = {
        ...systemConfig,
        id: undefined, // Let the service generate the ID
        name: `${systemConfig.name} (Custom)`,
        description: `Customized version of ${systemConfig.name}`,
        type: CONFIGURATION_TYPES.USER,
        isDefault: false,
        isTemplate: false,
        metadata: {
          ...systemConfig.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.id,
          basedOn: systemConfig.id, // Track the original system config
          version: '1.0.0'
        }
      };

      // Apply customizations
      if (customizations.tileOrder) {
        // Update tile order (legacy support)
        const updatedTiles = customizations.tileOrder.map((tileId, index) => {
          const existingTile = systemConfig.tiles.find(t => t.id === tileId);
          if (existingTile) {
            return {
              ...existingTile,
              priority: index
            };
          }
          return {
            id: tileId,
            position: { x: index % 3, y: Math.floor(index / 3) },
            size: { w: 1, h: 1 },
            priority: index,
            config: {},
            customSettings: {}
          };
        });
        customizedConfig.tiles = updatedTiles;
      }

      if (customizations.tileConfigurations) {
        // Update full tile configurations
        customizedConfig.tiles = customizations.tileConfigurations.map((tileConfig, index) => ({
          id: tileConfig.id,
          position: tileConfig.position || { x: 0, y: 0 },
          size: tileConfig.size || { w: 1, h: 1 },
          priority: tileConfig.priority !== undefined ? tileConfig.priority : index,
          isVisible: tileConfig.isVisible !== undefined ? tileConfig.isVisible : true,
          config: tileConfig.config || {},
          customSettings: tileConfig.customSettings || {}
        }));
      }

      // Save the new user configuration
      console.log('💾 Saving user customization...');
      const savedConfig = await saveConfigurationData(customizedConfig);
      console.log('💾 User customization saved:', savedConfig);

      // Set the new configuration as active directly (avoid timing issues)
      console.log('🔄 Setting customized configuration as active');
      setActiveConfiguration(savedConfig);

      // Update usage tracking
      try {
        await updateConfigurationUsage(user?.id, savedConfig.id);
      } catch (err) {
        console.warn('Failed to update configuration usage:', err);
      }

      console.log('✅ Created and applied user customization:', savedConfig.name);
      console.log('🎉 You can now fully customize this dashboard!');
      return true;
    } catch (err) {
      setError('Failed to create user customization');
      console.error('Error creating user customization:', err);
      return false;
    }
  }, [user?.id, saveConfigurationData, updateConfigurationUsage]);

  /**
   * Save user-specific customizations for system configurations
   * This creates a user override while keeping the same configuration ID and name
   */
  const saveSystemConfigurationOverride = useCallback(async (systemConfig, customizations) => {
    console.log('🎨 Saving user override for system config:', systemConfig.name);
    setError(null);

    try {
      // Create a user-specific version with a unique ID but same name
      const userOverride = {
        ...systemConfig,
        id: undefined, // Let the service generate a unique ID
        type: CONFIGURATION_TYPES.USER, // Convert to user type for database storage
        metadata: {
          ...systemConfig.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.id,
          originalSystemConfig: systemConfig.id, // Track the original
          isSystemOverride: true, // Flag to identify this as a system override
          version: '1.0.0'
        }
      };

      // Apply customizations
      if (customizations.tileOrder) {
        const updatedTiles = customizations.tileOrder.map((tileId, index) => {
          const existingTile = systemConfig.tiles.find(t => t.id === tileId);
          if (existingTile) {
            return {
              ...existingTile,
              priority: index
            };
          }
          return {
            id: tileId,
            position: { x: index % 3, y: Math.floor(index / 3) },
            size: { w: 1, h: 1 },
            priority: index,
            config: {},
            customSettings: {}
          };
        });
        userOverride.tiles = updatedTiles;
      }

      if (customizations.tileConfigurations) {
        userOverride.tiles = customizations.tileConfigurations.map((tileConfig, index) => ({
          id: tileConfig.id,
          position: tileConfig.position || { x: 0, y: 0 },
          size: tileConfig.size || { w: 1, h: 1 },
          priority: tileConfig.priority !== undefined ? tileConfig.priority : index,
          isVisible: tileConfig.isVisible !== undefined ? tileConfig.isVisible : true,
          config: tileConfig.config || {},
          customSettings: tileConfig.customSettings || {}
        }));
      }

      // Save the user override
      console.log('💾 Saving system configuration override...');
      const savedConfig = await saveConfigurationData(userOverride);
      console.log('💾 System override saved:', savedConfig);

      // Update the active configuration to reflect the changes
      console.log('🔄 Updating active configuration with user customizations');
      const updatedActiveConfig = {
        ...systemConfig,
        tiles: userOverride.tiles,
        metadata: {
          ...systemConfig.metadata,
          customizedBy: user?.id,
          lastCustomized: new Date().toISOString()
        }
      };
      setActiveConfiguration(updatedActiveConfig);

      console.log('✅ System configuration customized successfully:', systemConfig.name);
      return true;
    } catch (err) {
      setError('Failed to save system configuration customization');
      console.error('Error saving system configuration override:', err);
      return false;
    }
  }, [user?.id, saveConfigurationData]);

  /**
   * Update an existing user override configuration
   */
  const updateExistingUserOverride = useCallback(async (overrideConfig, customizations) => {
    console.log('🔄 Updating existing user override:', overrideConfig.name);
    setError(null);

    try {
      const updatedOverride = { ...overrideConfig };

      // Apply customizations
      if (customizations.tileOrder) {
        const updatedTiles = customizations.tileOrder.map((tileId, index) => {
          const existingTile = overrideConfig.tiles.find(t => t.id === tileId);
          if (existingTile) {
            return {
              ...existingTile,
              priority: index
            };
          }
          return {
            id: tileId,
            position: { x: index % 3, y: Math.floor(index / 3) },
            size: { w: 1, h: 1 },
            priority: index,
            config: {},
            customSettings: {}
          };
        });
        updatedOverride.tiles = updatedTiles;
      }

      if (customizations.tileConfigurations) {
        updatedOverride.tiles = customizations.tileConfigurations.map((tileConfig, index) => ({
          id: tileConfig.id,
          position: tileConfig.position || { x: 0, y: 0 },
          size: tileConfig.size || { w: 1, h: 1 },
          priority: tileConfig.priority !== undefined ? tileConfig.priority : index,
          isVisible: tileConfig.isVisible !== undefined ? tileConfig.isVisible : true,
          config: tileConfig.config || {},
          customSettings: tileConfig.customSettings || {}
        }));
      }

      // Update metadata
      updatedOverride.metadata = {
        ...updatedOverride.metadata,
        updatedAt: new Date().toISOString()
      };

      // Save the updated override
      console.log('💾 Saving updated user override...');
      const savedConfig = await saveConfigurationData(updatedOverride);
      console.log('💾 Updated user override saved:', savedConfig);

      // Update the active configuration if this is the currently active one
      if (activeConfiguration && activeConfiguration.metadata?.userOverrideId === overrideConfig.id) {
        console.log('🔄 Updating active configuration with updated customizations');
        const updatedActiveConfig = {
          ...activeConfiguration,
          tiles: updatedOverride.tiles,
          metadata: {
            ...activeConfiguration.metadata,
            lastCustomized: new Date().toISOString()
          }
        };
        setActiveConfiguration(updatedActiveConfig);
      }

      console.log('✅ User override updated successfully');
      return true;
    } catch (err) {
      setError('Failed to update user override');
      console.error('Error updating user override:', err);
      return false;
    }
  }, [saveConfigurationData, activeConfiguration]);

  /**
   * Update a user override configuration by ID
   */
  const updateUserOverrideById = useCallback(async (overrideId, customizations) => {
    console.log('🔄 Updating user override by ID:', overrideId);
    setError(null);

    try {
      // Get the existing override configuration from the database
      const existingOverride = await getConfigurationById(user?.id, overrideId);
      if (!existingOverride) {
        console.error('❌ User override not found:', overrideId);
        throw new Error('User override configuration not found');
      }

      console.log('📋 Found existing override:', existingOverride.name);
      const updatedOverride = { ...existingOverride };

      // Apply customizations
      if (customizations.tileOrder) {
        const updatedTiles = customizations.tileOrder.map((tileId, index) => {
          const existingTile = existingOverride.tiles.find(t => t.id === tileId);
          if (existingTile) {
            return {
              ...existingTile,
              priority: index
            };
          }
          return {
            id: tileId,
            position: { x: index % 3, y: Math.floor(index / 3) },
            size: { w: 1, h: 1 },
            priority: index,
            config: {},
            customSettings: {}
          };
        });
        updatedOverride.tiles = updatedTiles;
      }

      if (customizations.tileConfigurations) {
        updatedOverride.tiles = customizations.tileConfigurations.map((tileConfig, index) => ({
          id: tileConfig.id,
          position: tileConfig.position || { x: 0, y: 0 },
          size: tileConfig.size || { w: 1, h: 1 },
          priority: tileConfig.priority !== undefined ? tileConfig.priority : index,
          isVisible: tileConfig.isVisible !== undefined ? tileConfig.isVisible : true,
          config: tileConfig.config || {},
          customSettings: tileConfig.customSettings || {}
        }));
      }

      // Update metadata
      updatedOverride.metadata = {
        ...updatedOverride.metadata,
        updatedAt: new Date().toISOString()
      };

      // Save the updated override
      console.log('💾 Saving updated user override...');
      const savedConfig = await saveConfigurationData(updatedOverride);
      console.log('💾 Updated user override saved:', savedConfig);

      // Update the active configuration if this override belongs to the currently active system config
      if (activeConfiguration &&
          (activeConfiguration.metadata?.userOverrideId === overrideId ||
           (activeConfiguration.type === CONFIGURATION_TYPES.SYSTEM &&
            updatedOverride.metadata?.originalSystemConfig === activeConfiguration.id))) {
        console.log('🔄 Updating active configuration with updated customizations');
        console.log('🔄 Active config ID:', activeConfiguration.id);
        console.log('🔄 Override original system config:', updatedOverride.metadata?.originalSystemConfig);

        const updatedActiveConfig = {
          ...activeConfiguration,
          tiles: updatedOverride.tiles,
          metadata: {
            ...activeConfiguration.metadata,
            lastCustomized: new Date().toISOString(),
            userOverrideId: overrideId // Ensure the override ID is tracked
          }
        };

        // Set the active configuration immediately
        setActiveConfiguration(updatedActiveConfig);
        console.log('✅ Active configuration updated with new tiles');

      } else {
        console.log('⚠️ Active configuration not updated - no match found');
        console.log('⚠️ Active config:', activeConfiguration?.id, activeConfiguration?.type);
        console.log('⚠️ Override ID:', overrideId);
        console.log('⚠️ Override original system config:', updatedOverride.metadata?.originalSystemConfig);
      }

      console.log('✅ User override updated successfully by ID');
      return true;
    } catch (err) {
      setError('Failed to update user override');
      console.error('Error updating user override by ID:', err);
      return false;
    }
  }, [user?.id, saveConfigurationData, activeConfiguration]);

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
    getCurrentTileConfigs,
    getCurrentFilters,
    updateTileOrder,
    updateTileConfigurations,
    createUserCustomization,
    saveSystemConfigurationOverride,
    updateExistingUserOverride,
    updateUserOverrideById,
    clearError
  };
};

export default useDashboardConfigurations;
