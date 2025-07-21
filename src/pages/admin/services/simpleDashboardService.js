import { supabase } from '../../../config/supabase';

/**
 * Simplified Dashboard Service
 * 
 * This service provides simple CRUD operations for user-owned dashboards.
 * No complex system/user override logic - everything is user-owned and directly editable.
 */

const TABLE_NAME = 'user_dashboards';

/**
 * Get all dashboards for a user
 */
export const getUserDashboards = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('📋 Loading dashboards for user:', userId);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('is_template', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error loading user dashboards:', error);
    throw new Error(`Failed to load dashboards: ${error.message}`);
  }

  console.log('✅ Loaded', data.length, 'dashboards for user');
  return data || [];
};

/**
 * Get a specific dashboard by ID
 */
export const getUserDashboard = async (userId, dashboardId) => {
  if (!userId || !dashboardId) {
    throw new Error('User ID and Dashboard ID are required');
  }

  console.log('📋 Loading dashboard:', dashboardId, 'for user:', userId);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('id', dashboardId)
    .eq('is_template', false)
    .single();

  if (error) {
    console.error('❌ Error loading dashboard:', error);
    throw new Error(`Failed to load dashboard: ${error.message}`);
  }

  console.log('✅ Loaded dashboard:', data.name);
  return data;
};

/**
 * Create a new dashboard for a user
 */
export const createUserDashboard = async (userId, dashboardData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('➕ Creating dashboard for user:', userId, 'Name:', dashboardData.name);

  const newDashboard = {
    user_id: userId,
    name: dashboardData.name,
    description: dashboardData.description || '',
    tiles: dashboardData.tiles || [],
    filters: dashboardData.filters || {},
    layout: dashboardData.layout || {},
    is_template: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(newDashboard)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating dashboard:', error);
    throw new Error(`Failed to create dashboard: ${error.message}`);
  }

  console.log('✅ Created dashboard:', data.name, 'ID:', data.id);
  return data;
};

/**
 * Update an existing dashboard
 */
export const updateUserDashboard = async (userId, dashboardId, updates) => {
  if (!userId || !dashboardId) {
    throw new Error('User ID and Dashboard ID are required');
  }

  console.log('🔄 Updating dashboard:', dashboardId, 'for user:', userId);

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('user_id', userId)
    .eq('id', dashboardId)
    .eq('is_template', false)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating dashboard:', error);
    throw new Error(`Failed to update dashboard: ${error.message}`);
  }

  console.log('✅ Updated dashboard:', data.name);
  return data;
};

/**
 * Delete a dashboard
 */
export const deleteUserDashboard = async (userId, dashboardId) => {
  if (!userId || !dashboardId) {
    throw new Error('User ID and Dashboard ID are required');
  }

  console.log('🗑️ Deleting dashboard:', dashboardId, 'for user:', userId);

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('user_id', userId)
    .eq('id', dashboardId)
    .eq('is_template', false);

  if (error) {
    console.error('❌ Error deleting dashboard:', error);
    throw new Error(`Failed to delete dashboard: ${error.message}`);
  }

  console.log('✅ Deleted dashboard:', dashboardId);
  return true;
};

/**
 * Get all dashboard templates (admin only)
 */
export const getDashboardTemplates = async () => {
  console.log('📋 Loading dashboard templates');

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error loading templates:', error);
    throw new Error(`Failed to load templates: ${error.message}`);
  }

  console.log('✅ Loaded', data.length, 'dashboard templates');
  return data || [];
};

/**
 * Create a dashboard template (admin only)
 */
export const createDashboardTemplate = async (templateData) => {
  console.log('➕ Creating dashboard template:', templateData.name);

  const newTemplate = {
    user_id: null, // Templates don't belong to any user
    name: templateData.name,
    description: templateData.description || '',
    tiles: templateData.tiles || [],
    filters: templateData.filters || {},
    layout: templateData.layout || {},
    is_template: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(newTemplate)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating template:', error);
    throw new Error(`Failed to create template: ${error.message}`);
  }

  console.log('✅ Created template:', data.name, 'ID:', data.id);
  return data;
};

/**
 * Initialize dashboards for a new user by copying templates
 */
export const initializeUserDashboards = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('🎯 Initializing dashboards for new user:', userId);

  // Check if user already has dashboards
  const existingDashboards = await getUserDashboards(userId);
  if (existingDashboards.length > 0) {
    console.log('ℹ️ User already has dashboards, skipping initialization');
    return existingDashboards;
  }

  // Get all templates
  const templates = await getDashboardTemplates();
  if (templates.length === 0) {
    console.log('⚠️ No templates found, creating empty dashboard list');
    return [];
  }

  // Copy each template to user's account
  const createdDashboards = [];
  for (const template of templates) {
    try {
      const userDashboard = await createUserDashboard(userId, {
        name: template.name,
        description: template.description,
        tiles: template.tiles,
        filters: template.filters,
        layout: template.layout
      });
      createdDashboards.push(userDashboard);
    } catch (error) {
      console.error('❌ Failed to copy template:', template.name, error);
      // Continue with other templates even if one fails
    }
  }

  console.log('✅ Initialized', createdDashboards.length, 'dashboards for user');
  return createdDashboards;
};

/**
 * Update dashboard tiles (most common operation)
 */
export const updateDashboardTiles = async (userId, dashboardId, tiles) => {
  return updateUserDashboard(userId, dashboardId, { tiles });
};

/**
 * Duplicate a dashboard
 */
export const duplicateDashboard = async (userId, dashboardId, newName) => {
  const originalDashboard = await getUserDashboard(userId, dashboardId);

  return createUserDashboard(userId, {
    name: newName || `${originalDashboard.name} (Copy)`,
    description: originalDashboard.description,
    tiles: originalDashboard.tiles,
    filters: originalDashboard.filters,
    layout: originalDashboard.layout
  });
};

/**
 * Set a dashboard as default for a user
 */
export const setDefaultDashboard = async (userId, dashboardId) => {
  if (!userId || !dashboardId) {
    throw new Error('User ID and Dashboard ID are required');
  }

  console.log('⭐ Setting dashboard as default:', dashboardId, 'for user:', userId);

  // First, unset all other defaults for this user
  await supabase
    .from(TABLE_NAME)
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_template', false);

  // Then set the new default
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('id', dashboardId)
    .eq('is_template', false)
    .select()
    .single();

  if (error) {
    console.error('❌ Error setting default dashboard:', error);
    throw new Error(`Failed to set default dashboard: ${error.message}`);
  }

  console.log('✅ Set dashboard as default:', data.name);
  return data;
};

/**
 * Get the default dashboard for a user
 */
export const getDefaultDashboard = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('🎯 Getting default dashboard for user:', userId);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .eq('is_template', false)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('❌ Error getting default dashboard:', error);
    throw new Error(`Failed to get default dashboard: ${error.message}`);
  }

  if (data) {
    console.log('✅ Found default dashboard:', data.name);
    return data;
  }

  console.log('ℹ️ No default dashboard found for user');
  return null;
};
