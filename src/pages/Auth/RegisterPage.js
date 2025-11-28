import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    experience: '',
    education: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      const redirect = form.role === 'doctor' ? '/doctor' : form.role === 'admin' ? '/admin' : '/patient';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Heart Beat Account</h1>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
        </label>

        {form.role === 'doctor' && (
          <div className="doctor-extra">
            <label>
              Specialization
              <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required />
            </label>
            <label>
              Experience (years)
              <input type="number" min="0" name="experience" value={form.experience} onChange={handleChange} />
            </label>
            <label>
              Education
              <input type="text" name="education" value={form.education} onChange={handleChange} />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </label>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
