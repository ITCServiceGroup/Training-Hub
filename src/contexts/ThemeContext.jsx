import React, { createContext, useState, useEffect, useContext } from 'react';

// Preset color themes based on color theory
const PRESET_THEMES = [
  {
    name: 'Ocean Breeze',
    description: 'Calming teal and coral combination',
    primary: { light: '#0f766e', dark: '#14b8a6' },   // Teal
    secondary: { light: '#dc2626', dark: '#ef4444' }  // Red-coral
  },
  {
    name: 'Royal Purple',
    description: 'Elegant purple and gold pairing',
    primary: { light: '#7c3aed', dark: '#8b5cf6' },   // Violet
    secondary: { light: '#d97706', dark: '#f59e0b' }  // Amber-gold
  },
  {
    name: 'Forest Green',
    description: 'Natural green with warm orange',
    primary: { light: '#059669', dark: '#10b981' },   // Emerald
    secondary: { light: '#ea580c', dark: '#fb923c' }  // Orange
  },
  {
    name: 'Midnight Blue',
    description: 'Professional blue with silver accents',
    primary: { light: '#1d4ed8', dark: '#3b82f6' },   // Blue
    secondary: { light: '#6b7280', dark: '#9ca3af' }  // Gray-silver
  },
  {
    name: 'Sunset Glow',
    description: 'Warm orange and deep pink',
    primary: { light: '#ea580c', dark: '#fb923c' },   // Orange
    secondary: { light: '#be185d', dark: '#ec4899' }  // Pink
  },
  {
    name: 'Arctic Frost',
    description: 'Cool cyan and ice blue',
    primary: { light: '#0891b2', dark: '#06b6d4' },   // Cyan
    secondary: { light: '#0284c7', dark: '#0ea5e9' }  // Sky blue
  },
  {
    name: 'Cherry Blossom',
    description: 'Soft pink with sage green',
    primary: { light: '#be185d', dark: '#ec4899' },   // Pink
    secondary: { light: '#059669', dark: '#10b981' }  // Emerald
  },
  {
    name: 'Golden Hour',
    description: 'Warm amber and deep brown',
    primary: { light: '#d97706', dark: '#f59e0b' },   // Amber
    secondary: { light: '#92400e', dark: '#b45309' }  // Brown
  },
  {
    name: 'Electric Storm',
    description: 'Vibrant purple and electric blue',
    primary: { light: '#7c3aed', dark: '#8b5cf6' },   // Violet
    secondary: { light: '#1d4ed8', dark: '#3b82f6' }  // Blue
  },
  {
    name: 'Autumn Leaves',
    description: 'Rich burgundy and golden yellow',
    primary: { light: '#991b1b', dark: '#dc2626' },   // Red
    secondary: { light: '#ca8a04', dark: '#eab308' }  // Yellow
  }
];

// Default theme colors (Ocean Breeze as default)
const DEFAULT_COLORS = PRESET_THEMES[0];

// Default color mode settings
const DEFAULT_COLOR_MODES = {
  primary: {
    autoCalculate: true
  },
  secondary: {
    autoCalculate: true
  }
};

// Create the theme context
const ThemeContext = createContext(null);

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper function to convert RGB to hex
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper function to convert hex to RGB object for color picker
const hexToRgbObject = (hex) => {
  const result = hexToRgb(hex);
  return result ? { r: result.r, g: result.g, b: result.b, a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
};

// Helper function to convert RGB object to hex for color picker
const rgbObjectToHex = (rgbObj) => {
  return rgbToHex(Math.round(rgbObj.r), Math.round(rgbObj.g), Math.round(rgbObj.b));
};

// Helper function to generate color variations
const generateColorVariations = (baseColor) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return { light: baseColor, dark: baseColor };

  // Generate lighter version for dark mode (increase brightness)
  const lightR = Math.min(255, Math.round(rgb.r * 1.3));
  const lightG = Math.min(255, Math.round(rgb.g * 1.3));
  const lightB = Math.min(255, Math.round(rgb.b * 1.3));

  // Generate darker version for light mode (decrease brightness)
  const darkR = Math.round(rgb.r * 0.8);
  const darkG = Math.round(rgb.g * 0.8);
  const darkB = Math.round(rgb.b * 0.8);

  return {
    light: baseColor, // Use the base color for light mode
    dark: rgbToHex(lightR, lightG, lightB) // Use lighter version for dark mode
  };
};

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

  // Update CSS variables when colors change
  const updateCSSVariables = (colors) => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    // Set primary color variables
    const currentPrimary = colors.primary[isDark ? 'dark' : 'light'];
    const currentSecondary = colors.secondary[isDark ? 'dark' : 'light'];

    // Set CSS variables on root element with !important to override any CSS class rules
    const setVariable = (property, value) => {
      root.style.setProperty(property, value, 'important');
    };

    setVariable('--primary-color', currentPrimary);
    setVariable('--color-primary', currentPrimary);

    // Generate lighter and darker versions of the current primary color
    const rgb = hexToRgb(currentPrimary);
    if (rgb) {
      // Create darker version (for hover states)
      const darkerR = Math.round(rgb.r * 0.8);
      const darkerG = Math.round(rgb.g * 0.8);
      const darkerB = Math.round(rgb.b * 0.8);
      const darkerColor = rgbToHex(darkerR, darkerG, darkerB);
      setVariable('--primary-dark', darkerColor);

      // Create lighter version (for hover states and accents)
      const lighterR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.3));
      const lighterG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.3));
      const lighterB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.3));
      const lighterColor = rgbToHex(lighterR, lighterG, lighterB);
      setVariable('--primary-light', lighterColor);
    }

    // Set secondary color variables
    setVariable('--secondary-color', currentSecondary);
    setVariable('--color-secondary', currentSecondary);
  };

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
    updateCSSVariables(themeColors);
  }, [theme, themeColors, themeMode]);

  // Update colors in localStorage when they change
  useEffect(() => {
    localStorage.setItem('themeColors', JSON.stringify(themeColors));
    updateCSSVariables(themeColors);
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
