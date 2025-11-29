import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorAvailability from './DoctorAvailability';
import DoctorProfile from './DoctorProfile';
import './doctor.css';

const DoctorDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="doctor-dashboard">
      {/* Modern Sidebar */}
      <aside className="doctor-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C8 4 4 8 4 16C4 24 8 28 16 28C24 28 28 24 28 16C28 8 24 4 16 4Z" fill="url(#heart-gradient)" />
                <path d="M16 8C12 8 8 12 8 16C8 20 12 24 16 24C20 24 24 20 24 16C24 12 20 8 16 8Z" fill="white" opacity="0.9" />
                <path d="M14 12L18 12M16 10L16 16" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="brand-title">Heart Beat</h1>
              <p className="brand-subtitle">Doctor Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="overview" 
            className={`nav-item ${location.pathname.endsWith('overview') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </Link>
          <Link 
            to="appointments" 
            className={`nav-item ${location.pathname.endsWith('appointments') ? 'active' : ''}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Appointments</span>
          </Link>
          <Link 
            to="availability" 
            className={`nav-item ${location.pathname.endsWith('availability') ? 'active' : ''}`}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Availability</span>
          </Link>
          <Link 
            to="profile" 
            className={`nav-item ${location.pathname.endsWith('profile') ? 'active' : ''}`}
          >
            <span className="nav-icon">👨‍⚕️</span>
            <span className="nav-text">Profile</span>
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="doctor-main">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<DoctorOverview />} />
            <Route path="overview" element={<DoctorOverview />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="availability" element={<DoctorAvailability />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
