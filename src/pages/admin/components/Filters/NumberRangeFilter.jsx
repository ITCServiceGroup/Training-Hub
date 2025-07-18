import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const NumberRangeFilter = ({ type, value, onChange, hideTitle = false, min = 0, max = 100, unit = '' }) => {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Use provided props or fallback to type-based config
  const labels = {
    score: {
      title: 'Score Range',
      min: 'Min Score (%)',
      max: 'Max Score (%)',
      step: '1',
      minPlaceholder: '0',
      maxPlaceholder: '100'
    },
    time: {
      title: 'Time Range',
      min: 'Min Time (min)',
      max: 'Max Time (min)',
      step: '1',
      minPlaceholder: '0',
      maxPlaceholder: '60'
    }
  };

  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: parseInt(newValue) || 0
    });
  };

  // Use type-based config if available, otherwise use generic labels
  const config = type && labels[type] ? labels[type] : {
    title: 'Range',
    min: `Min ${unit}`,
    max: `Max ${unit}`,
    step: '1',
    minPlaceholder: min.toString(),
    maxPlaceholder: max.toString()
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="min-w-0">
          <label htmlFor={`${type || 'range'}-min`} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
            Min {unit}
          </label>
          <input
            type="number"
            id={`${type || 'range'}-min`}
            value={value?.min || min}
            onChange={(e) => handleChange('min', e.target.value)}
            min={min}
            max={max}
            step={config.step}
            placeholder={config.minPlaceholder}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${type || 'range'}-max`} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
            Max {unit}
          </label>
          <input
            type="number"
            id={`${type || 'range'}-max`}
            value={value?.max || max}
            onChange={(e) => handleChange('max', e.target.value)}
            min={value?.min || min}
            max={max}
            step={config.step}
            placeholder={config.maxPlaceholder}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberRangeFilter;
