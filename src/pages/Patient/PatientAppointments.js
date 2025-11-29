import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const PatientAppointments = () => {
  const { data: appointments, loading, error, execute } = useFetch('/user/appointments');
  const [processing, setProcessing] = useState('');

  const cancelAppointment = async (appointmentId) => {
    const reason = window.prompt('Provide a reason for cancelling:');
    if (!reason) return;
    setProcessing(appointmentId);
    try {
      await client.patch(`/user/appointments/${appointmentId}`, {
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
      await client.patch(`/user/appointments/${appointmentId}`, {
        action: 'reschedule',
        newDate,
        newStart,
        newEnd,
        reason: 'Requested by user',
      });
      await execute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setProcessing('');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">Unable to load appointments.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>My Appointments</h2>
          <p className="muted">Manage and track your medical appointments.</p>
        </div>
      </div>
      
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>👨‍⚕️ Doctor</th>
                <th>🏥 Disease</th>
                <th>📅 Preferred Date</th>
                <th>📋 Status</th>
                <th>⚡ Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    <strong>
                      {appointment.doctor?.name || (
                        <span className="unassigned">Not assigned yet</span>
                      )}
                    </strong>
                  </td>
                  <td>{appointment.diseaseCategory}</td>
                  <td>
                    {appointment.preferredDate ? (
                      new Date(appointment.preferredDate).toLocaleString()
                    ) : (
                      <span className="unassigned">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      onClick={() => rescheduleAppointment(appointment._id)}
                      disabled={processing === appointment._id}
                    >
                      📅 Reschedule
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => cancelAppointment(appointment._id)}
                      disabled={processing === appointment._id}
                    >
                      ❌ Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!appointments?.length && (
          <div className="text-center" style={{ marginTop: '2rem', padding: '2rem' }}>
            <p className="muted">
              You have not requested any appointments yet.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
