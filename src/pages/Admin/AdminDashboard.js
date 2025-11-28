import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import ManageDoctors from './ManageDoctors';
import ManagePatients from './ManagePatients';
import ManageAppointments from './ManageAppointments';
import AdminSettings from './AdminSettings';
import './admin.css';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container admin-theme">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <h2>Heart Beat Admin</h2>
          <p>{user?.name}</p>
        </div>
        <nav>
          <Link to="overview">Overview</Link>
          <Link to="doctors">Doctors</Link>
          <Link to="patients">Patients</Link>
          <Link to="appointments">Appointments</Link>
          <Link to="settings">Settings</Link>
        </nav>
        <button className="logout" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="overview" element={<AdminOverview />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route index element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
