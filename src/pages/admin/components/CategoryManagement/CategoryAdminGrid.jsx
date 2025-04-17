import React, { useState, useContext } from 'react'; // Import useContext
import { useTheme } from '../../../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-grid-item bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 shadow dark:shadow-md overflow-hidden flex-shrink-0 flex flex-col h-full ${isDragging ? 'dragging' : ''}`}
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

  // Using Tailwind classes instead of inline styles

  // Use the 'categories' prop passed down for rendering the grid
  const displayCategories = categories || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Categories</h2>
          {section && (
            <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-white mt-3 py-2 px-3 bg-gray-100 dark:bg-slate-700 rounded-md border border-gray-200 dark:border-slate-600">
              <FaLayerGroup className="mr-2 text-base" />
              <span>Section: {section.name}</span>
            </div>
          )}
        </div>
        {!isCreating && (
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white border-none py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <FaPlus />
            <span>Add Category</span>
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
          <div className="w-8 h-8 rounded-full border-3 border-gray-200 dark:border-gray-600 border-t-teal-600 animate-spin mr-3"></div>
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
        <div className="text-center p-12 text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg">
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
