// Service for managing user-saved dashboard layouts
import { supabase } from '../../../config/supabase';

const STORAGE_KEY = 'dashboard_saved_layouts';
const MAX_LAYOUTS_PER_USER = 10;

/**
 * Get all saved layouts for the current user
 */
export const getSavedLayouts = async (userId) => {
  try {
    if (!userId) {
      // Fallback to localStorage for non-authenticated users
      return getLocalSavedLayouts();
    }

    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch saved layouts from database:', error);
      return getLocalSavedLayouts();
    }

    return data || [];
  } catch (error) {
    console.warn('Error fetching saved layouts:', error);
    return getLocalSavedLayouts();
  }
};

/**
 * Save a new layout or update existing one
 */
export const saveLayout = async (userId, layout) => {
  try {
    console.log('💾 Saving layout:', { userId, layoutName: layout.name });

    // Validate layout structure
    if (!layout.name || !layout.tiles || !Array.isArray(layout.tiles)) {
      throw new Error('Invalid layout structure');
    }

    if (!userId) {
      console.log('⚠️ No userId provided, using localStorage fallback');
      // Fallback to localStorage
      return saveLocalLayout(layout);
    }

    const layoutData = {
      id: layout.id || generateLayoutId(),
      name: layout.name.trim(),
      description: layout.description?.trim() || '',
      tiles: layout.tiles,
      filters: layout.filters || {},
      layout_type: layout.layout_type || 'custom',
      is_default: layout.is_default || false,
      created_at: layout.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Layout data prepared:', layoutData);

    // Check if updating existing layout
    if (layout.id) {
      console.log('🔄 Updating existing layout:', layout.id);
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .update({
          name: layoutData.name,
          description: layoutData.description,
          tiles: layoutData.tiles,
          filters: layoutData.filters,
          layout_type: layoutData.layout_type,
          is_default: layoutData.is_default,
          updated_at: layoutData.updated_at
        })
        .eq('id', layout.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      console.log('✅ Layout updated successfully:', data);
      return data;
    } else {
      // Create new layout
      console.log('➕ Creating new layout for user:', userId);
      const insertData = {
        ...layoutData,
        user_id: userId
      };
      console.log('📤 Insert data:', insertData);

      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }
      console.log('✅ Layout created successfully:', data);
      return data;
    }
  } catch (error) {
    console.warn('Error saving layout:', error);
    // Fallback to localStorage
    return saveLocalLayout(layoutData);
  }
};

/**
 * Delete a saved layout
 */
export const deleteLayout = async (userId, layoutId) => {
  try {
    if (!userId) {
      return deleteLocalLayout(layoutId);
    }

    const { error } = await supabase
      .from('dashboard_layouts')
      .delete()
      .eq('id', layoutId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Error deleting layout:', error);
    return deleteLocalLayout(layoutId);
  }
};

/**
 * Set a layout as default
 */
export const setDefaultLayout = async (userId, layoutId) => {
  try {
    if (!userId) {
      return setLocalDefaultLayout(layoutId);
    }

    // First, unset all other defaults
    await supabase
      .from('dashboard_layouts')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .update({ is_default: true })
      .eq('id', layoutId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Error setting default layout:', error);
    return setLocalDefaultLayout(layoutId);
  }
};

/**
 * Get the default layout for a user
 */
export const getDefaultLayout = async (userId) => {
  try {
    if (!userId) {
      return getLocalDefaultLayout();
    }

    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      return getLocalDefaultLayout();
    }

    return data;
  } catch (error) {
    console.warn('Error fetching default layout:', error);
    return getLocalDefaultLayout();
  }
};

/**
 * Duplicate an existing layout
 */
export const duplicateLayout = async (userId, layoutId, newName) => {
  try {
    const layouts = await getSavedLayouts(userId);
    const originalLayout = layouts.find(l => l.id === layoutId);
    
    if (!originalLayout) {
      throw new Error('Layout not found');
    }

    const duplicatedLayout = {
      ...originalLayout,
      id: generateLayoutId(),
      name: newName || `${originalLayout.name} (Copy)`,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await saveLayout(userId, duplicatedLayout);
  } catch (error) {
    console.warn('Error duplicating layout:', error);
    throw error;
  }
};

// Local storage fallback functions
const getLocalSavedLayouts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Error reading local layouts:', error);
    return [];
  }
};

const saveLocalLayout = (layout) => {
  try {
    const layouts = getLocalSavedLayouts();
    const existingIndex = layouts.findIndex(l => l.id === layout.id);
    
    if (existingIndex >= 0) {
      layouts[existingIndex] = layout;
    } else {
      layouts.unshift(layout);
      // Limit number of layouts
      if (layouts.length > MAX_LAYOUTS_PER_USER) {
        layouts.splice(MAX_LAYOUTS_PER_USER);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    return layout;
  } catch (error) {
    console.warn('Error saving local layout:', error);
    throw error;
  }
};

const deleteLocalLayout = (layoutId) => {
  try {
    const layouts = getLocalSavedLayouts();
    const filtered = layouts.filter(l => l.id !== layoutId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.warn('Error deleting local layout:', error);
    return false;
  }
};

const setLocalDefaultLayout = (layoutId) => {
  try {
    const layouts = getLocalSavedLayouts();
    layouts.forEach(layout => {
      layout.is_default = layout.id === layoutId;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    return layouts.find(l => l.id === layoutId);
  } catch (error) {
    console.warn('Error setting local default layout:', error);
    return null;
  }
};

const getLocalDefaultLayout = () => {
  try {
    const layouts = getLocalSavedLayouts();
    return layouts.find(l => l.is_default) || null;
  } catch (error) {
    console.warn('Error getting local default layout:', error);
    return null;
  }
};

// Utility functions
const generateLayoutId = () => {
  return `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert current dashboard state to saveable layout
 */
export const createLayoutFromCurrentState = (tileOrder, globalFilters, layoutType = 'custom') => {
  return {
    tiles: tileOrder.map((tileId, index) => ({
      id: tileId,
      position: { x: index % 3, y: Math.floor(index / 3), w: 1, h: 1 },
      priority: index + 1
    })),
    filters: globalFilters,
    layout_type: layoutType,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Validate layout structure
 */
export const validateLayout = (layout) => {
  const errors = [];
  
  if (!layout.name || layout.name.trim().length === 0) {
    errors.push('Layout name is required');
  }
  
  if (layout.name && layout.name.length > 50) {
    errors.push('Layout name must be 50 characters or less');
  }
  
  if (!layout.tiles || !Array.isArray(layout.tiles)) {
    errors.push('Layout must have tiles array');
  }
  
  if (layout.tiles && layout.tiles.length === 0) {
    errors.push('Layout must have at least one tile');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
