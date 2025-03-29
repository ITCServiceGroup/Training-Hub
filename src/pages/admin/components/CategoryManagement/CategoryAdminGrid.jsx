import React, { useState, useContext } from 'react'; // Import useContext
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
import { CategoryContext } from '../../../../components/layout/AdminLayout'; // Import context
import CategoryCard from './CategoryCard';
import CategoryForm from '../CategoryTree/CategoryForm';
import '../styles/grid.css';

const CategoryAdminGrid = ({
  categories, // Use this prop for rendering the current grid items
  section, // Need the current section to update the correct part of the context state
  isLoading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onViewStudyGuides,
  isCreating,
  setIsCreating,
  onReorder, // This prop likely handles the API call for categories
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  // Consume sectionsData and optimistic update function from context
  const { sectionsData, optimisticallyUpdateSectionsOrder } = useContext(CategoryContext); 
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id && section) { // Ensure 'over' and 'section' are not null
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // 1. Calculate the new local order for categories within this section
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

      // 2. Create the *entire* new sectionsData structure for optimistic update
      const newSectionsDataOrder = sectionsData.map(s => {
        if (s.id === section.id) {
          // Update the categories for the current section
          return { ...s, v2_categories: reorderedCategories };
        }
        return s; // Keep other sections as they are
      });

      // 3. Optimistically update the shared state via context
      optimisticallyUpdateSectionsOrder(newSectionsDataOrder);

      // 4. Prepare data for the backend API call (only the reordered categories)
      const reorderedDataForApi = reorderedCategories.map(
        (category, index) => ({
          id: category.id,
          display_order: index,
        })
      );

      // 5. Call the prop function to update the backend for categories
      try {
        await onReorder(reorderedDataForApi);
        // Backend update initiated. UI is already updated optimistically.
      } catch (error) {
        console.error("Error updating category order on backend:", error);
        // Consider reverting or refreshing if backend fails
      }
    }
  };

  // --- Sortable Item Component ---
  const SortableCategoryItem = ({ category }) => {
    const {
      setNodeRef,
      transform,
      transition,
      isDragging,
      ...sortableProps // Capture rest of the props (attributes, listeners)
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto',
      opacity: isDragging ? 0.8 : 1,
      ...cardStyles, // Combine base card styles
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item ${isDragging ? 'dragging' : ''}`}
        onMouseEnter={() => !isDragging && setHoveredId(category.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Outer drag handle div removed */}
        <CategoryCard
          category={category}
          section={section} 
          onUpdate={onUpdate}
          onDelete={onDelete}
          onViewStudyGuides={onViewStudyGuides}
          isHovered={!isDragging && hoveredId === category.id}
          sortableProps={sortableProps} // Pass down sortable props
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

  // Base card styles (applied in SortableCategoryItem)
  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden', 
    flexShrink: 0, 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%', 
  };

  // Drag handle styles (will be used inside CategoryCard) - Keep for reference if needed
  // const dragHandleStyles = {
  //   color: '#9CA3AF',
  //   cursor: 'grab',
  //   padding: '4px',
  //   borderRadius: '4px',
  //   backgroundColor: 'transparent',
  //   transition: 'background-color 0.2s'
  // };

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

  // Use the 'categories' prop passed down for rendering the grid
  const displayCategories = categories || [];

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
      ) : displayCategories.length === 0 ? (
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
            items={displayCategories.map((c) => c.id)} // Use displayCategories for SortableContext items
            strategy={rectSortingStrategy} // Use grid strategy
          >
            <div className="admin-grid"> {/* Grid container */}
              {displayCategories.map((category) => ( // Use displayCategories for mapping
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
