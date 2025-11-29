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
  const [photoPreview, setPhotoPreview] = useState(profile?.photo || null);

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
      if (payload.photo) {
        setPhotoPreview(payload.photo);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
      if (err.response?.status === 401) {
        await logout();
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <div className="card">
          <div className="loading-state">
            <h3>Doctor Profile</h3>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-profile-page">
        <div className="card">
          <div className="error-state">
            <h3>Doctor Profile</h3>
            <p>Unable to load profile.</p>
            <p className="muted">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">
      <div className="profile-layout">
        {/* Profile Photo Section */}
        <div className="card profile-photo-section">
          <header className="section-header">
            <h3>Profile Photo</h3>
          </header>
          <div className="photo-container">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-image" />
              ) : (
                <div className="photo-placeholder">
                  <div className="avatar-initials">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                  </div>
                </div>
              )}
            </div>
            <div className="photo-upload">
              <label htmlFor="photo-upload" className="upload-btn">
                <span>📷</span> Upload Photo
              </label>
              <input
                type="file"
                id="photo-upload"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <small className="muted">JPG, PNG or GIF (max 2MB)</small>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="card profile-info-section">
          <header className="section-header">
            <div>
              <h3>Professional Information</h3>
              <p className="muted">Update your professional details and credentials</p>
            </div>
          </header>
          
          {message && <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>Full Name</span>
                <input name="name" defaultValue={user?.name} required />
              </label>
              <label>
                <span>Specialization</span>
                <input name="specialization" defaultValue={profile?.specialization || ''} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Experience (years)</span>
                <input type="number" min="0" name="experience" defaultValue={profile?.experience || ''} />
              </label>
              <label>
                <span>Consultation Fee ($)</span>
                <input type="number" min="0" step="0.01" name="consultationFee" defaultValue={profile?.consultationFee || ''} />
              </label>
            </div>

            <label>
              <span>Education & Qualifications</span>
              <input name="education" defaultValue={profile?.education || ''} placeholder="e.g., MBBS, MD, etc." />
            </label>

            <label>
              <span>Professional Bio</span>
              <textarea name="description" rows={6} defaultValue={profile?.description || ''} placeholder="Tell patients about your expertise, experience, and approach to care..." />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
              <button type="button" className="secondary" onClick={() => setMessage('')}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Additional Details Section */}
        <div className="card additional-details-section">
          <header className="section-header">
            <h3>Additional Information</h3>
          </header>
          <div className="details-grid">
            <div className="detail-item">
              <label>
                <span>Hospital/Clinic</span>
                <input name="hospital" defaultValue={profile?.hospital || ''} placeholder="Current workplace" />
              </label>
            </div>
            <div className="detail-item">
              <label>
                <span>Languages Spoken</span>
                <input name="languages" defaultValue={profile?.languages || ''} placeholder="e.g., English, Spanish, Hindi" />
              </label>
            </div>
            <div className="detail-item">
              <label>
                <span>Awards & Achievements</span>
                <textarea name="awards" rows={3} defaultValue={profile?.awards || ''} placeholder="List your notable awards and achievements" />
              </label>
            </div>
            <div className="detail-item">
              <label>
                <span>Publications</span>
                <textarea name="publications" rows={3} defaultValue={profile?.publications || ''} placeholder="Research papers, articles, or publications" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
