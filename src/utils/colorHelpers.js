/**
 * Color utility functions for theme management
 */

/**
 * Helper function to convert hex to RGB
 * @param {string} hex - Hex color string
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Helper function to convert RGB to hex
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Helper function to convert hex to RGB object for color picker
 * @param {string} hex - Hex color string
 * @returns {Object} RGB object with r, g, b, a properties
 */
export const hexToRgbObject = (hex) => {
  const result = hexToRgb(hex);
  return result ? { r: result.r, g: result.g, b: result.b, a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
};

/**
 * Helper function to convert RGB object to hex for color picker
 * @param {Object} rgbObj - RGB object with r, g, b properties
 * @returns {string} Hex color string
 */
export const rgbObjectToHex = (rgbObj) => {
  return rgbToHex(Math.round(rgbObj.r), Math.round(rgbObj.g), Math.round(rgbObj.b));
};

/**
 * Helper function to generate color variations (light and dark modes)
 * @param {string} baseColor - Base hex color
 * @returns {Object} Object with light and dark color variations
 */
export const generateColorVariations = (baseColor) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return { light: baseColor, dark: baseColor };

  // Generate lighter version for dark mode (increase brightness)
  const lightR = Math.min(255, Math.round(rgb.r * 1.3));
  const lightG = Math.min(255, Math.round(rgb.g * 1.3));
  const lightB = Math.min(255, Math.round(rgb.b * 1.3));

  // Note: We use the base color for light mode, so no darker version needed here

  return {
    light: baseColor, // Use the base color for light mode
    dark: rgbToHex(lightR, lightG, lightB) // Use lighter version for dark mode
  };
};

/**
 * Update CSS variables for theme colors
 * @param {Object} colors - Theme colors object
 * @param {string} theme - Current theme ('light' or 'dark')
 */
export const updateCSSVariables = (colors, theme) => {
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