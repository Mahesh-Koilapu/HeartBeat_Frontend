import useFetch from '../../hooks/useFetch';

const DoctorPatients = () => {
  const { data, loading, error } = useFetch('/doctor/patients');

  if (loading) {
    return <div className="card">Loading patients...</div>;
  }

  if (error) {
    return <div className="card">Unable to load patients.</div>;
  }

  return (
    <div className="card">
      <h3>Patients under your care</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Last Visit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(({ patient, lastAppointment }) => (
            <tr key={patient._id}>
              <td>{patient.name}</td>
              <td>{patient.email}</td>
              <td>{lastAppointment?.scheduledDate ? new Date(lastAppointment.scheduledDate).toLocaleDateString() : '—'}</td>
              <td>{lastAppointment?.status || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorPatients;
