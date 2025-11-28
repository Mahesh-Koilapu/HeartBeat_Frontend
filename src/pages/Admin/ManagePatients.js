import useFetch from '../../hooks/useFetch';

const ManagePatients = () => {
  const { data: patients, loading, error } = useFetch('/admin/patients');

  if (loading) {
    return <div className="card">Loading patients...</div>;
  }

  if (error) {
    return <div className="card">Unable to load patients.</div>;
  }

  return (
    <div className="card">
      <h3>Patients ({patients?.length || 0})</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Disease</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {patients?.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.name}</td>
              <td>{patient.email}</td>
              <td>{patient.profile?.diseaseType || '—'}</td>
              <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePatients;
