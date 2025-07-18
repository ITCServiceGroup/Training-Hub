import React, { useState, useRef, useEffect } from 'react';
import { BiX, BiRefresh } from 'react-icons/bi';
import { useTheme } from '../../../contexts/ThemeContext';
import DateFilter from './Filters/DateFilter';
import MultiSelect from './Filters/MultiSelect';
import NumberRangeFilter from './Filters/NumberRangeFilter';

const TileFilterPopover = ({
  isOpen,
  onClose,
  tileId,
  tileTitle,
  filters,
  onFiltersChange,
  onUseGlobal,
  position = { x: 0, y: 0 }
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside the popover
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        // Check if click is on a Flatpickr calendar (which renders outside the popover)
        const flatpickrCalendar = event.target.closest('.flatpickr-calendar');
        if (flatpickrCalendar) {
          return; // Don't close if clicking on date picker
        }

        // Check if click is on a react-select dropdown (which also renders outside)
        const reactSelectMenu = event.target.closest('.react-select__menu');
        if (reactSelectMenu) {
          return; // Don't close if clicking on dropdown menu
        }

        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close popover on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFilterChange = (filterType, value) => {
    onFiltersChange(tileId, {
      ...filters,
      [filterType]: value
    });
  };

  const handleReset = () => {
    onFiltersChange(tileId, {
      dateRange: { preset: 'custom', startDate: null, endDate: null },
      supervisors: [],
      markets: [],
      scoreRange: { min: 0, max: 100 },
      timeRange: { min: 0, max: 500 } // Changed to minutes
    });
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 p-4 w-96"
      style={{
        left: Math.min(position.x, window.innerWidth - 400 - 20),
        top: Math.min(position.y, window.innerHeight - 500 - 20),
        maxHeight: '500px',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-600">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          {tileTitle} Filters
        </h4>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
        >
          <BiX className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="space-y-5">
        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Date Range
          </label>
          <DateFilter
            value={filters.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
        </div>

        {/* Score and Time Ranges - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Score Range */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Score Range (%)
            </label>
            <NumberRangeFilter
              min={0}
              max={100}
              value={filters.scoreRange}
              onChange={(value) => handleFilterChange('scoreRange', value)}
              unit="%"
            />
          </div>

          {/* Time Range */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Time Range (min)
            </label>
            <NumberRangeFilter
              min={0}
              max={500}
              value={filters.timeRange}
              onChange={(value) => handleFilterChange('timeRange', value)}
              unit="min"
            />
          </div>
        </div>

        {/* Supervisors and Markets - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Supervisors */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Supervisors
            </label>
            <MultiSelect
              type="supervisors"
              value={filters.supervisors}
              onChange={(value) => handleFilterChange('supervisors', value)}
              hideLabel={true}
            />
          </div>

          {/* Markets */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Markets
            </label>
            <MultiSelect
              type="markets"
              value={filters.markets}
              onChange={(value) => handleFilterChange('markets', value)}
              hideLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <button
          onClick={onUseGlobal}
          className="w-full btn-secondary text-sm"
        >
          Use Global Filters
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 btn-secondary text-sm flex items-center justify-center"
          >
            <BiRefresh className="w-4 h-4 mr-1" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-primary text-sm flex items-center justify-center"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TileFilterPopover;
