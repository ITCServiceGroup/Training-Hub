// Light mode defaults (using existing values from components)
export const lightDefaults = {
  container: { r: 255, g: 255, b: 255, a: 1 },
  text: { r: 92, g: 90, b: 90, a: 1 },
  button: { r: 15, g: 118, b: 110, a: 1 }, // Primary color (teal)
  card: { r: 255, g: 255, b: 255, a: 1 },
  table: { r: 255, g: 255, b: 255, a: 1 },
  icon: { r: 92, g: 90, b: 90, a: 1 },
  shadow: { r: 0, g: 0, b: 0, a: 0.15 } // Black with 15% opacity
};

// Dark mode defaults using Tailwind's dark palette
export const darkDefaults = {
  container: { r: 31, g: 41, b: 55, a: 1 }, // slate-800
  text: { r: 229, g: 231, b: 235, a: 1 }, // gray-200
  button: { r: 20, g: 184, b: 166, a: 1 }, // Primary color dark (teal)
  card: { r: 51, g: 65, b: 85, a: 1 }, // slate-700
  table: { r: 51, g: 65, b: 85, a: 1 }, // slate-700
  icon: { r: 229, g: 231, b: 235, a: 1 }, // gray-200
  shadow: { r: 255, g: 255, b: 255, a: 0.15 } // White with 15% opacity
};

// Helper function to calculate relative luminance
const getLuminance = (color) => {
  const rs = color.r / 255;
  const gs = color.g / 255;
  const bs = color.b / 255;

  const r = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const g = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const b = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Convert RGB to HSL
const rgbToHsl = (color) => {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l, a: color.a !== undefined ? color.a : 1 };
};

// Convert HSL to RGB
const hslToRgb = (color) => {
  let r, g, b;
  const h = color.h;
  const s = color.s;
  const l = color.l;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: color.a !== undefined ? color.a : 1
  };
};

