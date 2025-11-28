import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DoctorOverview from './DoctorOverview';
import DoctorAvailability from './DoctorAvailability';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorProfile from './DoctorProfile';
import './doctor.css';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container doctor-theme">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <h2>Doctor Console</h2>
          <p>{user?.name}</p>
        </div>
        <nav>
          <Link to="overview">Overview</Link>
          <Link to="availability">Availability</Link>
          <Link to="appointments">Appointments</Link>
          <Link to="patients">Patients</Link>
          <Link to="profile">Profile</Link>
        </nav>
        <button className="logout" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="overview" element={<DoctorOverview />} />
          <Route path="availability" element={<DoctorAvailability />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route index element={<DoctorOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default DoctorDashboard;
