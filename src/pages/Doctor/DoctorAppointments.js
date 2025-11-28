import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const statusOptions = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];

const DoctorAppointments = () => {
  const [status, setStatus] = useState('');
  const { data: appointments, loading, error, execute } = useFetch('/doctor/appointments', {
    immediate: true,
    params: status ? { status } : undefined,
  });
  const [updating, setUpdating] = useState('');

  const handleFilter = () => {
    execute({ params: status ? { status } : {} }).catch(() => {});
  };

  const handleStatusChange = async (appointmentId, nextStatus) => {
    setUpdating(appointmentId);
    try {
      await client.patch(`/doctor/appointments/${appointmentId}`, { status: nextStatus });
      await execute({ params: status ? { status } : {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setUpdating('');
    }
  };

  const handleAddNote = async (appointmentId) => {
    const notes = window.prompt('Add note for patient:');
    if (!notes) return;
    try {
      await client.patch(`/doctor/appointments/${appointmentId}`, { notes });
      await execute({ params: status ? { status } : {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note');
    }
  };

  if (loading) {
    return <div className="card">Loading appointments...</div>;
  }

  if (error) {
    return <div className="card">Unable to load appointments.</div>;
  }

  return (
    <div className="card">
      <div className="form-inline">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <button type="button" className="primary" onClick={handleFilter}>
          Apply
        </button>
      </div>
      <table className="table" style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Symptoms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments?.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.patient?.name}</td>
              <td>
                {appointment.scheduledDate
                  ? new Date(appointment.scheduledDate).toLocaleString()
                  : 'Pending'}
              </td>
              <td>{appointment.status}</td>
              <td>{appointment.symptoms || '—'}</td>
              <td className="actions">
                <button onClick={() => handleAddNote(appointment._id)}>Add note</button>
                <button onClick={() => handleStatusChange(appointment._id, 'completed')} disabled={updating === appointment._id}>
                  Mark complete
                </button>
                <button onClick={() => handleStatusChange(appointment._id, 'cancelled')} className="danger" disabled={updating === appointment._id}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorAppointments;
