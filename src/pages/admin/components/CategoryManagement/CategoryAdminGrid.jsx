import React, { useState } from 'react';
import { FaPlus, FaLayerGroup, FaBars } from 'react-icons/fa';
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
import CategoryCard from './CategoryCard';
import CategoryForm from '../CategoryTree/CategoryForm';
import '../styles/grid.css';

const CategoryAdminGrid = ({
  categories,
  section,
  isLoading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onViewStudyGuides,
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
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return; // Should not happen

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

      // Update the parent component with the new order, including updated display_order
      onReorder(
        reorderedCategories.map((category, index) => ({
          id: category.id,
          display_order: index,
        }))
      );
    }
  };

  // --- Sortable Item Component ---
  const SortableCategoryItem = ({ category }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto',
      opacity: isDragging ? 0.8 : 1,
      ...cardStyles,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item ${isDragging ? 'dragging' : ''}`}
        onMouseEnter={() => !isDragging && setHoveredId(category.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Apply listeners to the drag handle */}
        <div {...attributes} {...listeners} style={dragHandleStyles}>
          <FaBars style={{ margin: '8px auto', display: 'block' }} />
        </div>
        <CategoryCard
          category={category}
          section={section} // Pass section prop if needed by CategoryCard
          onUpdate={onUpdate}
          onDelete={onDelete}
          onViewStudyGuides={onViewStudyGuides}
          isHovered={!isDragging && hoveredId === category.id}
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

  const sectionIndicatorStyles = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#F3F4F6',
    borderRadius: '0.375rem',
    border: '1px solid #E5E7EB'
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
    flexShrink: 0, // Prevent shrinking
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
        <div>
          <h2 style={titleStyles}>Manage Categories</h2>
          {section && (
            <div style={sectionIndicatorStyles}>
              <FaLayerGroup style={{ marginRight: '0.5rem', fontSize: '1rem' }} />
              <span>Section: {section.name}</span>
            </div>
          )}
        </div>
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
            <span>Add Category</span>
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
          <span>Loading categories...</span>
        </div>
      ) : isCreating ? (
        <CategoryForm
          section={section}
          onSubmit={onAdd}
          onCancel={() => setIsCreating(false)}
          darkMode={true}
        />
      ) : categories.length === 0 ? (
        <div style={emptyStyles}>
          <p>No categories available. Click "Add Category" to create one.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)} // Pass array of IDs
            strategy={rectSortingStrategy} // Use grid strategy
          >
            <div className="admin-grid"> {/* Grid container */}
              {categories.map((category) => (
                <SortableCategoryItem key={category.id} category={category} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default CategoryAdminGrid;
