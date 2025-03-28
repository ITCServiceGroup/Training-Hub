import React, { useState, useEffect } from 'react';
import { sectionsService } from '../../../../services/api/sections';

const CategoryForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {
    name: '',
    description: '',
    section_id: ''
  },
  section = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState(initialData);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await sectionsService.getAllSections();
        setSections(data);
        
        // If no section_id is set and we have sections, set the first one as default
        if (!formData.section_id && data.length > 0) {
          setFormData(prev => ({ ...prev, section_id: section?.id || data[0].id }));
        }
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      section_id: section?.id || formData.section_id
    });
  };

  // Updated styles to match light theme
  const formStyles = {
    padding: '24px',
    backgroundColor: 'white',
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
    border: '1px solid #D1D5DB',
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

  const selectStyles = {
    ...inputStyles
  };

  const sectionInfoStyles = {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '16px'
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

  const loadingStyles = {
    padding: '16px',
    textAlign: 'center',
    color: '#6B7280'
  };

  if (loading) {
    return <div style={loadingStyles}>Loading sections...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={formStyles}>
      <div style={formGroupStyles}>
        <label htmlFor="name" style={labelStyles}>
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={inputStyles}
          placeholder="Enter category name"
          required
        />
      </div>

      <div style={formGroupStyles}>
        <label htmlFor="description" style={labelStyles}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          style={textareaStyles}
          placeholder="Enter category description"
        />
      </div>

      {!section && (
        <div style={formGroupStyles}>
          <label htmlFor="section_id" style={labelStyles}>
            Section
          </label>
          <select
            id="section_id"
            value={formData.section_id}
            onChange={(e) => setFormData(prev => ({ ...prev, section_id: e.target.value }))}
            style={selectStyles}
            required
          >
            <option value="">Select a section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {section && (
        <div style={sectionInfoStyles}>
          Section: {section.name}
        </div>
      )}

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
  );
};

export default CategoryForm;
