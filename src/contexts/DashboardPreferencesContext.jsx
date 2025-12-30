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
    if (!user) {
      applyPreferences(DEFAULT_DASHBOARD_PREFERENCES);
      resetDashboardPreferenceStore();
      setLoading(false);
      setPreferencesLoaded(false);
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
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
      applyPreferences(DEFAULT_DASHBOARD_PREFERENCES);
    } finally {
      setLoading(false);
      setPreferencesLoaded(true);
    }
  }, [user, applyPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Save preferences to database when they change (debounced)
  useEffect(() => {
    if (!user || !preferencesLoaded) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await updatePreference('dashboard', dashboardPreferences);
      } catch (error) {
        console.error('Error saving dashboard preferences:', error);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(saveTimeout);
  }, [dashboardPreferences, user, preferencesLoaded]);

  const updateDashboardPreferences = useCallback((updates = {}) => {
    if (!user) return preferencesRef.current;

    const nextPreferences = {
      ...preferencesRef.current,
      ...(updates || {})
    };

    preferencesRef.current = nextPreferences;
    setDashboardPreferences(nextPreferences);
    setDashboardPreferenceStore(nextPreferences);

    return nextPreferences;
  }, [user]);

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
