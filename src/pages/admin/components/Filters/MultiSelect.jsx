import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { quizResultsService } from '../../../../services/api/quizResults';

const MultiSelect = ({ type, value, onChange, hideLabel = false }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptions();
  }, [type]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      let data;
      switch (type) {
        case 'supervisors':
          data = await quizResultsService.getDistinctValues('supervisor');
          break;
        case 'ldaps':
          data = await quizResultsService.getDistinctValues('ldap');
          break;
        case 'markets':
          data = await quizResultsService.getDistinctValues('market');
          break;
        default:
          data = [];
      }

      // Convert to react-select format and filter out null/empty values
      const formattedOptions = data
        .filter(item => item)
        .map(item => ({
          value: item,
          label: item
        }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error(`Error loading ${type} options:`, error);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    supervisors: 'Supervisor',
    ldaps: 'LDAP',
    markets: 'Market'
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : provided.boxShadow,
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e5e7eb'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#374151'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        backgroundColor: '#d1d5db',
        color: '#1f2937'
      }
    })
  };

  return (
    <div className="space-y-1 w-full">
      {!hideLabel && (
        <label htmlFor={`filter-${type}`} className="block text-sm font-medium text-gray-700">
          {labels[type]}
        </label>
      )}
      <Select
        id={`filter-${type}`}
        isMulti
        options={options}
        value={options.filter(option => value.includes(option.value))}
        onChange={(selected) => onChange(selected ? selected.map(item => item.value) : [])}
        isLoading={loading}
        placeholder={`Select ${labels[type]}(s)`}
        isClearable={true}
        styles={customStyles}
        className="w-full"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default MultiSelect;
