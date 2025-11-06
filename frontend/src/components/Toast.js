import React, { useEffect } from 'react';

const variants = {
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-primary/10 text-primary border-primary/20',
  warning: 'bg-amber-100 text-amber-800 border-amber-200'
};

const Toast = ({ open, type = 'info', message = '', onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open || !message) return null;
  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div className={`px-4 py-3 rounded-md border shadow-sm ${variants[type] || variants.info}`}>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;


