import { useState } from 'react';

const initialCategories = ['Heart Disease', 'Skin Conditions', 'ENT Disorders', 'Dental Problems', 'Diabetes', 'Hypertension', 'Respiratory Issues', 'Orthopedic Conditions'];
const initialSpecialties = ['Cardiology', 'Dermatology', 'ENT', 'Dentistry', 'Endocrinology', 'Nephrology', 'Pulmonology', 'Orthopedics', 'Neurology', 'Pediatrics', 'General Medicine'];
const initialChannels = {
  email: true,
  sms: false,
  whatsapp: true,
  push: true,
  in_app: true,
};

const initialIntegrations = [
  { id: 'n8n', name: 'n8n Automation', status: 'connected', updatedAt: '2m ago', description: 'Workflow automation platform' },
  { id: 'twilio', name: 'Twilio SMS', status: 'pending', updatedAt: 'Awaiting credentials', description: 'SMS notification service' },
  { id: 'sendgrid', name: 'SendGrid Email', status: 'connected', updatedAt: '15m ago', description: 'Email delivery service' },
  { id: 'firebase', name: 'Firebase Push', status: 'error', updatedAt: 'Revoked key', description: 'Mobile push notifications' },
  { id: 'stripe', name: 'Stripe Payments', status: 'connected', updatedAt: '1h ago', description: 'Payment processing' },
  { id: 'aws', name: 'AWS S3', status: 'connected', updatedAt: '30m ago', description: 'File storage service' },
];

