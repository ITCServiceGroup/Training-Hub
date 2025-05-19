import React, { useState, useCallback } from 'react';
import Toast from './Toast';

// Create a context for the toast
import { createContext, useContext, useEffect } from 'react';

const ToastContext = createContext();

// Custom hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a toast
  const showToast = useCallback((message, type = 'success', duration = 2000) => {
    const id = Date.now().toString();
    console.log('Showing toast:', { id, message, type, duration });
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  }, []);

  // Function to remove a toast
  const removeToast = useCallback(id => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Show a test toast on mount (for debugging)
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('Toast system initialized', 'info', 3000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Provide the toast functions to children
  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[300px]">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
