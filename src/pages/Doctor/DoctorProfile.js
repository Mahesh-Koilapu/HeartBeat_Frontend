import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
  const { user, logout } = useAuth();
  const { data, loading, error, execute } = useFetch('/doctor/dashboard');
  const profile = data?.profile;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    // convert numeric fields
    if (payload.experience) payload.experience = Number(payload.experience);
    if (payload.consultationFee) payload.consultationFee = Number(payload.consultationFee);
    try {
      await client.put('/doctor/profile', payload);
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
      <h3>Doctor Profile</h3>
      {message && <p>{message}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" defaultValue={user?.name} />
        </label>
        <label>
          Specialization
          <input name="specialization" defaultValue={profile?.specialization || ''} />
        </label>
        <label>
          Experience (years)
          <input type="number" min="0" name="experience" defaultValue={profile?.experience || ''} />
        </label>
        <label>
          Education
          <input name="education" defaultValue={profile?.education || ''} />
        </label>
        <label>
          Consultation Fee
          <input type="number" min="0" name="consultationFee" defaultValue={profile?.consultationFee || ''} />
        </label>
        <label className="full">
          Description
          <textarea name="description" rows={4} defaultValue={profile?.description || ''} />
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
