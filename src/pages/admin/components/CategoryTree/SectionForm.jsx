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

  // Using Tailwind classes instead of inline styles

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Section Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full py-2 px-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm text-gray-700 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
            placeholder="Enter section name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-y"
            placeholder="Enter section description"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
