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

  // Styles
  const formContainerStyles = {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
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
    marginBottom: '4px'
  };

  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    border: errors.name ? '1px solid #EF4444' : '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px'
  };

  const textareaStyles = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '80px'
  };

  const errorTextStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#EF4444'
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  };

  const cancelButtonStyles = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4B5563',
    backgroundColor: 'white',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer'
  };

  const submitButtonStyles = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3B82F6',
    border: '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer'
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
