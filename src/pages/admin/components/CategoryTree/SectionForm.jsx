import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import IconSelector from '../../../../components/common/IconSelector';

const SectionForm = ({ initialData, onSubmit, onCancel, isEditing = false, darkMode = false }) => {
  const { theme } = useTheme();
  const isDark = darkMode || theme === 'dark';
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || 'Book'
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
    <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-200'} shadow-sm max-h-[80vh] sm:max-h-none flex flex-col`}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
              Section Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.name ? 'border-red-500' : isDark ? 'border-slate-500' : 'border-gray-300'} rounded-md text-sm ${isDark ? 'text-white bg-slate-600' : 'text-gray-700 bg-white'} outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary`}
              placeholder="Enter section name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full py-2 px-3 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] resize-y`}
              placeholder="Enter section description"
            />
          </div>

          <div>
            <IconSelector
              selectedIcon={formData.icon}
              onSelectIcon={(iconName) => setFormData(prev => ({ ...prev, icon: iconName }))}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Fixed button area */}
        <div className={`border-t ${isDark ? 'border-slate-600' : 'border-gray-200'} p-6 bg-inherit rounded-b-lg`}>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`py-2 px-4 text-sm font-medium ${isDark ? 'text-gray-200 bg-slate-600 border-slate-500 hover:bg-slate-500' : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400'} border rounded-md transition-colors flex items-center justify-center`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
