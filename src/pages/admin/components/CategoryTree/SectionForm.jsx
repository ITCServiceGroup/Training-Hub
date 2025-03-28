import React, { useState } from 'react';

const SectionForm = ({ initialData, onSubmit, onCancel, isEditing = false, darkMode = false }) => {
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

  // Styles
  const formContainerStyles = {
    backgroundColor: darkMode ? '#2d3748' : 'white',
    padding: '16px',
    borderRadius: '8px',
    border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const formGroupStyles = {
    marginBottom: '16px'
  };

  const labelStyles = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: darkMode ? '#E5E7EB' : '#374151',
    marginBottom: '4px'
  };

  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    border: errors.name 
      ? '1px solid #EF4444' 
      : darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: darkMode ? '#1e293b' : 'white',
    color: darkMode ? '#E5E7EB' : 'inherit'
  };

  const textareaStyles = {
    width: '100%',
    padding: '8px 12px',
    border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '80px',
    backgroundColor: darkMode ? '#1e293b' : 'white',
    color: darkMode ? '#E5E7EB' : 'inherit'
  };

  const errorTextStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#EF4444'
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px'
  };

  const cancelButtonStyles = {
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '500',
    color: darkMode ? '#E5E7EB' : '#4B5563',
    backgroundColor: darkMode ? '#4B5563' : 'white',
    border: darkMode ? '1px solid #6B7280' : '1px solid #D1D5DB',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '48%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const submitButtonStyles = {
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3B82F6',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '48%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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
          />
        </div>
        
        <div style={buttonContainerStyles}>
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyles}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={submitButtonStyles}
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
