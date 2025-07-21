import React from 'react';
import { BiRefresh, BiDownload } from 'react-icons/bi';
import { useTheme } from '../../../contexts/ThemeContext';

const GlobalFilters = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Quick preset options
  const quickPresets = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  // Handle quick preset changes
  const handleQuickPresetChange = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'last_7_days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last_quarter':
        const quarterStart = Math.floor(today.getMonth() / 3) * 3 - 3;
        startDate = new Date(today.getFullYear(), quarterStart, 1);
        endDate = new Date(today.getFullYear(), quarterStart + 3, 0);
        break;
      case 'this_year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case 'all_time':
        startDate = null;
        endDate = null;
        break;
      default:
        return;
    }

    const newFilters = {
      ...filters,
      dateRange: {
        preset: preset,
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null
      },
      quickPreset: preset
    };

    onFiltersChange(newFilters);
  };

  // Handle custom date range changes
  const handleCustomDateChange = (field, value) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        preset: 'custom',
        [field]: value
      },
      quickPreset: 'custom'
    };

    onFiltersChange(newFilters);
  };

  // Handle reset
  const handleReset = () => {
    const resetFilters = {
      dateRange: {
        preset: 'last_month',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_month'
    };

    onFiltersChange(resetFilters);
    if (onReset) onReset();
  };

  return (
    <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${className}`}>
      {/* Empty space to push filters to the right */}
      <div></div>
      
      {/* Advanced Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">

        {/* Custom Date Range (shown when custom is selected) */}
        {filters.quickPreset === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.startDate || ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.endDate || ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Export Button (if provided) */}
        {onExport && (
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="btn-primary flex items-center gap-2 text-sm"
              title="Export dashboard"
            >
              <BiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFilters;