// Convert color between light and dark modes
export const convertToThemeColor = (color, isDark, componentType = 'container') => {
  // Keep alpha the same
  const alpha = color.a !== undefined ? color.a : 1;

  // Special case for shadow colors
  if (componentType === 'shadow') {
    // For shadow colors, we want to invert black to white and vice versa
    // Check if the color is black or near-black
    const isNearBlack = color.r < 30 && color.g < 30 && color.b < 30;
    if (isDark && isNearBlack) {
      // In dark mode, convert black shadows to white shadows
      return { r: 255, g: 255, b: 255, a: alpha };
    }

    // Check if the color is white or near-white
    const isNearWhite = color.r > 240 && color.g > 240 && color.b > 240;
    if (!isDark && isNearWhite) {
      // In light mode, convert white shadows to black shadows
      return { r: 0, g: 0, b: 0, a: alpha };
    }

    // For other shadow colors, invert the color
    if (isDark) {
      return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b,
        a: alpha
      };
    } else {
      return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b,
        a: alpha
      };
    }
  }
  // For text and icon colors, use specific conversion logic
  else if (componentType === 'text' || componentType === 'icon') {
    // For dark text/icon in light mode, convert to light text/icon in dark mode
    const isDarkColor = color.r < 100 && color.g < 100 && color.b < 100;
    if (isDark && isDarkColor) {
      return { r: 229, g: 231, b: 235, a: alpha }; // Light gray for dark mode
    }

    // For light text/icon in dark mode, convert to dark text/icon in light mode
    const isLightColor = color.r > 200 && color.g > 200 && color.b > 200;
    if (!isDark && isLightColor) {
      return { r: 92, g: 90, b: 90, a: alpha }; // Dark gray for light mode
    }
  } else {
    // For container and other components
    // Skip the early returns for background colors to allow our improved algorithm
    if (componentType !== 'background') {
      // For white or near-white colors in light mode
      const isNearWhite = color.r > 240 && color.g > 240 && color.b > 240;
      if (isDark && isNearWhite) {
        return darkDefaults.container;
      }

      // For black or near-black colors in dark mode
      const isNearBlack = color.r < 30 && color.g < 30 && color.b < 30;
      if (!isDark && isNearBlack) {
        return lightDefaults.container;
      }
    }
  }

  // Convert to HSL to maintain the hue while adjusting lightness
  const hsl = rgbToHsl(color);

  // Adjust lightness and saturation based on theme mode
  if (isDark) {
    // For dark mode:
    // If it's a light color (high lightness), make it darker while preserving hue
    if (hsl.l > 0.5) {
      // Calculate normalized lightness (0 to 1 scale)
      const normalizedLightness = (hsl.l - 0.5) / 0.5;

      // For white or near-white colors, use a more aggressive darkening while preserving relative differences
      if (hsl.l > 0.9 && hsl.s < 0.3) {
        // Create much more separation for very similar light colors
        // Use the original RGB values for more precise differentiation
        const originalLuminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

        // Map based on actual RGB luminance for better distinction
        // Pure white (255,255,255) luminance ≈ 255
        // Light gray (248,249,250) luminance ≈ 248.7
        const luminanceNormalized = originalLuminance / 255;

        // Create a more aggressive mapping with exponential scaling
        // This ensures even tiny differences in light colors become significant in dark mode
        const exponentialFactor = Math.pow(luminanceNormalized, 3); // Cubic for maximum separation

        // Map from very light to a wider dark range (0.45-0.12)
        hsl.l = 0.45 - (exponentialFactor * 0.33);

        // Also adjust saturation based on original color characteristics
        if (hsl.s < 0.05) {
          // For nearly achromatic colors, add slight saturation for better distinction
          hsl.s = Math.min(0.15, 0.05 + (1 - luminanceNormalized) * 0.1);
        }
      } else {
        // Map from light (0.5-1.0) to dark (0.5-0.25) with a smooth transition
        hsl.l = 0.5 - (normalizedLightness * 0.25);
      }

      // Moderately increase saturation to enhance visibility in dark mode
      const saturationBoost = 1.2 + normalizedLightness * 0.2;
      hsl.s = Math.min(0.85, hsl.s * saturationBoost);
    } else {
      // For already dark colors, make them lighter for dark mode
      // Calculate normalized darkness (0 to 1 scale)
      const normalizedDarkness = (0.5 - hsl.l) / 0.5;

      // Map from dark (0-0.5) to medium (0.5-0.35) with a smooth transition
      const targetLightness = 0.5 - (0.15 * normalizedDarkness);
      hsl.l = targetLightness;

      // Slightly adjust saturation
      const saturationBoost = 1.1;
      hsl.s = Math.min(0.8, hsl.s * saturationBoost);
    }
  } else {
    // For light mode:
    // If it's a dark color (low lightness), make it lighter while preserving hue
    if (hsl.l < 0.5) {
      // Calculate normalized darkness (0 to 1 scale)
      const normalizedDarkness = (0.5 - hsl.l) / 0.5;

      // Map from dark (0-0.5) to light (0.5-0.9) with a smooth transition
      const targetLightness = 0.5 + (normalizedDarkness * 0.4);
      hsl.l = targetLightness;

      // Moderately adjust saturation
      const saturationBoost = 1.1 + normalizedDarkness * 0.1;
      hsl.s = Math.min(0.8, hsl.s * saturationBoost);
    } else {
      // For already light colors, make them darker for light mode
      // Calculate normalized lightness (0 to 1 scale)
      const normalizedLightness = (hsl.l - 0.5) / 0.5;

      // For very light colors (like whites and light grays), preserve more distinction
      if (hsl.l > 0.9 && hsl.s < 0.3) {
        // Use the same improved algorithm for light mode conversion
        const originalLuminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        const luminanceNormalized = originalLuminance / 255;

        // Create aggressive mapping with exponential scaling for light mode too
        const exponentialFactor = Math.pow(luminanceNormalized, 3);

        // Map from very light to darker range (0.45-0.12) for light mode
        hsl.l = 0.45 - (exponentialFactor * 0.33);

        // Adjust saturation for better distinction
        if (hsl.s < 0.05) {
          hsl.s = Math.min(0.15, 0.05 + (1 - luminanceNormalized) * 0.1);
        }
      } else {
        // Map from light (0.5-1.0) to medium-dark (0.5-0.2) with a smooth transition
        const targetLightness = 0.5 - (normalizedLightness * 0.3);
        hsl.l = targetLightness;
      }

      // Slightly adjust saturation
      hsl.s = Math.max(0.2, Math.min(0.7, hsl.s * 0.9));
    }
  }

  // Convert back to RGB
  let converted = hslToRgb(hsl);

  // Ensure alpha is preserved
  converted.a = alpha;

  // Only apply contrast adjustment in extreme cases to preserve the base color
  const luminance = getLuminance(converted);
  if ((isDark && luminance < 0.05) || (!isDark && luminance > 0.95)) {
    // Convert back to HSL for a more subtle adjustment
    const adjustedHsl = rgbToHsl(converted);

    // Make minimal adjustments to lightness while preserving hue and relative differences
    if (isDark) {
      // For dark mode, ensure minimum visibility while preserving relative differences
      // Use a subtle adjustment that maintains the relative positioning
      const currentL = adjustedHsl.l;
      const minL = 0.12; // Minimum lightness for visibility

      if (currentL < minL) {
        // Calculate how far below minimum we are (as a percentage of the minimum)
        const deficit = (minL - currentL) / minL;
        // Apply a proportional adjustment (smaller for values closer to minimum)
        adjustedHsl.l = minL + (deficit * 0.05);
      }
    } else {
      // For light mode, ensure maximum visibility while preserving relative differences
      const currentL = adjustedHsl.l;
      const maxL = 0.88; // Maximum lightness for visibility

      if (currentL > maxL) {
        // Calculate how far above maximum we are (as a percentage of remaining space)
        const excess = (currentL - maxL) / (1 - maxL);
        // Apply a proportional adjustment (smaller for values closer to maximum)
        adjustedHsl.l = maxL - (excess * 0.05);
      }
    }

    // Convert back to RGB
    converted = hslToRgb(adjustedHsl);
    converted.a = alpha;
  }

  return converted;
};

