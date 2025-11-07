import React, { useEffect } from 'react';

const variants = {
  success: 'border-green-300 text-green-700 bg-green-50',
  error: 'border-red-300 text-red-700 bg-red-50',
  info: 'border-blue-300 text-blue-700 bg-blue-50',
  warning: 'border-amber-300 text-amber-700 bg-amber-50',
};

const Toast = ({ open, type = 'info', message = '', onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open || !message) return null;

  return (
    <div className="fixed top-14 left-0 right-0 flex justify-center z-[999] pointer-events-none">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg border text-center min-w-[280px] max-w-sm pointer-events-auto ${variants[type] || variants.info} animate-popIn`}
      >
        <p className="text-base font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
