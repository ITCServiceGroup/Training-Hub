import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  hexToRgb,
  rgbToHex,
  hexToRgbObject,
  rgbObjectToHex,
  generateColorVariations,
  updateCSSVariables
} from '../utils/colorHelpers';
import { PRESET_THEMES, DEFAULT_COLORS, DEFAULT_COLOR_MODES } from '../constants/themes';
import { getUserPreferences, updatePreference } from '../services/api/preferences';
import { useAuth } from './AuthContext';

// Create the theme context
const ThemeContext = createContext(null);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Helper to get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize theme mode from defaults
  const [themeMode, setThemeModeState] = useState('system');

  // Initialize actual theme based on mode
  const [theme, setTheme] = useState(getSystemTheme());

  // Initialize theme colors from defaults
  const [themeColors, setThemeColors] = useState(DEFAULT_COLORS);

  // Initialize color modes from defaults
  const [colorModes, setColorModes] = useState(DEFAULT_COLOR_MODES);

  // Load preferences from database when user logs in
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const { data } = await getUserPreferences();

        if (data && data.theme) {
          const { themeMode: savedMode, themeColors: savedColors, colorModes: savedModes } = data.theme;

          if (savedMode) {
            setThemeModeState(savedMode);
            if (savedMode === 'system') {
              setTheme(getSystemTheme());
            } else {
              setTheme(savedMode);
            }
          }

          if (savedColors) {
            setThemeColors(savedColors);
          }

          if (savedModes) {
            setColorModes(savedModes);
          }
        }
        setPreferencesLoaded(true);
      } else {
        // User logged out, reset to defaults
        setThemeModeState('system');
        setTheme(getSystemTheme());
        setThemeColors(DEFAULT_COLORS);
        setColorModes(DEFAULT_COLOR_MODES);
        setPreferencesLoaded(false);
      }
    };

    loadPreferences();
  }, [user]);


  // Listen for system theme changes
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        setTheme(e.matches ? 'dark' : 'light');
      };

      // Set initial theme based on system preference
      setTheme(mediaQuery.matches ? 'dark' : 'light');

      // Add listener for system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Cleanup listener on unmount or when themeMode changes
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [themeMode]);

  // Apply theme CSS classes when it changes
  useEffect(() => {
    // Apply theme class to document element for global CSS variables
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update CSS variables with current colors
    updateCSSVariables(themeColors, theme);
  }, [theme, themeColors]);

  // Save preferences to database when they change (debounced)
  useEffect(() => {
    if (!user || !preferencesLoaded) return;

    const saveTimeout = setTimeout(async () => {
      await updatePreference('theme', {
        themeMode,
        themeColors,
        colorModes
      });
    }, 500); // Debounce for 500ms

    return () => clearTimeout(saveTimeout);
  }, [themeMode, themeColors, colorModes, user, preferencesLoaded]);

  // Toggle theme function
  const toggleTheme = () => {
    const nextMode = theme === 'light' ? 'dark' : 'light';
    setThemeModeState(nextMode);
    setTheme(nextMode);
  };

  // Set specific theme mode
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      setThemeModeState(mode);
      if (mode === 'system') {
        setTheme(getSystemTheme());
      } else {
        setTheme(mode);
      }
    }
  };

  // Set theme colors
  const updateThemeColors = (colors) => {
    setThemeColors(colors);
  };

  // Set primary color (auto-generates light/dark variations if auto-calculate is enabled)
  const setPrimaryColor = (color, mode = 'light') => {
    if (colorModes.primary.autoCalculate) {
      // Auto-generate both light and dark variations
      const variations = generateColorVariations(color);
      setThemeColors(prev => ({
        ...prev,
        primary: variations
      }));
    } else {
      // Manual mode: only update the specified mode
      setThemeColors(prev => ({
        ...prev,
        primary: {
          ...prev.primary,
          [mode]: color
        }
      }));
    }
  };

  // Set secondary color (auto-generates light/dark variations if auto-calculate is enabled)
  const setSecondaryColor = (color, mode = 'light') => {
    if (colorModes.secondary.autoCalculate) {
      // Auto-generate both light and dark variations
      const variations = generateColorVariations(color);
      setThemeColors(prev => ({
        ...prev,
        secondary: variations
      }));
    } else {
      // Manual mode: only update the specified mode
      setThemeColors(prev => ({
        ...prev,
        secondary: {
          ...prev.secondary,
          [mode]: color
        }
      }));
    }
  };

  // Toggle auto-calculation for a color type
  const toggleAutoCalculate = (colorType) => {
    const newAutoCalculate = !colorModes[colorType].autoCalculate;

    // Update the auto-calculate mode
    setColorModes(prev => ({
      ...prev,
      [colorType]: {
        ...prev[colorType],
        autoCalculate: newAutoCalculate
      }
    }));

    // If enabling auto-calculate, recalculate colors based on current light mode color
    if (newAutoCalculate) {
      const currentLightColor = themeColors[colorType].light;
      const variations = generateColorVariations(currentLightColor);

      setThemeColors(prev => ({
        ...prev,
        [colorType]: variations
      }));
    }
  };

  // Set auto-calculation mode for a color type
  const setAutoCalculate = (colorType, autoCalculate) => {
    // Update the auto-calculate mode
    setColorModes(prev => ({
      ...prev,
      [colorType]: {
        ...prev[colorType],
        autoCalculate
      }
    }));

    // If enabling auto-calculate, recalculate colors based on current light mode color
    if (autoCalculate) {
      const currentLightColor = themeColors[colorType].light;
      const variations = generateColorVariations(currentLightColor);

      setThemeColors(prev => ({
        ...prev,
        [colorType]: variations
      }));
    }
  };

  // Apply a preset theme
  const applyPresetTheme = (presetIndex) => {
    if (presetIndex >= 0 && presetIndex < PRESET_THEMES.length) {
      const preset = PRESET_THEMES[presetIndex];
      setThemeColors({
        primary: preset.primary,
        secondary: preset.secondary
      });
      // Reset to auto-calculate mode when applying presets
      setColorModes(DEFAULT_COLOR_MODES);
    }
  };

  // Reset to default colors and modes
  const resetColors = () => {
    setThemeColors(DEFAULT_COLORS);
    setColorModes(DEFAULT_COLOR_MODES);
  };

  // Context value
  const value = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    isDarkMode: theme === 'dark',
    themeColors,
    colorModes,
    updateThemeColors,
    setPrimaryColor,
    setSecondaryColor,
    toggleAutoCalculate,
    setAutoCalculate,
    resetColors,
    generateColorVariations,
    applyPresetTheme,
    presetThemes: PRESET_THEMES,
    hexToRgbObject,
    rgbObjectToHex
  };

  // Provide Theme context value to children
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use Theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
