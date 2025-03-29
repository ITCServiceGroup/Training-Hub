import React, { useState } from 'react';

const SectionForm = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Updated styles to match light theme
  const formContainerStyles = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const formGroupStyles = {
    marginBottom: '16px'
  };

  const labelStyles = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    border: errors.name ? '1px solid #EF4444' : '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#374151',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out',
    ':focus': {
      borderColor: '#3B82F6',
      boxShadow: '0 0 0 1px #3B82F6'
    }
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '80px',
    resize: 'vertical'
  };

  const errorTextStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#EF4444'
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  };

  const cancelButtonStyles = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4B5563',
    backgroundColor: 'white',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const submitButtonStyles = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3B82F6',
    border: '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={formContainerStyles}>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyles}>
          <label htmlFor="name" style={labelStyles}>
            Section Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyles}
            placeholder="Enter section name"
          />
          {errors.name && (
            <p style={errorTextStyles}>{errors.name}</p>
          )}
        </div>
        
        <div style={formGroupStyles}>
          <label htmlFor="description" style={labelStyles}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            style={textareaStyles}
            placeholder="Enter section description"
          />
        </div>
        
        <div style={buttonContainerStyles}>
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={submitButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
