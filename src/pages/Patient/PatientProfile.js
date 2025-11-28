import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
  const { user, logout } = useAuth();
  const { data, loading, error, execute } = useFetch('/patient/profile');
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    diseaseType: '',
    symptoms: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (data?.user) {
      setForm((prev) => ({
        ...prev,
        name: data.user.name || '',
      }));
    }
    if (data?.profile) {
      setForm((prev) => ({
        ...prev,
        age: data.profile.age || '',
        gender: data.profile.gender || '',
        diseaseType: data.profile.diseaseType || '',
        symptoms: data.profile.symptoms || '',
        medicalHistory: data.profile.medicalHistory || '',
        emergencyContactName: data.profile.emergencyContact?.name || '',
        emergencyContactPhone: data.profile.emergencyContact?.phone || '',
        emergencyContactRelation: data.profile.emergencyContact?.relation || '',
      }));
    }
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await client.put('/patient/profile', {
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        diseaseType: form.diseaseType,
        symptoms: form.symptoms,
        medicalHistory: form.medicalHistory,
        emergencyContact: form.emergencyContactName
          ? {
              name: form.emergencyContactName,
              phone: form.emergencyContactPhone,
              relation: form.emergencyContactRelation,
            }
          : undefined,
      });
      await execute();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
      if (err.response?.status === 401) {
        await logout();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">Loading profile...</div>;
  }

  if (error) {
    return <div className="card">Unable to load profile.</div>;
  }

  return (
    <div className="card">
      <h3>Patient profile</h3>
      {message && <p>{message}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Age
          <input type="number" min="0" name="age" value={form.age} onChange={handleChange} />
        </label>
        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Disease type
          <input name="diseaseType" value={form.diseaseType} onChange={handleChange} placeholder="e.g. Heart" />
        </label>
        <label className="full">
          Symptoms / reason for visit
          <textarea name="symptoms" value={form.symptoms} onChange={handleChange} rows={3} />
        </label>
        <label className="full">
          Medical history
          <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={3} />
        </label>
        <label>
          Emergency contact name
          <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
        </label>
        <label>
          Emergency contact phone
          <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} />
        </label>
        <label>
          Emergency contact relation
          <input name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} />
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Email: {user?.email}
      </p>
    </div>
  );
};

export default PatientProfile;
