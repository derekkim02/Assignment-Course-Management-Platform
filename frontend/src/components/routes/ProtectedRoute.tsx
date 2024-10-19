import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  element: JSX.Element;
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, role }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
};

export default ProtectedRoute;
