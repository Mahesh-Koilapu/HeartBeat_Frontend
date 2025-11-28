import { useState } from 'react';

const initialCategories = ['Heart', 'Skin', 'ENT', 'Dental'];
const initialSpecialties = ['Cardiology', 'Dermatology', 'ENT', 'Dentistry'];

const AdminSettings = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [specialties, setSpecialties] = useState(initialSpecialties);
  const [logs] = useState([
    { id: 1, actor: 'System', action: 'Server initialized', time: 'Just now' },
    { id: 2, actor: 'Admin', action: 'Reviewed appointments', time: '10 minutes ago' },
  ]);
  const [categoryInput, setCategoryInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');

  const addCategory = () => {
    const value = categoryInput.trim();
    if (!value || categories.includes(value)) return;
    setCategories((prev) => [...prev, value]);
    setCategoryInput('');
  };

  const addSpecialty = () => {
    const value = specialtyInput.trim();
    if (!value || specialties.includes(value)) return;
    setSpecialties((prev) => [...prev, value]);
    setSpecialtyInput('');
  };

  const removeCategory = (value) => {
    setCategories((prev) => prev.filter((item) => item !== value));
  };

  const removeSpecialty = (value) => {
    setSpecialties((prev) => prev.filter((item) => item !== value));
  };

  return (
    <div className="dashboard-grid grid-2">
      <div className="card">
        <h3>Disease Categories</h3>
        <p className="muted">Maintain the list of disease categories visible to patients.</p>
        <div className="form-inline" style={{ marginBottom: '1rem' }}>
          <label>
            Add category
            <input value={categoryInput} onChange={(event) => setCategoryInput(event.target.value)} placeholder="e.g. Orthopedic" />
          </label>
          <button type="button" className="primary" onClick={addCategory}>
            Add
          </button>
        </div>
        <div className="tag-list">
          {categories.map((category) => (
            <span key={category} className="tag-item">
              {category}
              <button type="button" onClick={() => removeCategory(category)} aria-label={`Remove ${category}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Specialties</h3>
        <p className="muted">Track specialties available for doctor registration.</p>
        <div className="form-inline" style={{ marginBottom: '1rem' }}>
          <label>
            Add specialty
            <input value={specialtyInput} onChange={(event) => setSpecialtyInput(event.target.value)} placeholder="e.g. Neurology" />
          </label>
          <button type="button" className="primary" onClick={addSpecialty}>
            Add
          </button>
        </div>
        <div className="tag-list">
          {specialties.map((specialty) => (
            <span key={specialty} className="tag-item">
              {specialty}
              <button type="button" onClick={() => removeSpecialty(specialty)} aria-label={`Remove ${specialty}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Activity Logs</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.actor}</td>
                <td>{log.action}</td>
                <td>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: '1rem' }}>
          Connect this section to your automation or logging pipeline to surface real-time events.
        </p>
      </div>

      <div className="card">
        <h3>Next Steps</h3>
        <ul className="muted">
          <li>Integrate categories & specialties with backend endpoints.</li>
          <li>Configure notification providers (SMS, Email, WhatsApp) via n8n.</li>
          <li>Store activity logs in a persistent datastore for audits.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
