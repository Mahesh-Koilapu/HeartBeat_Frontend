import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const statuses = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'declined'];

const ManageAppointments = () => {
  const [filters, setFilters] = useState({ date: '', doctor: '', status: '' });
  const { data: appointments, loading, error, execute } = useFetch('/admin/appointments', {
    immediate: true,
    params: filters,
  });

  const { data: doctors } = useFetch('/admin/doctors', { immediate: true });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    execute({ params: filters });
  };

  const assignDoctor = async (appointmentId) => {
    const doctorId = window.prompt('Enter doctor ID to assign:');
    if (!doctorId) return;
    try {
      await client.post(`/admin/appointments/${appointmentId}/assign`, { doctorId });
      execute({ params: filters });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign doctor');
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await client.patch(`/admin/appointments/${appointmentId}`, { status });
      execute({ params: filters });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Filters</h3>
        <div className="form-inline">
          <label>
            Date
            <input type="date" name="date" value={filters.date} onChange={handleChange} />
          </label>
          <label>
            Doctor
            <select name="doctor" value={filters.doctor} onChange={handleChange}>
              <option value="">All</option>
              {doctors?.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" type="button" onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>
      <div className="card">
        <h3>Appointments</h3>
        {loading && <p>Loading appointments...</p>}
        {error && <p>Unable to load appointments.</p>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Preferred</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.patient?.name}</td>
                  <td>{appointment.doctor?.name || 'Unassigned'}</td>
                  <td>
                    {appointment.preferredDate
                      ? new Date(appointment.preferredDate).toLocaleString()
                      : '—'}
                  </td>
                  <td>{appointment.status}</td>
                  <td className="actions">
                    {!appointment.doctor && (
                      <button className="primary" onClick={() => assignDoctor(appointment._id)}>
                        Assign
                      </button>
                    )}
                    <button onClick={() => updateStatus(appointment._id, 'confirmed')}>Confirm</button>
                    <button onClick={() => updateStatus(appointment._id, 'cancelled')} className="danger">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;
