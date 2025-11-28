import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import PatientDashboard from './pages/Patient/PatientDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor/*" element={<DoctorDashboard />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["patient"]} />}>
          <Route path="/patient/*" element={<PatientDashboard />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
