/**
 * User Preferences Service
 * 
 * Manages user-specific preferences for system configurations,
 * such as custom tile orders without creating new configurations
 */

import { supabase } from '../../../config/supabase';

const STORAGE_KEY = 'user_dashboard_preferences';

// Track if the table exists to avoid repeated failed requests
let tableExists = null;

/**
 * Get user preferences for dashboard configurations
 */
export const getUserPreferences = async (userId) => {
  try {
    if (!userId) {
      return getLocalPreferences();
    }

    // If we know the table doesn't exist, skip the database call
    if (tableExists === false) {
      console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
      return getLocalPreferences();
    }

    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return empty
        tableExists = true; // Table exists but no data
        return { tileOrders: {} };
      }
      if (error.code === '42P01') {
        // Table doesn't exist, fall back to localStorage
        tableExists = false; // Remember that table doesn't exist
        console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
        return getLocalPreferences();
      }
      console.warn('Failed to fetch user preferences:', error);
      return getLocalPreferences();
    }

    // If we got data successfully, the table exists
    tableExists = true;

    return {
      tileOrders: typeof data.tile_orders === 'string' 
        ? JSON.parse(data.tile_orders) 
        : data.tile_orders || {}
    };
  } catch (error) {
    console.warn('Error fetching user preferences:', error);
    return getLocalPreferences();
  }
};

/**
 * Save user tile order preference for a configuration
 */
export const saveUserTileOrder = async (userId, configurationId, tileOrder) => {
  try {
    console.log('💾 Saving user tile order preference:', { userId, configurationId, tileOrder });

    if (!userId) {
      return saveLocalTileOrder(configurationId, tileOrder);
    }

    // If we know the table doesn't exist, skip the database call
    if (tableExists === false) {
      console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
      return saveLocalTileOrder(configurationId, tileOrder);
    }

    // Get current preferences
    const currentPrefs = await getUserPreferences(userId);
    
    // Update tile orders
    const updatedTileOrders = {
      ...currentPrefs.tileOrders,
      [configurationId]: tileOrder
    };

    // Upsert preferences
    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .upsert({
        user_id: userId,
        tile_orders: JSON.stringify(updatedTileOrders),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, fall back to localStorage
        tableExists = false; // Remember that table doesn't exist
        console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
        return saveLocalTileOrder(configurationId, tileOrder);
      }
      console.error('❌ Failed to save user preferences:', error);
      return saveLocalTileOrder(configurationId, tileOrder);
    }

    console.log('✅ User tile order preference saved successfully');
    return data;
  } catch (error) {
    console.warn('Error saving user tile order preference:', error);
    return saveLocalTileOrder(configurationId, tileOrder);
  }
};

/**
 * Get user's custom tile order for a specific configuration
 */
export const getUserTileOrder = async (userId, configurationId) => {
  try {
    const preferences = await getUserPreferences(userId);
    return preferences.tileOrders[configurationId] || null;
  } catch (error) {
    console.warn('Error getting user tile order:', error);
    return getLocalTileOrder(configurationId);
  }
};

/**
 * Remove user's custom tile order for a configuration (reset to default)
 */
export const removeUserTileOrder = async (userId, configurationId) => {
  try {
    if (!userId) {
      return removeLocalTileOrder(configurationId);
    }

    // If we know the table doesn't exist, skip the database call
    if (tableExists === false) {
      console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
      return removeLocalTileOrder(configurationId);
    }

    const currentPrefs = await getUserPreferences(userId);
    const updatedTileOrders = { ...currentPrefs.tileOrders };
    delete updatedTileOrders[configurationId];

    const { error } = await supabase
      .from('user_dashboard_preferences')
      .upsert({
        user_id: userId,
        tile_orders: JSON.stringify(updatedTileOrders),
        updated_at: new Date().toISOString()
      });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, fall back to localStorage
        tableExists = false; // Remember that table doesn't exist
        console.warn('user_dashboard_preferences table does not exist, using localStorage fallback');
        return removeLocalTileOrder(configurationId);
      }
      console.error('❌ Failed to remove user tile order preference:', error);
      return removeLocalTileOrder(configurationId);
    }

    console.log('✅ User tile order preference removed');
    return true;
  } catch (error) {
    console.warn('Error removing user tile order preference:', error);
    return removeLocalTileOrder(configurationId);
  }
};

/**
 * Get the effective tile order for a configuration (user preference or default)
 */
export const getEffectiveTileOrder = async (userId, configuration) => {
  try {
    // For system configurations, check for user preferences first
    if (configuration.type === 'system') {
      const userTileOrder = await getUserTileOrder(userId, configuration.id);
      if (userTileOrder && userTileOrder.length > 0) {
        console.log('📋 Using user tile order preference for:', configuration.name);
        return userTileOrder;
      }
    }

    // Fall back to configuration's default tile order
    if (configuration.tiles && configuration.tiles.length > 0) {
      return configuration.tiles
        .sort((a, b) => a.priority - b.priority)
        .map(tile => tile.id);
    }

    return [];
  } catch (error) {
    console.warn('Error getting effective tile order:', error);
    return configuration.tiles?.map(tile => tile.id) || [];
  }
};

// Local storage fallback functions
const getLocalPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { tileOrders: {} };
  } catch (error) {
    console.warn('Error reading local preferences:', error);
    return { tileOrders: {} };
  }
};

const saveLocalTileOrder = (configurationId, tileOrder) => {
  try {
    const prefs = getLocalPreferences();
    prefs.tileOrders[configurationId] = tileOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return prefs;
  } catch (error) {
    console.warn('Error saving local tile order:', error);
    throw error;
  }
};

const getLocalTileOrder = (configurationId) => {
  try {
    const prefs = getLocalPreferences();
    return prefs.tileOrders[configurationId] || null;
  } catch (error) {
    console.warn('Error getting local tile order:', error);
    return null;
  }
};

const removeLocalTileOrder = (configurationId) => {
  try {
    const prefs = getLocalPreferences();
    delete prefs.tileOrders[configurationId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.warn('Error removing local tile order:', error);
    return false;
  }
};
