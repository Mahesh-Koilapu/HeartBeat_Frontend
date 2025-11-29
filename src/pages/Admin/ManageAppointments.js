import { useEffect, useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import { formatDoctorId } from '../../utils/formatting';

const STATUSES = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'declined'];

const formatDateLong = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (value) => (value ? value.slice(0, 5) : '—');

const formatStatusLabel = (status) => (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');

const getInitials = (name = 'Patient') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const ManageAppointments = () => {
  const [filters, setFilters] = useState({ date: '', doctor: '', status: '' });
  const {
    data: appointmentsData,
    loading,
    error,
    execute,
  } = useFetch('/admin/appointments', {
    immediate: true,
    params: filters,
  });
  const { data: doctors } = useFetch('/admin/doctors', { immediate: true });
  const appointments = useMemo(() => appointmentsData || [], [appointmentsData]);

  const [selectedDoctors, setSelectedDoctors] = useState({});
  const [scheduleOverrides, setScheduleOverrides] = useState({});
  const [feedback, setFeedback] = useState(null);

  const doctorLookup = useMemo(() => {
    const map = {};
    if (Array.isArray(doctors)) {
      doctors.forEach((doctor) => {
        map[doctor._id] = doctor;
      });
    }
    return map;
  }, [doctors]);

  const doctorOptions = useMemo(() => {
    return (
      doctors
        ?.filter((doctor) => doctor.isActive !== false)
        .map((doctor) => ({
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.profile?.specialization,
        })) || []
    );
  }, [doctors]);

  useEffect(() => {
    if (!appointments.length) {
      setScheduleOverrides({});
      return;
    }

    setScheduleOverrides((prev) => {
      const next = { ...prev };
      appointments.forEach((appointment) => {
        if (!next[appointment._id]) {
          const preferredDate = appointment.scheduledDate || appointment.preferredDate;
          const isoDate = preferredDate ? new Date(preferredDate).toISOString().slice(0, 10) : '';
          next[appointment._id] = {
            date: isoDate,
            start: appointment.scheduledStart || appointment.preferredStart || '',
            end: appointment.scheduledEnd || appointment.preferredEnd || '',
          };
        }
      });
      return next;
    });
  }, [appointments]);

  useEffect(() => {
    if (!appointments.length) {
      setSelectedDoctors({});
      return;
    }

    setSelectedDoctors((prev) => {
      const next = { ...prev };
      appointments.forEach((appointment) => {
        if (appointment.doctor && !next[appointment._id]) {
          next[appointment._id] = appointment.doctor._id;
        }
      });
      return next;
    });
  }, [appointments]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSelection = (appointmentId, value) => {
    setSelectedDoctors((prev) => ({ ...prev, [appointmentId]: value }));
  };

  const handleScheduleField = (appointmentId, field, value) => {
    setScheduleOverrides((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value,
      },
    }));
  };

  const applyFilters = () => {
    setFeedback(null);
    execute({ params: { ...filters } }).catch(() => {});
  };

  const clearFilters = () => {
    const resetFilters = { date: '', doctor: '', status: '' };
    setFilters(resetFilters);
    setFeedback(null);
    execute({ params: resetFilters }).catch(() => {});
  };

  const assignDoctor = async (appointment) => {
    const doctorId = selectedDoctors[appointment._id];
    if (!doctorId) {
      setFeedback({ type: 'error', message: 'Please choose a doctor before assigning.' });
      return;
    }

    const overrides = scheduleOverrides[appointment._id] || {};

    try {
      const response = await client.post(`/admin/appointments/${appointment._id}/assign`, {
        doctorId,
        scheduledDate: overrides.date || appointment.scheduledDate || appointment.preferredDate,
        scheduledStart: overrides.start || appointment.scheduledStart || appointment.preferredStart,
        scheduledEnd: overrides.end || appointment.scheduledEnd || appointment.preferredEnd,
      });

      setFeedback({
        type: response.data.availabilityWarning ? 'warning' : 'success',
        message: response.data.message,
      });
      execute({ params: { ...filters } }).catch(() => {});
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to assign doctor. Please try again.',
      });
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await client.patch(`/admin/appointments/${appointmentId}`, { status });
      setFeedback({ type: 'success', message: `Appointment marked as ${formatStatusLabel(status)}.` });
      execute({ params: { ...filters } }).catch(() => {});
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to update appointment status.',
      });
    }
  };

  const totalResults = appointments.length;
  const errorMessage = error?.response?.data?.message || 'We were unable to load appointments. Please try again.';

  return (
    <div className="appointments-management">
      <div className="appointments-header">
        <div>
          <h2>Appointment Management</h2>
          <p>Keep track of patient requests, doctor assignments, and schedules.</p>
        </div>
        <span className="results-count">{totalResults} results</span>
      </div>

      <div className="filters-card">
        <header className="filters-header">
          <h3>Filter appointments</h3>
          <div className="filter-actions">
            <button type="button" onClick={clearFilters}>Clear</button>
            <button type="button" className="primary" onClick={applyFilters}>Apply filters</button>
          </div>
        </header>

        <div className="filters-grid">
          <label className="filter-group">
            <span>Date</span>
            <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
          </label>
          <label className="filter-group">
            <span>Doctor</span>
            <select name="doctor" value={filters.doctor} onChange={handleFilterChange}>
              <option value="">All doctors</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.specialization ? ` · ${doctor.specialization}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-group">
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-banner feedback-banner--${feedback.type}`}>
          <span className="feedback-banner__icon">
            {feedback.type === 'success' && '✅'}
            {feedback.type === 'warning' && '⚠️'}
            {feedback.type === 'error' && '❌'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {loading && !appointments.length && (
        <div className="card loading-card">
          <div className="loading-state">
            <p>Loading appointments…</p>
          </div>
        </div>
      )}

      {error && !loading && !appointments.length && (
        <div className="card error-card">
          <h3>Unable to load appointments</h3>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn--primary" onClick={() => execute({ params: { ...filters } }).catch(() => {})}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !appointments.length && (
        <div className="card appointments-empty">
          <div className="empty-icon">📭</div>
          <h3>No appointments found</h3>
          <p>Try adjusting the filters or check back later.</p>
        </div>
      )}

      {!loading && appointments.map((appointment) => {
        const patient = appointment.user || appointment.patient;
        const patientName = patient?.name || 'Unknown patient';
        const assignedDoctor = appointment.doctor ? doctorLookup[appointment.doctor._id] || appointment.doctor : null;
        const overrides = scheduleOverrides[appointment._id] || {};
        const scheduledDate = overrides.date || appointment.scheduledDate || appointment.preferredDate || '';
        const scheduledStart = overrides.start || appointment.scheduledStart || appointment.preferredStart || '';
        const scheduledEnd = overrides.end || appointment.scheduledEnd || appointment.preferredEnd || '';
        const appointmentStatus = appointment.status || 'pending';

        return (
          <div className="card appointment-card" key={appointment._id}>
            <header className="appointment-card__header">
              <div className="appointment-card__patient">
                <div className="appointment-card__avatar">{getInitials(patientName)}</div>
                <div>
                  <h4>{patientName}</h4>
                  <p className="appointment-card__meta">{patient?.email || 'No email on file'}</p>
                  {patient?._id && <p className="appointment-card__meta">ID: {patient._id.slice(-6)}</p>}
                </div>
              </div>
              <div className="appointment-card__status">
                <span className={`status-chip status-chip--${appointmentStatus}`}>{formatStatusLabel(appointmentStatus)}</span>
                <span className="appointment-card__meta">Requested on {formatDateLong(appointment.createdAt)}</span>
              </div>
            </header>

            <div className="appointment-card__body">
              <div className="appointment-card__section">
                <h5>Request details</h5>
                <div className="info-row">
                  <span className="info-label">Preferred schedule</span>
                  <span className="info-value">{formatDateLong(appointment.preferredDate)} · {formatTime(appointment.preferredStart)} - {formatTime(appointment.preferredEnd)}</span>
                </div>
                {appointment.diseaseCategory && (
                  <div className="info-row">
                    <span className="info-label">Condition</span>
                    <span className="info-value">{appointment.diseaseCategory}</span>
                  </div>
                )}
                {appointment.symptoms && (
                  <div className="info-row">
                    <span className="info-label">Symptoms</span>
                    <span className="info-value">{appointment.symptoms}</span>
                  </div>
                )}
              </div>

              <div className="appointment-card__section">
                {assignedDoctor ? (
                  <div className="assigned-doctor">
                    <span className="tag tag--success">Assigned doctor</span>
                    <h4>{assignedDoctor.name}</h4>
                    <p className="appointment-card__meta">ID: {formatDoctorId(assignedDoctor._id)}</p>
                    {assignedDoctor.profile?.specialization && (
                      <p className="appointment-card__meta">{assignedDoctor.profile.specialization}</p>
                    )}
                    <div className="assigned-schedule">
                      <span>{formatDateLong(scheduledDate)}</span>
                      <span>{formatTime(scheduledStart)} - {formatTime(scheduledEnd)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="assign-panel">
                    <span className="tag">Assign doctor</span>
                    <select
                      value={selectedDoctors[appointment._id] || ''}
                      onChange={(event) => handleAssignSelection(appointment._id, event.target.value)}
                    >
                      <option value="">Select doctor</option>
                      {doctorOptions.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                          {doctor.specialization ? ` · ${doctor.specialization}` : ''}
                          {` · ${formatDoctorId(doctor.id)}`}
                        </option>
                      ))}
                    </select>

                    <div className="assign-panel__schedule">
                      <label>
                        <span>Date</span>
                        <input
                          type="date"
                          value={scheduledDate || ''}
                          onChange={(event) => handleScheduleField(appointment._id, 'date', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Start</span>
                        <input
                          type="time"
                          value={scheduledStart || ''}
                          onChange={(event) => handleScheduleField(appointment._id, 'start', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>End</span>
                        <input
                          type="time"
                          value={scheduledEnd || ''}
                          onChange={(event) => handleScheduleField(appointment._id, 'end', event.target.value)}
                        />
                      </label>
                    </div>

                    <button type="button" className="btn btn--primary" onClick={() => assignDoctor(appointment)}>
                      Assign doctor
                    </button>
                  </div>
                )}
              </div>
            </div>

            <footer className="appointment-card__footer">
              <div className="appointment-card__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={appointmentStatus === 'confirmed'}
                  onClick={() => updateStatus(appointment._id, 'confirmed')}
                >
                  Mark confirmed
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => updateStatus(appointment._id, 'rescheduled')}
                >
                  Mark rescheduled
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={appointmentStatus === 'cancelled'}
                  onClick={() => updateStatus(appointment._id, 'cancelled')}
                >
                  Cancel appointment
                </button>
              </div>
            </footer>
          </div>
        );
      })}
    </div>
  );
};

export default ManageAppointments;
