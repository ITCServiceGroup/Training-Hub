import React, { useState, useEffect } from 'react';
import { sectionsService } from '../../../../services/api/sections';
import { useTheme } from '../../../../contexts/ThemeContext';
import IconSelector from '../../../../components/common/IconSelector';

const CategoryForm = ({
  onSubmit,
  onCancel,
  initialData = {
    name: '',
    description: '',
    section_id: '',
    icon: 'Book'
  },
  section = null,
  isEditing = false,
  darkMode = false
}) => {
  const [formData, setFormData] = useState(initialData);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = darkMode || theme === 'dark';

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

  // Using Tailwind classes instead of inline styles

  if (loading) {
    return <div className={`p-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading sections...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={`p-6 ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-200'} shadow-sm`}>
      <div className="mb-4">
        <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full py-2 px-3 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className={`w-full py-2 px-3 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[80px] resize-y`}
          placeholder="Enter category description"
        />
      </div>

      <div className="mb-4">
        <IconSelector
          selectedIcon={formData.icon}
          onSelectIcon={(iconName) => setFormData(prev => ({ ...prev, icon: iconName }))}
          isDark={isDark}
        />
      </div>

      {!section && (
        <div className="mb-4">
          <label htmlFor="section_id" className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
            Section
          </label>
          <select
            id="section_id"
            value={formData.section_id}
            onChange={(e) => setFormData(prev => ({ ...prev, section_id: e.target.value }))}
            className={`w-full py-2 px-3 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
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
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
          Section: {section.name}
        </div>
      )}

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
  );
};

export default CategoryForm;
