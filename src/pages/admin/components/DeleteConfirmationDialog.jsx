import React from 'react';
import { Dialog } from '@headlessui/react';

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Dialog.Panel className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-[90%]">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-300 mb-5">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-2 px-4 bg-red-600 border border-transparent rounded-md text-sm text-white cursor-pointer hover:bg-red-700 hover:-translate-y-0.5 transition-all"
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
