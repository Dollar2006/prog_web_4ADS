import React from 'react';
import Modal from './Modal';
import '../styles/modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="sm"
      footer={
        <div className="confirm-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-confirm-danger" 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      }
    >
      <p className="confirm-modal-message">{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
