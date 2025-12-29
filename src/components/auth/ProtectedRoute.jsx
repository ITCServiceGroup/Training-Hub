import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';

const ProtectedRoute = ({ allowedRoles = null }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: rbacLoading, hasRole } = useRBAC();

  if (authLoading || rbacLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated but has no profile - unauthorized
  if (!profile) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user's account is active
  if (!profile.is_active) {
    return <Navigate to="/account-inactive" replace />;
  }

  // Check role-based access if specific roles are required
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
