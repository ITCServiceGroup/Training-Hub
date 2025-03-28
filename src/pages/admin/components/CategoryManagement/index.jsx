import React, { useState, useEffect } from 'react';
import CategoryAdminGrid from './CategoryAdminGrid';
import { categoriesService } from '../../../../services/api/categories';
import BreadcrumbNav from '../BreadcrumbNav';

const CategoryManagement = ({ section, onViewStudyGuides, onBack }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (section) {
      loadCategories();
    }
  }, [section]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.getBySectionId(section.id);
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (formData) => {
    try {
      await categoriesService.create({
        ...formData,
        section_id: section.id
      });
      await loadCategories();
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const handleUpdateCategory = async (id, formData) => {
    try {
      await categoriesService.update(id, {
        ...formData,
        section_id: section.id
      });
      await loadCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const handleUpdateOrder = async (updates) => {
    // First update the local state optimistically
    const newCategories = [...categories];
    updates.forEach(update => {
      const category = newCategories.find(c => c.id === update.id);
      if (category) {
        category.display_order = update.display_order;
      }
    });
    // Sort the categories by display_order
    newCategories.sort((a, b) => a.display_order - b.display_order);
    setCategories(newCategories);

    try {
      // Then update the server
      await categoriesService.updateOrder(updates);
    } catch (err) {
      console.error('Error updating category order:', err);
      // On error, reload the categories to get the correct order
      await loadCategories();
      throw err;
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category and all its study guides?')) {
      return;
    }
    try {
      await categoriesService.delete(id);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  return (
    <div>
      <BreadcrumbNav
        items={[
          {
            label: 'Sections',
            onClick: onBack
          },
          {
            label: section.name
          }
        ]}
      />
      <CategoryAdminGrid
        categories={categories}
        section={section}
        isLoading={isLoading}
        error={error}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        onViewStudyGuides={onViewStudyGuides}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        onReorder={handleUpdateOrder}
      />
    </div>
  );
};

export default CategoryManagement;
