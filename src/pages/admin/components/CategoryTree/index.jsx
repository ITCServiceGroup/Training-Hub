import React, { useState, useEffect } from 'react';
import { categoriesService } from '../../../../services/api/categories';
import { sectionsService } from '../../../../services/api/sections';
import CategoryForm from './CategoryForm';
import SectionForm from './SectionForm';

const CategoryItem = ({ category, onSelect, selectedId, onCategoryUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditSubmit = async (formData) => {
    try {
      // Use updateBasicInfo instead of update to avoid schema cache issues
      await categoriesService.updateBasicInfo(category.id, formData);
      setIsEditing(false);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesService.delete(category.id);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Using Tailwind classes instead of inline styles

  return (
    <div className="ml-4 my-3">
      <div
        className={`relative overflow-hidden rounded-lg shadow-sm transition-all ${selectedId === category.id ? 'bg-blue-50 border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200' : 'bg-white border border-gray-200'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="p-3 cursor-pointer"
          onClick={() => onSelect(category)}
        >
          <div className="flex items-center">
            <div className="text-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-medium text-gray-800">{category.name}</div>
          </div>
          {category.description && (
            <div className="mt-1 text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
              {category.description}
            </div>
          )}
        </div>

        <div className={`flex justify-end gap-1 p-2 bg-gray-50 border-t border-gray-100 transition-opacity ${isHovered || selectedId === category.id ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setIsEditing(true)}
            className="py-1 px-2 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded border-none cursor-pointer transition-colors"
            title="Edit category"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="py-1 px-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded border-none cursor-pointer transition-colors"
            title="Delete category"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-2">
          <CategoryForm
            initialData={category}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
          />
        </div>
      )}
    </div>
  );
};

const SectionItem = ({ section, categories, onSelectCategory, selectedCategoryId, onSectionUpdate, onCategoryUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleEditSubmit = async (formData) => {
    try {
      await sectionsService.update(section.id, formData);
      setIsEditing(false);
      onSectionUpdate();
    } catch (err) {
      console.error('Error updating section:', err);
    }
  };

  const handleAddCategory = async (formData) => {
    try {
      await categoriesService.create({
        ...formData,
        section_id: section.id
      });
      setIsAddingCategory(false);
      onCategoryUpdate();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this section and all its categories?')) return;
    try {
      await sectionsService.delete(section.id);
      onSectionUpdate();
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  const sectionCategories = categories.filter(cat => cat.section_id === section.id);
  const hasCategories = sectionCategories.length > 0;

  // Get a color based on section name for visual distinction
  const getSectionColor = (name) => {
    const colors = [
      { from: '#3B82F6', to: '#2563EB' }, // blue
      { from: '#14B8A6', to: '#0D9488' }, // teal
      { from: '#8B5CF6', to: '#7C3AED' }, // purple
      { from: '#10B981', to: '#059669' }, // green
      { from: '#6366F1', to: '#4F46E5' }, // indigo
    ];

    // Simple hash function to get consistent color for same name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sectionColor = getSectionColor(section.name);

  // Using Tailwind classes instead of inline styles

  return (
    <div className="mb-6">
      <div className="rounded-lg shadow-md overflow-hidden transition-all">
        <div style={{ background: `linear-gradient(to right, ${sectionColor.from}, ${sectionColor.to})` }} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {hasCategories && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-white mr-3 border-none cursor-pointer"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <div className="text-white">
                <h3 className="font-bold text-lg">
                  {section.name}
                </h3>
                {section.description && (
                  <p className="text-white/80 text-sm mt-1">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-white text-sm">
              {sectionCategories.length} {sectionCategories.length === 1 ? 'category' : 'categories'}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 px-5 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-500 italic mr-5">
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingCategory(true)}
              className="py-1.5 px-3 text-xs bg-primary hover:bg-primary-dark text-white rounded-md border-none cursor-pointer shadow-sm flex items-center gap-1"
              title="Add category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Category
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="py-1.5 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-md border-none cursor-pointer shadow-sm"
              title="Edit section"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="py-1.5 px-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md border-none cursor-pointer shadow-sm"
              title="Delete section"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-2.5 font-bold text-gray-600">
            Edit Section
          </div>
          <SectionForm
            initialData={section}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
          />
        </div>
      )}

      {isAddingCategory && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-2.5 font-bold text-gray-600">
            Add New Category
          </div>
          <CategoryForm
            section={section}
            onSubmit={handleAddCategory}
            onCancel={() => setIsAddingCategory(false)}
          />
        </div>
      )}

      {isExpanded && hasCategories && (
        <div className="mt-3 pl-2 border-l-2 border-gray-200">
          {sectionCategories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              onSelect={onSelectCategory}
              selectedId={selectedCategoryId}
              onCategoryUpdate={onCategoryUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ onSelectCategory, selectedCategoryId }) => {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingSection, setIsAddingSection] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isLoading) setIsLoading(true);
    try {
      // Load sections and categories
      const sectionsData = await sectionsService.getSectionsWithCategories();
      setSections(sectionsData);

      // Flatten categories from all sections
      const allCategories = [];
      sectionsData.forEach(section => {
        if (section.v2_categories && section.v2_categories.length > 0) {
          allCategories.push(...section.v2_categories);
        }
      });

      setCategories(allCategories);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (formData) => {
    try {
      await sectionsService.create(formData);
      setIsAddingSection(false);
      await loadData();
    } catch (err) {
      setError('Failed to create section');
      console.error('Error creating section:', err);
    }
  };

  // Using Tailwind classes instead of inline styles

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"></div>
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Study Guide Categories</h3>
        <button
          onClick={() => setIsAddingSection(true)}
          className="py-2 px-4 text-sm bg-primary hover:bg-primary-dark text-white rounded-md border-none cursor-pointer shadow-sm flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Section
        </button>
      </div>

      {isAddingSection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <SectionForm
            onSubmit={handleAddSection}
            onCancel={() => setIsAddingSection(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 mb-4">No sections found.</p>
            <p className="text-gray-400 text-sm">Create a section to get started with organizing your study guides.</p>
          </div>
        ) : (
          <div className="p-4">
            {sections.map(section => (
              <SectionItem
                key={section.id}
                section={section}
                categories={categories}
                onSelectCategory={onSelectCategory}
                selectedCategoryId={selectedCategoryId}
                onSectionUpdate={loadData}
                onCategoryUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
