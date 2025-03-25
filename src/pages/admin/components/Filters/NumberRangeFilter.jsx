import React from 'react';

const NumberRangeFilter = ({ type, value, onChange }) => {
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
      [field]: newValue
    });
  };

  const config = labels[type];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {config.title}
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${type}-min`} className="block text-sm text-gray-600">
            {config.min}
          </label>
          <input
            type="number"
            id={`${type}-min`}
            value={value.min}
            onChange={(e) => handleChange('min', e.target.value)}
            min="0"
            step={config.step}
            placeholder={config.minPlaceholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor={`${type}-max`} className="block text-sm text-gray-600">
            {config.max}
          </label>
          <input
            type="number"
            id={`${type}-max`}
            value={value.max}
            onChange={(e) => handleChange('max', e.target.value)}
            min={value.min || "0"}
            step={config.step}
            placeholder={config.maxPlaceholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberRangeFilter;
