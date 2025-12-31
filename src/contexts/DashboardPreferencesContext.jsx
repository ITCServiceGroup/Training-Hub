import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updatePreference } from '../services/api/preferences';
import {
  DEFAULT_DASHBOARD_PREFERENCES,
  setDashboardPreferenceStore,
  resetDashboardPreferenceStore
} from '../pages/admin/utils/dashboardPreferenceStore';

const DashboardPreferencesContext = createContext(null);

export const DashboardPreferencesProvider = ({ children }) => {
  const { user } = useAuth();
  const [dashboardPreferences, setDashboardPreferences] = useState(DEFAULT_DASHBOARD_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const preferencesRef = useRef(DEFAULT_DASHBOARD_PREFERENCES);

  // Track last loaded user ID to prevent unnecessary reloads
  const lastLoadedUserIdRef = useRef(null);

  const applyPreferences = useCallback((preferences) => {
    const merged = {
      ...DEFAULT_DASHBOARD_PREFERENCES,
      ...(preferences || {})
    };
    preferencesRef.current = merged;
    setDashboardPreferences(merged);
    setDashboardPreferenceStore(merged);
  }, []);

  const loadPreferences = useCallback(async () => {
    const currentUserId = user?.id || null;

    // Skip if we've already loaded for this user
    if (currentUserId === lastLoadedUserIdRef.current && preferencesLoaded) {
      return;
    }

    if (!currentUserId) {
      applyPreferences(DEFAULT_DASHBOARD_PREFERENCES);
      resetDashboardPreferenceStore();
      setLoading(false);
      setPreferencesLoaded(false);
      lastLoadedUserIdRef.current = null;
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await getUserPreferences();
      if (error) {
        console.error('Error loading dashboard preferences:', error);
        applyPreferences(DEFAULT_DASHBOARD_PREFERENCES);
      } else {
        applyPreferences(data?.dashboard);
      }
      lastLoadedUserIdRef.current = currentUserId;
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
      applyPreferences(DEFAULT_DASHBOARD_PREFERENCES);
    } finally {
      setLoading(false);
      setPreferencesLoaded(true);
    }
  }, [user?.id, applyPreferences, preferencesLoaded]);

  // Load preferences when user ID changes
  useEffect(() => {
    loadPreferences();
  }, [user?.id]); // Only depend on user?.id, not the full loadPreferences callback

  // Save preferences to database when they change (debounced)
  useEffect(() => {
    if (!user?.id || !preferencesLoaded) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await updatePreference('dashboard', dashboardPreferences);
      } catch (error) {
        console.error('Error saving dashboard preferences:', error);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(saveTimeout);
  }, [dashboardPreferences, user?.id, preferencesLoaded]);

  const updateDashboardPreferences = useCallback((updates = {}) => {
    if (!user?.id) return preferencesRef.current;

    const nextPreferences = {
      ...preferencesRef.current,
      ...(updates || {})
    };

    preferencesRef.current = nextPreferences;
    setDashboardPreferences(nextPreferences);
    setDashboardPreferenceStore(nextPreferences);

    return nextPreferences;
  }, [user?.id]);

  const value = {
    dashboardPreferences,
    loading,
    refreshDashboardPreferences: loadPreferences,
    updateDashboardPreferences
  };

  return (
    <DashboardPreferencesContext.Provider value={value}>
      {children}
    </DashboardPreferencesContext.Provider>
  );
};

export const useDashboardPreferences = () => {
  const context = useContext(DashboardPreferencesContext);
  if (!context) {
    throw new Error('useDashboardPreferences must be used within a DashboardPreferencesProvider');
  }
  return context;
};
