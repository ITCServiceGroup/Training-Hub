import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';

const Toast = ({ message, type = 'success', duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    console.log('Toast mounted with message:', message);

    // Set a timer to hide the toast after the specified duration
    const hideTimer = setTimeout(() => {
      console.log('Toast hiding:', message);
      setIsVisible(false);
    }, duration);

    // Set a timer to remove the toast from the DOM after it's hidden
    const closeTimer = setTimeout(() => {
      console.log('Toast closing:', message);
      if (onClose) onClose();
    }, duration + 300); // Wait for fade out animation to complete

    // Clean up timers when component unmounts
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration, onClose]);

  // Define styles based on type and theme
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-primary border-primary text-white'; // Primary color for success
      case 'error':
        return isDarkMode
          ? 'bg-red-800 border-red-600 text-white'
          : 'bg-red-500 border-red-600 text-white';
      case 'info':
        return 'bg-secondary border-secondary text-white'; // Secondary color for info
      case 'warning':
        return isDarkMode
          ? 'bg-yellow-700 border-yellow-600 text-white'
          : 'bg-yellow-500 border-yellow-600 text-white';
      default:
        return isDarkMode
          ? 'bg-slate-700 border-slate-600 text-white'
          : 'bg-slate-500 border-slate-600 text-white';
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border shadow-lg flex items-center transition-all duration-300 pointer-events-auto ${getTypeStyles()} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {type === 'success' && (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === 'warning' && (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  duration: PropTypes.number,
  onClose: PropTypes.func
};

export default Toast;
