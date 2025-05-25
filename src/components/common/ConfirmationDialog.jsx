import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';
import classNames from 'classnames'; // Import classNames

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'primary' // 'primary', 'danger'
}) => {
  const confirmButtonClasses = classNames(
    "py-2 px-4 border border-transparent rounded-md text-sm text-white cursor-pointer hover:-translate-y-0.5 transition-all",
    {
      'bg-red-600 hover:bg-red-700': confirmButtonVariant === 'danger',
      'bg-primary hover:bg-primary-dark': confirmButtonVariant === 'primary'
    }
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600 dark:text-slate-300 mb-5">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            {cancelButtonText && (
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {cancelButtonText}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className={confirmButtonClasses}
            >
              {confirmButtonText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  confirmButtonVariant: PropTypes.oneOf(['primary', 'danger']),
};

export default ConfirmationDialog;
