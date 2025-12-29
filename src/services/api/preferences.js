import { supabase } from '../../config/supabase';

/**
 * User Preferences API Service
 * Handles loading and saving user-specific preferences
 */

/**
 * Get user preferences
 * @returns {Promise<{data: object, error: object}>}
 */
export const getUserPreferences = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data: data?.preferences || {}, error: null };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { data: null, error };
  }
};

/**
 * Update user preferences
 * @param {object} preferences - The preferences object to save
 * @returns {Promise<{data: object, error: object}>}
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ preferences })
      .eq('user_id', user.id)
      .select('preferences')
      .single();

    if (error) throw error;
    return { data: data?.preferences, error: null };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { data: null, error };
  }
};

/**
 * Update a specific preference key
 * @param {string} key - The preference key to update
 * @param {any} value - The value to set
 * @returns {Promise<{data: object, error: object}>}
 */
export const updatePreference = async (key, value) => {
  try {
    const { data: currentPrefs } = await getUserPreferences();
    const updatedPrefs = {
      ...(currentPrefs || {}),
      [key]: value
    };
    return await updateUserPreferences(updatedPrefs);
  } catch (error) {
    console.error(`Error updating preference ${key}:`, error);
    return { data: null, error };
  }
};

export const preferencesService = {
  getUserPreferences,
  updateUserPreferences,
  updatePreference
};

export default preferencesService;
