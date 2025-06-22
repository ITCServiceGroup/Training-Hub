import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { quizResultsService } from '../../../../services/api/quizResults';
import { useTheme } from '../../../../contexts/ThemeContext';

const MultiSelect = ({ type, value, onChange, hideLabel = false }) => {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';
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
        case 'quizTypes':
          data = await quizResultsService.getDistinctValues('quiz_type');
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
    markets: 'Market',
    quizTypes: 'Quiz Type'
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? 'var(--color-primary)' : isDark ? '#475569' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : provided.boxShadow,
      backgroundColor: isDark ? '#1e293b' : provided.backgroundColor,
      color: isDark ? '#f8fafc' : provided.color,
      '&:hover': {
        borderColor: 'var(--color-primary)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#1e293b' : provided.backgroundColor,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? isDark ? '#334155' : provided.backgroundColor
        : isDark ? '#1e293b' : provided.backgroundColor,
      color: isDark ? '#f8fafc' : provided.color,
      '&:hover': {
        backgroundColor: isDark ? '#475569' : '#f3f4f6',
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#475569' : '#e5e7eb'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : '#374151'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? '#cbd5e1' : '#6b7280',
      '&:hover': {
        backgroundColor: isDark ? '#64748b' : '#d1d5db',
        color: isDark ? '#f8fafc' : '#1f2937'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : provided.color,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#94a3b8' : provided.color,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : provided.color,
    }),
  };

  return (
    <div className="space-y-1 w-full">
      {!hideLabel && (
        <label htmlFor={`filter-${type}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
