/**
 * Dashboard Configuration Service
 * 
 * Unified service for managing dashboard configurations (replaces separate
 * preset, layout, and tile management services)
 */

import { supabase } from '../../../config/supabase';
import { 
  CONFIGURATION_TYPES, 
  SYSTEM_CONFIGURATIONS,
  validateConfiguration,
  createEmptyConfiguration,
  cloneConfiguration,
  getSystemConfigurations
} from '../types/DashboardConfiguration';

const STORAGE_KEY = 'dashboard_configurations';
const MAX_USER_CONFIGURATIONS = 20;

/**
 * Get all configurations for a user (system + user-created)
 */
export const getAllConfigurations = async (userId) => {
  try {
    // Always include system configurations
    const systemConfigs = getSystemConfigurations();
    
    if (!userId) {
      // For non-authenticated users, add local configurations
      const localConfigs = getLocalConfigurations();
      return [...systemConfigs, ...localConfigs];
    }

    // Get user configurations from database
    const { data: userConfigs, error } = await supabase
      .from('dashboard_configurations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch user configurations:', error);
      const localConfigs = getLocalConfigurations();
      return [...systemConfigs, ...localConfigs];
    }

    // Parse JSON fields and combine with system configs
    const parsedUserConfigs = (userConfigs || []).map(config => ({
      ...config,
      isDefault: config.is_default, // Map database field to expected property name
      isTemplate: config.is_template, // Map database field to expected property name
      tiles: typeof config.tiles === 'string' ? JSON.parse(config.tiles) : config.tiles,
      filters: typeof config.filters === 'string' ? JSON.parse(config.filters) : config.filters,
      layout: typeof config.layout === 'string' ? JSON.parse(config.layout) : config.layout,
      metadata: typeof config.metadata === 'string' ? JSON.parse(config.metadata) : config.metadata,
      sharing: typeof config.sharing === 'string' ? JSON.parse(config.sharing) : config.sharing
    }));

    return [...systemConfigs, ...parsedUserConfigs];
  } catch (error) {
    console.warn('Error fetching configurations:', error);
    const systemConfigs = getSystemConfigurations();
    const localConfigs = getLocalConfigurations();
    return [...systemConfigs, ...localConfigs];
  }
};

/**
 * Get a specific configuration by ID
 */
export const getConfigurationById = async (userId, configId) => {
  // Check system configurations first
  const systemConfig = Object.values(SYSTEM_CONFIGURATIONS).find(config => config.id === configId);
  if (systemConfig) {
    return systemConfig;
  }

  // Check user configurations
  const allConfigs = await getAllConfigurations(userId);
  return allConfigs.find(config => config.id === configId) || null;
};

/**
 * Save a configuration (create or update)
 */
