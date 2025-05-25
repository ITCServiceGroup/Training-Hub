import React, { useState, useContext } from 'react'; // Import useContext
import { useTheme } from '../../../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 shadow dark:shadow-md overflow-hidden flex-shrink-0 flex flex-col h-full ${isDragging ? 'dragging' : ''}`}
        onMouseEnter={() => !isDragging && setHoveredId(section.id)}
        onMouseLeave={() => {
          // Don't clear hover state if the section is being edited
          const sectionCard = document.querySelector(`[data-section-id="${section.id}"] .section-edit-form`);
          if (!sectionCard) {
            setHoveredId(null);
          }
        }}
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


  // Using Tailwind classes instead of inline styles

  // Use the 'sections' prop passed down for rendering the grid
  const displaySections = sections || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Sections</h2>
        {!isCreating && (
          <button
            className="bg-primary hover:bg-primary-dark text-white border-none py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <FaPlus />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-12 text-gray-500 dark:text-gray-300">
          <div className="w-8 h-8 rounded-full border-3 border-gray-200 dark:border-gray-600 border-t-primary animate-spin mr-3"></div>
          <span>Loading sections...</span>
        </div>
      ) : isCreating ? (
        <SectionForm
          onSubmit={onAdd}
          onCancel={() => setIsCreating(false)}
          darkMode={isDark}
        />
      ) : displaySections.length === 0 ? (
        <div className="text-center p-12 text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg">
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