// Get the appropriate color for the current theme
export const getThemeColor = (colors, isDark, componentType, autoConvertColors = true) => {
  // Special debugging for headerTextColor
  const isHeaderTextColor = componentType === 'text' &&
                           colors &&
                           ((colors.light && colors.light.r === 0 && colors.light.g === 0 && colors.light.b === 0) ||
                            (colors.dark && colors.dark.r === 229 && colors.dark.g === 231 && colors.dark.b === 235));

  // Debug logging removed to reduce console noise
  // if (isHeaderTextColor) {
  //   console.log('getThemeColor - headerTextColor detected:', JSON.stringify(colors));
  //   console.log('isDark:', isDark, 'autoConvertColors:', autoConvertColors);
  // }

  // If no colors provided, use defaults
  if (!colors) {
    const defaultColor = isDark ? darkDefaults[componentType] : lightDefaults[componentType];
    // Debug logging removed to reduce console noise
    // if (isHeaderTextColor) {
    //   console.log('getThemeColor - using default color:', JSON.stringify(defaultColor));
    // }
    return defaultColor;
  }

  try {
    // If colors is a simple RGBA object, convert it to theme color
    if ('r' in colors) {
      const result = isDark && autoConvertColors ? convertToThemeColor(colors, true, componentType) : colors;
      // Debug logging removed to reduce console noise
      // if (isHeaderTextColor) {
      //   console.log('getThemeColor - simple RGBA result:', JSON.stringify(result));
      // }
      return result;
    }

    // If we have theme-specific colors, use those
    if (colors.light && colors.dark) {
      // When auto-convert is disabled, always use the theme-specific color for the current theme
      const themeColor = isDark ? colors.dark : colors.light;

      // Ensure the color has all required properties
      if (typeof themeColor.r === 'undefined') themeColor.r = isDark ? darkDefaults[componentType].r : lightDefaults[componentType].r;
      if (typeof themeColor.g === 'undefined') themeColor.g = isDark ? darkDefaults[componentType].g : lightDefaults[componentType].g;
      if (typeof themeColor.b === 'undefined') themeColor.b = isDark ? darkDefaults[componentType].b : lightDefaults[componentType].b;
      if (typeof themeColor.a === 'undefined') themeColor.a = 1;

      // Debug logging removed to reduce console noise
      // if (isHeaderTextColor) {
      //   console.log('getThemeColor - theme-specific result:', JSON.stringify(themeColor));
      // }
      return themeColor;
    }

    // Handle case where only one theme color is defined
    if (colors.light) {
      if (isDark) {
        // In dark mode with only light color defined
        if (autoConvertColors) {
          const result = convertToThemeColor(colors.light, true, componentType);
          // Debug logging removed to reduce console noise
          // if (isHeaderTextColor) {
          //   console.log('getThemeColor - light->dark conversion result:', JSON.stringify(result));
          // }
          return result;
        } else {
          // If auto-convert is disabled, use default dark color
          const result = darkDefaults[componentType];
          // Debug logging removed to reduce console noise
          // if (isHeaderTextColor) {
          //   console.log('getThemeColor - using dark default (auto-convert off):', JSON.stringify(result));
          // }
          return result;
        }
      } else {
        // Debug logging removed to reduce console noise
        // if (isHeaderTextColor) {
        //   console.log('getThemeColor - using light color directly:', JSON.stringify(colors.light));
        // }
        return colors.light;
      }
    }

    if (colors.dark) {
      if (!isDark) {
        // In light mode with only dark color defined
        if (autoConvertColors) {
          const result = convertToThemeColor(colors.dark, false, componentType);
          // Debug logging removed to reduce console noise
          // if (isHeaderTextColor) {
          //   console.log('getThemeColor - dark->light conversion result:', JSON.stringify(result));
          // }
          return result;
        } else {
          // If auto-convert is disabled, use default light color
          const result = lightDefaults[componentType];
          // Debug logging removed to reduce console noise
          // if (isHeaderTextColor) {
          //   console.log('getThemeColor - using light default (auto-convert off):', JSON.stringify(result));
          // }
          return result;
        }
      } else {
        // Debug logging removed to reduce console noise
        // if (isHeaderTextColor) {
        //   console.log('getThemeColor - using dark color directly:', JSON.stringify(colors.dark));
        // }
        return colors.dark;
      }
    }
  } catch (error) {
    console.warn('Error in getThemeColor:', error);
    // Debug logging removed to reduce console noise
    // if (isHeaderTextColor) {
    //   console.error('Error processing headerTextColor:', error);
    // }
  }

  // Fallback to defaults
  const defaultColor = isDark ? darkDefaults[componentType] : lightDefaults[componentType];
  // Debug logging removed to reduce console noise
  // if (isHeaderTextColor) {
  //   console.log('getThemeColor - using fallback default:', JSON.stringify(defaultColor));
  // }
  return defaultColor;
};

