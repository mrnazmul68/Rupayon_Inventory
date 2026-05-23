import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm', message, confirmText = 'Delete', confirmVariant = 'danger', isLoading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