const AdminSettings = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [specialties, setSpecialties] = useState(initialSpecialties);
  const [categoryInput, setCategoryInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [channels, setChannels] = useState(initialChannels);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    appointmentReminderHours: 24,
    maxAppointmentsPerDay: 50,
    autoConfirmAppointments: false,
    enableTelemedicine: true,
    dataRetentionDays: 365,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    logRetentionDays: 90,
    enableAuditLogs: true,
    allowedIPs: '',
    blockSuspiciousIPs: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@hospital.com',
    emailFromName: 'Hospital Management System',
    enableEmailQueue: true,
    batchSize: 100,
    retryAttempts: 3,
  });

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    apiKey: '••••••••••••••••',
    phoneNumber: '+1234567890',
    enableSmsQueue: true,
    maxSmsPerHour: 1000,
    templateLanguage: 'en',
  });

  const addCategory = () => {
    const value = categoryInput.trim();
    if (!value || categories.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setCategories((prev) => [...prev, value]);
    setCategoryInput('');
  };

  const addSpecialty = () => {
    const value = specialtyInput.trim();
    if (!value || specialties.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setSpecialties((prev) => [...prev, value]);
    setSpecialtyInput('');
  };

  const removeCategory = (value) => {
    setCategories((prev) => prev.filter((item) => item !== value));
  };

  const removeSpecialty = (value) => {
    setSpecialties((prev) => prev.filter((item) => item !== value));
  };

  const toggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleIntegrationAction = (id, nextStatus) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, status: nextStatus, updatedAt: nextStatus === 'connected' ? 'Just now' : 'Needs attention' }
          : integration
      )
    );
  };

  const handleQuickAction = (action) => {
    window.alert(`${action} is queued. Connect backend API to complete this workflow.`);
  };

  const updateSystemSetting = (key, value) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSecuritySetting = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEmailSetting = (key, value) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSmsSetting = (key, value) => {
    setSmsSettings(prev => ({ ...prev, [key]: value }));
  };

  const channelLabels = {
    email: 'Email Notifications',
    sms: 'SMS Reminders',
    whatsapp: 'WhatsApp Updates',
    push: 'Push Alerts',
    in_app: 'In-App Messages',
  };

  const channelDescriptions = {
    email: 'Send appointment confirmations, reminders, and updates via email',
    sms: 'Send SMS notifications for urgent appointments and reminders',
    whatsapp: 'Enable WhatsApp messaging for patient communication',
    push: 'Send push notifications to mobile apps',
    in_app: 'Display notifications within the application interface',
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h2>Admin Settings</h2>
        <p className="muted">Comprehensive system configuration and management</p>
      </header>

      <div className="settings-grid">
        {/* System Configuration */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>🖥️ System Configuration</h3>
              <p className="settings-count">Core system settings and behavior</p>
            </div>
          </header>
          <div className="settings-form">
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => updateSystemSetting('maintenanceMode', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Maintenance Mode</strong>
                  <small>Temporarily disable user access for system maintenance</small>
                </div>
              </label>
            </div>
            
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={systemSettings.allowNewRegistrations}
                  onChange={(e) => updateSystemSetting('allowNewRegistrations', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Allow New Registrations</strong>
                  <small>Enable new patient and doctor signups</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={systemSettings.requireEmailVerification}
                  onChange={(e) => updateSystemSetting('requireEmailVerification', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Require Email Verification</strong>
                  <small>Mandate email verification for new accounts</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={systemSettings.enableTelemedicine}
                  onChange={(e) => updateSystemSetting('enableTelemedicine', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Enable Telemedicine</strong>
                  <small>Allow virtual consultations and video appointments</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Appointment Reminder Hours</strong>
                <small>Send reminders X hours before appointment</small>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={systemSettings.appointmentReminderHours}
                  onChange={(e) => updateSystemSetting('appointmentReminderHours', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Max Appointments Per Day</strong>
                <small>Limit total appointments per day</small>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={systemSettings.maxAppointmentsPerDay}
                  onChange={(e) => updateSystemSetting('maxAppointmentsPerDay', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Data Retention Days</strong>
                <small>Keep records for X days before archiving</small>
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={systemSettings.dataRetentionDays}
                  onChange={(e) => updateSystemSetting('dataRetentionDays', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>🔒 Security Settings</h3>
              <p className="settings-count">Security and access control configuration</p>
            </div>
          </header>
          <div className="settings-form">
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={securitySettings.requireTwoFactor}
                  onChange={(e) => updateSecuritySetting('requireTwoFactor', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Require Two-Factor Authentication</strong>
                  <small>Enforce 2FA for all admin accounts</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={securitySettings.enableAuditLogs}
                  onChange={(e) => updateSecuritySetting('enableAuditLogs', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Enable Audit Logs</strong>
                  <small>Track all admin actions and system changes</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={securitySettings.blockSuspiciousIPs}
                  onChange={(e) => updateSecuritySetting('blockSuspiciousIPs', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Block Suspicious IPs</strong>
                  <small>Automatically block IPs with repeated failed attempts</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Session Timeout (minutes)</strong>
                <small>Auto-logout after X minutes of inactivity</small>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Max Login Attempts</strong>
                <small>Lock account after X failed attempts</small>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Password Min Length</strong>
                <small>Minimum characters required for passwords</small>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Log Retention Days</strong>
                <small>Keep security logs for X days</small>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={securitySettings.logRetentionDays}
                  onChange={(e) => updateSecuritySetting('logRetentionDays', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Allowed IP Addresses</strong>
                <small>Comma-separated list of allowed admin IPs (optional)</small>
                <textarea
                  value={securitySettings.allowedIPs}
                  onChange={(e) => updateSecuritySetting('allowedIPs', e.target.value)}
                  placeholder="192.168.1.1, 10.0.0.1"
                  rows={3}
                />
              </label>
            </div>
          </div>
        </section>

        {/* Email Configuration */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>📧 Email Configuration</h3>
              <p className="settings-count">SMTP and email delivery settings</p>
            </div>
          </header>
          <div className="settings-form">
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={emailSettings.enableEmailQueue}
                  onChange={(e) => updateEmailSetting('enableEmailQueue', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Enable Email Queue</strong>
                  <small>Process emails in background queue</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>SMTP Host</strong>
                <small>Mail server hostname</small>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => updateEmailSetting('smtpHost', e.target.value)}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>SMTP Port</strong>
                <small>Mail server port (usually 587 for TLS)</small>
                <input
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => updateEmailSetting('smtpPort', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>SMTP Username</strong>
                <small>Email address for sending</small>
                <input
                  type="email"
                  value={emailSettings.smtpUser}
                  onChange={(e) => updateEmailSetting('smtpUser', e.target.value)}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>From Name</strong>
                <small>Display name for outgoing emails</small>
                <input
                  type="text"
                  value={emailSettings.emailFromName}
                  onChange={(e) => updateEmailSetting('emailFromName', e.target.value)}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Batch Size</strong>
                <small>Process X emails at once</small>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={emailSettings.batchSize}
                  onChange={(e) => updateEmailSetting('batchSize', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Retry Attempts</strong>
                <small>Retry failed emails X times</small>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={emailSettings.retryAttempts}
                  onChange={(e) => updateEmailSetting('retryAttempts', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>
        </section>

        {/* SMS Configuration */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>📱 SMS Configuration</h3>
              <p className="settings-count">SMS service and messaging settings</p>
            </div>
          </header>
          <div className="settings-form">
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={smsSettings.enableSmsQueue}
                  onChange={(e) => updateSmsSetting('enableSmsQueue', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <strong>Enable SMS Queue</strong>
                  <small>Process SMS messages in background queue</small>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>SMS Provider</strong>
                <small>Choose SMS service provider</small>
                <select
                  value={smsSettings.provider}
                  onChange={(e) => updateSmsSetting('provider', e.target.value)}
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws-sns">AWS SNS</option>
                  <option value="messagebird">MessageBird</option>
                  <option value="nexmo">Nexmo</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>API Key</strong>
                <small>SMS provider API key</small>
                <input
                  type="password"
                  value={smsSettings.apiKey}
                  onChange={(e) => updateSmsSetting('apiKey', e.target.value)}
                  placeholder="Enter API key"
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Sender Phone Number</strong>
                <small>Phone number for sending SMS</small>
                <input
                  type="tel"
                  value={smsSettings.phoneNumber}
                  onChange={(e) => updateSmsSetting('phoneNumber', e.target.value)}
                  placeholder="+1234567890"
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Max SMS Per Hour</strong>
                <small>Rate limit for SMS sending</small>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={smsSettings.maxSmsPerHour}
                  onChange={(e) => updateSmsSetting('maxSmsPerHour', parseInt(e.target.value))}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <strong>Template Language</strong>
                <small>Default language for SMS templates</small>
                <select
                  value={smsSettings.templateLanguage}
                  onChange={(e) => updateSmsSetting('templateLanguage', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Notification Channels */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>🔔 Notification Channels</h3>
              <p className="settings-count">Configure notification delivery methods</p>
            </div>
          </header>
          <div className="toggle-grid">
            {Object.entries(channels).map(([key, enabled]) => (
              <div key={key} className="toggle-row">
                <div className="toggle-details">
                  <div className="toggle-title">{channelLabels[key]}</div>
                  <small className="toggle-description">{channelDescriptions[key]}</small>
                </div>
                <button
                  className={`toggle-switch ${enabled ? 'active' : ''}`}
                  onClick={() => toggleChannel(key)}
                  aria-pressed={enabled}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Disease Categories */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>🏥 Disease Categories</h3>
              <p className="settings-count">{categories.length} categories configured</p>
            </div>
          </header>
          <div className="settings-inline">
            <input
              type="text"
              placeholder="Add new disease category..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="primary">
              Add Category
            </button>
          </div>
          <div className="settings-chips">
            {categories.map((cat) => (
              <div key={cat} className="settings-chip">
                {cat}
                <button onClick={() => removeCategory(cat)} aria-label={`Remove ${cat}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Doctor Specialties */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>👨‍⚕️ Doctor Specialties</h3>
              <p className="settings-count">{specialties.length} specialties configured</p>
            </div>
          </header>
          <div className="settings-inline">
            <input
              type="text"
              placeholder="Add new medical specialty..."
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
            />
            <button onClick={addSpecialty} className="primary">
              Add Specialty
            </button>
          </div>
          <div className="settings-chips">
            {specialties.map((spec) => (
              <div key={spec} className="settings-chip">
                {spec}
                <button onClick={() => removeSpecialty(spec)} aria-label={`Remove ${spec}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Status */}
        <section className="card settings-section">
          <header className="settings-head">
            <div>
              <h3>🔗 Integration Status</h3>
              <p className="settings-count">{integrations.length} services configured</p>
            </div>
          </header>
          <div className="status-list">
            {integrations.map((service) => (
              <div key={service.id} className="status-item">
                <div className="status-meta">
                  <div className="status-name">{service.name}</div>
                  <div className="status-description">{service.description}</div>
                  <small className="muted">{service.updatedAt}</small>
                </div>
                <div className="status-actions">
                  <span className={`status-badge ${service.status}`}>
                    {service.status}
                  </span>
                  <button 
                    className={`integration-btn ${service.status === 'connected' ? 'disconnect' : 'connect'}`}
                    onClick={() => handleIntegrationAction(service.id, service.status === 'connected' ? 'disconnected' : 'connected')}
                  >
                    {service.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Maintenance */}
        <div className="card settings-banner">
          <h3>🔧 System Maintenance</h3>
          <p>Perform system health checks, maintenance tasks, and administrative operations.</p>
          <div className="settings-actions">
            <div className="actions-group">
              <button className="primary" onClick={() => handleQuickAction('System Health Check')}>
                🩺 Health Check
              </button>
              <button onClick={() => handleQuickAction('View System Logs')}>
                📋 View Logs
              </button>
              <button onClick={() => handleQuickAction('Clear System Cache')}>
                🗑️ Clear Cache
              </button>
            </div>
            <div className="actions-group">
              <button className="warning" onClick={() => handleQuickAction('Backup Database')}>
                💾 Backup Database
              </button>
              <button className="danger" onClick={() => handleQuickAction('Reset System')}>
                🔄 Reset System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
