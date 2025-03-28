import React, { useState } from 'react';
import { FaEdit, FaTrash, FaChevronRight } from 'react-icons/fa';
import CategoryForm from '../CategoryTree/CategoryForm';

const CategoryCard = ({ category, section, onUpdate, onDelete, onViewStudyGuides }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyles = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: '0.5rem'
  };

  const descriptionStyles = {
    color: '#6B7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    flex: 1
  };

  const actionButtonsStyles = {
    display: isHovered ? 'flex' : 'none',
    gap: '0.5rem'
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
    height: '32px'
  };

  const statsStyles = {
    display: 'flex',
    alignItems: 'center',
    color: '#6B7280',
    fontSize: '0.875rem',
    marginTop: 'auto'
  };

  const viewButtonStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '1rem',
    width: '100%'
  };

  return (
    <div
      style={cardContainerStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isEditing ? (
        <>
          <div style={headerStyles}>
            <div>
              <h3 style={titleStyles}>{category.name}</h3>
            </div>
            <div style={actionButtonsStyles}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  ...buttonBaseStyles,
                  backgroundColor: '#D97706'
                }}
                title="Edit category"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                style={{
                  ...buttonBaseStyles,
                  backgroundColor: '#DC2626'
                }}
                title="Delete category"
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <p style={descriptionStyles}>
            {category.description || 'No description available'}
          </p>
          <div style={statsStyles}>
            {category.v2_study_guides?.length || 0} Study Guides
          </div>
          <button
            style={viewButtonStyles}
            onClick={() => onViewStudyGuides(category)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            <span>View Study Guides</span>
            <FaChevronRight size={12} />
          </button>
        </>
      ) : (
        <CategoryForm
          section={section}
          initialData={category}
          onSubmit={async (formData) => {
            await onUpdate(category.id, formData);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isEditing={true}
          darkMode={true}
        />
      )}
    </div>
  );
};

export default CategoryCard;
