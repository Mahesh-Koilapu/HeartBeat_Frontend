import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import ManageAppointments from './ManageAppointments';
import ManageDoctors from './ManageDoctors';
import ManagePatients from './ManagePatients';
import AdminSettings from './AdminSettings';
import './admin.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { path: 'overview', label: 'Overview', icon: '📊' },
    { path: 'appointments', label: 'Appointments', icon: '📅' },
    { path: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { path: 'patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
    { path: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => {
    if (path === 'overview' && location.pathname.endsWith('/admin')) {
      return true;
    }
    return location.pathname.includes(`/admin/${path}`);
  };

  const activeItem = menuItems.find((item) => isActive(item.path));

  return (
    <div className="dashboard-container simple-admin">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">❤️</div>
          <div className="admin-sidebar__title">
            <h2>Heart Beat</h2>
            <p>Admin console</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${isActive(item.path) ? 'is-active' : ''}`}
            >
              <span className="admin-sidebar__icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button type="button" onClick={handleLogout} className="admin-sidebar__logout">
          <span aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-main__header">
          <div>
            <h1>{activeItem?.label || 'Dashboard'}</h1>
            <p>Manage your healthcare platform in one place.</p>
          </div>
        </header>

        <div className="admin-main__content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
