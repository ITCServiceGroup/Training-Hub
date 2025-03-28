import React, { useState } from 'react';
import { FaPlus, FaBars } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy, // Using rectSortingStrategy for grid layout
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionCard from './SectionCard';
import SectionForm from '../CategoryTree/SectionForm';
import '../styles/grid.css';

const SectionAdminGrid = ({
  sections,
  isLoading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onViewCategories,
  isCreating,
  setIsCreating,
  onReorder,
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return; // Should not happen

      const reorderedSections = arrayMove(sections, oldIndex, newIndex);

      // Update the parent component with the new order, including updated display_order
      onReorder(
        reorderedSections.map((section, index) => ({
          id: section.id,
          display_order: index,
        }))
      );
    }
  };

  // --- Sortable Item Component ---
  const SortableSectionItem = ({ section }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging, // Get dragging state from useSortable
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto', // Ensure dragging item is on top
      opacity: isDragging ? 0.8 : 1, // Optional: reduce opacity when dragging
      // Combine cardStyles with dynamic styles
      ...cardStyles,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item ${isDragging ? 'dragging' : ''}`} // Keep class for potential specific dragging styles
        onMouseEnter={() => !isDragging && setHoveredId(section.id)} // Don't show hover effects while dragging
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Apply listeners to the drag handle */}
        <div {...attributes} {...listeners} style={dragHandleStyles}>
          <FaBars style={{ margin: '8px auto', display: 'block' }} />
        </div>
        <SectionCard
          section={section}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onViewCategories={onViewCategories}
          isHovered={!isDragging && hoveredId === section.id} // Don't show hover effects while dragging
        />
      </div>
    );
  };
  // --- End Sortable Item Component ---


  const containerStyles = {
    padding: '1.5rem'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1F2937'
  };

  const addButtonStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    // Ensure items don't shrink below their content size
    flexShrink: 0,
  };

  const dragHandleStyles = {
    color: '#9CA3AF',
    cursor: 'grab',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    color: '#6B7280'
  };

  const spinnerStyles = {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    animation: 'spin 1s linear infinite',
    marginRight: '0.75rem'
  };

  const errorStyles = {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem'
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: '3rem',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderRadius: '0.5rem'
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Manage Sections</h2>
        {!isCreating && (
          <button
            style={addButtonStyles}
            onClick={() => setIsCreating(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            <FaPlus />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {error && (
        <div style={errorStyles}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <span>Loading sections...</span>
        </div>
      ) : isCreating ? (
        <SectionForm
          onSubmit={onAdd}
          onCancel={() => setIsCreating(false)}
          darkMode={true}
        />
      ) : sections.length === 0 ? (
        <div style={emptyStyles}>
          <p>No sections available. Click "Add Section" to create one.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)} // Pass array of IDs
            strategy={rectSortingStrategy} // Use grid strategy
          >
            <div className="admin-grid"> {/* Grid container */}
              {sections.map((section) => (
                <SortableSectionItem key={section.id} section={section} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default SectionAdminGrid;
