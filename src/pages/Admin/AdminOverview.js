import { useEffect, useState } from 'react';
import client from '../../api/client';

const initialStats = {
  totalAppointments: 0,
  totalDoctors: 0,
  totalPatients: 0,
  pendingAppointments: 0,
};

const AdminOverview = () => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
          client.get('/admin/appointments'),
          client.get('/admin/doctors'),
          client.get('/admin/patients'),
        ]);

        const appointments = appointmentsRes.data?.data || [];
        const doctors = doctorsRes.data?.data || [];
        const patients = patientsRes.data?.data || [];

        const pendingAppointments = appointments.filter((apt) => apt.status === 'pending').length;

        setStats({
          totalAppointments: appointments.length,
          totalDoctors: doctors.length,
          totalPatients: patients.length,
          pendingAppointments,
        });
        setError('');
      } catch (err) {
        console.error('Failed to load admin overview stats', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading dashboard statistics…
      </div>
    );
  }

  return (
    <div className="admin-overview-grid">
      <div className="overview-header">
        <div>
          <h2>Welcome back, Admin</h2>
          <p className="muted">Here’s a snapshot of the Heart Beat platform performance.</p>
        </div>
      </div>

      {error && (
        <div className="card error-card">
          <p>{error}</p>
        </div>
      )}

      <section className="overview-cards">
        <article className="card stat-card primary">
          <header>
            <h3>Total Appointments</h3>
            <span className="stat-icon">📅</span>
          </header>
          <p className="stat-value">{stats.totalAppointments}</p>
          <p className="muted">Scheduled across all departments</p>
        </article>

        <article className="card stat-card success">
          <header>
            <h3>Active Doctors</h3>
            <span className="stat-icon">👨‍⚕️</span>
          </header>
          <p className="stat-value">{stats.totalDoctors}</p>
          <p className="muted">Licensed professionals on platform</p>
        </article>

        <article className="card stat-card warning">
          <header>
            <h3>Patients</h3>
            <span className="stat-icon">🧑‍🤝‍🧑</span>
          </header>
          <p className="stat-value">{stats.totalPatients}</p>
          <p className="muted">Registered patient profiles</p>
        </article>

        <article className="card stat-card danger">
          <header>
            <h3>Pending Approvals</h3>
            <span className="stat-icon">⏳</span>
          </header>
          <p className="stat-value">{stats.pendingAppointments}</p>
          <p className="muted">Awaiting confirmation</p>
        </article>
      </section>
    </div>
  );
};

export default AdminOverview;
