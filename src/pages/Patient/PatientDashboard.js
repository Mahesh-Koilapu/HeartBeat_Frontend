import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import PatientOverview from './PatientOverview';
import PatientDoctors from './PatientDoctors';
import PatientAppointments from './PatientAppointments';
import PatientProfile from './PatientProfile';
import PatientChatbot from './PatientChatbot';
import VoiceAssistant from './VoiceAssistant';
import './patient.css';
import './chatbot.css';
import './voice-assistant.css';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState(2);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: 'overview', label: 'Overview', icon: '🏠', color: '#3b82f6' },
    { path: 'doctors', label: 'Find Doctors', icon: '👨‍⚕️', color: '#10b981' },
    { path: 'appointments', label: 'My Appointments', icon: '📅', color: '#f59e0b' },
    { path: 'chatbot', label: 'AI Assistant', icon: '🤖', color: '#8b5cf6' },
    { path: 'profile', label: 'Profile', icon: '👤', color: '#ef4444' },
  ];

  const getActiveRoute = () => {
    const path = location.pathname.split('/')[2];
    return path || 'overview';
  };

  return (
    <div className="patient-dashboard">
      {/* Modern Sidebar */}
      <aside className={`patient-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5C12 5 5 12 5 20C5 28 12 35 20 35C28 35 35 28 35 20C35 12 28 5 20 5Z" fill="url(#heart-gradient)" />
                <path d="M20 10C15 10 11 14 11 19C11 24 15 28 20 28C25 28 29 24 29 19C29 14 25 10 20 10Z" fill="white" opacity="0.9" />
                <path d="M17 16L23 16M20 13L20 19" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="brand-title">Heart Beat</h1>
              <p className="brand-subtitle">Patient Portal</p>
              <p className="user-name">{user?.name}</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${getActiveRoute() === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.path === 'appointments' && upcomingAppointments > 0 && (
                <span className="nav-badge">{upcomingAppointments}</span>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-number">{upcomingAppointments}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Doctors</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Main Content Area */}
      <main className="patient-main">
        {/* Top Header */}
        <header className="patient-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.path === getActiveRoute())?.label || 'Overview'}
            </h1>
            <p className="page-subtitle">Manage your health journey with ease</p>
          </div>
          
          <div className="header-right">
            {/* Enhanced Search Bar */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search doctors, appointments, or health topics..." 
                className="search-input"
                onChange={(e) => {
                  // Add search functionality here
                  const searchTerm = e.target.value.toLowerCase();
                  // You can implement search logic based on current page
                }}
              />
              <button className="search-btn">
                <span>🔍</span>
              </button>
            </div>

            {/* User Profile */}
            <div className="user-profile">
              <div className="profile-avatar">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Patient'}&background=3b82f6&color=fff&size=48`} alt="Profile" />
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'Patient'}</span>
                <span className="profile-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="main-content">
          <Routes>
            <Route path="overview" element={<PatientOverview />} />
            <Route path="doctors" element={<PatientDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="chatbot" element={<PatientChatbot />} />
            <Route path="voice-assistant" element={<VoiceAssistant />} />
            <Route index element={<PatientOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
