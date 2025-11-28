import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PatientOverview from './PatientOverview';
import PatientDoctors from './PatientDoctors';
import PatientAppointments from './PatientAppointments';
import PatientProfile from './PatientProfile';
import './patient.css';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container patient-theme">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <h2>Heart Beat Patient</h2>
          <p>{user?.name}</p>
        </div>
        <nav>
          <Link to="overview">Overview</Link>
          <Link to="doctors">Find Doctors</Link>
          <Link to="appointments">My Appointments</Link>
          <Link to="profile">Profile</Link>
        </nav>
        <button className="logout" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="overview" element={<PatientOverview />} />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route index element={<PatientOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientDashboard;
