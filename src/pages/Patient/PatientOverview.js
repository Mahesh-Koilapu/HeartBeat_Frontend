import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const PatientOverview = () => {
  const { user } = useAuth();
  const { data, loading, error, execute } = useFetch('/user/dashboard');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Fetch patient profile data to get complete information
    const fetchProfile = async () => {
      try {
        const response = await client.get('/user/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">
          <h3>Loading Patient Dashboard</h3>
          <p>Please wait while we fetch your health information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const message = error.response?.data?.message || 'We\'re having trouble connecting to our servers. Please check your connection and try again.';
    return (
      <div className="card">
        <div className="error-state">
          <h3>Unable to Load Dashboard</h3>
          <p>{message}</p>
          <button onClick={execute} className="primary">Retry</button>
        </div>
      </div>
    );
  }

  const patientName = user?.name || profileData?.user?.name || 'Patient';
  const patientEmail = user?.email || profileData?.user?.email || '';

  return (
    <div>
      {/* Patient Welcome Section */}
      <div className="section-header">
        <div>
          <h2>Welcome back, {patientName}! 👋</h2>
          <p className="muted">Here's your personalized health overview and upcoming appointments.</p>
        </div>
        <div className="patient-info-card">
          <div className="patient-avatar">
            <img 
              src={`https://ui-avatars.com/api/?name=${patientName}&background=3b82f6&color=fff&size=64`} 
              alt={`${patientName}'s avatar`} 
            />
          </div>
          <div className="patient-details">
            <h4>{patientName}</h4>
            <p className="muted">{patientEmail}</p>
            <span className="badge active">Active Patient</span>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="dashboard-grid grid-4">
        <div className="card stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3 className="stat-value">{data?.upcoming?.length || 0}</h3>
            <p className="stat-label">Upcoming Appointments</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-value">{data?.stats?.completed || 0}</h3>
            <p className="stat-label">Completed Visits</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3 className="stat-value">{data?.stats?.pending || 0}</h3>
            <p className="stat-label">Pending Confirmations</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3 className="stat-value">{data?.stats?.totalDoctors || 0}</h3>
            <p className="stat-label">Your Doctors</p>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="dashboard-grid grid-2">
        {/* Upcoming Appointments */}
        <div className="card appointments-card">
          <div className="card-header">
            <h3>📅 Upcoming Appointments</h3>
            {data?.upcoming?.length > 0 && (
              <span className="badge info">{data.upcoming.length} scheduled</span>
            )}
          </div>
          <div className="timeline">
            {data?.upcoming?.length ? (
              data.upcoming.map((appointment) => (
                <div className="timeline-item" key={appointment._id}>
                  <div className="appointment-header">
                    <h4>Dr. {appointment.doctor?.name || 'TBD'}</h4>
                    <span className={`badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p className="specialty">{appointment.doctor?.profile?.specialization || 'General Medicine'}</p>
                    <p className="datetime">
                      📅 {appointment.scheduledDate 
                        ? new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Date to be confirmed'
                      }
                    </p>
                    <p className="time">
                      ⏰ {appointment.preferredStart || 'Time to be confirmed'}
                    </p>
                    {appointment.diseaseCategory && (
                      <p className="reason">🏥 {appointment.diseaseCategory}</p>
                    )}
                  </div>
                  <div className="appointment-actions">
                    <button className="small primary">View Details</button>
                    <button className="small secondary">Reschedule</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h4>No upcoming appointments</h4>
                <p className="muted">You don't have any appointments scheduled. Would you like to book one?</p>
                <button className="primary">Book Appointment</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card appointments-card">
          <div className="card-header">
            <h3>📋 Recent Appointments</h3>
            {data?.history?.length > 0 && (
              <span className="badge info">{data.history.length} completed</span>
            )}
          </div>
          <div className="timeline">
            {data?.history?.length ? (
              data.history.slice(0, 5).map((appointment) => (
                <div className="timeline-item completed" key={appointment._id}>
                  <div className="appointment-header">
                    <h4>Dr. {appointment.doctor?.name || 'Unknown'}</h4>
                    <span className={`badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p className="specialty">{appointment.doctor?.profile?.specialization || 'General Medicine'}</p>
                    <p className="datetime">
                      📅 {appointment.updatedAt 
                        ? new Date(appointment.updatedAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Date unknown'
                      }
                    </p>
                    {appointment.diseaseCategory && (
                      <p className="reason">🏥 {appointment.diseaseCategory}</p>
                    )}
                  </div>
                  <div className="appointment-actions">
                    <button className="small secondary">View Summary</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No past appointments</h4>
                <p className="muted">Your appointment history will appear here once you have completed visits.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Information */}
      {profileData?.profile && (
        <div className="dashboard-grid grid-2">
          <div className="card health-info-card">
            <div className="card-header">
              <h3>🏥 Your Health Information</h3>
            </div>
            <div className="health-details">
              {profileData.profile.diseaseType && (
                <div className="health-item">
                  <span className="health-label">Condition:</span>
                  <span className="health-value">{profileData.profile.diseaseType}</span>
                </div>
              )}
              {profileData.profile.bloodGroup && (
                <div className="health-item">
                  <span className="health-label">Blood Group:</span>
                  <span className="health-value">{profileData.profile.bloodGroup}</span>
                </div>
              )}
              {profileData.profile.age && (
                <div className="health-item">
                  <span className="health-label">Age:</span>
                  <span className="health-value">{profileData.profile.age} years</span>
                </div>
              )}
              {profileData.profile.allergies && (
                <div className="health-item">
                  <span className="health-label">Allergies:</span>
                  <span className="health-value">{profileData.profile.allergies}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card emergency-card">
            <div className="card-header">
              <h3>🚨 Emergency Contact</h3>
            </div>
            {profileData.profile.emergencyContact ? (
              <div className="emergency-details">
                <div className="emergency-item">
                  <span className="emergency-label">Name:</span>
                  <span className="emergency-value">{profileData.profile.emergencyContact.name}</span>
                </div>
                <div className="emergency-item">
                  <span className="emergency-label">Phone:</span>
                  <span className="emergency-value">{profileData.profile.emergencyContact.phone}</span>
                </div>
                <div className="emergency-item">
                  <span className="emergency-label">Relation:</span>
                  <span className="emergency-value">{profileData.profile.emergencyContact.relation}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p className="muted">No emergency contact information provided. Please update your profile.</p>
                <button className="primary">Update Profile</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientOverview;
