import React from 'react';
import FormModal from './FormModal';
import SectionForm from '../CategoryTree/SectionForm';

const SectionFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}) => {
  const handleSubmit = (formData) => {
    onSubmit(formData);
    onClose();
  };

  const title = isEditing ? 'Edit Section' : 'Create Section';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        <SectionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={isEditing}
          isModal={true}
        />
      </div>
    </FormModal>
  );
};

export default SectionFormModal;