// Component color configurations for ensureThemeColors function
export const COLOR_CONFIGS = {
  BUTTON: {
    colorKeys: ['background', 'color', 'hoverBackground', 'hoverColor'],
    contextHints: {
      background: 'button',
      color: 'text',
      hoverBackground: 'button',
      hoverColor: 'text'
    }
  },
  ICON: {
    colorKeys: ['iconColor'],
    contextHints: {
      iconColor: 'button'
    }
  },
  TEXT: {
    colorKeys: ['color', 'iconColor', 'shadow.color'],
    contextHints: {
      color: 'text',
      iconColor: 'icon',
      'shadow.color': 'shadow'
    }
  },
  TABLE: {
    colorKeys: ['borderColor', 'headerBackgroundColor', 'alternateRowColor', 'linkColor', 'linkHoverColor'],
    contextHints: {
      borderColor: 'container',
      headerBackgroundColor: 'container',
      alternateRowColor: 'container',
      linkColor: 'text',
      linkHoverColor: 'text'
    },
    defaultValues: {
      borderColor: {
        light: { r: 229, g: 231, b: 235, a: 1 }, // #e5e7eb
        dark: { r: 75, g: 85, b: 99, a: 1 } // #4b5563
      },
      headerBackgroundColor: {
        light: { r: 243, g: 244, b: 246, a: 1 }, // #f3f4f6
        dark: { r: 31, g: 41, b: 55, a: 1 } // #1f2937
      },
      alternateRowColor: {
        light: { r: 249, g: 250, b: 251, a: 1 }, // #f9fafb
        dark: { r: 17, g: 24, b: 39, a: 0.5 } // #111827
      },
      linkColor: {
        light: { r: 59, g: 130, b: 246, a: 1 }, // #3b82f6
        dark: { r: 96, g: 165, b: 250, a: 1 } // #60a5fa
      },
      linkHoverColor: {
        light: { r: 29, g: 78, b: 216, a: 1 }, // #1d4ed8
        dark: { r: 59, g: 130, b: 246, a: 1 } // #3b82f6
      }
    }
  },
  CONTAINER: {
    colorKeys: ['background', 'borderColor'],
    contextHints: {
      background: 'container',
      borderColor: 'container'
    }
  },
  TABS: {
    colorKeys: ['background', 'color', 'activeBackground', 'activeColor', 'borderColor'],
    contextHints: {
      background: 'container',
      color: 'text',
      activeBackground: 'container',
      activeColor: 'text',
      borderColor: 'container'
    }
  },
  COLLAPSIBLE_SECTION: {
    colorKeys: ['background', 'color', 'headerBackground', 'headerTextColor', 'stepButtonColor', 'stepIndicatorColor'],
    contextHints: {
      background: 'container',
      color: 'text',
      headerBackground: 'container',
      headerTextColor: 'text',
      stepButtonColor: 'button',
      stepIndicatorColor: 'button'
    }
  },
  HORIZONTAL_LINE: {
    colorKeys: ['color'],
    contextHints: {
      color: 'container'
    },
    defaultValues: {
      color: {
        light: { r: 156, g: 163, b: 175, a: 1 }, // gray-400
        dark: { r: 107, g: 114, b: 128, a: 1 } // gray-500
      }
    }
  },
  IMAGE: {
    colorKeys: ['border.color'],
    contextHints: {
      'border.color': 'container'
    },
    defaultValues: {
      'border.color': {
        light: { r: 0, g: 0, b: 0, a: 1 }, // black
        dark: { r: 255, g: 255, b: 255, a: 1 } // white
      }
    }
  }
};

