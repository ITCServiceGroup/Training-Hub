import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const RBACContext = createContext(null);

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AOM: 'aom',
  SUPERVISOR: 'supervisor',
  LEAD_TECH: 'lead_tech',
  TECHNICIAN: 'technician'
};

export const RBACProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before doing anything
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*, markets(id, name)')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        setError(fetchError.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has one of the specified roles
   * @param {string|string[]} roles - Single role or array of roles
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!profile) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(profile.role);
  };

  /**
   * Check if user is an admin (Super Admin or Admin)
   * @returns {boolean}
   */
  const isAdmin = () => hasRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  /**
   * Check if user is a Super Admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => hasRole([ROLES.SUPER_ADMIN]);

  /**
   * Check if user can create content
   * @returns {boolean}
   */
  const canCreateContent = () => hasRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR,
    ROLES.LEAD_TECH
  ]);

  /**
   * Check if user can manage other users
   * @returns {boolean}
   */
  const canManageUsers = () => hasRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.AOM,
    ROLES.SUPERVISOR
  ]);

  /**
   * Check if user can approve content for nationwide visibility
   * @returns {boolean}
   */
  const canApproveContent = () => hasRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  /**
   * Get role display name
   * @param {string} role - Role enum value
   * @returns {string}
   */
  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: 'Super Admin',
      [ROLES.ADMIN]: 'Admin',
      [ROLES.AOM]: 'Area Operations Manager',
      [ROLES.SUPERVISOR]: 'Supervisor',
      [ROLES.LEAD_TECH]: 'Lead Tech',
      [ROLES.TECHNICIAN]: 'Technician'
    };
    return roleNames[role] || role;
  };

  /**
   * Check if user can manage a specific target user
   * @param {object} targetProfile - Target user's profile
   * @returns {boolean}
   */
  const canManageSpecificUser = (targetProfile) => {
    if (!profile || !targetProfile) return false;

    // Super Admin can manage everyone except themselves
    if (profile.role === ROLES.SUPER_ADMIN && targetProfile.user_id !== profile.user_id) {
      return true;
    }

    // Admin can manage non-super users
    if (profile.role === ROLES.ADMIN &&
        targetProfile.role !== ROLES.SUPER_ADMIN &&
        targetProfile.role !== ROLES.ADMIN) {
      return true;
    }

    // AOM can manage Supervisors, Lead Techs, and Technicians in their market
    if (profile.role === ROLES.AOM &&
        [ROLES.SUPERVISOR, ROLES.LEAD_TECH, ROLES.TECHNICIAN].includes(targetProfile.role) &&
        targetProfile.market_id === profile.market_id) {
      return true;
    }

    // Supervisor can manage Lead Techs and Technicians in their market
    if (profile.role === ROLES.SUPERVISOR &&
        [ROLES.LEAD_TECH, ROLES.TECHNICIAN].includes(targetProfile.role) &&
        targetProfile.market_id === profile.market_id) {
      return true;
    }

    return false;
  };

  const value = {
    profile,
    loading,
    error,
    hasRole,
    isAdmin,
    isSuperAdmin,
    canCreateContent,
    canManageUsers,
    canApproveContent,
    canManageSpecificUser,
    getRoleDisplayName,
    marketId: profile?.market_id,
    marketName: profile?.markets?.name,
    role: profile?.role,
    displayName: profile?.display_name,
    isActive: profile?.is_active,
    // Reload profile (useful after updates)
    reloadProfile: fetchProfile
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === null) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};
