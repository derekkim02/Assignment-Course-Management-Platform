import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  element: JSX.Element;
  checkAccess: () => boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, checkAccess, }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!checkAccess()) {
    return <Navigate to='/page-not-found' />;
  }

  return element;
};

export default ProtectedRoute;
