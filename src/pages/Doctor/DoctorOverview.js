import useFetch from '../../hooks/useFetch';

const DoctorOverview = () => {
  const { data, loading, error } = useFetch('/doctor/dashboard');

  if (loading) {
    return <div className="card">Loading overview...</div>;
  }

  if (error) {
    return <div className="card">Unable to load dashboard.</div>;
  }

  return (
    <div className="dashboard-grid grid-2">
      <div className="card">
        <h3>Quick Stats</h3>
        <div className="timeline">
          <div className="timeline-item">
            <h4>Total Appointments</h4>
            <p className="stat-value">{data?.stats?.totalAppointments || 0}</p>
          </div>
          <div className="timeline-item">
            <h4>Pending</h4>
            <p className="stat-value">{data?.stats?.pending || 0}</p>
          </div>
          <div className="timeline-item">
            <h4>Confirmed</h4>
            <p className="stat-value">{data?.stats?.confirmed || 0}</p>
          </div>
          <div className="timeline-item">
            <h4>Completed</h4>
            <p className="stat-value">{data?.stats?.completed || 0}</p>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Upcoming Appointments</h3>
        <div className="timeline">
          {data?.upcomingAppointments?.length ? (
            data.upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="timeline-item">
                <h4>{appointment.patient?.name}</h4>
                <p>{appointment.diseaseCategory}</p>
                <p>{appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleString() : 'Pending scheduling'}</p>
              </div>
            ))
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
