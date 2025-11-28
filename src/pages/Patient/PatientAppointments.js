import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const PatientAppointments = () => {
  const { data: appointments, loading, error, execute } = useFetch('/patient/appointments');
  const [processing, setProcessing] = useState('');

  const cancelAppointment = async (appointmentId) => {
    const reason = window.prompt('Provide a reason for cancelling:');
    if (!reason) return;
    setProcessing(appointmentId);
    try {
      await client.patch(`/patient/appointments/${appointmentId}`, {
        action: 'cancel',
        reason,
      });
      await execute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setProcessing('');
    }
  };

  const rescheduleAppointment = async (appointmentId) => {
    const newDate = window.prompt('New date (YYYY-MM-DD):');
    if (!newDate) return;
    const newStart = window.prompt('New start time (e.g. 10:00 AM):');
    const newEnd = window.prompt('New end time (e.g. 10:30 AM):');
    setProcessing(appointmentId);
    try {
      await client.patch(`/patient/appointments/${appointmentId}`, {
        action: 'reschedule',
        newDate,
        newStart,
        newEnd,
        reason: 'Requested by patient',
      });
      await execute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setProcessing('');
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
      <h3>My appointments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Disease</th>
            <th>Preferred date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments?.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.doctor?.name || 'Not assigned yet'}</td>
              <td>{appointment.diseaseCategory}</td>
              <td>{appointment.preferredDate ? new Date(appointment.preferredDate).toLocaleString() : '—'}</td>
              <td>{appointment.status}</td>
              <td className="actions">
                <button
                  type="button"
                  onClick={() => rescheduleAppointment(appointment._id)}
                  disabled={processing === appointment._id}
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => cancelAppointment(appointment._id)}
                  disabled={processing === appointment._id}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!appointments?.length && <p className="muted" style={{ marginTop: '1rem' }}>You have no appointments yet. Find a doctor to get started.</p>}
    </div>
  );
};

export default PatientAppointments;
