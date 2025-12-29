import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboardPreferences } from '../../../contexts/DashboardPreferencesContext';
import {
  getUserDashboards,
  getUserDashboard,
  createUserDashboard,
  updateUserDashboard,
  deleteUserDashboard,
  updateDashboardTiles,
  duplicateDashboard,
  initializeUserDashboards,
  setDefaultDashboard,
  getDefaultDashboard
} from '../services/simpleDashboardService';

/**
 * Simplified Dashboard Hook
 * 
 * This hook provides simple state management for user-owned dashboards.
 * No complex merging logic or system/user overrides - just straightforward CRUD operations.
 */
export const useDashboards = () => {
  const { user } = useAuth();
  const { dashboardPreferences, updateDashboardPreferences } = useDashboardPreferences();
  
  // State
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Load all dashboards for the current user
   */
  const loadDashboards = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Loading dashboards for user:', user.id);
      let userDashboards = await getUserDashboards(user.id);

      // If user has no dashboards, initialize with templates
      if (userDashboards.length === 0 && !initialized) {
        console.log('🎯 No dashboards found, initializing with templates');
        userDashboards = await initializeUserDashboards(user.id);
        setInitialized(true);
      }

      setDashboards(userDashboards);
      console.log('✅ Loaded', userDashboards.length, 'dashboards');

      // Set the preferred/default dashboard as active if not already set
      if (userDashboards.length > 0 && !activeDashboard) {
        const preferredName = dashboardPreferences.defaultDashboard;
        const preferredDashboard = preferredName
          ? userDashboards.find(d => d.name === preferredName)
          : null;
        const schemaDefault = userDashboards.find(d => d.is_default);
        const dashboardToActivate = preferredDashboard || schemaDefault || userDashboards[0];

        if (dashboardToActivate) {
          setActiveDashboard(dashboardToActivate);
          console.log('📋 Set dashboard as active:', dashboardToActivate.name);

          if (!preferredName) {
            await updateDashboardPreferences({ defaultDashboard: dashboardToActivate.name });
          }
        }
      }

    } catch (err) {
      console.error('❌ Error loading dashboards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    initialized,
    activeDashboard,
    dashboardPreferences.defaultDashboard,
    updateDashboardPreferences
  ]);

  /**
   * Load a specific dashboard and set it as active
   */
  const loadDashboard = useCallback(async (dashboardId) => {
    if (!user?.id || !dashboardId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Loading dashboard:', dashboardId);
      const dashboard = await getUserDashboard(user.id, dashboardId);
      setActiveDashboard(dashboard);
      console.log('✅ Loaded dashboard:', dashboard.name);
      return dashboard;
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Create a new dashboard
   */
  const createDashboard = useCallback(async (dashboardData) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('➕ Creating dashboard:', dashboardData.name);
      const newDashboard = await createUserDashboard(user.id, dashboardData);
      
      // Add to local state
      setDashboards(prev => [...prev, newDashboard]);
      
      console.log('✅ Created dashboard:', newDashboard.name);
      return newDashboard;
    } catch (err) {
      console.error('❌ Error creating dashboard:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Update the active dashboard
   */
  const updateActiveDashboard = useCallback(async (updates) => {
    if (!user?.id || !activeDashboard) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating dashboard:', activeDashboard.name);
      const updatedDashboard = await updateUserDashboard(user.id, activeDashboard.id, updates);
      
      // Update local state
      setActiveDashboard(updatedDashboard);
      setDashboards(prev => 
        prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d)
      );
      
      console.log('✅ Updated dashboard:', updatedDashboard.name);
      return updatedDashboard;
    } catch (err) {
      console.error('❌ Error updating dashboard:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeDashboard]);

  /**
   * Update dashboard tiles (most common operation)
   */
  const updateTiles = useCallback(async (tiles) => {
    if (!user?.id || !activeDashboard) return;

    try {
      console.log('🔄 Updating tiles for dashboard:', activeDashboard.name);
      const updatedDashboard = await updateDashboardTiles(user.id, activeDashboard.id, tiles);
      
      // Update local state
      setActiveDashboard(updatedDashboard);
      setDashboards(prev => 
        prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d)
      );
      
      console.log('✅ Updated tiles for dashboard:', updatedDashboard.name);
      return updatedDashboard;
    } catch (err) {
      console.error('❌ Error updating tiles:', err);
      setError(err.message);
      throw err;
    }
  }, [user?.id, activeDashboard]);

  /**
   * Delete a dashboard
   */
  const deleteDashboard = useCallback(async (dashboardId) => {
    if (!user?.id || !dashboardId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Deleting dashboard:', dashboardId);
      await deleteUserDashboard(user.id, dashboardId);
      
      // Remove from local state
      setDashboards(prev => prev.filter(d => d.id !== dashboardId));
      
      // If deleted dashboard was active, set first remaining as active
      if (activeDashboard?.id === dashboardId) {
        const remaining = dashboards.filter(d => d.id !== dashboardId);
        setActiveDashboard(remaining.length > 0 ? remaining[0] : null);
      }
      
      console.log('✅ Deleted dashboard:', dashboardId);
      return true;
    } catch (err) {
      console.error('❌ Error deleting dashboard:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeDashboard, dashboards]);

  /**
   * Duplicate a dashboard
   */
  const duplicateDashboardById = useCallback(async (dashboardId, newName) => {
    if (!user?.id || !dashboardId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Duplicating dashboard:', dashboardId);
      const duplicated = await duplicateDashboard(user.id, dashboardId, newName);
      
      // Add to local state
      setDashboards(prev => [...prev, duplicated]);
      
      console.log('✅ Duplicated dashboard:', duplicated.name);
      return duplicated;
    } catch (err) {
      console.error('❌ Error duplicating dashboard:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Switch to a different dashboard
   */
  const switchToDashboard = useCallback(async (dashboardId) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      setActiveDashboard(dashboard);
      console.log('🔄 Switched to dashboard:', dashboard.name);
      return dashboard;
    } else {
      // Dashboard not in local state, load it
      return await loadDashboard(dashboardId);
    }
  }, [dashboards, loadDashboard]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get current tile configurations
   */
  const getCurrentTiles = useCallback(() => {
    return activeDashboard?.tiles || [];
  }, [activeDashboard]);

  /**
   * Set a dashboard as default (or unset if dashboardId is null)
   */
  const setAsDefaultDashboard = useCallback(async (dashboardId) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if (dashboardId === null) {
        // Unset all defaults
        console.log('⭐ Unsetting default dashboard');
        await setDefaultDashboard(user.id, null);
        
        // Update the dashboards list to reflect no default
        setDashboards(prevDashboards =>
          prevDashboards.map(dashboard => ({
            ...dashboard,
            is_default: false
          }))
        );

        // Update active dashboard if it was the default
        if (activeDashboard?.is_default) {
          setActiveDashboard(prev => ({ ...prev, is_default: false }));
        }
        await updateDashboardPreferences({ defaultDashboard: '' });
        console.log('✅ Default dashboard unset');
        return null;
      } else {
        // Set new default
        console.log('⭐ Setting dashboard as default:', dashboardId);
        const updatedDashboard = await setDefaultDashboard(user.id, dashboardId);

        // Update the dashboards list to reflect the new default status
        setDashboards(prevDashboards =>
          prevDashboards.map(dashboard => ({
            ...dashboard,
            is_default: dashboard.id === dashboardId
          }))
        );

        // If this is the active dashboard, update it too
        if (activeDashboard?.id === dashboardId) {
          setActiveDashboard(prev => ({ ...prev, is_default: true }));
        }
        await updateDashboardPreferences({ defaultDashboard: updatedDashboard.name });
        console.log('✅ Dashboard set as default:', updatedDashboard.name);
        return updatedDashboard;
      }
    } catch (err) {
      console.error('❌ Error setting dashboard as default:', err);
      setError('Failed to set dashboard as default: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeDashboard, updateDashboardPreferences]);

  // Load dashboards when user changes
  useEffect(() => {
    if (user?.id) {
      loadDashboards();
    } else {
      // Clear state when user logs out
      setDashboards([]);
      setActiveDashboard(null);
      setInitialized(false);
    }
  }, [user?.id, loadDashboards]);

  // Sync active dashboard when user preference changes
  useEffect(() => {
    if (!dashboards.length) return;

    const preferredName = dashboardPreferences.defaultDashboard;
    if (!preferredName) return;

    const preferredDashboard = dashboards.find(d => d.name === preferredName);

    if (preferredDashboard) {
      if (!activeDashboard || activeDashboard.id !== preferredDashboard.id) {
        setActiveDashboard(preferredDashboard);
      }
    } else if (dashboards.length > 0) {
      const fallbackDashboard = dashboards[0];
      if (!activeDashboard || activeDashboard.id !== fallbackDashboard.id) {
        setActiveDashboard(fallbackDashboard);
      }
      updateDashboardPreferences({ defaultDashboard: fallbackDashboard.name });
    }
  }, [
    dashboards,
    dashboardPreferences.defaultDashboard,
    activeDashboard?.id,
    updateDashboardPreferences
  ]);

  return {
    // State
    dashboards,
    activeDashboard,
    loading,
    error,

    // Actions
    loadDashboards,
    loadDashboard,
    createDashboard,
    updateActiveDashboard,
    updateTiles,
    deleteDashboard,
    duplicateDashboardById,
    switchToDashboard,
    setAsDefaultDashboard,
    clearError,

    // Utilities
    getCurrentTiles
  };
};