// Unified function to ensure all component colors have both light and dark theme variants
export const ensureThemeColors = (props, isDark, componentType, themeColors = null) => {
  const config = COLOR_CONFIGS[componentType];
  if (!config) {
    console.warn(`ensureThemeColors: Unknown component type '${componentType}'`);
    return props;
  }

  const currentTheme = isDark ? 'dark' : 'light';
  const oppositeTheme = isDark ? 'light' : 'dark';

  // Process each color property for this component type
  config.colorKeys.forEach(colorKey => {
    // Handle nested properties like 'shadow.color'
    const keyParts = colorKey.split('.');
    let target = props;
    
    // Navigate to the parent object for nested properties
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!target[keyParts[i]]) {
        target[keyParts[i]] = {};
      }
      target = target[keyParts[i]];
    }
    
    const finalKey = keyParts[keyParts.length - 1];
    
    // Skip if the property doesn't exist
    if (!target[finalKey]) {
      // Add default values for Table component if specified
      if (config.defaultValues && config.defaultValues[colorKey]) {
        target[finalKey] = { ...config.defaultValues[colorKey] };
      }
      return;
    }

    // Handle legacy format (single RGBA object) - convert to theme format
    if ('r' in target[finalKey]) {
      const oldColor = { ...target[finalKey] };
      const contextHint = config.contextHints?.[colorKey] || 'container';
      target[finalKey] = {
        [currentTheme]: oldColor,
        [oppositeTheme]: convertToThemeColor(oldColor, !isDark, contextHint)
      };
    }

    // Ensure both light and dark properties exist
    if (target[finalKey] && typeof target[finalKey] === 'object') {
      if (!target[finalKey].light) {
        if (config.defaultValues && config.defaultValues[colorKey]) {
          target[finalKey].light = { ...config.defaultValues[colorKey].light };
        } else {
          // Generate light color from dark color if available
          if (target[finalKey].dark) {
            const contextHint = config.contextHints?.[colorKey] || 'container';
            target[finalKey].light = convertToThemeColor(target[finalKey].dark, false, contextHint);
          }
        }
      }

      if (!target[finalKey].dark) {
        if (config.defaultValues && config.defaultValues[colorKey]) {
          target[finalKey].dark = { ...config.defaultValues[colorKey].dark };
        } else {
          // Generate dark color from light color if available
          if (target[finalKey].light) {
            const contextHint = config.contextHints?.[colorKey] || 'container';
            target[finalKey].dark = convertToThemeColor(target[finalKey].light, true, contextHint);
          }
        }
      }
    }
  });

  return props;
};

