export const DEFAULT_DASHBOARD_PREFERENCES = {
  defaultTimePeriod: 'last-30-days',
  defaultMarkets: [],
  defaultShowNames: false,
  defaultDashboard: '',
  disableHoverDrillDown: false
};

let dashboardPreferenceStore = { ...DEFAULT_DASHBOARD_PREFERENCES };

/**
 * Update the cached dashboard preferences used outside React components.
 * @param {object} preferences
 */
export const setDashboardPreferenceStore = (preferences = DEFAULT_DASHBOARD_PREFERENCES) => {
  dashboardPreferenceStore = {
    ...DEFAULT_DASHBOARD_PREFERENCES,
    ...(preferences || {})
  };
};

/**
 * Get the cached dashboard preferences.
 * @returns {object}
 */
export const getDashboardPreferenceStore = () => dashboardPreferenceStore;

/**
 * Reset the cached dashboard preferences back to defaults.
 */
export const resetDashboardPreferenceStore = () => {
  dashboardPreferenceStore = { ...DEFAULT_DASHBOARD_PREFERENCES };
};
