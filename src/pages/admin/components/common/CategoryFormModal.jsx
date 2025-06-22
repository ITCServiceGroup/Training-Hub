import React from 'react';
import FormModal from './FormModal';
import CategoryForm from '../CategoryTree/CategoryForm';

const CategoryFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  section = null,
  isEditing = false 
}) => {
  const handleSubmit = (formData) => {
    onSubmit(formData);
    onClose();
  };

  const title = isEditing ? 'Edit Category' : 'Create Category';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        <CategoryForm
          initialData={initialData}
          section={section}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={isEditing}
          isModal={true}
        />
      </div>
    </FormModal>
  );
};

export default CategoryFormModal;
