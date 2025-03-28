import React, { useState, useEffect } from 'react';
import SectionAdminGrid from './SectionAdminGrid';
import { sectionsService } from '../../../../services/api/sections';
import BreadcrumbNav from '../BreadcrumbNav';

const SectionManagement = ({ onViewCategories }) => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

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
      await sectionsService.update(id, formData);
      await loadSections();
    } catch (err) {
      console.error('Error updating section:', err);
      throw err;
    }
  };

  const handleUpdateOrder = async (updates) => {
    // First update the local state optimistically
    const newSections = [...sections];
    updates.forEach(update => {
      const section = newSections.find(s => s.id === update.id);
      if (section) {
        section.display_order = update.display_order;
      }
    });
    // Sort the sections by display_order
    newSections.sort((a, b) => a.display_order - b.display_order);
    setSections(newSections);

    try {
      // Then update the server
      await sectionsService.updateOrder(updates);
    } catch (err) {
      console.error('Error updating section order:', err);
      // On error, reload the sections to get the correct order
      await loadSections();
      throw err;
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section and all its categories?')) {
      return;
    }
    try {
      await sectionsService.delete(id);
      await loadSections();
    } catch (err) {
      console.error('Error deleting section:', err);
      throw err;
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
        onDelete={handleDeleteSection}
        onViewCategories={onViewCategories}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        onReorder={handleUpdateOrder}
      />
    </div>
  );
};

export default SectionManagement;
