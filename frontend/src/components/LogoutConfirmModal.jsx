import { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
import PropTypes from 'prop-types';
import './LogoutConfirmModal.css';

function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <div className="logout-modal-icon"><LogOut size={32} /></div>
          <h2>Confirmar Saída</h2>
          <button
            className="logout-modal-close"
            onClick={onCancel}
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="logout-modal-body">
          <p>Você tem certeza que deseja sair da aplicação?</p>
          <p className="logout-modal-subtitle">
            Seus dados serão sincronizados e você precisará fazer login novamente.
          </p>
        </div>

        <div className="logout-modal-footer">
          <button
            className="logout-modal-btn logout-modal-btn-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="logout-modal-btn logout-modal-btn-confirm"
            onClick={onConfirm}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

LogoutConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default LogoutConfirmModal;
