import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import SPECIALIZATIONS from '../../constants/specializations';
import { formatDoctorId } from '../../utils/formatting';

const defaultDoctor = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  experience: '',
  education: '',
  description: '',
};

const ManageDoctors = () => {
  const { data: doctors, loading, error, execute, setData } = useFetch('/admin/doctors');
  const [form, setForm] = useState(defaultDoctor);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const activeCount = useMemo(() => doctors?.filter((doc) => doc.isActive).length || 0, [doctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(defaultDoctor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await client.post('/admin/doctors', form);
      setData((prev) => (prev ? [data.doctor, ...prev] : [data.doctor]));
      setMessage({ type: 'success', text: 'Doctor added successfully.' });
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add doctor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (doctorId, isActive) => {
    try {
      await client.patch(`/admin/doctors/${doctorId}/status`, { isActive: !isActive });
      execute();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status');
    }
  };

  const removeDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await client.delete(`/admin/doctors/${doctorId}`);
      execute();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="manage-doctors-layout">
      <section className="card add-doctor-section">
        <header className="section-header">
          <div>
            <h3>Add Doctor</h3>
            <p className="muted">Create a new doctor account and profile</p>
          </div>
        </header>
        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            <span>Specialization</span>
            <select name="specialization" value={form.specialization} onChange={handleChange} required>
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Experience (years)</span>
            <input type="number" name="experience" value={form.experience} onChange={handleChange} min="0" />
          </label>
          <label>
            <span>Education</span>
            <input name="education" value={form.education} onChange={handleChange} />
          </label>
          <label className="full">
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <div className="actions full">
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Create Doctor'}
            </button>
            <button type="button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="card doctors-list-section">
        <header className="section-header">
          <h3>Doctors Directory</h3>
          <div className="header-badges">
            <span className="badge">Total {doctors?.length || 0}</span>
            <span className="badge active">Active {activeCount}</span>
          </div>
        </header>
        {loading && <div className="loading-state">Loading doctors...</div>}
        {error && <div className="error-state">Unable to load doctors.</div>}
        {!loading && !error && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors?.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <code title={doctor._id}>{formatDoctorId(doctor._id)}</code>
                    </td>
                    <td>
                      <div className="doctor-name">
                        <strong>{doctor.name}</strong>
                        <br />
                        <small className="muted">{doctor.email}</small>
                      </div>
                    </td>
                    <td>{doctor.profile?.specialization || '—'}</td>
                    <td>
                      <span className={`badge ${doctor.isActive ? 'active' : 'inactive'}`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => toggleStatus(doctor._id, doctor.isActive)}>
                        {doctor.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => removeDoctor(doctor._id)} className="danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageDoctors;
