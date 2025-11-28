import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const roleHome = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const user = await login(form);
      const destination = roleHome[user.role] || '/';
      const from = location.state?.from?.pathname;
      navigate(from || destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Heart Beat Login</h1>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
