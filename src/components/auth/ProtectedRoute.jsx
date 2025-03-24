import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Debug helper function
const logRoute = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[ROUTE ${timestamp}] ${message}`);
  if (data) {
    console.log(`[ROUTE DATA]`, data);
  }
};

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user, session, error } = useAuth();

  // Log when the protected route is rendered
  useEffect(() => {
    logRoute('ProtectedRoute component rendered');
    logRoute('Current auth state', {
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasSession: !!session,
      error
    });
  }, []);

  // Log changes to auth state
  useEffect(() => {
    logRoute('Auth state changed in ProtectedRoute', {
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasSession: !!session,
      error
    });
  }, [isAuthenticated, loading, user, session, error]);

  if (loading) {
    // Display loading indicator while auth state is being determined
    logRoute('Auth state is loading, showing loading screen');
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    logRoute('User is not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render child routes
  logRoute('User is authenticated, rendering child routes', { user });
  return <Outlet />;
};

export default ProtectedRoute;
