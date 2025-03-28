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
  isEditing = false,
  darkMode = false
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

  // Styles
  const formStyles = {
    padding: '16px',
    backgroundColor: darkMode ? '#2d3748' : 'white',
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
    border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
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

  const selectStyles = {
    width: '100%',
    padding: '8px 12px',
    border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: darkMode ? '#1e293b' : 'white',
    color: darkMode ? '#E5E7EB' : 'inherit'
  };

  const sectionInfoStyles = {
    fontSize: '14px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    marginBottom: '16px'
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

  const loadingStyles = {
    padding: '16px',
    textAlign: 'center',
    color: darkMode ? '#9CA3AF' : '#6B7280'
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
  );
};

export default CategoryForm;
