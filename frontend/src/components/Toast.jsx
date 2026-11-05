import React from 'react';

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`} id={`toast-${t.id}`}>
          <span className="toast-icon">
            {t.type === 'success' && '✓'}
            {t.type === 'error' && '✕'}
            {t.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{t.message}</span>
          <button 
            className="modal-close-btn" 
            style={{ width: '20px', height: '20px', fontSize: '1rem', marginLeft: 'auto' }}
            onClick={() => onDismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
