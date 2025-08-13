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

    // Use a more reliable way to update state
    setToasts(prevToasts => {
      const newToasts = [...prevToasts, { id, message, type, duration }];
      return newToasts;
    });

    return id;
  }, []);

  // Function to remove a toast
  const removeToast = useCallback(id => {
    setToasts(prevToasts => {
      const newToasts = prevToasts.filter(toast => toast.id !== id);
      return newToasts;
    });
  }, []);


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
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 min-w-[300px] pointer-events-none">
      {toasts.length > 0 ? (
        toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))
      ) : (
        <div className="hidden">No toasts</div>
      )}
    </div>
  );
};

export default ToastContainer;
