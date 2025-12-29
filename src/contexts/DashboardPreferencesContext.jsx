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
    }
  }, [user, applyPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updateDashboardPreferences = useCallback(async (updates = {}) => {
    if (!user) return preferencesRef.current;

    const nextPreferences = {
      ...preferencesRef.current,
      ...(updates || {})
    };

    preferencesRef.current = nextPreferences;
    setDashboardPreferences(nextPreferences);
    setDashboardPreferenceStore(nextPreferences);

    try {
      await updatePreference('dashboard', nextPreferences);
    } catch (error) {
      console.error('Error updating dashboard preferences:', error);
    }

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
