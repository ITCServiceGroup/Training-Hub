import React, { useState, useEffect } from 'react';
import CategoryAdminGrid from './CategoryAdminGrid';
import { categoriesService } from '../../../../services/api/categories';
import { questionsService } from '../../../../services/api/questions';
import BreadcrumbNav from '../BreadcrumbNav';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import QuestionMigrationDialog from '../QuestionMigrationDialog';
import { useNetworkStatus } from '../../../../contexts/NetworkContext';
import { useCatalog } from '../../../../hooks/useCatalog';
import { useContentVisibility } from '../../../../hooks/useContentVisibility';

const RedBoldNum = ({ children }) => (
  <span className="text-red-600 font-bold">{children}</span>
);

const CategoryManagement = ({ section, onViewStudyGuides, onBack }) => {
  const { getCategoriesBySection, refresh } = useCatalog({ mode: 'admin' });
  const { getNewContentDefaults } = useContentVisibility();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { isOnline, reconnectCount } = useNetworkStatus();
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    categoryId: null,
    description: "",
    canDelete: true
  });
  const [migrationModalState, setMigrationModalState] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
    questions: []
  });

  useEffect(() => {
    if (section) {
      setIsLoading(true);
      // derive from catalog (works offline)
      const cats = getCategoriesBySection(section.id) || [];
      setCategories(cats);
      setError(null);
      setIsLoading(false);
    }
  }, [section, getCategoriesBySection]);

  // Hook handles reconnect refresh globally; keep UI soft if offline
  useEffect(() => {
    if (!isOnline) setError(null);
  }, [isOnline]);

  // Define local optimistic update function for categories
  const optimisticallyUpdateCategoriesOrder = (newCategoriesOrder) => {
    setCategories(newCategoriesOrder);
  };

  const handleAddCategory = async (formData) => {
    try {
      // Get RBAC defaults for new content
      const rbacDefaults = getNewContentDefaults();

      const newCategory = await categoriesService.create({
        ...formData,
        ...rbacDefaults,
        section_id: section.id
      });

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
      await categoriesService.updateBasicInfo(id, { ...formData, section_id: section.id });
      await refresh();
      setCategories(getCategoriesBySection(section.id));
    } catch (err) {
      console.error('Error updating category:', err);
      await refresh();
      throw err;
    }
  };

  const handleUpdateOrder = async (updates) => {
    try {
      await categoriesService.updateOrder(updates);
      await refresh();
      setCategories(getCategoriesBySection(section.id));
    } catch (err) {
      console.error('Error updating category order:', err);
      await refresh();
      throw err;
    }
  };

  const getDeleteMessage = async (category) => {
    const studyGuideCount = category.study_guides?.length || 0;

    // Get quiz question count for this category
    let questionCount = 0;
    try {
      questionCount = await categoriesService.getQuestionCount(category.id);
    } catch (error) {
      console.error('Error getting question count:', error);
    }

    if (studyGuideCount === 0 && questionCount === 0) {
      return "Are you sure you want to delete this empty category? This action cannot be reversed!";
    }

    if (questionCount > 0) {
      return (
        <>
          Cannot delete this category! It contains{' '}
          <RedBoldNum>{questionCount} quiz question(s)</RedBoldNum>
          {studyGuideCount > 0 && (
            <>
              {' '}and{' '}
              <RedBoldNum>{studyGuideCount} study guide(s)</RedBoldNum>
            </>
          )}
          . Please use the "Migrate Questions" button to move the questions to another category first.
        </>
      );
    }

    return (
      <>
        Are you sure you want to delete this category? This will delete all{' '}
        <RedBoldNum>{studyGuideCount} study guides</RedBoldNum>
        {' '}in this category and cannot be reversed!
      </>
    );
  };

  const initiateMigration = async (id) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      try {
        const questions = await questionsService.getByCategory(id);
        setMigrationModalState({
          isOpen: true,
          categoryId: id,
          categoryName: category.name,
          questions: questions
        });
      } catch (error) {
        console.error('Error loading questions for migration:', error);
      }
    }
  };

  const initiateDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      const description = await getDeleteMessage(category);
      const questionCount = await categoriesService.getQuestionCount(id);
      setDeleteModalState({
        isOpen: true,
        categoryId: id,
        description: description,
        canDelete: questionCount === 0
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // Check if category has quiz questions before attempting deletion
      const category = categories.find(c => c.id === id);
      if (category) {
        const questionCount = await categoriesService.getQuestionCount(id);
        if (questionCount > 0) {
          // Don't proceed with deletion, just close the modal
          // The error message was already shown in the modal
          setDeleteModalState({ isOpen: false, categoryId: null, description: "" });
          return;
        }
      }

      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));

      // Make API call
      await categoriesService.delete(id);
      await refresh();
      setCategories(getCategoriesBySection(section.id));
    } catch (err) {
      console.error('Error deleting category:', err);
      await refresh();
      throw err;
    } finally {
      setDeleteModalState({ isOpen: false, categoryId: null, description: "", canDelete: true });
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
        optimisticallyUpdateCategoriesOrder={optimisticallyUpdateCategoriesOrder}
      />
      <DeleteConfirmationDialog
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, categoryId: null, description: "", canDelete: true })}
        onConfirm={() => deleteModalState.categoryId && handleDeleteCategory(deleteModalState.categoryId)}
        onMigrate={() => {
          setDeleteModalState({ isOpen: false, categoryId: null, description: "", canDelete: true });
          initiateMigration(deleteModalState.categoryId);
        }}
        title="Delete Category"
        description={deleteModalState.description}
        canDelete={deleteModalState.canDelete}
      />

      <QuestionMigrationDialog
        isOpen={migrationModalState.isOpen}
        onClose={() => setMigrationModalState({ isOpen: false, categoryId: null, categoryName: "", questions: [] })}
        onComplete={() => {
          setMigrationModalState({ isOpen: false, categoryId: null, categoryName: "", questions: [] });
          // Reload categories to refresh the data
          loadCategories();
        }}
        categoryId={migrationModalState.categoryId}
        categoryName={migrationModalState.categoryName}
        questions={migrationModalState.questions}
      />
    </div>
  );
};

export default CategoryManagement;
