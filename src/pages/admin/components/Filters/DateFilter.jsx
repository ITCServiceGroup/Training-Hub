import React, { useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import PropTypes from 'prop-types';
import { useTheme } from '../../../../contexts/ThemeContext';
import 'flatpickr/dist/themes/light.css';

const DateFilter = ({ value, onChange }) => {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';
  const presetOptions = [
    { value: 'custom', label: 'Custom' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' }
  ];

  useEffect(() => {
    if (value.preset !== 'custom') {
      updateDateRange(value.preset);
    }
  }, [value.preset]);

  const updateDateRange = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'last_7_days':
        endDate = today;
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;

      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      case 'last_quarter':
        const currentMonth = today.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;
        let year = today.getFullYear();
        if (currentQuarter === 1) {
          year = year - 1;
        }
        const firstMonthOfLastQuarter = (lastQuarter - 1) * 3;
        startDate = new Date(year, firstMonthOfLastQuarter, 1);
        endDate = new Date(year, firstMonthOfLastQuarter + 3, 0);
        break;

      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case 'this_quarter':
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        startDate = new Date(today.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
        break;

      case 'this_year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;

      default:
        return;
    }

    onChange({
      ...value,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const handlePresetChange = (e) => {
    onChange({
      ...value,
      preset: e.target.value
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-3 w-full">
        {/* Preset Dropdown */}
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Preset</label>
          <select
            value={value.preset}
            onChange={handlePresetChange}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            {presetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Start Date */}
          <div>
            <Flatpickr
              id="start-date"
              value={value.startDate || ''}
              onChange={([date]) => {
                if (date) {
                  onChange({
                    ...value,
                    preset: 'custom',
                    startDate: date.toISOString().split('T')[0]
                  });
                }
              }}
              placeholder="Start Date"
              className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              options={{
                dateFormat: 'Y-m-d',
                maxDate: value.endDate || 'today',
                clickOpens: true,
                allowInput: false,
                disableMobile: true,
                onClose: (selectedDates, dateStr, instance) => {
                  // Prevent event bubbling that might close the popover
                  instance.element.blur();
                },
                onReady: (selectedDates, dateStr, instance) => {
                  // Disable browser autocomplete
                  instance.element.setAttribute('autocomplete', 'off');
                  instance.element.setAttribute('readonly', 'readonly');
                }
              }}
            />
          </div>
          {/* End Date */}
          <div>
            <Flatpickr
              id="end-date"
              value={value.endDate || ''}
              onChange={([date]) => {
                if (date) {
                  onChange({
                    ...value,
                    preset: 'custom',
                    endDate: date.toISOString().split('T')[0]
                  });
                }
              }}
              placeholder="End Date"
              className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              options={{
                dateFormat: 'Y-m-d',
                minDate: value.startDate,
                maxDate: 'today',
                clickOpens: true,
                allowInput: false,
                disableMobile: true,
                onClose: (selectedDates, dateStr, instance) => {
                  // Prevent event bubbling that might close the popover
                  instance.element.blur();
                },
                onReady: (selectedDates, dateStr, instance) => {
                  // Disable browser autocomplete
                  instance.element.setAttribute('autocomplete', 'off');
                  instance.element.setAttribute('readonly', 'readonly');
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

DateFilter.propTypes = {
  value: PropTypes.shape({
    preset: PropTypes.string.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default DateFilter;
