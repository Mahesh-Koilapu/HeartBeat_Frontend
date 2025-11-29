import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const DoctorAvailability = () => {
  const { data, loading, error, execute } = useFetch('/doctor/dashboard');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxPatients: 1,
    isClosed: false,
  });
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
    setMessage('');
    try {
      await client.put('/doctor/availability', { availability, emergencyHolidays });
      await execute();
      setMessage('Availability updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const addNewSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      setMessage('Please fill in all required fields');
      return;
    }

    const updatedAvailability = [...(profile?.availability || []), { ...newSlot, date: new Date(newSlot.date) }];
    
    try {
      await client.put('/doctor/availability', { availability: updatedAvailability });
      await execute();
      setMessage('New availability slot added successfully');
      setNewSlot({ date: '', startTime: '', endTime: '', maxPatients: 1, isClosed: false });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add availability slot');
    }
  };

  const removeSlot = async (index) => {
    const updatedAvailability = (profile?.availability || []).filter((_, i) => i !== index);
    try {
      await client.put('/doctor/availability', { availability: updatedAvailability });
      await execute();
      setMessage('Availability slot removed successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove availability slot');
    }
  };

  if (loading) {
    return <div className="card">Loading availability...</div>;
  }

  if (error) {
    return <div className="card">Unable to load availability settings.</div>;
  }

  return (
    <div className="availability-management">
      <div className="card">
        <header className="section-header">
          <div>
            <h3>Availability Management</h3>
            <p className="muted">Set your available dates and time slots for patient appointments</p>
          </div>
        </header>
        
        {message && <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
        
        {/* Add New Availability Slot */}
        <div className="add-slot-section">
          <h4>Add New Time Slot</h4>
          <div className="form-grid">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </label>
            <label>
              <span>Start Time</span>
              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              />
            </label>
            <label>
              <span>End Time</span>
              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              />
            </label>
            <label>
              <span>Max Patients</span>
              <input
                type="number"
                min="1"
                max="10"
                value={newSlot.maxPatients}
                onChange={(e) => setNewSlot({ ...newSlot, maxPatients: parseInt(e.target.value) || 1 })}
              />
            </label>
            <label className="full">
              <span>
                <input
                  type="checkbox"
                  checked={newSlot.isClosed}
                  onChange={(e) => setNewSlot({ ...newSlot, isClosed: e.target.checked })}
                />
                Mark as Closed/Holiday
              </span>
            </label>
            <div className="actions full">
              <button type="button" className="primary" onClick={addNewSlot}>
                Add Time Slot
              </button>
            </div>
          </div>
        </div>

        {/* Current Availability Slots */}
        <div className="current-slots-section">
          <h4>Current Availability</h4>
          <div className="availability-grid">
            {(profile?.availability || []).length === 0 ? (
              <p className="muted">No availability slots set. Add your first time slot above.</p>
            ) : (
              (profile?.availability || []).map((slot, index) => (
                <div key={`${slot.date}-${index}`} className="slot-card">
                  <div className="slot-header">
                    <h4>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <button 
                      className="danger small" 
                      onClick={() => removeSlot(index)}
                      title="Remove this slot"
                    >
                      ×
                    </button>
                  </div>
                  <div className="slot-details">
                    <p className="time-range">
                      <strong>Time:</strong> {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="max-patients">
                      <strong>Max Patients:</strong> {slot.maxPatients || 1}
                    </p>
                    {slot.isClosed && <span className="tag warn">Closed</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Holidays */}
        <div className="holidays-section">
          <h4>Emergency Holidays</h4>
          <form className="form-grid" onSubmit={handleUpdate}>
            <label className="full">
              <span>Emergency Holidays (comma separated dates YYYY-MM-DD)</span>
              <input
                name="holidays"
                defaultValue={(profile?.emergencyHolidays || []).map((date) => date.slice(0, 10)).join(', ')}
                placeholder="e.g., 2024-12-25, 2024-01-01"
              />
            </label>
            <label className="full">
              <span>Availability JSON (Advanced)</span>
              <textarea
                name="availability"
                defaultValue={JSON.stringify(profile?.availability || [], null, 2)}
                rows={6}
                className="code-textarea"
              />
            </label>
            <div className="actions full">
              <button type="submit" className="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
