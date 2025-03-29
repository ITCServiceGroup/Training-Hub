import React from 'react';
import { Dialog } from '@headlessui/react';

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '12px'
    },
    modalText: {
      fontSize: '14px',
      color: '#4B5563',
      marginBottom: '20px'
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    modalCancelButton: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer'
    },
    modalDeleteButton: {
      padding: '8px 16px',
      backgroundColor: '#DC2626',
      border: '1px solid transparent',
      borderRadius: '6px',
      fontSize: '14px',
      color: 'white',
      cursor: 'pointer'
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div style={styles.modalOverlay}>
        <Dialog.Panel style={styles.modalContent}>
          <Dialog.Title style={styles.modalTitle}>
            {title}
          </Dialog.Title>
          <Dialog.Description style={styles.modalText}>
            {description}
          </Dialog.Description>
          <div style={styles.modalButtons}>
            <button
              type="button"
              onClick={onClose}
              style={styles.modalCancelButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.borderColor = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={styles.modalDeleteButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B91C1C';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
