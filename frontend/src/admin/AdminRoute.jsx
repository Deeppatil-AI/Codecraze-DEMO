import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const stored = localStorage.getItem('parkmate_admin_user');
  if (!stored) return <Navigate to="/admin/login" replace />;

  try {
    const user = JSON.parse(stored);
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;

