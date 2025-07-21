import { supabase } from '../../../config/supabase';
import { initializeUserDashboards } from './simpleDashboardService';
import { DASHBOARD_TEMPLATES } from '../config/dashboardTemplates';

/**
 * User Initialization Service
 * 
 * This service handles initializing new users with dashboard templates
 * and other default settings when they first access the system.
 */

const USER_INITIALIZATION_TABLE = 'user_initialization';

/**
 * Check if a user has been initialized
 */
export const isUserInitialized = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('🔍 Checking if user is initialized:', userId);

  const { data, error } = await supabase
    .from(USER_INITIALIZATION_TABLE)
    .select('initialized_at')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('❌ Error checking user initialization:', error);
    throw new Error(`Failed to check user initialization: ${error.message}`);
  }

  const isInitialized = !!data;
  console.log('✅ User initialization status:', isInitialized);
  return isInitialized;
};

/**
 * Mark a user as initialized
 */
export const markUserAsInitialized = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('✅ Marking user as initialized:', userId);

  const { error } = await supabase
    .from(USER_INITIALIZATION_TABLE)
    .upsert({
      user_id: userId,
      initialized_at: new Date().toISOString(),
      dashboard_templates_copied: true,
      version: '1.0.0'
    });

  if (error) {
    console.error('❌ Error marking user as initialized:', error);
    throw new Error(`Failed to mark user as initialized: ${error.message}`);
  }

  console.log('✅ User marked as initialized');
};

/**
 * Initialize a new user with default dashboards and settings
 */
export const initializeNewUser = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('🎯 Initializing new user:', userId);

  try {
    // Check if already initialized
    const alreadyInitialized = await isUserInitialized(userId);
    if (alreadyInitialized) {
      console.log('ℹ️ User already initialized, skipping');
      return { success: true, message: 'User already initialized' };
    }

    // Initialize dashboards from templates
    console.log('📋 Copying dashboard templates to user account...');
    const dashboards = await initializeUserDashboards(userId);
    
    if (dashboards.length === 0) {
      console.warn('⚠️ No dashboards were created for user');
    } else {
      console.log('✅ Created', dashboards.length, 'dashboards for user');
    }

    // Mark user as initialized
    await markUserAsInitialized(userId);

    console.log('🎉 User initialization completed successfully');
    return {
      success: true,
      message: 'User initialized successfully',
      dashboards: dashboards
    };

  } catch (error) {
    console.error('❌ Error initializing user:', error);
    throw new Error(`Failed to initialize user: ${error.message}`);
  }
};

/**
 * Initialize user on first dashboard access
 * This is called automatically by the useDashboards hook
 */
export const initializeUserOnFirstAccess = async (userId) => {
  if (!userId) {
    return { success: false, message: 'No user ID provided' };
  }

  try {
    console.log('🔍 Checking user initialization on first access:', userId);
    
    const alreadyInitialized = await isUserInitialized(userId);
    if (alreadyInitialized) {
      console.log('ℹ️ User already initialized');
      return { success: true, message: 'User already initialized' };
    }

    console.log('🎯 First access detected, initializing user...');
    return await initializeNewUser(userId);

  } catch (error) {
    console.error('❌ Error during first access initialization:', error);
    return { 
      success: false, 
      message: error.message,
      error: error 
    };
  }
};

/**
 * Reset user initialization (admin function)
 * This will clear the user's initialization status and allow re-initialization
 */
export const resetUserInitialization = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('🔄 Resetting user initialization:', userId);

  const { error } = await supabase
    .from(USER_INITIALIZATION_TABLE)
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Error resetting user initialization:', error);
    throw new Error(`Failed to reset user initialization: ${error.message}`);
  }

  console.log('✅ User initialization reset');
  return true;
};

/**
 * Get initialization statistics (admin function)
 */
export const getInitializationStats = async () => {
  console.log('📊 Getting initialization statistics...');

  const { data, error } = await supabase
    .from(USER_INITIALIZATION_TABLE)
    .select('user_id, initialized_at, dashboard_templates_copied, version');

  if (error) {
    console.error('❌ Error getting initialization stats:', error);
    throw new Error(`Failed to get initialization stats: ${error.message}`);
  }

  const stats = {
    totalInitializedUsers: data.length,
    recentInitializations: data.filter(record => {
      const initDate = new Date(record.initialized_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return initDate > weekAgo;
    }).length,
    dashboardTemplatesCopied: data.filter(record => record.dashboard_templates_copied).length
  };

  console.log('📊 Initialization stats:', stats);
  return stats;
};

/**
 * Bulk initialize multiple users (admin function)
 */
export const bulkInitializeUsers = async (userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('User IDs array is required');
  }

  console.log('🎯 Bulk initializing', userIds.length, 'users...');

  const results = [];
  for (const userId of userIds) {
    try {
      const result = await initializeNewUser(userId);
      results.push({ userId, success: true, result });
    } catch (error) {
      console.error('❌ Failed to initialize user:', userId, error);
      results.push({ userId, success: false, error: error.message });
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('🎉 Bulk initialization completed:', { successful, failed });
  return {
    total: userIds.length,
    successful,
    failed,
    results
  };
};

/**
 * Check if templates need to be updated for existing users
 */
export const checkTemplateUpdates = async () => {
  console.log('🔍 Checking for template updates...');
  
  // This could be expanded to check if new templates have been added
  // and offer to copy them to existing users
  
  const currentTemplateCount = DASHBOARD_TEMPLATES.length;
  console.log('📋 Current template count:', currentTemplateCount);
  
  // For now, just return the current state
  return {
    currentTemplateCount,
    message: 'Template update checking not yet implemented'
  };
};
