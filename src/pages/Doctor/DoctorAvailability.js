import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const DoctorAvailability = () => {
  const { data, loading, error, execute } = useFetch('/doctor/dashboard');
  const [saving, setSaving] = useState(false);
  const profile = data?.profile;

  const handleUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const availability = JSON.parse(formData.get('availability') || '[]');
    const emergencyHolidays = (formData.get('holidays') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      await client.put('/doctor/availability', { availability, emergencyHolidays });
      await execute();
      alert('Availability updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">Loading availability...</div>;
  }

  if (error) {
    return <div className="card">Unable to load availability settings.</div>;
  }

  return (
    <div className="card">
      <h3>Availability Management</h3>
      <form className="form-grid" onSubmit={handleUpdate}>
        <label className="full">
          Availability JSON
          <textarea
            name="availability"
            defaultValue={JSON.stringify(profile?.availability || [], null, 2)}
            rows={8}
          />
        </label>
        <label className="full">
          Emergency Holidays (comma separated dates YYYY-MM-DD)
          <input
            name="holidays"
            defaultValue={(profile?.emergencyHolidays || []).map((date) => date.slice(0, 10)).join(', ')}
          />
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      <div className="availability-grid">
        {(profile?.availability || []).map((slot, index) => (
          <div key={`${slot.date}-${index}`} className="slot-card">
            <h4>{new Date(slot.date).toLocaleDateString()}</h4>
            <p>
              {slot.startTime} - {slot.endTime}
            </p>
            <p>Max Patients: {slot.maxPatients || 1}</p>
            {slot.isClosed && <span className="tag warn">Closed</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAvailability;
