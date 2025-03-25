import React, { useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import PropTypes from 'prop-types';
import 'flatpickr/dist/themes/light.css';

const DateFilter = ({ value, onChange }) => {
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
    <div className="space-y-2 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <select
          value={value.preset}
          onChange={handlePresetChange}
          className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {presetOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              Start:
            </label>
            <Flatpickr
              id="start-date"
              value={value.startDate}
              onChange={([date]) => {
                onChange({
                  ...value,
                  preset: 'custom',
                  startDate: date ? date.toISOString().split('T')[0] : null
                });
              }}
              className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              options={{
                dateFormat: 'Y-m-d',
                maxDate: value.endDate || 'today'
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              End:
            </label>
            <Flatpickr
              id="end-date"
              value={value.endDate}
              onChange={([date]) => {
                onChange({
                  ...value,
                  preset: 'custom',
                  endDate: date ? date.toISOString().split('T')[0] : null
                });
              }}
              className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              options={{
                dateFormat: 'Y-m-d',
                minDate: value.startDate,
                maxDate: 'today'
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
