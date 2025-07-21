import { supabase } from '../../../config/supabase';
import { createTemplatesInDatabase } from '../config/dashboardTemplates';
import { initializeNewUser, bulkInitializeUsers } from '../services/userInitializationService';

/**
 * Migration Utilities
 * 
 * These utilities help with migrating from the old complex dashboard system
 * to the new simplified user-owned dashboard system.
 */

/**
 * Check if the new simplified dashboard system is set up
 */
export const checkSimpleDashboardSetup = async () => {
  console.log('🔍 Checking simplified dashboard system setup...');

  try {
    // Check if user_dashboards table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_dashboards', 'user_initialization']);

    if (tablesError) {
      throw new Error(`Failed to check tables: ${tablesError.message}`);
    }

    const hasUserDashboards = tables.some(t => t.table_name === 'user_dashboards');
    const hasUserInitialization = tables.some(t => t.table_name === 'user_initialization');

    // Check if templates exist
    let templateCount = 0;
    if (hasUserDashboards) {
      const { data: templates, error: templatesError } = await supabase
        .from('user_dashboards')
        .select('id')
        .eq('is_template', true);

      if (!templatesError) {
        templateCount = templates.length;
      }
    }

    const isSetup = hasUserDashboards && hasUserInitialization && templateCount > 0;

    console.log('✅ Setup check completed:', {
      hasUserDashboards,
      hasUserInitialization,
      templateCount,
      isSetup
    });

    return {
      isSetup,
      hasUserDashboards,
      hasUserInitialization,
      templateCount,
      message: isSetup 
        ? 'Simplified dashboard system is set up and ready'
        : 'Simplified dashboard system needs to be set up'
    };

  } catch (error) {
    console.error('❌ Error checking setup:', error);
    return {
      isSetup: false,
      error: error.message,
      message: 'Failed to check simplified dashboard system setup'
    };
  }
};

/**
 * Set up the simplified dashboard system
 * This creates templates in the database if they don't exist
 */
export const setupSimpleDashboardSystem = async () => {
  console.log('🎯 Setting up simplified dashboard system...');

  try {
    // Check current setup
    const setupCheck = await checkSimpleDashboardSetup();
    
    if (!setupCheck.hasUserDashboards || !setupCheck.hasUserInitialization) {
      throw new Error('Database tables not found. Please run the SQL migration script first.');
    }

    // Create templates if they don't exist
    if (setupCheck.templateCount === 0) {
      console.log('📋 Creating dashboard templates...');
      await createTemplatesInDatabase();
    } else {
      console.log('ℹ️ Templates already exist, skipping creation');
    }

    console.log('✅ Simplified dashboard system setup completed');
    return {
      success: true,
      message: 'Simplified dashboard system is ready'
    };

  } catch (error) {
    console.error('❌ Error setting up system:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to set up simplified dashboard system'
    };
  }
};

/**
 * Migrate existing users to the simplified system
 */
export const migrateExistingUsers = async () => {
  console.log('🔄 Migrating existing users to simplified dashboard system...');

  try {
    // Get all users who don't have dashboards yet
    const { data: usersWithoutDashboards, error: usersError } = await supabase
      .from('auth.users')
      .select('id')
      .not('id', 'in', 
        supabase
          .from('user_dashboards')
          .select('user_id')
          .eq('is_template', false)
      );

    if (usersError) {
      throw new Error(`Failed to get users: ${usersError.message}`);
    }

    if (!usersWithoutDashboards || usersWithoutDashboards.length === 0) {
      console.log('ℹ️ No users need migration');
      return {
        success: true,
        message: 'No users need migration',
        migrated: 0
      };
    }

    console.log('👥 Found', usersWithoutDashboards.length, 'users to migrate');

    // Bulk initialize users
    const userIds = usersWithoutDashboards.map(u => u.id);
    const results = await bulkInitializeUsers(userIds);

    console.log('✅ Migration completed:', results);
    return {
      success: true,
      message: `Migrated ${results.successful} users successfully`,
      ...results
    };

  } catch (error) {
    console.error('❌ Error migrating users:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to migrate existing users'
    };
  }
};

/**
 * Get migration status and statistics
 */
export const getMigrationStatus = async () => {
  console.log('📊 Getting migration status...');

  try {
    const setupCheck = await checkSimpleDashboardSetup();

    if (!setupCheck.isSetup) {
      return {
        status: 'not_setup',
        message: 'Simplified dashboard system is not set up',
        ...setupCheck
      };
    }

    // Get user statistics
    const { data: userStats, error: statsError } = await supabase
      .from('user_dashboards')
      .select('user_id, is_template')
      .eq('is_template', false);

    if (statsError) {
      throw new Error(`Failed to get user stats: ${statsError.message}`);
    }

    const uniqueUsers = new Set(userStats.map(d => d.user_id)).size;
    const totalDashboards = userStats.length;

    // Get initialization stats
    const { data: initStats, error: initError } = await supabase
      .from('user_initialization')
      .select('user_id, initialized_at');

    const initializedUsers = initError ? 0 : initStats.length;

    const status = {
      status: 'ready',
      message: 'Simplified dashboard system is operational',
      setupCheck,
      stats: {
        uniqueUsers,
        totalDashboards,
        initializedUsers,
        templatesAvailable: setupCheck.templateCount
      }
    };

    console.log('📊 Migration status:', status);
    return status;

  } catch (error) {
    console.error('❌ Error getting migration status:', error);
    return {
      status: 'error',
      error: error.message,
      message: 'Failed to get migration status'
    };
  }
};

/**
 * Clean up old dashboard system (use with caution)
 */
export const cleanupOldDashboardSystem = async () => {
  console.log('🧹 Cleaning up old dashboard system...');
  
  // This is a placeholder for cleanup operations
  // In a real migration, you might want to:
  // 1. Archive old dashboard_configurations table
  // 2. Remove old configuration files
  // 3. Update any references to old system
  
  console.log('⚠️ Cleanup not implemented - manual cleanup recommended');
  return {
    success: false,
    message: 'Cleanup not implemented - please perform manual cleanup'
  };
};

/**
 * Test the simplified dashboard system
 */
export const testSimpleDashboardSystem = async (testUserId) => {
  console.log('🧪 Testing simplified dashboard system...');

  try {
    if (!testUserId) {
      throw new Error('Test user ID is required');
    }

    // Test user initialization
    console.log('🧪 Testing user initialization...');
    const initResult = await initializeNewUser(testUserId);
    
    if (!initResult.success) {
      throw new Error(`Initialization failed: ${initResult.message}`);
    }

    console.log('✅ Test completed successfully');
    return {
      success: true,
      message: 'Simplified dashboard system test passed',
      testResults: {
        initialization: initResult
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Simplified dashboard system test failed'
    };
  }
};
