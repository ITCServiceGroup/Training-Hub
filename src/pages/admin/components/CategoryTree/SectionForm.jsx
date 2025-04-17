import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const SectionForm = ({ initialData, onSubmit, onCancel, isEditing = false, darkMode = false }) => {
  const { theme } = useTheme();
  const isDark = darkMode || theme === 'dark';
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

  // Using Tailwind classes instead of inline styles

  return (
    <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} p-6 rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
            Section Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full py-2 px-3 border ${errors.name ? 'border-red-500' : isDark ? 'border-slate-500' : 'border-gray-300'} rounded-md text-sm ${isDark ? 'text-white bg-slate-600' : 'text-gray-700 bg-white'} outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
            placeholder="Enter section name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full py-2 px-3 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[80px] resize-y`}
            placeholder="Enter section description"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className={`py-2 px-4 text-sm font-medium ${isDark ? 'text-gray-200 bg-slate-600 border-slate-500 hover:bg-slate-500' : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400'} border rounded-md transition-colors flex items-center justify-center`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
