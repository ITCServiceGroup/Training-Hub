/**
 * Preset color themes based on color theory
 */

export const PRESET_THEMES = [
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
export const DEFAULT_COLORS = PRESET_THEMES[0];

// Default color mode settings
export const DEFAULT_COLOR_MODES = {
  primary: {
    autoCalculate: true
  },
  secondary: {
    autoCalculate: true
  }
};