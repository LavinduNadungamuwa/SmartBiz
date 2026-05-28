import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../store/AuthContext';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// simple route placeholder used across the router
const Placeholder = ({ name }) => (
  <div style={{ padding: 24 }}>
    <h2>{name}</h2>
    <p className="td-muted">This page is not implemented yet.</p>
  </div>
);

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
