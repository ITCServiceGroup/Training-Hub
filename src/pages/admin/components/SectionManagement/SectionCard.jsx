import React, { useState } from 'react';
import { FaEdit, FaTrash, FaChevronRight, FaBars } from 'react-icons/fa'; // Added FaBars
import SectionForm from '../CategoryTree/SectionForm';

// Accept sortableProps
const SectionCard = ({ section, onUpdate, onDelete, onViewCategories, isHovered, sortableProps }) => {
  const [isEditing, setIsEditing] = useState(false);
  // isHovered state is now controlled by parent via prop

  // --- Event Handlers ---
  const handleCardClick = (e) => {
    // Prevent click if editing or if the click is on a button/handle
    if (isEditing || e.target.closest('button') || e.target.closest('[data-dnd-handle]')) {
      return;
    }
    onViewCategories(section);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Using Tailwind classes instead of inline styles

  return (
    <div className="p-0 flex flex-col h-full bg-white cursor-pointer">
      {!isEditing ? (
        <>
          {/* Card Header */}
          <div className="flex justify-between items-center py-3 px-6 border-b border-gray-200 flex-shrink-0">
             <div className="flex items-center gap-3 flex-grow min-w-0">
                {/* Drag Handle */}
                <span
                  {...sortableProps.attributes}
                  {...sortableProps.listeners}
                  className="text-gray-400 cursor-grab p-1 rounded flex items-center justify-center"
                  onClick={stopPropagation} // Prevent card click
                  data-dnd-handle // Add attribute for click detection
                >
                  <FaBars />
                </span>
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 m-0 whitespace-nowrap overflow-hidden text-ellipsis" title={section.name}>{section.name}</h3>
             </div>
            {/* Action Buttons */}
            <div className={`${isHovered ? 'flex' : 'hidden'} gap-2 flex-shrink-0 ml-2`}>
              <button
                onClick={(e) => { stopPropagation(e); setIsEditing(true); }}
                className="p-2 border-none rounded-md cursor-pointer transition-colors text-white flex items-center justify-center w-8 h-8 bg-amber-600 hover:bg-amber-700"
                title="Edit section"
              >
                <FaEdit />
              </button>
              <button
                onClick={(e) => { stopPropagation(e); onDelete(section.id); }}
                className="p-2 border-none rounded-md cursor-pointer transition-colors text-white flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700"
                title="Delete section"
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
            <p className="text-gray-500 text-sm mb-4 flex-grow">
              {section.description || 'No description available'}
            </p>
            <div className="flex items-center text-gray-500 text-sm mt-2 flex-shrink-0">
              {/* Display category count for SectionCard */}
              {section.v2_categories?.length || 0} Categories
            </div>
          </div>

          {/* Footer Button Area */}
           <div className="px-6 pb-6 mt-auto flex-shrink-0">
             <button
               className="bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-4 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors w-full text-sm"
               onClick={(e) => { stopPropagation(e); onViewCategories(section); }}
             >
               <span>View Categories</span>
               <FaChevronRight size={12} />
             </button>
           </div>
        </>
      ) : (
        // Keep Edit Form padding consistent
        <div className="p-6">
          <SectionForm
            initialData={section}
            onSubmit={async (formData) => {
              await onUpdate(section.id, formData);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
            darkMode={true}
          />
        </div>
      )}
    </div>
  );
};

export default SectionCard;
