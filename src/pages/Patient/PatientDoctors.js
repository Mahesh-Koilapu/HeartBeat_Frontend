import { useMemo, useState, useEffect } from 'react';
import client from '../../api/client';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Cardiology',
  'Dermatology',
  'ENT',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General',
  'Other',
];

const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);

const PatientDoctors = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    diseaseCategory: '',
    symptoms: '',
    details: '',
    preferredDate: '',
    preferredStart: '',
    preferredEnd: '',
  });
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const { data: doctors } = useFetch('/patient/doctors');

  const disableSubmit = useMemo(() => {
    if (!form.diseaseCategory || !form.symptoms || !form.preferredDate) {
      return true;
    }
    if (form.preferredStart && form.preferredEnd && form.preferredStart >= form.preferredEnd) {
      return true;
    }
    return false;
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocument = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          return {
            label: file.name,
            url: URL.createObjectURL(file),
          };
        })
      );
      setDocuments((prev) => [...prev, ...uploads]);
    } catch (error) {
      setMessage('Failed to attach documents.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await client.post('/user/appointments', {
        diseaseCategory: form.diseaseCategory,
        symptoms: form.symptoms,
        details: form.details,
        preferredDate: form.preferredDate,
        preferredStart: form.preferredStart || undefined,
        preferredEnd: form.preferredEnd || undefined,
        documents,
        doctorId: selectedDoctor?._id,
      });
      setMessage('Appointment request submitted. Our team will assign the best doctor shortly.');
      setForm({
        diseaseCategory: '',
        symptoms: '',
        details: '',
        preferredDate: '',
        preferredStart: '',
        preferredEnd: '',
      });
      setDocuments([]);
      setSelectedDoctor(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit appointment request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredDoctors = () => {
    if (!doctors || !form.diseaseCategory) return [];
    
    return doctors.filter(doctor => {
      const specialization = doctor.profile?.specialization?.toLowerCase() || '';
      const category = form.diseaseCategory.toLowerCase();
      
      if (category === 'general') return true;
      
      return specialization.includes(category) || 
             (category === 'cardiology' && specialization.includes('cardio')) ||
             (category === 'dermatology' && specialization.includes('derma')) ||
             (category === 'ent' && specialization.includes('ent')) ||
             (category === 'neurology' && specialization.includes('neuro')) ||
             (category === 'orthopedics' && specialization.includes('ortho')) ||
             (category === 'pediatrics' && specialization.includes('pedi'));
    });
  };

  const filteredDoctors = getFilteredDoctors();

  return (
    <div className="patient-doctors-page">
      <div className="doctors-header">
        <h2>Find Your Doctor</h2>
        <p>Browse our qualified specialists and book your appointment</p>
      </div>

      {/* Doctor Cards Section */}
      {form.diseaseCategory && (
        <div className="doctor-cards-section">
          <h3>Available {form.diseaseCategory} Specialists</h3>
          <div className="doctor-cards-grid">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div 
                  key={doctor._id} 
                  className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">
                      {doctor.profile?.photo ? (
                        <img src={doctor.profile.photo} alt={doctor.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {doctor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                        </div>
                      )}
                    </div>
                    <div className="doctor-info">
                      <h4>Dr. {doctor.name}</h4>
                      <p className="specialization">{doctor.profile?.specialization || 'General Physician'}</p>
                      <div className="doctor-rating">
                        {'⭐'.repeat(5)} <span>(4.8)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="doctor-details">
                    <div className="detail-item">
                      <span className="icon">🎓</span>
                      <span>{doctor.profile?.experience || '5'}+ years experience</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💰</span>
                      <span>${doctor.profile?.consultationFee || '75'} consultation</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{doctor.profile?.location || 'Main Hospital'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span>Available today</span>
                    </div>
                  </div>
                  
                  <div className="doctor-card-footer">
                    <button className="select-doctor-btn">
                      {selectedDoctor?._id === doctor._id ? '✓ Selected' : 'Select Doctor'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-doctors-found">
                <p>No specialists found for {form.diseaseCategory}. Our team will assign the best available doctor.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Form */}
      <div className="appointment-form-section">
        <div className="form-card">
          <h3>Book Your Appointment</h3>
          <p className="form-description">
            {selectedDoctor ? `Selected: Dr. ${selectedDoctor.name}` : 'Our care team will match you with an appropriate doctor based on these details.'}
          </p>
          
          <form className="appointment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>Medical Category *</span>
                <select name="diseaseCategory" value={form.diseaseCategory} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Preferred Date *</span>
                <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Start Time</span>
                <select name="preferredStart" value={form.preferredStart} onChange={handleChange}>
                  <option value="">Flexible</option>
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>End Time</span>
                <select name="preferredEnd" value={form.preferredEnd} onChange={handleChange}>
                  <option value="">Flexible</option>
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-group full">
              <label>
                <span>Symptoms Description *</span>
                <textarea
                  name="symptoms"
                  value={form.symptoms}
                  onChange={handleChange}
                  placeholder="Please describe your symptoms in detail..."
                  rows={4}
                  required
                />
              </label>
            </div>

            <div className="form-group full">
              <label>
                <span>Additional Details</span>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Any additional information you'd like to share with the doctor..."
                  rows={3}
                />
              </label>
            </div>

            <div className="form-group full">
              <label>
                <span>Medical Documents (Optional)</span>
                <div className="file-upload-area">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleDocument} 
                    disabled={uploading}
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="file-upload-btn">
                    <span className="upload-icon">📎</span>
                    <span>Choose Files</span>
                  </label>
                  <small>Upload medical reports, test results, or prescriptions</small>
                </div>
              </label>
              
              {documents.length > 0 && (
                <div className="uploaded-documents">
                  <h4>Uploaded Documents:</h4>
                  <div className="document-list">
                    {documents.map((doc, index) => (
                      <div key={doc.url} className="document-item">
                        <span className="doc-name">{doc.label}</span>
                        <button 
                          type="button" 
                          className="remove-doc"
                          onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn primary"
                disabled={disableSubmit || submitting}
              >
                {submitting ? 'Submitting...' : 'Request Appointment'}
              </button>
              
              {message && (
                <div className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="info-card">
          <h3>How It Works</h3>
          <div className="steps-timeline">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Select Doctor & Category</h4>
                <p>Choose your medical category and preferred specialist</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Fill Appointment Details</h4>
                <p>Provide your symptoms and preferred schedule</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Admin Review & Assignment</h4>
                <p>Our team reviews and confirms the best available doctor</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Receive Confirmation</h4>
                <p>Get your appointment details and preparation instructions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDoctors;
