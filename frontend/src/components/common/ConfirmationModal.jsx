// frontend/src/components/common/ConfirmationModal.jsx

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start space-x-4">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
        >
          Delete
        </Button>
        <Button
          onClick={onClose}
          className="w-full sm:w-auto bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;