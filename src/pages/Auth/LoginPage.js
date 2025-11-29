import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(credentials);
      const redirectMap = {
        admin: '/admin',
        doctor: '/doctor',
        patient: '/patient',
        user: '/patient'
      };
      navigate(redirectMap[user?.role] || '/patient', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        fontFamily: '"Segoe UI", system-ui, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '18px',
          padding: '2.5rem',
          boxShadow: '0 24px 60px -18px rgba(79, 70, 229, 0.45)'
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#f43f5e'
            }}
          >
            Heart Beat
          </h1>
          <p style={{ margin: 0, marginTop: '0.75rem', color: '#6b7280' }}>
            Healthcare Management Platform
          </p>
        </header>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.95rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem', color: '#374151', fontWeight: 600 }}>
            Email Address
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem', color: '#374151', fontWeight: 600 }}>
            Password
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '10px',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <footer style={{ marginTop: '2rem', textAlign: 'center', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#f43f5e', fontWeight: 600 }}>
            Create one
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
