import React, { useState, useEffect, useContext } from 'react';
import SectionAdminGrid from './SectionAdminGrid';
import { sectionsService } from '../../../../services/api/sections';
import BreadcrumbNav from '../BreadcrumbNav';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import { CategoryContext } from '../../../../components/layout/AdminLayout';

const RedBoldNum = ({ children }) => (
  <span className="text-red-600 font-bold">{children}</span>
);

const SectionManagement = ({ onViewCategories }) => {
  const { sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    sectionId: null,
    description: ""
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const data = await sectionsService.getSectionsWithCategories();
      setSections(data);
      setError(null);
    } catch (err) {
      console.error('Error loading sections:', err);
      setError('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (formData) => {
    try {
      await sectionsService.create(formData);
      await loadSections();
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating section:', err);
      throw err;
    }
  };

  const handleUpdateSection = async (id, formData) => {
    try {
      const updatedSection = await sectionsService.update(id, formData);

      // Update local state
      setSections(prev => prev.map(s =>
        s.id === id ? { ...s, ...updatedSection } : s
      ));
    } catch (err) {
      console.error('Error updating section:', err);
      // Revert to server state on error
      await loadSections();
      throw err;
    }
  };

  const handleUpdateOrder = async (updates) => {
    try {
      // Update local order first
      const updatedSections = [...sections];
      updates.forEach(update => {
        const section = updatedSections.find(s => s.id === update.id);
        if (section) {
          section.display_order = update.display_order;
        }
      });
      // Sort by display_order
      updatedSections.sort((a, b) => a.display_order - b.display_order);

      // Update local state
      setSections(updatedSections);

      // Update context state for sidebar
      optimisticallyUpdateSectionsOrder(updatedSections);

      // Update the server
      await sectionsService.updateOrder(updates);
    } catch (err) {
      console.error('Error updating section order:', err);
      // Revert to server state on error
      await loadSections();
      throw err;
    }
  };

  const getDeleteMessage = (section) => {
    const categoryCount = section.v2_categories?.length || 0;
    const studyGuideCount = section.v2_categories?.reduce(
      (sum, cat) => sum + (cat.study_guides?.length || 0), 0
    ) || 0;

    if (categoryCount === 0) {
      return "Are you sure you want to delete this empty section? This action cannot be reversed!";
    }

    if (studyGuideCount === 0) {
      return (
        <>
          Are you sure you want to delete this section? This will delete all{' '}
          <RedBoldNum>{categoryCount} categories</RedBoldNum>
          {' '}in this section. This section currently has no study guides. This action cannot be reversed!
        </>
      );
    }

    return (
      <>
        Are you sure you want to delete this section? This will delete all{' '}
        <RedBoldNum>{categoryCount} categories</RedBoldNum>
        {' '}in this section and all{' '}
        <RedBoldNum>{studyGuideCount} study guides</RedBoldNum>
        {' '}in those categories. This action cannot be reversed!
      </>
    );
  };

  const initiateDelete = (id) => {
    const section = sectionsData.find(s => s.id === id);
    if (section) {
      setDeleteModalState({
        isOpen: true,
        sectionId: id,
        description: getDeleteMessage(section)
      });
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      // Optimistically update local state
      setSections(prev => prev.filter(s => s.id !== id));

      // Update context state for sidebar
      optimisticallyUpdateSectionsOrder(sectionsData.filter(s => s.id !== id));

      // Make API call
      await sectionsService.delete(id);
    } catch (err) {
      console.error('Error deleting section:', err);
      // Revert to server state on error
      await loadSections();
      throw err;
    } finally {
      setDeleteModalState({ isOpen: false, sectionId: null, description: "" });
    }
  };

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Sections' }
        ]}
      />
      <SectionAdminGrid
        sections={sections}
        isLoading={isLoading}
        error={error}
        onAdd={handleAddSection}
        onUpdate={handleUpdateSection}
        onDelete={initiateDelete}
        onViewCategories={onViewCategories}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        onReorder={handleUpdateOrder}
      />
      <DeleteConfirmationDialog
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, sectionId: null, description: "" })}
        onConfirm={() => deleteModalState.sectionId && handleDeleteSection(deleteModalState.sectionId)}
        title="Delete Section"
        description={deleteModalState.description}
      />
    </div>
  );
};

export default SectionManagement;
