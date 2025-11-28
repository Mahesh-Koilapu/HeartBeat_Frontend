import useFetch from '../../hooks/useFetch';

const PatientOverview = () => {
  const { data, loading, error } = useFetch('/patient/dashboard');

  if (loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="card">Unable to load dashboard.</div>;
  }

  return (
    <div className="dashboard-grid grid-2">
      <div className="card">
        <h3>Upcoming appointments</h3>
        <div className="timeline">
          {data?.upcoming?.length ? (
            data.upcoming.map((appointment) => (
              <div className="timeline-item" key={appointment._id}>
                <h4>{appointment.doctor?.name}</h4>
                <p>{appointment.diseaseCategory}</p>
                <p>{appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleString() : 'Pending confirmation'}</p>
                <span className="tag success">{appointment.status}</span>
              </div>
            ))
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Recent appointments</h3>
        <div className="timeline">
          {data?.history?.length ? (
            data.history.map((appointment) => (
              <div className="timeline-item" key={appointment._id}>
                <h4>{appointment.doctor?.name}</h4>
                <p>{appointment.diseaseCategory}</p>
                <p>{appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleString() : ''}</p>
              </div>
            ))
          ) : (
            <p>No past appointments yet.</p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Statistics</h3>
        <div className="timeline">
          <div className="timeline-item">
            <h4>Total appointments</h4>
            <p className="stat-value">{data?.stats?.total || 0}</p>
          </div>
          <div className="timeline-item">
            <h4>Pending</h4>
            <p className="stat-value">{data?.stats?.pending || 0}</p>
          </div>
          <div className="timeline-item">
            <h4>Completed</h4>
            <p className="stat-value">{data?.stats?.completed || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
