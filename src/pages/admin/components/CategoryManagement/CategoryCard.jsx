import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { FaEdit, FaTrash, FaChevronRight, FaBars } from 'react-icons/fa'; // Added FaBars
import { getIconByName } from '../../../../utils/iconMappings';
import CategoryFormModal from '../common/CategoryFormModal';

// Accept sortableProps
const CategoryCard = ({ category, section, onUpdate, onDelete, onViewStudyGuides, isHovered, sortableProps }) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  // isHovered state is now controlled by parent via prop, but edit form visibility is controlled locally

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];

  // Get icon for the category
  const getCategoryIcon = (category) => {
    // If the category has a custom icon set, use it
    if (category.icon) {
      const { component: IconComponent } = getIconByName(category.icon);
      return <IconComponent size={20} color="white" />;
    }

    // Fallback to name-based detection for backward compatibility
    const name = category.name.toLowerCase();
    let iconName = 'Book';

    if (name.includes('network')) iconName = 'Network';
    else if (name.includes('install')) iconName = 'Download';
    else if (name.includes('service')) iconName = 'Wrench';
    else if (name.includes('troubleshoot')) iconName = 'Search';
    else if (name.includes('security')) iconName = 'Lock';
    else if (name.includes('hardware')) iconName = 'Laptop';
    else if (name.includes('software')) iconName = 'Chart';

    const { component: IconComponent } = getIconByName(iconName);
    return <IconComponent size={20} color="white" />;
  };

  // --- Event Handlers ---
  const handleCardClick = (e) => {
    // Prevent click if editing or if the click is on a button/handle
    if (isEditing || e.target.closest('button') || e.target.closest('[data-dnd-handle]')) {
      return;
    }
    onViewStudyGuides(category);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Using Tailwind classes instead of inline styles

  // Determine the study guide count using the CORRECT key
  const studyGuideCount = category.v2_study_guides?.length || 0;

  // console.log removed

  return (
    <div className="p-0 flex flex-col h-full bg-white dark:bg-slate-700 cursor-pointer" data-category-id={category.id}>
      {/* Card Header */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-gray-200 dark:border-slate-600 flex-shrink-0">
         <div className="flex items-center gap-3 flex-grow min-w-0">
            {/* Drag Handle */}
            <span
              {...sortableProps.attributes}
              {...sortableProps.listeners}
              className="text-gray-400 dark:text-gray-300 cursor-grab p-1 rounded flex items-center justify-center"
              onClick={stopPropagation} // Prevent card click
              data-dnd-handle // Add attribute for click detection
            >
              <FaBars />
            </span>
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: currentSecondaryColor }}
            >
              {getCategoryIcon(category)}
            </div>
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis" title={category.name}>{category.name}</h3>
         </div>
        {/* Action Buttons */}
        <div className={`${isHovered ? 'flex' : 'hidden'} gap-2 flex-shrink-0 ml-2`}>
          <button
            onClick={(e) => { stopPropagation(e); setIsEditing(true); }}
            className="p-2 border-none rounded-md cursor-pointer transition-colors text-white flex items-center justify-center w-8 h-8 bg-amber-600 hover:bg-amber-700"
            title="Edit category"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => { stopPropagation(e); onDelete(category.id); }}
            className="p-2 border-none rounded-md cursor-pointer transition-colors text-white flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700"
            title="Delete category"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Clickable Content Area */}
      <div
        className="p-4 px-6 flex-1 flex flex-col min-h-0"
        onClick={handleCardClick}
      >
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-4 flex-grow whitespace-pre-wrap">
          {category.description || 'No description available'}
        </p>
        <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm mt-2 flex-shrink-0">
          {studyGuideCount} Study Guides
        </div>
      </div>

      {/* Footer Button Area */}
       <div className="px-6 pb-6 mt-auto flex-shrink-0">
         <button
           className="bg-primary hover:bg-primary-dark text-white border-none py-2 px-4 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors w-full text-sm"
           onClick={(e) => { stopPropagation(e); onViewStudyGuides(category); }}
         >
           <span>View Study Guides</span>
           <FaChevronRight size={12} />
         </button>
       </div>

      {/* Category Edit Modal */}
      <CategoryFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={async (formData) => {
          await onUpdate(category.id, formData);
          setIsEditing(false);
        }}
        initialData={category}
        section={section}
        isEditing={true}
      />
    </div>
  );
};

export default CategoryCard;
