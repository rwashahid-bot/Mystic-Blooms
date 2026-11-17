import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader/Loader';

/** Customer-only routes (My Account). */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

/** Admin / staff routes, optionally restricted to a permission key. */
export const AdminRoute = ({ children, permission }) => {
  const { user, loading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();
  if (loading) return <Loader fullPage />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (permission && !hasPermission(permission)) {
    return (
      <div className="card" style={{ margin: 24 }}>
        <h3>Access denied</h3>
        <p className="text-muted">You do not have permission to view this section. Ask the owner to grant access.</p>
      </div>
    );
  }
  return children;
};

/** Scrolls to top on every route change. */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
