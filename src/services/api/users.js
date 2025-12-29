import { supabase } from '../../config/supabase';

/**
 * User Management API Service
 * Handles CRUD operations for user profiles
 */

/**
 * Get all user profiles with market information
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        markets:market_id (
          id,
          name
        ),
        reports_to:reports_to_user_id (
          user_id,
          display_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error };
  }
};

/**
 * Get a single user profile by user_id
 * @param {string} userId - User ID
 * @returns {Promise<{data: object, error: object}>}
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        markets:market_id (
          id,
          name
        ),
        reports_to:reports_to_user_id (
          user_id,
          display_name,
          role
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { data: null, error };
  }
};

/**
 * Get users by role
 * @param {string|string[]} roles - Role or array of roles
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getUsersByRole = async (roles) => {
  try {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        markets:market_id (
          id,
          name
        )
      `)
      .in('role', roleArray)
      .order('display_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return { data: null, error };
  }
};

/**
 * Get users in a specific market
 * @param {number} marketId - Market ID
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getUsersByMarket = async (marketId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        markets:market_id (
          id,
          name
        )
      `)
      .eq('market_id', marketId)
      .order('display_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching users by market:', error);
    return { data: null, error };
  }
};

/**
 * Create a new user profile
 * Note: User must already exist in auth.users (created via Supabase Auth)
 * @param {object} profileData - User profile data
 * @returns {Promise<{data: object, error: object}>}
 */
export const createUserProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: profileData.user_id,
        role: profileData.role,
        market_id: profileData.market_id || null,
        reports_to_user_id: profileData.reports_to_user_id || null,
        display_name: profileData.display_name,
        email: profileData.email,
        is_active: profileData.is_active ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object, error: object}>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    // Don't allow updating user_id
    const { user_id, created_at, updated_at, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(safeUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
};

/**
 * Activate or deactivate a user account
 * @param {string} userId - User ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<{data: object, error: object}>}
 */
export const setUserActiveStatus = async (userId, isActive) => {
  return updateUserProfile(userId, { is_active: isActive });
};

/**
 * Delete a user profile
 * Note: This does not delete the auth.users record
 * @param {string} userId - User ID
 * @returns {Promise<{error: object}>}
 */
export const deleteUserProfile = async (userId) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return { error };
  }
};

/**
 * Get potential supervisors for a user (for reports_to field)
 * Based on role hierarchy and market
 * @param {string} role - The role of the user
 * @param {number} marketId - The market ID (null for admin roles)
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getPotentialSupervisors = async (role, marketId) => {
  try {
    // If no market is selected, return empty list
    if (!marketId) {
      return { data: [], error: null };
    }

    let query = supabase
      .from('user_profiles')
      .select('user_id, display_name, role, market_id')
      .eq('is_active', true);

    // Determine which roles can be supervisors based on user role
    switch (role) {
      case 'supervisor':
        // Supervisors report to AOMs in their market
        query = query.eq('role', 'aom').eq('market_id', marketId);
        break;
      case 'lead_tech':
      case 'technician':
        // Lead Techs and Technicians report to Supervisors in their market
        query = query.eq('role', 'supervisor').eq('market_id', marketId);
        break;
      default:
        // Super Admin, Admin, AOM don't report to anyone
        return { data: [], error: null };
    }

    const { data, error } = await query.order('display_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching potential supervisors:', error);
    return { data: null, error };
  }
};

/**
 * Create a new user in Supabase Auth and create their profile
 * @param {object} userData - User data including email, password, and profile info
 * @returns {Promise<{data: object, error: object}>}
 */
export const createUser = async (userData) => {
  try {
    // Call the database function to create the user
    const { data, error } = await supabase.rpc('admin_create_user', {
      p_email: userData.email,
      p_password: userData.password,
      p_display_name: userData.display_name,
      p_role: userData.role,
      p_market_id: userData.market_id,
      p_reports_to_user_id: userData.reports_to_user_id
    });

    if (error) throw error;

    // Check if the function returned an error
    if (data && !data.success) {
      throw new Error(data.error || 'Failed to create user');
    }

    return { data: data, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
};

/**
 * Get user statistics
 * @returns {Promise<{data: object, error: object}>}
 */
export const getUserStats = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, is_active, market_id');

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total: data.length,
      active: data.filter(u => u.is_active).length,
      inactive: data.filter(u => !u.is_active).length,
      byRole: {},
      byMarket: {}
    };

    // Count by role
    data.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      if (user.market_id) {
        stats.byMarket[user.market_id] = (stats.byMarket[user.market_id] || 0) + 1;
      }
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { data: null, error };
  }
};

export default {
  getAllUsers,
  getUserById,
  getUsersByRole,
  getUsersByMarket,
  createUserProfile,
  updateUserProfile,
  setUserActiveStatus,
  deleteUserProfile,
  getPotentialSupervisors,
  createUser,
  getUserStats
};
