import useFetch from '../../hooks/useFetch';

const DoctorOverview = () => {
  const { data, loading, error } = useFetch('/doctor/dashboard');

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">Loading overview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">Unable to load dashboard.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Doctor Dashboard</h2>
          <p className="muted">Welcome back! Here's your practice overview.</p>
        </div>
      </div>
      
      <div className="dashboard-grid grid-2">
        <div className="card">
          <h3>📊 Quick Stats</h3>
          <div className="timeline">
            <div className="timeline-item">
              <h4>Total Appointments</h4>
              <p className="stat-value">{data?.stats?.totalAppointments || 0}</p>
              <p className="stat-caption">All time appointments</p>
            </div>
            <div className="timeline-item">
              <h4>⏳ Pending</h4>
              <p className="stat-value">{data?.stats?.pending || 0}</p>
              <p className="stat-caption">Awaiting confirmation</p>
            </div>
            <div className="timeline-item">
              <h4>✅ Confirmed</h4>
              <p className="stat-value">{data?.stats?.confirmed || 0}</p>
              <p className="stat-caption">Scheduled appointments</p>
            </div>
            <div className="timeline-item">
              <h4>🎯 Completed</h4>
              <p className="stat-value">{data?.stats?.completed || 0}</p>
              <p className="stat-caption">Finished consultations</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>📅 Upcoming Appointments</h3>
          <div className="timeline">
            {data?.upcomingAppointments?.length ? (
              data.upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="timeline-item">
                  <h4>{appointment.patient?.name}</h4>
                  <p className="muted">{appointment.diseaseCategory}</p>
                  <p className="muted">
                    {appointment.scheduledDate 
                      ? new Date(appointment.scheduledDate).toLocaleString() 
                      : 'Pending scheduling'
                    }
                  </p>
                </div>
              ))
            ) : (
              <div className="timeline-item">
                <p className="muted text-center">No upcoming appointments scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
