import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
  const { user, logout } = useAuth();
  const { data, loading, error, execute } = useFetch('/user/profile');
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
    phone: '',
    address: '',
    bloodGroup: '',
    allergies: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (data?.user) {
      setForm((prev) => ({
        ...prev,
        name: data.user.name || '',
        phone: data.user.phone || '',
      }));
      setPhotoPreview(data.user.photo || null);
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
        address: data.profile.address || '',
        bloodGroup: data.profile.bloodGroup || '',
        allergies: data.profile.allergies || '',
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
      // Validate required fields
      if (!form.name || !form.phone) {
        setMessage('Name and phone number are required.');
        return;
      }
      
      // Prepare the data
      const profileData = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        diseaseType: form.diseaseType?.trim() || '',
        symptoms: form.symptoms?.trim() || '',
        medicalHistory: form.medicalHistory?.trim() || '',
        address: form.address?.trim() || '',
        bloodGroup: form.bloodGroup || '',
        allergies: form.allergies?.trim() || '',
        emergencyContact: form.emergencyContactName
          ? {
              name: form.emergencyContactName.trim(),
              phone: form.emergencyContactPhone?.trim() || '',
              relation: form.emergencyContactRelation?.trim() || '',
            }
          : undefined,
      };

      // Send update request
      const response = await client.put('/user/profile', profileData);
      
      if (response.data) {
        // Update the user context if needed
        await execute();
        setMessage('✅ Profile updated successfully!');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile.';
      setMessage(`❌ ${errorMessage}`);
      
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
      <div className="patient-profile-page">
        <div className="card">
          <div className="loading-state">
            <h3>Patient Profile</h3>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-profile-page">
        <div className="card">
          <div className="error-state">
            <h3>Patient Profile</h3>
            <p>Unable to load profile.</p>
            <p className="muted">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-page">
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
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'PT'}
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

        {/* Basic Information Section */}
        <div className="card profile-info-section">
          <header className="section-header">
            <div>
              <h3>Basic Information</h3>
              <p className="muted">Update your personal details</p>
            </div>
          </header>
          
          {message && <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>Full Name</span>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                <span>Email Address</span>
                <input type="email" value={user?.email || ''} disabled />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Phone Number</span>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>
              <label>
                <span>Age</span>
                <input type="number" min="0" name="age" value={form.age} onChange={handleChange} />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Gender</span>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                <span>Blood Group</span>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>

            <label>
              <span>Home Address</span>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Enter your full address" />
            </label>
          </form>
        </div>

        {/* Medical Information Section */}
        <div className="card medical-info-section">
          <header className="section-header">
            <h3>Medical Information</h3>
          </header>
          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              <span>Disease Type</span>
              <input name="diseaseType" value={form.diseaseType} onChange={handleChange} placeholder="e.g., Heart Disease, Diabetes" />
            </label>
            
            <label>
              <span>Current Symptoms</span>
              <textarea name="symptoms" value={form.symptoms} onChange={handleChange} rows={4} placeholder="Describe your current symptoms or reason for visit..." />
            </label>
            
            <label>
              <span>Medical History</span>
              <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={4} placeholder="Previous medical conditions, surgeries, or treatments..." />
            </label>

            <label>
              <span>Allergies</span>
              <textarea name="allergies" value={form.allergies} onChange={handleChange} rows={3} placeholder="List any known allergies (medications, food, etc.)..." />
            </label>
          </form>
        </div>

        {/* Emergency Contact Section */}
        <div className="card emergency-contact-section">
          <header className="section-header">
            <h3>Emergency Contact</h3>
          </header>
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>Contact Name</span>
                <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Emergency contact person" />
              </label>
              <label>
                <span>Relationship</span>
                <input name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} placeholder="e.g., Spouse, Parent, Sibling" />
              </label>
            </div>
            
            <label>
              <span>Contact Phone</span>
              <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} placeholder="Emergency contact phone number" />
            </label>
          </form>
        </div>

        {/* Save Button */}
        <div className="card actions-section">
          <form className="profile-form" onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
};

export default PatientProfile;
