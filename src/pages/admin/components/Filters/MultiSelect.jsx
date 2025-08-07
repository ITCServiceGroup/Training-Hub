import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
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
      zIndex: 1000, // Higher than chart tiles (100) but lower than tooltips
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 1000, // Ensure portal also has medium z-index
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
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#475569' : '#e5e7eb',
      fontSize: '11px',
      display: 'flex !important',
      alignItems: 'center',
      margin: '1px',
      borderRadius: '2px',
      minWidth: '60px', // Ensure minimum width for text + X
      width: 'auto !important',
      maxWidth: 'none !important', // Remove any width restrictions
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? '#f8fafc' : '#374151',
      fontSize: '11px',
      padding: '2px 6px',
      paddingRight: '2px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '120px',
      flex: '1 1 auto',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? '#cbd5e1' : '#6b7280',
      fontSize: '11px',
      padding: '2px 4px',
      cursor: 'pointer',
      borderRadius: '0 2px 2px 0',
      flex: '0 0 auto !important', // Force the X to always be visible
      display: 'block !important',
      width: 'auto !important',
      '&:hover': {
        backgroundColor: isDark ? '#64748b' : '#d1d5db',
        color: isDark ? '#f8fafc' : '#1f2937'
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
    }),
  };

  // Custom component for multivalue label with tooltip
  const MultiValueLabel = (props) => {
    return (
      <div title={props.children}>
        <components.MultiValueLabel {...props} />
      </div>
    );
  };

  // Simple MultiValue component without conflicting tooltip
  const MultiValue = (props) => {
    return (
      <div
        title={props.children} // Use native browser tooltip instead of custom one
        style={{
          backgroundColor: isDark ? '#475569' : '#e5e7eb',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          margin: '1px',
          borderRadius: '2px',
          minWidth: '60px',
        }}
      >
        <div
          style={{
            color: isDark ? '#f8fafc' : '#374151',
            fontSize: '11px',
            padding: '2px 6px',
            paddingRight: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
            flex: '1 1 auto',
          }}
        >
          {props.children}
        </div>
        <div
          style={{
            color: isDark ? '#cbd5e1' : '#6b7280',
            fontSize: '11px',
            padding: '2px 4px',
            cursor: 'pointer',
            borderRadius: '0 2px 2px 0',
            flex: '0 0 auto',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.removeProps.onClick(e);
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDark ? '#64748b' : '#d1d5db';
            e.target.style.color = isDark ? '#f8fafc' : '#1f2937';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = isDark ? '#cbd5e1' : '#6b7280';
          }}
        >
          ×
        </div>
      </div>
    );
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
        isSearchable={false}
        options={options}
        value={options.filter(option => value.includes(option.value))}
        onChange={(selected) => onChange(selected ? selected.map(item => item.value) : [])}
        isLoading={loading}
        placeholder={`Select ${labels[type]}(s)`}
        isClearable={true}
        styles={customStyles}
        className="w-full"
        classNamePrefix="react-select"
        components={{
          MultiValue
        }}
        menuPortalTarget={null} // Explicitly disable portal rendering
        menuShouldScrollIntoView={false}
      />
    </div>
  );
};

export default MultiSelect;
