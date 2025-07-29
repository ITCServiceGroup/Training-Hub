import React from 'react';
import Select from 'react-select';
import { useTheme } from '../../../../contexts/ThemeContext';

const SingleSelect = ({ value, onChange, options, placeholder, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? 'var(--color-primary)' : isDark ? '#475569' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : provided.boxShadow,
      backgroundColor: isDark ? '#1e293b' : provided.backgroundColor,
      color: isDark ? '#f8fafc' : provided.color,
      fontSize: '12px',
      minHeight: '28px',
      '&:hover': {
        borderColor: 'var(--color-primary)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#1e293b' : provided.backgroundColor,
      fontSize: '12px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? 'var(--color-primary)'
        : state.isSelected
        ? 'var(--color-primary)'
        : isDark ? '#1e293b' : provided.backgroundColor,
      color: state.isFocused || state.isSelected
        ? 'white'
        : isDark ? '#f8fafc' : provided.color,
      fontSize: '12px',
      padding: '6px 12px',
      '&:hover': {
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : provided.color,
      fontSize: '12px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#94a3b8' : provided.color,
      fontSize: '12px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : provided.color,
      fontSize: '12px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: isDark ? '#94a3b8' : '#6b7280',
      padding: '4px',
      '&:hover': {
        color: isDark ? '#f8fafc' : '#374151'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  return (
    <Select
      isMulti={false}
      isSearchable={false}
      options={options}
      value={options.find(option => option.value === value) || null}
      onChange={(selected) => onChange(selected ? selected.value : '')}
      placeholder={placeholder}
      isClearable={false}
      styles={customStyles}
      className={className}
      classNamePrefix="react-select"
    />
  );
};

export default SingleSelect;