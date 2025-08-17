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

// Create the theme context
const ThemeContext = createContext(null);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Helper to get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize theme mode from localStorage or default to 'system'
  const [themeMode, setThemeModeState] = useState(() => {
    const savedThemeMode = localStorage.getItem('themeMode');
    return savedThemeMode || 'system';
  });

  // Initialize actual theme based on mode
  const [theme, setTheme] = useState(() => {
    const savedThemeMode = localStorage.getItem('themeMode') || 'system';
    if (savedThemeMode === 'system') {
      return getSystemTheme();
    }
    return savedThemeMode;
  });

  // Initialize theme colors from localStorage or defaults
  const [themeColors, setThemeColors] = useState(() => {
    const savedColors = localStorage.getItem('themeColors');
    return savedColors ? JSON.parse(savedColors) : DEFAULT_COLORS;
  });

  // Initialize color modes from localStorage or defaults
  const [colorModes, setColorModes] = useState(() => {
    const savedModes = localStorage.getItem('colorModes');
    return savedModes ? JSON.parse(savedModes) : DEFAULT_COLOR_MODES;
  });


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

  // Update theme in localStorage and apply CSS classes when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    // Apply theme class to document element for global CSS variables
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update CSS variables with current colors
    updateCSSVariables(themeColors, theme);
  }, [theme, themeColors, themeMode]);

  // Update colors in localStorage when they change
  useEffect(() => {
    localStorage.setItem('themeColors', JSON.stringify(themeColors));
    updateCSSVariables(themeColors, theme);
  }, [themeColors, theme]);

  // Update color modes in localStorage when they change
  useEffect(() => {
    localStorage.setItem('colorModes', JSON.stringify(colorModes));
  }, [colorModes]);

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
