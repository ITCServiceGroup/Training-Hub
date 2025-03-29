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

  // --- Styles ---
  const cardContainerStyles = {
    padding: '0', 
    display: 'flex',
    flexDirection: 'column',
    height: '100%', 
    backgroundColor: 'white', 
    cursor: 'pointer', 
  };

  const cardHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: '0.75rem 1.5rem', 
    borderBottom: '1px solid #E5E7EB', 
    flexShrink: 0, 
  };
  
  const titleAndHandleStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem', 
    flexGrow: 1, 
    minWidth: 0, 
  };

  const titleStyles = {
    fontSize: '1.15rem', 
    fontWeight: 'bold',
    color: '#1F2937',
    margin: 0, 
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', 
  };

  const dragHandleStyles = {
    color: '#9CA3AF',
    cursor: 'grab',
    padding: '4px', 
    borderRadius: '4px',
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center',
  };

  const actionButtonsStyles = {
    display: isHovered ? 'flex' : 'none', // Use isHovered prop
    gap: '0.5rem',
    flexShrink: 0, 
    marginLeft: '0.5rem', 
  };

  const buttonBaseStyles = {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  };

  const contentAreaStyles = {
    padding: '1rem 1.5rem', 
    flex: '1 1 auto', 
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, 
  };

  const descriptionStyles = {
    color: '#6B7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    flexGrow: 1, 
  };

  const statsStyles = {
    display: 'flex',
    alignItems: 'center',
    color: '#6B7280',
    fontSize: '0.875rem',
    marginTop: '0.5rem', 
    flexShrink: 0, 
  };

  const viewButtonContainerStyles = {
    padding: '0 1.5rem 1.5rem 1.5rem', 
    marginTop: 'auto', 
    flexShrink: 0,
  };

  const viewButtonStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', 
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%', 
    fontSize: '0.875rem', 
  };

  return (
    <div
      style={cardContainerStyles}
    >
      {!isEditing ? (
        <>
          {/* Card Header */}
          <div style={cardHeaderStyles}>
             <div style={titleAndHandleStyles}>
                {/* Drag Handle */}
                <span 
                  {...sortableProps.attributes} 
                  {...sortableProps.listeners} 
                  style={dragHandleStyles}
                  onClick={stopPropagation} // Prevent card click
                  data-dnd-handle // Add attribute for click detection
                >
                  <FaBars />
                </span>
                {/* Title */}
                <h3 style={titleStyles} title={section.name}>{section.name}</h3>
             </div>
            {/* Action Buttons */}
            <div style={actionButtonsStyles}>
              <button
                onClick={(e) => { stopPropagation(e); setIsEditing(true); }}
                style={{ ...buttonBaseStyles, backgroundColor: '#D97706' }}
                title="Edit section"
              >
                <FaEdit />
              </button>
              <button
                onClick={(e) => { stopPropagation(e); onDelete(section.id); }}
                style={{ ...buttonBaseStyles, backgroundColor: '#DC2626' }}
                title="Delete section"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {/* Clickable Content Area - Hover handlers removed */}
          <div 
            style={contentAreaStyles} 
            onClick={handleCardClick}
          >
            <p style={descriptionStyles}>
              {section.description || 'No description available'}
            </p>
            <div style={statsStyles}>
              {/* Display category count for SectionCard */}
              {section.v2_categories?.length || 0} Categories 
            </div>
          </div>

          {/* Footer Button Area */}
           <div style={viewButtonContainerStyles}>
             <button
               style={viewButtonStyles}
               onClick={(e) => { stopPropagation(e); onViewCategories(section); }} // Ensure stopPropagation
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3B82F6'; }}
             >
               <span>View Categories</span>
               <FaChevronRight size={12} />
             </button>
           </div>
        </>
      ) : (
        // Keep Edit Form padding consistent
        <div style={{ padding: '1.5rem' }}> 
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
