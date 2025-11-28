import useFetch from '../../hooks/useFetch';

const AdminOverview = () => {
  const { data, loading, error } = useFetch('/admin/appointments', { immediate: true });
  const { data: doctors } = useFetch('/admin/doctors', { immediate: true });
  const { data: patients } = useFetch('/admin/patients', { immediate: true });

  const totalAppointments = data?.length || 0;
  const pending = data?.filter((appt) => appt.status === 'pending').length || 0;
  const confirmed = data?.filter((appt) => appt.status === 'confirmed').length || 0;
  const cancelled = data?.filter((appt) => appt.status === 'cancelled').length || 0;

  if (loading) {
    return <div className="card">Loading overview...</div>;
  }

  if (error) {
    return <div className="card">Unable to load overview.</div>;
  }

  return (
    <div className="dashboard-grid grid-3">
      <div className="card">
        <h3>Appointments Today</h3>
        <p className="stat-value">{totalAppointments}</p>
        <p className="stat-caption">Total scheduled</p>
      </div>
      <div className="card">
        <h3>Pending Approval</h3>
        <p className="stat-value">{pending}</p>
        <p className="stat-caption">Awaiting action</p>
      </div>
      <div className="card">
        <h3>Confirmed</h3>
        <p className="stat-value">{confirmed}</p>
        <p className="stat-caption">Ready to serve</p>
      </div>
      <div className="card">
        <h3>Cancelled</h3>
        <p className="stat-value">{cancelled}</p>
        <p className="stat-caption">Needs follow-up</p>
      </div>
      <div className="card">
        <h3>Active Doctors</h3>
        <p className="stat-value">{doctors?.filter((doc) => doc.isActive).length || 0}</p>
        <p className="stat-caption">Out of {doctors?.length || 0}</p>
      </div>
      <div className="card">
        <h3>Patients</h3>
        <p className="stat-value">{patients?.length || 0}</p>
        <p className="stat-caption">Registered</p>
      </div>
    </div>
  );
};

export default AdminOverview;
