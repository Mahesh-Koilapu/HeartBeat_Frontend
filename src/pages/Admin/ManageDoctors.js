import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

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
  const [message, setMessage] = useState('');

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
    setMessage('');
    try {
      const { data } = await client.post('/admin/doctors', form);
      setData((prev) => (prev ? [data.doctor, ...prev] : [data.doctor]));
      setMessage('Doctor added successfully');
      resetForm();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add doctor');
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
    <div className="dashboard-grid grid-2">
      <div className="card">
        <h3>Add Doctor</h3>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Specialization
            <input name="specialization" value={form.specialization} onChange={handleChange} required />
          </label>
          <label>
            Experience (years)
            <input type="number" name="experience" value={form.experience} onChange={handleChange} min="0" />
          </label>
          <label>
            Education
            <input name="education" value={form.education} onChange={handleChange} />
          </label>
          <label className="full">
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <div className="actions">
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Doctor'}
            </button>
            <button type="button" onClick={resetForm} disabled={submitting}>
              Reset
            </button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Doctors ({doctors?.length || 0}) · Active {activeCount}</h3>
        {loading && <p>Loading doctors...</p>}
        {error && <p>Unable to load doctors.</p>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {doctors?.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.name}</td>
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
                    <button className="danger" onClick={() => removeDoctor(doctor._id)}>
                      Delete
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

export default ManageDoctors;
