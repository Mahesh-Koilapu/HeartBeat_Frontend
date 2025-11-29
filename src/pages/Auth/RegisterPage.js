import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'ENT',
  'Dentistry',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'General Medicine',
  'Orthopedics',
  'Psychiatry',
  'Gynecology',
  'Urology',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Physiotherapy',
  'Nutrition & Dietetics',
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    specialization: '',
    experience: '',
    education: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👨‍💼';
      case 'doctor': return '👨‍⚕️';
      case 'user': return '👤';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#8b5cf6';
      case 'doctor': return '#10b981';
      case 'user': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Logo and Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C13.5 4 4 13.5 4 24C4 34.5 13.5 44 24 44C34.5 44 44 34.5 44 24C44 13.5 34.5 4 24 4Z" fill="url(#heart-gradient)" />
                  <path d="M24 8C16.3 8 10 14.3 10 22C10 29.7 16.3 36 24 36C31.7 36 38 29.7 38 22C38 14.3 31.7 8 24 8Z" fill="white" opacity="0.9" />
                  <path d="M20 18L28 18M24 14L24 22" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="auth-title">Heart Beat</h1>
              <p className="auth-subtitle">Healthcare Management System</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Basic Info</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Account</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Professional</div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="auth-welcome">
            <h2>Create Your Account</h2>
            <p>Join our healthcare community and start managing your health journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error animate-shake">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="step-content">
                <div className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">👤</span>
                    <span>Full Name</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      required
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">📧</span>
                    <span>Email Address</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                      required
                      className="form-input"
                      placeholder="Enter your email"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                <div className={`form-group ${focusedField === 'role' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">🎭</span>
                    <span>Account Type</span>
                  </label>
                  <div className="role-selector">
                    {['admin', 'doctor', 'user'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        className={`role-option ${form.role === role ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, role }))}
                        style={{ borderColor: form.role === role ? getRoleColor(role) : 'transparent' }}
                      >
                        <span className="role-icon">{getRoleIcon(role)}</span>
                        <span className="role-name">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Security */}
            {currentStep === 2 && (
              <div className="step-content">
                <div className={`form-group ${focusedField === 'password' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">🔒</span>
                    <span>Password</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                      required
                      className="form-input"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <div className="input-border"></div>
                  </div>
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className={`strength-fill ${form.password.length > 8 ? 'strong' : form.password.length > 5 ? 'medium' : 'weak'}`}></div>
                    </div>
                    <small>Password strength: {form.password.length > 8 ? 'Strong' : form.password.length > 5 ? 'Medium' : 'Weak'}</small>
                  </div>
                </div>

                <div className="security-tips">
                  <h4>💡 Password Tips:</h4>
                  <ul>
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Avoid common passwords</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Professional Information (for doctors) */}
            {currentStep === 3 && form.role === 'doctor' && (
              <div className="step-content">
                <div className={`form-group ${focusedField === 'specialization' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">🩺</span>
                    <span>Specialization</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      onFocus={() => handleFocus('specialization')}
                      onBlur={handleBlur}
                      required
                      className="form-input"
                    >
                      <option value="">Select your specialization</option>
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <div className="input-border"></div>
                  </div>
                </div>

                <div className={`form-group ${focusedField === 'experience' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">📊</span>
                    <span>Experience (years)</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      onFocus={() => handleFocus('experience')}
                      onBlur={handleBlur}
                      min="0"
                      className="form-input"
                      placeholder="Years of experience"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                <div className={`form-group ${focusedField === 'education' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">🎓</span>
                    <span>Education</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="education"
                      value={form.education}
                      onChange={handleChange}
                      onFocus={() => handleFocus('education')}
                      onBlur={handleBlur}
                      className="form-input"
                      placeholder="Medical degree and institution"
                    />
                    <div className="input-border"></div>
                  </div>
                </div>

                <div className={`form-group ${focusedField === 'description' ? 'focused' : ''}`}>
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    <span>Professional Bio</span>
                  </label>
                  <div className="input-wrapper">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      onFocus={() => handleFocus('description')}
                      onBlur={handleBlur}
                      className="form-input"
                      placeholder="Tell us about your expertise and approach..."
                      rows={4}
                    />
                    <div className="input-border"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation (for non-doctors) */}
            {currentStep === 3 && form.role !== 'doctor' && (
              <div className="step-content">
                <div className="confirmation-message">
                  <div className="confirmation-icon">✅</div>
                  <h3>Almost Done!</h3>
                  <p>You're ready to join our healthcare community. Review your information and create your account.</p>
                  
                  <div className="summary-box">
                    <h4>Account Summary</h4>
                    <div className="summary-item">
                      <span>Name:</span>
                      <span>{form.name}</span>
                    </div>
                    <div className="summary-item">
                      <span>Email:</span>
                      <span>{form.email}</span>
                    </div>
                    <div className="summary-item">
                      <span>Role:</span>
                      <span>{form.role.charAt(0).toUpperCase() + form.role.slice(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="step-navigation">
              {currentStep > 1 && (
                <button type="button" className="nav-btn secondary" onClick={prevStep}>
                  ← Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button type="button" className="nav-btn primary" onClick={nextStep}>
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={loading} className="auth-button">
                  {loading ? (
                    <div className="button-content">
                      <div className="spinner"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="button-content">
                      <span>Create Account</span>
                      <div className="button-arrow">→</div>
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>

          {/* Quick Access for Demo */}
          <div className="demo-access">
            <p className="demo-title">Quick Demo Registration</p>
            <div className="demo-buttons">
              <button 
                type="button"
                onClick={() => setForm({ 
                  name: 'Demo Admin', 
                  email: 'admin@demo.com', 
                  password: 'admin123', 
                  role: 'admin' 
                })}
                className="demo-btn admin"
              >
                Admin Demo
              </button>
              <button 
                type="button"
                onClick={() => setForm({ 
                  name: 'Demo Doctor', 
                  email: 'doctor@demo.com', 
                  password: 'doctor123', 
                  role: 'doctor',
                  specialization: 'General Medicine',
                  experience: '5',
                  education: 'MD Medical School',
                  description: 'Experienced physician dedicated to patient care.'
                })}
                className="demo-btn doctor"
              >
                Doctor Demo
              </button>
              <button 
                type="button"
                onClick={() => setForm({ 
                  name: 'Demo Patient', 
                  email: 'patient@demo.com', 
                  password: 'patient123', 
                  role: 'user' 
                })}
                className="demo-btn patient"
              >
                Patient Demo
              </button>
            </div>
          </div>
        </div>

        {/* Side Illustration */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="floating-heart">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <path d="M60 20C45 5 20 5 20 30C20 50 60 90 60 90C60 90 100 50 100 30C100 5 75 5 60 20Z" fill="url(#heart-illust)" />
                <defs>
                  <linearGradient id="heart-illust" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#e11d48" />
                    <stop offset="100%" stopColor="#be123c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Join Our Healthcare Community</h3>
            <p>Create your account and access personalized healthcare management tools designed for your specific needs.</p>
            <div className="feature-highlights">
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span>Secure Platform</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Mobile Access</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌟</span>
                <span>Personalized Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
