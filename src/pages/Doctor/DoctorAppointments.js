import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const STATUS_OPTIONS = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];

const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (value) => (value ? value.slice(0, 5) : '—');

const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const initials = (name = '') => {
  const parsed = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return parsed ? parsed.toUpperCase() : 'PT';
};

const DoctorAppointments = () => {
  const [status, setStatus] = useState('');
  const {
    data,
    loading,
    error,
    execute,
  } = useFetch('/doctor/appointments', {
    immediate: true,
    params: status ? { status } : undefined,
  });
  const [updating, setUpdating] = useState('');
  const [feedback, setFeedback] = useState(null);

  const appointments = useMemo(() => data || [], [data]);

  const refresh = (nextStatus = status) => {
    execute({ params: nextStatus ? { status: nextStatus } : {} }).catch(() => {});
  };

  const handleFilter = () => {
    refresh(status);
  };

  const handleStatusChange = async (appointmentId, nextStatus) => {
    setUpdating(appointmentId);
    setFeedback(null);
    try {
      await client.patch(`/doctor/appointments/${appointmentId}`, { status: nextStatus });
      setFeedback({ type: 'success', message: `Appointment marked as ${statusLabel(nextStatus)}.` });
      refresh(status);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update appointment. Please try again.',
      });
    } finally {
      setUpdating('');
    }
  };

  const handleAddNote = async (appointmentId) => {
    const notes = window.prompt('Add note for patient:');
    if (!notes) return;
    setFeedback(null);
    try {
      await client.patch(`/doctor/appointments/${appointmentId}`, { notes });
      setFeedback({ type: 'success', message: 'Note added to appointment.' });
      refresh(status);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add note. Please try again.',
      });
    }
  };

  const errorMessage = error?.response?.data?.message || 'Unable to load appointments. Please try again.';

  return (
    <div className="doctor-appointments">
      <header className="doctor-appointments__header">
        <div>
          <h2>Appointments</h2>
          <p>Review upcoming consultations, update status, and capture visit notes.</p>
        </div>
        <div className="doctor-appointments__count">
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </div>
      </header>

      <section className="doctor-appointments__filters card">
        <div className="filters-row">
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--primary" onClick={handleFilter}>
            Apply filter
          </button>
        </div>
      </section>

      {feedback && (
        <div className={`doctor-feedback doctor-feedback--${feedback.type}`}>
          <span className="doctor-feedback__icon">
            {feedback.type === 'success' && '✅'}
            {feedback.type === 'error' && '❌'}
          </span>
          {feedback.message}
        </div>
      )}

      {loading && (
        <div className="card doctor-appointments__state">
          <p>Loading appointments…</p>
        </div>
      )}

      {error && !loading && (
        <div className="card doctor-appointments__state">
          <h3>Something went wrong</h3>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn--primary" onClick={() => refresh(status)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !appointments.length && (
        <div className="card doctor-appointments__state">
          <div className="empty-icon">🗓️</div>
          <h3>No appointments yet</h3>
          <p>You will see patient bookings here once the admin assigns them to you.</p>
        </div>
      )}

      {!loading && !error && appointments.map((appointment) => {
        const patient = appointment.user || appointment.patient;
        const patientName = patient?.name || 'Unknown patient';
        const scheduledDate = appointment.scheduledDate || appointment.preferredDate;
        const scheduledStart = appointment.scheduledStart || appointment.preferredStart;
        const scheduledEnd = appointment.scheduledEnd || appointment.preferredEnd;
        const statusValue = appointment.status || 'pending';

        return (
          <article className="card doctor-appointment" key={appointment._id}>
            <header className="doctor-appointment__header">
              <div className="doctor-appointment__identity">
                <div className="doctor-appointment__avatar">{initials(patientName)}</div>
                <div>
                  <h3>{patientName}</h3>
                  <p>{patient?.email || 'No email on file'}</p>
                  {patient?._id && <p>ID: {patient._id.slice(-6)}</p>}
                </div>
              </div>
              <div className={`status-chip status-chip--${statusValue}`}>
                {statusLabel(statusValue)}
              </div>
            </header>

            <div className="doctor-appointment__body">
              <div className="doctor-appointment__section">
                <h4>Schedule</h4>
                <p>{formatDate(scheduledDate)}</p>
                <p>{formatTime(scheduledStart)} – {formatTime(scheduledEnd)}</p>
              </div>

              <div className="doctor-appointment__section">
                <h4>Symptoms</h4>
                <p>{appointment.symptoms || 'Not provided'}</p>
              </div>

              {appointment.notes?.length > 0 && (
                <div className="doctor-appointment__section">
                  <h4>Recent notes</h4>
                  <ul>
                    {appointment.notes.slice(-3).map((note, index) => (
                      <li key={`${appointment._id}-note-${index}`}>{note.content}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <footer className="doctor-appointment__footer">
              <button type="button" className="btn btn--ghost" onClick={() => handleAddNote(appointment._id)}>
                Add note
              </button>
              <div className="doctor-appointment__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={updating === appointment._id || statusValue === 'completed'}
                  onClick={() => handleStatusChange(appointment._id, 'completed')}
                >
                  Mark completed
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={updating === appointment._id || statusValue === 'cancelled'}
                  onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                >
                  Cancel appointment
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
};

export default DoctorAppointments;
