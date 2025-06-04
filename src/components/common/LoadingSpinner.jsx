import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Reusable loading spinner component that adapts to theme colors
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the spinner: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} props.text - Optional loading text to display
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.center - Whether to center the spinner (default: true)
 * @param {string} props.color - Color to use: 'primary', 'secondary', or custom hex (default: 'primary')
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  className = '', 
  center = true,
  color = 'primary'
}) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-10 h-10 border-4'
  };

  // Get the appropriate color
  const getSpinnerColor = () => {
    if (color === 'primary') {
      return themeColors.primary[isDark ? 'dark' : 'light'];
    } else if (color === 'secondary') {
      return themeColors.secondary[isDark ? 'dark' : 'light'];
    } else if (color.startsWith('#')) {
      return color;
    } else {
      // Fallback to primary
      return themeColors.primary[isDark ? 'dark' : 'light'];
    }
  };

  const spinnerColor = getSpinnerColor();

  // Container classes
  const containerClasses = center 
    ? `flex items-center justify-center ${className}` 
    : `flex items-center ${className}`;

  return (
    <div className={containerClasses}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-transparent animate-spin`}
        role="status"
        style={{
          borderColor: hexToRgba(spinnerColor, 0.3),
          borderTopColor: 'transparent'
        }}
        aria-label={text || 'Loading'}
      >
        <span className="sr-only">{text || 'Loading...'}</span>
      </div>
      {text && (
        <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
