import React, { createContext, useState, useEffect, useContext } from 'react';

// Default theme colors
const DEFAULT_COLORS = {
  primary: {
    light: '#0f766e', // teal-700
    dark: '#14b8a6'   // teal-500
  },
  secondary: {
    light: '#7e22ce', // purple-700
    dark: '#a855f7'   // purple-500
  }
};

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
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
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

  // Update theme in localStorage and apply CSS classes when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);

    // Apply theme class to document element for global CSS variables
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update CSS variables with current colors
    updateCSSVariables(themeColors);
  }, [theme, themeColors]);

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
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set specific theme
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
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
    setColorModes(prev => ({
      ...prev,
      [colorType]: {
        ...prev[colorType],
        autoCalculate: !prev[colorType].autoCalculate
      }
    }));
  };

  // Set auto-calculation mode for a color type
  const setAutoCalculate = (colorType, autoCalculate) => {
    setColorModes(prev => ({
      ...prev,
      [colorType]: {
        ...prev[colorType],
        autoCalculate
      }
    }));
  };

  // Reset to default colors and modes
  const resetColors = () => {
    setThemeColors(DEFAULT_COLORS);
    setColorModes(DEFAULT_COLOR_MODES);
  };

  // Context value
  const value = {
    theme,
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
    generateColorVariations
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