// Helper function for standardized theme initialization in settings useEffect
export const initializeComponentThemeColors = (editorActions, id, isDark, componentType, themeColors = null) => {
  if (id && editorActions) {
    try {
      editorActions.history.ignore().setProp(id, (props) => {
        return ensureThemeColors(props, isDark, componentType, themeColors);
      });
    } catch (error) {
      console.warn(`${componentType}Settings: Error initializing theme colors:`, error);
    }
  }
};

// Helper function to create auto-convert checkbox change handler
export const createAutoConvertHandler = (actions, isDark, componentType) => {
  return (isChecked) => {
    const config = COLOR_CONFIGS[componentType];
    if (!config) {
      console.warn(`createAutoConvertHandler: Unknown component type '${componentType}'`);
      return;
    }

    actions.setProp((props) => {
      props.autoConvertColors = isChecked;

      const currentTheme = isDark ? 'dark' : 'light';
      const oppositeTheme = isDark ? 'light' : 'dark';

      // If turning auto-convert on, update all colors
      if (isChecked) {
        config.colorKeys.forEach(colorKey => {
          // Handle nested properties like 'shadow.color'
          const keyParts = colorKey.split('.');
          let target = props;
          
          // Navigate to the target object for nested properties
          for (let i = 0; i < keyParts.length - 1; i++) {
            if (!target[keyParts[i]]) return; // Skip if parent doesn't exist
            target = target[keyParts[i]];
          }
          
          const finalKey = keyParts[keyParts.length - 1];
          
          if (target[finalKey] && target[finalKey][currentTheme]) {
            const currentColor = target[finalKey][currentTheme];
            const contextHint = config.contextHints?.[colorKey] || 'container';
            target[finalKey][oppositeTheme] = convertToThemeColor(currentColor, !isDark, contextHint);
          }
        });
      } else {
        // When turning auto-convert off, ensure both theme colors exist
        return ensureThemeColors(props, isDark, componentType);
      }

      return props;
    });
  };
};
