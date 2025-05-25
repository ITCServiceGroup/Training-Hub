import React, { useState, useEffect, useContext } from 'react';
import CategoryAdminGrid from './CategoryAdminGrid';
import { categoriesService } from '../../../../services/api/categories';
import BreadcrumbNav from '../BreadcrumbNav';
import { CategoryContext } from '../../../../components/layout/AdminLayout';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

const RedBoldNum = ({ children }) => (
  <span className="text-red-600 font-bold">{children}</span>
);

const CategoryManagement = ({ section, onViewStudyGuides, onBack }) => {
  const { sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    categoryId: null,
    description: ""
  });

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
      const newCategory = await categoriesService.create({
        ...formData,
        section_id: section.id
      });

      // Optimistically update the UI
      const newSectionsData = sectionsData.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            v2_categories: [...(s.v2_categories || []), newCategory]
          };
        }
        return s;
      });

      optimisticallyUpdateSectionsOrder(newSectionsData);

      // Update local state
      setCategories(prev => [...prev, newCategory]);
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const handleUpdateCategory = async (id, formData) => {
    try {
      // Use updateBasicInfo instead of update to avoid schema cache issues
      await categoriesService.updateBasicInfo(id, {
        ...formData,
        section_id: section.id
      });

      // Create an updated category object with the new data
      const updatedCategory = {
        id,
        ...formData,
        section_id: section.id
      };

      // Optimistically update the UI
      const newSectionsData = sectionsData.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            v2_categories: (s.v2_categories || []).map(c =>
              c.id === id ? { ...c, ...updatedCategory } : c
            )
          };
        }
        return s;
      });

      optimisticallyUpdateSectionsOrder(newSectionsData);

      // Update local state
      setCategories(prev => prev.map(c =>
        c.id === id ? { ...c, ...updatedCategory } : c
      ));
    } catch (err) {
      console.error('Error updating category:', err);
      // Revert to server state on error
      await loadCategories();
      throw err;
    }
  };

  const handleUpdateOrder = async (updates) => {
    try {
      // Update local order first
      const updatedCategories = [...categories];
      updates.forEach(update => {
        const category = updatedCategories.find(c => c.id === update.id);
        if (category) {
          category.display_order = update.display_order;
        }
      });
      // Sort by display_order
      updatedCategories.sort((a, b) => a.display_order - b.display_order);

      // Update local state
      setCategories(updatedCategories);

      // Update context state for sidebar
      const newSectionsData = sectionsData.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            v2_categories: updatedCategories
          };
        }
        return s;
      });
      optimisticallyUpdateSectionsOrder(newSectionsData);

      // Update the server
      await categoriesService.updateOrder(updates);
    } catch (err) {
      console.error('Error updating category order:', err);
      // Revert to server state on error
      await loadCategories();
      throw err;
    }
  };

  const getDeleteMessage = (category) => {
    const studyGuideCount = category.v2_study_guides?.length || 0;

    if (studyGuideCount === 0) {
      return "Are you sure you want to delete this empty category? This action cannot be reversed!";
    }

    return (
      <>
        Are you sure you want to delete this category? This will delete all{' '}
        <RedBoldNum>{studyGuideCount} study guides</RedBoldNum>
        {' '}in this category and cannot be reversed!
      </>
    );
  };

  const initiateDelete = (id) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setDeleteModalState({
        isOpen: true,
        categoryId: id,
        description: getDeleteMessage(category)
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // Optimistically update the UI before API call
      const newSectionsData = sectionsData.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            v2_categories: (s.v2_categories || []).filter(c => c.id !== id)
          };
        }
        return s;
      });

      optimisticallyUpdateSectionsOrder(newSectionsData);

      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));

      // Make API call
      await categoriesService.delete(id);
    } catch (err) {
      console.error('Error deleting category:', err);
      // Revert to server state on error
      await loadCategories();
      throw err;
    } finally {
      setDeleteModalState({ isOpen: false, categoryId: null, description: "" });
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
        onDelete={initiateDelete}
        onViewStudyGuides={onViewStudyGuides}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        onReorder={handleUpdateOrder}
      />
      <DeleteConfirmationDialog
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, categoryId: null, description: "" })}
        onConfirm={() => deleteModalState.categoryId && handleDeleteCategory(deleteModalState.categoryId)}
        title="Delete Category"
        description={deleteModalState.description}
      />
    </div>
  );
};

export default CategoryManagement;
