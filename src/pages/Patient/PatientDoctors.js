import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';

const PatientDoctors = () => {
  const [filters, setFilters] = useState({ specialty: '', experience: '', date: '' });
  const { data, loading, error, execute } = useFetch('/patient/doctors', {
    immediate: true,
    params: filters,
  });
  const [booking, setBooking] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    execute({ params: filters }).catch(() => {});
  };

  const handleBook = async (doctorId) => {
    const preferredDate = window.prompt('Preferred date (YYYY-MM-DD):');
    if (!preferredDate) return;
    setBooking(doctorId);
    try {
      await client.post('/patient/appointments', {
        doctorId,
        diseaseCategory: 'General',
        preferredDate,
      });
      alert('Appointment request submitted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setBooking('');
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Find Doctors</h3>
        <div className="filter-bar">
          <label>
            Specialty
            <input
              name="specialty"
              value={filters.specialty}
              onChange={handleChange}
              placeholder="e.g. Cardiology"
            />
          </label>
          <label>
            Minimum experience (years)
            <input
              type="number"
              min="0"
              name="experience"
              value={filters.experience}
              onChange={handleChange}
            />
          </label>
          <label>
            Available date
            <input type="date" name="date" value={filters.date} onChange={handleChange} />
          </label>
          <button type="button" className="primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
      <div className="card">
        <h3>Doctors</h3>
        {loading && <p>Loading doctors...</p>}
        {error && <p>Unable to load doctors.</p>}
        {!loading && !error && (
          <div className="list-grid">
            {data?.length ? (
              data.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <h4>{doctor.name}</h4>
                  <p>{doctor.specialization}</p>
                  <p>{doctor.description || 'No description provided.'}</p>
                  {doctor.experience !== undefined && <p>{doctor.experience} years of experience</p>}
                  <p>Consultation fee: {doctor.consultationFee ? `₹${doctor.consultationFee}` : 'N/A'}</p>
                  <button type="button" onClick={() => handleBook(doctor.id)} disabled={booking === doctor.id}>
                    {booking === doctor.id ? 'Booking…' : 'Book appointment'}
                  </button>
                </div>
              ))
            ) : (
              <p>No doctors match your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDoctors;
