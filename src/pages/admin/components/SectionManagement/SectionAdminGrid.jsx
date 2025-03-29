import React, { useState, useContext } from 'react'; // Import useContext
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
import { CategoryContext } from '../../../../components/layout/AdminLayout'; // Import context
import SectionCard from './SectionCard';
import SectionForm from '../CategoryTree/SectionForm';
import '../styles/grid.css';

const SectionAdminGrid = ({
  sections, // Use this prop for rendering the current grid items
  isLoading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onViewCategories,
  isCreating,
  setIsCreating,
  onReorder, // This prop likely handles the API call
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  // Consume optimistic update function from context
  const { optimisticallyUpdateSectionsOrder } = useContext(CategoryContext); 
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) { // Ensure 'over' is not null
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // 1. Calculate the new local order based on the current 'sections' prop
      const newSectionsOrder = arrayMove(sections, oldIndex, newIndex);

      // 2. Optimistically update the shared state via context
      // This will immediately update the sidebar
      optimisticallyUpdateSectionsOrder(newSectionsOrder);

      // 3. Prepare data for the backend API call based on the new order
      const reorderedDataForApi = newSectionsOrder.map(
        (section, index) => ({
          id: section.id,
          display_order: index,
        })
      );

      // 4. Call the prop function to update the backend
      try {
        await onReorder(reorderedDataForApi);
        // Backend update initiated. UI is already updated optimistically.
      } catch (error) {
        console.error("Error updating section order on backend:", error);
        // Consider reverting the optimistic update or notifying the user
      }
    }
  };

  // --- Sortable Item Component ---
  const SortableSectionItem = ({ section }) => {
    const {
      setNodeRef,
      transform,
      transition,
      isDragging, // Get dragging state from useSortable
      ...sortableProps // Capture rest of the props (attributes, listeners)
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto', // Ensure dragging item is on top
      opacity: isDragging ? 0.8 : 1, // Optional: reduce opacity when dragging
      ...cardStyles, // Combine base card styles
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item ${isDragging ? 'dragging' : ''}`} 
        onMouseEnter={() => !isDragging && setHoveredId(section.id)} 
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Outer drag handle div removed */}
        <SectionCard
          section={section}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onViewCategories={onViewCategories}
          isHovered={!isDragging && hoveredId === section.id} 
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

  // Base card styles (applied in SortableSectionItem)
  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden', // Keep overflow hidden for overall card shape
    flexShrink: 0,
    display: 'flex', // Make card itself a flex container
    flexDirection: 'column', // Stack children vertically
    height: '100%', // Ensure card tries to fill grid item height
  };

  // Drag handle styles (will be used inside SectionCard) - Keep for reference if needed
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

  // Use the 'sections' prop passed down for rendering the grid
  const displaySections = sections || []; 

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
      ) : displaySections.length === 0 ? (
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
            items={displaySections.map((s) => s.id)} // Use displaySections for SortableContext items
            strategy={rectSortingStrategy} // Use grid strategy
          >
            <div className="admin-grid"> {/* Grid container */}
              {displaySections.map((section) => ( // Use displaySections for mapping
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
