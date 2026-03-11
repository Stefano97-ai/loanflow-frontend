import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/client/loans" />;
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated()) {
    return <Navigate to={isAdmin() ? '/admin/dashboard' : '/client/loans'} />;
  }
  return children;
};