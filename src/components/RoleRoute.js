import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
  user: '/patient',
};

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    const destination = roleHome[user.role] || '/login';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
