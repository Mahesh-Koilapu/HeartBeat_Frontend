import useFetch from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/formatting';
import { useState } from 'react';
import client from '../../api/client';

const ManagePatients = () => {
  const { data: patients, loading, error, execute } = useFetch('/admin/patients');
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleRefresh = async () => {
    setMessage(null);
    try {
      await execute();
      setMessage({ type: 'success', text: 'Patients list refreshed successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to refresh patients list.' });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleApplyFilters = () => {
    setMessage({ type: 'info', text: 'Filters applied successfully.' });
  };

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = !searchTerm || 
      patient.name?.toLowerCase().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm) ||
      patient.profile?.diseaseType?.toLowerCase().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'recent' && patient.latestAppointment) ||
      (filterStatus === 'no-appointment' && !patient.latestAppointment);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getPatientInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PA';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">
          <h3>Patients Directory</h3>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <header className="section-header">
          <h3>Patients Directory</h3>
          <button className="primary" onClick={handleRefresh}>
            Retry
          </button>
        </header>
        <div className="error-state">
          <p>Unable to load patients.</p>
          <p className="muted">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <header className="section-header">
        <div>
          <h3>Patients Directory</h3>
          <p className="muted">Manage and view all registered patients</p>
        </div>
        <div className="header-badges">
          <span className="badge">Total {patients?.length || 0}</span>
          <span className="badge info">Filtered {filteredPatients.length}</span>
          <button className="primary small" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </header>
      
      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      {/* Filters Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>
              <strong>Search Patients</strong>
              <input
                type="text"
                placeholder="Search by name, email, or disease..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </label>
          </div>
          
          <div className="filter-group">
            <label>
              <strong>Status Filter</strong>
              <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
                <option value="all">All Patients</option>
                <option value="recent">With Appointments</option>
                <option value="no-appointment">No Appointments</option>
              </select>
            </label>
          </div>
          
          <div className="filter-actions">
            <button 
              className="apply-filters-btn primary"
              onClick={handleApplyFilters}
              style={{
                width: '120px',
                height: '42px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Patient Information</th>
              <th>Contact Details</th>
              <th>Medical Information</th>
              <th>Last Appointment</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <div className="empty-state">
                    <p>No patients found matching your criteria.</p>
                    <p className="muted">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {patient.profile?.photo ? (
                          <img src={patient.profile.photo} alt={patient.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {getPatientInitials(patient.name)}
                          </div>
                        )}
                      </div>
                      <div className="patient-details">
                        <strong className="patient-name">{patient.name || 'Unknown Patient'}</strong>
                        <br />
                        <small className="muted">ID: {patient._id?.slice(-8).toUpperCase() || 'N/A'}</small>
                        {patient.profile?.age && (
                          <div className="patient-age">
                            <small>Age: {patient.profile.age} years</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <span>{patient.email || 'No email'}</span>
                      </div>
                      {patient.phone && (
                        <div className="contact-item">
                          <span className="contact-icon">📱</span>
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.profile?.address && (
                        <div className="contact-item">
                          <span className="contact-icon">📍</span>
                          <small>{patient.profile.address}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="medical-info">
                      <div className="disease-info">
                        <span className="disease-badge">
                          {patient.profile?.diseaseType || 
                           patient.latestAppointment?.diseaseCategory || 
                           'No condition recorded'}
                        </span>
                      </div>
                      {patient.profile?.symptoms && (
                        <div className="symptoms-info">
                          <small className="muted">Symptoms: {patient.profile.symptoms.slice(0, 50)}...</small>
                        </div>
                      )}
                      {patient.profile?.bloodGroup && (
                        <div className="blood-group">
                          <small>Blood: {patient.profile.bloodGroup}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="appointment-info">
                      {patient.latestAppointment ? (
                        <div className="appointment-details">
                          <div className="appointment-date">
                            <strong>{formatDateTime(patient.latestAppointment.preferredDate)}</strong>
                          </div>
                          <div className="appointment-doctor">
                            <small>Doctor: {patient.latestAppointment.doctor?.name || 'Not assigned'}</small>
                          </div>
                          <div className="appointment-status">
                            <span className={`badge ${patient.latestAppointment.status}`}>
                              {patient.latestAppointment.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="no-appointment">
                          <span className="muted">No appointments</span>
                          <br />
                          <small className="muted">No medical visits recorded</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="registration-info">
                      <div className="registration-date">
                        <strong>{formatDateTime(patient.createdAt)}</strong>
                      </div>
                      <div className="registration-relative">
                        <small className="muted">
                          {new Date(patient.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? 'Registered today' 
                            : `${Math.floor((new Date() - new Date(patient.createdAt)) / (1000 * 60 * 60 * 24))} days ago`
                          }
                        </small>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePatients;