export const saveConfiguration = async (userId, configuration) => {
  try {
    console.log('💾 Saving configuration:', { userId, configName: configuration.name });

    // Validate configuration
    const validation = validateConfiguration(configuration);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // System configurations cannot be modified
    if (configuration.type === CONFIGURATION_TYPES.SYSTEM) {
      throw new Error('System configurations cannot be modified');
    }

    if (!userId) {
      console.log('⚠️ No userId provided, using localStorage fallback');
      return saveLocalConfiguration(configuration);
    }

    const configData = {
      ...configuration,
      metadata: {
        ...configuration.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    // Check if updating existing configuration (has an ID and is not a system config)
    if (configuration.id && configuration.type !== CONFIGURATION_TYPES.SYSTEM) {
      // Update existing
      const { data, error } = await supabase
        .from('dashboard_configurations')
        .update({
          name: configData.name,
          description: configData.description,
          type: configData.type,
          is_default: configData.isDefault,
          is_template: configData.isTemplate,
          tiles: JSON.stringify(configData.tiles),
          filters: JSON.stringify(configData.filters),
          layout: JSON.stringify(configData.layout),
          metadata: JSON.stringify(configData.metadata),
          sharing: JSON.stringify(configData.sharing),
          updated_at: configData.metadata.updatedAt
        })
        .eq('id', configuration.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      console.log('✅ Configuration updated successfully:', data);
      return data;
    } else {
      // Create new configuration
      const newId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertData = {
        id: newId,
        user_id: userId,
        name: configData.name,
        description: configData.description || '',
        type: configData.type,
        is_default: configData.isDefault || false,
        is_template: configData.isTemplate || false,
        tiles: JSON.stringify(configData.tiles),
        filters: JSON.stringify(configData.filters),
        layout: JSON.stringify(configData.layout || {}),
        metadata: JSON.stringify({
          ...configData.metadata,
          createdAt: new Date().toISOString(),
          createdBy: userId
        }),
        sharing: JSON.stringify(configData.sharing || {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('➕ Creating new configuration:', newId);
      const { data, error } = await supabase
        .from('dashboard_configurations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }
      console.log('✅ Configuration created successfully:', data);
      return data;
    }
  } catch (error) {
    console.warn('Error saving configuration:', error);
    return saveLocalConfiguration(configuration);
  }
};

/**
 * Delete a configuration
 */
export const deleteConfiguration = async (userId, configId) => {
  try {
    // Cannot delete system configurations
    const systemConfig = Object.values(SYSTEM_CONFIGURATIONS).find(config => config.id === configId);
    if (systemConfig) {
      throw new Error('Cannot delete system configurations');
    }

    if (!userId) {
      return deleteLocalConfiguration(configId);
    }

    const { error } = await supabase
      .from('dashboard_configurations')
      .delete()
      .eq('id', configId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Error deleting configuration:', error);
    return deleteLocalConfiguration(configId);
  }
};

/**
 * Set a configuration as default
 */
export const setDefaultConfiguration = async (userId, configId) => {
  try {
    console.log('🔧 setDefaultConfiguration called:', { userId, configId });

    if (!userId) {
      console.log('🔧 No userId, using localStorage');
      return setLocalDefaultConfiguration(configId);
    }

    // First, unset all other defaults
    console.log('🔧 Unsetting all other defaults for user:', userId);
    const unsetResult = await supabase
      .from('dashboard_configurations')
      .update({ is_default: false })
      .eq('user_id', userId);

    console.log('🔧 Unset result:', unsetResult);

    // Then set the new default (only for user configurations)
    const systemConfig = Object.values(SYSTEM_CONFIGURATIONS).find(config => config.id === configId);
    console.log('🔧 Is system config?', !!systemConfig, 'configId:', configId);

    if (!systemConfig) {
      console.log('🔧 Setting user config as default:', configId);

      // Clear any localStorage default preference when setting a user config as default
      localStorage.removeItem('default_dashboard_configuration');
      console.log('🔧 Cleared localStorage default preference');

      const { data, error } = await supabase
        .from('dashboard_configurations')
        .update({ is_default: true })
        .eq('id', configId)
        .eq('user_id', userId)
        .select()
        .single();

      console.log('🔧 Set default result:', { data, error });
      if (error) throw error;
      return data;
    } else {
      // For system configurations, store preference locally
      console.log('🔧 Setting system config as default in localStorage:', configId);
      return setLocalDefaultConfiguration(configId);
    }
  } catch (error) {
    console.error('🔧 Error setting default configuration:', error);
    return setLocalDefaultConfiguration(configId);
  }
};

/**
 * Get the default configuration for a user
 */
export const getDefaultConfiguration = async (userId) => {
  try {
    // Check for local default preference first
    const localDefault = getLocalDefaultConfiguration();
    if (localDefault) {
      return await getConfigurationById(userId, localDefault);
    }

    if (!userId) {
      // Return first system configuration as default
      return Object.values(SYSTEM_CONFIGURATIONS)[0];
    }

    const { data, error } = await supabase
      .from('dashboard_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error || !data) {
      // Return first system configuration as fallback
      return Object.values(SYSTEM_CONFIGURATIONS)[0];
    }

    return {
      ...data,
      isDefault: data.is_default, // Map database field to expected property name
      isTemplate: data.is_template, // Map database field to expected property name
      tiles: JSON.parse(data.tiles),
      filters: JSON.parse(data.filters),
      layout: JSON.parse(data.layout),
      metadata: JSON.parse(data.metadata),
      sharing: JSON.parse(data.sharing)
    };
  } catch (error) {
    console.warn('Error fetching default configuration:', error);
    return Object.values(SYSTEM_CONFIGURATIONS)[0];
  }
};

/**
 * Clone a configuration
 */
export const cloneConfigurationById = async (userId, configId, newName) => {
  try {
    const originalConfig = await getConfigurationById(userId, configId);
    if (!originalConfig) {
      throw new Error('Configuration not found');
    }

    const clonedConfig = cloneConfiguration(originalConfig, newName);
    return await saveConfiguration(userId, clonedConfig);
  } catch (error) {
    console.warn('Error cloning configuration:', error);
    throw error;
  }
};

/**
 * Update configuration usage statistics
 */
export const updateConfigurationUsage = async (userId, configId) => {
  try {
    if (!userId) return;

    const systemConfig = Object.values(SYSTEM_CONFIGURATIONS).find(config => config.id === configId);
    if (systemConfig) return; // Don't track usage for system configs

    await supabase
      .from('dashboard_configurations')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: supabase.raw('usage_count + 1')
      })
      .eq('id', configId)
      .eq('user_id', userId);
  } catch (error) {
    console.warn('Error updating configuration usage:', error);
  }
};

// Local storage fallback functions
const getLocalConfigurations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Error reading local configurations:', error);
    return [];
  }
};

const saveLocalConfiguration = (config) => {
  try {
    const configs = getLocalConfigurations();
    const existingIndex = configs.findIndex(c => c.id === config.id);
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.unshift(config);
      if (configs.length > MAX_USER_CONFIGURATIONS) {
        configs.splice(MAX_USER_CONFIGURATIONS);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return config;
  } catch (error) {
    console.warn('Error saving local configuration:', error);
    throw error;
  }
};

const deleteLocalConfiguration = (configId) => {
  try {
    const configs = getLocalConfigurations();
    const filtered = configs.filter(c => c.id !== configId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.warn('Error deleting local configuration:', error);
    return false;
  }
};

const setLocalDefaultConfiguration = (configId) => {
  try {
    localStorage.setItem('default_dashboard_configuration', configId);
    return configId;
  } catch (error) {
    console.warn('Error setting local default configuration:', error);
    return null;
  }
};

const getLocalDefaultConfiguration = () => {
  try {
    return localStorage.getItem('default_dashboard_configuration');
  } catch (error) {
    console.warn('Error getting local default configuration:', error);
    return null;
  }
};
