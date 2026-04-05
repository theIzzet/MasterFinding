import React from 'react';
import '../../css/ConfirmModal.css';
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel-btn" onClick={onClose}>
                        İptal
                    </button>
                    <button className="modal-btn confirm-btn" onClick={onConfirm}>
                        Onayla ve Sil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;